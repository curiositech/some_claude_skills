# Accessibility in Generated Design Systems

## Problem

Design tokens can produce inaccessible combinations. A generated color palette might have insufficient contrast, or typography might be too small for readability.

## WCAG Compliance by Trend

Each trend in our catalog has been evaluated for WCAG 2.1 compliance:

### ✅ High Accessibility (AA+ by default)

**Swiss Modern**
- High contrast black/white palette
- Readable sans-serif typography
- Clear visual hierarchy
- **Tip:** Avoid pure white (#FFFFFF) on pure black for extended reading

**Neobrutalism**
- Extremely high contrast (black borders on vibrant colors)
- Large, bold typography
- Clear interactive states
- **Tip:** Ensure text on colored backgrounds passes contrast

**Terminal Aesthetic**
- High contrast (bright on dark)
- Monospace fonts aid readability
- **Tip:** Green on black (classic) passes AAA; amber variants may need adjustment

### ⚠️ Requires Attention

**Glassmorphism**
- Blur effects can obscure text
- Translucent surfaces reduce contrast
- **Remediation:**
  - Use solid fallbacks for text containers
  - Add subtle text shadows for legibility
  - Test contrast with background variations

**Web3/Crypto**
- Gradient text can fail contrast
- Glow effects may not convey meaning
- **Remediation:**
  - Use solid colors for body text
  - Reserve gradients for decorative elements only
  - Ensure button states visible without color alone

**Claymorphism**
- Soft shadows may not provide sufficient distinction
- Pastel palettes can be low contrast
- **Remediation:**
  - Use darker variants for text
  - Add borders for focusable elements
  - Test with grayscale simulation

### ⚠️ Accessibility Challenges

**Dark Mode**
- Eye strain reduction is the goal
- But insufficient contrast is common
- **Remediation:**
  - Never use pure black (#000000) backgrounds
  - Use off-white (#E5E5E5) instead of pure white for text
  - Maintain 4.5:1 contrast ratio minimum

## Contrast Checking

Before using generated tokens, verify contrast ratios:

```javascript
// Quick contrast check
function getContrastRatio(fg, bg) {
  const getLuminance = (hex) => {
    const rgb = hex.match(/[A-Fa-f0-9]{2}/g).map(x => parseInt(x, 16) / 255);
    const [r, g, b] = rgb.map(c =>
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    );
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const l1 = getLuminance(fg);
  const l2 = getLuminance(bg);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

// WCAG requirements:
// AA: 4.5:1 for normal text, 3:1 for large text
// AAA: 7:1 for normal text, 4.5:1 for large text
```

## Generated Accessible Defaults

Our token generators include accessibility-friendly defaults:

| Token | Purpose | Guideline |
|-------|---------|-----------|
| `--font-size-base` | Body text | ≥16px (1rem) |
| `--line-height-normal` | Body text | ≥1.5 |
| `--color-text` on `--color-bg` | Primary content | ≥4.5:1 contrast |
| `--focus-ring` | Interactive focus | 3:1 against adjacent |

## Focus States

All generated systems include focus indicators:

```css
/* Neobrutalism: Bold shadow shift */
:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
}

/* Glassmorphism: Glow effect */
:focus-visible {
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.5);
}

/* Swiss: High contrast ring */
:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
```

## Testing Recommendations

1. **Color blindness simulation** - Test with Stark, Sim Daltonism
2. **Contrast checker** - WebAIM, Colour Contrast Analyser
3. **Screen reader** - VoiceOver, NVDA
4. **Keyboard navigation** - Tab through all interactive elements
5. **Motion sensitivity** - Respect `prefers-reduced-motion`

## Motion and Animation

Generated animations include reduced motion alternatives:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```
