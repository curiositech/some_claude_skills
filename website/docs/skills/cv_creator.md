---
id: cv_creator
title: CV Creator
sidebar_label: CV Creator
description: Professional CV and resume builder that transforms career narratives into ATS-optimized, multi-format resumes. Integrates with career-biographer for structured career data and competitive-cartographer for strategic positioning.
tags: [resume, cv, ats-optimization, career, job-search, pdf-generation, professional-development]
---

import SkillHeader from '@site/src/components/SkillHeader';

<SkillHeader
  skillName="Cv Creator"
  fileName="cv-creator"
  description={"\"Professional CV and resume builder transforming career narratives into ATS-optimized, multi-format resumes. Integrates with career-biographer for data and competitive-cartographer for positioning. Generates PDF, DOCX, LaTeX, JSON Resume, HTML, and Markdown. Activate on 'resume', 'CV', 'ATS optimization', 'job application'. NOT for cover letters, portfolio websites (use web-design-expert), LinkedIn optimization, or interview preparation.\""}
  tags={["creation","career","document","beginner-friendly","production-ready"]}
/>

## 🎉 Production Implementation Available!

**CV Creator is now a complete, production-ready TypeScript application!**

- 📦 **GitHub**: [github.com/erichowens/cv-creator](https://github.com/erichowens/cv-creator)
- ⚡ **Status**: Production-ready (~2,000 LOC)
- ✅ **ATS Score**: 95/100 achieved
- 🚀 **Deploy**: `npm install && npm run example`

Built through multi-skill orchestration (8 skills, 9 phases), this implementation generates:
- ATS-optimized PDF resumes (&lt;5 sec)
- Deploy-ready portfolio websites (&lt;1 sec)
- Detailed validation reports

[View the complete artifact →](/artifacts) documenting the full production journey.

---

## Overview

The **CV Creator** is a specialized AI skill that transforms structured career data and competitive positioning insights into ATS-optimized, professionally formatted resumes. It bridges the gap between rich career narratives (from career-biographer) and strategic positioning (from competitive-cartographer) to produce resumes that pass both automated screening systems and human review.

### Key Features

- **ATS Optimization**: Generates resumes scoring 85+ on ATS compatibility
- **Multi-Format Output**: PDF, DOCX, LaTeX, JSON Resume, HTML, Markdown
- **Strategic Positioning**: Incorporates competitive differentiation insights
- **Role-Specific Tailoring**: Creates optimized variants for different targets
- **2025 Best Practices**: Follows latest resume trends (skills-based, metrics-driven)

### Integration Power

Works seamlessly with:
- **career-biographer**: Structured career data collection
- **competitive-cartographer**: Strategic market positioning

## Quick Start

### Basic Resume Generation

```markdown
User: "Create a resume for senior software engineer roles"

CV Creator:
1. Requests CareerProfile (from biographer or direct input)
2. Requests PositioningStrategy (from cartographer or optional)
3. Requests target role/company (optional for optimization)
4. Generates resume with clean ATS-compatible formatting
5. Calculates ATS score and provides recommendations
6. Exports in requested formats (PDF, DOCX, JSON Resume)
```

### Three-Skill Orchestrated Workflow

```markdown
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

Deliverables:
- resume-faang-senior-backend.pdf
- resume-faang-senior-backend.docx
- resume-faang-senior-backend.json
- ats-analysis-faang-senior-backend.md
```

## Templates

### Modern Minimalist
**Best for:** Software Engineers, Data Scientists, Product Managers
- Clean sans-serif typography (Calibri, Tahoma)
- Single-column layout with generous whitespace
- Clear visual hierarchy
- ATS-optimized structure

### Professional Traditional
**Best for:** Finance, Legal, Senior Executives
- Serif typography (Georgia, Times New Roman)
- Formal, structured layout
- Conservative color palette
- Classic professional appearance

### Creative Hybrid
**Best for:** Design Engineers, UX Researchers
- Modern sans-serif with subtle accent color
- Balanced visual interest with ATS compatibility
- Clean but distinctive styling

### Academic CV
**Best for:** PhD Candidates, Professors, Researchers
- LaTeX-based professional formatting
- Publications and citations sections
- Multi-page support
- Research-focused structure

## ATS Optimization

### Scoring System

The cv-creator calculates ATS scores (0-100) based on:

**Formatting Compliance (30 points):**
- Single-column layout: 10 points
- Standard fonts (Arial, Calibri, Georgia): 10 points
- No graphics/images/tables: 10 points

**Section Structure (20 points):**
- Professional Summary: 5 points
- Core Skills: 5 points
- Work Experience: 5 points
- Education: 5 points

**Content Quality (30 points):**
- Summary length 100-500 chars: 10 points
- Skills section 10-25 items: 10 points
- Experience bullets have metrics: 10 points

**Keyword Optimization (20 points):**
- Job description keyword coverage
- Technical skills alignment
- Industry terminology match

### Recommendations Engine

Get specific, actionable improvements:

```
ATS Score: 87/100

✓ Strengths:
- Clean single-column formatting passes ATS parsing
- Professional summary is concise and role-specific
- Work experience bullets include quantifiable metrics

⚠️ Improvements:
- Add "Terraform" to Core Skills section (mentioned 3x in job description)
- Increase keyword coverage from 75% to 85%
- Consider adding AWS certification to stand out
```

## Resume Content Best Practices

### Professional Summary

**Formula:**
```
[Seniority Level] + [Technical Focus] with [Years] years building [Domain].
[Key Achievement with Metric]. Expertise in [Top 3-5 Skills].
[Current Goal or Target Role].
```

**Example:**
```
Senior Backend Engineer with 8 years building scalable distributed systems.
Led microservices migration serving 10M+ users with 40% latency reduction.
Expertise in Go, Kubernetes, gRPC, and cloud-native architecture.
Seeking principal engineering role focused on infrastructure optimization.
```

### Work Experience Bullets

**Formula:**
```
[Action Verb] + [What you did] + [How/Why] + [Quantifiable Result]
```

**Examples:**
- ✓ Led microservices migration from monolith, reducing API latency by 40% and improving deployment frequency to daily releases
- ✓ Architected event-driven system handling 10M+ DAU using Kubernetes, Go, and gRPC with 99.99% uptime
- ✓ Mentored team of 5 engineers through code reviews, resulting in 50% faster onboarding and 3 promotions

### Core Skills Section

Prioritize 15-20 specific technical skills:

```
Go, Kubernetes, Docker, gRPC, PostgreSQL, Redis, Microservices,
Distributed Systems, AWS, Terraform, CI/CD, System Design,
API Design, Performance Optimization, Monitoring & Observability
```

**Criteria:**
1. Mentioned in job description
2. Highest proficiency level
3. Most years of experience
4. Relevant to target role

## Output Formats

### PDF Resume
- Print-ready, professional appearance
- ATS-compatible single-column layout
- Standard fonts for universal compatibility
- Use: Email applications, job boards, interviews

### DOCX Resume
- Editable in Word, Google Docs, LibreOffice
- Preserves formatting with proper styles
- Use: Recruiter submissions, Word-required applications

### JSON Resume
- Structured data (jsonresume.org schema)
- Version-controllable with git
- Programmatically parseable
- Use: Developer portfolios, personal websites

### HTML Resume
- Responsive web design
- Print stylesheet for PDF generation
- Semantic, accessible markup
- Use: Portfolio websites, GitHub Pages

### Markdown Resume
- Plain text, human-readable
- Version control friendly
- Convertible via Pandoc
- Use: Source of truth, git-based management

## Common Anti-Patterns

### ❌ Creative Resume for Tech Roles
**Problem:** Colorful infographics, skill bars, two-column layout
**Why it's wrong:** ATS can't parse graphics or complex layouts
**Solution:** Use Modern Minimalist template with clean text format

### ❌ Generic Objective Statement
**Problem:** "Seeking a challenging role in a growth-oriented company..."
**Why it's wrong:** Wastes space, provides no value
**Solution:** Use professional summary with specific metrics

### ❌ Listing Every Technology Ever Used
**Problem:** 40+ skills including outdated technologies
**Why it's wrong:** Dilutes expertise, unclear proficiency
**Solution:** List 15-20 most relevant skills for target role

### ❌ Responsibilities Without Outcomes
**Problem:** "Managed a team", "Worked on backend systems"
**Why it's wrong:** Doesn't show impact or value
**Solution:** "Led team of 5 engineers to deliver microservices migration, reducing deployment time by 70%"

## Success Metrics

Well-generated resumes achieve:
- **ATS Score**: 85+ out of 100
- **Keyword Coverage**: 80%+ for job-specific variants
- **Length**: 1-2 pages (strict limit)
- **Parsing Errors**: 0 in ATS simulation
- **Readability**: &lt;30 second recruiter scan time

## When to Use

✅ **Use cv-creator when:**
- Creating resume from career-biographer data
- Optimizing for specific job posting
- Generating multiple resume variants
- Need ATS score and recommendations
- Require multi-format export

❌ **Do NOT use when:**
- Writing cover letters
- Creating portfolio websites
- LinkedIn profile optimization
- Interview preparation
- Career counseling

## Example Transformation

### Before (Generic)

```
John Doe
Software Engineer

Objective:
Seeking a challenging position in software development.

Experience:
- Worked on various backend systems
- Developed new features
- Fixed bugs

Skills:
Programming, Problem Solving, Team Player
```

**ATS Score: 45/100**

### After (CV Creator Optimized)

```
John Doe | john.doe@email.com | linkedin.com/in/johndoe

PROFESSIONAL SUMMARY
Senior Backend Engineer with 7 years building scalable microservices.
Led migration to event-driven systems serving 5M+ users with 99.99% uptime.
Expertise in Go, Kubernetes, PostgreSQL, and distributed systems.

CORE SKILLS
Go, Kubernetes, Docker, PostgreSQL, Redis, Microservices, Event-Driven
Architecture, gRPC, AWS, Terraform, CI/CD, System Design

WORK EXPERIENCE
TechCorp Inc | Senior Backend Engineer | June 2020 - Present
• Led microservices migration from monolith, reducing deployment time
  from 2 hours to 15 minutes and enabling daily releases
• Architected event-driven system processing 500K messages/sec using
  Kafka, Go, and Kubernetes with 99.99% uptime SLA
• Optimized PostgreSQL query performance through indexing, reducing
  average query time from 800ms to 120ms (85% improvement)
```

**ATS Score: 92/100**

## Integration Points

### From Career Biographer

```typescript
interface CareerProfile {
  name: string;
  headline: string;
  summary: string;
  timelineEvents: Array<{
    date: string;
    type: string;
    title: string;
    impact: string;
  }>;
  skills: Array<{
    name: string;
    proficiency: number;
    yearsOfExperience: number;
  }>;
}
```

### From Competitive Cartographer

```typescript
interface PositioningStrategy {
  positioning: {
    headline: string;
    differentiators: string[];
  };
  contentStrategy: {
    tone: string;
    depth: string;
  };
}
```

## Troubleshooting

### Low ATS Score (&lt;70)
**Causes:** Complex formatting, graphics, non-standard fonts
**Fix:** Switch to Minimalist template, remove all graphics, use standard headers

### Low Keyword Coverage (&lt;60%)
**Causes:** Not tailoring to job description, different terminology
**Fix:** Extract keywords from posting, add to Core Skills, use exact job description language

### Resume &gt;2 Pages
**Causes:** Including every role, too many bullets, verbose
**Fix:** Consolidate older roles, limit bullets \(7-10 recent, 3-5 older\), trim to 1-2 lines each

### Generic Professional Summary
**Causes:** Template language, no specific achievements
**Fix:** Include specific metric, name exact technologies, state clear career goal

## Related Skills

- **career-biographer**: Provides structured career data
- **competitive-cartographer**: Provides strategic positioning
- **web-design-expert**: Convert resume to portfolio site
- **typography-expert**: Font selection and visual hierarchy

## Learn More

- [Career Biographer Skill](/docs/skills/career_biographer)
- [Competitive Cartographer Skill](/docs/skills/competitive_cartographer)
- [JSON Resume Standard](https://jsonresume.org/)

---

**Skill Type**: Career Tools
**Complexity**: Intermediate
**Integration**: career-biographer, competitive-cartographer
**Output Formats**: PDF, DOCX, JSON Resume, HTML, Markdown, LaTeX
