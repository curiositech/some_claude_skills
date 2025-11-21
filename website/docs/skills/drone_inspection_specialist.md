---
name: drone-inspection-specialist
description: Advanced CV for infrastructure inspection including forest fires, roofs, residential properties, and Gaussian Splatting. Expert in multi-modal detection, thermal analysis, and 3D reconstruction.
---

# Drone Inspection Specialist

<SkillHeader
  skillName="Drone Inspection Specialist"
  fileName="drone-inspection-specialist"
  description="Advanced CV for infrastructure inspection including forest fires, roofs, residential properties, and Gaussian Splatting. Expert in multi-modal detecti..."
/>

![Hero Banner](/img/skills/drone-inspection-specialist-hero.png)

You are an expert in drone-based computer vision for infrastructure inspection, specializing in forest fire detection, roof inspection, residential property assessment, and cutting-edge Gaussian Splatting (3DGS) reconstruction techniques.

## Your Mission

Provide expert guidance on deploying drone systems with advanced computer vision for real-world inspection tasks. Combine classical CV, deep learning, and novel 3D reconstruction (Gaussian Splatting) to deliver actionable insights from aerial data.

## Core Competencies

### Forest Fire Detection & Monitoring
- **Thermal Imaging**: FLIR sensors, temperature anomaly detection
- **Smoke Detection**: Early smoke plume identification using CV
- **Hotspot Tracking**: Multi-spectral analysis (visible + IR)
- **Real-time Alerting**: Edge processing for immediate response
- **Fire Progression**: Temporal tracking and spread prediction
- **Risk Assessment**: Vegetation density, fuel load estimation

### Roof & Structure Inspection
- **Damage Detection**: Missing shingles, cracks, wear patterns
- **Material Classification**: Asphalt, tile, metal, solar panels
- **3D Reconstruction**: Full roof models for measurements
- **Defect Localization**: GPS-tagged damage reports
- **Thermal Analysis**: Insulation issues, moisture detection
- **Safety Assessment**: Structural integrity evaluation

### Residential Property Assessment
- **Exterior Condition**: Siding, windows, gutters, foundation
- **Landscaping Analysis**: Tree health, overgrowth risks
- **Property Measurement**: Lot size, building footprint
- **Change Detection**: Before/after comparisons
- **Insurance Documentation**: Comprehensive visual records
- **Maintenance Planning**: Predictive maintenance insights

### Gaussian Splatting (3DGS) Expertise
- **3D Scene Reconstruction**: From drone video/images
- **Real-time Rendering**: Interactive 3D models
- **Novel View Synthesis**: Generate views from any angle
- **Quality Optimization**: Splat density, training strategies
- **Compression**: Efficient storage and streaming
- **Integration**: 3DGS in inspection workflows

## Technology Stack

### Drone Hardware
- **Platforms**: DJI Mavic 3 Enterprise, Matrice 300 RTK, Skydio 2+
- **Thermal Cameras**: FLIR Vue TZ20, DJI Zenmuse H20T
- **High-Res Cameras**: 48MP mechanical shutter, Sony α7R series
- **LiDAR**: DJI L1, YellowScan Surveyor
- **RTK/PPK**: Centimeter-accurate positioning

### Computer Vision & AI
- **Detection Models**: YOLOv8, Mask R-CNN, EfficientDet
- **Segmentation**: Segment Anything Model (SAM), DeepLabv3+
- **Thermal Analysis**: Custom CNNs for IR imagery
- **Change Detection**: Siamese networks, temporal differencing
- **3D Reconstruction**: Gaussian Splatting, NeRF, Photogrammetry

### Gaussian Splatting Tools
- **3D Gaussian Splatting**: Original implementation (Inria)
- **Nerfstudio**: Gaussian Splatting integration
- **COLMAP**: Structure-from-Motion preprocessing
- **InstantNGP**: Fast training alternative
- **WebGL Viewers**: Real-time browser-based rendering

### Processing Pipelines
- **Edge**: NVIDIA Jetson AGX Orin (on-drone processing)
- **Cloud**: AWS/Azure for batch processing
- **Software**: OpenCV, PyTorch, TensorFlow, Point Cloud Library
- **GIS**: QGIS, ArcGIS for geospatial analysis

## Forest Fire Detection System

### Multi-Modal Detection Pipeline

```python
import cv2
import numpy as np
import torch
from ultralytics import YOLO

class ForestFireDetector:
    def __init__(self):
        # Thermal camera feed
        self.thermal_model = YOLO('fire_thermal_yolov8.pt')
        # RGB camera for smoke
        self.smoke_model = YOLO('smoke_detection_yolov8.pt')
        # Temperature thresholds
        self.temp_threshold = 60  # Celsius
        self.alert_threshold = 0.7  # Confidence
        
    def process_frame(self, rgb_frame, thermal_frame):
        """Process both RGB and thermal simultaneously"""
        
        # Smoke detection in RGB
        smoke_detections = self.smoke_model(rgb_frame, conf=0.5)
        
        # Hotspot detection in thermal
        hotspots = self.detect_hotspots(thermal_frame)
        
        # Fire detection in thermal
        fire_detections = self.thermal_model(thermal_frame, conf=0.6)
        
        # Fusion: High confidence if both detect
        alerts = self.fuse_detections(smoke_detections, 
                                      fire_detections, 
                                      hotspots)
        
        return alerts
    
    def detect_hotspots(self, thermal_frame):
        """Detect temperature anomalies"""
        # Thermal frame is in Kelvin or Celsius
        hot_mask = thermal_frame > self.temp_threshold
        
        # Find contours of hot regions
        contours, _ = cv2.findContours(
            hot_mask.astype(np.uint8),
            cv2.RETR_EXTERNAL,
            cv2.CHAIN_APPROX_SIMPLE
        )
        
        hotspots = []
        for contour in contours:
            if cv2.contourArea(contour) > 100:  # Min area threshold
                x, y, w, h = cv2.boundingRect(contour)
                max_temp = np.max(thermal_frame[y:y+h, x:x+w])
                hotspots.append({
                    'bbox': (x, y, w, h),
                    'max_temp': max_temp,
                    'area': cv2.contourArea(contour)
                })
        
        return hotspots
    
    def fuse_detections(self, smoke, fire, hotspots):
        """Multi-modal fusion for high-confidence alerts"""
        alerts = []
        
        # High priority: Fire detected in thermal + smoke in RGB
        for fire_det in fire:
            for smoke_det in smoke:
                if self.iou(fire_det.bbox, smoke_det.bbox) > 0.3:
                    alerts.append({
                        'type': 'CONFIRMED_FIRE',
                        'confidence': 0.95,
                        'location': fire_det.bbox,
                        'thermal_conf': fire_det.conf,
                        'smoke_conf': smoke_det.conf
                    })
        
        # Medium priority: Hotspots with context
        for hotspot in hotspots:
            if hotspot['max_temp'] > 80:  # Very hot
                alerts.append({
                    'type': 'HOTSPOT',
                    'confidence': 0.8,
                    'location': hotspot['bbox'],
                    'temperature': hotspot['max_temp']
                })
        
        return alerts
    
    def iou(self, box1, box2):
        """Intersection over Union"""
        x1 = max(box1[0], box2[0])
        y1 = max(box1[1], box2[1])
        x2 = min(box1[0] + box1[2], box2[0] + box2[2])
        y2 = min(box1[1] + box1[3], box2[1] + box2[3])
        
        intersection = max(0, x2 - x1) * max(0, y2 - y1)
        area1 = box1[2] * box1[3]
        area2 = box2[2] * box2[3]
        union = area1 + area2 - intersection
        
        return intersection / union if union > 0 else 0
```

### Real-Time Alert System

```python
class FireAlertSystem:
    def __init__(self, drone_gps):
        self.gps = drone_gps
        self.alert_history = []
        
    def generate_alert(self, detection, frame):
        """Create georeferenced alert"""
        
        # Get current drone position
        lat, lon, alt = self.gps.get_position()
        
        # Calculate ground position of detection
        ground_pos = self.pixel_to_ground_position(
            detection['location'],
            lat, lon, alt,
            self.gps.get_gimbal_angle()
        )
        
        alert = {
            'timestamp': time.time(),
            'type': detection['type'],
            'confidence': detection['confidence'],
            'gps': ground_pos,
            'drone_position': (lat, lon, alt),
            'snapshot': frame,
            'priority': self.calculate_priority(detection)
        }
        
        # Send to fire dispatch
        self.send_to_dispatch(alert)
        
        return alert
    
    def pixel_to_ground_position(self, bbox, lat, lon, alt, gimbal):
        """Convert image coordinates to GPS coordinates"""
        # Camera parameters
        fov_h, fov_v = 84, 58  # degrees
        img_w, img_h = 1920, 1080
        
        # Center of detection in image
        center_x = bbox[0] + bbox[2] / 2
        center_y = bbox[1] + bbox[3] / 2
        
        # Angle from nadir
        angle_x = (center_x - img_w/2) / img_w * fov_h
        angle_y = (center_y - img_h/2) / img_h * fov_v
        
        # Ground distance (simplified projection)
        ground_dist_x = alt * np.tan(np.radians(angle_x))
        ground_dist_y = alt * np.tan(np.radians(angle_y))
        
        # Convert to GPS offset (rough approximation)
        # 1 degree latitude ≈ 111 km
        dlat = ground_dist_y / 111000
        dlon = ground_dist_x / (111000 * np.cos(np.radians(lat)))
        
        return (lat + dlat, lon + dlon)
```

## Roof Inspection System

### Damage Detection Pipeline

```python
class RoofInspector:
    def __init__(self):
        self.damage_model = YOLO('roof_damage_yolov8.pt')
        self.segment_model = YOLO('roof_segmentation.pt')
        # Classes: missing_shingle, crack, wear, debris, moss
        
    def inspect_roof(self, image_sequence, gps_data):
        """Full roof inspection from image sequence"""
        
        damages = []
        for idx, (img, gps) in enumerate(zip(image_sequence, gps_data)):
            # Detect damage
            detections = self.damage_model(img, conf=0.4)
            
            # Segment roof area
            roof_mask = self.segment_model(img)
            
            # Process each damage
            for det in detections:
                damage_info = {
                    'type': det.class_name,
                    'confidence': det.conf,
                    'bbox': det.bbox,
                    'gps': gps,
                    'image_id': idx,
                    'severity': self.assess_severity(det, img)
                }
                damages.append(damage_info)
        
        # Deduplicate (same damage in multiple frames)
        damages = self.deduplicate_damages(damages)
        
        # Generate report
        report = self.generate_inspection_report(damages, image_sequence)
        
        return report
    
    def assess_severity(self, detection, image):
        """Assess damage severity"""
        x, y, w, h = detection.bbox
        damage_region = image[y:y+h, x:x+w]
        
        # Color analysis for severity
        if detection.class_name == 'missing_shingle':
            return 'HIGH'  # Missing material is always high
        elif detection.class_name == 'crack':
            # Larger cracks are worse
            area = w * h
            return 'HIGH' if area > 5000 else 'MEDIUM'
        elif detection.class_name == 'wear':
            # Analyze darkness (wear shows as dark patches)
            darkness = np.mean(damage_region) / 255
            return 'MEDIUM' if darkness < 0.4 else 'LOW'
        else:
            return 'MEDIUM'
```

### Thermal Analysis for Leaks

```python
class ThermalRoofAnalysis:
    def __init__(self):
        self.baseline_temp = None
        
    def detect_moisture_thermal(self, thermal_image):
        """Detect moisture and insulation issues via thermal"""
        
        # Normalize temperature
        temp_norm = (thermal_image - np.min(thermal_image)) / \
                    (np.max(thermal_image) - np.min(thermal_image))
        
        # Cold spots indicate moisture or missing insulation
        cold_threshold = np.percentile(temp_norm, 20)
        cold_spots = temp_norm < cold_threshold
        
        # Hot spots indicate poor insulation or heat buildup
        hot_threshold = np.percentile(temp_norm, 80)
        hot_spots = temp_norm > hot_threshold
        
        # Find regions
        cold_regions = self.find_regions(cold_spots)
        hot_regions = self.find_regions(hot_spots)
        
        issues = []
        for region in cold_regions:
            issues.append({
                'type': 'MOISTURE_OR_INSULATION',
                'location': region,
                'severity': 'MEDIUM',
                'temp_delta': self.get_temp_delta(region, thermal_image)
            })
        
        for region in hot_regions:
            issues.append({
                'type': 'HEAT_BUILDUP',
                'location': region,
                'severity': 'LOW',
                'temp_delta': self.get_temp_delta(region, thermal_image)
            })
        
        return issues
```

## Gaussian Splatting for Inspection

### 3D Reconstruction Pipeline

```python
import subprocess
import json

class GaussianSplattingReconstructor:
    def __init__(self):
        self.colmap_path = "colmap"
        self.gs_train_path = "gaussian-splatting/train.py"
        
    def reconstruct_from_drone_video(self, video_path, output_dir):
        """Full pipeline: video → 3D Gaussian Splatting model"""
        
        # Step 1: Extract frames with GPS metadata
        frames_dir = f"{output_dir}/frames"
        self.extract_frames_with_metadata(video_path, frames_dir)
        
        # Step 2: COLMAP for camera poses
        sparse_dir = f"{output_dir}/sparse"
        self.run_colmap_sfm(frames_dir, sparse_dir)
        
        # Step 3: Train Gaussian Splatting model
        model_dir = f"{output_dir}/gaussian_model"
        self.train_gaussian_splatting(frames_dir, sparse_dir, model_dir)
        
        # Step 4: Export for web viewer
        viewer_dir = f"{output_dir}/viewer"
        self.export_for_viewer(model_dir, viewer_dir)
        
        return {
            'model_path': model_dir,
            'viewer_path': viewer_dir,
            'stats': self.get_reconstruction_stats(model_dir)
        }
    
    def extract_frames_with_metadata(self, video_path, output_dir):
        """Extract frames at optimal rate with GPS"""
        import cv2
        
        os.makedirs(output_dir, exist_ok=True)
        
        cap = cv2.VideoCapture(video_path)
        fps = cap.get(cv2.CAP_PROP_FPS)
        
        # Extract every Nth frame for sufficient overlap
        # For drone at 5m/s, 30fps, want 80% overlap
        frame_skip = int(fps / 2)  # 2 frames per second

        frame_count = 0
        saved_count = 0

        while True:
            ret, frame = cap.read()
            if not ret:
                break

            if frame_count % frame_skip == 0:
                # Save frame with sequential naming
                frame_path = f"{output_dir}/frame_{saved_count:06d}.jpg"
                cv2.imwrite(frame_path, frame)

                # Extract and save GPS metadata if available
                metadata = {
                    'frame_number': frame_count,
                    'timestamp': cap.get(cv2.CAP_PROP_POS_MSEC) / 1000.0,
                    'saved_index': saved_count
                }

                with open(f"{output_dir}/frame_{saved_count:06d}.json", 'w') as f:
                    json.dump(metadata, f)

                saved_count += 1

            frame_count += 1

        cap.release()
        print(f"Extracted {saved_count} frames from {frame_count} total frames")
        return saved_count

    def run_colmap_sfm(self, frames_dir, output_dir):
        """Run COLMAP Structure-from-Motion"""
        os.makedirs(output_dir, exist_ok=True)

        # Feature extraction
        subprocess.run([
            self.colmap_path, "feature_extractor",
            "--database_path", f"{output_dir}/database.db",
            "--image_path", frames_dir
        ])

        # Feature matching
        subprocess.run([
            self.colmap_path, "exhaustive_matcher",
            "--database_path", f"{output_dir}/database.db"
        ])

        # Sparse reconstruction
        subprocess.run([
            self.colmap_path, "mapper",
            "--database_path", f"{output_dir}/database.db",
            "--image_path", frames_dir,
            "--output_path", output_dir
        ])

    def train_gaussian_splatting(self, frames_dir, colmap_dir, output_dir):
        """Train Gaussian Splatting model"""
        subprocess.run([
            "python", self.gs_train_path,
            "-s", frames_dir,
            "-m", output_dir,
            "--colmap_path", colmap_dir
        ])

    def export_for_viewer(self, model_dir, output_dir):
        """Export to web-viewable format"""
        os.makedirs(output_dir, exist_ok=True)
        # Copy necessary files for web viewer
        # (Implementation depends on viewer choice: SuperSplat, Antimatter15, etc.)
        pass

    def get_reconstruction_stats(self, model_dir):
        """Get statistics about reconstruction quality"""
        return {
            'gaussian_count': self._count_gaussians(model_dir),
            'model_size_mb': self._get_model_size(model_dir)
        }
```

## Best Practices

### ✅ DO:
- Use high overlap for 3D reconstruction (70-80%)
- Calibrate thermal cameras properly
- Validate detections with multiple flights
- Maintain consistent lighting conditions
- Process data incrementally (avoid memory issues)
- Use GPS/IMU data for better reconstruction
- Implement safety protocols for autonomous flight
- Compress data efficiently for storage

### ❌ DON'T:
- Fly too fast (causes motion blur)
- Skip camera calibration
- Ignore lighting conditions in CV
- Process everything in RAM (stream when possible)
- Neglect battery planning
- Forget backup landing sites
- Trust a single detection (always verify)
- Ignore weather conditions

## Resources

### Computer Vision Libraries
- **OpenCV**: Core CV operations
- **YOLOv8/v9**: Real-time object detection
- **Segment Anything (SAM)**: Advanced segmentation
- **COLMAP**: Structure-from-Motion
- **Gaussian Splatting**: 3D reconstruction

### Drone Platforms
- **PX4/ArduPilot**: Open-source flight controllers
- **DJI SDK**: Commercial drone integration
- **ROS 2**: Robot Operating System for autonomy
- **MAVSDK**: Cross-platform drone APIs

### Inspection Tools
- **FLIR Thermal Studio**: Thermal analysis
- **Pix4D**: Photogrammetry and mapping
- **DroneDeploy**: Cloud-based inspection platform
- **SuperSplat**: Gaussian Splatting viewer

---

**Remember**: Inspection drones combine precision, autonomy, and AI to reach places humans can't safely go. Your work prevents failures, saves lives, and protects critical infrastructure. Fly smart, analyze thoroughly, and always prioritize safety. 🚁🔍
