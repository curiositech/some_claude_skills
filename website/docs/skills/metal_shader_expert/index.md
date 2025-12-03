---
slug: /skills/metal_shader_expert
id: metal_shader_expert
name: metal-shader-expert
description: 20 years Weta/Pixar experience in real-time graphics, Metal shaders, and visual effects
---

# Metal Shader Expert

<SkillHeader
  skillName="Metal Shader Expert"
  fileName="metal-shader-expert"
  description={"\"20 years Weta/Pixar experience in real-time graphics, Metal shaders, and visual effects. Expert in MSL shaders, PBR rendering, tile-based deferred rendering (TBDR), and GPU debugging. Activate on 'Metal shader', 'MSL', 'compute shader', 'vertex shader', 'fragment shader', 'PBR', 'ray tracing', 'tile shader', 'GPU profiling', 'Apple GPU'. NOT for WebGL/GLSL (different architecture), general OpenGL (deprecated on Apple), CUDA (NVIDIA only), or CPU-side rendering optimization.\""}
  tags={["creation","3d","code","advanced","production-ready"]}
/>

## When to Use This Skill

| Use Case | Example |
|----------|---------|
| Metal shaders | Vertex, fragment, compute, tile shaders |
| PBR rendering | Cook-Torrance BRDF, GGX, Fresnel |
| GPU compute | Parallel processing, image effects |
| iOS/macOS graphics | Apple Silicon optimization |
| Real-time VFX | Particles, volumetrics, procedural effects |
| Shader debugging | Heat maps, performance profiling |

## Do NOT Use For

- **WebGL/GLSL** → Different architecture, use web graphics tools
- **OpenGL** → Deprecated on Apple, use Metal
- **CUDA** → NVIDIA only, not Apple
- **CPU rendering** → Different optimization strategies

## MCP Integrations

| MCP Server | Capabilities |
|------------|--------------|
| **Stability AI** | Reference images for shader effects |
| **Ideogram** | Concept art for material design |

## Expert vs Novice Shibboleths

| Topic | Novice Says | Expert Says |
|-------|-------------|-------------|
| Precision | "Use float everywhere" | "half by default, float only where needed (2x bandwidth)" |
| TBDR | "Minimize draw calls" | "Tile shaders, memoryless attachments, action cost > drawcall" |
| Branching | "Avoid if statements" | "Uniform branching is free, function constants for variants" |
| Textures | "Sample textures" | "Gather for box filters, use compressed formats (ASTC)" |
| Debugging | "Print values" | "Heat map visualization, GPU frame capture, occupancy analysis" |

## Common Anti-Patterns

### "Using float32 everywhere"

**What it looks like:** All shader values declared as `float`, `float3`, `float4`

**Why it's wrong:** Apple GPUs process half precision at 2x speed with half bandwidth

**What to do instead:**
```cpp
// Use half by default
half4 color = half4(0.0h);
half3 normal = half3(0.0h);

// Only use float for:
// - Position calculations (precision matters)
// - Accumulation over many iterations
// - When half causes visible banding
float3 worldPos = in.world_position;  // OK
```

### "Ignoring tile-based architecture"

**What it looks like:** Treating Apple GPU like desktop discrete GPU

**Why it's wrong:** TBDR has different performance characteristics

**What to do instead:**
```cpp
// Use memoryless attachments for intermediates
texture2d<half> depthBuffer [[memoryless]];

// Tile shaders for efficient on-chip processing
[[tile_shader]]
kernel void tile_deferred_lighting(...);

// Prefer compute for post-process (single tile action)
```

### "Branching for shader variants"

**What it looks like:**
```cpp
if (usePBR) { /* PBR path */ }
else { /* Simple path */ }
```

**Why it's wrong:** Runtime branching, wasted registers, poor occupancy

**What to do instead:**
```cpp
// Function constants - compile-time specialization
constant bool UsePBR [[function_constant(0)]];
constant bool UseNormalMap [[function_constant(1)]];

fragment half4 material_fragment(...) {
    if (UsePBR) { /* Compiled out if false */ }
}
```

## Core Metal Patterns

### PBR Material (Cook-Torrance)

```cpp
// GGX normal distribution
half distribution_ggx(half3 N, half3 H, half roughness) {
    half a2 = roughness * roughness * roughness * roughness;
    half NdotH = max(dot(N, H), 0.0h);
    half denom = NdotH * NdotH * (a2 - 1.0h) + 1.0h;
    return a2 / (M_PI_H * denom * denom);
}

// Fresnel-Schlick
half3 fresnel_schlick(half cosTheta, half3 F0) {
    return F0 + (1.0h - F0) * pow(1.0h - cosTheta, 5.0h);
}
```

### Tile Shader (TBDR Optimization)

```cpp
struct TileData {
    half4 albedo [[raster_order_group(0)]];
    half4 normal [[raster_order_group(0)]];
    float depth [[raster_order_group(0)]];
};

kernel void tile_deferred_lighting(
    imageblock<TileData> tileData,
    uint2 tid [[thread_position_in_threadgroup]]
) {
    TileData data = tileData.read(tid);
    // All G-buffer data stays in tile memory (fast!)
    half3 result = compute_lighting(data);
    tileData.write(result, tid);
}
```

### Debug Heat Map

```cpp
half3 heat_map(half value) {
    value = saturate(value);
    // Blue → Cyan → Green → Yellow → Red
    if (value < 0.25h)
        return mix(half3(0,0,1), half3(0,1,1), value * 4.0h);
    else if (value < 0.5h)
        return mix(half3(0,1,1), half3(0,1,0), (value - 0.25h) * 4.0h);
    else if (value < 0.75h)
        return mix(half3(0,1,0), half3(1,1,0), (value - 0.5h) * 4.0h);
    else
        return mix(half3(1,1,0), half3(1,0,0), (value - 0.75h) * 4.0h);
}
```

## Performance Targets

| Metric | Target | Notes |
|--------|--------|-------|
| Frame time | &lt;16.6ms (60fps) | &lt;11.1ms for 90fps VR |
| Shader compile | &lt;100ms | Use function constants, not uber-shaders |
| Bandwidth | Minimize | half &gt; float, compressed textures |
| Occupancy | &gt;50% | Reduce register pressure |
| Tile memory | &lt;32KB/tile | For efficient TBDR |

## Metal Debugging Workflow

1. **GPU Frame Capture** → Xcode GPU debugger
2. **Shader Profiler** → `metal-shaderprof` CLI
3. **Heat Map Mode** → Custom debug visualization
4. **Performance HUD** → Real-time GPU metrics
5. **Validation Layer** → Catch API misuse early

## Integrates With

- **physics-rendering-expert**: GPU-accelerated physics
- **vr-avatar-engineer**: Avatar rendering shaders
- **sound-engineer**: Audio-reactive visuals

## References

- Metal Shading Language Specification
- Real-Time Rendering (Akenine-Möller et al.)
- GPU Gems series
- SIGGRAPH Advances in Real-Time Rendering

---

*"The best graphics engineers share three traits: curiosity (experiment constantly), clarity (write maintainable code), and craft (care about both performance and beauty)."*
