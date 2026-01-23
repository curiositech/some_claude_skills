# Cloud Animation Patterns

## Animation Philosophy

Clouds should move:
- **Slowly** - Real clouds drift at 10-30 mph, barely perceptible
- **Continuously** - No stops, no sudden direction changes
- **Independently** - Each layer at different speeds
- **Naturally** - Slight variations, not mechanical

## CSS Animation Patterns

### Basic Drift

```css
@keyframes drift-right {
  from { transform: translateX(-100%); }
  to { transform: translateX(100vw); }
}

.cloud {
  animation: drift-right 80s linear infinite;
}
```

Duration guide:
- Distant clouds: 90-120s
- Mid-layer: 50-80s
- Close clouds: 30-50s

### Seamless Loop

For continuous coverage without gaps:

```css
.cloud-track {
  width: 200%; /* Double width */
  background: url('cloud-pattern.svg') repeat-x;
  animation: scroll 60s linear infinite;
}

@keyframes scroll {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
```

### Subtle Vertical Float

```css
@keyframes float {
  0%, 100% { transform: translateY(0) translateX(var(--drift)); }
  50% { transform: translateY(-20px) translateX(calc(var(--drift) + 10%)); }
}

.cloud {
  --drift: 0%;
  animation: float 30s ease-in-out infinite;
}
```

### Morphing Shape (CSS Only)

```css
@keyframes morph {
  0% {
    border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
    transform: rotate(0deg);
  }
  25% {
    border-radius: 50% 50% 40% 60% / 40% 50% 50% 60%;
  }
  50% {
    border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%;
    transform: rotate(2deg);
  }
  75% {
    border-radius: 40% 50% 60% 50% / 60% 40% 50% 50%;
  }
  100% {
    border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
    transform: rotate(0deg);
  }
}

.cloud {
  animation:
    drift-right 80s linear infinite,
    morph 20s ease-in-out infinite;
}
```

### Scale Breathing

```css
@keyframes breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.cloud {
  animation: breathe 15s ease-in-out infinite;
}
```

## Parallax Scroll Patterns

### CSS Perspective Parallax

```css
.sky-container {
  perspective: 1000px;
  perspective-origin: center center;
  overflow: hidden;
}

.cloud-layer {
  transform-style: preserve-3d;
}

.cloud-distant {
  transform: translateZ(-500px) scale(1.5);
}

.cloud-mid {
  transform: translateZ(-200px) scale(1.2);
}

.cloud-close {
  transform: translateZ(0);
}
```

### JavaScript Scroll Parallax

```javascript
const layers = [
  { el: '.cloud-back', speed: 0.2 },
  { el: '.cloud-mid', speed: 0.5 },
  { el: '.cloud-front', speed: 0.8 },
];

window.addEventListener('scroll', () => {
  const scrollY = window.pageYOffset;

  layers.forEach(layer => {
    const el = document.querySelector(layer.el);
    el.style.transform = `translateY(${scrollY * layer.speed}px)`;
  });
});
```

### Intersection Observer Trigger

```javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate');
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.cloud').forEach(cloud => {
  observer.observe(cloud);
});
```

## SVG Animate Patterns

### Morphing baseFrequency (Use Sparingly)

```xml
<feTurbulence baseFrequency="0.01">
  <animate
    attributeName="baseFrequency"
    values="0.008;0.012;0.01;0.008"
    dur="30s"
    repeatCount="indefinite"
    calcMode="spline"
    keySplines="0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1"
  />
</feTurbulence>
```

**Warning**: Very CPU intensive. Use only for hero sections.

### Animating Seed (Not Recommended)

Changing seed causes a full filter recalculation. Instead, cross-fade between elements with different seeds.

### Lighting Animation

```xml
<feDistantLight azimuth="0" elevation="45">
  <animate
    attributeName="azimuth"
    values="0;360"
    dur="120s"
    repeatCount="indefinite"
  />
</feDistantLight>
```

This simulates sun movement and is less expensive than turbulence animation.

## GSAP Patterns

### Timeline-Based Cloud Scene

```javascript
const tl = gsap.timeline({ repeat: -1 });

// Layer 1: Slow distant clouds
tl.to('.cloud-back', {
  x: '100vw',
  duration: 120,
  ease: 'none',
}, 0);

// Layer 2: Medium speed
tl.to('.cloud-mid', {
  x: '100vw',
  duration: 80,
  ease: 'none',
}, 0);

// Layer 3: Faster foreground
tl.to('.cloud-front', {
  x: '100vw',
  duration: 50,
  ease: 'none',
}, 0);
```

### Physics-Based Drift

```javascript
gsap.to('.cloud', {
  x: '100vw',
  duration: 60,
  ease: 'power1.inOut',
  modifiers: {
    x: gsap.utils.unitize(x => {
      // Add subtle sine wave to path
      const progress = parseFloat(x) / window.innerWidth;
      const wave = Math.sin(progress * Math.PI * 2) * 20;
      return parseFloat(x) + wave;
    })
  },
  repeat: -1,
});
```

### Interactive Wind Effect

```javascript
let windStrength = 0;

document.addEventListener('mousemove', (e) => {
  windStrength = (e.clientX / window.innerWidth - 0.5) * 2;
});

gsap.ticker.add(() => {
  gsap.to('.cloud', {
    x: `+=${windStrength * 2}`,
    duration: 0.5,
    overwrite: 'auto',
  });
});
```

## Weather Transition Patterns

### Clear to Cloudy

```javascript
function transitionToCloudy() {
  gsap.timeline()
    .to('.cloud', {
      opacity: 1,
      scale: 1,
      stagger: 0.5,
      duration: 2,
      ease: 'power2.out',
    })
    .to('.sky', {
      background: 'linear-gradient(180deg, #87CEEB 0%, #B0C4DE 100%)',
      duration: 3,
    }, '-=1');
}
```

### Storm Buildup

```javascript
function buildStorm() {
  const tl = gsap.timeline();

  // Darken sky
  tl.to('.sky', {
    background: 'linear-gradient(180deg, #2c3e50 0%, #34495e 100%)',
    duration: 5,
  });

  // Speed up clouds
  tl.to('.cloud', {
    timeScale: 3,
    duration: 2,
  }, '-=3');

  // Increase turbulence (if using SVG animate)
  tl.to('.storm-filter feTurbulence', {
    attr: { numOctaves: 5 },
    duration: 3,
  }, '-=2');

  // Flash effect
  tl.to('.lightning', {
    opacity: 1,
    duration: 0.1,
    repeat: 3,
    repeatDelay: 2,
  });

  return tl;
}
```

## Performance-Optimized Patterns

### RequestAnimationFrame Loop

```javascript
let cloudX = -200;
const speed = 0.5; // pixels per frame

function animateClouds() {
  cloudX += speed;

  if (cloudX > window.innerWidth + 200) {
    cloudX = -200;
  }

  clouds.forEach((cloud, i) => {
    const offset = i * 100;
    cloud.style.transform = `translateX(${cloudX + offset}px)`;
  });

  requestAnimationFrame(animateClouds);
}

requestAnimationFrame(animateClouds);
```

### CSS Variables for Dynamic Control

```css
.cloud {
  --speed: 80s;
  --delay: 0s;
  animation: drift var(--speed) linear var(--delay) infinite;
}
```

```javascript
// Control from JavaScript without forcing reflow
document.querySelectorAll('.cloud').forEach((cloud, i) => {
  cloud.style.setProperty('--speed', `${60 + i * 20}s`);
  cloud.style.setProperty('--delay', `${-i * 15}s`);
});
```

### Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  .cloud {
    animation: none;
    /* Static position */
    transform: translateX(20vw);
  }

  .cloud:nth-child(2) { transform: translateX(50vw); }
  .cloud:nth-child(3) { transform: translateX(80vw); }
}
```

```javascript
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

if (prefersReducedMotion) {
  gsap.globalTimeline.pause();
}
```

## Timing Functions Reference

| Easing | Use Case |
|--------|----------|
| `linear` | Continuous drift |
| `ease-in-out` | Floating, breathing |
| `power1.inOut` | Gentle acceleration |
| `sine.inOut` | Very smooth, natural |
| `elastic.out` | Bouncy cloud appear |
| `back.out` | Overshoot entrance |

## Frame Rate Considerations

Target frame rates by animation type:

| Animation | Target FPS | Acceptable FPS |
|-----------|------------|----------------|
| CSS transform | 60 | 45 |
| SVG animate on transform | 60 | 45 |
| SVG animate on filter | 30 | 24 |
| Filter + transform | 45 | 30 |

If dropping below acceptable FPS:
1. Reduce numOctaves
2. Remove SVG filter animation
3. Use CSS-only clouds
4. Reduce layer count
