# Computational Aesthetics Models

ML models and datasets for image quality assessment.

## AVA Dataset (Aesthetic Visual Analysis)

```
250,000+ images from dpchallenge.com
├── Mean scores from 78-549 votes each
├── Semantic tags (landscape, portrait, etc.)
├── Style tags (HDR, vintage, etc.)
└── Ground truth for training aesthetics models

SCORE DISTRIBUTION INSIGHT
├── Most images: 5.0-5.5 (mediocre)
├── Great images: 6.5+ (top ~5%)
├── Exceptional: 7.0+ (top ~1%)
└── Bimodal: Some images polarize voters
```

## NIMA (Neural Image Assessment)

Google's 2017 model predicting AVA scores. Key innovation: predicts **distribution**, not just mean score.

```python
# Architecture: MobileNet/VGG16/Inception + custom head
# Output: 10-class probability distribution (scores 1-10)
# Loss: Earth Mover's Distance (EMD)

def get_nima_score(image_path):
    img = preprocess(load_image(image_path))
    distribution = model.predict(img)
    mean_score = sum(i * distribution[i] for i in range(10))
    return mean_score, distribution

# INTERPRETATION
# Mean: Overall quality prediction
# Std Dev: How polarizing/consistent
# Distribution shape: Technical vs aesthetic issues
```

## LAION-Aesthetics

LAION-5B filtered by aesthetic predictor. **Used to train Stable Diffusion.**

```
SUBSETS
├── aesthetics_6plus: ~600M images, score ≥6
├── aesthetics_5plus: ~1.2B images, score ≥5

THE AESTHETIC PREDICTOR
├── CLIP ViT-L/14 embeddings
├── Simple MLP regression head
├── Trained on SAC (Simulacra Aesthetic Captions)
└── Fast inference, reasonable accuracy
```

```python
def laion_aesthetic_score(image):
    clip_embedding = clip_model.encode_image(image)
    score = aesthetic_mlp(clip_embedding)
    return score  # 1-10 scale
```

## VisualQuality-R1 (2024)

Recent reasoning-augmented quality assessment.

```
KEY INNOVATION
├── Chain-of-thought reasoning about quality
├── Explains WHY an image scores high/low
├── Trained on quality rationales, not just scores
└── Better generalization than pure regression

EVALUATION DIMENSIONS
├── Technical: Sharpness, noise, exposure, color
├── Aesthetic: Composition, lighting, subject
├── Semantic: Meaning, story, emotional impact
└── Contextual: Genre-appropriate quality
```

## Key Papers

- Murray, N. et al. (2012). "AVA: A Large-Scale Database for Aesthetic Visual Analysis"
- Talebi, H. & Milanfar, P. (2018). "NIMA: Neural Image Assessment"
- Schuhmann, C. et al. (2022). "LAION-5B: An open large-scale dataset"
- Wu, Q. et al. (2024). "Q-Instruct: Improving Low-level Visual Abilities"
