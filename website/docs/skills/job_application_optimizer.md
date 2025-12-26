---
id: job_application_optimizer
title: Job Application Optimizer
sidebar_label: Job Application Optimizer
description: Strategic job application planning and Resume SEO optimization. ATS scoring, keyword research, and application campaign strategy.
tags: [job-search, resume-seo, ats-optimization, keyword-research, career, application-strategy]
---

import SkillHeader from '@site/src/components/SkillHeader';

<SkillHeader
  skillName="Job Application Optimizer"
  fileName="job-application-optimizer"
  description={"Strategic job application planning and Resume SEO optimization. Approaches applications like marketing campaigns with market research, opportunity qualification, and content optimization. Activate on 'optimize resume', 'tailor resume', 'ATS optimization', 'job fit score', 'should I apply'. NOT for initial career narratives (career-biographer), portfolio design (cv-creator), or market positioning (competitive-cartographer)."}
  tags={["optimization","job-search","career","strategy","mcp","beginner-friendly"]}
/>

Strategic job application planning and "Resume SEO" optimization. This skill teaches Claude to approach job applications like a marketing campaign.

## When to Use

Activate when you need to:
- Optimize a resume for a specific job posting
- Determine if a job is worth applying to
- Tailor your resume with the right keywords
- Improve ATS (Applicant Tracking System) scores
- Plan a job search campaign strategy

## Core Philosophy: Resume SEO

Just like websites compete for Google rankings, resumes compete for ATS rankings:

| SEO Concept | Resume Equivalent |
|-------------|-------------------|
| Search query | Job description |
| Web page | Resume |
| Keywords | Skills & requirements |
| Meta description | Professional summary |
| H1 heading | Job title/headline |
| Content quality | Achievement metrics |
| Keyword density | Skills frequency (2-4% optimal) |
| Backlinks | Referrals & endorsements |

## Opportunity Qualification

Before optimizing, the skill determines if a job is worth applying:

### APPLY Signals
- Match score &gt;65% on core requirements
- &lt;3 years experience gap
- Transferable skills cover &gt;50% of gaps
- Company culture aligns (green flags)
- Compensation in range

### SKIP Signals
- Match score &lt;50% with hard blockers
- &gt;5 years experience gap
- Required certifications you don't have
- Multiple red flags (rockstar, wear many hats)

## Tailoring Levels

### LIGHT (Match &gt;80%)
**Time: 15 minutes**
- Reorder skills to match job priority
- Add 2-3 missing keywords to summary
- Ensure job title alignment
- Risk: None

### MEDIUM (Match 60-80%)
**Time: 30 minutes**
- Rewrite summary with top keywords
- Add skills section entries
- Emphasize relevant experience bullets
- Risk: Low

### AGGRESSIVE (Match 50-65%)
**Time: 1 hour**
- Complete summary rewrite
- Restructure skills by relevance
- Modify experience bullets with keywords
- Create variant resume
- Risk: Medium (over-optimization possible)

## ATS Optimization Checklist

### Format
- [ ] Single-column layout
- [ ] Standard fonts (Arial, Calibri, Georgia)
- [ ] No tables, columns, text boxes
- [ ] No headers/footers (info gets lost)
- [ ] PDF or DOCX (DOCX preferred for ATS)

### Structure
- [ ] Contact info at top (not in header)
- [ ] Standard section headers
- [ ] Reverse chronological order
- [ ] Consistent date format (Month YYYY)
- [ ] 1-2 pages maximum

### Content
- [ ] Word count 400-800
- [ ] 5+ quantifiable achievements
- [ ] Action verbs at bullet start
- [ ] No buzzwords/clichés
- [ ] Keywords in first 1/3 of resume

### Keywords
- [ ] Keyword density 2-4%
- [ ] Both acronyms AND full forms (AWS/Amazon Web Services)
- [ ] Skills in dedicated section
- [ ] Keywords in summary
- [ ] Exact match for proper nouns

## Tool Integration

Works with the cv-creator-mcp:

```
analyze_job → score_match → suggest_tailoring → score_ats
```

And feeds from career-biographer (CareerProfile) and competitive-cartographer (positioning).

## Example: Alex Chen Workflow

```markdown
## Job: Senior Backend Engineer at TechCorp

### Step 1: Analyze Job
- Required: Go, Kubernetes, PostgreSQL, 5+ years
- Preferred: Kafka, gRPC, AWS
- Signals: Remote-friendly ✓, Equity ✓

### Step 2: Score Match
- Overall: 78/100 (GOOD_MATCH)
- Matched: Go, Kubernetes, PostgreSQL, Kafka, gRPC
- Missing: None critical
- Gap: 0 years (8 &gt; 5 required)

### Step 3: Recommendation
- Apply: YES
- Tailoring Level: LIGHT
- Estimated Time: 15 minutes

### Step 4: Tailoring Actions
1. Reorder skills: Go first, then K8s, PostgreSQL
2. Add to summary: "Specialized in event-driven microservices"
3. Ensure "Senior Backend Engineer" exact match in headline

### Step 5: ATS Check
- Score: 85/100 ✓
- Quick wins: Add AWS certification date

### Step 6: Apply
- Resume: alex-chen-techcorp-v1.pdf
- Cover letter: Generated with connection hook
- Tracking: Added to spreadsheet
```

## Metrics to Track

| Metric | Target | Example |
|--------|--------|---------|
| Applications/week | 20-30 | 25 |
| Response rate | &gt;10% | 16% |
| Interview rate | &gt;5% | 8% |
| Offer rate | &gt;2% | 4% |
| ATS pass rate | &gt;80% | 92% |
| Avg match score | &gt;70% | 78% |

## Common Mistakes

1. **Keyword Stuffing** - &gt;4% density triggers spam filters
2. **Generic Resume** - Same resume for every application
3. **Ignoring ATS** - Pretty resumes that machines can't read
4. **Over-tailoring** - Claims that can't be backed up
5. **Skipping Cover Letter** - Many ATS weight it heavily

## Download

```bash
# Install the skill
mkdir -p .claude/skills/job-application-optimizer
# Copy SKILL.md from the repository
```

## Related Skills

- [Career Biographer](/docs/skills/career_biographer) - Extract career narratives
- [Competitive Cartographer](/docs/skills/competitive_cartographer) - Market positioning
- [CV Creator](/docs/skills/cv_creator) - Generate resumes and portfolios
