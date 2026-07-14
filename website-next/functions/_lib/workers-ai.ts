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

/** A model's answer split into its visible output and its reasoning trace. */
export interface ModelResult {
  /** The answer text with any reasoning trace removed (safe to JSON-parse). */
  text: string;
  /** The concurrent chain-of-thought, if the model emitted one. */
  reasoning: string | null;
}

/**
 * Separate a reasoning model's chain-of-thought from its answer.
 *
 * Reasoning models (qwen3, QwQ, gpt-oss) emit their thinking inline as
 * <think>…</think> before the JSON. Left in place it (a) wastes the shared
 * token budget and truncates the command list, and (b) breaks the greedy
 * extractJson match. We pull it OUT here so the answer parses cleanly AND so
 * the trace can be fed to the reflection pass instead of being discarded.
 */
export function splitReasoning(raw: string): { text: string; reasoning: string | null } {
  const TAG = /<think(?:ing)?>([\s\S]*?)<\/think(?:ing)?>/gi;
  const blocks = [...raw.matchAll(TAG)].map((m) => m[1].trim()).filter(Boolean);
  if (blocks.length) {
    return { text: raw.replace(TAG, "").trim(), reasoning: blocks.join("\n\n") || null };
  }
  // Truncated trace: an opening <think> with no closing tag (budget ran out
  // mid-thought). Treat everything after it as reasoning, keep prior text.
  const open = raw.search(/<think(?:ing)?>/i);
  if (open !== -1) {
    const before = raw.slice(0, open).trim();
    const after = raw.slice(open).replace(/<\/?think(?:ing)?>/gi, "").trim();
    return { text: before, reasoning: after || null };
  }
  return { text: raw, reasoning: null };
}

/** Pull a dedicated reasoning field out of a Workers AI response, if present. */
function extractModelReasoning(out: unknown): string | null {
  if (!out || typeof out !== "object") return null;
  const o = out as Record<string, unknown>;
  // Chat models that expose reasoning separately.
  for (const key of ["reasoning_content", "reasoning"]) {
    const v = o[key];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  // Responses API: output items of type "reasoning".
  if (Array.isArray(o.output)) {
    const parts: string[] = [];
    for (const item of o.output as Array<Record<string, unknown>>) {
      if (item?.type !== "reasoning") continue;
      const c = (item.content ?? item.summary) as unknown;
      if (Array.isArray(c)) {
        for (const x of c as Array<Record<string, unknown>>) {
          if (typeof x?.text === "string") parts.push(x.text);
        }
      } else if (typeof item.text === "string") {
        parts.push(item.text as string);
      }
    }
    if (parts.length) return parts.join("\n").trim();
  }
  return null;
}

/** Combine a dedicated reasoning field and any inline <think> trace. */
function unpack(out: unknown): ModelResult {
  const fieldReasoning = extractModelReasoning(out);
  const { text, reasoning: inlineReasoning } = splitReasoning(extractModelText(out));
  if (!text) {
    // Diagnostic: an empty answer usually means a new model's response envelope
    // isn't recognized above, or the inference timed out upstream. Log the raw
    // shape so the next model onboarding isn't a mystery.
    console.log("[mspaint] empty model response envelope:", JSON.stringify(out)?.slice(0, 500));
  }
  return { text, reasoning: fieldReasoning || inlineReasoning };
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

/**
 * Cheap, fixed model for utility passes (classification, reflection).
 * Must be a NON-reasoning instruct model that emits strict JSON reliably:
 * these passes parse the output directly, so a model that wraps answers in a
 * reasoning trace (or fumbles JSON) silently drops classifications/lessons.
 */
export const UTILITY_MODEL = "@cf/meta/llama-3.1-8b-instruct-fp8";

/**
 * Run a text model, returning BOTH the answer (reasoning stripped) and the
 * reasoning trace. Use this when you want to keep the chain-of-thought.
 */
export async function runTextRich(
  env: Env,
  system: string,
  user: string,
  maxTokens = 4096,
  model?: string
): Promise<ModelResult> {
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
  return unpack(await env.AI.run(id, input));
}

/** Run a text model with a system + user message. Returns answer text only. */
export async function runText(
  env: Env,
  system: string,
  user: string,
  maxTokens = 4096,
  model?: string
): Promise<string> {
  return (await runTextRich(env, system, user, maxTokens, model)).text;
}

/**
 * Run a vision-capable chat model with one or more images (data URLs) plus
 * text. Uses the OpenAI-style multimodal content array supported by Workers AI
 * multimodal chat models (Kimi K2.7, Llama 4 Scout).
 */
export async function runVisionRich(
  env: Env,
  system: string,
  user: string,
  images: string[],
  maxTokens = 4096,
  model?: string
): Promise<ModelResult> {
  if (!env.AI) throw new Error("Workers AI binding (AI) not configured");
  const id = model || cfModel(env);
  const content: Array<Record<string, unknown>> = [{ type: "text", text: user }];
  for (const url of images) {
    if (url) content.push({ type: "image_url", image_url: { url } });
  }
  return unpack(
    await env.AI.run(id, {
      messages: [
        { role: "system", content: system },
        { role: "user", content },
      ],
      max_tokens: maxTokens,
    })
  );
}

/** Vision variant of {@link runText}. Returns answer text only. */
export async function runVision(
  env: Env,
  system: string,
  user: string,
  images: string[],
  maxTokens = 4096,
  model?: string
): Promise<string> {
  return (await runVisionRich(env, system, user, images, maxTokens, model)).text;
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
