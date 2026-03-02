# Indexing Strategies Reference

## Index Type Selection

### B-tree (Default)

The correct choice for 95% of indexes. Supports equality (`=`), range (`<`, `>`, `BETWEEN`), pattern prefix (`LIKE 'foo%'`), and `IS NULL` queries. Supports `ORDER BY` without a sort step.

```sql
-- Standard B-tree
CREATE INDEX CONCURRENTLY idx_orders_user_id ON orders (user_id);

-- Composite B-tree: leftmost columns can satisfy partial queries
-- This index serves: WHERE user_id = ? AND status = ?
-- Also serves:       WHERE user_id = ? (leftmost prefix only)
-- Does NOT serve:    WHERE status = ? (skips leftmost column)
CREATE INDEX CONCURRENTLY idx_orders_user_status ON orders (user_id, status);

-- With sort direction for ORDER BY optimization
CREATE INDEX CONCURRENTLY idx_orders_created_desc ON orders (created_at DESC);
```

**Column ordering in composite indexes**: Most selective column first is a heuristic, but the actual rule is to match your query's WHERE clause. If you always filter by `user_id` and sometimes also by `status`, put `user_id` first.

### Hash

Only supports equality (`=`). Never use in PostgreSQL for new indexes. B-tree is equally fast for equality lookups and additionally supports range queries. Hash indexes were not WAL-logged before PostgreSQL 10 (2017) and are still not useful in practice.

### GIN (Generalized Inverted Index)

For multi-valued data where you need to check containment or overlap:
- Full-text search (`tsvector`)
- JSONB containment (`@>`, `?`, `?|`, `?&`)
- Array containment (`@>`, `&&`)
- Range type overlap

```sql
-- Full-text search
CREATE INDEX CONCURRENTLY idx_articles_search ON articles
USING GIN (to_tsvector('english', title || ' ' || body));

-- JSONB containment queries
CREATE INDEX CONCURRENTLY idx_products_metadata ON products
USING GIN (metadata jsonb_path_ops);  -- jsonb_path_ops is smaller, faster for @> queries

-- Array column
CREATE INDEX CONCURRENTLY idx_posts_tags ON posts
USING GIN (tags);
```

**GIN vs. GiST for full-text**: GIN is faster to query; GiST is faster to build and smaller. For text search on a table that doesn't update frequently, prefer GIN.

### GiST (Generalized Search Tree)

For geometric types and specialized data structures:
- PostGIS geometry columns
- Range types with overlap queries
- `ltree` hierarchical data
- `tsvector` (slower to query than GIN, faster to update)

```sql
-- PostGIS spatial index
CREATE INDEX CONCURRENTLY idx_locations_geom ON locations
USING GiST (geom);

-- Range type: find rows whose date range overlaps a given range
CREATE INDEX CONCURRENTLY idx_bookings_dates ON bookings
USING GiST (date_range);
```

---

## Partial Indexes

Index only the rows you actually query. This is one of the highest-leverage optimizations available.

```sql
-- Only index pending orders (status = 'pending' is a hot query path)
-- Table might have 10M rows; only 50K are pending — index is tiny and fast
CREATE INDEX CONCURRENTLY idx_orders_pending_created ON orders (created_at DESC)
WHERE status = 'pending';

-- Index non-deleted rows for soft-delete pattern
CREATE INDEX CONCURRENTLY idx_users_email_active ON users (email)
WHERE deleted_at IS NULL;

-- Partial unique constraint: allow multiple deleted rows with same email
CREATE UNIQUE INDEX idx_users_email_unique_active ON users (email)
WHERE deleted_at IS NULL;
```

**When to use**: When a large fraction of rows are systematically excluded from most queries (status filters, soft deletes, boolean flags). A partial index with WHERE is always smaller and faster than a full index on the same column.

---

## Covering Indexes (INCLUDE Clause)

Include additional columns in the index leaf nodes so the query engine never needs to visit the heap. Enables index-only scans.

```sql
-- Query: SELECT name, email FROM users WHERE user_id = ?
-- Without covering index: look up user_id in index, then fetch heap page
-- With covering index: look up user_id, get name and email directly from index
CREATE INDEX CONCURRENTLY idx_users_id_covering ON users (user_id)
INCLUDE (name, email);

-- For range queries that select a few columns
CREATE INDEX CONCURRENTLY idx_orders_user_created_covering ON orders (user_id, created_at DESC)
INCLUDE (status, total_amount);
```

**Prerequisites for index-only scan**:
1. The index covers all columns referenced in SELECT and WHERE
2. The visibility map shows the page is all-visible (vacuumed recently)
3. No concurrent writes happening on those rows

Check if an index-only scan is happening with `EXPLAIN ANALYZE` — look for "Index Only Scan" in the plan. If you see "Heap Fetches: N" where N is high, the visibility map is stale; run `VACUUM` to fix.

---

## Multi-Column Index Column Ordering

The rule that overrides all heuristics: **put equality columns before range columns**.

The index is structured as a sorted tree. A range condition on column 1 breaks the sequential access pattern for column 2.

```sql
-- Query: WHERE user_id = 5 AND created_at > '2024-01-01'
-- Good: equality column (user_id) first, range column (created_at) second
CREATE INDEX ON orders (user_id, created_at);

-- Bad: range column first — can only use user_id after scanning the whole date range
CREATE INDEX ON orders (created_at, user_id);  -- wrong order for this query

-- Query: WHERE status = 'active' AND score > 80 AND user_id = 5
-- user_id is equality, status is equality, score is range
-- Correct: put both equality columns before the range
CREATE INDEX ON records (user_id, status, score);
```

---

## Expression Indexes

Index a computed value instead of a raw column.

```sql
-- Case-insensitive email lookup
CREATE INDEX CONCURRENTLY idx_users_email_lower ON users (LOWER(email));
-- Query must use LOWER() to hit the index:
SELECT * FROM users WHERE LOWER(email) = 'user@example.com';

-- JSONB property extraction
CREATE INDEX CONCURRENTLY idx_events_type ON events ((payload->>'event_type'));

-- Extracted date for date-only queries on a timestamp column
CREATE INDEX CONCURRENTLY idx_orders_date ON orders (DATE(created_at));
```

---

## Index Maintenance

```sql
-- Create without locking writes (preferred for production)
CREATE INDEX CONCURRENTLY idx_name ON table_name (column);

-- Check index size and usage
SELECT
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size,
  idx_scan AS times_used,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE tablename = 'orders'
ORDER BY idx_scan DESC;

-- Find unused indexes (no scans since last stats reset)
SELECT indexname, tablename, pg_size_pretty(pg_relation_size(indexrelid)) AS size
FROM pg_stat_user_indexes
WHERE idx_scan = 0 AND indexrelname NOT LIKE 'pg_%'
ORDER BY pg_relation_size(indexrelid) DESC;

-- Rebuild bloated index without locking
REINDEX INDEX CONCURRENTLY idx_orders_user_id;
```

**Over-indexing warning**: Every index adds write overhead (INSERT, UPDATE, DELETE must update each index). Drop indexes that have `idx_scan = 0` after a representative sample period (at least a week of normal traffic). Keep all indexes needed for constraint enforcement (UNIQUE, PK).
