---
title: Interfaces & Integration Workflows
sidebar_label: Interfaces & Integration Wo...
sidebar_position: 2
---
# Interfaces & Integration Workflows

TypeScript interfaces and multi-skill integration patterns.

## CareerProfile Interface (from career-biographer)

```typescript
interface CareerProfile {
  // Identity
  name: string;
  headline: string;
  summary: string;

  // Timeline
  timelineEvents: Array<{
    date: string;
    type: 'role_change' | 'patent' | 'award' | 'publication' | 'milestone';
    title: string;
    description: string;
    impact: string;
    tags: string[];
  }>;

  // Skills
  skills: Array<{
    category: 'technical' | 'leadership' | 'domain' | 'soft';
    name: string;
    proficiency: number; // 0-100
    yearsOfExperience: number;
  }>;

  // Projects
  projects: Array<{
    name: string;
    role: string;
    description: string;
    technologies: string[];
    impact: string;
    metrics: string[];
  }>;
}
```

## PositioningStrategy Interface (from competitive-cartographer)

```typescript
interface PositioningStrategy {
  positioning: {
    headline: string;
    differentiators: string[];
    messaging: string;
  };

  contentStrategy: {
    tone: string;
    depth: string;
  };
}
```

## Three-Skill Orchestrated Workflow

```
User: "I need a resume for FAANG senior backend engineer roles"

Step 1: career-biographer
→ Conducts empathetic interview
→ Extracts structured CareerProfile
→ Documents achievements, skills, timeline

Step 2: competitive-cartographer
→ Maps FAANG senior backend landscape
→ Identifies white space and differentiators
→ Generates PositioningStrategy

Step 3: cv-creator
→ Combines CareerProfile + PositioningStrategy
→ Generates ATS-optimized resume
→ Tailors for FAANG technical expectations
→ Outputs multi-format files

Deliverables:
- resume-faang-senior-backend.pdf
- resume-faang-senior-backend.docx
- resume-faang-senior-backend.json
- ats-analysis-faang-senior-backend.md
```

## Standalone Quick Optimization

```
User: "Optimize my resume for this job posting: [URL]"

cv-creator:
1. Fetch job description from URL
2. Extract required keywords and skills
3. Load existing resume (or request CareerProfile)
4. Reorder and emphasize relevant experience
5. Add missing keywords to Core Skills
6. Generate optimized variant
7. Calculate new ATS score
8. Provide recommendations

Output:
- resume-optimized-company-role.pdf
- ATS Score: 89/100 (↑12 points)
- Keyword Coverage: 85% (↑20%)
```

## Integration Partners

| Skill | Integration Purpose |
|-------|-------------------|
| **career-biographer** | Primary data source for resume content |
| **competitive-cartographer** | Strategic positioning for differentiation |
| **web-design-expert** | Convert resume to portfolio website |
| **typography-expert** | Font selection and visual hierarchy |
| **research-analyst** | Research target company for tailoring |

## Production Implementation

**GitHub**: [github.com/curiositech/cv-creator](https://github.com/curiositech/cv-creator)
- Status: Production-ready (~2,000 LOC)
- ATS Score: 95/100 achieved
- Deploy: `npm install && npm run example`

Built through multi-skill orchestration (8 skills, 9 phases):
- ATS-optimized PDF resumes (&lt;5 sec)
- Deploy-ready portfolio websites (&lt;1 sec)
- Detailed validation reports
