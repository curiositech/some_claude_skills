---
title: GLSL Shaders for Audio Visualization
sidebar_label: GLSL Shaders for Audio Visu...
sidebar_position: 2
---
# GLSL Shaders for Audio Visualization

Custom shader implementations for audio-reactive effects.

---

## Basic Audio-Reactive Fragment Shader

```glsl
precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;
uniform sampler2D u_audioData;  // FFT as 1D texture
uniform float u_bass;
uniform float u_mid;
uniform float u_treble;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec2 center = uv - 0.5;

  // Audio-reactive radius
  float dist = length(center);
  float audioSample = texture2D(u_audioData, vec2(dist, 0.0)).r;

  // Psychedelic color cycling
  float hue = u_time * 0.1 + audioSample * 0.5;
  vec3 color = 0.5 + 0.5 * cos(6.28 * (hue + vec3(0.0, 0.33, 0.67)));

  // Pulsing glow based on bass
  float glow = smoothstep(0.5 - u_bass * 0.3, 0.0, dist);

  gl_FragColor = vec4(color * glow, 1.0);
}
```

---

## Tunnel Effect

```glsl
precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;
uniform float u_bass;
uniform float u_speed;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec2 center = uv - 0.5;

  // Convert to polar coordinates
  float angle = atan(center.y, center.x);
  float radius = length(center);

  // Tunnel distortion
  float tunnel = 0.1 / radius;

  // Scrolling texture coordinates
  float u = angle / 3.14159;
  float v = tunnel + u_time * u_speed + u_bass * 0.5;

  // Create stripe pattern
  float stripes = sin(u * 10.0) * sin(v * 20.0);
  stripes = smoothstep(0.0, 0.1, stripes);

  // Color based on depth
  vec3 color = vec3(0.2, 0.5, 1.0) * stripes;
  color *= 1.0 - radius * 1.5;  // Fade at edges

  gl_FragColor = vec4(color, 1.0);
}
```

---

## Plasma Effect

```glsl
precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;
uniform float u_bass;
uniform float u_mid;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;

  // Multiple sine waves
  float v1 = sin(uv.x * 10.0 + u_time);
  float v2 = sin(10.0 * (uv.x * sin(u_time / 2.0) + uv.y * cos(u_time / 3.0)) + u_time);

  float cx = uv.x + 0.5 * sin(u_time / 5.0);
  float cy = uv.y + 0.5 * cos(u_time / 3.0);
  float v3 = sin(sqrt(100.0 * (cx * cx + cy * cy) + 1.0) + u_time);

  float v = v1 + v2 + v3;

  // Audio modulation
  v *= 1.0 + u_bass * 0.5;

  // Color palette
  vec3 color;
  color.r = sin(v * 3.14159 + u_mid);
  color.g = sin(v * 3.14159 + 2.094 + u_mid);
  color.b = sin(v * 3.14159 + 4.188 + u_mid);
  color = color * 0.5 + 0.5;

  gl_FragColor = vec4(color, 1.0);
}
```

---

## Kaleidoscope Effect

```glsl
precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;
uniform sampler2D u_audioData;
uniform float u_bass;

#define PI 3.14159265359
#define SEGMENTS 8.0

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec2 center = uv - 0.5;

  // Convert to polar
  float angle = atan(center.y, center.x);
  float radius = length(center);

  // Kaleidoscope fold
  float segment = PI * 2.0 / SEGMENTS;
  angle = mod(angle, segment);
  if (mod(floor(atan(center.y, center.x) / segment), 2.0) == 1.0) {
    angle = segment - angle;
  }

  // Convert back to cartesian
  vec2 kaleido = vec2(cos(angle), sin(angle)) * radius;

  // Sample audio at radius
  float audio = texture2D(u_audioData, vec2(radius * 2.0, 0.0)).r;

  // Create pattern
  float pattern = sin(kaleido.x * 20.0 + u_time * 2.0);
  pattern *= sin(kaleido.y * 20.0 + u_time);
  pattern = pattern * 0.5 + 0.5;

  // Color
  vec3 color = vec3(pattern) * (audio + 0.2);
  color *= 0.5 + 0.5 * cos(6.28 * (u_time * 0.1 + vec3(0.0, 0.33, 0.67)));

  // Vignette
  color *= 1.0 - radius;

  gl_FragColor = vec4(color, 1.0);
}
```

---

## Spectrum Bars (Classic)

```glsl
precision mediump float;

uniform vec2 u_resolution;
uniform sampler2D u_audioData;
uniform float u_barCount;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;

  // Which bar are we in?
  float barIndex = floor(uv.x * u_barCount);
  float barCenter = (barIndex + 0.5) / u_barCount;

  // Sample audio at bar position
  float audio = texture2D(u_audioData, vec2(barCenter, 0.0)).r;

  // Bar shape
  float barWidth = 0.8 / u_barCount;
  float inBar = step(abs(uv.x - barCenter), barWidth * 0.5);

  // Height
  float barHeight = audio;
  float inHeight = step(uv.y, barHeight);

  // Color gradient (blue to red based on height)
  vec3 color = mix(vec3(0.2, 0.5, 1.0), vec3(1.0, 0.2, 0.5), uv.y);

  // Combine
  float alpha = inBar * inHeight;

  gl_FragColor = vec4(color * alpha, alpha);
}
```

---

## Waveform Display

```glsl
precision mediump float;

uniform vec2 u_resolution;
uniform sampler2D u_waveformData;
uniform float u_lineWidth;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;

  // Sample waveform
  float waveform = texture2D(u_waveformData, vec2(uv.x, 0.0)).r;
  waveform = waveform * 2.0 - 1.0;  // Convert from 0-1 to -1 to 1

  // Center the waveform
  float y = waveform * 0.4 + 0.5;

  // Distance from waveform line
  float dist = abs(uv.y - y);

  // Line with glow
  float line = smoothstep(u_lineWidth, 0.0, dist);
  float glow = smoothstep(u_lineWidth * 10.0, 0.0, dist) * 0.5;

  vec3 color = vec3(0.3, 1.0, 0.5) * (line + glow);

  gl_FragColor = vec4(color, 1.0);
}
```

---

## WebGL Shader Setup (TypeScript)

```typescript
function createShaderProgram(
  gl: WebGLRenderingContext,
  vertexSource: string,
  fragmentSource: string
): WebGLProgram {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

  const program = gl.createProgram()!;
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error('Shader program failed to link');
  }

  return program;
}

function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string
): WebGLShader {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    throw new Error(`Shader compilation error: $\{info\}`);
  }

  return shader;
}

// Basic vertex shader (fullscreen quad)
const VERTEX_SHADER = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

// Create fullscreen quad
function createFullscreenQuad(gl: WebGLRenderingContext): WebGLBuffer {
  const buffer = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
    gl.STATIC_DRAW
  );
  return buffer;
}
```
