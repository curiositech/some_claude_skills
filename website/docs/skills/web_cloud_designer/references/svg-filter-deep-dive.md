---
title: SVG Filter Deep Dive for Cloud Effects
sidebar_label: SVG Filter Deep Dive for Cl...
sidebar_position: 3
---
# SVG Filter Deep Dive for Cloud Effects

## Filter Coordinate Systems

### filterUnits

```xml
<!-- userSpaceOnUse: coordinates in user units (pixels) -->
<filter filterUnits="userSpaceOnUse" x="0" y="0" width="800" height="600">

<!-- objectBoundingBox (default): coordinates as percentages of element -->
<filter filterUnits="objectBoundingBox" x="-50%" y="-50%" width="200%" height="200%">
```

For clouds, always use `objectBoundingBox` with expanded region to prevent clipping.

### primitiveUnits

```xml
<!-- objectBoundingBox: filter primitive values scale with element -->
<filter primitiveUnits="objectBoundingBox">
  <!-- stdDeviation of 0.05 = 5% of element size -->
  <feGaussianBlur stdDeviation="0.05"/>
</filter>

<!-- userSpaceOnUse: filter primitive values in pixels -->
<filter primitiveUnits="userSpaceOnUse">
  <!-- stdDeviation in actual pixels -->
  <feGaussianBlur stdDeviation="10"/>
</filter>
```

## feTurbulence In-Depth

### Perlin vs Turbulence

```xml
<!-- fractalNoise: smooth, cloudy, organic -->
<feTurbulence type="fractalNoise"/>

<!-- turbulence: sharp, watery, fiery -->
<feTurbulence type="turbulence"/>
```

**Always use `fractalNoise` for clouds.**

### baseFrequency Math

The frequency controls the "zoom level" of the noise:

```
visual_size = 1 / baseFrequency
```

| baseFrequency | Visual Size | Best For |
|---------------|-------------|----------|
| 0.003 | ~333px features | Giant cumulus |
| 0.008 | ~125px features | Standard cumulus |
| 0.015 | ~67px features | Smaller clouds |
| 0.03 | ~33px features | Wispy details |

### Anisotropic Frequency

Two values create directional stretch:

```xml
<!-- Horizontal stretch (cirrus-like) -->
<feTurbulence baseFrequency="0.02 0.005"/>

<!-- Vertical stretch (towering clouds) -->
<feTurbulence baseFrequency="0.005 0.02"/>
```

### numOctaves Performance

Each octave doubles the computation:

| octaves | Relative Cost | Visual Impact |
|---------|---------------|---------------|
| 1 | 1x | Blurry blobs |
| 2 | 2x | Basic shapes |
| 3 | 4x | Good detail |
| 4 | 8x | Fine detail |
| 5 | 16x | Maximum useful |
| 6+ | 32x+ | Diminishing returns |

### Seed Strategy

```javascript
// Generate variety without performance cost
const seeds = [1, 42, 137, 256, 512, 789];

// Use seed based on position for consistent regeneration
const getSeed = (x, y) => Math.abs((x * 31 + y * 17) % 1000);
```

## feDisplacementMap Mechanics

### Channel Selection

```xml
<feDisplacementMap
  xChannelSelector="R"  <!-- R, G, B, or A -->
  yChannelSelector="G"
/>
```

| Channel Combo | Effect |
|---------------|--------|
| R, G | Standard displacement |
| R, R | Horizontal-only stretch |
| G, G | Vertical-only stretch |
| A, A | Uniform scaling |

### Scale Values

The `scale` attribute is in pixels:

```xml
<!-- Displacement range: -scale/2 to +scale/2 -->
<feDisplacementMap scale="100"/>
<!-- Pixels displaced from -50 to +50 -->
```

### Displacement Formula

```
P'(x,y) = P(x + scale * (XC(x,y) - 0.5), y + scale * (YC(x,y) - 0.5))
```

Where XC and YC are the selected channel values normalized to 0-1.

## feDiffuseLighting for Volume

### Light Types

```xml
<!-- Distant light: sun-like, parallel rays -->
<feDistantLight azimuth="45" elevation="55"/>

<!-- Point light: nearby source, radial -->
<fePointLight x="100" y="100" z="200"/>

<!-- Spot light: focused beam -->
<feSpotLight x="100" y="100" z="200"
             pointsAtX="200" pointsAtY="200" pointsAtZ="0"
             limitingConeAngle="30"/>
```

### Azimuth and Elevation

```
azimuth: 0 = right, 90 = top, 180 = left, 270 = bottom
elevation: 0 = horizon, 90 = directly above
```

Common sky lighting:
- Morning: azimuth=90, elevation=15-30
- Noon: azimuth=any, elevation=70-90
- Evening: azimuth=270, elevation=15-30

### surfaceScale

Controls how much the input affects lighting:

```xml
<feDiffuseLighting surfaceScale="5">
  <!-- Higher = more dramatic shadows -->
</feDiffuseLighting>
```

| surfaceScale | Effect |
|--------------|--------|
| 1-2 | Subtle shading |
| 3-5 | Normal clouds |
| 6-10 | Dramatic storm clouds |

## Compositing Filters

### feComposite Operations

```xml
<!-- Multiply: darken overlaps -->
<feComposite operator="arithmetic" k1="0" k2="1" k3="1" k4="0"/>

<!-- Screen: lighten overlaps -->
<feComposite operator="over"/>

<!-- Intersection: only where both exist -->
<feComposite operator="in"/>
```

### Building Complex Clouds

```xml
<filter id="complexCloud">
  <!-- Base cloud shape -->
  <feTurbulence type="fractalNoise" baseFrequency="0.008"
                numOctaves="4" seed="1" result="mainNoise"/>

  <!-- Detail overlay -->
  <feTurbulence type="fractalNoise" baseFrequency="0.02"
                numOctaves="2" seed="2" result="detailNoise"/>

  <!-- Combine noises -->
  <feComposite in="mainNoise" in2="detailNoise"
               operator="arithmetic" k1="0.7" k2="0.3" k3="0" k4="0"
               result="combinedNoise"/>

  <!-- Apply displacement -->
  <feDisplacementMap in="SourceGraphic" in2="combinedNoise" scale="80"/>
</filter>
```

## Performance Profiling

### Chrome DevTools

1. Open Performance tab
2. Record while scrolling/animating
3. Look for "Recalculate Style" and "Paint" events
4. Filter events by "filter" keyword

### Optimization Checklist

```
[ ] numOctaves <= 5
[ ] Filter region not excessively large
[ ] No filter animations (use transforms)
[ ] Filters defined once, referenced by ID
[ ] will-change only on animated elements
[ ] Reduced motion media query respected
[ ] Mobile uses simplified filters
```

### Memory Considerations

Each filter creates intermediate buffers:

```
Buffer size = width * height * 4 bytes * (number of filter steps)
```

A 1920x1080 filter with 5 steps uses ~40MB.

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| feTurbulence | Yes | Yes | Yes | Yes |
| feDisplacementMap | Yes | Yes | Yes | Yes |
| feDiffuseLighting | Yes | Yes | Yes | Yes |
| Filter animations | Yes | Yes | Partial | Yes |

Safari caveats:
- `<animate>` on filter attributes may stutter
- Prefer CSS animations with transforms
- Test thoroughly on iOS

## Advanced: Animated Morphing

For smooth cloud morphing without animating filter attributes:

```javascript
// Cross-fade between two filtered elements
const cloud1 = document.querySelector('.cloud-1');
const cloud2 = document.querySelector('.cloud-2');

// Alternate visibility with different seeds
gsap.timeline({ repeat: -1 })
  .to(cloud1, { opacity: 1, duration: 5 })
  .to(cloud1, { opacity: 0, duration: 5 }, '+=5')
  .to(cloud2, { opacity: 1, duration: 5 }, '-=5')
  .to(cloud2, { opacity: 0, duration: 5 }, '+=5');
```

This avoids recalculating filters while achieving morphing effect.
