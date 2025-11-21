---
title: Skills Documentation
description: Comprehensive documentation for all available skills

sidebar_position: 3
---

# Claude Skills Documentation

## Overview

This repository contains a collection of specialized Claude Skills designed to provide expert-level capabilities across design, research, team building, and project orchestration. These skills make Claude "know better than you" by encoding deep expertise in specific domains.

## Available Skills

### Design & Development Skills

#### 🎨 Web Design Expert
**Location**: `.claude/skills/web-design-expert/SKILL.md`

Creates unique, professionally designed web applications with strong brand identity and modern UI/UX patterns.

#### 📱 Native App Designer
**Location**: `.claude/skills/native-app-designer/SKILL.md`

Creates breathtaking iOS/Mac and web apps with organic, non-AI aesthetic. Expert in SwiftUI, React animations, and human-crafted design.

#### 📚 Design System Creator
**Location**: `.claude/skills/design-system-creator/SKILL.md`

Builds comprehensive design systems with production-ready CSS, design tokens, and component libraries.

### Specialized Technical Skills

#### 🚁 Drone CV Expert
**Location**: `.claude/skills/drone-cv-expert/SKILL.md`

Expert in drone systems, computer vision, and autonomous navigation. Specializes in flight control, SLAM, object detection, and sensor fusion.

#### 🔍 Drone Inspection Specialist
**Location**: `.claude/skills/drone-inspection-specialist/SKILL.md`

Advanced CV for infrastructure inspection including forest fires, roofs, and 3D reconstruction using Gaussian Splatting.

#### 🎮 Metal Shader Expert
**Location**: `.claude/skills/metal-shader-expert/SKILL.md`

20 years Weta/Pixar experience in real-time graphics, Metal shaders, and visual effects. Expert in MSL shaders and GPU optimization.

### Photo Intelligence Skills

#### 🎨 Color Theory & Palette Harmony Expert
**Location**: `.claude/skills/color-theory-palette-harmony-expert/SKILL.md`

Expert in perceptual color science for photo collage composition using earth-mover distance, warm/cool alternation, and diversity-aware palette selection.

**Use Cases**:
- Palette-based photo selection for collages
- Warm/cool color alternation algorithms
- Hue-sorted photo sequences
- Diversity penalties to avoid color monotony

**Key Technologies**: CIEDE2000, Sinkhorn algorithm, Multiscale Sliced Wasserstein Distance (2024), LAB/LCH color spaces

#### 📅 Event Detection & Temporal Intelligence Expert
**Location**: `.claude/skills/event-detection-temporal-intelligence-expert/SKILL.md`

Expert in spatio-temporal clustering and event significance scoring using ST-DBSCAN algorithms.

**Use Cases**:
- Detecting events from photo timestamps and GPS
- Clustering by time, location, and content
- Predicting photo shareability
- Temporal diversity optimization

**Key Technologies**: ST-DBSCAN, DeepDBSCAN, HDBSCAN, event significance scoring

#### 📸 Photo Content Recognition & Curation Expert
**Location**: `.claude/skills/photo-content-recognition-curation-expert/SKILL.md`

Expert in photo content analysis with DINOHash (2025 state-of-the-art), face clustering, and quality filtering.

**Use Cases**:
- Face/animal/place recognition
- Near-duplicate detection
- Burst photo selection
- Screenshot filtering
- Aesthetic quality scoring

**Key Technologies**: DINOHash (2025), Apple Photos clustering, HDBSCAN, perceptual hashing

### Research & Strategy Skills

#### 🔍 Research Analyst
**Location**: `.claude/skills/research-analyst/SKILL.md`

Conducts thorough landscape research, competitive analysis, and methodology evaluation with evidence-based recommendations.

#### 👥 Team Builder
**Location**: `.claude/skills/team-builder/SKILL.md`

Designs high-performing team structures using organizational psychology and personality balancing.

### Health & Personal Growth Skills

#### ❤️ HRV Alexithymia Expert
**Location**: `.claude/skills/hrv-alexithymia-expert/SKILL.md`

Heart rate variability biometrics and emotional awareness training. Expert in HRV analysis and interoception.

#### 🧠 ADHD Design Expert
**Location**: `.claude/skills/adhd-design-expert/SKILL.md`

Neuroscience-backed UX design specifically for ADHD brains, reducing cognitive load and embracing hyperfocus.

#### 🧘 Wisdom & Accountability Coach
**Location**: `.claude/skills/wisdom-accountability-coach/SKILL.md`

Longitudinal memory tracking, philosophy teaching, and personal accountability with compassion.

#### 🚀 Tech Entrepreneur Coach (ADHD)
**Location**: `.claude/skills/tech-entrepreneur-coach-adhd/SKILL.md`

Big tech ML engineer to indie founder transition coach with ADHD-specific strategies.

### Meta Skills

#### 🎭 Orchestrator
**Location**: `.claude/skills/orchestrator/SKILL.md`

Master coordinator that delegates to specialist skills and synthesizes outputs for complex multi-domain problems.

#### 🤖 Agent Creator
**Location**: `.claude/skills/agent-creator/SKILL.md`

Meta-agent for creating new custom agents, skills, and MCP integrations. Expert in agent design and rapid prototyping.

## How to Use These Skills

### Option 1: Direct Use (Manual)
Copy the content of any skill file and paste it into your Claude conversation as a system message or initial context.

### Option 2: Claude Projects (Recommended)
1. Create a new Claude Project
2. Add the relevant skill files to the project knowledge
3. Reference them in conversations as needed

### Option 3: API Integration
Use these as custom instructions in your API calls to Claude.

### Option 4: GitHub Copilot Custom Agents
Place these files in `.github/agents/` directory to make them available as custom agents in GitHub Copilot.

## Skill Combinations

### Complete Web App Creation
```
Orchestrator → coordinates:
  ├─ Research Analyst (trends and best practices)
  ├─ Web Design Expert (brand and visual design)
  ├─ Design System Creator (documentation and CSS)
  └─ Team Builder (implementation team plan)
```

### Design System Development
```
Research Analyst → Web Design Expert → Design System Creator
(research trends) → (create designs) → (document system)
```

### Team Building for Creative Projects
```
Research Analyst + Team Builder
(research best practices) → (design team structure)
```

### Brand Identity Development
```
Research Analyst → Web Design Expert
(competitive analysis) → (unique brand identity)
```

## Best Practices

### 1. Be Specific with Context
Provide details about:
- Target audience
- Project goals and constraints
- Brand personality (if applicable)
- Technical requirements
- Success criteria

### 2. Use Progressive Refinement
Start with broad direction, then iterate:
1. Initial concept/direction
2. Feedback and refinement
3. Final polish and details

### 3. Leverage the Orchestrator
For complex projects, start with the Orchestrator and let it coordinate specialists.

### 4. Request Specific Formats
Be explicit about deliverables:
- "Create a design bible in markdown"
- "Provide CSS in BEM methodology"
- "Format as an executive summary"

### 5. Iterate in Phases
Complete one skill's work before moving to the next for better quality and easier refinement.

## Example Workflows

### Workflow 1: New Product Design

**Step 1 - Research** (Research Analyst):
```
Research current trends in [industry] product design.
What makes designs memorable and effective?
```

**Step 2 - Brand Identity** (Web Design Expert):
```
Using the research insights, create a unique brand 
identity for [product description]. Make it distinctive 
from competitors.
```

**Step 3 - Design System** (Design System Creator):
```
Convert this brand identity into a complete design 
system with design bible and production-ready CSS.
```

**Step 4 - Team Planning** (Team Builder):
```
Design the team needed to implement and maintain 
this design system. Include roles and collaboration 
rituals.
```

### Workflow 2: Quick Brand Identity

**Step 1** (Web Design Expert):
```
Create a brand identity for [brief description].
Include color palette, typography, and design 
principles.
```

**Step 2** (Design System Creator):
```
Take this brand identity and create the CSS 
implementation with design tokens.
```

### Workflow 3: Orchestrated Complete Solution

**Single Step** (Orchestrator):
```
I'm building [product description] from scratch.
Coordinate your specialists to deliver:
- Research on best practices
- Unique brand identity
- Complete design system
- Team composition plan
```

## Understanding Skill Personalities

Each skill has a distinct "personality" and approach:

- **Web Design Expert**: Creative, visionary, brand-focused
- **Design System Creator**: Systematic, thorough, detail-oriented  
- **Research Analyst**: Analytical, evidence-driven, comprehensive
- **Team Builder**: People-focused, strategic, psychology-aware
- **Orchestrator**: Coordinating, synthesizing, big-picture

## Tips for Maximum Effectiveness

### Do's ✅
- Provide clear context and constraints
- Request specific deliverable formats
- Use examples to clarify expectations
- Iterate in phases for better quality
- Leverage the Orchestrator for complexity

### Don'ts ❌
- Don't ask for everything at once
- Don't skip the research phase
- Don't neglect to specify constraints
- Don't mix unrelated requests
- Don't forget to validate outputs

## File Structure

```
some_claude_skills/
├── .claude/
│   └── skills/
│       ├── color-theory-palette-harmony-expert/SKILL.md
│       ├── event-detection-temporal-intelligence-expert/SKILL.md
│       ├── photo-content-recognition-curation-expert/SKILL.md
│       ├── web-design-expert/SKILL.md
│       ├── design-system-creator/SKILL.md
│       ├── native-app-designer/SKILL.md
│       ├── drone-cv-expert/SKILL.md
│       ├── drone-inspection-specialist/SKILL.md
│       ├── metal-shader-expert/SKILL.md
│       ├── research-analyst/SKILL.md
│       ├── team-builder/SKILL.md
│       ├── hrv-alexithymia-expert/SKILL.md
│       ├── adhd-design-expert/SKILL.md
│       ├── wisdom-accountability-coach/SKILL.md
│       ├── tech-entrepreneur-coach-adhd/SKILL.md
│       ├── orchestrator/SKILL.md
│       └── agent-creator/SKILL.md
├── website/                        # Docusaurus documentation site
└── README.md                       # Quick overview
```

## Contributing

These skills are designed to be:
- **Modular**: Each skill is independent
- **Composable**: Skills work together via Orchestrator
- **Extensible**: Easy to add new skills
- **Portable**: Work across Claude platforms

To add a new skill:
1. Create a new markdown file in `.github/agents/`
2. Follow the existing structure and format
3. Define clear mission, competencies, and outputs
4. Update the Orchestrator to include the new skill
5. Add examples to documentation

## Version History

- **v2.0** (2025-11): Added Photo Intelligence Skills
  - Color Theory & Palette Harmony Expert
  - Event Detection & Temporal Intelligence Expert
  - Photo Content Recognition & Curation Expert

- **v1.5** (2025-11): Expanded with specialized technical and personal growth skills
  - Native App Designer
  - Drone CV Expert
  - Drone Inspection Specialist
  - Metal Shader Expert
  - HRV Alexithymia Expert
  - ADHD Design Expert
  - Wisdom & Accountability Coach
  - Tech Entrepreneur Coach (ADHD)
  - Agent Creator

- **v1.0** (2025-11): Initial release with core skills
  - Web Design Expert
  - Design System Creator
  - Research Analyst
  - Team Builder
  - Orchestrator

## License

See LICENSE file for details.

---

*These skills represent a new paradigm: teaching AI not just what to do, but how to think and work like domain experts.*
