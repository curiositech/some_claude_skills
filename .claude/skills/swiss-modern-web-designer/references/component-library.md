# Swiss Modern Component Library

Complete CSS implementations for all Swiss Modern components. Every component follows the four pillars: mathematical grid, strict typography, restrained color, calculated space.

## Base Setup

### CSS Variables

```css
:root {
  /* Color — Light Mode */
  --swiss-black: #000000;
  --swiss-ink: #1a1a1a;
  --swiss-charcoal: #404040;
  --swiss-stone: #6b7280;
  --swiss-silver: #d1d5db;
  --swiss-mist: #f3f4f6;
  --swiss-snow: #f9fafb;
  --swiss-white: #ffffff;
  --swiss-accent: #0066ff;
  --swiss-accent-hover: #0052cc;
  --swiss-accent-light: rgba(0, 102, 255, 0.06);
  --swiss-danger: #dc2626;
  --swiss-danger-light: rgba(220, 38, 38, 0.06);
  --swiss-success: #16a34a;
  --swiss-success-light: rgba(22, 163, 74, 0.06);
  --swiss-warning: #ca8a04;
  --swiss-warning-light: rgba(202, 138, 4, 0.06);

  /* Typography */
  --font-swiss: 'Inter', 'Helvetica Neue', 'Arial', sans-serif;
  --font-swiss-mono: 'JetBrains Mono', 'SF Mono', 'Fira Code', monospace;

  /* Type Scale — Perfect Fourth (1.333) */
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.333rem;
  --text-2xl: 1.777rem;
  --text-3xl: 2.369rem;
  --text-4xl: 3.157rem;
  --text-5xl: 4.209rem;
  --text-6xl: 5.61rem;

  /* Spacing */
  --space-0: 0;
  --space-px: 1px;
  --space-0-5: 0.125rem;
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-10: 2.5rem;
  --space-12: 3rem;
  --space-16: 4rem;
  --space-20: 5rem;
  --space-24: 6rem;
  --space-32: 8rem;

  /* Layout */
  --max-width: 1200px;
  --reading-width: 65ch;
  --gutter: 1.5rem;
  --margin: 2rem;

  /* Borders */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
  --border-color: var(--swiss-silver);

  /* Shadows */
  --shadow-xs: 0 1px 2px rgba(0,0,0,0.03);
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.04), 0 2px 4px rgba(0,0,0,0.02);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.04), 0 4px 6px rgba(0,0,0,0.02);
  --shadow-xl: 0 20px 25px rgba(0,0,0,0.06), 0 8px 10px rgba(0,0,0,0.02);

  /* Motion */
  --ease-default: cubic-bezier(0.25, 0.1, 0.25, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --duration-instant: 50ms;
  --duration-fast: 100ms;
  --duration-normal: 150ms;
  --duration-slow: 300ms;
  --duration-slower: 500ms;
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
  text-rendering: optimizeLegibility;
  -webkit-text-size-adjust: 100%;
}

body {
  font-family: var(--font-swiss);
  font-size: var(--text-base);
  line-height: 1.6;
  color: var(--swiss-ink);
  background: var(--swiss-white);
  font-feature-settings: 'cv01', 'cv02', 'cv03', 'cv04', 'cv11';
}

img {
  display: block;
  max-width: 100%;
  height: auto;
}

a {
  color: var(--swiss-accent);
  text-decoration: none;
  transition: color var(--duration-normal) var(--ease-default);
}

a:hover {
  color: var(--swiss-accent-hover);
  text-decoration: underline;
  text-underline-offset: 3px;
}
```

---

## Typography

```css
.swiss-display {
  font-family: var(--font-swiss);
  font-size: var(--text-5xl);
  font-weight: 700;
  line-height: 1.05;
  letter-spacing: -0.025em;
  color: var(--swiss-black);
}

.swiss-h1 {
  font-family: var(--font-swiss);
  font-size: var(--text-4xl);
  font-weight: 600;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: var(--swiss-black);
}

.swiss-h2 {
  font-family: var(--font-swiss);
  font-size: var(--text-3xl);
  font-weight: 600;
  line-height: 1.15;
  letter-spacing: -0.015em;
  color: var(--swiss-black);
}

.swiss-h3 {
  font-family: var(--font-swiss);
  font-size: var(--text-2xl);
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: -0.01em;
  color: var(--swiss-black);
}

.swiss-h4 {
  font-family: var(--font-swiss);
  font-size: var(--text-xl);
  font-weight: 600;
  line-height: 1.3;
  letter-spacing: -0.005em;
  color: var(--swiss-black);
}

.swiss-body {
  font-size: var(--text-base);
  line-height: 1.6;
  color: var(--swiss-ink);
  max-width: var(--reading-width);
}

.swiss-body--large {
  font-size: var(--text-lg);
  line-height: 1.65;
  color: var(--swiss-charcoal);
}

.swiss-small {
  font-size: var(--text-sm);
  line-height: 1.5;
  color: var(--swiss-charcoal);
}

.swiss-caption {
  font-size: var(--text-xs);
  line-height: 1.4;
  color: var(--swiss-stone);
}

.swiss-overline {
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--swiss-stone);
}

.swiss-mono {
  font-family: var(--font-swiss-mono);
  font-size: 0.9em;
  letter-spacing: -0.02em;
}
```

---

## Buttons

### All Variants

```css
.swiss-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  font-family: var(--font-swiss);
  font-size: var(--text-sm);
  font-weight: 500;
  line-height: 1;
  padding: 0.625rem 1.25rem;
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-default);
  white-space: nowrap;
  user-select: none;
}

.swiss-btn:focus-visible {
  outline: 2px solid var(--swiss-accent);
  outline-offset: 2px;
}

.swiss-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

/* Primary */
.swiss-btn--primary {
  background: var(--swiss-black);
  color: var(--swiss-white);
}
.swiss-btn--primary:hover {
  background: var(--swiss-ink);
  box-shadow: var(--shadow-sm);
}
.swiss-btn--primary:active {
  background: var(--swiss-charcoal);
}

/* Secondary */
.swiss-btn--secondary {
  background: var(--swiss-white);
  color: var(--swiss-ink);
  border-color: var(--swiss-silver);
}
.swiss-btn--secondary:hover {
  background: var(--swiss-mist);
  border-color: var(--swiss-stone);
}
.swiss-btn--secondary:active {
  background: var(--swiss-silver);
}

/* Ghost */
.swiss-btn--ghost {
  background: transparent;
  color: var(--swiss-charcoal);
  padding: 0.625rem 0.75rem;
}
.swiss-btn--ghost:hover {
  background: var(--swiss-mist);
  color: var(--swiss-black);
}

/* Accent */
.swiss-btn--accent {
  background: var(--swiss-accent);
  color: var(--swiss-white);
}
.swiss-btn--accent:hover {
  background: var(--swiss-accent-hover);
  box-shadow: var(--shadow-sm);
}

/* Danger */
.swiss-btn--danger {
  background: var(--swiss-white);
  color: var(--swiss-danger);
  border-color: var(--swiss-danger);
}
.swiss-btn--danger:hover {
  background: var(--swiss-danger);
  color: var(--swiss-white);
}

/* Sizes */
.swiss-btn--sm {
  font-size: var(--text-xs);
  padding: 0.375rem 0.75rem;
}
.swiss-btn--lg {
  font-size: var(--text-base);
  padding: 0.75rem 1.5rem;
}
.swiss-btn--xl {
  font-size: var(--text-lg);
  padding: 1rem 2rem;
  border-radius: var(--radius-lg);
}

/* Icon button */
.swiss-btn--icon {
  padding: 0.5rem;
  border-radius: var(--radius-md);
}
.swiss-btn--icon svg {
  width: 18px;
  height: 18px;
}
```

---

## Cards

```css
/* Base card */
.swiss-card {
  background: var(--swiss-white);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--space-8);
  transition: border-color var(--duration-normal) var(--ease-default),
              box-shadow var(--duration-normal) var(--ease-default);
}

/* Interactive card */
.swiss-card--interactive {
  cursor: pointer;
}
.swiss-card--interactive:hover {
  border-color: var(--swiss-stone);
  box-shadow: var(--shadow-md);
}

/* Elevated card (no border, uses shadow) */
.swiss-card--elevated {
  border-color: transparent;
  box-shadow: var(--shadow-sm);
}
.swiss-card--elevated:hover {
  box-shadow: var(--shadow-md);
}

/* Ghost card (no border, no shadow) */
.swiss-card--ghost {
  border-color: transparent;
  padding: var(--space-6);
}
.swiss-card--ghost:hover {
  background: var(--swiss-mist);
}

/* Metric card (for dashboards) */
.swiss-card--metric {
  padding: var(--space-6);
}
.swiss-card--metric .metric-label {
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--swiss-stone);
  margin-bottom: var(--space-1);
}
.swiss-card--metric .metric-value {
  font-size: var(--text-3xl);
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--swiss-black);
  line-height: 1;
  margin-bottom: var(--space-1);
}
.swiss-card--metric .metric-change {
  font-size: var(--text-sm);
  color: var(--swiss-stone);
}
.swiss-card--metric .metric-change--positive {
  color: var(--swiss-success);
}
.swiss-card--metric .metric-change--negative {
  color: var(--swiss-danger);
}

/* Feature card */
.swiss-card--feature {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
.swiss-card--feature .feature-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--swiss-mist);
  border-radius: var(--radius-md);
  color: var(--swiss-ink);
}
.swiss-card--feature .feature-title {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--swiss-black);
}
.swiss-card--feature .feature-description {
  font-size: var(--text-sm);
  color: var(--swiss-charcoal);
  line-height: 1.6;
}
```

---

## Tables

```css
.swiss-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--text-sm);
}

.swiss-table thead {
  border-bottom: 2px solid var(--swiss-black);
}

.swiss-table th {
  font-weight: 600;
  font-size: var(--text-xs);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--swiss-stone);
  text-align: left;
  padding: var(--space-3) var(--space-4);
}

.swiss-table td {
  padding: var(--space-4);
  color: var(--swiss-ink);
  border-bottom: 1px solid var(--swiss-mist);
}

.swiss-table tbody tr:hover {
  background: var(--swiss-snow);
}

.swiss-table td.mono {
  font-family: var(--font-swiss-mono);
  font-size: 0.85em;
}

/* Compact variant */
.swiss-table--compact th,
.swiss-table--compact td {
  padding: var(--space-2) var(--space-3);
}

/* Borderless variant */
.swiss-table--borderless td {
  border-bottom: none;
}
```

---

## Badges and Tags

```css
.swiss-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-xs);
  font-weight: 500;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  background: var(--swiss-mist);
  color: var(--swiss-charcoal);
}

.swiss-badge--accent {
  background: var(--swiss-accent-light);
  color: var(--swiss-accent);
}

.swiss-badge--success {
  background: var(--swiss-success-light);
  color: var(--swiss-success);
}

.swiss-badge--danger {
  background: var(--swiss-danger-light);
  color: var(--swiss-danger);
}

.swiss-badge--warning {
  background: var(--swiss-warning-light);
  color: var(--swiss-warning);
}

/* Dot indicator */
.swiss-badge--dot::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

/* Tag (rectangular) */
.swiss-tag {
  display: inline-flex;
  align-items: center;
  font-size: var(--text-xs);
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  background: var(--swiss-mist);
  color: var(--swiss-charcoal);
  border: 1px solid var(--border-color);
}
```

---

## Modals / Dialogs

```css
.swiss-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-8);
  z-index: 50;
  animation: swiss-fade-in var(--duration-normal) var(--ease-out);
}

.swiss-modal {
  background: var(--swiss-white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  width: 100%;
  max-width: 480px;
  max-height: 85vh;
  overflow-y: auto;
  animation: swiss-scale-in var(--duration-slow) var(--ease-spring);
}

.swiss-modal__header {
  padding: var(--space-6) var(--space-8) var(--space-4);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
}

.swiss-modal__title {
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--swiss-black);
}

.swiss-modal__description {
  font-size: var(--text-sm);
  color: var(--swiss-charcoal);
  margin-top: var(--space-1);
}

.swiss-modal__body {
  padding: 0 var(--space-8) var(--space-6);
}

.swiss-modal__footer {
  padding: var(--space-4) var(--space-8) var(--space-6);
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
}

@keyframes swiss-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes swiss-scale-in {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
}
```

---

## Form Elements

### Text Inputs

```css
.swiss-input-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.swiss-input-label {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--swiss-ink);
}

.swiss-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-family: var(--font-swiss);
  font-size: var(--text-sm);
  color: var(--swiss-ink);
  background: var(--swiss-white);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  transition: border-color var(--duration-normal), box-shadow var(--duration-normal);
}

.swiss-input:hover {
  border-color: var(--swiss-stone);
}

.swiss-input:focus {
  outline: none;
  border-color: var(--swiss-accent);
  box-shadow: 0 0 0 3px var(--swiss-accent-light);
}

.swiss-input--error {
  border-color: var(--swiss-danger);
}

.swiss-input--error:focus {
  box-shadow: 0 0 0 3px var(--swiss-danger-light);
}

.swiss-input-hint {
  font-size: var(--text-xs);
  color: var(--swiss-stone);
}

.swiss-input-error {
  font-size: var(--text-xs);
  color: var(--swiss-danger);
}
```

### Textarea

```css
.swiss-textarea {
  width: 100%;
  padding: 0.625rem 0.75rem;
  font-family: var(--font-swiss);
  font-size: var(--text-sm);
  color: var(--swiss-ink);
  background: var(--swiss-white);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  resize: vertical;
  min-height: 100px;
  transition: border-color var(--duration-normal), box-shadow var(--duration-normal);
}

.swiss-textarea:focus {
  outline: none;
  border-color: var(--swiss-accent);
  box-shadow: 0 0 0 3px var(--swiss-accent-light);
}
```

### Select

```css
.swiss-select {
  appearance: none;
  width: 100%;
  padding: 0.5rem 2rem 0.5rem 0.75rem;
  font-family: var(--font-swiss);
  font-size: var(--text-sm);
  color: var(--swiss-ink);
  background: var(--swiss-white) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E") no-repeat right 0.75rem center;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: border-color var(--duration-normal);
}

.swiss-select:focus {
  outline: none;
  border-color: var(--swiss-accent);
  box-shadow: 0 0 0 3px var(--swiss-accent-light);
}
```

### Checkbox and Radio

```css
.swiss-checkbox {
  appearance: none;
  width: 18px;
  height: 18px;
  border: 1.5px solid var(--swiss-silver);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--duration-fast);
  position: relative;
}

.swiss-checkbox:checked {
  background: var(--swiss-accent);
  border-color: var(--swiss-accent);
}

.swiss-checkbox:checked::after {
  content: '';
  position: absolute;
  left: 5px;
  top: 2px;
  width: 5px;
  height: 9px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.swiss-checkbox:focus-visible {
  outline: 2px solid var(--swiss-accent);
  outline-offset: 2px;
}

.swiss-radio {
  appearance: none;
  width: 18px;
  height: 18px;
  border: 1.5px solid var(--swiss-silver);
  border-radius: 50%;
  cursor: pointer;
  transition: all var(--duration-fast);
}

.swiss-radio:checked {
  border-color: var(--swiss-accent);
  border-width: 5px;
}
```

---

## Alerts / Notices

```css
.swiss-alert {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  line-height: 1.5;
  border: 1px solid;
}

.swiss-alert--info {
  background: var(--swiss-accent-light);
  border-color: rgba(0, 102, 255, 0.15);
  color: var(--swiss-ink);
}

.swiss-alert--success {
  background: var(--swiss-success-light);
  border-color: rgba(22, 163, 74, 0.15);
  color: var(--swiss-ink);
}

.swiss-alert--warning {
  background: var(--swiss-warning-light);
  border-color: rgba(202, 138, 4, 0.15);
  color: var(--swiss-ink);
}

.swiss-alert--danger {
  background: var(--swiss-danger-light);
  border-color: rgba(220, 38, 38, 0.15);
  color: var(--swiss-ink);
}

.swiss-alert__title {
  font-weight: 600;
  margin-bottom: var(--space-1);
}
```

---

## Dividers

```css
.swiss-divider {
  height: 1px;
  background: var(--swiss-silver);
  border: none;
  margin: var(--space-8) 0;
}

.swiss-divider--subtle {
  background: var(--swiss-mist);
}

.swiss-divider--strong {
  height: 2px;
  background: var(--swiss-black);
}

.swiss-divider--section {
  margin: var(--space-16) 0;
}

/* Labeled divider */
.swiss-divider--labeled {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  height: auto;
  background: none;
}

.swiss-divider--labeled::before,
.swiss-divider--labeled::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--swiss-silver);
}

.swiss-divider--labeled span {
  font-size: var(--text-xs);
  font-weight: 500;
  color: var(--swiss-stone);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
```

---

## Navigation Components

### Breadcrumbs

```css
.swiss-breadcrumbs {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--swiss-stone);
}

.swiss-breadcrumbs a {
  color: var(--swiss-stone);
  text-decoration: none;
}

.swiss-breadcrumbs a:hover {
  color: var(--swiss-ink);
}

.swiss-breadcrumbs__separator {
  color: var(--swiss-silver);
  font-size: var(--text-xs);
}

.swiss-breadcrumbs__current {
  color: var(--swiss-ink);
  font-weight: 500;
}
```

### Tabs

```css
.swiss-tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid var(--swiss-silver);
}

.swiss-tab {
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--swiss-stone);
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  cursor: pointer;
  transition: color var(--duration-normal), border-color var(--duration-normal);
}

.swiss-tab:hover {
  color: var(--swiss-ink);
}

.swiss-tab--active {
  color: var(--swiss-black);
  border-bottom-color: var(--swiss-black);
}
```

### Pagination

```css
.swiss-pagination {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.swiss-pagination__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--swiss-charcoal);
  background: none;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  cursor: pointer;
}

.swiss-pagination__btn:hover {
  background: var(--swiss-mist);
}

.swiss-pagination__btn--active {
  background: var(--swiss-black);
  color: var(--swiss-white);
}
```

---

## Tooltip

```css
.swiss-tooltip {
  position: relative;
}

.swiss-tooltip__content {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  padding: var(--space-2) var(--space-3);
  background: var(--swiss-ink);
  color: var(--swiss-white);
  font-size: var(--text-xs);
  font-weight: 500;
  border-radius: var(--radius-md);
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity var(--duration-fast);
}

.swiss-tooltip:hover .swiss-tooltip__content {
  opacity: 1;
}

.swiss-tooltip__content::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 4px solid transparent;
  border-top-color: var(--swiss-ink);
}
```

---

## Skeleton Loading

```css
.swiss-skeleton {
  background: linear-gradient(90deg,
    var(--swiss-mist) 25%,
    var(--swiss-snow) 50%,
    var(--swiss-mist) 75%
  );
  background-size: 200% 100%;
  animation: swiss-shimmer 1.5s infinite;
  border-radius: var(--radius-sm);
}

.swiss-skeleton--text {
  height: 1em;
  width: 80%;
  margin-bottom: var(--space-2);
}

.swiss-skeleton--heading {
  height: 1.5em;
  width: 60%;
  margin-bottom: var(--space-4);
}

.swiss-skeleton--circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.swiss-skeleton--card {
  height: 200px;
}

@keyframes swiss-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

---

## Avatar

```css
.swiss-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  overflow: hidden;
  background: var(--swiss-mist);
  color: var(--swiss-charcoal);
  font-weight: 600;
  flex-shrink: 0;
}

.swiss-avatar--sm { width: 28px; height: 28px; font-size: var(--text-xs); }
.swiss-avatar--md { width: 36px; height: 36px; font-size: var(--text-sm); }
.swiss-avatar--lg { width: 48px; height: 48px; font-size: var(--text-base); }
.swiss-avatar--xl { width: 64px; height: 64px; font-size: var(--text-lg); }

.swiss-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Avatar group */
.swiss-avatar-group {
  display: flex;
}

.swiss-avatar-group .swiss-avatar {
  border: 2px solid var(--swiss-white);
  margin-left: -8px;
}

.swiss-avatar-group .swiss-avatar:first-child {
  margin-left: 0;
}
```

---

## Code Block

```css
.swiss-code-block {
  font-family: var(--font-swiss-mono);
  font-size: 0.85em;
  line-height: 1.6;
  background: var(--swiss-snow);
  border: 1px solid var(--swiss-mist);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  overflow-x: auto;
}

.swiss-code-inline {
  font-family: var(--font-swiss-mono);
  font-size: 0.85em;
  background: var(--swiss-mist);
  padding: 0.15em 0.4em;
  border-radius: var(--radius-sm);
  color: var(--swiss-ink);
}
```

---

## Utility Classes

```css
/* Flexbox */
.swiss-flex { display: flex; }
.swiss-flex-col { display: flex; flex-direction: column; }
.swiss-items-center { align-items: center; }
.swiss-justify-between { justify-content: space-between; }
.swiss-gap-2 { gap: var(--space-2); }
.swiss-gap-4 { gap: var(--space-4); }
.swiss-gap-6 { gap: var(--space-6); }
.swiss-gap-8 { gap: var(--space-8); }

/* Text alignment */
.swiss-text-center { text-align: center; }
.swiss-text-right { text-align: right; }

/* Truncation */
.swiss-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Visually hidden (accessible) */
.swiss-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```
