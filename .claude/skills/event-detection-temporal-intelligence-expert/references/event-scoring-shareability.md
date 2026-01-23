# Event Significance Scoring & Shareability Prediction

## Event Significance Scoring

**Goal:** Not all events are equal. Birthday party > Daily commute photos.

### Multi-Factor Scoring Model

```python
class EventSignificanceScorer:
    """
    Score how significant/memorable an event is.
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
```

### Weight Customization

| Factor | Default Weight | Increase If | Decrease If |
|--------|---------------|-------------|-------------|
| duration | 0.10 | User prefers longer trips | Quick events matter more |
| density | 0.15 | High-activity events | Sparse documentation OK |
| diversity | 0.10 | Visual variety important | Consistent themes |
| people | 0.15 | Social photos prioritized | Solo/landscape focus |
| location_rarity | 0.20 | Travel photos important | Local events matter |
| content | 0.15 | Special occasions | Everyday moments |
| engagement | 0.10 | Social media signals | Raw photos only |
| temporal | 0.05 | Annual patterns important | Random events |

---

## Shareability Prediction

**Goal:** Predict which photos are likely to be shared on social media.

### Feature Categories

1. **Visual Features**: Aesthetic quality, composition, vibrancy, sharpness
2. **Emotional Features**: Facial expressions, emotion recognition
3. **Content Features**: People count, landmarks, food, pets
4. **Temporal Features**: Recency, special dates
5. **Complexity Features**: Moderate complexity most shareable (2025 research)

### Model Implementation

```python
class ShareabilityPredictor:
    """
    Predict likelihood of photo being shared on social media.

    Based on: "Predicting Social Media Engagement from Emotional and
              Temporal Features" (arXiv 2025)
    """

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
        features['people_count'] = min(photo.face_count / 5, 1.0)
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

### Training the Model

```python
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

### Shareability Decision Tree

```
Photo Shareability Assessment:
│
├─ Has smiling faces? ─────────────────────── +0.3 base score
│   └─ Group photo (3+ people)? ───────────── +0.2 bonus
│
├─ Famous landmark detected? ──────────────── +0.25
│
├─ Food/dining scene? ─────────────────────── +0.15
│
├─ Aesthetic quality > 7/10? ──────────────── +0.2
│
├─ Taken within last 7 days? ──────────────── +0.1 recency
│
├─ Part of significant event? ─────────────── +0.15
│
└─ Moderate visual complexity (0.4-0.6)? ──── +0.1

Threshold: > 0.6 = "Highly Shareable"
```

---

## References

1. "Predicting Social Media Engagement from Emotional and Temporal Features" (arXiv, August 2025)
2. Pinterest engagement prediction research (2025)
3. Meta intent modeling (2025)
4. Visual content persuasiveness features (2024)
