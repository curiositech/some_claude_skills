/**
 * POST /api/mspaint/critique — vision critique of a finished public drawing.
 * Gated by the admin `critique` flag. A vision model SEES the rendered image,
 * scores it, and the elicited lesson is accrued (sawImage = true).
 */

import type { Env } from "../../_lib/env";
import { getFlags, recordLesson, recordEvent, updateGenerationFinal, getGeneration } from "../../_lib/db";
import { runVision } from "../../_lib/workers-ai";
import { VISION_CRITIC_MODEL } from "../../_lib/models";
import { CRITIQUE_VISION_SYSTEM, buildCritiqueUserContent, extractJson } from "../../_lib/cta";

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  if (!env.AI || !env.MSPAINT_DB) return Response.json({ ok: false }, { status: 200 });

  const flags = await getFlags(env);
  if (!flags.critique) return Response.json({ ok: false, disabled: true }, { status: 200 });

  const b = (await request.json()) as {
    generationId?: string; prompt?: string; image?: string; category?: string;
    commandCount?: number; passCount?: number;
  };
  if (!b.generationId || !b.prompt || !b.image) {
    return Response.json({ ok: false, error: "generationId, prompt, image required" }, { status: 400 });
  }

  // Only critique a real generation that exists.
  const gen = await getGeneration(env, b.generationId);
  if (!gen) return Response.json({ ok: false, error: "unknown generation" }, { status: 404 });
  const category = b.category || String(gen.category || "general");

  let critique: Record<string, unknown> | null = null;
  try {
    const text = await runVision(env, CRITIQUE_VISION_SYSTEM, buildCritiqueUserContent(b.prompt, b.commandCount || 0), [b.image], 800, VISION_CRITIC_MODEL);
    critique = extractJson<Record<string, unknown>>(text);
  } catch {
    /* best-effort */
  }
  if (!critique) return Response.json({ ok: false }, { status: 200 });

  const score = Number(critique.aestheticScore);
  await recordLesson(env, {
    id: crypto.randomUUID(), generationId: b.generationId, category,
    difficultElement: (critique.difficultElement as string) ?? null,
    whyDifficult: (critique.whyDifficult as string) ?? null,
    commonErrors: (critique.commonErrors as string) ?? null,
    cuesAndStrategies: (critique.cuesAndStrategies as string) ?? null,
    whatWorked: critique.whatWorked, whatDidnt: critique.whatDidnt,
    wishIKnew: (critique.wishIKnew as string) ?? null, doDifferently: (critique.doDifferently as string) ?? null,
    toolsNeeded: critique.toolsNeeded, aestheticScore: Number.isFinite(score) ? score : null, sawImage: true,
  }).catch(() => {});
  await updateGenerationFinal(env, b.generationId, {
    passCount: b.passCount, aestheticScore: Number.isFinite(score) ? score : null, critique: JSON.stringify(critique),
  }).catch(() => {});
  await recordEvent(env, { generationId: b.generationId, seq: 9999, phase: "critique", type: "vision_critique", data: critique }).catch(() => {});

  return Response.json({ ok: true, critique });
};
