---
title: Noise-Based Effects
sidebar_label: Noise-Based Effects
sidebar_position: 2
---
# Noise-Based Effects

Organic, procedural effects using noise functions in Metal.

## Hash Functions

```metal
// Simple 2D hash function
float hash(float2 p) {
    p = fract(p * float2(234.34, 435.345));
    p += dot(p, p + 34.23);
    return fract(p.x * p.y);
}

// 3D hash for volumetric effects
float hash3(float3 p) {
    p = fract(p * float3(443.897, 441.423, 437.195));
    p += dot(p, p.yzx + 19.19);
    return fract((p.x + p.y) * p.z);
}
```

## Smooth Noise

```metal
float smooth_noise(float2 uv) {
    float2 i = floor(uv);
    float2 f = fract(uv);

    // Smooth interpolation (smoothstep)
    f = f * f * (3.0 - 2.0 * f);

    // Four corners of grid
    float a = hash(i);
    float b = hash(i + float2(1.0, 0.0));
    float c = hash(i + float2(0.0, 1.0));
    float d = hash(i + float2(1.0, 1.0));

    // Bilinear interpolation
    return mix(mix(a, b, f.x),
               mix(c, d, f.x), f.y);
}
```

## Fractal Brownian Motion (FBM)

Creates organic, natural-looking patterns by layering noise at different frequencies.

```metal
float fbm(float2 uv, int octaves) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 2.0;

    for (int i = 0; i < octaves; i++) {
        value += amplitude * smooth_noise(uv * frequency);
        amplitude *= 0.5;  // Persistence
        frequency *= 2.0;  // Lacunarity
    }

    return value;
}
```

### FBM Parameters

| Parameter | Effect |
|-----------|--------|
| **Octaves** | More = finer detail, higher cost |
| **Persistence** (amplitude multiplier) | Lower = smoother, higher = rougher |
| **Lacunarity** (frequency multiplier) | Controls how fast detail increases |

Typical values:
- Clouds: 6-8 octaves, 0.5 persistence
- Terrain: 8-12 octaves, 0.6 persistence
- Marble: 4-6 octaves, 0.5 persistence

## Animated Flowing Marble Effect

```metal
fragment float4 flowing_marble_fragment(
    VertexOut in [[stage_in]],
    constant float& time [[buffer(0)]]
) {
    float2 uv = in.texcoord * 5.0;

    // Create flowing pattern
    float2 flow = float2(
        fbm(uv + time * 0.1, 4),
        fbm(uv + time * 0.15 + 100.0, 4)
    );

    // Distort UV with flow
    uv += flow * 2.0;

    // Create marble veins
    float marble = fbm(uv, 6);
    marble = abs(sin(marble * 10.0 + time * 0.5));

    // Color gradient (purple to gold)
    float3 color1 = float3(0.4, 0.1, 0.7);  // Purple
    float3 color2 = float3(1.0, 0.7, 0.2);  // Gold
    float3 color = mix(color1, color2, marble);

    // Add shimmer
    float shimmer = fbm(uv * 10.0 + time, 3) * 0.3;
    color += shimmer;

    return float4(color, 1.0);
}
```

## Domain Warping

Distort UV coordinates with noise for organic effects:

```metal
float2 warp_domain(float2 uv, float time) {
    float2 q = float2(
        fbm(uv, 4),
        fbm(uv + float2(5.2, 1.3), 4)
    );

    float2 r = float2(
        fbm(uv + q + float2(1.7, 9.2) + 0.15 * time, 4),
        fbm(uv + q + float2(8.3, 2.8) + 0.126 * time, 4)
    );

    return uv + r * 2.0;
}
```

## Voronoi / Cellular Noise

```metal
float voronoi(float2 uv) {
    float2 i = floor(uv);
    float2 f = fract(uv);

    float min_dist = 1.0;

    for (int y = -1; y <= 1; y++) {
        for (int x = -1; x <= 1; x++) {
            float2 neighbor = float2(x, y);
            float2 point = float2(hash(i + neighbor),
                                   hash(i + neighbor + 127.0));
            float dist = length(neighbor + point - f);
            min_dist = min(min_dist, dist);
        }
    }

    return min_dist;
}
```

## Performance Tips

1. **Unroll small loops**: `[[unroll]]` for octave loops with fixed count
2. **Use half precision**: `half` for color calculations
3. **Precompute gradients**: For Perlin noise, texture-based gradients faster
4. **Limit octaves**: 4-6 is usually enough for real-time
5. **LOD-based detail**: Fewer octaves for distant objects

## Effect Ideas

| Effect | Technique |
|--------|-----------|
| Fire | FBM + time + color ramp |
| Water caustics | Animated Voronoi |
| Clouds | FBM with domain warping |
| Marble | FBM with sin() banding |
| Wood grain | FBM rings + turbulence |
| Plasma | Multiple sin waves + time |
