---
slug: /skills/collage_layout_expert
id: collage_layout_expert
name: collage-layout-expert
description: "Expert in ALL computational collage composition: photo mosaics, grid layouts, scrapbook/journal styles, magazine editorial, vision boards, mood boards, social media collages, memory walls, abstract/generative arrangements, and art-historical techniques (Hockney joiners, Dadaist photomontage, Surrealist assemblage, Rauschenberg combines). Masters edge-based assembly, Poisson blending, optimal transport color harmonization, and aesthetic optimization."
---

# Collage & Layout Composition Expert

<SkillHeader
  skillName="Collage Layout Expert"
  fileName="collage-layout-expert"
  description={"\"Expert in ALL computational collage composition: photo mosaics, grid layouts, scrapbook/journal styles, magazine editorial, vision boards, mood boards, social media collages, memory walls, abstract/generative arrangements, and art-historical techniques (Hockney joiners, Dadaist photomontage, Surrealist assemblage, Rauschenberg combines). Masters edge-based assembly, Poisson blending, optimal transport color harmonization, and aesthetic optimization. Activate on 'collage', 'photo mosaic', 'grid layout', 'scrapbook', 'vision board', 'mood board', 'photo wall', 'magazine layout', 'Hockney', 'joiner', 'photomontage'. NOT for simple image editing (use native-app-designer), generating new images (use Stability AI), single photo enhancement (use photo-composition-critic), or basic image similarity search (use clip-aware-embeddings).\""}
  tags={["creation","cv","photography","visual","advanced"]}
/>

Expert in **ALL forms of computational collage composition** - from Instagram grids to Hockney joiners, from magazine layouts to generative art, from scrapbooks to photo mosaics. Bridges art history, computer vision, and mathematical optimization.

## When to Use This Skill

✅ **Use for:**
- **Grid Collages**: Instagram grids, regular layouts, tiled compositions
- **Photo Mosaics**: Small images forming larger pictures
- **Hockney-Style Joiners**: Multi-perspective photographic assemblies
- **Scrapbook/Journal**: Mixed media with text, frames, embellishments
- **Magazine/Editorial**: Professional layouts with text integration
- **Vision/Mood Boards**: Inspiration collections, design references
- **Memory Walls**: Scattered Polaroid-style arrangements
- **Social Media**: Stories, carousel previews, profile grids
- **Abstract/Generative**: Algorithmic and procedural arrangements
- **Art-Historical**: Dadaist, Surrealist, Pop Art styles

❌ **Do NOT use for:**
- Simple image editing → **native-app-designer**
- Generating new images → **Stability AI**
- Single photo quality → **photo-composition-critic**
- Image similarity search → **clip-aware-embeddings**
- Color palette extraction → **color-theory-palette-harmony-expert**

## MCP Integrations

| MCP | Purpose |
|-----|---------|
| **Stability AI** | Generate backgrounds, textures, missing elements |
| **Firecrawl** | Research collage techniques, algorithm papers, art history |
| **WebFetch** | Fetch documentation, tutorials, design references |

## Expert vs Novice Shibboleths

| Topic | Novice | Expert |
|-------|--------|--------|
| **Layout** | "Just arrange randomly" | Understands visual weight, balance, golden ratio, rule of thirds |
| **Blending** | Hard edges or simple feather | Knows Poisson blending preserves gradients; when to use masks vs blend |
| **Color** | "Match colors manually" | Uses optimal transport for harmonization; knows LAB space advantages |
| **Composition** | Fills all space | Understands negative space as design element; breathing room |
| **Scale** | Same size for everything | Varies scale for hierarchy; knows focal points need dominance |
| **Mosaic** | "More tiles = better" | Knows tile size vs. recognition tradeoff; color quantization matters |
| **Hockney** | "Stitch photos seamlessly" | Knows imperfection IS the technique; multiple perspectives are intentional |

## Collage Types & Techniques

### 1. Grid Collages

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

### 2. Photo Mosaics

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

### 3. Scrapbook & Digital Journal

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

### 4. Magazine & Editorial Layouts

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

### 5. Vision Boards & Mood Boards

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

### 6. Memory Walls & Polaroid Layouts

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

### 7. Social Media Collages

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

---

## Art-Historical Styles

### David Hockney's Joiners (1982-1985)

Hockney created photographs with **"perspectival sophistication of Cubist paintings"**:

```python
HOCKNEY_JOINER_STYLE = {
    'overlap': 0.1,              # 5-15% overlap between photos
    'rotation_variance': 2.0,    # ±2° rotation per photo
    'perspective_shift': True,   # Multiple viewpoints
    'grid_irregularity': 0.15,   # 10-15% positional offset
    'border_style': 'polaroid',  # White borders (optional)
    'allow_gaps': True,          # Intentional negative space
}
```

**Key Innovations**:
- Multiple perspectives simultaneously (vs. single camera viewpoint)
- Temporal dimension (same scene, different moments)
- Viewer's eye "constructs" the scene (active participation)
- Embraces imperfection (overlaps, gaps, misalignments)

### Dadaist Photomontage (Hannah Höch, 1920s)

```python
DADAIST_STYLE = {
    'layout': 'chaotic',
    'semantic_mismatch': True,  # Intentionally incongruous elements
    'sharp_cutouts': True,      # No feathering
    'scale_absurdity': True,    # Giant heads, tiny bodies
    'political_commentary': True,
}
```

### Pop Art Combines (Rauschenberg, 1950s-60s)

```python
RAUSCHENBERG_STYLE = {
    'layout': 'layered',
    'blend_modes': ['multiply', 'screen', 'overlay'],
    'found_imagery': True,      # Newspaper, ads, photos
    'paint_integration': True,  # Mix photo + paint texture
    'silkscreen_effect': True,
}
```

### Surrealist Assemblage

```python
SURREALIST_STYLE = {
    'dreamlike_transitions': True,
    'impossible_juxtaposition': True,
    'seamless_blend': True,     # Unlike Dada's sharp cuts
    'perspective_manipulation': True,
}
```

---

## Core Algorithms

### Edge-Based Assembly (Hockney/Joiners)

```python
def edge_compatibility(edge1, edge2):
    """Score how well two edges can connect (0-1)."""
    return (
        0.30 * line_continuation_score +
        0.15 * curve_flow_score +
        0.25 * color_harmony_score +
        0.20 * semantic_coherence +  # CLIP similarity
        0.10 * complexity_balance
    )
```

### Poisson Blending (Seamless Transitions)

- Preserves gradients from source while matching boundary conditions
- GPU-parallelizable with Jacobi iteration (~20ms for 512×512)
- Use for: mood boards, surrealist, magazine layouts

### Optimal Transport (Color Harmonization)

- Wasserstein distance measures "effort" to transform color distributions
- Sinkhorn algorithm for fast approximation
- Affine approximation: `transformed = M @ color + b` for real-time

### Force-Directed Layout (Organic Scatter)

```python
def force_directed_layout(images, iterations=100):
    for _ in range(iterations):
        for img in images:
            # Repulsion from other images
            for other in images:
                if img != other:
                    force = repulsion(img.center, other.center)
                    img.velocity += force
            # Attraction to center (prevent drift)
            img.velocity += attraction(img.center, canvas_center) * 0.1
            # Damping
            img.velocity *= 0.9
            img.position += img.velocity
```

---

## Decision Tree: Choosing a Style

**What's the purpose?**
- Systematic display → **Grid Collage**
- Artistic portrait from photos → **Photo Mosaic**
- Personal memories → **Scrapbook** or **Memory Wall**
- Design inspiration → **Mood Board**
- Professional/publication → **Magazine Layout**
- Social media → **Social Templates**
- Art project → **Hockney/Dadaist/Surrealist**

**What's the vibe?**
- Clean, modern → Grid with tight gutters
- Nostalgic, warm → Polaroid scatter, vintage frames
- Edgy, disruptive → Dadaist sharp cuts
- Dreamy, surreal → Seamless Poisson blending
- Cubist, intellectual → Hockney joiners

---

## Performance Targets

| Operation | Mac M2 | iPhone 15 Pro |
|-----------|--------|---------------|
| Grid layout (20 photos) | &lt;50ms | &lt;100ms |
| Photo mosaic (10k tiles) | 2s | 5s |
| Force-directed (50 images, 100 iter) | 200ms | 500ms |
| Poisson blending (512×512) | 20ms | 50ms |
| Hockney assembly (10 photos) | 0.5s | 2s |

---

## Integrates With

- **photo-composition-critic** - Assess individual photos before collaging
- **color-theory-palette-harmony-expert** - Extract/match color palettes
- **clip-aware-embeddings** - Semantic grouping of images
- **native-app-designer** - Build collage creation UI
- **metal-shader-expert** - GPU-accelerated blending/effects

---

**Remember**: Great collages tell stories through arrangement. Whether grid-precise or Hockney-chaotic, the layout should serve the narrative. Master both the math and the art.
