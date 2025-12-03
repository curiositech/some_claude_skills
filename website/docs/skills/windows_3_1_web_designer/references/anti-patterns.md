---
title: "Anti-Patterns: Windows 3.1 vs Vaporwave"
sidebar_label: "Anti-Patterns: Windows 3.1 ..."
sidebar_position: 1
---
# Anti-Patterns: Windows 3.1 vs Vaporwave

How to distinguish authentic Win31 from modern retro aesthetics.

## What Makes Something Look VAPORWAVE (Avoid These)

| Vaporwave Element | Win31 Alternative |
|-------------------|-------------------|
| `linear-gradient(135deg, #1a1a2e, #16213e)` | `background: var(--win31-gray)` |
| `text-shadow: 0 0 10px rgba(0,255,255,0.5)` | No text shadow, or `1px 1px 0 var(--win31-dark-gray)` |
| `background: linear-gradient(#00d4ff, #ff00ff)` | Solid `var(--win31-teal)` or `var(--win31-navy)` |
| `border: 2px solid #00d4ff` | Beveled border pattern |
| Dark backgrounds (#1a1a2e) | System gray (#c0c0c0) |
| Neon cyan (#00d4ff) | Win31 teal (#008080) |
| Glowing/pulsing animations | Static or simple transitions |
| Glassmorphism blur | Solid opaque panels |
| Rounded corners (border-radius) | Sharp 90° corners |
| Drop shadows (box-shadow blur) | Hard-edge bevel shadows |

## The Quick Test

If your component has:
- ❌ Any blur effects → NOT Win31
- ❌ Any gradient backgrounds → NOT Win31
- ❌ Any neon colors (#00d4ff, #ff00ff bright) → NOT Win31
- ❌ Any rounded corners → NOT Win31
- ❌ Any glowing text/borders → NOT Win31
- ❌ Dark/black backgrounds → NOT Win31 (except inset content areas)

It should have:
- ✅ System gray (#c0c0c0) base
- ✅ Beveled borders (white top-left, black bottom-right)
- ✅ Sharp corners everywhere
- ✅ Pixel fonts (VT323, Press Start 2P)
- ✅ Navy blue title bars
- ✅ Hard-edge box shadows only

## Decision Tree: Designing a Win31 Component

```
START: What are you building?
│
├─► Window/Dialog
│   ├─► Has title bar? → Navy background, white text, system buttons
│   ├─► Has menu bar? → Gray, beveled, 2px borders
│   ├─► Content area? → Gray background or white inset
│   └─► Status bar? → Gray panels with inset borders
│
├─► Button
│   ├─► Primary action? → .win31-btn-3d--default (extra black border)
│   ├─► Secondary? → .win31-btn-3d (standard)
│   ├─► Titlebar button? → .win31-btn-3d--small
│   └─► Toggle/checked? → Use pressed state permanently
│
├─► Form Control
│   ├─► Text input? → White background, inset border
│   ├─► Dropdown? → White background, inset, with button
│   ├─► Checkbox? → 13x13px, inset, checkmark on select
│   └─► Radio? → Same as checkbox but circular appearance
│
├─► Panel/Section
│   ├─► Contains controls? → Raised panel (outset)
│   ├─► Contains content? → Inset panel
│   └─► Labeled section? → Groupbox with label
│
└─► Decorative Element
    ├─► Badge/tag? → Gray background, outset, small text
    ├─► Sticker? → Yellow background, black border, rotated
    └─► Icon? → 16x16 or 32x32, pixel art style
```

## Example: Converting Vaporwave to Win31

### Before (Vaporwave):

```jsx
<div style={{
  background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
  border: '3px solid #00d4ff',
  boxShadow: '0 0 20px rgba(0,255,255,0.3)',
}}>
  <div style={{
    color: '#00d4ff',
    textShadow: '0 0 10px rgba(0,255,255,0.5)',
  }}>
    ⚡ Get This Skill
  </div>
  <button style={{
    background: 'linear-gradient(135deg, #00d4ff 0%, #ff00ff 100%)',
    border: '2px outset #00d4ff',
  }}>
    Download
  </button>
</div>
```

### After (Win31):

```jsx
<div className="win31-window">
  <div className="win31-titlebar">
    <span className="win31-title-text">GET SKILL</span>
  </div>
  <div className="win31-content">
    <button className="win31-btn-3d win31-btn-3d--default">
      📦 Download Skill Folder
    </button>
  </div>
</div>
```

## File Naming Conventions

For authentic Win31 feel:
- All caps filenames: `README.TXT`, `INSTALL.EXE`, `SKILL.DLL`
- 8.3 format: `PROGRAM.EXE`, `CONFIG.SYS`
- Use period sparingly: prefer `SKILLSDAT` over `SKILLS.DAT`
