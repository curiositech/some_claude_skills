---
name: typography-expert
description: Expert in typography, font selection, hierarchy, and typographic design principles
---

# Typography Expert

<SkillHeader
  skillName="Typography Expert"
  fileName="typography_expert"
  description="Expert in typography, font selection, hierarchy, and typographic design principles"
/>
![Hero Banner](/img/skills/typography-expert-hero.png)

**Master typographer specializing in font pairing, typographic hierarchy, OpenType features, variable fonts, and performance-optimized web typography.**

## Core Expertise

### Font Selection & Pairing
- **Font Psychology**: Understanding emotional impact and brand alignment through typeface selection
- **Pairing Principles**: Contrast, harmony, hierarchy through strategic font combinations
- **System Fonts**: Leveraging native system font stacks for performance
- **Web Font Optimization**: Subsetting, format selection (WOFF2, variable fonts)
- **Font Licensing**: Navigating commercial, open source, and custom font licensing

### Typographic Hierarchy
- **Scale Systems**: Modular scales, perfect fourths, golden ratio-based type scales
- **Visual Hierarchy**: Size, weight, color, spacing to guide reader attention
- **Responsive Typography**: Fluid type scales, viewport-based sizing, container queries
- **Vertical Rhythm**: Baseline grids, line-height systems, consistent spacing
- **Typographic Color**: Managing tonal contrast and visual weight

### Advanced OpenType
- **OpenType Features**: Ligatures, small caps, old-style numerals, contextual alternates
- **Variable Fonts**: Axis control (weight, width, optical size, custom axes)
- **Font Feature Settings**: CSS `font-feature-settings`, `font-variant-*` properties
- **Kerning & Tracking**: Optical vs. metric kerning, letterspacing for legibility
- **Hyphenation & Justification**: Language-specific hyphenation, ragged vs. justified text

### Performance Optimization
- **Font Loading Strategies**: FOUT, FOIT, FOFT strategies with `font-display`
- **Subsetting**: Unicode-range subsetting, language-specific character sets
- **Preloading**: Critical font preloading, resource hints
- **Self-Hosting vs CDN**: Trade-offs for privacy, performance, caching
- **Variable Font Compression**: Efficiency gains with multi-axis variable fonts

### Accessibility & Readability
- **Contrast Ratios**: WCAG AA/AAA compliance for text readability
- **Font Size Guidelines**: Minimum sizes, mobile-first considerations
- **Dyslexia-Friendly Typography**: Font choices, spacing, line length
- **RTL & Internationalization**: Right-to-left scripts, CJK typography, diacritics
- **Screen Reader Considerations**: Semantic markup for typographic emphasis

## Technical Implementation

### CSS Typography
```css
/* Modern type scale system */
:root {
  /* Fluid typography using clamp() */
  --fs-sm: clamp(0.875rem, 0.8rem + 0.375vw, 1rem);
  --fs-base: clamp(1rem, 0.9rem + 0.5vw, 1.25rem);
  --fs-md: clamp(1.25rem, 1.1rem + 0.75vw, 1.75rem);
  --fs-lg: clamp(1.75rem, 1.5rem + 1.25vw, 2.5rem);
  --fs-xl: clamp(2.5rem, 2rem + 2.5vw, 4rem);

  /* Variable font axes */
  --font-weight-light: 300;
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-bold: 700;

  /* Optical sizing for variable fonts */
  font-variation-settings: 'opsz' auto;
}

/* Performance-optimized font loading */
@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/custom-font.woff2') format('woff2');
  font-weight: 100 900; /* Variable font weight range */
  font-display: swap; /* Avoid FOIT */
  unicode-range: U+0020-007F; /* Latin basic subset */
}

/* OpenType features */
.sophisticated-text {
  font-feature-settings:
    'liga' 1,    /* Ligatures */
    'kern' 1,    /* Kerning */
    'smcp' 1,    /* Small caps */
    'onum' 1;    /* Old-style numerals */
}

/* Responsive type scale with container queries */
@container (min-width: 600px) {
  .heading {
    font-size: var(--fs-xl);
    line-height: 1.1;
  }
}
```

### Variable Font Implementation
```css
/* Single variable font file with multiple axes */
@font-face {
  font-family: 'Inter Variable';
  src: url('/fonts/Inter-Variable.woff2') format('woff2-variations');
  font-weight: 100 900;
  font-stretch: 75% 125%;
  font-display: swap;
}

/* Fine-grained control over multiple axes */
.dynamic-heading {
  font-family: 'Inter Variable', sans-serif;
  font-variation-settings:
    'wght' 700,  /* Weight */
    'wdth' 100,  /* Width */
    'slnt' -10;  /* Slant */
}

/* Responsive weight adjustment */
@media (prefers-color-scheme: dark) {
  body {
    font-variation-settings: 'wght' 450; /* Slightly heavier for dark mode */
  }
}
```

### Font Loading Strategy
```javascript
// Critical font preloading
<link rel="preload"
  href="/fonts/inter-variable.woff2"
  as="font"
  type="font/woff2"
  crossorigin />

// Progressive font loading with Font Face Observer
const font = new FontFaceObserver('Inter Variable');

font.load().then(() => {
  document.documentElement.classList.add('fonts-loaded');
}).catch(() => {
  // Fallback to system fonts
  console.warn('Custom fonts failed to load');
});
```

## Design Systems Integration

### Typographic Tokens
```javascript
// Design token structure
export const typography = {
  fontFamilies: {
    heading: 'Inter Variable, system-ui, sans-serif',
    body: 'Inter Variable, system-ui, sans-serif',
    mono: 'JetBrains Mono, Consolas, monospace',
  },
  fontSizes: {
    xs: 'var(--fs-xs)',
    sm: 'var(--fs-sm)',
    base: 'var(--fs-base)',
    md: 'var(--fs-md)',
    lg: 'var(--fs-lg)',
    xl: 'var(--fs-xl)',
  },
  fontWeights: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeights: {
    tight: 1.2,
    base: 1.5,
    relaxed: 1.75,
  },
  letterSpacing: {
    tight: '-0.02em',
    normal: '0',
    wide: '0.05em',
  },
};
```

## Common Patterns

### Classic Font Pairings
1. **Serif + Sans-Serif**: Georgia (body) + Inter (headings)
2. **Modern Tech**: SF Pro Display + SF Pro Text (Apple ecosystem)
3. **Editorial**: Tiempos Text + Graphik
4. **Minimalist**: Helvetica Neue + Helvetica Neue (weight contrast)
5. **Elegant**: Playfair Display + Source Sans Pro

### Responsive Type Scale
```css
/* Mobile-first type scale */
.heading-1 { font-size: clamp(2rem, 5vw, 4rem); }
.heading-2 { font-size: clamp(1.5rem, 4vw, 3rem); }
.heading-3 { font-size: clamp(1.25rem, 3vw, 2rem); }
.body { font-size: clamp(1rem, 2.5vw, 1.125rem); }
.caption { font-size: clamp(0.875rem, 2vw, 1rem); }
```

### Performance Budget
- **Maximum font files**: 2-3 WOFF2 files (or 1 variable font)
- **Total font weight**: Less than 100KB (with subsetting)
- **Flash of unstyled text (FOUT)**: Less than 100ms
- **First contentful paint (FCP)**: Typography shouldn't block render

## Tools & Technologies

### Font Tools
- **FontForge**: Open source font editor
- **Glyphs / FontLab**: Professional font creation
- **fonttools**: Python library for font manipulation
- **Wakamaifondue**: Web-based font inspector (What can my font do?)
- **Google Fonts Helper**: Self-hosting helper for Google Fonts

### Performance Tools
- **Font subsetting**: glyphhanger, pyftsubset
- **Font optimization**: fontmin, font-spider
- **Testing**: WebPageTest, Lighthouse font metrics
- **Variable font conversion**: fonttools varLib

### CSS Tools
- **Type scale generators**: Type-scale.com, Utopia
- **Font pairing tools**: Fontjoy, Typewolf
- **Contrast checkers**: WebAIM, Contrast Ratio
- **Modular scale calculators**: modularscale.com

## Best Practices

### Production Checklist
- [ ] Subset fonts to required character sets (Latin, Cyrillic, etc.)
- [ ] Use WOFF2 format for maximum compression
- [ ] Implement `font-display: swap` to prevent FOIT
- [ ] Preload critical fonts above the fold
- [ ] Define fallback font stacks with similar metrics
- [ ] Test on multiple devices and operating systems
- [ ] Validate WCAG contrast ratios (4.5:1 for body text)
- [ ] Set minimum font size to 16px for body text
- [ ] Implement responsive type scales with `clamp()`
- [ ] Consider variable fonts for design flexibility + performance

### Anti-Patterns to Avoid
- ❌ Loading 10+ font weights and styles
- ❌ Using too many typefaces (more than 3 families)
- ❌ Ignoring fallback font metrics (causes layout shift)
- ❌ Blocking render with synchronous font loading
- ❌ Poor contrast ratios (less than 4.5:1 for body text)
- ❌ Font sizes below 14px on mobile
- ❌ Line lengths over 75 characters
- ❌ Insufficient line-height (less than 1.4 for body text)

## Advanced Techniques

### Optical Size Adjustments
```css
/* Variable fonts with optical sizing */
@supports (font-variation-settings: normal) {
  .dynamic-type {
    font-variation-settings:
      'opsz' calc(16 + (80 - 16) * ((100vw - 320px) / (1920 - 320)));
  }
}
```

### Font Loading Detection
```css
/* Default system fonts */
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* Custom fonts after loading */
.fonts-loaded body {
  font-family: 'Inter Variable', sans-serif;
}
```

### Dark Mode Typography
```css
/* Compensate for halation effect in dark mode */
@media (prefers-color-scheme: dark) {
  body {
    font-weight: 450; /* Slightly heavier */
    letter-spacing: 0.01em; /* Slightly wider */
  }
}
```

## Use Cases

Perfect for projects requiring:
- **Brand identity systems** with distinctive typographic voice
- **High-performance web applications** with optimized font delivery
- **Editorial websites** with sophisticated typographic hierarchy
- **Design systems** with comprehensive type scale documentation
- **Accessibility-first applications** meeting WCAG guidelines
- **Multilingual applications** with complex script requirements
- **Variable font implementations** for dynamic design systems
- **Performance-critical sites** with strict font loading budgets

## Integration with Other Skills

Works seamlessly with:
- **Design System Creator**: Establishing typographic tokens and scales
- **Web Design Expert**: Implementing brand identity through typography
- **ADHD Design Expert**: Optimizing readability for neurodivergent users
- **Native App Designer**: iOS/macOS typography with SF Pro, San Francisco
- **Vaporwave UI Designer**: Retro typography with bitmap fonts, pixel-perfect rendering
- **Color Theory Expert**: Typographic color and contrast optimization

---

*Typography is the voice of visual design. Master it, and you control how your content speaks to the world.*
