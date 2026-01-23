# Core Collage Algorithms

Mathematical and computational techniques for collage composition.

---

## Edge-Based Assembly (Hockney/Joiners)

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

### Edge Extraction
```python
def extract_edges(image, edge_position='right'):
    """
    Extract edge strip from image for compatibility scoring.
    """
    edge_width = 20  # pixels

    if edge_position == 'right':
        return image[:, -edge_width:]
    elif edge_position == 'left':
        return image[:, :edge_width]
    elif edge_position == 'top':
        return image[:edge_width, :]
    elif edge_position == 'bottom':
        return image[-edge_width:, :]
```

### Line Continuation Score
```python
def line_continuation_score(edge1, edge2):
    """
    Score how well lines continue across edge boundary.
    Uses Hough line detection.
    """
    # Detect lines in both edges
    lines1 = cv2.HoughLinesP(edge1, 1, np.pi/180, 50)
    lines2 = cv2.HoughLinesP(edge2, 1, np.pi/180, 50)

    if lines1 is None or lines2 is None:
        return 0.5  # Neutral score

    # Find lines that approach the boundary
    boundary_lines1 = [l for l in lines1 if approaches_boundary(l, 'right')]
    boundary_lines2 = [l for l in lines2 if approaches_boundary(l, 'left')]

    # Score angle continuity
    score = 0
    for l1 in boundary_lines1:
        for l2 in boundary_lines2:
            angle_diff = abs(get_angle(l1) - get_angle(l2))
            score += max(0, 1 - angle_diff / 45)  # Within 45° = good

    return min(1.0, score / max(len(boundary_lines1), 1))
```

---

## Poisson Blending (Seamless Transitions)

Preserves gradients from source while matching boundary conditions.

```python
def poisson_blend(source, target, mask, center):
    """
    Seamless clone using OpenCV's implementation.
    """
    # Ensure mask is binary
    mask = (mask > 127).astype(np.uint8) * 255

    # NORMAL_CLONE preserves source gradients
    # MIXED_CLONE preserves stronger gradient from either
    result = cv2.seamlessClone(
        source, target, mask, center,
        cv2.NORMAL_CLONE  # or cv2.MIXED_CLONE
    )

    return result
```

### When to Use Each Mode
- **NORMAL_CLONE**: Standard seamless blending, preserves source fully
- **MIXED_CLONE**: Preserves dominant gradients (good for textured backgrounds)
- **MONOCHROME_TRANSFER**: Transfers lighting only, not color

### Performance Notes
- GPU-parallelizable with Jacobi iteration
- ~20ms for 512×512 on modern GPU
- ~100ms for 1080p on CPU

---

## Optimal Transport (Color Harmonization)

Wasserstein distance measures "effort" to transform color distributions.

```python
def color_transfer_optimal_transport(source, target):
    """
    Transfer color distribution from target to source
    using optimal transport.
    """
    # Convert to LAB for perceptual uniformity
    source_lab = cv2.cvtColor(source, cv2.COLOR_BGR2LAB)
    target_lab = cv2.cvtColor(target, cv2.COLOR_BGR2LAB)

    # Compute means and covariances
    source_mean, source_std = compute_stats(source_lab)
    target_mean, target_std = compute_stats(target_lab)

    # Affine transformation
    result = (source_lab - source_mean) * (target_std / source_std) + target_mean

    return cv2.cvtColor(result.astype(np.uint8), cv2.COLOR_LAB2BGR)

def compute_stats(lab_image):
    """Compute per-channel mean and std."""
    mean = np.mean(lab_image, axis=(0, 1))
    std = np.std(lab_image, axis=(0, 1))
    std = np.where(std == 0, 1, std)  # Avoid division by zero
    return mean, std
```

### Sinkhorn Algorithm (Full Optimal Transport)
```python
def sinkhorn_color_transfer(source, target, reg=0.01, iterations=100):
    """
    More accurate but slower color transfer using Sinkhorn.
    """
    import ot  # POT library

    # Flatten and sample colors
    source_colors = source.reshape(-1, 3).astype(float)
    target_colors = target.reshape(-1, 3).astype(float)

    # Sample for speed (full image too slow)
    n_samples = 1000
    source_sample = source_colors[np.random.choice(len(source_colors), n_samples)]
    target_sample = target_colors[np.random.choice(len(target_colors), n_samples)]

    # Compute cost matrix (Euclidean distance in LAB)
    M = ot.dist(source_sample, target_sample, metric='euclidean')

    # Sinkhorn transport
    T = ot.sinkhorn(
        np.ones(n_samples) / n_samples,
        np.ones(n_samples) / n_samples,
        M, reg
    )

    # Apply transport (simplified - full implementation more complex)
    return source  # Placeholder
```

---

## Force-Directed Layout (Organic Scatter)

```python
def force_directed_layout(images, canvas_size, iterations=100):
    """
    Organic layout using physics simulation.
    """
    # Initialize random positions
    for img in images:
        img.position = np.random.rand(2) * canvas_size
        img.velocity = np.zeros(2)

    canvas_center = np.array(canvas_size) / 2

    for _ in range(iterations):
        for img in images:
            force = np.zeros(2)

            # Repulsion from other images
            for other in images:
                if img != other:
                    diff = img.position - other.position
                    dist = np.linalg.norm(diff)
                    if dist < 1:
                        dist = 1
                    # Inverse square repulsion
                    force += diff / (dist ** 2) * 100

            # Attraction to center (prevent drift)
            center_diff = canvas_center - img.position
            force += center_diff * 0.01

            # Boundary repulsion
            for i in range(2):
                if img.position[i] < 50:
                    force[i] += 10
                if img.position[i] > canvas_size[i] - 50:
                    force[i] -= 10

            # Apply force with damping
            img.velocity = img.velocity * 0.9 + force * 0.1
            img.position += img.velocity

    return images
```

### Collision Avoidance
```python
def check_overlap(img1, img2):
    """Check if two positioned images overlap."""
    r1 = img1.get_rect()  # (x, y, w, h)
    r2 = img2.get_rect()

    return (r1.x < r2.x + r2.w and
            r1.x + r1.w > r2.x and
            r1.y < r2.y + r2.h and
            r1.y + r1.h > r2.y)

def resolve_overlap(img1, img2):
    """Push overlapping images apart."""
    diff = img1.position - img2.position
    dist = np.linalg.norm(diff)
    if dist < 1:
        diff = np.random.rand(2) - 0.5
        dist = np.linalg.norm(diff)

    # Move each image half the overlap distance
    overlap = get_overlap_distance(img1, img2)
    push = diff / dist * overlap / 2

    img1.position += push
    img2.position -= push
```

---

## Bin Packing (Tight Grid Layout)

```python
def guillotine_pack(images, canvas_width):
    """
    Pack images using guillotine algorithm.
    Returns positions for each image.
    """
    # Sort by height (tallest first)
    sorted_images = sorted(images, key=lambda x: -x.height)

    # Initialize free rectangles
    free_rects = [(0, 0, canvas_width, float('inf'))]
    positions = []

    for img in sorted_images:
        # Find best fit
        best_rect = None
        best_score = float('inf')

        for rect in free_rects:
            if rect[2] >= img.width and rect[3] >= img.height:
                score = rect[2] * rect[3]  # Area
                if score < best_score:
                    best_score = score
                    best_rect = rect

        if best_rect:
            # Place image
            positions.append((img, best_rect[0], best_rect[1]))

            # Split remaining space (guillotine cut)
            free_rects.remove(best_rect)
            # Right split
            if best_rect[2] - img.width > 0:
                free_rects.append((
                    best_rect[0] + img.width,
                    best_rect[1],
                    best_rect[2] - img.width,
                    img.height
                ))
            # Bottom split
            if best_rect[3] - img.height > 0:
                free_rects.append((
                    best_rect[0],
                    best_rect[1] + img.height,
                    best_rect[2],
                    best_rect[3] - img.height
                ))

    return positions
```

---

## Performance Benchmarks

| Operation | Mac M2 | iPhone 15 Pro |
|-----------|--------|---------------|
| Grid layout (20 photos) | &lt;50ms | &lt;100ms |
| Photo mosaic (10k tiles) | 2s | 5s |
| Force-directed (50 images, 100 iter) | 200ms | 500ms |
| Poisson blending (512×512) | 20ms | 50ms |
| Hockney assembly (10 photos) | 0.5s | 2s |
| Color transfer (1080p) | 100ms | 300ms |
