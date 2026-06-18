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

export interface ModelInfo {
  id: string;
  label: string;
  vendor: string;
  inPrice: number; // $ / M input tokens
  outPrice: number; // $ / M output tokens
  perDrawing: string; // estimated $ per drawing
  note: string;
  recommended?: boolean;
}

// Estimated tokens per drawing for the perDrawing figure.
const IN_TOK = 1500;
const OUT_TOK = 2500;
export function estPerDrawing(inPrice: number, outPrice: number): string {
  const usd = (IN_TOK / 1e6) * inPrice + (OUT_TOK / 1e6) * outPrice;
  return `$${usd.toFixed(4)}`;
}

export const MODEL_CATALOG: ModelInfo[] = [
  {
    id: "@cf/meta/llama-3.1-8b-instruct-fp8-fast",
    label: "Llama 3.1 8B (fp8, fast)",
    vendor: "Meta",
    inPrice: 0.045,
    outPrice: 0.384,
    perDrawing: estPerDrawing(0.045, 0.384),
    note: "Cheapest fast option. Good for simple sketches; weakest at strict JSON.",
  },
  {
    id: "@cf/meta/llama-3.2-3b-instruct",
    label: "Llama 3.2 3B",
    vendor: "Meta",
    inPrice: 0.051,
    outPrice: 0.335,
    perDrawing: estPerDrawing(0.051, 0.335),
    note: "Tiny + cheap. Fine for basic shapes, can drift on complex prompts.",
  },
  {
    id: "@cf/qwen/qwen3-30b-a3b-fp8",
    label: "Qwen3 30B-A3B (fp8)",
    vendor: "Qwen",
    inPrice: 0.051,
    outPrice: 0.34,
    perDrawing: estPerDrawing(0.051, 0.34),
    note: "Best value: MoE with reasoning + function-calling, near-3B price. Strong, reliable JSON.",
    recommended: true,
  },
  {
    id: "@cf/meta/llama-3.1-8b-instruct-fp8",
    label: "Llama 3.1 8B (fp8)",
    vendor: "Meta",
    inPrice: 0.152,
    outPrice: 0.287,
    perDrawing: estPerDrawing(0.152, 0.287),
    note: "Balanced 8B, not deprecated. Solid general default.",
  },
  {
    id: "@cf/mistralai/mistral-small-3.1-24b-instruct",
    label: "Mistral Small 3.1 24B",
    vendor: "Mistral",
    inPrice: 0.351,
    outPrice: 0.555,
    perDrawing: estPerDrawing(0.351, 0.555),
    note: "Mid-tier quality, instruction-following. Pricier per output.",
  },
  {
    id: "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
    label: "Llama 3.3 70B (fp8, fast)",
    vendor: "Meta",
    inPrice: 0.293,
    outPrice: 2.253,
    perDrawing: estPerDrawing(0.293, 2.253),
    note: "Most capable / best drawings. ~6x the cost of the cheap options.",
  },
];

export const RECOMMENDED_MODEL =
  MODEL_CATALOG.find((m) => m.recommended)?.id || MODEL_CATALOG[0].id;

export function isAllowedModel(id: string): boolean {
  return MODEL_CATALOG.some((m) => m.id === id);
}

export function modelInfo(id: string): ModelInfo | undefined {
  return MODEL_CATALOG.find((m) => m.id === id);
}
