---
title: Color Science for Interior Design
sidebar_label: Color Science for Interior ...
sidebar_position: 1
---
# Color Science for Interior Design

Deep reference for Munsell color system, color harmony calculations, and light-color interactions.

## Munsell Color System

```
MUNSELL NOTATION: Hue Value/Chroma
                  5R 5/14 = Red at middle value, high chroma

HUE (10 major hues, 100 steps total)
├── R (Red) → YR → Y (Yellow) → GY → G (Green)
└── → BG → B (Blue) → PB → P (Purple) → RP → R

VALUE (lightness, 0-10)
├── 0 = Pure black
├── 5 = Middle gray
└── 10 = Pure white

CHROMA (saturation, 0-max varies by hue)
├── 0 = Neutral gray
├── Low = Muted, sophisticated
├── High = Vivid, intense
└── Max varies: Blue max ~12, Red max ~14

WHY MUNSELL FOR INTERIORS:
├── Perceptually uniform (steps look equal)
├── Paint companies use it (Benjamin Moore, Sherwin-Williams)
├── Precise specification (no "kind of blue")
└── Predicts how colors will interact
```

## Color Harmony Systems

```python
class ColorHarmony:
    """
    Calculate color harmonies using perceptually uniform space.
    """

    @staticmethod
    def complementary(munsell_hue: str) -> str:
        """Direct opposite on Munsell hue circle."""
        hue_map = {
            'R': 'BG', 'YR': 'B', 'Y': 'PB',
            'GY': 'P', 'G': 'RP', 'BG': 'R',
            'B': 'YR', 'PB': 'Y', 'P': 'GY', 'RP': 'G'
        }
        return hue_map.get(munsell_hue, 'N')

    @staticmethod
    def split_complementary(munsell_hue: str) -> tuple[str, str]:
        """Two colors adjacent to the complement."""
        hue_order = ['R', 'YR', 'Y', 'GY', 'G', 'BG', 'B', 'PB', 'P', 'RP']
        idx = hue_order.index(munsell_hue)
        comp_idx = (idx + 5) % 10
        return (hue_order[(comp_idx - 1) % 10],
                hue_order[(comp_idx + 1) % 10])

    @staticmethod
    def value_contrast_ratio(v1: float, v2: float) -> float:
        """
        Calculate WCAG-style contrast for Munsell values.
        Values 0-10 mapped to luminance.
        """
        def to_luminance(v):
            return (v / 10) ** 2.4  # Approximate gamma

        l1 = to_luminance(max(v1, v2))
        l2 = to_luminance(min(v1, v2))
        return (l1 + 0.05) / (l2 + 0.05)
```

## Practical Palette Application

```
LIVING ROOM PALETTE EXAMPLE

Base: 10YR 8/2 (Warm off-white walls)
    └── High value, low chroma = recedes, spacious

Accent 1: 5B 4/6 (Teal sofa)
    └── Complement to YR, lower value draws attention

Accent 2: 5Y 7/4 (Gold pillows)
    └── Analogous to base hue, medium chroma for warmth

Trim: N 9.5/ (Near white)
    └── Neutral, highest value for clean lines

Floor: 7.5YR 4/4 (Warm wood)
    └── Low value grounds the space
```

## Light and Color Interaction

```
METAMERISM: Colors that match under one light source
            look different under another.

CRITICAL FOR INTERIORS:
├── Always test paint samples in YOUR lighting
├── Test at different times of day
├── North-facing rooms: Cooler light, colors shift blue
├── South-facing rooms: Warm light, colors appear warmer
├── LED CRI matters: >90 CRI for accurate color rendering

COLOR CONSTANCY FAILURE ZONES:
├── Near windows (daylight vs interior mix)
├── Under warm Edison bulbs (orange shift)
├── Near colored surfaces (reflected color)
└── High-chroma colors are most affected
```
