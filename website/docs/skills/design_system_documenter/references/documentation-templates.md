---
title: Documentation Templates
sidebar_label: Documentation Templates
sidebar_position: 2
---
# Documentation Templates

## Docusaurus/VitePress Template

```markdown
---
sidebar_position: 1
title: Design Tokens
description: Complete design token reference for [Project Name]
---

import ColorSwatch from '@site/src/components/ColorSwatch';

# Design Tokens

This page documents all design tokens generated from the **[trend-name]** design trend.

## Installation

### CSS Variables
```css
@import 'path/to/tokens.css';
```

### Tailwind
```js
// tailwind.config.js
import tokens from './tokens/tailwind.config';
export default {
  theme: { extend: tokens.theme.extend }
};
```

## Color Tokens

### Primary Colors

| Token | Value | Preview | Usage |
|-------|-------|---------|-------|
| `--color-primary` | #HEX | <ColorSwatch color="#HEX" /> | CTAs, links |

[Continue for all color tokens...]

## Typography Tokens

### Font Families

| Token | Value | Usage |
|-------|-------|-------|
| `--font-display` | "Font Name", fallback | Headlines, hero text |
| `--font-body` | "Font Name", fallback | Body copy, UI text |

### Font Scale

| Token | Size | Line Height | Usage |
|-------|------|-------------|-------|
| `--font-size-xs` | 0.75rem (12px) | 1.5 | Captions, labels |
| `--font-size-sm` | 0.875rem (14px) | 1.5 | Secondary text |
| `--font-size-base` | 1rem (16px) | 1.5 | Body text |
| `--font-size-lg` | 1.125rem (18px) | 1.5 | Lead paragraphs |
| `--font-size-xl` | 1.25rem (20px) | 1.25 | Section headings |
| `--font-size-2xl` | 1.5rem (24px) | 1.25 | Page headings |
| `--font-size-3xl` | 1.875rem (30px) | 1.25 | Display text |
| `--font-size-4xl` | 2.25rem (36px) | 1.1 | Hero headlines |

## Spacing Tokens

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--spacing-0` | 0 | Reset margins |
| `--spacing-1` | 0.25rem (4px) | Tight gaps |
| `--spacing-2` | 0.5rem (8px) | Icon gaps |
| `--spacing-3` | 0.75rem (12px) | Form elements |
| `--spacing-4` | 1rem (16px) | Standard gap |
| `--spacing-6` | 1.5rem (24px) | Section padding |
| `--spacing-8` | 2rem (32px) | Card padding |
| `--spacing-12` | 3rem (48px) | Section margins |
| `--spacing-16` | 4rem (64px) | Page sections |

## Shadow Tokens

### Shadow Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | [value] | Subtle elevation |
| `--shadow-md` | [value] | Cards, buttons |
| `--shadow-lg` | [value] | Modals, dropdowns |

### Interactive Shadows

| State | Token | Transform |
|-------|-------|-----------|
| Default | `--shadow-md` | none |
| Hover | `--shadow-hover` | translate(-2px, -2px) |
| Active | `--shadow-active` | translate(2px, 2px) |

## Border Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--border-width` | 3px | Standard borders |
| `--border-color` | #000000 | All borders |
| `--radius-sm` | 2px | Subtle rounding |
| `--radius-md` | 4px | Default rounding |

## Accessibility

### Contrast Ratios

| Foreground | Background | Ratio | Level |
|------------|------------|-------|-------|
| `--color-text` | `--color-bg` | 14:1 | ✅ AAA |
| `--color-primary` | `--color-bg` | 4.8:1 | ✅ AA |

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```
```

## Storybook Template

```typescript
// design-tokens.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: 'Design System/Tokens',
  parameters: {
    docs: {
      description: {
        component: 'Complete design token reference',
      },
    },
  },
};

export default meta;

export const Colors: StoryObj = {
  render: () => (
    <div className="token-grid">
      {Object.entries(colorTokens).map(([name, value]) => (
        <div key={name} className="token-item">
          <div
            className="color-swatch"
            style={{ backgroundColor: value }}
          />
          <code>{name}</code>
          <span>{value}</span>
        </div>
      ))}
    </div>
  ),
};

export const Typography: StoryObj = {
  render: () => (
    <div className="type-scale">
      {fontSizes.map(({ name, value }) => (
        <p key={name} style={{ fontSize: value }}>
          {name}: The quick brown fox
        </p>
      ))}
    </div>
  ),
};

export const Shadows: StoryObj = {
  render: () => (
    <div className="shadow-grid">
      {shadows.map(({ name, value }) => (
        <div key={name} className="shadow-item" style={{ boxShadow: value }}>
          {name}
        </div>
      ))}
    </div>
  ),
};
```

## README Template

```markdown
# [Project] Design System

Design tokens generated from **[trend-name]** design trend.

## Quick Start

```bash
npm install @project/tokens
```

### CSS
```css
@import '@project/tokens/css';

.my-component {
  color: var(--color-primary);
  font-family: var(--font-body);
  padding: var(--spacing-4);
}
```

### Tailwind
```js
// tailwind.config.js
const tokens = require('@project/tokens/tailwind');

module.exports = {
  theme: {
    extend: tokens.theme.extend,
  },
};
```

### JavaScript/TypeScript
```typescript
import { colors, typography } from '@project/tokens';

const styles = {
  color: colors.primary,
  fontFamily: typography.body,
};
```

## Token Categories

- **Colors**: 12 semantic color tokens
- **Typography**: 2 font families, 8 size scales
- **Spacing**: 15-point spacing scale
- **Shadows**: 5 elevation levels
- **Borders**: Width, color, and radius tokens

## Documentation

Full documentation: [link to docs site]

## License

MIT
```
