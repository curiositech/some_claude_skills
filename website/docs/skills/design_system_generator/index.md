---
name: design-system-generator
description: Generates production-ready design tokens from natural language descriptions. Outputs Tailwind configs, CSS custom properties, and DTCG W3C tokens from 24 trends + 31 AI-ready styles with 2800+ component examples.
allowed-tools: Read,Write,Bash,Glob
category: Design & Creative
tags:
  - design-system
  - tokens
  - tailwind
  - css
  - dtcg
pairs-with:
  - skill: vibe-matcher
    reason: Clarify emotional direction before generating tokens
  - skill: web-design-expert
    reason: Implement generated tokens in actual designs
  - skill: color-theory-palette-harmony-expert
    reason: Deep-dive on color choices within generated palette
  - skill: component-template-generator
    reason: Generate component code using these tokens
  - skill: design-system-documenter
    reason: Document generated tokens for team adoption
---

# Design System Generator

Transform natural language descriptions into production-ready design tokens. Powered by a comprehensive catalog:
- **24 design trends** from gallery-sources.json
- **31 AI-ready styles** from DesignPrompts (with mode/typography metadata)
- **2,800+ component examples** from 21st.dev (130 buttons, 73 heroes, 79 cards, etc.)
- **7 color palettes** with WCAG-compliant combinations
- **8 typography systems** with font pairings

## Quick Start

**Minimal example - generate a complete design system:**

```bash
# Step 1: Match description to trend
npx ts-node scripts/match-trend.ts "clean dashboard for developers"
# → Primary: swiss-modern (confidence: 85%)

# Step 2: Generate tokens in your preferred format
npx ts-node scripts/generate-tailwind.ts swiss-modern > tailwind.config.ts
npx ts-node scripts/generate-css-vars.ts swiss-modern > tokens.css
npx ts-node scripts/generate-tokens.ts swiss-modern > tokens.json
```

**Key principle**: Match first, then generate. The trend matcher ensures consistent output across all formats.

## Core Mission

Bridge the gap between "I want a modern tech startup look" and production-ready design tokens by:
1. Matching natural language to cataloged design trends
2. Generating tokens in industry-standard formats
3. Ensuring accessibility compliance in generated palettes

## When to Use

✅ Use when:
- Starting a new project and need a design foundation
- User describes desired aesthetic but needs actual token files
- Migrating from arbitrary colors to systematic design tokens
- Need consistent Tailwind + CSS vars from same source of truth

❌ Do NOT use when:
- User already has a complete design system (just help them use it)
- Need emotional/conceptual exploration (use vibe-matcher first)
- Need component code, not just tokens (use web-design-expert)
- Tweaking single values (just make the edit)

## Workflow

### Step 1: Match Description to Trend

```bash
npx ts-node scripts/match-trend.ts "bold indie game landing page"
```

Output:
```json
{
  "query": "bold indie game landing page",
  "primary": {
    "id": "neobrutalism",
    "name": "Neobrutalism",
    "score": 3.5,
    "matchedKeywords": ["bold", "indie", "creative"]
  },
  "secondary": {
    "id": "maximalism",
    "name": "Maximalism",
    "score": 2.0
  },
  "confidence": 0.85
}
```

### Step 2: Generate Tokens

Choose your output format based on project needs:

| Format | Command | Best For |
|--------|---------|----------|
| Tailwind | `generate-tailwind.ts` | Next.js, Vite + Tailwind projects |
| CSS Variables | `generate-css-vars.ts` | Vanilla CSS, framework-agnostic |
| DTCG JSON | `generate-tokens.ts` | Figma integration, Style Dictionary |

### Step 3: Integrate

**Tailwind** - merge with existing config:
```typescript
import generatedConfig from './tokens/tailwind.config';
import { Config } from 'tailwindcss';

const config: Config = {
  // ...your config
  theme: {
    extend: {
      ...generatedConfig.theme.extend,
    },
  },
};
```

**CSS Variables** - import in global styles:
```css
@import './tokens.css';

.button {
  background: var(--color-primary);
  box-shadow: var(--shadow-md);
}
```

## Available Trends (24 total)

### High-Fidelity (Full token sets)

| Trend ID | Style | Best For |
|----------|-------|----------|
| `neobrutalism` | Bold borders, hard shadows, vibrant colors | Indie products, creative agencies |
| `glassmorphism` | Frosted glass, blur effects, translucent | iOS apps, modern dashboards |
| `swiss-modern` | Clean grids, neutral sans-serif, high contrast | SaaS, developer tools, enterprise |
| `terminal-aesthetic` | Monospace, phosphor greens, CLI-inspired | Developer tools, hacker aesthetic |
| `web3-crypto` | Gradients, glows, futuristic | Fintech, blockchain, NFT |
| `claymorphism` | Soft 3D, rounded corners, pastel | Consumer apps, friendly products |

### Standard (Core tokens only)

`neumorphism`, `hyperminimalism`, `dark-mode`, `maximalism`, `3d-immersive`,
`motion-design`, `bold-typography`, `vibrant-colors`, `gamified-design`,
`retrofuturism`, `collage`, `sustainable-design`, `botanical-organic`,
`art-deco-revival`, `experimental-navigation`, `scroll-driven-animations`

> See `references/trend-mapping.md` for complete keyword mappings.

## Output Format Details

### Tailwind Config

Generates complete `theme.extend` object with:
- Semantic color names (e.g., `brutal-red`, `glass-white`)
- Custom shadows matching trend style
- Border radius appropriate for trend
- Animation keyframes where applicable

```typescript
// Example: neobrutalism output
{
  theme: {
    extend: {
      colors: {
        'brutal-red': '#FF5252',
        'brutal-cream': '#FEF3C7',
      },
      boxShadow: {
        'brutal': '4px 4px 0 0 #000000',
        'brutal-hover': '6px 6px 0 0 #000000',
      },
    },
  },
}
```

### CSS Custom Properties

Generates `:root` declaration (or custom scope):

```css
:root {
  /* Colors */
  --color-primary-red: #FF5252;
  --color-border: #000000;

  /* Typography */
  --font-display: "Archivo Black", sans-serif;

  /* Shadows */
  --shadow-md: 4px 4px 0 0 var(--color-shadow);
}
```

**Custom scopes for theming:**
```bash
npx ts-node generate-css-vars.ts neobrutalism --scope=.dark
npx ts-node generate-css-vars.ts neobrutalism --scope=[data-theme="brutal"]
```

### DTCG W3C Tokens

Industry-standard JSON format for design tool integration:

```json
{
  "$schema": "https://design-tokens.github.io/community-group/format/draft-2024.json",
  "color": {
    "primary": {
      "$value": "#FF5252",
      "$type": "color",
      "$description": "Attention-grabbing primary"
    }
  }
}
```

> See `references/output-formats.md` for complete format documentation.

## Handling Ambiguity

When confidence &lt; 60% or multiple trends score similarly:

### Option 1: Ask for clarification
```
Match results show both "swiss-modern" (45%) and "hyperminimalism" (42%).

Swiss-modern: Grid-based, professional, Helvetica-style typography
Hyperminimalism: Zen-like calm, extreme whitespace, essential elements only

Which direction resonates more with your brand?
```

### Option 2: Use vibe-matcher first
```bash
# Get emotional clarity
/vibe-matcher "I want it to feel calm but still professional"

# Then generate with matched trend
npx ts-node scripts/generate-tailwind.ts hyperminimalism
```

### Option 3: Blend manually
Generate both and selectively merge:
```bash
npx ts-node generate-css-vars.ts swiss-modern > swiss.css
npx ts-node generate-css-vars.ts hyperminimalism > hyper.css
# Manually combine preferred tokens from each
```

## Accessibility

All generated tokens are evaluated for WCAG 2.1 compliance:

| Trend | Accessibility | Notes |
|-------|---------------|-------|
| swiss-modern | ✅ AA+ | High contrast, readable typography |
| neobrutalism | ✅ AA+ | Extreme contrast, large text |
| terminal-aesthetic | ✅ AAA | High contrast phosphor colors |
| glassmorphism | ⚠️ Needs attention | Blur can reduce contrast |
| claymorphism | ⚠️ Needs attention | Soft shadows may not meet contrast |

> See `references/accessibility.md` for remediation strategies.

## Common Patterns

### Pattern: Dark/Light Theme Pair

```bash
# Generate both themes
npx ts-node generate-css-vars.ts swiss-modern --scope=:root
npx ts-node generate-css-vars.ts swiss-modern --scope=.dark

# Combine in single file
cat light.css dark.css > themes.css
```

### Pattern: Component Library Bootstrap

```bash
# 1. Generate tokens
npx ts-node generate-tailwind.ts neobrutalism > tailwind.tokens.ts

# 2. Merge into tailwind.config.ts
# 3. Build components using semantic token names:
# className="bg-brutal-cream border-3 border-brutal-black shadow-brutal"
```

### Pattern: Design System Documentation

Generate all three formats for comprehensive docs:
```bash
mkdir -p docs/tokens
npx ts-node generate-tokens.ts neobrutalism > docs/tokens/tokens.json
npx ts-node generate-css-vars.ts neobrutalism > docs/tokens/variables.css
npx ts-node generate-tailwind.ts neobrutalism > docs/tokens/tailwind.ts
```

## Troubleshooting

### Issue: "Unknown trend" error
**Cause**: Trend ID doesn't match catalog
**Fix**: Run `match-trend.ts` first to get valid trend ID, or check available trends list above

### Issue: Low confidence match
**Cause**: Description too vague or conflicting keywords
**Fix**: Use vibe-matcher for emotional clarity first, or provide more specific keywords

### Issue: Generated colors fail contrast
**Cause**: Some trends prioritize aesthetics over accessibility
**Fix**: See `references/accessibility.md` for per-trend remediation strategies

### Issue: Tailwind classes not working
**Cause**: Config not properly merged
**Fix**: Ensure generated config is spread into `theme.extend`, not replacing entire theme

## Token Categories

All formats include these categories:

| Category | Tokens Included |
|----------|-----------------|
| **Colors** | Primary, secondary, accent, neutrals, semantic (border, shadow, text) |
| **Typography** | Font families (display, body), sizes (xs-5xl), weights, line heights |
| **Spacing** | Scale from 0 to 24 (0.25rem increments) |
| **Border Radius** | Trend-specific (0 for brutal, large for clay) |
| **Shadows** | Size variants (sm, md, lg), interaction states (hover, active) |
| **Effects** | Blur (glass), transitions, borders |

## Data Source

Tokens are generated from `website/design-catalog/gallery-sources.json`:
- 24 design trends with status (rising/mainstream/emerging)
- CSS pattern signatures for each trend
- Color palettes (vibrant, vintage, dopamine, terminal, web3, etc.)
- Typography systems (display + body font pairings)
- 2,800+ component examples from 21st.dev, FreeFrontend, DesignPrompts

### Component Counts (21st.dev)

Use these counts to prioritize token coverage:

| Category | Count | Token Priority |
|----------|-------|----------------|
| Buttons | 130 | High (variants, states) |
| Inputs | 102 | High (validation states) |
| Cards | 79 | High (shadow, border) |
| Heroes | 73 | Medium (gradients, animation) |
| Selects | 62 | Medium (dropdown styling) |
| Sliders | 45 | Medium (track, thumb) |
| Accordions | 40 | Low (uses base tokens) |
| CTAs | 34 | High (emphasis colors) |
| Backgrounds | 33 | Medium (patterns, effects) |
| Nav Menus | 11 | Medium (hierarchy) |

## See Also

### Core References
- `references/trend-mapping.md` - Complete keyword-to-trend mappings
- `references/output-formats.md` - Format specifications and examples
- `references/accessibility.md` - WCAG compliance by trend

### Extended References
- `references/design-prompts-styles.md` - 31 AI-ready styles with mode/typography
- `references/advanced-css-techniques.md` - Scroll-driven animations, :has(), 3D transforms

### Related Skills
- component-template-generator - Generate components using these tokens
- design-system-documenter - Document tokens for team adoption
