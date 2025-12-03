---
title: Analysis Scripts
sidebar_label: Analysis Scripts
sidebar_position: 1
---
# Analysis Scripts

Python implementations for photo critique.

## Multi-Model Ensemble Scorer

```python
#!/usr/bin/env python3
"""
photo_critic.py - Multi-model image aesthetic analysis
Requires: torch, transformers, clip, pillow
"""

import torch
import clip
from PIL import Image
from pathlib import Path

class PhotoCritic:
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self._load_models()

    def _load_models(self):
        # CLIP for embeddings
        self.clip_model, self.clip_preprocess = clip.load("ViT-L/14", self.device)
        # LAION aesthetic predictor (simple MLP)
        self.aesthetic_model = self._load_aesthetic_mlp()
        # NIMA model
        self.nima_model = self._load_nima()

    def analyze(self, image_path: str) -> dict:
        """Full aesthetic analysis of an image."""
        img = Image.open(image_path).convert("RGB")

        results = {
            "laion_aesthetic": self._laion_score(img),
            "nima_technical": self._nima_score(img, "technical"),
            "nima_aesthetic": self._nima_score(img, "aesthetic"),
            "composition": self._analyze_composition(img),
            "color_harmony": self._analyze_color(img),
            "technical_quality": self._analyze_technical(img),
        }

        results["overall"] = self._compute_overall(results)
        results["critique"] = self._generate_critique(results)

        return results

    def _analyze_composition(self, img) -> dict:
        """Rule of thirds, golden ratio, visual weight analysis."""
        import numpy as np

        arr = np.array(img.convert("L"))

        # Find visual weight center (centroid of intensity)
        y_coords, x_coords = np.mgrid[0:arr.shape[0], 0:arr.shape[1]]
        total = arr.sum()
        center_y = (y_coords * arr).sum() / total
        center_x = (x_coords * arr).sum() / total

        # Normalize to 0-1
        norm_y = center_y / arr.shape[0]
        norm_x = center_x / arr.shape[1]

        # Distance from rule of thirds intersections
        thirds_points = [(1/3, 1/3), (2/3, 1/3), (1/3, 2/3), (2/3, 2/3)]
        min_thirds_dist = min(
            ((norm_x - px)**2 + (norm_y - py)**2)**0.5
            for px, py in thirds_points
        )

        # Golden ratio analysis
        phi = 0.618
        golden_points = [(phi, phi), (1-phi, phi), (phi, 1-phi), (1-phi, 1-phi)]
        min_golden_dist = min(
            ((norm_x - px)**2 + (norm_y - py)**2)**0.5
            for px, py in golden_points
        )

        return {
            "visual_center": (norm_x, norm_y),
            "thirds_alignment": max(0, 1 - min_thirds_dist * 3),
            "golden_alignment": max(0, 1 - min_golden_dist * 3),
            "balance": 1 - abs(norm_x - 0.5) - abs(norm_y - 0.5)
        }

    def _generate_critique(self, results: dict) -> str:
        """Generate human-readable critique from analysis."""
        critique_parts = []

        # Overall impression
        overall = results["overall"]
        if overall >= 8:
            critique_parts.append("Exceptional image with professional-level execution.")
        elif overall >= 6.5:
            critique_parts.append("Strong image with good technical and aesthetic qualities.")
        elif overall >= 5:
            critique_parts.append("Competent image with room for improvement.")
        else:
            critique_parts.append("Image needs significant work on fundamentals.")

        # Composition feedback
        comp = results["composition"]
        if comp["thirds_alignment"] > 0.7:
            critique_parts.append("Strong rule-of-thirds placement.")
        elif comp["golden_alignment"] > 0.7:
            critique_parts.append("Nice golden ratio composition.")
        elif comp["balance"] < 0.3:
            critique_parts.append("Consider rebalancing - visual weight is off-center.")

        # Color feedback
        color = results["color_harmony"]
        critique_parts.append(f"Color scheme: {color['harmony_type']} "
                            f"(harmony score: {color['score']:.2f})")

        return " ".join(critique_parts)
```

## MCP Server for Photo Critique

```python
#!/usr/bin/env python3
"""
photo_critic_mcp.py - MCP server for photo composition analysis
"""

from mcp.server import Server
from mcp.types import Tool, TextContent
import asyncio

app = Server("photo-critic")

@app.tool()
async def analyze_composition(image_path: str) -> str:
    """Analyze image composition using ML models and classical theory."""
    from photo_critic import PhotoCritic

    critic = PhotoCritic()
    results = critic.analyze(image_path)

    return f"""
## Aesthetic Analysis Results

**Overall Score: {results['overall']:.1f}/10**

### Model Scores
- LAION Aesthetic: {results['laion_aesthetic']:.2f}
- NIMA Technical: {results['nima_technical']:.2f}
- NIMA Aesthetic: {results['nima_aesthetic']:.2f}

### Composition Analysis
- Rule of Thirds Alignment: {results['composition']['thirds_alignment']:.0%}
- Golden Ratio Alignment: {results['composition']['golden_alignment']:.0%}
- Visual Balance: {results['composition']['balance']:.0%}

### Color Analysis
- Harmony Type: {results['color_harmony']['harmony_type']}
- Harmony Score: {results['color_harmony']['score']:.2f}

### Critique
{results['critique']}
"""

@app.tool()
async def compare_crops(image_path: str, crops: list[dict]) -> str:
    """Compare multiple crop options for an image.

    crops: List of {x, y, width, height} dicts defining crop regions
    """
    from photo_critic import PhotoCritic
    from PIL import Image

    critic = PhotoCritic()
    img = Image.open(image_path)

    results = []
    for i, crop in enumerate(crops):
        cropped = img.crop((
            crop['x'], crop['y'],
            crop['x'] + crop['width'],
            crop['y'] + crop['height']
        ))
        temp_path = f"/tmp/crop_{i}.jpg"
        cropped.save(temp_path)
        score = critic.analyze(temp_path)['overall']
        results.append((i, score, crop))

    results.sort(key=lambda x: x[1], reverse=True)

    output = "## Crop Comparison\n\n"
    for rank, (idx, score, crop) in enumerate(results, 1):
        output += f"{rank}. Crop {idx}: **{score:.1f}/10** "
        output += f"({crop['width']}x{crop['height']} at {crop['x']},{crop['y']})\n"

    return output

if __name__ == "__main__":
    asyncio.run(app.run())
```
