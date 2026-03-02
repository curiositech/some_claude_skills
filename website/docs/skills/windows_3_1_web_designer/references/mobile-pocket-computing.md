---
title: Mobile: The Pocket Computing Paradigm
sidebar_label: Mobile: The Pocket Computing P...
sidebar_position: 2
---
# Mobile: The Pocket Computing Paradigm

How to make Windows 3.1 responsive for modern mobile devices.

## Core Philosophy

Win31 on mobile isn't about shrinking Program Manager—it's **reimagining the pocket organizer** with Win31 chrome. The paradigm is "desktop in your pocket" at its most primitive: single-window focus, modal everything, and explicit navigation.

Key principles:
1. **One window at a time** - No multitasking visible
2. **Program Manager is home** - Icon grid, explicit program selection
3. **Modal dialogs stack** - Everything is a focused interaction
4. **No taskbar** - Use explicit "switch to" or "close"
5. **System info at top** - Battery, time in title bar area

---

## Layout Architecture

### Mobile Viewport (&lt; 640px)

```
┌────────────────────────────┐
│ ■ Program Manager ─ 10:45  │  ← Title bar with time
├────────────────────────────┤
│                            │
│  ╔════════════════════╗    │
│  ║ Main              ║    │
│  ╠════════════════════╣    │
│  ║                    ║    │
│  ║  ┌───┐   ┌───┐    ║    │
│  ║  │📁│   │📝│    ║    │  ← Program group (icon grid)
│  ║  │Mgr│   │Wrt│    ║    │
│  ║  └───┘   └───┘    ║    │
│  ║                    ║    │
│  ║  ┌───┐   ┌───┐    ║    │
│  ║  │🎨│   │💾│    ║    │
│  ║  │Pnt│   │Dsk│    ║    │
│  ║  └───┘   └───┘    ║    │
│  ║                    ║    │
│  ╚════════════════════╝    │
│                            │
├────────────────────────────┤
│ [ Window ]  [ Help ]       │  ← Menu bar at bottom
└────────────────────────────┘
```

### CSS Grid Implementation

```css
.win31-mobile-layout {
  display: grid;
  grid-template-rows: 24px 1fr 28px;
  height: 100vh;
  height: 100dvh; /* Dynamic viewport for mobile */
  background: var(--win31-teal); /* Desktop background */
}

.win31-mobile-titlebar {
  background: var(--win31-navy);
  color: var(--win31-white);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 8px;
  font-family: var(--font-pixel);
  font-size: 10px;
  border-bottom: 2px solid var(--win31-black);
}

.win31-mobile-main {
  padding: 8px;
  overflow-y: auto;
}

.win31-mobile-menubar {
  background: var(--win31-gray);
  border-top: 2px solid var(--win31-white);
  display: flex;
  align-items: center;
  padding: 2px 4px;
  gap: 2px;
}
```

---

## Program Manager (Mobile)

The heart of Win31 mobile—a single program group fills the screen:

```
┌────────────────────────────┐
│ ■ Accessories ────── 10:45 │
├────────────────────────────┤
│ ╔════════════════════════╗ │
│ ║                        ║ │
│ ║  ┌────┐    ┌────┐     ║ │
│ ║  │ 📝 │    │ 🎨 │     ║ │
│ ║  │Note│    │Pnt │     ║ │
│ ║  │ pad│    │brsh│     ║ │
│ ║  └────┘    └────┘     ║ │
│ ║                        ║ │
│ ║  ┌────┐    ┌────┐     ║ │
│ ║  │ ✍️ │    │ 🖩 │     ║ │
│ ║  │Writ│    │Calc│     ║ │
│ ║  │ e  │    │    │     ║ │
│ ║  └────┘    └────┘     ║ │
│ ║                        ║ │
│ ║  ┌────┐    ┌────┐     ║ │
│ ║  │ 🃏 │    │ 📞 │     ║ │
│ ║  │Card│    │Card│     ║ │
│ ║  │file│    │file│     ║ │
│ ║  └────┘    └────┘     ║ │
│ ║                        ║ │
│ ╚════════════════════════╝ │
├────────────────────────────┤
│ [File] [Options] [Window] ▲│
└────────────────────────────┘
```

### Program Group Implementation

```css
.win31-program-group-mobile {
  background: var(--win31-gray);
  border: 3px solid var(--win31-black);
  box-shadow:
    inset 2px 2px 0 var(--win31-white),
    inset -2px -2px 0 var(--win31-dark-gray);
  margin: 4px;
}

.win31-program-group-titlebar {
  background: var(--win31-navy);
  color: var(--win31-white);
  padding: 2px 6px;
  font-family: var(--font-pixel);
  font-size: 10px;
  font-weight: bold;
}

.win31-program-icons-mobile {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 16px;
  justify-items: center;
}

.win31-program-icon {
  width: 64px;
  text-align: center;
  cursor: pointer;
}

.win31-program-icon img {
  width: 32px;
  height: 32px;
  image-rendering: pixelated;
  border: 1px solid transparent;
}

.win31-program-icon:active img {
  border: 1px dotted var(--win31-navy);
}

.win31-program-icon span {
  display: block;
  font-family: var(--font-pixel);
  font-size: 10px;
  margin-top: 4px;
  word-break: break-word;
}
```

---

## Application Windows on Mobile

When a program opens, it takes over the full screen:

```
┌────────────────────────────┐
│ ■ Write - LETTER.WRI ─ [─] │
├────────────────────────────┤
│ File Edit Find Character ▼ │
├────────────────────────────┤
│ ┌────────────────────────┐ │
│ │Dear Sir,              │ │
│ │                        │ │
│ │I am writing to...     │ │
│ │                        │ │
│ │                        │ │
│ │                        │ │
│ │                        │ │
│ │                        │ │
│ │                        │ │
│ │                        │ │
│ │                        │ │
│ │                        │ │
│ │                        │ │
│ └────────────────────────┘ │
├────────────────────────────┤
│ Page 1        Ln 1  Col 1  │
└────────────────────────────┘
```

### Full-Screen Window CSS

```css
.win31-window-mobile {
  position: fixed;
  inset: 0;
  background: var(--win31-gray);
  display: flex;
  flex-direction: column;
  z-index: 100;
}

.win31-window-mobile-titlebar {
  background: var(--win31-navy);
  color: var(--win31-white);
  padding: 4px 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: var(--font-pixel);
  font-size: 10px;
  font-weight: bold;
  min-height: 22px;
}

.win31-window-mobile-menubar {
  background: var(--win31-gray);
  border-bottom: 2px solid var(--win31-dark-gray);
  padding: 2px;
  display: flex;
  gap: 2px;
  flex-wrap: wrap;
}

.win31-window-mobile-content {
  flex: 1;
  overflow-y: auto;
  padding: 2px;
}

.win31-window-mobile-statusbar {
  background: var(--win31-gray);
  border-top: 2px solid var(--win31-white);
  padding: 2px 8px;
  font-family: var(--font-pixel);
  font-size: 10px;
  display: flex;
  justify-content: space-between;
}
```

---

## Dialog Stack Pattern

Dialogs stack on mobile—tap outside to dismiss or use explicit close:

```
┌────────────────────────────┐
│ ■ Write - LETTER.WRI ─     │  ← Main app (dimmed)
├────────────────────────────┤
│                            │
│  ┌── Save As ────────[×]┐  │  ← Dialog on top
│  │                       │  │
│  │ File Name:            │  │
│  │ ┌───────────────────┐ │  │
│  │ │LETTER.WRI        │ │  │
│  │ └───────────────────┘ │  │
│  │                       │  │
│  │ Directory: C:\DOCS    │  │
│  │                       │  │
│  │   [ OK ]  [ Cancel ]  │  │
│  └───────────────────────┘  │
│                            │
└────────────────────────────┘
```

### Dialog Stack CSS

```css
.win31-dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.win31-dialog-mobile {
  width: calc(100% - 32px);
  max-width: 320px;
  max-height: 80vh;
  background: var(--win31-gray);
  border: 3px solid var(--win31-black);
  box-shadow:
    inset 2px 2px 0 var(--win31-white),
    inset -2px -2px 0 var(--win31-dark-gray),
    4px 4px 0 var(--win31-black);
  overflow: hidden;
}

.win31-dialog-mobile-titlebar {
  background: var(--win31-navy);
  color: var(--win31-white);
  padding: 3px 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: var(--font-pixel);
  font-size: 10px;
}

.win31-dialog-mobile-content {
  padding: 12px;
  max-height: calc(80vh - 100px);
  overflow-y: auto;
}

.win31-dialog-mobile-buttons {
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 8px 12px 12px;
  border-top: 2px solid var(--win31-dark-gray);
}
```

---

## Touch Adaptations

### Larger Touch Targets

```css
/* Minimum 44px touch targets (Apple HIG) */
.win31-touch-target {
  min-height: 44px;
  min-width: 44px;
}

/* Program icons on mobile */
.win31-program-icon-mobile {
  width: 72px;
  text-align: center;
  padding: 8px;
}

.win31-program-icon-mobile img {
  width: 40px;
  height: 40px;
}

/* Menu items need more padding */
.win31-menu-item-mobile {
  padding: 10px 16px;
  font-size: 13px;
  border-bottom: 1px solid var(--win31-dark-gray);
}

/* Buttons need more height */
.win31-btn-3d-mobile {
  min-height: 36px;
  padding: 8px 20px;
}
```

### Gestures Mapped to Win31 Actions

| Gesture | Win31 Equivalent | Action |
|---------|------------------|--------|
| Tap | Click | Select/Open |
| Long press | N/A (no right-click in Win31) | Show context help |
| Swipe left | Close window | Return to Program Manager |
| Swipe down | Minimize | Minimize to icon |
| Pinch | N/A | Not supported |

```javascript
// Swipe left to close window
let startX = 0;

document.addEventListener('touchstart', (e) => {
  startX = e.touches[0].clientX;
});

document.addEventListener('touchend', (e) => {
  const endX = e.changedTouches[0].clientX;
  const diff = startX - endX;

  if (diff > 100) {
    closeActiveWindow();
  }
});
```

---

## Responsive Breakpoints

| Breakpoint | Metaphor | Layout Changes |
|------------|----------|----------------|
| &lt; 400px | Pocket organizer | Single column icons, minimal chrome |
| 400-640px | Small PDA | 2-column icons, full menu bar |
| 640-1024px | Tablet/laptop | 3-4 column icons, cascading windows possible |
| > 1024px | Desktop | Full Win31 experience |

```css
/* Pocket organizer */
@media (max-width: 399px) {
  .win31-program-icons-mobile {
    grid-template-columns: 1fr;
  }

  .win31-menu-item {
    padding: 2px 4px;
    font-size: 9px;
  }
}

/* Small PDA */
@media (min-width: 400px) and (max-width: 639px) {
  .win31-program-icons-mobile {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Tablet */
@media (min-width: 640px) and (max-width: 1023px) {
  .win31-program-icons-mobile {
    grid-template-columns: repeat(3, 1fr);
  }

  /* Allow side-by-side windows */
  .win31-window-mobile {
    position: relative;
    max-width: 50%;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  /* Switch to full desktop layout */
  .win31-mobile-layout {
    display: none;
  }

  .win31-desktop-layout {
    display: block;
  }
}
```

---

## Menu System (Mobile)

Menus drop down as full-width panels:

```
┌────────────────────────────┐
│ ■ File Manager ────── 10:45│
├────────────────────────────┤
│ ▼ File                     │  ← Menu expanded
│ ┌────────────────────────┐ │
│ │ Open                   │ │
│ │ Move...                │ │
│ │ Copy...                │ │
│ │ Delete                 │ │
│ │ Rename...              │ │
│ │ ─────────────────────  │ │
│ │ Properties...          │ │
│ │ ─────────────────────  │ │
│ │ Exit                   │ │
│ └────────────────────────┘ │
│                            │
└────────────────────────────┘
```

### Mobile Menu CSS

```css
.win31-menu-mobile {
  position: absolute;
  left: 0;
  right: 0;
  background: var(--win31-gray);
  border: 2px solid;
  border-color: var(--win31-white) var(--win31-black)
               var(--win31-black) var(--win31-white);
  z-index: 150;
  max-height: 60vh;
  overflow-y: auto;
}

.win31-menu-item-mobile {
  padding: 12px 16px;
  font-family: var(--font-pixel);
  font-size: 12px;
  border-bottom: 1px solid var(--win31-light-gray);
  touch-action: manipulation;
}

.win31-menu-item-mobile:active {
  background: var(--win31-navy);
  color: var(--win31-white);
}

.win31-menu-separator {
  height: 2px;
  background: var(--win31-dark-gray);
  margin: 4px 8px;
}
```

---

## Status Indicators

System status shown in title bar area:

```css
.win31-mobile-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-pixel);
  font-size: 9px;
}

.win31-mobile-battery {
  display: flex;
  align-items: center;
  gap: 2px;
}

.win31-mobile-battery-icon {
  width: 16px;
  height: 10px;
  border: 1px solid var(--win31-white);
  position: relative;
}

.win31-mobile-battery-icon::after {
  content: '';
  position: absolute;
  right: -3px;
  top: 2px;
  width: 2px;
  height: 6px;
  background: var(--win31-white);
}

.win31-mobile-battery-level {
  position: absolute;
  left: 1px;
  top: 1px;
  bottom: 1px;
  background: var(--win31-lime);
  /* Width set via inline style based on level */
}
```

---

## Performance Considerations

1. **No animations** - Win31 was instantaneous
2. **Minimal shadows** - Only hard-edge bevels
3. **System fonts first** - Pixel fonts load later
4. **Single-window focus** - Only render active window
5. **Lazy load groups** - Only load icons when group opens

```css
@media (prefers-reduced-motion: reduce) {
  /* Win31 already has no motion, but ensure it */
  * {
    transition: none !important;
    animation: none !important;
  }
}

/* Optimize for touch scrolling */
.win31-scrollable-mobile {
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}
```

---

## Key Differences from Win95 Mobile

| Aspect | Win31 Mobile | Win95 Mobile |
|--------|--------------|--------------|
| **Navigation** | Program Manager | Start Menu + Taskbar |
| **Multitasking** | Hidden (manual switch) | Visible in taskbar |
| **Window controls** | Single menu button | Three buttons (−□×) |
| **Status bar** | Per-window | System-wide taskbar |
| **Background** | Teal desktop | Customizable |
| **Icon style** | 32x32 flat | 32x32 with shadows |

Win31 mobile feels more like a dedicated pocket organizer than a "shrunken desktop."
