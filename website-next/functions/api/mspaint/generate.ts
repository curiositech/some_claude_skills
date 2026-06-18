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
import { runText, runVision, classifyPrompt, resolveDrawModel, UTILITY_MODEL } from "../../_lib/workers-ai";
import { hasVision } from "../../_lib/models";
import { searchReferences } from "../../_lib/references";

const ALLOWED_ANTHROPIC = new Set([
  "claude-haiku-4-5-20251001",
  "claude-sonnet-4-20250514",
]);
const DEFAULT_ANTHROPIC = "claude-sonnet-4-20250514";

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
    needsAnotherTurn?: boolean;
  }>(text);
  if (!parsed || !Array.isArray(parsed.commands)) return null;
  return {
    thinking: parsed.thinking ?? null,
    plan: parsed.plan ?? null,
    description: parsed.description || "Drawing",
    commands: parsed.commands,
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

    // Free path is gated by quota; bring-your-own-key is unlimited.
    if (!usingOwnKey && r.quota.exceeded) {
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
  const provider = usingOwnKey ? "anthropic" : "cloudflare";

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
  try {
    if (usingOwnKey) {
      modelUsed = body.model && ALLOWED_ANTHROPIC.has(body.model) ? body.model : DEFAULT_ANTHROPIC;
      const r = await drawWithAnthropic(
        userAnthropicKey!,
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
      modelUsed = await resolveDrawModel(env);

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

      const text = refImages.length
        ? await runVision(env, drawSystem, prompt, refImages, 4096, modelUsed)
        : await runText(env, drawSystem, prompt, 4096, modelUsed);
      draw = parseDraw(text);
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

    // Decrement quota only for the free path.
    if (usingOwnKey) {
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
              buildReflectionUserContent(prompt, category, draw!.description, draw!.commands.length),
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

  const usesRemaining = usingOwnKey ? null : Math.max(0, limit - used);

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
      unlimited: usingOwnKey,
    },
    200,
    cookie
  );
};
