# Advanced CSS Techniques Reference

Extracted from FreeFrontend Gallery (112 CSS examples) and modern browser capabilities.

## Scroll-Driven Animations

Native CSS scroll-linked animations without JavaScript.

### Basic Scroll Timeline
```css
/* Progress bar that fills as you scroll */
.progress-bar {
  animation: grow linear;
  animation-timeline: scroll();
}

@keyframes grow {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}
```

### View Timeline (Element-Based)
```css
/* Animate when element enters viewport */
.reveal-on-scroll {
  animation: fadeIn linear;
  animation-timeline: view();
  animation-range: entry 0% cover 40%;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(50px); }
  to { opacity: 1; transform: translateY(0); }
}
```

### Browser Support
- Chrome 115+, Edge 115+
- Safari 18+
- Firefox 128+

### Token Generation
When trend includes `scroll-driven-animations`, generate:
```css
:root {
  --animation-timeline-scroll: scroll();
  --animation-timeline-view: view();
  --animation-range-entry: entry 0% cover 40%;
  --animation-range-exit: exit 0% cover 40%;
}
```

## :has() Selector Patterns

Parent selection and sibling-aware styling.

### Interactive Grid Expansion
```css
/* Expand hovered grid item, shrink siblings */
.grid:has(.item:hover) {
  grid-template-columns: 2fr 1fr 1fr;
}

.grid .item:hover {
  grid-column: 1;
}
```

### Form Validation States
```css
/* Disable submit when form invalid */
form:has(:invalid) button[type="submit"] {
  opacity: 0.5;
  pointer-events: none;
}

/* Highlight label when input focused */
label:has(+ input:focus) {
  color: var(--color-primary);
}
```

### Browser Support
- Chrome 105+, Edge 105+
- Safari 15.4+
- Firefox 121+

### Token Generation
When using modern selectors, generate utility classes:
```css
/* Sibiling dim on hover */
.has-hover-dim:has(.item:hover) .item:not(:hover) {
  opacity: var(--opacity-dimmed, 0.6);
}

/* Form validation aware */
.has-validation:has(:invalid) .submit-btn {
  opacity: var(--opacity-disabled, 0.5);
}
```

## 3D Transform Patterns

For `3d-immersive` and advanced visual effects.

### Preserve 3D Context
```css
.scene {
  perspective: 1000px;
  perspective-origin: center;
}

.card {
  transform-style: preserve-3d;
  transition: transform 0.5s;
}

.card:hover {
  transform: rotateY(15deg) translateZ(50px);
}
```

### Coverflow Gallery Effect
```css
.gallery {
  display: flex;
  perspective: 1500px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
}

.gallery-item {
  scroll-snap-align: center;
  transform-style: preserve-3d;
}

/* CSS scroll-driven rotation */
.gallery-item {
  animation: coverflow linear;
  animation-timeline: view(inline);
}

@keyframes coverflow {
  entry 0% { transform: rotateY(-45deg) scale(0.8); opacity: 0.5; }
  cover 50% { transform: rotateY(0) scale(1); opacity: 1; }
  exit 100% { transform: rotateY(45deg) scale(0.8); opacity: 0.5; }
}
```

### Token Generation
```css
:root {
  /* 3D context */
  --perspective-default: 1000px;
  --perspective-deep: 2000px;
  --perspective-close: 500px;

  /* Transform values */
  --rotate-subtle: 5deg;
  --rotate-moderate: 15deg;
  --rotate-dramatic: 45deg;
  --translate-z-lift: 50px;
  --translate-z-pop: 100px;
}
```

## Gallery Layout Patterns

From 112 FreeFrontend examples.

### Masonry (CSS Grid)
```css
.masonry {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  grid-auto-rows: 10px;
}

.masonry-item {
  grid-row: span var(--row-span, 20);
}
```

### Honeycomb/Hexagon
```css
.honeycomb {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  --hex-size: 100px;
}

.hex {
  width: var(--hex-size);
  height: calc(var(--hex-size) * 1.1547);
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  margin: calc(var(--hex-size) * -0.29) calc(var(--hex-size) * 0.02);
}

.hex:nth-child(odd) {
  margin-top: calc(var(--hex-size) * 0.29);
}
```

### Diamond/Rhombus Grid
```css
.diamond-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  transform: rotate(45deg);
}

.diamond-item {
  aspect-ratio: 1;
  transform: rotate(-45deg);
}
```

## Advanced Techniques by Trend

### Neobrutalism + Scroll
```css
/* Hard shadow that animates on scroll */
.brutal-card {
  box-shadow: var(--shadow-brutal);
  animation: brutalEnter linear;
  animation-timeline: view();
}

@keyframes brutalEnter {
  0% {
    transform: translate(20px, 20px);
    box-shadow: 0 0 0 var(--color-border);
  }
  100% {
    transform: translate(0, 0);
    box-shadow: var(--shadow-brutal);
  }
}
```

### Glassmorphism + 3D
```css
/* Frosted glass with depth */
.glass-card {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--blur-glass));
  transform-style: preserve-3d;
  transition: transform 0.3s;
}

.glass-card:hover {
  transform: translateZ(30px) rotateX(5deg);
}

.glass-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: inherit;
  backdrop-filter: inherit;
  transform: translateZ(-30px);
  opacity: 0.5;
}
```

### Terminal + :has()
```css
/* Command-aware terminal */
.terminal:has(.command:focus) .cursor {
  animation: blink 1s step-end infinite;
}

.terminal:has(.command[data-status="running"]) .status {
  color: var(--term-yellow);
}

.terminal:has(.command[data-status="success"]) .status {
  color: var(--term-green);
}

.terminal:has(.command[data-status="error"]) .status {
  color: var(--term-red);
}
```

## CSS Math Functions

For parametric and calculated values.

### Trigonometric Galleries
```css
/* Circular arrangement using sin/cos */
.orbit {
  --items: 8;
  --radius: 200px;
}

.orbit-item {
  --angle: calc(360deg / var(--items) * var(--index));
  transform:
    rotate(var(--angle))
    translateX(var(--radius))
    rotate(calc(-1 * var(--angle)));
}
```

### Responsive Clamping
```css
:root {
  /* Fluid typography */
  --font-size-fluid: clamp(1rem, 0.5rem + 2vw, 2rem);

  /* Fluid spacing */
  --space-fluid: clamp(1rem, 5vw, 3rem);

  /* Fluid container */
  --container-width: min(90%, 1200px);
}
```

## Browser Support Tokens

Generate fallback-aware tokens:

```css
:root {
  /* Fallback shadows */
  --shadow-with-fallback:
    4px 4px 0 var(--color-shadow, #000);

  /* Feature query markers */
  --supports-has: false;
  --supports-scroll-timeline: false;
  --supports-container-queries: false;
}

@supports selector(:has(*)) {
  :root { --supports-has: true; }
}

@supports (animation-timeline: scroll()) {
  :root { --supports-scroll-timeline: true; }
}

@supports (container-type: inline-size) {
  :root { --supports-container-queries: true; }
}
```
