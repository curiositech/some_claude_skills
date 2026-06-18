/**
 * Cloudflare Workers AI client — the free-tier drawing brain.
 * Uses a cheap Llama text model to emit paint-command JSON, keeping the
 * command/playback animation identical to the paid Anthropic path.
 */

import type { Env } from "./env";
import { DEFAULT_CF_MODEL } from "./env";
import { extractJson } from "./cta";

interface CfTextResult {
  response?: string;
}

export function cfModel(env: Env): string {
  return env.CF_TEXT_MODEL || DEFAULT_CF_MODEL;
}

/** Run a text model with a system + user message. Returns raw text. */
export async function runText(
  env: Env,
  system: string,
  user: string,
  maxTokens = 4096
): Promise<string> {
  if (!env.AI) throw new Error("Workers AI binding (AI) not configured");
  const out = (await env.AI.run(cfModel(env), {
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    max_tokens: maxTokens,
  })) as CfTextResult;
  return out.response || "";
}

export interface Classification {
  category: string;
  subcategories: string[];
  tools: string[];
}

const CLASSIFY_SYSTEM = `You analyze MS Paint drawing prompts. Return ONLY JSON:
{"category":"one of: characters, animals, landscape, architecture, objects, vehicles, text_art, abstract, scene","subcategories":["1-3 compositional aspects"],"tools":["3-5 of: pencil,brush,airbrush,fill,line,curve,rectangle,ellipse,polygon,roundedRectangle,text,gradient"]}`;

/** Situation assessment (ACTA pattern recognition). Degrades gracefully. */
export async function classifyPrompt(env: Env, prompt: string): Promise<Classification> {
  const fallback: Classification = { category: "general", subcategories: [], tools: [] };
  try {
    const text = await runText(env, CLASSIFY_SYSTEM, prompt, 256);
    const parsed = extractJson<Partial<Classification>>(text);
    if (!parsed) return fallback;
    return {
      category: parsed.category || "general",
      subcategories: Array.isArray(parsed.subcategories) ? parsed.subcategories : [],
      tools: Array.isArray(parsed.tools) ? parsed.tools : [],
    };
  } catch {
    return fallback;
  }
}
