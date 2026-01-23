# Roof Inspection Reference

## Damage Detection Pipeline

```python
import cv2
import numpy as np
from ultralytics import YOLO
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
from enum import Enum

class DamageType(Enum):
    MISSING_SHINGLE = 'missing_shingle'
    CRACK = 'crack'
    WEAR = 'wear'
    DEBRIS = 'debris'
    MOSS = 'moss'
    PONDING = 'ponding'
    FLASHING_DAMAGE = 'flashing_damage'
    GUTTER_DAMAGE = 'gutter_damage'

class SeverityLevel(Enum):
    LOW = 'low'
    MEDIUM = 'medium'
    HIGH = 'high'
    CRITICAL = 'critical'


@dataclass
class RoofDamage:
    damage_type: DamageType
    severity: SeverityLevel
    confidence: float
    bbox: Tuple[int, int, int, int]
    gps_coords: Optional[Tuple[float, float]] = None
    image_id: int = 0
    area_sqft: Optional[float] = None
    repair_cost_estimate: Optional[Tuple[float, float]] = None


class RoofInspector:
    """
    Comprehensive roof inspection using drone imagery.
    Detects damage, estimates severity, generates repair estimates.
    """
    def __init__(self, damage_model_path: str = 'roof_damage_yolov8.pt',
                 segment_model_path: str = 'roof_segmentation.pt',
                 device: str = 'cuda'):
        self.damage_model = YOLO(damage_model_path)
        self.damage_model.to(device)

        self.segment_model = YOLO(segment_model_path)
        self.segment_model.to(device)

        # Damage class mapping
        self.class_map = {
            0: DamageType.MISSING_SHINGLE,
            1: DamageType.CRACK,
            2: DamageType.WEAR,
            3: DamageType.DEBRIS,
            4: DamageType.MOSS,
            5: DamageType.PONDING,
            6: DamageType.FLASHING_DAMAGE,
            7: DamageType.GUTTER_DAMAGE
        }

        # Repair cost estimates (USD per sq ft)
        self.repair_costs = {
            DamageType.MISSING_SHINGLE: (5, 15),
            DamageType.CRACK: (10, 25),
            DamageType.WEAR: (3, 10),
            DamageType.DEBRIS: (1, 3),
            DamageType.MOSS: (2, 5),
            DamageType.PONDING: (15, 40),
            DamageType.FLASHING_DAMAGE: (20, 50),
            DamageType.GUTTER_DAMAGE: (10, 30)
        }

    def inspect_roof(self, image_sequence: List[np.ndarray],
                     gps_data: List[Tuple[float, float, float]],
                     altitude: float = 30.0) -> Dict:
        """
        Full roof inspection from drone image sequence.

        Args:
            image_sequence: List of BGR images
            gps_data: List of (lat, lon, alt) for each image
            altitude: Average flight altitude for scale calculation

        Returns:
            Inspection report with damages and recommendations
        """
        all_damages = []

        for idx, (img, gps) in enumerate(zip(image_sequence, gps_data)):
            # Segment roof area
            roof_mask = self._segment_roof(img)

            # Detect damages
            damages = self._detect_damages(img, roof_mask, idx)

            # Add GPS coordinates
            for damage in damages:
                damage.gps_coords = self._pixel_to_gps(
                    damage.bbox, img.shape, gps, altitude
                )

            all_damages.extend(damages)

        # Deduplicate overlapping detections
        all_damages = self._deduplicate_damages(all_damages)

        # Generate report
        report = self._generate_report(all_damages, image_sequence)

        return report

    def _segment_roof(self, image: np.ndarray) -> np.ndarray:
        """Segment roof area from image"""
        results = self.segment_model(image, verbose=False)[0]

        if results.masks is not None:
            # Combine all roof segment masks
            mask = np.zeros(image.shape[:2], dtype=np.uint8)
            for m in results.masks.data:
                mask |= m.cpu().numpy().astype(np.uint8)
            return mask

        # Fallback: assume entire image is roof
        return np.ones(image.shape[:2], dtype=np.uint8)

    def _detect_damages(self, image: np.ndarray,
                        roof_mask: np.ndarray, image_id: int) -> List[RoofDamage]:
        """Detect damages within roof area"""
        results = self.damage_model(image, conf=0.4, verbose=False)[0]

        damages = []
        for box in results.boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0].cpu().numpy())
            class_id = int(box.cls[0].item())
            confidence = float(box.conf[0].item())

            # Check if detection is within roof area
            center_x = (x1 + x2) // 2
            center_y = (y1 + y2) // 2
            if roof_mask[center_y, center_x] == 0:
                continue  # Skip detections outside roof

            damage_type = self.class_map.get(class_id, DamageType.WEAR)
            severity = self._assess_severity(damage_type, image[y1:y2, x1:x2])

            damage = RoofDamage(
                damage_type=damage_type,
                severity=severity,
                confidence=confidence,
                bbox=(x1, y1, x2, y2),
                image_id=image_id
            )
            damages.append(damage)

        return damages

    def _assess_severity(self, damage_type: DamageType,
                         damage_region: np.ndarray) -> SeverityLevel:
        """Assess damage severity based on type and visual analysis"""
        area = damage_region.shape[0] * damage_region.shape[1]

        if damage_type == DamageType.MISSING_SHINGLE:
            return SeverityLevel.HIGH  # Always high - water can enter

        elif damage_type == DamageType.CRACK:
            # Larger cracks are more severe
            if area > 5000:
                return SeverityLevel.CRITICAL
            elif area > 2000:
                return SeverityLevel.HIGH
            else:
                return SeverityLevel.MEDIUM

        elif damage_type == DamageType.WEAR:
            # Analyze darkness (more wear = darker)
            gray = cv2.cvtColor(damage_region, cv2.COLOR_BGR2GRAY) if len(damage_region.shape) == 3 else damage_region
            mean_brightness = np.mean(gray) / 255
            if mean_brightness < 0.3:
                return SeverityLevel.HIGH
            elif mean_brightness < 0.5:
                return SeverityLevel.MEDIUM
            return SeverityLevel.LOW

        elif damage_type == DamageType.PONDING:
            return SeverityLevel.HIGH  # Standing water is always concerning

        elif damage_type in [DamageType.DEBRIS, DamageType.MOSS]:
            if area > 10000:
                return SeverityLevel.MEDIUM
            return SeverityLevel.LOW

        return SeverityLevel.MEDIUM

    def _pixel_to_gps(self, bbox: Tuple, img_shape: Tuple,
                      drone_gps: Tuple[float, float, float],
                      altitude: float) -> Tuple[float, float]:
        """Convert pixel coordinates to GPS (simplified)"""
        img_h, img_w = img_shape[:2]
        lat, lon, _ = drone_gps

        # Approximate ground coverage (assuming nadir shot)
        # Typical drone camera: 84° FOV diagonal
        ground_width = 2 * altitude * np.tan(np.radians(42))  # meters
        ground_height = ground_width * img_h / img_w

        # Pixel center
        cx = (bbox[0] + bbox[2]) / 2
        cy = (bbox[1] + bbox[3]) / 2

        # Offset from image center
        dx = (cx - img_w/2) / img_w * ground_width
        dy = (cy - img_h/2) / img_h * ground_height

        # Convert to GPS offset (rough)
        dlat = -dy / 111000  # North is up in image
        dlon = dx / (111000 * np.cos(np.radians(lat)))

        return (lat + dlat, lon + dlon)

    def _deduplicate_damages(self, damages: List[RoofDamage]) -> List[RoofDamage]:
        """Remove duplicate detections of same damage from different images"""
        if not damages:
            return []

        # Sort by confidence
        damages = sorted(damages, key=lambda d: d.confidence, reverse=True)

        unique = []
        for damage in damages:
            is_duplicate = False
            for existing in unique:
                if damage.gps_coords and existing.gps_coords:
                    dist = self._gps_distance(damage.gps_coords, existing.gps_coords)
                    if dist < 1.0 and damage.damage_type == existing.damage_type:
                        is_duplicate = True
                        break
            if not is_duplicate:
                unique.append(damage)

        return unique

    def _gps_distance(self, coord1: Tuple, coord2: Tuple) -> float:
        """Distance between GPS coordinates in meters"""
        lat1, lon1 = coord1
        lat2, lon2 = coord2
        dlat = (lat2 - lat1) * 111000
        dlon = (lon2 - lon1) * 111000 * np.cos(np.radians(lat1))
        return np.sqrt(dlat**2 + dlon**2)

    def _generate_report(self, damages: List[RoofDamage],
                         images: List[np.ndarray]) -> Dict:
        """Generate comprehensive inspection report"""
        # Count by type and severity
        damage_summary = {}
        for damage in damages:
            key = (damage.damage_type.value, damage.severity.value)
            damage_summary[key] = damage_summary.get(key, 0) + 1

        # Calculate repair estimates
        total_cost_low = 0
        total_cost_high = 0
        for damage in damages:
            cost_range = self.repair_costs.get(damage.damage_type, (5, 15))
            # Assume average damage is 2 sq ft
            total_cost_low += cost_range[0] * 2
            total_cost_high += cost_range[1] * 2

        # Overall condition rating
        critical_count = sum(1 for d in damages if d.severity == SeverityLevel.CRITICAL)
        high_count = sum(1 for d in damages if d.severity == SeverityLevel.HIGH)

        if critical_count > 0:
            condition = 'POOR - Immediate attention required'
        elif high_count > 2:
            condition = 'FAIR - Repairs recommended within 3 months'
        elif high_count > 0:
            condition = 'GOOD - Minor repairs needed'
        else:
            condition = 'EXCELLENT - No significant issues'

        return {
            'total_damages': len(damages),
            'damage_summary': damage_summary,
            'damages': [
                {
                    'type': d.damage_type.value,
                    'severity': d.severity.value,
                    'confidence': d.confidence,
                    'location': d.gps_coords
                }
                for d in damages
            ],
            'repair_cost_estimate': {
                'low': total_cost_low,
                'high': total_cost_high,
                'currency': 'USD'
            },
            'overall_condition': condition,
            'images_analyzed': len(images),
            'recommendations': self._get_recommendations(damages)
        }

    def _get_recommendations(self, damages: List[RoofDamage]) -> List[str]:
        """Generate actionable recommendations"""
        recs = []

        damage_types = set(d.damage_type for d in damages)

        if DamageType.MISSING_SHINGLE in damage_types:
            recs.append("Replace missing shingles immediately to prevent water damage")

        if DamageType.CRACK in damage_types:
            recs.append("Seal cracks with roofing cement or schedule professional repair")

        if DamageType.PONDING in damage_types:
            recs.append("Address drainage issues causing water ponding")

        if DamageType.MOSS in damage_types:
            recs.append("Apply moss killer and consider zinc strips for prevention")

        if DamageType.FLASHING_DAMAGE in damage_types:
            recs.append("Reseal or replace damaged flashing around vents and chimneys")

        if not recs:
            recs.append("Continue regular maintenance and annual inspections")

        return recs
```

## Thermal Roof Analysis

```python
import cv2
import numpy as np
from typing import List, Dict, Tuple
from dataclasses import dataclass

@dataclass
class ThermalAnomaly:
    anomaly_type: str  # 'moisture', 'insulation_loss', 'hvac_leak', 'electrical'
    severity: str
    bbox: Tuple[int, int, int, int]
    temp_delta: float  # Temperature difference from surrounding
    avg_temp: float


class ThermalRoofAnalyzer:
    """
    Thermal analysis for roof inspection.
    Detects moisture, insulation issues, and HVAC problems.
    """
    def __init__(self):
        self.moisture_threshold = -5.0  # Degrees colder than average
        self.insulation_threshold = 3.0  # Degrees warmer than average
        self.hvac_threshold = 8.0  # Significant heat anomaly

    def analyze(self, thermal_frame: np.ndarray,
                rgb_frame: Optional[np.ndarray] = None) -> List[ThermalAnomaly]:
        """
        Analyze thermal image for roof anomalies.

        Args:
            thermal_frame: Temperature array in Celsius
            rgb_frame: Optional RGB image for context

        Returns:
            List of detected anomalies
        """
        anomalies = []

        # Calculate baseline statistics
        mean_temp = np.mean(thermal_frame)
        std_temp = np.std(thermal_frame)

        # Detect cold spots (potential moisture)
        cold_anomalies = self._detect_cold_spots(thermal_frame, mean_temp, std_temp)
        anomalies.extend(cold_anomalies)

        # Detect hot spots (insulation/HVAC issues)
        hot_anomalies = self._detect_hot_spots(thermal_frame, mean_temp, std_temp)
        anomalies.extend(hot_anomalies)

        return anomalies

    def _detect_cold_spots(self, thermal: np.ndarray,
                           mean_temp: float, std_temp: float) -> List[ThermalAnomaly]:
        """Detect moisture or missing insulation (cold spots)"""
        threshold = mean_temp + self.moisture_threshold

        cold_mask = (thermal < threshold).astype(np.uint8)

        # Morphological cleanup
        kernel = np.ones((5, 5), np.uint8)
        cold_mask = cv2.morphologyEx(cold_mask, cv2.MORPH_OPEN, kernel)
        cold_mask = cv2.morphologyEx(cold_mask, cv2.MORPH_CLOSE, kernel)

        contours, _ = cv2.findContours(cold_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        anomalies = []
        for contour in contours:
            area = cv2.contourArea(contour)
            if area < 500:  # Min area threshold
                continue

            x, y, w, h = cv2.boundingRect(contour)
            region_temp = thermal[y:y+h, x:x+w]
            avg_temp = float(np.mean(region_temp))
            temp_delta = avg_temp - mean_temp

            severity = 'high' if temp_delta < -8 else 'medium' if temp_delta < -5 else 'low'

            anomaly = ThermalAnomaly(
                anomaly_type='moisture' if temp_delta < -6 else 'insulation_loss',
                severity=severity,
                bbox=(x, y, x+w, y+h),
                temp_delta=temp_delta,
                avg_temp=avg_temp
            )
            anomalies.append(anomaly)

        return anomalies

    def _detect_hot_spots(self, thermal: np.ndarray,
                          mean_temp: float, std_temp: float) -> List[ThermalAnomaly]:
        """Detect heat buildup or HVAC leaks"""
        threshold = mean_temp + self.insulation_threshold

        hot_mask = (thermal > threshold).astype(np.uint8)

        # Morphological cleanup
        kernel = np.ones((5, 5), np.uint8)
        hot_mask = cv2.morphologyEx(hot_mask, cv2.MORPH_OPEN, kernel)

        contours, _ = cv2.findContours(hot_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        anomalies = []
        for contour in contours:
            area = cv2.contourArea(contour)
            if area < 500:
                continue

            x, y, w, h = cv2.boundingRect(contour)
            region_temp = thermal[y:y+h, x:x+w]
            avg_temp = float(np.mean(region_temp))
            max_temp = float(np.max(region_temp))
            temp_delta = avg_temp - mean_temp

            # Classify type based on characteristics
            if temp_delta > self.hvac_threshold:
                anomaly_type = 'hvac_leak'
                severity = 'high'
            elif max_temp > mean_temp + 15:
                anomaly_type = 'electrical'  # Potential electrical issue
                severity = 'critical'
            else:
                anomaly_type = 'insulation_loss'
                severity = 'medium' if temp_delta > 5 else 'low'

            anomaly = ThermalAnomaly(
                anomaly_type=anomaly_type,
                severity=severity,
                bbox=(x, y, x+w, y+h),
                temp_delta=temp_delta,
                avg_temp=avg_temp
            )
            anomalies.append(anomaly)

        return anomalies

    def generate_thermal_report(self, anomalies: List[ThermalAnomaly]) -> Dict:
        """Generate thermal inspection report"""
        if not anomalies:
            return {
                'status': 'pass',
                'message': 'No significant thermal anomalies detected',
                'anomalies': []
            }

        critical = [a for a in anomalies if a.severity == 'critical']
        high = [a for a in anomalies if a.severity == 'high']

        recommendations = []
        if any(a.anomaly_type == 'moisture' for a in anomalies):
            recommendations.append("Investigate potential moisture infiltration")
        if any(a.anomaly_type == 'hvac_leak' for a in anomalies):
            recommendations.append("Check HVAC system for leaks")
        if any(a.anomaly_type == 'electrical' for a in anomalies):
            recommendations.append("URGENT: Have electrician inspect hot spots")

        return {
            'status': 'fail' if critical else 'warning' if high else 'minor_issues',
            'total_anomalies': len(anomalies),
            'critical_count': len(critical),
            'high_count': len(high),
            'anomalies': [
                {
                    'type': a.anomaly_type,
                    'severity': a.severity,
                    'temp_delta': a.temp_delta,
                    'location': a.bbox
                }
                for a in anomalies
            ],
            'recommendations': recommendations
        }
```

## Material Classification

```python
import torch
import numpy as np
from typing import List, Dict, Tuple
from ultralytics import YOLO

class RoofMaterialClassifier:
    """
    Classify roofing materials from aerial imagery.
    Important for accurate repair cost estimation.
    """
    MATERIALS = [
        'asphalt_shingle',
        'metal_standing_seam',
        'metal_corrugated',
        'clay_tile',
        'concrete_tile',
        'slate',
        'wood_shake',
        'flat_membrane',
        'solar_panel'
    ]

    COST_PER_SQFT = {
        'asphalt_shingle': (3, 7),
        'metal_standing_seam': (8, 14),
        'metal_corrugated': (5, 10),
        'clay_tile': (10, 18),
        'concrete_tile': (8, 12),
        'slate': (15, 30),
        'wood_shake': (6, 12),
        'flat_membrane': (4, 8),
        'solar_panel': (0, 0)  # Special handling
    }

    def __init__(self, model_path: str = 'roof_material_classifier.pt'):
        self.model = YOLO(model_path)

    def classify(self, image: np.ndarray) -> Dict:
        """
        Classify roofing material from image.

        Returns:
            Material type and confidence
        """
        results = self.model(image, verbose=False)[0]

        if results.probs is not None:
            probs = results.probs.data.cpu().numpy()
            top_idx = np.argmax(probs)
            return {
                'material': self.MATERIALS[top_idx],
                'confidence': float(probs[top_idx]),
                'all_probabilities': {
                    self.MATERIALS[i]: float(probs[i])
                    for i in range(len(self.MATERIALS))
                }
            }

        return {'material': 'unknown', 'confidence': 0.0}

    def estimate_replacement_cost(self, material: str,
                                   area_sqft: float) -> Dict:
        """Estimate full roof replacement cost"""
        if material not in self.COST_PER_SQFT:
            material = 'asphalt_shingle'  # Default

        cost_low, cost_high = self.COST_PER_SQFT[material]

        return {
            'material': material,
            'area_sqft': area_sqft,
            'cost_per_sqft': {'low': cost_low, 'high': cost_high},
            'total_cost': {
                'low': cost_low * area_sqft,
                'high': cost_high * area_sqft
            },
            'note': 'Estimate only. Get professional quotes for accurate pricing.'
        }
```
