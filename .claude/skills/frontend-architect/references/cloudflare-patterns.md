# Cloudflare Patterns

Edge deployment patterns, configuration, and best practices for Cloudflare Pages.

## Project Setup

### wrangler.toml Configuration

```toml
# wrangler.toml for Next.js on Cloudflare Pages
name = "project-name"
compatibility_date = "2026-01-31"
pages_build_output_dir = ".next"

# Environment variables
[vars]
ENVIRONMENT = "production"

# Secrets (set via wrangler secret put)
# PEXELS_API_KEY, DATABASE_URL, etc.

# KV Namespaces
[[kv_namespaces]]
binding = "CACHE"
id = "your-kv-namespace-id"
preview_id = "your-preview-kv-id"

# D1 Database
[[d1_databases]]
binding = "DB"
database_name = "project-db"
database_id = "your-database-id"

# R2 Storage
[[r2_buckets]]
binding = "ASSETS"
bucket_name = "project-assets"

# Durable Objects
[[durable_objects.bindings]]
name = "RATE_LIMITER"
class_name = "RateLimiter"
```

### next.config.js for Cloudflare

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    loader: 'custom',
    loaderFile: './lib/cloudflare-image-loader.ts',
    remotePatterns: [
      { hostname: 'images.pexels.com' },
      { hostname: 'images.unsplash.com' },
    ],
  },
  // Experimental edge runtime
  experimental: {
    runtime: 'edge',
  },
};

module.exports = nextConfig;
```

## Deployment Patterns

### Preview Deployments

```yaml
# Every PR gets a preview URL
Trigger: Pull Request opened/updated
URL: https://preview-{branch-slug}.{project}.pages.dev

# Use case: Stakeholder review
# Share URL with:
# - Design team for visual review
# - QA for testing
# - Product for feature approval
```

**Workflow:**
```bash
# Automatic on PR (via GitHub integration)
# Or manual:
npx wrangler pages deploy .next \
  --project-name=your-project \
  --branch=feature-branch \
  --commit-message="Feature: Add gallery"
```

### Environment Management

```typescript
// Environment detection
const env = {
  isProduction: process.env.CF_PAGES_BRANCH === 'main',
  isPreview: process.env.CF_PAGES_BRANCH !== 'main' && !!process.env.CF_PAGES,
  isDevelopment: !process.env.CF_PAGES,
  branch: process.env.CF_PAGES_BRANCH,
  commitSha: process.env.CF_PAGES_COMMIT_SHA,
};

// Feature flags per environment
const features = {
  newCheckout: env.isPreview || env.isDevelopment,
  experimentalUI: env.branch === 'feature/new-ui',
  analytics: env.isProduction,
};
```

### Production Deployment

```yaml
# Automatic on push to main
Trigger: Push to main branch
URL: https://your-domain.com

# Custom domain setup in Cloudflare Dashboard:
# 1. Add custom domain
# 2. Wait for SSL provisioning
# 3. Verify DNS propagation
```

## Edge Patterns

### Middleware at the Edge

```typescript
// middleware.ts - runs on every request
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Geolocation-based routing
  const country = request.geo?.country || 'US';
  if (country === 'EU') {
    response.headers.set('X-GDPR-Required', 'true');
  }

  return response;
}
```

### KV-Based Feature Flags

```typescript
// lib/feature-flags.ts
export async function getFeatureFlags(env: { KV: KVNamespace }) {
  const flags = await env.KV.get('feature-flags', 'json');
  return flags || {};
}

// Usage in middleware
export async function middleware(request: NextRequest) {
  const flags = await getFeatureFlags(env);

  if (flags.newHomepage && request.nextUrl.pathname === '/') {
    return NextResponse.rewrite(new URL('/home-v2', request.url));
  }

  return NextResponse.next();
}

// Setting flags
await env.KV.put('feature-flags', JSON.stringify({
  newHomepage: true,
  darkModeDefault: false,
  experimentalFeature: 'variant-a',
}));
```

### Edge Caching

```typescript
// API route with edge caching
export const runtime = 'edge';

export async function GET(request: Request) {
  const cacheKey = new URL(request.url).pathname;

  // Try cache first
  const cached = await env.CACHE.get(cacheKey, 'json');
  if (cached) {
    return Response.json(cached, {
      headers: { 'X-Cache': 'HIT' }
    });
  }

  // Fetch and cache
  const data = await fetchExpensiveData();
  await env.CACHE.put(cacheKey, JSON.stringify(data), {
    expirationTtl: 3600 // 1 hour
  });

  return Response.json(data, {
    headers: { 'X-Cache': 'MISS' }
  });
}
```

## Auth Patterns

### Cloudflare Access Integration

```typescript
// lib/cloudflare-access.ts
interface AccessUser {
  email: string;
  name?: string;
  groups?: string[];
}

export async function verifyAccessToken(jwt: string | null): Promise<AccessUser | null> {
  if (!jwt) return null;

  try {
    // Cloudflare Access provides JWT verification endpoint
    const response = await fetch(
      `https://${process.env.CF_ACCESS_TEAM_NAME}.cloudflareaccess.com/cdn-cgi/access/get-identity`,
      { headers: { 'CF-Access-JWT-Assertion': jwt } }
    );

    if (!response.ok) return null;

    return await response.json();
  } catch {
    return null;
  }
}

// Usage in API route
export async function GET(request: Request) {
  const jwt = request.headers.get('CF-Access-JWT-Assertion');
  const user = await verifyAccessToken(jwt);

  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  if (!user.groups?.includes('admin')) {
    return new Response('Forbidden', { status: 403 });
  }

  // Admin-only logic
}
```

### Role-Based Access

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const jwt = request.headers.get('CF-Access-JWT-Assertion');
  const user = await verifyAccessToken(jwt);

  const pathname = request.nextUrl.pathname;

  // Route protection map
  const protectedRoutes = {
    '/admin': ['admin'],
    '/beta': ['beta-testers', 'admin'],
    '/internal': ['employee'],
  };

  for (const [route, requiredGroups] of Object.entries(protectedRoutes)) {
    if (pathname.startsWith(route)) {
      if (!user) {
        return new Response('Unauthorized', { status: 401 });
      }
      if (!requiredGroups.some(g => user.groups?.includes(g))) {
        return new Response('Forbidden', { status: 403 });
      }
    }
  }

  return NextResponse.next();
}
```

## Image Optimization

### Cloudflare Image Loader

```typescript
// lib/cloudflare-image-loader.ts
export default function cloudflareLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  // For external URLs (Pexels, Unsplash)
  if (src.startsWith('http')) {
    // Use Cloudflare Image Resizing
    return `https://your-domain.com/cdn-cgi/image/width=${width},quality=${quality || 75}/${src}`;
  }

  // For local images
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality || 75}`;
}
```

### R2 Asset Storage

```typescript
// API route for uploading to R2
export const runtime = 'edge';

export async function POST(request: Request, { env }: { env: { ASSETS: R2Bucket } }) {
  const formData = await request.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return Response.json({ error: 'No file provided' }, { status: 400 });
  }

  const key = `uploads/${Date.now()}-${file.name}`;
  await env.ASSETS.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type },
  });

  return Response.json({
    url: `https://assets.your-domain.com/${key}`,
  });
}
```

## Monitoring & Debugging

### Request Logging

```typescript
// Log to Workers Analytics Engine
export async function middleware(request: NextRequest) {
  const start = Date.now();
  const response = NextResponse.next();
  const duration = Date.now() - start;

  // Log to analytics (if using Workers Analytics Engine)
  env.ANALYTICS?.writeDataPoint({
    blobs: [request.nextUrl.pathname],
    doubles: [duration, response.status],
    indexes: [request.method],
  });

  return response;
}
```

### Error Tracking

```typescript
// lib/error-tracking.ts
export async function logError(error: Error, context: Record<string, unknown>) {
  console.error('Application Error:', {
    message: error.message,
    stack: error.stack,
    ...context,
    timestamp: new Date().toISOString(),
    environment: process.env.CF_PAGES_BRANCH,
  });

  // If using external service
  if (process.env.SENTRY_DSN) {
    // Send to Sentry
  }
}
```

## CLI Reference

```bash
# Deploy preview
npx wrangler pages deploy .next --project-name=gallery

# Deploy production
npx wrangler pages deploy .next --project-name=gallery --branch=main

# View logs
npx wrangler pages deployment tail

# Set secrets
npx wrangler pages secret put PEXELS_API_KEY

# List deployments
npx wrangler pages deployments list

# Rollback
npx wrangler pages deployments rollback
```
