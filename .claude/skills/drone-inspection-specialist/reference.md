        saved_count = 0
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            
            if frame_count % frame_skip == 0:
                # Save frame
                cv2.imwrite(f"{output_dir}/frame_{saved_count:06d}.jpg", 
                           frame, [cv2.IMWRITE_JPEG_QUALITY, 95])
                
                # Extract GPS from video metadata (if available)
                # Otherwise use separate SRT file
                gps = self.get_frame_gps(video_path, frame_count)
                
                # Save metadata
                metadata = {
                    'frame_id': saved_count,
                    'original_frame': frame_count,
                    'timestamp': frame_count / fps,
                    'gps': gps
                }
                with open(f"{output_dir}/frame_{saved_count:06d}.json", 'w') as f:
                    json.dump(metadata, f)
                
                saved_count += 1
            
            frame_count += 1
        
        cap.release()
        print(f"Extracted {saved_count} frames from {frame_count} total")
    
    def run_colmap_sfm(self, images_dir, output_dir):
        """Structure from Motion with COLMAP"""
        
        os.makedirs(output_dir, exist_ok=True)
        database_path = f"{output_dir}/database.db"
        
        # Feature extraction
        subprocess.run([
            self.colmap_path, "feature_extractor",
            "--database_path", database_path,
            "--image_path", images_dir,
            "--ImageReader.single_camera", "1",
            "--ImageReader.camera_model", "OPENCV",
            "--SiftExtraction.use_gpu", "1"
        ])
        
        # Feature matching
        subprocess.run([
            self.colmap_path, "exhaustive_matcher",
            "--database_path", database_path,
            "--SiftMatching.use_gpu", "1"
        ])
        
        # Sparse reconstruction
        sparse_path = f"{output_dir}/0"
        subprocess.run([
            self.colmap_path, "mapper",
            "--database_path", database_path,
            "--image_path", images_dir,
            "--output_path", output_dir
        ])
        
        # Convert to Gaussian Splatting format
        subprocess.run([
            self.colmap_path, "model_converter",
            "--input_path", sparse_path,
            "--output_path", sparse_path,
            "--output_type", "TXT"
        ])
        
        return sparse_path
    
    def train_gaussian_splatting(self, images_dir, sparse_dir, output_dir):
        """Train 3D Gaussian Splatting model"""
        
        # Training command
        cmd = [
            "python", self.gs_train_path,
            "-s", images_dir,
            "-m", output_dir,
            "--iterations", "30000",
            "--eval"  # Hold out test set
        ]
        
        subprocess.run(cmd)
        
        return output_dir
    
    def export_for_viewer(self, model_dir, viewer_dir):
        """Export model for web-based viewer"""
        
        os.makedirs(viewer_dir, exist_ok=True)
        
        # Convert to compressed format for web
        # Use antimatter15's WebGL viewer format
        subprocess.run([
            "python", "convert_to_web.py",
            "--model", model_dir,
            "--output", viewer_dir,
            "--compress"
        ])
```

### Interactive Inspection in 3D

```python
class GaussianSplatInspectionTool:
    """Interactive tool for inspecting 3D reconstructions"""
    
    def __init__(self, model_path):
        self.model = self.load_model(model_path)
        self.annotations = []
        
    def annotate_damage_in_3d(self, point_3d, damage_type):
        """Mark damage location in 3D space"""
        
        annotation = {
            'position': point_3d,
            'type': damage_type,
            'timestamp': time.time(),
            'nearby_views': self.find_nearby_views(point_3d)
        }
        
        self.annotations.append(annotation)
        return annotation
    
    def find_nearby_views(self, point_3d, radius=2.0):
        """Find all camera views near a point"""
        
        nearby = []
        for cam_idx, camera in enumerate(self.model.cameras):
            dist = np.linalg.norm(camera.position - point_3d)
            if dist < radius:
                nearby.append({
                    'camera_idx': cam_idx,
                    'distance': dist,
                    'viewing_angle': self.compute_viewing_angle(
                        camera, point_3d
                    )
                })
        
        return nearby
    
    def generate_damage_report(self):
        """Generate report with 3D visualization"""
        
        report = {
            'total_damages': len(self.annotations),
            'damage_breakdown': self.count_by_type(),
            'model_path': self.model.path,
            'viewer_url': self.generate_viewer_url(),
            'annotations': self.annotations
        }
        
        return report
```

## Residential Property Assessment

### Comprehensive Property Analysis

```python
class PropertyAssessmentSystem:
    def __init__(self):
        self.roof_inspector = RoofInspector()
        self.thermal_analyzer = ThermalRoofAnalysis()
        self.object_detector = YOLO('property_objects.pt')
        # Detects: gutters, chimneys, vents, solar panels, trees, etc.
        
    def full_property_assessment(self, drone_mission_data):
        """Complete property analysis"""
        
        assessment = {
            'roof': self.assess_roof(drone_mission_data['roof_images']),
            'exterior': self.assess_exterior(drone_mission_data['exterior_images']),
            'landscaping': self.assess_landscaping(drone_mission_data['overhead_images']),
            'thermal': self.assess_thermal(drone_mission_data['thermal_images']),
            'measurements': self.take_measurements(drone_mission_data['3d_model']),
            'recommendations': []
        }
        
        # Generate recommendations
        assessment['recommendations'] = self.generate_recommendations(assessment)
        
        return assessment
    
    def assess_landscaping(self, images):
        """Analyze trees and vegetation"""
        
        tree_detector = YOLO('tree_detection.pt')
        issues = []
        
        for img in images:
            detections = tree_detector(img)
            
            for tree in detections:
                # Check proximity to structure
                distance_to_building = self.calculate_distance(
                    tree.bbox, 
                    self.find_building_in_image(img)
                )
                
                # Trees within 20ft are risk
                if distance_to_building < 20:  # feet
                    issues.append({
                        'type': 'TREE_TOO_CLOSE',
                        'severity': 'MEDIUM',
                        'location': tree.bbox,
                        'distance': distance_to_building,
                        'recommendation': 'Trim or remove to prevent damage'
                    })
                
                # Check for dead branches (brown in green season)
                if self.detect_dead_branches(img, tree.bbox):
                    issues.append({
                        'type': 'DEAD_BRANCHES',
                        'severity': 'HIGH',
                        'location': tree.bbox,
                        'recommendation': 'Remove dead branches immediately'
                    })
        
        return issues
```

## Best Practices

### Mission Planning
- **Overlap**: 80% front, 60% side for 3D reconstruction
- **Altitude**: 30-50m for roof inspection, 100m+ for fire monitoring
- **Speed**: 3-5 m/s for sharp images
- **Lighting**: Early morning or late afternoon for best shadows
- **Weather**: Avoid wind >15mph, no rain

### Data Quality
- **Resolution**: Minimum 2cm/pixel for damage detection
- **Frame Rate**: 30fps for video, 2 images/sec for stills
- **Gimbal**: -90° (nadir) for orthomosaic, -60° for oblique
- **ISO**: Keep low (100-400) to minimize noise
- **Shutter Speed**: 1/1000s minimum for sharp images

### Safety & Regulations
- **FAA Part 107**: Commercial drone license required (US)
- **VLOS**: Maintain visual line of sight
- **Altitude Limits**: 400ft AGL maximum
- **No-Fly Zones**: Check airspace before missions
- **Insurance**: Liability coverage for commercial work

---

**Remember**: The best inspection system combines multiple sensors (RGB, thermal, LiDAR) with smart AI and human expertise. Always validate AI detections before reporting critical findings.
