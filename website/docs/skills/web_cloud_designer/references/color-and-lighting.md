---
title: Cloud Color and Lighting Guide
sidebar_label: Cloud Color and Lighting Guide
sidebar_position: 2
---
# Cloud Color and Lighting Guide

## Natural Cloud Colors

Clouds are never pure white. Their color depends on:
- Time of day (sun angle)
- Atmospheric conditions
- Cloud density
- Surrounding environment

### Base Cloud Colors by Condition

| Condition | Highlight | Mid-tone | Shadow | Example Hex |
|-----------|-----------|----------|--------|-------------|
| Midday sun | Pure white | Light gray | Blue-gray | #FFFFFF, #E8E8E8, #B8C4CE |
| Morning | Warm white | Cream | Soft purple | #FFF8F0, #FFE4CC, #D4C4D8 |
| Sunset | Orange-pink | Coral | Deep purple | #FFB366, #FF8C66, #6B4C7A |
| Overcast | Blue-white | Gray | Blue-gray | #E8EEF4, #C4CCD4, #8899AA |
| Storm | Gray-blue | Dark gray | Near black | #7A8999, #4A5568, #2D3748 |
| Night | Blue-gray | Dark blue | Deep navy | #4A5568, #2D3748, #1A202C |

### CSS Custom Properties System

```css
:root {
  /* Midday palette */
  --cloud-highlight: #FFFFFF;
  --cloud-mid: #E8E8E8;
  --cloud-shadow: #B8C4CE;
  --sky-top: #87CEEB;
  --sky-bottom: #E0F6FF;
}

[data-time="sunset"] {
  --cloud-highlight: #FFB366;
  --cloud-mid: #FF8C66;
  --cloud-shadow: #6B4C7A;
  --sky-top: #FF6B6B;
  --sky-bottom: #FFA07A;
}

[data-time="storm"] {
  --cloud-highlight: #7A8999;
  --cloud-mid: #4A5568;
  --cloud-shadow: #2D3748;
  --sky-top: #2C3E50;
  --sky-bottom: #34495E;
}

.cloud {
  background: linear-gradient(
    180deg,
    var(--cloud-highlight) 0%,
    var(--cloud-mid) 50%,
    var(--cloud-shadow) 100%
  );
}
```

## Sky Gradients

### Time of Day Gradients

```css
/* Dawn */
.sky-dawn {
  background: linear-gradient(180deg,
    #1a1a2e 0%,      /* Deep night at top */
    #4a3f6b 20%,     /* Purple transition */
    #f9a825 60%,     /* Golden horizon */
    #ffcc80 90%,     /* Warm glow */
    #fff3e0 100%     /* Bright horizon line */
  );
}

/* Midday */
.sky-midday {
  background: linear-gradient(180deg,
    #1565c0 0%,      /* Deep blue zenith */
    #42a5f5 30%,     /* Bright blue */
    #90caf9 60%,     /* Light blue */
    #e3f2fd 90%,     /* Pale blue horizon */
    #ffffff 100%     /* Hazy white */
  );
}

/* Sunset */
.sky-sunset {
  background: linear-gradient(180deg,
    #1a237e 0%,      /* Indigo top */
    #4527a0 15%,     /* Deep purple */
    #7b1fa2 30%,     /* Purple */
    #e91e63 50%,     /* Pink */
    #ff5722 70%,     /* Orange */
    #ffc107 90%,     /* Golden */
    #fff59d 100%     /* Yellow horizon */
  );
}

/* Night */
.sky-night {
  background: linear-gradient(180deg,
    #000428 0%,      /* Nearly black */
    #004e92 100%     /* Dark blue horizon */
  );
}

/* Overcast */
.sky-overcast {
  background: linear-gradient(180deg,
    #78909c 0%,      /* Gray-blue */
    #b0bec5 50%,     /* Light gray */
    #cfd8dc 100%     /* Pale gray */
  );
}
```

### Multi-Stop Realistic Sky

```css
.sky-realistic {
  background:
    /* Sun glow effect */
    radial-gradient(
      ellipse 80% 50% at 50% 100%,
      rgba(255, 200, 100, 0.3) 0%,
      transparent 50%
    ),
    /* Main sky gradient */
    linear-gradient(180deg,
      #0066cc 0%,
      #4da6ff 30%,
      #99ccff 60%,
      #e6f2ff 85%,
      #ffffff 100%
    );
}
```

## SVG Lighting Effects

### Diffuse Lighting for Volume

```xml
<filter id="volumetricCloud">
  <feTurbulence type="fractalNoise" baseFrequency="0.01"
                numOctaves="4" result="noise"/>

  <feDiffuseLighting in="noise" lighting-color="#FFF8F0"
                     surfaceScale="3" result="light">
    <feDistantLight azimuth="135" elevation="45"/>
  </feDiffuseLighting>

  <feComposite in="SourceGraphic" in2="light"
               operator="arithmetic" k1="1" k2="0" k3="0" k4="0"/>
</filter>
```

### Specular Highlights

```xml
<filter id="shinyCloud">
  <feTurbulence type="fractalNoise" baseFrequency="0.01"
                numOctaves="4" result="noise"/>

  <feSpecularLighting in="noise" specularConstant="1.5"
                      specularExponent="20" lighting-color="white"
                      result="specular">
    <feDistantLight azimuth="225" elevation="60"/>
  </feSpecularLighting>

  <feComposite in="SourceGraphic" in2="specular" operator="in"/>
</filter>
```

### Combined Diffuse + Specular

```xml
<filter id="realisticLighting">
  <feTurbulence type="fractalNoise" baseFrequency="0.01"
                numOctaves="4" result="noise"/>

  <!-- Diffuse for overall shading -->
  <feDiffuseLighting in="noise" surfaceScale="2"
                     lighting-color="#FFFEF0" result="diffuse">
    <feDistantLight azimuth="225" elevation="55"/>
  </feDiffuseLighting>

  <!-- Specular for highlights -->
  <feSpecularLighting in="noise" specularConstant="0.8"
                      specularExponent="30" result="specular">
    <feDistantLight azimuth="225" elevation="55"/>
  </feSpecularLighting>

  <!-- Combine -->
  <feComposite in="diffuse" in2="SourceGraphic" operator="in" result="lit"/>
  <feComposite in="specular" in2="lit" operator="arithmetic"
               k1="0" k2="1" k3="1" k4="0"/>
</filter>
```

## Sun Position and Lighting

### Azimuth Reference

```
         90 (top/north)
           |
180 (left) + 0/360 (right)
           |
        270 (bottom/south)
```

### Elevation Reference

```
90 = directly overhead (noon)
45 = typical afternoon
15 = near horizon (sunrise/sunset)
0 = at horizon
```

### Time-Based Lighting Presets

```javascript
const lightingPresets = {
  dawn: { azimuth: 90, elevation: 10, color: '#FFE4B5' },
  morning: { azimuth: 120, elevation: 30, color: '#FFF8DC' },
  noon: { azimuth: 180, elevation: 75, color: '#FFFFFF' },
  afternoon: { azimuth: 225, elevation: 45, color: '#FFFAF0' },
  sunset: { azimuth: 270, elevation: 15, color: '#FF8C00' },
  dusk: { azimuth: 270, elevation: 5, color: '#483D8B' },
  night: { azimuth: 270, elevation: -10, color: '#191970' },
};
```

## CSS Gradient Clouds (No SVG)

### Box-Shadow Layered Clouds

```css
.cloud-css {
  width: 200px;
  height: 80px;
  background: linear-gradient(
    180deg,
    var(--cloud-highlight) 0%,
    var(--cloud-mid) 60%,
    var(--cloud-shadow) 100%
  );
  border-radius: 100px;
  box-shadow:
    /* Inner highlights */
    inset -5px -5px 20px rgba(255,255,255,0.8),
    inset 5px 5px 15px rgba(0,0,0,0.05),
    /* Outer shadow */
    0 10px 30px rgba(0,0,0,0.1),
    /* Ground reflection (optional) */
    0 50px 50px -30px rgba(100,150,200,0.2);
}
```

### Radial Gradient Puffs

```css
.cloud-puff {
  width: 150px;
  height: 100px;
  background:
    radial-gradient(circle at 30% 30%, white 0%, transparent 60%),
    radial-gradient(circle at 70% 40%, white 0%, transparent 50%),
    radial-gradient(circle at 50% 60%, white 0%, transparent 70%),
    radial-gradient(circle at 20% 70%, rgba(200,220,240,0.8) 0%, transparent 60%);
  filter: blur(5px);
}
```

## Color Transitions

### Smooth Time Transition

```javascript
function interpolateColor(color1, color2, factor) {
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);

  const r = Math.round(c1.r + (c2.r - c1.r) * factor);
  const g = Math.round(c1.g + (c2.g - c1.g) * factor);
  const b = Math.round(c1.b + (c2.b - c1.b) * factor);

  return rgbToHex(r, g, b);
}

function updateSkyColors(hour) {
  // hour is 0-24
  const timeOfDay = hour / 24;

  // Define color stops
  const stops = [
    { time: 0, sky: '#000428', cloud: '#2D3748' },
    { time: 0.25, sky: '#FF6B6B', cloud: '#FFB366' }, // 6am
    { time: 0.5, sky: '#87CEEB', cloud: '#FFFFFF' },  // noon
    { time: 0.75, sky: '#FF6B6B', cloud: '#FF8C66' }, // 6pm
    { time: 1, sky: '#000428', cloud: '#2D3748' },
  ];

  // Find surrounding stops and interpolate
  // ... implementation
}
```

### CSS Animation for Day Cycle

```css
@keyframes dayNightCycle {
  0%, 100% { /* Midnight */
    --sky-top: #000428;
    --sky-bottom: #004e92;
    --cloud-color: #2D3748;
  }
  25% { /* Dawn */
    --sky-top: #FF6B6B;
    --sky-bottom: #FFA07A;
    --cloud-color: #FFB366;
  }
  50% { /* Noon */
    --sky-top: #87CEEB;
    --sky-bottom: #E0F6FF;
    --cloud-color: #FFFFFF;
  }
  75% { /* Dusk */
    --sky-top: #4527a0;
    --sky-bottom: #ff5722;
    --cloud-color: #FF8C66;
  }
}

.sky {
  animation: dayNightCycle 60s linear infinite;
  background: linear-gradient(
    180deg,
    var(--sky-top),
    var(--sky-bottom)
  );
}
```

## Atmospheric Effects

### Haze/Fog Layer

```css
.atmosphere-haze {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    transparent 0%,
    transparent 60%,
    rgba(200, 220, 255, 0.3) 80%,
    rgba(200, 220, 255, 0.6) 100%
  );
  pointer-events: none;
}
```

### Distance Fog on Clouds

```css
.cloud-distant {
  filter:
    url(#cloudFilter)
    brightness(1.1)
    contrast(0.9)
    saturate(0.8);
  opacity: 0.7;
}

.cloud-mid {
  filter: url(#cloudFilter);
}

.cloud-close {
  filter:
    url(#cloudFilter)
    brightness(0.95)
    contrast(1.1);
}
```

## Color Accessibility

### Ensure Readable Text Over Clouds

```css
.text-over-clouds {
  /* Dark text with subtle shadow */
  color: #1a1a1a;
  text-shadow:
    0 1px 2px rgba(255,255,255,0.8),
    0 0 20px rgba(255,255,255,0.6);
}

/* Or use backdrop */
.text-backdrop {
  backdrop-filter: blur(10px) brightness(1.2);
  background: rgba(255,255,255,0.3);
  padding: 1rem 2rem;
  border-radius: 8px;
}
```

### Contrast Ratios

Minimum contrast for text over cloud backgrounds:

| Text Size | Minimum Ratio | Recommended |
|-----------|---------------|-------------|
| Body (16px) | 4.5:1 | 7:1 |
| Large (24px+) | 3:1 | 4.5:1 |
| UI elements | 3:1 | 4.5:1 |

Use a contrast checker tool when placing text over variable cloud backgrounds.
