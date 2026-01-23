---
name: windows-3-1-web-designer
description: Expert in authentic Windows 3.1 aesthetic for modern web applications. Creates pixel-perfect retro UI with beveled borders, system gray palettes, and program manager styling. Activate on 'windows 3.1', 'retro ui', 'beveled borders', 'win31', 'program manager', '90s aesthetic'. NOT for vaporwave (neon gradients), glassmorphism, macOS/iOS styling, flat design, or material design.
allowed-tools: Read,Write,Edit,mcp__magic__21st_magic_component_builder,mcp__magic__21st_magic_component_refiner
category: Design & Creative
tags:
  - retro
  - windows
  - 90s
  - beveled
  - nostalgia
pairs-with:
  - skill: web-design-expert
    reason: Apply retro aesthetic to modern web
  - skill: native-app-designer
    reason: Retro desktop app styling
---

# Windows 3.1 Web Designer

Expert in authentic Windows 3.1 aesthetic for modern web applications. Creates pixel-perfect retro UI components using beveled borders, system gray palettes, and classic program manager styling.

## When to Use

**Use for:**
- Retro-themed web applications with Windows 3.1 authenticity
- Converting vaporwave or modern UI to classic Win31 styling
- Nostalgic landing pages, documentation sites, portfolios
- Game interfaces with 90s desktop aesthetic
- Pixel-art adjacent web experiences

**Do NOT use for:**
- Vaporwave aesthetics → use **vaporwave-glassomorphic-ui-designer**
- Modern glassmorphism → use **native-app-designer**
- macOS/iOS styling → use **native-app-designer**
- Flat/Material design → use **web-design-expert**

## Core Design System

### Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| System Gray | #c0c0c0 | THE primary background |
| Dark Gray | #808080 | Shadows, pressed states |
| Navy | #000080 | Title bar background |
| Teal | #008080 | Links, highlights |
| White | #ffffff | Beveled highlights, inputs |
| Black | #000000 | Beveled shadows, borders |

### The Sacred Rule: Beveled Borders

**OUTSET (Raised)** - Buttons, toolbars:
- Top/Left border: WHITE
- Bottom/Right border: BLACK
- Inner shadow: light-gray TL, dark-gray BR

**INSET (Sunken)** - Text fields, content areas:
- Top/Left border: DARK GRAY
- Bottom/Right border: WHITE
- Inner shadow: black TL, light-gray BR

### Typography

- **Primary**: VT323, Courier New (pixel-style)
- **Headings**: Press Start 2P (chunky pixel)
- **Code**: IBM Plex Mono, Courier Prime

## Quick Reference

| Element | Background | Border Pattern |
|---------|------------|----------------|
| Window | #c0c0c0 | 3px solid black, inset bevel |
| Titlebar | #000080 | none |
| Button (up) | #c0c0c0 | inset white TL, black BR |
| Button (down) | #c0c0c0 | inset black TL, white BR |
| Input | #ffffff | inset 2px dark-gray |
| Panel (raised) | #c0c0c0 | outset 2px |
| Panel (inset) | #ffffff | inset 2px + shadow |

## Anti-Patterns

### Anti-Pattern: Gradients
**What it looks like**: `linear-gradient(#00d4ff, #ff00ff)`
**Why wrong**: Win31 has NO gradients—only solid colors
**Instead**: Solid `var(--win31-teal)` or `var(--win31-navy)`

### Anti-Pattern: Neon Colors
**What it looks like**: #00d4ff, #ff00ff (bright neons)
**Why wrong**: This is vaporwave, not Win31
**Instead**: Muted palette: teal (#008080), navy (#000080)

### Anti-Pattern: Rounded Corners
**What it looks like**: `border-radius: 8px`
**Why wrong**: Win31 has sharp 90° corners everywhere
**Instead**: No border-radius (or 0)

### Anti-Pattern: Blur Effects
**What it looks like**: `backdrop-filter: blur(10px)`, soft shadows
**Why wrong**: Win31 has no blur—only hard-edge bevels
**Instead**: Sharp bevel shadows with no blur

### Anti-Pattern: Dark Backgrounds
**What it looks like**: #1a1a2e, #16213e dark backgrounds
**Why wrong**: Win31 is light—system gray everywhere
**Instead**: #c0c0c0 system gray base

## The Quick Test

If your component has:
- ❌ Any blur effects → NOT Win31
- ❌ Any gradient backgrounds → NOT Win31
- ❌ Any neon colors → NOT Win31
- ❌ Any rounded corners → NOT Win31
- ❌ Dark backgrounds → NOT Win31

It should have:
- ✅ System gray (#c0c0c0) base
- ✅ Beveled borders (white TL, black BR)
- ✅ Sharp corners everywhere
- ✅ Pixel fonts (VT323, Press Start 2P)
- ✅ Navy blue title bars
- ✅ Hard-edge box shadows only

## File Naming Conventions

For authentic Win31 feel:
- All caps: `README.TXT`, `INSTALL.EXE`
- 8.3 format: `PROGRAM.EXE`, `CONFIG.SYS`

## MCP Integrations

| MCP | Purpose |
|-----|---------|
| **21st Century Dev** | Scaffold base components, then override with Win31 CSS |
| **Component Refiner** | Convert modern components to retro aesthetic |

## Reference Files

- `references/design-system.md` - Complete color palette, typography, beveled border patterns
- `references/component-patterns.md` - Full CSS for windows, buttons, forms, panels
- `references/anti-patterns.md` - Vaporwave comparison, decision tree, conversion examples

---

**Core insight**: Win31 aesthetic is about DEPTH through bevels, not GLOW through neons. System gray is your canvas—beveled borders create the illusion of 3D.

**Use with**: vaporwave-glassomorphic-ui-designer (different aesthetic) | web-design-expert (modern designs)
