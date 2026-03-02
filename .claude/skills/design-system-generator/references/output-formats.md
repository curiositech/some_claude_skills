# Output Formats Reference

## Problem

Different projects need design tokens in different formats. A Tailwind project needs `tailwind.config.ts`, a vanilla CSS project needs custom properties, and a design tool integration needs DTCG JSON.

## Available Output Formats

### 1. DTCG W3C Design Tokens (Universal)

**Script:** `generate-tokens.ts`
**Format:** JSON following [W3C Design Tokens Community Group draft](https://design-tokens.github.io/community-group/format/)

```json
{
  "$schema": "https://design-tokens.github.io/community-group/format/draft-2024.json",
  "color": {
    "primary": {
      "$value": "#FF5252",
      "$type": "color",
      "$description": "Attention-grabbing primary"
    }
  },
  "typography": {
    "display": {
      "$value": "Archivo Black, sans-serif",
      "$type": "fontFamily"
    }
  },
  "shadow": {
    "md": {
      "$value": { "offsetX": "4px", "offsetY": "4px", "blur": "0", "color": "#000" },
      "$type": "shadow"
    }
  }
}
```

**Use when:**
- Building a design tool integration
- Need format interoperability
- Working with Style Dictionary, Figma Tokens, or similar tools

### 2. Tailwind CSS Configuration

**Script:** `generate-tailwind.ts`
**Format:** TypeScript/JavaScript Tailwind config extension

```typescript
const config: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        'brutal-red': '#FF5252',
        'brutal-yellow': '#FFEB3B',
      },
      boxShadow: {
        'brutal': '4px 4px 0 0 #000000',
        'brutal-hover': '6px 6px 0 0 #000000',
      },
      animation: {
        'brutal-press': 'brutal-press 100ms ease-out',
      },
    },
  },
};
```

**Use when:**
- Project uses Tailwind CSS
- Want utility-first token access
- Need animation keyframes included

### 3. CSS Custom Properties

**Script:** `generate-css-vars.ts`
**Format:** CSS :root declaration (or custom scope)

```css
:root {
  /* Colors */
  --color-primary-red: #FF5252;
  --color-border: #000000;

  /* Typography */
  --font-display: "Archivo Black", sans-serif;
  --font-size-base: 1rem;

  /* Shadows */
  --shadow-md: 4px 4px 0 0 var(--color-shadow);
}
```

**Use when:**
- Vanilla CSS/SCSS project
- Framework-agnostic design system
- Need runtime CSS variable switching (themes)

## Format Selection Guide

| Project Type | Recommended Format |
|--------------|-------------------|
| Next.js + Tailwind | Tailwind config |
| Vanilla CSS | CSS Custom Properties |
| Figma integration | DTCG JSON |
| Design system docs | All three |
| Component library | CSS vars + Tailwind |

## Custom Scopes (CSS Variables)

The CSS generator supports custom selectors for theme switching:

```bash
# Default (:root)
npx ts-node generate-css-vars.ts neobrutalism

# Dark theme scope
npx ts-node generate-css-vars.ts neobrutalism --scope=.dark

# Data attribute scope
npx ts-node generate-css-vars.ts neobrutalism --scope=[data-theme="brutal"]
```

This enables runtime theme switching:

```css
:root { --color-bg: #ffffff; }
.dark { --color-bg: #1a1a1a; }
[data-theme="brutal"] { --color-bg: #FEF3C7; }
```

## Token Categories

All formats include these token categories:

1. **Colors** - Primary, secondary, neutral, semantic
2. **Typography** - Font families, sizes, weights, line heights
3. **Spacing** - Scale from 0 to 24 (rem-based)
4. **Border Radius** - Trend-specific rounding
5. **Shadows** - Box shadows with trend-specific styles
6. **Effects** - Blur, borders, transitions (format-dependent)
7. **Animations** - Keyframes and timing (Tailwind only)
