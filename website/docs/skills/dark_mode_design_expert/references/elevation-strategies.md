---
title: Elevation Strategies in Dark Mode
sidebar_label: Elevation Strategies in Dar...
sidebar_position: 2
---
# Elevation Strategies in Dark Mode

## The Core Problem

In light mode, shadows create visual hierarchy by simulating a light source from above. This breaks completely in dark mode:

```
LIGHT MODE                          DARK MODE
┌─────────────────┐                ┌─────────────────┐
│     Card        │                │     Card        │
│                 │                │                 │
└─────────────────┘                └─────────────────┘
       ████████ (shadow visible)         (shadow invisible!)
```

## Strategy 1: Surface Color Elevation (Recommended)

Material Design 3's approach: elevated surfaces are **lighter**, not shadowed.

```css
:root.theme-dark {
  /* Each elevation level is progressively lighter */
  --surface-0: #121212;   /* Base */
  --surface-1: #1e1e1e;   /* +5% white */
  --surface-2: #232323;   /* +7% white */
  --surface-3: #252525;   /* +8% white */
  --surface-4: #272727;   /* +9% white */
  --surface-5: #2c2c2c;   /* +11% white */
}

/* Modal (highest elevation) */
.modal {
  background: var(--surface-5);
}

/* Dropdown (medium elevation) */
.dropdown {
  background: var(--surface-3);
}

/* Card (low elevation) */
.card {
  background: var(--surface-1);
}

/* Page (base level) */
body {
  background: var(--surface-0);
}
```

### Calculating Overlay Percentages

```javascript
function calculateElevation(baseColor, level) {
  const overlayPercentages = [0, 5, 7, 8, 9, 11, 12, 14, 15, 16];
  const overlay = overlayPercentages[level] / 100;

  // Mix white into base color
  return mixColors(baseColor, '#ffffff', overlay);
}
```

## Strategy 2: Border Definition

Use subtle borders to define boundaries instead of shadows.

```css
:root.theme-dark {
  --border-subtle: rgba(255, 255, 255, 0.06);
  --border-default: rgba(255, 255, 255, 0.1);
  --border-emphasis: rgba(255, 255, 255, 0.16);
}

.card {
  background: var(--surface-1);
  border: 1px solid var(--border-default);
}

.card:hover {
  border-color: var(--border-emphasis);
}
```

## Strategy 3: Glow Effects (For Accents)

Replace drop shadows with ambient glow for interactive elements.

```css
.button-primary {
  background: var(--color-accent);
  /* Replace shadow with glow */
  box-shadow: 0 0 0 0 transparent;
  transition: box-shadow 0.2s ease;
}

.button-primary:hover {
  box-shadow: 0 0 20px rgba(56, 189, 248, 0.4);
}

.button-primary:focus {
  box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.5);
}
```

## Strategy 4: Hybrid Approach

Combine strategies based on context.

```css
:root.theme-dark {
  /* Modals get surface elevation + border + subtle shadow */
  --modal-bg: var(--surface-4);
  --modal-border: var(--border-default);
  --modal-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);

  /* Cards get surface elevation + border, no shadow */
  --card-bg: var(--surface-1);
  --card-border: var(--border-subtle);
  --card-shadow: none;

  /* Buttons get glow on interaction */
  --button-shadow-hover: 0 0 20px var(--glow-color);
}
```

## Z-Index Correlation

Higher z-index should correlate with higher surface elevation:

| Element | Z-Index | Surface Level | Border |
|---------|---------|---------------|--------|
| Page | 0 | 0 | none |
| Card | 1 | 1 | subtle |
| Sticky header | 10 | 2 | default |
| Dropdown | 20 | 3 | default |
| Modal backdrop | 40 | - | - |
| Modal | 50 | 5 | emphasis |
| Toast | 60 | 5 | emphasis |
| Tooltip | 70 | 4 | default |

## Animation Considerations

```css
/* Surface elevation changes should animate */
.card {
  background: var(--surface-1);
  transition: background 0.2s ease;
}

.card:hover {
  background: var(--surface-2);
}

/* Glow should animate smoothly */
.interactive {
  box-shadow: 0 0 0 0 transparent;
  transition: box-shadow 0.3s ease;
}

.interactive:focus {
  box-shadow: 0 0 16px var(--glow-color);
}
```

## Common Mistakes

### Mistake 1: Using Light Mode Shadows

```css
/* DON'T: Same shadow in dark mode */
.card {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* DO: Dark mode uses elevation */
:root.theme-dark .card {
  background: var(--surface-1);
  box-shadow: none;
}
```

### Mistake 2: Flat Design (No Hierarchy)

```css
/* DON'T: Everything same surface */
.card, .modal, .dropdown {
  background: #1e1e1e;
}

/* DO: Progressive elevation */
.card { background: var(--surface-1); }
.dropdown { background: var(--surface-3); }
.modal { background: var(--surface-5); }
```

### Mistake 3: Too Much Contrast in Elevation

```css
/* DON'T: Jarring jumps */
--surface-0: #000000;
--surface-1: #444444;  /* Too bright! */

/* DO: Subtle progression */
--surface-0: #121212;
--surface-1: #1e1e1e;  /* +5% white */
```

## Testing Elevation

1. **Squint test**: Can you still see hierarchy when squinting?
2. **Screenshot grayscale**: Does hierarchy survive desaturation?
3. **Low brightness**: Is elevation visible at minimum brightness?
4. **High brightness**: Does it wash out in bright environments?
