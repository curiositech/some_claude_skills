---
title: Skill Management Architecture
sidebar_label: Skill Management
sidebar_position: 10
---

# Skill Management Architecture

A unified system for managing skills from multiple sources with automatic generation, web submissions, and remote skill support.

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SKILL MANAGEMENT SYSTEM                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  SOURCES                      PROCESSING                    OUTPUTS          │
│  ═══════                      ══════════                    ═══════          │
│                                                                              │
│  ┌──────────────┐                                                            │
│  │ Local Skills │─┐                                      ┌──────────────┐   │
│  │ .claude/     │ │                                      │  skills.ts   │   │
│  │ skills/*/    │ │         ┌──────────────────┐         │  (registry)  │   │
│  │ SKILL.md     │ ├────────▶│                  │────────▶└──────────────┘   │
│  └──────────────┘ │         │   generate-      │                            │
│                   │         │   skills.ts      │         ┌──────────────┐   │
│  ┌──────────────┐ │         │                  │────────▶│  docs/skills │   │
│  │Remote Skills │ │         │   (build script) │         │  (MDX docs)  │   │
│  │skill-sources │─┤         │                  │         └──────────────┘   │
│  │.yaml         │ │         └──────────────────┘                            │
│  └──────────────┘ │                  ▲                                      │
│                   │                  │                                      │
│  ┌──────────────┐ │         ┌───────┴──────────┐                            │
│  │ Submissions  │─┘         │  process-        │                            │
│  │ GitHub Issues│◀──────────│  submissions.ts  │                            │
│  │ (approved)   │           │  (CLI tool)      │                            │
│  └──────────────┘           └──────────────────┘                            │
│         ▲                                                                    │
│         │                                                                    │
│  ┌──────┴───────┐                                                           │
│  │ Website Form │                                                           │
│  │ /submit-skill│                                                           │
│  └──────────────┘                                                           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Local Skills (Primary Source)

```
.claude/skills/{skill-name}/SKILL.md
         │
         ▼
    ┌─────────────────────────────────────┐
    │ YAML Frontmatter (Single Source)    │
    ├─────────────────────────────────────┤
    │ ---                                 │
    │ name: skill-name                    │
    │ title: Human Readable Title         │
    │ description: Full description...    │
    │ category: Category Name             │
    │ tags: [tag1, tag2]                  │
    │ badge: NEW|HOT|ADVANCED (optional)  │
    │ allowed-tools: Tool1,Tool2          │
    │ ---                                 │
    │                                     │
    │ # Skill Content (Markdown)          │
    │ ...                                 │
    └─────────────────────────────────────┘
```

### 2. Remote Skills (External Sources)

```yaml
# skill-sources.yaml
version: 1
sources:
  # Include all skills from a repo
  - repo: github.com/anthropics/claude-skills
    branch: main
    path: skills/  # Path to skills directory
    include: "*"   # All skills

  # Include specific skills
  - repo: github.com/myorg/custom-skills
    branch: main
    path: .claude/skills/
    include:
      - custom-skill-1
      - custom-skill-2

  # Include skills matching pattern
  - repo: github.com/community/skill-pack
    branch: main
    path: skills/
    include: "ml-*"  # All ML skills
```

### 3. Skill Submissions (Community Ideas)

```typescript
// Submission creates GitHub Issue with this structure
interface SkillSubmission {
  // Required
  name: string;           // skill-name (kebab-case)
  title: string;          // Human Readable Title
  description: string;    // What the skill does
  category: string;       // Category selection

  // Optional
  useCases: string[];     // Example use cases
  tools: string[];        // Suggested tools
  references: string[];   // Links to resources

  // Auto-added
  submittedBy: string;    // GitHub username or email
  submittedAt: string;    // ISO timestamp
  status: 'pending' | 'approved' | 'rejected' | 'implemented';
}
```

## Components

### 1. Auto-Generation Script

**File:** `scripts/generate-skills.ts`

**Purpose:** Single source of truth generation

**Features:**
- Reads all local SKILL.md files
- Fetches remote skills from skill-sources.yaml
- Generates `src/data/skills.ts` with type safety
- Generates `docs/skills/*.md` from SKILL.md content
- Validates all skills against schema
- Reports errors and warnings

**Usage:**
```bash
# Generate everything
npm run skills:generate

# Generate with verbose output
npm run skills:generate -- --verbose

# Validate only (no generation)
npm run skills:validate

# Watch mode for development
npm run skills:watch
```

### 2. Skill Submission Form

**File:** `src/pages/submit-skill.tsx`

**Purpose:** Web form for skill ideas

**Features:**
- Clean form UI matching site design
- Category dropdown with descriptions
- Tag multi-select
- Markdown preview for description
- GitHub authentication (optional, for attribution)
- Rate limiting to prevent spam
- Creates GitHub Issue on submit

### 3. GitHub Issues Integration

**File:** `scripts/lib/github-issues.ts`

**Purpose:** Bidirectional GitHub Issues sync

**Features:**
- Create issues from form submissions
- Label: `skill-submission`
- Template with structured data
- Status tracking via labels
- Fetch approved submissions for processing

### 4. Batch Processing CLI

**File:** `scripts/process-submissions.ts`

**Purpose:** Convert approved submissions to skills

**Features:**
- Fetch issues labeled `skill-submission` + `approved`
- Generate SKILL.md scaffold
- Create skill folder structure
- Open in editor for refinement
- Mark issue as `implemented` when done

**Usage:**
```bash
# List pending submissions
npm run skills:submissions list

# Process approved submissions
npm run skills:submissions process

# Process specific submission
npm run skills:submissions process --issue 123
```

### 5. Remote Skill Registry

**File:** `scripts/lib/remote-skills.ts`

**Purpose:** Fetch and integrate external skills

**Features:**
- Parse skill-sources.yaml
- Clone/fetch remote repos (cached)
- Validate remote SKILL.md files
- Merge into local skill registry
- Handle conflicts and versioning

## File Structure

```
website/
├── scripts/
│   ├── generate-skills.ts      # Main generation script
│   ├── process-submissions.ts  # Submission processing CLI
│   ├── validate-skills.ts      # Validation script
│   └── lib/
│       ├── skill-parser.ts     # SKILL.md parser
│       ├── skill-generator.ts  # skills.ts generator
│       ├── doc-generator.ts    # docs/skills/ generator
│       ├── github-issues.ts    # GitHub API integration
│       ├── remote-skills.ts    # Remote skill fetcher
│       └── types.ts            # Shared types
├── src/
│   ├── data/
│   │   └── skills.ts           # AUTO-GENERATED (do not edit)
│   └── pages/
│       └── submit-skill.tsx    # Submission form page
├── docs/
│   └── skills/                 # AUTO-GENERATED docs
├── skill-sources.yaml          # Remote skill registry
└── .github/
    └── ISSUE_TEMPLATE/
        └── skill-submission.yml # Issue template
```

## Schema Definitions

### SKILL.md Frontmatter Schema

```typescript
interface SkillFrontmatter {
  // Required
  name: string;           // Kebab-case identifier
  description: string;    // Full description (max 500 chars for cards)
  'allowed-tools': string; // Comma-separated tool list

  // Optional with defaults
  title?: string;         // Defaults to titleCase(name)
  category?: string;      // Defaults to 'Uncategorized'
  tags?: string[];        // Defaults to []
  badge?: 'NEW' | 'HOT' | 'ADVANCED' | 'EXPERIMENTAL';

  // Auto-generated (do not set manually)
  version?: string;       // From git history
  lastUpdated?: string;   // From git history
}
```

### Category Definitions

```typescript
const SKILL_CATEGORIES = {
  'AI & Machine Learning': {
    icon: '🤖',
    description: 'Skills for AI/ML development, prompting, and model integration',
  },
  'Code Quality & Testing': {
    icon: '✅',
    description: 'Testing, code review, refactoring, and quality assurance',
  },
  'Content & Writing': {
    icon: '✍️',
    description: 'Documentation, copywriting, and content creation',
  },
  'Data & Analytics': {
    icon: '📊',
    description: 'Data processing, visualization, and analysis',
  },
  'Design & Creative': {
    icon: '🎨',
    description: 'UI/UX design, graphics, and creative work',
  },
  'DevOps & Site Reliability': {
    icon: '⚙️',
    description: 'Infrastructure, deployment, and reliability engineering',
  },
  'Business & Monetization': {
    icon: '💰',
    description: 'Marketing, strategy, and business development',
  },
  'Research & Analysis': {
    icon: '🔬',
    description: 'Research, competitive analysis, and investigation',
  },
  'Productivity & Meta': {
    icon: '🚀',
    description: 'Workflow optimization and Claude-specific skills',
  },
  'Lifestyle & Personal': {
    icon: '🏠',
    description: 'Personal development, wellness, and life skills',
  },
} as const;
```

## Build Integration

### package.json Scripts

```json
{
  "scripts": {
    "skills:generate": "tsx scripts/generate-skills.ts",
    "skills:validate": "tsx scripts/generate-skills.ts --validate-only",
    "skills:watch": "tsx scripts/generate-skills.ts --watch",
    "skills:submissions": "tsx scripts/process-submissions.ts",
    "prebuild": "npm run skills:generate",
    "prestart": "npm run skills:generate"
  }
}
```

### Pre-commit Hook

```bash
#!/bin/bash
# .husky/pre-commit

# Regenerate skills if SKILL.md files changed
if git diff --cached --name-only | grep -q "SKILL.md"; then
  npm run skills:generate
  git add src/data/skills.ts docs/skills/
fi
```

## Security Considerations

### Form Submissions
- Rate limiting: 3 submissions per IP per hour
- CAPTCHA for non-authenticated users
- Input sanitization for all fields
- No direct code execution from submissions

### Remote Skills
- Allowlist of trusted repositories
- Signature verification for official skills
- Sandboxed validation of SKILL.md content
- No arbitrary code execution

### GitHub Integration
- Use fine-grained personal access token
- Minimal permissions: `issues:write`, `contents:read`
- Token stored in environment variables only

## Migration Plan

### Phase 1: Auto-Generation (Immediate)
1. Create generate-skills.ts script
2. Generate initial skills.ts and docs
3. Add to build pipeline
4. Remove manual skills.ts editing

### Phase 2: Submission Form (Week 1)
1. Create submit-skill page
2. Implement GitHub Issues creation
3. Create issue template
4. Test submission flow

### Phase 3: Batch Processing (Week 2)
1. Create process-submissions CLI
2. Implement approval workflow
3. Test end-to-end flow
4. Document for maintainers

### Phase 4: Remote Skills (Week 3)
1. Define skill-sources.yaml format
2. Implement remote fetcher
3. Add caching layer
4. Test with example external repo

## Success Metrics

- **Zero manual edits** to skills.ts after Phase 1
- **< 5 minutes** from submission to GitHub Issue
- **< 10 minutes** from approved to implemented skill
- **100% validation** coverage for all skill sources
- **Community contributions** enabled without repo access
