---
title: Neobrutalist Component Library
sidebar_label: Neobrutalist Component Library
sidebar_position: 2
---
# Neobrutalist Component Library

Complete CSS implementations for all core neobrutalist components.

## Base Setup

### CSS Variables

```css
:root {
  /* Core palette */
  --neo-black: #000000;
  --neo-white: #FFFFFF;
  --neo-cream: #F5F0E6;
  --neo-gray: #E5E5E5;
  --neo-dark-gray: #333333;

  /* Primary colors */
  --neo-red: #FF5252;
  --neo-red-dark: #D32F2F;
  --neo-yellow: #FFEB3B;
  --neo-yellow-dark: #FBC02D;
  --neo-blue: #2196F3;
  --neo-blue-dark: #1976D2;
  --neo-pink: #FF4081;
  --neo-pink-dark: #C2185B;
  --neo-green: #4CAF50;
  --neo-green-dark: #388E3C;
  --neo-orange: #FF9800;
  --neo-orange-dark: #F57C00;
  --neo-purple: #9C27B0;
  --neo-purple-dark: #7B1FA2;
  --neo-cyan: #00BCD4;
  --neo-cyan-dark: #0097A7;

  /* Typography */
  --font-neo-display: 'Archivo Black', 'Impact', sans-serif;
  --font-neo-body: 'Space Grotesk', 'Inter', 'Arial', sans-serif;
  --font-neo-accent: 'Lexend Mega', 'Trebuchet MS', sans-serif;
  --font-neo-mono: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;

  /* Spacing scale (8px base) */
  --neo-space-1: 0.25rem;   /* 4px */
  --neo-space-2: 0.5rem;    /* 8px */
  --neo-space-3: 0.75rem;   /* 12px */
  --neo-space-4: 1rem;      /* 16px */
  --neo-space-5: 1.25rem;   /* 20px */
  --neo-space-6: 1.5rem;    /* 24px */
  --neo-space-8: 2rem;      /* 32px */
  --neo-space-10: 2.5rem;   /* 40px */
  --neo-space-12: 3rem;     /* 48px */
  --neo-space-16: 4rem;     /* 64px */

  /* Responsive shadow sizes */
  --neo-shadow-sm: 2px 2px 0 var(--neo-black);
  --neo-shadow-md: 4px 4px 0 var(--neo-black);
  --neo-shadow-lg: 6px 6px 0 var(--neo-black);
  --neo-shadow-xl: 8px 8px 0 var(--neo-black);

  /* Border widths */
  --neo-border-thin: 2px;
  --neo-border-md: 3px;
  --neo-border-thick: 4px;

  /* Transitions */
  --neo-transition-fast: 0.1s ease;
  --neo-transition-normal: 0.2s ease;
}
```

### Reset & Base Styles

```css
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: var(--font-neo-body);
  font-size: 1.125rem;
  line-height: 1.6;
  color: var(--neo-black);
  background: var(--neo-white);
}

/* All images are block by default */
img {
  display: block;
  max-width: 100%;
  height: auto;
}

/* Remove default focus, we'll add our own */
*:focus {
  outline: none;
}

/* Visible focus for keyboard navigation */
*:focus-visible {
  outline: 3px solid var(--neo-blue);
  outline-offset: 2px;
}
```

---

## Typography

### Headings

```css
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-neo-display);
  line-height: 1.1;
  letter-spacing: -0.02em;
  margin-bottom: var(--neo-space-4);
}

h1 {
  font-size: clamp(2.5rem, 8vw, 5rem);
  text-transform: uppercase;
}

h2 {
  font-size: clamp(2rem, 5vw, 3.5rem);
}

h3 {
  font-size: clamp(1.5rem, 3vw, 2.5rem);
}

h4 {
  font-size: 1.5rem;
}

h5 {
  font-size: 1.25rem;
}

h6 {
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}
```

### Body Text

```css
p {
  margin-bottom: var(--neo-space-4);
}

.neo-lead {
  font-size: 1.375rem;
  line-height: 1.5;
  font-weight: 500;
}

.neo-small {
  font-size: 0.875rem;
}

.neo-tiny {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
```

### Links

```css
a {
  color: var(--neo-blue);
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-thickness: 2px;
  transition: color var(--neo-transition-fast);
}

a:hover {
  color: var(--neo-pink);
}

.neo-link--bold {
  font-weight: 700;
  text-decoration-thickness: 3px;
}

.neo-link--no-underline {
  text-decoration: none;
  border-bottom: 3px solid var(--neo-blue);
  padding-bottom: 2px;
}

.neo-link--no-underline:hover {
  border-bottom-color: var(--neo-pink);
}
```

---

## Buttons

### Base Button

```css
.neo-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--neo-space-2);
  padding: var(--neo-space-3) var(--neo-space-6);
  font-family: var(--font-neo-display);
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  text-decoration: none;
  border: var(--neo-border-md) solid var(--neo-black);
  background: var(--neo-white);
  color: var(--neo-black);
  box-shadow: var(--neo-shadow-md);
  cursor: pointer;
  transition: all var(--neo-transition-fast);
  -webkit-user-select: none;
  user-select: none;
}

.neo-btn:hover {
  box-shadow: var(--neo-shadow-lg);
  transform: translate(-2px, -2px);
}

.neo-btn:active {
  box-shadow: var(--neo-shadow-sm);
  transform: translate(2px, 2px);
}

.neo-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: var(--neo-shadow-md);
}
```

### Button Variants

```css
/* Primary - Yellow */
.neo-btn--primary {
  background: var(--neo-yellow);
}

.neo-btn--primary:hover {
  background: var(--neo-yellow-dark);
}

/* Secondary - Pink */
.neo-btn--secondary {
  background: var(--neo-pink);
  color: var(--neo-white);
}

.neo-btn--secondary:hover {
  background: var(--neo-pink-dark);
}

/* Success - Green */
.neo-btn--success {
  background: var(--neo-green);
  color: var(--neo-white);
}

/* Danger - Red */
.neo-btn--danger {
  background: var(--neo-red);
  color: var(--neo-white);
}

/* Dark - Black */
.neo-btn--dark {
  background: var(--neo-black);
  color: var(--neo-white);
  border-color: var(--neo-black);
}

.neo-btn--dark:hover {
  background: var(--neo-dark-gray);
}

/* Ghost - Transparent */
.neo-btn--ghost {
  background: transparent;
  box-shadow: none;
}

.neo-btn--ghost:hover {
  background: var(--neo-black);
  color: var(--neo-white);
  transform: none;
  box-shadow: none;
}

/* Outline Only */
.neo-btn--outline {
  background: transparent;
}

.neo-btn--outline:hover {
  background: var(--neo-black);
  color: var(--neo-white);
}
```

### Button Sizes

```css
.neo-btn--sm {
  padding: var(--neo-space-2) var(--neo-space-4);
  font-size: 0.875rem;
  box-shadow: var(--neo-shadow-sm);
}

.neo-btn--lg {
  padding: var(--neo-space-4) var(--neo-space-8);
  font-size: 1.125rem;
  box-shadow: var(--neo-shadow-lg);
}

.neo-btn--xl {
  padding: var(--neo-space-5) var(--neo-space-10);
  font-size: 1.25rem;
  box-shadow: var(--neo-shadow-xl);
}

/* Full width */
.neo-btn--block {
  display: flex;
  width: 100%;
}
```

### Icon Buttons

```css
.neo-btn--icon {
  padding: var(--neo-space-3);
  aspect-ratio: 1;
}

.neo-btn--icon svg {
  width: 1.25em;
  height: 1.25em;
}
```

---

## Cards

### Base Card

```css
.neo-card {
  background: var(--neo-white);
  border: var(--neo-border-md) solid var(--neo-black);
  box-shadow: var(--neo-shadow-lg);
  overflow: hidden;
}

.neo-card__header {
  padding: var(--neo-space-4) var(--neo-space-6);
  border-bottom: var(--neo-border-thin) solid var(--neo-black);
}

.neo-card__title {
  font-family: var(--font-neo-display);
  font-size: 1.25rem;
  text-transform: uppercase;
  margin: 0;
}

.neo-card__subtitle {
  font-size: 0.875rem;
  color: var(--neo-dark-gray);
  margin-top: var(--neo-space-1);
}

.neo-card__body {
  padding: var(--neo-space-6);
}

.neo-card__footer {
  padding: var(--neo-space-4) var(--neo-space-6);
  border-top: var(--neo-border-thin) solid var(--neo-black);
  background: var(--neo-gray);
}

.neo-card__image {
  width: 100%;
  border-bottom: var(--neo-border-md) solid var(--neo-black);
}
```

### Card Variants

```css
/* Interactive card */
.neo-card--interactive {
  cursor: pointer;
  transition: all var(--neo-transition-fast);
}

.neo-card--interactive:hover {
  box-shadow: var(--neo-shadow-xl);
  transform: translate(-2px, -2px);
}

/* Featured card */
.neo-card--featured {
  background: var(--neo-yellow);
}

/* Highlight card */
.neo-card--highlight {
  border-color: var(--neo-pink);
  box-shadow: 6px 6px 0 var(--neo-pink);
}

/* Flat card (no shadow) */
.neo-card--flat {
  box-shadow: none;
}

/* Colored border variants */
.neo-card--blue {
  border-color: var(--neo-blue);
  box-shadow: 6px 6px 0 var(--neo-blue);
}

.neo-card--green {
  border-color: var(--neo-green);
  box-shadow: 6px 6px 0 var(--neo-green);
}
```

---

## Form Elements

### Inputs

```css
.neo-input {
  display: block;
  width: 100%;
  padding: var(--neo-space-3) var(--neo-space-4);
  font-family: var(--font-neo-body);
  font-size: 1rem;
  color: var(--neo-black);
  background: var(--neo-white);
  border: var(--neo-border-md) solid var(--neo-black);
  transition: box-shadow var(--neo-transition-fast);
}

.neo-input:focus {
  box-shadow: var(--neo-shadow-md);
}

.neo-input::placeholder {
  color: #888888;
}

/* Input sizes */
.neo-input--sm {
  padding: var(--neo-space-2) var(--neo-space-3);
  font-size: 0.875rem;
}

.neo-input--lg {
  padding: var(--neo-space-4) var(--neo-space-5);
  font-size: 1.125rem;
}

/* Error state */
.neo-input--error {
  border-color: var(--neo-red);
}

.neo-input--error:focus {
  box-shadow: 4px 4px 0 var(--neo-red);
}
```

### Labels

```css
.neo-label {
  display: block;
  font-family: var(--font-neo-display);
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--neo-space-2);
}

.neo-label--required::after {
  content: ' *';
  color: var(--neo-red);
}
```

### Textarea

```css
.neo-textarea {
  display: block;
  width: 100%;
  min-height: 120px;
  padding: var(--neo-space-4);
  font-family: var(--font-neo-body);
  font-size: 1rem;
  line-height: 1.5;
  color: var(--neo-black);
  background: var(--neo-white);
  border: var(--neo-border-md) solid var(--neo-black);
  resize: vertical;
}

.neo-textarea:focus {
  box-shadow: var(--neo-shadow-md);
}
```

### Select

```css
.neo-select {
  display: block;
  width: 100%;
  padding: var(--neo-space-3) var(--neo-space-4);
  padding-right: var(--neo-space-10);
  font-family: var(--font-neo-body);
  font-size: 1rem;
  color: var(--neo-black);
  background: var(--neo-white);
  border: var(--neo-border-md) solid var(--neo-black);
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  cursor: pointer;
}

.neo-select:focus {
  box-shadow: var(--neo-shadow-md);
}
```

### Checkbox & Radio

```css
.neo-checkbox,
.neo-radio {
  appearance: none;
  width: 24px;
  height: 24px;
  border: var(--neo-border-md) solid var(--neo-black);
  background: var(--neo-white);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
  flex-shrink: 0;
}

.neo-checkbox:checked,
.neo-radio:checked {
  background: var(--neo-black);
}

.neo-checkbox:checked::after {
  content: '✓';
  color: var(--neo-white);
  font-size: 16px;
  font-weight: bold;
}

.neo-radio {
  border-radius: 50%;
}

.neo-radio:checked::after {
  content: '';
  width: 10px;
  height: 10px;
  background: var(--neo-white);
  border-radius: 50%;
}

/* Focus states */
.neo-checkbox:focus-visible,
.neo-radio:focus-visible {
  box-shadow: var(--neo-shadow-sm);
}
```

### Form Group

```css
.neo-form-group {
  margin-bottom: var(--neo-space-6);
}

.neo-form-hint {
  font-size: 0.875rem;
  color: var(--neo-dark-gray);
  margin-top: var(--neo-space-2);
}

.neo-form-error {
  font-size: 0.875rem;
  color: var(--neo-red);
  margin-top: var(--neo-space-2);
  font-weight: 600;
}
```

---

## Navigation

### Top Navigation

```css
.neo-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--neo-space-4) var(--neo-space-6);
  background: var(--neo-black);
  border-bottom: var(--neo-border-thick) solid var(--neo-black);
}

.neo-nav__logo {
  font-family: var(--font-neo-display);
  font-size: 1.5rem;
  color: var(--neo-white);
  text-decoration: none;
  text-transform: uppercase;
}

.neo-nav__menu {
  display: flex;
  align-items: center;
  gap: var(--neo-space-6);
  list-style: none;
}

.neo-nav__link {
  color: var(--neo-white);
  text-decoration: none;
  font-weight: 600;
  padding-bottom: var(--neo-space-1);
  border-bottom: 3px solid transparent;
  transition: border-color var(--neo-transition-fast);
}

.neo-nav__link:hover {
  border-bottom-color: var(--neo-yellow);
}

.neo-nav__link--active {
  border-bottom-color: var(--neo-pink);
}

/* Light variant */
.neo-nav--light {
  background: var(--neo-white);
  border-bottom-color: var(--neo-black);
}

.neo-nav--light .neo-nav__logo,
.neo-nav--light .neo-nav__link {
  color: var(--neo-black);
}
```

### Mobile Menu

```css
.neo-nav__toggle {
  display: none;
  background: transparent;
  border: none;
  color: var(--neo-white);
  font-size: 1.5rem;
  cursor: pointer;
}

@media (max-width: 768px) {
  .neo-nav__toggle {
    display: block;
  }

  .neo-nav__menu {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    flex-direction: column;
    background: var(--neo-black);
    border-bottom: var(--neo-border-thick) solid var(--neo-black);
    padding: var(--neo-space-4);
    gap: var(--neo-space-4);
  }

  .neo-nav__menu--open {
    display: flex;
  }
}
```

---

## Badges & Tags

```css
.neo-badge {
  display: inline-flex;
  align-items: center;
  padding: var(--neo-space-1) var(--neo-space-3);
  font-family: var(--font-neo-display);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: var(--neo-yellow);
  border: var(--neo-border-thin) solid var(--neo-black);
}

.neo-badge--pink { background: var(--neo-pink); color: var(--neo-white); }
.neo-badge--blue { background: var(--neo-blue); color: var(--neo-white); }
.neo-badge--green { background: var(--neo-green); color: var(--neo-white); }
.neo-badge--red { background: var(--neo-red); color: var(--neo-white); }
.neo-badge--black { background: var(--neo-black); color: var(--neo-white); }

.neo-tag {
  display: inline-flex;
  align-items: center;
  gap: var(--neo-space-2);
  padding: var(--neo-space-2) var(--neo-space-3);
  font-size: 0.875rem;
  background: var(--neo-gray);
  border: var(--neo-border-thin) solid var(--neo-black);
}

.neo-tag__remove {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  padding: 0;
  line-height: 1;
}
```

---

## Alerts & Notices

```css
.neo-alert {
  padding: var(--neo-space-4) var(--neo-space-6);
  border: var(--neo-border-md) solid var(--neo-black);
  box-shadow: var(--neo-shadow-md);
  margin-bottom: var(--neo-space-4);
}

.neo-alert__title {
  font-family: var(--font-neo-display);
  font-size: 1rem;
  text-transform: uppercase;
  margin-bottom: var(--neo-space-2);
}

.neo-alert--info {
  background: var(--neo-blue);
  color: var(--neo-white);
}

.neo-alert--success {
  background: var(--neo-green);
  color: var(--neo-white);
}

.neo-alert--warning {
  background: var(--neo-yellow);
  color: var(--neo-black);
}

.neo-alert--error {
  background: var(--neo-red);
  color: var(--neo-white);
}
```

---

## Modal / Dialog

```css
.neo-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--neo-space-4);
  z-index: 1000;
}

.neo-modal {
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  background: var(--neo-white);
  border: var(--neo-border-thick) solid var(--neo-black);
  box-shadow: var(--neo-shadow-xl);
}

.neo-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--neo-space-4) var(--neo-space-6);
  background: var(--neo-black);
  color: var(--neo-white);
}

.neo-modal__title {
  font-family: var(--font-neo-display);
  font-size: 1.25rem;
  text-transform: uppercase;
  margin: 0;
}

.neo-modal__close {
  background: none;
  border: none;
  color: var(--neo-white);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.neo-modal__body {
  padding: var(--neo-space-6);
}

.neo-modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--neo-space-3);
  padding: var(--neo-space-4) var(--neo-space-6);
  border-top: var(--neo-border-thin) solid var(--neo-black);
}
```

---

## Tables

```css
.neo-table {
  width: 100%;
  border-collapse: collapse;
  border: var(--neo-border-md) solid var(--neo-black);
}

.neo-table th,
.neo-table td {
  padding: var(--neo-space-3) var(--neo-space-4);
  text-align: left;
  border-bottom: var(--neo-border-thin) solid var(--neo-black);
}

.neo-table th {
  font-family: var(--font-neo-display);
  text-transform: uppercase;
  font-size: 0.875rem;
  background: var(--neo-black);
  color: var(--neo-white);
}

.neo-table tr:hover td {
  background: var(--neo-gray);
}

.neo-table--striped tr:nth-child(even) td {
  background: var(--neo-cream);
}
```

---

## Utilities

```css
/* Text alignment */
.neo-text-left { text-align: left; }
.neo-text-center { text-align: center; }
.neo-text-right { text-align: right; }

/* Font weights */
.neo-font-normal { font-weight: 400; }
.neo-font-medium { font-weight: 500; }
.neo-font-bold { font-weight: 700; }

/* Text transforms */
.neo-uppercase { text-transform: uppercase; }
.neo-lowercase { text-transform: lowercase; }
.neo-capitalize { text-transform: capitalize; }

/* Display */
.neo-block { display: block; }
.neo-inline { display: inline; }
.neo-inline-block { display: inline-block; }
.neo-flex { display: flex; }
.neo-grid { display: grid; }
.neo-hidden { display: none; }

/* Margins & Padding (using spacing scale) */
.neo-m-0 { margin: 0; }
.neo-m-4 { margin: var(--neo-space-4); }
.neo-mt-4 { margin-top: var(--neo-space-4); }
.neo-mb-4 { margin-bottom: var(--neo-space-4); }
.neo-p-4 { padding: var(--neo-space-4); }
/* Add more as needed */

/* Width */
.neo-w-full { width: 100%; }
.neo-max-w-md { max-width: 28rem; }
.neo-max-w-lg { max-width: 32rem; }
.neo-max-w-xl { max-width: 36rem; }
```
