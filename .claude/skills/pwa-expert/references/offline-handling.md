# Offline Handling

## Offline Page

```tsx
// app/offline/page.tsx
export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-leather-950">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">📡</div>
        <h1 className="font-bitter text-2xl text-leather-100 mb-2">
          You're Offline
        </h1>
        <p className="text-leather-400 mb-6">
          Check your connection and try again. Your saved data is still available.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-ember-500 hover:bg-ember-600
                     text-white rounded-lg font-medium"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
```

## useOnlineStatus Hook

```typescript
// hooks/useOnlineStatus.ts
'use client';

import { useState, useEffect } from 'react';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
```

## Offline Banner Component

```tsx
// components/OfflineBanner.tsx
'use client';

import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-amber-600 text-white
                    py-2 px-4 text-center text-sm z-50">
      You're offline. Some features may be unavailable.
    </div>
  );
}
```

## Offline-First Data Pattern

```typescript
// hooks/useOfflineData.ts
import { useState, useEffect } from 'react';
import { useOnlineStatus } from './useOnlineStatus';

export function useOfflineData<T>(
  key: string,
  fetcher: () => Promise<T>
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const isOnline = useOnlineStatus();

  useEffect(() => {
    async function loadData() {
      // Try localStorage first
      const cached = localStorage.getItem(key);
      if (cached) {
        setData(JSON.parse(cached));
        setLoading(false);
      }

      // Fetch fresh data if online
      if (isOnline) {
        try {
          const fresh = await fetcher();
          setData(fresh);
          localStorage.setItem(key, JSON.stringify(fresh));
        } catch (error) {
          console.error('Fetch failed:', error);
        }
      }

      setLoading(false);
    }

    loadData();
  }, [key, isOnline, fetcher]);

  return { data, loading, isOnline };
}
```
