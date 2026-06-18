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
import { setConfig, CONFIG_MODEL_KEY } from "../../_lib/db";
import { resolveDrawModel } from "../../_lib/workers-ai";
import { MODEL_CATALOG, isAllowedModel, modelInfo } from "../../_lib/models";

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

// --- Set the active free-tier drawing model -------------------------------
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  if (!authorized(request, env)) return deny();

  const url = new URL(request.url);
  const parts = (context.params.path as string[] | undefined) || [];
  if ((parts[0] || "") !== "model") return new Response("Not found", { status: 404 });

  const ct = request.headers.get("Content-Type") || "";
  let model = "";
  if (ct.includes("application/json")) {
    const b = (await request.json()) as { model?: string };
    model = b.model || "";
  } else {
    const form = await request.formData();
    model = String(form.get("model") || "");
  }

  if (!isAllowedModel(model)) return json({ error: "Model not in catalog" }, 400);
  await setConfig(env, CONFIG_MODEL_KEY, model);

  // JSON callers get JSON; HTML form submits redirect back to the gallery.
  if (ct.includes("application/json")) return json({ ok: true, model });
  const token = url.searchParams.get("token") || "";
  return new Response(null, {
    status: 303,
    headers: { Location: `/api/admin?token=${encodeURIComponent(token)}` },
  });
};

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

  // --- Model catalog + current selection (JSON) ---------------------------
  if (sub === "models") {
    const active = await resolveDrawModel(env);
    return json({ active, catalog: MODEL_CATALOG });
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

  const activeModel = await resolveDrawModel(env);
  const activeInfo = modelInfo(activeModel);

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
          <div class="tags"><span class="tag ${g.provider}">${esc(g.provider)}</span><span class="tag">${esc(g.category)}</span><span class="tag">${cmds} cmds</span><span class="tag" title="${esc(g.model)}">${esc(modelInfo(String(g.model))?.label || g.model)}</span></div>
          ${g.description ? `<div class="desc">${esc(g.description)}</div>` : ""}
          ${g.cues_and_strategies ? `<div class="lesson"><b>lesson:</b> ${esc(g.cues_and_strategies)}</div>` : ""}
          ${g.do_differently ? `<div class="lesson"><b>next time:</b> ${esc(g.do_differently)}</div>` : ""}
          <div class="when">${esc(g.created_at)} · ${esc(String(g.cookie_uuid).slice(0, 8))}</div>
        </div>
      </div>`;
    })
    .join("\n");

  const modelRows = MODEL_CATALOG.map((m) => {
    const active = m.id === activeModel;
    return `<tr class="${active ? "active" : ""}">
      <td><input type="radio" name="model" value="${esc(m.id)}" ${active ? "checked" : ""}></td>
      <td><b>${esc(m.label)}</b>${m.recommended ? ' <span class="rec">★ recommended</span>' : ""}${active ? ' <span class="cur">● in use</span>' : ""}<br><code>${esc(m.id)}</code></td>
      <td class="num">$${m.inPrice.toFixed(3)}</td>
      <td class="num">$${m.outPrice.toFixed(3)}</td>
      <td class="num">~${esc(m.perDrawing)}</td>
      <td class="note">${esc(m.note)}</td>
    </tr>`;
  }).join("");

  const modelPanel = `<form class="models" method="post" action="/api/admin/model?token=${t}">
    <div class="mhead">
      <span>🧠 Drawing model</span>
      <span class="active">in use: <b>${esc(activeInfo?.label || activeModel)}</b> — <code>${esc(activeModel)}</code>${activeInfo ? ` · ~${esc(activeInfo.perDrawing)}/drawing` : ""}</span>
    </div>
    <table>
      <thead><tr><th></th><th>model</th><th>$/M in</th><th>$/M out</th><th>~$/draw</th><th>notes</th></tr></thead>
      <tbody>${modelRows}</tbody>
    </table>
    <div class="mfoot">
      <button type="submit">Set drawing model</button>
      <span class="hint">Free-tier drawings only. Classification &amp; reflection always use the cheap recommended model. ~$/draw assumes ~1.5K in / 2.5K out tokens. Bring-your-own-key users are unaffected.</span>
    </div>
  </form>`;

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
  .models{margin:12px;background:#c0c0c0;border:2px outset #fff;padding:8px}
  .models .mhead{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;align-items:center;font-weight:bold;margin-bottom:8px}
  .models .active{font-weight:normal;background:#000080;color:#fff;padding:3px 8px;border:2px inset #fff}
  .models .active code{color:#9fd}
  .models table{width:100%;border-collapse:collapse;background:#fff;border:2px inset #fff}
  .models th,.models td{border:1px solid #c0c0c0;padding:4px 6px;text-align:left;font-size:12px;vertical-align:top}
  .models th{background:#000080;color:#fff;font-size:11px}
  .models td.num{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
  .models td.note{color:#333;font-size:11px}
  .models tr.active{background:#ffffcc}
  .models code{font-family:"Courier New",monospace;font-size:11px;color:#000080}
  .models .rec{color:#008000;font-size:11px}
  .models .cur{color:#000080;font-size:11px}
  .models .mfoot{margin-top:8px;display:flex;gap:12px;align-items:center;flex-wrap:wrap}
  .models button{background:#c0c0c0;border:2px outset #fff;padding:4px 14px;font-weight:bold;cursor:pointer;font-family:inherit}
  .models button:active{border-style:inset}
  .models .hint{color:#404040;font-size:10px;flex:1;min-width:200px}
</style></head><body>
<header>
  <span>🎨 MSPaint Admin</span>
  <span class="stat">${stats?.users ?? 0} users</span>
  <span class="stat">${stats?.generations ?? 0} drawings</span>
  <span class="stat">${stats?.lessons ?? 0} lessons accrued</span>
  <span class="stat">model: ${esc(activeInfo?.label || activeModel)}</span>
  <span class="stat">showing latest ${gens.results?.length ?? 0}</span>
</header>
${modelPanel}
<div class="grid">${cards || "<p style='padding:12px'>No drawings yet.</p>"}</div>
</body></html>`;

  return new Response(html, { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } });
};
