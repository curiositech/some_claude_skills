# Product Requirements Document: CV Creator Skill

## Document Control

| Field | Value |
|-------|-------|
| **Product Name** | CV Creator (Professional Resume Builder) |
| **Version** | 1.0.0 |
| **Status** | Draft |
| **Owner** | Claude Skills Team |
| **Created** | 2025-11-26 |
| **Last Updated** | 2025-11-26 |

## Executive Summary

The **CV Creator** is a specialized AI skill that transforms structured career data and competitive positioning insights into ATS-optimized, professionally formatted resumes. It integrates with existing **career-biographer** and **competitive-cartographer** skills to create a seamless career documentation-to-resume pipeline.

### Key Value Propositions

1. **ATS Optimization**: Generates resumes that pass applicant tracking systems (85+ ATS score target)
2. **Multi-Format Output**: Produces PDF, DOCX, LaTeX, JSON Resume, HTML, and Markdown formats
3. **Strategic Positioning**: Incorporates competitive differentiation insights from cartographer
4. **Role-Specific Tailoring**: Creates optimized variants for different target roles/companies
5. **2025 Best Practices**: Follows latest resume trends (skills-based, metrics-driven, clean formatting)

### Success Metrics

- **Primary**: 85%+ of generated resumes achieve ATS score ≥85/100
- **Secondary**: 90%+ keyword coverage for job-specific variants
- **Tertiary**: &lt;30 second review time by recruiters (human readability)

## Problem Statement

### Current Pain Points

**For Job Seekers:**
- Struggle to translate rich career narratives into concise resume format
- Don't know which keywords to include for ATS optimization
- Unsure which resume format/template to use
- Waste time manually tailoring resumes for each application
- Lack visibility into how ATS systems evaluate their resumes

**For Career Services:**
- Manual resume review is time-consuming
- Inconsistent quality across different resume writers
- Difficult to scale personalized resume optimization
- No systematic way to incorporate competitive positioning

**Market Gap:**
Most resume builders offer either:
- Visual templates (poor ATS compatibility)
- Generic ATS optimization (no strategic positioning)
- Manual processes (not scalable or repeatable)

**No existing solution combines:**
1. Structured career data collection (biographer)
2. Strategic competitive positioning (cartographer)
3. ATS-optimized multi-format generation (cv-creator)

## Target Users

### Primary Personas

**1. Tech Professional (IC - Individual Contributor)**
- **Profile**: Software engineers, data scientists, DevOps engineers
- **Experience**: 3-10 years
- **Goal**: Land senior IC roles at top tech companies
- **Pain Point**: Resumes filtered out by ATS despite strong qualifications
- **Needs**: Keyword optimization, technical skills prominence, metrics-driven bullets

**2. Engineering Manager/Leader**
- **Profile**: Team leads, engineering managers, directors
- **Experience**: 8-15 years
- **Goal**: Transition to leadership roles or senior management
- **Pain Point**: Difficulty showcasing both technical depth and leadership impact
- **Needs**: Leadership metrics, team-building narratives, strategic initiatives

**3. Career Transitioner**
- **Profile**: Professionals changing industries or roles
- **Experience**: 5+ years in different field
- **Goal**: Pivot to tech or adjacent roles
- **Pain Point**: Resume doesn't highlight transferable skills
- **Needs**: Skills-based formatting, reframed experience, strategic positioning

**4. Academic/Researcher**
- **Profile**: PhD candidates, postdocs, professors
- **Experience**: Variable
- **Goal**: Academic positions or industry research roles
- **Pain Point**: Academic CVs don't translate to industry format (or vice versa)
- **Needs**: Publications section, research impact metrics, dual-format capability

### Secondary Personas

**5. Career Services Professional**
- **Profile**: University career counselors, professional resume writers
- **Experience**: Helping hundreds of job seekers
- **Goal**: Scale personalized resume optimization
- **Needs**: Batch processing, template consistency, quality assurance

**6. Recruiting Operations**
- **Profile**: Corporate recruiters, hiring managers
- **Experience**: Reviewing thousands of resumes annually
- **Goal**: Quickly identify qualified candidates
- **Needs**: Standardized formats, clear technical sections, scannable content

## User Stories & Acceptance Criteria

### Epic 1: Basic Resume Generation

**US-1.1: Generate ATS-Compatible PDF Resume**
```gherkin
As a tech professional
I want to generate a clean, ATS-compatible PDF resume
So that my application passes automated screening systems

Acceptance Criteria:
- Given a CareerProfile JSON input
- When I request PDF generation with "minimalist" template
- Then I receive a single-column, clean PDF resume
- And the ATS score is ≥80/100
- And all required sections are present (Summary, Skills, Experience, Education)
- And formatting follows 2025 best practices (no tables, standard fonts, clear headers)
```

**US-1.2: Generate Multiple Resume Formats**
```gherkin
As a job seeker
I want to export my resume in multiple formats (PDF, DOCX, JSON)
So that I can submit in whatever format employers require

Acceptance Criteria:
- Given a completed resume
- When I request multi-format export
- Then I receive PDF, DOCX, and JSON Resume files
- And all formats contain identical content
- And each format is optimized for its use case (PDF for viewing, DOCX for editing, JSON for portability)
```

### Epic 2: ATS Optimization

**US-2.1: Optimize Resume for Specific Job Description**
```gherkin
As a candidate
I want to optimize my resume for a specific job posting
So that I maximize my ATS score and keyword match

Acceptance Criteria:
- Given a base resume and job description text
- When I request optimization for that role
- Then I receive a tailored resume variant
- And keyword coverage is ≥80% for required skills
- And missing keywords are identified with recommendations
- And an ATS analysis report is provided
```

**US-2.2: Receive ATS Score and Improvement Recommendations**
```gherkin
As a user
I want to see my resume's ATS score and specific improvement suggestions
So that I can iteratively improve my resume

Acceptance Criteria:
- Given a generated resume
- When I request ATS analysis
- Then I receive a score (0-100)
- And I see keyword density analysis
- And I get specific, actionable recommendations (e.g., "Add 'Kubernetes' to Core Skills section")
- And formatting issues are flagged (e.g., "Remove table formatting from Work Experience")
```

### Epic 3: Integration with Career Biographer

**US-3.1: Import Career Data from Biographer**
```gherkin
As a user who completed a career biography interview
I want to automatically generate a resume from that data
So that I don't have to re-enter information

Acceptance Criteria:
- Given a completed CareerProfile from career-biographer
- When I initiate resume generation
- Then all relevant data is mapped to resume sections
- And timeline events are converted to work experience bullets
- And skills are prioritized based on proficiency and relevance
```

### Epic 4: Integration with Competitive Cartographer

**US-4.1: Apply Strategic Positioning to Resume**
```gherkin
As a candidate
I want my resume to reflect strategic competitive positioning
So that I stand out in crowded applicant pools

Acceptance Criteria:
- Given a PositioningStrategy from competitive-cartographer
- When generating professional summary
- Then differentiators are incorporated into messaging
- And headline reflects positioning statement
- And tone matches recommended strategy (e.g., "technical depth + warm personality")
```

### Epic 5: Template System

**US-5.1: Choose from Multiple Resume Templates**
```gherkin
As a user
I want to select from different resume templates
So that I can match my industry and personal brand

Acceptance Criteria:
- Given my career data
- When I select a template (Minimalist, Traditional, Creative, Academic)
- Then my resume is rendered with that template's styling
- And ATS compatibility is maintained across all templates
- And I can preview templates before committing
```

## Functional Requirements

### FR-1: Data Input & Transformation

**FR-1.1**: System SHALL accept CareerProfile JSON conforming to biographer schema
**FR-1.2**: System SHALL accept PositioningStrategy JSON conforming to cartographer schema
**FR-1.3**: System SHALL validate input data completeness before generation
**FR-1.4**: System SHALL transform timeline events into reverse-chronological work experience
**FR-1.5**: System SHALL prioritize skills based on proficiency, years of experience, and target role relevance

### FR-2: Resume Generation

**FR-2.1**: System SHALL generate professional summary (2-4 lines) incorporating positioning insights
**FR-2.2**: System SHALL format work experience bullets with action verbs and metrics
**FR-2.3**: System SHALL create Core Skills section with 15-20 role-relevant skills
**FR-2.4**: System SHALL format education section with degree, institution, optional year
**FR-2.5**: System SHALL limit resume length to 2 pages maximum
**FR-2.6**: System SHALL use consistent date formatting (MM/YYYY)

### FR-3: ATS Optimization

**FR-3.1**: System SHALL calculate ATS score (0-100) based on multiple factors
**FR-3.2**: System SHALL extract keywords from job descriptions using NLP
**FR-3.3**: System SHALL calculate keyword density and coverage
**FR-3.4**: System SHALL identify missing critical keywords
**FR-3.5**: System SHALL validate formatting compliance (single-column, standard fonts, no graphics)
**FR-3.6**: System SHALL provide specific, actionable improvement recommendations

### FR-4: Multi-Format Export

**FR-4.1**: System SHALL generate ATS-compatible PDF using headless browser rendering
**FR-4.2**: System SHALL generate editable DOCX with proper styles and structure
**FR-4.3**: System SHALL generate JSON Resume compliant with official schema
**FR-4.4**: System SHALL generate HTML with print-optimized CSS
**FR-4.5**: System SHALL generate Markdown with YAML frontmatter
**FR-4.6**: System SHALL optionally generate LaTeX source for academic CVs

### FR-5: Template System

**FR-5.1**: System SHALL provide 4 base templates (Minimalist, Traditional, Creative, Academic)
**FR-5.2**: System SHALL allow template customization (fonts, colors, spacing)
**FR-5.3**: System SHALL maintain ATS compatibility across all templates
**FR-5.4**: System SHALL support custom templates via configuration files

### FR-6: Version Management

**FR-6.1**: System SHALL create resume variants with clear naming (e.g., "resume-google-swe.pdf")
**FR-6.2**: System SHALL track resume versions with metadata (created date, target role, ATS score)
**FR-6.3**: System SHALL allow comparison between resume variants
**FR-6.4**: System SHALL store resume history for iterative improvement

## Non-Functional Requirements

### NFR-1: Performance

**NFR-1.1**: Resume generation SHALL complete within 10 seconds for PDF output
**NFR-1.2**: Multi-format export SHALL complete within 20 seconds
**NFR-1.3**: ATS analysis SHALL complete within 5 seconds
**NFR-1.4**: System SHALL handle concurrent generation of up to 10 resumes

### NFR-2: Quality

**NFR-2.1**: Generated resumes SHALL achieve ≥85% ATS score when optimized for specific job
**NFR-2.2**: Generated resumes SHALL pass ATS parsing without errors (0 parsing failures)
**NFR-2.3**: PDF output SHALL be pixel-perfect across different PDF viewers
**NFR-2.4**: DOCX output SHALL be editable in Microsoft Word, Google Docs, LibreOffice

### NFR-3: Usability

**NFR-3.1**: Resume generation SHALL require ≤3 user inputs (CareerProfile, Strategy, TargetRole)
**NFR-3.2**: Error messages SHALL be specific and actionable
**NFR-3.3**: Generated resumes SHALL be scannable by recruiters in &lt;30 seconds
**NFR-3.4**: ATS recommendations SHALL be prioritized by impact (high/medium/low)

### NFR-4: Reliability

**NFR-4.1**: Resume generation SHALL have 99.9% success rate
**NFR-4.2**: System SHALL gracefully handle incomplete input data with clear error messages
**NFR-4.3**: Generated files SHALL be validated before delivery
**NFR-4.4**: System SHALL provide retry mechanism for failed generations

### NFR-5: Maintainability

**NFR-5.1**: Templates SHALL be defined in declarative configuration files
**NFR-5.2**: ATS scoring algorithm SHALL be parameterized and tunable
**NFR-5.3**: System SHALL log all generation requests for debugging
**NFR-5.4**: Code SHALL follow TypeScript best practices with 100% type coverage

### NFR-6: Security & Privacy

**NFR-6.1**: User career data SHALL NOT be stored beyond generation session
**NFR-6.2**: Generated resumes SHALL NOT contain PII beyond what user provides
**NFR-6.3**: System SHALL NOT call external APIs with user data without explicit consent
**NFR-6.4**: All file operations SHALL use secure temporary directories with cleanup

## Technical Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     CV Creator Skill                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Input      │  │  Transform   │  │   Render     │     │
│  │  Validator   │→ │   Engine     │→ │   Engine     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         ↓                  ↓                  ↓             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │     ATS      │  │   Template   │  │   Export     │     │
│  │  Optimizer   │  │   System     │  │   Manager    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
└─────────────────────────────────────────────────────────────┘

External Dependencies:
- Puppeteer/Playwright (PDF rendering)
- docxtemplater (DOCX generation)
- marked/unified (Markdown processing)
- natural/compromise (NLP for keyword extraction)
```

### Data Flow

```
Input:
  - CareerProfile (from biographer)
  - PositioningStrategy (from cartographer)
  - JobDescription (optional, for optimization)
  - RenderOptions (template, formats)

Processing:
  1. Validate inputs against schemas
  2. Transform career data → resume sections
  3. Apply positioning strategy → professional summary
  4. Extract keywords from job description (if provided)
  5. Select and populate template
  6. Render to requested formats
  7. Calculate ATS score
  8. Generate recommendations

Output:
  - resume.pdf (ATS-compatible PDF)
  - resume.docx (editable Word doc)
  - resume.json (JSON Resume schema)
  - resume.html (web version)
  - resume.md (Markdown source)
  - ats-analysis.json (optimization report)
```

### Technology Stack

**Core:**
- TypeScript (type-safe implementation)
- Node.js runtime
- Template engine (Handlebars or EJS)

**PDF Generation:**
- Puppeteer or Playwright (headless Chrome)
- Print-optimized HTML/CSS

**DOCX Generation:**
- docxtemplater or docx.js
- Custom style definitions

**NLP/Keyword Extraction:**
- natural.js or compromise.js
- Custom TF-IDF implementation

**Validation:**
- Zod or Yup (schema validation)
- AJV (JSON Schema validation)

## User Experience Design

### Skill Invocation

```typescript
// Three-skill orchestrated workflow
User: "I need a resume for senior backend engineer roles at FAANG companies"

// Step 1: Biographer conducts interview
career-biographer: [Conducts structured interview, outputs CareerProfile]

// Step 2: Cartographer analyzes competitive landscape
competitive-cartographer: [Maps FAANG senior backend space, outputs PositioningStrategy]

// Step 3: CV Creator generates optimized resume
cv-creator: [Combines inputs, generates resume variants]

Output:
- resume-faang-senior-backend.pdf
- resume-faang-senior-backend.docx
- resume-faang-senior-backend.json
- ats-analysis-faang-senior-backend.md
```

### Standalone Usage

```typescript
// Quick optimization workflow
User: "Optimize my resume for this job posting [pastes URL]"

cv-creator:
1. Fetches job description
2. Extracts keywords
3. Loads existing resume (from previous generation or user upload)
4. Creates optimized variant
5. Generates ATS report

Output:
- resume-company-role-optimized.pdf
- ats-score: 89/100
- recommendations: ["Add 'Terraform' to Core Skills", "Quantify team size in bullet 3"]
```

## Quality Assurance

### Testing Strategy

**Unit Tests:**
- Data transformation logic
- Keyword extraction algorithm
- ATS scoring calculation
- Template rendering

**Integration Tests:**
- Biographer → CV Creator data flow
- Cartographer → CV Creator positioning application
- Multi-format export consistency

**End-to-End Tests:**
- Full three-skill workflow
- Resume generation from sample CareerProfile
- ATS optimization for real job descriptions

**Visual Regression Tests:**
- PDF rendering consistency across updates
- Template layout verification
- Cross-browser/viewer compatibility

### Acceptance Criteria for Launch

**Must Have (P0):**
- ✅ Generate ATS-compatible PDF resume
- ✅ Integrate with career-biographer data
- ✅ Calculate ATS score with recommendations
- ✅ Provide 2 templates (Minimalist, Traditional)
- ✅ Export PDF and DOCX formats
- ✅ Achieve 85+ ATS score on test resumes

**Should Have (P1):**
- ⭕ Integrate with competitive-cartographer positioning
- ⭕ Optimize for specific job descriptions
- ⭕ Generate JSON Resume and HTML formats
- ⭕ Provide 4 templates (add Creative, Academic)
- ⭕ Resume variant management

**Could Have (P2):**
- ⭕ LaTeX generation for academic CVs
- ⭕ A/B testing framework
- ⭕ Multi-language support
- ⭕ Live job description analysis
- ⭕ Batch processing for multiple candidates

## Success Metrics & KPIs

### Product Metrics

**Primary Success Metric:**
- **Average ATS Score**: Target ≥85/100 for job-optimized resumes

**Secondary Metrics:**
- **Keyword Coverage**: ≥80% for required skills in job description
- **Generation Success Rate**: ≥99.5% successful PDF generation
- **User Satisfaction**: ≥4.5/5 star rating for generated resumes

**Quality Metrics:**
- **ATS Parsing Error Rate**: &lt;1% of resumes have parsing errors
- **Format Compliance**: 100% of templates pass ATS validation
- **Content Accuracy**: 0% data loss from CareerProfile → Resume

### Usage Metrics

- **Daily Active Resumes Generated**: Track adoption
- **Average Resumes per User**: Indicates variant creation
- **Most Popular Templates**: Guides template development
- **Top Optimized Roles**: Reveals target user segments

### Business Impact Metrics

- **Resume → Interview Conversion Rate**: Track user outcomes (via surveys)
- **Time to Generate Resume**: &lt;10 seconds per resume
- **Resumes Generated per Week**: Growth indicator

## Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| ATS systems update algorithms, scores drop | High | Medium | Monitor ATS vendor updates, maintain test suite with real job postings |
| PDF rendering inconsistent across viewers | Medium | Low | Test with Adobe Reader, Preview, Chrome PDF viewer |
| Users provide incomplete career data | Medium | High | Graceful degradation, clear error messages, optional sections |
| Competition from established resume builders | Low | High | Differentiate via biographer/cartographer integration, strategic positioning |
| LaTeX generation complexity | Low | Medium | Start with HTML→PDF, add LaTeX as P2 feature |

## Dependencies

### Internal Dependencies
- **career-biographer**: Provides CareerProfile data structure
- **competitive-cartographer**: Provides PositioningStrategy insights

### External Dependencies
- **Puppeteer/Playwright**: Headless browser for PDF rendering
- **Node.js**: Runtime environment
- **TypeScript**: Type system and tooling

### Optional Dependencies
- **OpenAI API**: For AI-powered bullet point generation (future enhancement)
- **Job Board APIs**: For live job description fetching (future enhancement)

## Rollout Plan

### Phase 1: MVP (Weeks 1-2)
- Basic PDF generation with Minimalist template
- CareerProfile → Resume data transformation
- Simple ATS score calculation
- PDF export only

### Phase 2: Multi-Format (Weeks 3-4)
- Add DOCX export
- Add JSON Resume export
- Improve ATS scoring algorithm
- Add Traditional template

### Phase 3: Integration (Weeks 5-6)
- Integrate with competitive-cartographer for positioning
- Job description optimization
- Keyword extraction and analysis
- ATS recommendations engine

### Phase 4: Polish (Weeks 7-8)
- Add Creative and Academic templates
- Resume variant management
- Visual regression testing
- Performance optimization
- Documentation and examples

## Open Questions

1. **Should we support real-time collaborative editing of resumes?**
   - Decision: No, out of scope for V1. Focus on generation, not editing.

2. **How do we handle non-English resumes?**
   - Decision: V1 English-only. V2 add i18n with locale-specific formatting.

3. **Should we store resume history in a database?**
   - Decision: No persistent storage in V1. User responsible for saving files.

4. **How do we validate ATS scores against real ATS systems?**
   - Decision: Partner with recruiting platforms for validation testing.

5. **Should we integrate with LinkedIn for data import?**
   - Decision: Not V1. CareerProfile from biographer is sufficient input.

## Glossary

- **ATS**: Applicant Tracking System - software used by companies to filter resumes
- **CareerProfile**: Structured data format from career-biographer skill
- **JSON Resume**: Open-source resume schema (https://jsonresume.org)
- **PositioningStrategy**: Competitive differentiation insights from cartographer skill
- **Resume Variant**: Role-specific or company-specific version of resume
- **Keyword Density**: Frequency of specific terms relative to total word count
- **ATS Score**: 0-100 metric indicating resume compatibility with ATS systems

## Appendix A: Sample CareerProfile → Resume Mapping

```typescript
// Input: CareerProfile
{
  name: "Alex Chen",
  headline: "Senior Backend Engineer",
  summary: "Passionate engineer with 8 years building distributed systems...",
  timelineEvents: [
    {
      date: "2020-01",
      type: "role_change",
      title: "Senior Backend Engineer at BigTech Co",
      description: "Led microservices migration",
      impact: "Reduced latency by 40%, served 10M+ users",
      tags: ["Go", "Kubernetes", "gRPC"]
    }
  ],
  skills: [
    { name: "Go", category: "technical", proficiency: 95, yearsOfExperience: 6 },
    { name: "Kubernetes", category: "technical", proficiency: 85, yearsOfExperience: 4 }
  ]
}

// Output: Resume
Professional Summary:
Senior Backend Engineer with 8 years building scalable distributed systems. Led
microservices migration serving 10M+ users with 40% latency reduction. Expertise
in Go, Kubernetes, and cloud-native architecture.

Core Skills:
Go, Kubernetes, gRPC, Distributed Systems, Microservices, Docker, PostgreSQL,
Redis, AWS, Terraform

Work Experience:
BigTech Co | Senior Backend Engineer | Jan 2020 - Present
• Led microservices migration from monolith, reducing API latency by 40%
• Architected event-driven system serving 10M+ daily active users
• Implemented gRPC services with Kubernetes for auto-scaling workloads
```

## Appendix B: ATS Scoring Algorithm (Simplified)

```typescript
function calculateATSScore(resume: Resume, jobDescription?: string): number {
  let score = 0;

  // 1. Formatting compliance (30 points)
  if (resume.formatting.layout === 'single-column') score += 10;
  if (resume.formatting.font in STANDARD_FONTS) score += 10;
  if (!resume.formatting.hasGraphics) score += 10;

  // 2. Section structure (20 points)
  const requiredSections = ['summary', 'skills', 'experience', 'education'];
  const presentSections = requiredSections.filter(s => resume.content[s]);
  score += (presentSections.length / requiredSections.length) * 20;

  // 3. Content quality (30 points)
  if (resume.content.summary.length >= 100 && resume.content.summary.length <= 500) score += 10;
  if (resume.content.skills.length >= 10 && resume.content.skills.length <= 25) score += 10;
  const hasMetrics = resume.content.experience.some(exp =>
    exp.bullets.some(b => /\d+%|\$\d+|\d+M\+/.test(b))
  );
  if (hasMetrics) score += 10;

  // 4. Keyword optimization (20 points) - only if job description provided
  if (jobDescription) {
    const keywords = extractKeywords(jobDescription);
    const coverage = calculateKeywordCoverage(resume, keywords);
    score += coverage * 20;
  } else {
    score += 15; // Partial credit for general optimization
  }

  return Math.min(100, Math.round(score));
}
```

---

**Document Status**: Ready for Implementation Review
**Next Steps**: Technical design review, development sprint planning, resource allocation
