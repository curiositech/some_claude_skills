# Claude Skills Documentation

## Overview

This repository contains a collection of specialized Claude Skills designed to provide expert-level capabilities across design, research, team building, and project orchestration. These skills make Claude "know better than you" by encoding deep expertise in specific domains.

## Available Skills

### 🎨 Web Design Expert
**Location**: `.github/agents/web_design_expert.md`

Creates unique, professionally designed web applications with strong brand identity. Goes beyond generic templates to create distinctive designs that feel crafted by a top-tier design agency.

**Use Cases**:
- Developing brand identity and personality
- Creating unique visual designs
- Ensuring accessibility compliance
- Selecting typography and color palettes
- Modern UI/UX patterns

**Example Prompt**:
```
I need a web app for a meditation and wellness startup. 
Create a unique brand identity that feels calming but 
professional, not cliché.
```

### 📚 Design System Creator
**Location**: `.github/agents/design_system_creator.md`

Builds comprehensive design systems and "design bibles" that serve as the single source of truth for product design and development. Creates production-ready CSS architecture.

**Use Cases**:
- Creating design tokens and component libraries
- Writing comprehensive design documentation
- Building CSS architecture (BEM, OOCSS, etc.)
- Establishing design patterns and guidelines
- Ensuring consistency across products

**Example Prompt**:
```
Take the brand identity and create a complete design 
system with design tokens, component library, and 
production-ready CSS following modern best practices.
```

### 🔍 Research Analyst
**Location**: `.github/agents/research_analyst.md`

Conducts thorough landscape research, competitive analysis, and methodology evaluation. Provides evidence-based insights and recommendations.

**Use Cases**:
- Market and competitive research
- Best practices identification
- Technology evaluation and comparison
- Trend analysis and forecasting
- Strategic recommendations

**Example Prompt**:
```
Research the current landscape of design systems in 
SaaS products. What are the emerging trends? What 
do the best teams do differently?
```

### 👥 Team Builder & Organizational Psychologist
**Location**: `.github/agents/team_builder.md`

Designs high-performing team structures using organizational psychology principles. Creates teams with complementary personalities that naturally produce greatness.

**Use Cases**:
- Team composition and role design
- Personality balancing (MBTI, Big Five, etc.)
- Collaboration ritual design
- Organizational structure planning
- Building psychological safety

**Example Prompt**:
```
Design the ideal team to build and maintain a 
design-forward SaaS product. Include roles, 
personality types, and collaboration rituals.
```

### 🎭 Orchestrator - Pluripotent Meta-Skill
**Location**: `.github/agents/orchestrator.md`

Master coordinator that intelligently delegates to specialist skills and synthesizes their outputs. The "conductor" that makes all other skills work together harmoniously.

**Use Cases**:
- Complex multi-domain problems
- Coordinating multiple specialists
- Ensuring consistency across outputs
- Breaking down complex requests
- Synthesizing integrated solutions

**Example Prompt**:
```
I need to build a completely new web application from 
scratch. I want unique design, a solid design system, 
and a team plan. Coordinate all your specialists.
```

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
├── .github/
│   └── agents/
│       ├── web_design_expert.md
│       ├── design_system_creator.md
│       ├── research_analyst.md
│       ├── team_builder.md
│       └── orchestrator.md
├── CLAUDE_SKILLS_GUIDE.md          # Educational guide
├── SKILLS_DOCUMENTATION.md         # This file
├── EXAMPLES.md                     # Detailed examples
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

- **v1.0** (2025-11): Initial release with 5 core skills
  - Web Design Expert
  - Design System Creator
  - Research Analyst
  - Team Builder
  - Orchestrator

## License

See LICENSE file for details.

---

*These skills represent a new paradigm: teaching AI not just what to do, but how to think and work like domain experts.*
