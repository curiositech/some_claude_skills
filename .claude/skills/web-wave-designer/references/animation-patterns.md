# Animation Patterns for Water Effects

## Animation Strategy Overview

Different animation techniques have dramatically different performance profiles:

| Technique | Performance | Smoothness | Control | Best For |
|-----------|-------------|------------|---------|----------|
| CSS Transform | Excellent | 60fps | Limited | Layer movement |
| CSS Opacity | Excellent | 60fps | Limited | Fade effects |
| requestAnimationFrame | Good | 60fps | Full | Filter param animation |
| SVG animate | Poor | 30-45fps | Declarative | Simple, set-and-forget |
| CSS filter animation | Poor | 30fps | Limited | Avoid |

## CSS Transform Animations (Recommended)

Move the water element, not the filter. GPU-accelerated, smooth performance.

### Basic Wave Drift

```css
.wave-layer {
  width: 200%;  /* Double width for seamless loop */
  animation: wave-drift 60s linear infinite;
  will-change: transform;  /* GPU hint */
}

@keyframes wave-drift {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }  /* Half of doubled width */
}
```

### Multi-Axis Wave Motion

```css
.wave {
  animation:
    wave-drift 60s linear infinite,
    wave-bob 4s ease-in-out infinite;
}

@keyframes wave-drift {
  from { transform: translateX(0) translateY(0); }
  to { transform: translateX(-50%) translateY(0); }
}

@keyframes wave-bob {
  0%, 100% { transform: translateX(var(--x, 0)) translateY(0); }
  50% { transform: translateX(var(--x, 0)) translateY(-5px); }
}
```

### Layer Speed Differentiation

```css
.wave-back {
  animation: wave-drift 90s linear infinite;  /* Slow - appears far */
}

.wave-mid {
  animation: wave-drift 60s linear infinite;  /* Medium */
  animation-delay: -15s;  /* Offset start */
}

.wave-front {
  animation: wave-drift 35s linear infinite;  /* Fast - appears close */
  animation-delay: -25s;
}
```

### Parallax on Scroll

```javascript
let ticking = false;

window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      const scrollY = window.scrollY;
      document.querySelectorAll('.wave').forEach((wave, i) => {
        const speed = 0.1 + (i * 0.05);  // Different speed per layer
        wave.style.transform = `translateY(${scrollY * speed}px)`;
      });
      ticking = false;
    });
    ticking = true;
  }
});
```

## requestAnimationFrame Animation (Best Control)

For animating filter parameters, rAF provides smooth updates:

### Basic Wave Animation

```javascript
const turbulence = document.querySelector('#waterFilter feTurbulence');
let frame = 0;

function animateWater() {
  frame += 0.003;

  // Sine wave for smooth oscillation
  const xFreq = 0.008 + Math.sin(frame) * 0.002;
  const yFreq = 0.08 + Math.sin(frame * 0.7) * 0.01;

  turbulence.setAttribute('baseFrequency', `${xFreq} ${yFreq}`);

  requestAnimationFrame(animateWater);
}

animateWater();
```

### Complex Multi-Parameter Animation

```javascript
class WaterAnimator {
  constructor(filterId) {
    this.filter = document.getElementById(filterId);
    this.turbulence = this.filter.querySelector('feTurbulence');
    this.displacement = this.filter.querySelector('feDisplacementMap');

    this.frame = 0;
    this.baseX = 0.008;
    this.baseY = 0.08;
    this.baseScale = 25;

    this.animate = this.animate.bind(this);
  }

  animate() {
    this.frame += 0.004;

    // Wave frequency oscillation
    const xFreq = this.baseX + Math.sin(this.frame) * 0.002;
    const yFreq = this.baseY + Math.sin(this.frame * 0.7) * 0.01;
    this.turbulence.setAttribute('baseFrequency', `${xFreq} ${yFreq}`);

    // Displacement scale breathing
    const scale = this.baseScale + Math.sin(this.frame * 0.5) * 5;
    this.displacement.setAttribute('scale', scale);

    requestAnimationFrame(this.animate);
  }

  start() {
    requestAnimationFrame(this.animate);
  }

  setIntensity(level) {
    // 0-1 scale
    this.baseScale = 15 + (level * 20);
    this.baseY = 0.05 + (level * 0.05);
  }
}

const water = new WaterAnimator('oceanFilter');
water.start();
```

### Performance-Aware Animation

```javascript
class AdaptiveWaterAnimator {
  constructor(filterId) {
    this.turbulence = document.querySelector(`#${filterId} feTurbulence`);
    this.frame = 0;
    this.fps = 60;
    this.lastFrameTime = performance.now();
    this.frameCount = 0;

    this.animate = this.animate.bind(this);
  }

  measureFPS() {
    const now = performance.now();
    const delta = now - this.lastFrameTime;

    if (delta >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastFrameTime = now;

      // Adapt quality based on FPS
      if (this.fps < 30) {
        this.reduceQuality();
      } else if (this.fps > 55) {
        this.increaseQuality();
      }
    }
    this.frameCount++;
  }

  reduceQuality() {
    const currentOctaves = parseInt(this.turbulence.getAttribute('numOctaves'));
    if (currentOctaves > 2) {
      this.turbulence.setAttribute('numOctaves', currentOctaves - 1);
      console.log('Water quality reduced to', currentOctaves - 1, 'octaves');
    }
  }

  increaseQuality() {
    const currentOctaves = parseInt(this.turbulence.getAttribute('numOctaves'));
    if (currentOctaves < 4) {
      this.turbulence.setAttribute('numOctaves', currentOctaves + 1);
    }
  }

  animate() {
    this.measureFPS();
    this.frame += 0.003;

    const xFreq = 0.008 + Math.sin(this.frame) * 0.002;
    const yFreq = 0.08 + Math.sin(this.frame * 0.7) * 0.01;
    this.turbulence.setAttribute('baseFrequency', `${xFreq} ${yFreq}`);

    requestAnimationFrame(this.animate);
  }
}
```

## SVG animate (Declarative, Use Sparingly)

**Warning**: animating filter parameters via SVG animate causes full filter recalculation every frame. Use only when necessary.

### Basic baseFrequency Animation

```xml
<feTurbulence type="turbulence" baseFrequency="0.008 0.08" numOctaves="3">
  <animate
    attributeName="baseFrequency"
    dur="60s"
    keyTimes="0;0.5;1"
    values="0.008 0.08;0.012 0.12;0.008 0.08"
    repeatCount="indefinite"
    calcMode="spline"
    keySplines="0.4 0 0.6 1;0.4 0 0.6 1"
  />
</feTurbulence>
```

### Seed Animation (Lower Cost)

Animating seed is less expensive than baseFrequency:

```xml
<feTurbulence type="turbulence" baseFrequency="0.01 0.1" seed="1">
  <animate
    attributeName="seed"
    dur="30s"
    values="1;10;20;30;40;30;20;10;1"
    repeatCount="indefinite"
  />
</feTurbulence>
```

### Multiple Synchronized Animations

```xml
<filter id="syncedWater">
  <feTurbulence type="turbulence" baseFrequency="0.01 0.1" result="waves">
    <animate
      attributeName="baseFrequency"
      dur="30s"
      values="0.008 0.08;0.012 0.12;0.008 0.08"
      repeatCount="indefinite"
    />
  </feTurbulence>

  <feDisplacementMap in="SourceGraphic" in2="waves" scale="25">
    <animate
      attributeName="scale"
      dur="30s"
      values="25;35;25"
      repeatCount="indefinite"
    />
  </feDisplacementMap>
</filter>
```

## GSAP Integration (Best of Both Worlds)

```javascript
// Install: npm install gsap

import { gsap } from 'gsap';

// Smooth filter animation
gsap.to('#waterFilter feTurbulence', {
  attr: {
    baseFrequency: '0.012 0.12'
  },
  duration: 10,
  ease: 'sine.inOut',
  yoyo: true,
  repeat: -1
});

// Layer movement
gsap.to('.wave-layer', {
  x: '-50%',
  duration: 60,
  ease: 'none',
  repeat: -1
});

// Interactive water response
document.addEventListener('mousemove', (e) => {
  const intensity = e.clientY / window.innerHeight;

  gsap.to('#waterFilter feDisplacementMap', {
    attr: { scale: 15 + (intensity * 20) },
    duration: 0.5,
    ease: 'power2.out'
  });
});
```

## Interactive Animations

### Mouse Ripple Effect

```javascript
class RippleEffect {
  constructor(container) {
    this.container = container;
    this.ripples = [];

    container.addEventListener('click', (e) => this.addRipple(e));
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  addRipple(event) {
    const rect = this.container.getBoundingClientRect();
    const ripple = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      radius: 0,
      maxRadius: 200,
      opacity: 1,
      speed: 3
    };
    this.ripples.push(ripple);
  }

  animate() {
    this.ripples = this.ripples.filter(ripple => {
      ripple.radius += ripple.speed;
      ripple.opacity = 1 - (ripple.radius / ripple.maxRadius);
      return ripple.opacity > 0;
    });

    this.render();
    requestAnimationFrame(this.animate);
  }

  render() {
    // Update displacement based on active ripples
    const displacement = document.querySelector('#rippleFilter feDisplacementMap');
    const totalIntensity = this.ripples.reduce((sum, r) => sum + r.opacity * 10, 0);
    displacement.setAttribute('scale', 20 + totalIntensity);
  }
}
```

### Scroll-Driven Water Intensity

```javascript
function setupScrollWater() {
  const turbulence = document.querySelector('#waterFilter feTurbulence');
  const displacement = document.querySelector('#waterFilter feDisplacementMap');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const ratio = entry.intersectionRatio;

      // More visible = calmer water
      const xFreq = 0.008 + (1 - ratio) * 0.004;
      const yFreq = 0.08 + (1 - ratio) * 0.04;
      const scale = 20 + (1 - ratio) * 15;

      turbulence.setAttribute('baseFrequency', `${xFreq} ${yFreq}`);
      displacement.setAttribute('scale', scale);
    });
  }, { threshold: Array.from({ length: 20 }, (_, i) => i / 20) });

  observer.observe(document.querySelector('.water-section'));
}
```

## Reduced Motion Support

Always respect user preferences:

```css
@media (prefers-reduced-motion: reduce) {
  .wave-layer {
    animation: none !important;
  }

  .water-effect {
    /* Use static water texture instead */
    filter: url(#staticWater);
  }
}
```

```javascript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function setupWaterAnimation() {
  if (prefersReducedMotion.matches) {
    // Static water - no animation
    return;
  }

  // Full animation
  const animator = new WaterAnimator('waterFilter');
  animator.start();
}

// Listen for preference changes
prefersReducedMotion.addEventListener('change', () => {
  location.reload();  // or dynamically toggle
});
```

## Animation Timing Functions

### Easing for Natural Motion

```css
/* Linear - mechanical, constant speed */
animation-timing-function: linear;

/* Sine - smooth, natural oscillation (best for waves) */
animation-timing-function: cubic-bezier(0.37, 0, 0.63, 1);

/* Ease-in-out - gentle acceleration/deceleration */
animation-timing-function: ease-in-out;

/* Custom wave easing */
animation-timing-function: cubic-bezier(0.45, 0.05, 0.55, 0.95);
```

### Multi-Wave Timing

```css
.wave-1 {
  animation: drift 60s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.wave-2 {
  animation: drift 55s cubic-bezier(0.3, 0, 0.7, 1) infinite;
  animation-delay: -20s;
}

.wave-3 {
  animation: drift 45s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  animation-delay: -35s;
}
```

## Performance Monitoring

```javascript
class WaterPerformanceMonitor {
  constructor() {
    this.samples = [];
    this.maxSamples = 60;
  }

  recordFrame(duration) {
    this.samples.push(duration);
    if (this.samples.length > this.maxSamples) {
      this.samples.shift();
    }
  }

  getAverageFPS() {
    if (this.samples.length === 0) return 60;
    const avg = this.samples.reduce((a, b) => a + b) / this.samples.length;
    return Math.round(1000 / avg);
  }

  shouldReduceQuality() {
    return this.getAverageFPS() < 30;
  }

  shouldIncreaseQuality() {
    return this.getAverageFPS() > 55;
  }
}

// Usage
const monitor = new WaterPerformanceMonitor();
let lastTime = performance.now();

function animate() {
  const now = performance.now();
  monitor.recordFrame(now - lastTime);
  lastTime = now;

  if (monitor.shouldReduceQuality()) {
    // Reduce octaves, scale, or animation complexity
  }

  // ... animation code ...

  requestAnimationFrame(animate);
}
```
