# Gaussian Splatting 3D Reconstruction Reference

## Pipeline Overview

```python
import subprocess
import os
import json
import numpy as np
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from pathlib import Path

@dataclass
class ReconstructionQuality:
    psnr: float           # Peak Signal-to-Noise Ratio
    ssim: float           # Structural Similarity
    lpips: float          # Learned Perceptual Image Patch Similarity
    num_gaussians: int
    training_time_min: float


class GaussianSplattingReconstructor:
    """
    3D Gaussian Splatting pipeline for inspection applications.
    Creates photorealistic 3D models from drone imagery.
    """
    def __init__(self, colmap_path: str = "colmap",
                 gs_path: str = "gaussian-splatting"):
        self.colmap_path = colmap_path
        self.gs_train_script = os.path.join(gs_path, "train.py")
        self.gs_render_script = os.path.join(gs_path, "render.py")

    def reconstruct_from_drone_video(self, video_path: str,
                                      output_dir: str,
                                      config: Optional[Dict] = None) -> Dict:
        """
        Full reconstruction pipeline from drone video.

        Args:
            video_path: Path to drone video file
            output_dir: Output directory for all artifacts
            config: Optional configuration overrides

        Returns:
            Reconstruction results with paths and quality metrics
        """
        config = config or self._default_config()

        # Create directory structure
        paths = self._setup_directories(output_dir)

        # Step 1: Extract frames
        print("Extracting frames...")
        frame_count = self._extract_frames(video_path, paths['frames'], config)

        # Step 2: Run COLMAP Structure-from-Motion
        print("Running COLMAP SfM...")
        sfm_result = self._run_colmap_sfm(paths['frames'], paths['colmap'])

        if not sfm_result['success']:
            return {'success': False, 'error': sfm_result['error']}

        # Step 3: Train Gaussian Splatting
        print("Training Gaussian Splatting model...")
        gs_result = self._train_gaussian_splatting(
            paths['colmap'], paths['model'], config
        )

        # Step 4: Export for viewers
        print("Exporting for web viewer...")
        self._export_web_viewer(paths['model'], paths['viewer'])

        # Step 5: Calculate quality metrics
        quality = self._evaluate_quality(paths['model'], paths['frames'])

        return {
            'success': True,
            'paths': paths,
            'frame_count': frame_count,
            'sfm_stats': sfm_result,
            'training_stats': gs_result,
            'quality_metrics': quality,
            'viewer_url': f"file://{paths['viewer']}/index.html"
        }

    def _default_config(self) -> Dict:
        """Default configuration for inspection-quality reconstruction"""
        return {
            'frame_extraction': {
                'fps': 2,                    # Extract 2 frames per second
                'min_frames': 50,            # Minimum frames needed
                'max_frames': 500,           # Maximum to process
                'quality': 95                # JPEG quality
            },
            'colmap': {
                'camera_model': 'OPENCV',
                'single_camera': True,       # Drone typically has one camera
                'exhaustive_matching': False, # Sequential matching faster
                'gpu_index': '0'
            },
            'gaussian_splatting': {
                'iterations': 30000,
                'densify_until_iter': 15000,
                'densification_interval': 100,
                'opacity_reset_interval': 3000,
                'position_lr_max_steps': 30000,
                'sh_degree': 3               # Spherical harmonics degree
            },
            'output': {
                'render_resolution': 1920,
                'export_ply': True,
                'export_web': True
            }
        }

    def _setup_directories(self, output_dir: str) -> Dict[str, str]:
        """Create output directory structure"""
        paths = {
            'root': output_dir,
            'frames': os.path.join(output_dir, 'frames'),
            'colmap': os.path.join(output_dir, 'colmap'),
            'model': os.path.join(output_dir, 'gaussian_model'),
            'viewer': os.path.join(output_dir, 'web_viewer'),
            'renders': os.path.join(output_dir, 'renders')
        }

        for path in paths.values():
            os.makedirs(path, exist_ok=True)

        return paths

    def _extract_frames(self, video_path: str, output_dir: str,
                        config: Dict) -> int:
        """Extract frames from video at specified rate"""
        import cv2

        cap = cv2.VideoCapture(video_path)
        video_fps = cap.get(cv2.CAP_PROP_FPS)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

        extract_fps = config['frame_extraction']['fps']
        frame_interval = int(video_fps / extract_fps)

        extracted = 0
        frame_idx = 0

        while True:
            ret, frame = cap.read()
            if not ret:
                break

            if frame_idx % frame_interval == 0:
                # Save frame
                filename = os.path.join(output_dir, f"frame_{extracted:05d}.jpg")
                cv2.imwrite(filename, frame,
                           [cv2.IMWRITE_JPEG_QUALITY, config['frame_extraction']['quality']])
                extracted += 1

                if extracted >= config['frame_extraction']['max_frames']:
                    break

            frame_idx += 1

        cap.release()
        return extracted

    def _run_colmap_sfm(self, images_dir: str, output_dir: str) -> Dict:
        """Run COLMAP Structure-from-Motion pipeline"""
        database_path = os.path.join(output_dir, "database.db")
        sparse_path = os.path.join(output_dir, "sparse")
        os.makedirs(sparse_path, exist_ok=True)

        try:
            # Feature extraction
            subprocess.run([
                self.colmap_path, "feature_extractor",
                "--database_path", database_path,
                "--image_path", images_dir,
                "--ImageReader.camera_model", "OPENCV",
                "--ImageReader.single_camera", "1",
                "--SiftExtraction.use_gpu", "1"
            ], check=True, capture_output=True)

            # Sequential matching (faster for video sequences)
            subprocess.run([
                self.colmap_path, "sequential_matcher",
                "--database_path", database_path,
                "--SequentialMatching.overlap", "10"
            ], check=True, capture_output=True)

            # Sparse reconstruction
            subprocess.run([
                self.colmap_path, "mapper",
                "--database_path", database_path,
                "--image_path", images_dir,
                "--output_path", sparse_path
            ], check=True, capture_output=True)

            # Find the reconstruction (usually in sparse/0)
            recon_path = os.path.join(sparse_path, "0")
            if os.path.exists(recon_path):
                # Get stats
                images_txt = os.path.join(recon_path, "images.txt")
                points_txt = os.path.join(recon_path, "points3D.txt")

                num_images = self._count_colmap_images(images_txt)
                num_points = self._count_colmap_points(points_txt)

                return {
                    'success': True,
                    'num_registered_images': num_images,
                    'num_points': num_points,
                    'reconstruction_path': recon_path
                }
            else:
                return {'success': False, 'error': 'No reconstruction created'}

        except subprocess.CalledProcessError as e:
            return {'success': False, 'error': str(e)}

    def _train_gaussian_splatting(self, colmap_dir: str, output_dir: str,
                                   config: Dict) -> Dict:
        """Train Gaussian Splatting model"""
        import time

        gs_config = config['gaussian_splatting']
        sparse_path = os.path.join(colmap_dir, "sparse", "0")

        start_time = time.time()

        try:
            cmd = [
                "python", self.gs_train_script,
                "-s", sparse_path,
                "-m", output_dir,
                "--iterations", str(gs_config['iterations']),
                "--densify_until_iter", str(gs_config['densify_until_iter']),
                "--densification_interval", str(gs_config['densification_interval']),
                "--opacity_reset_interval", str(gs_config['opacity_reset_interval']),
                "--position_lr_max_steps", str(gs_config['position_lr_max_steps']),
                "--sh_degree", str(gs_config['sh_degree'])
            ]

            subprocess.run(cmd, check=True, capture_output=True)

            training_time = (time.time() - start_time) / 60

            return {
                'success': True,
                'training_time_min': training_time,
                'iterations': gs_config['iterations'],
                'model_path': output_dir
            }

        except subprocess.CalledProcessError as e:
            return {'success': False, 'error': str(e)}

    def _export_web_viewer(self, model_dir: str, viewer_dir: str):
        """Export model for web-based viewing"""
        # Export PLY file
        ply_path = os.path.join(model_dir, "point_cloud", "iteration_30000", "point_cloud.ply")

        if os.path.exists(ply_path):
            # Copy to viewer directory
            import shutil
            shutil.copy(ply_path, os.path.join(viewer_dir, "model.ply"))

            # Create simple HTML viewer
            html_content = self._generate_viewer_html()
            with open(os.path.join(viewer_dir, "index.html"), 'w') as f:
                f.write(html_content)

    def _generate_viewer_html(self) -> str:
        """Generate HTML for WebGL Gaussian Splatting viewer"""
        return '''
<!DOCTYPE html>
<html>
<head>
    <title&gt;3D Gaussian Splatting Viewer</title>
    <script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.160.0/examples/js/controls/OrbitControls.js"></script>
    <style>
        body { margin: 0; overflow: hidden; }
        canvas { display: block; }
        #info { position: absolute; top: 10px; left: 10px; color: white; font-family: sans-serif; }
    </style>
</head>
<body>
    <div id="info">Use mouse to orbit, scroll to zoom</div>
    <script type="module">
        // Gaussian Splatting WebGL renderer
        // Implementation would load model.ply and render splats
        // This is a placeholder - real implementation uses specialized shaders

        import * as THREE from 'three';
        import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer();

        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        camera.position.z = 5;

        function animate() {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        }
        animate();
    </script>
</body>
</html>
'''

    def _evaluate_quality(self, model_dir: str, images_dir: str) -> Dict:
        """Evaluate reconstruction quality"""
        # In practice, render test views and compare to held-out images
        # This is a simplified version

        ply_path = os.path.join(model_dir, "point_cloud", "iteration_30000", "point_cloud.ply")

        if os.path.exists(ply_path):
            num_gaussians = self._count_gaussians(ply_path)
        else:
            num_gaussians = 0

        return {
            'num_gaussians': num_gaussians,
            'estimated_psnr': 28.0,  # Typical for good reconstruction
            'estimated_ssim': 0.92,
            'note': 'Run render.py with test set for accurate metrics'
        }

    def _count_gaussians(self, ply_path: str) -> int:
        """Count number of Gaussians in PLY file"""
        with open(ply_path, 'rb') as f:
            # Read header to find vertex count
            line = f.readline().decode('ascii')
            while 'element vertex' not in line:
                line = f.readline().decode('ascii')
                if not line:
                    return 0
            return int(line.split()[-1])

    def _count_colmap_images(self, images_txt: str) -> int:
        """Count registered images in COLMAP output"""
        count = 0
        with open(images_txt, 'r') as f:
            for line in f:
                if line.startswith('#'):
                    continue
                if len(line.strip()) > 0:
                    count += 1
        return count // 2  # Each image has 2 lines

    def _count_colmap_points(self, points_txt: str) -> int:
        """Count 3D points in COLMAP output"""
        count = 0
        with open(points_txt, 'r') as f:
            for line in f:
                if not line.startswith('#'):
                    count += 1
        return count
```

## Inspection-Specific 3DGS Applications

```python
import numpy as np
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass

@dataclass
class MeasurementPoint:
    id: str
    position_3d: Tuple[float, float, float]
    confidence: float


class InspectionMeasurement:
    """
    Extract measurements from Gaussian Splatting reconstructions.
    Useful for roof area, damage size, and property dimensions.
    """
    def __init__(self, model_path: str):
        self.gaussians = self._load_gaussians(model_path)
        self.scale_factor = 1.0  # Meters per unit

    def calibrate_scale(self, known_distance: float,
                        point1: Tuple[float, float, float],
                        point2: Tuple[float, float, float]):
        """Calibrate scale using known real-world distance"""
        model_distance = np.linalg.norm(np.array(point1) - np.array(point2))
        self.scale_factor = known_distance / model_distance

    def measure_distance(self, point1: Tuple, point2: Tuple) -> float:
        """Measure distance between two points in meters"""
        model_dist = np.linalg.norm(np.array(point1) - np.array(point2))
        return model_dist * self.scale_factor

    def measure_area(self, polygon_points: List[Tuple]) -> float:
        """Calculate area of polygon in square meters"""
        # Project to 2D (assuming roughly horizontal surface)
        points_2d = np.array([(p[0], p[1]) for p in polygon_points])

        # Shoelace formula
        n = len(points_2d)
        area = 0.0
        for i in range(n):
            j = (i + 1) % n
            area += points_2d[i][0] * points_2d[j][1]
            area -= points_2d[j][0] * points_2d[i][1]

        return abs(area) / 2.0 * (self.scale_factor ** 2)

    def extract_roof_plane(self) -> Dict:
        """Extract dominant roof plane from Gaussians"""
        positions = self.gaussians['positions']

        # RANSAC to find dominant plane
        best_plane = None
        best_inliers = 0
        threshold = 0.1  # 10cm inlier threshold

        for _ in range(1000):  # RANSAC iterations
            # Random 3 points
            idx = np.random.choice(len(positions), 3, replace=False)
            p1, p2, p3 = positions[idx]

            # Plane normal
            v1 = p2 - p1
            v2 = p3 - p1
            normal = np.cross(v1, v2)
            normal = normal / np.linalg.norm(normal)

            # Count inliers
            d = -np.dot(normal, p1)
            distances = np.abs(np.dot(positions, normal) + d)
            inliers = np.sum(distances < threshold)

            if inliers > best_inliers:
                best_inliers = inliers
                best_plane = {'normal': normal, 'd': d, 'inliers': inliers}

        if best_plane:
            # Calculate slope
            horizontal = np.array([0, 0, 1])
            slope_rad = np.arccos(np.abs(np.dot(best_plane['normal'], horizontal)))
            slope_deg = np.degrees(slope_rad)

            return {
                'normal': best_plane['normal'].tolist(),
                'slope_degrees': slope_deg,
                'inlier_count': best_plane['inliers'],
                'inlier_ratio': best_plane['inliers'] / len(positions)
            }

        return {'error': 'No plane found'}

    def detect_damage_in_3d(self, damage_detections_2d: List[Dict],
                            camera_poses: List[np.ndarray]) -> List[Dict]:
        """
        Project 2D damage detections to 3D space.

        Args:
            damage_detections_2d: List of {image_id, bbox, type}
            camera_poses: Camera poses from reconstruction

        Returns:
            3D locations of damages
        """
        damage_3d = []

        for det in damage_detections_2d:
            image_id = det['image_id']
            bbox = det['bbox']

            if image_id < len(camera_poses):
                pose = camera_poses[image_id]

                # Project bbox center to ray
                center_2d = ((bbox[0] + bbox[2]) / 2, (bbox[1] + bbox[3]) / 2)

                # Find intersection with Gaussian cloud
                position_3d = self._raycast_to_gaussians(center_2d, pose)

                if position_3d is not None:
                    damage_3d.append({
                        'type': det['type'],
                        'position': position_3d,
                        'source_image': image_id,
                        'confidence': det.get('confidence', 0.5)
                    })

        return damage_3d

    def _load_gaussians(self, model_path: str) -> Dict:
        """Load Gaussian parameters from PLY file"""
        # Simplified - real implementation parses full PLY format
        ply_path = f"{model_path}/point_cloud/iteration_30000/point_cloud.ply"

        positions = []
        # Parse PLY file for positions
        # ... implementation details ...

        return {
            'positions': np.array(positions) if positions else np.zeros((0, 3)),
            'count': len(positions)
        }

    def _raycast_to_gaussians(self, pixel: Tuple, pose: np.ndarray) -> Optional[Tuple]:
        """Find Gaussian intersection with ray from camera through pixel"""
        # Implementation would trace ray through Gaussian field
        # and find closest intersection
        return None  # Placeholder


class ChangeDetection3D:
    """
    Detect changes between two 3DGS reconstructions.
    Useful for before/after damage assessment.
    """
    def __init__(self, model_before: str, model_after: str):
        self.gaussians_before = self._load_gaussians(model_before)
        self.gaussians_after = self._load_gaussians(model_after)

    def detect_changes(self, threshold: float = 0.2) -> Dict:
        """
        Detect geometric changes between reconstructions.

        Args:
            threshold: Distance threshold for change detection (meters)

        Returns:
            Change analysis with added, removed, and modified regions
        """
        pos_before = self.gaussians_before['positions']
        pos_after = self.gaussians_after['positions']

        # Build KD-tree for efficient nearest neighbor
        from scipy.spatial import cKDTree

        tree_before = cKDTree(pos_before)
        tree_after = cKDTree(pos_after)

        # Find points in 'after' not in 'before' (new/added)
        distances_to_before, _ = tree_before.query(pos_after)
        added_mask = distances_to_before > threshold
        added_points = pos_after[added_mask]

        # Find points in 'before' not in 'after' (removed/damaged)
        distances_to_after, _ = tree_after.query(pos_before)
        removed_mask = distances_to_after > threshold
        removed_points = pos_before[removed_mask]

        return {
            'added_regions': self._cluster_points(added_points),
            'removed_regions': self._cluster_points(removed_points),
            'added_point_count': len(added_points),
            'removed_point_count': len(removed_points),
            'total_change_volume': self._estimate_change_volume(added_points, removed_points)
        }

    def _cluster_points(self, points: np.ndarray, eps: float = 0.5) -> List[Dict]:
        """Cluster change points into regions"""
        if len(points) == 0:
            return []

        from sklearn.cluster import DBSCAN

        clustering = DBSCAN(eps=eps, min_samples=10).fit(points)

        regions = []
        for label in set(clustering.labels_):
            if label == -1:  # Noise
                continue

            cluster_points = points[clustering.labels_ == label]
            centroid = np.mean(cluster_points, axis=0)
            extent = np.max(cluster_points, axis=0) - np.min(cluster_points, axis=0)

            regions.append({
                'centroid': centroid.tolist(),
                'extent': extent.tolist(),
                'point_count': len(cluster_points)
            })

        return regions

    def _estimate_change_volume(self, added: np.ndarray, removed: np.ndarray) -> float:
        """Estimate total volume of changes"""
        # Simplified: use convex hull volume
        from scipy.spatial import ConvexHull

        total_volume = 0

        if len(added) >= 4:
            try:
                hull = ConvexHull(added)
                total_volume += hull.volume
            except:
                pass

        if len(removed) >= 4:
            try:
                hull = ConvexHull(removed)
                total_volume += hull.volume
            except:
                pass

        return total_volume

    def _load_gaussians(self, model_path: str) -> Dict:
        """Load Gaussians from model"""
        # Same as InspectionMeasurement._load_gaussians
        return {'positions': np.zeros((0, 3))}
```

## Optimization for Drone Data

```python
class DroneGSOptimizer:
    """
    Optimize Gaussian Splatting for drone-collected imagery.
    Handles specific challenges: high altitude, motion blur, GPS metadata.
    """

    @staticmethod
    def optimal_flight_for_3dgs() -> Dict:
        """Recommended flight parameters for 3DGS reconstruction"""
        return {
            'altitude_m': {
                'min': 20,
                'max': 50,
                'optimal': 30,
                'note': 'Lower altitude = more detail, higher = wider coverage'
            },
            'speed': {
                'max_ms': 3,
                'optimal_ms': 2,
                'note': 'Slower = less motion blur, better feature matching'
            },
            'overlap': {
                'frontal_pct': 80,
                'side_pct': 70,
                'note': 'Higher overlap improves reconstruction but increases processing time'
            },
            'pattern': {
                'type': 'double_grid',
                'angles': [0, 90],
                'note': 'Cross-hatch pattern captures all surfaces'
            },
            'camera_settings': {
                'shutter_priority': True,
                'min_shutter': '1/500',
                'iso_auto_max': 800,
                'note': 'Fast shutter prevents motion blur'
            },
            'lighting': {
                'optimal_time': 'overcast or 2hrs before/after solar noon',
                'avoid': 'harsh shadows, directly into sun',
                'note': 'Even lighting improves reconstruction quality'
            }
        }

    @staticmethod
    def training_config_by_quality(quality: str) -> Dict:
        """Get training configuration by quality level"""
        configs = {
            'preview': {
                'iterations': 7000,
                'densify_until_iter': 3000,
                'sh_degree': 1,
                'estimated_time_min': 5,
                'note': 'Quick preview, lower quality'
            },
            'standard': {
                'iterations': 30000,
                'densify_until_iter': 15000,
                'sh_degree': 3,
                'estimated_time_min': 30,
                'note': 'Good balance of quality and speed'
            },
            'high_quality': {
                'iterations': 50000,
                'densify_until_iter': 25000,
                'sh_degree': 4,
                'estimated_time_min': 60,
                'note': 'High quality, longer training'
            },
            'inspection_detail': {
                'iterations': 100000,
                'densify_until_iter': 50000,
                'sh_degree': 4,
                'densification_interval': 50,
                'estimated_time_min': 180,
                'note': 'Maximum detail for damage inspection'
            }
        }
        return configs.get(quality, configs['standard'])
```
