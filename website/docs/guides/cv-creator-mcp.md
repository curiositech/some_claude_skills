---
sidebar_position: 4
title: CV Creator MCP
description: Resume SEO - ATS scoring, keyword optimization, and job matching powered by AI
---

# CV Creator MCP

Your resume, optimized like a search engine result.

## The Problem

Getting past Applicant Tracking Systems (ATS) is the biggest hurdle in modern job hunting:

- **99% of Fortune 500 companies** use ATS to screen resumes
- **75% of resumes** are rejected before a human sees them
- **Keyword matching** is the primary filter

Existing solutions like Jobscan ($49.95/mo) and Resume Worded ($49/mo) charge subscription fees for what should be a one-time optimization.

## The Solution

CV Creator MCP brings **enterprise-grade resume optimization** directly to Claude, implementing "Resume SEO" principles:

| SEO Concept | Resume Equivalent |
|-------------|-------------------|
| Search query | Job description |
| Web page | Resume |
| Keywords | Skills & requirements |
| Meta description | Professional summary |
| Keyword density | Skills frequency (2-4% optimal) |

## Installation

```bash
# Clone and build
git clone https://github.com/curiositech/cv-creator-mcp
cd cv-creator-mcp
npm install
npm run build

# Add to Claude Desktop config
```

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "cv-creator": {
      "command": "node",
      "args": ["/path/to/cv-creator-mcp/dist/index.js"]
    }
  }
}
```

## Tools

### analyze_job

Parse job descriptions to extract optimization data.

```typescript
const analysis = await analyze_job({
  title: "Senior Backend Engineer",
  company: "TechCorp",
  description: jobDescriptionText
});

// Returns:
// - keywords: { required, preferred, inferred }
// - skills: { technical, domain, soft }
// - requirements: { yearsOfExperience, education, certifications }
// - signals: { positive, negative } (culture red/green flags)
// - atsHints: { exactMatchImportant, synonymsAcceptable }
```

### score_match

Calculate how well a candidate matches a job.

```typescript
const score = await score_match({
  profile: careerProfile,  // From career-biographer
  jobAnalysis: analysis
});

// Returns:
// - overall: 78 (0-100)
// - recommendation: 'GOOD_MATCH' | 'STRONG_MATCH' | 'FAIR_MATCH' | 'WEAK_MATCH' | 'SKIP'
// - tailoringLevel: 'LIGHT' | 'MEDIUM' | 'AGGRESSIVE'
// - missing: { critical, important, nice } keywords
```

### score_ats

Comprehensive ATS compatibility check.

```typescript
const atsScore = await score_ats({
  profile: careerProfile,
  resumeText: plainTextResume,
  targetKeywords: analysis.keywords.required.primary
});

// Returns:
// - overall: 85 (0-100)
// - passed: true (&gt;75 typically passes)
// - sections: { formatting, structure, content, keywords }
// - keywordAnalysis: { density, overOptimized, underOptimized }
// - quickWins: ["Add missing keyword X to summary"]
```

### suggest_tailoring

Generate specific tailoring recommendations.

```typescript
const tailoring = await suggest_tailoring({
  profile: careerProfile,
  matchScore: score,
  jobAnalysis: analysis,
  level: 'MEDIUM'
});

// Returns:
// - changes: { summary, skills, experience, keywords }
// - risks: { overTailoring, inconsistency, credibility }
```

### generate_variants

Create A/B test resume variants.

```typescript
const variants = await generate_variants({
  profile: careerProfile,
  jobAnalysis: analysis,
  strategies: ['technical', 'leadership', 'impact']
});

// Returns 3 variants with different emphases
```

### generate_cover_letter

Create tailored cover letter.

```typescript
const letter = await generate_cover_letter({
  profile: careerProfile,
  jobAnalysis: analysis,
  matchScore: score,
  tone: 'confident',
  connectionHook: 'Referred by Jane Smith'
});
```

## Example: Alex Chen

Let's walk through a complete optimization for Alex Chen, a Senior Backend Engineer.

### Step 1: Analyze the Job

```
Job: Senior Backend Engineer at TechCorp

We're looking for a Senior Backend Engineer with 5+ years of experience
in building scalable distributed systems. You'll work with Go, Kubernetes,
and PostgreSQL to architect microservices handling millions of requests.

Requirements:
- 5+ years backend development experience
- Proficiency in Go or similar systems language
- Experience with Kubernetes and container orchestration
- Strong PostgreSQL skills
- Kafka or similar message queuing experience preferred
```

**Analysis Result:**

```json
{
  "keywords": {
    "required": {
      "primary": ["Go", "Kubernetes", "PostgreSQL", "distributed systems", "microservices"],
      "secondary": ["5+ years", "backend development", "container orchestration"]
    },
    "preferred": {
      "primary": ["Kafka", "message queuing"]
    }
  },
  "requirements": {
    "yearsOfExperience": 5,
    "education": [],
    "certifications": []
  },
  "signals": {
    "positive": ["scalable", "millions of requests"],
    "negative": []
  }
}
```

### Step 2: Score Match

**Alex Chen's Profile:**
- 8 years experience ✓
- Go, Kubernetes, PostgreSQL ✓
- Kafka, gRPC, Redis ✓
- AWS Certified ✓

**Match Result:**

```json
{
  "overall": 85,
  "breakdown": {
    "keywords": 90,
    "experience": 100,
    "skills": 80,
    "education": 85
  },
  "recommendation": "STRONG_MATCH",
  "tailoringLevel": "LIGHT",
  "estimatedTimeToTailor": "15 minutes"
}
```

### Step 3: ATS Score

**Before Optimization:** 72/100

**Issues:**
- Keyword "distributed systems" not in summary
- Skills section doesn't prioritize Go
- Missing exact phrase "container orchestration"

**After Optimization:** 89/100

**Changes Made:**
1. Added "distributed systems" to summary
2. Reordered skills: Go, Kubernetes, PostgreSQL first
3. Added "container orchestration" to relevant experience bullet

### Step 4: Generate Cover Letter

```
Subject: Application for Senior Backend Engineer position

I am writing to express my strong interest in the Senior Backend Engineer
position at TechCorp. With 8 years of experience building scalable
distributed systems, I have architected event-driven microservices
processing 500K messages/second with 99.99% uptime.

My expertise in Go, Kubernetes, and PostgreSQL aligns directly with your
requirements. In my current role at TechCorp Inc, I led a microservices
migration that reduced API latency by 40% while improving deployment
frequency from weekly to daily releases.

I am particularly drawn to TechCorp's focus on handling millions of
requests at scale—a challenge I find deeply motivating.

I am confident I would be a valuable addition to your team and look
forward to discussing how I can contribute to TechCorp's success.
```

## Resume SEO Best Practices

### Keyword Density

Like web SEO, keyword density matters:

- **2-4%** is optimal
- **Less than 1%** = keyword starvation
- **Greater than 5%** = keyword stuffing (triggers spam filters)

### Keyword Placement

Keywords should appear in:

1. **Professional Summary** (highest weight)
2. **Skills Section** (explicit listing)
3. **Experience Bullets** (contextual usage)
4. **Job Titles** (exact match important)

### ATS-Friendly Formatting

- **DO:** Single column, standard fonts, bullet points
- **DON'T:** Tables, columns, graphics, headers/footers

### Both Acronyms and Full Forms

ATS systems vary in intelligence. Include both:

- "AWS (Amazon Web Services)"
- "K8s/Kubernetes"
- "CI/CD (Continuous Integration/Continuous Deployment)"

## Integration with Skills

CV Creator MCP works best with the full career toolkit:

1. **career-biographer** → Extracts structured CareerProfile
2. **competitive-cartographer** → Provides positioning strategy
3. **cv-creator-mcp** → Optimizes for specific jobs
4. **job-application-optimizer** → Strategic application planning

## Competitive Analysis

We built this after analyzing the market:

| Platform | Cost | Key Feature | Our Advantage |
|----------|------|-------------|---------------|
| Jobscan | $49.95/mo | AI resume scanning | Free, direct in Claude |
| Resume Worded | $49/mo | Line-by-line analysis | No subscription |
| Kickresume | $7/mo | 20+ ATS checks | More comprehensive |
| Rezi.ai | $29/mo | Real-time analysis | Better integration |

## Source Code

Full implementation available at:
[github.com/curiositech/cv-creator-mcp](https://github.com/curiositech/cv-creator-mcp)
