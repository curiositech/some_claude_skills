---
sidebar_label: Web Cloud Designer
sidebar_position: 1
---

# ☁️ Web Cloud Designer

Creates realistic cloud effects for web using SVG filters (feTurbulence, feDisplacementMap), CSS animations, and layering techniques. Use for atmospheric backgrounds, weather effects, skyboxes, parallax scenes, and decorative cloud elements. Activate on "cloud effect", "SVG clouds", "realistic clouds", "atmospheric background", "sky animation", "feTurbulence", "weather effects", "parallax clouds". NOT for 3D rendering (use WebGL/Three.js skills), photo manipulation, weather data APIs, or simple CSS gradients without volumetric effects.

---

## Allowed Tools

```
Read, Write, Edit, WebFetch, Bash
```

## Tags

`svg` `css` `animation` `atmospheric` `visual-effects` `web`

## Category

**Design & Creative**

## 🤝 Pairs Great With

- **[Web Design Expert](/docs/skills/web_design_expert)**: Integrate clouds into overall web design
- **[Physics Rendering Expert](/docs/skills/physics_rendering_expert)**: Realistic lighting and shadow calculations
- **[Color Theory Palette Harmony Expert](/docs/skills/color_theory_palette_harmony_expert)**: Sky gradients and atmospheric color
- **[Web Wave Designer](/docs/skills/web_wave_designer)**: Complete sky + water atmospheric scenes

---

# Web Cloud Designer: SVG Filter Clouds

Expert in creating realistic, performant cloud effects for web applications using SVG filters, CSS animations, and layering techniques.

## When to Use This Skill

**Use for:**
- Realistic cloud backgrounds and skyboxes
- Weather-themed UI elements and transitions
- Parallax cloud scenes with depth
- Animated atmospheric effects
- Stylized/cartoon cloud designs
- Hero section backgrounds with sky themes
- Loading states with cloud animations

**Do NOT use for:**
- 3D volumetric cloud rendering → use **WebGL/Three.js**
- Photo manipulation of real clouds → use image editing
- Weather data integration → use weather API skills
- Simple gradient skies without cloud shapes

## Core Technique: SVG Filter Pipeline

```
Source → feTurbulence → feDisplacementMap → feGaussianBlur → feDiffuseLighting → Composite
```

### Key Parameters

| Parameter | Range | Effect |
|-----------|-------|--------|
| `baseFrequency` | 0.005-0.02 | Scale of cloud shapes. Lower = larger cumulus |
| `numOctaves` | 3-5 | Detail layers. Above 5 = CPU waste |
| `seed` | 0-999999 | Shape variation (free performance!) |
| `type` | fractalNoise | ALWAYS use fractalNoise for clouds |

### Cloud Type Recipes

**Cumulus (Puffy)**
```xml
&lt;feTurbulence type="fractalNoise" baseFrequency="0.008" numOctaves="4"/&gt;
&lt;feDisplacementMap scale="60"/&gt;
```

**Cirrus (Wispy)**
```xml
&lt;feTurbulence type="fractalNoise" baseFrequency="0.02 0.005" numOctaves="3"/&gt;
&lt;feDisplacementMap scale="25"/&gt;
```

**Storm Clouds**
```xml
&lt;feTurbulence type="fractalNoise" baseFrequency="0.006" numOctaves="5"/&gt;
&lt;feDisplacementMap scale="150"/&gt;
```

## Layering Strategy

| Layer | Opacity | Speed | Scale | blur |
|-------|---------|-------|-------|------|
| Back (distant) | 0.2-0.4 | 90-120s | 1.3-1.5x | 5-8 |
| Mid | 0.5-0.7 | 50-80s | 1.0x | 3-5 |
| Front (close) | 0.8-1.0 | 30-50s | 0.7-0.9x | 1-3 |

## Performance Critical Rules

1. **numOctaves ≤ 5** - Above 5 = diminishing returns, exponential CPU cost
2. **Blur BEFORE displacement** - 40% more efficient
3. **Avoid animating filter properties** - Use CSS transforms instead
4. **Use `seed` for variation** - Free performance vs changing baseFrequency
5. **`will-change: transform`** - Only on animated elements

## Quick Start Template

```css
.cloud {
  filter: url(#cloudFilter);
  animation: drift 60s linear infinite;
}

@keyframes drift {
  from { transform: translateX(-100%); }
  to { transform: translateX(100vw); }
}
```

```xml
&lt;filter id="cloudFilter" x="-50%" y="-50%" width="200%" height="200%"&gt;
  &lt;feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="4" seed="5"/&gt;
  &lt;feGaussianBlur stdDeviation="4"/&gt;
  &lt;feDisplacementMap in="SourceGraphic" scale="50"/&gt;
&lt;/filter&gt;
```

## Reference Sources

- CSS-Tricks: "Drawing Realistic Clouds with SVG and CSS"
- LogRocket: "Animated Cloud Generator with SVG CSS"
- MDN: SVG Filter Primitives documentation
