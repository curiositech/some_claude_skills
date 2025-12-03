---
title: Temporal Diversity & Complete Pipeline
sidebar_label: Temporal Diversity & Comple...
sidebar_position: 4
---
# Temporal Diversity & Complete Pipeline

## Temporal Diversity for Photo Selection

**Problem:** Without diversity constraints, all photos might come from single event (e.g., all from last vacation).

**Goal:** Ensure temporal spread across photo collection.

### Method 1: Temporal Binning

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
        selected.extend(bin_photos[:photos_per_bin])

    # If under target, add more from best bins
    if len(selected) < target_count:
        remaining = target_count - len(selected)
        all_remaining = [p for bin in bins for p in bin if p not in selected]
        all_remaining.sort(key=lambda p: p.aesthetic_score, reverse=True)
        selected.extend(all_remaining[:remaining])

    return selected[:target_count]
```

### Method 2: Temporal MMR (Maximal Marginal Relevance)

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

    # Select remaining using MMR
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
            temporal_diversity = 1 - np.exp(-min_time_diff / (7 * 24 * 3600))

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

### Method 3: Event-Based Diversity

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
        selected.extend(event.photos[:photos_per_event])

    return selected
```

---

## Complete Event Detection Pipeline

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

        for event in significant_events[:20]:
            event.photos.sort(key=lambda p: p.shareability, reverse=True)
            selected.extend([p for p in event.photos[:2] if p not in selected])

        # Priority 3: Fill remaining with temporal diversity
        if len(selected) < target_count:
            remaining_count = target_count - len(selected)
            remaining_photos = [p for p in photos if p not in selected]

            diverse_photos = select_photos_temporal_mmr(
                remaining_photos, remaining_count, lambda_temporal=0.7
            )
            selected.extend(diverse_photos)

        return selected[:target_count]
```

---

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

    # 3. Build collage using greedy edge growth
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

---

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

---

## Selection Algorithm Comparison

| Method | Best For | Tradeoff |
|--------|----------|----------|
| Temporal Binning | Even time coverage | May miss quality |
| Temporal MMR | Balanced quality + diversity | Slower computation |
| Event-Based | Event representation | Depends on event quality |
| Combined Pipeline | Production use | Most comprehensive |
