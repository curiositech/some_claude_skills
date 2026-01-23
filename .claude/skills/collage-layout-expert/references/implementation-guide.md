# Practical Implementation Guide

## Metal Shader Pipeline

### 1. Edge Extraction

```metal
kernel void extract_edge_region(
    texture2d<float, access::read> image [[texture(0)]],
    texture2d<float, access::write> edge_region [[texture(1)]],
    constant EdgeParams& params [[buffer(0)]],
    uint2 gid [[thread_position_in_grid]]
) {
    // Extract 10% strip along specified edge
    // ...
}
```

### 2. Line Detection (EDLines on GPU)

```metal
// Multi-pass: gradient → edge chains → line fitting
kernel void compute_gradients(...);
kernel void extract_edge_chains(...);
kernel void fit_line_segments(...);
```

### 3. Color Histogram

```metal
kernel void build_lab_histogram(
    texture2d<float, access::read> lab_image [[texture(0)]],
    device atomic_uint* histogram [[buffer(0)]],
    uint2 gid [[thread_position_in_grid]]
) {
    float3 lab = lab_image.read(gid).rgb;

    // Quantize to bins (8×8×8)
    uint l_bin = uint(lab.x / 100.0 * 8.0);
    uint a_bin = uint((lab.y + 128.0) / 256.0 * 8.0);
    uint b_bin = uint((lab.z + 128.0) / 256.0 * 8.0);

    uint bin_index = l_bin * 64 + a_bin * 8 + b_bin;
    atomic_fetch_add_explicit(&histogram[bin_index], 1, memory_order_relaxed);
}
```

### 4. Poisson Blending

```metal
kernel void poisson_jacobi_iteration(...);  // 50 iterations
```

---

## Core ML Integration

### Models Needed

1. **MobileSAM** (segmentation) - 5M params
2. **CLIP ViT-B/32** (embeddings) - 150M params
3. **MediaPipe Pose** (gesture detection) - 3M params

### Conversion

```python
import coremltools as ct

# Convert PyTorch → Core ML
traced_model = torch.jit.trace(model, example_input)
mlmodel = ct.convert(traced_model, inputs=[...])
mlmodel.save("model.mlpackage")
```

---

## Database Indexing

### HNSW for CLIP embeddings

```python
import hnswlib

# Initialize index
dim = 512  # CLIP dimension
index = hnswlib.Index(space='cosine', dim=dim)
index.init_index(max_elements=10000, ef_construction=200, M=16)

# Add embeddings
for i, embedding in enumerate(clip_embeddings):
    index.add_items(embedding, i)

# Query
k = 50
labels, distances = index.knn_query(query_embedding, k=k)
```

---

## Performance Targets

| Operation | Mac M2 | iPhone 15 Pro |
|-----------|--------|---------------|
| SAM segmentation (1024×1024) | 0.5s | 2s |
| Edge extraction (100 shards) | 1s | 3s |
| Line detection (EDLines, per photo) | 10ms | 20ms |
| k-NN search (10k database) | &lt;10ms | &lt;50ms |
| Greedy assembly (10-photo collage) | 0.5s | 2s |
| Poisson blending (100 junctions) | 2s | 6s |

---

## Memory Management

### Texture Compression

```swift
let descriptor = MTLTextureDescriptor()
descriptor.pixelFormat = .bc7_rgbaUnorm  // 6:1 compression
```

### Lazy Loading

```swift
// Store only feature vectors in memory
// Load textures on-demand from disk
class ShardDatabase {
    var features: [UUID: ShardFeatures]  // In memory
    var texturePaths: [UUID: URL]        // On disk

    func loadTexture(id: UUID) -> MTLTexture {
        // Load PNG from disk when needed
    }
}
```

---

## Algorithm Selection Guide

### Line Detection

| Context | Recommended |
|---------|-------------|
| Interactive generation | EDLines |
| Final high-res render | LSD |
| Teaching / legacy code | Hough |
| Deep learning pipeline | LETR |
| Mobile real-time | EDLines |

### Layout Strategy

- **Greedy Edge Growth** (MVP, Phase 4): Primary algorithm
- **Hierarchical Clustering**: Essential optimization (50x speedup)
- **Multi-Scale Matching**: Progressive refinement (10x speedup)
- **Simulated Annealing** (Phase 6): Optional refinement
- **Hockney Joiner Style**: User explicitly requests

### Color Harmonization

- **Optimal Transport**: Always use (mathematically principled)
- **Affine Approximation**: Real-time preview (fast)
- **Full Sinkhorn**: Final render (accurate)

### Blending

- **Poisson**: Seamless photographic junctions
- **Alpha Feathering**: Simple overlaps, soft edges
- **Diffusion Inpainting**: Poor-quality junctions (expensive)

---

## Error Handling

```python
def place_shard_safe(canvas, shard, position):
    if canvas.would_overlap(shard, position):
        raise PlacementError("Overlap detected")

    if canvas.is_out_of_bounds(shard, position):
        raise PlacementError("Out of bounds")

    compatibility = canvas.check_neighbor_compatibility(shard, position)
    if compatibility < 0.3:
        logger.warning(f"Low compatibility: {compatibility:.2f}")

    canvas.place(shard, position)
```

---

## Testing Strategies

```python
def test_edge_alignment():
    """Verify lines align across boundaries."""
    photo1 = load_test_photo("horizon_left.jpg")
    photo2 = load_test_photo("horizon_right.jpg")

    edge1 = extract_edge_descriptor(photo1, 'right')
    edge2 = extract_edge_descriptor(photo2, 'left')

    assert len(edge1.lines) >= 1
    assert len(edge2.lines) >= 1

    angle_diff = abs(edge1.dominant_angle - edge2.dominant_angle)
    assert angle_diff < 5.0

def test_hockney_style():
    """Verify Hockney characteristics are present."""
    collage = create_collage(photos, style='hockney_joiner')

    positions = [s.position for s in collage.shards]
    irregularity = compute_grid_irregularity(positions)
    assert 0.1 < irregularity < 0.2

    rotations = [s.rotation for s in collage.shards]
    assert np.std(rotations) > 1.0

    overlaps = count_overlaps(collage)
    assert overlaps > 0
```

---

## Python Dependencies

```bash
pip install opencv-python numpy scipy scikit-image transformers pot hnswlib
```

| Package | Purpose |
|---------|---------|
| `opencv-python` | Line detection (EDLines, LSD), image processing |
| `numpy` | Numerical computing, matrix operations |
| `scipy` | Optimization, spatial algorithms |
| `scikit-image` | Image processing, Poisson blending |
| `transformers` | CLIP embeddings |
| `pot` | Optimal transport (Wasserstein distance) |
| `hnswlib` | Fast k-NN search |
