/**
 * Erich-only admin console for the MS Paint logs.
 *
 * Gated by the ADMIN_TOKEN secret (set via `wrangler pages secret put ADMIN_TOKEN`).
 * Pass it as ?token=... or an X-Admin-Token header.
 *
 * Routes (all under /api/admin):
 *   GET  /api/admin            -> HTML gallery of all drawings + lessons
 *   GET  /api/admin/data       -> JSON: generations (with lessons), paginated
 *   GET  /api/admin/stats      -> JSON: aggregate stats
 *   GET  /api/admin/image?key= -> streams a drawing PNG from R2
 */

import type { Env } from "../../_lib/env";

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function authorized(request: Request, env: Env): boolean {
  const expected = env.ADMIN_TOKEN;
  if (!expected) return false;
  const url = new URL(request.url);
  const provided = url.searchParams.get("token") || request.headers.get("X-Admin-Token") || "";
  return timingSafeEqual(provided, expected);
}

const deny = () =>
  new Response("Forbidden", { status: 403, headers: { "Content-Type": "text/plain" } });

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  if (!authorized(request, env)) return deny();

  const url = new URL(request.url);
  const parts = (context.params.path as string[] | undefined) || [];
  const sub = parts[0] || "";

  if (!env.MSPAINT_DB) return json({ error: "MSPAINT_DB not bound" }, 500);

  // --- Stream a drawing image from R2 -------------------------------------
  if (sub === "image") {
    const key = url.searchParams.get("key");
    if (!key || !env.MSPAINT_BUCKET) return new Response("Not found", { status: 404 });
    const obj = await env.MSPAINT_BUCKET.get(key);
    if (!obj) return new Response("Not found", { status: 404 });
    return new Response(obj.body, {
      headers: { "Content-Type": "image/png", "Cache-Control": "private, max-age=60" },
    });
  }

  // --- Aggregate stats ----------------------------------------------------
  if (sub === "stats") {
    const totals = await env.MSPAINT_DB.prepare(
      `SELECT
         (SELECT COUNT(*) FROM users) AS users,
         (SELECT COUNT(*) FROM generations) AS generations,
         (SELECT COUNT(*) FROM generations WHERE provider='cloudflare') AS free_gens,
         (SELECT COUNT(*) FROM generations WHERE provider='anthropic') AS paid_gens,
         (SELECT COUNT(*) FROM lessons) AS lessons,
         (SELECT SUM(free_uses_used) FROM users) AS total_free_used`
    ).first();
    const byCategory = await env.MSPAINT_DB.prepare(
      `SELECT category, COUNT(*) AS n FROM generations GROUP BY category ORDER BY n DESC`
    ).all();
    return json({ totals, byCategory: byCategory.results });
  }

  // --- JSON data feed -----------------------------------------------------
  if (sub === "data") {
    const limit = Math.min(200, parseInt(url.searchParams.get("limit") || "50", 10) || 50);
    const offset = parseInt(url.searchParams.get("offset") || "0", 10) || 0;
    const gens = await env.MSPAINT_DB.prepare(
      `SELECT * FROM generations ORDER BY created_at DESC LIMIT ? OFFSET ?`
    )
      .bind(limit, offset)
      .all();
    return json({ generations: gens.results });
  }

  // --- HTML gallery (default) --------------------------------------------
  const limit = Math.min(200, parseInt(url.searchParams.get("limit") || "60", 10) || 60);
  const token = url.searchParams.get("token") || "";
  const gens = await env.MSPAINT_DB.prepare(
    `SELECT g.*, l.difficult_element, l.cues_and_strategies, l.do_differently
       FROM generations g
       LEFT JOIN lessons l ON l.generation_id = g.id
      ORDER BY g.created_at DESC LIMIT ?`
  )
    .bind(limit)
    .all<Record<string, unknown>>();
  const stats = await env.MSPAINT_DB.prepare(
    `SELECT
       (SELECT COUNT(*) FROM users) AS users,
       (SELECT COUNT(*) FROM generations) AS generations,
       (SELECT COUNT(*) FROM lessons) AS lessons`
  ).first<Record<string, number>>();

  const esc = (s: unknown) =>
    String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  const t = encodeURIComponent(token);

  const cards = (gens.results || [])
    .map((g) => {
      const after = g.canvas_after_key
        ? `/api/admin/image?token=${t}&key=${encodeURIComponent(String(g.canvas_after_key))}`
        : null;
      const before = g.canvas_before_key
        ? `/api/admin/image?token=${t}&key=${encodeURIComponent(String(g.canvas_before_key))}`
        : null;
      const img = after || before;
      const cmds = Number(g.command_count) || 0;
      return `<div class="card">
        <div class="thumb">${img ? `<img loading="lazy" src="${img}" alt="">` : `<div class="noimg">${cmds} cmds<br>(no render)</div>`}</div>
        <div class="meta">
          <div class="prompt">${esc(g.prompt)}</div>
          <div class="tags"><span class="tag ${g.provider}">${esc(g.provider)}</span><span class="tag">${esc(g.category)}</span><span class="tag">${cmds} cmds</span></div>
          ${g.description ? `<div class="desc">${esc(g.description)}</div>` : ""}
          ${g.cues_and_strategies ? `<div class="lesson"><b>lesson:</b> ${esc(g.cues_and_strategies)}</div>` : ""}
          ${g.do_differently ? `<div class="lesson"><b>next time:</b> ${esc(g.do_differently)}</div>` : ""}
          <div class="when">${esc(g.created_at)} · ${esc(String(g.cookie_uuid).slice(0, 8))}</div>
        </div>
      </div>`;
    })
    .join("\n");

  const html = `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>MSPaint Admin · Some Claude Skills</title>
<style>
  body{margin:0;background:#008080;color:#000;font:13px/1.4 "MS Sans Serif",Tahoma,system-ui,sans-serif}
  header{background:#000080;color:#fff;padding:8px 12px;font-weight:bold;display:flex;gap:16px;align-items:center;flex-wrap:wrap}
  header .stat{background:#c0c0c0;color:#000;padding:2px 8px;border:2px outset #fff;font-weight:normal}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:10px;padding:12px}
  .card{background:#c0c0c0;border:2px outset #fff;padding:6px}
  .thumb{background:#fff;border:2px inset #fff;aspect-ratio:4/3;display:flex;align-items:center;justify-content:center;overflow:hidden}
  .thumb img{width:100%;height:100%;object-fit:contain;image-rendering:pixelated}
  .noimg{color:#808080;text-align:center;font-size:11px}
  .meta{margin-top:6px}
  .prompt{font-weight:bold;margin-bottom:4px;word-break:break-word}
  .tags{display:flex;gap:4px;flex-wrap:wrap;margin-bottom:4px}
  .tag{background:#fff;border:1px solid #808080;padding:0 4px;font-size:11px}
  .tag.cloudflare{background:#f6821f;color:#fff}
  .tag.anthropic{background:#d97757;color:#fff}
  .desc{color:#333;font-size:12px;margin-bottom:4px}
  .lesson{background:#ffffcc;border:1px solid #808080;padding:2px 4px;font-size:11px;margin-top:3px}
  .when{color:#404040;font-size:10px;margin-top:4px}
</style></head><body>
<header>
  <span>🎨 MSPaint Admin</span>
  <span class="stat">${stats?.users ?? 0} users</span>
  <span class="stat">${stats?.generations ?? 0} drawings</span>
  <span class="stat">${stats?.lessons ?? 0} lessons accrued</span>
  <span class="stat">showing latest ${gens.results?.length ?? 0}</span>
</header>
<div class="grid">${cards || "<p style='padding:12px'>No drawings yet.</p>"}</div>
</body></html>`;

  return new Response(html, { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } });
};
