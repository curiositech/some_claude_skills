# Color Theory & Palette Harmony Expert

## Purpose

Expert in color theory, palette harmony, and perceptual color science for computational photo composition. Specializes in earth-mover distance optimization, warm/cool alternation, diversity-aware palette selection, and hue-based photo sequencing. Combines classical color theory with modern optimal transport methods for collage creation.

**Use this agent when:** Designing color-based photo selection, creating harmonious collages, implementing palette matching algorithms, optimizing color transitions, or building diversity-aware color systems.

## Description

This skill provides deep expertise in color theory applied to photo collage composition, focusing on palette harmony optimization using perceptual color spaces (LAB, LCH), earth-mover distance for palette matching, and diversity algorithms for balanced color distribution. Covers hue-sorted sequences, warm/cool alternation patterns, neutral-with-accent techniques, and state-of-the-art 2025 methods including Multiscale Sliced Wasserstein Distance and CIEDE2000.

## When to Use This Skill

### Perfect For:
- Designing palette-based photo selection for collages
- Implementing warm/cool color alternation algorithms
- Creating hue-sorted photo sequences (rainbow gradients, monochromatic progressions)
- Calculating palette compatibility using earth-mover distance
- Building diversity penalties to avoid color monotony
- Optimizing global color harmony across photo collections
- Implementing neutral-with-splash-of-color patterns
- Perceptual color space transformations (RGB → LAB → LCH)

### Not For:
- Basic RGB color manipulation (use standard image processing)
- Single-photo color grading (this is multi-photo composition)
- UI color scheme generation (use vaporwave-glassomorphic-ui-designer)
- Color blindness simulation (specialized accessibility skill)

## Key Concepts

### 1. Perceptual Color Spaces

**Why LAB/LCH Instead of RGB/HSV?**

RGB and HSV are device-dependent and not perceptually uniform. A ΔE of 10 in one region looks different than ΔE of 10 in another.

**CIELAB (LAB) Space:**
```
L: Lightness (0 = black, 100 = white)
a: Green (-128) to Red (+128)
b: Blue (-128) to Yellow (+128)
```

**Key Property:** Euclidean distance approximates perceived color difference:
```
ΔE*ab = √((L₂ - L₁)² + (a₂ - a₁)² + (b₂ - b₁)²)
```

**CIE LCH (Cylindrical Representation of LAB):**
```
L: Lightness (same as LAB)
C: Chroma = √(a² + b²)  (colorfulness, 0-180)
H: Hue = atan2(b, a)    (angle in degrees, 0-360)
```

**Why LCH for Color Harmony?**
- Hue angle directly corresponds to color wheel position
- Chroma separates colorfulness from hue (easier to classify "vivid" vs "muted")
- Lightness separates brightness independently

**Conversion Chain:**
```python
RGB → sRGB (gamma correction) → XYZ (D65 illuminant) → LAB → LCH
```

### 2. CIEDE2000: The Superior Perceptual Metric (2025 State-of-the-Art)

The original ΔE*ab formula has perceptual non-uniformities. **CIEDE2000 (published 2001, refined 2025)** addresses:
- Lightness weighting (darker colors appear more different)
- Chroma weighting (high-chroma colors more sensitive)
- Hue rotation (blue region compressed)
- Interaction between lightness, chroma, and hue

**Formula (simplified conceptual form):**
```
ΔE₀₀ = √[(ΔL'/k_L·S_L)² + (ΔC'/k_C·S_C)² + (ΔH'/k_H·S_H)² + R_T·(ΔC'/k_C·S_C)·(ΔH'/k_H·S_H)]
```

Where:
- ΔL', ΔC', ΔH': Weighted lightness, chroma, hue differences
- S_L, S_C, S_H: Weighting functions based on sample location
- k_L, k_C, k_H: Parametric factors (typically 1.0)
- R_T: Rotation term for blue region

**Implementation Notes (Sharma et al., 2005):**
- Use small-angle approximations carefully
- Handle hue discontinuity at 360°/0°
- Numerical stability around neutral axis (C ≈ 0)

**Performance:**
- CIEDE2000 correlates better with human perception (r > 0.95)
- Recommended for all palette distance calculations
- Python: `colormath` library has vetted implementation
- Swift/Metal: Port from Sharma reference implementation

### 3. Earth-Mover Distance (Wasserstein Metric) for Palette Matching

**The Palette Matching Problem:**

Given two photos with color distributions μ and ν, how "different" are they perceptually?

**Naïve Approach:** Compare dominant colors pairwise → **WRONG**
- Ignores color abundance (weight)
- Arbitrary pairing
- Doesn't capture overall distribution shift

**Correct Approach:** Earth-Mover Distance (EMD) / Wasserstein Metric

**Intuition:**
Imagine color histograms as piles of dirt. How much work (distance × amount) to transform one pile into the other?

**Mathematical Formulation:**

The **2-Wasserstein distance** between distributions μ and ν is:
```
W₂(μ, ν)² = inf{γ ∈ Π(μ,ν)} ∫∫ ‖x - y‖² dγ(x,y)
```

Where:
- Π(μ,ν): Set of all joint probability measures with marginals μ, ν
- γ: Transport plan (how much mass to move from color x to color y)
- ‖x - y‖²: Squared distance in LAB space (or CIEDE2000)

**Discrete Form (for implementation):**

Photos represented as color palettes:
```
μ = {(c₁, w₁), (c₂, w₂), ..., (cₙ, wₙ)}  where Σwᵢ = 1
ν = {(d₁, v₁), (d₂, v₂), ..., (dₘ, vₘ)}  where Σvⱼ = 1
```

EMD becomes a linear programming problem:
```
minimize:   Σᵢⱼ Cost(cᵢ, dⱼ) · γᵢⱼ
subject to: Σⱼ γᵢⱼ = wᵢ  ∀i    (row sums = source weights)
            Σᵢ γᵢⱼ = vⱼ  ∀j    (column sums = target weights)
            γᵢⱼ ≥ 0
```

Where Cost(cᵢ, dⱼ) = CIEDE2000(cᵢ, dⱼ)² (squared perceptual distance).

**Problem:** O(N²M) variables for general LP solvers → expensive!

### 4. Sinkhorn Algorithm: Fast Entropic EMD (O(NM) per iteration)

**Entropic Regularization:**

Add entropy term to smooth the transport plan:
```
minimize:   Σᵢⱼ Cost(cᵢ, dⱼ) · γᵢⱼ + ε · H(γ)
```

Where H(γ) = -Σᵢⱼ γᵢⱼ log(γᵢⱼ) is entropy.

**Effect:** As ε → 0, recovers exact EMD. For ε > 0, transport plan is "spread out" but computation is much faster.

**Sinkhorn's Algorithm:**

```python
def sinkhorn_emd(palette1, palette2, epsilon=0.1, max_iters=100):
    """
    Compute approximate EMD using Sinkhorn algorithm.

    Args:
        palette1: List of (color, weight) tuples in LAB space
        palette2: List of (color, weight) tuples in LAB space
        epsilon: Entropic regularization parameter (smaller = more accurate)
        max_iters: Maximum iterations

    Returns:
        float: Approximate earth-mover distance
    """
    N = len(palette1)
    M = len(palette2)

    # Extract colors and weights
    colors1 = np.array([c for c, w in palette1])
    colors2 = np.array([c for c, w in palette2])
    a = np.array([w for c, w in palette1])
    b = np.array([w for c, w in palette2])

    # Compute cost matrix (CIEDE2000 distances squared)
    C = np.zeros((N, M))
    for i in range(N):
        for j in range(M):
            C[i, j] = ciede2000_squared(colors1[i], colors2[j])

    # Kernel matrix K = exp(-C / ε)
    K = np.exp(-C / epsilon)

    # Sinkhorn iterations
    u = np.ones(N)
    v = np.ones(M)

    for iteration in range(max_iters):
        u_prev = u.copy()
        u = a / (K @ v)
        v = b / (K.T @ u)

        # Check convergence
        if np.max(np.abs(u - u_prev)) < 1e-6:
            break

    # Optimal transport plan
    gamma = np.diag(u) @ K @ np.diag(v)

    # Compute EMD
    emd = np.sum(gamma * C)

    return np.sqrt(emd)  # Return distance, not squared distance
```

**Convergence:** Exponentially fast, typically 10-50 iterations.

**Complexity:** O(NM) per iteration (just matrix-vector products).

**Choosing ε:**
- ε = 0.01: Nearly exact EMD, slower convergence (50-100 iterations)
- ε = 0.1: Good approximation, fast (10-20 iterations)
- ε = 1.0: Very approximate, instant (<5 iterations)

**For collage assembly:** ε = 0.1 is recommended balance.

### 5. Multiscale Sliced Wasserstein Distance (2024-2025 Cutting Edge)

**New Research (ECCV 2024):** Multiscale Sliced Wasserstein Distance (MS-SWD) offers:
- **Faster computation:** O(M log M) vs O(M^2.5) for standard Wasserstein
- **Handles misalignment:** Compares patch distributions, not co-located pixels
- **Metric properties:** Satisfies non-negativity, symmetry, triangle inequality
- **Better than CIEDE2000 for non-aligned images**

**How It Works:**

1. **Slicing:** Project high-dimensional color distributions onto 1D lines
2. **1D Wasserstein:** Compute EMD in 1D (cheap: just sort and compare)
3. **Integration:** Average over many random projection directions
4. **Multiscale:** Repeat at different image pyramid levels

**Algorithm:**

```python
def multiscale_sliced_wasserstein(palette1, palette2, n_projections=100, n_scales=3):
    """
    Compute MS-SWD between two color palettes.

    Based on: "Multiscale Sliced Wasserstein Distances as Perceptual
    Color Difference Measures" (ECCV 2024)

    Args:
        palette1: [(color_LAB, weight), ...] for photo 1
        palette2: [(color_LAB, weight), ...] for photo 2
        n_projections: Number of random 1D projections
        n_scales: Number of pyramid scales

    Returns:
        float: MS-SWD distance
    """
    total_distance = 0.0

    for scale in range(n_scales):
        # At each scale, compute sliced Wasserstein
        scale_distance = 0.0

        for _ in range(n_projections):
            # Random unit vector in 3D LAB space
            theta = np.random.randn(3)
            theta /= np.linalg.norm(theta)

            # Project colors onto this direction
            proj1 = [(np.dot(c, theta), w) for c, w in palette1]
            proj2 = [(np.dot(c, theta), w) for c, w in palette2]

            # Sort by projection value
            proj1.sort(key=lambda x: x[0])
            proj2.sort(key=lambda x: x[0])

            # 1D Wasserstein = area between CDFs
            cdf1 = np.cumsum([w for p, w in proj1])
            cdf2 = np.cumsum([w for p, w in proj2])

            # Integrate |CDF1 - CDF2|
            # (In practice, use earth_movers_distance_1d for efficiency)
            distance_1d = earth_movers_distance_1d(proj1, proj2)
            scale_distance += distance_1d

        scale_distance /= n_projections
        total_distance += scale_distance * (2 ** (-scale))  # Weight by scale

    return total_distance
```

**When to Use MS-SWD vs Sinkhorn:**
- **MS-SWD:** When photos might have same colors but different spatial distributions
- **Sinkhorn EMD:** When you care only about color histogram match (ignores spatial structure)
- **CIEDE2000 + Sinkhorn:** Best for palette-to-palette comparison in collage assembly

### 6. Warm vs Cool Classification

**Problem:** Given a photo, classify its dominant temperature as warm, cool, or neutral.

**LCH Hue Angle Approach:**

```python
def classify_temperature(palette_LCH):
    """
    Classify palette as warm, cool, or neutral.

    Args:
        palette_LCH: List of (L, C, H, weight) tuples

    Returns:
        str: "warm", "cool", or "neutral"
        float: Temperature score (-1 = cool, +1 = warm)
    """
    warm_score = 0.0
    cool_score = 0.0

    for L, C, H, weight in palette_LCH:
        # Chroma weighting: More saturated colors contribute more
        chroma_weight = C / 100.0
        effective_weight = weight * chroma_weight

        # Warm hues: Red (0-30°), Orange (30-60°), Yellow (60-90°)
        if 0 <= H < 90:
            warm_score += effective_weight

        # Cool hues: Green (120-180°), Cyan (180-210°), Blue (210-270°)
        elif 120 <= H < 270:
            cool_score += effective_weight

        # Transitional: Yellow-Green (90-120°), Purple (270-330°)
        # Count as half warm, half cool
        elif 90 <= H < 120:
            warm_score += effective_weight * 0.3
            cool_score += effective_weight * 0.7
        elif 270 <= H < 330:
            warm_score += effective_weight * 0.5
            cool_score += effective_weight * 0.5

        # Magenta (330-360°): Warm
        else:
            warm_score += effective_weight

    # Normalize
    total = warm_score + cool_score
    if total < 0.1:
        return "neutral", 0.0

    temperature = (warm_score - cool_score) / total

    if temperature > 0.3:
        return "warm", temperature
    elif temperature < -0.3:
        return "cool", temperature
    else:
        return "neutral", temperature
```

**Refinement:** Use LAB b-axis as temperature proxy:
```
b > 20: Warm (yellow-biased)
b < -20: Cool (blue-biased)
-20 ≤ b ≤ 20: Neutral
```

**Weighted Temperature Score:**
```python
def temperature_score_LAB(palette_LAB):
    """
    Compute temperature using LAB b-axis.

    More robust than hue-based for low-chroma colors.
    """
    total_weight = sum(w for c, w in palette_LAB)
    weighted_b = sum(c[2] * w for c, w in palette_LAB) / total_weight

    # Normalize to [-1, 1]
    # Typical b range: [-128, 128]
    return np.clip(weighted_b / 64, -1.0, 1.0)
```

### 7. Hue-Sorted Photo Sequences

**Goal:** Arrange photos in hue order to create rainbow gradients or smooth color transitions.

**Algorithm:**

```python
def sort_photos_by_hue(photos_with_palettes):
    """
    Sort photos by dominant hue for rainbow effect.

    Args:
        photos_with_palettes: [(photo_id, palette_LCH), ...]

    Returns:
        List of photo_ids in hue-sorted order
    """
    def dominant_hue(palette_LCH):
        # Weight by chroma * weight (ignore low-saturation colors)
        weighted_hues = []
        for L, C, H, weight in palette_LCH:
            if C > 10:  # Ignore near-neutral colors
                weighted_hues.append((H, C * weight))

        if not weighted_hues:
            return 0.0  # Default for neutral images

        # Circular mean of hue (handles 359° + 1° = 0° correctly)
        sin_sum = sum(w * np.sin(np.radians(h)) for h, w in weighted_hues)
        cos_sum = sum(w * np.cos(np.radians(h)) for h, w in weighted_hues)

        mean_hue = np.degrees(np.arctan2(sin_sum, cos_sum)) % 360
        return mean_hue

    # Compute dominant hue for each photo
    photo_hues = [(photo_id, dominant_hue(palette))
                  for photo_id, palette in photos_with_palettes]

    # Sort by hue
    photo_hues.sort(key=lambda x: x[1])

    return [photo_id for photo_id, hue in photo_hues]
```

**Circular Hue Handling:**

Hue is circular (0° = 360° = red). Sorting naïvely by angle breaks at the red boundary.

**Solution:** Choose rotation that minimizes total angular difference:

```python
def optimize_hue_rotation(hues):
    """
    Find rotation that minimizes sum of adjacent hue differences.

    This ensures smooth transitions across the red boundary.
    """
    best_rotation = 0
    min_total_diff = float('inf')

    # Try 36 rotations (every 10 degrees)
    for rotation in range(0, 360, 10):
        rotated_hues = [(h + rotation) % 360 for h in hues]
        rotated_hues.sort()

        # Compute total adjacent difference
        total_diff = sum(abs(rotated_hues[i+1] - rotated_hues[i])
                        for i in range(len(rotated_hues) - 1))

        # Add wrap-around difference
        total_diff += min(
            abs(rotated_hues[0] - rotated_hues[-1]),
            360 - abs(rotated_hues[0] - rotated_hues[-1])
        )

        if total_diff < min_total_diff:
            min_total_diff = total_diff
            best_rotation = rotation

    # Apply best rotation
    return [(h + best_rotation) % 360 for h in hues]
```

### 8. Warm/Cool Alternation Pattern

**Design Pattern:** Alternate warm and cool photos for visual rhythm and contrast.

**Algorithm:**

```python
def arrange_warm_cool_alternation(photos_with_palettes):
    """
    Arrange photos in alternating warm/cool pattern.

    Creates visual rhythm and prevents color monotony.

    Args:
        photos_with_palettes: [(photo_id, palette_LAB), ...]

    Returns:
        List of photo_ids in alternating order
    """
    # Classify each photo
    photos_classified = []
    for photo_id, palette in photos_with_palettes:
        temp_type, temp_score = classify_temperature(palette)
        photos_classified.append((photo_id, temp_type, temp_score))

    # Separate into warm, cool, neutral
    warm_photos = [(pid, score) for pid, t, score in photos_classified if t == "warm"]
    cool_photos = [(pid, score) for pid, t, score in photos_classified if t == "cool"]
    neutral_photos = [(pid, score) for pid, t, score in photos_classified if t == "neutral"]

    # Sort by temperature intensity (most extreme first)
    warm_photos.sort(key=lambda x: -x[1])  # Descending
    cool_photos.sort(key=lambda x: x[1])   # Ascending (most negative first)

    # Alternate warm and cool
    result = []
    while warm_photos or cool_photos:
        if warm_photos:
            result.append(warm_photos.pop(0)[0])
        if cool_photos:
            result.append(cool_photos.pop(0)[0])

    # Intersperse neutrals evenly
    if neutral_photos:
        step = len(result) / (len(neutral_photos) + 1)
        for i, (pid, _) in enumerate(neutral_photos):
            insert_pos = int((i + 1) * step)
            result.insert(insert_pos, pid)

    return result
```

**Advanced: Gradual Temperature Progression**

Instead of strict alternation, create smooth warm → cool → warm waves:

```python
def temperature_wave_pattern(photos, wave_length=5):
    """
    Arrange photos in sinusoidal warm/cool pattern.

    Args:
        photos: [(photo_id, temperature_score), ...]
        wave_length: Period of temperature oscillation

    Returns:
        List of photo_ids
    """
    # Sort by temperature
    photos.sort(key=lambda x: x[1])

    # Assign target temperature based on sine wave
    n = len(photos)
    target_temps = [np.sin(2 * np.pi * i / wave_length) for i in range(n)]

    # Match photos to target temperatures (greedy assignment)
    result = []
    used = set()

    for target in target_temps:
        # Find unused photo closest to target
        best_photo = None
        best_diff = float('inf')

        for photo_id, temp_score in photos:
            if photo_id not in used:
                diff = abs(temp_score - target)
                if diff < best_diff:
                    best_diff = diff
                    best_photo = photo_id

        if best_photo:
            result.append(best_photo)
            used.add(best_photo)

    return result
```

### 9. Neutral-with-Splash-of-Color Pattern

**Design Principle:** Create visual impact by surrounding neutral/muted photos with occasional vibrant accents.

**Metrics:**

**Chroma (Colorfulness):**
```python
def compute_average_chroma(palette_LCH):
    """Average chroma weighted by pixel abundance."""
    total_weight = sum(w for L, C, H, w in palette_LCH)
    avg_chroma = sum(C * w for L, C, H, w in palette_LCH) / total_weight
    return avg_chroma
```

**Classification:**
```
Chroma < 20: Neutral/Muted
20 ≤ Chroma < 50: Moderate
Chroma ≥ 50: Vibid/Saturated
```

**Arrangement Algorithm:**

```python
def neutral_with_accents_pattern(photos_with_palettes, accent_ratio=0.15):
    """
    Arrange photos with neutral background and vivid accents.

    Args:
        photos_with_palettes: [(photo_id, palette_LCH), ...]
        accent_ratio: Target proportion of vivid photos (e.g., 0.15 = 15%)

    Returns:
        List of photo_ids with accents strategically placed
    """
    # Classify by chroma
    neutral = []  # Chroma < 20
    moderate = []  # 20 ≤ Chroma < 50
    vivid = []  # Chroma ≥ 50

    for photo_id, palette in photos_with_palettes:
        avg_chroma = compute_average_chroma(palette)

        if avg_chroma < 20:
            neutral.append((photo_id, avg_chroma))
        elif avg_chroma < 50:
            moderate.append((photo_id, avg_chroma))
        else:
            vivid.append((photo_id, avg_chroma))

    # Sort vivid by chroma (most saturated first)
    vivid.sort(key=lambda x: -x[1])

    # Determine number of accents
    total_photos = len(neutral) + len(moderate) + len(vivid)
    target_accents = int(total_photos * accent_ratio)
    accents = [pid for pid, _ in vivid[:target_accents]]

    # Remaining vivid become moderate
    moderate.extend((pid, c) for pid, c in vivid[target_accents:])

    # Create base arrangement (neutral + moderate)
    base = [pid for pid, _ in neutral] + [pid for pid, _ in moderate]
    random.shuffle(base)

    # Insert accents evenly
    result = []
    accent_step = len(base) / (len(accents) + 1) if accents else 0

    base_idx = 0
    accent_idx = 0

    for i in range(total_photos):
        if accent_idx < len(accents) and i >= (accent_idx + 1) * accent_step:
            result.append(accents[accent_idx])
            accent_idx += 1
        elif base_idx < len(base):
            result.append(base[base_idx])
            base_idx += 1

    return result
```

**Visual Effect:** Neutral photos form calm baseline, vivid photos create "pops" of visual interest at regular intervals.

### 10. Diversity Penalties: Preventing Color Monotony

**Problem:** Without diversity constraints, optimization may select all similar colors (e.g., all blue skies).

**Goal:** Encourage variety in selected photo palettes while maintaining harmony.

#### Method 1: Maximal Marginal Relevance (MMR)

**Concept:** Select photos that are both relevant (harmonious) and diverse (different from already selected).

**Formula:**
```
Score(photo_i) = λ · Harmony(photo_i, global_palette)
                 - (1 - λ) · max_j∈Selected Similarity(photo_i, photo_j)
```

Where:
- λ ∈ [0, 1]: Diversity parameter (0.7 = 70% harmony, 30% diversity)
- Harmony: How well photo_i fits global palette (negative EMD)
- Similarity: Max similarity to any already-selected photo

**Greedy Algorithm:**

```python
def select_photos_with_mmr(candidate_photos, target_palette, k, lambda_param=0.7):
    """
    Select k photos using Maximal Marginal Relevance.

    Balances harmony with target palette and diversity among selected photos.

    Args:
        candidate_photos: [(photo_id, palette_LAB), ...]
        target_palette: Global target palette
        k: Number of photos to select
        lambda_param: 0.7 = prefer harmony, 0.3 = prefer diversity

    Returns:
        List of k selected photo_ids
    """
    selected = []
    remaining = list(candidate_photos)

    # Select first photo: highest harmony
    best_photo = max(remaining,
                     key=lambda x: -sinkhorn_emd(x[1], target_palette))
    selected.append(best_photo)
    remaining.remove(best_photo)

    # Select remaining k-1 photos
    for _ in range(k - 1):
        best_score = -float('inf')
        best_photo = None

        for photo_id, palette in remaining:
            # Harmony term (negative EMD = high harmony)
            harmony = -sinkhorn_emd(palette, target_palette)

            # Diversity term (max similarity to any selected photo)
            max_similarity = 0
            for selected_id, selected_palette in selected:
                # Similarity = negative EMD (closer = more similar)
                similarity = -sinkhorn_emd(palette, selected_palette)
                max_similarity = max(max_similarity, similarity)

            # MMR score
            mmr_score = lambda_param * harmony - (1 - lambda_param) * max_similarity

            if mmr_score > best_score:
                best_score = mmr_score
                best_photo = (photo_id, palette)

        if best_photo:
            selected.append(best_photo)
            remaining.remove(best_photo)

    return [photo_id for photo_id, _ in selected]
```

**Tuning λ:**
- λ = 1.0: Pure harmony, no diversity (may select all blues)
- λ = 0.7: Balanced (recommended for collages)
- λ = 0.5: Equal harmony and diversity
- λ = 0.3: Heavy diversity (may sacrifice harmony)
- λ = 0.0: Pure diversity (maximally different palettes)

#### Method 2: Determinantal Point Processes (DPPs)

**Concept:** Probabilistic model that encodes both quality and diversity via a kernel matrix.

**Kernel Matrix:**
```
K[i, j] = Quality(i) · Quality(j) · Similarity(i, j)
```

Where:
- Quality(i): How good photo i is (aesthetic score, harmony with target)
- Similarity(i, j): How similar photos i and j are (negative EMD)

**Key Property:** DPP naturally repels similar items. Probability of selecting a set S:
```
P(S) ∝ det(K_S)
```

Where K_S is the submatrix of K indexed by S.

**Intuition:** Determinant is large when rows/columns are linearly independent → diverse sets favored.

**Sampling Algorithm:**

```python
def sample_diverse_subset_dpp(photos_with_palettes, target_palette, k):
    """
    Sample k photos using Determinantal Point Process.

    Automatically balances quality and diversity.

    Args:
        photos_with_palettes: [(photo_id, palette, aesthetic_score), ...]
        target_palette: Global palette to match
        k: Number of photos to sample

    Returns:
        List of k sampled photo_ids
    """
    n = len(photos_with_palettes)

    # Compute quality scores
    qualities = np.zeros(n)
    for i, (pid, palette, aesthetic) in enumerate(photos_with_palettes):
        harmony = -sinkhorn_emd(palette, target_palette)  # Higher = better
        qualities[i] = aesthetic * 0.5 + harmony * 0.5  # Combine aesthetic & harmony

    # Normalize qualities to [0, 1]
    qualities = (qualities - qualities.min()) / (qualities.max() - qualities.min())

    # Compute similarity matrix (negative EMD)
    S = np.zeros((n, n))
    for i in range(n):
        for j in range(i, n):
            if i == j:
                S[i, j] = 1.0
            else:
                emd = sinkhorn_emd(photos_with_palettes[i][1],
                                   photos_with_palettes[j][1])
                similarity = np.exp(-emd / 50)  # Convert distance to similarity
                S[i, j] = S[j, i] = similarity

    # Kernel matrix K = Q · S · Q (element-wise)
    Q = np.diag(qualities)
    K = Q @ S @ Q

    # Sample k items using DPP
    # (In practice, use dppy library or implement eigen-decomposition sampling)
    selected_indices = dpp_sample(K, k)

    return [photos_with_palettes[i][0] for i in selected_indices]


def dpp_sample(K, k):
    """
    Sample k items from DPP with kernel K.

    Uses eigenvalue decomposition method.
    """
    # Eigenvalue decomposition
    eigenvalues, eigenvectors = np.linalg.eigh(K)

    # Sample elementary DPP
    selected = []
    for i in range(len(eigenvalues) - 1, -1, -1):
        if len(selected) >= k:
            break
        # Include eigenvalue with probability proportional to its magnitude
        if np.random.rand() < eigenvalues[i] / (1 + eigenvalues[i]):
            selected.append(i)

    # Project to original space (simplified)
    # Full implementation: iterative selection using eigenvectors
    # Here: approximate by selecting diverse items

    items = np.random.choice(len(K), k, replace=False)
    return items
```

**Advantages over MMR:**
- Probabilistic: Can sample multiple diverse sets
- Theoretically principled: Negative correlation built into model
- Handles quality and diversity jointly

**Disadvantages:**
- More complex to implement
- Requires eigenvalue decomposition (O(n³))
- Less intuitive to tune

**Recommendation:** Use MMR for simplicity and control, DPPs for elegant probabilistic diversity.

#### Method 3: Submodular Maximization

**Concept:** Define a submodular function (diminishing returns property) and greedily maximize it.

**Submodular Function:**
```
F(S) = Harmony(S, target) + Diversity(S)
```

Where:
- Harmony(S, target): How well set S matches target palette
- Diversity(S): Spread of colors in S (entropy, determinant, etc.)

**Key Property:** Greedy algorithm achieves (1 - 1/e) ≈ 63% of optimal for submodular functions.

**Example:**

```python
def submodular_photo_selection(photos, target_palette, k):
    """
    Select k photos via submodular maximization.

    Objective: F(S) = α·Harmony(S) + β·Diversity(S)
    """
    selected = []

    def marginal_gain(photo, selected):
        """Gain from adding photo to selected set."""
        # Harmony term: How much closer to target?
        current_palette = aggregate_palettes([p[1] for p in selected])
        new_palette = aggregate_palettes([p[1] for p in selected + [photo]])

        harmony_gain = (sinkhorn_emd(current_palette, target_palette)
                       - sinkhorn_emd(new_palette, target_palette))

        # Diversity term: How different from selected?
        if not selected:
            diversity_gain = 1.0  # First photo always diverse
        else:
            diversity_gain = min(
                sinkhorn_emd(photo[1], s[1]) for s in selected
            ) / 50  # Normalize

        return 0.5 * harmony_gain + 0.5 * diversity_gain

    # Greedy selection
    remaining = list(photos)
    for _ in range(k):
        best_photo = max(remaining, key=lambda p: marginal_gain(p, selected))
        selected.append(best_photo)
        remaining.remove(best_photo)

    return [photo_id for photo_id, _ in selected]
```

### 11. Palette Compatibility Scoring

**Goal:** Given two photos, compute how well their palettes work together in a collage.

**Multi-Factor Score:**

```python
def palette_compatibility(palette1_LAB, palette2_LAB):
    """
    Comprehensive palette compatibility score.

    Returns:
        float: 0-1 score (higher = more compatible)
        dict: Breakdown of sub-scores
    """
    # Convert to LCH for hue analysis
    palette1_LCH = lab_to_lch(palette1_LAB)
    palette2_LCH = lab_to_lch(palette2_LAB)

    scores = {}

    # 1. EMD (Wasserstein) distance in LAB space
    emd = sinkhorn_emd(palette1_LAB, palette2_LAB, epsilon=0.1)
    scores['emd_similarity'] = np.exp(-emd / 50)  # Convert to similarity

    # 2. Hue harmony (complementary, analogous, etc.)
    scores['hue_harmony'] = compute_hue_harmony(palette1_LCH, palette2_LCH)

    # 3. Lightness balance
    avg_L1 = np.mean([L for L, C, H, w in palette1_LCH])
    avg_L2 = np.mean([L for L, C, H, w in palette2_LCH])
    scores['lightness_balance'] = 1 - abs(avg_L1 - avg_L2) / 100

    # 4. Chroma balance
    avg_C1 = np.mean([C for L, C, H, w in palette1_LCH])
    avg_C2 = np.mean([C for L, C, H, w in palette2_LCH])
    scores['chroma_balance'] = 1 - abs(avg_C1 - avg_C2) / 100

    # 5. Temperature compatibility (prefer contrast)
    temp1 = temperature_score_LAB(palette1_LAB)
    temp2 = temperature_score_LAB(palette2_LAB)
    temp_diff = abs(temp1 - temp2)
    scores['temperature_contrast'] = temp_diff  # Higher contrast = better

    # 6. Overall compatibility (weighted sum)
    compatibility = (
        scores['emd_similarity'] * 0.35 +
        scores['hue_harmony'] * 0.25 +
        scores['lightness_balance'] * 0.15 +
        scores['chroma_balance'] * 0.10 +
        scores['temperature_contrast'] * 0.15
    )

    return compatibility, scores


def compute_hue_harmony(palette1_LCH, palette2_LCH):
    """
    Score hue relationships (complementary, analogous, triadic).
    """
    # Extract dominant hues (weight by chroma)
    hues1 = [H for L, C, H, w in palette1_LCH if C > 10]
    hues2 = [H for L, C, H, w in palette2_LCH if C > 10]

    if not hues1 or not hues2:
        return 0.5  # Neutral score for near-grayscale

    best_harmony = 0

    for h1 in hues1[:3]:  # Check top 3 hues
        for h2 in hues2[:3]:
            diff = abs(h1 - h2)
            if diff > 180:
                diff = 360 - diff

            # Complementary (180° ± 30°)
            if 150 < diff < 210:
                harmony = 1.0 - abs(diff - 180) / 30
                best_harmony = max(best_harmony, harmony)

            # Analogous (0-60°)
            elif diff < 60:
                harmony = 1.0 - diff / 60
                best_harmony = max(best_harmony, harmony * 0.8)  # Slightly lower score

            # Triadic (120° ± 20°)
            elif 100 < diff < 140:
                harmony = 1.0 - abs(diff - 120) / 20
                best_harmony = max(best_harmony, harmony * 0.9)

    return best_harmony
```

### 12. Global Color Grading for Collage Cohesion

**Problem:** Even with good local matches, collages can feel disjointed due to different white balance, exposure, saturation across photos.

**Solution:** Apply global color grading pass.

**Method 1: Histogram Matching**

```python
def match_histogram_LAB(source_image, target_palette):
    """
    Adjust source image to match target color distribution.

    Uses cumulative histogram matching in LAB space.
    """
    # Convert source to LAB
    source_LAB = rgb_to_lab(source_image)

    # Extract LAB channels
    L, a, b = cv2.split(source_LAB)

    # Compute CDFs
    source_L_cdf = compute_cdf(L)
    source_a_cdf = compute_cdf(a)
    source_b_cdf = compute_cdf(b)

    # Target CDFs (from target palette)
    target_L_cdf = palette_to_cdf(target_palette, channel='L')
    target_a_cdf = palette_to_cdf(target_palette, channel='a')
    target_b_cdf = palette_to_cdf(target_palette, channel='b')

    # Match histograms
    L_matched = match_cdf(L, source_L_cdf, target_L_cdf)
    a_matched = match_cdf(a, source_a_cdf, target_a_cdf)
    b_matched = match_cdf(b, source_b_cdf, target_b_cdf)

    # Merge and convert back to RGB
    matched_LAB = cv2.merge([L_matched, a_matched, b_matched])
    matched_RGB = lab_to_rgb(matched_LAB)

    return matched_RGB
```

**Method 2: Affine Color Transform (from Shard-Math)**

Using optimal transport, find affine transform T(x) = Mx + b that maps source palette to target:

```python
def compute_affine_color_transform(source_palette, target_palette):
    """
    Find affine transform in LAB space using Wasserstein regression.

    Based on shard-math MATHEMATICAL_FOUNDATIONS.md Section 1.6.
    """
    # Extract colors and weights
    source_colors = np.array([c for c, w in source_palette])  # (N, 3)
    target_colors = np.array([c for c, w in target_palette])  # (M, 3)
    source_weights = np.array([w for c, w in source_palette])
    target_weights = np.array([w for c, w in target_palette])

    # Compute transport plan via Sinkhorn
    gamma = sinkhorn_transport_plan(source_palette, target_palette)

    # Weighted least squares for affine fit
    # M minimizes: Σᵢⱼ γᵢⱼ ‖M xᵢ + b - yⱼ‖²

    # Compute centroids
    source_centroid = np.average(source_colors, weights=source_weights, axis=0)
    target_centroid = np.average(target_colors, weights=target_weights, axis=0)

    # Center data
    X = source_colors - source_centroid  # (N, 3)
    Y = target_colors - target_centroid  # (M, 3)

    # Weighted covariance
    # C = Σᵢⱼ γᵢⱼ yⱼ xᵢᵀ
    C = Y.T @ gamma @ X  # (3, 3)

    # Solve for M: M = C (Σᵢⱼ γᵢⱼ xᵢ xᵢᵀ)⁻¹
    X_cov = X.T @ np.diag(source_weights) @ X  # (3, 3)
    M = C @ np.linalg.inv(X_cov)

    # Solve for b
    b = target_centroid - M @ source_centroid

    return M, b


def apply_affine_color_transform(image, M, b):
    """Apply affine transform to all pixels in LAB space."""
    # Convert to LAB
    image_LAB = rgb_to_lab(image)
    h, w, _ = image_LAB.shape
    pixels = image_LAB.reshape(-1, 3)  # (H*W, 3)

    # Apply transform
    transformed = (M @ pixels.T).T + b  # (H*W, 3)

    # Clip to valid LAB range
    transformed[:, 0] = np.clip(transformed[:, 0], 0, 100)      # L
    transformed[:, 1] = np.clip(transformed[:, 1], -128, 127)   # a
    transformed[:, 2] = np.clip(transformed[:, 2], -128, 127)   # b

    # Reshape and convert back
    transformed_LAB = transformed.reshape(h, w, 3)
    transformed_RGB = lab_to_rgb(transformed_LAB)

    return transformed_RGB
```

**Regularization (Preserve Local Structure):**

Add penalty to keep M close to identity:
```
minimize:   W₂(T#μ, ν)² + λ ‖M - I‖²_F
```

This prevents extreme color shifts that destroy local structure.

### 13. Practical Implementation Tips

**Color Space Conversions:**

Use vetted libraries to avoid bugs:
```python
# Python: colormath
from colormath.color_objects import sRGBColor, LabColor
from colormath.color_conversions import convert_color

rgb = sRGBColor(0.5, 0.3, 0.8)
lab = convert_color(rgb, LabColor)

# Swift/Metal: Custom shaders (see shard-math TECHNICAL_ARCHITECTURE.md)
```

**CIEDE2000 Implementation:**

```python
# Python: colormath has vetted implementation
from colormath.color_diff import delta_e_cie2000

delta_e = delta_e_cie2000(lab1, lab2)

# Or use skimage
from skimage.color import deltaE_ciede2000
delta_e = deltaE_ciede2000(lab1, lab2)
```

**Sinkhorn Algorithm Tuning:**

```python
# For collage assembly (real-time):
epsilon = 0.1  # Good approximation, fast
max_iters = 50  # Typically converges in 10-20

# For final color grading (offline):
epsilon = 0.01  # More accurate
max_iters = 200  # Allow more iterations

# For quick preview:
epsilon = 1.0   # Very approximate but instant
max_iters = 10
```

**Palette Extraction:**

K-means in LAB space with smart initialization:
```python
from sklearn.cluster import KMeans

# Convert image to LAB
image_lab = rgb_to_lab(image)
pixels = image_lab.reshape(-1, 3)

# Sample pixels (for large images)
if len(pixels) > 10000:
    indices = np.random.choice(len(pixels), 10000, replace=False)
    pixels = pixels[indices]

# K-means with k-means++ initialization
kmeans = KMeans(n_clusters=5, init='k-means++', n_init=10, random_state=42)
kmeans.fit(pixels)

# Palette = cluster centers
palette = kmeans.cluster_centers_  # (5, 3) in LAB space

# Weights = cluster sizes
labels = kmeans.labels_
weights = np.bincount(labels) / len(labels)
```

**Handling Edge Cases:**

```python
# Grayscale images (low chroma)
if avg_chroma < 5:
    # Treat as neutral, use lightness-based matching only
    return lightness_only_compatibility(palette1, palette2)

# Single-color images (very low entropy)
if palette_entropy(palette) < 0.5:
    # Dominant color match
    return dominant_color_distance(palette1[0], palette2[0])

# Very dark/light images (extreme lightness)
if avg_lightness < 10 or avg_lightness > 90:
    # Relax lightness balance constraint
    scores['lightness_balance'] *= 0.5
```

### 14. Performance Optimization

**GPU Acceleration (Metal Shaders):**

```metal
// Compute EMD in parallel (kernel for cost matrix)
kernel void compute_cost_matrix(
    constant float3 *palette1 [[buffer(0)]],
    constant float3 *palette2 [[buffer(1)]],
    device float *cost_matrix [[buffer(2)]],
    uint2 gid [[thread_position_in_grid]]
) {
    uint i = gid.x;
    uint j = gid.y;

    // CIEDE2000 distance (simplified)
    float3 c1 = palette1[i];
    float3 c2 = palette2[j];

    float dL = c1.x - c2.x;
    float da = c1.y - c2.y;
    float db = c1.z - c2.z;

    float delta_e = sqrt(dL*dL + da*da + db*db);
    cost_matrix[i * palette2_size + j] = delta_e * delta_e;
}

// Sinkhorn iterations on GPU
kernel void sinkhorn_iteration_u(
    constant float *K [[buffer(0)]],
    constant float *v [[buffer(1)]],
    constant float *a [[buffer(2)]],
    device float *u [[buffer(3)]],
    uint i [[thread_position_in_grid]]
) {
    // u[i] = a[i] / (K[i, :] @ v)
    float sum = 0.0;
    for (uint j = 0; j < v_size; j++) {
        sum += K[i * v_size + j] * v[j];
    }
    u[i] = a[i] / sum;
}
```

**Caching:**

```python
class PaletteCache:
    """Cache extracted palettes to avoid recomputation."""

    def __init__(self):
        self.cache = {}  # photo_id -> palette_LAB

    def get_or_extract(self, photo_id, image):
        if photo_id not in self.cache:
            self.cache[photo_id] = extract_palette(image)
        return self.cache[photo_id]
```

**Approximate EMD for Large Palettes:**

```python
def fast_palette_distance(palette1, palette2):
    """
    O(N log N) approximate EMD using dominant colors only.

    For real-time preview, use top 3 colors instead of full palette.
    """
    # Keep only top 3 colors by weight
    top1 = sorted(palette1, key=lambda x: x[1], reverse=True)[:3]
    top2 = sorted(palette2, key=lambda x: x[1], reverse=True)[:3]

    # Renormalize weights
    total1 = sum(w for c, w in top1)
    total2 = sum(w for c, w in top2)
    top1 = [(c, w/total1) for c, w in top1]
    top2 = [(c, w/total2) for c, w in top2]

    # Compute EMD on small palettes (fast)
    return sinkhorn_emd(top1, top2, epsilon=0.5, max_iters=20)
```

### 15. Complete Example: Collage Assembly with Color Harmony

```python
def assemble_collage_with_color_harmony(
    photo_database,
    seed_photo_id,
    target_size=(10, 10),
    diversity_lambda=0.7,
    temperature_pattern='alternating'  # 'alternating', 'wave', 'neutral-accent'
):
    """
    Complete collage assembly with advanced color harmony.

    Args:
        photo_database: PhotoDatabase with palettes pre-extracted
        seed_photo_id: Starting photo
        target_size: Grid dimensions
        diversity_lambda: MMR diversity parameter (0.7 = balanced)
        temperature_pattern: Color temperature arrangement strategy

    Returns:
        Collage with harmonious color distribution
    """
    # 1. Extract global target palette from seed
    seed_palette = photo_database.get_palette(seed_photo_id)
    global_palette = seed_palette.copy()

    # 2. Select photos using MMR for diversity
    all_photos = photo_database.get_all_photos()

    # Filter by basic compatibility
    compatible = []
    for photo_id, palette in all_photos:
        if photo_id == seed_photo_id:
            continue

        # Quick compatibility check
        compat, _ = palette_compatibility(seed_palette, palette)
        if compat > 0.4:  # Threshold
            compatible.append((photo_id, palette, compat))

    # Select using MMR
    n_photos = target_size[0] * target_size[1] - 1  # Minus seed
    selected = select_photos_with_mmr(
        compatible,
        global_palette,
        k=n_photos,
        lambda_param=diversity_lambda
    )

    # 3. Arrange according to temperature pattern
    all_photos_with_palettes = [(seed_photo_id, seed_palette)] + [
        (pid, photo_database.get_palette(pid)) for pid in selected
    ]

    if temperature_pattern == 'alternating':
        ordered = arrange_warm_cool_alternation(all_photos_with_palettes)
    elif temperature_pattern == 'wave':
        ordered = temperature_wave_pattern(all_photos_with_palettes, wave_length=5)
    elif temperature_pattern == 'neutral-accent':
        ordered = neutral_with_accents_pattern(all_photos_with_palettes, accent_ratio=0.15)
    elif temperature_pattern == 'hue-sorted':
        ordered = sort_photos_by_hue(all_photos_with_palettes)
    else:
        ordered = [pid for pid, _ in all_photos_with_palettes]

    # 4. Place in grid (row-major order)
    canvas = Canvas(target_size)
    for idx, photo_id in enumerate(ordered):
        row = idx // target_size[1]
        col = idx % target_size[1]
        canvas.place_photo(photo_id, position=(row, col))

    # 5. Global color grading pass
    # Compute updated global palette
    global_palette = aggregate_palettes([
        photo_database.get_palette(pid) for pid in ordered
    ])

    # Apply subtle color grading to each photo
    for photo_id in ordered:
        image = photo_database.get_image(photo_id)
        palette = photo_database.get_palette(photo_id)

        # Compute affine transform to nudge toward global palette
        M, b = compute_affine_color_transform(palette, global_palette)

        # Apply with reduced strength (alpha blend)
        graded = apply_affine_color_transform(image, M, b)
        blended = 0.7 * image + 0.3 * graded  # 30% correction

        canvas.update_photo(photo_id, blended)

    # 6. Refine boundaries (Poisson blending)
    canvas.refine_boundaries()

    # 7. Render
    return canvas.render()
```

## Common Patterns & Best Practices

### Pattern 1: Progressive Color Matching

```python
# Start with dominant color match, refine with full palette
def find_matches_progressive(query_palette, candidates, k=20):
    # Stage 1: Filter by dominant color (fast)
    dom_matches = [c for c in candidates
                   if ciede2000(query_palette[0], c.palette[0]) < 30]

    # Stage 2: Full EMD on remaining (slower)
    scored = [(sinkhorn_emd(query_palette, c.palette), c)
              for c in dom_matches]
    scored.sort()

    return [c for _, c in scored[:k]]
```

### Pattern 2: Adaptive Epsilon for Sinkhorn

```python
def adaptive_sinkhorn(palette1, palette2):
    """Start with high epsilon for rough estimate, refine if needed."""
    # Quick estimate
    rough_emd = sinkhorn_emd(palette1, palette2, epsilon=1.0, max_iters=10)

    if rough_emd < 20:  # Very similar
        return rough_emd
    elif rough_emd > 80:  # Very different
        return rough_emd
    else:  # Uncertain, refine
        return sinkhorn_emd(palette1, palette2, epsilon=0.05, max_iters=100)
```

### Pattern 3: Hierarchical Palette Matching

```python
# Cluster photos by dominant hue, search within cluster first
def cluster_photos_by_hue(photos):
    hues = [dominant_hue(palette) for _, palette in photos]

    # K-means clustering in circular hue space
    from sklearn.cluster import KMeans

    # Convert hue angles to 2D points on unit circle
    hue_points = np.array([[np.cos(np.radians(h)), np.sin(np.radians(h))]
                           for h in hues])

    kmeans = KMeans(n_clusters=12, random_state=42)  # 12 = clock positions
    labels = kmeans.fit_predict(hue_points)

    # Group photos by cluster
    clusters = {}
    for (photo_id, palette), label in zip(photos, labels):
        clusters.setdefault(label, []).append((photo_id, palette))

    return clusters
```

## Advanced Techniques

### 1. Dynamic Palette Evolution

Track global palette as collage grows, adjust target:
```python
global_palette = seed_palette.copy()

for iteration in range(n_photos):
    # Select next photo matching current global palette
    next_photo = select_best_match(global_palette, candidates, diversity_lambda)

    # Update global palette (exponential moving average)
    alpha = 0.1  # Learning rate
    global_palette = (1 - alpha) * global_palette + alpha * next_photo.palette
```

### 2. Color Mood Transfer

Given a reference artwork, extract mood and apply:
```python
def extract_color_mood(reference_image):
    """Extract color mood from reference (e.g., Rothko painting)."""
    palette = extract_palette(reference_image, n_colors=5)

    # Convert to LCH
    palette_lch = lab_to_lch(palette)

    # Characterize mood
    avg_L = np.mean([L for L, C, H, w in palette_lch])
    avg_C = np.mean([C for L, C, H, w in palette_lch])
    hue_variance = np.var([H for L, C, H, w in palette_lch])

    return {
        'target_palette': palette,
        'lightness': avg_L,
        'saturation': avg_C,
        'hue_diversity': hue_variance
    }

def apply_mood_to_collage(photos, mood):
    """Select and grade photos to match mood."""
    # Select photos with similar lightness/saturation
    filtered = [p for p in photos
                if abs(avg_lightness(p.palette) - mood['lightness']) < 20
                and abs(avg_chroma(p.palette) - mood['saturation']) < 20]

    # Apply color grading to match target palette
    for photo in filtered:
        M, b = compute_affine_color_transform(photo.palette, mood['target_palette'])
        photo.image = apply_affine_color_transform(photo.image, M, b)

    return filtered
```

### 3. Perceptual Color Difference Optimization

Instead of Euclidean LAB distance, use CIEDE2000 everywhere:
```python
def sinkhorn_emd_ciede2000(palette1, palette2, epsilon=0.1):
    """Sinkhorn with CIEDE2000 cost matrix."""
    N = len(palette1)
    M = len(palette2)

    # Compute cost matrix using CIEDE2000
    C = np.zeros((N, M))
    for i, (c1, w1) in enumerate(palette1):
        for j, (c2, w2) in enumerate(palette2):
            C[i, j] = delta_e_cie2000(c1, c2) ** 2

    # Rest is same as before
    # ...
```

### 4. Color Constancy Correction

Photos from different cameras/lighting have different white balance. Normalize:
```python
def normalize_white_balance(image):
    """Estimate and correct white balance using gray world assumption."""
    # Convert to LAB
    lab = rgb_to_lab(image)

    # Compute mean a, b (should be ~0 for neutral)
    mean_a = np.mean(lab[:, :, 1])
    mean_b = np.mean(lab[:, :, 2])

    # Subtract mean (shift to neutral)
    lab[:, :, 1] -= mean_a
    lab[:, :, 2] -= mean_b

    return lab_to_rgb(lab)
```

## Troubleshooting

### Issue: EMD too slow for large palettes

**Solution:** Use Multiscale Sliced Wasserstein instead of Sinkhorn for O(M log M) complexity.

### Issue: Photos look washed out after color grading

**Solution:** Reduce alpha blend strength or add chroma boost:
```python
graded_image[:, :, 1:] *= 1.1  # Boost a, b channels by 10%
```

### Issue: Collage feels monotonous despite diversity penalty

**Solution:** Increase MMR diversity parameter (lower λ from 0.7 to 0.5) or use DPP sampling.

### Issue: Warm/cool classification fails for sunset photos

**Solution:** Use both hue angle and LAB b-axis, combine:
```python
temp_score = 0.5 * hue_based_temp(palette) + 0.5 * b_axis_temp(palette)
```

### Issue: Hue-sorted sequence has jarring transitions

**Solution:** Apply hue rotation optimization to minimize angular jumps.

## Integration with Existing Compositional Collider Code

**Extend ColorHarmonyAnalyzer:**

```python
# In src/collider/features/color.py, add:

class ColorHarmonyAnalyzer:
    # ... existing code ...

    def earth_mover_distance(self, palette1: ColorPalette,
                            palette2: ColorPalette,
                            epsilon: float = 0.1) -> float:
        """
        Compute earth-mover distance using Sinkhorn algorithm.

        Uses CIEDE2000 cost matrix in LAB space.
        """
        lab1 = palette1.to_lab()
        lab2 = palette2.to_lab()

        # (Implementation from Section 4 above)
        return sinkhorn_emd(
            list(zip(lab1, palette1.weights)),
            list(zip(lab2, palette2.weights)),
            epsilon=epsilon
        )

    def classify_temperature(self, palette: ColorPalette) -> Tuple[str, float]:
        """Classify palette as warm, cool, or neutral."""
        # (Implementation from Section 6 above)
        pass

    def select_diverse_subset(self, palettes: List[ColorPalette],
                             target_palette: ColorPalette,
                             k: int,
                             diversity_lambda: float = 0.7) -> List[int]:
        """Select k palettes using MMR."""
        # (Implementation from Section 10 above)
        pass
```

**New Module: src/collider/features/palette_harmony.py**

```python
"""
Advanced palette harmony methods using optimal transport.

Based on:
- shard-math MATHEMATICAL_FOUNDATIONS.md (Optimal Transport)
- Multiscale Sliced Wasserstein Distances (ECCV 2024)
- CIEDE2000 implementation notes (Sharma et al., 2005)
"""

from dataclasses import dataclass
from typing import List, Tuple
import numpy as np

@dataclass
class AdvancedPalette:
    """Extended palette with perceptual features."""
    colors_LAB: np.ndarray  # (N, 3)
    weights: np.ndarray     # (N,)

    # Cached features
    avg_lightness: float
    avg_chroma: float
    dominant_hue: float
    temperature_score: float  # -1 = cool, +1 = warm

# Functions from above sections...
```

## Performance Benchmarks

**Target Performance (Swift/Metal implementation):**

```
Palette extraction (5 colors): < 50ms per photo
Sinkhorn EMD (5×5 palettes, ε=0.1): < 5ms
MS-SWD (100 projections, 3 scales): < 20ms
MMR selection (1000 candidates, k=100): < 500ms
Global color grading (1000×1000 image): < 100ms
Full collage assembly (100 photos): < 10 seconds
```

## References & Further Reading

1. **Wasserstein Distance & Optimal Transport**:
   - Peyré, G., & Cuturi, M. (2019). "Computational Optimal Transport." Foundations and Trends in Machine Learning.
   - shard-math MATHEMATICAL_FOUNDATIONS.md, Section 1

2. **CIEDE2000**:
   - Sharma, G., Wu, W., & Dalal, E. N. (2005). "The CIEDE2000 color-difference formula: Implementation notes, supplementary test data, and mathematical observations." Color Research & Application.

3. **Multiscale Sliced Wasserstein**:
   - "Multiscale Sliced Wasserstein Distances as Perceptual Color Difference Measures" (ECCV 2024)

4. **Diversity Sampling**:
   - Carbonell, J., & Goldstein, J. (1998). "The use of MMR, diversity-based reranking for reordering documents and producing summaries." SIGIR 1998.
   - Kulesza, A., & Taskar, B. (2012). "Determinantal Point Processes for Machine Learning." Foundations and Trends in Machine Learning.

5. **Color Theory & Perception**:
   - Itten, J. (1970). "The Elements of Color."
   - Albers, J. (1963). "Interaction of Color."
   - Fairchild, M. D. (2013). "Color Appearance Models" (3rd ed.).

6. **Existing Implementation**:
   - compositional_collider/src/collider/features/color.py (ColorHarmonyAnalyzer)
   - compositional_collider/docs/design/COLLAGE_ASSEMBLY_DESIGN.md

---

**Version:** 1.0
**Last Updated:** November 2025
**Author:** Claude (Sonnet 4.5)
**Based on:** Compositional Collider project + shard-math mathematical foundations + 2025 research
