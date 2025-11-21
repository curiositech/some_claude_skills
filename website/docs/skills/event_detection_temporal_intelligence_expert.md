---
title: Event Detection & Temporal Intelligence Expert
description: Expert in event detection and temporal intelligence for computer vision systems
category: Specialized Technical
sidebar_position: 17
---

# Event Detection & Temporal Intelligence Expert

<SkillHeader
  skillName="Event Detection Temporal Intelligence Expert"
  fileName="Event Detection & Temporal Intelligence Expert"
  description="Expert in event detection and temporal intelligence for computer vision systems"
/>

![Hero Banner](/img/skills/event-detection-temporal-intelligence-expert-hero.png)

## Purpose

Expert in temporal event detection, spatio-temporal clustering, and photo context understanding. Specializes in ST-DBSCAN algorithms, shareability prediction, place recognition, and event significance scoring. Combines temporal, geographic, and content analysis for intelligent photo organization and collage curation.

**Use this agent when:** Detecting photo events, clustering by time/location, predicting shareability, understanding photo context, or building event-aware photo selection systems.

## Description

This skill provides deep expertise in event detection from photo collections using spatio-temporal clustering algorithms (ST-DBSCAN, HDBSCAN), temporal pattern recognition, GPS-based location clustering, and machine learning-based shareability prediction. Covers event significance scoring, life event recognition, social context inference, and temporal diversity optimization for collage creation.

## When to Use This Skill

### Perfect For:
- Detecting events from photo timestamps and GPS coordinates
- Clustering photos by time, location, and visual content
- Scoring event significance (birthdays, weddings, travel, vs mundane daily photos)
- Predicting photo shareability for social media
- Understanding place context and location semantics
- Identifying life events (graduations, vacations, celebrations)
- Building event-aware photo selection for collages
- Temporal diversity optimization (avoiding all photos from one day)

### Not For:
- Individual photo aesthetic quality assessment (use photo-intelligence skill)
- Color palette analysis (use color-theory-palette-harmony-expert)
- Face recognition implementation (use photo-content-recognition-curation-expert)
- Single-photo timestamp extraction (basic metadata parsing)

## Key Concepts

### 1. Spatio-Temporal Clustering Fundamentals

**Problem:** How do you identify "events" from thousands of photos with timestamps and GPS coordinates?

**Naive Approach:** Cluster by time only → **FAILS** for multi-day trips or co-located events on different days

**Correct Approach:** Spatio-Temporal Density-Based Clustering (ST-DBSCAN)

#### 1.1 Standard DBSCAN Review

**DBSCAN (Density-Based Spatial Clustering of Applications with Noise):**

Core idea: Clusters are dense regions separated by sparse regions.

**Parameters:**
- ε (epsilon): Maximum distance for neighborhood
- MinPts: Minimum points to form dense region

**Algorithm:**

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

**Advantages:**
- No need to specify number of clusters K
- Finds arbitrarily shaped clusters
- Handles noise naturally

**Limitations:**
- Only considers spatial distance
- Cannot handle multi-dimensional heterogeneous data (time + space)

#### 1.2 ST-DBSCAN (Spatio-Temporal DBSCAN)

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

**Algorithm:**

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
    processed = {point_idx}

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

**Example Usage:**

```python
# Photos from vacation
photos = [
    PhotoPoint("p1", datetime(2024, 7, 1, 10, 0), 48.8566, 2.3522),  # Paris
    PhotoPoint("p2", datetime(2024, 7, 1, 10, 15), 48.8584, 2.2945), # Paris
    PhotoPoint("p3", datetime(2024, 7, 1, 11, 0), 48.8606, 2.3376),  # Paris
    PhotoPoint("p4", datetime(2024, 7, 5, 14, 0), 43.2965, 5.3698),  # Marseille
    PhotoPoint("p5", datetime(2024, 7, 5, 14, 30), 43.2961, 5.3699), # Marseille
]

# Parameters
eps_spatial = 5000  # 5km (tourist moving around city)
eps_temporal = 8 * 3600  # 8 hours (day of sightseeing)
min_pts = 2  # At least 2 photos for event

events = st_dbscan(photos, eps_spatial, eps_temporal, min_pts)
# Result: [0, 0, 0, 1, 1] → Two events (Paris visit, Marseille visit)
```

#### 1.3 DeepDBSCAN: Integrating Visual Content

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

**Parameter Tuning:**

```
eps_spatial:  50m for indoor events, 500m for outdoor festivals, 5km for city tours
eps_temporal: 1 hour for short events, 8 hours for day trips, 24 hours for multi-day
eps_visual:   0.3 for similar subjects (all photos of ceremony), 0.5 for diverse event
min_pts:      3 for small gatherings, 10 for large events/trips
```

### 2. Hierarchical Event Detection

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

**Use Case:** Collage selection can prioritize one photo per sub-event to avoid redundancy.

### 3. Event Significance Scoring

**Goal:** Not all events are equal. Birthday party > Daily commute photos.

**Multi-Factor Scoring:**

```python
class EventSignificanceScorer:
    """
    Score how significant/memorable an event is.

    Based on compositional_collider PHOTO_INTELLIGENCE_DESIGN.md Section 2C.
    """

    def score_event(self, event_photos, global_corpus):
        """
        Compute event significance (0-1 scale).

        Args:
            event_photos: Photos in this event
            global_corpus: All photos (for rarity comparison)

        Returns:
            float: Significance score
            dict: Breakdown of factors
        """
        factors = {}

        # 1. DURATION: Longer events are more significant
        duration_hours = self.compute_duration(event_photos)
        factors['duration'] = min(1.0, duration_hours / 24)  # Cap at 1 day

        # 2. PHOTO DENSITY: More photos = more memorable
        photos_per_hour = len(event_photos) / max(1, duration_hours)
        factors['density'] = min(1.0, photos_per_hour / 10)  # Cap at 10/hour

        # 3. VISUAL DIVERSITY: Special events have varied shots
        visual_diversity = self.compute_visual_diversity(event_photos)
        factors['diversity'] = visual_diversity

        # 4. PEOPLE PRESENCE: Events with people > landscapes
        people_ratio = self.count_people_photos(event_photos) / len(event_photos)
        factors['people'] = people_ratio

        # 5. LOCATION RARITY: Exotic locations > home
        location_rarity = self.compute_location_rarity(event_photos, global_corpus)
        factors['location_rarity'] = location_rarity

        # 6. CONTENT RARITY: Landmarks, weddings, celebrations
        content_rarity = self.detect_special_content(event_photos)
        factors['content'] = content_rarity

        # 7. USER ENGAGEMENT: Shared/edited photos matter more
        engagement = self.compute_engagement(event_photos)
        factors['engagement'] = engagement

        # 8. TEMPORAL RARITY: Annual events (birthdays, holidays)
        temporal_rarity = self.detect_annual_patterns(event_photos, global_corpus)
        factors['temporal'] = temporal_rarity

        # Weighted combination
        significance = (
            factors['duration'] * 0.10 +
            factors['density'] * 0.15 +
            factors['diversity'] * 0.10 +
            factors['people'] * 0.15 +
            factors['location_rarity'] * 0.20 +
            factors['content'] * 0.15 +
            factors['engagement'] * 0.10 +
            factors['temporal'] * 0.05
        )

        return significance, factors

    def compute_duration(self, event_photos):
        """Duration in hours."""
        if not event_photos:
            return 0
        timestamps = [p.timestamp for p in event_photos]
        duration = (max(timestamps) - min(timestamps)).total_seconds() / 3600
        return duration

    def compute_visual_diversity(self, event_photos):
        """
        Measure visual diversity using CLIP embeddings.

        High diversity = special event (many different scenes)
        Low diversity = mundane (all photos look similar)
        """
        if len(event_photos) < 2:
            return 0.0

        embeddings = np.array([p.clip_embedding for p in event_photos])

        # Compute pairwise cosine distances
        from scipy.spatial.distance import pdist
        distances = pdist(embeddings, metric='cosine')

        # Mean distance = diversity
        diversity = np.mean(distances)

        return min(1.0, diversity / 0.5)  # Normalize (0.5 = highly diverse)

    def count_people_photos(self, event_photos):
        """Count photos with detected faces/people."""
        return sum(1 for p in event_photos if p.has_people)

    def compute_location_rarity(self, event_photos, global_corpus):
        """
        How rare is this location in user's photo history?

        Exotic travel locations are rare, home is common.
        """
        # Get location cluster of event
        event_location = self.get_median_location(event_photos)

        # Count photos within 10km of this location in entire corpus
        nearby_count = sum(
            1 for p in global_corpus
            if haversine_distance(p.lat, p.lon,
                                 event_location[0], event_location[1]) < 10000
        )

        # Rarity = inverse frequency
        rarity = 1.0 - min(1.0, nearby_count / len(global_corpus))

        return rarity

    def detect_special_content(self, event_photos):
        """
        Detect special content using CLIP zero-shot classification.

        Special categories: landmarks, weddings, birthdays, concerts, etc.
        """
        special_categories = {
            'famous landmark': 0.9,
            'wedding ceremony': 0.95,
            'birthday party': 0.85,
            'concert performance': 0.8,
            'graduation ceremony': 0.9,
            'fireworks display': 0.85,
            'rainbow': 0.8,
            'northern lights': 0.95,
            'wildlife': 0.75,
            'sports event': 0.7,
        }

        max_score = 0
        for photo in event_photos[:10]:  # Sample first 10
            # CLIP zero-shot classification
            probs = clip_classify(photo.image, list(special_categories.keys()))

            for category, prob in probs.items():
                if prob > 0.3:  # Confidence threshold
                    score = special_categories[category] * prob
                    max_score = max(max_score, score)

        return max_score

    def compute_engagement(self, event_photos):
        """
        User engagement signals.

        Shared, edited, favorited photos indicate importance.
        """
        engagement_score = 0

        for photo in event_photos:
            if photo.is_shared:
                engagement_score += 0.3
            if photo.is_edited:
                engagement_score += 0.2
            if photo.is_favorited:
                engagement_score += 0.4
            if photo.view_count > 5:
                engagement_score += 0.1

        # Normalize by event size
        return min(1.0, engagement_score / len(event_photos))

    def detect_annual_patterns(self, event_photos, global_corpus):
        """
        Detect if event is annual (birthday, anniversary, holiday).

        High temporal rarity if similar event ~1 year ago.
        """
        event_date = event_photos[0].timestamp
        month_day = (event_date.month, event_date.day)

        # Check for photos on same month/day in previous years
        annual_occurrences = 0
        for year_offset in [1, 2, 3]:
            target_date = event_date.replace(year=event_date.year - year_offset)

            # Count photos within ±3 days of target date
            for photo in global_corpus:
                if abs((photo.timestamp - target_date).days) <= 3:
                    annual_occurrences += 1

        # Annual events have photos in multiple years
        if annual_occurrences >= 5:
            return 0.9  # Likely annual celebration
        elif annual_occurrences >= 2:
            return 0.6
        else:
            return 0.0

    def get_median_location(self, event_photos):
        """Compute median GPS coordinates."""
        lats = [p.lat for p in event_photos]
        lons = [p.lon for p in event_photos]
        return (np.median(lats), np.median(lons))
```

### 4. Shareability Prediction

**Goal:** Predict which photos are likely to be shared on social media.

**Based on:** Recent August 2025 research on predicting social media engagement from emotional and temporal features.

**Features:**

1. **Visual Features**:
   - Aesthetic quality (NIMA score)
   - Rule-of-thirds composition
   - Color vibrancy
   - Sharpness/clarity

2. **Emotional Features**:
   - Facial expressions (smiling, laughing)
   - Emotion recognition (happiness, excitement)
   - Sentiment of scene (positive, uplifting)

3. **Content Features**:
   - People count (photos with friends > solo)
   - Recognizable landmarks
   - Food/dining scenes (highly shareable)
   - Pets/animals
   - Achievements (diplomas, awards)

4. **Temporal Features**:
   - Recency (recent photos shared more)
   - Special dates (holidays, birthdays)
   - Event context (vacation > commute)

5. **Complexity & Consistency** (2025 research):
   - Visual complexity (moderate complexity most shareable)
   - Consistency with user's typical content
   - Similarity to viral content

**Model:**

```python
class ShareabilityPredictor:
    """
    Predict likelihood of photo being shared on social media.

    Based on: "Predicting Social Media Engagement from Emotional and
              Temporal Features" (arXiv 2025)
    """

    def __init__(self):
        self.model = self.load_pretrained_model()

    def predict(self, photo, event_context=None):
        """
        Predict shareability score (0-1).

        Args:
            photo: PhotoPoint with metadata
            event_context: Optional Event object for context

        Returns:
            float: Shareability score
            dict: Feature contributions
        """
        features = {}

        # VISUAL FEATURES
        features['aesthetic'] = photo.aesthetic_score
        features['composition'] = photo.composition_score
        features['vibrancy'] = self.compute_vibrancy(photo.image)
        features['sharpness'] = self.compute_sharpness(photo.image)

        # EMOTIONAL FEATURES
        if photo.has_faces:
            features['emotion_positive'] = self.detect_positive_emotion(photo)
        else:
            features['emotion_positive'] = 0.5  # Neutral

        # CONTENT FEATURES
        features['people_count'] = min(photo.face_count / 5, 1.0)  # Cap at 5
        features['has_landmark'] = 1.0 if photo.has_landmark else 0.0
        features['has_food'] = 1.0 if self.detect_food(photo) else 0.0
        features['has_pet'] = 1.0 if photo.has_pet else 0.0

        # TEMPORAL FEATURES
        days_old = (datetime.now() - photo.timestamp).days
        features['recency'] = max(0, 1 - days_old / 30)  # Decay over 30 days

        if event_context:
            features['event_significance'] = event_context.significance_score
            features['is_special_date'] = 1.0 if self.is_special_date(photo.timestamp) else 0.0
        else:
            features['event_significance'] = 0.5
            features['is_special_date'] = 0.0

        # COMPLEXITY (2025 research finding)
        complexity = self.compute_visual_complexity(photo.image)
        # Moderate complexity most shareable (inverted U-curve)
        features['optimal_complexity'] = 1.0 - abs(complexity - 0.5) * 2

        # Convert to feature vector
        feature_vector = np.array(list(features.values()))

        # Predict using trained model
        shareability = self.model.predict(feature_vector.reshape(1, -1))[0]

        return shareability, features

    def compute_vibrancy(self, image):
        """Color saturation/vibrancy."""
        hsv = cv2.cvtColor(image, cv2.COLOR_RGB2HSV)
        saturation = hsv[:, :, 1].mean() / 255
        return saturation

    def compute_sharpness(self, image):
        """Laplacian variance (focus quality)."""
        gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        return min(1.0, laplacian_var / 1000)

    def detect_positive_emotion(self, photo):
        """Average positive emotion from detected faces."""
        if not photo.faces:
            return 0.5

        emotions = [self.emotion_classifier(face.crop)
                   for face in photo.faces]

        # Positive emotions: happy, surprised (positive), excited
        positive_scores = [
            e.get('happy', 0) + e.get('surprised', 0) * 0.5
            for e in emotions
        ]

        return np.mean(positive_scores)

    def detect_food(self, photo):
        """CLIP zero-shot: Is this a food photo?"""
        prob = clip_classify(photo.image, ['food', 'meal', 'dining'])[0]
        return prob > 0.4

    def is_special_date(self, timestamp):
        """Check if date is holiday or special occasion."""
        special_dates = [
            (12, 25),  # Christmas
            (1, 1),    # New Year
            (7, 4),    # Independence Day (US)
            (10, 31),  # Halloween
            # Add more holidays
        ]

        return (timestamp.month, timestamp.day) in special_dates

    def compute_visual_complexity(self, image):
        """
        Compute visual complexity using edge density.

        Research finding: Moderate complexity (0.4-0.6) most shareable.
        """
        gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        edges = cv2.Canny(gray, 50, 150)
        complexity = edges.mean() / 255
        return complexity
```

**Training the Model:**

```python
# Collect training data from user's sharing history
def create_shareability_dataset(user_photos):
    """
    Create training dataset from user's sharing history.

    Positive examples: Photos user actually shared
    Negative examples: Photos from same events that weren't shared
    """
    X = []  # Feature vectors
    y = []  # 1 = shared, 0 = not shared

    for photo in user_photos:
        features = extract_features(photo)
        X.append(features)
        y.append(1 if photo.was_shared else 0)

    return np.array(X), np.array(y)


def train_shareability_model(X, y):
    """
    Train gradient boosting model for shareability prediction.

    Uses XGBoost for interpretability and performance.
    """
    from xgboost import XGBClassifier

    model = XGBClassifier(
        n_estimators=100,
        max_depth=5,
        learning_rate=0.1,
        objective='binary:logistic'
    )

    model.fit(X, y)

    return model
```

### 5. Place Recognition & Semantic Location

**Goal:** Understand WHERE photos were taken beyond GPS coordinates.

**Levels of Abstraction:**

1. **Raw GPS:** (40.7589, -73.9851)
2. **Address:** "Times Square, New York, NY"
3. **Semantic Place:** "Tourist landmark, entertainment district"
4. **User Context:** "Vacation destination" vs "Daily commute"

**Implementation:**

```python
class PlaceRecognizer:
    """
    Multi-level place understanding from GPS coordinates.
    """

    def __init__(self):
        self.reverse_geocoder = self.init_geocoder()  # OpenStreetMap Nominatim
        self.place_embeddings = self.load_place_embeddings()  # GeoNames + CLIP
        self.user_location_history = {}  # Track user's common places

    def analyze_location(self, lat, lon, photo_history):
        """
        Analyze location at multiple levels.

        Args:
            lat, lon: GPS coordinates
            photo_history: User's photo corpus for context

        Returns:
            dict with place analysis
        """
        analysis = {}

        # Level 1: Reverse geocoding
        address = self.reverse_geocode(lat, lon)
        analysis['address'] = address

        # Level 2: Place categorization
        place_type = self.categorize_place(address)
        analysis['place_type'] = place_type  # e.g., 'restaurant', 'park', 'landmark'

        # Level 3: Frequency in user's history
        frequency = self.compute_location_frequency(lat, lon, photo_history)
        analysis['frequency'] = frequency  # 0 = rare, 1 = common

        # Level 4: User context
        if frequency > 0.1:
            analysis['user_context'] = 'familiar'  # Home, work, frequent spots
        elif frequency > 0.01:
            analysis['user_context'] = 'occasional'
        else:
            analysis['user_context'] = 'novel'  # Travel, rare visit

        # Level 5: Semantic richness
        analysis['is_landmark'] = self.is_famous_landmark(address)
        analysis['is_natural'] = 'park' in place_type or 'beach' in place_type
        analysis['is_urban'] = 'city' in address or 'downtown' in address

        return analysis

    def reverse_geocode(self, lat, lon):
        """
        Convert GPS to human-readable address.

        Uses Nominatim (OpenStreetMap) API.
        """
        from geopy.geocoders import Nominatim

        geolocator = Nominatim(user_agent="photo_collage_app")
        location = geolocator.reverse(f"{lat}, {lon}", language='en')

        return location.address if location else "Unknown"

    def categorize_place(self, address):
        """
        Categorize place type from address.

        Uses keyword matching + GeoNames database.
        """
        address_lower = address.lower()

        place_keywords = {
            'landmark': ['tower', 'monument', 'statue', 'palace', 'temple'],
            'restaurant': ['restaurant', 'cafe', 'bistro', 'diner'],
            'park': ['park', 'garden', 'trail', 'forest'],
            'beach': ['beach', 'coast', 'shore'],
            'museum': ['museum', 'gallery', 'exhibition'],
            'venue': ['stadium', 'arena', 'theater', 'concert hall'],
            'transit': ['airport', 'station', 'terminal'],
        }

        for place_type, keywords in place_keywords.items():
            if any(kw in address_lower for kw in keywords):
                return place_type

        return 'generic'

    def compute_location_frequency(self, lat, lon, photo_history):
        """
        How often does user visit this location?

        Returns: 0 (never) to 1 (very frequent)
        """
        # Count photos within 500m
        nearby_count = sum(
            1 for photo in photo_history
            if haversine_distance(lat, lon, photo.lat, photo.lon) < 500
        )

        frequency = nearby_count / len(photo_history)
        return frequency

    def is_famous_landmark(self, address):
        """
        Check if location is famous landmark.

        Uses GeoNames + Wikipedia API.
        """
        # Query GeoNames API for points of interest
        # OR: Use pre-compiled landmark database

        landmark_keywords = [
            'eiffel tower', 'statue of liberty', 'taj mahal',
            'colosseum', 'pyramids', 'great wall',
            'big ben', 'opera house', 'golden gate',
        ]

        address_lower = address.lower()
        return any(landmark in address_lower for landmark in landmark_keywords)
```

**Location-Based Event Labeling:**

```python
def label_event_by_location(event_photos, place_recognizer):
    """
    Automatically label event based on location.

    Examples:
    - "Trip to Paris"
    - "Visit to Grandma's House"
    - "Yellowstone National Park"
    """
    # Get median location
    median_lat = np.median([p.lat for p in event_photos])
    median_lon = np.median([p.lon for p in event_photos])

    # Analyze place
    place_analysis = place_recognizer.analyze_location(
        median_lat, median_lon, event_photos
    )

    # Generate label
    if place_analysis['is_landmark']:
        # Extract landmark name from address
        landmark_name = extract_landmark_name(place_analysis['address'])
        return f"Visit to {landmark_name}"

    elif place_analysis['user_context'] == 'novel':
        # Extract city/country
        city = extract_city(place_analysis['address'])
        return f"Trip to {city}"

    elif place_analysis['user_context'] == 'familiar':
        return "At Home"

    else:
        return place_analysis['place_type'].title()
```

### 6. Temporal Diversity for Collage Selection

**Problem:** Without diversity constraints, all photos might come from single event (e.g., all from last vacation).

**Goal:** Ensure temporal spread across photo collection.

**Method 1: Temporal Binning**

```python
def select_photos_with_temporal_diversity(photos, target_count, bin_size_days=7):
    """
    Select photos with temporal diversity.

    Ensures photos span entire collection timeframe.

    Args:
        photos: List of PhotoPoint objects
        target_count: Number of photos to select
        bin_size_days: Size of temporal bins (e.g., 7 = one photo per week)

    Returns:
        Selected photos with temporal spread
    """
    # Sort by timestamp
    photos = sorted(photos, key=lambda p: p.timestamp)

    # Find time range
    min_time = photos[0].timestamp
    max_time = photos[-1].timestamp
    total_days = (max_time - min_time).days

    # Create temporal bins
    num_bins = max(1, total_days // bin_size_days)

    bins = [[] for _ in range(num_bins)]

    for photo in photos:
        days_since_start = (photo.timestamp - min_time).days
        bin_idx = min(days_since_start // bin_size_days, num_bins - 1)
        bins[bin_idx].append(photo)

    # Select best photo from each bin
    selected = []
    photos_per_bin = max(1, target_count // num_bins)

    for bin_photos in bins:
        if not bin_photos:
            continue

        # Sort by quality
        bin_photos.sort(key=lambda p: p.aesthetic_score, reverse=True)

        # Select top N from this bin
        selected.extend(bin_photos[:photos_per_bin])

    # If under target, add more from best bins
    if len(selected) < target_count:
        remaining = target_count - len(selected)

        # Flatten remaining photos
        all_remaining = [p for bin in bins for p in bin if p not in selected]
        all_remaining.sort(key=lambda p: p.aesthetic_score, reverse=True)

        selected.extend(all_remaining[:remaining])

    return selected[:target_count]
```

**Method 2: Temporal MMR (Maximal Marginal Relevance)**

```python
def select_photos_temporal_mmr(photos, target_count, lambda_temporal=0.5):
    """
    Select photos using MMR with temporal diversity.

    Args:
        photos: List of PhotoPoint objects
        target_count: Number to select
        lambda_temporal: Diversity parameter (0.5 = balanced)

    Returns:
        Selected photos
    """
    selected = []

    # Select first photo: highest quality
    best_photo = max(photos, key=lambda p: p.aesthetic_score)
    selected.append(best_photo)
    remaining = [p for p in photos if p != best_photo]

    # Select remaining
    for _ in range(target_count - 1):
        best_score = -float('inf')
        best_photo = None

        for photo in remaining:
            # Quality score
            quality = photo.aesthetic_score

            # Temporal diversity: min distance to selected photos
            min_time_diff = min(
                abs((photo.timestamp - s.timestamp).total_seconds())
                for s in selected
            )

            # Normalize time diff (closer in time = higher penalty)
            # Use exponential decay
            temporal_diversity = 1 - np.exp(-min_time_diff / (7 * 24 * 3600))  # 7 days

            # MMR score
            mmr_score = lambda_temporal * quality + (1 - lambda_temporal) * temporal_diversity

            if mmr_score > best_score:
                best_score = mmr_score
                best_photo = photo

        if best_photo:
            selected.append(best_photo)
            remaining.remove(best_photo)

    return selected
```

**Method 3: Event-Based Diversity**

```python
def select_photos_event_diversity(events, photos_per_event=2):
    """
    Select photos ensuring representation from each significant event.

    Args:
        events: List of Event objects (from ST-DBSCAN)
        photos_per_event: Photos to select per event

    Returns:
        Selected photos
    """
    selected = []

    # Sort events by significance
    events.sort(key=lambda e: e.significance_score, reverse=True)

    for event in events:
        # Sort photos in event by quality
        event.photos.sort(key=lambda p: p.aesthetic_score, reverse=True)

        # Select top N
        selected.extend(event.photos[:photos_per_event])

    return selected
```

### 7. Life Event Recognition

**Goal:** Automatically detect major life events (graduations, weddings, births, etc.)

**Approach:** Multi-modal analysis combining time, place, content, people.

```python
class LifeEventDetector:
    """
    Detect major life events from photo collection.
    """

    def detect_life_events(self, photo_corpus):
        """
        Scan corpus for life events.

        Returns:
            List of LifeEvent objects
        """
        life_events = []

        # Detect using multiple signals
        life_events.extend(self.detect_graduations(photo_corpus))
        life_events.extend(self.detect_weddings(photo_corpus))
        life_events.extend(self.detect_births(photo_corpus))
        life_events.extend(self.detect_moves(photo_corpus))
        life_events.extend(self.detect_travel_milestones(photo_corpus))

        return life_events

    def detect_graduations(self, photos):
        """
        Detect graduation events.

        Signals: Academic regalia, diplomas, ceremony settings
        """
        graduation_events = []

        for event in self.cluster_events(photos):
            signals = {
                'cap_gown': 0,
                'diploma': 0,
                'auditorium': 0,
                'formal_group': 0,
            }

            for photo in event.photos:
                # CLIP zero-shot classification
                probs = clip_classify(photo.image, [
                    'graduation cap and gown',
                    'diploma certificate',
                    'auditorium ceremony',
                    'formal group photo',
                ])

                for key, prob in zip(signals.keys(), probs):
                    if prob > 0.4:
                        signals[key] = max(signals[key], prob)

            # Confidence: weighted sum
            confidence = (
                signals['cap_gown'] * 0.4 +
                signals['diploma'] * 0.3 +
                signals['auditorium'] * 0.2 +
                signals['formal_group'] * 0.1
            )

            if confidence > 0.6:
                graduation_events.append(LifeEvent(
                    type='graduation',
                    timestamp=event.start_time,
                    photos=event.photos,
                    confidence=confidence
                ))

        return graduation_events

    def detect_weddings(self, photos):
        """
        Detect wedding events.

        Signals: Formal attire, flowers, rings, venue
        """
        wedding_events = []

        for event in self.cluster_events(photos):
            signals = clip_classify_batch(event.photos, [
                'wedding dress and tuxedo',
                'wedding bouquet',
                'wedding rings',
                'wedding ceremony venue',
                'wedding cake',
            ])

            avg_signals = np.mean(signals, axis=0)
            confidence = np.max(avg_signals)

            if confidence > 0.7:
                wedding_events.append(LifeEvent(
                    type='wedding',
                    timestamp=event.start_time,
                    photos=event.photos,
                    confidence=confidence
                ))

        return wedding_events

    def detect_births(self, photos):
        """
        Detect newborn/birth events.

        Signals: Hospital setting, newborn, multiple photos of same baby
        """
        # Look for sudden appearance of new face cluster (newborn)
        face_clusters = self.face_clusterer.cluster_all_faces(photos)

        for cluster_id, faces in face_clusters.items():
            # Check if cluster starts at specific time (birth)
            first_appearance = min(f.photo.timestamp for f in faces)
            cluster_duration = (max(f.photo.timestamp for f in faces) -
                              first_appearance).days

            # Infant detection
            infant_scores = [clip_classify(f.crop, ['infant', 'newborn'])[0]
                           for f in faces[:10]]  # Sample

            avg_infant_score = np.mean(infant_scores)

            if avg_infant_score > 0.8 and cluster_duration < 365:
                # Likely a newborn
                birth_events.append(LifeEvent(
                    type='birth',
                    timestamp=first_appearance,
                    photos=[f.photo for f in faces],
                    confidence=avg_infant_score,
                    metadata={'person_cluster_id': cluster_id}
                ))

        return birth_events

    def detect_moves(self, photos):
        """
        Detect residential moves.

        Signal: Sudden permanent shift in common photo location
        """
        # Cluster photos by location
        location_clusters = self.cluster_by_location(photos)

        # Sort by time
        for cluster in location_clusters:
            cluster.photos.sort(key=lambda p: p.timestamp)

        # Detect transitions
        moves = []

        for i in range(len(location_clusters) - 1):
            cluster_a = location_clusters[i]
            cluster_b = location_clusters[i + 1]

            # Check if clusters are in different cities
            distance = haversine_distance(
                cluster_a.median_location[0], cluster_a.median_location[1],
                cluster_b.median_location[0], cluster_b.median_location[1]
            )

            if distance > 50_000:  # 50km = different city
                # Check if transition is permanent (cluster_b continues)
                duration_b = (cluster_b.photos[-1].timestamp -
                            cluster_b.photos[0].timestamp).days

                if duration_b > 30:  # Permanent move (>30 days)
                    transition_time = cluster_b.photos[0].timestamp

                    moves.append(LifeEvent(
                        type='residential_move',
                        timestamp=transition_time,
                        photos=cluster_b.photos[:20],  # Sample
                        confidence=0.8,
                        metadata={
                            'from': self.get_city_name(cluster_a.median_location),
                            'to': self.get_city_name(cluster_b.median_location),
                        }
                    ))

        return moves

    def detect_travel_milestones(self, photos):
        """
        Detect significant travel (first visit to continent, country, etc.)
        """
        # Group photos by continent/country
        location_history = {}

        for photo in sorted(photos, key=lambda p: p.timestamp):
            country = self.get_country(photo.lat, photo.lon)

            if country not in location_history:
                # First visit to this country
                location_history[country] = photo.timestamp

        # Create events for first visits
        milestones = []
        for country, first_visit in location_history.items():
            if country != self.user_home_country:
                milestones.append(LifeEvent(
                    type='travel_milestone',
                    timestamp=first_visit,
                    photos=self.get_photos_in_country(photos, country)[:10],
                    confidence=1.0,
                    metadata={'country': country, 'milestone': 'first_visit'}
                ))

        return milestones
```

## Practical Implementation

### Complete Event Detection Pipeline

```python
class EventDetectionPipeline:
    """
    End-to-end pipeline for event detection and analysis.
    """

    def __init__(self):
        self.st_dbscan = ST_DBSCAN()
        self.event_scorer = EventSignificanceScorer()
        self.place_recognizer = PlaceRecognizer()
        self.shareability_predictor = ShareabilityPredictor()
        self.life_event_detector = LifeEventDetector()

    def process_photo_corpus(self, photos):
        """
        Process entire photo collection.

        Returns:
            dict with events, significance scores, shareability, etc.
        """
        results = {}

        # 1. Cluster photos into events (ST-DBSCAN)
        event_labels = self.st_dbscan.cluster(
            photos,
            eps_spatial=5000,
            eps_temporal=8 * 3600,
            min_pts=3
        )

        # Group photos by event
        events = self.group_by_event(photos, event_labels)

        # 2. Score each event's significance
        for event in events:
            event.significance_score, event.factors = \
                self.event_scorer.score_event(event.photos, photos)

            # 3. Analyze location
            event.place_analysis = self.place_recognizer.analyze_location(
                event.median_lat, event.median_lon, photos
            )

            # 4. Generate event label
            event.label = self.generate_event_label(event)

        # 3. Predict shareability for each photo
        for photo in photos:
            event_context = self.find_photo_event(photo, events)
            photo.shareability, photo.shareability_features = \
                self.shareability_predictor.predict(photo, event_context)

        # 4. Detect life events
        life_events = self.life_event_detector.detect_life_events(photos)

        results['events'] = events
        results['life_events'] = life_events
        results['processed_photos'] = photos

        return results

    def select_for_collage(self, processed_results, target_count=100):
        """
        Select photos for collage using event intelligence.

        Priorities:
        1. Life events (graduations, weddings, etc.)
        2. High-significance events (vacations, celebrations)
        3. High shareability
        4. Temporal diversity

        Returns:
            List of selected photos
        """
        photos = processed_results['processed_photos']
        events = processed_results['events']
        life_events = processed_results['life_events']

        selected = []

        # Priority 1: Life events (1-3 photos per life event)
        for life_event in life_events:
            life_event.photos.sort(key=lambda p: p.aesthetic_score, reverse=True)
            selected.extend(life_event.photos[:3])

        # Priority 2: Significant events (2 photos per high-sig event)
        significant_events = [e for e in events if e.significance_score > 0.7]
        significant_events.sort(key=lambda e: e.significance_score, reverse=True)

        for event in significant_events[:20]:  # Top 20 events
            event.photos.sort(key=lambda p: p.shareability, reverse=True)
            selected.extend([p for p in event.photos[:2] if p not in selected])

        # Priority 3: Fill remaining with temporal diversity
        if len(selected) < target_count:
            remaining_count = target_count - len(selected)
            remaining_photos = [p for p in photos if p not in selected]

            # Use temporal MMR
            diverse_photos = select_photos_temporal_mmr(
                remaining_photos, remaining_count, lambda_temporal=0.7
            )

            selected.extend(diverse_photos)

        return selected[:target_count]
```

## Integration with Collage Assembly

**Modify Greedy Edge Growth to Use Event Intelligence:**

```python
def assemble_collage_event_aware(photo_database, target_size=(10, 10)):
    """
    Collage assembly with event-based prioritization.
    """
    # 1. Run event detection pipeline
    pipeline = EventDetectionPipeline()
    event_results = pipeline.process_photo_corpus(photo_database.all_photos)

    # 2. Select diverse photos using event intelligence
    candidate_photos = pipeline.select_for_collage(event_results, target_count=200)

    # 3. Build collage using greedy edge growth (from collage-layout-expert)
    # But with event-aware photo selection at each step

    seed = max(candidate_photos, key=lambda p: p.significance * p.aesthetic)

    canvas = Canvas(target_size)
    canvas.place_photo(seed, position='center')

    placed_events = {seed.event_id}  # Track which events used

    open_edges = PriorityQueue()
    for edge in seed.edges:
        open_edges.push(edge, priority=1.0)

    while canvas.coverage < 0.8 and not open_edges.empty():
        current_edge = open_edges.pop()

        # Find compatible photos, preferring NEW events
        candidates = photo_database.find_compatible_edges(current_edge, k=50)

        # Filter: prefer photos from events not yet used
        novel_event_candidates = [c for c in candidates
                                 if c.event_id not in placed_events]

        if novel_event_candidates:
            candidates = novel_event_candidates

        # Score candidates
        for candidate in candidates:
            local_fit = edge_compatibility(current_edge, candidate.opposite_edge)
            event_bonus = 1.2 if candidate.event_id not in placed_events else 1.0
            shareability_bonus = 1.0 + candidate.shareability * 0.2

            total_score = local_fit * event_bonus * shareability_bonus

            if total_score > 0.6:
                canvas.place_photo(candidate, adjacent_to=current_edge)
                placed_events.add(candidate.event_id)

                for new_edge in candidate.new_open_edges:
                    urgency = compute_edge_urgency(new_edge)
                    open_edges.push(new_edge, priority=urgency)

                break

    canvas.refine_boundaries()
    return canvas.render()
```

## Performance Benchmarks

**Target Performance (Swift/Metal/Core ML):**

```
ST-DBSCAN (10K photos):          < 2 seconds
Event significance scoring:       < 100ms per event
Shareability prediction:          < 50ms per photo
Place recognition (cached):       < 10ms per photo
Full pipeline (10K photos):       < 5 seconds
Event-aware collage assembly:     < 15 seconds (100 photos)
```

## References & Further Reading

1. **ST-DBSCAN**:
   - Birant, D., & Kut, A. (2007). "ST-DBSCAN: An algorithm for clustering spatial-temporal data." Data & Knowledge Engineering.

2. **DeepDBSCAN**:
   - "DeepDBSCAN: Deep Density-Based Clustering for Geo-Tagged Photos" (ISPRS, 2021)

3. **Social Media Engagement Prediction**:
   - "Predicting Social Media Engagement from Emotional and Temporal Features" (arXiv, August 2025)

4. **Photo Intelligence**:
   - compositional_collider/docs/design/PHOTO_INTELLIGENCE_DESIGN.md

5. **Shareability Research**:
   - Pinterest engagement prediction (linear regression, 2025)
   - Meta intent modeling (2025)
   - Visual content persuasiveness features (2024)

6. **GeoNames & OpenStreetMap**:
   - Reverse geocoding APIs
   - Place categorization databases

---

**Version:** 1.0
**Last Updated:** November 2025
**Author:** Claude (Sonnet 4.5)
**Based on:** Compositional Collider + ST-DBSCAN research + 2025 social media ML
