/**
 * MSPaint AI generation — free Cloudflare tier + bring-your-own-key, with
 * usage quota, full logging, and an expertise-accrual reflection loop.
 *
 * Flow:
 *   identify -> quota -> situation assessment -> recall accrued wisdom ->
 *   draw (Workers AI free, or user's Anthropic key = unlimited) -> log ->
 *   (background) reflect -> store lesson.
 */

import type { Env } from "../../_lib/env";
import { freeLimit } from "../../_lib/env";
import { identify, identityCookie } from "../../_lib/identity";
import {
  getOrCreateUser,
  consumeFreeUse,
  bumpTotal,
  recordGeneration,
  recordLesson,
  retrieveWisdom,
  getFlags,
  recordEvent,
  updateGenerationFinal,
} from "../../_lib/db";
import { storePng, storeDataUrl } from "../../_lib/r2";
import {
  buildDrawSystemPrompt,
  REFLECTION_SYSTEM_PROMPT,
  buildReflectionUserContent,
  extractJson,
} from "../../_lib/cta";
import { runText, runTextRich, runVisionRich, classifyPrompt, resolveDrawModel, UTILITY_MODEL } from "../../_lib/workers-ai";
import { hasVision, drawBudget, isAllowedModel } from "../../_lib/models";
import { searchReferences } from "../../_lib/references";

const ALLOWED_ANTHROPIC = new Set([
  "claude-haiku-4-5-20251001",
  "claude-sonnet-4-20250514",
]);
const DEFAULT_ANTHROPIC = "claude-sonnet-4-20250514";

// Below this many commands a drawing reads as an unfinished sketch; trigger
// one density retry on the free (Workers AI) path.
const MIN_DRAW_COMMANDS = 20;

interface DrawResult {
  thinking: string | null;
  plan: unknown;
  description: string;
  commands: unknown[];
  needsAnotherTurn: boolean;
}

function jsonResponse(body: unknown, status: number, setCookie?: string): Response {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (setCookie) headers["Set-Cookie"] = setCookie;
  return new Response(JSON.stringify(body), { status, headers });
}

function parseDraw(text: string): DrawResult | null {
  const parsed = extractJson<{
    thinking?: string;
    plan?: unknown;
    description?: string;
    commands?: unknown[];
    parts?: Array<{ part?: string; commands?: unknown[] }>;
    needsAnotherTurn?: boolean;
  }>(text);
  if (!parsed) return null;
  // Preferred shape: parts-grouped commands (schema-enforced density).
  // Fallback: a flat commands array (older models / continuation turns).
  let commands: unknown[] = Array.isArray(parsed.commands) ? parsed.commands : [];
  if (!commands.length && Array.isArray(parsed.parts)) {
    commands = parsed.parts.flatMap((p) => (Array.isArray(p?.commands) ? p.commands : []));
  }
  if (!commands.length) return null;
  return {
    thinking: parsed.thinking ?? null,
    plan: parsed.plan ?? null,
    description: parsed.description || "Drawing",
    commands,
    needsAnotherTurn: !!parsed.needsAnotherTurn,
  };
}

async function drawWithAnthropic(
  apiKey: string,
  model: string,
  system: string,
  prompt: string,
  canvasSnapshot?: string
): Promise<{ draw: DrawResult | null; usage: unknown; raw: string }> {
  const content: Array<Record<string, unknown>> = [];
  if (canvasSnapshot) {
    content.push({
      type: "image",
      source: {
        type: "base64",
        media_type: "image/png",
        data: canvasSnapshot.replace(/^data:image\/png;base64,/, ""),
      },
    });
  }
  content.push({
    type: "text",
    text: (canvasSnapshot ? "Current canvas is shown above.\n\n" : "") + prompt,
  });

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 8192,
      system,
      messages: [{ role: "user", content }],
    }),
  });
  if (!res.ok) throw new Error(`Claude API error: ${await res.text()}`);
  const result = (await res.json()) as {
    content: Array<{ type: string; text?: string }>;
    usage?: unknown;
  };
  const textBlock = result.content.find((b) => b.type === "text");
  const raw = textBlock?.text || "";
  return { draw: parseDraw(raw), usage: result.usage ?? null, raw };
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const started = Date.now();

  let body: {
    prompt?: string;
    canvasSnapshot?: string;
    apiKey?: string;
    model?: string;
    adminToken?: string;
  };
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const prompt = (body.prompt || "").trim();
  if (!prompt) return jsonResponse({ error: "Prompt is required" }, 400);

  const userAnthropicKey = body.apiKey?.trim();
  const usingOwnKey = !!userAnthropicKey;

  // Admin unlock: a valid ADMIN_TOKEN (header or body) lets ONLY the operator
  // draw on the server-side Anthropic key and pick any catalog model, uncounted.
  // The public NEVER reaches the server key — they get Workers AI free or their
  // own key. This is the "gate the expensive stuff to me" boundary.
  const adminToken = (request.headers.get("X-Admin-Token") || body.adminToken || "").trim();
  const isAdmin = !!env.ADMIN_TOKEN && adminToken === env.ADMIN_TOKEN;
  const serverKey = isAdmin ? env.ANTHROPIC_API_KEY?.trim() : undefined;
  // The key used to draw with Claude: the visitor's own, or (admin only) the
  // server's. Admin draws are uncounted (no free-quota consumption).
  const anthropicKey = userAnthropicKey || serverKey;
  const usingAnthropic = !!anthropicKey;
  const uncounted = usingOwnKey || isAdmin;

  // Identify the user (cookie + IP/UA hash). DB is optional — degrade if absent.
  const id = await identify(request, env);
  const cookie = id.isNewCookie ? identityCookie(id.cookieUuid) : undefined;

  let userId = id.cookieUuid;
  let used = 0;
  const limit = freeLimit(env);
  if (env.MSPAINT_DB) {
    const r = await getOrCreateUser(env, id);
    userId = r.userId;
    used = r.quota.used;

    // Free path is gated by quota; bring-your-own-key and admin are unlimited.
    if (!uncounted && r.quota.exceeded) {
      return jsonResponse(
        {
          error: `You've used all ${limit} free drawings. Add your own Anthropic API key in Settings for unlimited drawing.`,
          quotaExceeded: true,
          usesRemaining: 0,
          usesLimit: limit,
        },
        402,
        cookie
      );
    }
  }

  const generationId = crypto.randomUUID();
  const provider = usingOwnKey
    ? "anthropic"
    : serverKey
      ? "anthropic-admin"
      : "cloudflare";

  // 1. Situation assessment (cheap, via Workers AI when available).
  let category: string | null = null;
  let subcategories: string[] = [];
  let recommendedTools: string[] = [];
  if (env.AI) {
    try {
      const c = await classifyPrompt(env, prompt);
      category = c.category;
      subcategories = c.subcategories;
      recommendedTools = c.tools;
    } catch {
      /* non-fatal */
    }
  }

  // 2. Recall accrued wisdom for this category (ShadowBox feedback loop).
  const wisdom = await retrieveWisdom(env, category, 4);
  const drawSystem = buildDrawSystemPrompt(wisdom);

  // Public feature flags (admin-controlled) for non-key visitors.
  const flags = await getFlags(env);

  // 3. Draw.
  let draw: DrawResult | null = null;
  let usage: unknown = null;
  let modelUsed = "";
  const refKeys: string[] = [];
  let referenceQuery: string | null = null;
  // The draw agent's concurrent reasoning trace (reasoning models), fed to the
  // reflection pass so the CDM lesson distills real thinking, not a guess.
  let drawReasoning: string | null = null;
  try {
    if (usingAnthropic) {
      modelUsed = body.model && ALLOWED_ANTHROPIC.has(body.model) ? body.model : DEFAULT_ANTHROPIC;
      const r = await drawWithAnthropic(
        anthropicKey!,
        modelUsed,
        drawSystem,
        prompt,
        body.canvasSnapshot
      );
      draw = r.draw;
      usage = r.usage;
    } else {
      if (!env.AI) {
        return jsonResponse(
          { error: "Free drawing is not configured on this server. Add your own Anthropic API key in Settings." },
          500,
          cookie
        );
      }
      // Admins may pick any catalog model per-request (frontier models included);
      // the public gets the configured free-tier model.
      modelUsed = isAdmin && body.model && isAllowedModel(body.model)
        ? body.model
        : await resolveDrawModel(env);

      // Optional: look at reference photos first (admin flag + vision model).
      const refImages: string[] = [];
      if (flags.references && hasVision(modelUsed) && env.PEXELS_API_KEY) {
        const { images, query } = await searchReferences(env, prompt, 1);
        referenceQuery = query;
        for (let i = 0; i < images.length; i++) {
          refImages.push(images[i].dataUrl);
          const k = await storeDataUrl(env, `drawings/${generationId}/ref${i}.jpg`, images[i].dataUrl);
          if (k) refKeys.push(k);
          if (env.MSPAINT_DB)
            await recordEvent(env, { generationId, seq: 2, phase: "look", type: "reference_image", data: { url: images[i].url, key: k } }).catch(() => {});
        }
      }

      const result = refImages.length
        ? await runVisionRich(env, drawSystem, prompt, refImages, drawBudget(modelUsed), modelUsed)
        : await runTextRich(env, drawSystem, prompt, drawBudget(modelUsed), modelUsed);
      drawReasoning = result.reasoning;
      draw = parseDraw(result.text);

      // Sparse-draw retry: mid-size models ignore numeric floors and stop at a
      // handful of boxes. One follow-up demanding full density is cheap and
      // reliably helps. Keep the better of the two attempts.
      if (draw && draw.commands.length < MIN_DRAW_COMMANDS) {
        const retryUser =
          `${prompt}\n\nYour previous attempt used only ${draw.commands.length} paint commands — ` +
          `that is a sparse sketch, not a finished drawing. Decompose the subject further ` +
          `(each body part its own polygon/ellipse, full background coverage, details last) and ` +
          `return the COMPLETE drawing again as one JSON object with 25-60 commands.`;
        const retry = refImages.length
          ? await runVisionRich(env, drawSystem, retryUser, refImages, drawBudget(modelUsed), modelUsed)
          : await runTextRich(env, drawSystem, retryUser, drawBudget(modelUsed), modelUsed);
        const retryDraw = parseDraw(retry.text);
        if (retryDraw && retryDraw.commands.length > draw.commands.length) {
          draw = retryDraw;
          drawReasoning = retry.reasoning ?? drawReasoning;
        }
      }
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    if (env.MSPAINT_DB) {
      await recordGeneration(env, {
        id: generationId, userId, identity: id, provider, model: modelUsed,
        prompt, category, subcategories, recommendedTools,
        status: "error", error: msg, latencyMs: Date.now() - started,
      }).catch(() => {});
    }
    return jsonResponse({ error: msg }, 502, cookie);
  }

  if (!draw) {
    if (env.MSPAINT_DB) {
      await recordGeneration(env, {
        id: generationId, userId, identity: id, provider, model: modelUsed,
        prompt, category, subcategories, recommendedTools,
        status: "error", error: "Failed to parse paint commands",
        latencyMs: Date.now() - started,
      }).catch(() => {});
    }
    return jsonResponse({ error: "The model did not return valid paint commands. Try again." }, 502, cookie);
  }

  const latencyMs = Date.now() - started;

  // 4. Persist (log everything) — best-effort, never blocks the drawing.
  let canvasBeforeKey: string | null = null;
  if (env.MSPAINT_DB) {
    canvasBeforeKey = await storePng(
      env,
      `drawings/${generationId}/before.png`,
      body.canvasSnapshot
    );

    await recordGeneration(env, {
      id: generationId, userId, identity: id, provider, model: modelUsed,
      prompt, category, subcategories, recommendedTools, referenceQuery,
      thinking: draw.thinking, plan: draw.plan, description: draw.description,
      commands: draw.commands, commandCount: draw.commands.length,
      canvasBeforeKey, usageTokens: usage, latencyMs, status: "ok",
    }).catch(() => {});
    if (refKeys.length) await updateGenerationFinal(env, generationId, { referenceKeys: refKeys }).catch(() => {});

    // Decrement quota only for the free path; own-key and admin are uncounted.
    if (uncounted) {
      await bumpTotal(env, userId).catch(() => {});
    } else {
      await consumeFreeUse(env, userId).catch(() => {});
      used += 1;
    }

    // 5. Reflection pass — elicit a Cognitive Demands Table + Knowledge Audit
    //    and store it as a lesson. Runs in the background via waitUntil.
    if (env.AI) {
      context.waitUntil(
        (async () => {
          try {
            const text = await runText(
              env,
              REFLECTION_SYSTEM_PROMPT,
              buildReflectionUserContent(prompt, category, draw!.description, draw!.commands.length, drawReasoning, draw!.thinking),
              700,
              UTILITY_MODEL
            );
            const ref = extractJson<Record<string, unknown>>(text);
            if (!ref) return;
            await recordLesson(env, {
              id: crypto.randomUUID(),
              generationId,
              category,
              subcategories,
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
          } catch {
            /* accrual is best-effort */
          }
        })()
      );
    }
  }

  const usesRemaining = uncounted ? null : Math.max(0, limit - used);

  return jsonResponse(
    {
      generationId,
      provider,
      model: modelUsed,
      thinking: draw.thinking,
      plan: draw.plan,
      description: draw.description,
      commands: draw.commands,
      recommendedTools,
      classification: { category: category || "general", subcategories },
      category: category || "general",
      referenceImages: [],
      needsAnotherTurn: draw.needsAnotherTurn,
      canDraw: hasVision(modelUsed),
      flags,
      usage,
      usesRemaining,
      usesLimit: limit,
      unlimited: uncounted,
      admin: isAdmin,
    },
    200,
    cookie
  );
};
