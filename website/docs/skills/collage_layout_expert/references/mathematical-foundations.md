---
title: Mathematical Foundations
sidebar_label: Mathematical Foundations
sidebar_position: 6
---
# Mathematical Foundations

## Optimal Transport for Color Harmonization

**Problem**: Harmonize shard colors with global palette without destroying local structure.

### Wasserstein Distance (Earth Mover's Distance)

```
W₂(μ, ν)² = inf{γ ∈ Π(μ,ν)} ∫∫ ‖x - y‖² dγ(x,y)
```

Where:
- μ = shard's color distribution (LAB histogram)
- ν = target/global distribution
- γ = transport plan (how to move color mass)

### Sinkhorn Algorithm (entropy-regularized)

```python
def sinkhorn_optimal_transport(source_hist, target_hist, epsilon=0.1, max_iters=100):
    """
    Compute optimal transport plan using Sinkhorn iterations.
    epsilon: regularization strength (smaller = closer to true OT)
    """
    # Cost matrix: squared distances in LAB space
    C = compute_cost_matrix_lab(source_hist.bins, target_hist.bins)

    # Kernel matrix
    K = np.exp(-C / epsilon)

    # Initialize
    u = np.ones(len(source_hist))
    v = np.ones(len(target_hist))

    # Iterate (converges exponentially fast)
    for _ in range(max_iters):
        u = source_hist.weights / (K @ v)
        v = target_hist.weights / (K.T @ u)

    # Optimal transport plan
    gamma = np.diag(u) @ K @ np.diag(v)

    return gamma  # gamma[i,j] = mass to move from bin i to bin j
```

### Affine Approximation (for real-time)

```python
def fit_affine_color_transform(source_hist, target_hist):
    """
    Approximate optimal transport as affine transform in LAB space.
    Returns: (M, b) where transformed_color = M @ color + b
    """
    # 1. Compute OT plan
    gamma = sinkhorn_optimal_transport(source_hist, target_hist)

    # 2. Sample points from distributions
    source_samples = source_hist.sample(n=256)
    target_samples = target_hist.sample(n=256)

    # 3. Weighted least squares
    X = source_samples  # Nx3 (L, a, b)
    Y = target_samples  # Mx3

    M = (Y.T @ gamma @ X.T) @ np.linalg.inv(X.T @ gamma.T @ X)
    b = target_hist.mean() - M @ source_hist.mean()

    return M, b
```

### Why LAB Space

- **Perceptually uniform**: Euclidean distance ≈ perceived color difference
- **Separates luminance from chrominance**: L (lightness), a (green-red), b (blue-yellow)
- **Better blending**: Avoids hue shifts that occur in RGB

---

## Poisson Blending for Seamless Junctions

**Problem**: Blend overlapping halos without visible seams.

### Poisson Equation

```
∇²f = div(g)  in Ω
f = T         on ∂Ω
```

Where:
- f = unknown blended image
- g = guidance field (gradients from source images)
- Ω = blend region (halo intersection)
- ∂Ω = boundary (fixed to target values)

### Discrete Form (pixel grid)

```python
# For each interior pixel (i, j):
4·f[i,j] - f[i-1,j] - f[i+1,j] - f[i,j-1] - f[i,j+1] = div(g)[i,j]
```

### Jacobi Iteration Solver

```python
def poisson_blend_jacobi(source, target, mask, max_iters=50):
    """
    Solve Poisson equation using Jacobi iteration.
    Perfect for GPU parallelization (Metal shader).
    """
    # Compute guidance field (source gradients)
    gx = np.gradient(source, axis=1)
    gy = np.gradient(source, axis=0)

    # Divergence of guidance field
    div_g = np.gradient(gx, axis=1) + np.gradient(gy, axis=0)

    # Initialize solution with target
    f = target.copy()
    f_new = f.copy()

    # Iterate
    for iteration in range(max_iters):
        for i in range(1, mask.shape[0] - 1):
            for j in range(1, mask.shape[1] - 1):
                if mask[i, j]:  # Interior pixel
                    f_new[i, j] = 0.25 * (
                        f[i-1, j] + f[i+1, j] +
                        f[i, j-1] + f[i, j+1] +
                        div_g[i, j]
                    )
                # else: boundary pixel, keep f_new[i,j] = target[i,j]

        f = f_new.copy()

    return f
```

### Metal Implementation (GPU acceleration)

```metal
kernel void poisson_jacobi_step(
    texture2d<float, access::read> f_current [[texture(0)]],
    texture2d<float, access::read> divergence [[texture(1)]],
    texture2d<float, access::write> f_next [[texture(2)]],
    texture2d<uint, access::read> mask [[texture(3)]],
    uint2 gid [[thread_position_in_grid]]
) {
    if (mask.read(gid).r == 0) {
        // Boundary: keep original
        f_next.write(f_current.read(gid), gid);
        return;
    }

    // Interior: Jacobi update
    float left  = f_current.read(gid + uint2(-1,  0)).r;
    float right = f_current.read(gid + uint2( 1,  0)).r;
    float down  = f_current.read(gid + uint2( 0, -1)).r;
    float up    = f_current.read(gid + uint2( 0,  1)).r;
    float div   = divergence.read(gid).r;

    float f_new = 0.25 * (left + right + down + up + div);

    f_next.write(float4(f_new, 0, 0, 0), gid);
}
```

**Performance**: ~20ms for 512×512 image on M2 GPU (50 iterations)

---

## Energy Function for Composition Optimization

### Total Energy

```
E(C) = α·E_semantic(C) + β·E_geometric(C) + γ·E_aesthetic(C)
```

### 1. Semantic Energy (CLIP similarity)

```python
def compute_semantic_energy(canvas):
    """Reward semantically coherent adjacencies."""
    energy = 0.0

    for (i, j) in canvas.adjacent_pairs():
        similarity = cosine_similarity(
            canvas.shards[i].clip_embedding,
            canvas.shards[j].clip_embedding
        )
        energy -= similarity  # Negative: higher similarity → lower energy

    return energy / len(canvas.adjacent_pairs())
```

### 2. Geometric Energy (boundary compatibility)

```python
def compute_geometric_energy(canvas):
    """Penalize geometric incompatibilities at junctions."""
    energy = 0.0

    for (i, j) in canvas.adjacent_pairs():
        # Tangent angle mismatch
        angle_diff = abs(canvas.tangent_angle[i] - canvas.tangent_angle[j])
        angle_diff = min(angle_diff, 180 - angle_diff)
        energy += (angle_diff / 180.0) ** 2

        # Curvature mismatch
        curv_diff = abs(canvas.curvature[i] - canvas.curvature[j])
        energy += curv_diff ** 2

    return energy / len(canvas.adjacent_pairs())
```

### 3. Aesthetic Energy (composition principles)

```python
def compute_aesthetic_energy(canvas):
    """Classical aesthetic principles."""

    # Balance: visual weight distribution
    weights = [compute_visual_weight(s) for s in canvas.shards]
    quadrants = canvas.divide_into_quadrants()
    quadrant_weights = [sum(weights[s] for s in q) for q in quadrants]
    balance = np.var(quadrant_weights)

    # Symmetry
    symmetry = compute_symmetry(canvas)

    # Density variance
    density_grid = canvas.compute_density_grid(grid_size=10)
    density_variance = np.var(density_grid)

    # Rule of thirds
    thirds_score = compute_rule_of_thirds_score(canvas)

    return (
        0.3 * balance +
        0.2 * (1 - symmetry) +
        0.3 * density_variance +
        0.2 * (1 - thirds_score)
    )
```

### Typical Weight Values

- **α = 1.0**: Semantic coherence is primary
- **β = 0.5**: Geometry important but secondary
- **γ = 0.3**: Aesthetics are subtle refinements

### User Modes

- **"Coherent"**: α=1.5, β=0.8, γ=0.2 (prioritize meaning)
- **"Balanced"**: α=1.0, β=0.5, γ=0.3 (default)
- **"Chaotic"**: α=0.2, β=0.1, γ=0.7 (prioritize aesthetics, allow surprises)

---

## Aesthetic Principles

### Rule of Thirds

```python
def compute_rule_of_thirds_score(canvas):
    """Score how well composition follows rule of thirds."""
    thirds_points = [
        (1/3, 1/3), (1/3, 2/3),
        (2/3, 1/3), (2/3, 2/3)
    ]

    salient_shards = [s for s in canvas.shards if s.salience > 0.7]

    if not salient_shards:
        return 0.5

    scores = []
    for shard in salient_shards:
        center = shard.center_normalized()
        distances = [
            np.linalg.norm(np.array(center) - np.array(tp))
            for tp in thirds_points
        ]
        min_distance = min(distances)
        score = max(0.0, 1.0 - min_distance / 0.5)
        scores.append(score * shard.salience)

    return np.mean(scores)
```

### Visual Weight

```python
def compute_visual_weight(shard):
    """
    Visual weight considers:
    - Area (larger = heavier)
    - Contrast (higher contrast = heavier)
    - Color saturation (vibrant = heavier)
    - Semantic importance (faces = heavier)
    """
    weight = shard.area / 10000.0
    weight *= (1 + shard.contrast)
    weight *= (1 + shard.saturation)

    if shard.contains_face:
        weight *= 1.5

    return weight
```

### Balance Score

```python
def compute_balance(canvas):
    """Check if visual weight is distributed evenly."""
    quadrants = canvas.divide_into_quadrants()
    weights = [
        sum(compute_visual_weight(s) for s in q)
        for q in quadrants
    ]

    variance = np.var(weights)
    return max(0.0, 1.0 - variance / 10.0)
```

### Golden Ratio

```python
def check_golden_ratio(canvas):
    """Bonus if composition exhibits φ ≈ 1.618 proportions."""
    phi = (1 + np.sqrt(5)) / 2  # 1.618...

    aspect_ratio = canvas.width / canvas.height
    aspect_score = np.exp(-abs(aspect_ratio - phi))

    return aspect_score
```

### Negative Space Quality

```python
def compute_negative_space_quality(canvas):
    """
    High-quality negative space:
    - Exists (at least 20% of canvas)
    - Is simple/clean (low variance)
    - Is strategically placed
    """
    coverage = canvas.compute_coverage()
    negative_ratio = 1.0 - coverage

    if negative_ratio < 0.2:
        return 0.0  # Too crowded
    if negative_ratio > 0.6:
        return 0.0  # Too sparse

    negative_regions = canvas.extract_negative_space()
    simplicity = 1.0 - np.mean([np.var(r) for r in negative_regions])

    return simplicity
```
