/**
 * Shared binding/types for MS Paint Pages Functions.
 */

export interface Env {
  // Bindings (see wrangler.toml)
  AI?: { run: (model: string, input: Record<string, unknown>) => Promise<unknown> };
  MSPAINT_DB?: D1Database;
  MSPAINT_BUCKET?: R2Bucket;

  // Vars
  FREE_USES_LIMIT?: string;
  CF_TEXT_MODEL?: string;

  // Secrets
  ADMIN_TOKEN?: string;
  IDENTITY_SALT?: string;
  ANTHROPIC_API_KEY?: string;
  PEXELS_API_KEY?: string;
}

export const DEFAULT_FREE_LIMIT = 5;
export const DEFAULT_CF_MODEL = "@cf/meta/llama-3.1-8b-instruct";

export function freeLimit(env: Env): number {
  const n = parseInt(env.FREE_USES_LIMIT || "", 10);
  return Number.isFinite(n) && n >= 0 ? n : DEFAULT_FREE_LIMIT;
}
