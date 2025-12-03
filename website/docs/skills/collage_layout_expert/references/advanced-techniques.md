---
title: Advanced Collage Techniques
sidebar_label: Advanced Collage Techniques
sidebar_position: 1
---
# Advanced Collage Techniques

## Cross-Photo Interactions

**Concept**: Photos "talk" to each other across boundaries.

### Types of Interactions

1. **Gesture-Response Pairs**:
   ```
   Photo A (left): Person waving to the right →
   Photo B (right): Person waving to the left ←
   Result: Two people greeting each other
   ```

2. **Pointing Interactions**:
   ```
   Photo A: Person pointing right →
   Photo B: Interesting object/scene
   Result: Person pointing at the object
   ```

3. **Gaze Direction**:
   ```
   Photo A: Person looking right →
   Photo B: Beautiful landscape
   Result: Person admiring the view
   ```

4. **Passing Objects**:
   ```
   Photo A (top): Hands reaching down ↓
   Photo B (bottom): Hands reaching up ↑
   Result: Handing something between photos
   ```

### Implementation

```python
class InteractionDetector:
    def __init__(self):
        self.pose_estimator = load_pose_model()
        self.action_classifier = load_action_model()

    def find_interaction_pairs(self, photo1, photo2, edge_pair):
        """Find natural interactions across photo boundary."""
        people1 = self.detect_people(photo1)
        people2 = self.detect_people(photo2)

        interactions = []
        for p1 in people1:
            if not self.is_near_edge(p1, edge_pair[0]):
                continue

            gesture1 = self.detect_gesture(photo1, p1.bbox)

            for p2 in people2:
                if not self.is_near_edge(p2, edge_pair[1]):
                    continue

                gesture2 = self.detect_gesture(photo2, p2.bbox)
                score = self.score_interaction(gesture1, gesture2)

                if score > 0.5:
                    interactions.append({
                        'person1': p1,
                        'person2': p2,
                        'type': self.classify_interaction(gesture1, gesture2),
                        'score': score
                    })

        return interactions

    def score_interaction(self, gesture1, gesture2):
        """Natural interaction pairs."""
        NATURAL_PAIRS = {
            ('waving', 'waving'): 0.9,
            ('waving', 'looking'): 0.8,
            ('pointing', 'looking'): 0.85,
            ('reaching', 'reaching'): 0.7,
            ('throwing', 'catching'): 0.95,
            ('looking_right', 'looking_left'): 0.7,
        }

        key = (gesture1['gesture'], gesture2['gesture'])
        base_score = NATURAL_PAIRS.get(key, 0.3)

        if self.directions_align(gesture1, gesture2):
            base_score += 0.1

        return min(1.0, base_score)
```

---

## Negative Space Awareness

**The Insight**: Empty space is as important as filled space.

```python
class NegativeSpaceAnalyzer:
    def analyze_negative_space(self, photo, subject_mask):
        """Analyze quality and distribution of negative space."""
        h, w = photo.shape[:2]
        negative_mask = 1 - subject_mask

        breathing_room = {
            'top': negative_mask[:h//3, :].mean(),
            'bottom': negative_mask[2*h//3:, :].mean(),
            'left': negative_mask[:, :w//3].mean(),
            'right': negative_mask[:, 2*w//3:].mean(),
            'overall': negative_mask.mean()
        }

        background = photo * negative_mask[..., None]
        bg_variance = np.var(background)
        quality = 1.0 - min(1.0, bg_variance / 1000.0)

        return {
            'distribution': breathing_room,
            'quality': quality,
            'total_ratio': breathing_room['overall']
        }

    def match_negative_space(self, analysis1, analysis2):
        """Find complementary negative space patterns."""
        # Subject on left + Subject on right = good pair
        if (analysis1['distribution']['left'] < 0.3 and
            analysis2['distribution']['right'] < 0.3):
            return 'left_right_pair', 0.9

        if (analysis1['distribution']['bottom'] < 0.3 and
            analysis2['distribution']['top'] < 0.3):
            return 'top_bottom_pair', 0.9

        if (analysis1['distribution']['right'] > 0.6 and
            analysis2['distribution']['right'] > 0.6):
            return 'right_stack', 0.7

        return None, 0.0
```

**Use Case**:
```
Photo A: Person on left, empty beach on right
Photo B: Sunset on right, empty ocean on left

Composite: Person (from A) on left + Sunset (from B) on right
Result: Person appears to be watching the sunset
```

---

## Multi-Layer Compositing

**Concept**: Create depth through foreground/midground/background layers.

```python
class LayeredCollage:
    def create_layered_composition(self, photos):
        """Build composition with depth layers."""

        background_photos = self.select_backgrounds(photos)
        midground_photos = self.select_midgrounds(photos)
        foreground_photos = self.select_foregrounds(photos)

        layers = {
            'background': self.create_background_layer(background_photos),
            'midground': self.create_midground_layer(midground_photos),
            'foreground': self.create_foreground_layer(foreground_photos)
        }

        canvas = self.composite_layers(layers)
        return canvas

    def select_backgrounds(self, photos):
        """Select photos suitable for background layer."""
        candidates = []

        for photo in photos:
            score = 0.0

            if self.contains_sky(photo):
                score += 0.5
            if self.is_landscape_oriented(photo):
                score += 0.3

            depth = self.estimate_depth(photo)
            if depth.mean() > 0.7:
                score += 0.2

            if score > 0.5:
                candidates.append((photo, score))

        return [p for p, s in sorted(candidates, key=lambda x: -x[1])]
```

---

## Narrative Sequences

**Concept**: Tell a story across the collage.

```python
class NarrativeCollageBuilder:
    def build_story_collage(self, photos, story_type='journey'):
        """Build collage that tells a story."""

        if story_type == 'journey':
            # Start → Travel → Arrive → Experience → Depart
            segments = self.segment_by_story_arc(photos)
            layout = self.create_flow_layout(segments)

        elif story_type == 'day_in_life':
            # Morning → Midday → Evening → Night
            segments = self.segment_by_time_of_day(photos)
            layout = self.create_temporal_gradient_layout(segments)

        elif story_type == 'emotion_arc':
            # Calm → Excitement → Joy → Reflection
            segments = self.segment_by_emotion(photos)
            layout = self.create_emotional_flow_layout(segments)

        return layout

    def segment_by_story_arc(self, photos):
        """Cluster photos into narrative segments."""
        features = []
        for photo in photos:
            feat = np.concatenate([
                photo.clip_embedding,
                self.encode_location(photo.gps),
                self.encode_time(photo.timestamp)
            ])
            features.append(feat)

        segments = self.hierarchical_cluster(features, n_clusters=5)

        segments = sorted(segments,
                         key=lambda s: np.mean([p.timestamp for p in s]))

        return {
            'beginning': segments[0],
            'rising': segments[1],
            'climax': segments[2],
            'falling': segments[3],
            'end': segments[4]
        }
```

---

## Simulated Annealing for Photo Swapping

**When to Use**: User explicitly wants to explore alternative arrangements, or initial assembly has suboptimal global aesthetics.

**What It Does**: Randomly swaps photos in the existing collage and accepts swaps that improve the global energy function.

```python
def refine_with_simulated_annealing(canvas, max_iters=10000):
    """
    Refine existing collage by swapping photos.
    NOTE: This is a refinement, NOT the primary assembly algorithm.
    """
    T = 10.0
    T_min = 0.01
    cooling_rate = 0.95

    current_energy = compute_total_energy(canvas)
    best_canvas = canvas.copy()
    best_energy = current_energy

    for iteration in range(max_iters):
        canvas_new = canvas.copy()
        i, j = random.sample(range(len(canvas.shards)), 2)
        canvas_new.swap_shards(i, j)

        new_energy = compute_total_energy(canvas_new)
        delta_E = new_energy - current_energy

        if delta_E < 0:
            canvas = canvas_new
            current_energy = new_energy
        else:
            acceptance_prob = np.exp(-delta_E / T)
            if np.random.random() < acceptance_prob:
                canvas = canvas_new
                current_energy = new_energy

        if current_energy < best_energy:
            best_canvas = canvas.copy()
            best_energy = current_energy

        T = max(T_min, T * cooling_rate)

    return best_canvas
```

**Performance**:
- Time: 5-15 seconds for 50 photos
- Quality gain: 5-10% improvement in global aesthetics
- Diminishing returns after 1000-2000 iterations

**When NOT to Use**:
- Interactive editing (too slow)
- Initial assembly (use greedy edge growth)
- User wants predictable results (stochastic)

---

## Genetic Algorithms for Layout Evolution

**Concept**: Maintain population of collages, breed and mutate to explore layout space.

**Operations**:
- **Crossover**: Swap regions between two parent collages
- **Mutation**: Random perturbations (rotate, scale, move shards)
- **Selection**: Keep top-scoring collages, discard poor ones

**Performance**: Even slower than simulated annealing, typically for offline rendering.

---

## Constraint Satisfaction Problem (CSP) Formulation

**Concept**: Define collage assembly as constraint satisfaction problem.

**Constraints**:
- Edge compatibility > threshold
- No overlaps (or controlled overlaps for Hockney)
- Minimum global aesthetics score
- Semantic coherence within range

Listed as alternative strategy, not recommended for MVP.
