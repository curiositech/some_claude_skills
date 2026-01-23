# Forest Fire Detection Reference

## Multi-Modal Fire Detection Pipeline

```python
import cv2
import numpy as np
import torch
from ultralytics import YOLO
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
import time

@dataclass
class FireAlert:
    alert_type: str  # 'CONFIRMED_FIRE', 'HOTSPOT', 'SMOKE'
    confidence: float
    bbox: Tuple[int, int, int, int]
    gps_coords: Optional[Tuple[float, float]] = None
    temperature: Optional[float] = None
    timestamp: float = 0.0
    priority: str = 'MEDIUM'


class ForestFireDetector:
    """
    Multi-modal fire detection combining RGB and thermal imagery.
    Designed for real-time drone deployment.
    """
    def __init__(self,
                 thermal_model_path: str = 'fire_thermal_yolov8.pt',
                 smoke_model_path: str = 'smoke_detection_yolov8.pt',
                 device: str = 'cuda'):
        # Thermal camera fire detection
        self.thermal_model = YOLO(thermal_model_path)
        self.thermal_model.to(device)

        # RGB smoke detection
        self.smoke_model = YOLO(smoke_model_path)
        self.smoke_model.to(device)

        # Temperature thresholds
        self.temp_threshold = 60  # Celsius - potential hotspot
        self.fire_threshold = 150  # Celsius - confirmed fire
        self.alert_threshold = 0.7

        # Alert cooldown to prevent spam
        self.last_alert_time = {}
        self.alert_cooldown = 5.0  # seconds

    def process_frame(self, rgb_frame: np.ndarray,
                      thermal_frame: np.ndarray) -> List[FireAlert]:
        """
        Process both RGB and thermal frames simultaneously.

        Args:
            rgb_frame: BGR image from visible camera
            thermal_frame: Temperature array from thermal camera (Celsius)

        Returns:
            List of fire alerts with location and confidence
        """
        alerts = []

        # Smoke detection in RGB
        smoke_dets = self._detect_smoke(rgb_frame)

        # Hotspot detection in thermal
        hotspots = self._detect_hotspots(thermal_frame)

        # Fire detection using thermal model
        fire_dets = self._detect_thermal_fire(thermal_frame)

        # Multi-modal fusion
        alerts = self._fuse_detections(smoke_dets, fire_dets, hotspots)

        return alerts

    def _detect_smoke(self, rgb_frame: np.ndarray) -> List[Dict]:
        """Detect smoke plumes in RGB image"""
        results = self.smoke_model(rgb_frame, conf=0.5, verbose=False)[0]

        detections = []
        for box in results.boxes:
            det = {
                'bbox': tuple(map(int, box.xyxy[0].cpu().numpy())),
                'confidence': float(box.conf[0].item()),
                'class': 'smoke'
            }
            detections.append(det)

        return detections

    def _detect_hotspots(self, thermal_frame: np.ndarray) -> List[Dict]:
        """Detect temperature anomalies in thermal image"""
        # Create binary mask for hot regions
        hot_mask = (thermal_frame > self.temp_threshold).astype(np.uint8)

        # Find contours
        contours, _ = cv2.findContours(
            hot_mask,
            cv2.RETR_EXTERNAL,
            cv2.CHAIN_APPROX_SIMPLE
        )

        hotspots = []
        for contour in contours:
            area = cv2.contourArea(contour)
            if area < 100:  # Skip tiny regions (noise)
                continue

            x, y, w, h = cv2.boundingRect(contour)
            region = thermal_frame[y:y+h, x:x+w]

            hotspots.append({
                'bbox': (x, y, x+w, y+h),
                'max_temp': float(np.max(region)),
                'mean_temp': float(np.mean(region)),
                'area': area,
                'class': 'hotspot'
            })

        return hotspots

    def _detect_thermal_fire(self, thermal_frame: np.ndarray) -> List[Dict]:
        """Run fire detection model on thermal image"""
        # Normalize for model input
        thermal_normalized = self._normalize_thermal(thermal_frame)

        results = self.thermal_model(thermal_normalized, conf=0.6, verbose=False)[0]

        detections = []
        for box in results.boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0].cpu().numpy())

            # Get actual temperature from thermal data
            region = thermal_frame[y1:y2, x1:x2]
            max_temp = float(np.max(region)) if region.size > 0 else 0

            det = {
                'bbox': (x1, y1, x2, y2),
                'confidence': float(box.conf[0].item()),
                'max_temp': max_temp,
                'class': 'fire'
            }
            detections.append(det)

        return detections

    def _normalize_thermal(self, thermal: np.ndarray) -> np.ndarray:
        """Normalize thermal data to 0-255 for model input"""
        # Clip to expected range
        thermal_clipped = np.clip(thermal, -20, 300)
        # Normalize
        normalized = ((thermal_clipped + 20) / 320 * 255).astype(np.uint8)
        # Convert to 3-channel for YOLO
        return cv2.cvtColor(normalized, cv2.COLOR_GRAY2BGR)

    def _fuse_detections(self, smoke: List[Dict], fire: List[Dict],
                         hotspots: List[Dict]) -> List[FireAlert]:
        """
        Multi-modal fusion for high-confidence fire alerts.
        Priority: Fire+Smoke > Fire-only > Hotspot
        """
        alerts = []
        current_time = time.time()

        # High priority: Thermal fire detection + RGB smoke
        for fire_det in fire:
            for smoke_det in smoke:
                iou = self._calculate_iou(fire_det['bbox'], smoke_det['bbox'])
                if iou > 0.2:  # Overlapping detections
                    combined_conf = (fire_det['confidence'] + smoke_det['confidence']) / 2
                    alert = FireAlert(
                        alert_type='CONFIRMED_FIRE',
                        confidence=min(0.98, combined_conf + 0.2),  # Boost for multi-modal
                        bbox=fire_det['bbox'],
                        temperature=fire_det.get('max_temp'),
                        timestamp=current_time,
                        priority='CRITICAL'
                    )
                    alerts.append(alert)

        # Medium priority: Thermal fire without smoke
        for fire_det in fire:
            # Skip if already in confirmed fire
            already_confirmed = any(
                self._calculate_iou(fire_det['bbox'], a.bbox) > 0.5
                for a in alerts if a.alert_type == 'CONFIRMED_FIRE'
            )
            if not already_confirmed:
                alert = FireAlert(
                    alert_type='FIRE_THERMAL',
                    confidence=fire_det['confidence'],
                    bbox=fire_det['bbox'],
                    temperature=fire_det.get('max_temp'),
                    timestamp=current_time,
                    priority='HIGH'
                )
                alerts.append(alert)

        # Lower priority: Hotspots above fire threshold
        for hotspot in hotspots:
            if hotspot['max_temp'] > self.fire_threshold:
                alert = FireAlert(
                    alert_type='HOTSPOT_CRITICAL',
                    confidence=0.8,
                    bbox=hotspot['bbox'],
                    temperature=hotspot['max_temp'],
                    timestamp=current_time,
                    priority='HIGH'
                )
                alerts.append(alert)
            elif hotspot['max_temp'] > 80:  # Significant but not fire
                alert = FireAlert(
                    alert_type='HOTSPOT',
                    confidence=0.6,
                    bbox=hotspot['bbox'],
                    temperature=hotspot['max_temp'],
                    timestamp=current_time,
                    priority='MEDIUM'
                )
                alerts.append(alert)

        # Smoke-only alerts (could be early fire)
        for smoke_det in smoke:
            already_reported = any(
                self._calculate_iou(smoke_det['bbox'], a.bbox) > 0.3
                for a in alerts
            )
            if not already_reported:
                alert = FireAlert(
                    alert_type='SMOKE',
                    confidence=smoke_det['confidence'],
                    bbox=smoke_det['bbox'],
                    timestamp=current_time,
                    priority='MEDIUM'
                )
                alerts.append(alert)

        return alerts

    def _calculate_iou(self, box1: Tuple, box2: Tuple) -> float:
        """Calculate Intersection over Union"""
        x1 = max(box1[0], box2[0])
        y1 = max(box1[1], box2[1])
        x2 = min(box1[2], box2[2])
        y2 = min(box1[3], box2[3])

        intersection = max(0, x2 - x1) * max(0, y2 - y1)
        area1 = (box1[2] - box1[0]) * (box1[3] - box1[1])
        area2 = (box2[2] - box2[0]) * (box2[3] - box2[1])
        union = area1 + area2 - intersection

        return intersection / union if union > 0 else 0


class FireAlertSystem:
    """
    Georeferencing and dispatch system for fire alerts.
    """
    def __init__(self, camera_fov: Tuple[float, float] = (84, 58)):
        self.fov_h, self.fov_v = camera_fov  # degrees
        self.alert_history = []
        self.dispatch_endpoint = None

    def generate_georeferenced_alert(self, alert: FireAlert,
                                     drone_lat: float, drone_lon: float,
                                     drone_alt: float, gimbal_pitch: float,
                                     drone_heading: float,
                                     frame_size: Tuple[int, int] = (1920, 1080)) -> FireAlert:
        """
        Convert image-space detection to GPS coordinates.

        Args:
            alert: Fire alert with bbox in image coordinates
            drone_lat, drone_lon: Drone GPS position
            drone_alt: Altitude AGL in meters
            gimbal_pitch: Camera pitch angle (negative = looking down)
            drone_heading: Drone heading in degrees (0 = North)
            frame_size: Image dimensions (width, height)

        Returns:
            Alert with GPS coordinates added
        """
        img_w, img_h = frame_size
        x1, y1, x2, y2 = alert.bbox

        # Center of detection
        center_x = (x1 + x2) / 2
        center_y = (y1 + y2) / 2

        # Angle from image center
        angle_x = (center_x - img_w/2) / img_w * self.fov_h
        angle_y = (center_y - img_h/2) / img_h * self.fov_v

        # Adjust for gimbal pitch
        effective_pitch = gimbal_pitch + angle_y

        # Ground distance calculation
        if effective_pitch >= -5:  # Looking too horizontal
            return alert  # Can't estimate ground position

        ground_dist = drone_alt / np.tan(np.radians(-effective_pitch))

        # Horizontal offset from drone nadir
        ground_offset_x = ground_dist * np.tan(np.radians(angle_x))

        # Convert to North-East offsets (accounting for heading)
        heading_rad = np.radians(drone_heading)
        north_offset = ground_dist * np.cos(heading_rad) - ground_offset_x * np.sin(heading_rad)
        east_offset = ground_dist * np.sin(heading_rad) + ground_offset_x * np.cos(heading_rad)

        # Convert to GPS (rough approximation)
        # 1 degree latitude ≈ 111km
        # 1 degree longitude ≈ 111km * cos(latitude)
        dlat = north_offset / 111000
        dlon = east_offset / (111000 * np.cos(np.radians(drone_lat)))

        alert.gps_coords = (drone_lat + dlat, drone_lon + dlon)
        return alert

    def send_to_dispatch(self, alert: FireAlert):
        """Send alert to fire dispatch system"""
        payload = {
            'type': alert.alert_type,
            'priority': alert.priority,
            'confidence': alert.confidence,
            'location': {
                'lat': alert.gps_coords[0] if alert.gps_coords else None,
                'lon': alert.gps_coords[1] if alert.gps_coords else None
            },
            'temperature': alert.temperature,
            'timestamp': alert.timestamp
        }

        # Log for later
        self.alert_history.append(payload)

        # Send to dispatch (implementation depends on system)
        if self.dispatch_endpoint:
            import requests
            requests.post(self.dispatch_endpoint, json=payload)

        return payload
```

## Thermal Camera Integration

```python
import numpy as np
from typing import Tuple, Optional
import struct

class ThermalCameraInterface:
    """
    Interface for FLIR thermal cameras commonly used on drones.
    Supports radiometric temperature extraction.
    """
    def __init__(self, emissivity: float = 0.95,
                 reflected_temp: float = 25.0,
                 atmospheric_temp: float = 25.0,
                 distance: float = 50.0):
        self.emissivity = emissivity
        self.reflected_temp = reflected_temp
        self.atmospheric_temp = atmospheric_temp
        self.distance = distance

        # Planck constants for FLIR cameras (typical values)
        self.planck_r1 = 21106.77
        self.planck_r2 = 0.012545258
        self.planck_b = 1501.0
        self.planck_f = 1.0
        self.planck_o = -7340

    def raw_to_temperature(self, raw_value: int) -> float:
        """
        Convert raw radiometric value to temperature in Celsius.
        Uses FLIR's planck equation.
        """
        # Atmospheric correction
        tau = self._atmospheric_transmission()

        # Object signal
        raw_obj = (raw_value - self.planck_o) / self.emissivity / tau

        # Correct for reflected temperature
        raw_refl = self.planck_r1 / (self.planck_r2 * (np.exp(self.planck_b / (self.reflected_temp + 273.15)) - self.planck_f)) - self.planck_o
        raw_obj -= (1 - self.emissivity) * raw_refl / self.emissivity

        # Convert to temperature
        temp_k = self.planck_b / np.log(self.planck_r1 / (self.planck_r2 * (raw_obj + self.planck_o)) + self.planck_f)
        return temp_k - 273.15

    def _atmospheric_transmission(self) -> float:
        """Calculate atmospheric transmission based on distance"""
        # Simplified model - real implementation uses humidity, etc.
        alpha = 0.006
        return np.exp(-alpha * self.distance)

    def process_thermal_frame(self, raw_frame: np.ndarray) -> np.ndarray:
        """Convert entire raw frame to temperature array"""
        # Vectorized conversion
        tau = self._atmospheric_transmission()
        raw_obj = (raw_frame.astype(np.float64) - self.planck_o) / self.emissivity / tau

        raw_refl = self.planck_r1 / (self.planck_r2 * (np.exp(self.planck_b / (self.reflected_temp + 273.15)) - self.planck_f)) - self.planck_o
        raw_obj -= (1 - self.emissivity) * raw_refl / self.emissivity

        temp_k = self.planck_b / np.log(self.planck_r1 / (self.planck_r2 * (raw_obj + self.planck_o)) + self.planck_f)
        return temp_k - 273.15


class FLIRBosonInterface(ThermalCameraInterface):
    """Specific interface for FLIR Boson cameras"""
    def __init__(self, serial_port: str = '/dev/ttyUSB0'):
        super().__init__()
        self.serial_port = serial_port
        self.frame_width = 640
        self.frame_height = 512

    def capture_frame(self) -> Tuple[np.ndarray, np.ndarray]:
        """
        Capture both radiometric and visual thermal frame.

        Returns:
            temperature_frame: Float array of temperatures in Celsius
            visual_frame: 8-bit colorized frame for display
        """
        # Implementation depends on specific camera SDK
        # This is a template for the interface
        raw_frame = self._read_raw_frame()
        temp_frame = self.process_thermal_frame(raw_frame)
        visual_frame = self._colorize(temp_frame)
        return temp_frame, visual_frame

    def _colorize(self, temp_frame: np.ndarray,
                  vmin: float = -20, vmax: float = 150) -> np.ndarray:
        """Apply colormap to temperature data"""
        import cv2
        normalized = np.clip((temp_frame - vmin) / (vmax - vmin), 0, 1)
        normalized = (normalized * 255).astype(np.uint8)
        return cv2.applyColorMap(normalized, cv2.COLORMAP_INFERNO)

    def _read_raw_frame(self) -> np.ndarray:
        """Read raw frame from camera - implementation specific"""
        # Placeholder - actual implementation uses camera SDK
        return np.zeros((self.frame_height, self.frame_width), dtype=np.uint16)
```

## Fire Progression Tracking

```python
import numpy as np
from typing import List, Dict, Tuple
from collections import deque
import time

class FireProgressionTracker:
    """
    Track fire spread over time using consecutive detections.
    Estimates spread rate and direction.
    """
    def __init__(self, history_length: int = 100):
        self.detection_history: deque = deque(maxlen=history_length)
        self.fire_zones: Dict[str, List[Dict]] = {}

    def update(self, alerts: List, timestamp: float = None) -> Dict:
        """
        Update tracker with new alerts.

        Returns:
            Analysis dict with spread rate, direction, and predictions
        """
        timestamp = timestamp or time.time()

        # Record current detections
        current_state = {
            'timestamp': timestamp,
            'alerts': alerts,
            'total_area': sum(self._bbox_area(a.bbox) for a in alerts)
        }
        self.detection_history.append(current_state)

        if len(self.detection_history) < 2:
            return {'status': 'insufficient_data'}

        # Analyze progression
        analysis = self._analyze_progression()
        return analysis

    def _analyze_progression(self) -> Dict:
        """Analyze fire spread from history"""
        recent = list(self.detection_history)[-10:]

        if len(recent) < 2:
            return {'status': 'insufficient_data'}

        # Area change rate
        areas = [s['total_area'] for s in recent]
        timestamps = [s['timestamp'] for s in recent]

        dt = timestamps[-1] - timestamps[0]
        if dt > 0:
            area_rate = (areas[-1] - areas[0]) / dt  # pixels^2/second
        else:
            area_rate = 0

        # Centroid movement
        centroids = []
        for state in recent:
            if state['alerts']:
                cx = np.mean([self._bbox_center(a.bbox)[0] for a in state['alerts']])
                cy = np.mean([self._bbox_center(a.bbox)[1] for a in state['alerts']])
                centroids.append((cx, cy, state['timestamp']))

        spread_direction = None
        spread_speed = 0

        if len(centroids) >= 2:
            dx = centroids[-1][0] - centroids[0][0]
            dy = centroids[-1][1] - centroids[0][1]
            dt = centroids[-1][2] - centroids[0][2]

            if dt > 0:
                spread_speed = np.sqrt(dx**2 + dy**2) / dt
                spread_direction = np.degrees(np.arctan2(dy, dx))

        return {
            'status': 'tracking',
            'area_change_rate': area_rate,
            'spread_speed_pixels': spread_speed,
            'spread_direction_degrees': spread_direction,
            'trend': 'growing' if area_rate > 100 else 'stable' if area_rate > -100 else 'shrinking',
            'num_observations': len(recent)
        }

    def _bbox_area(self, bbox: Tuple) -> float:
        return (bbox[2] - bbox[0]) * (bbox[3] - bbox[1])

    def _bbox_center(self, bbox: Tuple) -> Tuple[float, float]:
        return ((bbox[0] + bbox[2]) / 2, (bbox[1] + bbox[3]) / 2)

    def predict_spread(self, time_horizon: float = 300) -> Dict:
        """
        Predict fire position in `time_horizon` seconds.

        Returns:
            Predicted fire extent and confidence
        """
        analysis = self._analyze_progression()

        if analysis['status'] != 'tracking':
            return {'status': 'cannot_predict'}

        if self.detection_history:
            last_alerts = self.detection_history[-1]['alerts']
            current_centroids = [self._bbox_center(a.bbox) for a in last_alerts]

            if current_centroids and analysis['spread_direction_degrees'] is not None:
                # Simple linear extrapolation
                speed = analysis['spread_speed_pixels']
                direction = np.radians(analysis['spread_direction_degrees'])

                predicted_dx = speed * time_horizon * np.cos(direction)
                predicted_dy = speed * time_horizon * np.sin(direction)

                avg_centroid = np.mean(current_centroids, axis=0)
                predicted_centroid = (
                    avg_centroid[0] + predicted_dx,
                    avg_centroid[1] + predicted_dy
                )

                return {
                    'status': 'predicted',
                    'current_centroid': tuple(avg_centroid),
                    'predicted_centroid': predicted_centroid,
                    'time_horizon_seconds': time_horizon,
                    'confidence': 0.7 if speed > 0 else 0.3
                }

        return {'status': 'cannot_predict'}
```
