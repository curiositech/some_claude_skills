/**
 * D1 access layer: anonymous-user quota, generation logging, and the
 * expertise-accrual store (lessons = Cognitive Demands Table + Knowledge Audit).
 */

import type { Env } from "./env";
import { freeLimit } from "./env";
import type { Identity } from "./identity";

export interface QuotaState {
  used: number;
  limit: number;
  remaining: number;
  exceeded: boolean;
}

function nowIso(): string {
  return new Date().toISOString();
}

/** Read a config value (returns null if absent or no DB). */
export async function getConfig(env: Env, key: string): Promise<string | null> {
  if (!env.MSPAINT_DB) return null;
  const row = await env.MSPAINT_DB.prepare("SELECT value FROM config WHERE key = ?")
    .bind(key)
    .first<{ value: string }>();
  return row ? row.value : null;
}

/** Upsert a config value. */
export async function setConfig(env: Env, key: string, value: string): Promise<void> {
  if (!env.MSPAINT_DB) return;
  await env.MSPAINT_DB.prepare(
    `INSERT INTO config (key, value, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
  )
    .bind(key, value, nowIso())
    .run();
}

export const CONFIG_MODEL_KEY = "cf_text_model";

/**
 * Find-or-create the user row, keyed primarily on the cookie UUID but
 * reconciled against the IP/UA hash so a fresh cookie can't reset the count
 * if we've recently seen the same device. Returns the merged quota state.
 */
export async function getOrCreateUser(
  env: Env,
  id: Identity
): Promise<{ userId: string; quota: QuotaState }> {
  const db = env.MSPAINT_DB!;
  const limit = freeLimit(env);
  const ts = nowIso();

  // Try the cookie first.
  let row = await db
    .prepare("SELECT * FROM users WHERE id = ?")
    .bind(id.cookieUuid)
    .first<Record<string, unknown>>();

  // Fall back to the strongest IP/UA match (most uses) if no cookie row.
  if (!row) {
    row = await db
      .prepare(
        "SELECT * FROM users WHERE ip_ua_hash = ? ORDER BY free_uses_used DESC LIMIT 1"
      )
      .bind(id.ipUaHash)
      .first<Record<string, unknown>>();
  }

  if (!row) {
    await db
      .prepare(
        `INSERT INTO users (id, cookie_uuid, ip_ua_hash, free_uses_used, total_uses, first_seen, last_seen, country, user_agent)
         VALUES (?, ?, ?, 0, 0, ?, ?, ?, ?)`
      )
      .bind(id.cookieUuid, id.cookieUuid, id.ipUaHash, ts, ts, id.country, id.userAgent)
      .run();
    return {
      userId: id.cookieUuid,
      quota: { used: 0, limit, remaining: limit, exceeded: false },
    };
  }

  const userId = String(row.id);
  const used = Number(row.free_uses_used) || 0;
  await db
    .prepare("UPDATE users SET last_seen = ?, ip_ua_hash = ?, country = ? WHERE id = ?")
    .bind(ts, id.ipUaHash, id.country, userId)
    .run();

  const remaining = Math.max(0, limit - used);
  return {
    userId,
    quota: { used, limit, remaining, exceeded: remaining <= 0 },
  };
}

/** Read-only quota lookup for the usage endpoint. */
export async function readQuota(env: Env, id: Identity): Promise<QuotaState> {
  const db = env.MSPAINT_DB!;
  const limit = freeLimit(env);
  const row =
    (await db
      .prepare("SELECT free_uses_used FROM users WHERE id = ?")
      .bind(id.cookieUuid)
      .first<{ free_uses_used: number }>()) ||
    (await db
      .prepare(
        "SELECT free_uses_used FROM users WHERE ip_ua_hash = ? ORDER BY free_uses_used DESC LIMIT 1"
      )
      .bind(id.ipUaHash)
      .first<{ free_uses_used: number }>());

  const used = row ? Number(row.free_uses_used) || 0 : 0;
  const remaining = Math.max(0, limit - used);
  return { used, limit, remaining, exceeded: remaining <= 0 };
}

/** Increment the free-use counter (only called for the free CF path). */
export async function consumeFreeUse(env: Env, userId: string): Promise<void> {
  await env
    .MSPAINT_DB!.prepare(
      "UPDATE users SET free_uses_used = free_uses_used + 1, total_uses = total_uses + 1 WHERE id = ?"
    )
    .bind(userId)
    .run();
}

/** Bump only total_uses (for unlimited bring-your-own-key generations). */
export async function bumpTotal(env: Env, userId: string): Promise<void> {
  await env
    .MSPAINT_DB!.prepare("UPDATE users SET total_uses = total_uses + 1 WHERE id = ?")
    .bind(userId)
    .run();
}

export interface GenerationRecord {
  id: string;
  userId: string;
  identity: Identity;
  provider: string;
  model: string;
  prompt: string;
  category?: string | null;
  subcategories?: unknown;
  recommendedTools?: unknown;
  referenceQuery?: string | null;
  thinking?: string | null;
  plan?: unknown;
  description?: string | null;
  commands?: unknown;
  commandCount?: number;
  canvasBeforeKey?: string | null;
  canvasAfterKey?: string | null;
  usageTokens?: unknown;
  latencyMs?: number;
  status: string;
  error?: string | null;
}

const j = (v: unknown): string | null =>
  v === undefined || v === null ? null : JSON.stringify(v);

export async function recordGeneration(env: Env, r: GenerationRecord): Promise<void> {
  await env
    .MSPAINT_DB!.prepare(
      `INSERT INTO generations (
        id, created_at, user_id, cookie_uuid, ip_ua_hash, country, user_agent,
        provider, model, prompt, category, subcategories, recommended_tools,
        reference_query, thinking, plan, description, commands, command_count,
        canvas_before_key, canvas_after_key, usage_tokens, latency_ms, status, error
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    )
    .bind(
      r.id,
      nowIso(),
      r.userId,
      r.identity.cookieUuid,
      r.identity.ipUaHash,
      r.identity.country,
      r.identity.userAgent,
      r.provider,
      r.model,
      r.prompt,
      r.category ?? null,
      j(r.subcategories),
      j(r.recommendedTools),
      r.referenceQuery ?? null,
      r.thinking ?? null,
      j(r.plan),
      r.description ?? null,
      j(r.commands),
      r.commandCount ?? null,
      r.canvasBeforeKey ?? null,
      r.canvasAfterKey ?? null,
      j(r.usageTokens),
      r.latencyMs ?? null,
      r.status,
      r.error ?? null
    )
    .run();
}

export interface LessonRecord {
  id: string;
  generationId: string;
  category?: string | null;
  subcategories?: unknown;
  difficultElement?: string | null;
  whyDifficult?: string | null;
  commonErrors?: string | null;
  cuesAndStrategies?: string | null;
  whatWorked?: unknown;
  whatDidnt?: unknown;
  wishIKnew?: string | null;
  doDifferently?: string | null;
  toolsNeeded?: unknown;
  aestheticScore?: number | null;
}

export async function recordLesson(env: Env, l: LessonRecord): Promise<void> {
  await env
    .MSPAINT_DB!.prepare(
      `INSERT INTO lessons (
        id, generation_id, created_at, category, subcategories,
        difficult_element, why_difficult, common_errors, cues_and_strategies,
        what_worked, what_didnt, wish_i_knew, do_differently, tools_needed,
        aesthetic_score, helpfulness
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,0)`
    )
    .bind(
      l.id,
      l.generationId,
      nowIso(),
      l.category ?? null,
      j(l.subcategories),
      l.difficultElement ?? null,
      l.whyDifficult ?? null,
      l.commonErrors ?? null,
      l.cuesAndStrategies ?? null,
      j(l.whatWorked),
      j(l.whatDidnt),
      l.wishIKnew ?? null,
      l.doDifferently ?? null,
      j(l.toolsNeeded),
      l.aestheticScore ?? null
    )
    .run();
}

export interface Wisdom {
  difficultElement: string | null;
  whyDifficult: string | null;
  cuesAndStrategies: string | null;
  doDifferently: string | null;
}

/**
 * Retrieve the most useful accrued lessons for a category — this is the
 * Shadowbox feedback loop. Newest-first, lightly favouring higher helpfulness.
 */
export async function retrieveWisdom(
  env: Env,
  category: string | null,
  limit = 4
): Promise<Wisdom[]> {
  if (!env.MSPAINT_DB) return [];
  const cat = category || "general";
  const { results } = await env.MSPAINT_DB.prepare(
    `SELECT difficult_element, why_difficult, cues_and_strategies, do_differently
       FROM lessons
      WHERE category = ?
        AND (cues_and_strategies IS NOT NULL OR do_differently IS NOT NULL)
      ORDER BY helpfulness DESC, created_at DESC
      LIMIT ?`
  )
    .bind(cat, limit)
    .all<Record<string, string | null>>();

  return (results || []).map((r) => ({
    difficultElement: r.difficult_element,
    whyDifficult: r.why_difficult,
    cuesAndStrategies: r.cues_and_strategies,
    doDifferently: r.do_differently,
  }));
}
