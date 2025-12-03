---
title: Face Recognition & Clustering Reference
sidebar_label: Face Recognition & Clusteri...
sidebar_position: 2
---
# Face Recognition & Clustering Reference

## Overview

Group photos by person without user labeling using face detection, embedding extraction, and clustering.

## Face Detection & Embedding Extraction

```python
from facenet_pytorch import MTCNN, InceptionResnetV1
import torch

class FaceEmbeddingExtractor:
    """Extract face embeddings using FaceNet (512-dim vectors)."""

    def __init__(self, device='cuda' if torch.cuda.is_available() else 'cpu'):
        self.device = device

        # MTCNN for face detection
        self.mtcnn = MTCNN(
            image_size=160,
            margin=0,
            min_face_size=20,
            device=self.device
        )

        # InceptionResnetV1 for embeddings
        self.resnet = InceptionResnetV1(pretrained='vggface2').eval().to(self.device)

    def extract_faces(self, image):
        """
        Detect and extract face embeddings.
        Returns: List of (face_crop, embedding, bounding_box) tuples
        """
        boxes, probs = self.mtcnn.detect(image)

        if boxes is None:
            return []

        faces = []
        for box, prob in zip(boxes, probs):
            if prob < 0.9:
                continue

            face_crop = self.mtcnn.extract(image, [box], save_path=None)[0]
            face_tensor = face_crop.unsqueeze(0).to(self.device)

            with torch.no_grad():
                embedding = self.resnet(face_tensor).cpu().numpy().flatten()

            faces.append({
                'crop': face_crop,
                'embedding': embedding,
                'bbox': box,
                'confidence': prob
            })

        return faces
```

---

## Apple-Style Two-Pass Agglomerative Clustering

**Strategy (Apple Photos 2021-2025):**
1. Extract face + upper body embeddings
2. Two-pass agglomerative clustering
3. Conservative first pass (high precision)
4. HAC second pass (increase recall)
5. Incremental updates for new photos

```python
from sklearn.cluster import AgglomerativeClustering
from scipy.spatial.distance import cosine
import numpy as np

class ApplePhotosFaceClustering:
    """
    Two-pass agglomerative clustering inspired by Apple Photos.
    Based on: "Recognizing People in Photos Through Private On-Device ML" (Apple ML, 2021)
    """

    def __init__(self):
        self.distance_threshold_pass1 = 0.4  # Conservative (high precision)
        self.distance_threshold_pass2 = 0.6  # Relaxed (increase recall)

    def cluster_faces(self, face_embeddings, photo_ids):
        """Cluster face embeddings into person clusters."""
        if len(face_embeddings) < 2:
            return {0: list(range(len(face_embeddings)))}

        embeddings = np.array(face_embeddings)

        # PASS 1: Conservative clustering
        clustering_pass1 = AgglomerativeClustering(
            n_clusters=None,
            distance_threshold=self.distance_threshold_pass1,
            linkage='average',
            metric='cosine'
        )
        labels_pass1 = clustering_pass1.fit_predict(embeddings)

        # Compute cluster centroids from pass 1
        unique_labels = np.unique(labels_pass1)
        cluster_centroids = []
        cluster_members = {}

        for label in unique_labels:
            mask = labels_pass1 == label
            cluster_emb = embeddings[mask]
            centroid = np.median(cluster_emb, axis=0)
            cluster_centroids.append(centroid)
            cluster_members[label] = np.where(mask)[0].tolist()

        # PASS 2: Merge similar clusters
        if len(cluster_centroids) > 1:
            clustering_pass2 = AgglomerativeClustering(
                n_clusters=None,
                distance_threshold=self.distance_threshold_pass2,
                linkage='average',
                metric='cosine'
            )
            centroid_labels = clustering_pass2.fit_predict(np.array(cluster_centroids))

            final_clusters = {}
            for old_label, new_label in enumerate(centroid_labels):
                if new_label not in final_clusters:
                    final_clusters[new_label] = []
                final_clusters[new_label].extend(cluster_members[old_label])
        else:
            final_clusters = cluster_members

        return final_clusters

    def incremental_update(self, existing_clusters, new_faces, new_embeddings):
        """Incrementally add new faces to existing clusters."""
        updated_clusters = existing_clusters.copy()
        unassigned_faces = []

        for face_idx, embedding in enumerate(new_embeddings):
            min_distance = float('inf')
            closest_cluster = None

            for cluster_id, face_indices in existing_clusters.items():
                cluster_embeddings = [face_embeddings[i] for i in face_indices]
                cluster_median = np.median(cluster_embeddings, axis=0)
                distance = cosine(embedding, cluster_median)

                if distance < min_distance:
                    min_distance = distance
                    closest_cluster = cluster_id

            if min_distance < self.distance_threshold_pass2:
                updated_clusters[closest_cluster].append(face_idx)
            else:
                unassigned_faces.append(face_idx)

        # Create new clusters for unassigned
        if unassigned_faces:
            next_cluster_id = max(updated_clusters.keys()) + 1
            for face_idx in unassigned_faces:
                updated_clusters[next_cluster_id] = [face_idx]
                next_cluster_id += 1

        return updated_clusters
```

---

## HDBSCAN Alternative (More Robust to Noise)

**Advantage:** Doesn't require distance threshold, automatically finds optimal clustering.

```python
import hdbscan

class HDBSCANFaceClustering:
    """
    HDBSCAN for face clustering.
    More robust than agglomerative, doesn't need threshold tuning.
    """

    def __init__(self, min_cluster_size=3, min_samples=1):
        self.min_cluster_size = min_cluster_size
        self.min_samples = min_samples

    def cluster_faces(self, face_embeddings):
        """Cluster faces using HDBSCAN."""
        if len(face_embeddings) < self.min_cluster_size:
            return np.zeros(len(face_embeddings), dtype=int)

        embeddings = np.array(face_embeddings)

        clusterer = hdbscan.HDBSCAN(
            min_cluster_size=self.min_cluster_size,
            min_samples=self.min_samples,
            metric='cosine',
            cluster_selection_method='eom'
        )

        return clusterer.fit_predict(embeddings)
```

---

## Method Comparison

| Method | Pros | Cons | Use When |
|--------|------|------|----------|
| **Agglomerative** | Fast, deterministic, Apple-proven | Needs threshold tuning | Have tuned thresholds |
| **HDBSCAN** | Automatic, robust to noise | Slower, non-deterministic | Unknown data distribution |

## Parameters

**Face Detection:**
- `min_face_size`: 20px (detect small faces)
- `confidence_threshold`: 0.9 (high confidence only)

**Clustering:**
- `distance_threshold_pass1`: 0.4 (conservative)
- `distance_threshold_pass2`: 0.6 (relaxed for recall)
- `min_cluster_size`: 3 (minimum photos of same person)

## References

1. "Recognizing People in Photos Through Private On-Device Machine Learning" (Apple ML Research, 2021)
2. FaceNet: A Unified Embedding for Face Recognition and Clustering
3. HDBSCAN: Hierarchical Density-Based Spatial Clustering (2013-2025)
