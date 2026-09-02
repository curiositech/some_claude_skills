# Swiss Modern Grid System

Müller-Brockmann's mathematical grid theory translated to CSS Grid for modern web. The grid is not a convenience—it is the organizing principle that makes Swiss design Swiss.

## Historical Context

Josef Müller-Brockmann's *Grid Systems in Graphic Design* (1981) defined the modular grid as a mathematical framework for organizing visual content. The key insight: **the grid is not a cage, it is a skeleton**. Content within the grid can span, break, and interact—but every element references the same underlying structure.

The 12-column grid became standard because 12 is divisible by 2, 3, 4, and 6—enabling halves, thirds, quarters, and sixths without fractional columns.

## The 12-Column Grid

### Base Implementation

```css
:root {
  --grid-columns: 12;
  --grid-gutter: 1.5rem;    /* 24px */
  --grid-margin: 2rem;       /* 32px */
  --grid-max-width: 1200px;
}

.swiss-grid {
  display: grid;
  grid-template-columns: repeat(var(--grid-columns), 1fr);
  gap: var(--grid-gutter);
  max-width: var(--grid-max-width);
  margin-inline: auto;
  padding-inline: var(--grid-margin);
}
```

### Column Span Utilities

```css
/* Full width */
.col-full    { grid-column: 1 / -1; }      /* 12/12 */

/* Major spans */
.col-10      { grid-column: 2 / 12; }      /* 10/12 — wide content */
.col-8       { grid-column: 3 / 11; }      /* 8/12 — reading width */
.col-6       { grid-column: 4 / 10; }      /* 6/12 — narrow focus */

/* Halves */
.col-half-l  { grid-column: 1 / 7; }       /* Left half */
.col-half-r  { grid-column: 7 / -1; }      /* Right half */

/* Thirds */
.col-third   { grid-column: span 4; }      /* One third */

/* Quarters */
.col-quarter { grid-column: span 3; }      /* One quarter */

/* Asymmetric: sidebar + main (the Swiss signature) */
.col-sidebar { grid-column: 1 / 4; }       /* 3/12 sidebar */
.col-main    { grid-column: 5 / -1; }      /* 8/12 main, col 4 is gutter */

/* Reverse asymmetric */
.col-main-l  { grid-column: 1 / 9; }       /* 8/12 main */
.col-aside-r { grid-column: 10 / -1; }     /* 3/12 aside */
```

### Why Asymmetric Layouts

Swiss design prefers asymmetric over symmetric layouts. Symmetry is static; asymmetry creates visual movement and hierarchy. The classic ratio is 2:1 (8 columns content, 4 columns aside) or 3:1 (9 columns content, 3 columns aside).

```
Symmetric (avoid):
┌──────────────────────────────────────────┐
│     ┌──────────┐  ┌──────────┐          │
│     │  Content  │  │  Content  │          │
│     │  (6 col)  │  │  (6 col)  │          │
│     └──────────┘  └──────────┘          │
└──────────────────────────────────────────┘

Asymmetric (preferred):
┌──────────────────────────────────────────┐
│  ┌────────────────────┐  ┌──────┐       │
│  │    Main content     │  │ Aside │       │
│  │    (8 columns)      │  │(3 col)│       │
│  └────────────────────┘  └──────┘       │
└──────────────────────────────────────────┘
```

## Responsive Grid Collapse

The grid collapses predictably at each breakpoint:

```css
:root {
  --grid-columns: 4;
  --grid-gutter: 1rem;
  --grid-margin: 1rem;
}

/* Tablet: 8 columns */
@media (min-width: 640px) {
  :root {
    --grid-columns: 8;
    --grid-gutter: 1.5rem;
    --grid-margin: 2rem;
  }
}

/* Desktop: 12 columns */
@media (min-width: 1024px) {
  :root {
    --grid-columns: 12;
    --grid-gutter: 1.5rem;
    --grid-margin: 3rem;
  }
}

/* Wide: constrain and center */
@media (min-width: 1440px) {
  :root {
    --grid-margin: calc((100vw - var(--grid-max-width)) / 2);
  }
}
```

### Breakpoint Behavior Table

| Breakpoint | Columns | Gutter | Margin | Content Reflow |
|-----------|---------|--------|--------|----------------|
| <640px | 4 | 16px | 16px | Single column, full-width elements |
| 640-1024px | 8 | 24px | 32px | Two-column where meaningful |
| 1024-1440px | 12 | 24px | 48px | Full grid, asymmetric layouts |
| >1440px | 12 | 24px | Auto (centered) | Max-width constrains, margins grow |

## The 8px Baseline Grid

Every vertical measurement snaps to multiples of 8px. This creates visual rhythm:

```css
:root {
  --baseline: 8px;
}

/* Line heights snap to baseline */
body {
  font-size: 16px;
  line-height: 24px; /* 3 × 8px */
}

h1 {
  font-size: 48px;
  line-height: 56px; /* 7 × 8px */
}

h2 {
  font-size: 32px;
  line-height: 40px; /* 5 × 8px */
}

h3 {
  font-size: 24px;
  line-height: 32px; /* 4 × 8px */
}

/* All spacing uses 8px multiples */
.section-padding { padding: 96px 0; }   /* 12 × 8px */
.card-padding { padding: 32px; }        /* 4 × 8px */
.element-gap { gap: 24px; }             /* 3 × 8px */
```

## CSS Subgrid

Subgrid (supported in all modern browsers as of 2024) lets nested elements inherit parent grid tracks. Essential for Swiss alignment:

```css
/* Parent grid */
.page-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--grid-gutter);
}

/* Child inherits parent's column tracks */
.card-grid {
  display: grid;
  grid-template-columns: subgrid;
  grid-column: span 4;
}

/* Grandchild elements snap to the same grid lines */
.card-grid .card-title {
  grid-column: 1 / -1;
}
```

## Common Layout Patterns

### Documentation Layout

```css
.docs-layout {
  display: grid;
  grid-template-columns: 240px 1fr 200px;
  gap: var(--grid-gutter);
  max-width: 1400px;
  margin: 0 auto;
}

.docs-sidebar { /* Left nav */ }
.docs-content {
  max-width: var(--reading-width);
}
.docs-toc { /* Right table of contents */ }

/* Collapse on mobile */
@media (max-width: 1024px) {
  .docs-layout {
    grid-template-columns: 1fr;
  }
  .docs-sidebar,
  .docs-toc { display: none; }
}
```

### Feature Grid (3-up)

```css
.feature-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--grid-gutter);
}

.feature-card {
  grid-column: span 4; /* 4/12 = one third */
}

@media (max-width: 1024px) {
  .feature-card {
    grid-column: span 6; /* 2-up on tablet */
  }
}

@media (max-width: 640px) {
  .feature-card {
    grid-column: 1 / -1; /* Full width on mobile */
  }
}
```

### Hero with Asymmetric Split

```css
.hero {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--grid-gutter);
  align-items: center;
  min-height: 70vh;
  padding: var(--section-gap) 0;
}

.hero-content {
  grid-column: 1 / 7; /* Left 6 columns */
}

.hero-visual {
  grid-column: 7 / -1; /* Right 6 columns */
}

@media (max-width: 768px) {
  .hero-content,
  .hero-visual {
    grid-column: 1 / -1;
  }
}
```

### Pricing Grid (3-tier)

```css
.pricing-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--grid-gutter);
  align-items: start;
}

.pricing-card {
  grid-column: span 4;
}

.pricing-card--featured {
  grid-column: span 4;
  border-color: var(--swiss-accent);
  box-shadow: var(--shadow-lg);
}

@media (max-width: 768px) {
  .pricing-card {
    grid-column: 1 / -1;
  }
}
```

## Grid Visualization (Debug Tool)

```css
/* Show grid lines during development */
.swiss-grid--debug {
  position: relative;
}

.swiss-grid--debug::after {
  content: '';
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: repeat(var(--grid-columns), 1fr);
  gap: var(--grid-gutter);
  pointer-events: none;
  z-index: 9999;
}

.swiss-grid--debug::after {
  background: repeating-linear-gradient(
    90deg,
    rgba(0, 102, 255, 0.05) 0,
    rgba(0, 102, 255, 0.05) calc((100% - (var(--grid-columns) - 1) * var(--grid-gutter)) / var(--grid-columns)),
    transparent calc((100% - (var(--grid-columns) - 1) * var(--grid-gutter)) / var(--grid-columns)),
    transparent calc((100% - (var(--grid-columns) - 1) * var(--grid-gutter)) / var(--grid-columns) + var(--grid-gutter))
  );
}

/* Toggle with keyboard shortcut */
/* document.addEventListener('keydown', e => {
  if (e.ctrlKey && e.key === 'g') {
    document.querySelector('.swiss-grid').classList.toggle('swiss-grid--debug');
  }
}); */
```

## Content Width Guidelines

| Content Type | Max Width | Columns (of 12) | Rationale |
|-------------|-----------|-----------------|-----------|
| Body text | 65ch | 8 | Optimal reading measure |
| Headlines | 100% | 10-12 | Impact through scale |
| Code blocks | 80ch | 8-10 | Standard terminal width |
| Tables | 100% | 10-12 | Data needs horizontal space |
| Images (inline) | 100% | 8-12 | Context-dependent |
| Forms | 480px | 4-6 | Focused interaction |
| Cards | 100% | 3-4 each | Even distribution |

## Anti-Patterns

### Anti-Pattern: Percentage-Based Gutters

**Novice**: `gap: 2%`
**Expert**: Gutters are fixed values (24px, 32px), not percentages. Swiss grids have consistent gutters regardless of viewport width. Percentage gutters break the mathematical precision.
**Instead**: `gap: 1.5rem`

### Anti-Pattern: Auto-Fit Without Max Width

**Novice**: `grid-template-columns: repeat(auto-fit, minmax(300px, 1fr))`
**Expert**: Auto-fit is useful for responsive cards, but without max-width, content stretches to fill the viewport. Swiss design constrains width deliberately.
**Instead**: Always pair with `max-width` and `margin: 0 auto`

### Anti-Pattern: Breaking the Grid for "Visual Interest"

**Novice**: "Let this element break out of the grid for impact"
**Expert**: Elements that break the grid destroy the mathematical relationship. Swiss design creates interest through scale, weight, and whitespace within the grid, never outside it.
**Instead**: Use `grid-column: 1 / -1` for full-width impact while maintaining alignment
