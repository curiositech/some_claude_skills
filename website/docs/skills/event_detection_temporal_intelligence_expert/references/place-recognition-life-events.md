---
title: Place Recognition & Life Event Detection
sidebar_label: Place Recognition & Life Ev...
sidebar_position: 2
---
# Place Recognition & Life Event Detection

## Place Recognition & Semantic Location

**Goal:** Understand WHERE photos were taken beyond GPS coordinates.

### Levels of Location Abstraction

1. **Raw GPS:** (40.7589, -73.9851)
2. **Address:** "Times Square, New York, NY"
3. **Semantic Place:** "Tourist landmark, entertainment district"
4. **User Context:** "Vacation destination" vs "Daily commute"

### Implementation

```python
class PlaceRecognizer:
    """
    Multi-level place understanding from GPS coordinates.
    """

    def __init__(self):
        self.reverse_geocoder = self.init_geocoder()  # OpenStreetMap Nominatim
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
        analysis['place_type'] = place_type

        # Level 3: Frequency in user's history
        frequency = self.compute_location_frequency(lat, lon, photo_history)
        analysis['frequency'] = frequency

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
        analysis['is_urban'] = 'city' in address.lower() or 'downtown' in address.lower()

        return analysis

    def categorize_place(self, address):
        """Categorize place type from address keywords."""
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
```

### Location-Based Event Labeling

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
        landmark_name = extract_landmark_name(place_analysis['address'])
        return f"Visit to \{landmark_name\}"

    elif place_analysis['user_context'] == 'novel':
        city = extract_city(place_analysis['address'])
        return f"Trip to \{city\}"

    elif place_analysis['user_context'] == 'familiar':
        return "At Home"

    else:
        return place_analysis['place_type'].title()
```

---

## Life Event Detection

**Goal:** Automatically detect major life events (graduations, weddings, births, etc.)

### Multi-Signal Detection Approach

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

        life_events.extend(self.detect_graduations(photo_corpus))
        life_events.extend(self.detect_weddings(photo_corpus))
        life_events.extend(self.detect_births(photo_corpus))
        life_events.extend(self.detect_moves(photo_corpus))
        life_events.extend(self.detect_travel_milestones(photo_corpus))

        return life_events
```

### Graduation Detection

**Signals:** Academic regalia, diplomas, ceremony settings

```python
def detect_graduations(self, photos):
    """Detect graduation events using CLIP zero-shot classification."""
    graduation_events = []

    for event in self.cluster_events(photos):
        signals = {
            'cap_gown': 0,
            'diploma': 0,
            'auditorium': 0,
            'formal_group': 0,
        }

        for photo in event.photos:
            probs = clip_classify(photo.image, [
                'graduation cap and gown',
                'diploma certificate',
                'auditorium ceremony',
                'formal group photo',
            ])

            for key, prob in zip(signals.keys(), probs):
                if prob > 0.4:
                    signals[key] = max(signals[key], prob)

        # Weighted confidence
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
```

### Wedding Detection

**Signals:** Formal attire, flowers, rings, venue

```python
def detect_weddings(self, photos):
    """Detect wedding events."""
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
```

### Birth/Newborn Detection

**Signals:** Hospital setting, newborn, new face cluster appearing

```python
def detect_births(self, photos):
    """
    Detect newborn/birth events.

    Key insight: Look for sudden appearance of new face cluster (newborn)
    """
    face_clusters = self.face_clusterer.cluster_all_faces(photos)
    birth_events = []

    for cluster_id, faces in face_clusters.items():
        first_appearance = min(f.photo.timestamp for f in faces)
        cluster_duration = (max(f.photo.timestamp for f in faces) -
                          first_appearance).days

        # Infant detection via CLIP
        infant_scores = [clip_classify(f.crop, ['infant', 'newborn'])[0]
                       for f in faces[:10]]

        avg_infant_score = np.mean(infant_scores)

        if avg_infant_score > 0.8 and cluster_duration < 365:
            birth_events.append(LifeEvent(
                type='birth',
                timestamp=first_appearance,
                photos=[f.photo for f in faces],
                confidence=avg_infant_score,
                metadata={'person_cluster_id': cluster_id}
            ))

    return birth_events
```

### Residential Move Detection

**Signal:** Sudden permanent shift in common photo location

```python
def detect_moves(self, photos):
    """Detect residential moves via location history analysis."""
    location_clusters = self.cluster_by_location(photos)
    moves = []

    for i in range(len(location_clusters) - 1):
        cluster_a = location_clusters[i]
        cluster_b = location_clusters[i + 1]

        distance = haversine_distance(
            cluster_a.median_location[0], cluster_a.median_location[1],
            cluster_b.median_location[0], cluster_b.median_location[1]
        )

        if distance > 50_000:  # 50km = different city
            duration_b = (cluster_b.photos[-1].timestamp -
                        cluster_b.photos[0].timestamp).days

            if duration_b > 30:  # Permanent move (>30 days)
                moves.append(LifeEvent(
                    type='residential_move',
                    timestamp=cluster_b.photos[0].timestamp,
                    photos=cluster_b.photos[:20],
                    confidence=0.8,
                    metadata={
                        'from': self.get_city_name(cluster_a.median_location),
                        'to': self.get_city_name(cluster_b.median_location),
                    }
                ))

    return moves
```

### Travel Milestone Detection

**Signal:** First visit to new country/continent

```python
def detect_travel_milestones(self, photos):
    """Detect first visits to new countries."""
    location_history = {}
    milestones = []

    for photo in sorted(photos, key=lambda p: p.timestamp):
        country = self.get_country(photo.lat, photo.lon)

        if country not in location_history:
            location_history[country] = photo.timestamp

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

---

## Life Event Detection Summary

| Event Type | Primary Signals | Confidence Threshold |
|------------|-----------------|---------------------|
| Graduation | Cap/gown, diploma, auditorium | 0.6 |
| Wedding | Formal attire, bouquet, cake | 0.7 |
| Birth | New infant face cluster, hospital | 0.8 |
| Residential Move | 50km+ location shift, \>30 days | 0.8 |
| Travel Milestone | First visit to new country | 1.0 |

---

## References

1. GeoNames & OpenStreetMap: Reverse geocoding APIs
2. Face clustering for person tracking across photos
3. CLIP zero-shot classification for event content detection
