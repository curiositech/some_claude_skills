---
title: ST-DBSCAN Implementation Reference
sidebar_label: ST-DBSCAN Implementation Re...
sidebar_position: 3
---
# ST-DBSCAN Implementation Reference

## Standard DBSCAN Review

**DBSCAN (Density-Based Spatial Clustering of Applications with Noise):**

Core idea: Clusters are dense regions separated by sparse regions.

**Parameters:**
- ε (epsilon): Maximum distance for neighborhood
- MinPts: Minimum points to form dense region

```python
def dbscan(points, epsilon, min_pts):
    """
    Standard DBSCAN clustering.

    Args:
        points: List of data points
        epsilon: Neighborhood radius
        min_pts: Minimum points for core point

    Returns:
        List of cluster labels (-1 = noise)
    """
    labels = [-1] * len(points)  # -1 = unvisited
    cluster_id = 0

    for i, point in enumerate(points):
        if labels[i] != -1:
            continue  # Already visited

        # Find neighbors within epsilon
        neighbors = find_neighbors(points, point, epsilon)

        if len(neighbors) < min_pts:
            labels[i] = -2  # Mark as noise
        else:
            # Start new cluster
            expand_cluster(points, labels, i, neighbors, cluster_id,
                          epsilon, min_pts)
            cluster_id += 1

    return labels


def find_neighbors(points, query_point, epsilon):
    """Find all points within epsilon distance."""
    neighbors = []
    for i, p in enumerate(points):
        if distance(query_point, p) <= epsilon:
            neighbors.append(i)
    return neighbors


def expand_cluster(points, labels, point_idx, neighbors, cluster_id,
                   epsilon, min_pts):
    """Expand cluster by adding density-reachable points."""
    labels[point_idx] = cluster_id

    queue = list(neighbors)
    while queue:
        current_idx = queue.pop(0)

        if labels[current_idx] == -2:  # Was noise
            labels[current_idx] = cluster_id

        if labels[current_idx] != -1:  # Already processed
            continue

        labels[current_idx] = cluster_id

        # Find neighbors of current point
        current_neighbors = find_neighbors(points, points[current_idx], epsilon)

        if len(current_neighbors) >= min_pts:
            queue.extend(current_neighbors)
```

## ST-DBSCAN (Spatio-Temporal DBSCAN)

**Innovation:** Separate thresholds for spatial (ε1) and temporal (ε2) dimensions.

**Key Insight:** 100 meters apart in same minute = same event. 100 meters apart 3 days later = different events.

**Modified Neighborhood Definition:**

```
Nε1,ε2(p) = {q | spatial_dist(p, q) ≤ ε1 AND temporal_dist(p, q) ≤ ε2}
```

**Parameters:**
- ε1: Maximum spatial distance (meters, e.g., 100m)
- ε2: Maximum temporal distance (seconds, e.g., 4 hours = 14400s)
- MinPts: Minimum points for core (e.g., 3 photos)

```python
from datetime import timedelta
import numpy as np

@dataclass
class PhotoPoint:
    photo_id: str
    timestamp: datetime
    lat: float
    lon: float
    # Optional: visual_embedding for content-based clustering


def st_dbscan(photos, eps_spatial_meters, eps_temporal_seconds, min_pts):
    """
    Spatio-Temporal DBSCAN for photo event detection.

    Based on: "ST-DBSCAN: An algorithm for clustering spatial-temporal data"
              (Birant & Kut, 2007)

    Args:
        photos: List of PhotoPoint objects
        eps_spatial_meters: Maximum spatial distance (e.g., 100)
        eps_temporal_seconds: Maximum temporal distance (e.g., 4 * 3600)
        min_pts: Minimum photos for event (e.g., 3)

    Returns:
        List of cluster labels (event IDs), -1 = noise
    """
    n = len(photos)
    labels = [-1] * n
    cluster_id = 0

    for i in range(n):
        if labels[i] != -1:
            continue

        # Find spatio-temporal neighbors
        neighbors = st_neighbors(photos, i, eps_spatial_meters,
                                eps_temporal_seconds)

        if len(neighbors) < min_pts:
            labels[i] = -2  # Noise
        else:
            expand_st_cluster(photos, labels, i, neighbors, cluster_id,
                            eps_spatial_meters, eps_temporal_seconds, min_pts)
            cluster_id += 1

    return labels


def st_neighbors(photos, query_idx, eps_spatial, eps_temporal):
    """
    Find spatio-temporal neighbors.

    Both spatial AND temporal constraints must be satisfied.
    """
    query = photos[query_idx]
    neighbors = []

    for i, photo in enumerate(photos):
        # Temporal distance
        time_diff = abs((photo.timestamp - query.timestamp).total_seconds())

        # Spatial distance (Haversine formula for GPS)
        spatial_dist = haversine_distance(query.lat, query.lon,
                                         photo.lat, photo.lon)

        # Both constraints must be satisfied
        if time_diff <= eps_temporal and spatial_dist <= eps_spatial:
            neighbors.append(i)

    return neighbors


def haversine_distance(lat1, lon1, lat2, lon2):
    """
    Calculate distance between two GPS coordinates in meters.

    Uses Haversine formula for great-circle distance.
    """
    R = 6371000  # Earth radius in meters

    phi1 = np.radians(lat1)
    phi2 = np.radians(lat2)
    delta_phi = np.radians(lat2 - lat1)
    delta_lambda = np.radians(lon2 - lon1)

    a = (np.sin(delta_phi / 2) ** 2 +
         np.cos(phi1) * np.cos(phi2) * np.sin(delta_lambda / 2) ** 2)
    c = 2 * np.arctan2(np.sqrt(a), np.sqrt(1 - a))

    return R * c


def expand_st_cluster(photos, labels, point_idx, neighbors, cluster_id,
                     eps_spatial, eps_temporal, min_pts):
    """Expand cluster using spatio-temporal connectivity."""
    labels[point_idx] = cluster_id

    queue = list(neighbors)
    processed = \{point_idx\}

    while queue:
        current_idx = queue.pop(0)

        if current_idx in processed:
            continue

        processed.add(current_idx)

        if labels[current_idx] == -2:  # Was noise, add to cluster
            labels[current_idx] = cluster_id

        if labels[current_idx] != -1:  # Already in cluster
            continue

        labels[current_idx] = cluster_id

        # Find neighbors of current point
        current_neighbors = st_neighbors(photos, current_idx,
                                        eps_spatial, eps_temporal)

        if len(current_neighbors) >= min_pts:
            queue.extend(current_neighbors)
```

## DeepDBSCAN: Integrating Visual Content

**Problem:** ST-DBSCAN only uses time + GPS. What about photos taken at same place/time but of different subjects?

**Example:** Wedding at venue. Some photos are ceremony (important), some are empty chairs during setup (mundane).

**Solution:** Add visual similarity dimension using CLIP embeddings.

**Three-Dimensional Clustering:** Time × Space × Visual Content

```python
def deep_st_dbscan(photos, eps_spatial, eps_temporal, eps_visual, min_pts):
    """
    DeepDBSCAN: ST-DBSCAN + Visual Similarity.

    Based on: "DeepDBSCAN: Deep Density-Based Clustering for Geo-Tagged Photos"
              (ISPRS, 2021)

    Args:
        photos: List of PhotoPoint with .clip_embedding attribute
        eps_spatial: Spatial threshold (meters)
        eps_temporal: Temporal threshold (seconds)
        eps_visual: Visual similarity threshold (cosine distance)
        min_pts: Minimum photos for event

    Returns:
        Cluster labels
    """
    n = len(photos)
    labels = [-1] * n
    cluster_id = 0

    for i in range(n):
        if labels[i] != -1:
            continue

        # Find neighbors satisfying ALL THREE constraints
        neighbors = deep_st_neighbors(photos, i, eps_spatial,
                                      eps_temporal, eps_visual)

        if len(neighbors) < min_pts:
            labels[i] = -2  # Noise
        else:
            expand_deep_st_cluster(photos, labels, i, neighbors, cluster_id,
                                  eps_spatial, eps_temporal, eps_visual, min_pts)
            cluster_id += 1

    return labels


def deep_st_neighbors(photos, query_idx, eps_spatial, eps_temporal, eps_visual):
    """Find neighbors satisfying time, space, AND visual similarity."""
    query = photos[query_idx]
    neighbors = []

    for i, photo in enumerate(photos):
        # Temporal constraint
        time_diff = abs((photo.timestamp - query.timestamp).total_seconds())
        if time_diff > eps_temporal:
            continue

        # Spatial constraint
        spatial_dist = haversine_distance(query.lat, query.lon,
                                         photo.lat, photo.lon)
        if spatial_dist > eps_spatial:
            continue

        # Visual similarity (cosine similarity of CLIP embeddings)
        visual_sim = cosine_similarity(query.clip_embedding,
                                       photo.clip_embedding)

        # Convert similarity to distance
        visual_dist = 1 - visual_sim

        if visual_dist <= eps_visual:
            neighbors.append(i)

    return neighbors


def cosine_similarity(vec1, vec2):
    """Cosine similarity between two vectors."""
    return np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2))
```

## Parameter Tuning Guide

```
eps_spatial:  50m for indoor events, 500m for outdoor festivals, 5km for city tours
eps_temporal: 1 hour for short events, 8 hours for day trips, 24 hours for multi-day
eps_visual:   0.3 for similar subjects (all photos of ceremony), 0.5 for diverse event
min_pts:      3 for small gatherings, 10 for large events/trips
```

## Hierarchical Event Detection

**Problem:** Events have natural hierarchy. "Paris Vacation" contains "Day 1: Louvre Visit", "Day 2: Eiffel Tower", etc.

**Solution:** Multi-level ST-DBSCAN with cascading thresholds.

```python
def hierarchical_event_detection(photos):
    """
    Detect events at multiple temporal scales.

    Returns:
        Hierarchy of events (tree structure)
    """
    # Level 1: Multi-day events (vacations, trips)
    high_level_events = st_dbscan(
        photos,
        eps_spatial=50_000,  # 50km (whole city/region)
        eps_temporal=72 * 3600,  # 3 days
        min_pts=10
    )

    event_hierarchy = {}

    # Level 2: Daily events within each high-level event
    for event_id in set(high_level_events):
        if event_id == -1:  # Skip noise
            continue

        # Photos in this high-level event
        event_photos = [p for i, p in enumerate(photos)
                       if high_level_events[i] == event_id]

        # Cluster into daily sub-events
        sub_events = st_dbscan(
            event_photos,
            eps_spatial=5000,  # 5km (neighborhood)
            eps_temporal=12 * 3600,  # 12 hours
            min_pts=3
        )

        event_hierarchy[event_id] = {
            'photos': event_photos,
            'sub_events': sub_events
        }

    return event_hierarchy
```

## References

1. **ST-DBSCAN**: Birant, D., & Kut, A. (2007). "ST-DBSCAN: An algorithm for clustering spatial-temporal data." Data & Knowledge Engineering.

2. **DeepDBSCAN**: "DeepDBSCAN: Deep Density-Based Clustering for Geo-Tagged Photos" (ISPRS, 2021)

3. **HDBSCAN**: For hierarchical density-based clustering with automatic parameter selection
