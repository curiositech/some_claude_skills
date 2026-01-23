# Navigation Components

Mobile navigation patterns optimized for touch and safe areas.

## BottomNav Component

Fixed bottom navigation with safe area padding and active state handling.

```tsx
// components/BottomNav.tsx
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

const navItems = [
  { href: '/', icon: HomeIcon, label: 'Home' },
  { href: '/meetings', icon: CalendarIcon, label: 'Meetings' },
  { href: '/tools', icon: ToolsIcon, label: 'Tools' },
  { href: '/my', icon: UserIcon, label: 'My Recovery' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-leather-900 border-t border-leather-700 pb-safe">
      <div className="flex justify-around">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={`
                flex flex-col items-center py-2 px-3 min-h-[56px] min-w-[64px]
                ${isActive ? 'text-ember-400' : 'text-leather-400'}
              `}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs mt-1">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

**Key patterns:**
- `pb-safe` for notch/home indicator clearance
- `min-h-[56px]` exceeds 44px touch target minimum
- Active state uses `startsWith` for nested routes
- Icons + labels for accessibility

---

## Drawer Component

Portal-based slide-out drawer with body scroll lock and keyboard handling.

```tsx
// components/Drawer.tsx
'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Drawer({ isOpen, onClose, children }: DrawerProps) {
  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        className="absolute left-0 top-0 h-full w-[280px] max-w-[80vw]
                   bg-leather-900 shadow-xl transform transition-transform
                   animate-slide-in-left"
        role="dialog"
        aria-modal="true"
      >
        <div className="h-full overflow-y-auto pt-safe pb-safe">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
```

**Key patterns:**
- Portal renders outside component tree (avoids z-index issues)
- Body scroll lock prevents background scrolling
- Escape key dismissal for accessibility
- `max-w-[80vw]` prevents full-width takeover on tablets
- `pt-safe pb-safe` respects notch and home indicator
- Backdrop click to close

### Animation CSS

Add to your global CSS:

```css
@keyframes slide-in-left {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

.animate-slide-in-left {
  animation: slide-in-left 0.2s ease-out;
}
```

Or in Tailwind config:

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      animation: {
        'slide-in-left': 'slide-in-left 0.2s ease-out',
      },
      keyframes: {
        'slide-in-left': {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(0)' },
        },
      },
    },
  },
};
```
