# Swiss Modern Dark Mode

Dark mode has become the canonical surface for Swiss Modern web design. Linear and Vercel both treat dark as their primary theme. This guide covers palette inversion, contrast preservation, and implementation patterns.

## Philosophy

Traditional Swiss design was print-based (white paper). Dark mode is a contemporary extension, but it aligns with Swiss principles: **high contrast, functional color, restrained palette**. The key difference is that dark mode inverts the canvas without inverting the philosophy.

## Dark Mode Color Principles

### 1. Never Use Pure Black

Pure `#000000` causes OLED smearing (pixel-lag artifacts) and halation (excessive contrast causing eye strain with white text). Use near-blacks:

| Application | Hex | Rationale |
|-------------|-----|-----------|
| Deep background | `#08090a` | Linear's approach — barely-warm black |
| Standard background | `#0a0a0a` | Vercel's approach — neutral near-black |
| Alternative | `#09090b` | Zinc-950 family — very slightly cool |

### 2. Never Use Pure White for Body Text

Pure `#ffffff` on dark backgrounds causes halation (glow/halo around text). Reserve pure white for headlines only:

| Use | Color | Opacity Equivalent |
|-----|-------|-------------------|
| Primary text (headlines) | `#fafafa` or `#f7f8f8` | ~98% white |
| Secondary text (body) | `#a1a1aa` or `#b4b4b4` | ~70% white |
| Tertiary text (captions) | `#71717a` or `#707070` | ~44% white |
| Disabled / placeholder | `#52525b` or `#4a4a4a` | ~32% white |

### 3. Build Depth with Opacity, Not Color

Linear's approach: surfaces are differentiated by adding semi-transparent white overlays rather than discrete colors:

```css
:root[data-theme="dark"] {
  --surface-0: #08090a;                        /* Deepest */
  --surface-1: rgba(255, 255, 255, 0.02);      /* Panels */
  --surface-2: rgba(255, 255, 255, 0.04);      /* Cards */
  --surface-3: rgba(255, 255, 255, 0.06);      /* Popovers */
  --surface-4: rgba(255, 255, 255, 0.08);      /* Highlighted */

  --border: rgba(255, 255, 255, 0.06);
  --border-hover: rgba(255, 255, 255, 0.1);
}
```

**Alternative (opaque values for easier inspection):**

```css
:root[data-theme="dark"] {
  --surface-0: #09090b;     /* Background */
  --surface-1: #18181b;     /* Panels */
  --surface-2: #27272a;     /* Cards */
  --surface-3: #3f3f46;     /* Elevated */

  --border: #27272a;
  --border-hover: #3f3f46;
}
```

## Complete Dark Mode Token Set

```css
/* Dark mode via system preference */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    /* Surfaces */
    --swiss-white: #09090b;
    --swiss-snow: #18181b;
    --swiss-mist: #27272a;
    --swiss-silver: #3f3f46;

    /* Text */
    --swiss-black: #fafafa;
    --swiss-ink: #e4e4e7;
    --swiss-charcoal: #a1a1aa;
    --swiss-stone: #71717a;

    /* Accent — brighter for dark backgrounds */
    --swiss-accent: #3b82f6;
    --swiss-accent-hover: #60a5fa;
    --swiss-accent-light: rgba(59, 130, 246, 0.15);

    /* Semantic */
    --swiss-danger: #ef4444;
    --swiss-danger-light: rgba(239, 68, 68, 0.15);
    --swiss-success: #22c55e;
    --swiss-success-light: rgba(34, 197, 94, 0.15);
    --swiss-warning: #eab308;
    --swiss-warning-light: rgba(234, 179, 8, 0.15);

    /* Shadows — more opaque in dark mode */
    --swiss-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
    --swiss-shadow-md: 0 4px 6px rgba(0, 0, 0, 0.3);
    --swiss-shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.4);
  }
}

/* Dark mode via explicit toggle */
[data-theme="dark"] {
  /* Same values as above */
  --swiss-white: #09090b;
  --swiss-snow: #18181b;
  --swiss-mist: #27272a;
  --swiss-silver: #3f3f46;
  --swiss-black: #fafafa;
  --swiss-ink: #e4e4e7;
  --swiss-charcoal: #a1a1aa;
  --swiss-stone: #71717a;
  --swiss-accent: #3b82f6;
  --swiss-accent-hover: #60a5fa;
  --swiss-accent-light: rgba(59, 130, 246, 0.15);
  --swiss-danger: #ef4444;
  --swiss-danger-light: rgba(239, 68, 68, 0.15);
  --swiss-success: #22c55e;
  --swiss-success-light: rgba(34, 197, 94, 0.15);
  --swiss-warning: #eab308;
  --swiss-warning-light: rgba(234, 179, 8, 0.15);
  --swiss-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --swiss-shadow-md: 0 4px 6px rgba(0, 0, 0, 0.3);
  --swiss-shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.4);
}
```

## Contrast Ratios to Verify

Every text-on-background combination must meet WCAG AA (4.5:1 for normal text, 3:1 for large text):

| Text Token | Background | Minimum Ratio | Passes? |
|------------|-----------|---------------|---------|
| `#fafafa` on `#09090b` | Primary on bg | 19.4:1 | AAA |
| `#e4e4e7` on `#09090b` | Body on bg | 15.8:1 | AAA |
| `#a1a1aa` on `#09090b` | Secondary on bg | 7.3:1 | AAA |
| `#71717a` on `#09090b` | Tertiary on bg | 4.6:1 | AA |
| `#52525b` on `#09090b` | Disabled on bg | 3.1:1 | Large only |
| `#fafafa` on `#18181b` | Primary on surface | 16.3:1 | AAA |
| `#a1a1aa` on `#18181b` | Secondary on surface | 6.2:1 | AA |
| `#71717a` on `#18181b` | Tertiary on surface | 3.9:1 | Large only |

**Key warning**: Tertiary text (`#71717a`) on surface-1 (`#18181b`) drops below AA for normal text. Use it only for captions and non-essential metadata, never for body copy.

## Implementation Patterns

### Theme Toggle (JavaScript)

```javascript
function setTheme(theme) {
  if (theme === 'system') {
    document.documentElement.removeAttribute('data-theme');
    localStorage.removeItem('theme');
  } else {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }
}

// On page load: restore preference
(function() {
  const saved = localStorage.getItem('theme');
  if (saved) {
    document.documentElement.setAttribute('data-theme', saved);
  }
})();
```

### Theme Toggle Button (React)

```tsx
function ThemeToggle() {
  const [theme, setThemeState] = useState(() =>
    typeof window !== 'undefined'
      ? localStorage.getItem('theme') || 'system'
      : 'system'
  );

  const cycleTheme = () => {
    const next = theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system';
    setThemeState(next);
    setTheme(next);
  };

  return (
    <button onClick={cycleTheme} className="swiss-btn--ghost swiss-btn--icon">
      {theme === 'dark' ? '☀' : theme === 'light' ? '☾' : '◑'}
    </button>
  );
}
```

### Flash Prevention (SSR)

Add this script in `<head>` before any CSS loads to prevent flash of wrong theme:

```html
<script>
  (function() {
    var t = localStorage.getItem('theme');
    if (t) document.documentElement.setAttribute('data-theme', t);
  })();
</script>
```

## Dark Mode Component Adjustments

### Borders

In dark mode, borders need to be more subtle since the surface itself is dark:

```css
[data-theme="dark"] .swiss-card {
  border-color: rgba(255, 255, 255, 0.06);
}

[data-theme="dark"] .swiss-card:hover {
  border-color: rgba(255, 255, 255, 0.1);
}
```

### Shadows

Dark mode shadows need higher opacity since the background is already dark:

```css
[data-theme="dark"] .swiss-card--elevated {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}
```

### Images

Consider reducing image brightness to prevent glare:

```css
@media (prefers-color-scheme: dark) {
  img:not([data-no-dim]) {
    filter: brightness(0.9);
  }
}
```

### Code Blocks

Dark mode code blocks need inverted syntax highlighting:

```css
[data-theme="dark"] .swiss-code-block {
  background: #18181b;
  border-color: #27272a;
}
```

## Anti-Patterns

### Anti-Pattern: Inverting All Colors Mechanically

**Novice**: Use `filter: invert(1)` or swap every light color for its direct inverse
**Expert**: Dark mode requires a designed palette, not an inverted one. Warm blacks, not cold inverts. Each surface elevation must be manually considered.
**Instead**: Define a separate dark token set with intentional values

### Anti-Pattern: Pure Black Background

**Novice**: `background: #000000`
**Expert**: Pure black causes OLED pixel-lag artifacts and excessive contrast that strains eyes. Near-blacks like `#09090b` are the standard.
**Instead**: `background: #09090b` or `#0a0a0a`

### Anti-Pattern: Same Accent Color in Both Modes

**Novice**: Using `#0066ff` in both light and dark mode
**Expert**: An accent designed for white backgrounds may not have sufficient contrast on dark backgrounds. The accent must be adjusted (usually brightened) for dark mode.
**Instead**: Light: `#0066ff`, Dark: `#3b82f6` or `#60a5fa`

## Reference Sites (Dark Mode Swiss Modern)

| Site | Background | Text Primary | Accent | Approach |
|------|-----------|-------------|--------|----------|
| Linear | `#08090a` | `#f7f8f8` | `#5e6ad2` | Dark-first, opacity surfaces |
| Vercel | `#0a0a0a` | `#ededed` | `#0070f3` | Dark-first, Geist system |
| Raycast | `#0e0e10` | `#f0f0f0` | `#ff6363` | Dark-first, red accent |
| Cursor | `#0a0a0a` | `#e5e5e5` | `#00b4d8` | Dark-first, cyan accent |
| Mercury | `#0f0f0f` | `#f5f5f5` | `#2cd36f` | Dark-first, lime accent |
