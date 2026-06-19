/**
 * Curated Cloudflare Workers AI models for the free drawing tier.
 *
 * Prices are Cloudflare's published per-token unit pricing (USD per 1M tokens),
 * verified against https://developers.cloudflare.com/workers-ai/platform/pricing/.
 * `perDrawing` is an estimate assuming ~1.5K input + ~2.5K output tokens per
 * drawing (system prompt + injected wisdom in, command JSON out).
 *
 * Only models in this catalog can be selected from the admin tool.
 */

export type Tier = "worst" | "cheap" | "value" | "mid" | "premium" | "best";

export interface ModelInfo {
  id: string;
  label: string;
  vendor: string;
  inPrice: number; // $ / M input tokens
  outPrice: number; // $ / M output tokens
  perDrawing: string; // estimated $ per drawing
  tier: Tier;
  note: string;
  recommended?: boolean;
  /** Family schema for invocation: "messages" (chat) or "responses" (gpt-oss). */
  api?: "messages" | "responses";
  /** Can accept image input (reference photos / its own canvas). */
  vision?: boolean;
  /**
   * Emits a chain-of-thought before its answer (qwen3, QwQ, gpt-oss, Kimi).
   * Reasoning shares the output token budget, so these need a larger draw
   * budget or the command JSON gets truncated mid-array. See DRAW_MAX_TOKENS.
   */
  reasoning?: boolean;
  /** Highlight in the picker: the headline best / worst pick. */
  extreme?: "best" | "worst";
}

// Estimated tokens per drawing for the perDrawing figure.
const IN_TOK = 1500;
const OUT_TOK = 2500;
export function estPerDrawing(inPrice: number, outPrice: number): string {
  const usd = (IN_TOK / 1e6) * inPrice + (OUT_TOK / 1e6) * outPrice;
  return `$${usd.toFixed(4)}`;
}

function m(
  o: Omit<ModelInfo, "perDrawing">
): ModelInfo {
  return { ...o, perDrawing: estPerDrawing(o.inPrice, o.outPrice) };
}

export const MODEL_CATALOG: ModelInfo[] = [
  // ---- The best -----------------------------------------------------------
  m({
    id: "@cf/moonshotai/kimi-k2.7-code",
    reasoning: true,
    label: "Kimi K2.7 Code",
    vendor: "Moonshot AI",
    inPrice: 0.95,
    outPrice: 4.0,
    tier: "best",
    extreme: "best",
    vision: true,
    note: "THE BEST: frontier 1T-param MoE (32B active), 262K context, reasoning + vision + native structured JSON outputs. Most capable here; priciest output.",
  }),
  m({
    id: "@cf/openai/gpt-oss-120b",
    reasoning: true,
    label: "GPT-OSS 120B",
    vendor: "OpenAI",
    inPrice: 0.35,
    outPrice: 0.75,
    tier: "best",
    api: "responses",
    note: "Best value flagship: OpenAI open-weight, top reasoning + agentic, 128K context, function calling. Strict JSON at a fraction of Kimi's output cost.",
  }),
  m({
    id: "@cf/meta/llama-4-scout-17b-16e-instruct",
    label: "Llama 4 Scout 17B-16E",
    vendor: "Meta",
    inPrice: 0.27,
    outPrice: 0.85,
    tier: "premium",
    vision: true,
    note: "Meta flagship, multimodal MoE (16 experts), 131K context. Excellent value at the top end.",
  }),
  m({
    id: "@cf/qwen/qwq-32b",
    reasoning: true,
    label: "QwQ 32B (reasoning)",
    vendor: "Qwen",
    inPrice: 0.66,
    outPrice: 1.0,
    tier: "premium",
    note: "Dedicated reasoning model (o1-mini class). Plans carefully; slower + priciest input.",
  }),
  // ---- Value sweet spots --------------------------------------------------
  m({
    id: "@cf/openai/gpt-oss-20b",
    reasoning: true,
    label: "GPT-OSS 20B",
    vendor: "OpenAI",
    inPrice: 0.2,
    outPrice: 0.3,
    tier: "mid",
    api: "responses",
    note: "Reasoning + function calling at a fraction of 120B. Great quality-per-dollar.",
  }),
  m({
    id: "@cf/qwen/qwen3-30b-a3b-fp8",
    reasoning: true,
    label: "Qwen3 30B-A3B (fp8)",
    vendor: "Qwen",
    inPrice: 0.051,
    outPrice: 0.34,
    tier: "value",
    recommended: true,
    note: "Best value: MoE w/ reasoning + function-calling at near-3B price. Reliable JSON. Default.",
  }),
  m({
    id: "@cf/meta/llama-3.1-8b-instruct-fp8",
    label: "Llama 3.1 8B (fp8)",
    vendor: "Meta",
    inPrice: 0.152,
    outPrice: 0.287,
    tier: "cheap",
    note: "Balanced small model, not deprecated. Solid general default.",
  }),
  m({
    id: "@cf/meta/llama-3.1-8b-instruct-fp8-fast",
    label: "Llama 3.1 8B (fp8, fast)",
    vendor: "Meta",
    inPrice: 0.045,
    outPrice: 0.384,
    tier: "cheap",
    note: "Fastest cheap option. Fine for simple sketches; can fumble strict JSON.",
  }),
  // ---- The worst ----------------------------------------------------------
  m({
    id: "@cf/meta/llama-3.2-3b-instruct",
    label: "Llama 3.2 3B",
    vendor: "Meta",
    inPrice: 0.051,
    outPrice: 0.335,
    tier: "cheap",
    note: "Tiny. Basic shapes only; drifts on complex prompts.",
  }),
  m({
    id: "@cf/meta/llama-3.2-1b-instruct",
    label: "Llama 3.2 1B",
    vendor: "Meta",
    inPrice: 0.027,
    outPrice: 0.201,
    tier: "worst",
    extreme: "worst",
    note: "THE WORST (quality): cheapest model on the platform. Frequently malformed JSON & crude output — great for a baseline.",
  }),
  m({
    id: "@cf/meta/llama-2-7b-chat-fp16",
    label: "Llama 2 7B (fp16)",
    vendor: "Meta",
    inPrice: 0.556,
    outPrice: 6.667,
    tier: "worst",
    note: "WORST VALUE: ancient (deprecated) AND the most expensive output on the platform ($6.67/M). A cautionary trap.",
  }),
];

export const RECOMMENDED_MODEL =
  MODEL_CATALOG.find((mi) => mi.recommended)?.id || MODEL_CATALOG[0].id;

export function isAllowedModel(id: string): boolean {
  return MODEL_CATALOG.some((mi) => mi.id === id);
}

export function modelInfo(id: string): ModelInfo | undefined {
  return MODEL_CATALOG.find((mi) => mi.id === id);
}

export function modelApi(id: string): "messages" | "responses" {
  return modelInfo(id)?.api || "messages";
}

export function hasVision(id: string): boolean {
  return !!modelInfo(id)?.vision;
}

export function hasReasoning(id: string): boolean {
  return !!modelInfo(id)?.reasoning;
}

/** Output-token budget for a draw call. Reasoning models burn much of the
 *  budget on their chain-of-thought before the JSON, so they get more room —
 *  otherwise the command array is truncated mid-stream and fails to parse. */
export const DRAW_MAX_TOKENS = 4096;
export const DRAW_MAX_TOKENS_REASONING = 12000;
export function drawBudget(id: string): number {
  return hasReasoning(id) ? DRAW_MAX_TOKENS_REASONING : DRAW_MAX_TOKENS;
}

/** Cheapest capable vision model — used as the "critic" that sees renders. */
export const VISION_CRITIC_MODEL = "@cf/meta/llama-4-scout-17b-16e-instruct";
