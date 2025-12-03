---
title: Content Detection Reference
sidebar_label: Content Detection Reference
sidebar_position: 1
---
# Content Detection Reference

## Pet Recognition & Clustering

```python
from ultralytics import YOLO
from transformers import CLIPProcessor, CLIPModel

class PetRecognizer:
    """Pet detection and clustering."""

    def __init__(self):
        self.yolo = YOLO('yolov8n.pt')
        self.clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
        self.clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

    def detect_animals(self, image):
        """Detect animals in image."""
        results = self.yolo(image)

        animals = []
        animal_classes = ['cat', 'dog', 'horse', 'bird', 'cow', 'sheep',
                         'elephant', 'bear', 'zebra', 'giraffe']

        for result in results:
            for box in result.boxes:
                class_name = result.names[int(box.cls)]
                if class_name in animal_classes:
                    animals.append({
                        'type': class_name,
                        'bbox': box.xyxy[0].cpu().numpy(),
                        'confidence': float(box.conf)
                    })
        return animals

    def extract_pet_embedding(self, image, bbox):
        """Extract embedding for individual animal using CLIP."""
        x1, y1, x2, y2 = map(int, bbox)
        crop = image.crop((x1, y1, x2, y2))

        inputs = self.clip_processor(images=crop, return_tensors="pt")
        with torch.no_grad():
            embedding = self.clip_model.get_image_features(**inputs)
        return embedding.cpu().numpy().flatten()

    def cluster_pets(self, pet_embeddings, min_cluster_size=5):
        """Cluster pet embeddings (same individual = cluster)."""
        clusterer = hdbscan.HDBSCAN(
            min_cluster_size=min_cluster_size,
            min_samples=2,
            metric='cosine'
        )
        return clusterer.fit_predict(np.array(pet_embeddings))
```

---

## Burst Photo Selection

**Problem:** Burst mode creates 10-50 nearly identical photos. Need to select best frame.

**Solution:** Multi-criteria scoring: sharpness, face quality, aesthetics, composition.

```python
class BurstPhotoSelector:
    """Select best photo from camera burst sequence."""

    def __init__(self):
        self.face_detector = FaceEmbeddingExtractor()
        self.aesthetic_scorer = NIMAPredictor()

    def detect_bursts(self, photos_with_timestamps, max_gap_seconds=0.5):
        """Detect burst sequences from timestamps."""
        sorted_photos = sorted(photos_with_timestamps, key=lambda x: x[1])

        bursts = []
        current_burst = [sorted_photos[0]]

        for photo in sorted_photos[1:]:
            time_gap = (photo[1] - current_burst[-1][1]).total_seconds()
            if time_gap <= max_gap_seconds:
                current_burst.append(photo)
            else:
                if len(current_burst) >= 3:
                    bursts.append(current_burst)
                current_burst = [photo]

        if len(current_burst) >= 3:
            bursts.append(current_burst)

        return bursts

    def select_best_from_burst(self, burst_photos):
        """
        Select best photo from burst.
        Criteria: Sharpness, Face quality, Aesthetics, Position, Exposure
        """
        scores = []

        for idx, (photo_id, timestamp, image) in enumerate(burst_photos):
            score = 0.0

            # 1. SHARPNESS (30%)
            gray = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2GRAY)
            sharpness = cv2.Laplacian(gray, cv2.CV_64F).var()
            score += min(1.0, sharpness / 1000) * 0.30

            # 2. FACE QUALITY (35%)
            faces = self.face_detector.extract_faces(image)
            if faces:
                face_scores = [self.assess_face_quality(f) for f in faces]
                score += np.mean(face_scores) * 0.35
            else:
                score += 0.5 * 0.35

            # 3. AESTHETIC SCORE (20%)
            score += self.aesthetic_scorer.predict(image) * 0.20

            # 4. POSITION BONUS - middle frames (10%)
            position = idx / len(burst_photos)
            center_bonus = 1.0 - abs(position - 0.5) * 2
            score += center_bonus * 0.10

            # 5. EXPOSURE (5%)
            score += self.assess_exposure(image) * 0.05

            scores.append((photo_id, score))

        return max(scores, key=lambda x: x[1])[0]

    def assess_face_quality(self, face_dict):
        """Assess quality: eyes open, not blurry, smiling."""
        face_crop = face_dict['crop']
        gray_face = cv2.cvtColor(np.array(face_crop), cv2.COLOR_RGB2GRAY)
        face_sharpness = cv2.Laplacian(gray_face, cv2.CV_64F).var()
        sharpness_score = min(1.0, face_sharpness / 500)

        # Production: Use landmarks or emotion classifier
        eyes_open_score = 0.8
        smiling_score = 0.7

        return (sharpness_score * 0.4 + eyes_open_score * 0.3 + smiling_score * 0.3)

    def assess_exposure(self, image):
        """Check if image is properly exposed."""
        gray = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2GRAY)
        hist = cv2.calcHist([gray], [0], None, [256], [0, 256])
        hist = hist.flatten() / hist.sum()

        clipping = np.sum(hist[:20]) + np.sum(hist[235:])
        return max(0, 1.0 - clipping / 0.05)
```

---

## Screenshot vs Photo Classification

**Signals:**
1. EXIF metadata (camera info missing)
2. UI elements (status bars, buttons)
3. Text density
4. Perfect rectangles
5. Device-specific aspect ratios
6. Sharpness (screenshots are perfectly sharp)

```python
class ScreenshotDetector:
    """Classify image as screenshot vs photo."""

    def __init__(self):
        self.text_detector = self.init_text_detector()
        self.ui_detector = self.init_ui_detector()

    def is_screenshot(self, image, metadata=None):
        """
        Determine if image is screenshot.
        Returns: (bool, confidence)
        """
        signals = []

        # SIGNAL 1: EXIF metadata
        if metadata:
            has_camera_info = any(k in metadata for k in
                                ['Make', 'Model', 'LensModel', 'FocalLength'])
            if not has_camera_info:
                signals.append(('no_camera_exif', 0.6))
        else:
            signals.append(('no_metadata', 0.5))

        # SIGNAL 2: UI elements
        ui_elements = self.detect_ui_elements(image)
        if ui_elements:
            signals.append(('ui_elements', 0.85))

        # SIGNAL 3: Text density
        text_coverage = self.compute_text_coverage(image)
        if text_coverage > 0.25:
            signals.append(('high_text', 0.7))

        # SIGNAL 4: Perfect rectangles
        perfect_rects = self.detect_perfect_rectangles(image)
        if perfect_rects > 5:
            signals.append(('perfect_rects', 0.75))

        # SIGNAL 5: Device aspect ratio
        h, w = np.array(image).shape[:2]
        aspect = w / h
        device_aspects = [(16/9, 'standard'), (1125/2436, 'iphone_x'),
                         (1080/1920, 'android_fhd'), (1440/2960, 'samsung_s8')]

        for target_aspect, device_name in device_aspects:
            if abs(aspect - target_aspect) < 0.01:
                signals.append((f'device_aspect_{device_name}', 0.6))
                break

        # SIGNAL 6: Perfect sharpness
        sharpness = self.compute_sharpness(image)
        if sharpness > 2000:
            signals.append(('perfect_sharpness', 0.5))

        if not signals:
            return False, 0.0

        max_confidence = max(conf for _, conf in signals)
        return max_confidence > 0.6, max_confidence

    def detect_ui_elements(self, image):
        """Detect status bars, buttons, icons."""
        h, w = np.array(image).shape[:2]
        top_strip = np.array(image)[:int(h * 0.05), :]
        top_variance = np.var(top_strip)

        if top_variance < 100:
            return [{'type': 'status_bar', 'confidence': 0.8}]
        return []

    def compute_text_coverage(self, image):
        """Compute % of image covered by text."""
        import pytesseract
        data = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT)

        total_area = image.width * image.height
        text_area = sum(
            data['width'][i] * data['height'][i]
            for i, conf in enumerate(data['conf']) if conf > 0
        )
        return text_area / total_area

    def detect_perfect_rectangles(self, image):
        """Detect pixel-perfect rectangles (UI buttons)."""
        gray = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2GRAY)
        edges = cv2.Canny(gray, 50, 150)
        contours, _ = cv2.findContours(edges, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)

        perfect_rects = 0
        for contour in contours:
            epsilon = 0.01 * cv2.arcLength(contour, True)
            approx = cv2.approxPolyDP(contour, epsilon, True)
            if len(approx) == 4:
                perfect_rects += 1
        return perfect_rects

    def compute_sharpness(self, image):
        gray = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2GRAY)
        return cv2.Laplacian(gray, cv2.CV_64F).var()
```

---

## Burst Selection Weights

| Criterion | Weight | Description |
|-----------|--------|-------------|
| Sharpness | 30% | Laplacian variance |
| Face Quality | 35% | Eyes open, smiling, face sharpness |
| Aesthetics | 20% | NIMA score |
| Position | 10% | Middle frames bonus |
| Exposure | 5% | Not over/underexposed |

## Screenshot Detection Signals

| Signal | Confidence | Description |
|--------|------------|-------------|
| UI elements | 0.85 | Status bars, buttons |
| Perfect rectangles | 0.75 | UI buttons (4 corners, 90° angles) |
| High text | 0.70 | >25% text coverage |
| No camera EXIF | 0.60 | Missing Make/Model/Lens |
| Device aspect | 0.60 | Exact phone screen ratio |
| Perfect sharpness | 0.50 | >2000 Laplacian variance |
