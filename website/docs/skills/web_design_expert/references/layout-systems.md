---
title: Layout Systems
sidebar_label: Layout Systems
sidebar_position: 2
---
# Layout Systems

Grid systems, spacing scales, and layout composition.

## Grid Decision Tree

```
IF content-heavy (blog, documentation, dashboard)
  → 12-column grid, consistent gutters

IF marketing/landing page
  → Flexible sections, asymmetric allowed, dramatic whitespace

IF e-commerce/catalog
  → CSS Grid auto-fit for responsive product grids

IF editorial/magazine
  → Mixed grid, large images, pull quotes, visual variety

IF app interface
  → Sidebar + main content, dense but organized
```

## Spacing Scale (8px Base)

```css
--space-1: 4px;   /* Tight: icon padding, inline elements */
--space-2: 8px;   /* Compact: form field padding */
--space-3: 16px;  /* Default: card padding, element gaps */
--space-4: 24px;  /* Comfortable: section gaps */
--space-5: 32px;  /* Generous: major section breaks */
--space-6: 48px;  /* Dramatic: hero margins */
--space-7: 64px;  /* Statement: page sections */
--space-8: 96px;  /* Massive: landing page breaks */
```

## Responsive Breakpoints

```css
/* Content-based breakpoints, not device-based */
/* Start mobile-first, add complexity as viewport grows */

/* Base: Mobile */
.container { padding: 16px; }

/* 640px: Content needs more room */
@media (min-width: 640px) {
  .container { max-width: 640px; padding: 24px; }
}

/* 1024px: Multi-column becomes useful */
@media (min-width: 1024px) {
  .container { max-width: 1024px; }
  .grid { grid-template-columns: repeat(2, 1fr); }
}

/* 1280px: Maximum content width reached */
@media (min-width: 1280px) {
  .container { max-width: 1200px; }
  .grid { grid-template-columns: repeat(3, 1fr); }
}
```

## Mobile-First Checklist

```
□ Touch targets minimum 44x44px
□ No hover-only interactions
□ Text readable without zooming (16px+ base)
□ Forms have appropriate input types (email, tel, date)
□ Images lazy-loaded and responsive
□ Navigation collapses to hamburger or bottom nav
□ Critical actions visible without scrolling
```

## Visual Hierarchy Checklist

```
□ Is the most important element immediately obvious?
□ Can users scan the page in 3 seconds and understand purpose?
□ Does the eye flow naturally from primary → secondary → tertiary?
□ Are clickable elements obviously clickable?
□ Is there a clear visual distinction between content types?
```

## Consistency Checklist

```
□ Same colors mean same things throughout?
□ Spacing follows a consistent scale?
□ Typography uses no more than 3 sizes/weights per page?
□ Interactive states (hover, focus, active) are predictable?
□ Icons follow same style (line weight, fill, size)?
```
