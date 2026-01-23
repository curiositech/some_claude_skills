# Insurance & Risk Assessment Reference

## Hail Damage Detection System

```python
import cv2
import numpy as np
from ultralytics import YOLO
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
from enum import Enum
import datetime

class HailDamageType(Enum):
    DENT = 'dent'                    # Impact dent on metal/shingle
    CRACK = 'crack'                  # Impact crack
    GRANULE_LOSS = 'granule_loss'    # Asphalt shingle granule displacement
    BRUISE = 'bruise'                # Soft spot from impact
    PUNCTURE = 'puncture'            # Complete penetration

class DamagePattern(Enum):
    RANDOM = 'random'                # True hail pattern (random distribution)
    LINEAR = 'linear'                # Foot traffic or other cause
    CLUSTERED = 'clustered'          # Localized damage
    AGE_RELATED = 'age_related'      # Wear, not hail


@dataclass
class HailImpact:
    damage_type: HailDamageType
    diameter_mm: float              # Estimated impact diameter
    confidence: float
    bbox: Tuple[int, int, int, int]
    severity_score: float           # 0-1 scale


class HailDamageDetector:
    """
    Detect and classify hail damage on roofing materials.
    Critical for insurance claims validation.
    """
    def __init__(self, model_path: str = 'hail_damage_yolov8.pt'):
        self.model = YOLO(model_path)

        # Hail size categories (diameter in mm)
        self.hail_categories = {
            'pea': (6, 10),
            'marble': (10, 15),
            'quarter': (25, 30),
            'golf_ball': (40, 45),
            'tennis_ball': (65, 70),
            'softball': (100, 115)
        }

    def detect_hail_damage(self, image: np.ndarray,
                           pixels_per_mm: float = 2.0) -> Dict:
        """
        Detect hail damage and estimate hail size.

        Args:
            image: BGR image of roof surface
            pixels_per_mm: Scale factor (depends on altitude and camera)

        Returns:
            Analysis with damage count, pattern, and hail size estimate
        """
        results = self.model(image, conf=0.3, verbose=False)[0]

        impacts = []
        for box in results.boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0].cpu().numpy())
            class_id = int(box.cls[0].item())
            confidence = float(box.conf[0].item())

            # Estimate impact diameter
            width_px = x2 - x1
            height_px = y2 - y1
            diameter_px = (width_px + height_px) / 2
            diameter_mm = diameter_px / pixels_per_mm

            impact = HailImpact(
                damage_type=self._classify_damage(class_id),
                diameter_mm=diameter_mm,
                confidence=confidence,
                bbox=(x1, y1, x2, y2),
                severity_score=self._calculate_severity(diameter_mm, class_id)
            )
            impacts.append(impact)

        # Analyze pattern
        pattern = self._analyze_pattern(impacts, image.shape)

        # Estimate hail size from impacts
        hail_size = self._estimate_hail_size(impacts)

        return {
            'total_impacts': len(impacts),
            'impacts': impacts,
            'pattern': pattern.value,
            'is_consistent_with_hail': pattern == DamagePattern.RANDOM,
            'estimated_hail_size': hail_size,
            'damage_density': len(impacts) / (image.shape[0] * image.shape[1]) * 1e6,
            'recommended_action': self._get_recommendation(impacts, pattern)
        }

    def _classify_damage(self, class_id: int) -> HailDamageType:
        mapping = {
            0: HailDamageType.DENT,
            1: HailDamageType.CRACK,
            2: HailDamageType.GRANULE_LOSS,
            3: HailDamageType.BRUISE,
            4: HailDamageType.PUNCTURE
        }
        return mapping.get(class_id, HailDamageType.DENT)

    def _calculate_severity(self, diameter_mm: float, class_id: int) -> float:
        """Calculate damage severity score 0-1"""
        # Base score from size
        size_score = min(diameter_mm / 50, 1.0)

        # Damage type multiplier
        type_multipliers = {0: 0.6, 1: 0.8, 2: 0.5, 3: 0.7, 4: 1.0}
        type_mult = type_multipliers.get(class_id, 0.5)

        return min(size_score * type_mult * 1.5, 1.0)

    def _analyze_pattern(self, impacts: List[HailImpact],
                         img_shape: Tuple) -> DamagePattern:
        """Analyze spatial distribution of impacts"""
        if len(impacts) < 5:
            return DamagePattern.CLUSTERED

        # Extract centroids
        centroids = np.array([
            ((i.bbox[0] + i.bbox[2])/2, (i.bbox[1] + i.bbox[3])/2)
            for i in impacts
        ])

        # Calculate nearest neighbor distances
        from scipy.spatial import distance_matrix
        distances = distance_matrix(centroids, centroids)
        np.fill_diagonal(distances, np.inf)
        nn_distances = np.min(distances, axis=1)

        # Check for randomness using coefficient of variation
        cv = np.std(nn_distances) / np.mean(nn_distances)

        # True hail has relatively random distribution
        if 0.3 < cv < 0.8:
            return DamagePattern.RANDOM

        # Very uniform spacing suggests artificial
        if cv < 0.3:
            return DamagePattern.LINEAR

        return DamagePattern.CLUSTERED

    def _estimate_hail_size(self, impacts: List[HailImpact]) -> Dict:
        """Estimate hail size from impact diameters"""
        if not impacts:
            return {'category': 'unknown', 'diameter_mm': 0}

        diameters = [i.diameter_mm for i in impacts]
        median_diameter = np.median(diameters)
        max_diameter = np.max(diameters)

        # Find closest category
        for name, (min_d, max_d) in self.hail_categories.items():
            if min_d <= median_diameter <= max_d:
                return {
                    'category': name,
                    'median_diameter_mm': median_diameter,
                    'max_diameter_mm': max_diameter,
                    'estimated_impact_force': self._impact_force(median_diameter)
                }

        return {
            'category': 'unknown',
            'median_diameter_mm': median_diameter,
            'max_diameter_mm': max_diameter
        }

    def _impact_force(self, diameter_mm: float) -> str:
        """Estimate impact force category"""
        if diameter_mm < 15:
            return 'minimal'
        elif diameter_mm < 30:
            return 'moderate'
        elif diameter_mm < 50:
            return 'significant'
        else:
            return 'severe'

    def _get_recommendation(self, impacts: List[HailImpact],
                            pattern: DamagePattern) -> str:
        if not impacts:
            return "No damage detected - document current condition"

        if pattern != DamagePattern.RANDOM:
            return "Damage pattern inconsistent with hail - investigate other causes"

        severe_count = sum(1 for i in impacts if i.severity_score > 0.7)
        if severe_count > 5:
            return "Significant hail damage - recommend full roof replacement claim"
        elif severe_count > 0:
            return "Moderate hail damage - recommend repair claim"
        else:
            return "Minor hail damage - monitor and document"


class InsuranceClaimPackager:
    """
    Package drone inspection data for insurance claims.
    Generates documentation meeting industry standards.
    """
    def __init__(self):
        self.inspection_date = None
        self.property_address = None
        self.policy_number = None

    def generate_claim_package(self, inspection_data: Dict,
                               property_info: Dict,
                               weather_data: Optional[Dict] = None) -> Dict:
        """
        Generate comprehensive claim documentation.

        Args:
            inspection_data: Output from drone inspection
            property_info: Property details (address, policy, etc.)
            weather_data: Historical weather data for event correlation

        Returns:
            Structured claim package
        """
        package = {
            'metadata': {
                'generated_date': datetime.datetime.now().isoformat(),
                'inspection_date': inspection_data.get('date'),
                'inspector': 'Autonomous Drone System',
                'methodology': 'AI-assisted aerial imagery analysis'
            },
            'property': property_info,
            'damage_assessment': {
                'total_damage_areas': inspection_data.get('total_impacts', 0),
                'damage_types': self._summarize_damage_types(inspection_data),
                'affected_area_sqft': inspection_data.get('affected_area', 0),
                'severity_rating': self._calculate_severity_rating(inspection_data)
            },
            'weather_correlation': None,
            'cost_estimate': self._estimate_costs(inspection_data, property_info),
            'supporting_evidence': {
                'images': inspection_data.get('image_urls', []),
                'thermal_analysis': inspection_data.get('thermal', {}),
                'gps_coordinates': inspection_data.get('damage_locations', [])
            },
            'recommendations': inspection_data.get('recommendations', [])
        }

        if weather_data:
            package['weather_correlation'] = self._correlate_weather(
                weather_data, inspection_data
            )

        return package

    def _summarize_damage_types(self, data: Dict) -> Dict:
        """Summarize damage by type"""
        impacts = data.get('impacts', [])
        summary = {}
        for impact in impacts:
            dtype = impact.damage_type.value if hasattr(impact, 'damage_type') else str(impact.get('type', 'unknown'))
            summary[dtype] = summary.get(dtype, 0) + 1
        return summary

    def _calculate_severity_rating(self, data: Dict) -> str:
        """Calculate overall severity rating"""
        impacts = data.get('impacts', [])
        if not impacts:
            return 'none'

        avg_severity = np.mean([
            i.severity_score if hasattr(i, 'severity_score') else 0.5
            for i in impacts
        ])

        if avg_severity > 0.7:
            return 'severe'
        elif avg_severity > 0.5:
            return 'moderate'
        elif avg_severity > 0.3:
            return 'minor'
        return 'minimal'

    def _estimate_costs(self, inspection_data: Dict, property_info: Dict) -> Dict:
        """Generate repair/replacement cost estimate"""
        roof_area = property_info.get('roof_area_sqft', 2000)
        material = property_info.get('roof_material', 'asphalt_shingle')

        # Base costs per sq ft
        costs = {
            'asphalt_shingle': {'repair': 8, 'replace': 5},
            'metal': {'repair': 12, 'replace': 10},
            'tile': {'repair': 15, 'replace': 12},
            'slate': {'repair': 25, 'replace': 20}
        }

        base_cost = costs.get(material, costs['asphalt_shingle'])
        damage_ratio = min(inspection_data.get('damage_density', 0) / 100, 1.0)

        if damage_ratio > 0.3:  # > 30% damage typically means replacement
            estimated_cost = roof_area * base_cost['replace']
            action = 'full_replacement'
        else:
            estimated_cost = roof_area * damage_ratio * base_cost['repair'] * 1.5
            action = 'repair'

        return {
            'recommended_action': action,
            'estimated_cost_low': estimated_cost * 0.8,
            'estimated_cost_high': estimated_cost * 1.2,
            'confidence': 'medium',
            'note': 'Final costs subject to contractor assessment'
        }

    def _correlate_weather(self, weather_data: Dict, inspection_data: Dict) -> Dict:
        """Correlate damage with weather events"""
        # Look for hail events in the area
        hail_events = weather_data.get('hail_events', [])

        if not hail_events:
            return {
                'correlated_event': None,
                'correlation_confidence': 'low',
                'note': 'No recorded hail events in area'
            }

        # Find most likely event based on timing and severity
        best_match = None
        for event in hail_events:
            if event.get('hail_size_mm', 0) > 20:
                best_match = event
                break

        if best_match:
            return {
                'correlated_event': best_match,
                'correlation_confidence': 'high',
                'event_date': best_match.get('date'),
                'hail_size': best_match.get('hail_size_mm'),
                'affected_area': best_match.get('affected_radius_km')
            }

        return {
            'correlated_event': None,
            'correlation_confidence': 'medium',
            'note': 'Unable to correlate with specific event'
        }
```

## Wildfire Risk Assessment

```python
import numpy as np
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
from enum import Enum
import json

class VegetationType(Enum):
    GRASS = 'grass'
    BRUSH = 'brush'
    TIMBER = 'timber'
    SLASH = 'slash'          # Logging debris
    CHAPARRAL = 'chaparral'

class DefensibleSpaceZone(Enum):
    ZONE_0 = 0    # 0-5 ft: Ember-resistant zone
    ZONE_1 = 1    # 5-30 ft: Lean, clean, green zone
    ZONE_2 = 2    # 30-100 ft: Reduced fuel zone
    ZONE_3 = 3    # 100+ ft: Extended buffer


@dataclass
class FireRiskFactor:
    factor_name: str
    score: float          # 0-1 normalized
    weight: float         # Importance weight
    details: Dict


class WildfireRiskAssessor:
    """
    Assess wildfire risk for properties using drone/satellite data.
    Based on NFPA 1144 and CAL FIRE defensible space guidelines.
    """
    def __init__(self):
        # Risk factor weights (sum to 1)
        self.weights = {
            'vegetation_density': 0.20,
            'vegetation_type': 0.15,
            'slope': 0.15,
            'defensible_space': 0.20,
            'roof_material': 0.10,
            'structure_spacing': 0.10,
            'access_egress': 0.10
        }

    def assess_property_risk(self, property_data: Dict,
                             drone_imagery: Optional[Dict] = None,
                             satellite_data: Optional[Dict] = None) -> Dict:
        """
        Comprehensive wildfire risk assessment.

        Args:
            property_data: Property characteristics
            drone_imagery: Analyzed drone imagery data
            satellite_data: NDVI, fuel load, etc. from satellite

        Returns:
            Risk assessment with mitigation recommendations
        """
        risk_factors = []

        # 1. Vegetation analysis
        veg_risk = self._assess_vegetation(drone_imagery, satellite_data)
        risk_factors.append(veg_risk)

        # 2. Topography/slope
        slope_risk = self._assess_slope(property_data)
        risk_factors.append(slope_risk)

        # 3. Defensible space compliance
        space_risk = self._assess_defensible_space(drone_imagery, property_data)
        risk_factors.append(space_risk)

        # 4. Structure vulnerability
        struct_risk = self._assess_structure(property_data, drone_imagery)
        risk_factors.append(struct_risk)

        # Calculate overall risk score
        overall_score = sum(
            f.score * f.weight for f in risk_factors
        )

        # Generate risk category
        if overall_score > 0.7:
            risk_category = 'EXTREME'
        elif overall_score > 0.5:
            risk_category = 'HIGH'
        elif overall_score > 0.3:
            risk_category = 'MODERATE'
        else:
            risk_category = 'LOW'

        return {
            'overall_risk_score': overall_score,
            'risk_category': risk_category,
            'risk_factors': [
                {
                    'name': f.factor_name,
                    'score': f.score,
                    'weight': f.weight,
                    'contribution': f.score * f.weight,
                    'details': f.details
                }
                for f in risk_factors
            ],
            'mitigation_recommendations': self._generate_mitigations(risk_factors),
            'insurance_implications': self._insurance_implications(overall_score, risk_factors),
            'estimated_mitigation_cost': self._estimate_mitigation_cost(risk_factors)
        }

    def _assess_vegetation(self, drone_data: Optional[Dict],
                           satellite_data: Optional[Dict]) -> FireRiskFactor:
        """Assess vegetation-related fire risk"""
        if satellite_data:
            ndvi = satellite_data.get('ndvi', 0.5)
            fuel_load = satellite_data.get('fuel_load_tons_acre', 10)
            veg_type = satellite_data.get('dominant_vegetation', 'brush')
        else:
            ndvi = 0.5
            fuel_load = 10
            veg_type = 'brush'

        # NDVI interpretation (0.2-0.8 typical range)
        # Higher NDVI = more vegetation = more fuel
        ndvi_score = min(max((ndvi - 0.2) / 0.6, 0), 1)

        # Fuel load scoring
        fuel_score = min(fuel_load / 30, 1)  # 30 tons/acre = max risk

        # Vegetation type risk
        type_scores = {
            'grass': 0.4,      # Fast spread but low intensity
            'brush': 0.7,      # High intensity
            'chaparral': 0.9,  # Very high intensity
            'timber': 0.6,     # Moderate, depends on undergrowth
            'slash': 0.8       # Accumulated fuel
        }
        type_score = type_scores.get(veg_type, 0.5)

        combined_score = (ndvi_score * 0.3 + fuel_score * 0.4 + type_score * 0.3)

        return FireRiskFactor(
            factor_name='vegetation',
            score=combined_score,
            weight=self.weights['vegetation_density'] + self.weights['vegetation_type'],
            details={
                'ndvi': ndvi,
                'fuel_load_tons_acre': fuel_load,
                'vegetation_type': veg_type,
                'ndvi_score': ndvi_score,
                'fuel_score': fuel_score,
                'type_score': type_score
            }
        )

    def _assess_slope(self, property_data: Dict) -> FireRiskFactor:
        """Assess slope-related risk (fire spreads faster uphill)"""
        slope_percent = property_data.get('slope_percent', 0)

        # Slope scoring: &gt;40% is extreme
        if slope_percent < 10:
            score = 0.2
        elif slope_percent < 20:
            score = 0.4
        elif slope_percent < 30:
            score = 0.6
        elif slope_percent < 40:
            score = 0.8
        else:
            score = 1.0

        return FireRiskFactor(
            factor_name='slope',
            score=score,
            weight=self.weights['slope'],
            details={
                'slope_percent': slope_percent,
                'fire_behavior_note': 'Fire rate of spread doubles every 20% slope increase'
            }
        )

    def _assess_defensible_space(self, drone_data: Optional[Dict],
                                  property_data: Dict) -> FireRiskFactor:
        """Assess defensible space compliance by zone"""
        zone_scores = []

        # Zone 0: 0-5 ft (ember-resistant)
        zone0_clear = property_data.get('zone0_cleared', False)
        zone_scores.append(0.0 if zone0_clear else 1.0)

        # Zone 1: 5-30 ft (lean, clean, green)
        zone1_compliance = property_data.get('zone1_compliance', 0.5)
        zone_scores.append(1.0 - zone1_compliance)

        # Zone 2: 30-100 ft (reduced fuel)
        zone2_compliance = property_data.get('zone2_compliance', 0.5)
        zone_scores.append(1.0 - zone2_compliance)

        # Weighted by proximity importance
        weighted_score = zone_scores[0] * 0.5 + zone_scores[1] * 0.35 + zone_scores[2] * 0.15

        return FireRiskFactor(
            factor_name='defensible_space',
            score=weighted_score,
            weight=self.weights['defensible_space'],
            details={
                'zone_0_compliant': zone0_clear,
                'zone_1_compliance': zone1_compliance,
                'zone_2_compliance': zone2_compliance,
                'zone_scores': zone_scores
            }
        )

    def _assess_structure(self, property_data: Dict,
                          drone_data: Optional[Dict]) -> FireRiskFactor:
        """Assess structure vulnerability"""
        roof_material = property_data.get('roof_material', 'asphalt_shingle')
        siding_material = property_data.get('siding_material', 'wood')
        vents_screened = property_data.get('vents_screened', False)
        deck_material = property_data.get('deck_material', 'wood')

        # Roof fire rating
        roof_scores = {
            'metal': 0.1,
            'tile': 0.2,
            'asphalt_shingle_class_a': 0.3,
            'asphalt_shingle': 0.4,
            'wood_shake_treated': 0.7,
            'wood_shake': 1.0
        }
        roof_score = roof_scores.get(roof_material, 0.5)

        # Siding vulnerability
        siding_scores = {
            'stucco': 0.1,
            'brick': 0.1,
            'fiber_cement': 0.2,
            'vinyl': 0.5,
            'wood': 0.8
        }
        siding_score = siding_scores.get(siding_material, 0.5)

        # Vent protection
        vent_score = 0.0 if vents_screened else 0.8

        combined = roof_score * 0.4 + siding_score * 0.3 + vent_score * 0.3

        return FireRiskFactor(
            factor_name='structure_vulnerability',
            score=combined,
            weight=self.weights['roof_material'],
            details={
                'roof_material': roof_material,
                'roof_score': roof_score,
                'siding_material': siding_material,
                'siding_score': siding_score,
                'vents_screened': vents_screened
            }
        )

    def _generate_mitigations(self, risk_factors: List[FireRiskFactor]) -> List[Dict]:
        """Generate prioritized mitigation recommendations"""
        mitigations = []

        # Sort by contribution to risk
        sorted_factors = sorted(
            risk_factors,
            key=lambda f: f.score * f.weight,
            reverse=True
        )

        for factor in sorted_factors:
            if factor.factor_name == 'vegetation' and factor.score > 0.5:
                mitigations.append({
                    'priority': 'high',
                    'action': 'Reduce vegetation density within 100ft',
                    'estimated_risk_reduction': 0.15,
                    'cost_range': '$500-$3000'
                })

            if factor.factor_name == 'defensible_space' and factor.score > 0.5:
                mitigations.append({
                    'priority': 'critical',
                    'action': 'Create compliant defensible space zones',
                    'estimated_risk_reduction': 0.20,
                    'cost_range': '$1000-$5000'
                })

            if factor.factor_name == 'structure_vulnerability' and factor.score > 0.5:
                if factor.details.get('roof_score', 0) > 0.5:
                    mitigations.append({
                        'priority': 'medium',
                        'action': 'Upgrade to Class A fire-rated roofing',
                        'estimated_risk_reduction': 0.10,
                        'cost_range': '$5000-$15000'
                    })
                if not factor.details.get('vents_screened', True):
                    mitigations.append({
                        'priority': 'high',
                        'action': 'Install 1/8" mesh screens on all vents',
                        'estimated_risk_reduction': 0.08,
                        'cost_range': '$200-$800'
                    })

        return mitigations

    def _insurance_implications(self, overall_score: float,
                                risk_factors: List[FireRiskFactor]) -> Dict:
        """Calculate insurance implications"""
        # Premium adjustment factors
        if overall_score > 0.7:
            premium_factor = 2.0
            coverage_note = 'May require high-risk carrier'
            deductible_note = 'Expect higher deductibles (2-5% of dwelling)'
        elif overall_score > 0.5:
            premium_factor = 1.5
            coverage_note = 'Standard carriers with surcharge'
            deductible_note = 'Standard deductibles may apply'
        elif overall_score > 0.3:
            premium_factor = 1.2
            coverage_note = 'Standard coverage available'
            deductible_note = 'Standard deductibles'
        else:
            premium_factor = 1.0
            coverage_note = 'Standard coverage, possible discount available'
            deductible_note = 'Standard deductibles'

        return {
            'estimated_premium_factor': premium_factor,
            'coverage_availability': coverage_note,
            'deductible_expectations': deductible_note,
            'mitigation_credit_available': overall_score > 0.3,
            'note': 'Implementing mitigations may reduce premiums significantly'
        }

    def _estimate_mitigation_cost(self, risk_factors: List[FireRiskFactor]) -> Dict:
        """Estimate total mitigation costs"""
        total_low = 0
        total_high = 0

        for factor in risk_factors:
            if factor.score > 0.5:
                if factor.factor_name == 'vegetation':
                    total_low += 500
                    total_high += 3000
                elif factor.factor_name == 'defensible_space':
                    total_low += 1000
                    total_high += 5000
                elif factor.factor_name == 'structure_vulnerability':
                    total_low += 500
                    total_high += 15000

        return {
            'estimated_low': total_low,
            'estimated_high': total_high,
            'roi_note': 'Mitigation costs typically offset by 10-30% premium reduction over 5 years'
        }
```

## Satellite & Aerial Data Integration

```python
import numpy as np
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from datetime import datetime, timedelta

@dataclass
class SatellitePass:
    satellite: str        # 'sentinel-2', 'landsat-8', 'planet'
    timestamp: datetime
    resolution_m: float
    bands: List[str]
    cloud_cover_pct: float


class PreconditionDataCollector:
    """
    Collect precondition data for insurance risk assessment.
    Integrates drone, aircraft, and satellite data sources.
    """

    # Data requirements by assessment type
    DATA_REQUIREMENTS = {
        'wildfire_risk': {
            'satellite': ['ndvi', 'fuel_moisture', 'land_cover'],
            'drone': ['vegetation_density', 'defensible_space', 'structure_materials'],
            'ground': ['slope', 'aspect', 'soil_moisture']
        },
        'hail_damage': {
            'satellite': ['historical_imagery'],
            'drone': ['damage_detection', 'material_classification'],
            'weather': ['hail_reports', 'storm_tracks']
        },
        'flood_risk': {
            'satellite': ['dem', 'historical_flooding', 'land_use'],
            'drone': ['drainage_patterns', 'elevation_mapping'],
            'ground': ['soil_type', 'water_table']
        }
    }

    def __init__(self):
        self.satellite_sources = {
            'sentinel-2': {'resolution': 10, 'revisit_days': 5},
            'landsat-8': {'resolution': 30, 'revisit_days': 16},
            'planet': {'resolution': 3, 'revisit_days': 1}
        }

    def plan_data_collection(self, property_locations: List[Tuple[float, float]],
                             assessment_type: str,
                             timeline_days: int = 30) -> Dict:
        """
        Plan comprehensive data collection campaign.

        Args:
            property_locations: List of (lat, lon) coordinates
            assessment_type: Type of assessment (e.g., 'wildfire_risk')
            timeline_days: Days available for collection

        Returns:
            Collection plan with satellite passes, drone missions, ground tasks
        """
        requirements = self.DATA_REQUIREMENTS.get(assessment_type, {})

        plan = {
            'assessment_type': assessment_type,
            'properties': len(property_locations),
            'timeline_days': timeline_days,
            'satellite_plan': self._plan_satellite_collection(
                property_locations, requirements.get('satellite', [])
            ),
            'drone_missions': self._plan_drone_missions(
                property_locations, requirements.get('drone', [])
            ),
            'ground_verification': self._plan_ground_tasks(
                property_locations, requirements.get('ground', [])
            ),
            'estimated_cost': None,
            'data_fusion_strategy': self._fusion_strategy(assessment_type)
        }

        plan['estimated_cost'] = self._estimate_collection_cost(plan)

        return plan

    def _plan_satellite_collection(self, locations: List[Tuple],
                                    data_needs: List[str]) -> Dict:
        """Plan satellite data acquisition"""
        # Determine best satellite based on needs
        if 'fuel_moisture' in data_needs:
            best_satellite = 'sentinel-2'  # Has SWIR bands
        elif any('high_res' in need for need in data_needs):
            best_satellite = 'planet'
        else:
            best_satellite = 'landsat-8'

        source = self.satellite_sources[best_satellite]

        return {
            'primary_source': best_satellite,
            'resolution_m': source['resolution'],
            'revisit_days': source['revisit_days'],
            'required_bands': self._get_required_bands(data_needs),
            'cloud_threshold_pct': 20,
            'historical_baseline': True,
            'years_of_baseline': 5,
            'derived_products': data_needs
        }

    def _plan_drone_missions(self, locations: List[Tuple],
                              data_needs: List[str]) -> List[Dict]:
        """Plan drone missions for each property"""
        missions = []

        for i, (lat, lon) in enumerate(locations):
            mission = {
                'property_id': i,
                'location': (lat, lon),
                'flight_plans': []
            }

            # RGB mapping flight
            if any(need in ['vegetation_density', 'structure_materials']
                   for need in data_needs):
                mission['flight_plans'].append({
                    'type': 'rgb_mapping',
                    'altitude_m': 50,
                    'overlap_pct': 80,
                    'estimated_duration_min': 20,
                    'outputs': ['orthomosaic', '3d_model']
                })

            # Thermal flight (if needed)
            if 'defensible_space' in data_needs:
                mission['flight_plans'].append({
                    'type': 'thermal_survey',
                    'altitude_m': 40,
                    'overlap_pct': 70,
                    'estimated_duration_min': 15,
                    'outputs': ['thermal_mosaic', 'heat_signature_map']
                })

            # Detail inspection
            if 'damage_detection' in data_needs:
                mission['flight_plans'].append({
                    'type': 'close_inspection',
                    'altitude_m': 10,
                    'pattern': 'orbit_structure',
                    'estimated_duration_min': 10,
                    'outputs': ['high_res_images', 'damage_annotations']
                })

            missions.append(mission)

        return missions

    def _plan_ground_tasks(self, locations: List[Tuple],
                           data_needs: List[str]) -> List[Dict]:
        """Plan ground-based data collection"""
        tasks = []

        for i, (lat, lon) in enumerate(locations):
            property_tasks = {
                'property_id': i,
                'location': (lat, lon),
                'tasks': []
            }

            if 'slope' in data_needs:
                property_tasks['tasks'].append({
                    'type': 'topographic_survey',
                    'method': 'gps_transect',
                    'estimated_time_hours': 2
                })

            if 'soil_moisture' in data_needs:
                property_tasks['tasks'].append({
                    'type': 'soil_sampling',
                    'method': 'tdr_probe',
                    'sample_count': 5,
                    'estimated_time_hours': 1
                })

            tasks.append(property_tasks)

        return tasks

    def _get_required_bands(self, data_needs: List[str]) -> List[str]:
        """Determine satellite bands needed"""
        bands = ['red', 'green', 'blue', 'nir']  # Always need these

        if 'fuel_moisture' in data_needs:
            bands.extend(['swir1', 'swir2'])
        if 'ndvi' in data_needs:
            pass  # Already have red and nir

        return list(set(bands))

    def _fusion_strategy(self, assessment_type: str) -> Dict:
        """Define data fusion approach"""
        strategies = {
            'wildfire_risk': {
                'primary_framework': 'weighted_overlay',
                'temporal_fusion': 'multi_temporal_composite',
                'spatial_resolution': 'upsample_to_drone',
                'model_type': 'ensemble_ml',
                'validation': 'ground_truth_sampling'
            },
            'hail_damage': {
                'primary_framework': 'change_detection',
                'temporal_fusion': 'before_after_comparison',
                'spatial_resolution': 'native_drone',
                'model_type': 'object_detection',
                'validation': 'field_verification'
            }
        }
        return strategies.get(assessment_type, strategies['wildfire_risk'])

    def _estimate_collection_cost(self, plan: Dict) -> Dict:
        """Estimate data collection costs"""
        satellite_cost = 500  # Per scene, roughly

        drone_cost = sum(
            sum(fp['estimated_duration_min'] * 5  # $5/minute flight time
                for fp in mission['flight_plans'])
            for mission in plan['drone_missions']
        )

        ground_cost = sum(
            sum(task.get('estimated_time_hours', 0) * 75  # $75/hour field work
                for task in prop['tasks'])
            for prop in plan['ground_verification']
        )

        return {
            'satellite_data': satellite_cost,
            'drone_operations': drone_cost,
            'ground_verification': ground_cost,
            'total': satellite_cost + drone_cost + ground_cost,
            'per_property': (satellite_cost + drone_cost + ground_cost) / max(plan['properties'], 1)
        }
```

## Reinsurance Risk Modeling

```python
import numpy as np
from typing import Dict, List, Optional
from dataclasses import dataclass

@dataclass
class PropertyRisk:
    property_id: str
    location: Tuple[float, float]
    tiv: float                    # Total Insured Value
    risk_score: float
    peril_exposures: Dict[str, float]


class CatastropheRiskModel:
    """
    Catastrophe risk modeling for reinsurance applications.
    Integrates drone-collected data into probabilistic models.
    """

    def __init__(self):
        # Return period probabilities (annual exceedance probability)
        self.return_periods = [10, 25, 50, 100, 250, 500]

    def build_portfolio_model(self, properties: List[PropertyRisk],
                              peril: str = 'wildfire') -> Dict:
        """
        Build catastrophe model for property portfolio.

        Args:
            properties: List of properties with risk data
            peril: Peril type (wildfire, hail, flood, etc.)

        Returns:
            Portfolio risk metrics and loss distribution
        """
        # Aggregate TIV
        total_tiv = sum(p.tiv for p in properties)

        # Calculate loss distribution
        losses_by_return_period = {}
        for rp in self.return_periods:
            loss = self._calculate_loss_at_return_period(properties, peril, rp)
            losses_by_return_period[rp] = loss

        # Calculate key metrics
        aal = self._calculate_aal(losses_by_return_period)  # Average Annual Loss
        pml_250 = losses_by_return_period.get(250, 0)        # Probable Maximum Loss
        tce_250 = self._calculate_tce(losses_by_return_period, 250)  # Tail Conditional Expectation

        return {
            'portfolio_summary': {
                'property_count': len(properties),
                'total_tiv': total_tiv,
                'peril': peril
            },
            'loss_metrics': {
                'aal': aal,
                'aal_rate': aal / total_tiv if total_tiv > 0 else 0,
                'pml_250': pml_250,
                'pml_250_rate': pml_250 / total_tiv if total_tiv > 0 else 0,
                'tce_250': tce_250
            },
            'exceedance_curve': losses_by_return_period,
            'concentration_risk': self._assess_concentration(properties),
            'risk_drivers': self._identify_risk_drivers(properties, peril)
        }

    def _calculate_loss_at_return_period(self, properties: List[PropertyRisk],
                                         peril: str, return_period: int) -> float:
        """Calculate aggregate loss at given return period"""
        aep = 1 / return_period  # Annual Exceedance Probability

        # Event intensity factor (increases with return period)
        intensity_factor = np.log(return_period) / np.log(100)

        total_loss = 0
        for prop in properties:
            exposure = prop.peril_exposures.get(peril, 0.5)
            vulnerability = prop.risk_score * intensity_factor

            # Loss = TIV * damage ratio
            damage_ratio = min(exposure * vulnerability, 1.0)
            loss = prop.tiv * damage_ratio

            # Apply spatial correlation (nearby properties affected together)
            # Simplified - real model would use event footprints
            total_loss += loss

        return total_loss

    def _calculate_aal(self, loss_curve: Dict[int, float]) -> float:
        """Calculate Average Annual Loss from exceedance curve"""
        sorted_rps = sorted(loss_curve.keys())

        aal = 0
        for i in range(len(sorted_rps) - 1):
            rp1 = sorted_rps[i]
            rp2 = sorted_rps[i + 1]

            aep1 = 1 / rp1
            aep2 = 1 / rp2

            loss1 = loss_curve[rp1]
            loss2 = loss_curve[rp2]

            # Trapezoid rule integration
            aal += (aep1 - aep2) * (loss1 + loss2) / 2

        return aal

    def _calculate_tce(self, loss_curve: Dict[int, float],
                       threshold_rp: int) -> float:
        """Calculate Tail Conditional Expectation (expected loss given exceedance)"""
        threshold_loss = loss_curve.get(threshold_rp, 0)
        higher_losses = [loss for rp, loss in loss_curve.items()
                        if rp >= threshold_rp]
        return np.mean(higher_losses) if higher_losses else threshold_loss

    def _assess_concentration(self, properties: List[PropertyRisk]) -> Dict:
        """Assess geographic concentration risk"""
        locations = np.array([p.location for p in properties])

        if len(locations) < 2:
            return {'risk_level': 'low', 'note': 'Single property'}

        # Calculate centroid
        centroid = np.mean(locations, axis=0)

        # Calculate distances from centroid (rough km)
        distances = np.sqrt(
            ((locations[:, 0] - centroid[0]) * 111) ** 2 +
            ((locations[:, 1] - centroid[1]) * 111 * np.cos(np.radians(centroid[0]))) ** 2
        )

        avg_distance = np.mean(distances)
        max_distance = np.max(distances)

        if avg_distance < 10:  # Within 10km average
            risk_level = 'high'
        elif avg_distance < 50:
            risk_level = 'medium'
        else:
            risk_level = 'low'

        return {
            'risk_level': risk_level,
            'avg_distance_km': avg_distance,
            'max_distance_km': max_distance,
            'centroid': tuple(centroid)
        }

    def _identify_risk_drivers(self, properties: List[PropertyRisk],
                               peril: str) -> List[Dict]:
        """Identify main risk drivers in portfolio"""
        drivers = []

        # Sort by contribution to risk
        sorted_props = sorted(
            properties,
            key=lambda p: p.tiv * p.risk_score * p.peril_exposures.get(peril, 0.5),
            reverse=True
        )

        # Top 10 risk contributors
        for prop in sorted_props[:10]:
            contribution = prop.tiv * prop.risk_score * prop.peril_exposures.get(peril, 0.5)
            drivers.append({
                'property_id': prop.property_id,
                'tiv': prop.tiv,
                'risk_score': prop.risk_score,
                'peril_exposure': prop.peril_exposures.get(peril, 0.5),
                'risk_contribution': contribution
            })

        return drivers

    def generate_reinsurance_report(self, portfolio_model: Dict) -> Dict:
        """Generate report for reinsurance placement"""
        metrics = portfolio_model['loss_metrics']

        # Suggested reinsurance structure
        suggested_retention = metrics['pml_250'] * 0.1  # 10% of PML as retention
        suggested_limit = metrics['pml_250'] * 0.9      # Cover 90% of PML

        return {
            'summary': portfolio_model['portfolio_summary'],
            'key_metrics': {
                'aal': metrics['aal'],
                'aal_rate_pct': metrics['aal_rate'] * 100,
                'pml_250': metrics['pml_250'],
                'pml_250_rate_pct': metrics['pml_250_rate'] * 100
            },
            'suggested_structure': {
                'retention': suggested_retention,
                'limit': suggested_limit,
                'attachment_point': suggested_retention,
                'exhaustion_point': suggested_retention + suggested_limit,
                'structure_type': 'excess_of_loss'
            },
            'pricing_indication': {
                'technical_rate': metrics['aal_rate'] * 1.25,  # Load factor
                'risk_load': 0.15,  # 15% risk load
                'cat_load': 0.10    # 10% cat load
            },
            'concentration_warning': portfolio_model['concentration_risk'],
            'top_risk_drivers': portfolio_model['risk_drivers'][:5]
        }
```
