---
title: Photo Indexing Pipeline Reference
sidebar_label: Photo Indexing Pipeline Ref...
sidebar_position: 4
---
# Photo Indexing Pipeline Reference

## Quick Indexing Before First Collage

**Goal:** Efficiently index 10K+ photos before creating first collage.

**Strategy:** Pipeline with caching, batching, and GPU acceleration.

```python
class QuickPhotoIndexer:
    """
    Fast photo indexing pipeline for large libraries.

    Extracts:
    - Perceptual hashes (de-duplication)
    - Face embeddings (people clustering)
    - CLIP embeddings (semantic search)
    - Color palettes
    - Aesthetic scores

    Optimized for 10K photos in < 5 minutes.
    """

    def __init__(self, cache_dir='./photo_cache'):
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(exist_ok=True)

        self.dino_hasher = DINOHasher()
        self.face_extractor = FaceEmbeddingExtractor()
        self.clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
        self.aesthetic_scorer = NIMAPredictor()

    def index_photo_library(self, photo_paths, batch_size=32):
        """Index entire photo library."""
        index = PhotoIndex()

        # Check cache
        cached_index = self.load_cache()
        if cached_index:
            print(f"Loaded {len(cached_index)} photos from cache")
            index = cached_index

        # Find new photos
        new_photos = [p for p in photo_paths if p not in index.photos]

        if not new_photos:
            return index

        print(f"Indexing {len(new_photos)} new photos...")

        # Process in batches
        for batch_start in range(0, len(new_photos), batch_size):
            batch_paths = new_photos[batch_start:batch_start + batch_size]
            batch_images = [Image.open(p).convert('RGB') for p in batch_paths]

            # BATCHED FEATURE EXTRACTION
            hashes = [self.dino_hasher.compute_hash(img) for img in batch_images]
            clip_embeddings = self.extract_clip_batch(batch_images)
            faces_batch = [self.face_extractor.extract_faces(img) for img in batch_images]
            palettes = [extract_palette(img) for img in batch_images]
            aesthetic_scores = self.aesthetic_scorer.predict_batch(batch_images)

            # Store in index
            for i, photo_path in enumerate(batch_paths):
                index.add_photo(
                    photo_id=str(photo_path),
                    perceptual_hash=hashes[i],
                    clip_embedding=clip_embeddings[i],
                    faces=faces_batch[i],
                    color_palette=palettes[i],
                    aesthetic_score=aesthetic_scores[i]
                )

            print(f"Indexed {batch_start + len(batch_paths)}/{len(new_photos)}")

        self.save_cache(index)

        # Post-processing
        print("Clustering faces...")
        index.cluster_faces()

        print("Detecting duplicates...")
        index.detect_duplicates()

        print("Detecting events...")
        index.detect_events()

        return index

    def extract_clip_batch(self, images):
        """Extract CLIP embeddings in batch (GPU-accelerated)."""
        from transformers import CLIPProcessor

        processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
        inputs = processor(images=images, return_tensors="pt", padding=True)
        inputs = {k: v.to(self.dino_hasher.device) for k, v in inputs.items()}

        with torch.no_grad():
            embeddings = self.clip_model.get_image_features(**inputs)

        return embeddings.cpu().numpy()

    def save_cache(self, index):
        cache_path = self.cache_dir / 'photo_index.pkl'
        with open(cache_path, 'wb') as f:
            pickle.dump(index, f)

    def load_cache(self):
        cache_path = self.cache_dir / 'photo_index.pkl'
        if cache_path.exists():
            with open(cache_path, 'rb') as f:
                return pickle.load(f)
        return None
```

---

## PhotoIndex Container

```python
@dataclass
class PhotoIndex:
    """Container for all photo features."""

    photos: Dict[str, Dict] = field(default_factory=dict)
    face_clusters: Dict = field(default_factory=dict)
    duplicate_groups: List = field(default_factory=list)
    events: List = field(default_factory=list)

    def add_photo(self, photo_id, **features):
        self.photos[photo_id] = features

    def cluster_faces(self):
        """Cluster all faces using HDBSCAN."""
        all_faces = []
        for photo_id, features in self.photos.items():
            for face in features.get('faces', []):
                all_faces.append({
                    'photo_id': photo_id,
                    'embedding': face['embedding']
                })

        if len(all_faces) < 3:
            return

        embeddings = [f['embedding'] for f in all_faces]
        clusterer = HDBSCANFaceClustering(min_cluster_size=3)
        labels = clusterer.cluster_faces(embeddings)

        for face, label in zip(all_faces, labels):
            if label == -1:
                continue
            self.face_clusters.setdefault(label, []).append(face)

    def detect_duplicates(self):
        """Detect duplicate photo groups."""
        detector = HybridDuplicateDetector()

        for photo_id, features in self.photos.items():
            detector.phash_index[photo_id] = features['perceptual_hash']
            detector.dinohash_index[photo_id] = features['perceptual_hash']

        self.duplicate_groups = detector.find_duplicates()

    def detect_events(self):
        """Detect temporal events (requires timestamps + GPS)."""
        # Use ST-DBSCAN from event-detection-temporal-intelligence-expert
        pass
```

---

## Complete Curation Pipeline

```python
def curate_photos_for_collage(photo_library_path, target_count=100):
    """
    Complete curation pipeline.

    Steps:
    1. Index all photos (quick indexing)
    2. Filter inappropriate (NSFW, screenshots, mundane)
    3. De-duplicate (keep best from each group)
    4. Cluster by person (prioritize important people)
    5. Detect events (prioritize significant events)
    6. Select diverse set
    """
    # 1. QUICK INDEXING
    indexer = QuickPhotoIndexer()
    photo_paths = list(Path(photo_library_path).glob('**/*.jpg'))
    index = indexer.index_photo_library(photo_paths)

    # 2. FILTERING
    filtered_photos = []
    for photo_id, features in index.photos.items():
        if features.get('is_nsfw', False):
            continue
        if features.get('is_screenshot', False):
            continue
        if features['aesthetic_score'] < 0.3:
            continue
        filtered_photos.append(photo_id)

    # 3. DE-DUPLICATION
    duplicates_removed = set()
    for dup_group in index.duplicate_groups:
        if len(dup_group) < 2:
            continue
        best = max(dup_group, key=lambda pid: index.photos[pid]['aesthetic_score'])
        for pid in dup_group:
            if pid != best:
                duplicates_removed.add(pid)

    filtered_photos = [p for p in filtered_photos if p not in duplicates_removed]

    # 4. PRIORITIZE IMPORTANT PEOPLE
    person_importance = {}
    for cluster_id, faces in index.face_clusters.items():
        importance = min(1.0, len(faces) / 100)
        person_importance[cluster_id] = importance

    for photo_id in filtered_photos:
        faces = index.photos[photo_id].get('faces', [])
        for face in faces:
            for cluster_id, cluster_faces in index.face_clusters.items():
                if any(f['photo_id'] == photo_id for f in cluster_faces):
                    boost = person_importance.get(cluster_id, 0) * 0.2
                    index.photos[photo_id]['aesthetic_score'] += boost

    # 5. EVENT-AWARE SELECTION
    # Use event-detection-temporal-intelligence-expert

    # 6. FINAL SELECTION
    filtered_photos.sort(
        key=lambda pid: index.photos[pid]['aesthetic_score'],
        reverse=True
    )

    return filtered_photos[:target_count]
```

---

## Performance Benchmarks

**Target Performance (Swift/Metal/Core ML):**

| Operation | 10K Photos |
|-----------|-----------|
| Perceptual hashing | \< 2 minutes |
| CLIP embeddings | \< 3 minutes (GPU) |
| Face detection | \< 4 minutes |
| Color palettes | \< 1 minute |
| Aesthetic scoring | \< 2 minutes (GPU) |
| Face clustering | \< 30 seconds |
| Duplicate detection | \< 20 seconds |
| **Total (first run)** | **~13 minutes** |
| **Incremental updates** | **\< 1 minute** |

---

## Integration Points

- **event-detection-temporal-intelligence-expert**: Temporal event clustering
- **color-theory-palette-harmony-expert**: Color extraction
- **collage-layout-expert**: Photo selection for collages
- **clip-aware-embeddings**: Semantic search and similarity
