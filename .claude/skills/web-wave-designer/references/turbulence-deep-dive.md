# feTurbulence Deep Dive for Water Effects

## Understanding the turbulence vs fractalNoise Difference

The `type` attribute fundamentally changes how the Perlin noise is generated:

### type="turbulence"

```
Output = |noise(x,y)| + |noise(2x,2y)|/2 + |noise(4x,4y)|/4 + ...
```

- Takes absolute value of each octave
- Creates continuous, flowing patterns
- **Starts from transparent black** and builds up
- Perfect for: water, liquid, flowing effects

### type="fractalNoise"

```
Output = noise(x,y) + noise(2x,2y)/2 + noise(4x,4y)/4 + ...
```

- Allows negative values (which wrap)
- Creates cloud-like, billowy patches
- **Starts from solid midtone gray**
- Perfect for: clouds, smoke, terrain

## Two-Value baseFrequency for Directional Waves

The magic of water effects lies in using **different X and Y frequencies**:

```xml
<feTurbulence baseFrequency="0.01 0.1" />
                              ↑    ↑
                              X    Y
```

### What Each Value Controls

| Frequency | Low (0.005) | High (0.02) |
|-----------|-------------|-------------|
| **X (horizontal)** | Long, stretched patterns | Short, choppy patterns |
| **Y (vertical)** | Minimal up/down variation | Strong vertical oscillation |

### Common Ratio Patterns

```
X:Y Ratio    Effect                      Use Case
─────────────────────────────────────────────────────
1:1          Circular ripples            Pool, pond, raindrops
1:5          Horizontal ocean swells     Deep sea, calm ocean
1:10         Long rolling waves          Beach view, shore
1:15         Extreme horizontal stretch  Calm lake, mirror surface
5:1          Vertical striations         Waterfall, streaming
```

### Visual Examples

```
baseFrequency="0.01 0.01"  →  ○ ○ ○    (circular ripples)
                              ○ ○ ○
                              ○ ○ ○

baseFrequency="0.01 0.1"   →  ~~~~~~~~  (ocean waves)
                              ~~~~~~~~
                              ~~~~~~~~

baseFrequency="0.1 0.01"   →  | | | |   (vertical streams)
                              | | | |
                              | | | |
```

## numOctaves: Detail vs Performance

Each octave adds a layer of detail at half the scale:

```
Octave 1: ░░░░░░░░  (baseFrequency)
Octave 2: ▒▒▒▒▒▒▒▒  (2x frequency, 1/2 amplitude)
Octave 3: ▓▓▓▓▓▓▓▓  (4x frequency, 1/4 amplitude)
Octave 4: ████████  (8x frequency, 1/8 amplitude)
```

### Recommended Values for Water

| numOctaves | Visual Result | CPU Cost | Best For |
|------------|---------------|----------|----------|
| 1 | Bold, cartoon waves | Minimal | Stylized/game water |
| 2 | Simple, clean ripples | Low | Pool, calm water |
| 3 | Natural ocean surface | Medium | General purpose |
| 4 | Detailed, realistic | High | Hero sections |
| 5+ | Diminishing returns | Very High | Avoid |

### Performance Impact

```
Octaves    Relative CPU
────────────────────────
1          1x
2          2x
3          4x
4          8x
5          16x (wasteful)
```

**Rule**: If you can't see the difference between 4 and 5 octaves, use 4.

## Seed: Free Variation

The `seed` attribute changes the random seed for the noise function. This is **computationally free** - same performance regardless of value.

```xml
<!-- These have identical performance -->
<feTurbulence seed="1" />
<feTurbulence seed="99999" />
```

### Using Seed for Layer Variation

```xml
<filter id="wave1"><feTurbulence seed="1" /></filter>
<filter id="wave2"><feTurbulence seed="42" /></filter>
<filter id="wave3"><feTurbulence seed="999" /></filter>
```

### Seed Animation for Morphing

Animating seed creates a "morphing" effect without the performance hit of baseFrequency animation:

```xml
<feTurbulence seed="1">
  <animate
    attributeName="seed"
    values="1;10;20;30;20;10;1"
    dur="30s"
    repeatCount="indefinite"
  />
</feTurbulence>
```

This creates subtle shape variation without the constant filter recalculation.

## stitchTiles: Seamless Tiling

For repeating backgrounds, use `stitchTiles="stitch"`:

```xml
<feTurbulence
  baseFrequency="0.01 0.1"
  stitchTiles="stitch"  <!-- Makes pattern tileable -->
/>
```

**Warning**: This can change the visual output slightly. Test both values.

| Value | Effect |
|-------|--------|
| `noStitch` (default) | Natural randomness, may show seams when tiled |
| `stitch` | Forces seamless tiling, slightly different pattern |

## Advanced: Combining Multiple Turbulence Sources

For complex water, layer different turbulence patterns:

```xml
<filter id="complexWater">
  <!-- Large swells -->
  <feTurbulence
    type="turbulence"
    baseFrequency="0.003 0.03"
    numOctaves="2"
    seed="1"
    result="swells"
  />

  <!-- Surface chop -->
  <feTurbulence
    type="turbulence"
    baseFrequency="0.02 0.15"
    numOctaves="3"
    seed="2"
    result="chop"
  />

  <!-- Combine: swells drive major displacement, chop adds detail -->
  <feDisplacementMap in="SourceGraphic" in2="swells" scale="30" result="displaced1"/>
  <feDisplacementMap in="displaced1" in2="chop" scale="10" result="final"/>
</filter>
```

## Debugging Turbulence Output

To see what the raw turbulence looks like:

```xml
<filter id="debug">
  <feTurbulence type="turbulence" baseFrequency="0.01 0.1" result="noise"/>
  <!-- Output noise directly (no source graphic needed) -->
  <feColorMatrix in="noise" type="saturate" values="0"/>
</filter>

<rect width="400" height="200" filter="url(#debug)"/>
```

This renders the raw noise pattern, helping you understand what different parameters produce.

## Browser Compatibility Notes

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome | Full | Best performance, GPU accelerated |
| Firefox | Full | Good performance |
| Safari | Full | Watch for iOS memory limits |
| Edge | Full | Chromium-based, same as Chrome |
| IE11 | Partial | Avoid animations, may crash |

### Safari-Specific Issues

Safari on iOS may have memory issues with:
- numOctaves > 4
- Multiple animated filters
- Large filter regions

**Workaround**: Detect Safari and reduce complexity:

```javascript
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
const maxOctaves = isSafari ? 3 : 4;
```
