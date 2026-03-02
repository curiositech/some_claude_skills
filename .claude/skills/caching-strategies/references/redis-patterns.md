# Redis Caching Patterns Reference

Consult this file for Redis-specific implementation patterns: data structures, atomic operations, pub/sub invalidation, key management, and pipeline optimization.

---

## Key Naming Conventions

```
{service}:{entity}:{id}:{field?}

Examples:
  user:profile:u_123
  user:permissions:u_123
  product:detail:p_456
  product:list:category:electronics:page:1
  session:tok_abc123
  rate_limit:ip:192.168.1.1
  lock:job:email-batch:u_123
```

Always prefix with a namespace. Enables:
- Pattern-based deletion with SCAN
- Memory analysis per domain
- Redis Cluster routing by hash slot (prefix before `{` is ignored for slot calculation)

---

## Common Data Structure Patterns

### String: Simple cache entry

```typescript
// Set with TTL (always use TTL for cache entries)
await redis.setex(`user:profile:${id}`, 300, JSON.stringify(user));

// Conditional set — only if not exists (used for locks and idempotency)
const lockSet = await redis.set(`lock:${key}`, clientId, 'NX', 'PX', 5000);

// Get and refresh TTL in one call (sliding expiry)
const pipeline = redis.pipeline();
pipeline.get(`session:${token}`);
pipeline.expire(`session:${token}`, 3600);
const [[, value]] = await pipeline.exec();
```

### Hash: Object with partial updates

Use hashes when you need to update individual fields without fetching and re-serializing the entire object.

```typescript
// Store user as hash — fields are individually settable
await redis.hset(`user:profile:${id}`, {
  name: user.name,
  email: user.email,
  plan: user.plan,
  updatedAt: Date.now().toString(),
});
await redis.expire(`user:profile:${id}`, 3600);

// Update only the plan field — no need to fetch the full user
await redis.hset(`user:profile:${id}`, 'plan', 'enterprise');

// Get all fields
const profile = await redis.hgetall(`user:profile:${id}`);

// Get specific fields
const [name, plan] = await redis.hmget(`user:profile:${id}`, 'name', 'plan');
```

**When to use hash vs JSON string**:
- Hash: entity with many fields, frequent partial updates (user profile, config)
- JSON string: deeply nested object, always read/written atomically, needs JSON querying

### Sorted Set: Ranked lists and leaderboards

```typescript
// Add score and member (score is float, used for ranking)
await redis.zadd('leaderboard:weekly', score, userId);

// Get top 10 with scores (highest first)
const top10 = await redis.zrevrangebyscore(
  'leaderboard:weekly',
  '+inf',
  '-inf',
  'WITHSCORES',
  'LIMIT', 0, 10
);

// Get user rank (0-indexed from highest)
const rank = await redis.zrevrank('leaderboard:weekly', userId);

// Sorted set as time-ordered event log (score = timestamp ms)
await redis.zadd('events:user:u_123', Date.now(), JSON.stringify(event));

// Get events in a time range
const recentEvents = await redis.zrangebyscore(
  'events:user:u_123',
  Date.now() - 86400_000, // last 24 hours
  Date.now()
);

// Remove events older than 24 hours (sliding window)
await redis.zremrangebyscore('events:user:u_123', 0, Date.now() - 86400_000);
```

### Set: Membership and deduplication

```typescript
// Track which users have seen a feature announcement
await redis.sadd(`announcement:seen:ann_456`, userId);
await redis.expire(`announcement:seen:ann_456`, 86400 * 30); // 30 days

const hasSeen = await redis.sismember(`announcement:seen:ann_456`, userId);

// Intersection: users who are both premium AND have completed onboarding
await redis.sinterstore('eligible:campaign', 'users:premium', 'users:onboarded');
```

---

## Atomic Operations with Lua Scripts

Use Lua scripts when you need read-modify-write atomicity without explicit transactions. Lua scripts execute atomically on the Redis server — no other commands execute between script steps.

### Token Bucket Rate Limiting (Lua)

```lua
-- rate_limit.lua
-- KEYS[1] = rate limit key
-- ARGV[1] = limit (max tokens)
-- ARGV[2] = refill rate per second
-- ARGV[3] = current timestamp (ms)
-- ARGV[4] = tokens requested

local key = KEYS[1]
local limit = tonumber(ARGV[1])
local refill_rate = tonumber(ARGV[2])
local now = tonumber(ARGV[3])
local requested = tonumber(ARGV[4])

local bucket = redis.call('HMGET', key, 'tokens', 'last_refill')
local tokens = tonumber(bucket[1]) or limit
local last_refill = tonumber(bucket[2]) or now

local elapsed = math.max(0, now - last_refill) / 1000
tokens = math.min(limit, tokens + elapsed * refill_rate)

if tokens >= requested then
  tokens = tokens - requested
  redis.call('HMSET', key, 'tokens', tokens, 'last_refill', now)
  redis.call('PEXPIRE', key, math.ceil(limit / refill_rate) * 1000)
  return 1  -- allowed
else
  redis.call('HMSET', key, 'tokens', tokens, 'last_refill', now)
  return 0  -- denied
end
```

```typescript
import { readFileSync } from 'fs';
import { execFileSync } from 'child_process';

const rateLimitScript = readFileSync('./redis/rate_limit.lua', 'utf8');

async function checkRateLimit(identifier: string, limitPerSecond: number): Promise<boolean> {
  const key = `rate_limit:${identifier}`;
  const result = await redis.eval(
    rateLimitScript,
    1,               // number of KEYS arguments
    key,             // KEYS[1]
    limitPerSecond,  // ARGV[1]: max tokens
    limitPerSecond,  // ARGV[2]: refill rate
    Date.now(),      // ARGV[3]: timestamp ms
    1                // ARGV[4]: tokens requested
  );
  return result === 1;
}
```

### Atomic Cache-Aside with Lock (Lua)

Prevents stampede: acquires lock atomically if key is missing, so only one worker computes the value.

```lua
-- get_or_lock.lua
-- KEYS[1] = cache key, KEYS[2] = lock key
-- ARGV[1] = lock TTL ms, ARGV[2] = lock holder ID
-- Returns: {status, value}
--   status 1 = cache hit, value = cached data
--   status 2 = lock acquired by caller, value = false (caller must compute)
--   status 3 = lock contended, value = false (caller should wait and retry)

local cached = redis.call('GET', KEYS[1])
if cached then
  return {1, cached}
end

local acquired = redis.call('SET', KEYS[2], ARGV[2], 'NX', 'PX', ARGV[1])
if acquired then
  return {2, false}
else
  return {3, false}
end
```

---

## Pub/Sub Cache Invalidation

Use Redis pub/sub to notify all app instances to clear their L1 (in-process) caches when data changes. Essential in multi-instance deployments.

```typescript
// Publisher — runs when any data mutation succeeds
class CacheInvalidator {
  async invalidate(entity: string, id: string): Promise<void> {
    const channel = `cache:invalidate:${entity}`;

    // Delete from Redis L2 directly (don't rely on pub/sub for L2)
    await redis.del(`${entity}:${id}`);

    // Notify all instances to clear their L1 caches
    await redis.publish(channel, id);
  }
}

// Subscriber — runs in each app instance at startup
class CacheSubscriber {
  private l1Cache = new Map<string, unknown>();
  private subscriber: Redis;

  async start(): Promise<void> {
    this.subscriber = redis.duplicate();

    await this.subscriber.subscribe('cache:invalidate:user');
    await this.subscriber.subscribe('cache:invalidate:product');

    this.subscriber.on('message', (channel: string, id: string) => {
      const entity = channel.split(':')[2]; // e.g. 'user'
      this.l1Cache.delete(`${entity}:${id}`);
    });
  }
}
```

**Pattern rule**: Every app instance subscribes at startup. Pub/sub is fire-and-forget — always delete from Redis directly AND publish. If pub/sub delivery fails, L1 caches become stale but L2 Redis is already clean.

---

## SCAN: Safe Key Enumeration

`KEYS pattern` is O(N) and blocks the Redis event loop — never use in production. Use `SCAN` for iterative, non-blocking key enumeration:

```typescript
async function deleteKeysByPattern(pattern: string): Promise<number> {
  let cursor = '0';
  let deleted = 0;

  do {
    const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
    cursor = nextCursor;

    if (keys.length > 0) {
      // UNLINK performs async background deletion — prefer over DEL for large values
      await redis.unlink(...keys);
      deleted += keys.length;
    }
  } while (cursor !== '0');

  return deleted;
}

// Usage: invalidate all pages of a product listing
await deleteKeysByPattern('product:list:*');
```

**COUNT hint**: `COUNT 100` tells Redis how many keys to check per iteration. It is a hint, not a guarantee. Increase for large keyspaces; decrease to reduce per-iteration latency impact.

---

## Pipeline Batching

Pipeline sends multiple commands in one network round trip. Use when reading or writing multiple independent keys:

```typescript
// Without pipeline: 3 round trips
const user = await redis.get('user:u_1');
const product = await redis.get('product:p_2');
const session = await redis.get('session:s_3');

// With pipeline: 1 round trip
const pipe = redis.pipeline();
pipe.get('user:u_1');
pipe.get('product:p_2');
pipe.get('session:s_3');
const results = await pipe.exec();
// results[0] = [error|null, userValue], results[1] = [error|null, productValue], etc.

// Batch cache population from a list of entities
const batchPipe = redis.pipeline();
for (const item of items) {
  batchPipe.setex(`item:${item.id}`, 300, JSON.stringify(item));
}
await batchPipe.exec();
```

**Pipeline vs Transaction (MULTI/EXEC)**: Pipeline is not atomic — other commands can interleave. MULTI/EXEC is atomic. Use pipelines for throughput; use Lua scripts or MULTI/EXEC for atomicity.

---

## Redis Memory Management

### Eviction Policies

| Policy | Behavior | When to Use |
|---|---|---|
| `noeviction` | Return error when memory full | Never for pure caches |
| `allkeys-lru` | Evict least recently used key | General-purpose cache |
| `volatile-lru` | Evict LRU keys that have a TTL set | Mixed cache + persistent data |
| `allkeys-lfu` | Evict least frequently used key | Workloads with hot/cold access patterns |
| `volatile-ttl` | Evict keys with shortest remaining TTL | When freshness is most important |

Recommended default for pure caching: `allkeys-lru` with `maxmemory` explicitly set.

```conf
# redis.conf
maxmemory 2gb
maxmemory-policy allkeys-lru
maxmemory-samples 10
```

### Key Metrics to Monitor

```bash
# Memory usage and fragmentation
redis-cli INFO memory | grep -E "used_memory_human|mem_fragmentation_ratio"

# Hit rate: target &gt;90%
redis-cli INFO stats | grep -E "keyspace_hits|keyspace_misses"
# hit_rate = keyspace_hits / (keyspace_hits + keyspace_misses)

# Find slow commands (&gt;10ms by default threshold)
redis-cli SLOWLOG GET 25

# Key count and database stats
redis-cli DBSIZE
redis-cli INFO keyspace
```

---

## Connection Configuration (ioredis)

```typescript
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: 6379,
  password: process.env.REDIS_PASSWORD,
  tls: process.env.NODE_ENV === 'production' ? {} : undefined,

  // Auto-batch concurrent commands into pipelines
  enableAutoPipelining: true,

  // Do not connect until first command is issued
  lazyConnect: true,

  // Retry on transient connection failures
  maxRetriesPerRequest: 3,
  retryStrategy(times: number) {
    if (times > 3) return null; // stop after 3 attempts
    return Math.min(times * 50, 500); // exponential: 50, 100, 150ms
  },

  connectTimeout: 5000,
  commandTimeout: 2000,
});

redis.on('error', (err) => logger.error('Redis error', { err }));
redis.on('reconnecting', () => logger.warn('Redis reconnecting'));
```
