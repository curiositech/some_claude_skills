# Design System Reference - Quick Guide

**Project:** Some Claude Skills
**Purpose:** Quick reference for developers implementing new features
**Version:** 1.0

---

## Color Palette (Windows 3.1 Theme)

### Primary Colors

```css
/* Action Colors */
--win31-lime: #00FF00;           /* Primary CTAs, success states */
--win31-bright-yellow: #FFD700;  /* Secondary CTAs, highlights */
--win31-teal: #008080;          /* Tertiary actions, info */
--win31-magenta: #FF00FF;       /* Accents, "new" badges */

/* Surface Colors */
--win31-gray: #c0c0c0;          /* Window backgrounds */
--win31-light-gray: #dfdfdf;    /* Hover states */
--win31-dark-gray: #808080;     /* Borders, disabled text */
--win31-white: #ffffff;         /* Text on dark backgrounds */
--win31-black: #000000;         /* Text, borders */

/* UI Chrome */
--win31-navy: #000080;          /* Title bars, headers */
--win31-red: #FF0000;           /* Errors, warnings */
```

### When to Use Each Color

| Color | Use Case | Example |
|-------|----------|---------|
| Lime | Primary actions, success | "Install Now" button, progress bars, completed state |
| Yellow | Secondary actions, highlights | "Preview" button, featured badges, new items |
| Teal | Tertiary actions, info | "Learn More" links, info panels |
| Magenta | Accents, special | "NEW" badges, easter eggs |
| Navy | UI chrome | Title bars, headers |
| Gray | Surfaces | Window backgrounds, cards |
| Red | Errors, critical | Error messages, required fields |

---

## Typography System

### Font Stack

```css
/* Display - Pixel art hero titles */
--font-display: 'Press Start 2P', cursive;

/* Window Titles - Retro terminal */
--font-window: 'VT323', monospace;

/* System UI - Buttons, labels, menus */
--font-system: 'IBM Plex Mono', monospace;

/* Body Text - Readable content */
--font-body: 'Courier Prime', 'Courier New', monospace;

/* Code - Same as system */
--font-code: 'IBM Plex Mono', 'Courier New', monospace;
```

### Type Scale

```css
/* Display */
.hero-title {
  font-family: var(--font-display);
  font-size: 24px;
  color: var(--win31-lime);
  text-shadow: 2px 2px 0 rgba(0,0,0,0.5);
}

/* Window Title */
.win31-title-text {
  font-family: var(--font-window);
  font-size: 14px;
  font-weight: 400;
  color: white;
}

/* Heading 1 */
h1 {
  font-family: var(--font-window);
  font-size: 36px;
  font-weight: 400;
}

/* Heading 2 */
h2 {
  font-family: var(--font-window);
  font-size: 28px;
  font-weight: 400;
}

/* Body Text */
p {
  font-family: var(--font-body);
  font-size: 15px;
  line-height: 1.7;
}

/* Button Text */
button {
  font-family: var(--font-system);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

/* Code */
code {
  font-family: var(--font-code);
  font-size: 13px;
}
```

---

## Component Patterns

### Window Container

```tsx
<div className="win31-window">
  <div className="win31-titlebar">
    <div className="win31-titlebar__left">
      <div className="win31-btn-3d win31-btn-3d--small">─</div>
    </div>
    <span className="win31-title-text">WINDOW.TXT</span>
    <div className="win31-titlebar__right">
      <div className="win31-btn-3d win31-btn-3d--small">▲</div>
      <div className="win31-btn-3d win31-btn-3d--small">▼</div>
    </div>
  </div>

  <div className="win31-window__content">
    {/* Content here */}
  </div>

  <div className="win31-statusbar">
    <div className="win31-statusbar-panel">Status text</div>
    <div className="win31-statusbar-panel">Info</div>
  </div>
</div>
```

**CSS:**
```css
.win31-window {
  background: var(--win31-gray);
  border: 3px solid var(--win31-black);
  box-shadow: 8px 8px 0 rgba(0,0,0,0.3);
  margin-bottom: 24px;
}

.win31-titlebar {
  background: linear-gradient(90deg, var(--win31-navy), var(--win31-teal));
  padding: 8px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.win31-title-text {
  font-family: var(--font-window);
  font-size: 14px;
  color: white;
  font-weight: 400;
}
```

---

### Buttons

**Primary Button (Lime):**
```tsx
<button className="win31-btn-3d win31-btn-primary">
  Install Now
</button>
```

```css
.win31-btn-3d {
  background: var(--win31-gray);
  border: 2px outset var(--win31-gray);
  padding: 8px 16px;
  cursor: pointer;
  font-family: var(--font-system);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  transition: all 0.1s;
}

.win31-btn-3d:hover {
  border-color: var(--win31-lime);
  box-shadow: 4px 4px 0 rgba(0,0,0,0.2);
}

.win31-btn-3d:active {
  border-style: inset;
  transform: translateY(2px);
  box-shadow: none;
}

.win31-btn-primary {
  background: var(--win31-lime);
  color: var(--win31-black);
  border-color: var(--win31-lime);
  font-weight: 700;
}
```

**Secondary Button (Yellow):**
```css
.win31-btn-secondary {
  background: var(--win31-bright-yellow);
  color: var(--win31-black);
  border-color: var(--win31-bright-yellow);
}
```

**Tertiary Button (Default Gray):**
```css
.win31-btn-tertiary {
  background: var(--win31-gray);
  color: var(--win31-black);
}
```

---

### Progress Bar

```tsx
<ProgressBar current={3} total={7} label="Step 3 of 7" color="lime" />
```

**Component:**
```tsx
interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
  color?: 'lime' | 'yellow' | 'teal';
}

export function ProgressBar({ current, total, label, color = 'lime' }: ProgressBarProps) {
  const percentage = Math.round((current / total) * 100);
  const colorClass = `progress-bar--${color}`;

  return (
    <div className={`progress-bar ${colorClass}`}>
      <div className="progress-bar__fill" style={{ width: `${percentage}%` }} />
      <div className="progress-bar__text">
        {label || `${current}/${total}`} ({percentage}%)
      </div>
    </div>
  );
}
```

**CSS:**
```css
.progress-bar {
  width: 100%;
  height: 32px;
  background: var(--win31-dark-gray);
  border: 2px solid var(--win31-black);
  position: relative;
  overflow: hidden;
}

.progress-bar__fill {
  height: 100%;
  transition: width 0.3s ease;
}

.progress-bar--lime .progress-bar__fill {
  background: linear-gradient(90deg, var(--win31-lime), #00cc00);
}

.progress-bar--yellow .progress-bar__fill {
  background: linear-gradient(90deg, var(--win31-bright-yellow), #ffa500);
}

.progress-bar--teal .progress-bar__fill {
  background: linear-gradient(90deg, var(--win31-teal), #006666);
}

.progress-bar__text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-family: var(--font-system);
  font-size: 12px;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
}
```

---

### Cards

**Basic Card:**
```tsx
<div className="win31-card">
  <div className="win31-card__header">
    <span className="win31-card__icon">🎨</span>
    <h3 className="win31-card__title">Card Title</h3>
  </div>
  <p className="win31-card__description">Description text</p>
  <button className="win31-btn-3d">Action</button>
</div>
```

**CSS:**
```css
.win31-card {
  background: var(--win31-gray);
  border: 3px solid var(--win31-black);
  box-shadow: 8px 8px 0 rgba(0,0,0,0.3);
  padding: 20px;
  transition: all 0.2s;
}

.win31-card:hover {
  box-shadow: 12px 12px 0 rgba(0,0,0,0.3);
  transform: translateY(-2px);
}

.win31-card__header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.win31-card__icon {
  font-size: 32px;
}

.win31-card__title {
  font-family: var(--font-system);
  font-size: 16px;
  font-weight: bold;
  margin: 0;
}

.win31-card__description {
  font-family: var(--font-body);
  font-size: 13px;
  line-height: 1.5;
  margin-bottom: 16px;
}
```

---

### Badges

**Category Badge:**
```tsx
<span className="badge badge--yellow">Developer</span>
```

**CSS:**
```css
.badge {
  display: inline-block;
  padding: 4px 12px;
  font-family: var(--font-code);
  font-size: 11px;
  font-weight: 600;
  border: 2px solid var(--win31-black);
  text-transform: uppercase;
}

.badge--yellow {
  background: var(--win31-bright-yellow);
  color: var(--win31-black);
}

.badge--lime {
  background: var(--win31-lime);
  color: var(--win31-black);
}

.badge--teal {
  background: var(--win31-teal);
  color: white;
}

.badge--magenta {
  background: var(--win31-magenta);
  color: white;
}
```

**"NEW" Badge (Pixel Art):**
```tsx
<div className="new-badge">NEW</div>
```

**CSS:**
```css
.new-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  background: var(--win31-magenta);
  color: white;
  padding: 4px 8px;
  font-family: var(--font-display);
  font-size: 8px;
  border: 2px solid white;
  box-shadow: 2px 2px 0 rgba(0,0,0,0.5);
  z-index: 10;
}
```

---

### Modals

**Modal Overlay:**
```tsx
<div className="modal-overlay" onClick={onClose}>
  <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
    <div className="win31-titlebar">
      <span className="win31-title-text">DIALOG.DLG</span>
      <button className="win31-btn-3d win31-btn-3d--small" onClick={onClose}>
        X
      </button>
    </div>

    <div className="modal-content">
      {/* Content here */}
    </div>

    <div className="modal-actions">
      <button className="win31-btn-3d win31-btn-primary">OK</button>
      <button className="win31-btn-3d" onClick={onClose}>Cancel</button>
    </div>
  </div>
</div>
```

**CSS:**
```css
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
}

.modal-dialog {
  background: var(--win31-gray);
  border: 4px solid var(--win31-black);
  box-shadow: 16px 16px 0 rgba(0,0,0,0.5);
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow: auto;
}

.modal-content {
  padding: 24px;
}

.modal-actions {
  padding: 16px 24px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  border-top: 2px solid var(--win31-dark-gray);
}
```

---

### Code Blocks

**Inline Code:**
```tsx
<code className="inline-code">/plugin install skill-name</code>
```

**CSS:**
```css
.inline-code {
  background: #000;
  color: var(--win31-lime);
  padding: 2px 6px;
  font-family: var(--font-code);
  font-size: 13px;
  border: 1px solid var(--win31-lime);
}
```

**Code Block with Copy Button:**
```tsx
<div className="code-block">
  <pre className="code-block__pre">
    <code className="code-block__code">{codeString}</code>
  </pre>
  <button className="code-block__copy" onClick={handleCopy}>
    {copied ? '✓ COPIED' : 'COPY'}
  </button>
</div>
```

**CSS:**
```css
.code-block {
  position: relative;
  margin: 16px 0;
}

.code-block__pre {
  background: #000;
  border: 2px solid var(--win31-lime);
  padding: 16px;
  overflow-x: auto;
  margin: 0;
}

.code-block__code {
  color: var(--win31-lime);
  font-family: var(--font-code);
  font-size: 13px;
  line-height: 1.5;
}

.code-block__copy {
  position: absolute;
  top: 8px;
  right: 8px;
  background: var(--win31-gray);
  border: 2px outset var(--win31-gray);
  padding: 6px 12px;
  font-family: var(--font-code);
  font-size: 11px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.1s;
}

.code-block__copy:hover {
  background: var(--win31-lime);
  color: var(--win31-black);
}

.code-block__copy:active {
  border-style: inset;
}
```

---

## Layout Patterns

### Grid System

**3-Column Grid (Responsive):**
```css
.grid-3col {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

@media (max-width: 1199px) {
  .grid-3col {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 767px) {
  .grid-3col {
    grid-template-columns: 1fr;
  }
}
```

**2-Column Layout (Content + Sidebar):**
```css
.layout-sidebar {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 32px;
}

@media (max-width: 1023px) {
  .layout-sidebar {
    grid-template-columns: 1fr;
  }
}
```

---

### Spacing Scale

```css
/* Use these for consistent spacing */
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;
--space-2xl: 48px;
```

**Usage:**
```css
.component {
  padding: var(--space-md);
  margin-bottom: var(--space-lg);
  gap: var(--space-sm);
}
```

---

## Interaction States

### Hover Effects

**Lift Shadow:**
```css
.card {
  box-shadow: 8px 8px 0 rgba(0,0,0,0.3);
  transition: all 0.2s;
}

.card:hover {
  box-shadow: 12px 12px 0 rgba(0,0,0,0.3);
  transform: translateY(-2px);
}
```

**Border Glow:**
```css
.button {
  border: 2px solid var(--win31-gray);
  transition: border-color 0.2s;
}

.button:hover {
  border-color: var(--win31-lime);
}
```

### Focus States

**Keyboard Focus Indicator:**
```css
button:focus-visible,
a:focus-visible {
  outline: 2px solid var(--win31-lime);
  outline-offset: 2px;
}
```

### Loading States

**Skeleton Loader:**
```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--win31-gray) 0%,
    var(--win31-light-gray) 50%,
    var(--win31-gray) 100%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
}

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

---

## Accessibility Patterns

### ARIA Labels

```tsx
<button aria-label="Install Python Pro skill">
  ⚡ Install
</button>

<div role="progressbar" aria-valuenow={42} aria-valuemin={0} aria-valuemax={100}>
  Progress: 42%
</div>

<img src="hero.png" alt="Skill demonstration screenshot showing terminal output" />
```

### Focus Trap (Modal)

```tsx
import { useEffect, useRef } from 'react';

function Modal({ isOpen, onClose, children }) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const focusableElements = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements?.[0] as HTMLElement;
    const lastElement = focusableElements?.[focusableElements.length - 1] as HTMLElement;

    firstElement?.focus();

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [isOpen]);

  return <div ref={modalRef}>{children}</div>;
}
```

### Screen Reader Only Text

```css
.sr-only {
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

---

## Animation Guidelines

### Respect User Preferences

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

### Transition Timings

```css
/* Use these durations */
--transition-fast: 0.1s;      /* Button presses, hovers */
--transition-normal: 0.2s;    /* Cards, modals */
--transition-slow: 0.3s;      /* Page transitions */
```

---

## Responsive Design

### Breakpoints

```css
/* Mobile first approach */
.component {
  /* Mobile styles (< 768px) */
  width: 100%;
}

@media (min-width: 768px) {
  /* Tablet styles */
  .component {
    width: 50%;
  }
}

@media (min-width: 1200px) {
  /* Desktop styles */
  .component {
    width: 33.33%;
  }
}
```

### Touch Targets

```css
/* Minimum 44x44px for mobile */
@media (max-width: 767px) {
  button {
    min-height: 44px;
    min-width: 44px;
    padding: 12px 16px;
  }
}
```

---

## Quick Copy-Paste Snippets

### Complete Window with Content

```tsx
<div className="win31-window">
  <div className="win31-titlebar">
    <div className="win31-titlebar__left">
      <div className="win31-btn-3d win31-btn-3d--small">─</div>
    </div>
    <span className="win31-title-text">EXAMPLE.TXT</span>
    <div className="win31-titlebar__right">
      <div className="win31-btn-3d win31-btn-3d--small">▲</div>
      <div className="win31-btn-3d win31-btn-3d--small">▼</div>
    </div>
  </div>

  <div style={{ padding: '24px' }}>
    <h2>Heading</h2>
    <p>Content goes here...</p>
    <button className="win31-btn-3d win31-btn-primary">Action</button>
  </div>

  <div className="win31-statusbar">
    <div className="win31-statusbar-panel">Ready</div>
    <div className="win31-statusbar-panel">Help</div>
  </div>
</div>
```

### Card Grid

```tsx
<div className="grid-3col">
  {items.map(item => (
    <div key={item.id} className="win31-card">
      <div className="win31-card__header">
        <span className="win31-card__icon">{item.icon}</span>
        <h3 className="win31-card__title">{item.title}</h3>
      </div>
      <p className="win31-card__description">{item.description}</p>
      <button className="win31-btn-3d">View Details</button>
    </div>
  ))}
</div>
```

### Modal Template

```tsx
{isOpen && (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
      <div className="win31-titlebar">
        <span className="win31-title-text">DIALOG.DLG</span>
        <button
          className="win31-btn-3d win31-btn-3d--small"
          onClick={onClose}
          aria-label="Close"
        >
          X
        </button>
      </div>

      <div className="modal-content">
        <h2>Modal Title</h2>
        <p>Modal content...</p>
      </div>

      <div className="modal-actions">
        <button className="win31-btn-3d win31-btn-primary" onClick={handleConfirm}>
          OK
        </button>
        <button className="win31-btn-3d" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
```

---

**Document Version:** 1.0
**Created:** January 2, 2026
**For:** Some Claude Skills Development Team
