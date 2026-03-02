---
name: pixel-art-scaler
description: Deterministic pixel art upscaling using EPX/Scale2x, hq2x/hq4x, and xBR algorithms that add valid sub-pixels through pattern recognition. Activate on 'pixel art scaling', 'EPX', 'Scale2x',
  'hq2x', 'hq4x', 'xBR', 'retro game upscaling'. NOT for AI/ML upscaling, photo enlargement, or simple nearest-neighbor.
allowed-tools: Read,Write,Bash(python3:*,pip:*)
metadata:
  category: Design & Creative
  tags:
  - pixel
  - art
  - scaler
  pairs-with:
  - skill: win31-pixel-art-designer
    reason: Pixel art assets created by the designer need proper upscaling for high-DPI displays
  - skill: pixel-art-infographic-creator
    reason: Pixel art infographics need deterministic scaling to preserve sharp edges at larger sizes
  - skill: native-app-designer
    reason: App icon scaling from pixel art originals requires pattern-aware upscaling algorithms
---

# Pixel Art Scaler

Deterministic algorithms for upscaling pixel art that preserve aesthetics by adding valid sub-pixels through edge detection and pattern matching.

## When to Use

✅ **Use for**:
- Upscaling retro game sprites, icons, and pixel art
- 2x, 3x, 4x scaling with edge-aware interpolation
- Preserving sharp pixel art aesthetic at higher resolutions
- Converting 8x8, 16x16, 32x32, 48x48 pixel art for retina displays
- Comparing deterministic vs AI/ML approaches

❌ **NOT for**:
- Photographs or realistic images (use AI super-resolution)
- Simple geometric scaling (use nearest-neighbor)
- Vector art (use SVG)
- Text rendering (use font hinting)
- Arbitrary non-integer scaling (algorithms work best at 2x, 3x, 4x)

## Core Algorithms

### 1. EPX/Scale2x (Fastest, Good Quality)

**Best for**: Quick iteration, 2x/3x scaling, transparent sprites

**How it works**:
- Examines each pixel and its 4 cardinal neighbors (N, S, E, W)
- Expands 1 pixel → 4 pixels (2x) or 9 pixels (3x) using edge detection
- Only uses colors from original palette (no new colors)
- Handles transparency correctly

**When to use**:
- Need fast processing (100+ icons)
- Want crisp edges with no anti-aliasing
- Source has clean pixel boundaries
- Transparency preservation is critical

**Timeline**: Invented by Eric Johnston at LucasArts (~1992), rediscovered by Andrea Mazzoleni (2001)

### 2. hq2x/hq3x/hq4x (High Quality, Slower)

**Best for**: Final renders, complex sprites, smooth gradients

**How it works**:
- Pattern matching on 3x3 neighborhoods (256 possible patterns)
- YUV color space thresholds for edge detection
- Sophisticated interpolation rules per pattern
- Produces smooth, anti-aliased edges

**When to use**:
- Final production assets
- Source has gradients or dithering
- Want smooth, anti-aliased results
- Processing time is acceptable (~5-10x slower than EPX)

**Timeline**: Developed by Maxim Stepin for emulators (2003)

### 3. xBR/Super-xBR (Highest Quality, Slowest)

**Best for**: Hero assets, promotional materials, detailed sprites

**How it works**:
- Advanced edge detection with weighted blending
- Multiple passes for smoother results (Super-xBR)
- Preserves fine details while smoothing edges
- Best anti-aliasing of the three algorithms

**When to use**:
- Maximum quality needed
- Complex sprites with fine details
- Marketing/promotional use
- Time is not a constraint (~20x slower than EPX)

**Timeline**: xBR by Hyllian (2011), Super-xBR (2015)

## Anti-Patterns

### Anti-Pattern: Nearest-Neighbor for Display

**Novice thinking**: "Just use nearest-neighbor 4x, it preserves pixels"

**Reality**: Nearest-neighbor creates blocky repetition without adding detail. Each pixel becomes NxN identical blocks, which looks crude on high-DPI displays.

**What deterministic algorithms do**: Add valid sub-pixels through pattern recognition - a diagonal edge gets anti-aliased pixels, straight edges stay crisp.

**Timeline**:
- Pre-2000s: Nearest-neighbor was only option
- 2001+: EPX/Scale2x enabled smart 2x scaling
- 2003+: hq2x added sophisticated pattern matching
- 2011+: xBR became state-of-the-art

**When nearest-neighbor IS correct**: Viewing pixel art at exact integer multiples in pixel-perfect contexts (e.g., 1:1 reference images).

### Anti-Pattern: Using AI/ML for Pixel Art

**Novice thinking**: "Real-ESRGAN / Waifu2x will give better results"

**Reality**: AI models trained on photos/anime add inappropriate detail to pixel art. They invent textures and smooth edges that shouldn't exist, destroying the intentional pixel-level decisions.

**LLM mistake**: Training data includes "upscaling = use AI models" advice from photo editing contexts.

**Correct approach**:
| Source Type | Algorithm |
|-------------|-----------|
| Pixel art (sprites, icons) | EPX/hq2x/xBR (this skill) |
| Pixel art photos (screenshots) | Hybrid: xBR first, then light AI |
| Photos/realistic art | AI super-resolution |
| Mixed content | Test both, compare results |

### Anti-Pattern: Wrong Algorithm for Context

**Novice thinking**: "Always use the highest quality algorithm"

**Reality**: Different algorithms serve different purposes:

| Context | Algorithm | Why |
|---------|-----------|-----|
| Iteration/prototyping | EPX | 10x faster, good enough |
| Production assets (web) | hq2x | Balance of quality/size |
| Hero images (marketing) | xBR | Maximum quality |
| Transparent sprites | EPX | Best transparency handling |
| Complex gradients | hq4x | Best gradient interpolation |

**Validation**: Always compare outputs visually - sometimes EPX 2x looks better than hq4x!

## Usage

### Quick Start

```bash
# Install dependencies
cd ~/.claude/skills/pixel-art-scaler/scripts
pip install Pillow numpy

# Scale a single icon with EPX 2x (fastest)
python3 scale_epx.py input.png output.png --scale 2

# Scale with hq2x (high quality)
python3 scale_hqx.py input.png output.png --scale 2

# Scale with xBR (maximum quality)
python3 scale_xbr.py input.png output.png --scale 2

# Batch process directory
python3 batch_scale.py input_dir/ output_dir/ --algorithm epx --scale 2

# Compare all algorithms side-by-side
python3 compare_algorithms.py input.png output_comparison.html
```

### Algorithm Selection Guide

**Decision tree**:
```
Need to scale pixel art?
├── Transparency important? → EPX
├── Fast iteration needed? → EPX
├── Complex gradients/dithering? → hq2x or hq4x
├── Maximum quality for hero asset? → xBR
└── Not sure? → Run compare_algorithms.py
```

### Typical Workflow

1. **Prototype with EPX 2x**: Process all assets quickly
2. **Review results**: Identify which need higher quality
3. **Re-process heroes with hq4x or xBR**: Apply to key assets only
4. **Compare outputs**: Use `compare_algorithms.py` for side-by-side
5. **Optimize**: Sometimes 2x looks better than 4x (test both)

## Scripts Reference

All scripts in `scripts/` directory:

| Script | Purpose | Speed | Quality |
|--------|---------|-------|---------|
| `scale_epx.py` | EPX/Scale2x implementation | Fast | Good |
| `scale_hqx.py` | hq2x/hq3x/hq4x implementation | Medium | Great |
| `scale_xbr.py` | xBR/Super-xBR implementation | Slow | Best |
| `batch_scale.py` | Process directories | Varies | Varies |
| `compare_algorithms.py` | Generate comparison HTML | N/A | N/A |

Each script includes:
- CLI interface with `--help`
- Transparency preservation
- Error handling for corrupted inputs
- Progress indicators for batch operations

## Technical Details

### Color Space Considerations

**EPX**: Works in RGB, binary edge detection
**hq2x/hq4x**: Uses YUV color space with thresholds (Y=48, Cb=7, Cr=6)
**xBR**: Advanced edge weighting in RGB with luminance consideration

### Transparency Handling

All algorithms preserve alpha channel:
- Transparent pixels don't influence edge detection
- Semi-transparent pixels are handled correctly
- Output maintains RGBA format if input has alpha

### Performance Benchmarks (M4 Max, 48x48 input)

| Algorithm | Time (1 image) | Batch (100 images) |
|-----------|----------------|---------------------|
| EPX 2x | 0.01s | 1s |
| EPX 3x | 0.02s | 2s |
| hq2x | 0.10s | 10s |
| hq4x | 0.30s | 30s |
| xBR 2x | 0.15s | 15s |
| xBR 4x | 0.50s | 50s |

**Rule of thumb**: EPX is ~10x faster than hq2x, ~20x faster than xBR

## Output Validation

After scaling, verify results:

```bash
# Check output dimensions
identify output.png  # Should be exactly 2x, 3x, or 4x input

# Visual inspection
open output.png  # Look for artifacts, incorrect edges

# Compare algorithms
python3 compare_algorithms.py input.png comparison.html
open comparison.html  # Side-by-side comparison
```

**Common issues**:
- Jagged diagonals → Try hq2x or xBR instead of EPX
- Blurry edges → Check if input was already scaled (apply to original)
- Wrong colors → Verify input is RGB/RGBA (not indexed/paletted PNG)

## References

### Deep Dives
- `/references/algorithm-comparison.md` - Visual examples and trade-offs
- `/references/epx-algorithm.md` - EPX/Scale2x implementation details
- `/references/hqx-patterns.md` - hq2x pattern matching table explanation
- `/references/xbr-edge-detection.md` - xBR edge weighting formulas

### Research Papers & Sources
- [Pixel-art scaling algorithms - Wikipedia](https://en.wikipedia.org/wiki/Pixel-art_scaling_algorithms)
- [Scale2x & EPX official site](https://www.scale2x.it/scale2xandepx)
- [hqx: An Image Scaling Algorithm for Pixel Art](https://every-algorithm.github.io/2024/10/30/hqx.html)
- [py-super-xbr GitHub](https://github.com/n0spaces/py-super-xbr)

### Example Assets
- `/assets/test-sprites/` - Sample sprites for testing algorithms
- `/assets/expected-outputs/` - Reference outputs for validation

## Changelog

- 2026-02-05: Initial skill creation with EPX, hq2x, xBR implementations
