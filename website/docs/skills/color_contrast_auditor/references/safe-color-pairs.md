---
title: Pre-Calculated Safe Color Pairs
sidebar_label: Pre-Calculated Safe Color Pair...
sidebar_position: 2
---
# Pre-Calculated Safe Color Pairs

Ready-to-use color combinations that pass WCAG AA (4.5:1 for normal text, 3:1 for large text).

## On White Backgrounds (#FFFFFF)

### Text Colors (4.5:1+ for body text)

| Color Name | Hex | RGB | Ratio | Notes |
|------------|-----|-----|-------|-------|
| Black | #000000 | 0, 0, 0 | 21:1 | Maximum contrast |
| Near Black | #1A1A1A | 26, 26, 26 | 16.1:1 | Softer than pure black |
| Charcoal | #333333 | 51, 51, 51 | 12.6:1 | Excellent for body text |
| Dark Gray | #4A4A4A | 74, 74, 74 | 9.0:1 | Good readability |
| Medium Gray | #595959 | 89, 89, 89 | 7.0:1 | AAA compliant |
| Gray | #767676 | 118, 118, 118 | 4.5:1 | Minimum AA for body |
| Navy | #003366 | 0, 51, 102 | 9.9:1 | Professional look |
| Dark Blue | #1565C0 | 21, 101, 192 | 5.4:1 | Links |
| Blue | #0066CC | 0, 102, 204 | 5.3:1 | Standard link blue |
| Dark Green | #2E7D32 | 46, 125, 50 | 5.1:1 | Success states |
| Forest Green | #1B5E20 | 27, 94, 32 | 8.4:1 | High contrast green |
| Dark Red | #C62828 | 198, 40, 40 | 6.0:1 | Errors |
| Maroon | #8B0000 | 139, 0, 0 | 9.4:1 | High contrast red |
| Purple | #6A1B9A | 106, 27, 154 | 8.1:1 | Accent |
| Dark Orange | #E65100 | 230, 81, 0 | 4.5:1 | Warnings (minimum) |
| Brown | #5D4037 | 93, 64, 55 | 8.0:1 | Earthy tone |

### Colors That FAIL on White

| Color Name | Hex | Ratio | Why It Fails |
|------------|-----|-------|--------------|
| Light Gray | #AAAAAA | 2.3:1 | Too light |
| Yellow | #FFFF00 | 1.1:1 | Nearly invisible |
| Lime | #00FF00 | 1.4:1 | Too bright |
| Cyan | #00FFFF | 1.3:1 | Too bright |
| Light Blue | #87CEEB | 2.1:1 | Too light |
| Pink | #FFC0CB | 1.6:1 | Too light |
| Light Green | #90EE90 | 1.6:1 | Too light |
| Orange | #FFA500 | 2.1:1 | Too light |

---

## On Black Backgrounds (#000000)

### Text Colors (4.5:1+)

| Color Name | Hex | RGB | Ratio | Notes |
|------------|-----|-----|-------|-------|
| White | #FFFFFF | 255, 255, 255 | 21:1 | Maximum |
| Off-White | #F5F5F5 | 245, 245, 245 | 18.1:1 | Slightly softer |
| Light Gray | #E0E0E0 | 224, 224, 224 | 13.4:1 | Excellent |
| Silver | #C0C0C0 | 192, 192, 192 | 9.0:1 | Good |
| Medium Gray | #9E9E9E | 158, 158, 158 | 6.3:1 | Readable |
| Gray | #8A8A8A | 138, 138, 138 | 5.0:1 | Minimum+ |
| Light Blue | #90CAF9 | 144, 202, 249 | 7.3:1 | Accent |
| Light Cyan | #80DEEA | 128, 222, 234 | 8.6:1 | Accent |
| Light Green | #A5D6A7 | 165, 214, 167 | 7.4:1 | Success |
| Light Yellow | #FFF59D | 255, 245, 157 | 15.5:1 | Highlight |
| Light Orange | #FFCC80 | 255, 204, 128 | 10.5:1 | Warning |
| Light Pink | #F8BBD9 | 248, 187, 217 | 9.0:1 | Accent |

---

## On Dark Gray (#1A1A1A / #212121)

### Text Colors (4.5:1+)

| Color Name | Hex | Ratio on #1A1A1A | Ratio on #212121 |
|------------|-----|------------------|------------------|
| White | #FFFFFF | 16.1:1 | 14.7:1 |
| Off-White | #F5F5F5 | 14.1:1 | 12.9:1 |
| Light Gray | #E0E0E0 | 10.6:1 | 9.7:1 |
| Silver | #BDBDBD | 7.3:1 | 6.7:1 |
| Light Blue | #64B5F6 | 5.6:1 | 5.1:1 |
| Amber | #FFCA28 | 11.3:1 | 10.3:1 |

---

## On Colored Backgrounds

### On Navy (#003366)

| Color Name | Hex | Ratio | Notes |
|------------|-----|-------|-------|
| White | #FFFFFF | 9.9:1 | Best choice |
| Light Yellow | #FFF8E1 | 9.3:1 | Warm accent |
| Light Cyan | #E0F7FA | 9.1:1 | Cool accent |
| Light Gray | #EEEEEE | 8.4:1 | Neutral |

### On Forest Green (#1B5E20)

| Color Name | Hex | Ratio | Notes |
|------------|-----|-------|-------|
| White | #FFFFFF | 8.4:1 | Recommended |
| Light Yellow | #FFF9C4 | 8.7:1 | High contrast |
| Light Gray | #F5F5F5 | 7.4:1 | Neutral |

### On Dark Red (#B71C1C)

| Color Name | Hex | Ratio | Notes |
|------------|-----|-------|-------|
| White | #FFFFFF | 7.8:1 | Best choice |
| Light Yellow | #FFFDE7 | 8.3:1 | Warning feel |
| Light Pink | #FCE4EC | 6.8:1 | Softer |

---

## Problematic Combinations to Avoid

### Red + Green (Color Blindness Risk)

```
❌ AVOID:
   Background: #4CAF50 (green)
   Text: #F44336 (red)
   Issue: Indistinguishable for deuteranopia

✅ INSTEAD:
   Use icons alongside color
   Or use blue/orange instead of red/green
```

### Yellow on White

```
❌ NEVER:
   Background: #FFFFFF
   Text: #FFEB3B (yellow)
   Ratio: 1.1:1 (essentially invisible)

✅ INSTEAD:
   Use dark yellow/gold: #F57F17 → Ratio: 3.5:1 (large text only)
   Or use amber: #FF8F00 → Ratio: 3.4:1 (large text only)
   For body text, use brown: #5D4037 → Ratio: 8.0:1
```

### Light Blue on White

```
❌ AVOID:
   Background: #FFFFFF
   Text: #03A9F4 (light blue)
   Ratio: 2.5:1

✅ INSTEAD:
   Use: #0277BD → Ratio: 5.4:1
   Or: #01579B → Ratio: 7.9:1
```

### Purple on Blue

```
❌ AVOID:
   Background: #3F51B5 (indigo)
   Text: #9C27B0 (purple)
   Ratio: 1.5:1

✅ INSTEAD:
   Text: #FFFFFF → Ratio: 5.9:1
   Text: #E1BEE7 → Ratio: 4.8:1
```

---

## Brand Color Accessibility Fixes

### When Client Insists on Brand Colors

**Scenario:** Brand color is #FF6B6B (coral) and they want it on white.

```
Original: #FF6B6B on #FFFFFF = 2.8:1 ❌

Options:
1. Darken the coral: #D32F2F → 5.6:1 ✓
2. Keep coral for large text only (≥24px): 2.8:1 passes 3:1? No, still fails
3. Use coral for decoration only, use #C62828 for text
4. Add dark background behind coral text
```

**Scenario:** Brand uses light gray (#BDBDBD) for "elegant" text.

```
Original: #BDBDBD on #FFFFFF = 1.9:1 ❌

Options:
1. Darken to #757575 → 4.6:1 ✓ (still "gray", but readable)
2. Darken to #616161 → 5.7:1 ✓ (better)
3. Use #BDBDBD only for decorative elements, not text
```

---

## Quick Lookup Table: Minimum Readable Grays

### On White (#FFFFFF)

| Purpose | Minimum Gray | Hex | Ratio |
|---------|--------------|-----|-------|
| Body text (AA) | 46% gray | #767676 | 4.5:1 |
| Body text (AAA) | 35% gray | #595959 | 7.0:1 |
| Large text (AA) | 54% gray | #8A8A8A | 3.0:1 |
| Placeholder (AA) | 46% gray | #757575 | 4.6:1 |

### On Black (#000000)

| Purpose | Maximum Gray | Hex | Ratio |
|---------|--------------|-----|-------|
| Body text (AA) | 54% gray | #8A8A8A | 5.0:1 |
| Body text (AAA) | 62% gray | #9E9E9E | 6.3:1 |
| Large text (AA) | 46% gray | #767676 | 4.0:1 |

---

## CSS Custom Properties Template

```css
:root {
  /* Accessible text colors on white */
  --text-primary: #1A1A1A;      /* 16.1:1 */
  --text-secondary: #595959;    /* 7.0:1 */
  --text-tertiary: #767676;     /* 4.5:1 - minimum */
  --text-link: #0066CC;         /* 5.3:1 */
  --text-error: #C62828;        /* 6.0:1 */
  --text-success: #2E7D32;      /* 5.1:1 */
  --text-warning: #E65100;      /* 4.5:1 */

  /* Accessible text colors on dark */
  --text-primary-dark: #F5F5F5; /* 14.1:1 on #1A1A1A */
  --text-secondary-dark: #BDBDBD; /* 7.3:1 */
  --text-tertiary-dark: #9E9E9E; /* 5.0:1 */
}
```

---

## Tailwind CSS Accessible Defaults

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // Accessible grays (on white)
        'a11y-gray': {
          'body': '#4A4A4A',     // 9.0:1
          'secondary': '#767676', // 4.5:1 (minimum)
          'placeholder': '#757575', // 4.6:1
        },
        // Accessible semantic colors
        'a11y-blue': '#0066CC',   // 5.3:1
        'a11y-green': '#2E7D32',  // 5.1:1
        'a11y-red': '#C62828',    // 6.0:1
        'a11y-orange': '#E65100', // 4.5:1
      }
    }
  }
}
```
