---
title: CSS Dark Mode Implementation Patterns
sidebar_label: CSS Dark Mode Implementatio...
sidebar_position: 1
---
# CSS Dark Mode Implementation Patterns

## The Modern Stack (2024-2025)

### 1. `color-scheme` Property

Tells the browser which color schemes your page supports:

```css
/* Support both */
:root {
  color-scheme: light dark;
}

/* This enables native styling for:
   - Scrollbars
   - Form controls
   - Selection highlighting
   - System colors
*/
```

### 2. `prefers-color-scheme` Media Query

Detect user's system preference:

```css
/* Light mode (explicit) */
@media (prefers-color-scheme: light) {
  :root {
    --bg: #ffffff;
    --text: #1f2937;
  }
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #0c1222;
    --text: #f1f5f9;
  }
}
```

### 3. `light-dark()` Function (CSS Color Level 5)

New in 2024 - inline theme switching:

```css
:root {
  color-scheme: light dark;
}

.card {
  /* First value for light, second for dark */
  background: light-dark(#ffffff, #1e1e1e);
  color: light-dark(#1f2937, #f3f4f6);
  border: 1px solid light-dark(#e5e7eb, rgba(255,255,255,0.1));
}
```

**Browser Support (Jan 2025):** Chrome 123+, Firefox 120+, Safari 17.5+

## Implementation Patterns

### Pattern A: CSS Custom Properties (Recommended)

```css
/* Base tokens - light mode default */
:root {
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f8fafc;
  --color-text-primary: #0f172a;
  --color-text-secondary: #475569;
  --color-border: #e2e8f0;
  --color-accent: #0284c7;
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Dark mode overrides */
@media (prefers-color-scheme: dark) {
  :root:not(.theme-light) {
    --color-bg-primary: #0c1222;
    --color-bg-secondary: #151b2e;
    --color-text-primary: #f1f5f9;
    --color-text-secondary: #94a3b8;
    --color-border: rgba(255, 255, 255, 0.1);
    --color-accent: #38bdf8;
    --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4);
  }
}

/* Explicit dark mode class (overrides system) */
:root.theme-dark {
  --color-bg-primary: #0c1222;
  /* ... same as above ... */
}

/* Explicit light mode class (overrides system) */
:root.theme-light {
  --color-bg-primary: #ffffff;
  /* ... same as above ... */
}

/* Components consume semantic tokens */
.card {
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-md);
}
```

### Pattern B: Data Attribute Selector

```css
/* Using data attribute for theme state */
[data-theme="light"] {
  --bg: #ffffff;
  --text: #1f2937;
}

[data-theme="dark"] {
  --bg: #0c1222;
  --text: #f1f5f9;
}

/* System preference fallback */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --bg: #0c1222;
    --text: #f1f5f9;
  }
}
```

```javascript
// Toggle theme
document.documentElement.dataset.theme = 'dark';
```

### Pattern C: Class-Based (Simple)

```css
.theme-light {
  --bg: #ffffff;
  --text: #1f2937;
}

.theme-dark {
  --bg: #0c1222;
  --text: #f1f5f9;
}
```

## Preventing Flash of Wrong Theme (FOWT)

### The Problem

```
1. Browser requests page
2. HTML loads with no theme class
3. CSS loads, applies light mode (default)
4. JavaScript runs, reads localStorage, applies dark class
5. Page flashes from light to dark ← BAD UX
```

### Solution: Blocking Script in `<head>`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">

  <!-- BLOCKING: Runs before CSS renders -->
  <script>
    (function() {
      // Check localStorage first
      const saved = localStorage.getItem('theme');
      if (saved === 'dark') {
        document.documentElement.classList.add('theme-dark');
      } else if (saved === 'light') {
        document.documentElement.classList.add('theme-light');
      }
      // If no saved preference, CSS media queries handle it
    })();
  </script>

  <!-- CSS loads after theme class is set -->
  <link rel="stylesheet" href="styles.css">
</head>
```

### Alternative: CSS-Only with `@import`

```css
/* Import theme based on system preference */
@import url('light.css') (prefers-color-scheme: light);
@import url('dark.css') (prefers-color-scheme: dark);
```

## Theme Switching JavaScript

### Complete Implementation

```typescript
type Theme = 'light' | 'dark' | 'system';

class ThemeManager {
  private static STORAGE_KEY = 'theme';

  static init() {
    // Apply saved theme immediately (called from head script)
    const saved = localStorage.getItem(this.STORAGE_KEY) as Theme | null;
    if (saved && saved !== 'system') {
      document.documentElement.classList.add(`theme-${saved}`);
    }

    // Listen for system changes
    window.matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', (e) => {
        if (!localStorage.getItem(this.STORAGE_KEY)) {
          // Only react if user hasn't set explicit preference
          this.updateMetaThemeColor(e.matches ? 'dark' : 'light');
        }
      });
  }

  static setTheme(theme: Theme) {
    const root = document.documentElement;
    root.classList.remove('theme-light', 'theme-dark');

    if (theme === 'system') {
      localStorage.removeItem(this.STORAGE_KEY);
    } else {
      root.classList.add(`theme-${theme}`);
      localStorage.setItem(this.STORAGE_KEY, theme);
    }

    this.updateMetaThemeColor(this.getEffectiveTheme());
  }

  static getTheme(): Theme {
    return (localStorage.getItem(this.STORAGE_KEY) as Theme) || 'system';
  }

  static getEffectiveTheme(): 'light' | 'dark' {
    const saved = this.getTheme();
    if (saved !== 'system') return saved;

    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  private static updateMetaThemeColor(theme: 'light' | 'dark') {
    const color = theme === 'dark' ? '#0c1222' : '#ffffff';
    let meta = document.querySelector('meta[name="theme-color"]');

    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      document.head.appendChild(meta);
    }

    meta.setAttribute('content', color);
  }
}
```

### React Hook

```typescript
import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'system';
    return (localStorage.getItem('theme') as Theme) || 'system';
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('theme-light', 'theme-dark');

    if (theme === 'system') {
      localStorage.removeItem('theme');
      setResolvedTheme(
        window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
      );
    } else {
      root.classList.add(`theme-${theme}`);
      localStorage.setItem('theme', theme);
      setResolvedTheme(theme);
    }
  }, [theme]);

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handler = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        setResolvedTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [theme]);

  return {
    theme,
    resolvedTheme,
    setTheme: setThemeState,
    isDark: resolvedTheme === 'dark',
  };
}
```

## Image Handling

### Approach 1: CSS Filters

```css
/* Dim images slightly in dark mode */
:root.theme-dark img:not([data-no-dim]) {
  filter: brightness(0.9);
}

/* Invert diagrams/icons that are black on white */
:root.theme-dark img[data-invert] {
  filter: invert(1) hue-rotate(180deg);
}
```

### Approach 2: Picture Element

```html
<picture>
  <source srcset="hero-dark.jpg" media="(prefers-color-scheme: dark)">
  <img src="hero-light.jpg" alt="Hero image">
</picture>
```

### Approach 3: CSS Background

```css
.hero {
  background-image: url('hero-light.jpg');
}

@media (prefers-color-scheme: dark) {
  .hero {
    background-image: url('hero-dark.jpg');
  }
}
```

## Form Element Styling

```css
/* Reset form elements to use theme colors */
:root.theme-dark {
  color-scheme: dark;
}

/* Custom form styling */
input, textarea, select {
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

input::placeholder {
  color: var(--color-text-muted);
}

/* Focus ring */
input:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(var(--color-accent-rgb), 0.2);
}
```

## Debugging Tips

### Chrome DevTools

1. **Emulate `prefers-color-scheme`:**
   - Open DevTools → Rendering tab → Emulate CSS media feature

2. **See computed values:**
   - Inspect element → Computed tab → Filter by CSS variable

### Testing Checklist

```javascript
// Test all theme states
const testThemes = () => {
  ['light', 'dark', 'system'].forEach(theme => {
    ThemeManager.setTheme(theme);
    console.log(`Theme: ${theme}, Effective: ${ThemeManager.getEffectiveTheme()}`);
    // Visual inspection or screenshot
  });
};
```
