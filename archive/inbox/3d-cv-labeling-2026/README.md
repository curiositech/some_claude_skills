# 3D Computer Vision Labeling Expert (2026)

Expert skill for 3D annotation tools, AI-assisted labeling workflows, and training architectures for LiDAR/point cloud computer vision.

## Quick Start

Activate this skill by mentioning:
- "3D labeling", "point cloud annotation", "LiDAR labeling"
- "SAM 3D", "SAM4D", "Point-SAM"
- "sensor fusion annotation", "3D bounding box"
- "semantic segmentation point cloud"

## What This Skill Covers

### 2026 Tool Landscape
- **Commercial**: BasicAI, Supervisely, Segments.ai, Deepen AI, Dataloop, Encord, Ango Hub
- **Open Source**: CVAT, 3D BAT, Label Studio (partial 3D)

### SAM Evolution for 3D
- **SAM4D** (ICCV 2025): Multi-modal camera + LiDAR with UMPE alignment
- **Point-SAM** (ICLR 2025): Native 3D point cloud segmentation
- **SAMNet++**: Hybrid SAM + PointNet++ pipeline

### Key Expertise Areas
- Human-in-the-loop annotation pipelines
- Model-in-the-loop paradigm (AI assists, human validates)
- VLM vs specialized training trade-offs
- Vertical-specific architectures (AV, infrastructure, agriculture, wildfire)

## When to Use

✅ **Use for**:
- Selecting 3D point cloud annotation tools
- Implementing SAM4D/Point-SAM workflows
- Designing human-in-the-loop annotation pipelines
- Training architecture decisions

❌ **NOT for**:
- 2D image labeling without 3D
- General ML model training
- Video annotation without point clouds
- VLM prompt engineering

## References

| File | Topic |
|------|-------|
| `references/sam4d-architecture.md` | UMPE and data engine deep dive |
| `references/tool-comparison-matrix.md` | Feature and pricing comparison |

## Key Sources

- [SAM4D: Segment Anything in Camera and LiDAR Streams](https://sam4d-project.github.io/) (ICCV 2025)
- [Point-SAM: Promptable 3D Segmentation Model](https://point-sam.github.io/) (ICLR 2025)
- [Segments.ai: 8 Best Point Cloud Labeling Tools](https://segments.ai/blog/the-8-best-point-cloud-labeling-tools/)
- [Vision-Language Models in Autonomous Driving Survey](https://arxiv.org/html/2310.14414v2)

## Installation

Copy this skill to your `.claude/skills/` directory:

```bash
cp -r 3d-cv-labeling-2026 ~/.claude/skills/
```

## Version

- **v1.0.0** (2026-01-22): Initial release
