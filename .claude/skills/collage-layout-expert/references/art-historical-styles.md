# Art-Historical Collage Styles

Detailed implementations for historically-inspired collage techniques.

---

## David Hockney's Joiners (1982-1985)

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

### Implementation Notes

The magic of Hockney joiners comes from:
1. **Intentional misalignment** - Don't perfect-stitch
2. **Visible seams** - Borders are part of the aesthetic
3. **Multiple focal lengths** - Shift attention through zoom variation
4. **Temporal narrative** - Capture same scene at different moments

---

## Dadaist Photomontage (Hannah Höch, 1920s)

```python
DADAIST_STYLE = {
    'layout': 'chaotic',
    'semantic_mismatch': True,  # Intentionally incongruous elements
    'sharp_cutouts': True,      # No feathering
    'scale_absurdity': True,    # Giant heads, tiny bodies
    'political_commentary': True,
}
```

### Key Characteristics
- **Sharp edges**: No smooth transitions
- **Jarring juxtapositions**: Unrelated elements collide
- **Scale distortion**: Size relationships defied
- **Found imagery**: Newspapers, magazines, advertisements
- **Political/social critique**: Visual commentary

### Implementation Approach
```python
def dadaist_cutout(image, subject_mask):
    """
    Create Dadaist-style sharp cutout
    """
    # Hard edge, no feathering
    mask = subject_mask.astype(np.uint8) * 255

    # Optional: Add slight paper-tear effect to edges
    if random.random() > 0.7:
        kernel = np.ones((2, 2), np.uint8)
        mask = cv2.erode(mask, kernel, iterations=1)

    return cv2.bitwise_and(image, image, mask=mask)
```

---

## Pop Art Combines (Rauschenberg, 1950s-60s)

```python
RAUSCHENBERG_STYLE = {
    'layout': 'layered',
    'blend_modes': ['multiply', 'screen', 'overlay'],
    'found_imagery': True,      # Newspaper, ads, photos
    'paint_integration': True,  # Mix photo + paint texture
    'silkscreen_effect': True,
}
```

### Key Characteristics
- **Layered composition**: Images stacked, semi-transparent
- **Mixed media**: Photography + painting + found objects
- **Urban detritus**: Street imagery, commercial artifacts
- **Color registration errors**: Intentional offset for silkscreen look

### Silkscreen Effect
```python
def silkscreen_effect(image, color_shift=(5, 3)):
    """
    Create Warhol/Rauschenberg silkscreen look
    """
    # Split channels
    b, g, r = cv2.split(image)

    # Offset each channel slightly
    rows, cols = b.shape
    M_r = np.float32([[1, 0, color_shift[0]], [0, 1, color_shift[1]]])
    M_b = np.float32([[1, 0, -color_shift[0]], [0, 1, -color_shift[1]]])

    r = cv2.warpAffine(r, M_r, (cols, rows))
    b = cv2.warpAffine(b, M_b, (cols, rows))

    # Recombine
    return cv2.merge([b, g, r])
```

---

## Surrealist Assemblage

```python
SURREALIST_STYLE = {
    'dreamlike_transitions': True,
    'impossible_juxtaposition': True,
    'seamless_blend': True,     # Unlike Dada's sharp cuts
    'perspective_manipulation': True,
}
```

### Key Characteristics
- **Dreamlike logic**: Elements connected by unconscious association
- **Seamless integration**: Smooth blending (unlike Dada)
- **Scale manipulation**: Objects in impossible sizes
- **Perspective warping**: Shared vanishing points across disparate elements

### Implementation Approach
```python
def surrealist_blend(foreground, background, mask):
    """
    Seamless surrealist integration using Poisson blending
    """
    # Find center of foreground object
    M = cv2.moments(mask)
    cx = int(M['m10'] / M['m00'])
    cy = int(M['m01'] / M['m00'])

    # Seamless clone
    result = cv2.seamlessClone(
        foreground,
        background,
        mask,
        (cx, cy),
        cv2.NORMAL_CLONE
    )

    return result
```

---

## Constructivist Montage (Rodchenko, 1920s)

```python
CONSTRUCTIVIST_STYLE = {
    'layout': 'dynamic_diagonal',
    'typography_integration': True,
    'bold_geometry': True,
    'limited_palette': ['red', 'black', 'white'],
    'propaganda_aesthetic': True,
}
```

### Key Characteristics
- **Strong diagonals**: Dynamic composition
- **Bold typography**: Text as design element
- **Limited color palette**: Red, black, white dominant
- **Geometric shapes**: Circles, triangles, bars as framing
- **Worker imagery**: Industrial, heroic subjects

---

## Choosing a Historical Style

| If you want... | Use... |
|----------------|--------|
| Multiple perspectives of one scene | Hockney Joiner |
| Political/social commentary with sharp contrasts | Dadaist |
| Layered, painterly texture | Rauschenberg Pop |
| Dreamlike seamless fantasy | Surrealist |
| Bold propaganda poster feel | Constructivist |
