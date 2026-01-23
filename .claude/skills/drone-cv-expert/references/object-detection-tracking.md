# Object Detection & Tracking Reference

## Real-Time Aerial Object Detection

```python
import torch
import numpy as np
from ultralytics import YOLO
from typing import List, Dict, Tuple, Optional

class AerialObjectDetector:
    """
    YOLOv8-based object detection optimized for drone platforms.
    Handles altitude-dependent scaling and aerial-specific classes.
    """
    def __init__(self, model_path: str = 'yolov8n.pt', device: str = 'cuda'):
        self.model = YOLO(model_path)
        self.model.to(device)
        self.device = device

        # Confidence thresholds by altitude (lower when higher)
        self.altitude_conf_map = {
            0: 0.5,    # Ground level
            50: 0.4,   # 50m
            100: 0.35, # 100m
            200: 0.3   # 200m+
        }

    def detect(self, frame: np.ndarray, altitude: float = 0,
               classes: Optional[List[int]] = None) -> List[Dict]:
        """
        Detect objects in frame with altitude-adaptive confidence.

        Args:
            frame: BGR image from drone camera
            altitude: Current drone altitude in meters
            classes: Filter for specific class IDs (None for all)

        Returns:
            List of detections with bbox, class, confidence
        """
        # Get altitude-appropriate confidence threshold
        conf = self._get_confidence_threshold(altitude)

        # Run detection
        results = self.model(
            frame,
            conf=conf,
            classes=classes,
            verbose=False
        )[0]

        # Parse results
        detections = []
        for box in results.boxes:
            det = {
                'bbox': box.xyxy[0].cpu().numpy().tolist(),
                'class_id': int(box.cls[0].item()),
                'class_name': results.names[int(box.cls[0].item())],
                'confidence': float(box.conf[0].item()),
                'center': self._get_center(box.xyxy[0].cpu().numpy())
            }
            detections.append(det)

        return detections

    def _get_confidence_threshold(self, altitude: float) -> float:
        """Interpolate confidence threshold based on altitude"""
        sorted_alts = sorted(self.altitude_conf_map.keys())
        for i, alt in enumerate(sorted_alts[:-1]):
            if altitude < sorted_alts[i + 1]:
                # Linear interpolation
                t = (altitude - alt) / (sorted_alts[i + 1] - alt)
                return self.altitude_conf_map[alt] * (1 - t) + self.altitude_conf_map[sorted_alts[i + 1]] * t
        return self.altitude_conf_map[sorted_alts[-1]]

    def _get_center(self, bbox: np.ndarray) -> Tuple[float, float]:
        return ((bbox[0] + bbox[2]) / 2, (bbox[1] + bbox[3]) / 2)


class TensorRTDetector:
    """
    TensorRT-optimized detector for edge deployment.
    3-5x faster than PyTorch inference on Jetson.
    """
    def __init__(self, engine_path: str, input_size: Tuple[int, int] = (640, 640)):
        import tensorrt as trt

        self.input_size = input_size
        self.logger = trt.Logger(trt.Logger.WARNING)

        # Load engine
        with open(engine_path, 'rb') as f:
            self.engine = trt.Runtime(self.logger).deserialize_cuda_engine(f.read())

        self.context = self.engine.create_execution_context()

        # Allocate buffers
        self._allocate_buffers()

    def _allocate_buffers(self):
        import pycuda.driver as cuda

        self.inputs = []
        self.outputs = []
        self.bindings = []

        for binding in self.engine:
            size = trt.volume(self.engine.get_binding_shape(binding))
            dtype = trt.nptype(self.engine.get_binding_dtype(binding))

            # Allocate host and device buffers
            host_mem = cuda.pagelocked_empty(size, dtype)
            device_mem = cuda.mem_alloc(host_mem.nbytes)

            self.bindings.append(int(device_mem))

            if self.engine.binding_is_input(binding):
                self.inputs.append({'host': host_mem, 'device': device_mem})
            else:
                self.outputs.append({'host': host_mem, 'device': device_mem})

    def detect(self, frame: np.ndarray) -> List[Dict]:
        """Run TensorRT inference"""
        import pycuda.driver as cuda

        # Preprocess
        input_tensor = self._preprocess(frame)
        np.copyto(self.inputs[0]['host'], input_tensor.ravel())

        # Transfer to GPU
        cuda.memcpy_htod(self.inputs[0]['device'], self.inputs[0]['host'])

        # Execute
        self.context.execute_v2(bindings=self.bindings)

        # Transfer results back
        cuda.memcpy_dtoh(self.outputs[0]['host'], self.outputs[0]['device'])

        # Postprocess
        return self._postprocess(self.outputs[0]['host'], frame.shape)

    def _preprocess(self, frame: np.ndarray) -> np.ndarray:
        """Preprocess frame for inference"""
        import cv2
        img = cv2.resize(frame, self.input_size)
        img = img.astype(np.float32) / 255.0
        img = img.transpose(2, 0, 1)  # HWC to CHW
        return np.expand_dims(img, axis=0)

    def _postprocess(self, output: np.ndarray, orig_shape: Tuple) -> List[Dict]:
        """Parse YOLO output format"""
        # Implementation depends on YOLO version export format
        detections = []
        # ... parse output tensor ...
        return detections
```

## Multi-Object Tracking

### ByteTrack Implementation

```python
import numpy as np
from typing import List, Dict, Tuple
from scipy.optimize import linear_sum_assignment

class KalmanBoxTracker:
    """Kalman filter for tracking bounding box state"""
    count = 0

    def __init__(self, bbox: np.ndarray):
        from filterpy.kalman import KalmanFilter

        self.kf = KalmanFilter(dim_x=7, dim_z=4)

        # State: [x, y, s, r, dx, dy, ds]
        # x, y = center, s = area, r = aspect ratio
        self.kf.F = np.array([
            [1, 0, 0, 0, 1, 0, 0],
            [0, 1, 0, 0, 0, 1, 0],
            [0, 0, 1, 0, 0, 0, 1],
            [0, 0, 0, 1, 0, 0, 0],
            [0, 0, 0, 0, 1, 0, 0],
            [0, 0, 0, 0, 0, 1, 0],
            [0, 0, 0, 0, 0, 0, 1]
        ])

        self.kf.H = np.array([
            [1, 0, 0, 0, 0, 0, 0],
            [0, 1, 0, 0, 0, 0, 0],
            [0, 0, 1, 0, 0, 0, 0],
            [0, 0, 0, 1, 0, 0, 0]
        ])

        self.kf.R[2:, 2:] *= 10.0
        self.kf.P[4:, 4:] *= 1000.0
        self.kf.P *= 10.0
        self.kf.Q[-1, -1] *= 0.01
        self.kf.Q[4:, 4:] *= 0.01

        self.kf.x[:4] = self._bbox_to_z(bbox)

        self.time_since_update = 0
        self.id = KalmanBoxTracker.count
        KalmanBoxTracker.count += 1
        self.history = []
        self.hits = 0
        self.hit_streak = 0
        self.age = 0

    def update(self, bbox: np.ndarray):
        """Update with matched detection"""
        self.time_since_update = 0
        self.history = []
        self.hits += 1
        self.hit_streak += 1
        self.kf.update(self._bbox_to_z(bbox))

    def predict(self) -> np.ndarray:
        """Predict next state"""
        if (self.kf.x[6] + self.kf.x[2]) <= 0:
            self.kf.x[6] *= 0.0

        self.kf.predict()
        self.age += 1

        if self.time_since_update > 0:
            self.hit_streak = 0
        self.time_since_update += 1

        self.history.append(self._z_to_bbox(self.kf.x))
        return self.history[-1]

    def get_state(self) -> np.ndarray:
        return self._z_to_bbox(self.kf.x)

    def _bbox_to_z(self, bbox: np.ndarray) -> np.ndarray:
        """Convert [x1, y1, x2, y2] to [cx, cy, s, r]"""
        w = bbox[2] - bbox[0]
        h = bbox[3] - bbox[1]
        x = bbox[0] + w / 2
        y = bbox[1] + h / 2
        s = w * h
        r = w / float(h) if h > 0 else 1
        return np.array([x, y, s, r]).reshape((4, 1))

    def _z_to_bbox(self, z: np.ndarray) -> np.ndarray:
        """Convert [cx, cy, s, r] to [x1, y1, x2, y2]"""
        w = np.sqrt(z[2] * z[3])
        h = z[2] / w if w > 0 else z[2]
        return np.array([
            z[0] - w / 2,
            z[1] - h / 2,
            z[0] + w / 2,
            z[1] + h / 2
        ]).flatten()


class ByteTracker:
    """
    ByteTrack multi-object tracker.
    Associates detections across frames using IoU and appearance.
    """
    def __init__(self, max_age: int = 30, min_hits: int = 3, iou_threshold: float = 0.3):
        self.max_age = max_age
        self.min_hits = min_hits
        self.iou_threshold = iou_threshold
        self.trackers: List[KalmanBoxTracker] = []
        self.frame_count = 0

    def update(self, detections: List[Dict]) -> List[Dict]:
        """
        Update tracks with new detections.

        Args:
            detections: List of detections with 'bbox' and 'confidence'

        Returns:
            List of tracks with track_id, bbox, and status
        """
        self.frame_count += 1

        # Get predicted locations from existing trackers
        trks = np.zeros((len(self.trackers), 5))
        to_del = []
        for t, trk in enumerate(self.trackers):
            pos = trk.predict()
            trks[t, :] = [pos[0], pos[1], pos[2], pos[3], 0]
            if np.any(np.isnan(pos)):
                to_del.append(t)

        trks = np.ma.compress_rows(np.ma.masked_invalid(trks))
        for t in reversed(to_del):
            self.trackers.pop(t)

        # Split detections by confidence
        dets = np.array([d['bbox'] for d in detections])
        confs = np.array([d['confidence'] for d in detections])

        high_conf_mask = confs >= 0.5
        low_conf_mask = ~high_conf_mask

        high_dets = dets[high_conf_mask] if len(dets) > 0 else np.empty((0, 4))
        low_dets = dets[low_conf_mask] if len(dets) > 0 else np.empty((0, 4))

        # First association with high confidence detections
        matched, unmatched_dets, unmatched_trks = self._associate(
            high_dets, trks, self.iou_threshold
        )

        # Update matched trackers
        for t, d in matched:
            self.trackers[t].update(high_dets[d])

        # Second association with low confidence detections
        if len(low_dets) > 0 and len(unmatched_trks) > 0:
            left_trks = trks[unmatched_trks]
            matched2, _, _ = self._associate(low_dets, left_trks, 0.5)

            for t_idx, d in matched2:
                t = unmatched_trks[t_idx]
                self.trackers[t].update(low_dets[d])
                unmatched_trks = unmatched_trks[unmatched_trks != t]

        # Create new trackers for unmatched high-confidence detections
        for i in unmatched_dets:
            trk = KalmanBoxTracker(high_dets[i])
            self.trackers.append(trk)

        # Return active tracks
        ret = []
        for trk in reversed(self.trackers):
            d = trk.get_state()
            if (trk.time_since_update < 1) and \
               (trk.hit_streak >= self.min_hits or self.frame_count <= self.min_hits):
                ret.append({
                    'track_id': trk.id,
                    'bbox': d.tolist(),
                    'status': 'tracked'
                })

            # Remove dead tracks
            if trk.time_since_update > self.max_age:
                self.trackers.remove(trk)

        return ret

    def _associate(self, detections: np.ndarray, trackers: np.ndarray,
                   iou_threshold: float) -> Tuple[List, np.ndarray, np.ndarray]:
        """Associate detections with trackers using Hungarian algorithm"""
        if len(trackers) == 0:
            return [], np.arange(len(detections)), np.empty((0,), dtype=int)

        if len(detections) == 0:
            return [], np.empty((0,), dtype=int), np.arange(len(trackers))

        # Compute IoU matrix
        iou_matrix = self._iou_batch(detections, trackers[:, :4])
        cost_matrix = 1 - iou_matrix

        # Hungarian algorithm
        row_indices, col_indices = linear_sum_assignment(cost_matrix)

        # Filter low IoU matches
        matched = []
        unmatched_dets = list(range(len(detections)))
        unmatched_trks = list(range(len(trackers)))

        for r, c in zip(row_indices, col_indices):
            if iou_matrix[r, c] >= iou_threshold:
                matched.append((c, r))  # (tracker_idx, detection_idx)
                unmatched_dets.remove(r)
                unmatched_trks.remove(c)

        return matched, np.array(unmatched_dets), np.array(unmatched_trks)

    def _iou_batch(self, bb_test: np.ndarray, bb_gt: np.ndarray) -> np.ndarray:
        """Compute IoU between all pairs of boxes"""
        bb_gt = np.expand_dims(bb_gt, 0)
        bb_test = np.expand_dims(bb_test, 1)

        xx1 = np.maximum(bb_test[..., 0], bb_gt[..., 0])
        yy1 = np.maximum(bb_test[..., 1], bb_gt[..., 1])
        xx2 = np.minimum(bb_test[..., 2], bb_gt[..., 2])
        yy2 = np.minimum(bb_test[..., 3], bb_gt[..., 3])
        w = np.maximum(0., xx2 - xx1)
        h = np.maximum(0., yy2 - yy1)
        wh = w * h
        o = wh / ((bb_test[..., 2] - bb_test[..., 0]) * (bb_test[..., 3] - bb_test[..., 1])
                  + (bb_gt[..., 2] - bb_gt[..., 0]) * (bb_gt[..., 3] - bb_gt[..., 1]) - wh)
        return o


class TargetTracker:
    """
    Single-target tracker with prediction for fast-moving objects.
    Uses Kalman filter + optical flow for robust tracking.
    """
    def __init__(self):
        self.kalman = KalmanBoxTracker(np.array([0, 0, 100, 100]))
        self.last_bbox = None
        self.lost_frames = 0
        self.max_lost = 30

    def update(self, detection: Optional[Dict] = None) -> Dict:
        """Update tracker with detection (or None if lost)"""
        predicted = self.kalman.predict()

        if detection is not None:
            self.kalman.update(np.array(detection['bbox']))
            self.last_bbox = detection['bbox']
            self.lost_frames = 0
            status = 'tracking'
        else:
            self.lost_frames += 1
            self.last_bbox = predicted.tolist()
            status = 'predicting' if self.lost_frames < self.max_lost else 'lost'

        return {
            'bbox': self.last_bbox,
            'predicted_bbox': predicted.tolist(),
            'status': status,
            'lost_frames': self.lost_frames
        }
```

## Optical Flow for Motion Estimation

```python
import cv2
import numpy as np
from typing import Tuple, Optional

class OpticalFlowTracker:
    """
    Optical flow for visual motion estimation.
    Useful for velocity estimation and feature tracking.
    """
    def __init__(self, feature_params: Optional[dict] = None, lk_params: Optional[dict] = None):
        self.feature_params = feature_params or {
            'maxCorners': 100,
            'qualityLevel': 0.3,
            'minDistance': 7,
            'blockSize': 7
        }

        self.lk_params = lk_params or {
            'winSize': (15, 15),
            'maxLevel': 2,
            'criteria': (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 10, 0.03)
        }

        self.prev_gray = None
        self.prev_points = None

    def compute_flow(self, frame: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """
        Compute sparse optical flow between frames.

        Returns:
            flow_vectors: Motion vectors for each tracked point
            good_points: Points successfully tracked
        """
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY) if len(frame.shape) == 3 else frame

        if self.prev_gray is None:
            self.prev_gray = gray
            self.prev_points = cv2.goodFeaturesToTrack(gray, mask=None, **self.feature_params)
            return np.array([]), np.array([])

        if self.prev_points is None or len(self.prev_points) < 10:
            self.prev_points = cv2.goodFeaturesToTrack(gray, mask=None, **self.feature_params)

        # Calculate optical flow
        next_points, status, _ = cv2.calcOpticalFlowPyrLK(
            self.prev_gray, gray, self.prev_points, None, **self.lk_params
        )

        # Select good points
        if next_points is not None:
            good_old = self.prev_points[status == 1]
            good_new = next_points[status == 1]

            # Compute flow vectors
            flow_vectors = good_new - good_old

            # Update for next frame
            self.prev_gray = gray.copy()
            self.prev_points = good_new.reshape(-1, 1, 2)

            return flow_vectors, good_new

        return np.array([]), np.array([])

    def estimate_motion(self, frame: np.ndarray) -> Tuple[float, float, float]:
        """
        Estimate camera motion from optical flow.

        Returns:
            dx, dy: Translation in pixels
            rotation: Rotation in radians
        """
        flow_vectors, points = self.compute_flow(frame)

        if len(flow_vectors) < 4:
            return 0.0, 0.0, 0.0

        # Average translation
        dx = np.median(flow_vectors[:, 0])
        dy = np.median(flow_vectors[:, 1])

        # Estimate rotation from flow field
        # Points moving clockwise = positive rotation
        center = np.mean(points, axis=0)
        relative_pos = points - center

        # Cross product for rotation direction
        rotation_components = []
        for i, (pos, flow) in enumerate(zip(relative_pos, flow_vectors)):
            cross = pos[0] * flow[1] - pos[1] * flow[0]
            dist = np.linalg.norm(pos)
            if dist > 10:  # Avoid center points
                rotation_components.append(cross / dist)

        rotation = np.median(rotation_components) if rotation_components else 0.0

        return float(dx), float(dy), float(rotation)
```
