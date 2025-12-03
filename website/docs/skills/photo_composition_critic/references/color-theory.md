---
title: Color Theory
sidebar_label: Color Theory
sidebar_position: 2
---
# Color Theory

Advanced color perception and harmony systems.

## Josef Albers - Interaction of Color

```
KEY PRINCIPLES
├── Colors change based on neighbors
├── One color can appear as two different colors
├── Two colors can appear identical
└── Quantity affects perception (small vs large areas)
```

**Critical for photo critique**: The Bezold Effect - a color appears different depending on surrounding colors. Essential when evaluating edits.

## Johannes Itten - 7 Color Contrasts

| Contrast | Description |
|----------|-------------|
| Hue | Different colors |
| Value | Light vs dark |
| Saturation | Pure vs muted |
| Temperature | Warm vs cool |
| Complementary | Opposites |
| Simultaneous | Induced complementary |
| Extension | Ratio of color areas |

## Color Harmony Detection

```python
def analyze_color_harmony(img):
    """Analyze hue distribution for harmony type."""
    hsv_pixels = [rgb_to_hsv(p) for p in img.getdata()]
    hues = [p[0] for p in hsv_pixels if p[1] > 0.2]  # Ignore desaturated

    if not hues:
        return {"harmony_type": "achromatic", "score": 0.7}

    hue_hist = np.histogram(hues, bins=12, range=(0, 360))[0]
    active_bins = np.sum(hue_hist > len(hues) * 0.05)

    if active_bins == 1:
        return {"harmony_type": "monochromatic", "score": 0.85}
    elif active_bins == 2:
        is_comp = are_complementary(hue_hist)
        return {"harmony_type": "complementary" if is_comp else "analogous",
                "score": 0.9 if is_comp else 0.8}
    elif active_bins == 3:
        return {"harmony_type": "triadic", "score": 0.85}
    else:
        return {"harmony_type": "complex", "score": 0.6}
```

## Harmony Score Guide

| Harmony Type | Score | Notes |
|--------------|-------|-------|
| Complementary | 0.9 | High visual interest |
| Monochromatic | 0.85 | Safe, cohesive |
| Triadic | 0.85 | Balanced, vibrant |
| Analogous | 0.8 | Natural, harmonious |
| Achromatic | 0.7 | B&W or desaturated |
| Complex | 0.6 | May be chaotic or intentional |

## Essential Reading

- Albers, J. (1963). *Interaction of Color*
- Itten, J. (1961). *The Art of Color*
