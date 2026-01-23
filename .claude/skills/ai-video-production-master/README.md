# AI Video Production Master Guide

## The Complete System for Script-to-Video on a Home Mac

**Target Hardware:** 128GB M4 Max MacBook Pro
**Philosophy:** Maximum quality, minimal cloud cost, full creative control

---

## Table of Contents

1. [The Landscape in 2025](#the-landscape-in-2025)
2. [Architecture Decision: Local vs Cloud Hybrid](#architecture-decision)
3. [Style & Character Consistency](#style-and-character-consistency)
4. [LoRA Fine-Tuning Strategy](#lora-fine-tuning-strategy)
5. [Hiring Artists & Building Datasets](#hiring-artists)
6. [Synthetic Video Elements](#synthetic-video-elements)
7. [Cost Comparison: Self-Hosted vs InVideo](#cost-comparison)
8. [The Complete Pipeline](#the-complete-pipeline)
9. [Scripts & Workflows](#scripts-and-workflows)

---

## The Landscape in 2025

### Tier 1: Cloud APIs (Highest Quality, Highest Cost)
| Service | Best For | Cost | Character Consistency |
|---------|----------|------|----------------------|
| **Runway Gen-4** | Professional filmmaking | ~$0.05/sec | ⭐⭐⭐⭐⭐ Best in class |
| **Kling 2.1** | Realistic motion, lip-sync | ~$0.03/sec | ⭐⭐⭐⭐ |
| **Veo 3.1** | Cinematic polish | Waitlist | ⭐⭐⭐⭐ |
| **Sora** | Long-form narrative | ~$0.05/sec | ⭐⭐⭐ |

### Tier 2: Self-Hosted (Maximum Control, Setup Required)
| Model | Best For | VRAM | Apple Silicon |
|-------|----------|------|---------------|
| **Wan 2.1/2.2** | Style control, I2V | 12-24GB | ✅ Slow but works |
| **LTX Video** | Fast iteration | 8-16GB | ✅ Good |
| **Hunyuan Video** | Quality balance | 24GB+ | ⚠️ Marginal |

### Tier 3: SaaS Platforms (Convenience, Less Control)
| Service | Monthly Cost | Minutes | Per-Minute Cost |
|---------|--------------|---------|-----------------|
| **InVideo Plus** | $20 | 50 | $0.40/min |
| **InVideo Max** | $48 | 200 | $0.24/min |
| **InVideo Gen** | $96 | 400 | $0.24/min |

**Key Insight:** For style-specific work, self-hosted + occasional cloud burst is 3-10x cheaper than SaaS platforms while offering superior creative control.

---

## Architecture Decision

### The Hybrid Approach (Recommended)

```
┌─────────────────────────────────────────────────────────────────┐
│                    YOUR M4 MAX (128GB)                          │
├─────────────────────────────────────────────────────────────────┤
│  LOCAL TASKS (Free, Unlimited)                                  │
│  ├── Image Generation (Flux via ComfyUI)                       │
│  ├── LoRA Training (up to rank 32, small datasets)            │
│  ├── Style Development & Iteration                             │
│  ├── Audio Generation (TTS, Music)                             │
│  ├── Video Composition (FFmpeg)                                │
│  ├── Motion Graphics (Remotion/After Effects)                  │
│  └── Subtitle/Overlay Rendering                                │
├─────────────────────────────────────────────────────────────────┤
│  CLOUD BURST (Pay-per-use)                                     │
│  ├── Video Generation (Wan I2V on RunPod/Vast.ai)             │
│  ├── Large LoRA Training (48GB+ VRAM needed)                  │
│  └── Batch Processing (10+ clips simultaneously)              │
└─────────────────────────────────────────────────────────────────┘
```

### Why This Works

1. **Image generation is fast locally** - Flux on M4 Max: 30-60 sec/image
2. **I2V is slow locally** - Wan 2.1: 15 min/step × 6 steps = 90 min/clip
3. **Cloud I2V is fast** - Wan 2.1 on H100: ~2 min/clip
4. **Cloud is cheap** - Vast.ai H100: $1.87/hr = ~$0.06/clip

### Cost Calculation for a 10-Clip Video

| Approach | Time | Cost |
|----------|------|------|
| **Full Local (M4 Max)** | 15+ hours | $0 (electricity) |
| **Hybrid (local img + cloud I2V)** | 2-3 hours | ~$2-4 |
| **InVideo Max** | 30 min | $48/mo subscription |
| **Runway Gen-4** | 30 min | ~$15-25 |

**Winner:** Hybrid approach at $2-4 per video vs $48+/mo subscription.

---

## Style and Character Consistency

### The Core Problem

Diffusion models have no memory. Each generation is independent. This causes:
- Hair color drift
- Clothing changes
- Face morphing
- Style inconsistency

### Solution Matrix

| Technique | Setup Time | Quality | Best For |
|-----------|-----------|---------|----------|
| **LoRA Training** | 4-8 hours | ⭐⭐⭐⭐⭐ | Your unique style |
| **IPAdapter + FaceID** | 20 min | ⭐⭐⭐⭐ | Consistent faces |
| **Reference Image Workflow** | 5 min | ⭐⭐⭐ | Quick consistency |
| **Prompt Discipline** | 0 min | ⭐⭐ | Basic consistency |

### Recommended Stack for Maximum Consistency

```python
# The "Belt and Suspenders" Approach
CONSISTENCY_STACK = {
    "style": "LoRA (trained on your artistic style)",
    "face": "IPAdapter FaceID Plus",
    "composition": "ControlNet (pose/depth)",
    "prompt": "Structured with locked variables",
    "i2v": "Use keyframe as anchor image",
}
```

### IPAdapter + AnimateDiff Pipeline

Research shows 94% style consistency with this combination vs 68% with AnimateDiff alone.

```
Reference Image → IPAdapter → AnimateDiff → Consistent Animation
                     ↓
              Style Transfer
              (weight: 0.8)
```

### Prompt Discipline Rules

1. **Lock visual descriptors:** Always say "brown trench coat" not "coat"
2. **Fix camera setup:** "50mm lens, low-angle shot, studio lighting"
3. **Use trigger words:** "txcl_style painting" for your LoRA
4. **Repeat key phrases:** Exact same description across all shots

---

## LoRA Fine-Tuning Strategy

### When to Train a LoRA

✅ **Train when:**
- You need a unique artistic style
- You want consistent characters
- You're producing 10+ pieces in the same style
- You have 20-100 high-quality reference images

❌ **Don't train when:**
- One-off projects
- You can achieve results with IPAdapter
- You don't have quality reference images

### Dataset Requirements

| LoRA Type | Images Needed | Quality | Diversity |
|-----------|---------------|---------|-----------|
| **Style** | 50-100 | Very high | Same style, different subjects |
| **Character** | 20-30 | High | Same character, different poses |
| **Concept** | 30-50 | High | Same concept, varied contexts |

### Training Parameters (Flux LoRA)

```yaml
# Conservative start (recommended)
rank: 32
alpha: 32
learning_rate: 1e-4
steps: 1000-2000
batch_size: 1
gradient_accumulation: 4
resolution: 1024

# Memory-constrained (M4 Max)
rank: 16
steps: 1500
use_8bit_adam: true
gradient_checkpointing: true
```

### Where to Train

| Platform | Cost | Speed | VRAM |
|----------|------|-------|------|
| **Local M4 Max** | Free | Slow (8-12hr) | 128GB unified |
| **Vast.ai A100** | ~$1.50/hr | Fast (1-2hr) | 80GB |
| **RunPod H100** | ~$2/hr | Fastest | 80GB |
| **fal.ai** | ~$5-15/train | Managed | N/A |

---

## Hiring Artists

### Why Commission Original Art?

1. **Copyright clarity** - You own it, no legal ambiguity
2. **Unique style** - No one else has this LoRA
3. **Quality control** - Curated dataset, better results
4. **Ethical foundation** - Artist compensated fairly

### Finding Artists

| Platform | Best For | Budget Range |
|----------|----------|--------------|
| **ArtStation** | Professional concept artists | $500-5000+ |
| **Fiverr** | Quick, budget-friendly | $50-500 |
| **Upwork** | Long-term collaboration | $200-2000 |
| **DeviantArt** | Niche styles | $100-1000 |
| **Direct (Twitter/IG)** | Specific artists | Varies |

### Commission Structure

**What to Request:**
```
I'm commissioning [N] illustrations for use as AI training data.

Deliverables:
- [20-50] high-resolution images (2048x2048+ PNG)
- Consistent style across all pieces
- Varied subjects: [list categories]
- Full commercial rights including AI training

Style reference: [attach examples]
Timeline: [X weeks]
Budget: $[Y]

Usage: These images will train a LoRA model for
[personal/commercial] video production.
```

### Contract Essentials

**Must Include:**
1. ✅ Full commercial usage rights
2. ✅ AI/ML training rights explicitly stated
3. ✅ No exclusivity (you can use anywhere)
4. ✅ Artist credit requirements (if any)
5. ✅ Revision policy
6. ✅ Delivery format and resolution

**Sample Clause:**
```
"Client receives perpetual, worldwide, exclusive rights to use
the commissioned works for any purpose, including but not limited
to: training artificial intelligence or machine learning models,
generating derivative works, commercial products, and any future
technologies. Artist retains right to display in portfolio only."
```

### Budget Guidelines

| Project Scale | Images | Budget | Artist Level |
|---------------|--------|--------|--------------|
| **MVP** | 20-30 | $200-500 | Emerging |
| **Production** | 50-100 | $500-2000 | Mid-level |
| **Premium** | 100+ | $2000-10000 | Professional |

---

## Synthetic Video Elements

### The Modern Motion Graphics Stack

#### 2025 Trends

1. **Deep Glow** - Intense light blooms, layered neons
2. **Liquid Motion** - Fluid, morphing typography
3. **3D + 2D Hybrid** - Depth in flat design
4. **Neo Brutalism** - Raw, glitchy, utilitarian
5. **Retro Revival** - 80s/90s grain and neon

### Tools for Different Needs

| Tool | Best For | Learning Curve | Output |
|------|----------|----------------|--------|
| **After Effects** | Professional broadcast | High | Video files |
| **Motion** | macOS-native, quick | Medium | Video files |
| **Remotion** | Code-driven, React devs | Medium | Video/GIF |
| **Rive** | Interactive, web export | Low | Web/Apps |
| **Cavalry** | Procedural animation | Medium | Video files |
| **DaVinci Fusion** | Integrated compositing | High | Video files |

### Remotion for Programmers

```tsx
// Example: Animated title card with metrics
import { useCurrentFrame, interpolate } from 'remotion';

export const TitleCard: React.FC<{title: string}> = ({title}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30], [0, 1]);
  const scale = interpolate(frame, [0, 30], [0.8, 1]);

  return (
    <div style={{
      opacity,
      transform: `scale(${scale})`,
      fontFamily: 'SF Pro Display',
      fontSize: 72,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    }}>
      {title}
    </div>
  );
};
```

### Non-Academic/Business Chart Styles

**Avoid:**
- Default Excel/PowerPoint charts
- Clip art and stock icons
- Generic sans-serif fonts
- White backgrounds with black text

**Embrace:**
- Dark backgrounds with neon accents
- Custom iconography (Phosphor, Heroicons)
- Variable fonts with animated weight
- Gradients and glass effects
- Micro-animations on data points

### Chart Animation Patterns

```
Entry Animations:
├── Stagger reveal (data points appear sequentially)
├── Draw-on (line charts animate along path)
├── Scale-up (bars grow from axis)
└── Morph (smooth transition between states)

Emphasis:
├── Pulse highlight (attention to key data)
├── Glow intensification (important values)
└── Color shift (state change)
```

---

## Cost Comparison

### InVideo AI vs Self-Hosted (Monthly)

**Scenario:** 10 videos/month, 3 minutes each, 10 shots per video

| Component | InVideo Max | Self-Hosted Hybrid |
|-----------|-------------|-------------------|
| Subscription | $48/mo | $0 |
| Cloud GPU (burst) | N/A | ~$20-40/mo |
| Storage | Included | ~$5/mo (local) |
| Total | **$48/mo** | **$25-45/mo** |
| Control | Limited | Full |
| Style Customization | Template-based | Unlimited |
| Character Consistency | Basic | Advanced (LoRA/IPAdapter) |

### Break-Even Analysis

```
InVideo: $48/mo = $576/year
Self-hosted setup: ~$200 one-time (software, plugins)
Self-hosted running: ~$30/mo = $360/year

Year 1: InVideo $576 vs Self-hosted $560
Year 2+: InVideo $576 vs Self-hosted $360

Savings after Year 1: $216/year
```

### When to Use Each

**Use InVideo when:**
- Time is more valuable than money
- Corporate/template style is acceptable
- No custom style requirements
- Quick turnaround needed

**Use Self-Hosted when:**
- Unique artistic style required
- Character consistency critical
- Budget-conscious
- Learning/experimentation phase
- Privacy/data concerns

---

## The Complete Pipeline

### Phase 1: Pre-Production (Local)

```
Script → Shot List → Visual Prompts → Reference Gathering
         ↓
    Style Development (LoRA training if needed)
         ↓
    Audio Production (TTS, music)
```

### Phase 2: Visual Generation (Hybrid)

```
LOCAL: Flux Image Generation
  └── Generate all keyframes
  └── IPAdapter for consistency
  └── ControlNet for composition

CLOUD: Wan 2.1 I2V (on Vast.ai/RunPod)
  └── Batch process all shots
  └── 10 clips × 2 min = 20 min total
  └── Cost: ~$0.60
```

### Phase 3: Post-Production (Local)

```
Motion Graphics Layer (Remotion/AE)
  └── Title cards
  └── Lower thirds
  └── Data visualizations
  └── Transitions

Composition (FFmpeg/DaVinci)
  └── Video assembly
  └── Audio sync
  └── Color grading
  └── Final export
```

### Automation Script

See `scripts/full_pipeline.py` for the complete automated workflow.

---

## Scripts and Workflows

### Available in this skill:

1. **`scripts/cloud_i2v_batch.py`** - Batch I2V on cloud GPUs
2. **`scripts/cost_calculator.py`** - Compare costs across platforms
3. **`scripts/lora_training_cloud.py`** - Train LoRA on Vast.ai
4. **`scripts/motion_graphics_generator.py`** - Programmatic title cards
5. **`workflows/comfyui_i2v_optimized.json`** - Optimized ComfyUI workflow

### Quick Start

```bash
# Calculate costs for your project
python scripts/cost_calculator.py --shots 10 --duration 5

# Generate title cards
python scripts/motion_graphics_generator.py --style "neo-brutalist"

# Batch I2V on cloud
python scripts/cloud_i2v_batch.py --images ./keyframes --provider vastai
```

---

## Sources & Further Reading

### AI Video Generation
- [Runway Gen-4 Character Consistency](https://venturebeat.com/ai/runways-gen-4-ai-solves-the-character-consistency-challenge-making-ai-filmmaking-actually-useful)
- [NVIDIA Video Storyboarding Research](https://research.nvidia.com/labs/par/video_storyboarding/)
- [Wan 2.1 Comparison](https://syntheticlabs.xyz/2025/03/10/wan2-1-ai-video-comparison/)

### LoRA Training
- [Complete Guide to Video LoRAs](https://runpod.ghost.io/complete-guide-to-training-video-loras/)
- [Style Transfer Guide](https://lorastudio.org/style-transfer-guide/)
- [ConsisLoRA Paper](https://arxiv.org/html/2503.10614v1)

### Cloud GPU Pricing
- [Vast.ai Pricing](https://vast.ai/pricing)
- [RunPod Pricing](https://www.runpod.io/pricing)
- [H100 Cloud Comparison](https://intuitionlabs.ai/articles/h100-rental-prices-cloud-comparison)

### Apple Silicon Optimization
- [ComfyUI MLX Extension](https://apatero.com/blog/comfyui-mlx-extension-70-faster-apple-silicon-guide-2025)
- [M4 Max Setup Guide](https://apatero.com/blog/comfyui-mac-m4-max-complete-setup-guide-2025)

### Legal & Ethics
- [Copyright Office AI Training Guidance](https://www.copyright.gov/ai/)
- [Fair Use Analysis](https://www.wiley.law/alert-Copyright-Office-Issues-Key-Guidance-on-Fair-Use-in-Generative-AI-Training)

### Motion Graphics Trends
- [2025 Motion Design Trends](https://elements.envato.com/learn/motion-design-trends)
- [Animation Trends](https://garagefarm.net/blog/16-animation-trends-to-watch-in-2025-key-insights)
