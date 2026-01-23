# Background Sync

Background Sync allows queuing actions while offline and executing them when connectivity returns.

## Service Worker Sync Handler

```javascript
// In service worker
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-checkins') {
    event.waitUntil(syncCheckins());
  }
});

async function syncCheckins() {
  const db = await openDB();
  const pendingCheckins = await db.getAll('pending-checkins');

  for (const checkin of pendingCheckins) {
    try {
      await fetch('/api/checkins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkin),
      });
      await db.delete('pending-checkins', checkin.id);
    } catch (error) {
      // Will retry on next sync
      console.error('Sync failed:', error);
    }
  }
}
```

## Register Sync from App

```typescript
// When saving data offline
async function saveCheckin(data: CheckinData) {
  // Save to IndexedDB first
  await db.add('pending-checkins', { ...data, id: crypto.randomUUID() });

  // Request background sync
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    const registration = await navigator.serviceWorker.ready;
    await registration.sync.register('sync-checkins');
  }
}
```

## IndexedDB Helper

```typescript
// lib/db.ts
import { openDB as idbOpen } from 'idb';

export async function openDB() {
  return idbOpen('jb4l-offline', 1, {
    upgrade(db) {
      db.createObjectStore('pending-checkins', { keyPath: 'id' });
      db.createObjectStore('pending-journal', { keyPath: 'id' });
    },
  });
}
```

## Sync with Retry Logic

```javascript
async function syncWithRetry(items, endpoint, storeName, maxRetries = 3) {
  const db = await openDB();

  for (const item of items) {
    let attempts = item.attempts || 0;

    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.data),
      });

      // Success - remove from queue
      await db.delete(storeName, item.id);

    } catch (error) {
      attempts++;

      if (attempts >= maxRetries) {
        // Move to failed queue for manual review
        await db.put('failed-syncs', { ...item, attempts, error: error.message });
        await db.delete(storeName, item.id);
      } else {
        // Update attempt count
        await db.put(storeName, { ...item, attempts });
      }
    }
  }
}
```

## Browser Support

- Chrome 49+
- Edge 79+
- Firefox: Behind flag
- Safari: Not supported (use periodic manual sync)
