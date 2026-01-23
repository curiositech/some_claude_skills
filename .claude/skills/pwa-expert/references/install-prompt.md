# Install Prompt Implementation

## usePWAInstall Hook

```typescript
// hooks/usePWAInstall.ts
'use client';

import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return false;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    setDeferredPrompt(null);
    setIsInstallable(false);

    return outcome === 'accepted';
  };

  return { isInstallable, isInstalled, install };
}
```

## Install Prompt Component

```tsx
// components/InstallPrompt.tsx
'use client';

import { usePWAInstall } from '@/hooks/usePWAInstall';
import { useState } from 'react';

export function InstallPrompt() {
  const { isInstallable, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);

  if (!isInstallable || dismissed) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-80
                    bg-leather-800 border border-leather-600 rounded-lg p-4 shadow-lg
                    animate-slide-up z-50">
      <div className="flex items-start gap-3">
        <img src="/icons/icon-64.png" alt="" className="w-12 h-12 rounded-lg" />
        <div className="flex-1">
          <h3 className="font-bitter text-lg text-leather-100">Install JB4L</h3>
          <p className="text-sm text-leather-400 mt-1">
            Get quick access and offline support
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-leather-500 hover:text-leather-300"
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
      <div className="flex gap-2 mt-4">
        <button
          onClick={() => setDismissed(true)}
          className="flex-1 px-4 py-2 text-leather-400 hover:text-leather-200"
        >
          Not now
        </button>
        <button
          onClick={install}
          className="flex-1 px-4 py-2 bg-ember-500 hover:bg-ember-600
                     text-white rounded-lg font-medium"
        >
          Install
        </button>
      </div>
    </div>
  );
}
```

## Best Practices

1. **Don't show immediately** - Wait for user engagement or after they've used the app a few times
2. **Respect dismissal** - Store in localStorage if user says "Not now"
3. **Show value first** - Explain benefits: offline access, quick launch, etc.
4. **iOS handling** - iOS doesn't support `beforeinstallprompt`, show manual instructions instead
