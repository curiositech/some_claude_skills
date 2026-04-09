# Ideogram Usage Patterns (Archived)

**Status**: ARCHIVED - Replaced by local Qwen Image generation (2025-12-28)
**Reason**: ZeroGPU quota limits on cloud services

This document preserves Ideogram usage patterns for potential future use.

---

## Overview

Ideogram was used as an MCP tool (`mcp__ideogram__generate_image`) for generating pixel art hero images for skills, agents, MCPs, and pages on the Claude Skills website.

---

## MCP Tool Reference

### Tool Name
```
mcp__ideogram__generate_image
```

### Key Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `prompt` | string | The image description (MUST be in English) |
| `aspect_ratio` | enum | Image dimensions: `16:9`, `1:1`, `9:16`, etc. |
| `negativePrompt` | string | What to avoid in the image |
| `style_type` | enum | `REALISTIC`, `DESIGN`, `ANIME`, etc. |
| `magic_prompt` | enum | `AUTO`, `ON`, `OFF` - prompt enhancement |
| `num_outputs` | int | 1-8 images per generation |

---

## Style Guide: "Retro-Professional Pixel Art"

### Core Aesthetic
The style blends **1990s computing nostalgia** with **professional workspace imagery** in cohesive pixel art.

### Required Elements

1. **Pixel Art Rendering**
   - 16-bit era (SNES/early PC game aesthetic)
   - Visible pixels, deliberate blockiness
   - Clean lines, no anti-aliasing
   - Classic dither patterns for shading

2. **Retro UI Chrome**
   - Windows 3.1/95 style window frames
   - Title bars with traffic light buttons OR square minimize/maximize
   - Beveled 3D borders (light top-left, shadow bottom-right)
   - Dialog boxes, menu bars, status bars

3. **Color Palette Families**

| Family | Primary | Secondary | Accent | Use For |
|--------|---------|-----------|--------|---------|
| Mint/Teal Professional | `#5B9A8B` | `#8EC5B5` | `#F5E6D3` | Business, strategy, analysis |
| Synthwave Sunset | `#FF6B9D` | `#C44569` | `#1A1A2E` | Creative, VR, futuristic |
| Warm Terracotta | `#C67B5C` | `#E8A87C` | `#41444B` | Interior, lifestyle, coaching |
| Lavender Workspace | `#9B8AA5` | `#C4B6CF` | `#F0EBF4` | Psychology, wellness, personal |
| Terminal Green | `#00FF00` | `#003300` | `#000000` | Technical, code, system |

---

## Prompt Templates

### Base Structure
```
Pixel art [SCENE TYPE] showing [SUBJECT MATTER],
[COLOR PALETTE] color scheme,
retro Windows 95 interface elements,
16-bit video game aesthetic,
[COMPOSITION STYLE],
clean pixel art style, no anti-aliasing
--ar 16:9
```

### Composition Styles

**A. Desktop Workstation Scene** (Professional/productivity skills)
- Monitor centered, showing relevant interface
- Keyboard in foreground
- Desk accessories: plants, coffee mug, mouse
- Background: solid color or subtle pattern

**B. Isometric Workspace** (Strategy, research, organization skills)
- 45-degree angled view
- Objects arranged in 3D space
- Clean background with subtle grid
- Human figure optional (small scale)

**C. Synthwave Landscape** (Futuristic, VR, creative tech skills)
- Horizon line with gradient sunset
- Perspective grid floor (magenta/cyan lines)
- Central floating UI element
- Geometric shapes: spheres, pyramids

**D. Terminal/Flowchart** (Technical, programming, system skills)
- Dark background (pure black ideal)
- Bright monochrome elements (green, cyan, amber)
- Connected nodes, flowchart boxes
- No physical workspace, pure interface

**E. Interview/Interaction Scene** (People-focused, coaching, HR skills)
- Two figures in conversation
- Office/professional setting
- Screen showing relevant data
- Warm, approachable lighting

---

## Example Prompts

### Database Architect Skill
```
Pixel art desktop workstation scene showing database schema diagram on retro monitor,
mint and teal professional color scheme,
retro Windows 95 interface with title bar and scrollbars,
16-bit video game aesthetic,
keyboard and desk plant in foreground,
clean pixel art style, no anti-aliasing
--ar 16:9
```

### Meditation Guide Skill
```
Pixel art synthwave landscape with floating zen interface window,
lavender and sunset pink color scheme,
retro Mac OS window chrome with lotus flower icon,
16-bit video game aesthetic,
perspective grid floor with gentle mountains,
clean pixel art style, no anti-aliasing
--ar 16:9
```

### OG Background (Social Preview)
```
Pixel art retro computer workspace with filing cabinets,
floppy disks, synthwave sunset gradient sky, Windows 3.1 aesthetic,
16-bit graphics, vaporwave colors, no text
```

---

## Skills That Used Ideogram

These skills had `mcp__ideogram__generate_image` in their `allowed-tools`:

| Skill | Purpose |
|-------|---------|
| `skill-documentarian` | OG backgrounds, hero images for new skills |
| `interior-design-expert` | Room visualization concepts |
| `maximalist-wall-decorator` | Wall art mockups |
| `fancy-yard-landscaper` | Landscape visualization |

---

## File Locations

| Purpose | Path |
|---------|------|
| Style guide | `website/docs/guides/hero-image-style-guide.md` |
| OG generator script | `website/scripts/generate-og-image.sh` |
| OG background | `website/static/img/og-background_*.png` |
| Skill hero images | `website/static/img/skills/*-hero.png` |

---

## OG Image Generation Workflow (Legacy)

1. Generate background with Ideogram (pixel art style)
2. Save as `og-background_TIMESTAMP.png`
3. Run `generate-og-image.sh` to composite text with ImageMagick
4. Output: `og-image.png` (1200x630, social preview)

Dependencies:
- ImageMagick: `brew install imagemagick`
- Press Start 2P font: from Google Fonts to `~/Library/Fonts/`

---

## Replacement: Local Qwen Image

As of 2025-12-28, hero images are generated locally using:

```bash
cd /tmp/qwen-image-macos
source .venv/bin/activate
python qwen.py generate "PROMPT" --ultra-fast --size 1024x576
```

Output: `~/qwen-images/image-YYYYMMDD-HHMMSS.png`

This avoids ZeroGPU quota limits and provides faster iteration.

---

## Future Restoration

To re-enable Ideogram:

1. Add `mcp__ideogram__generate_image` back to skill `allowed-tools`
2. Uncomment Ideogram references in documentation
3. Update `hero-image-style-guide.md` to reference Ideogram
4. Test quota limits before batch generation

---

**Preserved**: 2025-12-28
**Context**: ZeroGPU quota exceeded during skill og:image batch generation
