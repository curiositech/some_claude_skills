# HTTP Caching Reference

Consult this file for browser caching, Cache-Control header design, ETags, CDN configuration, and service worker caching strategies.

---

## Cache-Control Directive Reference

The `Cache-Control` header controls caching behavior at every layer: browser, CDN, and proxies.

### Most Important Directives

| Directive | Meaning | Example Use |
|---|---|---|
| `max-age=N` | Cache for N seconds | Static assets: `max-age=31536000` |
| `s-maxage=N` | CDN cache duration (overrides max-age for shared caches) | `s-maxage=3600` for API responses |
| `no-cache` | Must revalidate with server before serving (misleading name — does NOT skip caching) | HTML pages that change often |
| `no-store` | Never store in any cache | Sensitive data: account pages, payment flows |
| `private` | Browser may cache, but CDN must not | Personalized content |
| `public` | Any cache (including CDN) may store | Cacheable API responses |
| `immutable` | Tells browser the content will never change — skip revalidation during max-age | Content-hashed assets |
| `stale-while-revalidate=N` | Serve stale while fetching fresh in background | Good for non-critical UI data |
| `stale-if-error=N` | Serve stale if origin returns 5xx | Resilience: use cached version during outages |
| `must-revalidate` | Do not serve stale even if origin is unavailable | Financial data, strict freshness |

### Common Patterns

```http
# Static assets with content hashing (main.a1b2c3.js)
# Use the longest possible TTL — the hash ensures cache-busting on change
Cache-Control: public, max-age=31536000, immutable

# HTML pages — always check for updates, but serve instantly from cache
Cache-Control: no-cache

# API response that is the same for all users (public)
# CDN caches for 1 hour; browser caches for 5 minutes
Cache-Control: public, max-age=300, s-maxage=3600

# Personalized API response (per-user) — browser only, CDN must not cache
Cache-Control: private, max-age=60

# Sensitive pages — no caching at any layer
Cache-Control: no-store, no-cache, must-revalidate

# Non-critical data: serve stale content while refreshing in background
Cache-Control: public, max-age=60, stale-while-revalidate=3600

# Resilience: serve stale if origin is down (for up to 24 hours)
Cache-Control: public, max-age=3600, stale-if-error=86400
```

---

## ETags and Conditional Requests

ETags enable efficient revalidation: the browser asks "has this changed?" instead of downloading the full response again.

### How ETags Work

```
Browser → GET /api/product/123 → Server
Server ← 200 OK + ETag: "abc123" + full body ← Server

Browser → GET /api/product/123 + If-None-Match: "abc123" → Server
Server ← 304 Not Modified (no body, just headers) ← Server
  OR
Server ← 200 OK + ETag: "def456" + new full body ← Server
```

### Server Implementation (Node.js/Express)

```typescript
import crypto from 'crypto';
import { Request, Response } from 'express';

// Weak ETag: based on content hash
function generateETag(data: unknown): string {
  const hash = crypto.createHash('md5').update(JSON.stringify(data)).digest('hex');
  return `"${hash}"`;
}

async function getProductHandler(req: Request, res: Response) {
  const product = await db.products.findById(req.params.id);
  if (!product) return res.status(404).json({ error: 'Not found' });

  const etag = generateETag(product);

  // Check if client has current version
  if (req.headers['if-none-match'] === etag) {
    return res.status(304).end(); // Not Modified — no body sent
  }

  res
    .setHeader('ETag', etag)
    .setHeader('Cache-Control', 'public, max-age=60')
    .json(product);
}
```

### Last-Modified Alternative

Use `Last-Modified` + `If-Modified-Since` when content has a reliable modification timestamp:

```typescript
const lastModified = product.updatedAt.toUTCString();

if (req.headers['if-modified-since'] === lastModified) {
  return res.status(304).end();
}

res
  .setHeader('Last-Modified', lastModified)
  .setHeader('Cache-Control', 'public, max-age=300')
  .json(product);
```

**ETag vs Last-Modified**: ETags are more reliable (timestamp precision is 1 second; ETags detect any change). Use ETags for most cases. Last-Modified is useful when exact modification timestamps are meaningful to the application.

---

## Vary Header

The `Vary` header tells CDNs which request headers affect the response. Without `Vary`, the CDN may serve a cached English response to a French-speaking user.

```http
# Serve different responses based on Accept-Encoding (compression)
Vary: Accept-Encoding

# Serve different responses based on language
Vary: Accept-Language

# Serve different responses based on content type negotiation
Vary: Accept

# Multiple: all of these must match for a cache hit
Vary: Accept-Encoding, Accept-Language
```

**Warning**: `Vary: Cookie` or `Vary: Authorization` effectively disable CDN caching (every user gets a different cache entry). Use `Cache-Control: private` for user-specific responses instead.

---

## CDN Cache Configuration

### Cloudflare

```javascript
// Cloudflare Workers — fine-grained cache control at the edge
export default {
  async fetch(request: Request): Promise<Response> {
    const cache = caches.default;
    const cacheKey = new Request(request.url, request);

    // Check edge cache first
    let response = await cache.match(cacheKey);
    if (response) {
      return response;
    }

    // Forward to origin
    response = await fetch(request);

    // Cache successful GET responses
    if (request.method === 'GET' && response.status === 200) {
      const cacheResponse = new Response(response.body, response);
      cacheResponse.headers.set('Cache-Control', 'public, max-age=300, s-maxage=3600');
      // Do not await — cache in background, respond immediately
      request.ctx.waitUntil(cache.put(cacheKey, cacheResponse.clone()));
      return cacheResponse;
    }

    return response;
  }
};
```

### Cache Purging (Cloudflare API)

```typescript
async function purgeCloudflareCache(urls: string[]): Promise<void> {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/purge_cache`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ files: urls }),
    }
  );

  if (!response.ok) {
    throw new Error(`Cache purge failed: ${await response.text()}`);
  }
}

// Purge product page after update
await purgeCloudflareCache([
  `https://example.com/products/${productId}`,
  `https://api.example.com/api/products/${productId}`,
]);
```

### Next.js: On-Demand Revalidation

```typescript
// app/api/revalidate/route.ts
import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { secret, path, tag } = await req.json();

  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (path) revalidatePath(path);
  if (tag) revalidateTag(tag);

  return NextResponse.json({ revalidated: true });
}

// Server Component: tag fetches for granular invalidation
async function ProductPage({ id }: { id: string }) {
  const product = await fetch(`/api/products/${id}`, {
    next: {
      revalidate: 3600,      // ISR: revalidate every hour
      tags: [`product:${id}`] // or purge by tag
    }
  });
  // ...
}
```

---

## Service Worker Caching

Service workers intercept network requests and can serve from a cache, providing offline support and background sync.

### Strategy Selection

| Strategy | When to Use | Trade-off |
|---|---|---|
| Cache First | Static assets, fonts, app shell | Stale risk; fast |
| Network First | API data, dynamic content | Slow on bad network |
| Stale-While-Revalidate | Content that changes but can be slightly stale | Instant + fresh |
| Network Only | Payments, sensitive forms | No offline support |
| Cache Only | Fully offline app after install | No updates after cache |

### Implementation (Workbox)

```javascript
// service-worker.js (using Workbox)
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { BackgroundSyncPlugin } from 'workbox-background-sync';

// App shell and static assets: cache first, long TTL
registerRoute(
  ({ request }) => request.destination === 'script' || request.destination === 'style',
  new CacheFirst({
    cacheName: 'static-assets',
    plugins: [
      new ExpirationPlugin({ maxAgeSeconds: 30 * 24 * 60 * 60 }), // 30 days
    ],
  })
);

// API data: network first with offline fallback
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 5 * 60, // 5 minutes offline fallback
      }),
    ],
    networkTimeoutSeconds: 3, // fall back to cache after 3s
  })
);

// Images: stale-while-revalidate
registerRoute(
  ({ request }) => request.destination === 'image',
  new StaleWhileRevalidate({
    cacheName: 'images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
      }),
    ],
  })
);

// Background sync for failed POST requests
const bgSyncPlugin = new BackgroundSyncPlugin('formQueue', {
  maxRetentionTime: 24 * 60, // retry for up to 24 hours
});

registerRoute(
  ({ url, request }) => url.pathname === '/api/submit' && request.method === 'POST',
  new NetworkOnly({ plugins: [bgSyncPlugin] }),
  'POST'
);
```

---

## Cache-Busting Strategies

| Method | Mechanism | Pros | Cons |
|---|---|---|---|
| Content hashing | `main.a1b2c3.js` | Perfect cache busting | Requires build pipeline |
| Query string | `main.js?v=20260301` | Simple | Some CDNs ignore query strings |
| Path versioning | `/v2/api/products` | Works everywhere | Breaking API change required |
| Immutable + redeploy | Deploy new URL, purge CDN | Clean | Requires CDN purge API |

**Recommendation for static assets**: Use content hashing (webpack, Vite, Rollup all support this). Set `Cache-Control: public, max-age=31536000, immutable`. Cache busting is automatic — changing the file changes the hash, changes the URL.

**Recommendation for API responses**: Use ETags + `no-cache` for HTML; use short TTLs + `stale-while-revalidate` for API data; use CDN cache tags and programmatic purge on mutations.

---

## Debugging HTTP Caching

```bash
# Check response headers (what the server sends)
curl -I https://example.com/api/products/123

# Check if CDN served from cache (look for Cf-Cache-Status, X-Cache headers)
curl -I -H "User-Agent: debug" https://example.com/api/products/123
# Cloudflare: Cf-Cache-Status: HIT | MISS | BYPASS | EXPIRED

# Force a fresh fetch bypassing browser cache (devtools)
# Chrome: Ctrl+Shift+R (hard reload) or open devtools and right-click reload
# Or: Fetch API with cache: 'no-store'
const response = await fetch('/api/data', { cache: 'no-store' });
```

### Common Debugging Checklist

- `Cf-Cache-Status: BYPASS` → Request has authorization header or cookie that Cloudflare is configured to bypass on
- `Cache-Control: no-store` on a CDN-cached URL → CDN may be ignoring it; check CDN page rules
- Browser showing stale data after purge → Check if browser has its own cached copy (hard reload or devtools > Disable cache)
- `Vary: *` → Disables caching entirely for that response; find where this header is being set
- 304 Not Modified not working → ETag or Last-Modified header missing from server response
