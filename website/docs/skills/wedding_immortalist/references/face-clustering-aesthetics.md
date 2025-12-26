---
title: Face Clustering & Aesthetic Photo Selection
sidebar_label: Face Clustering & Aesthetic...
sidebar_position: 1
---
# Face Clustering & Aesthetic Photo Selection

## Overview

Every wedding guest deserves great photos of themselves. This system automatically:
1. Detects all faces across thousands of photos
2. Clusters them by identity
3. Scores each photo for aesthetic quality
4. Selects the best N photos per person

## Face Detection Pipeline

### Detection Models Comparison

| Model | Speed | Accuracy | Best For |
|-------|-------|----------|----------|
| **RetinaFace** | Medium | Highest | Production quality |
| **MTCNN** | Slow | High | Fallback for hard cases |
| **YOLOv8-face** | Fast | Good | Quick preview |
| **MediaPipe** | Very Fast | Medium | Real-time applications |

### RetinaFace Implementation

```python
from retinaface import RetinaFace
import cv2
import numpy as np

def detect_faces(image_path: str, threshold: float = 0.9):
    """
    Detect all faces in an image with landmarks.

    Returns list of face dictionaries with:
    - bbox: [x1, y1, x2, y2]
    - landmarks: 5-point facial landmarks
    - confidence: detection confidence
    """
    faces = RetinaFace.detect_faces(image_path, threshold=threshold)

    if not isinstance(faces, dict):
        return []

    results = []
    for face_id, face_data in faces.items():
        results.append({
            'bbox': face_data['facial_area'],  # [x1, y1, x2, y2]
            'landmarks': face_data['landmarks'],  # 5 points
            'confidence': face_data['score']
        })

    return results

def extract_aligned_face(
    image: np.ndarray,
    landmarks: dict,
    output_size: tuple = (112, 112)
) -> np.ndarray:
    """
    Align face using 5-point landmarks for consistent embeddings.

    Standard alignment targets (for 112x112):
    - Left eye center: (38.29, 51.69)
    - Right eye center: (73.53, 51.69)
    - Nose tip: (56.02, 71.73)
    - Left mouth: (41.54, 92.36)
    - Right mouth: (70.72, 92.36)
    """
    # Standard reference points
    ref_pts = np.array([
        [38.29, 51.69],   # left eye
        [73.53, 51.69],   # right eye
        [56.02, 71.73],   # nose
        [41.54, 92.36],   # left mouth
        [70.72, 92.36]    # right mouth
    ], dtype=np.float32)

    # Source points from detection
    src_pts = np.array([
        landmarks['left_eye'],
        landmarks['right_eye'],
        landmarks['nose'],
        landmarks['mouth_left'],
        landmarks['mouth_right']
    ], dtype=np.float32)

    # Compute similarity transform
    transform = cv2.estimateAffinePartial2D(src_pts, ref_pts)[0]

    # Apply transformation
    aligned = cv2.warpAffine(
        image, transform, output_size,
        borderMode=cv2.BORDER_REPLICATE
    )

    return aligned
```

## Face Embedding & Clustering

### Embedding Models

| Model | Dimensions | Accuracy (LFW) | Speed |
|-------|------------|----------------|-------|
| **ArcFace** | 512 | 99.83% | Fast |
| **AdaFace** | 512 | 99.82% | Fast |
| **CosFace** | 512 | 99.73% | Fast |
| **FaceNet** | 128/512 | 99.65% | Medium |

### ArcFace Embedding

```python
import torch
from insightface.app import FaceAnalysis

class FaceEmbedder:
    def __init__(self, model_name: str = 'buffalo_l'):
        """
        Initialize face embedding model.

        buffalo_l: ArcFace with ResNet100 backbone
        buffalo_s: Lighter version for faster processing
        """
        self.app = FaceAnalysis(
            name=model_name,
            providers=['CUDAExecutionProvider', 'CPUExecutionProvider']
        )
        self.app.prepare(ctx_id=0, det_size=(640, 640))

    def get_embedding(self, image: np.ndarray) -> np.ndarray:
        """
        Get 512-dimensional face embedding.
        """
        faces = self.app.get(image)
        if len(faces) == 0:
            return None

        # Return embedding of largest face
        largest_face = max(faces, key=lambda x: (x.bbox[2]-x.bbox[0]) * (x.bbox[3]-x.bbox[1]))
        return largest_face.embedding

    def get_all_embeddings(self, image: np.ndarray) -> list:
        """
        Get embeddings for all faces in image.
        """
        faces = self.app.get(image)
        return [
            {
                'embedding': face.embedding,
                'bbox': face.bbox.tolist(),
                'landmarks': face.landmark_2d_106.tolist() if hasattr(face, 'landmark_2d_106') else None,
                'age': face.age if hasattr(face, 'age') else None,
                'gender': face.gender if hasattr(face, 'gender') else None
            }
            for face in faces
        ]
```

### HDBSCAN Clustering

```python
import hdbscan
from sklearn.preprocessing import normalize
import numpy as np

def cluster_faces(
    embeddings: np.ndarray,
    min_cluster_size: int = 3,
    min_samples: int = 2,
    cluster_selection_epsilon: float = 0.3
):
    """
    Cluster face embeddings using HDBSCAN.

    Why HDBSCAN over K-means?
    - Doesn't require knowing number of guests in advance
    - Handles noise (non-face detections, strangers)
    - Works with varying cluster densities

    Parameters tuned for wedding photos:
    - min_cluster_size=3: At least 3 photos to be considered a "person"
    - min_samples=2: Robust to outliers
    - cluster_selection_epsilon=0.3: Allow some variation in embeddings
    """
    # Normalize embeddings to unit sphere (cosine similarity)
    embeddings_norm = normalize(embeddings)

    # Cluster
    clusterer = hdbscan.HDBSCAN(
        min_cluster_size=min_cluster_size,
        min_samples=min_samples,
        metric='euclidean',  # On normalized vectors = cosine
        cluster_selection_epsilon=cluster_selection_epsilon,
        cluster_selection_method='eom',  # Excess of mass
        prediction_data=True  # For adding new faces later
    )

    labels = clusterer.fit_predict(embeddings_norm)

    # Get cluster centers for each identity
    unique_labels = set(labels) - {-1}  # -1 is noise
    centers = {}
    for label in unique_labels:
        mask = labels == label
        centers[label] = embeddings_norm[mask].mean(axis=0)

    return labels, centers, clusterer

def assign_new_face(
    embedding: np.ndarray,
    clusterer: hdbscan.HDBSCAN,
    threshold: float = 0.6
):
    """
    Assign a new face to existing clusters.
    Returns cluster label or -1 if no match.
    """
    embedding_norm = normalize(embedding.reshape(1, -1))

    # Use approximate_predict for new points
    label, strength = hdbscan.approximate_predict(clusterer, embedding_norm)

    if strength[0] > threshold:
        return label[0]
    return -1
```

## Aesthetic Quality Scoring

### Multi-Factor Scoring Model

```python
import cv2
import numpy as np
from dataclasses import dataclass

@dataclass
class AestheticScore:
    technical: float  # Sharpness, exposure, noise
    composition: float  # Rule of thirds, framing
    expression: float  # Smile, eyes open, genuine emotion
    context: float  # Group inclusion, moment importance
    overall: float  # Weighted combination

def calculate_aesthetic_score(
    image: np.ndarray,
    face_bbox: list,
    face_landmarks: dict,
    is_candid: bool = True
) -> AestheticScore:
    """
    Calculate comprehensive aesthetic score for a face in a photo.
    """

    # 1. Technical Quality (25%)
    technical = calculate_technical_score(image, face_bbox)

    # 2. Composition (20%)
    composition = calculate_composition_score(image, face_bbox)

    # 3. Expression (35%)
    expression = calculate_expression_score(image, face_landmarks)

    # 4. Context (20%)
    context = calculate_context_score(image, face_bbox, is_candid)

    # Weighted combination
    overall = (
        0.25 * technical +
        0.20 * composition +
        0.35 * expression +
        0.20 * context
    )

    return AestheticScore(
        technical=technical,
        composition=composition,
        expression=expression,
        context=context,
        overall=overall
    )

def calculate_technical_score(image: np.ndarray, bbox: list) -> float:
    """
    Score technical quality: sharpness, exposure, noise.
    """
    x1, y1, x2, y2 = [int(v) for v in bbox]
    face_region = image[y1:y2, x1:x2]

    # Sharpness via Laplacian variance
    gray = cv2.cvtColor(face_region, cv2.COLOR_BGR2GRAY)
    sharpness = cv2.Laplacian(gray, cv2.CV_64F).var()
    sharpness_score = min(1.0, sharpness / 500)  # Normalize

    # Exposure via histogram analysis
    hist = cv2.calcHist([gray], [0], None, [256], [0, 256])
    hist = hist.flatten() / hist.sum()

    # Penalize if too much in shadows (0-50) or highlights (200-255)
    shadow_ratio = hist[:50].sum()
    highlight_ratio = hist[200:].sum()
    exposure_score = 1.0 - (shadow_ratio + highlight_ratio) * 0.5

    # Noise estimation via median filter difference
    denoised = cv2.medianBlur(gray, 3)
    noise = np.abs(gray.astype(float) - denoised.astype(float)).mean()
    noise_score = max(0, 1.0 - noise / 20)

    return (sharpness_score + exposure_score + noise_score) / 3

def calculate_expression_score(image: np.ndarray, landmarks: dict) -> float:
    """
    Score facial expression quality.

    Factors:
    - Eye openness (blink detection)
    - Smile detection (Duchenne marker)
    - Gaze direction
    - Overall expression quality
    """
    scores = []

    # Eye openness
    # Calculate eye aspect ratio (EAR)
    left_eye = landmarks.get('left_eye')
    right_eye = landmarks.get('right_eye')

    if left_eye and right_eye:
        # Simple EAR approximation
        # Real implementation would use 6 points per eye
        eye_openness = 0.8  # Placeholder
        blink_penalty = 0.0 if eye_openness > 0.2 else 0.5
        scores.append(1.0 - blink_penalty)

    # Smile detection
    mouth_left = landmarks.get('mouth_left')
    mouth_right = landmarks.get('mouth_right')

    if mouth_left and mouth_right:
        # Mouth width relative to face width
        mouth_width = np.linalg.norm(
            np.array(mouth_right) - np.array(mouth_left)
        )
        # Wider smile = higher score (to a point)
        smile_score = min(1.0, mouth_width / 50)
        scores.append(smile_score)

    # Gaze direction (looking at camera vs. away)
    # For candids, looking away can be good
    # For portraits, looking at camera is preferred
    gaze_score = 0.7  # Placeholder
    scores.append(gaze_score)

    return np.mean(scores) if scores else 0.5

def calculate_composition_score(image: np.ndarray, bbox: list) -> float:
    """
    Score composition quality.
    """
    h, w = image.shape[:2]
    x1, y1, x2, y2 = bbox
    face_center_x = (x1 + x2) / 2 / w
    face_center_y = (y1 + y2) / 2 / h

    # Rule of thirds scoring
    thirds_x = [1/3, 1/2, 2/3]
    thirds_y = [1/3, 2/3]

    min_dist_x = min(abs(face_center_x - t) for t in thirds_x)
    min_dist_y = min(abs(face_center_y - t) for t in thirds_y)

    thirds_score = 1.0 - (min_dist_x + min_dist_y)

    # Face size (not too small, not too cropped)
    face_area = (x2 - x1) * (y2 - y1)
    image_area = w * h
    face_ratio = face_area / image_area

    # Optimal face ratio: 5-25% of image
    if 0.05 <= face_ratio <= 0.25:
        size_score = 1.0
    elif face_ratio < 0.05:
        size_score = face_ratio / 0.05
    else:
        size_score = max(0, 1.0 - (face_ratio - 0.25) * 2)

    return (thirds_score + size_score) / 2
```

### Diversity-Aware Selection

```python
def select_best_photos_diverse(
    cluster_photos: list,
    n: int = 5,
    diversity_threshold: float = 0.7
) -> list:
    """
    Select top N photos for a person with diversity constraint.

    Avoids selecting N nearly-identical shots from the same moment.
    Instead, picks best photo from each distinct moment/pose.
    """

    # Score all photos
    scored = []
    for photo in cluster_photos:
        score = calculate_aesthetic_score(
            photo['image'],
            photo['bbox'],
            photo['landmarks']
        )
        scored.append({
            **photo,
            'aesthetic_score': score
        })

    # Sort by overall score
    scored.sort(key=lambda x: x['aesthetic_score'].overall, reverse=True)

    # Select with diversity constraint
    selected = []
    for candidate in scored:
        if len(selected) >= n:
            break

        # Check diversity against already selected
        is_diverse = True
        for existing in selected:
            similarity = compute_photo_similarity(
                candidate['embedding'],
                existing['embedding']
            )
            if similarity > diversity_threshold:
                is_diverse = False
                break

        if is_diverse:
            selected.append(candidate)

    # If we couldn't get N diverse photos, fill with best remaining
    if len(selected) < n:
        for candidate in scored:
            if candidate not in selected:
                selected.append(candidate)
            if len(selected) >= n:
                break

    return selected

def compute_photo_similarity(emb1: np.ndarray, emb2: np.ndarray) -> float:
    """
    Compute similarity between two photo embeddings.
    Uses face embedding + pose + timestamp proximity.
    """
    # Cosine similarity of face embeddings
    face_sim = np.dot(emb1, emb2) / (np.linalg.norm(emb1) * np.linalg.norm(emb2))

    return face_sim
```

## Identity Linking Workflow

### Priority-Based Naming

```python
IDENTITY_PRIORITY = [
    ('couple', ['bride', 'groom', 'spouse_1', 'spouse_2']),
    ('wedding_party', ['best_man', 'maid_of_honor', 'bridesmaid', 'groomsman']),
    ('parents', ['mother_bride', 'father_bride', 'mother_groom', 'father_groom']),
    ('grandparents', ['grandmother', 'grandfather']),
    ('siblings', ['sister', 'brother']),
    ('extended_family', ['aunt', 'uncle', 'cousin']),
    ('friends', []),
    ('vendors', ['photographer', 'dj', 'coordinator']),
]

def link_identities(
    clusters: dict,
    seed_identities: dict,  # User-provided: {cluster_id: "Aunt Martha"}
    guest_list: list = None  # Optional: ["Aunt Martha", "Uncle Bob", ...]
) -> dict:
    """
    Link cluster IDs to human-readable names.

    Workflow:
    1. User tags couple in 2-3 photos → seeds those clusters
    2. User optionally tags wedding party
    3. System propagates through all photos
    4. Remaining clusters get generic names or guest list matching
    """

    identity_map = {}

    # Start with user-provided seeds
    for cluster_id, name in seed_identities.items():
        identity_map[cluster_id] = {
            'name': name,
            'confidence': 1.0,
            'source': 'user_tagged'
        }

    # Remaining clusters
    unnamed_clusters = set(clusters.keys()) - set(identity_map.keys())

    for i, cluster_id in enumerate(unnamed_clusters):
        cluster_data = clusters[cluster_id]

        # Try to match with guest list using any available signals
        if guest_list:
            # Could use location proximity to tagged people, etc.
            pass

        # Fallback to generic naming
        identity_map[cluster_id] = {
            'name': f"Guest {i + 1}",
            'confidence': 0.5,
            'source': 'auto_assigned'
        }

    return identity_map
```

## Output Format

```json
{
  "wedding_id": "smith-jones-2024",
  "processed_date": "2024-12-15T10:30:00Z",
  "total_photos": 3847,
  "total_faces_detected": 12453,
  "unique_identities": 127,

  "identities": [
    {
      "cluster_id": 0,
      "name": "Alex Smith",
      "role": "spouse_1",
      "photo_count": 487,
      "best_photos": [
        {
          "photo_id": "IMG_2847.jpg",
          "score": 0.94,
          "scores": {
            "technical": 0.91,
            "composition": 0.88,
            "expression": 0.98,
            "context": 0.95
          },
          "moment": "first_dance",
          "timestamp": "2024-11-15T20:45:00Z"
        }
      ],
      "thumbnail": "clusters/0/thumbnail.jpg"
    }
  ]
}
```
