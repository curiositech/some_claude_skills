# Color & Accessibility

Color palettes, psychology, dark mode, and WCAG compliance.

## Minimum Viable Palette

```
PRIMARY: Main brand color (CTAs, key elements)
SECONDARY: Supporting color (headers, accents)
NEUTRAL DARK: Text, borders (#1a1a1a to #333)
NEUTRAL MID: Secondary text, disabled (#666 to #999)
NEUTRAL LIGHT: Backgrounds, cards (#f5f5f5 to #fafafa)
ACCENT: Success/error/warning (semantic colors)
```

## Color Psychology Quick Reference

| Color | Conveys | Use For |
|-------|---------|---------|
| Blue | Trust, stability, professional | Finance, healthcare, enterprise |
| Green | Growth, nature, success | Wellness, finance, sustainability |
| Red | Energy, urgency, passion | Food, entertainment, errors |
| Orange | Friendly, confident, creative | Startups, creative agencies |
| Purple | Luxury, wisdom, creativity | Beauty, education, premium |
| Yellow | Optimism, warmth, caution | Warnings, highlights (use sparingly) |
| Black | Sophistication, power, luxury | Fashion, luxury, minimalism |

## Dark Mode Guidelines

**DO:**
- Reduce brightness of images (filter: brightness(0.85))
- Use dark grays (#121212) not pure black (#000)
- Increase contrast for text (bump from 400 to 450 weight)
- Reduce shadow intensity

**DON'T:**
- Simply invert colors (looks jarring)
- Keep same accent color saturation (lower by 10-20%)
- Forget to test colored text on dark backgrounds

## WCAG 2.1 AA Visual Checklist

```
□ Color contrast 4.5:1 for text, 3:1 for large text
□ Information not conveyed by color alone
□ Focus indicators visible (don't remove outline)
□ Animations can be paused/reduced (prefers-reduced-motion)
□ Text resizable to 200% without breaking layout
□ Touch targets 44x44px minimum
□ Error states clearly indicated (not just red)
```

## Focus State Template

```css
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Don't do this: */
:focus { outline: none; } /* Removes accessibility */
```

## Brand Styles Reference

### Brutalist
Raw HTML aesthetic, high contrast, monospace fonts. Use for: Art galleries, experimental studios.

### Neumorphic
Soft shadows, raised/recessed effects, monochromatic. Use for: Apps, dashboards (sparingly—accessibility concerns).

### Glassmorphic
Frosted glass effects, transparency, depth. Use for: Modern apps, overlays, cards.

### Minimalist
Maximum whitespace, typography-focused, limited palette. Use for: Luxury brands, portfolios.

### Editorial
Magazine-inspired, mixed typography, large imagery. Use for: Blogs, news sites, storytelling.
