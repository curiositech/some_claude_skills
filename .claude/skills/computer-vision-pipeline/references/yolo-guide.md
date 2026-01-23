# YOLOv8 Guide

Complete guide to YOLOv8 for object detection: setup, training, inference, and optimization.

## Installation

```bash
# Install ultralytics (includes YOLOv8)
pip install ultralytics

# Verify installation
yolo version

# Install additional dependencies
pip install opencv-python numpy torch torchvision
```

**Latest version**: ultralytics 8.1.20 (Jan 2024)

---

## Model Variants

| Model | Size (MB) | mAP50-95 | Speed (ms) | Params (M) | Use Case |
|-------|-----------|----------|------------|------------|----------|
| YOLOv8n | 6 | 37.3% | 80 | 3.2 | Mobile, edge devices |
| YOLOv8s | 22 | 44.9% | 128 | 11.2 | Embedded systems |
| YOLOv8m | 52 | 50.2% | 234 | 25.9 | Balanced |
| YOLOv8l | 88 | 52.9% | 375 | 43.7 | High accuracy |
| YOLOv8x | 136 | 53.9% | 479 | 68.2 | Highest accuracy |

**Naming**:
- `n` = nano (smallest)
- `s` = small
- `m` = medium
- `l` = large
- `x` = extra large

**Speed measured on**: NVIDIA T4 GPU, batch size 1, image size 640x640

---

## Basic Inference

### Load Pre-trained Model

```python
from ultralytics import YOLO

# Load model
model = YOLO('yolov8n.pt')  # nano model

# Run inference on single image
results = model('image.jpg')

# Access results
for result in results:
    boxes = result.boxes  # Bounding boxes
    masks = result.masks  # Segmentation masks (if using seg model)
    probs = result.probs  # Classification probabilities
```

### Process Results

```python
import cv2

results = model('image.jpg')

for result in results:
    # Get bounding boxes
    boxes = result.boxes

    for box in boxes:
        # Coordinates
        x1, y1, x2, y2 = box.xyxy[0]  # Box coordinates

        # Metadata
        conf = box.conf[0]  # Confidence
        cls = box.cls[0]    # Class ID
        label = result.names[int(cls)]  # Class name

        print(f"{label} {conf:.2f} at ({x1}, {y1}, {x2}, {y2})")

        # Draw on image
        img = result.orig_img
        cv2.rectangle(img, (int(x1), int(y1)), (int(x2), int(y2)), (0, 255, 0), 2)
        cv2.putText(img, f'{label} {conf:.2f}', (int(x1), int(y1)-10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

    cv2.imwrite('output.jpg', img)
```

---

## Inference Options

### Confidence and IoU Thresholds

```python
results = model(
    'image.jpg',
    conf=0.5,    # Confidence threshold (default: 0.25)
    iou=0.7      # IoU threshold for NMS (default: 0.7)
)
```

### Image Size

```python
results = model(
    'image.jpg',
    imgsz=640    # Image size (default: 640)
                  # Can be single int or tuple (height, width)
)
```

### Device Selection

```python
# Use GPU
results = model('image.jpg', device=0)  # GPU 0

# Use CPU
results = model('image.jpg', device='cpu')

# Multiple GPUs
results = model('image.jpg', device=[0, 1])  # GPUs 0 and 1
```

### Max Detections

```python
results = model(
    'image.jpg',
    max_det=100  # Maximum detections per image (default: 300)
)
```

---

## Batch Inference

```python
# List of images
image_paths = ['img1.jpg', 'img2.jpg', 'img3.jpg']
results = model(image_paths)

# Process results
for i, result in enumerate(results):
    print(f"Image {i}: {len(result.boxes)} detections")
```

---

## Training Custom Models

### Dataset Format

YOLO requires this directory structure:

```
dataset/
├── data.yaml
├── images/
│   ├── train/
│   │   ├── img001.jpg
│   │   └── img002.jpg
│   └── val/
│       ├── img101.jpg
│       └── img102.jpg
└── labels/
    ├── train/
    │   ├── img001.txt
    │   └── img002.txt
    └── val/
        ├── img101.txt
        └── img102.txt
```

**data.yaml**:
```yaml
path: /path/to/dataset
train: images/train
val: images/val

names:
  0: dolphin
  1: whale
  2: shark
```

**Label format** (one line per object):
```
<class_id> <x_center> <y_center> <width> <height>
```

All values normalized to [0, 1].

Example (`img001.txt`):
```
0 0.5 0.5 0.3 0.4
1 0.7 0.3 0.2 0.2
```

---

### Train Model

```python
from ultralytics import YOLO

# Load pre-trained model
model = YOLO('yolov8n.pt')

# Train
results = model.train(
    data='data.yaml',
    epochs=100,
    imgsz=640,
    batch=16,
    name='dolphin_detector',
    device=0
)
```

**Training parameters**:
- `epochs`: Number of training epochs
- `imgsz`: Image size (640, 1280, etc.)
- `batch`: Batch size (reduce if OOM errors)
- `patience`: Early stopping patience (default: 50)
- `lr0`: Initial learning rate (default: 0.01)
- `lrf`: Final learning rate (default: 0.01)
- `momentum`: SGD momentum (default: 0.937)
- `weight_decay`: Optimizer weight decay (default: 0.0005)
- `warmup_epochs`: Warmup epochs (default: 3.0)
- `save`: Save checkpoints (default: True)
- `device`: GPU device (0, 1, ..., 'cpu')

---

### Resume Training

```python
# Resume from last checkpoint
model = YOLO('runs/detect/dolphin_detector/weights/last.pt')
model.train(resume=True)
```

---

### Augmentation

YOLO automatically applies augmentations. You can customize:

```python
model.train(
    data='data.yaml',
    epochs=100,
    # Augmentation parameters
    hsv_h=0.015,       # HSV-Hue augmentation
    hsv_s=0.7,         # HSV-Saturation augmentation
    hsv_v=0.4,         # HSV-Value augmentation
    degrees=0.0,       # Rotation (+/- deg)
    translate=0.1,     # Translation (+/- fraction)
    scale=0.5,         # Scale (+/- gain)
    shear=0.0,         # Shear (+/- deg)
    perspective=0.0,   # Perspective (+/- fraction)
    flipud=0.0,        # Flip up-down (probability)
    fliplr=0.5,        # Flip left-right (probability)
    mosaic=1.0,        # Mosaic augmentation (probability)
    mixup=0.0          # MixUp augmentation (probability)
)
```

---

## Validation

```python
# Validate trained model
model = YOLO('runs/detect/dolphin_detector/weights/best.pt')

metrics = model.val(data='data.yaml')

# Access metrics
print(f"mAP50: {metrics.box.map50:.4f}")
print(f"mAP50-95: {metrics.box.map:.4f}")
print(f"Precision: {metrics.box.mp:.4f}")
print(f"Recall: {metrics.box.mr:.4f}")

# Per-class metrics
for i, ap in enumerate(metrics.box.ap50):
    print(f"Class {i} AP50: {ap:.4f}")
```

---

## Export

### ONNX (Recommended for Production)

```python
model = YOLO('best.pt')

# Export to ONNX
model.export(format='onnx', imgsz=640)

# Use exported model
onnx_model = YOLO('best.onnx')
results = onnx_model('image.jpg')
```

**Benefits**:
- Faster inference (~2x)
- Smaller file size
- Cross-platform compatibility

### Other Formats

```python
# TorchScript
model.export(format='torchscript')

# CoreML (for iOS)
model.export(format='coreml')

# TensorFlow Lite (for mobile)
model.export(format='tflite')

# TensorFlow.js (for web)
model.export(format='tfjs')
```

---

## CLI Usage

### Inference

```bash
# Single image
yolo detect predict model=yolov8n.pt source=image.jpg

# Video
yolo detect predict model=yolov8n.pt source=video.mp4

# Webcam
yolo detect predict model=yolov8n.pt source=0

# Directory
yolo detect predict model=yolov8n.pt source=./images/

# With options
yolo detect predict model=yolov8n.pt source=image.jpg conf=0.5 iou=0.7 save=true
```

### Training

```bash
yolo detect train data=data.yaml model=yolov8n.pt epochs=100 imgsz=640
```

### Validation

```bash
yolo detect val model=best.pt data=data.yaml
```

---

## Optimization Tips

### 1. Mixed Precision Training (FP16)

```python
model.train(
    data='data.yaml',
    epochs=100,
    amp=True  # Automatic Mixed Precision (faster, less memory)
)
```

**Benefits**:
- 2x faster training
- 50% less GPU memory
- Minimal accuracy loss

---

### 2. Optimal Batch Size

```python
# Find max batch size for your GPU
for batch_size in [4, 8, 16, 32, 64]:
    try:
        model.train(data='data.yaml', epochs=1, batch=batch_size)
        print(f"Batch {batch_size}: OK")
    except RuntimeError as e:
        print(f"Batch {batch_size}: OOM")
        break
```

---

### 3. Freeze Layers

```python
# Freeze backbone layers (faster convergence for similar data)
model.train(
    data='data.yaml',
    epochs=100,
    freeze=10  # Freeze first 10 layers
)
```

---

### 4. Multi-GPU Training

```python
# Use all GPUs
model.train(
    data='data.yaml',
    epochs=100,
    device=[0, 1, 2, 3]  # Use GPUs 0-3
)
```

---

## Common Issues

### Out of Memory (OOM)

**Solution 1**: Reduce batch size
```python
model.train(batch=8)  # Instead of 16
```

**Solution 2**: Reduce image size
```python
model.train(imgsz=416)  # Instead of 640
```

**Solution 3**: Use gradient accumulation
```python
# Simulate larger batch size
model.train(batch=4, accumulate=4)  # Effective batch size = 16
```

---

### Slow Training

**Solution 1**: Use smaller model
```python
model = YOLO('yolov8n.pt')  # Instead of yolov8x.pt
```

**Solution 2**: Enable AMP
```python
model.train(amp=True)
```

**Solution 3**: Use multiple workers
```python
model.train(workers=8)  # More data loading workers
```

---

### Poor Accuracy

**Solution 1**: Train longer
```python
model.train(epochs=300, patience=100)
```

**Solution 2**: Increase image size
```python
model.train(imgsz=1280)  # Higher resolution
```

**Solution 3**: More data augmentation
```python
model.train(mosaic=1.0, mixup=0.15, copy_paste=0.3)
```

**Solution 4**: Use larger model
```python
model = YOLO('yolov8l.pt')  # Instead of yolov8n.pt
```

---

## Benchmarking

```python
from ultralytics.utils.benchmarks import benchmark

# Benchmark model
benchmark(model='yolov8n.pt', imgsz=640, half=False, device=0)
```

Output:
```
Model          Format    Size (MB)  mAP50-95  Inference (ms)
yolov8n        PyTorch   6.2        37.3      80.2
yolov8n        ONNX      12.4       37.3      42.1  (1.9x faster)
yolov8n        TensorRT  13.1       37.3      28.5  (2.8x faster)
```

---

## Resources

- [YOLOv8 Documentation](https://docs.ultralytics.com/)
- [Ultralytics GitHub](https://github.com/ultralytics/ultralytics)
- [Model Zoo](https://github.com/ultralytics/assets/releases)
- [Training Tips](https://docs.ultralytics.com/guides/model-training-tips/)
