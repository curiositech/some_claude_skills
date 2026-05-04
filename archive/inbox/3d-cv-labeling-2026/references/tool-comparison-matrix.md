# 3D Point Cloud Annotation Tool Comparison (2026)

## Feature Matrix

| Feature | BasicAI | Supervisely | Segments.ai | Deepen AI | Dataloop | CVAT | Label Studio |
|---------|---------|-------------|-------------|-----------|----------|------|--------------|
| **3D Bounding Boxes** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ Partial |
| **3D Semantic Seg** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Instance Seg** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Sensor Fusion** | ✅ | ✅ | ✅ | ✅✅ | ✅ | ⚠️ | ❌ |
| **Sequential/Video** | ✅ | ✅ | ✅✅ | ✅ | ✅ | ⚠️ | ❌ |
| **AI Pre-labeling** | ✅✅ | ✅ | ✅ | ✅ | ✅✅ | ❌ | ⚠️ |
| **Frame Propagation** | ✅ | ✅ | ✅✅ | ✅ | ✅ | ⚠️ | ❌ |
| **Track-ID Mgmt** | ✅ | ✅ | ✅✅ | ✅ | ✅ | ⚠️ | ❌ |
| **Enterprise QA** | ✅ | ⚠️ | ⚠️ | ✅ | ✅✅ | ❌ | ❌ |
| **Self-Hosted** | ❌ | ✅ | ❌ | ❌ | ⚠️ | ✅✅ | ✅✅ |
| **API/SDK** | ✅ | ✅ | ✅ | ✅ | ✅✅ | ✅ | ✅ |

Legend: ✅✅ = Excellent, ✅ = Good, ⚠️ = Limited, ❌ = Not Available

## Pricing Tiers (2026 Estimates)

| Tool | Free Tier | Pro/Team | Enterprise |
|------|-----------|----------|------------|
| **BasicAI** | 1k points | $49/mo | Custom |
| **Supervisely** | Community | $90/user/mo | Custom |
| **Segments.ai** | 10k points | $99/mo | Custom |
| **Deepen AI** | Trial | Contact | Contact |
| **Dataloop** | Trial | Contact | Contact |
| **CVAT** | Free (OSS) | Cloud hosted | Self-hosted |
| **Label Studio** | Free (OSS) | $600/user/yr | Enterprise |

## Use Case Recommendations

### Autonomous Driving (High Volume)
**Primary**: BasicAI or Deepen AI
**Why**: Pre-trained AV models, high throughput, sensor calibration

### Robotics R&D (Flexibility)
**Primary**: Segments.ai or Supervisely
**Why**: Developer-friendly, 2D+3D sync, rapid iteration

### Enterprise (Workflow + Compliance)
**Primary**: Dataloop or Encord
**Why**: Full MLOps, audit trails, team management

### Budget-Conscious / Academic
**Primary**: CVAT + 3D plugins
**Why**: Free, self-hosted, customizable

### Multi-Modal Projects
**Primary**: Ango Hub (iMerit)
**Why**: Dense annotation, frame propagation, multiple sensor types

## Integration Capabilities

| Tool | S3/GCS | Webhooks | Python SDK | REST API | MLOps |
|------|--------|----------|------------|----------|-------|
| BasicAI | ✅ | ✅ | ✅ | ✅ | ⚠️ |
| Supervisely | ✅ | ✅ | ✅✅ | ✅ | ✅ |
| Segments.ai | ✅ | ✅ | ✅ | ✅ | ⚠️ |
| Deepen AI | ✅ | ✅ | ✅ | ✅ | ⚠️ |
| Dataloop | ✅ | ✅ | ✅✅ | ✅ | ✅✅ |
| CVAT | ✅ | ⚠️ | ✅ | ✅ | ❌ |
| Label Studio | ✅ | ✅ | ✅ | ✅ | ⚠️ |

## Performance Benchmarks (Anecdotal)

### Point Cloud Size Handling

| Tool | 1M points | 10M points | 100M points |
|------|-----------|------------|-------------|
| BasicAI | Smooth | Good | Chunked |
| Supervisely | Smooth | Good | Good |
| Segments.ai | Smooth | Good | Chunked |
| CVAT | Good | Slow | Not recommended |

### Annotation Speed (Expert User, Cuboids)

| Tool | Frames/Hour (Manual) | Frames/Hour (AI-Assisted) |
|------|----------------------|---------------------------|
| BasicAI | 20-30 | 100-150 |
| Supervisely | 25-35 | 80-120 |
| Segments.ai | 25-40 | 90-130 |
| CVAT | 15-25 | N/A |
