# Next.js PWA Integration

## Using next-pwa

```bash
npm install next-pwa
```

### next.config.js Configuration

```javascript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/api\./,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: { maxEntries: 50, maxAgeSeconds: 3600 },
      },
    },
    {
      urlPattern: /\.(png|jpg|jpeg|svg|gif|webp)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'image-cache',
        expiration: { maxEntries: 100, maxAgeSeconds: 86400 * 30 },
      },
    },
  ],
});

module.exports = withPWA({
  // Your Next.js config
});
```

## Static Export (Cloudflare Pages)

For `output: 'export'`, next-pwa can't generate SW at build time. Use manual approach:

### 1. Create Custom Service Worker

```javascript
// public/sw.js
const CACHE_NAME = 'myapp-v1';

// ... (use patterns from service-worker-patterns.md)
```

### 2. Register Manually

```typescript
// lib/pwa.ts
export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    } catch (error) {
      console.error('SW registration failed:', error);
    }
  }
}
```

### 3. Call in Layout

```tsx
// app/layout.tsx
'use client';

import { useEffect } from 'react';
import { registerServiceWorker } from '@/lib/pwa';

export default function RootLayout({ children }) {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return <html>{/* ... */}</html>;
}
```

## Workbox CLI Alternative

For more control with static exports:

```bash
npm install workbox-cli --save-dev
```

```javascript
// workbox-config.js
module.exports = {
  globDirectory: 'out/',
  globPatterns: ['**/*.{html,js,css,png,jpg,svg}'],
  swDest: 'out/sw.js',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/api\./,
      handler: 'NetworkFirst',
    },
  ],
};
```

```json
// package.json
{
  "scripts": {
    "build": "next build && npx workbox generateSW workbox-config.js"
  }
}
```

## Manifest in Next.js App Router

```tsx
// app/manifest.ts
import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'My App',
    short_name: 'App',
    start_url: '/',
    display: 'standalone',
    background_color: '#1a1410',
    theme_color: '#1a1410',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
```
