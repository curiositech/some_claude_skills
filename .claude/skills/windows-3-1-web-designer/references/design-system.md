# Windows 3.1 Design System

Core colors, typography, and beveled border patterns.

## Color Palette

```css
:root {
  /* Primary System Colors */
  --win31-white: #ffffff;
  --win31-black: #000000;
  --win31-gray: #c0c0c0;           /* THE system gray - most important */
  --win31-dark-gray: #808080;      /* Shadow/pressed states */
  --win31-light-gray: #dfdfdf;     /* Highlights */

  /* Window Chrome */
  --win31-navy: #000080;           /* Title bar background */
  --win31-title-text: #ffffff;     /* Title bar text */

  /* Accent Colors (use sparingly) */
  --win31-teal: #008080;           /* Links, highlights */
  --win31-yellow: #ffff00;         /* Warnings, featured items */
  --win31-lime: #00ff00;           /* Success states */
  --win31-magenta: #ff00ff;        /* Rare accent only */
  --win31-red: #ff0000;            /* Errors, close buttons */
  --win31-blue: #0000ff;           /* Selected text background */
}
```

## The Sacred Rule of Beveled Borders

Windows 3.1's entire visual language rests on the illusion of depth created by beveled borders.

### OUTSET (Raised) Elements
Buttons, toolbars, status bars:

```css
.win31-outset {
  border-style: solid;
  border-width: 2px;
  border-top-color: var(--win31-white);
  border-left-color: var(--win31-white);
  border-bottom-color: var(--win31-black);
  border-right-color: var(--win31-black);
  box-shadow:
    inset 1px 1px 0 var(--win31-light-gray),
    inset -1px -1px 0 var(--win31-dark-gray);
}
```

### INSET (Sunken) Elements
Text fields, list boxes, content areas:

```css
.win31-inset {
  border-style: solid;
  border-width: 2px;
  border-top-color: var(--win31-dark-gray);
  border-left-color: var(--win31-dark-gray);
  border-bottom-color: var(--win31-white);
  border-right-color: var(--win31-white);
  box-shadow:
    inset 1px 1px 0 var(--win31-black),
    inset -1px -1px 0 var(--win31-light-gray);
}
```

### PRESSED State
Active buttons:

```css
.win31-pressed {
  border-top-color: var(--win31-black);
  border-left-color: var(--win31-black);
  border-bottom-color: var(--win31-white);
  border-right-color: var(--win31-white);
  box-shadow: inset 1px 1px 0 var(--win31-dark-gray);
}
```

## Typography

```css
:root {
  /* Primary UI Font - pixel-style */
  --font-pixel: 'VT323', 'Courier New', monospace;

  /* Headings - chunky pixel font */
  --font-pixel-heading: 'Press Start 2P', 'VT323', monospace;

  /* Code/Terminal */
  --font-code: 'IBM Plex Mono', 'Courier Prime', 'Courier New', monospace;

  /* System UI (fallback) */
  --font-system: 'MS Sans Serif', 'Arial', sans-serif;
}

/* Sizing Guidelines */
.win31-text-tiny { font-size: 8px; letter-spacing: 1px; }
.win31-text-small { font-size: 10px; letter-spacing: 1px; }
.win31-text-body { font-size: 12px; letter-spacing: 0.5px; }
.win31-text-large { font-size: 14px; }
.win31-text-title { font-size: 11px; letter-spacing: 2px; text-transform: uppercase; }
```

## Quick Reference Card

| Element | Background | Border Pattern | Shadow |
|---------|------------|----------------|--------|
| Window | #c0c0c0 | 3px solid black | inset white/dark-gray |
| Titlebar | #000080 | none | none |
| Button (up) | #c0c0c0 | none | inset white TL, black BR |
| Button (down) | #c0c0c0 | none | inset black TL, white BR |
| Input | #ffffff | inset 2px | inset 1px black |
| Panel (raised) | #c0c0c0 | outset 2px | none |
| Panel (inset) | #ffffff | inset 2px | inset 1px black |
| Statusbar | #c0c0c0 | inset 1px per panel | none |

## Hotdog Stand Mode

The infamous high-contrast color scheme. Use only for easter eggs or accessibility:

```css
.hotdog-stand {
  --win31-gray: #ff0000;
  --win31-dark-gray: #800000;
  --win31-light-gray: #ff8080;
  --win31-navy: #ffff00;
  --win31-title-text: #ff0000;
}
```
