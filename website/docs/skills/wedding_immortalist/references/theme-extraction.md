---
title: Wedding Theme Extraction & Design System
sidebar_label: Wedding Theme Extraction & ...
sidebar_position: 3
---
# Wedding Theme Extraction & Design System

## Overview

Every wedding has a unique aesthetic identity. This system extracts that identity from photos and generates a cohesive design system for the digital experience.

## Theme Detection Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                  THEME EXTRACTION PIPELINE                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. COLOR EXTRACTION     2. STYLE CLASSIFICATION                 │
│  ├─ Dominant colors      ├─ Era detection (70s, modern, etc.)   │
│  ├─ Palette clustering   ├─ Formality level                     │
│  └─ Accent identification└─ Cultural markers                    │
│                                                                  │
│  3. TYPOGRAPHY MATCH     4. UI GENERATION                        │
│  ├─ Era-appropriate      ├─ Component theming                   │
│  ├─ Mood-aligned         ├─ Gradient definitions                │
│  └─ Readability check    └─ Animation style                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Color Extraction

### Dominant Color Analysis

```python
import cv2
import numpy as np
from sklearn.cluster import KMeans
from collections import Counter
from colorthief import ColorThief

def extract_wedding_palette(images: list, n_colors: int = 6):
    """
    Extract dominant color palette from wedding photos.

    Strategy:
    1. Sample from key photo categories (venue, florals, attire, decor)
    2. Weight certain areas higher (florals > background)
    3. Cluster into cohesive palette
    """
    all_colors = []

    for img_path in images:
        # Extract using ColorThief (fast, quality-focused)
        thief = ColorThief(img_path)
        palette = thief.get_palette(color_count=6, quality=1)
        all_colors.extend(palette)

    # Cluster all extracted colors
    colors_array = np.array(all_colors)
    kmeans = KMeans(n_clusters=n_colors, random_state=42)
    kmeans.fit(colors_array)

    # Sort by frequency
    labels = kmeans.labels_
    label_counts = Counter(labels)
    sorted_labels = sorted(label_counts.keys(), key=lambda x: label_counts[x], reverse=True)

    palette = []
    for label in sorted_labels:
        rgb = kmeans.cluster_centers_[label].astype(int)
        palette.append({
            'rgb': tuple(rgb),
            'hex': '#{:02x}{:02x}{:02x}'.format(*rgb),
            'frequency': label_counts[label] / len(labels)
        })

    return palette

def categorize_palette_roles(palette: list) -> dict:
    """
    Assign semantic roles to extracted colors.

    Roles:
    - primary: Main brand/theme color
    - secondary: Complementary accent
    - background: Light/neutral base
    - text: Dark/readable color
    - accent: Pop of color for CTAs
    - highlight: Subtle emphasis
    """
    from colormath.color_objects import sRGBColor, LabColor
    from colormath.color_conversions import convert_color

    roles = {}
    remaining = list(palette)

    # Find lightest for background
    remaining.sort(key=lambda c: sum(c['rgb']))
    roles['background'] = remaining.pop()

    # Find darkest for text
    remaining.sort(key=lambda c: sum(c['rgb']), reverse=True)
    roles['text'] = remaining.pop()

    # Most frequent remaining is primary
    remaining.sort(key=lambda c: c['frequency'], reverse=True)
    roles['primary'] = remaining.pop(0)

    # Second most frequent is secondary
    if remaining:
        roles['secondary'] = remaining.pop(0)

    # Most saturated remaining is accent
    if remaining:
        def saturation(c):
            r, g, b = [x/255 for x in c['rgb']]
            max_c, min_c = max(r, g, b), min(r, g, b)
            return (max_c - min_c) / (max_c + 0.001)

        remaining.sort(key=saturation, reverse=True)
        roles['accent'] = remaining.pop(0)

    # Rest are highlights
    if remaining:
        roles['highlight'] = remaining[0]

    return roles
```

### Era & Style Detection

```python
from enum import Enum
from typing import Tuple
import colorsys

class WeddingEra(Enum):
    SEVENTIES_DISCO = "70s_disco"
    EIGHTIES_GLAM = "80s_glam"
    NINETIES_MINIMALIST = "90s_minimalist"
    RUSTIC_BARN = "rustic_barn"
    MODERN_MINIMAL = "modern_minimal"
    BEACH_COASTAL = "beach_coastal"
    GARDEN_ROMANTIC = "garden_romantic"
    GLAMOROUS_GATSBY = "gatsby_glamour"
    BOHEMIAN = "bohemian"
    CULTURAL_TRADITIONAL = "cultural_traditional"
    QUEER_CELEBRATION = "queer_celebration"

def detect_wedding_era(
    palette: list,
    detected_objects: list,  # From object detection
    venue_type: str = None
) -> Tuple[WeddingEra, float]:
    """
    Detect the wedding's aesthetic era/style.

    Signals:
    - Color palette temperature and saturation
    - Detected objects (disco ball, barn wood, beach)
    - Venue type if provided
    - Attire style (detected or user-specified)
    """

    scores = {era: 0.0 for era in WeddingEra}

    # Analyze palette characteristics
    avg_saturation = np.mean([
        colorsys.rgb_to_hsv(*[c/255 for c in color['rgb']])[1]
        for color in palette
    ])

    warm_ratio = sum(
        1 for c in palette
        if c['rgb'][0] > c['rgb'][2]  # R > B = warm
    ) / len(palette)

    # 70s Disco indicators
    if any(obj in detected_objects for obj in ['disco_ball', 'mirror_ball', 'sequins']):
        scores[WeddingEra.SEVENTIES_DISCO] += 0.5

    # Color patterns for 70s
    earth_tones = ['#D2691E', '#8B4513', '#DAA520', '#CD853F']
    if palette_matches_tones(palette, earth_tones, threshold=0.3):
        scores[WeddingEra.SEVENTIES_DISCO] += 0.3
    if warm_ratio > 0.7:
        scores[WeddingEra.SEVENTIES_DISCO] += 0.2

    # Rustic indicators
    if any(obj in detected_objects for obj in ['barn', 'wood', 'burlap', 'mason_jar']):
        scores[WeddingEra.RUSTIC_BARN] += 0.5

    # Modern minimal indicators
    if avg_saturation < 0.3:  # Desaturated palette
        scores[WeddingEra.MODERN_MINIMAL] += 0.3

    # Beach indicators
    if any(obj in detected_objects for obj in ['beach', 'ocean', 'sand', 'palm']):
        scores[WeddingEra.BEACH_COASTAL] += 0.5

    # Rainbow/pride indicators for queer celebrations
    rainbow_coverage = check_rainbow_coverage(palette)
    if rainbow_coverage > 0.5:
        scores[WeddingEra.QUEER_CELEBRATION] += 0.4

    # Find highest scoring era
    best_era = max(scores, key=scores.get)
    confidence = scores[best_era]

    # Normalize confidence
    total = sum(scores.values())
    if total > 0:
        confidence = scores[best_era] / total

    return best_era, confidence

def palette_matches_tones(palette: list, reference_tones: list, threshold: float) -> bool:
    """Check if palette matches reference color tones."""
    from colormath.color_objects import sRGBColor, LabColor
    from colormath.color_conversions import convert_color
    from colormath.color_diff import delta_e_cie2000

    matches = 0
    for color in palette:
        rgb = sRGBColor(*[c/255 for c in color['rgb']])
        lab = convert_color(rgb, LabColor)

        for ref_hex in reference_tones:
            ref_rgb = sRGBColor.new_from_rgb_hex(ref_hex)
            ref_lab = convert_color(ref_rgb, LabColor)

            delta = delta_e_cie2000(lab, ref_lab)
            if delta < 20:  # Close enough
                matches += 1
                break

    return matches / len(palette) >= threshold
```

## Theme Templates

### 70s Disco Theme

```typescript
// themes/70s-disco.ts
export const discoTheme = {
  name: "70s Disco",

  colors: {
    primary: '#D2691E',      // Burnt orange
    secondary: '#DAA520',    // Goldenrod
    accent: '#8B008B',       // Dark magenta
    background: '#1a1a2e',   // Deep purple-black
    surface: '#2d2d44',      // Lighter purple
    text: '#FFFFFF',
    textMuted: '#B0A090',
  },

  gradients: {
    sunset: 'linear-gradient(180deg, #FF6B35 0%, #D2691E 50%, #8B008B 100%)',
    disco: 'linear-gradient(45deg, #FFD700, #FF6B35, #8B008B, #4169E1)',
    gold: 'linear-gradient(180deg, #FFD700 0%, #DAA520 100%)',
  },

  typography: {
    display: "'Playfair Display', serif",  // Elegant, era-appropriate
    heading: "'Bebas Neue', sans-serif",   // Bold, groovy
    body: "'Lato', sans-serif",            // Clean readability
    accent: "'Pacifico', cursive",         // Fun script moments
  },

  effects: {
    glowColor: 'rgba(255, 215, 0, 0.6)',
    shadowColor: 'rgba(139, 0, 139, 0.3)',
    borderRadius: '0px',  // Sharp 70s edges
    borderStyle: '3px solid',
  },

  patterns: {
    starburst: true,
    mirrorBall: true,
    geometricShapes: ['hexagon', 'star', 'diamond'],
  },

  animations: {
    type: 'groovy',
    easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',  // Bouncy
    duration: '0.6s',
  },

  components: {
    button: {
      background: 'var(--gradient-gold)',
      color: '#1a1a2e',
      fontFamily: 'var(--font-heading)',
      textTransform: 'uppercase',
      letterSpacing: '2px',
      border: 'none',
      boxShadow: '0 4px 15px var(--glow-color)',
    },
    card: {
      background: 'var(--surface)',
      border: '2px solid var(--primary)',
      boxShadow: '0 0 20px var(--shadow-color)',
    },
    header: {
      background: 'var(--gradient-sunset)',
      color: 'white',
      fontFamily: 'var(--font-display)',
    },
  },
};
```

### Modern Minimal Theme

```typescript
// themes/modern-minimal.ts
export const modernMinimalTheme = {
  name: "Modern Minimal",

  colors: {
    primary: '#2C3E50',      // Deep slate
    secondary: '#E8E8E8',    // Warm gray
    accent: '#C9A959',       // Muted gold
    background: '#FFFFFF',
    surface: '#F8F8F8',
    text: '#1A1A1A',
    textMuted: '#6B7280',
  },

  gradients: {
    subtle: 'linear-gradient(180deg, #FFFFFF 0%, #F8F8F8 100%)',
    accent: 'linear-gradient(90deg, #C9A959 0%, #D4AF37 100%)',
  },

  typography: {
    display: "'Cormorant Garamond', serif",
    heading: "'Montserrat', sans-serif",
    body: "'Open Sans', sans-serif",
    accent: "'Cormorant Garamond', serif",
  },

  effects: {
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: '2px',
    borderStyle: '1px solid #E8E8E8',
  },

  animations: {
    type: 'subtle',
    easing: 'ease-out',
    duration: '0.3s',
  },
};
```

### Queer Celebration Theme

```typescript
// themes/queer-celebration.ts
export const queerCelebrationTheme = {
  name: "Queer Celebration",

  colors: {
    // Rainbow spectrum
    red: '#E50000',
    orange: '#FF8D00',
    yellow: '#FFEE00',
    green: '#028121',
    blue: '#004CFF',
    purple: '#770088',

    // UI colors
    primary: '#770088',
    secondary: '#004CFF',
    accent: '#FFEE00',
    background: '#FFFFFF',
    surface: '#F5F0FF',
    text: '#1A1A1A',
  },

  gradients: {
    pride: 'linear-gradient(90deg, #E50000, #FF8D00, #FFEE00, #028121, #004CFF, #770088)',
    prideVertical: 'linear-gradient(180deg, #E50000, #FF8D00, #FFEE00, #028121, #004CFF, #770088)',
    trans: 'linear-gradient(180deg, #55CDFC, #F7A8B8, #FFFFFF, #F7A8B8, #55CDFC)',
    bi: 'linear-gradient(180deg, #D60270, #9B4F96, #0038A8)',
    nonbinary: 'linear-gradient(180deg, #FCF434, #FFFFFF, #9C59D1, #2C2C2C)',
  },

  typography: {
    display: "'Playfair Display', serif",
    heading: "'Poppins', sans-serif",
    body: "'Inter', sans-serif",
    accent: "'Dancing Script', cursive",
  },

  effects: {
    glowColor: 'rgba(119, 0, 136, 0.4)',
    borderRadius: '8px',
    borderStyle: '2px solid',
  },

  patterns: {
    rainbow: true,
    hearts: true,
    confetti: true,
  },

  animations: {
    type: 'joyful',
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    duration: '0.5s',
  },

  specialElements: {
    pronounBadges: true,
    chosenFamilyHighlight: true,
    prideFlags: ['rainbow', 'trans', 'bi', 'nonbinary', 'pan', 'lesbian', 'gay'],
  },
};
```

## CSS Generation

```python
def generate_css_variables(theme: dict) -> str:
    """
    Generate CSS custom properties from theme.
    """
    css = ":root {\n"

    # Colors
    for name, value in theme['colors'].items():
        css += f"  --color-\{name\}: \{value\};\n"

    # Gradients
    for name, value in theme.get('gradients', {}).items():
        css += f"  --gradient-\{name\}: \{value\};\n"

    # Typography
    for name, value in theme.get('typography', {}).items():
        css += f"  --font-\{name\}: \{value\};\n"

    # Effects
    for name, value in theme.get('effects', {}).items():
        css_name = name.replace('_', '-')
        css += f"  --\{css_name\}: \{value\};\n"

    # Animation
    if 'animations' in theme:
        css += f"  --animation-easing: {theme['animations']['easing']};\n"
        css += f"  --animation-duration: {theme['animations']['duration']};\n"

    css += "}\n"

    return css
```

## Theme Application

```typescript
// ThemeProvider.tsx
import { createContext, useContext, ReactNode } from 'react';

interface ThemeContextValue {
  theme: WeddingTheme;
  setTheme: (theme: WeddingTheme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function WeddingThemeProvider({
  children,
  extractedTheme
}: {
  children: ReactNode;
  extractedTheme: WeddingTheme;
}) {
  const [theme, setTheme] = useState(extractedTheme);

  // Apply CSS variables
  useEffect(() => {
    const root = document.documentElement;

    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-$\{key\}`, value);
    });

    Object.entries(theme.gradients || {}).forEach(([key, value]) => {
      root.style.setProperty(`--gradient-$\{key\}`, value);
    });

    // Apply font imports
    const fontLink = document.createElement('link');
    fontLink.href = generateGoogleFontsUrl(theme.typography);
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);

    return () => {
      document.head.removeChild(fontLink);
    };
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      \{children\}
    </ThemeContext.Provider>
  );
}

export function useWeddingTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useWeddingTheme must be used within WeddingThemeProvider');
  }
  return context;
}
```
