# Changelog

All notable completed work for the Some Claude Skills platform enhancement.

---

## [2026.02] - 2026-02-27

### New Skills (100+ added, now 175+ total)

**DAG Orchestration Suite** — 25 skills for intelligent multi-agent workflow execution:
- `dag-executor`, `dag-graph-builder`, `dag-task-scheduler`, `dag-parallel-executor`
- `dag-dependency-resolver`, `dag-dynamic-replanner`, `dag-context-bridger`
- `dag-output-validator`, `dag-confidence-scorer`, `dag-hallucination-detector`
- `dag-execution-tracer`, `dag-performance-profiler`, `dag-pattern-learner`
- `dag-semantic-matcher`, `dag-skill-registry`, `dag-feedback-synthesizer`
- `dag-failure-analyzer`, `dag-convergence-monitor`, `dag-isolation-manager`
- `dag-iteration-detector`, `dag-scope-enforcer`, `dag-capability-ranker`
- `dag-permission-validator`, `dag-result-aggregator`, `dag-visual-editor-design`

**Design & Creative:**
- `design-archivist` — Catalog and version design systems
- `design-system-creator` / `design-system-generator` — Generate design systems and Tailwind configs
- `design-critic`, `design-justice`, `dark-mode-design-expert`
- `neobrutalist-web-designer`, `vaporwave-glassomorphic-ui-designer`
- `windows-3-1-web-designer`, `windows-95-web-designer` — Retro OS aesthetics
- `typography-expert`, `hand-drawn-infographic-creator`, `pixel-art-infographic-creator`

**Developer Tools:**
- `nextjs-app-router-expert`, `drizzle-migrations`, `react-performance-optimizer`
- `playwright-e2e-tester`, `playwright-screenshot-inspector`, `vitest-testing-patterns`
- `github-actions-pipeline-builder`, `terraform-iac-expert`, `vercel-deployment`, `pwa-expert`
- `openapi-spec-writer`, `rest-api-design`, `oauth-oidc-implementer`, `modern-auth-2026`
- `llm-streaming-response-handler`, `mdx-sanitizer`, `fullstack-debugger`, `refactoring-surgeon`
- `execution-lifecycle-manager`, `cost-accrual-tracker`, `cost-verification-auditor`

**AI & Data:**
- `ai-engineer` — Production LLM apps, RAG systems, and agents
- `computer-vision-pipeline`, `clip-aware-embeddings`, `geospatial-data-pipeline`
- `large-scale-map-visualization`, `data-viz-2025`, `event-detection-temporal-intelligence-expert`

**Creative & Media:**
- `ai-video-production-master`, `sound-engineer`, `voice-audio-engineer`, `video-processing-editing`

**Health, Wellbeing & Specialty:**
- `crisis-detection-intervention-ai`, `crisis-response-protocol`, `grief-companion`
- `hrv-alexithymia-expert`, `jungian-psychologist`, `wisdom-accountability-coach`
- Recovery suite: `recovery-coach-patterns`, `recovery-app-onboarding`, `recovery-app-legal-terms`, `recovery-education-writer`, `recovery-social-features`, `recovery-community-moderator`
- `2026-legal-research-agent`, `national-expungement-expert`, `hipaa-compliance`
- `digital-estate-planner`, `interior-design-expert`, `wedding-immortalist`, `pet-memorial-creator`

### New Features

**DAG Execution Framework** (`/dag`)
- Visual DAG Builder with drag-and-drop node creation and dependency management
- Real-time Execution Monitor with logs, progress, and statistics
- Skill orchestration with parallel execution and smart scheduling
- Semantic skill matching: automatically finds best skills for any task
- Built-in output validation, confidence scoring, and hallucination detection
- Full execution tracing and performance profiling

**Skill Bundles** (`/bundles`)
- 5 curated bundles for common workflows with one-click install commands:
  - **Startup MVP Kit** — UI + API + database + deployment
  - **AI Development Stack** — RAG, LLM, MCP, and agents
  - **Code Review Suite** — automated review, testing, and quality
  - **Documentation Powerhouse** — technical writing and API docs
  - **Personal Growth Bundle** — coaching, career, and productivity
- Filter by audience (developers, entrepreneurs, teams) and difficulty

**New Pages**
- `/agents` — Council Agents gallery with pixel art hero images
- `/artifacts` — Showcase of real skill outputs
- `/bundles` — Curated skill bundles
- `/changelog` — Live changelog with filterable history
- `/dag` — DAG execution framework overview
- `/mcps` — MCP servers gallery and installation
- `/metrics` — Platform metrics dashboard
- `/submit-skill` — Community skill submission form (GitHub Issues integration)

**Agent Skills Integration**
- New recommended installation: `npx skills add curiositech/some_claude_skills`
- Works with Claude Code, Codex, Cursor, OpenCode, and any Agent Skills-compatible agent
- Single skill: `npx skills add curiositech/some_claude_skills -s <skill-name>`
- Install all 175+: `npx skills add curiositech/some_claude_skills --all`

**Ecosystem Dashboard**
- Interactive knowledge graph of skill relationships
- Stats panel with real-time Plausible analytics
- Agent gallery with 14 Founding Council agents

**Design & UX**
- Pixel art backsplash images across 9 pages
- Win31 design system components (`Win31Modal`, `Win31Button`, `Win31Window`, `Win31Wizard`)
- Skill ZIP downloads from gallery cards
- Tutorial progress tracking with localStorage persistence
- Konami Easter Egg 🕹️

### Security Fixes
- OG image URLs now use `siteConfig.url` instead of hardcoded domain
- OAuth documentation: in-memory token storage instead of `localStorage` (prevents XSS)
- PostgreSQL documentation: `scram-sha-256` authentication (replaces deprecated `md5`)

---

## [Unreleased]

### Planning & Documentation
- Created UX Deep Analysis with Gestalt + Markov chain modeling
- Consulted 6 specialized agents for strategic direction
- Created Master Implementation Plan (`docs/MASTER_IMPLEMENTATION_PLAN.md`)
- Created Sequential Task List with code specs (`docs/SEQUENTIAL_TASK_LIST.md`)
- Set up project tracking structure (`.project/`)
- Updated CLAUDE.md with development context

---

## Format

```markdown
## [Version or Date] - YYYY-MM-DD

### Added
- New features

### Changed
- Changes to existing functionality

### Fixed
- Bug fixes

### Removed
- Removed features

### Security
- Security improvements
```

---

## Versioning Strategy

This project uses date-based versioning for the platform:
- Major releases: `YYYY.MM` (e.g., `2026.01`)
- Patch releases: `YYYY.MM.patch` (e.g., `2026.01.1`)

Phases map to releases:
- Phase 1 (Foundation + Onboarding) → `2026.01`
- Phase 2 (Tutorials) → `2026.02`
- Phase 3 (Bundles) → `2026.02`
- Phase 4 (Videos) → `2026.03`
- Phase 5 (Polish) → `2026.03`
