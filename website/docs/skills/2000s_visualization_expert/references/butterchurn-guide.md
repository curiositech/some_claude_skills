---
title: Butterchurn Integration Guide
sidebar_label: Butterchurn Integration Guide
sidebar_position: 1
---
# Butterchurn Integration Guide

Complete guide to implementing Milkdrop-style visualizations with Butterchurn.

---

## Basic Setup

```typescript
import butterchurn from 'butterchurn';
import butterchurnPresets from 'butterchurn-presets';

// Setup
const visualizer = butterchurn.createVisualizer(audioContext, canvas, {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: window.devicePixelRatio || 1,
  textureRatio: 1,  // Lower for performance
});

// Connect audio source
visualizer.connectAudio(audioNode);  // Can be MediaElementSource, Oscillator, etc.

// Load preset
const presets = butterchurnPresets.getPresets();
const presetKeys = Object.keys(presets);
visualizer.loadPreset(presets[presetKeys[0]], 2.0);  // 2 second blend

// Render loop
function render() {
  visualizer.render();
  requestAnimationFrame(render);
}
render();
```

---

## Preset Recommendations

### Psychedelic/Trippy
- `Flexi, martin + geiss - dedicated to the sherwin maxawow`
- `Rovastar - Fractopia`
- `Unchained - Unified Drag`
- `Zylot - Psychedelic Flower`
- `martin - acid warp`

### Smooth/Chill
- `Flexi - predator-prey-spirals`
- `Geiss - Cosmic Strings 2`
- `Martin - liquid science`
- `Rovastar - Harlequin's Fruit Salad`
- `shifter - liquid glass`

### High Energy
- `Flexi + Martin - disconnected`
- `shifter - tumbling cubes`
- `Zylot - Clouds (Tunnel Mix)`
- `martin - fire storm`
- `Unchained - Demon's Gate`

### Minimal/Clean
- `Geiss - Explosion 3`
- `Martin - Acid Warp Simple`
- `Rovastar - Twilight`

---

## Preset Blending

```typescript
class PresetManager {
  private visualizer: any;
  private presets: Record<string, any>;
  private presetKeys: string[];
  private currentIndex: number = 0;
  private blendTime: number = 2.0;

  constructor(visualizer: any) {
    this.visualizer = visualizer;
    this.presets = butterchurnPresets.getPresets();
    this.presetKeys = Object.keys(this.presets);
  }

  next() {
    this.currentIndex = (this.currentIndex + 1) % this.presetKeys.length;
    this.load(this.presetKeys[this.currentIndex]);
  }

  previous() {
    this.currentIndex = (this.currentIndex - 1 + this.presetKeys.length) % this.presetKeys.length;
    this.load(this.presetKeys[this.currentIndex]);
  }

  random() {
    const randomIndex = Math.floor(Math.random() * this.presetKeys.length);
    this.currentIndex = randomIndex;
    this.load(this.presetKeys[randomIndex]);
  }

  load(presetName: string, blendTime?: number) {
    const preset = this.presets[presetName];
    if (preset) {
      this.visualizer.loadPreset(preset, blendTime ?? this.blendTime);
    }
  }

  // Auto-advance every N seconds
  startAutoAdvance(intervalSeconds: number = 30) {
    return setInterval(() => this.random(), intervalSeconds * 1000);
  }
}
```

---

## Full-Screen Setup

```typescript
function setupFullscreen(canvas: HTMLCanvasElement, visualizer: any) {
  // Handle resize
  function handleResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;
    canvas.style.width = `$\{width\}px`;
    canvas.style.height = `$\{height\}px`;

    visualizer.setRendererSize(width, height);
  }

  window.addEventListener('resize', handleResize);
  handleResize();

  // Full-screen toggle
  async function toggleFullscreen() {
    if (!document.fullscreenElement) {
      await canvas.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  }

  canvas.addEventListener('dblclick', toggleFullscreen);

  // Hide cursor after inactivity
  let cursorTimeout: number;
  document.addEventListener('mousemove', () => {
    document.body.style.cursor = 'default';
    clearTimeout(cursorTimeout);
    cursorTimeout = window.setTimeout(() => {
      document.body.style.cursor = 'none';
    }, 3000);
  });

  return { handleResize, toggleFullscreen };
}
```

---

## Performance Optimization

### Lower texture ratio for older GPUs
```typescript
const visualizer = butterchurn.createVisualizer(audioContext, canvas, {
  width: window.innerWidth,
  height: window.innerHeight,
  textureRatio: 0.5,  // Half resolution for textures
});
```

### Reduce fftSize if not needed
```typescript
analyserNode.fftSize = 512;  // 256, 512, 1024, 2048 (default)
```

### CSS Performance Hints
```css
canvas.visualizer {
  will-change: transform;
  contain: strict;
}
```

### Profile with Chrome DevTools
1. Open DevTools → Performance tab
2. Enable GPU timeline
3. Record during visualization
4. Look for dropped frames, GPU memory spikes

---

## Cleanup Pattern

```typescript
class VisualizerController {
  private animationId: number | null = null;
  private visualizer: any;
  private autoAdvanceInterval: number | null = null;

  start() {
    const render = () => {
      this.visualizer.render();
      this.animationId = requestAnimationFrame(render);
    };
    render();
  }

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    if (this.autoAdvanceInterval) {
      clearInterval(this.autoAdvanceInterval);
      this.autoAdvanceInterval = null;
    }
  }

  destroy() {
    this.stop();
    // Additional cleanup if needed
  }
}
```

---

## React Hook

```typescript
import { useEffect, useRef, useCallback } from 'react';
import butterchurn from 'butterchurn';
import butterchurnPresets from 'butterchurn-presets';

export function useButterchurn(audioContext: AudioContext | null, audioNode: AudioNode | null) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const visualizerRef = useRef<any>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!canvasRef.current || !audioContext || !audioNode) return;

    const canvas = canvasRef.current;
    const visualizer = butterchurn.createVisualizer(audioContext, canvas, {
      width: canvas.width,
      height: canvas.height,
      pixelRatio: window.devicePixelRatio || 1,
    });

    visualizer.connectAudio(audioNode);
    visualizerRef.current = visualizer;

    // Load initial preset
    const presets = butterchurnPresets.getPresets();
    const keys = Object.keys(presets);
    visualizer.loadPreset(presets[keys[0]], 0);

    // Render loop
    const render = () => {
      visualizer.render();
      animationRef.current = requestAnimationFrame(render);
    };
    render();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audioContext, audioNode]);

  const loadPreset = useCallback((presetName: string, blendTime = 2.0) => {
    const presets = butterchurnPresets.getPresets();
    if (visualizerRef.current && presets[presetName]) {
      visualizerRef.current.loadPreset(presets[presetName], blendTime);
    }
  }, []);

  return { canvasRef, loadPreset };
}
```
