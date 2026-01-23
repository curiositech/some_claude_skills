# Perceptual Hashing Implementation Reference

## Overview

Perceptual hashing generates similar hash values for visually similar images, enabling near-duplicate detection.

## DINOHash (2025 State-of-the-Art)

**Breakthrough:** Adversarially fine-tuned self-supervised DINOv2 features.

**Advantages:**
- Higher bit-accuracy under heavy crops
- Robust to compression artifacts
- Resilient to adversarial attacks
- Outperforms classical DCT-DWT schemes and NeuralHash

```python
import torch
from transformers import AutoModel, AutoImageProcessor

class DINOHasher:
    """
    DINOHash: State-of-the-art perceptual hashing using DINOv2.
    Based on: "DINOHash: Adversarially Fine-Tuned DINOv2 Features" (2025)
    """

    def __init__(self):
        self.model = AutoModel.from_pretrained('facebook/dinov2-base')
        self.processor = AutoImageProcessor.from_pretrained('facebook/dinov2-base')
        self.model.eval()
        self.hash_bits = 128

    def compute_hash(self, image):
        """Compute perceptual hash from image."""
        inputs = self.processor(images=image, return_tensors="pt")

        with torch.no_grad():
            outputs = self.model(**inputs)
            features = outputs.last_hidden_state[:, 0]  # CLS token

        features_reduced = self.project_to_hash_space(features)
        hash_binary = (features_reduced > 0).cpu().numpy().astype(np.uint8)
        return hash_binary.flatten()

    def project_to_hash_space(self, features):
        """Project high-dimensional features to hash space."""
        if not hasattr(self, 'projection_matrix'):
            self.projection_matrix = torch.randn(
                features.shape[-1], self.hash_bits
            ) / np.sqrt(features.shape[-1])
        return features @ self.projection_matrix

    def hamming_distance(self, hash1, hash2):
        """Compute Hamming distance between two hashes."""
        return np.sum(hash1 != hash2)

    def are_duplicates(self, hash1, hash2, threshold=5):
        """Check if two hashes represent near-duplicates."""
        return self.hamming_distance(hash1, hash2) <= threshold
```

---

## Classical Perceptual Hashing

### dHash (Difference Hash) - Fastest

```python
from PIL import Image
import numpy as np

def compute_dhash(image, hash_size=8):
    """
    Compute dHash (Difference Hash).
    Fast, good for exact duplicates and minor edits.
    """
    image = image.convert('L')
    image = image.resize((hash_size + 1, hash_size), Image.LANCZOS)
    pixels = np.array(image)

    diff = pixels[:, 1:] > pixels[:, :-1]

    hash_value = 0
    for bit in diff.flatten():
        hash_value = (hash_value << 1) | int(bit)
    return hash_value


def dhash_hamming_distance(hash1, hash2):
    """Hamming distance between two dHashes."""
    return bin(hash1 ^ hash2).count('1')
```

### pHash (Perceptual Hash) - More Robust

```python
import cv2
from scipy.fftpack import dct

def compute_phash(image, hash_size=8):
    """
    Compute pHash using DCT.
    Better for near-duplicates with brightness/contrast changes.
    """
    image = image.convert('L')
    image = image.resize((hash_size * 4, hash_size * 4), Image.LANCZOS)
    pixels = np.array(image, dtype=np.float32)

    dct_coeff = dct(dct(pixels.T).T)
    dct_low = dct_coeff[:hash_size, :hash_size]
    median = np.median(dct_low)
    hash_binary = dct_low > median

    hash_value = 0
    for bit in hash_binary.flatten():
        hash_value = (hash_value << 1) | int(bit)
    return hash_value
```

---

## Hybrid Duplicate Detection Pipeline

**Strategy:** Use fast classical hashing for filtering, deep learning for refinement.

```python
class HybridDuplicateDetector:
    """
    Hybrid near-duplicate detection pipeline.
    Stage 1: Fast pHash filtering (eliminates obvious non-duplicates)
    Stage 2: DINOHash refinement (accurate near-duplicate detection)
    Stage 3: Siamese ViT verification (final confirmation)
    """

    def __init__(self):
        self.phash_index = {}
        self.dinohash_index = {}
        self.dino_hasher = DINOHasher()

    def add_photo(self, photo_id, image):
        """Add photo to index."""
        self.phash_index[photo_id] = compute_phash(image)
        self.dinohash_index[photo_id] = self.dino_hasher.compute_hash(image)

    def find_duplicates(self, aggressive=False):
        """Find all near-duplicate groups."""
        # Stage 1: Fast pHash pre-filtering
        phash_candidates = []
        photo_ids = list(self.phash_index.keys())

        for i in range(len(photo_ids)):
            for j in range(i + 1, len(photo_ids)):
                id1, id2 = photo_ids[i], photo_ids[j]
                distance = bin(self.phash_index[id1] ^ self.phash_index[id2]).count('1')
                if distance <= (10 if aggressive else 5):
                    phash_candidates.append((id1, id2, distance))

        # Stage 2: DINOHash refinement
        dino_duplicates = []
        for id1, id2, phash_dist in phash_candidates:
            dino_distance = self.dino_hasher.hamming_distance(
                self.dinohash_index[id1], self.dinohash_index[id2]
            )
            if dino_distance <= (10 if aggressive else 5):
                dino_duplicates.append((id1, id2, dino_distance))

        return self.cluster_duplicates(dino_duplicates)

    def cluster_duplicates(self, duplicate_pairs):
        """Cluster duplicate pairs into groups using union-find."""
        parent = {}

        def find(x):
            if x not in parent:
                parent[x] = x
            if parent[x] != x:
                parent[x] = find(parent[x])
            return parent[x]

        def union(x, y):
            root_x, root_y = find(x), find(y)
            if root_x != root_y:
                parent[root_x] = root_y

        for id1, id2, _ in duplicate_pairs:
            union(id1, id2)

        groups = {}
        for photo_id in set(id for pair in duplicate_pairs for id in pair[:2]):
            root = find(photo_id)
            groups.setdefault(root, []).append(photo_id)

        return list(groups.values())
```

---

## BK-Tree for Efficient Search (100K+ Photos)

```python
class BKTree:
    """
    Burkhard-Keller tree for efficient Hamming distance search.
    Enables O(log N) average-case search for perceptual hashes.
    """

    class Node:
        def __init__(self, hash_value, photo_id):
            self.hash = hash_value
            self.photo_id = photo_id
            self.children = {}

    def __init__(self):
        self.root = None

    def insert(self, photo_id, hash_value):
        """Insert photo hash into tree."""
        if self.root is None:
            self.root = self.Node(hash_value, photo_id)
        else:
            self._insert_recursive(self.root, photo_id, hash_value)

    def _insert_recursive(self, node, photo_id, hash_value):
        distance = self.hamming_distance(node.hash, hash_value)
        if distance in node.children:
            self._insert_recursive(node.children[distance], photo_id, hash_value)
        else:
            node.children[distance] = self.Node(hash_value, photo_id)

    def search(self, query_hash, threshold):
        """Find all photos within Hamming distance threshold."""
        if self.root is None:
            return []
        return self._search_recursive(self.root, query_hash, threshold)

    def _search_recursive(self, node, query_hash, threshold):
        results = []
        distance = self.hamming_distance(node.hash, query_hash)

        if distance <= threshold:
            results.append((node.photo_id, distance))

        for child_dist in range(max(0, distance - threshold),
                                distance + threshold + 1):
            if child_dist in node.children:
                results.extend(
                    self._search_recursive(node.children[child_dist],
                                         query_hash, threshold)
                )
        return results

    @staticmethod
    def hamming_distance(hash1, hash2):
        if isinstance(hash1, np.ndarray):
            return np.sum(hash1 != hash2)
        return bin(hash1 ^ hash2).count('1')
```

---

## Performance

**O(N²) for pHash comparison, but with early termination. For 10K photos:**
- Stage 1 (pHash): ~5 seconds
- Stage 2 (DINOHash on candidates): ~2 seconds
- Total: ~7 seconds for full duplicate detection

## Method Comparison

| Method | Speed | Robustness | Use Case |
|--------|-------|------------|----------|
| dHash | Fastest | Low | Exact duplicates |
| pHash | Fast | Medium | Brightness/contrast changes |
| DINOHash | Slower | High | Heavy crops, compression |
| Hybrid | Medium | Very High | Production systems |

## References

1. "DINOHash: Adversarially Fine-Tuned DINOv2 Features" (2025)
2. Neal Krawetz: dHash development
3. DCT-based pHash algorithms
