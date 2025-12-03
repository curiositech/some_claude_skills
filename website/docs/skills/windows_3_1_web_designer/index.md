---
slug: /skills/windows_3_1_web_designer
id: windows_3_1_web_designer
title: Windows 3.1 Web Designer
description: Authentic Windows 3.1 aesthetic for modern web applications
category: Visual Design & UI
sidebar_position: 9
---

# Windows 3.1 Web Design Expert

<SkillHeader
  skillName="Windows 3 1 Web Designer"
  fileName="windows_3_1_web_designer"
  description={"\"Expert in authentic Windows 3.1 aesthetic for modern web applications. Creates pixel-perfect retro UI with beveled borders, system gray palettes, and program manager styling. Activate on 'windows 3.1', 'retro ui', 'beveled borders', 'win31', 'program manager', '90s aesthetic'. NOT for vaporwave (neon gradients), glassmorphism, macOS/iOS styling, flat design, or material design.\""}
  tags={["creation","design","visual","code"]}
/>

Expert in authentic Windows 3.1 aesthetic for modern web applications. Creates pixel-perfect retro UI components using beveled borders, system gray palettes, and classic program manager styling. Specializes in translating 1990s desktop metaphors into responsive web experiences while maintaining nostalgic authenticity.

## When to Use This Skill

Use this skill when:
- Building retro-themed web applications with Windows 3.1 authenticity
- Converting vaporwave or modern UI to classic Win31 styling
- Creating nostalgic landing pages, documentation sites, or portfolios
- Designing game interfaces with 90s desktop aesthetic
- Building pixel-art adjacent web experiences

**NOT for**: Vaporwave aesthetics (neon gradients, glowing text, cyan-magenta schemes), modern glassmorphism, macOS/iOS styling, flat design, material design, or skeuomorphic iOS textures.

## Core Design System

### The Sacred Color Palette

```css
:root {
  /* Primary System Colors */
  --win31-white: #ffffff;
  --win31-black: #000000;
  --win31-gray: #c0c0c0;           /* THE system gray */
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
}
```

### The Beveled Border Pattern

The entire Windows 3.1 visual language rests on the illusion of depth created by beveled borders:

**OUTSET (Raised) Elements** - Buttons, toolbars:
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

**INSET (Sunken) Elements** - Text fields, content areas:
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

## Component Patterns

### Window Chrome

```jsx
<div className="win31-window">
  <div className="win31-titlebar">
    <div className="win31-titlebar__left">
      <div className="win31-btn-3d win31-btn-3d--small">─</div>
    </div>
    <span className="win31-title-text">PROGRAM.EXE</span>
    <div className="win31-titlebar__right">
      <div className="win31-btn-3d win31-btn-3d--small">▲</div>
      <div className="win31-btn-3d win31-btn-3d--small">▼</div>
    </div>
  </div>
  <div className="win31-content">
    {/* Your content here */}
  </div>
</div>
```

### 3D Push Buttons

```css
.win31-btn-3d {
  background: var(--win31-gray);
  border: none;
  padding: 8px 16px;
  font-family: var(--font-pixel);
  font-size: 12px;
  cursor: pointer;

  /* The magic bevel */
  box-shadow:
    inset -2px -2px 0 var(--win31-dark-gray),
    inset 2px 2px 0 var(--win31-white),
    inset -3px -3px 0 var(--win31-black),
    inset 3px 3px 0 var(--win31-light-gray);
}

.win31-btn-3d:active {
  box-shadow:
    inset 2px 2px 0 var(--win31-dark-gray),
    inset -2px -2px 0 var(--win31-white);
  padding: 9px 15px 7px 17px; /* Shift content */
}
```

## Windows 3.1 vs Vaporwave: Quick Reference

| Vaporwave (Avoid) | Windows 3.1 (Use) |
|-------------------|-------------------|
| `linear-gradient(#1a1a2e, #16213e)` | `background: #c0c0c0` |
| `text-shadow: 0 0 10px cyan` | No glow, hard shadows only |
| `background: linear-gradient(cyan, magenta)` | Solid `#008080` or `#000080` |
| `border: 2px solid #00d4ff` | Beveled multi-color borders |
| Dark backgrounds | System gray (#c0c0c0) |
| Neon cyan (#00d4ff) | Win31 teal (#008080) |
| `blur()` effects | Solid opaque panels |
| `border-radius: 8px` | Sharp 90° corners |

### The Quick Test

If your component has:
- Any blur effects → NOT Win31
- Any gradient backgrounds → NOT Win31
- Any neon colors → NOT Win31
- Any rounded corners → NOT Win31
- Any glowing effects → NOT Win31
- Dark backgrounds → NOT Win31

It should have:
- System gray (#c0c0c0) base
- Beveled borders (white top-left, black bottom-right)
- Sharp corners everywhere
- Pixel fonts (VT323, Press Start 2P)
- Navy blue title bars
- Hard-edge shadows only

## Typography

```css
:root {
  --font-pixel: 'VT323', 'Courier New', monospace;
  --font-pixel-heading: 'Press Start 2P', 'VT323', monospace;
  --font-code: 'IBM Plex Mono', 'Courier New', monospace;
  --font-system: 'MS Sans Serif', 'Arial', sans-serif;
}
```

## Example: Converting Vaporwave to Win31

### Before (Vaporwave):
```jsx
<div style={{
  background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
  border: '3px solid #00d4ff',
  boxShadow: '0 0 20px rgba(0,255,255,0.3)',
}}>
  <div style={{
    color: '#00d4ff',
    textShadow: '0 0 10px cyan',
  }}>
    ⚡ Get This Skill
  </div>
</div>
```

### After (Win31):
```jsx
<div className="win31-window">
  <div className="win31-titlebar">
    <span className="win31-title-text">GET SKILL</span>
  </div>
  <div className="win31-content">
    <button className="win31-btn-3d">
      Download Skill Folder
    </button>
  </div>
</div>
```

## File Naming Conventions

For authenticity:
- All caps: `README.TXT`, `INSTALL.EXE`, `SKILL.DLL`
- 8.3 format: `PROGRAM.EXE`, `CONFIG.SYS`

## Hotdog Stand Mode

The infamous high-contrast scheme. Use only for easter eggs:

```css
.hotdog-stand {
  --win31-gray: #ff0000;
  --win31-navy: #ffff00;
}
```

## Resources

- **Fonts**: VT323, Press Start 2P (Google Fonts)
- **Inspiration**: Program Manager, File Manager, Notepad
- **Testing**: Ensure components work without JavaScript
