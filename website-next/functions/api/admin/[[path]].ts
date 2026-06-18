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
import {
  setConfig,
  CONFIG_MODEL_KEY,
  recordGeneration,
  recordLesson,
  retrieveWisdom,
  createBatch,
  incrementBatch,
  listLessonCategories,
  getLessons,
} from "../../_lib/db";
import { resolveDrawModel, runText, classifyPrompt, UTILITY_MODEL } from "../../_lib/workers-ai";
import {
  buildDrawSystemPrompt,
  renderWisdom,
  REFLECTION_SYSTEM_PROMPT,
  buildReflectionUserContent,
  extractJson,
} from "../../_lib/cta";
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

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  if (!authorized(request, env)) return deny();

  const url = new URL(request.url);
  const parts = (context.params.path as string[] | undefined) || [];
  const sub = parts[0] || "";

  // --- Set the active free-tier drawing model -----------------------------
  if (sub === "model") {
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
    if (ct.includes("application/json")) return json({ ok: true, model });
    const token = url.searchParams.get("token") || "";
    return new Response(null, {
      status: 303,
      headers: { Location: `/api/admin?token=${encodeURIComponent(token)}` },
    });
  }

  // --- Run ONE drawing iteration (the soak-test unit) ---------------------
  if (sub === "run") {
    if (!env.AI || !env.MSPAINT_DB) return json({ error: "AI/DB not bound" }, 500);
    const started = Date.now();
    const b = (await request.json()) as {
      model?: string;
      prompt?: string;
      batchId?: string;
      index?: number;
      total?: number;
    };
    const model = b.model && isAllowedModel(b.model) ? b.model : "";
    const prompt = (b.prompt || "").trim();
    if (!model) return json({ error: "Unknown model" }, 400);
    if (!prompt) return json({ error: "Prompt required" }, 400);

    // First iteration opens the batch record.
    if (b.batchId && (b.index || 0) === 0) {
      await createBatch(env, { id: b.batchId, model, prompt, target: b.total || 1 }).catch(() => {});
    }

    // 1. Situation assessment (cheap).
    const cls = await classifyPrompt(env, prompt).catch(() => ({
      category: "general",
      subcategories: [] as string[],
      tools: [] as string[],
    }));

    // 2. Recall accrued wisdom — capture exactly what the agent will see.
    const wisdom = await retrieveWisdom(env, cls.category, 4);
    const wisdomShown = renderWisdom(wisdom);
    const drawSystem = buildDrawSystemPrompt(wisdom);

    // 3. Draw with the chosen (premium) model.
    let raw = "";
    let parseOk = true;
    let draw: { thinking: string | null; plan: unknown; description: string; commands: unknown[] } | null = null;
    try {
      raw = await runText(env, drawSystem, prompt, 4096, model);
      const p = extractJson<{ thinking?: string; plan?: unknown; description?: string; commands?: unknown[] }>(raw);
      if (p && Array.isArray(p.commands)) {
        draw = {
          thinking: p.thinking ?? null,
          plan: p.plan ?? null,
          description: p.description || "Drawing",
          commands: p.commands,
        };
      } else {
        parseOk = false;
      }
    } catch (e) {
      parseOk = false;
      raw = e instanceof Error ? e.message : "error";
    }

    const generationId = crypto.randomUUID();
    const latencyMs = Date.now() - started;
    const adminIdentity = {
      cookieUuid: "admin-batch",
      ipUaHash: "admin",
      isNewCookie: false,
      country: null,
      userAgent: "admin-batch",
    };

    await recordGeneration(env, {
      id: generationId,
      userId: "admin-batch",
      identity: adminIdentity,
      provider: "batch",
      model,
      prompt,
      category: cls.category,
      subcategories: cls.subcategories,
      recommendedTools: cls.tools,
      thinking: draw?.thinking,
      plan: draw?.plan,
      description: draw?.description,
      commands: draw?.commands,
      commandCount: draw?.commands.length,
      latencyMs,
      status: parseOk ? "ok" : "error",
      error: parseOk ? null : "parse_failed",
      batchId: b.batchId ?? null,
    }).catch(() => {});

    // 4. Reflection (cheap utility model) — accrue a lesson, awaited so the
    //    next iteration can immediately recall it.
    let lesson: Record<string, unknown> | null = null;
    if (parseOk && draw) {
      try {
        const text = await runText(
          env,
          REFLECTION_SYSTEM_PROMPT,
          buildReflectionUserContent(prompt, cls.category, draw.description, draw.commands.length),
          700,
          UTILITY_MODEL
        );
        const ref = extractJson<Record<string, unknown>>(text);
        if (ref) {
          await recordLesson(env, {
            id: crypto.randomUUID(),
            generationId,
            category: cls.category,
            subcategories: cls.subcategories,
            difficultElement: (ref.difficultElement as string) ?? null,
            whyDifficult: (ref.whyDifficult as string) ?? null,
            commonErrors: (ref.commonErrors as string) ?? null,
            cuesAndStrategies: (ref.cuesAndStrategies as string) ?? null,
            whatWorked: ref.whatWorked,
            whatDidnt: ref.whatDidnt,
            wishIKnew: (ref.wishIKnew as string) ?? null,
            doDifferently: (ref.doDifferently as string) ?? null,
            toolsNeeded: ref.toolsNeeded,
          });
          lesson = ref;
        }
      } catch {
        /* reflection is best-effort */
      }
    }

    if (b.batchId) await incrementBatch(env, b.batchId, parseOk).catch(() => {});

    return json({
      ok: parseOk,
      generationId,
      model,
      category: cls.category,
      latencyMs,
      commandCount: draw?.commands.length ?? 0,
      description: draw?.description ?? null,
      commands: draw?.commands ?? [],
      wisdomCount: wisdom.length,
      wisdomShown, // exactly the "Lessons from artists past" text injected
      lesson,
      rawError: parseOk ? null : raw.slice(0, 300),
    });
  }

  return new Response("Not found", { status: 404 });
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

  // --- Batch console (premium model x N soak test) ------------------------
  if (sub === "batch") {
    const token = url.searchParams.get("token") || "";
    return new Response(renderBatchPage(token), {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  // --- Wisdom explorer ----------------------------------------------------
  if (sub === "wisdom") {
    const token = url.searchParams.get("token") || "";
    const cat = url.searchParams.get("category");
    const categories = await listLessonCategories(env);
    const active = cat || categories[0]?.category || null;
    const lessons = await getLessons(env, active, 60);
    const wisdom = await retrieveWisdom(env, active, 4);
    const injected = renderWisdom(wisdom);
    return new Response(renderWisdomPage(token, categories, active, lessons, injected), {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
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
  header .nav{text-decoration:none;color:#000080;font-weight:bold;cursor:pointer}
  header .nav:active{border-style:inset}
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
  <a class="stat nav" href="/api/admin/batch?token=${t}">▶ Batch run (100×)</a>
  <a class="stat nav" href="/api/admin/wisdom?token=${t}">🧠 Wisdom explorer</a>
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

// ===========================================================================
// Shared HTML helpers + extra pages (batch console, wisdom explorer)
// ===========================================================================

function he(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const PAGE_CSS = `
  body{margin:0;background:#008080;color:#000;font:13px/1.5 "MS Sans Serif",Tahoma,system-ui,sans-serif}
  header{background:#000080;color:#fff;padding:8px 12px;font-weight:bold;display:flex;gap:14px;align-items:center;flex-wrap:wrap}
  header a{color:#9fd;text-decoration:none}
  .win{margin:12px;background:#c0c0c0;border:2px outset #fff;padding:10px}
  .win h2{margin:0 0 8px;font-size:14px}
  code{font-family:"Courier New",monospace;font-size:11px;color:#000080}
  button{background:#c0c0c0;border:2px outset #fff;padding:5px 16px;font-weight:bold;cursor:pointer;font-family:inherit}
  button:active{border-style:inset}
  button:disabled{color:#808080;cursor:default}
  input,select{font-family:inherit;font-size:12px;padding:3px 5px;border:2px inset #fff;background:#fff}
`;

// --- Batch console ---------------------------------------------------------
function renderBatchPage(token: string): string {
  const t = encodeURIComponent(token);
  const opts = MODEL_CATALOG.map((m) => {
    const cost = (1500 / 1e6) * m.inPrice + (2500 / 1e6) * m.outPrice;
    const sel = m.id === "@cf/openai/gpt-oss-120b" ? "selected" : "";
    const tag = m.extreme === "best" ? " ★BEST" : m.extreme === "worst" ? " ✖WORST" : "";
    return `<option value="${he(m.id)}" data-cost="${cost.toFixed(5)}" ${sel}>${he(m.label)}${tag} — ~$${cost.toFixed(4)}/draw (${m.tier})</option>`;
  }).join("");

  return `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Batch Run · MSPaint Admin</title>
<style>${PAGE_CSS}
  .controls{display:flex;gap:10px;flex-wrap:wrap;align-items:end}
  .controls label{display:flex;flex-direction:column;font-size:11px;font-weight:bold;gap:3px}
  .stats{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0}
  .stat{background:#fff;border:2px inset #fff;padding:4px 10px;font-variant-numeric:tabular-nums}
  .stat b{display:block;font-size:18px;color:#000080}
  .bar{height:18px;background:#fff;border:2px inset #fff;margin:6px 0;position:relative}
  .bar > div{height:100%;background:#000080;width:0%}
  .layout{display:grid;grid-template-columns:1fr 320px;gap:12px}
  @media(max-width:800px){.layout{grid-template-columns:1fr}}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:6px;max-height:60vh;overflow:auto;background:#808080;padding:6px;border:2px inset #fff}
  .cell{background:#fff;border:1px solid #404040;position:relative}
  .cell canvas{width:100%;display:block;image-rendering:pixelated;aspect-ratio:4/3}
  .cell.fail{outline:2px solid #c00}
  .cell .n{position:absolute;top:0;left:0;background:#000080;color:#fff;font-size:9px;padding:0 3px}
  .side .panel{background:#fff;border:2px inset #fff;padding:8px;margin-bottom:10px}
  .side h3{margin:0 0 6px;font-size:12px;background:#000080;color:#fff;padding:3px 6px}
  .wisbox{background:#ffffcc;border:1px solid #808080;padding:6px;font-size:11px;white-space:pre-wrap;max-height:220px;overflow:auto}
  .growth{font-size:11px;color:#333}
</style></head><body>
<header>
  <span>▶ Batch Run</span>
  <a href="/api/admin?token=${t}">← gallery</a>
  <a href="/api/admin/wisdom?token=${t}">🧠 wisdom explorer</a>
</header>

<div class="win">
  <h2>Soak test: run a model N times on one prompt &amp; watch wisdom accrue</h2>
  <div class="controls">
    <label>Model
      <select id="model" style="min-width:340px">${opts}</select>
    </label>
    <label>Prompt
      <input id="prompt" value="a cat sitting on a windowsill at sunset" style="min-width:280px">
    </label>
    <label>Count
      <input id="count" type="number" value="100" min="1" max="500" style="width:80px">
    </label>
    <button id="go">Run</button>
    <button id="stop" disabled>Stop</button>
  </div>
  <div class="stats">
    <div class="stat"><b id="s-done">0</b>done / <span id="s-total">0</span></div>
    <div class="stat"><b id="s-ok">0</b>parsed ok</div>
    <div class="stat"><b id="s-fail">0</b>parse fails</div>
    <div class="stat"><b id="s-cmd">0</b>avg commands</div>
    <div class="stat"><b id="s-lat">0</b>avg latency (ms)</div>
    <div class="stat"><b id="s-cost">$0.00</b>est spend</div>
    <div class="stat"><b id="s-les">0</b>lessons accrued</div>
  </div>
  <div class="bar"><div id="bar"></div></div>
</div>

<div class="win layout">
  <div>
    <h2>Drawings (rendered live)</h2>
    <div class="grid" id="grid"></div>
  </div>
  <div class="side">
    <div class="panel">
      <h3>What the agent saw this run</h3>
      <div class="growth">Injected lessons grow as the batch runs — this is the accrual flywheel.</div>
      <div class="wisbox" id="wisdom">(none yet — early runs have no accrued wisdom)</div>
    </div>
    <div class="panel">
      <h3>Latest lesson elicited</h3>
      <div class="wisbox" id="lesson">(waiting…)</div>
    </div>
  </div>
</div>

<script>
const TOKEN = ${JSON.stringify(token)};
let stop = false;

// --- compact command renderer (mirrors the app's canvas) ------------------
function render(ctx, cmds){
  let fg = "#000000", bg = "#FFFFFF";
  ctx.fillStyle = "#FFFFFF"; ctx.fillRect(0,0,640,480);
  for(const c of (cmds||[])){
    try{
      switch(c.type){
        case "setForegroundColor": fg = c.color || fg; break;
        case "setBackgroundColor": bg = c.color || bg; break;
        case "clearCanvas": ctx.fillStyle="#FFFFFF"; ctx.fillRect(0,0,640,480); break;
        case "drawPixel": ctx.fillStyle=fg; ctx.fillRect(c.x,c.y,1,1); break;
        case "drawLine": ctx.strokeStyle=fg; ctx.lineWidth=2; ctx.lineCap="round";
          ctx.beginPath(); ctx.moveTo(c.x1,c.y1); ctx.lineTo(c.x2,c.y2); ctx.stroke(); break;
        case "drawFreehand": if(c.points&&c.points.length){ ctx.strokeStyle=fg; ctx.lineWidth=2; ctx.lineJoin="round";
          ctx.beginPath(); ctx.moveTo(c.points[0].x,c.points[0].y);
          for(let i=1;i<c.points.length;i++) ctx.lineTo(c.points[i].x,c.points[i].y); ctx.stroke(); } break;
        case "drawCurve": ctx.strokeStyle=fg; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(c.startX,c.startY);
          if(c.controlX2!=null) ctx.bezierCurveTo(c.controlX1,c.controlY1,c.controlX2,c.controlY2,c.endX,c.endY);
          else ctx.quadraticCurveTo(c.controlX1,c.controlY1,c.endX,c.endY); ctx.stroke(); break;
        case "drawRectangle": shape(ctx,fg,bg,c.fillMode,()=>ctx.rect(c.x,c.y,c.width,c.height)); break;
        case "drawRoundedRectangle": shape(ctx,fg,bg,c.fillMode,()=>roundRect(ctx,c.x,c.y,c.width,c.height,c.radius||12)); break;
        case "drawEllipse": shape(ctx,fg,bg,c.fillMode,()=>ctx.ellipse(c.x+c.width/2,c.y+c.height/2,Math.abs(c.width/2),Math.abs(c.height/2),0,0,7)); break;
        case "drawPolygon": if(c.points&&c.points.length>=3) shape(ctx,fg,bg,c.fillMode,()=>{
          ctx.moveTo(c.points[0].x,c.points[0].y); for(let i=1;i<c.points.length;i++) ctx.lineTo(c.points[i].x,c.points[i].y); ctx.closePath(); }); break;
        case "floodFill": flood(ctx,c.x|0,c.y|0,fg); break;
        case "placeText": ctx.fillStyle=fg; ctx.font=(c.bold?"bold ":"")+(c.fontSize||16)+"px sans-serif"; ctx.fillText(c.text||"",c.x,c.y); break;
        case "spray": sprayAt(ctx,fg,c.x,c.y); break;
        case "sprayPath": (c.points||[]).forEach(p=>sprayAt(ctx,fg,p.x,p.y)); break;
        case "gradientFill": { const g = c.gradientType==="radial"
            ? ctx.createRadialGradient((c.x1+c.x2)/2,(c.y1+c.y2)/2,0,(c.x1+c.x2)/2,(c.y1+c.y2)/2,Math.hypot(c.x2-c.x1,c.y2-c.y1)/2)
            : ctx.createLinearGradient(c.x1,c.y1,c.x2,c.y2);
          g.addColorStop(0,c.startColor||fg); g.addColorStop(1,c.endColor||bg); ctx.fillStyle=g; ctx.fillRect(0,0,640,480); } break;
      }
    }catch(e){}
  }
}
function shape(ctx,fg,bg,mode,path){ ctx.beginPath(); path();
  if(mode==="filled"){ ctx.fillStyle=fg; ctx.fill(); }
  else if(mode==="both"){ ctx.fillStyle=bg; ctx.fill(); ctx.strokeStyle=fg; ctx.lineWidth=2; ctx.stroke(); }
  else { ctx.strokeStyle=fg; ctx.lineWidth=2; ctx.stroke(); } }
function roundRect(ctx,x,y,w,h,r){ r=Math.min(r,Math.abs(w/2),Math.abs(h/2)); ctx.moveTo(x+r,y);
  ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); }
function sprayAt(ctx,fg,x,y){ ctx.fillStyle=fg; for(let i=0;i<14;i++){ const a=Math.random()*7,r=Math.random()*10; ctx.fillRect((x+Math.cos(a)*r)|0,(y+Math.sin(a)*r)|0,1,1);} }
function flood(ctx,x,y,hex){ if(x<0||y<0||x>=640||y>=480) return;
  const img=ctx.getImageData(0,0,640,480), d=img.data, idx=(y*640+x)*4;
  const tr=d[idx],tg=d[idx+1],tb=d[idx+2];
  const m=hex.replace("#",""); const fr=parseInt(m.slice(0,2),16),fgc=parseInt(m.slice(2,4),16),fb=parseInt(m.slice(4,6),16);
  if(tr===fr&&tg===fgc&&tb===fb) return;
  const st=[[x,y]]; let guard=0;
  while(st.length && guard++<300000){ const [cx,cy]=st.pop(); if(cx<0||cy<0||cx>=640||cy>=480) continue;
    const i=(cy*640+cx)*4; if(d[i]!==tr||d[i+1]!==tg||d[i+2]!==tb) continue;
    d[i]=fr; d[i+1]=fgc; d[i+2]=fb; d[i+3]=255;
    st.push([cx+1,cy],[cx-1,cy],[cx,cy+1],[cx,cy-1]); }
  ctx.putImageData(img,0,0); }

// --- batch loop -----------------------------------------------------------
const $ = id => document.getElementById(id);
let done=0, ok=0, fail=0, cmdSum=0, latSum=0, spend=0, lessons=0;

async function run(){
  stop=false; done=ok=fail=cmdSum=latSum=spend=lessons=0;
  const model=$("model").value, prompt=$("prompt").value.trim();
  const total=Math.max(1,Math.min(500,parseInt($("count").value)||1));
  const cost=parseFloat($("model").selectedOptions[0].dataset.cost||"0");
  const batchId=crypto.randomUUID();
  $("grid").innerHTML=""; $("s-total").textContent=total;
  $("go").disabled=true; $("stop").disabled=false;

  for(let i=0;i<total && !stop;i++){
    let res;
    try{
      const r=await fetch("/api/admin/run?token="+encodeURIComponent(TOKEN),{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model,prompt,batchId,index:i,total})});
      res=await r.json();
    }catch(e){ res={ok:false,commandCount:0,latencyMs:0,wisdomShown:"",rawError:String(e)}; }

    done++; latSum+=res.latencyMs||0; spend+=cost;
    if(res.ok){ ok++; cmdSum+=res.commandCount||0; } else { fail++; }
    if(res.lesson) lessons++;

    // render + upload
    const cv=document.createElement("canvas"); cv.width=640; cv.height=480;
    const ctx=cv.getContext("2d"); render(ctx, res.commands);
    const cell=document.createElement("div"); cell.className="cell"+(res.ok?"":" fail");
    const thumb=document.createElement("canvas"); thumb.width=160; thumb.height=120;
    thumb.getContext("2d").drawImage(cv,0,0,160,120);
    cell.appendChild(thumb);
    const n=document.createElement("div"); n.className="n"; n.textContent="#"+(i+1); cell.appendChild(n);
    cell.title=(res.description||res.rawError||"")+" · "+(res.commandCount||0)+" cmds · "+(res.latencyMs||0)+"ms";
    $("grid").appendChild(cell);
    if(res.ok && res.generationId){
      cv.toBlob(b=>{ const fr=new FileReader(); fr.onload=()=>{
        fetch("/api/mspaint/snapshot",{method:"POST",headers:{"Content-Type":"application/json"},
          body:JSON.stringify({generationId:res.generationId,image:fr.result})}).catch(()=>{}); };
        fr.readAsDataURL(b); },"image/png");
    }

    // metrics
    $("s-done").textContent=done; $("s-ok").textContent=ok; $("s-fail").textContent=fail;
    $("s-cmd").textContent=ok?Math.round(cmdSum/ok):0;
    $("s-lat").textContent=Math.round(latSum/done);
    $("s-cost").textContent="$"+spend.toFixed(3);
    $("s-les").textContent=lessons;
    $("bar").style.width=(done/total*100)+"%";
    $("wisdom").textContent=(res.wisdomShown&&res.wisdomShown.trim())?res.wisdomShown.trim():"(no accrued wisdom yet — keep going)";
    if(res.lesson) $("lesson").textContent="cues & strategies: "+(res.lesson.cuesAndStrategies||"—")+"\\n\\ndo differently: "+(res.lesson.doDifferently||"—");
  }
  $("go").disabled=false; $("stop").disabled=true;
}
$("go").onclick=run;
$("stop").onclick=()=>{ stop=true; };
</script>
</body></html>`;
}

// --- Wisdom explorer -------------------------------------------------------
function renderWisdomPage(
  token: string,
  categories: { category: string; lessons: number }[],
  active: string | null,
  lessons: Record<string, unknown>[],
  injected: string
): string {
  const t = encodeURIComponent(token);
  const tabs = categories.length
    ? categories
        .map(
          (c) =>
            `<a class="tab ${c.category === active ? "on" : ""}" href="/api/admin/wisdom?token=${t}&category=${encodeURIComponent(c.category)}">${he(c.category)} <b>${c.lessons}</b></a>`
        )
        .join("")
    : `<span class="muted">No lessons yet — run a batch to accrue some.</span>`;

  const cdtRows = lessons
    .map(
      (l) => `<tr>
      <td>${he(l.difficult_element)}</td>
      <td>${he(l.why_difficult)}</td>
      <td>${he(l.common_errors)}</td>
      <td class="cue">${he(l.cues_and_strategies)}</td>
    </tr>`
    )
    .join("");

  const parseList = (v: unknown): string => {
    try {
      const a = JSON.parse(String(v ?? "[]"));
      return Array.isArray(a) ? a.map((x) => `<li>${he(x)}</li>`).join("") : "";
    } catch {
      return "";
    }
  };
  const auditCards = lessons
    .slice(0, 24)
    .map(
      (l) => `<div class="card">
      <div class="do">→ ${he(l.do_differently) || "—"}</div>
      ${l.wish_i_knew ? `<div class="wish">💡 ${he(l.wish_i_knew)}</div>` : ""}
      <div class="cols">
        <div><b>worked</b><ul>${parseList(l.what_worked)}</ul></div>
        <div><b>didn't</b><ul>${parseList(l.what_didnt)}</ul></div>
      </div>
      ${l.aesthetic_score ? `<div class="score">aesthetic ${he(l.aesthetic_score)}</div>` : ""}
    </div>`
    )
    .join("");

  return `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Wisdom Explorer · MSPaint Admin</title>
<style>${PAGE_CSS}
  .flow{display:flex;gap:0;flex-wrap:wrap;align-items:stretch}
  .step{background:#fff;border:2px outset #fff;padding:8px;min-width:150px;flex:1;position:relative}
  .step .num{background:#000080;color:#fff;border-radius:50%;width:18px;height:18px;display:inline-flex;align-items:center;justify-content:center;font-size:11px;margin-right:4px}
  .step.hot{background:#ffffcc;outline:3px solid #c00}
  .step .ttl{font-weight:bold;font-size:12px}
  .step .d{font-size:11px;color:#333;margin-top:4px}
  .arrow{display:flex;align-items:center;justify-content:center;font-size:20px;color:#000080;padding:0 4px}
  .when{background:#ffffcc;border:1px solid #808080;padding:6px;margin-top:8px;font-size:12px}
  .tabs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px}
  .tab{text-decoration:none;background:#c0c0c0;border:2px outset #fff;padding:3px 10px;color:#000}
  .tab.on{background:#000080;color:#fff;border-style:inset}
  .tab b{color:#c00}.tab.on b{color:#ff0}
  .injected{background:#000;color:#3f6;font-family:"Courier New",monospace;font-size:11px;white-space:pre-wrap;padding:10px;border:2px inset #fff;max-height:240px;overflow:auto}
  table{width:100%;border-collapse:collapse;background:#fff;border:2px inset #fff}
  th,td{border:1px solid #c0c0c0;padding:5px 7px;font-size:12px;text-align:left;vertical-align:top}
  th{background:#000080;color:#fff;font-size:11px}
  td.cue{background:#ffffcc}
  .cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:8px}
  .card{background:#fff;border:2px inset #fff;padding:8px;font-size:11px}
  .card .do{font-weight:bold;color:#000080;margin-bottom:4px}
  .card .wish{background:#ffffcc;padding:2px 4px;margin-bottom:4px}
  .card .cols{display:flex;gap:8px}.card .cols>div{flex:1}
  .card ul{margin:2px 0 0;padding-left:16px}
  .card .score{margin-top:4px;color:#080}
  .muted{color:#808080}
</style></head><body>
<header>
  <span>🧠 Wisdom Explorer</span>
  <a href="/api/admin?token=${t}">← gallery</a>
  <a href="/api/admin/batch?token=${t}">▶ batch run</a>
</header>

<div class="win">
  <h2>How &amp; when wisdom reaches an agent</h2>
  <div class="flow">
    <div class="step"><div class="ttl"><span class="num">1</span>Situation assessment</div><div class="d">Classify the prompt → category + which tools matter (ACTA pattern recognition).</div></div>
    <div class="arrow">▶</div>
    <div class="step hot"><div class="ttl"><span class="num">2</span>Wisdom recall ★</div><div class="d">Top accrued lessons for that category are injected into the system prompt as <b>"Lessons from artists past"</b> — <i>this</i> is when the agent sees them: before it draws.</div></div>
    <div class="arrow">▶</div>
    <div class="step"><div class="ttl"><span class="num">3</span>Mental simulation</div><div class="d">The agent writes an explicit <code>plan</code> before committing commands.</div></div>
    <div class="arrow">▶</div>
    <div class="step"><div class="ttl"><span class="num">4</span>Draw</div><div class="d">Emits paint commands that animate on the canvas.</div></div>
    <div class="arrow">▶</div>
    <div class="step"><div class="ttl"><span class="num">5</span>Reflect → accrue</div><div class="d">A reflection pass fills a Cognitive Demands Table + Knowledge Audit, stored as a new lesson for step 2 next time.</div></div>
  </div>
  <div class="when"><b>When:</b> wisdom is revealed at step 2, once per drawing, injected as plain text into the system prompt. <b>How much:</b> the top 4 lessons for the category, ranked by <code>helpfulness</code> then recency. <b>Where it comes from:</b> step 5 of every prior drawing — by anyone.</div>
</div>

<div class="win">
  <h2>Lessons by category</h2>
  <div class="tabs">${tabs}</div>
  <h2 style="font-size:12px">Exactly what an agent drawing <code>${he(active || "—")}</code> sees injected right now:</h2>
  <div class="injected">${injected && injected.trim() ? he(injected.trim()) : "(empty — no accrued wisdom for this category yet)"}</div>
</div>

<div class="win">
  <h2>Cognitive Demands Table — ${he(active || "all")} (${lessons.length})</h2>
  ${lessons.length ? `<table><thead><tr><th>Difficult element</th><th>Why difficult</th><th>Common errors</th><th>Cues &amp; strategies (what an expert does)</th></tr></thead><tbody>${cdtRows}</tbody></table>` : `<p class="muted">No lessons yet.</p>`}
</div>

<div class="win">
  <h2>Knowledge Audit</h2>
  <div class="cards">${auditCards || '<p class="muted">No lessons yet.</p>'}</div>
</div>
</body></html>`;
}
