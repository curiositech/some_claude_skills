---
title: OLED Optimization Guide
sidebar_label: OLED Optimization Guide
sidebar_position: 3
---
# OLED Optimization Guide

## How OLED Displays Work

OLED (Organic Light-Emitting Diode) pixels emit their own light. Unlike LCD:
- Black pixels are **completely off** (true black)
- Each pixel consumes power proportional to its brightness
- Dark content = less power consumption

## Battery Savings Research

### Google's 2018 Study (Android)

| Brightness | Light Theme | Dark Theme | Savings |
|------------|-------------|------------|---------|
| 100% | 100% baseline | 63% | **37%** |
| 50% | 100% baseline | 79% | **21%** |
| 20% | 100% baseline | 91% | **9%** |

### Purdue University 2021 Study

| App | Max Brightness Savings | Average Use Savings |
|-----|------------------------|---------------------|
| Google Maps | 31% | 9% |
| Google News | 43% | 14% |
| YouTube | 47% | 7% |
| Calculator | 52% | 17% |
| Phone | 30% | 6% |
| Calendar | 48% | 17% |

**Key Finding:** Dark mode saves **39-47% battery at maximum brightness**, but only **3-9% at typical (30-40%) brightness**.

## Design Implications

### Pure Black (#000000) Considerations

**Pros:**
- Maximum battery savings on OLED
- True off state for pixels

**Cons:**
- "Black smearing" during scrolling (pixels slow to turn on)
- Harsh contrast with content
- OLED burn-in risk at edges

**Recommendation:** Use near-black (#0c1222, #121212) instead of pure black.

### Color Power Consumption

Colors consume different amounts of power on OLED:

| Color | Relative Power | Notes |
|-------|----------------|-------|
| Black | 0% | Pixels off |
| Blue | ~25% | Most efficient hue |
| Red | ~40% | Mid efficiency |
| Green | ~60% | Less efficient |
| White | 100% | All subpixels on |
| Yellow | ~80% | Red + Green |
| Cyan | ~65% | Green + Blue |
| Magenta | ~55% | Red + Blue |

**Implication:** Blue-tinted dark themes are more battery-efficient than warm/green-tinted ones.

## Optimized Dark Palette for OLED

```css
:root.theme-dark.oled-optimized {
  /* Near-black base (avoid pure #000 for smearing) */
  --bg-primary: #050505;
  --bg-secondary: #0a0a0a;
  --bg-elevated: #121212;

  /* Blue-tinted accents (more efficient) */
  --accent-primary: #60a5fa;    /* Blue-400 */
  --accent-secondary: #818cf8;  /* Indigo-400 */

  /* Avoid bright warm colors for large areas */
  --warning: #fbbf24;           /* Use sparingly */
  --error: #f87171;             /* Use sparingly */

  /* Text: off-white reduces power vs pure white */
  --text-primary: #e5e5e5;
  --text-secondary: #a3a3a3;
}
```

## Scroll Performance: Black Smearing

OLED pixels have asymmetric response times:
- **On → Off:** Fast (~1ms)
- **Off → On:** Slow (~10-20ms)

This causes "black smearing" when scrolling dark content.

### Mitigation Strategies

1. **Avoid pure black next to moving content**
   ```css
   /* Instead of pure black backgrounds */
   --bg: #000000;  /* Smearing risk */

   /* Use very dark gray */
   --bg: #0a0a0a;  /* Minimal smearing */
   ```

2. **Add subtle background patterns**
   ```css
   .scrollable-area {
     /* Subtle noise keeps pixels slightly active */
     background:
       #0a0a0a
       url("data:image/svg+xml,...") /* 1% noise pattern */;
   }
   ```

3. **Use blur/gradient edges**
   ```css
   .scroll-indicator {
     /* Gradient prevents hard black edge */
     background: linear-gradient(
       transparent,
       rgba(0, 0, 0, 0.5),
       #0a0a0a
     );
   }
   ```

## PWA/App Considerations

### Theme Color Meta Tag

```html
<!-- Light mode -->
<meta name="theme-color" content="#ffffff"
      media="(prefers-color-scheme: light)">

<!-- Dark mode - use your dark bg color -->
<meta name="theme-color" content="#0c1222"
      media="(prefers-color-scheme: dark)">
```

### Status Bar Styling (Mobile)

```css
/* iOS Safari */
:root.theme-dark {
  /* Ensure status bar blends with app */
  --apple-system-background: #0c1222;
}

/* Android Chrome */
@media (display-mode: standalone) {
  :root.theme-dark body {
    /* Match system UI */
    background: #0c1222;
  }
}
```

## Testing OLED Optimization

1. **Power profiler**: Use Android Studio's Energy Profiler
2. **Visual inspection**: Check for smearing during scroll
3. **Burn-in test**: Static elements should use varied colors
4. **Brightness range**: Test at 20%, 50%, 100% brightness

## OLED vs LCD Trade-offs

| Factor | OLED Priority | LCD Priority |
|--------|---------------|--------------|
| Battery | Pure/near black | Doesn't matter |
| Contrast | Can use high contrast | Avoid pure black |
| Smearing | Use #0a0a0a+ | Pure black OK |
| Burn-in | Vary static elements | Not a concern |
| Response | Consider pixel on/off | Even response |

## Recommendation

For web apps serving both OLED and LCD:

```css
:root.theme-dark {
  /* Balanced: works for both display types */
  --bg-primary: #0c1222;    /* Near-black, no smearing */
  --bg-secondary: #151b2e;  /* Subtle elevation */
  --text-primary: #f1f5f9;  /* Off-white, reduces power */
}

/* Optional: OLED-specific overrides for native apps */
@media (dynamic-range: high) {
  :root.theme-dark.oled-mode {
    --bg-primary: #050505;  /* Closer to true black */
  }
}
```
