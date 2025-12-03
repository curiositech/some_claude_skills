---
title: Line Detection Algorithms (State of the Art)
sidebar_label: Line Detection Algorithms (...
sidebar_position: 5
---
# Line Detection Algorithms (State of the Art)

## Algorithm Comparison (2025)

| Algorithm | Speed vs LSD | Accuracy | Real-time? | Use Case |
|-----------|-------------|----------|------------|----------|
| **Hough Transform** | 0.1x | Good | No | Traditional, needs Canny preprocessing |
| **LSD** | 1x (baseline) | Excellent | Borderline | Baseline for modern methods |
| **EDLines** | **10-11x** | Excellent | **Yes** | **Recommended for your projects** |
| **LB-LSD** | 8x | Good | Yes | Length-based optimization |
| **LETR** (Transformer) | 0.5x | Excellent | No | Deep learning, GPU-heavy |

## EDLines: Optimal Choice for Collage Assembly

**Why EDLines for Edge-Based Collage Assembly**:

1. **Speed**: 10x faster than LSD (critical for interactive generation)
2. **Accuracy**: Produces precise line segments with false detection control
3. **No parameter tuning**: Works out-of-box (vs. Hough's many parameters)
4. **Edge-based**: Aligns perfectly with "edge-first assembly" approach
5. **Real-time**: Suitable for live preview as users adjust parameters

### EDLines Algorithm Overview

```
1. Edge Detection (Edge Drawing algorithm)
   - Fast gradient-based edge extraction
   - Produces clean edge chains (not noisy pixel maps)

2. Line Segment Fitting
   - Fit line segments to edge chains
   - Use least-squares fitting with error threshold
   - Validate line segments (reject false detections)

3. Output
   - List of line segments: [(x1, y1, x2, y2, angle, length, strength), ...]
   - Angle in degrees (-90 to 90)
   - Strength from gradient magnitude
```

### Performance Benchmarks

- **1024×1024 image**: ~10-15ms on M2 GPU
- **4K image**: ~40-50ms on M2 GPU
- **iPhone 15 Pro**: ~20-30ms (1024×1024)

---

## LSD (Line Segment Detector)

**Use when**: You need maximum accuracy over speed (e.g., final high-res render)

**Characteristics**:
- Gradient grouping approach
- Built-in false detection control (Helmholtz principle)
- Parameter-free (adaptive thresholds)
- Produces sub-pixel accurate line segments

### Implementation

```python
import cv2

# OpenCV includes LSD
lsd = cv2.createLineSegmentDetector(0)  # 0 = LSD_REFINE_NONE
lines, width, prec, nfa = lsd.detect(gray_image)

# lines: Nx1x4 array of [x1, y1, x2, y2]
# width: line widths
# nfa: Number of False Alarms (lower = more confident)
```

---

## Hough Transform

**Use when**: Detecting specific geometric patterns (circles, ellipses) or teaching/legacy contexts

### Classical Hough

```python
import cv2
import numpy as np

# 1. Preprocess: Edge detection
edges = cv2.Canny(gray_image, 50, 150)

# 2. Hough Transform
lines = cv2.HoughLines(edges, rho=1, theta=np.pi/180, threshold=100)

# 3. Convert from (ρ, θ) to (x1, y1, x2, y2)
for rho, theta in lines:
    a, b = np.cos(theta), np.sin(theta)
    x0, y0 = a * rho, b * rho
    x1 = int(x0 + 1000 * (-b))
    y1 = int(y0 + 1000 * (a))
    x2 = int(x0 - 1000 * (-b))
    y2 = int(y0 - 1000 * (a))
```

### Probabilistic Hough (faster variant)

```python
lines = cv2.HoughLinesP(
    edges,
    rho=1,
    theta=np.pi/180,
    threshold=50,
    minLineLength=30,
    maxLineGap=10
)
# Returns line segments directly: [(x1, y1, x2, y2), ...]
```

---

## When to Use Each Algorithm

| Context | Recommended |
|---------|-------------|
| Interactive generation | EDLines |
| Final high-res render | LSD |
| Teaching / legacy code | Hough |
| Deep learning pipeline | LETR |
| Mobile real-time | EDLines |
