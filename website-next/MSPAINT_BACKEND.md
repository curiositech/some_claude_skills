# MS Paint — Free Tier, Usage Tracking & Expertise Accrual

This documents the backend added to the OS2 MS Paint app: a free AI-drawing
tier powered by Cloudflare Workers AI, per-visitor usage limits, full logging
of every drawing, an admin gallery, and an expertise-accrual loop built on
cognitive task analysis.

## TL;DR of what changed

- **Mobile drawing fixed.** The canvas now uses Pointer Events (mouse + touch +
  pen), pointer capture, screen→canvas coordinate scaling, and `touch-action:
  none`. Taps and drags register correctly on phones.
- **5 free drawings per visitor** via a cheap Cloudflare model
  (`@cf/meta/llama-3.1-8b-instruct`), emitting the same paint-command JSON so the
  drawing animation is identical.
- **Bring-your-own Anthropic key = unlimited** (and not counted).
- **Remaining uses shown** in the prompt bar (`3 / 5 free left`).
- **Everything is logged** (D1 + R2): prompt, plan, commands, before/after PNGs,
  model, tokens, latency, and an accrued "lesson".
- **Admin gallery** at `/api/admin` (token-gated) to browse all of it.

## Architecture

```
Browser (MSPaintAppContent)
  │  GET  /api/mspaint/usage      → remaining free uses (on load)
  │  POST /api/mspaint/generate   → { commands, usesRemaining, generationId }
  │  POST /api/mspaint/snapshot   → final rendered PNG (the "output")
  ▼
Cloudflare Pages Functions (functions/)
  ├─ identify()        cookie UUID + sha256(ip+ua+salt) backup   [_lib/identity.ts]
  ├─ quota (D1)        users.free_uses_used vs FREE_USES_LIMIT   [_lib/db.ts]
  ├─ assess (AI)       classify prompt → category + tools        [_lib/workers-ai.ts]
  ├─ recall (D1)       top lessons for category → inject          [_lib/db.ts]
  ├─ draw              Workers AI (free) | Anthropic (own key)    [generate.ts]
  ├─ log (D1 + R2)     generations row + before/after PNGs        [_lib/db.ts,_lib/r2.ts]
  └─ reflect (AI)      Cognitive Demands Table → lessons row      [waitUntil]
```

### The expertise-accrual loop (why it's shaped this way)

Per the linked cognitive-task-analysis skills (ACTA, Critical Decision Method,
ShadowBox), the agent doesn't just emit commands — it runs a small expertise
loop, and every drawing by anyone accrues reusable knowledge:

1. **Situation assessment** (ACTA pattern recognition): classify the prompt into
   a category + the tools that matter.
2. **Wisdom recall** (ShadowBox): the best prior `lessons` for that category are
   injected into the system prompt as "Lessons from artists past."
3. **Mental simulation**: the agent must emit an explicit `plan` before commands.
4. **Knowledge elicitation** (Cognitive Demands Table + Knowledge Audit): a
   reflection pass fills `difficult_element / why_difficult / common_errors /
   cues_and_strategies / what_worked / do_differently / …`, stored in `lessons`.
5. That lesson becomes step-2 wisdom for the next agent. The flywheel turns.

The `lessons` table is literally a Cognitive Demands Table — the corpus you can
mine later to author "official" MS Paint wisdom or fine-tune a model.

## Resources (already provisioned)

| Kind | Name | ID |
|------|------|----|
| D1   | `someclaudeskills-mspaint` | `2576030c-1019-41df-87c5-1016ef9af4cf` |
| R2   | `someclaudeskills-mspaint` | — |

Schema is in `schema.sql` and has already been applied to the D1 database.
To re-apply (idempotent):

```bash
npx wrangler d1 execute someclaudeskills-mspaint --remote --file=./schema.sql
```

## Remaining steps to go live

Bindings are declared in `wrangler.toml`. Two things still require your account:

### 1. Attach bindings to the Pages project

- If the project deploys via `wrangler pages deploy`, `wrangler.toml` is used
  directly — nothing else to do.
- If it deploys via the **Pages Git integration**, confirm `name` in
  `wrangler.toml` matches the Pages project name, OR add the same bindings in
  the dashboard → your Pages project → **Settings → Functions → Bindings**:
  - Workers AI: variable `AI`
  - D1: variable `MSPAINT_DB` → `someclaudeskills-mspaint`
  - R2: variable `MSPAINT_BUCKET` → `someclaudeskills-mspaint`

### 2. Set secrets

```bash
# Required for the admin gallery
npx wrangler pages secret put ADMIN_TOKEN

# Strongly recommended (salts the IP/UA hash so it can't be reversed)
npx wrangler pages secret put IDENTITY_SALT

# Optional: fallback drawing key + reference images
npx wrangler pages secret put ANTHROPIC_API_KEY
npx wrangler pages secret put PEXELS_API_KEY
```

Tunable vars (in `wrangler.toml`): `FREE_USES_LIMIT` (default 5),
`CF_TEXT_MODEL` (default `@cf/meta/llama-3.1-8b-instruct`).

## Admin gallery (Erich-only)

Token-gated. Pass `?token=<ADMIN_TOKEN>` (or header `X-Admin-Token`).

| Route | Method | Returns |
|-------|--------|---------|
| `/api/admin?token=…` | GET | HTML gallery + **model picker** + lessons + stats |
| `/api/admin/batch?token=…` | GET | **Batch console** — run a model N× and watch wisdom accrue live |
| `/api/admin/wisdom?token=…` | GET | **Wisdom explorer** — loop diagram + Cognitive Demands Table + Knowledge Audit + the exact injected text |
| `/api/admin/data?token=…&limit=&offset=` | GET | JSON of generations |
| `/api/admin/stats?token=…` | GET | aggregate stats + per-category counts |
| `/api/admin/models?token=…` | GET | model catalog + currently-active model (JSON) |
| `/api/admin/model?token=…` | POST | set the active free-tier model (`{model}` JSON or form) |
| `/api/admin/run?token=…` | POST | run ONE drawing (the batch unit): `{model, prompt, batchId, index, total}` |
| `/api/admin/image?token=…&key=…` | GET | streams a drawing PNG from R2 |

### Batch console (soak test)

`/api/admin/batch` runs a chosen model on one prompt N times (default 100),
**driven from the browser** so it never hits a Worker time limit. Each iteration
goes through the full loop (assess → recall wisdom → draw → reflect → accrue),
renders the result to a canvas (and uploads it so it shows in the gallery), and
updates live metrics: parse-success rate, avg commands, avg latency, estimated
spend, and lessons accrued. A side panel shows **exactly the "Lessons from
artists past" text the agent saw** that iteration — so you can literally watch
the wisdom pool grow and feed back in.

### Wisdom explorer

`/api/admin/wisdom` makes the accrual loop legible:
- a **diagram** of the 5 stages with the wisdom-injection step highlighted,
  spelling out **when** (step 2, before drawing), **how much** (top 4 by
  helpfulness then recency), and **where it comes from** (step 5 of every prior
  drawing);
- the **exact injected block** an agent drawing a given category sees right now;
- the **Cognitive Demands Table** (difficult element / why / common errors /
  cues & strategies) and the **Knowledge Audit** cards, per category.

### Choosing the drawing model (with prices)

The gallery shows the **currently-active model** in the header and a price table
you pick from (Cloudflare per-token pricing + an estimated `$/drawing`). The
catalog lives in `functions/_lib/models.ts`. The selection is stored in D1
(`config.cf_text_model`) and read at request time, so it changes live with no
redeploy. Each drawing card also shows which model produced it.

Notes:
- The picker controls the **free-tier drawing** model only. Classification and
  the reflection pass always use the cheap recommended model to keep costs flat.
- Bring-your-own-key (Anthropic) users are unaffected.
- Default is `@cf/qwen/qwen3-30b-a3b-fp8` (best value: reliable JSON, ~3B-tier
  price).
- **Best:** `@cf/moonshotai/kimi-k2.7-code` (frontier 1T MoE, 262K ctx, native
  structured JSON) — priciest output ($4/M). `@cf/openai/gpt-oss-120b` is the
  best *value* flagship ($0.35/$0.75). Also strong: Llama 4 Scout, QwQ-32B.
- **Worst:** `@cf/meta/llama-3.2-1b` (cheapest, frequently malformed JSON — a
  good baseline) and `@cf/meta/llama-2-7b-chat-fp16` (a trap: ancient *and* the
  most expensive output on the platform).
- gpt-oss models use Cloudflare's Responses API (`instructions`/`input`); the
  client transparently handles that — everything else uses chat `messages`.

R2 is private; images are only served through the token-gated `image` route.

## Identity & privacy

- **MAC addresses are not used** — browsers never expose them to web servers.
- Identity = first-party anonymous cookie UUID (primary) + `sha256(ip + ua +
  salt)` (backup, so clearing cookies / incognito doesn't trivially reset the
  count). The raw IP is never stored, only its salted hash.
- **Free-tier drawings are logged** (prompt, plan, commands, before/after PNGs).
  Because you're logging visitor-submitted content, add a short line to your
  privacy policy and, for GDPR/CCPA, ideally a one-time notice. The Settings
  window already discloses this in-app. A bring-your-own-key user's API key is
  never logged.

## Files

```
website-next/
├─ wrangler.toml                         bindings + vars
├─ schema.sql                            D1 schema (CDT/Knowledge-Audit shaped)
├─ functions/
│  ├─ tsconfig.json
│  ├─ _lib/{env,identity,db,r2,cta,workers-ai}.ts
│  └─ api/
│     ├─ mspaint/{generate,usage,snapshot}.ts
│     └─ admin/[[path]].ts               token-gated gallery
└─ src/components/
   ├─ mspaint/Canvas/Canvas.tsx          pointer-event (mobile) fix
   ├─ mspaint/PromptInput/PromptInput.*  remaining-uses badge
   └─ desktop/MSPaintAppContent.tsx      quota fetch + output snapshot upload
```
