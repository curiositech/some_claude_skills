# CV Creator Skill - Technical Architecture & Design

## Executive Summary

The **CV Creator** skill is a specialized AI agent that transforms career narratives and competitive positioning into ATS-optimized, professionally formatted resumes and CVs. It integrates seamlessly with the **career-biographer** (for structured career data) and **competitive-cartographer** (for strategic positioning) to create resumes that pass both automated screening systems and human review.

## Vision & Purpose

### Problem Statement
Most professionals struggle to:
- Translate rich career narratives into concise, ATS-compatible resume formats
- Optimize resumes for specific job applications with appropriate keywords
- Balance human readability with machine parseability
- Choose appropriate formats and templates for different career stages
- Maintain consistency across multiple resume versions

### Solution
An intelligent CV creation system that:
1. Consumes structured career data from the biographer skill
2. Incorporates strategic positioning from the cartographer skill
3. Generates multiple resume formats optimized for 2025 hiring standards
4. Provides ATS optimization analysis and keyword recommendations
5. Creates role-specific variations while maintaining version control

## Core Capabilities

### 1. Multi-Format Resume Generation
- **PDF**: ATS-compatible, clean typography, optimized spacing
- **DOCX**: Editable Word format for recruiter modifications
- **LaTeX**: Professional academic/research CVs
- **JSON Resume**: Structured data format for developer portfolios
- **HTML**: Web-based interactive resumes
- **Markdown**: Version-controlled, git-friendly format

### 2. ATS Optimization Engine
- Keyword density analysis against job descriptions
- Section structure validation (Professional Summary, Skills, Experience)
- Font and formatting compliance checks
- Parsing simulation to detect formatting issues
- Scoring system (0-100) with specific improvement recommendations

### 3. Template System
**Modern Minimalist** (Default for most tech roles)
- Clean sans-serif typography (Calibri, Tahoma)
- Single-column layout
- Clear section headers
- Generous whitespace
- Ideal for: Software Engineers, Data Scientists, Product Managers

**Professional Traditional**
- Serif typography (Georgia, Times New Roman)
- Conservative layout
- Formal tone
- Ideal for: Senior Executives, Legal, Finance, Academia

**Creative Hybrid**
- Modern sans-serif with accent colors (1-2 colors max)
- Subtle visual hierarchy
- Still ATS-compatible
- Ideal for: Design Engineers, UX, Creative Technologists

**Academic CV**
- LaTeX-based (Awesome-CV, ModernCV templates)
- Publications, citations, research sections
- Multi-page format
- Ideal for: Researchers, PhD candidates, Professors

### 4. Strategic Resume Variants
Generate role-specific variations:
- **Optimized for Company X**: Tailored keywords, emphasis on relevant experience
- **Optimized for Role Y**: Reordered sections, highlighted transferable skills
- **General Version**: Broadly applicable baseline resume

### 5. Integration Points

#### From Career Biographer (Input)
```typescript
interface CareerProfile {
  name: string;
  headline: string;
  summary: string;

  timelineEvents: {
    date: string;
    type: 'role_change' | 'patent' | 'hackathon' | 'award' | 'talk' | 'publication' | 'milestone';
    title: string;
    description: string;
    impact: string;
    tags: string[];
  }[];

  skills: {
    category: 'technical' | 'leadership' | 'domain' | 'soft';
    name: string;
    proficiency: number;
    yearsOfExperience: number;
  }[];

  projects: {
    name: string;
    role: string;
    description: string;
    technologies: string[];
    impact: string;
    metrics: string[];
  }[];

  aspirations: {
    shortTerm: string[];
    longTerm: string;
    values: string[];
  };

  brand: {
    targetAudience: string;
    keywords: string[];
    tone: string;
    colors?: string[];
  };
}
```

#### From Competitive Cartographer (Input)
```typescript
interface PositioningStrategy {
  positioning: {
    headline: string;
    differentiators: string[];
    messaging: string;
  };

  visualStrategy: {
    aestheticDirection: string;
    avoid: string[];
    embrace: string[];
  };

  contentStrategy: {
    topics: string[];
    tone: string;
    depth: string;
  };
}
```

#### CV Creator Output
```typescript
interface ResumeOutput {
  metadata: {
    version: string;
    createdAt: string;
    targetRole?: string;
    targetCompany?: string;
    atsScore: number;
  };

  content: {
    professionalSummary: string;
    coreSkills: string[];
    workExperience: {
      company: string;
      role: string;
      dates: string;
      bullets: string[];
      technologies: string[];
    }[];
    education: {
      degree: string;
      institution: string;
      year: string;
      gpa?: string;
    }[];
    certifications?: string[];
    publications?: string[];
    awards?: string[];
  };

  formatting: {
    template: 'minimalist' | 'traditional' | 'creative' | 'academic';
    font: string;
    fontSize: number;
    margins: string;
    colors: string[];
  };

  optimization: {
    keywords: string[];
    keywordDensity: { [key: string]: number };
    missingKeywords: string[];
    atsWarnings: string[];
    recommendations: string[];
  };
}
```

## Workflow Architecture

### Standard Workflow (Three-Skill Orchestration)

```
User Request
    ↓
career-biographer (Conducts interview, extracts CareerProfile)
    ↓
competitive-cartographer (Analyzes positioning, generates Strategy)
    ↓
cv-creator (Combines inputs, generates optimized resume)
    ↓
Output: Multiple format files + ATS analysis report
```

### Quick Update Workflow (CV Creator Standalone)

```
User provides: CareerProfile JSON + Job Description
    ↓
cv-creator (Optimizes for specific role)
    ↓
Output: Tailored resume variant
```

## Technical Implementation

### Core Technologies
- **PDF Generation**: Puppeteer/Playwright for headless Chrome rendering
- **DOCX Generation**: `docxtemplater` or `officegen` for Word format
- **LaTeX Generation**: Template-based rendering with custom macros
- **JSON Resume**: Standard schema compliance with custom extensions
- **HTML/CSS**: Semantic markup with print-optimized styles
- **Markdown**: CommonMark with YAML frontmatter

### ATS Optimization Algorithm

```typescript
class ATSOptimizer {
  analyzeResume(resume: ResumeOutput, jobDescription: string): ATSAnalysis {
    // 1. Extract keywords from job description
    const requiredKeywords = this.extractKeywords(jobDescription);

    // 2. Calculate keyword coverage
    const coverage = this.calculateCoverage(resume.content, requiredKeywords);

    // 3. Check formatting compliance
    const formatIssues = this.validateFormatting(resume.formatting);

    // 4. Analyze section structure
    const structureScore = this.analyzeStructure(resume.content);

    // 5. Generate recommendations
    const recommendations = this.generateRecommendations({
      coverage,
      formatIssues,
      structureScore
    });

    return {
      score: this.calculateATSScore(coverage, formatIssues, structureScore),
      keywordCoverage: coverage,
      missingKeywords: requiredKeywords.filter(k => !coverage[k]),
      warnings: formatIssues,
      recommendations
    };
  }
}
```

### Template Engine

```typescript
class TemplateEngine {
  templates: Map<TemplateType, Template>;

  render(
    careerProfile: CareerProfile,
    strategy: PositioningStrategy,
    options: RenderOptions
  ): string {
    const template = this.templates.get(options.templateType);

    // Transform career data into resume sections
    const resumeData = {
      summary: this.generateSummary(careerProfile, strategy),
      skills: this.optimizeSkills(careerProfile.skills, options.targetRole),
      experience: this.formatExperience(careerProfile.timelineEvents),
      education: this.formatEducation(careerProfile),
      // ... other sections
    };

    // Apply template-specific rendering
    return template.render(resumeData, options);
  }

  generateSummary(
    profile: CareerProfile,
    strategy: PositioningStrategy
  ): string {
    // Combine biographer's summary with cartographer's positioning
    // Keep it 2-4 lines, specific, role-aligned
    // Example: "Senior Software Engineer with 8 years building scalable distributed systems.
    // Led migration to microservices architecture serving 10M+ users. Expertise in Go,
    // Kubernetes, and cloud-native patterns. Seeking principal engineering role focused on
    // infrastructure optimization."
  }
}
```

## Best Practices & Guidelines

### Content Optimization Rules

1. **Professional Summary**
   - 2-4 lines maximum
   - Include: seniority level, technical focus, key metric, target role
   - Exclude: buzzwords, objectives, generic claims

2. **Work Experience Bullets**
   - Start with action verbs (Led, Built, Architected, Optimized)
   - Include quantifiable metrics (%, $, numbers, timeframes)
   - One line per bullet (max 2 lines for complex achievements)
   - 5-10 bullets per recent role, 3-5 for older roles

3. **Core Skills Section**
   - 15-20 specific technical skills
   - Use exact terminology from job descriptions
   - Group by category if helpful: Languages, Frameworks, Tools, Cloud Platforms
   - Only list skills mentioned elsewhere in resume

4. **Education**
   - Degree, Institution, Year (optional if &gt;10 years ago)
   - GPA only if recent (&lt;5 years) and strong (&gt;3.5)
   - No coursework unless applying for first job

### ATS Compliance Checklist

- ✅ Single-column layout (no tables, no text boxes)
- ✅ Standard section headers (Work Experience, not "My Journey")
- ✅ Common fonts (Calibri, Arial, Georgia, Times New Roman)
- ✅ Font size 10-12pt for body, 14-16pt for headers
- ✅ Standard margins (0.5-1 inch)
- ✅ No headers/footers (info can be lost)
- ✅ No images, logos, or graphics
- ✅ No special characters or emojis
- ✅ Dates in consistent format (MM/YYYY)
- ✅ Plain bullet points (•, -, or standard symbols)

## Integration Protocol

### Three-Skill Workflow

**Step 1: User initiates with career documentation request**
```
User: "I need a resume for senior backend engineer roles"
```

**Step 2: career-biographer conducts interview**
```typescript
// Biographer gathers:
// - Current role and technical stack
// - Career history with timeline
// - Key achievements with metrics
// - Skills and proficiencies
// - Aspirations and target roles

// Outputs: CareerProfile JSON
```

**Step 3: competitive-cartographer analyzes positioning**
```typescript
// Cartographer determines:
// - Competitive landscape for senior backend engineers
// - White space opportunities
// - Differentiators (e.g., "Go expert with distributed systems focus")
// - Strategic messaging recommendations

// Outputs: PositioningStrategy JSON
```

**Step 4: cv-creator generates optimized resume**
```typescript
// CV Creator combines:
// - CareerProfile (structured career data)
// - PositioningStrategy (how to differentiate)
// - Job Description (if provided, for ATS optimization)

// Generates:
// - resume.pdf (ATS-compatible PDF)
// - resume.docx (editable Word format)
// - resume.json (JSON Resume schema)
// - ats-analysis.md (optimization report)
```

### Standalone Workflow

**When user already has career data:**
```
User: "Here's my JSON Resume, optimize it for this job posting"

cv-creator:
1. Validates JSON Resume schema
2. Extracts keywords from job description
3. Reorders/emphasizes relevant experience
4. Generates optimized variant
5. Provides ATS score and recommendations
```

## Anti-Patterns to Avoid

### ❌ Don't: Create "creative" resumes with graphics
**Why it's wrong**: ATS systems can't parse images, columns, or complex layouts
**What to do instead**: Use clean, single-column text-based formatting

### ❌ Don't: Write generic objective statements
**Why it's wrong**: "Seeking a challenging role..." adds no value and wastes space
**What to do instead**: Use professional summary with specific metrics and focus

### ❌ Don't: List responsibilities without outcomes
**Why it's wrong**: "Managed a team" doesn't show impact
**What to do instead**: "Led team of 5 engineers to deliver microservices migration, reducing latency by 40%"

### ❌ Don't: Include irrelevant information
**Why it's wrong**: Hobbies, photos, references take valuable space
**What to do instead**: Focus on professional value: skills, achievements, certifications

### ❌ Don't: Use inconsistent formatting
**Why it's wrong**: Confuses ATS parsers and looks unprofessional
**What to do instead**: Maintain consistent date formats, bullet styles, spacing

## Success Metrics

A well-generated resume should achieve:
- **ATS Score**: 85+ out of 100
- **Keyword Coverage**: 80%+ of required keywords from job description
- **Length**: 1-2 pages (strict limit)
- **Formatting**: 0 parsing errors when tested through ATS simulator
- **Readability**: Scannable in &lt;30 seconds by human recruiter
- **Uniqueness**: Differentiated positioning vs. 80%+ of competitive set

## Future Enhancements

1. **AI-Powered Bullet Point Generation**: Given project context, auto-generate optimized bullet points
2. **A/B Testing Framework**: Track which resume variants get more interviews
3. **Live Job Description Analysis**: Paste job posting, get real-time ATS optimization
4. **Multi-Language Support**: Generate resumes in multiple languages with locale-specific formatting
5. **Video Resume Generation**: Combine with speech synthesis for video introductions
6. **Portfolio Integration**: Embed GitHub stats, live project demos, case studies
7. **Continuous Optimization**: Track industry trends, update templates automatically

## When NOT to Use

This skill is NOT appropriate for:
- **Quick LinkedIn headline updates** (just update directly)
- **Cover letter writing** (different skill, different format)
- **Interview preparation** (use interview coach skills)
- **Career counseling** (use career advisor skills)
- **Job search strategy** (use competitive-cartographer for positioning, not CV creation)

## Troubleshooting

### Issue: Generated resume fails ATS parsing
**Cause**: Complex formatting, tables, or unusual fonts
**Fix**: Switch to "minimalist" template, remove any custom styling

### Issue: Resume is too long (&gt;2 pages)
**Cause**: Including every role and detail from career history
**Fix**: Consolidate older roles, remove irrelevant positions, trim bullet points to 1 line

### Issue: Missing key keywords from job description
**Cause**: Skills not explicitly stated or using different terminology
**Fix**: Add "Core Skills" section, use exact terminology from job posting

### Issue: Professional summary sounds generic
**Cause**: Relying on biographer's broad summary without role-specific tailoring
**Fix**: Incorporate cartographer's positioning insights, add specific metrics

## Conclusion

The **cv-creator** skill bridges the gap between rich career narratives (from biographer) and strategic positioning (from cartographer) to produce ATS-optimized, recruiter-ready resumes. By focusing on 2025 best practices—clean formatting, keyword optimization, metrics-driven content, and role-specific tailoring—it significantly improves the candidate's chances of passing automated screening and securing interviews.
