---
title: Resume Generation Protocol
sidebar_label: Resume Generation Protocol
sidebar_position: 3
---
# Resume Generation Protocol

Complete 8-step protocol for generating ATS-optimized resumes.

## Step 1: Gather Inputs

**Required:**
- CareerProfile (from biographer or user-provided JSON)

**Optional but recommended:**
- PositioningStrategy (from cartographer)
- Target Role (e.g., "Senior Backend Engineer")
- Target Company (e.g., "Google")
- Job Description URL or text (for keyword optimization)

## Step 2: Generate Professional Summary

Transform career data into a compelling 2-4 line summary:

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

**Avoid:**
- Generic buzzwords ("passionate", "results-oriented")
- Objective statements ("Seeking a challenging role...")
- Listing achievements (save for Work Experience)

## Step 3: Create Core Skills Section

Select and prioritize 15-20 technical skills:

**Prioritization criteria:**
1. Mentioned in job description (if provided)
2. Highest proficiency level from CareerProfile
3. Most years of experience
4. Relevant to target role

**Format:**
```
Core Skills:
Go, Kubernetes, Docker, gRPC, PostgreSQL, Redis, Microservices Architecture,
Distributed Systems, AWS, Terraform, CI/CD, System Design, API Design,
Performance Optimization, Monitoring & Observability
```

**Avoid:**
- Generic skills ("Problem Solving", "Team Player")
- Too many skills (&gt;25 overwhelming, &lt;10 insufficient)
- Listing skills not mentioned elsewhere in resume

## Step 4: Format Work Experience

Transform timeline events into results-oriented bullet points:

**Bullet point formula:**
```
[Action Verb] + [What you did] + [How/Why you did it] + [Quantifiable Result]
```

**Examples:**
```
✓ Led microservices migration from monolith architecture, reducing API latency by 40% and improving deployment frequency from weekly to daily releases

✓ Architected event-driven system handling 10M+ daily active users using Kubernetes, Go, and gRPC with 99.99% uptime SLA

✓ Mentored team of 5 junior engineers through code reviews and pair programming, resulting in 50% faster onboarding time
```

**Common action verbs:**
- **Leadership**: Led, Managed, Directed, Coordinated, Mentored
- **Technical**: Architected, Built, Designed, Implemented, Optimized
- **Impact**: Reduced, Increased, Improved, Accelerated, Scaled
- **Innovation**: Pioneered, Created, Launched, Introduced, Developed

**Avoid:**
- Starting with "Responsible for..." or "Duties included..."
- Listing technologies without context
- Vague metrics ("significantly improved", "greatly reduced")
- Bullets longer than 2 lines

## Step 5: Format Education

Keep education section concise:

**Format:**
```
Bachelor of Science in Computer Science
University of California, Berkeley | 2015

Master of Science in Distributed Systems
Stanford University | 2017
```

**When to include GPA:**
- Recent graduate (&lt;5 years) AND GPA ≥3.5
- Otherwise, omit

**Avoid:**
- Listing coursework (unless first job)
- Including high school education
- Redundant location info

## Step 6: Apply Template Styling

Select appropriate template based on:
- Target industry (tech = Minimalist, finance = Traditional)
- Career stage (early career = cleaner, senior = more content)
- Personal brand (creative roles = Creative Hybrid)
- Academic roles = Academic CV template

## Step 7: Generate ATS Analysis

Calculate ATS score based on:

**Formatting Compliance (30 points):**
- Single-column layout: 10 points
- Standard fonts: 10 points
- No graphics/images: 10 points

**Section Structure (20 points):**
- Has Professional Summary: 5 points
- Has Core Skills: 5 points
- Has Work Experience: 5 points
- Has Education: 5 points

**Content Quality (30 points):**
- Summary length 100-500 chars: 10 points
- Skills section 10-25 skills: 10 points
- Experience bullets have metrics: 10 points

**Keyword Optimization (20 points):**
- If job description provided: calculate keyword coverage
- If not: award 15 points for general optimization

**Total Score:** 0-100

## Step 8: Provide Recommendations

Generate specific, actionable improvements:

**Example output:**
```
ATS Score: 87/100

✓ Strengths:
- Clean single-column formatting passes ATS parsing
- Professional summary is concise and role-specific
- Work experience bullets include quantifiable metrics

⚠️ Improvements:
- Add "Terraform" to Core Skills (mentioned 3x in job description)
- Increase keyword coverage from 75% to 85% by including "CI/CD pipeline"
- Consider adding certification section with "AWS Certified Solutions Architect"
```

## Before/After Example

### Before (Generic Resume)

```
John Doe
Software Engineer

Objective:
Seeking a challenging position in software development where I can utilize my skills.

Experience:
- Worked on various backend systems
- Developed new features
- Fixed bugs and improved code quality

Skills:
Programming, Problem Solving, Team Player, Communication
```

**ATS Score: 45/100**
**Issues:** Generic objective, vague bullets, no metrics, missing keywords

### After (CV Creator Optimized)

```
John Doe | john.doe@email.com | linkedin.com/in/johndoe | github.com/johndoe

PROFESSIONAL SUMMARY
Senior Backend Engineer with 7 years building scalable microservices architectures.
Led migration to event-driven systems serving 5M+ users with 99.99% uptime. Expertise
in Go, Kubernetes, PostgreSQL, and distributed systems. Seeking principal engineering
role focused on infrastructure scalability.

CORE SKILLS
Go, Kubernetes, Docker, PostgreSQL, Redis, Microservices, Event-Driven Architecture,
gRPC, REST APIs, AWS, Terraform, CI/CD, System Design, Performance Optimization

WORK EXPERIENCE

TechCorp Inc | Senior Backend Engineer | June 2020 - Present
• Led microservices migration from monolith, reducing deployment time from 2 hours to 15 minutes
• Architected event-driven system processing 500K messages/sec with 99.99% uptime SLA
• Optimized PostgreSQL queries, reducing average query time from 800ms to 120ms (85% improvement)
• Mentored 3 junior engineers, resulting in promotion to mid-level within 12 months

EDUCATION
Bachelor of Science in Computer Science | Stanford University | 2017
```

**ATS Score: 92/100**
**Improvements:** Quantifiable metrics, specific technologies, clear progression, keyword-optimized
