-- MS Paint free-tier + expertise-accrual schema (Cloudflare D1)
-- Database: someclaudeskills-mspaint (2576030c-1019-41df-87c5-1016ef9af4cf)
--
-- Apply with:
--   npx wrangler d1 execute someclaudeskills-mspaint --remote --file=./schema.sql
--
-- Design note: the `lessons` table is deliberately shaped as a
-- Cognitive Demands Table (Militello & Hutton, ACTA) + Knowledge Audit.
-- Each completed drawing elicits one lesson; lessons are retrieved by
-- category and re-injected into future agents (a Shadowbox-style
-- expert-decision feedback loop). This is how the system accrues
-- painting expertise over time.

-- Runtime config (e.g. the admin-selected free-tier model) -----------------
CREATE TABLE IF NOT EXISTS config (
  key        TEXT PRIMARY KEY,
  value      TEXT,
  updated_at TEXT
);

-- Anonymous identity + free-tier quota -------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id              TEXT PRIMARY KEY,         -- internal id (== cookie_uuid)
  cookie_uuid     TEXT,                     -- first-party anonymous id
  ip_ua_hash      TEXT,                     -- sha256(ip + ua + salt) backup signal
  free_uses_used  INTEGER NOT NULL DEFAULT 0,
  total_uses      INTEGER NOT NULL DEFAULT 0,
  first_seen      TEXT NOT NULL,
  last_seen       TEXT NOT NULL,
  country         TEXT,
  user_agent      TEXT
);
CREATE INDEX IF NOT EXISTS idx_users_iphash ON users(ip_ua_hash);

-- Every generation ("write") -----------------------------------------------
CREATE TABLE IF NOT EXISTS generations (
  id                TEXT PRIMARY KEY,
  created_at        TEXT NOT NULL,
  user_id           TEXT,
  cookie_uuid       TEXT,
  ip_ua_hash        TEXT,
  country           TEXT,
  user_agent        TEXT,
  provider          TEXT,                   -- 'cloudflare' | 'anthropic'
  model             TEXT,
  prompt            TEXT NOT NULL,
  category          TEXT,                   -- situation assessment (ACTA)
  subcategories     TEXT,                   -- JSON
  recommended_tools TEXT,                   -- JSON
  reference_query   TEXT,
  thinking          TEXT,                   -- the agent's reasoning
  plan              TEXT,                   -- mental-simulation plan
  description       TEXT,
  commands          TEXT,                   -- JSON array of PaintCommand
  command_count     INTEGER,
  canvas_before_key TEXT,                   -- R2 key (snapshot in)
  canvas_after_key  TEXT,                   -- R2 key (rendered out)
  usage_tokens      TEXT,                   -- JSON
  latency_ms        INTEGER,
  status            TEXT,                   -- 'ok' | 'error' | 'quota_exceeded'
  error             TEXT,
  batch_id          TEXT                    -- admin soak-test batch id (nullable)
);
CREATE INDEX IF NOT EXISTS idx_gen_user ON generations(user_id);
CREATE INDEX IF NOT EXISTS idx_gen_created ON generations(created_at);
CREATE INDEX IF NOT EXISTS idx_gen_category ON generations(category);
CREATE INDEX IF NOT EXISTS idx_gen_batch ON generations(batch_id);

-- Admin batch runs (premium-model x N soak tests) --------------------------
CREATE TABLE IF NOT EXISTS batches (
  id         TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  model      TEXT,
  prompt     TEXT,
  target     INTEGER,
  completed  INTEGER NOT NULL DEFAULT 0,
  ok_count   INTEGER NOT NULL DEFAULT 0,
  fail_count INTEGER NOT NULL DEFAULT 0,
  status     TEXT
);

-- Accrued expertise: Cognitive Demands Table + Knowledge Audit -------------
CREATE TABLE IF NOT EXISTS lessons (
  id                  TEXT PRIMARY KEY,
  generation_id       TEXT,
  created_at          TEXT NOT NULL,
  category            TEXT,
  subcategories       TEXT,                 -- JSON
  difficult_element   TEXT,                 -- CDT: the cognitively hard part
  why_difficult       TEXT,                 -- CDT
  common_errors       TEXT,                 -- CDT
  cues_and_strategies TEXT,                 -- CDT: how an expert handles it
  what_worked         TEXT,                 -- JSON list (Knowledge Audit)
  what_didnt          TEXT,                 -- JSON list
  wish_i_knew         TEXT,
  do_differently      TEXT,
  tools_needed        TEXT,                 -- JSON list
  aesthetic_score     REAL,
  helpfulness         INTEGER NOT NULL DEFAULT 0   -- ranking for re-injection
);
CREATE INDEX IF NOT EXISTS idx_lessons_category ON lessons(category);
