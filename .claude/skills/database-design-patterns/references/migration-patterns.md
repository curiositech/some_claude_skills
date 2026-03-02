# Migration Patterns Reference

## Expand-Contract Pattern

The fundamental pattern for zero-downtime schema changes. Every breaking change goes through three phases: expand (add new), migrate (backfill), contract (remove old).

### Phase 1 — Expand

Add the new structure. The old structure still exists and the application still writes to it. Both old and new must be valid at this point.

```sql
-- Example: rename column users.full_name to users.display_name

-- Phase 1: add new column, make it nullable (no default required)
ALTER TABLE users ADD COLUMN display_name TEXT;
```

### Phase 2 — Dual-Write (Application Deploy)

Deploy application code that writes to both old and new column. Reads still use the old column.

```sql
-- Backfill existing rows: chunk it to avoid long locks
DO $$
DECLARE
  batch_size INT := 10000;
  last_id BIGINT := 0;
  max_id BIGINT;
BEGIN
  SELECT MAX(id) INTO max_id FROM users;
  WHILE last_id < max_id LOOP
    UPDATE users
    SET display_name = full_name
    WHERE id > last_id AND id <= last_id + batch_size
      AND display_name IS NULL;
    last_id := last_id + batch_size;
    PERFORM pg_sleep(0.01);  -- brief pause to reduce lock contention
  END LOOP;
END $$;
```

### Phase 2b — Cutover (Application Deploy)

Deploy application code that reads from the new column. Still writes to both.

### Phase 3 — Contract (Application Deploy + Migration)

Deploy application code that reads and writes only to the new column. Then drop the old.

```sql
-- Phase 3: safe to drop old column now
ALTER TABLE users DROP COLUMN full_name;
```

---

## Backward-Compatible Changes (Safe, Single Migration)

These changes do not require expand-contract:

| Change | Safe? | Notes |
|--------|-------|-------|
| Add nullable column | Yes | No default = no table rewrite |
| Add column with constant default | Yes (Postgres 11+) | Postgres 11+ stores default in catalog, no rewrite |
| Add column with dynamic default | No | Causes table rewrite |
| Add index (CONCURRENTLY) | Yes | Non-blocking |
| Add constraint (NOT VALID) | Yes | Validates existing rows later |
| Increase varchar length | Yes | No rewrite |
| Drop column (mark unused first) | Careful | App must stop referencing it |
| Rename column | No | Breaking — use expand-contract |
| Change column type | No | Breaking — use expand-contract |
| Drop NOT NULL | Yes | |
| Add NOT NULL | No | Requires backfill + constraint |

---

## Adding NOT NULL Without Downtime

Adding `NOT NULL` to an existing column requires all existing rows to have a non-null value. The naive `ALTER TABLE ... SET NOT NULL` locks the table while it validates every row.

```sql
-- Step 1: Add column as nullable, backfill, then add constraint as NOT VALID
ALTER TABLE orders ADD COLUMN confirmed_at TIMESTAMPTZ;

-- Step 2: backfill (chunked)
UPDATE orders SET confirmed_at = created_at WHERE confirmed_at IS NULL;

-- Step 3: Add NOT NULL constraint as NOT VALID (skips existing row validation)
ALTER TABLE orders ADD CONSTRAINT orders_confirmed_at_not_null
  CHECK (confirmed_at IS NOT NULL) NOT VALID;

-- Step 4: Validate constraint in background (ShareUpdateExclusiveLock, non-blocking)
ALTER TABLE orders VALIDATE CONSTRAINT orders_confirmed_at_not_null;

-- Step 5: (Optional) Convert to true NOT NULL — only safe after validation
ALTER TABLE orders ALTER COLUMN confirmed_at SET NOT NULL;
ALTER TABLE orders DROP CONSTRAINT orders_confirmed_at_not_null;
```

---

## Lock Timeout Settings

Always set a lock timeout before DDL statements in production migrations. Without it, a migration waiting for a lock can block all reads and writes on the table indefinitely.

```sql
-- Set per-session lock timeout before each DDL statement
SET lock_timeout = '5s';
SET statement_timeout = '30s';

-- The migration will fail fast if it can't acquire a lock in 5 seconds
-- Retry later when the blocking query completes
ALTER TABLE orders ADD COLUMN status TEXT;
```

**Retry strategy**: If a migration fails due to lock timeout, wait for the blocking query (visible in `pg_stat_activity`) to complete and retry. Do not increase the timeout to avoid blocking the table longer.

---

## Index Migration Safety

```sql
-- Always use CONCURRENTLY for new indexes on live tables
-- CONCURRENTLY takes 2-3x longer but does not block reads or writes
CREATE INDEX CONCURRENTLY idx_orders_status ON orders (status);

-- If CONCURRENTLY fails partway through, the index is left as INVALID
-- Find invalid indexes:
SELECT indexname, tablename FROM pg_indexes
JOIN pg_class ON pg_class.relname = indexname
WHERE pg_class.relkind = 'i'
  AND NOT EXISTS (
    SELECT 1 FROM pg_index WHERE pg_index.indexrelid = pg_class.oid
      AND pg_index.indisvalid
  );

-- Drop the invalid index and recreate
DROP INDEX CONCURRENTLY idx_orders_status;
CREATE INDEX CONCURRENTLY idx_orders_status ON orders (status);
```

---

## Migration File Organization

```
migrations/
├── 0001_create_users.sql
├── 0002_create_orders.sql
├── 0003_add_status_to_orders.sql      # expand phase
├── 0004_backfill_order_status.sql     # data migration
└── 0005_drop_old_status_column.sql    # contract phase (deploy after app)
```

**Convention**: Separate structural changes (DDL) from data migrations (DML). Run structural migrations at deploy time. Run data migrations as background jobs or chunked scripts when the table is large.

---

## Rollback Strategies

Not all migrations are trivially reversible. Plan rollback before executing forward.

| Migration Type | Rollback Strategy |
|----------------|------------------|
| Add column | `ALTER TABLE DROP COLUMN` |
| Add index | `DROP INDEX CONCURRENTLY` |
| Add constraint NOT VALID | `DROP CONSTRAINT` |
| Rename column (expand phase) | Drop new column — old still exists |
| Drop column | Restore from backup — plan before executing |
| Data backfill | Re-run inverse transformation on affected rows |

**Rule**: Never drop a column in the same deploy window as the application code change that stops using it. Wait one deploy cycle to confirm the old column is unused, then drop it in a follow-up migration. This gives you a clean rollback path if the deploy goes wrong.

---

## Testing Migrations

```bash
# Test migration against a clone of production data
pg_dump $PROD_URL | psql $TEST_URL
psql $TEST_URL -f migrations/0042_new_change.sql

# Time the migration — if it takes > 1s, it may cause issues in production
time psql $TEST_URL -f migrations/0042_new_change.sql

# Check for lock contention by running under load
# Use pgbench to simulate concurrent queries while migration runs
pgbench -T 30 -c 50 $TEST_URL &
psql $TEST_URL -f migrations/0042_new_change.sql
```
