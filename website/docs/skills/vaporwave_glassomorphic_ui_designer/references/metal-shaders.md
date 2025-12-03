---
title: Metal Shaders for Vaporwave Effects
sidebar_label: Metal Shaders for Vaporwave...
sidebar_position: 3
---
# Metal Shaders for Vaporwave Effects

Custom Metal shaders for GPU-accelerated vaporwave and glass effects in SwiftUI.

## Performance Optimization

### Custom Blur Shader

```metal
#include <metal_stdlib>
using namespace metal;

// Custom blur shader for glass effect
// Faster than system blur for custom effects
kernel void gaussianBlur(
    texture2d<float, access::read> inputTexture [[texture(0)]],
    texture2d<float, access::write> outputTexture [[texture(1)]],
    constant float &blurRadius [[buffer(0)]],
    uint2 gid [[thread_position_in_grid]]
) {
    float4 color = float4(0.0);
    int radius = int(blurRadius);
    float weightSum = 0.0;

    for (int dy = -radius; dy <= radius; dy++) {
        for (int dx = -radius; dx <= radius; dx++) {
            uint2 samplePos = gid + uint2(dx, dy);

            // Gaussian weight
            float distance = sqrt(float(dx * dx + dy * dy));
            float weight = exp(-(distance * distance) / (2.0 * blurRadius * blurRadius));

            color += inputTexture.read(samplePos) * weight;
            weightSum += weight;
        }
    }

    outputTexture.write(color / weightSum, gid);
}
```

### Animated Gradient Shader

```metal
fragment float4 vaporwaveGradient(
    float2 uv [[point_coord]],
    constant float &time [[buffer(0)]]
) {
    // Animated vaporwave gradient
    float3 color1 = float3(1.0, 0.71, 0.95);  // Pink
    float3 color2 = float3(0.49, 0.87, 1.0);  // Blue
    float3 color3 = float3(0.71, 0.58, 1.0);  // Purple

    // Animated wave pattern
    float wave = sin(uv.x * 3.0 + time) * 0.5 + 0.5;
    float wave2 = cos(uv.y * 2.0 - time * 0.5) * 0.5 + 0.5;

    // Mix colors based on position and time
    float3 color = mix(color1, color2, uv.y);
    color = mix(color, color3, wave * wave2);

    return float4(color, 1.0);
}
```

## Vaporwave Grid Shader

```metal
#include <metal_stdlib>
using namespace metal;

[[ stitchable ]] half4 vaporwaveGrid(
    float2 position,
    float time,
    float2 size,
    half4 currentColor
) {
    float2 uv = position / size;

    // Create perspective grid effect
    float perspectiveFactor = (1.0 - uv.y) * 2.0 + 0.5;
    float2 gridUV = uv * float2(20.0, 30.0) * perspectiveFactor;

    // Grid lines with glow
    float gridX = abs(sin(gridUV.x * 3.14159));
    float gridY = abs(sin(gridUV.y * 3.14159));

    // Animated pulsing
    float pulse = sin(time * 2.0) * 0.5 + 0.5;

    // Cyan grid lines
    float grid = step(0.95, max(gridX, gridY));
    float3 gridColor = float3(0.0, 0.93, 1.0) * grid * (0.3 + pulse * 0.3);

    // Pink horizontal lines (more prominent at bottom)
    float horizStrength = smoothstep(0.3, 1.0, uv.y);
    float horizGrid = step(0.98, gridY) * horizStrength;
    float3 horizColor = float3(1.0, 0.23, 0.68) * horizGrid * 0.5;

    // Combine with original color
    float3 finalColor = float3(currentColor.rgb) + gridColor + horizColor;

    return half4(half3(finalColor), currentColor.a);
}
```

## Holographic Shimmer Effect

```metal
[[ stitchable ]] half4 holographicShimmer(
    float2 position,
    float time,
    float2 size,
    half4 currentColor
) {
    float2 uv = position / size;

    // Rainbow shimmer that moves across surface
    float shimmerPhase = uv.x * 10.0 + uv.y * 5.0 - time * 2.0;
    float shimmer = sin(shimmerPhase) * 0.5 + 0.5;

    // Create RGB chromatic aberration
    float3 rainbow = float3(
        sin(shimmerPhase) * 0.5 + 0.5,
        sin(shimmerPhase + 2.0) * 0.5 + 0.5,
        sin(shimmerPhase + 4.0) * 0.5 + 0.5
    );

    // Soft glow
    float glow = shimmer * 0.3;

    // Blend with original
    float3 finalColor = mix(
        float3(currentColor.rgb),
        rainbow,
        glow
    );

    return half4(half3(finalColor), currentColor.a);
}
```

## Glass Refraction with Color Shift

```metal
[[ stitchable ]] half4 glassRefraction(
    float2 position,
    float time,
    float2 size,
    half4 currentColor,
    texture2d<half> backgroundTexture
) {
    float2 uv = position / size;

    // Animated distortion
    float2 distortion = float2(
        sin(uv.y * 10.0 + time) * 0.01,
        cos(uv.x * 10.0 + time) * 0.01
    );

    // Sample background with distortion (refraction)
    float2 refractUV = uv + distortion;
    half4 refracted = backgroundTexture.sample(sampler(filter::linear), refractUV);

    // Add chromatic aberration (RGB split)
    half r = backgroundTexture.sample(sampler(filter::linear), refractUV + float2(0.002, 0)).r;
    half g = refracted.g;
    half b = backgroundTexture.sample(sampler(filter::linear), refractUV - float2(0.002, 0)).b;

    half4 aberrated = half4(r, g, b, refracted.a);

    // Mix with vaporwave tint
    half3 vaporTint = half3(0.7, 0.58, 1.0); // Vaporwave purple
    half3 tinted = mix(aberrated.rgb, vaporTint, 0.15);

    // Blend with current glass material
    half3 final = mix(currentColor.rgb, tinted, 0.3);

    return half4(final, currentColor.a * 0.9);
}
```

## Neon Glow Shader

```metal
[[ stitchable ]] half4 neonGlow(
    float2 position,
    float time,
    float2 size,
    half4 currentColor,
    half3 glowColor,
    float glowIntensity
) {
    float2 uv = position / size;
    float2 center = float2(0.5, 0.5);

    // Distance from edge
    float distFromEdge = min(
        min(uv.x, 1.0 - uv.x),
        min(uv.y, 1.0 - uv.y)
    );

    // Edge glow
    float edgeGlow = smoothstep(0.0, 0.1, distFromEdge);
    edgeGlow = 1.0 - edgeGlow;

    // Pulsing animation
    float pulse = (sin(time * 3.0) * 0.5 + 0.5) * 0.3 + 0.7;

    // Apply neon glow
    half3 glow = half3(glowColor) * half(edgeGlow * pulse * glowIntensity);
    half3 final = currentColor.rgb + glow;

    return half4(final, currentColor.a);
}
```

## SwiftUI Integration

### Vaporwave Grid View

```swift
struct VaporwaveGridView: View {
    @State private var startTime = Date()

    var body: some View {
        TimelineView(.animation) { timeline in
            Rectangle()
                .fill(.ultraThinMaterial)
                .visualEffect { content, proxy in
                    content
                        .colorEffect(
                            ShaderLibrary.vaporwaveGrid(
                                .float(timeline.date.timeIntervalSince(startTime)),
                                .float2(proxy.size)
                            )
                        )
                }
        }
    }
}
```

### Holographic Button

```swift
struct HolographicButton: View {
    let title: String
    let action: () -> Void
    @State private var startTime = Date()

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.vaporwaveBody)
                .padding(.horizontal, 32)
                .padding(.vertical, 16)
        }
        .background(
            TimelineView(.animation) { timeline in
                RoundedRectangle(cornerRadius: 12)
                    .fill(.regularMaterial)
                    .visualEffect { content, proxy in
                        content
                            .colorEffect(
                                ShaderLibrary.holographicShimmer(
                                    .float(timeline.date.timeIntervalSince(startTime)),
                                    .float2(proxy.size)
                                )
                            )
                    }
            }
        )
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(
                    LinearGradient(
                        colors: [.vaporwavePink, .vaporwaveCyan],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ),
                    lineWidth: 2
                )
        )
    }
}
```

### Neon Glass Card

```swift
struct NeonGlassCard<Content: View>: View {
    let content: Content
    let glowColor: Color
    @State private var startTime = Date()

    init(glowColor: Color = .vaporwaveCyan, @ViewBuilder content: () -> Content) {
        self.glowColor = glowColor
        self.content = content()
    }

    var body: some View {
        TimelineView(.animation) { timeline in
            content
                .padding(20)
                .background(.ultraThinMaterial)
                .clipShape(RoundedRectangle(cornerRadius: 16))
                .visualEffect { content, proxy in
                    content
                        .colorEffect(
                            ShaderLibrary.neonGlow(
                                .float(timeline.date.timeIntervalSince(startTime)),
                                .float2(proxy.size),
                                .color(glowColor),
                                .float(0.8)
                            )
                        )
                }
        }
    }
}
```

### Metal Background Integration

```swift
struct MetalVaporwaveBackground: View {
    @State private var time: Float = 0.0
    let timer = Timer.publish(every: 0.016, on: .main, in: .common).autoconnect()  // 60fps

    var body: some View {
        TimelineView(.animation) { timeline in
            Canvas { context, size in
                // Render using Metal shader
                // (Actual Metal integration requires MetalKit setup)
            }
        }
        .onReceive(timer) { _ in
            time += 0.016
        }
    }
}
```

## Performance Tips

### Optimization Guidelines

1. **Simplify Calculations**: Keep shader math simple
   - Avoid complex trigonometry in every pixel
   - Precompute values when possible
   - Use lookup tables for repeated calculations

2. **Limit Texture Samples**: Each sample is expensive
   - Minimize blur radius
   - Use mipmaps for distant samples
   - Cache frequently sampled regions

3. **Conditional Execution**: Minimize branching
   - Use `smoothstep` instead of `if` statements
   - Blend values rather than choosing
   - Keep code path consistent

4. **Resolution Awareness**: Adapt to device
   ```swift
   let isHighPerformanceDevice = UIDevice.current.userInterfaceIdiom == .pad
   let blurSamples = isHighPerformanceDevice ? 20 : 10
   ```

5. **FPS Monitoring**: Test on real devices
   ```swift
   @State private var fps: Double = 60.0

   var body: some View {
       content
           .onReceive(NotificationCenter.default.publisher(
               for: UIApplication.didBecomeActiveNotification
           )) { _ in
               // Start FPS monitoring
               CADisplayLink.monitorFrameRate { fps in
                   self.fps = fps
               }
           }
   }
   ```

## Shader Resources

### Learning Metal Shaders
- **Metal by Example**: Practical Metal shader guide
- **The Book of Shaders**: GLSL fundamentals (translates to Metal)
- **Apple WWDC Sessions**: Official Metal shader workshops
- **Shadertoy**: Experiment with similar GLSL techniques

### Tools
- **Xcode Metal Debugger**: Profile shader performance
- **RenderDoc**: Capture and analyze frames
- **Metal System Trace**: Identify bottlenecks

### When to Use Custom Shaders

**Good candidates:**
- Unique ambient backgrounds
- Loading state animations
- Transition effects
- Glass/glassmorphism effects
- Particle systems
- Data visualizations

**Avoid shaders for:**
- Simple color changes (use CSS/SwiftUI)
- Basic animations (use native animations)
- Text rendering (performance issues)
- Simple gradients (native is better)
