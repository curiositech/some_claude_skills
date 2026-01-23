# PWA Update Flow

## usePWAUpdate Hook

```typescript
// hooks/usePWAUpdate.ts
'use client';

import { useState, useEffect } from 'react';

export function usePWAUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        setRegistration(reg);

        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          newWorker?.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setUpdateAvailable(true);
            }
          });
        });
      });
    }
  }, []);

  const applyUpdate = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };

  return { updateAvailable, applyUpdate };
}
```

## Update Banner Component

```tsx
// components/UpdateBanner.tsx
'use client';

import { usePWAUpdate } from '@/hooks/usePWAUpdate';

export function UpdateBanner() {
  const { updateAvailable, applyUpdate } = usePWAUpdate();

  if (!updateAvailable) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80
                    bg-ember-600 text-white rounded-lg p-4 shadow-lg z-50">
      <p className="font-medium mb-2">Update Available</p>
      <p className="text-sm opacity-90 mb-3">
        A new version is ready. Reload to get the latest features.
      </p>
      <button
        onClick={applyUpdate}
        className="w-full py-2 bg-white text-ember-600 rounded font-medium
                   hover:bg-gray-100 transition-colors"
      >
        Reload Now
      </button>
    </div>
  );
}
```

## Service Worker Message Handler

```javascript
// In sw.js
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
```

## Check for Updates Manually

```typescript
// Force check for updates
async function checkForUpdates() {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;
    await registration.update();
  }
}

// Call periodically or on user action
useEffect(() => {
  const interval = setInterval(checkForUpdates, 60 * 60 * 1000); // Every hour
  return () => clearInterval(interval);
}, []);
```

## Update Strategies

### 1. Immediate Update (Aggressive)
```javascript
// In sw.js - takes control immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  self.clients.claim();
});
```

### 2. User-Prompted Update (Recommended)
Wait for user to click "Update" before reloading. Less disruptive.

### 3. Background Update
Update on next visit. User gets new version automatically.

```javascript
// Only skipWaiting when no active clients
self.addEventListener('install', async (event) => {
  const clients = await self.clients.matchAll();
  if (clients.length === 0) {
    self.skipWaiting();
  }
});
```
