# Missing Backend/API Skills Analysis

**Date:** 2026-01-14
**Repository:** some_claude_skills (129 existing skills)
**Focus:** Backend development gaps for AI apps, photo apps, and web applications

---

## Executive Summary

After analyzing 129 existing skills including `api-architect`, `supabase-admin`, `data-pipeline-engineer`, `modern-auth-2026`, and `cloudflare-worker-dev`, I've identified **13 critical missing backend skills** that would significantly benefit your AI and photo processing projects.

**Existing Coverage:** High-level architecture, database schema, auth flows
**Missing Coverage:** Operational patterns, real-time features, job processing, integrations

---

## 13 Missing Backend Development Skills

### 1. **Background Job Orchestrator**
**Name:** `background-job-orchestrator`

**Description:** Design and implement background job systems using BullMQ, Celery, or Temporal. Handles async task queuing, retries, dead letter queues, cron jobs, and job prioritization.

**Why Needed:**
- **AI apps** (ai_interior_design, ai_journal, ai_tutor): Async ML inference jobs, model loading
- **Photo apps** (best-photo-finder, photo-analyzer): Image processing, thumbnail generation, EXIF extraction
- **General:** Email sending, report generation, data exports that shouldn't block API responses

**Pairs With:**
- `api-architect` - APIs enqueue jobs instead of synchronous processing
- `data-pipeline-engineer` - Scheduled ETL jobs via cron patterns
- `cloudflare-worker-dev` - Lightweight job triggers from edge

**Concrete Example:**
```typescript
// Process 500 wedding photos without blocking upload API
await photoQueue.add('process-batch', {
  albumId: 'wedding-2026',
  photos: photoIds,
  tasks: ['thumbnail', 'face-detection', 'duplicate-check']
}, {
  priority: 2,
  attempts: 3,
  backoff: { type: 'exponential', delay: 5000 }
});
```

---

### 2. **Real-Time Event Stream Architect**
**Name:** `realtime-event-stream-architect`

**Description:** Build real-time features using WebSockets, Server-Sent Events, Supabase Realtime, or Pusher. Handles presence, broadcasting, channel subscriptions, and conflict resolution.

**Why Needed:**
- **AI Journal:** Live typing indicators, collaborative editing
- **Photo apps:** Real-time photo upload progress, live gallery updates
- **Voice karaoke app:** Synchronized lyrics display, multi-user jamming

**Pairs With:**
- `supabase-admin` - Postgres LISTEN/NOTIFY integration
- `api-architect` - REST fallback for unreliable connections
- `pwa-expert` - Offline-first with sync on reconnect

**Concrete Example:**
```typescript
// Real-time photo gallery updates
const channel = supabase
  .channel('album:wedding-2026')
  .on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'photos' },
    (payload) => appendPhotoToGallery(payload.new)
  )
  .subscribe();
```

---

### 3. **Webhook Integration Specialist**
**Name:** `webhook-integration-specialist`

**Description:** Implement robust webhook handlers with signature verification, replay protection, idempotency, and retry logic. Integrates with Stripe, Twilio, GitHub, Replicate, etc.

**Why Needed:**
- **AI apps:** Replicate model completion webhooks, OpenAI async responses
- **Payment processing:** Stripe subscription updates, failed payment handling
- **Photo services:** Cloudinary/Imgix processing completion notifications

**Pairs With:**
- `api-architect` - Webhook endpoints in API design
- `background-job-orchestrator` - Process webhook payloads async
- `security-auditor` - Signature verification patterns

**Concrete Example:**
```typescript
// Replicate webhook for AI interior design completion
app.post('/webhooks/replicate', async (req, res) => {
  // Verify signature
  const isValid = verifyReplicateSignature(req.headers, req.body);
  if (!isValid) return res.status(401).send('Invalid signature');

  // Idempotency check
  const { id } = req.body;
  if (await webhookAlreadyProcessed(id)) {
    return res.status(200).send('Already processed');
  }

  // Queue for processing (don't block response)
  await jobQueue.add('process-ai-result', req.body);
  res.status(200).send('Accepted');
});
```

---

### 4. **Multi-Tenant Data Isolator**
**Name:** `multi-tenant-data-isolator`

**Description:** Implement tenant isolation strategies (schema-per-tenant, row-level, database-per-tenant). Handles tenant context propagation, RLS policies, and cross-tenant analytics.

**Why Needed:**
- **SaaS projects:** Isolate customer data (photo studios, agencies)
- **AI apps:** Per-user model fine-tuning, data privacy
- **Wedding apps:** Multiple couples sharing infrastructure

**Pairs With:**
- `supabase-admin` - Advanced RLS policies for tenant isolation
- `api-architect` - Tenant resolution from JWT/subdomain
- `security-auditor` - Prevent cross-tenant data leaks

**Concrete Example:**
```sql
-- Row-level isolation with indexed tenant_id
CREATE POLICY "Tenant isolation" ON photos
  FOR ALL USING (
    tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
  );

CREATE INDEX idx_photos_tenant ON photos(tenant_id)
  WHERE deleted_at IS NULL;
```

---

### 5. **File Upload & Storage Architect**
**Name:** `file-upload-storage-architect`

**Description:** Design secure file upload systems with pre-signed URLs, chunked uploads, virus scanning, format validation, CDN integration, and storage lifecycle policies.

**Why Needed:**
- **Photo apps:** Multi-GB wedding photo uploads, resume on disconnect
- **AI apps:** Training dataset uploads, model artifact storage
- **General:** Avatar uploads, document attachments, video files

**Pairs With:**
- `supabase-admin` - Storage bucket policies, RLS
- `background-job-orchestrator` - Post-upload processing (thumbnails, virus scan)
- `cloudflare-worker-dev` - Edge-optimized upload endpoints

**Concrete Example:**
```typescript
// Chunked upload with resumability
const uploadSession = await storage.createMultipartUpload({
  bucket: 'wedding-photos',
  key: `albums/${albumId}/raw/${filename}`,
  metadata: { uploadedBy: userId, chunkSize: 5 * 1024 * 1024 }
});

// Client resumes from last chunk
const { uploadedChunks } = await storage.listParts(uploadSession.id);
resumeUploadFromChunk(uploadedChunks.length + 1);
```

---

### 6. **Cache Strategy Designer**
**Name:** `cache-strategy-designer`

**Description:** Implement multi-layer caching (Redis, CDN, in-memory) with invalidation strategies, cache warming, and stale-while-revalidate patterns. Handles distributed cache coherency.

**Why Needed:**
- **Photo apps:** Thumbnail caching, metadata caching, album list caching
- **AI apps:** Model output caching, prompt result deduplication
- **General:** Expensive query results, API rate limit buffering

**Pairs With:**
- `api-architect` - HTTP caching headers (ETag, Cache-Control)
- `supabase-admin` - Materialized views for query caching
- `data-pipeline-engineer` - Pre-compute aggregates for cache warming

**Concrete Example:**
```typescript
// Stale-while-revalidate for photo metadata
async function getPhotoMetadata(photoId: string) {
  const cached = await redis.get(`photo:${photoId}`);

  if (cached) {
    // Return stale data immediately
    const data = JSON.parse(cached);

    // Async revalidate if older than 5 minutes
    if (Date.now() - data.cachedAt > 5 * 60 * 1000) {
      revalidateInBackground(photoId);
    }

    return data.metadata;
  }

  // Cache miss - fetch and cache
  return await fetchAndCacheMetadata(photoId);
}
```

---

### 7. **API Rate Limiter & Quota Manager**
**Name:** `api-rate-limiter-quota-manager`

**Description:** Implement sliding window rate limits, token bucket algorithms, user quota tracking, tiered limits, and graceful degradation. Handles distributed rate limiting with Redis.

**Why Needed:**
- **AI apps:** Limit expensive ML inference calls per user
- **Photo processing:** Prevent abuse of batch processing endpoints
- **API protection:** DDoS protection, fair usage policies

**Pairs With:**
- `api-architect` - Rate limit headers in API design
- `security-auditor` - Abuse detection patterns
- `cloudflare-worker-dev` - Edge rate limiting before origin

**Concrete Example:**
```typescript
// Tiered rate limiting with quota
const limits = {
  free: { requests: 100, per: '1h', quota: 1000 },
  pro: { requests: 1000, per: '1h', quota: 100000 },
  enterprise: { requests: 10000, per: '1h', quota: Infinity }
};

async function checkRateLimit(userId: string, tier: string) {
  const key = `rate:${tier}:${userId}:${getCurrentHour()}`;
  const count = await redis.incr(key);
  await redis.expire(key, 3600);

  if (count > limits[tier].requests) {
    throw new RateLimitError('Hourly limit exceeded');
  }

  // Check monthly quota
  const used = await redis.get(`quota:${userId}:${getMonth()}`);
  if (used >= limits[tier].quota) {
    throw new QuotaExceededError('Monthly quota exceeded');
  }
}
```

---

### 8. **Database Migration Orchestrator**
**Name:** `database-migration-orchestrator`

**Description:** Advanced migration patterns beyond basic schema changes: zero-downtime deploys, data migrations, rollback procedures, feature flags for gradual rollout, multi-step migrations.

**Why Needed:**
- **Schema evolution:** Add columns to 100M+ row tables without downtime
- **Data transformations:** Migrate photo metadata formats
- **Compliance:** GDPR data anonymization migrations

**Pairs With:**
- `supabase-admin` - Postgres-specific migration patterns
- `data-pipeline-engineer` - Backfill data via batch jobs
- `devops-automator` - CI/CD migration automation

**Concrete Example:**
```sql
-- Zero-downtime column addition (3-step migration)

-- Step 1: Add nullable column (no lock)
ALTER TABLE photos ADD COLUMN ai_tags jsonb;
CREATE INDEX CONCURRENTLY idx_photos_ai_tags ON photos USING gin(ai_tags);

-- Step 2: Backfill data via background job (in batches)
-- Run: UPDATE photos SET ai_tags = extract_tags(metadata)
--      WHERE id > last_processed_id LIMIT 1000;

-- Step 3: Make NOT NULL after backfill complete
ALTER TABLE photos ALTER COLUMN ai_tags SET NOT NULL;
ALTER TABLE photos ALTER COLUMN ai_tags SET DEFAULT '[]'::jsonb;
```

---

### 9. **Service Health Monitor**
**Name:** `service-health-monitor`

**Description:** Implement comprehensive health checks, readiness/liveness probes, circuit breakers, graceful degradation, and dependency monitoring. Integrates with observability tools.

**Why Needed:**
- **Microservices:** Detect cascading failures early
- **External dependencies:** Replicate API down, Stripe outage
- **K8s/Docker:** Proper health endpoints for orchestrators

**Pairs With:**
- `site-reliability-engineer` - Production monitoring setup
- `api-architect` - Health check endpoint design
- `cloudflare-worker-dev` - Edge health checks

**Concrete Example:**
```typescript
// Comprehensive health check
app.get('/health', async (req, res) => {
  const checks = await Promise.allSettled([
    checkDatabase(),
    checkRedis(),
    checkS3(),
    checkReplicate(),
    checkStripe()
  ]);

  const health = {
    status: checks.every(c => c.status === 'fulfilled') ? 'healthy' : 'degraded',
    checks: checks.map((c, i) => ({
      name: ['database', 'redis', 's3', 'replicate', 'stripe'][i],
      status: c.status === 'fulfilled' ? 'up' : 'down',
      latency: c.value?.latency,
      error: c.reason?.message
    })),
    timestamp: new Date().toISOString()
  };

  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});
```

---

### 10. **Batch Processing Optimizer**
**Name:** `batch-processing-optimizer`

**Description:** Optimize bulk operations with batching, cursor-based pagination, parallel processing pools, memory-efficient streaming, and progress tracking. Handles millions of records.

**Why Needed:**
- **Photo imports:** Process 10,000 wedding photos without OOM
- **AI batch inference:** Score 100,000 images for similarity
- **Data exports:** Generate CSV of all user data

**Pairs With:**
- `background-job-orchestrator` - Queue batch jobs
- `data-pipeline-engineer` - Batch ETL patterns
- `supabase-admin` - Efficient bulk inserts/updates

**Concrete Example:**
```typescript
// Memory-efficient batch processing with cursor
async function processBatchWithCursor(albumId: string) {
  const BATCH_SIZE = 100;
  let cursor = null;
  let processed = 0;

  while (true) {
    // Fetch batch
    const { data: photos, nextCursor } = await db
      .from('photos')
      .select('id, url')
      .eq('album_id', albumId)
      .gt('id', cursor || 0)
      .order('id')
      .limit(BATCH_SIZE);

    if (!photos.length) break;

    // Process in parallel pool (max 5 concurrent)
    await pMap(photos, processPhoto, { concurrency: 5 });

    processed += photos.length;
    cursor = photos[photos.length - 1].id;

    // Update progress
    await updateJobProgress(albumId, processed);
  }
}
```

---

### 11. **Event Sourcing Architect**
**Name:** `event-sourcing-architect`

**Description:** Implement event-sourced systems with event stores, projections, CQRS, snapshots, and event replay. Handles audit logs, time-travel debugging, and eventual consistency.

**Why Needed:**
- **Audit trails:** Track all photo edits, AI prompt history
- **Undo/redo:** Restore previous states of documents
- **Collaboration:** Resolve conflicts in multi-user editing

**Pairs With:**
- `data-pipeline-engineer` - Event stream processing
- `realtime-event-stream-architect` - Broadcast events to subscribers
- `supabase-admin` - Event store table design

**Concrete Example:**
```typescript
// Event-sourced photo album
const events = [
  { type: 'AlbumCreated', data: { id, name, owner } },
  { type: 'PhotoAdded', data: { photoId, url } },
  { type: 'PhotoTagged', data: { photoId, tags: ['sunset', 'beach'] } },
  { type: 'PhotoDeleted', data: { photoId } }
];

// Rebuild state from events
function projectAlbumState(events: Event[]): Album {
  return events.reduce((state, event) => {
    switch (event.type) {
      case 'AlbumCreated':
        return { ...event.data, photos: [] };
      case 'PhotoAdded':
        return { ...state, photos: [...state.photos, event.data] };
      case 'PhotoTagged':
        return {
          ...state,
          photos: state.photos.map(p =>
            p.photoId === event.data.photoId
              ? { ...p, tags: event.data.tags }
              : p
          )
        };
      default:
        return state;
    }
  }, {} as Album);
}
```

---

### 12. **Third-Party API Integrator**
**Name:** `third-party-api-integrator`

**Description:** Build resilient third-party API clients with retry logic, circuit breakers, fallbacks, rate limit handling, SDK wrapping, and mock testing. Handles OAuth refresh flows.

**Why Needed:**
- **AI services:** Replicate, OpenAI, Stability AI with retry/fallback
- **Photo services:** Cloudinary, Imgix, AWS Rekognition
- **Payments:** Stripe with webhook sync and idempotency

**Pairs With:**
- `api-architect` - Design APIs that wrap third-party services
- `background-job-orchestrator` - Async third-party API calls
- `webhook-integration-specialist` - Handle third-party webhooks

**Concrete Example:**
```typescript
// Resilient Replicate client with circuit breaker
class ResilientReplicateClient {
  private circuitBreaker = new CircuitBreaker(this.call, {
    timeout: 30000,
    errorThresholdPercentage: 50,
    resetTimeout: 60000
  });

  async generateImage(prompt: string): Promise<ImageResult> {
    return this.circuitBreaker.fire(async () => {
      const prediction = await replicate.predictions.create({
        model: 'stability-ai/sdxl',
        input: { prompt }
      });

      // Poll with exponential backoff
      return await this.pollWithBackoff(prediction.id);
    });
  }

  private async pollWithBackoff(id: string, attempt = 1): Promise<ImageResult> {
    const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
    await sleep(delay);

    const prediction = await replicate.predictions.get(id);

    if (prediction.status === 'succeeded') {
      return prediction.output;
    } else if (prediction.status === 'failed') {
      throw new ReplicateError(prediction.error);
    } else {
      return this.pollWithBackoff(id, attempt + 1);
    }
  }
}
```

---

### 13. **Database Query Optimizer**
**Name:** `database-query-optimizer`

**Description:** Analyze and optimize SQL queries with EXPLAIN plans, index strategies, query rewriting, N+1 detection, connection pooling, and read replicas. Handles Postgres-specific optimizations.

**Why Needed:**
- **Photo apps:** Fast gallery rendering with complex filters
- **AI apps:** Efficient vector similarity searches
- **Analytics:** Aggregate queries on millions of rows

**Pairs With:**
- `supabase-admin` - Postgres-specific optimizations
- `data-pipeline-engineer` - Optimize ETL queries
- `api-architect` - Optimize API query patterns

**Concrete Example:**
```sql
-- BEFORE: N+1 query (500ms per photo)
SELECT * FROM photos WHERE album_id = '123';
-- Then in loop: SELECT * FROM tags WHERE photo_id = ?;

-- AFTER: Single query with JSON aggregation (20ms total)
SELECT
  p.*,
  COALESCE(
    json_agg(
      json_build_object('id', t.id, 'name', t.name)
    ) FILTER (WHERE t.id IS NOT NULL),
    '[]'
  ) as tags
FROM photos p
LEFT JOIN photo_tags pt ON pt.photo_id = p.id
LEFT JOIN tags t ON t.id = pt.tag_id
WHERE p.album_id = '123'
GROUP BY p.id;

-- Add covering index
CREATE INDEX idx_photo_tags_covering
  ON photo_tags(photo_id)
  INCLUDE (tag_id);
```

---

## Priority Matrix

| Skill | Urgency | Impact | Difficulty | Recommended Order |
|-------|---------|--------|------------|-------------------|
| Background Job Orchestrator | High | High | Medium | 1 |
| File Upload & Storage | High | High | Medium | 2 |
| Cache Strategy Designer | High | Medium | Low | 3 |
| Real-Time Event Stream | Medium | High | Medium | 4 |
| Database Query Optimizer | High | High | Low | 5 |
| Webhook Integration | Medium | Medium | Low | 6 |
| API Rate Limiter | Medium | Medium | Low | 7 |
| Third-Party API Integrator | Medium | Medium | Medium | 8 |
| Batch Processing Optimizer | Medium | Medium | Medium | 9 |
| Service Health Monitor | Low | Medium | Low | 10 |
| Multi-Tenant Isolator | Low | High | High | 11 |
| Database Migration Orchestrator | Low | Medium | Medium | 12 |
| Event Sourcing Architect | Low | Low | High | 13 |

---

## Implementation Recommendations

### Phase 1: Core Operations (Skills 1-5)
These skills address immediate pain points in your photo and AI apps:
- **Background jobs** for async photo processing
- **File uploads** for wedding photo batches
- **Caching** for fast gallery loads
- **Real-time** for collaborative features
- **Query optimization** for performance

**Estimated Development Time:** 2-3 weeks for all 5 skills

### Phase 2: Integration & Resilience (Skills 6-9)
These skills improve production reliability:
- **Webhooks** for third-party service integration
- **Rate limiting** for API protection
- **Third-party clients** for AI service resilience
- **Batch processing** for large-scale operations

**Estimated Development Time:** 2 weeks for all 4 skills

### Phase 3: Advanced Patterns (Skills 10-13)
These skills enable sophisticated architectures:
- **Health monitoring** for production observability
- **Multi-tenancy** for SaaS expansion
- **Migration orchestration** for zero-downtime deploys
- **Event sourcing** for audit trails and time travel

**Estimated Development Time:** 3-4 weeks for all 4 skills

---

## Cross-Cutting Concerns

### All Skills Should Include:
1. **TypeScript/JavaScript examples** (primary language for your projects)
2. **Supabase integration patterns** (appears in many projects)
3. **Next.js/React context** (frontend integration)
4. **Error handling patterns** (production-ready code)
5. **Testing strategies** (unit + integration tests)
6. **Deployment considerations** (Vercel/Cloudflare)

### Reference Documentation Structure:
```
skill-name/
├── SKILL.md (main documentation)
├── references/
│   ├── implementation-guide.md
│   ├── common-patterns.md
│   ├── troubleshooting.md
│   └── integrations.md
└── examples/
    ├── basic-example.ts
    ├── advanced-example.ts
    └── test-example.test.ts
```

---

## Validation Against Existing Skills

### No Overlap With:
- `api-architect` - High-level API design, not operational patterns
- `supabase-admin` - Database schema/RLS, not application-level caching/jobs
- `data-pipeline-engineer` - Batch ETL, not real-time operational patterns
- `modern-auth-2026` - Authentication flows, not general backend operations
- `cloudflare-worker-dev` - Edge computing, not origin server patterns

### Complements:
- `api-architect` ➜ These skills implement the backend behind the API
- `supabase-admin` ➜ These skills use Supabase as infrastructure
- `fullstack-debugger` ➜ These skills provide debugging contexts
- `security-auditor` ➜ These skills implement secure patterns

---

## Next Steps

1. **Prioritize top 5 skills** based on current project needs
2. **Create skill templates** following existing skill structure
3. **Write reference implementations** with real-world examples
4. **Test against actual projects** (ai_interior_design, best-photo-finder)
5. **Document integration patterns** with existing skills
6. **Create skill bundles** (e.g., "Photo App Backend Bundle", "AI App Backend Bundle")

---

## Questions for Refinement

1. **Are there specific backend frameworks** you prefer? (Express, Fastify, tRPC, Hono)
2. **Cloud platform preferences?** (AWS, GCP, Cloudflare, Supabase-only)
3. **Queue technology preference?** (BullMQ, Temporal, Inngest, Supabase Queue)
4. **Caching infrastructure?** (Redis, Upstash, Cloudflare KV, Supabase Cache)
5. **Observability tools?** (Sentry, Datadog, Betterstack, Axiom)

---

**End of Analysis**
Generated by: API Architect skill
For: Some Claude Skills repository enhancement
