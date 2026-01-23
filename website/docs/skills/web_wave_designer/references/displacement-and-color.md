---
title: feDisplacementMap and Color Techniques for Water
sidebar_label: feDisplacementMap and Color...
sidebar_position: 2
---
# feDisplacementMap and Color Techniques for Water

## feDisplacementMap: The Refraction Engine

The displacement map creates the "light bending through water" effect by shifting pixels based on a noise pattern.

### Core Formula

For each pixel at position (x, y):
```
newX = x + scale * (channelValue - 0.5)
newY = y + scale * (channelValue - 0.5)
```

Where `channelValue` is the value (0-1) of the selected color channel in the noise.

### Parameters Deep Dive

```xml
<feDisplacementMap
  in="SourceGraphic"     <!-- What gets distorted -->
  in2="waves"            <!-- The distortion pattern -->
  scale="25"             <!-- Distortion intensity -->
  xChannelSelector="R"   <!-- Which channel moves X -->
  yChannelSelector="G"   <!-- Which channel moves Y -->
/>
```

### Scale Values for Water Types

| Scale | Effect | Water Type |
|-------|--------|------------|
| 5-10 | Subtle shimmer | Glass, light refraction |
| 10-15 | Gentle ripples | Calm pool, aquarium |
| 15-25 | Natural waves | Ocean surface, river |
| 25-35 | Strong distortion | Choppy water, rain |
| 35-50 | Dramatic | Storm waves, splashing |
| 50+ | Unrealistic | Psychedelic (avoid for realism) |

### Channel Selector Combinations

The xChannelSelector and yChannelSelector determine which color channels from the noise drive displacement:

| X | Y | Result |
|---|---|--------|
| R | G | **Standard** - Different patterns for X/Y movement |
| R | B | Offset patterns - more chaotic |
| R | R | Same pattern - diagonal movement |
| G | G | Same pattern - different angle |
| A | A | Alpha-driven - if using alpha variations |

**Recommendation**: Use `R` and `G` (or `R` and `B`) for water - they're uncorrelated in turbulence output, giving natural two-axis movement.

### Displacement Direction

```xml
<!-- Horizontal waves (beach) -->
<feDisplacementMap xChannelSelector="R" yChannelSelector="G" scale="30"/>

<!-- Vertical streams (waterfall) -->
<feDisplacementMap xChannelSelector="G" yChannelSelector="R" scale="30"/>

<!-- Circular ripples (pond) -->
<feDisplacementMap xChannelSelector="R" yChannelSelector="R" scale="20"/>
```

## Color Manipulation for Water

### feComponentTransfer: Color Channel Control

Transform turbulence noise into water-like colors:

```xml
<feComponentTransfer in="waves" result="waterColor">
  <!-- Reduce red (water absorbs red light first) -->
  <feFuncR type="linear" slope="0.3" intercept="0"/>

  <!-- Moderate green (underwater green tint) -->
  <feFuncG type="linear" slope="0.6" intercept="0.1"/>

  <!-- Strong blue (water is blue) -->
  <feFuncB type="linear" slope="1.2" intercept="0.2"/>

  <!-- Water transparency -->
  <feFuncA type="linear" slope="0.7" intercept="0.2"/>
</feComponentTransfer>
```

### Function Types

| Type | Formula | Use Case |
|------|---------|----------|
| `linear` | `slope * value + intercept` | General adjustment |
| `gamma` | `amplitude * pow(value, exponent) + offset` | Contrast curves |
| `table` | Lookup table | Complex color mapping |
| `discrete` | Step function | Posterization |

### feColorMatrix: Advanced Color Transforms

For underwater color shifts:

```xml
<feColorMatrix type="matrix"
  values="0.8  0    0    0  0
          0    0.9  0    0  0.02
          0    0    1.2  0  0.05
          0    0    0    1  0"/>
<!--     R    G    B    A  offset
         ↓
         Reduces red, slight green boost, strong blue -->
```

### Depth-Based Color

Deeper water absorbs more red light:

```xml
<!-- Surface water (full color) -->
<feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"/>

<!-- Mid-depth (less red) -->
<feColorMatrix values="0.7 0 0 0 0  0 0.9 0 0 0  0 0 1 0 0.05  0 0 0 1 0"/>

<!-- Deep water (mostly blue) -->
<feColorMatrix values="0.3 0 0 0 0  0 0.6 0 0 0.02  0 0 1.1 0 0.1  0 0 0 1 0"/>
```

## Caustics: Underwater Light Patterns

Caustics are the dappled light patterns on underwater surfaces.

### Basic Caustic Pattern

```xml
<filter id="caustics">
  <feTurbulence
    type="turbulence"
    baseFrequency="0.02"
    numOctaves="3"
    result="noise"
  />

  <!-- Sharpen the noise into light beams -->
  <feComponentTransfer in="noise">
    <feFuncR type="gamma" amplitude="2" exponent="3" offset="-0.3"/>
    <feFuncG type="gamma" amplitude="2" exponent="3" offset="-0.3"/>
    <feFuncB type="gamma" amplitude="2" exponent="3" offset="-0.3"/>
    <feFuncA type="linear" slope="1" intercept="0"/>
  </feComponentTransfer>

  <!-- Soften edges -->
  <feGaussianBlur stdDeviation="1"/>

  <!-- Blend with source as overlay -->
  <feBlend in="SourceGraphic" mode="overlay"/>
</filter>
```

### Animated Caustics

```xml
<filter id="animatedCaustics">
  <feTurbulence type="turbulence" baseFrequency="0.015" numOctaves="3">
    <animate
      attributeName="seed"
      values="1;5;10;15;10;5;1"
      dur="20s"
      repeatCount="indefinite"
    />
  </feTurbulence>
  <!-- ... rest of filter -->
</filter>
```

### CSS-Based Caustics (Performance Alternative)

```css
.caustics {
  background:
    radial-gradient(ellipse 20% 30% at 30% 40%, rgba(255,255,255,0.15) 0%, transparent 50%),
    radial-gradient(ellipse 25% 20% at 70% 60%, rgba(255,255,255,0.12) 0%, transparent 50%),
    radial-gradient(ellipse 15% 25% at 50% 30%, rgba(255,255,255,0.1) 0%, transparent 50%);
  animation: caustic-shift 8s ease-in-out infinite;
}

@keyframes caustic-shift {
  0%, 100% { background-position: 0 0, 0 0, 0 0; }
  33% { background-position: 20px 10px, -15px 5px, 10px -10px; }
  66% { background-position: -10px -5px, 10px 15px, -20px 5px; }
}
```

## Water Surface Reflections

### Basic Reflection Filter

```xml
<filter id="waterReflection">
  <!-- Distort the reflection -->
  <feTurbulence type="turbulence" baseFrequency="0.01 0.05" numOctaves="2"/>
  <feDisplacementMap in="SourceGraphic" scale="15"/>

  <!-- Fade reflection -->
  <feComponentTransfer>
    <feFuncA type="linear" slope="0.4" intercept="0"/>
  </feComponentTransfer>

  <!-- Blur for water surface diffusion -->
  <feGaussianBlur stdDeviation="1"/>
</filter>
```

### Implementation

```html
<div class="scene">
  <div class="sky">
    <!-- Content above water -->
  </div>
  <div class="water">
    <div class="reflection" style="transform: scaleY(-1)">
      <!-- Mirror of sky content -->
    </div>
  </div>
</div>

<style>
  .reflection {
    filter: url(#waterReflection);
    opacity: 0.4;
    mask-image: linear-gradient(to bottom, black 0%, transparent 100%);
  }
</style>
```

## Foam and Whitecaps

### Foam Generation

```xml
<filter id="foam">
  <!-- High frequency noise for foam texture -->
  <feTurbulence
    type="fractalNoise"  <!-- fractalNoise for foam (not turbulence) -->
    baseFrequency="0.03"
    numOctaves="5"
    result="foamNoise"
  />

  <!-- Threshold to create white spots -->
  <feComponentTransfer in="foamNoise">
    <feFuncR type="discrete" tableValues="0 0 0.8 1 1"/>
    <feFuncG type="discrete" tableValues="0 0 0.8 1 1"/>
    <feFuncB type="discrete" tableValues="0 0 0.9 1 1"/>
    <feFuncA type="discrete" tableValues="0 0 0 0.3 0.5"/>
  </feComponentTransfer>

  <!-- Soften foam edges -->
  <feGaussianBlur stdDeviation="0.5"/>
</filter>
```

### Layered Foam

```css
.foam-layer {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 15%;
  background: linear-gradient(to top,
    rgba(255,255,255,0.8) 0%,
    rgba(255,255,255,0.4) 40%,
    transparent 100%
  );
  filter: url(#foam);
  animation: foam-motion 4s ease-in-out infinite;
}

@keyframes foam-motion {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
```

## Compositing Operations

### feComposite Operators

| Operator | Effect | Water Use |
|----------|--------|-----------|
| `over` | A over B | Layer water on background |
| `in` | A within B shape | Clip water to container |
| `out` | A outside B | Create holes in water |
| `atop` | A atop B | Water texture on shape |
| `xor` | A XOR B | Interesting edge effects |
| `arithmetic` | Custom blend | Complex compositing |

### Example: Water with Transparent Areas

```xml
<filter id="waterWithHoles">
  <feTurbulence type="turbulence" baseFrequency="0.01 0.1" result="waves"/>
  <feDisplacementMap in="SourceGraphic" in2="waves" scale="20" result="displaced"/>

  <!-- Create mask for transparent areas -->
  <feTurbulence type="fractalNoise" baseFrequency="0.005" result="mask"/>
  <feComponentTransfer in="mask">
    <feFuncA type="discrete" tableValues="0 0 1 1"/>
  </feComponentTransfer>

  <!-- Apply mask -->
  <feComposite in="displaced" operator="in"/>
</filter>
```

## Blend Modes for Water

```xml
<feBlend in="waterLayer" in2="SourceGraphic" mode="..."/>
```

| Mode | Effect | Best For |
|------|--------|----------|
| `normal` | Standard layering | Opaque water surface |
| `multiply` | Darkens | Deep water shadows |
| `screen` | Lightens | Foam, highlights |
| `overlay` | Contrast boost | Caustics |
| `soft-light` | Subtle tinting | Color shifts |
| `color-dodge` | Bright highlights | Sparkles |

### Example: Complete Water with Multiple Blends

```xml
<filter id="fullWater">
  <!-- Base water displacement -->
  <feTurbulence type="turbulence" baseFrequency="0.008 0.08" result="waves"/>
  <feDisplacementMap in="SourceGraphic" in2="waves" scale="20" result="displaced"/>

  <!-- Water color overlay -->
  <feFlood flood-color="#0369a1" flood-opacity="0.3" result="waterTint"/>
  <feBlend in="waterTint" in2="displaced" mode="multiply" result="tinted"/>

  <!-- Caustic highlights -->
  <feTurbulence type="turbulence" baseFrequency="0.02" result="caustics"/>
  <feComponentTransfer in="caustics">
    <feFuncR type="gamma" amplitude="2" exponent="3"/>
    <feFuncG type="gamma" amplitude="2" exponent="3"/>
    <feFuncB type="gamma" amplitude="2" exponent="3"/>
  </feComponentTransfer>
  <feBlend in2="tinted" mode="overlay" result="withCaustics"/>

  <!-- Final output -->
  <feComposite in="withCaustics" in2="SourceGraphic" operator="over"/>
</filter>
```
