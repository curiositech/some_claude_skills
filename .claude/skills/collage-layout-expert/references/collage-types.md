# Collage Types & Techniques

Detailed code examples and configurations for each collage style.

---

## 1. Grid Collages

**Use for**: Instagram profiles, product showcases, team photos, systematic displays.

```python
GRID_STYLES = {
    'uniform': {
        'rows': 3, 'cols': 3,
        'gap': 4,  # pixels
        'aspect': '1:1',
    },
    'masonry': {
        'columns': 3,
        'gap': 8,
        'variable_height': True,  # Pinterest-style
    },
    'mixed_grid': {
        'hero_size': 2,  # 2x2 for main image
        'small_count': 5,
        'layout': 'L_shape',  # or 'corner', 'split'
    },
}
```

**Key considerations**:
- Consistent color temperature across images
- Visual flow (Z-pattern or F-pattern for reading)
- One hero image as anchor; others support

---

## 2. Photo Mosaics

**Use for**: Tribute images, corporate displays, artistic recreations.

```python
def create_photo_mosaic(target_image, tile_images, tile_size=32):
    """
    Each tile_image replaces a region of target_image
    based on average color matching.
    """
    # 1. Compute average color of each tile
    tile_colors = [avg_color(img) for img in tile_images]

    # 2. Build k-d tree for fast lookup
    color_tree = KDTree(tile_colors)

    # 3. For each grid cell in target
    for y in range(0, target.height, tile_size):
        for x in range(0, target.width, tile_size):
            region_color = avg_color(target[y:y+tile_size, x:x+tile_size])
            best_tile_idx = color_tree.query(region_color)
            place_tile(tile_images[best_tile_idx], x, y)
```

**Expert tips**:
- Tile size 20-40px for viewing distance balance
- Use LAB color space for perceptual matching
- Avoid repetition: track tile usage, penalize reuse
- Consider edge detection for structural preservation

---

## 3. Scrapbook & Digital Journal

**Use for**: Personal memories, travel journals, baby books, wedding albums.

```python
SCRAPBOOK_ELEMENTS = {
    'photos': {'rotation_variance': (-5, 5), 'drop_shadow': True},
    'frames': ['polaroid', 'vintage', 'tape_corners', 'washi_tape'],
    'text': {'fonts': ['handwritten', 'typewriter', 'label_maker']},
    'embellishments': ['stickers', 'stamps', 'doodles', 'tickets'],
    'backgrounds': ['paper_texture', 'cork_board', 'fabric'],
}
```

**Layer order** (back to front):
1. Background texture/paper
2. Decorative elements (washi tape, ribbons)
3. Photos with frames/borders
4. Text blocks and labels
5. Small embellishments (stickers, stamps)

---

## 4. Magazine & Editorial Layouts

**Use for**: Professional publications, marketing materials, portfolios.

```python
EDITORIAL_GRIDS = {
    '3_column': {'cols': 3, 'gutter': 20, 'margin': 40},
    '12_column': {'cols': 12, 'gutter': 16, 'margin': 48},  # Flexible
    'modular': {'rows': 6, 'cols': 6, 'baseline': 24},
}

# Text-image relationships
WRAP_STYLES = ['square', 'tight', 'through', 'top_bottom']
```

**Typography integration**:
- Headlines: contrast with imagery, never compete
- Body text: respect image boundaries, maintain gutter
- Pull quotes: can overlap images with proper contrast
- Captions: anchor to relevant image

---

## 5. Vision Boards & Mood Boards

**Use for**: Design inspiration, goal visualization, brand development.

```python
MOOD_BOARD_LAYOUT = {
    'style': 'organic_cluster',  # or 'grid', 'radial', 'timeline'
    'overlap': 0.15,
    'rotation_range': (-8, 8),
    'scale_variation': (0.7, 1.3),
    'anchor_image': 'largest',  # Central focal point
    'color_coherence': 0.8,  # How matched colors should be
}
```

**Curation principles**:
- 60/30/10 rule: dominant/secondary/accent
- Mix scales: wide shots + details + textures
- Include non-photo elements: swatches, type samples, textures

---

## 6. Memory Walls & Polaroid Layouts

**Use for**: Nostalgic displays, event walls, family galleries.

```python
POLAROID_STYLE = {
    'border': {'top': 8, 'sides': 8, 'bottom': 24},  # Classic Polaroid
    'caption_font': 'permanent_marker',
    'scatter': {
        'rotation': (-15, 15),
        'overlap_allowed': True,
        'pin_style': 'pushpin',  # or 'tape', 'clip', 'magnet'
    },
}
```

**Arrangement algorithms**:
- **Force-directed**: Images repel like particles, settle naturally
- **Gravity clustering**: Images fall toward anchor points
- **Chronological spiral**: Time-based arrangement outward

---

## 7. Social Media Collages

**Use for**: Instagram stories, carousel covers, Pinterest pins.

```python
SOCIAL_TEMPLATES = {
    'instagram_story': {'width': 1080, 'height': 1920, 'safe_zone': 100},
    'instagram_post': {'width': 1080, 'height': 1080},
    'instagram_carousel': {'count': 10, 'continuity': True},  # Seamless swipe
    'pinterest_pin': {'width': 1000, 'height': 1500},
    'twitter_card': {'width': 1200, 'height': 628},
}
```

**Platform-specific tips**:
- Instagram: Avoid text in top/bottom 15% (UI overlap)
- Carousel: Create visual continuity across swipes
- Pinterest: Vertical images, text overlay in top third
