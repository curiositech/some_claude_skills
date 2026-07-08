/**
 * POST /api/mspaint/continue — agent "another turn" / look-as-you-go for the
 * public free tier. Gated by the admin `iterative` flag. The client renders the
 * canvas so far and sends it; a vision model sees it and returns more commands.
 * Continuation passes don't consume an extra free use (same drawing).
 */

import type { Env } from "../../_lib/env";
import { getFlags, retrieveWisdom, recordEvent } from "../../_lib/db";
import { resolveDrawModel, runVision } from "../../_lib/workers-ai";
import { hasVision, drawBudget } from "../../_lib/models";
import { buildContinuePrompt, buildContinueUserContent, extractJson } from "../../_lib/cta";

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  if (!env.AI) return Response.json({ ok: false, error: "AI not configured" }, { status: 200 });

  const flags = await getFlags(env);
  if (!flags.iterative) return Response.json({ ok: false, disabled: true }, { status: 200 });

  const b = (await request.json()) as {
    generationId?: string; prompt?: string; category?: string; pass?: number; currentImage?: string;
  };
  if (!b.generationId || !b.prompt || !b.currentImage) {
    return Response.json({ ok: false, error: "generationId, prompt, currentImage required" }, { status: 400 });
  }
  const pass = Math.max(1, Number(b.pass) || 1);
  if (pass >= flags.maxTurns) return Response.json({ ok: false, maxedOut: true }, { status: 200 });

  const model = await resolveDrawModel(env);
  if (!hasVision(model)) return Response.json({ ok: false, noVision: true }, { status: 200 });

  const wisdom = await retrieveWisdom(env, b.category || "general", 4);
  await recordEvent(env, { generationId: b.generationId, seq: 10 * pass, phase: "look", type: "own_canvas", data: { pass } }).catch(() => {});

  let ok = true, needsAnotherTurn = false;
  let commands: unknown[] = [];
  try {
    const text = await runVision(env, buildContinuePrompt(wisdom), buildContinueUserContent(b.prompt, pass), [b.currentImage], drawBudget(model), model);
    const p = extractJson<{ commands?: unknown[]; needsAnotherTurn?: boolean }>(text);
    if (p && Array.isArray(p.commands)) {
      commands = p.commands;
      needsAnotherTurn = !!p.needsAnotherTurn;
    } else ok = false;
  } catch {
    ok = false;
  }
  await recordEvent(env, { generationId: b.generationId, seq: 10 * pass + 1, phase: "draw", type: "commands", data: { pass, commandCount: commands.length, commands, needsAnotherTurn } }).catch(() => {});

  return Response.json({ ok, commands, needsAnotherTurn, pass });
};
