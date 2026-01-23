# Multi-Object Tracking Algorithms

Comprehensive guide to tracking algorithms for maintaining object identity across video frames.

---

## Why Tracking Matters

**Without Tracking**:
```
Frame 1: Detected 3 dolphins
Frame 2: Detected 3 dolphins
Frame 3: Detected 2 dolphins
```
**Question**: Are these the same dolphins? Which one left?

**With Tracking**:
```
Frame 1: Dolphin #1, #2, #3
Frame 2: Dolphin #1, #2, #3
Frame 3: Dolphin #1, #3 (Dolphin #2 disappeared)
```
**Answer**: Dolphin #2 left the scene

---

## Algorithm Comparison

| Algorithm | Speed (FPS) | Robustness | Occlusion | Re-ID | Use Case |
|-----------|-------------|------------|-----------|-------|----------|
| SORT | 260 | Fair | Poor | No | Simple scenes, speed critical |
| DeepSORT | 40 | Excellent | Good | Yes | Crowded scenes, re-identification |
| ByteTrack | 150 | Very Good | Excellent | No | Balanced performance |
| BotSORT | 45 | Excellent | Excellent | Yes | Complex scenes, high accuracy |

**Key Metrics**:
- **Speed**: Frames per second (higher = faster)
- **Robustness**: Handling ID switches
- **Occlusion**: Tracking through overlaps
- **Re-ID**: Re-identifying after long absence

---

## SORT (Simple Online and Realtime Tracking)

### Algorithm Overview

**How it works**:
1. Detect objects in frame (YOLO, etc.)
2. Associate detections with existing tracks using IoU
3. Update tracks with Kalman filter
4. Remove tracks that haven't been seen for N frames

**Strengths**:
- Extremely fast (260 FPS)
- Simple to implement
- Works well for sparse scenes

**Weaknesses**:
- Many ID switches in crowded scenes
- Poor occlusion handling
- No appearance-based matching

---

### SORT Implementation

```python
from sort import Sort

# Initialize tracker
tracker = Sort(
    max_age=30,        # Max frames to keep track without detection
    min_hits=3,        # Min detections before track is confirmed
    iou_threshold=0.3  # IoU threshold for matching
)

# Process video
video = cv2.VideoCapture('video.mp4')
while True:
    ret, frame = video.read()
    if not ret:
        break

    # Run detector
    results = yolo_model(frame)

    # Convert to SORT format: [x1, y1, x2, y2, confidence]
    detections = []
    for box in results[0].boxes:
        x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
        conf = float(box.conf[0])
        detections.append([x1, y1, x2, y2, conf])

    # Update tracker
    tracks = tracker.update(np.array(detections))

    # tracks: [x1, y1, x2, y2, track_id]
    for track in tracks:
        x1, y1, x2, y2, track_id = track
        cv2.rectangle(frame, (int(x1), int(y1)), (int(x2), int(y2)), (0, 255, 0), 2)
        cv2.putText(frame, f'ID {int(track_id)}', (int(x1), int(y1)-10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
```

**Installation**:
```bash
pip install filterpy scikit-learn
git clone https://github.com/abewley/sort.git
```

---

## DeepSORT (Deep Simple Online and Realtime Tracking)

### Algorithm Overview

**How it works**:
1. Detect objects (YOLO)
2. Extract appearance features (deep CNN)
3. Associate using IoU + appearance similarity
4. Update with Kalman filter
5. Re-identify objects after long absence

**Strengths**:
- Excellent robustness in crowded scenes
- Re-identification after occlusion
- Appearance-based matching reduces ID switches

**Weaknesses**:
- Slower than SORT (40 FPS vs 260 FPS)
- Requires pre-trained re-identification model
- Higher computational cost

---

### DeepSORT Implementation

```python
from deep_sort_realtime.deepsort_tracker import DeepSort

# Initialize tracker
tracker = DeepSort(
    max_age=30,              # Max frames without detection
    n_init=3,                # Min detections before confirmed
    max_iou_distance=0.7,    # IoU threshold
    max_cosine_distance=0.3, # Appearance similarity threshold
    embedder="mobilenet",    # Feature extractor (mobilenet, resnet50, etc.)
    half=True,               # Use FP16 for speed
    bgr=True                 # Input is BGR (OpenCV default)
)

# Process video
video = cv2.VideoCapture('video.mp4')
while True:
    ret, frame = video.read()
    if not ret:
        break

    # Run detector
    results = yolo_model(frame)

    # Convert to DeepSORT format: ([x1, y1, w, h], confidence, class)
    detections = []
    for box in results[0].boxes:
        x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
        w, h = x2 - x1, y2 - y1
        conf = float(box.conf[0])
        cls = int(box.cls[0])

        detections.append(([x1, y1, w, h], conf, cls))

    # Update tracker
    tracks = tracker.update_tracks(detections, frame=frame)

    # Draw tracks
    for track in tracks:
        if not track.is_confirmed():
            continue

        track_id = track.track_id
        ltrb = track.to_ltrb()  # [left, top, right, bottom]

        cv2.rectangle(frame, (int(ltrb[0]), int(ltrb[1])),
                      (int(ltrb[2]), int(ltrb[3])), (0, 255, 0), 2)
        cv2.putText(frame, f'ID {track_id}', (int(ltrb[0]), int(ltrb[1])-10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
```

**Installation**:
```bash
pip install deep-sort-realtime
```

---

## ByteTrack

### Algorithm Overview

**How it works**:
1. Detect objects with YOLO
2. Separate detections into high-confidence and low-confidence
3. Match high-confidence detections first (like SORT)
4. Use low-confidence detections to recover occluded objects
5. Update with Kalman filter

**Key Innovation**: Uses low-confidence detections that other trackers ignore

**Strengths**:
- Fast (150 FPS) - 3.75x faster than DeepSORT
- Excellent occlusion handling
- No appearance model needed (no extra GPU memory)
- SOTA performance on MOT benchmarks

**Weaknesses**:
- No re-identification after long absence
- Requires tuning confidence thresholds

---

### ByteTrack Implementation

```python
from ultralytics import YOLO

# YOLOv8 has ByteTrack built-in!
model = YOLO('yolov8n.pt')

# Track with ByteTrack
results = model.track(
    'video.mp4',
    tracker='bytetrack.yaml',  # Use ByteTrack
    conf=0.3,                  # Detection confidence (low for ByteTrack)
    iou=0.5,                   # IoU threshold for NMS
    persist=True,              # Persist tracks across frames
    verbose=False
)

# Process results
for result in results:
    boxes = result.boxes

    if boxes is not None and boxes.id is not None:
        for box in boxes:
            x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
            track_id = int(box.id[0])
            conf = float(box.conf[0])
            cls = int(box.cls[0])

            print(f'Track {track_id}: {result.names[cls]} ({conf:.2f})')
```

**Custom ByteTrack Config** (`bytetrack.yaml`):
```yaml
tracker_type: bytetrack
track_high_thresh: 0.5    # High confidence threshold
track_low_thresh: 0.1     # Low confidence threshold (key!)
new_track_thresh: 0.6     # Threshold for new track
track_buffer: 30          # Max frames without detection
match_thresh: 0.8         # Matching threshold
```

---

## BotSORT

### Algorithm Overview

**How it works**:
1. ByteTrack foundation (high + low confidence)
2. Add camera motion compensation
3. Add appearance-based re-identification
4. Use more sophisticated motion model

**Strengths**:
- Best overall accuracy (SOTA on MOT17/20)
- Excellent occlusion handling (from ByteTrack)
- Re-identification (from DeepSORT)
- Camera motion compensation (unique)

**Weaknesses**:
- Slower than ByteTrack (45 FPS)
- More complex to tune
- Requires appearance model

---

### BotSORT Implementation

```python
from ultralytics import YOLO

model = YOLO('yolov8n.pt')

# Track with BotSORT
results = model.track(
    'video.mp4',
    tracker='botsort.yaml',  # Use BotSORT
    conf=0.3,
    persist=True
)

# Process same as ByteTrack example above
```

**Custom BotSORT Config** (`botsort.yaml`):
```yaml
tracker_type: botsort
track_high_thresh: 0.5
track_low_thresh: 0.1
new_track_thresh: 0.6
track_buffer: 30
match_thresh: 0.8
proximity_thresh: 0.5     # For appearance matching
appearance_thresh: 0.25   # Appearance similarity
cmc_method: sparseOptFlow # Camera motion compensation (sparseOptFlow, orb, ecc)
```

---

## Performance Comparison

### Speed Benchmarks

Tested on 1080p video, 30 FPS, 20 objects per frame (NVIDIA RTX 3080):

| Tracker | Inference (ms) | Tracking (ms) | Total (ms) | FPS |
|---------|----------------|---------------|------------|-----|
| SORT | 28 | 1 | 29 | 34 |
| DeepSORT | 28 | 18 | 46 | 22 |
| ByteTrack | 28 | 3 | 31 | 32 |
| BotSORT | 28 | 14 | 42 | 24 |

**Key Insight**: Tracking overhead is minimal for SORT/ByteTrack, significant for DeepSORT/BotSORT

---

### Accuracy Benchmarks

MOT17 Dataset (Multiple Object Tracking benchmark):

| Tracker | MOTA | IDF1 | ID Switches | False Positives |
|---------|------|------|-------------|-----------------|
| SORT | 64.1% | 62.2% | 1,423 | 12,852 |
| DeepSORT | 61.4% | 62.2% | 781 | 8,013 |
| ByteTrack | **80.3%** | 77.3% | 2,196 | 8,112 |
| BotSORT | **80.5%** | **80.2%** | **1,212** | **7,538** |

**Metrics**:
- **MOTA**: Multi-Object Tracking Accuracy (higher = better)
- **IDF1**: ID F1 Score (higher = better, measures ID consistency)
- **ID Switches**: Number of times IDs change (lower = better)

**Winner**: BotSORT (best overall), ByteTrack (best speed/accuracy)

---

## Use Case Recommendations

### Wildlife Monitoring (Dolphins, Birds, etc.)

**Best Choice**: **ByteTrack**

**Why**:
- Animals move smoothly (Kalman filter works well)
- Occlusions are common (ByteTrack excels)
- No need for re-ID (animals don't leave and return)
- Speed allows real-time processing

**Config**:
```yaml
tracker_type: bytetrack
track_high_thresh: 0.4    # Lower for animals (harder to detect)
track_low_thresh: 0.1
track_buffer: 60          # Longer buffer (animals move slower)
match_thresh: 0.7         # Lower threshold (animal appearance varies)
```

---

### Crowded Indoor Scenes (Retail, Security)

**Best Choice**: **BotSORT** or **DeepSORT**

**Why**:
- Many occlusions (need appearance model)
- People leave and return (need re-ID)
- Camera is stationary (can use camera motion compensation)

**Config** (BotSORT):
```yaml
tracker_type: botsort
track_high_thresh: 0.5
track_low_thresh: 0.1
track_buffer: 30
appearance_thresh: 0.25   # Strict appearance matching
cmc_method: sparseOptFlow # Compensate for camera jitter
```

---

### Drone Footage (Archaeological Surveys, Inspection)

**Best Choice**: **ByteTrack** with custom config

**Why**:
- Camera moves (simpler motion model better)
- Objects may be small/low confidence
- Speed important for large footage volumes
- No re-ID needed (continuous tracking)

**Config**:
```yaml
tracker_type: bytetrack
track_high_thresh: 0.3    # Very low (objects are small)
track_low_thresh: 0.05    # Extremely low (catch faint objects)
track_buffer: 90          # Long buffer (objects move slowly relative to camera)
match_thresh: 0.6         # Lenient matching (camera motion)
```

---

### Sports Tracking (Soccer, Basketball)

**Best Choice**: **BotSORT**

**Why**:
- Fast, erratic motion
- Frequent occlusions (players overlap)
- Need re-ID (players leave/enter frame)
- Camera pans/zooms (camera motion compensation helps)

**Config**:
```yaml
tracker_type: botsort
track_high_thresh: 0.5
track_low_thresh: 0.1
track_buffer: 20          # Short buffer (fast action)
appearance_thresh: 0.3
cmc_method: ecc           # Best for sports (handles zoom)
```

---

### Real-Time Applications (Edge Devices, Webcams)

**Best Choice**: **SORT**

**Why**:
- Fastest option (260 FPS)
- Low memory footprint
- Good enough for simple scenes

**Config**:
```python
tracker = Sort(
    max_age=15,       # Short buffer for real-time
    min_hits=2,       # Quick confirmation
    iou_threshold=0.3
)
```

---

## Common Issues and Solutions

### Issue 1: Too Many ID Switches

**Symptoms**: Same object gets new ID every few frames

**Causes**:
- Detection confidence too low
- Match threshold too high
- Track buffer too short

**Solutions**:
```yaml
# Increase detection confidence
conf: 0.5  # Instead of 0.3

# Lower match threshold (more lenient)
match_thresh: 0.6  # Instead of 0.8

# Longer track buffer
track_buffer: 60  # Instead of 30
```

---

### Issue 2: Lost Tracks During Occlusion

**Symptoms**: Object disappears behind another, gets new ID when reappearing

**Cause**: Tracker doesn't use low-confidence detections

**Solutions**:
1. **Use ByteTrack or BotSORT** (designed for occlusion)
2. **Lower track_low_thresh**:
   ```yaml
   track_low_thresh: 0.05  # Catch low-confidence detections
   ```
3. **Increase track_buffer**:
   ```yaml
   track_buffer: 90  # Keep track alive longer
   ```

---

### Issue 3: Tracks Not Re-identified After Long Absence

**Symptoms**: Object leaves frame, returns later with new ID

**Cause**: SORT/ByteTrack don't support re-identification

**Solution**: Switch to **DeepSORT** or **BotSORT**

---

### Issue 4: Slow Tracking Speed

**Symptoms**: Tracking overhead dominates inference time

**Causes**:
- Using appearance model (DeepSORT/BotSORT)
- Too many tracks
- Too many detections

**Solutions**:
1. **Switch to ByteTrack or SORT**
2. **Increase detection confidence**:
   ```yaml
   conf: 0.5  # Fewer detections = faster tracking
   ```
3. **Use FP16 for appearance model**:
   ```python
   tracker = DeepSort(half=True)  # 2x faster
   ```

---

## Advanced Techniques

### 1. Multi-Camera Tracking

Track objects across multiple camera views:

```python
from deep_sort_realtime.deepsort_tracker import DeepSort

# Shared appearance database
global_tracker = DeepSort(
    max_cosine_distance=0.2,  # Strict appearance matching
    embedder="resnet50"       # Better features for cross-camera
)

# Camera 1
tracks_cam1 = global_tracker.update_tracks(detections_cam1, frame_cam1)

# Camera 2 (shares appearance database with cam 1)
tracks_cam2 = global_tracker.update_tracks(detections_cam2, frame_cam2)

# Match tracks by appearance
for t1 in tracks_cam1:
    for t2 in tracks_cam2:
        if appearance_similarity(t1, t2) > 0.8:
            print(f"Same object: Cam1 ID {t1.track_id} = Cam2 ID {t2.track_id}")
```

---

### 2. Track Smoothing

Reduce jittery bounding boxes with moving average:

```python
from collections import deque

class TrackSmoother:
    def __init__(self, window_size=5):
        self.tracks = {}  # track_id -> deque of boxes
        self.window_size = window_size

    def smooth(self, track_id, box):
        """Smooth bounding box with moving average"""
        if track_id not in self.tracks:
            self.tracks[track_id] = deque(maxlen=self.window_size)

        self.tracks[track_id].append(box)

        # Average boxes
        boxes = np.array(self.tracks[track_id])
        smoothed = boxes.mean(axis=0)

        return smoothed

# Usage
smoother = TrackSmoother(window_size=5)

for track in tracks:
    x1, y1, x2, y2, track_id = track
    smoothed_box = smoother.smooth(int(track_id), [x1, y1, x2, y2])
```

---

### 3. Track Validation

Filter out false positive tracks:

```python
def validate_track(track_history, min_length=10, min_movement=50):
    """
    Validate track is real (not false positive)

    Args:
        track_history: List of (x, y) center points
        min_length: Minimum track length
        min_movement: Minimum total movement (pixels)

    Returns:
        True if valid track
    """
    if len(track_history) < min_length:
        return False

    # Calculate total movement
    total_movement = 0
    for i in range(1, len(track_history)):
        dx = track_history[i][0] - track_history[i-1][0]
        dy = track_history[i][1] - track_history[i-1][1]
        total_movement += np.sqrt(dx**2 + dy**2)

    return total_movement >= min_movement

# Usage
track_histories = {}  # track_id -> list of (x, y)

for track in tracks:
    x1, y1, x2, y2, track_id = track
    center_x, center_y = (x1 + x2) / 2, (y1 + y2) / 2

    if track_id not in track_histories:
        track_histories[track_id] = []

    track_histories[track_id].append((center_x, center_y))

    # Validate
    if validate_track(track_histories[track_id]):
        # Draw only valid tracks
        cv2.rectangle(frame, (int(x1), int(y1)), (int(x2), int(y2)), (0, 255, 0), 2)
```

---

## Resources

- [ByteTrack Paper](https://arxiv.org/abs/2110.06864)
- [DeepSORT Paper](https://arxiv.org/abs/1703.07402)
- [BotSORT Paper](https://arxiv.org/abs/2206.14651)
- [SORT Implementation](https://github.com/abewley/sort)
- [DeepSORT Implementation](https://github.com/levan92/deep_sort_realtime)
- [YOLOv8 Tracking](https://docs.ultralytics.com/modes/track/)
- [MOT Challenge](https://motchallenge.net/) - Tracking benchmarks
