# Performance Patterns for Recovery Apps

## Why Performance is Life-or-Death

This isn't a business app. The user opening sobriety.tools might be:
- A fentanyl addict with seconds before relapse
- Someone in emotional crisis needing their sponsor's number
- A person at 2am looking for a meeting to survive until morning

**Every second of load time is a second they might give up.**

## Critical Path Priorities

### Tier 1: Must Load in &lt;200ms (Crisis Critical)
1. **Contacts/Sponsors** - Phone numbers for immediate support
2. **Safety Plan** - User's personalized coping strategies
3. **Crisis Resources** - Hotline numbers

### Tier 2: Must Load in &lt;500ms (High Priority)
4. **Meeting Search** - Find nearby meetings
5. **Check-in Form** - Record current state

### Tier 3: Can Load in &lt;2s (Standard)
6. **Journal** - Review past entries
7. **Progress Charts** - Analytics and trends
8. **Settings** - Configuration

## Offline-First Architecture

### Service Worker Cache Strategy

```typescript
// Workbox configuration for crisis-critical routes
const PRECACHE_ROUTES = [
  '/contacts',
  '/safety-plan',
  '/crisis',
  '/check-in',
];

const CACHE_FIRST_ROUTES = [
  '/meetings?saved=true',  // Saved meetings
  '/api/contacts',         // Sponsor data
];

const STALE_WHILE_REVALIDATE = [
  '/meetings',            // General search (prefer fresh)
  '/api/meetings',        // Meeting API
];
```

### IndexedDB for Critical Data

```typescript
// Always cache these locally
const OFFLINE_CRITICAL = {
  contacts: {
    store: 'contacts',
    maxAge: Infinity,  // Never expire
    syncStrategy: 'background',
  },
  safetyPlan: {
    store: 'safety_plan',
    maxAge: Infinity,
    syncStrategy: 'background',
  },
  savedMeetings: {
    store: 'saved_meetings',
    maxAge: 24 * 60 * 60 * 1000,  // 24 hours
    syncStrategy: 'background',
  },
  recentCheckins: {
    store: 'checkins',
    maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days
    syncStrategy: 'background',
  },
};
```

## React Query Configuration

### For Crisis-Critical Data

```typescript
// Contacts query - show cached data IMMEDIATELY
const useContacts = () => useQuery({
  queryKey: ['contacts'],
  queryFn: fetchContacts,
  initialData: () => getFromIndexedDB('contacts'),
  staleTime: Infinity,  // Never consider stale
  gcTime: Infinity,     // Never garbage collect
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: 'always',  // Sync when back online
});

// Meeting search - aggressive caching
const useMeetings = (geohash: string) => useQuery({
  queryKey: ['meetings', 'nearby', geohash],
  queryFn: () => fetchMeetings(geohash),
  staleTime: 6 * 60 * 60 * 1000,  // 6 hours (match harvester schedule)
  gcTime: 24 * 60 * 60 * 1000,    // 24 hours
  refetchOnMount: false,
  refetchOnWindowFocus: false,
});
```

### For Non-Critical Data

```typescript
// Journal entries - standard caching
const useJournal = () => useQuery({
  queryKey: ['journal'],
  queryFn: fetchJournal,
  staleTime: 5 * 60 * 1000,  // 5 minutes
  gcTime: 30 * 60 * 1000,    // 30 minutes
});
```

## Edge Caching with Cloudflare KV

### Geohash-Based Meeting Cache

```
User Location (45.52, -122.68)
    ↓
Geohash: c20 (Portland metro, ~150km cell)
    ↓
KV Key: meetings:c20:25 (25-mile radius)
    ↓
Cache HIT → Return immediately (~5ms)
Cache MISS → Query Supabase → Store in KV → Return (~200-500ms)
```

### Cache Warming Strategy

```typescript
// Top 30 US metros to pre-warm after each harvest
const WARM_METROS = [
  { lat: 40.71, lng: -74.01 },  // NYC
  { lat: 34.05, lng: -118.24 }, // LA
  { lat: 41.88, lng: -87.63 },  // Chicago
  // ... 27 more
];

// Run after harvester completes
async function warmCache() {
  for (const metro of WARM_METROS) {
    await fetch(`/api/all?lat=${metro.lat}&lng=${metro.lng}&radius=25`);
    await sleep(100);  // Rate limit
  }
}
```

## Bundle Optimization

### Dynamic Imports for Non-Critical Features

```typescript
// ❌ Bad - loads everything upfront
import { JournalAI } from '@/components/JournalAI';
import { Charts } from '@/components/Charts';
import { CalendarExport } from '@/components/CalendarExport';

// ✅ Good - loads on demand
const JournalAI = dynamic(() => import('@/components/JournalAI'), {
  ssr: false,
  loading: () => <FeatureSkeleton />,
});

const Charts = dynamic(() => import('@/components/Charts'), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});
```

### Tree-Shaking Dependencies

```typescript
// ❌ Bad - imports entire library
import _ from 'lodash';
import dayjs from 'dayjs';

// ✅ Good - imports only what's needed
import debounce from 'lodash/debounce';
import { format, parseISO } from 'date-fns';
```

## Database Query Optimization

### PostGIS Spatial Queries

```sql
-- ❌ Slow - calculates distance for all meetings
SELECT * FROM meetings
ORDER BY ST_Distance(geog, ST_MakePoint($lng, $lat)::geography)
LIMIT 100;

-- ✅ Fast - filters by bounding box first
SELECT * FROM meetings
WHERE ST_DWithin(geog, ST_MakePoint($lng, $lat)::geography, $radius_meters)
ORDER BY ST_Distance(geog, ST_MakePoint($lng, $lat)::geography)
LIMIT 100;
```

### Index Strategy

```sql
-- Spatial index for location queries
CREATE INDEX idx_meetings_geog ON meetings USING GIST (geog);

-- Compound index for filtered searches
CREATE INDEX idx_meetings_day_program ON meetings (day_of_week, program)
WHERE day_of_week IS NOT NULL;

-- Index for user-specific queries
CREATE INDEX idx_contacts_user_active ON contacts (user_id)
WHERE status = 'active';
```

## Crisis Detection Patterns

### Journal Sentiment Analysis

```typescript
interface CrisisIndicators {
  anger_spike: boolean;      // HALT angry score jumps 3+ points
  ex_mentions: boolean;      // Ex-partner mentioned 3+ times/week
  isolation: boolean;        // No check-ins for 3+ days after daily streak
  time_distortion: boolean;  // Check-ins at 2-5am
  negative_spiral: boolean;  // Consecutive declining mood scores
}

function detectCrisis(recentCheckins: Checkin[], journals: Journal[]): CrisisIndicators {
  // Implementation details...
}
```

### Proactive Help Surfacing

When crisis indicators are detected:
1. **Don't alarm** - No scary warnings
2. **Gentle nudge** - "Your sponsor Sarah is available"
3. **Surface tools** - Show safety plan link prominently
4. **Reduce friction** - One-tap call to sponsor

## Monitoring & Alerting

### Key Metrics

| Metric | Threshold | Action |
|--------|-----------|--------|
| Contacts FCP | &gt;200ms | P0 - Fix immediately |
| Meetings LCP | &gt;500ms | P1 - Fix within 24h |
| Cache hit rate | &lt;80% | Warm cache |
| Lighthouse perf | &lt;90 | Investigate bundle |
| API P95 | &gt;500ms | Check Supabase |

### Automated Alerts

```typescript
// In perf-audit.ts
if (contactsFCP > 200) {
  await createGitHubIssue({
    title: '[CRITICAL] Contacts page FCP regression',
    body: `FCP is ${contactsFCP}ms (threshold: 200ms).

Users in crisis cannot access sponsor numbers quickly enough.
This is a life-safety issue.`,
    labels: ['critical', 'performance', 'crisis-path'],
  });
}
```

## Testing Checklist

### Before Every Deploy

- [ ] Lighthouse performance ≥90
- [ ] Contacts page FCP &lt;200ms
- [ ] Meeting search &lt;500ms
- [ ] Bundle delta &lt;5KB
- [ ] Offline mode tested (DevTools → Network → Offline)

### Weekly

- [ ] Review slow query logs in Supabase
- [ ] Check KV cache hit rate (&gt;80%)
- [ ] Test on real device with 3G throttling
- [ ] Review RUM data for P95 load times

### Monthly

- [ ] Profile React renders
- [ ] Audit third-party scripts
- [ ] Prune unused dependencies
- [ ] Full crisis flow test on real device

## Resources

- [Web Vitals](https://web.dev/vitals/)
- [Cloudflare Workers KV](https://developers.cloudflare.com/workers/runtime-apis/kv/)
- [PostGIS Spatial Indexing](https://postgis.net/docs/using_postgis_dbmanagement.html#idm2264)
- [React Query Caching](https://tanstack.com/query/latest/docs/framework/react/guides/caching)
