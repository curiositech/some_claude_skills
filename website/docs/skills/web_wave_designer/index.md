---
sidebar_label: Web Wave Designer
sidebar_position: 1
---

# 🌊 Web Wave Designer

Creates realistic ocean and water wave effects for web using SVG filters (feTurbulence, feDisplacementMap), CSS animations, and layering techniques. Use for ocean backgrounds, underwater distortion, beach scenes, ripple effects, liquid glass, and water-themed UI. Activate on "ocean wave", "water effect", "SVG water", "ripple animation", "underwater distortion", "liquid glass", "wave animation", "feTurbulence water", "beach waves", "sea foam". NOT for 3D ocean simulation (use WebGL/Three.js), video water effects, physics-based fluid simulation, or simple gradient backgrounds without wave motion.

---

## Allowed Tools

```
Read, Write, Edit, WebFetch, Bash
```

## Tags

`svg` `css` `animation` `water` `ocean` `visual-effects` `web`

## Category

**Design & Creative**

## 🤝 Pairs Great With

- **[Web Cloud Designer](/docs/skills/web_cloud_designer)**: Complete atmospheric scenes with sky and water
- **[Physics Rendering Expert](/docs/skills/physics_rendering_expert)**: Realistic light refraction and caustics
- **[Color Theory Palette Harmony Expert](/docs/skills/color_theory_palette_harmony_expert)**: Ocean palettes and depth gradients
- **[Web Design Expert](/docs/skills/web_design_expert)**: Integrate water effects into overall web design

---

# Web Wave Designer: SVG Water Effects

Expert in creating realistic, performant ocean and water wave effects for web applications using SVG filters, CSS animations, and layering techniques.

## When to Use This Skill

**Use for:**
- Ocean wave backgrounds and seascapes
- Underwater distortion/refraction effects
- Beach shore waves with foam
- Pond/pool ripple animations
- Liquid glass UI effects
- Water-themed loading states
- Parallax ocean layers with depth

**Do NOT use for:**
- 3D volumetric ocean rendering → use **WebGL/Three.js/Ocean.js**
- Real-time fluid simulation → use **canvas physics engines**
- Video effects → use video editing software
- Simple blue gradients without motion

## Critical Distinction: turbulence vs fractalNoise

**CRITICAL**: For water effects, use `type="turbulence"` (NOT fractalNoise like clouds):

| Type | Visual | Best For |
|------|--------|----------|
| `turbulence` | Continuous flow patterns | **Water, waves, liquid** |
| `fractalNoise` | Random cloudlike patches | Clouds, smoke, terrain |

## Wave Type Recipes

### Ocean Surface Waves
```xml
&lt;feTurbulence type="turbulence" baseFrequency="0.005 0.05" numOctaves="4"/&gt;
&lt;feDisplacementMap scale="25"/&gt;
```

### Pond Ripples (Circular)
```xml
&lt;feTurbulence type="turbulence" baseFrequency="0.02 0.02" numOctaves="2"/&gt;
&lt;feDisplacementMap scale="12"/&gt;
```

### Underwater Distortion
```xml
&lt;feTurbulence type="turbulence" baseFrequency="0.015 0.08" numOctaves="3"/&gt;
&lt;feDisplacementMap scale="20"/&gt;
&lt;feColorMatrix type="matrix" values="0.9 0 0 0 0  0 0.95 0 0 0.02  0 0 1.1 0 0.05  0 0 0 1 0"/&gt;
```

### Liquid Glass Effect
```xml
&lt;feTurbulence type="turbulence" baseFrequency="0.01 0.05" numOctaves="2"/&gt;
&lt;feDisplacementMap scale="8"/&gt;
&lt;feGaussianBlur stdDeviation="0.5"/&gt;
```

## baseFrequency Explained (TWO Values)

| X-Frequency | Y-Frequency | Result |
|-------------|-------------|--------|
| 0.01 | 0.1 | Long horizontal waves with vertical oscillation |
| 0.005 | 0.05 | Deep ocean swells |
| 0.02 | 0.15 | Choppy surface waves |
| 0.03 | 0.03 | Circular ripples (pond) |

## Layer Parameter Guide

| Layer | Opacity | Speed | Scale | baseFrequency |
|-------|---------|-------|-------|---------------|
| Back (deep) | 0.2-0.4 | 80-100s | 15 | 0.004 0.04 |
| Mid | 0.4-0.6 | 50-70s | 20 | 0.006 0.06 |
| Front (surface) | 0.6-0.8 | 30-45s | 25 | 0.01 0.1 |
| Foam | 0.7-0.9 | 25-35s | 10 | 0.02 0.02 |

## Color Palettes

### Deep Ocean
- Primary: `#0369a1`
- Deep: `#0c4a6e`
- Highlight: `#38bdf8`

### Tropical/Caribbean
- Primary: `#06b6d4`
- Shallow: `#67e8f9`
- Foam: `#ecfeff`

### Stormy Sea
- Primary: `#475569`
- Depth: `#1e293b`
- Whitecap: `#cbd5e1`

## Performance Critical Rules

1. **Use `type="turbulence"`** - Correct type for water (not fractalNoise)
2. **numOctaves ≤ 4** - Minimal visual gain above 4, exponential CPU cost
3. **Scale 10-30** - Above 40 becomes unrealistic and slower
4. **Avoid animating baseFrequency** - Use CSS transforms or seed animation
5. **GPU hints** - Add `will-change: transform` on animated layers

## Quick Start Template

```html
&lt;svg style="display:none"&gt;
  &lt;defs&gt;
    &lt;filter id="oceanWave"&gt;
      &lt;feTurbulence type="turbulence" baseFrequency="0.008 0.08" numOctaves="4" seed="1"/&gt;
      &lt;feDisplacementMap in="SourceGraphic" scale="25"/&gt;
    &lt;/filter&gt;
  &lt;/defs&gt;
&lt;/svg&gt;

&lt;div class="ocean"&gt;
  &lt;div class="wave" style="filter: url(#oceanWave)"&gt;&lt;/div&gt;
&lt;/div&gt;
```

```css
.wave {
  animation: drift 60s linear infinite;
}

@keyframes drift {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
```

## Reference Sources

- Red Stapler: "Realistic Water Effect SVG Turbulence"
- Mitkov Systems: "Liquid Glass Water Animation" (2025)
- MDN: SVG Filter Primitives Documentation
- CSS-Tricks: "Underwater Blur Effect"
