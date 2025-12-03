---
title: Debug Tools & Visualization
sidebar_label: Debug Tools & Visualization
sidebar_position: 1
---
# Debug Tools & Visualization

Essential patterns for shader debugging and performance analysis.

## Heat Map Visualization

```metal
// Visualize scalar values: 0=blue, 0.5=green, 1=red
float3 heat_map(float v) {
    v = saturate(v);
    return v < 0.5
        ? mix(float3(0,0,1), float3(0,1,0), v*2)
        : mix(float3(0,1,0), float3(1,0,0), (v-0.5)*2);
}

// Extended heat map with purple for overflow
float3 heat_map_extended(float v) {
    if (v < 0.0) return float3(0.5, 0, 0.5);  // Magenta: negative
    if (v > 1.0) return float3(1, 0, 1);       // Purple: overflow
    return heat_map(v);
}
```

## Debug Visualization Modes

```metal
fragment float4 debug_fragment(
    VertexOut in [[stage_in]],
    constant uint& mode [[buffer(0)]]
) {
    switch (mode) {
        case 0: // World normals
            return float4(in.world_normal * 0.5 + 0.5, 1.0);

        case 1: // UV coordinates
            return float4(in.texcoord, 0.0, 1.0);

        case 2: // Depth (linear)
            float depth = in.position.z / in.position.w;
            return float4(float3(depth), 1.0);

        case 3: // Tangent space
            return float4(in.tangent * 0.5 + 0.5, 1.0);

        case 4: // Bitangent
            return float4(in.bitangent * 0.5 + 0.5, 1.0);

        case 5: // World position (wrapped)
            return float4(fract(in.world_position), 1.0);

        default:
            return float4(1, 0, 1, 1);  // Magenta = error
    }
}
```

## Overdraw Visualization

```metal
// Increment counter per fragment
kernel void overdraw_counter(
    texture2d<uint, access::read_write> counter [[texture(0)]],
    uint2 gid [[thread_position_in_grid]]
) {
    uint current = counter.read(gid).r;
    counter.write(uint4(current + 1), gid);
}

// Visualize overdraw
fragment float4 overdraw_visualize(
    VertexOut in [[stage_in]],
    texture2d<uint> counter [[texture(0)]]
) {
    uint2 pos = uint2(in.position.xy);
    uint count = counter.read(pos).r;

    // Heat map: 1=green, 2=yellow, 3+=red
    float normalized = float(count) / 5.0;
    return float4(heat_map(normalized), 1.0);
}
```

## Mipmap Level Visualization

```metal
// Shows which mipmap is being sampled
float3 mip_colors[] = {
    float3(1,0,0),   // Mip 0 - Red
    float3(1,0.5,0), // Mip 1 - Orange
    float3(1,1,0),   // Mip 2 - Yellow
    float3(0,1,0),   // Mip 3 - Green
    float3(0,1,1),   // Mip 4 - Cyan
    float3(0,0,1),   // Mip 5 - Blue
    float3(0.5,0,1), // Mip 6 - Purple
    float3(1,0,1),   // Mip 7 - Magenta
};

fragment float4 mip_debug(
    VertexOut in [[stage_in]],
    texture2d<float> tex [[texture(0)]]
) {
    // Calculate mip level from UV derivatives
    float2 dx = dfdx(in.texcoord);
    float2 dy = dfdy(in.texcoord);
    float delta = max(dot(dx, dx), dot(dy, dy));
    float mip = 0.5 * log2(delta * tex.get_width() * tex.get_width());

    int mip_index = clamp(int(mip), 0, 7);
    return float4(mip_colors[mip_index], 1.0);
}
```

## NaN/Inf Detection

```metal
float4 nan_check(float4 color) {
    if (any(isnan(color))) return float4(1, 0, 1, 1);  // Magenta = NaN
    if (any(isinf(color))) return float4(0, 1, 1, 1);  // Cyan = Inf
    return color;
}
```

## Wireframe Overlay

```metal
// Barycentric wireframe (requires vertex shader to pass barycentrics)
float wireframe(float3 bary, float thickness) {
    float3 d = fwidth(bary);
    float3 a = smoothstep(float3(0), d * thickness, bary);
    return min(min(a.x, a.y), a.z);
}

fragment float4 wireframe_overlay(
    VertexOut in [[stage_in]],
    constant float4& base_color [[buffer(0)]],
    constant float4& wire_color [[buffer(1)]]
) {
    float edge = wireframe(in.barycentrics, 1.5);
    return mix(wire_color, base_color, edge);
}
```

## Performance Timers

```metal
// Measure shader complexity by counting iterations
kernel void complexity_visualize(
    texture2d<float, access::write> output [[texture(0)]],
    constant uint& max_iterations [[buffer(0)]],
    uint2 gid [[thread_position_in_grid]]
) {
    uint iterations = 0;

    // Your algorithm with iteration counting
    while (/* condition */ iterations < max_iterations) {
        // Work...
        iterations++;
    }

    float complexity = float(iterations) / float(max_iterations);
    output.write(float4(heat_map(complexity), 1.0), gid);
}
```

## GPU Capture Integration

Use Xcode GPU Capture for:
- Frame timeline analysis
- Shader profiler
- Memory bandwidth
- Occupancy metrics
- Pipeline state inspection

### Best Practices

1. **Always have a debug mode**: Toggle with function constant
2. **Color-code errors**: Magenta for NaN, Cyan for Inf
3. **Visualize intermediate buffers**: G-buffer, shadow maps
4. **Add performance overlays**: FPS, draw calls, triangles
5. **Hot-reload shaders**: Metal Library at runtime

## Debug Macro Pattern

```metal
#if DEBUG_MODE
    return float4(heat_map(some_value), 1.0);
#else
    return final_color;
#endif
```

Use function constants for runtime toggling without recompilation.
