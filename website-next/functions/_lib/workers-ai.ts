/**
 * Cloudflare Workers AI client — the free-tier drawing brain.
 * Uses a cheap Llama text model to emit paint-command JSON, keeping the
 * command/playback animation identical to the paid Anthropic path.
 */

import type { Env } from "./env";
import { extractJson } from "./cta";
import { getConfig, CONFIG_MODEL_KEY } from "./db";
import { RECOMMENDED_MODEL, isAllowedModel, modelApi } from "./models";

/** Pull assistant text out of whatever shape a Workers AI model returns. */
function extractModelText(out: unknown): string {
  if (typeof out === "string") return out;
  if (!out || typeof out !== "object") return "";
  const o = out as Record<string, unknown>;
  // Chat models: { response: "..." }
  if (typeof o.response === "string") return o.response;
  // gpt-oss / Responses API: { output_text } or { output: [{ content:[{text}] }] }
  if (typeof o.output_text === "string") return o.output_text;
  if (Array.isArray(o.output)) {
    const parts: string[] = [];
    for (const item of o.output as Array<Record<string, unknown>>) {
      const content = item?.content;
      if (Array.isArray(content)) {
        for (const c of content as Array<Record<string, unknown>>) {
          if (typeof c?.text === "string") parts.push(c.text);
        }
      } else if (typeof item?.text === "string") {
        parts.push(item.text as string);
      }
    }
    if (parts.length) return parts.join("");
  }
  // Nested { result: { response } }
  const result = o.result as Record<string, unknown> | undefined;
  if (result && typeof result.response === "string") return result.response;
  return "";
}

/** Synchronous fallback model (env var or recommended default). */
export function cfModel(env: Env): string {
  const fromEnv = env.CF_TEXT_MODEL;
  if (fromEnv && isAllowedModel(fromEnv)) return fromEnv;
  return RECOMMENDED_MODEL;
}

/**
 * The drawing model, honoring the admin's runtime selection (D1 config),
 * then the env var, then the recommended default. Validated against the catalog.
 */
export async function resolveDrawModel(env: Env): Promise<string> {
  const fromConfig = await getConfig(env, CONFIG_MODEL_KEY);
  if (fromConfig && isAllowedModel(fromConfig)) return fromConfig;
  return cfModel(env);
}

/** Cheap, fixed model for utility passes (classification, reflection). */
export const UTILITY_MODEL = RECOMMENDED_MODEL;

/** Run a text model with a system + user message. Returns raw text. */
export async function runText(
  env: Env,
  system: string,
  user: string,
  maxTokens = 4096,
  model?: string
): Promise<string> {
  if (!env.AI) throw new Error("Workers AI binding (AI) not configured");
  const id = model || cfModel(env);
  // gpt-oss uses the Responses API (instructions + input); everyone else chat.
  const input =
    modelApi(id) === "responses"
      ? { instructions: system, input: user, max_tokens: maxTokens }
      : {
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
          max_tokens: maxTokens,
        };
  const out = await env.AI.run(id, input);
  return extractModelText(out);
}

/**
 * Run a vision-capable chat model with one or more images (data URLs) plus
 * text. Uses the OpenAI-style multimodal content array supported by Workers AI
 * multimodal chat models (Kimi K2.7, Llama 4 Scout).
 */
export async function runVision(
  env: Env,
  system: string,
  user: string,
  images: string[],
  maxTokens = 4096,
  model?: string
): Promise<string> {
  if (!env.AI) throw new Error("Workers AI binding (AI) not configured");
  const id = model || cfModel(env);
  const content: Array<Record<string, unknown>> = [{ type: "text", text: user }];
  for (const url of images) {
    if (url) content.push({ type: "image_url", image_url: { url } });
  }
  const out = await env.AI.run(id, {
    messages: [
      { role: "system", content: system },
      { role: "user", content },
    ],
    max_tokens: maxTokens,
  });
  return extractModelText(out);
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
    const text = await runText(env, CLASSIFY_SYSTEM, prompt, 256, UTILITY_MODEL);
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
