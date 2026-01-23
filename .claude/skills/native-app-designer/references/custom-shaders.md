# Custom Shaders for Unique Effects

Deep reference for Metal shaders (iOS) and WebGL/GLSL (web) to create distinctive visual effects.

## iOS: Metal Shaders in SwiftUI

### Organic Blur Effect

```swift
struct OrganicBlurShader: View {
    var body: some View {
        TimelineView(.animation) { timeline in
            Canvas { context, size in
                let shader = ShaderLibrary.organicBlur(
                    .float(timeline.date.timeIntervalSinceReferenceDate),
                    .float2(size)
                )
                context.addFilter(.shader(shader))
                // Your content here
            }
        }
    }
}
```

### Metal Shader File (Shaders.metal)

```metal
#include <metal_stdlib>
using namespace metal;

[[ stitchable ]] half4 organicBlur(
    float2 position,
    float time,
    float2 size,
    half4 currentColor
) {
    // Flowing, organic blur based on Perlin noise
    float2 uv = position / size;

    // Animated noise
    float noise = fract(sin(dot(uv + time * 0.1, float2(12.9898, 78.233))) * 43758.5453);

    // Sample neighboring pixels with organic offset
    float2 offset = float2(
        cos(noise * 6.28) * 5.0,
        sin(noise * 6.28) * 5.0
    );

    // Return blurred color with organic movement
    return currentColor * (0.8 + noise * 0.4);
}
```

## Web: Custom WebGL Shaders

### Glass Effect with Three.js

```javascript
import * as THREE from 'three';

const GlassShader = {
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    uniform float time;
    uniform vec3 color;
    uniform float opacity;
    varying vec2 vUv;
    varying vec3 vNormal;

    void main() {
      // Fresnel effect
      float fresnel = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);

      // Animated distortion
      float distort = sin(vUv.y * 10.0 + time) * 0.05;
      vec2 distortedUV = vUv + vec2(distort, 0.0);

      // Glass color with depth
      vec3 glassColor = color * (0.5 + fresnel * 0.5);

      gl_FragColor = vec4(glassColor, opacity * (0.1 + fresnel * 0.3));
    }
  `,

  uniforms: {
    time: { value: 0 },
    color: { value: new THREE.Color(0x4facfe) },
    opacity: { value: 0.8 }
  }
};

// Use in your component
const mesh = new THREE.Mesh(
  geometry,
  new THREE.ShaderMaterial(GlassShader)
);
```

## Shader Ideas for Unique UI

### Organic Loading States

```glsl
// Flowing liquid loading indicator
float liquid = sin(uv.x * 3.0 + time * 2.0) * cos(uv.y * 3.0 + time * 1.5);
float loading = smoothstep(0.0, 1.0, liquid * 0.5 + 0.5);
```

### Morphing Gradients

```glsl
// Gradient that evolves based on interaction
vec3 gradient = mix(
  colorA,
  colorB,
  sin(time + length(uv - mousePos) * 5.0) * 0.5 + 0.5
);
```

### Depth-Aware Blur

```glsl
// Blur that respects visual hierarchy
float depth = texture2D(depthMap, uv).r;
float blur = mix(0.0, 10.0, depth);
```

### Particle Systems

```glsl
// Floating particles for ambient effect
vec2 particlePos = vec2(
  sin(time + id * 123.456) * 0.5,
  cos(time * 0.5 + id * 789.012) * 0.5
);
float particle = smoothstep(0.02, 0.0, length(uv - particlePos));
```

## Shader Resources & Learning

### Learn Shaders
- **The Book of Shaders**: Interactive shader tutorials
- **Shadertoy**: Community shader examples
- **Apple WWDC Metal Sessions**: Official Metal shader guides
- **WebGL Fundamentals**: Comprehensive WebGL/GLSL guide

### Shader Tools
- **Shadertoy**: Browser-based shader editor
- **ISF Editor**: Interactive Shader Format for real-time effects
- **RenderDoc**: Graphics debugging
- **Xcode Metal Debugger**: iOS shader debugging

### Performance Tips
- Keep shaders simple for mobile (&lt; 50 instructions)
- Avoid branching in fragment shaders
- Precompute values in vertex shader when possible
- Use texture lookups sparingly
- Test on actual devices, not just simulators

## When to Use Custom Shaders

**Use shaders for:**
- Unique ambient backgrounds
- Loading state animations
- Transition effects
- Glass/glassmorphism effects
- Particle systems
- Data visualizations

**Don't use shaders for:**
- Simple color changes (use CSS/SwiftUI)
- Basic animations (use native animations)
- Text rendering (performance issues)
- Simple gradients (native is better)
