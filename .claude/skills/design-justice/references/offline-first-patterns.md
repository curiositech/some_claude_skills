# Offline-First Patterns for Intermittent Access

## The Problem

Traditional web apps assume:
- Stable, always-on internet
- Users can retry failed requests
- Sessions complete in one sitting
- Form state survives page refreshes

Reality for vulnerable populations:
- Public library computers have 30-60 minute session limits
- Mobile data runs out mid-month
- Shelter wifi is unreliable and shared
- Users may have ONE chance to complete a critical form
- Internet cafes charge by the minute

## Pattern: Auto-Save Everything

### Implementation

```typescript
// hooks/useAutoSave.ts
import { useEffect, useMemo, useCallback } from 'react';

interface SavedState<T> {
  data: T;
  savedAt: string;
  synced: boolean;
  version: number;
}

export function useAutoSave<T>(
  key: string,
  data: T,
  options: { debounceMs?: number } = {}
) {
  const { debounceMs = 500 } = options;

  // Save on every change (debounced)
  useEffect(() => {
    const timeout = setTimeout(() => {
      const state: SavedState<T> = {
        data,
        savedAt: new Date().toISOString(),
        synced: navigator.onLine,
        version: Date.now()
      };
      localStorage.setItem(key, JSON.stringify(state));
    }, debounceMs);

    return () => clearTimeout(timeout);
  }, [key, data, debounceMs]);

  // Restore saved data on mount
  const savedData = useMemo(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed: SavedState<T> = JSON.parse(saved);
        return parsed.data;
      }
    } catch {
      // Corrupted data - start fresh
    }
    return null;
  }, [key]);

  // Clear saved data
  const clearSaved = useCallback(() => {
    localStorage.removeItem(key);
  }, [key]);

  return { savedData, clearSaved };
}
```

### Usage in Forms

```tsx
function ExpungementWizard() {
  const [formData, setFormData] = useState<WizardData>(initialData);

  // Auto-save to localStorage
  const { savedData, clearSaved } = useAutoSave(
    'expungement-wizard-progress',
    formData
  );

  // Restore on mount
  useEffect(() => {
    if (savedData) {
      setFormData(savedData);
      // Show "Welcome back" message
    }
  }, []);

  // On successful submission
  const handleSubmit = async () => {
    await submitForm(formData);
    clearSaved(); // Only clear after confirmed submission
  };

  return (/* ... */);
}
```

## Pattern: Visible Sync Status

### The Status Indicator

Users need to know their data is safe. Always show sync status.

```tsx
// components/SyncStatus.tsx
interface SyncStatusProps {
  status: 'saved' | 'saving' | 'synced' | 'offline' | 'error';
  lastSaved?: Date;
}

export function SyncStatus({ status, lastSaved }: SyncStatusProps) {
  const messages = {
    saved: '✓ Saved to this device',
    saving: 'Saving...',
    synced: '✓ Up to date',
    offline: '⚡ Saved locally (will sync when online)',
    error: '⚠ Save failed - trying again...'
  };

  const colors = {
    saved: 'text-olive',      // Green-ish
    saving: 'text-mustard',   // Yellow
    synced: 'text-olive',
    offline: 'text-burnt-orange',
    error: 'text-terracotta'  // Not aggressive red
  };

  return (
    <div className={`text-sm ${colors[status]} flex items-center gap-2`}>
      <span>{messages[status]}</span>
      {lastSaved && status !== 'saving' && (
        <span className="text-brown/60">
          ({formatTimeAgo(lastSaved)})
        </span>
      )}
    </div>
  );
}
```

### Placement

- **Always visible** during form filling (sticky header or footer)
- **Not dismissible** - users shouldn't be able to hide it
- **Calm colors** - no alarming red unless truly critical

## Pattern: Background Sync

### Service Worker Setup

```typescript
// sw.ts (Service Worker)
const CACHE_NAME = 'expungement-guide-v1';
const SYNC_TAG = 'form-sync';

// Cache critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/eligibility',
        '/offline.html',
        // Critical CSS and JS
      ]);
    })
  );
});

// Handle offline navigation
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/offline.html');
      })
    );
  }
});

// Background sync when connection returns
self.addEventListener('sync', (event) => {
  if (event.tag === SYNC_TAG) {
    event.waitUntil(syncPendingForms());
  }
});

async function syncPendingForms() {
  const pending = await getPendingSubmissions();
  for (const submission of pending) {
    try {
      await fetch('/api/submit', {
        method: 'POST',
        body: JSON.stringify(submission.data)
      });
      await markAsSynced(submission.id);
    } catch {
      // Will retry on next sync event
    }
  }
}
```

### Registering Sync

```typescript
// When user submits form offline
async function submitForm(data: FormData) {
  if (navigator.onLine) {
    // Direct submission
    return await fetch('/api/submit', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  } else {
    // Queue for background sync
    await saveToIndexedDB('pending-submissions', {
      data,
      timestamp: Date.now()
    });

    // Register sync (will fire when online)
    const registration = await navigator.serviceWorker.ready;
    await registration.sync.register('form-sync');

    return { queued: true };
  }
}
```

## Pattern: Progressive Enhancement

### Text-First Views

Provide critical information without requiring JavaScript or heavy assets.

```tsx
// pages/[state]/index.tsx
export default function StatePage({ state }) {
  return (
    <article>
      {/* Critical info loads immediately, no JS needed */}
      <h1>{state.name} Expungement Guide</h1>
      <p>{state.summary.overview}</p>

      {/* Key eligibility info in plain text */}
      <section>
        <h2>Am I Eligible?</h2>
        <ul>
          {state.eligibilityCriteria.map(c => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </section>

      {/* Interactive wizard loads after */}
      <Suspense fallback={<p>Loading interactive guide...</p>}>
        <EligibilityWizard state={state} />
      </Suspense>
    </article>
  );
}
```

### Low-Bandwidth Mode

```typescript
// Detect slow connections
function useConnectionQuality() {
  const [quality, setQuality] = useState<'fast' | 'slow' | 'offline'>('fast');

  useEffect(() => {
    const connection = (navigator as any).connection;

    function updateQuality() {
      if (!navigator.onLine) {
        setQuality('offline');
      } else if (connection?.effectiveType === '2g' ||
                 connection?.effectiveType === 'slow-2g') {
        setQuality('slow');
      } else {
        setQuality('fast');
      }
    }

    updateQuality();
    connection?.addEventListener('change', updateQuality);
    window.addEventListener('online', updateQuality);
    window.addEventListener('offline', updateQuality);

    return () => {
      connection?.removeEventListener('change', updateQuality);
      window.removeEventListener('online', updateQuality);
      window.removeEventListener('offline', updateQuality);
    };
  }, []);

  return quality;
}

// Conditional rendering based on connection
function ImageOrPlaceholder({ src, alt, lowBandwidthText }) {
  const quality = useConnectionQuality();

  if (quality === 'slow' || quality === 'offline') {
    return <div className="bg-cream p-4 text-center">{lowBandwidthText}</div>;
  }

  return <img src={src} alt={alt} loading="lazy" />;
}
```

## Pattern: Resume Anywhere

### Session Persistence

Multi-step flows must survive browser crashes, session timeouts, and device switches.

```typescript
// Save current step and all answers
interface WizardSession {
  currentStep: number;
  totalSteps: number;
  answers: Record<string, any>;
  startedAt: string;
  lastActivityAt: string;
  completedSteps: number[];
}

function saveWizardSession(session: WizardSession) {
  // Save to localStorage (immediate)
  localStorage.setItem('wizard-session', JSON.stringify(session));

  // Also save to server if logged in (background)
  if (user.isAuthenticated) {
    queueSync('wizard-session', session);
  }
}

// Restore session with merge strategy
function restoreWizardSession(): WizardSession | null {
  const local = localStorage.getItem('wizard-session');
  const server = user.isAuthenticated ? await fetchServerSession() : null;

  if (!local && !server) return null;
  if (!server) return JSON.parse(local);
  if (!local) return server;

  // Merge: use whichever is more recent
  const localSession = JSON.parse(local);
  return new Date(localSession.lastActivityAt) > new Date(server.lastActivityAt)
    ? localSession
    : server;
}
```

### "Continue Where You Left Off" UI

```tsx
function WizardEntry() {
  const [existingSession, setExistingSession] = useState<WizardSession | null>(null);

  useEffect(() => {
    const session = restoreWizardSession();
    if (session) setExistingSession(session);
  }, []);

  if (existingSession) {
    return (
      <div className="bg-cream p-6 rounded-lg border border-mustard">
        <h2 className="text-lg font-semibold text-brown">
          Welcome Back!
        </h2>
        <p className="mt-2 text-brown/80">
          You were on step {existingSession.currentStep} of {existingSession.totalSteps}.
          Would you like to continue?
        </p>
        <div className="mt-4 flex gap-4">
          <button
            onClick={() => resumeSession(existingSession)}
            className="px-4 py-2 bg-burnt-orange text-cream rounded"
          >
            Continue Where I Left Off
          </button>
          <button
            onClick={() => {
              clearSession();
              setExistingSession(null);
            }}
            className="px-4 py-2 border border-brown text-brown rounded"
          >
            Start Over
          </button>
        </div>
      </div>
    );
  }

  return <WizardStart />;
}
```

## Pattern: Offline Page

### Graceful Degradation

When offline, show helpful information instead of an error.

```html
<!-- public/offline.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Offline - National Expungement Guide</title>
  <style>
    body {
      font-family: system-ui, sans-serif;
      background: #f5f0e6;
      color: #4a3728;
      padding: 2rem;
      max-width: 600px;
      margin: 0 auto;
    }
    h1 { color: #2d3d28; }
    .tip {
      background: #fff;
      border-left: 4px solid #d4a03a;
      padding: 1rem;
      margin: 1rem 0;
    }
  </style>
</head>
<body>
  <h1>You're Offline</h1>
  <p>Don't worry - your progress has been saved to this device.</p>

  <div class="tip">
    <strong>What you can still do:</strong>
    <ul>
      <li>Your form answers are saved</li>
      <li>When you're back online, everything will sync</li>
      <li>Downloaded PDFs are still available</li>
    </ul>
  </div>

  <div class="tip">
    <strong>To get back online:</strong>
    <ul>
      <li>Check your wifi or mobile data connection</li>
      <li>If at a library, the session may have expired</li>
      <li>Try refreshing this page when connected</li>
    </ul>
  </div>

  <p>
    <strong>Need help now?</strong> Call 211 for local assistance or
    visit your local legal aid office in person.
  </p>
</body>
</html>
```

## Testing Checklist

```
□ App works with airplane mode enabled
□ Form data survives browser crash (close tab mid-form)
□ "Saved" indicator visible at all times during form filling
□ Works on 2G connection speed (Chrome DevTools throttling)
□ Service worker caches critical pages
□ Background sync queues submissions when offline
□ "Resume" prompt appears when returning to incomplete form
□ Offline page is helpful, not just an error
□ No data loss tested: fill form, disconnect, reconnect, submit
□ IndexedDB storage doesn't exceed reasonable limits (~50MB)
```

## Anti-Patterns to Avoid

### ❌ "Please Connect to Internet"

```tsx
// WRONG - Unhelpful
if (!navigator.onLine) {
  return <div>Please connect to the internet to continue.</div>;
}
```

### ❌ Silent Data Loss

```tsx
// WRONG - Data lost on navigation
function Form() {
  const [data, setData] = useState({});
  // No persistence! User loses everything if they navigate away
}
```

### ❌ Required Real-Time Validation

```tsx
// WRONG - Blocks offline users
async function validateField(value) {
  const response = await fetch('/api/validate', { body: value });
  // Fails offline - user can't proceed
}

// RIGHT - Client-side validation with server enhancement
function validateField(value) {
  // Basic validation always works
  if (!value) return 'Required';
  if (value.length < 3) return 'Too short';

  // Enhanced validation when online (non-blocking)
  if (navigator.onLine) {
    queueServerValidation(value);
  }

  return null; // Valid for now
}
```

### ❌ Session Timeouts Without Warning

```tsx
// WRONG - Surprise timeout
setTimeout(() => {
  logout();
  redirect('/');
}, 30 * 60 * 1000); // 30 min timeout, no warning

// RIGHT - Warning before timeout
setTimeout(() => {
  showModal({
    title: "Session Expiring",
    message: "You've been inactive. Your progress is saved. " +
             "Click 'Continue' to keep working.",
    actions: [
      { label: 'Continue', onClick: extendSession },
      { label: 'Save & Exit', onClick: saveAndLogout }
    ]
  });
}, 25 * 60 * 1000); // Warn at 25 min
```
