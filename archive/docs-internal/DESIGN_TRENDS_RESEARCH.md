# Design Trends Research 2024-2025

**Research Date**: January 29, 2026
**Purpose**: Inform the Design Catalog and Design System Generator for Some Claude Skills
**Status**: Complete

---

## Executive Summary

This document catalogs 8 contemporary design trends with comprehensive analysis of their characteristics, accessibility profiles, use cases, and implementation guidelines. Each trend is evaluated for WCAG compliance and includes specific guidance for generating accessible design systems.

**Trends Covered**:
1. Neobrutalism
2. Swiss Modern
3. Glassmorphism
4. Maximalism
5. Hyperminimalism
6. Cyberpunk
7. Cottagecore
8. Brutalist Minimal

---

## 1. Neobrutalism

### Definition
Neobrutalism (also called Neubrutalism) is a visual design trend defined by high contrast, blocky layouts, bold colors, thick borders, and intentionally "unpolished" elements. It evolved from traditional brutalism but uses a more structured, minimalist approach while maintaining unconventional aesthetics.

### Characteristics
- **Color Philosophy**: High-contrast, often clashing colors; bright primaries against neutral backgrounds; black often used for heavy outlines
- **Typography**: Oversized headlines, quirky/bold typefaces, often monospace or geometric sans-serif
- **Layout**: Blocky, card-based layouts with thick borders (3-5px); heavy use of hard shadows (offset box-shadows)
- **Visual Traits**: No gradients or soft shadows; hard edges everywhere; intentionally "raw" feeling
- **Spacing**: Generous padding inside elements; tight gutters between cards

### Color Palette
| Role | Hex | Description |
|------|-----|-------------|
| Primary | `#1a1a1a` | Deep black for text/borders |
| Secondary | `#fef3c7` | Cream for backgrounds |
| Accent 1 | `#ef4444` | Bold red for CTAs |
| Accent 2 | `#facc15` | Bright yellow highlights |
| Accent 3 | `#22c55e` | Electric green |

### Real-world Examples
- **[Gumroad](https://gumroad.com)** - Digital product marketplace with oversized headlines, bold colors, and hard shadows
- **[Figma Community](https://figma.com/community)** - Uses neobrutalist cards with thick borders
- **[Poolsuite](https://poolsuite.net)** - Retro-neo aesthetic with bold colors and hard edges
- **[Palanquin](https://palanquin.design)** - Design agency showcasing the style

### WCAG Compliance Profile
- **Default Contrast Ratio**: 21:1 (black on cream) - **AAA Compliant**
- **Accessibility Strengths**:
  - High contrast by nature
  - Clear visual hierarchy through bold typography
  - Distinct interactive states through hard shadows
- **Accessibility Risks**:
  - Some color combinations (yellow on white) can fail contrast
  - Bold visual elements may be overwhelming for some users
  - Flashing/animation if overused can trigger seizures

### When to Use
- Digital products targeting creative audiences
- Portfolio sites for designers/developers
- SaaS products wanting to stand out from corporate aesthetics
- E-commerce for indie/maker brands
- Personal blogs with personality

### Personality
- **Feeling**: Bold, confident, irreverent, playful, authentic
- **Emotion**: Energetic, rebellious, creative
- **Target Audience**: Millennials, Gen Z, creative professionals, indie makers

---

## 2. Swiss Modern

### Definition
Swiss Modern (International Typographic Style) emphasizes clarity, functionality, and order through grid systems, sans-serif typography, and minimalist approach. Developed in Switzerland in the 1950s, it remains the gold standard for professional, clean interfaces.

### Characteristics
- **Color Philosophy**: Restrained palette; one or two accent colors against neutral backgrounds; often monochromatic
- **Typography**: Sans-serif dominance (Helvetica, Inter, SF Pro); strict type hierarchy; mathematical scale ratios (1.25 or 1.333)
- **Layout**: Rigid grid systems (12-column); asymmetric but balanced compositions; generous whitespace
- **Visual Traits**: Objective photography/illustrations; data visualization excellence; minimal decoration
- **Spacing**: Mathematical spacing scale (4px base); consistent margins and padding

### Color Palette
| Role | Hex | Description |
|------|-----|-------------|
| Primary | `#000000` | Pure black for text |
| Background | `#ffffff` | Pure white |
| Accent | `#0066ff` | Electric blue (Stripe-inspired) |
| Secondary | `#6b7280` | Neutral gray |
| Surface | `#f9fafb` | Light gray for cards |

### Real-world Examples
- **[Stripe](https://stripe.com)** - The definitive Swiss Modern financial interface
- **[Linear](https://linear.app)** - Project management with pristine grids
- **[Figma](https://figma.com)** - Design tool with modular, grid-based interface
- **[Notion](https://notion.so)** - Block-based UI with Swiss sensibilities
- **[Apple](https://apple.com)** - Product pages showcase Swiss principles

### WCAG Compliance Profile
- **Default Contrast Ratio**: 21:1 (black on white) - **AAA Compliant**
- **Accessibility Strengths**:
  - Maximum readability through contrast
  - Predictable layouts aid screen readers
  - Clear visual hierarchy
- **Accessibility Risks**:
  - Very light grays (#f9fafb) on white can fail contrast for text
  - Minimalism can lack visual cues for interactive elements

### When to Use
- Enterprise SaaS and B2B applications
- Financial and fintech products
- Developer tools and documentation
- Corporate websites
- Data-heavy dashboards

### Personality
- **Feeling**: Professional, trustworthy, efficient, intelligent
- **Emotion**: Calm, confident, competent
- **Target Audience**: Business professionals, developers, enterprise users

---

## 3. Glassmorphism

### Definition
Glassmorphism creates a frosted-glass effect using transparency, background blur, and subtle layering to give a sense of depth and hierarchy. Inspired by real-world glass surfaces where background elements remain partially visible but blurred.

### Characteristics
- **Color Philosophy**: Translucent surfaces (5-30% opacity); vibrant gradients in backgrounds; soft color transitions
- **Typography**: Light to medium weights; often white or dark text depending on background
- **Layout**: Floating cards with blur effect; layered depth; subtle borders (1px semi-transparent)
- **Visual Traits**: `backdrop-filter: blur()`; gradient backgrounds; soft shadows; frosted appearance
- **Spacing**: Generous padding; breathing room around glass elements

### Color Palette
| Role | Hex + Alpha | Description |
|------|-------------|-------------|
| Glass Surface | `rgba(255,255,255,0.15)` | Translucent white |
| Glass Border | `rgba(255,255,255,0.25)` | Subtle edge |
| Background Start | `#667eea` | Purple gradient start |
| Background End | `#764ba2` | Purple gradient end |
| Text | `#ffffff` | White text on dark |

### Real-world Examples
- **[Apple Vision Pro](https://apple.com/apple-vision-pro)** - Spatial computing UI
- **[macOS Big Sur](https://apple.com/macos)** - Desktop glassmorphism
- **[Windows 11](https://microsoft.com/windows)** - Acrylic effects throughout
- **[Stripe Dashboard](https://dashboard.stripe.com)** - Subtle glass effects

### WCAG Compliance Profile
- **Default Contrast Ratio**: Variable (depends on background) - **Often AA with careful design**
- **Accessibility Strengths**:
  - Depth cues help with visual hierarchy
  - Modern, engaging appearance increases attention
- **Accessibility Risks**:
  - **Critical**: Background content showing through can reduce text contrast
  - Blur effects may not work on all browsers
  - High CPU/GPU usage for animations
  - Text on varying backgrounds is hard to control

### Accessibility Remediation
- Always use `text-shadow` or backdrop for text legibility
- Test contrast against all possible background states
- Increase glass opacity (20-40%) to ensure text readability
- Provide high-contrast fallback for users who disable animations

### When to Use
- AR/VR interfaces (Apple Vision Pro-style)
- Modern mobile apps (iOS style)
- Dashboard overlays and modals
- Music/media players
- Creative portfolios

### Personality
- **Feeling**: Modern, elegant, futuristic, premium
- **Emotion**: Sophisticated, immersive, contemporary
- **Target Audience**: Design-conscious users, Apple ecosystem users, premium product users

---

## 4. Maximalism

### Definition
Maximalism is "the art of more is more" – rich, immersive visual experiences with vibrant colors, dynamic typography, layered visuals, and eclectic mixing of styles. It breaks through minimalist-dominated markets by creating storytelling-rich interfaces.

### Characteristics
- **Color Philosophy**: Vibrant, saturated palettes; multiple accent colors; bold contrasts; gradient abundance
- **Typography**: Varied fonts, sizes, and styles; oversized display type; experimental and decorative typefaces
- **Layout**: Layered, dense compositions; overlapping elements; asymmetric arrangements; custom cursors
- **Visual Traits**: Textures, animations, illustrations, patterns; microinteractions everywhere; visual abundance
- **Spacing**: Intentionally varied; density creates visual interest

### Color Palette
| Role | Hex | Description |
|------|-----|-------------|
| Primary | `#ff6b6b` | Coral red |
| Secondary | `#4ecdc4` | Teal |
| Accent 1 | `#ffe66d` | Bright yellow |
| Accent 2 | `#9b59b6` | Purple |
| Accent 3 | `#2ecc71` | Green |
| Background | `#1a1a2e` | Deep navy |

### Real-world Examples
- **[Glossier](https://glossier.com)** - Beauty brand with vibrant imagery and playful typography
- **[Wix](https://wix.com)** - Website builder showcasing visual richness
- **[Awwwards](https://awwwards.com)** - Design awards site with maximal aesthetic
- **[Behance](https://behance.net)** - Creative portfolio platform

### WCAG Compliance Profile
- **Default Contrast Ratio**: Highly variable - **Requires careful attention**
- **Accessibility Strengths**:
  - Rich visual cues can aid understanding
  - Multiple ways to convey information
- **Accessibility Risks**:
  - **High Risk**: Visual overwhelm for cognitive disabilities
  - Color contrast easily violated with vibrant palettes
  - Animation overuse can trigger vestibular disorders
  - Screen reader confusion with complex layouts

### Accessibility Remediation
- Implement `prefers-reduced-motion` for all animations
- Ensure primary text always meets 4.5:1 contrast
- Provide "calm mode" toggle for reduced visual complexity
- Structure content with proper heading hierarchy despite visual chaos

### When to Use
- Creative agencies and studios
- Fashion and beauty brands
- Entertainment and music industry
- Direct-to-consumer brands seeking differentiation
- Art and culture websites

### Personality
- **Feeling**: Bold, expressive, luxurious, artistic, exciting
- **Emotion**: Joy, wonder, creativity, energy
- **Target Audience**: Gen Z, creative industries, fashion-conscious consumers

---

## 5. Hyperminimalism

### Definition
Hyperminimalism takes minimalism to its logical extreme – only essential elements remain. Every pixel must earn its place. It champions clarity through radical simplicity, removing everything that doesn't directly serve the user's goal.

### Characteristics
- **Color Philosophy**: Near-monochromatic; one accent color maximum; black, white, and one gray
- **Typography**: Single font family; strict hierarchy with few sizes; generous line-height
- **Layout**: Maximum whitespace; single-column focus areas; content-first approach
- **Visual Traits**: No decorative elements; functional only; invisible interfaces
- **Spacing**: Extreme breathing room; content islands in seas of white

### Color Palette
| Role | Hex | Description |
|------|-----|-------------|
| Text | `#1a1a1a` | Near-black |
| Background | `#ffffff` | Pure white |
| Subtle | `#e5e5e5` | Light gray borders |
| Accent | `#2563eb` | Single blue accent |
| Muted | `#737373` | Secondary text |

### Real-world Examples
- **[Apple](https://apple.com)** - Product pages with vast whitespace
- **[Basecamp](https://basecamp.com)** - Productivity tool with calm interface
- **[Hey](https://hey.com)** - Email reimagined with minimal UI
- **[iA Writer](https://ia.net/writer)** - Distraction-free writing

### WCAG Compliance Profile
- **Default Contrast Ratio**: 17:1 (near-black on white) - **AAA Compliant**
- **Accessibility Strengths**:
  - Maximum readability and focus
  - Reduced cognitive load
  - Clear, predictable interfaces
- **Accessibility Risks**:
  - Lack of visual cues for interactive elements
  - May feel "empty" or confusing for some users
  - Hidden functionality can be difficult to discover

### When to Use
- Writing and productivity tools
- Meditation and wellness apps
- Premium product showcases
- Documentation and reading experiences
- Executive dashboards

### Personality
- **Feeling**: Calm, focused, premium, intentional, serene
- **Emotion**: Peace, clarity, confidence, sophistication
- **Target Audience**: Professionals seeking focus, premium brand consumers, productivity enthusiasts

---

## 6. Cyberpunk

### Definition
Cyberpunk design draws from sci-fi dystopian aesthetics – neon colors against dark backgrounds, glitch effects, futuristic interfaces, and tech-forward visuals. It evokes Blade Runner, Ghost in the Shell, and Cyberpunk 2077.

### Characteristics
- **Color Philosophy**: Neon accents (magenta, cyan, lime) on dark/black backgrounds; high contrast; RGB glow effects
- **Typography**: Futuristic, geometric, often condensed; glowing text effects; monospace for "code" aesthetic
- **Layout**: HUD-style interfaces; angular/diagonal elements; data overlays; grid disruption
- **Visual Traits**: Glitch effects, scanlines, chromatic aberration, neon borders, particle effects
- **Spacing**: Dense information displays; terminal-style interfaces

### Color Palette
| Role | Hex | Description |
|------|-----|-------------|
| Background | `#0a0a0f` | Near-black |
| Primary Neon | `#00ffff` | Cyan |
| Secondary Neon | `#ff00ff` | Magenta |
| Accent | `#00ff00` | Lime/Matrix green |
| Warning | `#ffff00` | Yellow |
| Text | `#e0e0e0` | Light gray |

### Real-world Examples
- **[Cyberpunk 2077](https://cyberpunk.net)** - Game UI defining the genre
- **[Cybercore CSS](https://github.com/sebyx07/cybercore-css)** - CSS framework for cyberpunk UIs
- **Synthwave music visualizers** - Genre-defining aesthetic
- **Gaming overlays and streaming UIs**

### WCAG Compliance Profile
- **Default Contrast Ratio**: 15:1 (light gray on near-black) - **AAA Compliant**
- **Accessibility Strengths**:
  - High contrast dark theme reduces eye strain
  - Neon accents create clear visual hierarchy
- **Accessibility Risks**:
  - Neon colors can cause eye fatigue over time
  - Glitch effects can trigger seizures (photosensitive epilepsy)
  - Dense information displays can overwhelm
  - Low color differentiation for colorblind users (cyan/green)

### Accessibility Remediation
- Never animate neon colors rapidly (>3 flashes/second)
- Provide reduced-motion mode without glitch effects
- Ensure colorblind-safe alternatives for neon accents
- Add high-contrast mode option

### When to Use
- Gaming interfaces and overlays
- Music and entertainment apps
- Tech-forward brand identities
- Crypto/Web3 projects
- Developer tools with personality

### Personality
- **Feeling**: Futuristic, edgy, immersive, rebellious, tech-forward
- **Emotion**: Excitement, intensity, mystery, adrenaline
- **Target Audience**: Gamers, tech enthusiasts, younger demographics, sci-fi fans

---

## 7. Cottagecore

### Definition
Cottagecore celebrates rustic charm, natural beauty, and a slower pace of life. Rooted in nostalgia for simpler times, it emphasizes sustainable living, vintage finds, handmade craftsmanship, and organic aesthetics.

### Characteristics
- **Color Philosophy**: Soft, muted tones – sage greens, dusty blues, soft pinks, buttery yellows, cream whites
- **Typography**: Serif fonts for warmth; handwritten/script accents; gentle, flowing letterforms
- **Layout**: Organic, asymmetric but balanced; soft edges; natural flow; hand-drawn elements
- **Visual Traits**: Botanical illustrations, vintage textures, watercolor effects, linen/paper textures
- **Spacing**: Comfortable, breathing room; nothing feels cramped or harsh

### Color Palette
| Role | Hex | Description |
|------|-----|-------------|
| Primary | `#8b7355` | Warm brown |
| Background | `#faf6f0` | Cream/off-white |
| Accent 1 | `#9caf88` | Sage green |
| Accent 2 | `#d4a5a5` | Dusty rose |
| Accent 3 | `#b8c4d4` | Dusty blue |
| Text | `#4a4a4a` | Warm gray |

### Real-world Examples
- **Etsy shops** - Handmade marketplace embodies the aesthetic
- **Small bakery/cafe websites** - Artisanal food brands
- **Wedding invitation sites** - Rustic wedding industry
- **Indie candle/soap brands** - Natural product companies
- **[Pinterest cottage boards](https://pinterest.com)** - Aesthetic curation

### WCAG Compliance Profile
- **Default Contrast Ratio**: 8:1 (warm gray on cream) - **AA Compliant**
- **Accessibility Strengths**:
  - Soft colors reduce eye strain
  - Warm tones feel inviting and calm
  - Clear hierarchy through weight, not just color
- **Accessibility Risks**:
  - Muted palette can result in low contrast
  - Script/handwritten fonts reduce readability
  - Textured backgrounds can interfere with text

### When to Use
- Artisanal and handmade product brands
- Wellness and self-care applications
- Wedding and event planning
- Food and beverage (cafes, bakeries, farms)
- Lifestyle blogs and journals

### Personality
- **Feeling**: Warm, cozy, authentic, nostalgic, comforting
- **Emotion**: Peace, comfort, simplicity, connection to nature
- **Target Audience**: Lifestyle enthusiasts, sustainability-focused consumers, vintage lovers, wellness seekers

---

## 8. Brutalist Minimal

### Definition
Brutalist Minimal combines brutalism's raw, unpolished honesty with minimalist restraint. It strips interfaces to essential typography and structure, often resembling early web design or academic documents, but with intentional sophistication.

### Characteristics
- **Color Philosophy**: Near-monochrome; often just black, white, and one accent; raw, undecorated
- **Typography**: Heavy emphasis on type as the primary design element; large, bold headlines; system fonts or stark serifs
- **Layout**: Text-first; minimal imagery; resembles documents or early web; intentionally "unstyled" appearance
- **Visual Traits**: No decorative graphics; raw HTML feeling; exposed structure; links are underlined
- **Spacing**: Often tight; content-dense; resembles printed documents

### Color Palette
| Role | Hex | Description |
|------|-----|-------------|
| Text | `#000000` | Pure black |
| Background | `#ffffff` | Pure white |
| Link | `#0000ff` | Classic web blue |
| Visited | `#551a8b` | Classic visited purple |
| Accent | `#ff0000` | Bold red (sparingly) |

### Real-world Examples
- **[Craigslist](https://craigslist.org)** - The original brutalist minimal site
- **[Hacker News](https://news.ycombinator.com)** - Text-first information design
- **[Drudge Report](https://drudgereport.com)** - News aggregation in pure text
- **Academic journal websites** - Content over form
- **[Bloomberg Terminal](https://bloomberg.com)** - Information density

### WCAG Compliance Profile
- **Default Contrast Ratio**: 21:1 (black on white) - **AAA Compliant**
- **Accessibility Strengths**:
  - Maximum contrast and readability
  - Works with any assistive technology
  - Fast loading, no dependencies
  - Clear, predictable structure
- **Accessibility Risks**:
  - Dense layouts can be overwhelming
  - Lack of visual cues may confuse users expecting modern UI
  - No visual hierarchy beyond typography

### When to Use
- News and content-heavy sites
- Developer documentation
- Academic and research sites
- Personal sites making a statement
- High-performance, low-bandwidth applications

### Personality
- **Feeling**: Honest, raw, intellectual, anti-establishment, authentic
- **Emotion**: Respect for content, rejection of superficiality
- **Target Audience**: Developers, academics, content-focused readers, anti-design advocates

---

## Cross-Trend Analysis

### Accessibility Comparison Matrix

| Trend | Default WCAG | Contrast Risk | Animation Risk | Cognitive Load |
|-------|--------------|---------------|----------------|----------------|
| Neobrutalism | AAA | Low | Low | Medium |
| Swiss Modern | AAA | Low | Low | Low |
| Glassmorphism | AA | **High** | Medium | Low |
| Maximalism | Variable | **High** | **High** | **High** |
| Hyperminimalism | AAA | Low | Low | Low |
| Cyberpunk | AAA | Medium | **High** | High |
| Cottagecore | AA | Medium | Low | Low |
| Brutalist Minimal | AAA | Low | Low | Medium |

### Trend Pairing Recommendations

Some trends can be combined effectively:

| Primary | Secondary | Resulting Style |
|---------|-----------|-----------------|
| Swiss Modern | Hyperminimalism | Ultra-clean SaaS |
| Neobrutalism | Cyberpunk | Edgy tech brand |
| Cottagecore | Glassmorphism | Premium wellness app |
| Maximalism | Swiss Modern | Controlled chaos |
| Brutalist Minimal | Neobrutalism | Bold text-first |

### When NOT to Use Each Trend

| Trend | Avoid For |
|-------|-----------|
| Neobrutalism | Healthcare, government, conservative finance |
| Swiss Modern | Children's products, entertainment |
| Glassmorphism | Low-power devices, accessibility-first |
| Maximalism | Productivity tools, data-heavy apps |
| Hyperminimalism | E-commerce with many products |
| Cyberpunk | Wellness, family, traditional industries |
| Cottagecore | Tech startups, B2B SaaS |
| Brutalist Minimal | Visual-first products (photography, fashion) |

---

## Implementation Guidelines

### For Design System Generator

When matching natural language to trends, use this keyword mapping:

```javascript
const trendKeywords = {
  'neobrutalism': ['bold', 'heavy', 'stark', 'dramatic', 'contrasting', 'edgy', 'raw', 'gumroad'],
  'swiss-modern': ['clean', 'minimal', 'grid', 'professional', 'tech', 'saas', 'corporate', 'stripe', 'linear'],
  'glassmorphism': ['modern', 'transparent', 'blur', 'frosted', 'contemporary', 'ios', 'apple', 'premium'],
  'maximalism': ['vibrant', 'colorful', 'rich', 'detailed', 'busy', 'expressive', 'creative', 'bold'],
  'hyperminimalism': ['minimal', 'essential', 'calm', 'serene', 'peaceful', 'focus', 'simple', 'zen'],
  'cyberpunk': ['neon', 'futuristic', 'tech', 'gaming', 'dark', 'sci-fi', 'hacker', 'matrix'],
  'cottagecore': ['rustic', 'vintage', 'handmade', 'cozy', 'organic', 'natural', 'warm', 'artisan'],
  'brutalist-minimal': ['text-first', 'typography', 'monochrome', 'stark', 'raw', 'honest', 'academic']
};
```

### Sources

Research compiled from:
- [Nielsen Norman Group - Neobrutalism](https://www.nngroup.com/articles/neobrutalism/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [W3C WCAG 2.2 Guidelines](https://www.w3.org/WAI/WCAG22/Understanding/)
- [Figma Design Trends 2025](https://www.figma.com/community/file/1418122309216432938)
- [Pixelmatters UI Trends 2025](https://www.pixelmatters.com/insights/8-ui-design-trends-2025)
- [Mindbees - Maximalism 2025](https://www.mindbees.com/blog/maximalism-design-trend-2025/)
- [Accio - Cyberpunk Design 2025](https://www.accio.com/business/cyberpunk_design_trend)
- [Envato - Swiss Style Design](https://elements.envato.com/learn/swiss-style-graphic-design)

---

*Last updated: January 29, 2026*
