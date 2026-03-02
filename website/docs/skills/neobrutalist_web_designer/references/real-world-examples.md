---
title: Real-World Neobrutalism Examples
sidebar_label: Real-World Neobrutalism Exampl...
sidebar_position: 2
---
# Real-World Neobrutalism Examples

Analysis of production neobrutalist implementations for reference.

## Tier 1: Pure Neobrutalism

### Gumroad

**URL**: gumroad.com

**What they do right:**
- Heavy black borders on everything
- Flat solid colors (pink, yellow, blue)
- Hard shadows with no blur
- Bold display typography
- Raw, functional aesthetic

**Key patterns:**
```css
/* Gumroad-style product card */
.gumroad-card {
  background: #fff;
  border: 4px solid #000;
  box-shadow: 8px 8px 0 #000;
}

/* Gumroad pink accent */
.gumroad-accent {
  background: #FF90E8; /* Their signature pink */
}
```

**Takeaways:**
- Consistency is key—every element uses the same border/shadow language
- Limited color palette (pink, black, white) creates cohesion
- Typography is functional, not decorative

---

### Figma (Brand Refresh 2023+)

**URL**: figma.com

**What they do right:**
- Bold geometric shapes
- High contrast color blocking
- Thick strokes on illustrations
- Playful yet professional

**Key patterns:**
```css
/* Figma-style color blocks */
.figma-block {
  background: #A259FF; /* Figma purple */
  border: 3px solid #000;
}

.figma-block--yellow {
  background: #FFC700;
}

.figma-block--coral {
  background: #FF7262;
}
```

**Takeaways:**
- Neobrutalism can be professional and enterprise-friendly
- Geometric illustrations reinforce the bold aesthetic
- Color variety works when all colors are high-saturation

---

## Tier 2: Neobrutalist Influence

### Tony's Chocolonely

**Industry**: E-commerce (Chocolate)

**Neobrutalist elements:**
- Bright primary colors
- Bold typography
- Chunky layout sections
- Playful, "unpolished" feel

**Non-neobrutalist elements:**
- Some soft shadows
- Rounded corners in places
- Gradient accents

**Hybrid approach:**
```css
/* Tony's blends neobrutalism with playfulness */
.tonys-wrapper {
  background: #FF1E00; /* Bold red */
  border: 3px solid #000;
  /* They add some curves for friendliness */
  border-radius: 8px;
}
```

---

### Linear (linearb.io)

**Industry**: Developer Tools

**Neobrutalist elements:**
- Hard shadows on cards
- Bold accent colors
- Strong typography hierarchy

**Non-neobrutalist elements:**
- Dark mode default
- Some blur effects
- Subtle gradients

**Analysis**: Linear shows how neobrutalism can be adapted for developer audiences—keeping the structural boldness while adding dark mode sophistication.

---

## Tier 3: Brutalist (Not Neo)

### Craigslist

**URL**: craigslist.org

**This is BRUTALISM, not neobrutalism:**
- Purely functional
- No styling for aesthetics
- System fonts, default links
- No intentional design language

**Key difference**: Brutalism is absence of style; neobrutalism is intentional bold style.

---

### Drudge Report

**URL**: drudgereport.com

**This is BRUTALISM:**
- Text-only design
- No visual hierarchy through color
- Default HTML styling
- Information density over aesthetics

**Why it's not neobrutalism:**
- No hard shadows
- No bold borders
- No primary color palette
- No intentional visual design

---

## Pattern Library from Real Sites

### Card Patterns

**Gumroad-style:**
```css
.card-gumroad {
  background: #fff;
  border: 3px solid #000;
  box-shadow: 6px 6px 0 #000;
  padding: 1.5rem;
  transition: all 0.1s;
}

.card-gumroad:hover {
  box-shadow: 8px 8px 0 #000;
  transform: translate(-2px, -2px);
}
```

**Figma-style (with color):**
```css
.card-figma {
  background: #A259FF;
  border: 4px solid #000;
  box-shadow: 8px 8px 0 #000;
  padding: 2rem;
  color: #fff;
}
```

### Button Patterns

**Standard neobrutalist:**
```css
.btn-neo {
  background: #FFEB3B;
  border: 3px solid #000;
  box-shadow: 4px 4px 0 #000;
  padding: 0.75rem 1.5rem;
  font-weight: 700;
  text-transform: uppercase;
}

.btn-neo:hover {
  box-shadow: 6px 6px 0 #000;
  transform: translate(-2px, -2px);
}

.btn-neo:active {
  box-shadow: 2px 2px 0 #000;
  transform: translate(2px, 2px);
}
```

**Inverted (dark):**
```css
.btn-neo-dark {
  background: #000;
  color: #fff;
  border: 3px solid #000;
  box-shadow: 4px 4px 0 #FF4081;
}

.btn-neo-dark:hover {
  background: #FF4081;
  color: #000;
}
```

### Hero Patterns

**Bold headline with color block:**
```css
.hero-neo {
  background: #4CAF50;
  border-bottom: 6px solid #000;
  padding: 6rem 2rem;
}

.hero-neo h1 {
  font-size: clamp(3rem, 10vw, 8rem);
  font-weight: 900;
  text-transform: uppercase;
  color: #000;
  line-height: 0.9;
}

.hero-neo .subtitle {
  font-size: 1.5rem;
  max-width: 600px;
  margin-top: 1.5rem;
}
```

**Split hero:**
```css
.hero-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 100vh;
}

.hero-split__left {
  background: #FF5252;
  display: flex;
  align-items: center;
  padding: 4rem;
  border-right: 4px solid #000;
}

.hero-split__right {
  background: #2196F3;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

### Navigation Patterns

**Solid black nav:**
```css
.nav-neo {
  background: #000;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 4px solid #000;
}

.nav-neo__logo {
  color: #fff;
  font-size: 1.5rem;
  font-weight: 900;
  text-transform: uppercase;
}

.nav-neo__link {
  color: #fff;
  text-decoration: none;
  padding: 0.5rem 0;
  border-bottom: 3px solid transparent;
}

.nav-neo__link:hover {
  border-bottom-color: #FFEB3B;
}
```

**White nav with accent:**
```css
.nav-neo-light {
  background: #fff;
  border-bottom: 4px solid #000;
  box-shadow: 0 4px 0 #000;
}
```

---

## Industry-Specific Adaptations

### SaaS / Tech Startups

**Best practices:**
- Use neobrutalism for marketing pages
- Consider softer approach for complex dashboards
- Bold CTAs drive conversions
- Works great for pricing pages

**Example structure:**
```
Marketing site → Full neobrutalism
Dashboard → Softer, functional neo-influenced
Onboarding → Bold but clear
```

### E-Commerce

**Best practices:**
- Product cards with hard shadows
- Bold "Add to Cart" buttons
- High-contrast price displays
- Category navigation with color coding

**Caution:**
- Don't let style overwhelm product images
- Ensure checkout is clear and trustworthy
- Test with users—bold can feel "untrustworthy" to some

### Creative / Portfolio

**Best practices:**
- Full neobrutalism works great
- Use as a differentiator
- Bold typography for name/title
- Hard shadow image frames

### Education / EdTech

**Best practices:**
- Playful neobrutalism with softer colors
- High contrast for readability
- Bold CTAs for lesson progression
- Color coding for categories/subjects

---

## Common Mistakes in Production

### 1. Inconsistent Shadow Sizes

**Wrong:**
```css
.card-1 { box-shadow: 4px 4px 0 #000; }
.card-2 { box-shadow: 8px 8px 0 #000; }
.button { box-shadow: 2px 2px 0 #000; }
```

**Right:** Use CSS variables for consistency:
```css
:root {
  --shadow-sm: 2px 2px 0 #000;
  --shadow-md: 4px 4px 0 #000;
  --shadow-lg: 6px 6px 0 #000;
}
```

### 2. Mixing Blur Shadows

**Wrong:**
```css
.neo-card { box-shadow: 4px 4px 0 #000; }
.neo-button { box-shadow: 0 4px 6px rgba(0,0,0,0.1); } /* Blur! */
```

**Right:** All shadows hard, all the time.

### 3. Color Palette Explosion

**Wrong:** 15 different accent colors

**Right:** 3-5 primary colors, used consistently

### 4. Thin Borders + Hard Shadows

**Wrong:**
```css
.card {
  border: 1px solid #000;
  box-shadow: 8px 8px 0 #000;
}
```

**Right:** Border weight should match shadow weight:
```css
.card {
  border: 3px solid #000;
  box-shadow: 6px 6px 0 #000;
}
```

---

## Responsive Considerations

All examples should scale down shadows/borders on mobile:

```css
:root {
  --shadow: 3px 3px 0 #000;
  --border: 2px;
}

@media (min-width: 768px) {
  :root {
    --shadow: 4px 4px 0 #000;
    --border: 3px;
  }
}

@media (min-width: 1024px) {
  :root {
    --shadow: 6px 6px 0 #000;
    --border: 4px;
  }
}
```

---

## Performance Notes

Neobrutalism is **performance-friendly**:
- No blur effects (CPU-intensive)
- No transparency calculations
- Simple box-shadows (GPU-accelerated)
- Flat colors (small CSS)

Keep it that way—don't add CSS filters or backdrop effects.
