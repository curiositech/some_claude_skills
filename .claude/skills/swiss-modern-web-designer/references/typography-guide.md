# Swiss Modern Typography Guide

Typography is not a component of Swiss design — it IS Swiss design. The International Typographic Style was named for its typography-first approach. Every visual decision flows from type.

## The Swiss Type Philosophy

1. **One family, many expressions** — Use a single typeface. Hierarchy through size and weight, not font switching.
2. **Mathematical scale** — Type sizes follow a mathematical ratio (Perfect Fourth: 1.333).
3. **Negative tracking on headlines** — Large text needs tighter letter-spacing for optical balance.
4. **Positive tracking on labels** — Small text needs looser spacing for legibility.
5. **Generous line height** — Body text at 1.5-1.6; headlines at 1.05-1.2.
6. **Constrained measure** — Line length capped at 65ch (45-75ch range).

## Font Selection Guide

### Tier 1: Primary Recommendations (Free, Production-Ready)

| Font | Source | Weights | Variable | Character | Best For |
|------|--------|---------|----------|-----------|----------|
| **Inter** | Google Fonts | 100-900 | Yes | Neutral, screen-optimized | Universal Swiss default |
| **Geist Sans** | Vercel (NPM/GitHub) | 100-900 | Yes | Technical, geometric | Developer tools, Next.js |
| **IBM Plex Sans** | Google Fonts | 100-700 | Yes | Technical, squared | Enterprise, technical |
| **Instrument Sans** | Google Fonts | Variable | Yes | Refined, polished | Startups, marketing |
| **Switzer** | Fontshare | 100-900 | Yes | Traditional Swiss | Branding, editorial |

### Tier 2: Alternative Stacks (Free)

| Font | Character | Best For |
|------|-----------|----------|
| Plus Jakarta Sans | Friendly geometric | Consumer SaaS, fintech |
| DM Sans | Clean, slight personality | Startup landing pages |
| Space Grotesk | Geometric, technical | Developer tools |
| Libre Franklin | Classic grotesk | Corporate, government |
| Public Sans | Government-origin neutral | Institutional, .gov |
| Work Sans | Relaxed grotesk | Content-heavy sites |
| Archivo | Variable width + weight | Dynamic, responsive |

### Tier 3: Premium (For When Budget Allows)

| Font | Foundry | Cost | Used By |
|------|---------|------|---------|
| Söhne | Klim | $$ | Stripe (custom cut) |
| Suisse Int'l | Swiss Typefaces | $$$ | Linear, agencies |
| GT America | Grilli Type | $$ | Fintech, SaaS |
| ABC Diatype | Dinamo | $$ | Design agencies |
| Neue Haas Grotesk | Monotype | $$ | Traditional Swiss |
| Untitled Sans | Klim | $$ | Minimal branding |

### Font Feature Settings

```css
/* Inter — enable tabular numbers and stylistic alternates */
.inter-features {
  font-feature-settings: 'cv01', 'cv02', 'cv03', 'cv04', 'cv11', 'tnum';
}

/* Geist Sans — geometric alternates */
.geist-features {
  font-feature-settings: 'ss02';
}

/* For data tables — always use tabular numbers */
.swiss-tabular {
  font-variant-numeric: tabular-nums;
  font-feature-settings: 'tnum';
}

/* For financial figures — lining numbers */
.swiss-lining {
  font-variant-numeric: lining-nums;
}

/* For body text — proportional oldstyle (if available) */
.swiss-prose {
  font-variant-numeric: proportional-nums;
}

/* Slashed zero for code */
.swiss-code-nums {
  font-feature-settings: 'zero', 'tnum';
}
```

## Type Scale Systems

### Perfect Fourth (1.333) — Recommended Default

| Step | Multiplier | Size | Use |
|------|-----------|------|-----|
| -2 | 0.563 | 9px | Never use (too small) |
| -1 | 0.75 | 12px | Captions, labels |
| 0 | 1.0 | 16px | Body (base) |
| 1 | 1.333 | 21px | H4, emphasis |
| 2 | 1.777 | 28px | H3 |
| 3 | 2.369 | 38px | H2 |
| 4 | 3.157 | 50px | H1 |
| 5 | 4.209 | 67px | Display |
| 6 | 5.61 | 90px | Hero (mobile clamp) |

```css
:root {
  --scale-ratio: 1.333;
  --text-xs:  calc(1rem / var(--scale-ratio));
  --text-sm:  0.875rem;
  --text-base: 1rem;
  --text-lg:  calc(1rem * var(--scale-ratio));
  --text-xl:  calc(1rem * var(--scale-ratio) * var(--scale-ratio));
  --text-2xl: calc(1rem * var(--scale-ratio) * var(--scale-ratio) * var(--scale-ratio));
  --text-3xl: calc(1rem * var(--scale-ratio) * var(--scale-ratio) * var(--scale-ratio) * var(--scale-ratio));
  --text-4xl: calc(1rem * var(--scale-ratio) * var(--scale-ratio) * var(--scale-ratio) * var(--scale-ratio) * var(--scale-ratio));
}
```

### Major Third (1.25) — Tighter, for Data-Dense UIs

```css
/* Tighter scale for dashboards, tables, dense content */
:root {
  --text-xs:  0.64rem;    /* 10px */
  --text-sm:  0.8rem;     /* 13px */
  --text-base: 1rem;      /* 16px */
  --text-lg:  1.25rem;    /* 20px */
  --text-xl:  1.563rem;   /* 25px */
  --text-2xl: 1.953rem;   /* 31px */
  --text-3xl: 2.441rem;   /* 39px */
  --text-4xl: 3.052rem;   /* 49px */
}
```

### Minor Third (1.2) — Most Compact

For extremely data-dense interfaces (admin panels, developer tools):

```css
:root {
  --text-xs:  0.694rem;
  --text-sm:  0.833rem;
  --text-base: 1rem;
  --text-lg:  1.2rem;
  --text-xl:  1.44rem;
  --text-2xl: 1.728rem;
  --text-3xl: 2.074rem;
  --text-4xl: 2.488rem;
}
```

## Letter-Spacing Rules

```css
/* Headlines: tighten as size increases */
h1 { letter-spacing: -0.025em; }
h2 { letter-spacing: -0.02em; }
h3 { letter-spacing: -0.015em; }
h4 { letter-spacing: -0.01em; }

/* Body: neutral */
p { letter-spacing: 0; }

/* Small text: loosen for legibility */
.caption { letter-spacing: 0.01em; }

/* Labels: uppercase needs extra tracking */
.label {
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 600;
  font-size: var(--text-xs);
}

/* Monospace: slightly negative for density */
code { letter-spacing: -0.02em; }
```

## Line Height Reference

| Text Type | Line Height | Rationale |
|-----------|------------|-----------|
| Display (4xl+) | 1.0-1.1 | Large text needs minimal leading |
| H1 | 1.1-1.15 | Tight but readable multi-line |
| H2 | 1.15-1.2 | Slightly more open |
| H3-H4 | 1.2-1.3 | Approaching body rhythm |
| Body | 1.5-1.6 | Optimal reading comfort |
| Small/Caption | 1.4-1.5 | Compact but legible |
| UI Labels | 1.0 | Single line, vertically centered |

## Responsive Typography

### Fluid Type with Clamp

```css
:root {
  /* Display: 40px at 320px viewport → 90px at 1440px viewport */
  --text-display: clamp(2.5rem, 1.5rem + 4vw, 5.625rem);

  /* H1: 32px → 50px */
  --text-h1: clamp(2rem, 1.25rem + 3vw, 3.157rem);

  /* H2: 24px → 38px */
  --text-h2: clamp(1.5rem, 1rem + 2vw, 2.369rem);

  /* H3: 20px → 28px */
  --text-h3: clamp(1.25rem, 1rem + 1vw, 1.777rem);

  /* Body stays fixed — no fluid scaling */
  --text-body: 1rem;
}
```

### When to Use Fluid vs Fixed

| Element | Approach | Reason |
|---------|----------|--------|
| Display/Hero | Fluid (`clamp`) | Dramatic scaling with viewport |
| H1-H2 | Fluid (`clamp`) | Proportional hierarchy at all sizes |
| H3-H4 | Fluid or fixed | Depends on content density |
| Body text | Fixed (16px) | Reading comfort doesn't scale with viewport |
| Captions/Labels | Fixed (12-14px) | Minimum legibility size |

## Monospace Pairing

Every Swiss design needs a monospace companion for code, data, and technical content:

| Sans-Serif Primary | Monospace Companion | Why |
|-------------------|--------------------|----|
| Inter | JetBrains Mono | Both optimize for screen readability |
| Geist Sans | Geist Mono | Matched from the same design family |
| IBM Plex Sans | IBM Plex Mono | Unified design language |
| Space Grotesk | Space Mono | Same design family |
| DM Sans | DM Mono | Same design family |

## Font Loading Performance

### Variable Font Strategy

Variable fonts are the Swiss Modern standard — one file, all weights:

```html
<!-- Preload the variable font file -->
<link rel="preload" href="/fonts/Inter-variable.woff2"
      as="font" type="font/woff2" crossorigin>

<style>
  @font-face {
    font-family: 'Inter';
    src: url('/fonts/Inter-variable.woff2') format('woff2-variations');
    font-weight: 100 900;
    font-display: swap;
    font-style: normal;
  }
</style>
```

### Next.js Optimization

```typescript
import { Inter, JetBrains_Mono } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-swiss',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-swiss-mono',
  display: 'swap',
});
```

### Performance Budget

| Metric | Target |
|--------|--------|
| Variable font file size | <25KB (woff2) |
| Total font weight | <50KB (primary + mono) |
| FOUT duration | <100ms with preload |
| CLS from font swap | 0 with `font-display: swap` + matching fallback |

## Hierarchy Through Weight, Not Font

The Swiss principle: express hierarchy within a single family.

```css
/* WRONG: Multiple font families for hierarchy */
h1 { font-family: 'Playfair Display'; }
h2 { font-family: 'Montserrat'; }
p  { font-family: 'Open Sans'; }

/* RIGHT: One family, hierarchy through weight and size */
h1 {
  font-family: var(--font-swiss);
  font-size: var(--text-4xl);
  font-weight: 700;
  letter-spacing: -0.025em;
}

h2 {
  font-family: var(--font-swiss);
  font-size: var(--text-3xl);
  font-weight: 600;
  letter-spacing: -0.02em;
}

p {
  font-family: var(--font-swiss);
  font-size: var(--text-base);
  font-weight: 400;
  letter-spacing: 0;
}
```

## Anti-Patterns

### Anti-Pattern: Using Helvetica Directly

**Novice**: `font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif`
**Expert**: Helvetica was designed for print. On screen, it has poor hinting, inconsistent rendering across platforms, and isn't free for web use. Inter was designed specifically as "Helvetica for screens."
**Instead**: `font-family: 'Inter', 'Helvetica Neue', sans-serif`

### Anti-Pattern: Bold Headlines

**Novice**: `font-weight: 900` on display text
**Expert**: Swiss tradition uses light weights (300-400) for large display text. The size creates hierarchy; heavy weight at large sizes is oppressive, not authoritative. However, for web SaaS, 600-700 is acceptable for headlines—just never 800-900.
**Timeline**: 1960s Swiss posters used regular/light weights at large sizes. Modern web Swiss (Stripe, Vercel) uses 500-700 for readability on screen.
**Instead**: `font-weight: 600` for web headlines, `font-weight: 300` for display-size text

### Anti-Pattern: Decorative Capitals

**Novice**: Drop caps, ornamental first letters, small-caps for style
**Expert**: Swiss typography is utilitarian. Uppercase is used only for labels and overlines at small sizes with wide tracking. Never for aesthetic effect on body text.
**Instead**: Reserve `text-transform: uppercase` for labels (12px, tracking 0.06em)
