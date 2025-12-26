---
title: 3D Gaussian Splatting Pipeline for Weddings
sidebar_label: 3D Gaussian Splatting Pipel...
sidebar_position: 2
---
# 3D Gaussian Splatting Pipeline for Weddings

## Complete Technical Pipeline

### Overview

3D Gaussian Splatting (3DGS) creates photorealistic, real-time renderable 3D scenes from photos/video. For weddings, we're reconstructing entire venues as explorable memory spaces.

## Phase 1: Data Ingestion

### Video Frame Extraction

```python
import cv2
import os
from pathlib import Path

def extract_frames(video_path: str, output_dir: str, fps: float = 2.0):
    """
    Extract frames from wedding video at optimal rate for 3DGS.

    Why 2-3 fps?
    - Wedding videos are typically 30fps
    - Adjacent frames are nearly identical (redundant)
    - 2-3fps maintains 80%+ overlap while reducing processing 10x
    - More frames ≠ better quality after sufficient overlap
    """
    cap = cv2.VideoCapture(video_path)
    video_fps = cap.get(cv2.CAP_PROP_FPS)
    frame_interval = int(video_fps / fps)

    Path(output_dir).mkdir(parents=True, exist_ok=True)

    frame_count = 0
    saved_count = 0

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        if frame_count % frame_interval == 0:
            # Check for blur before saving
            laplacian_var = cv2.Laplacian(frame, cv2.CV_64F).var()
            if laplacian_var > 100:  # Reject blurry frames
                cv2.imwrite(f"\{output_dir\}/frame_{saved_count:06d}.jpg", frame)
                saved_count += 1

        frame_count += 1

    cap.release()
    return saved_count

# Quality thresholds
BLUR_THRESHOLD = 100  # Laplacian variance
MIN_IMAGES_PER_SPACE = 50
OPTIMAL_IMAGES_PER_SPACE = 150
MAX_IMAGES_PER_SPACE = 300  # Diminishing returns after this
```

### Photo Organization

```python
from datetime import datetime
from PIL import Image
from PIL.ExifTags import TAGS
import shutil

def organize_wedding_photos(source_dir: str, output_dir: str):
    """
    Organize photos by time and location for multi-space reconstruction.
    """
    photos = []

    for img_path in Path(source_dir).glob("**/*.{jpg,jpeg,JPG,JPEG,png,PNG}"):
        try:
            img = Image.open(img_path)
            exif = img._getexif()

            timestamp = None
            gps = None

            if exif:
                for tag_id, value in exif.items():
                    tag = TAGS.get(tag_id, tag_id)
                    if tag == "DateTimeOriginal":
                        timestamp = datetime.strptime(value, "%Y:%m:%d %H:%M:%S")
                    elif tag == "GPSInfo":
                        gps = value

            photos.append({
                'path': img_path,
                'timestamp': timestamp,
                'gps': gps,
                'resolution': img.size
            })
        except Exception as e:
            print(f"Skipping \{img_path\}: \{e\}")

    # Sort by timestamp
    photos.sort(key=lambda x: x['timestamp'] or datetime.min)

    # Cluster into spaces based on time gaps
    spaces = cluster_into_spaces(photos)

    return spaces

def cluster_into_spaces(photos, gap_threshold_minutes=15):
    """
    Cluster photos into distinct spaces/moments based on time gaps.

    Typical wedding timeline:
    - Getting ready (1-2 hours)
    - Ceremony (30-60 min)
    - Cocktail hour (1 hour)
    - Reception entrance + dinner (1-2 hours)
    - Dancing + party (2-3 hours)
    """
    spaces = []
    current_space = []

    for i, photo in enumerate(photos):
        if i == 0:
            current_space.append(photo)
            continue

        prev_time = photos[i-1]['timestamp']
        curr_time = photo['timestamp']

        if prev_time and curr_time:
            gap = (curr_time - prev_time).total_seconds() / 60
            if gap > gap_threshold_minutes:
                spaces.append(current_space)
                current_space = []

        current_space.append(photo)

    if current_space:
        spaces.append(current_space)

    return spaces
```

## Phase 2: COLMAP Structure from Motion

### Feature Extraction

```bash
#!/bin/bash
# colmap_sfm.sh - Structure from Motion pipeline

WORKSPACE=$1
IMAGE_PATH=$2

# 1. Feature extraction with SIFT
colmap feature_extractor \
    --database_path $WORKSPACE/database.db \
    --image_path $IMAGE_PATH \
    --ImageReader.single_camera 0 \
    --ImageReader.camera_model OPENCV \
    --SiftExtraction.max_image_size 3200 \
    --SiftExtraction.max_num_features 8192 \
    --SiftExtraction.first_octave -1 \
    --SiftExtraction.num_threads -1

# 2. Feature matching
# For wedding photos with lots of similar views, exhaustive matching works best
colmap exhaustive_matcher \
    --database_path $WORKSPACE/database.db \
    --SiftMatching.guided_matching 1 \
    --SiftMatching.max_ratio 0.8 \
    --SiftMatching.max_distance 0.7

# 3. Sparse reconstruction (SfM)
mkdir -p $WORKSPACE/sparse
colmap mapper \
    --database_path $WORKSPACE/database.db \
    --image_path $IMAGE_PATH \
    --output_path $WORKSPACE/sparse \
    --Mapper.ba_refine_focal_length 1 \
    --Mapper.ba_refine_principal_point 1 \
    --Mapper.ba_refine_extra_params 1

# 4. Undistort images for dense reconstruction
colmap image_undistorter \
    --image_path $IMAGE_PATH \
    --input_path $WORKSPACE/sparse/0 \
    --output_path $WORKSPACE/dense \
    --output_type COLMAP

echo "SfM complete. Check $WORKSPACE/sparse/0 for camera poses."
```

### Handling Multiple Spaces

```python
def merge_reconstructions(spaces: list, output_path: str):
    """
    For weddings spanning multiple distinct spaces (ceremony, reception),
    we have two options:

    1. SEPARATE SCENES: Train individual 3DGS models per space
       - Pros: Better quality per scene, simpler training
       - Cons: Need scene transitions in viewer

    2. MERGED SCENE: Use shared features to align all spaces
       - Pros: Seamless navigation
       - Cons: Harder to reconstruct, may need manual alignment

    For weddings, SEPARATE SCENES is usually better.
    """

    # Create navigation graph between spaces
    navigation = {
        'spaces': [],
        'transitions': []
    }

    for i, space in enumerate(spaces):
        navigation['spaces'].append({
            'id': f'space_\{i\}',
            'name': space['name'],  # e.g., "ceremony", "reception"
            'model_path': f'\{output_path\}/space_\{i\}',
            'entry_point': space.get('entry_camera'),  # Best starting view
            'thumbnail': space.get('thumbnail')
        })

    # Define logical transitions
    navigation['transitions'] = [
        {'from': 'ceremony', 'to': 'cocktail', 'type': 'fade'},
        {'from': 'cocktail', 'to': 'reception', 'type': 'walk'},
        # etc.
    ]

    return navigation
```

## Phase 3: 3DGS Training

### Training Configuration

```python
# wedding_3dgs_config.py

WEDDING_3DGS_CONFIG = {
    # Training iterations
    'iterations': 50_000,  # High quality for permanent archive

    # Densification settings
    'densify_from_iter': 500,
    'densify_until_iter': 15_000,
    'densification_interval': 100,
    'opacity_reset_interval': 3000,

    # Gaussian parameters
    'sh_degree': 3,  # Full spherical harmonics for complex lighting
    'percent_dense': 0.01,
    'densify_grad_threshold': 0.0002,

    # Pruning
    'min_opacity': 0.005,
    'max_screen_size': 20,  # Max pixel size before splitting

    # Learning rates
    'position_lr_init': 0.00016,
    'position_lr_final': 0.0000016,
    'position_lr_delay_mult': 0.01,
    'position_lr_max_steps': 30_000,
    'feature_lr': 0.0025,
    'opacity_lr': 0.05,
    'scaling_lr': 0.005,
    'rotation_lr': 0.001,

    # Loss weights
    'lambda_dssim': 0.2,  # Structural similarity weight

    # Performance
    'white_background': False,  # Wedding venues rarely have white bg
    'data_device': 'cuda',
    'convert_SHs_python': False,
    'compute_cov3D_python': False,
}

# Quality presets
QUALITY_PRESETS = {
    'preview': {
        'iterations': 7_000,
        'densify_until_iter': 5_000,
        'description': 'Quick preview in ~5 minutes'
    },
    'standard': {
        'iterations': 30_000,
        'densify_until_iter': 15_000,
        'description': 'Good quality in ~30 minutes'
    },
    'high': {
        'iterations': 50_000,
        'densify_until_iter': 20_000,
        'description': 'High quality in ~1 hour'
    },
    'archival': {
        'iterations': 100_000,
        'densify_until_iter': 30_000,
        'description': 'Maximum quality in ~3 hours'
    }
}
```

### Training Script

```python
import torch
from gaussian_splatting import GaussianModel, train
from scene import Scene
import os

def train_wedding_scene(
    source_path: str,
    output_path: str,
    quality: str = 'high'
):
    """
    Train 3DGS model for a wedding space.

    Args:
        source_path: COLMAP output directory
        output_path: Where to save trained model
        quality: 'preview', 'standard', 'high', or 'archival'
    """

    config = {**WEDDING_3DGS_CONFIG, **QUALITY_PRESETS[quality]}

    # Initialize Gaussian model
    gaussians = GaussianModel(config['sh_degree'])

    # Load scene from COLMAP
    scene = Scene(source_path, gaussians)

    # Training loop with wedding-specific optimizations
    for iteration in range(config['iterations']):
        # Render
        render_pkg = render(
            scene.getTrainCameras()[iteration % len(scene.getTrainCameras())],
            gaussians,
            background=torch.zeros(3).cuda()
        )

        # Loss
        image = render_pkg['render']
        gt_image = scene.getTrainCameras()[iteration % len(scene.getTrainCameras())].original_image

        l1_loss = torch.abs(image - gt_image).mean()
        ssim_loss = 1.0 - ssim(image, gt_image)
        loss = (1 - config['lambda_dssim']) * l1_loss + config['lambda_dssim'] * ssim_loss

        loss.backward()

        # Densification
        if iteration < config['densify_until_iter']:
            if iteration > config['densify_from_iter'] and iteration % config['densification_interval'] == 0:
                gaussians.densify_and_prune(
                    config['densify_grad_threshold'],
                    config['min_opacity'],
                    scene.cameras_extent,
                    config['max_screen_size']
                )

        # Optimizer step
        gaussians.optimizer.step()
        gaussians.optimizer.zero_grad()

        # Logging
        if iteration % 1000 == 0:
            print(f"Iteration \{iteration\}: Loss = {loss.item():.6f}")

        # Save checkpoint
        if iteration % 10000 == 0:
            torch.save(gaussians.capture(), f"\{output_path\}/checkpoint_\{iteration\}.pth")

    # Final save
    gaussians.save_ply(f"\{output_path\}/point_cloud.ply")

    return output_path
```

## Phase 4: Web Viewer Integration

### Viewer Architecture

```typescript
// WeddingViewer.tsx
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { SplatLoader } from '@mkkellogg/gaussian-splats-3d';

interface WeddingViewerProps {
  spaces: WeddingSpace[];
  moments: TheatreMoment[];
  onMomentClick: (moment: TheatreMoment) => void;
}

export function WeddingViewer({ spaces, moments, onMomentClick }: WeddingViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<GaussianSplatViewer | null>(null);
  const [currentSpace, setCurrentSpace] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Three.js scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });

    // Load Gaussian Splat
    const loader = new SplatLoader();
    loader.load(spaces[currentSpace].modelPath, (splat) => {
      scene.add(splat);
      setLoading(false);
    });

    // Add moment markers
    moments.forEach(moment => {
      const marker = createMomentMarker(moment);
      marker.onClick = () => onMomentClick(moment);
      scene.add(marker);
    });

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Animation loop
    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    return () => {
      renderer.dispose();
    };
  }, [currentSpace, spaces, moments]);

  return (
    <div ref=\{containerRef\} className="wedding-viewer">
      {loading && <LoadingOverlay theme={spaces[currentSpace].theme} />}
      <SpaceNavigator
        spaces=\{spaces\}
        current=\{currentSpace\}
        onChange=\{setCurrentSpace\}
      />
    </div>
  );
}
```

## Hardware Requirements

| Component | Minimum | Recommended | Notes |
|-----------|---------|-------------|-------|
| GPU | RTX 3060 12GB | RTX 4080 16GB | VRAM is the bottleneck |
| RAM | 32GB | 64GB | For large photo sets |
| Storage | 100GB SSD | 500GB NVMe | Fast I/O matters |
| CPU | 8 cores | 16+ cores | For COLMAP parallelization |

## Troubleshooting

### Common Issues

1. **Sparse point cloud**: Not enough image overlap
   - Solution: Add more photos from in-between angles

2. **Floaters**: Random gaussians in empty space
   - Solution: Increase opacity pruning, reduce learning rate

3. **Blurry reconstruction**: Motion blur in source images
   - Solution: Filter frames with Laplacian variance \< 100

4. **Memory errors**: Too many gaussians
   - Solution: Reduce densification, increase pruning

### Quality Checklist

- [ ] Minimum 50 images per distinct space
- [ ] 60-80% overlap between adjacent views
- [ ] No motion blur (Laplacian variance > 100)
- [ ] Consistent lighting (avoid mixed indoor/outdoor)
- [ ] All guests' faces visible in at least 3 angles
