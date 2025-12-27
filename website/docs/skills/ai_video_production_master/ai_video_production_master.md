---
sidebar_label: Ai Video Production Master
sidebar_position: 1
---

# 🤖 Ai Video Production Master

Expert in script-to-video production pipelines for Apple Silicon Macs. Specializes in hybrid local/cloud workflows, LoRA training for character consistency, motion graphics generation, and artist commissioning. Activate on 'AI video production', 'script to video', 'video generation pipeline', 'character consistency', 'LoRA training', 'cloud GPU', 'motion graphics', 'Wan I2V', 'InVideo alternative'. NOT for real-time video editing, video compositing (use DaVinci/Premiere), audio production, or 3D modeling (use Blender/Maya).

---

## Allowed Tools

```
Read, Write, Edit, Bash(python:*, ffmpeg:*, npm:*), WebFetch, mcp__firecrawl__firecrawl_search
```

## Tags

`video` `ai-generation` `lora` `cloud-gpu` `motion-graphics` `comfyui`

## 🤝 Pairs Great With

- **[Sound Engineer](/docs/skills/sound_engineer)**: Audio for AI-generated videos
- **[Voice Audio Engineer](/docs/skills/voice_audio_engineer)**: Voice synthesis for narration

# AI Video Production Master

Expert in script-to-video production pipelines for Apple Silicon Macs. Specializes in:
- Hybrid local/cloud workflows for cost optimization
- Style and character consistency (LoRA, IPAdapter, prompt discipline)
- Motion graphics and synthetic elements (title cards, data viz, lower thirds)
- Artist commissioning for training datasets
- Cloud GPU orchestration (Vast.ai, RunPod)

## When to Use This Skill

Activate on:
- "AI video production"
- "script to video"
- "video generation pipeline"
- "character consistency"
- "LoRA training for video"
- "cloud GPU for video"
- "motion graphics"
- "hire artist for AI training"
- "InVideo alternative"
- "Wan I2V"

## Key Capabilities

### 1. Cost Optimization
Compare and recommend the optimal mix of local (M4 Max) vs cloud (H100/A100) processing:
```bash
python scripts/cost_calculator.py --shots 10 --duration 5
```

### 2. Cloud Batch Processing
Run I2V generation on cloud GPUs for 50x speedup:
```bash
python scripts/cloud_i2v_batch.py --images ./keyframes --provider vastai
```

### 3. Motion Graphics Generation
Create professional title cards, lower thirds, and data visualizations:
```bash
python scripts/motion_graphics_generator.py --type title --style deep_glow --title "Your Title"
```

### 4. Style Consistency
Provide guidance on:
- LoRA training parameters (rank, alpha, learning rate, steps)
- IPAdapter + FaceID for character consistency
- Prompt discipline and trigger words
- Reference image workflows

### 5. Artist Commissioning
Templates and guidance for:
- Finding artists (ArtStation, Fiverr, Upwork)
- Structuring commission requests
- AI training rights contracts
- Quality control and review processes

## Files in This Skill

```
ai-video-production-master/
├── README.md                          # Comprehensive guide
├── SKILL.md                           # This file
├── scripts/
│   ├── cost_calculator.py             # Cost comparison tool
│   ├── cloud_i2v_batch.py             # Cloud batch I2V
│   └── motion_graphics_generator.py   # Title cards, lower thirds
├── workflows/
│   └── comfyui_i2v_optimized.json     # Optimized ComfyUI workflow
└── docs/
    ├── ARTIST_COMMISSIONING_GUIDE.md  # Hiring artists
    └── contracts/
        └── artist_commission_template.md  # Contract template
```

## Quick Reference

### Cost Comparison (10-shot video)
| Approach | Time | Cost |
|----------|------|------|
| Full Local (M4 Max) | 15+ hours | $0 |
| Hybrid (local img + cloud I2V) | 2-3 hours | ~$2-4 |
| InVideo Max | 30 min | $48/mo |
| Runway Gen-4 | 30 min | ~$15-25 |

### Cloud GPU Pricing
| Provider | GPU | $/hr | I2V Time/Clip |
|----------|-----|------|---------------|
| Vast.ai | H100 80GB | $1.87 | ~2 min |
| RunPod | H100 80GB | $1.99 | ~2 min |
| RunPod | A100 80GB | $1.74 | ~3 min |
| Lambda | H100 | $2.99 | ~2 min |

### Motion Graphics Styles
- `neo_brutalist` - Raw, glitchy, utilitarian
- `deep_glow` - Intense light blooms, layered neons
- `liquid_motion` - Fluid, morphing typography
- `retro_revival` - 80s/90s grain and neon
- `glass_morphism` - Frosted glass, depth layers

## Dependencies

Python packages:
- httpx (for cloud API calls)
- argparse, json, subprocess (stdlib)

External tools:
- FFmpeg (video encoding)
- rsvg-convert or ImageMagick (SVG to PNG)
- ComfyUI (local generation)

## NOT for

- Real-time video editing
- Video effects/compositing (use DaVinci/Premiere)
- Audio production (use dedicated audio tools)
- 3D modeling/animation (use Blender/Maya)
