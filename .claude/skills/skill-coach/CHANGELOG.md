# Changelog

All notable changes to the skill-coach skill will be documented in this file.

## [2.2.0] - 2025-12-04

### Added
- `scripts/test_activation.py` - Automated activation testing with keyword extraction
  - Extracts positive/negative keywords from description
  - Generates test queries automatically
  - Reports pass/fail rate against 90% target
- `references/scoring-rubric.md` - Quantitative skill evaluation (0-10 scoring)
  - 5 scoring categories: Activation Precision, Domain Expertise, Progressive Disclosure, Self-Containment, Maintainability
  - Composite score formula with grade mapping (A-F)
- `references/skill-composition.md` - Cross-skill dependency patterns
  - Sequential, Parallel, Hierarchical dependency types
  - Composition anti-patterns with fixes
  - Example photo analysis pipeline
- `references/skill-lifecycle.md` - Maintenance and versioning guidance
  - 5 lifecycle stages: DRAFT → ACTIVE → MATURE → DEPRECATED → ARCHIVED
  - Maintenance checklists (monthly, quarterly, annually)
  - Health indicators table
- 4 real-world failure case studies added to `references/antipatterns.md`:
  - Photo Expert Explosion (Everything Skill anti-pattern)
  - Phantom MCP (Reference Illusion anti-pattern)
  - Time Bomb (stale temporal knowledge)
  - Activation Black Hole (generic description)
- Activation debugging flowchart in SKILL.md (ASCII decision tree)
- Recursive self-improvement workflow in SKILL.md

### Changed
- Description now uses third person ("Activates for..." not "when users mention...")
- Bash permissions scoped from `Bash` to `Bash(python:*,wc:*,find:*,grep:*)`
- Added "improve skill" to activation keywords
- Consolidated duplicate antipatterns files (merged `anti-patterns.md` into `antipatterns.md`)
- Updated reference table with 4 new files

### Fixed
- Validation warning: Description no longer uses first/second person
- Validation warning: Bash tool is now scoped (was unrestricted)

### Metrics
- Activation precision: 100% (12/12 tests passed)
- SKILL.md: 240 lines (within 500 line limit)
- New reference files: 4 (scoring-rubric, skill-composition, skill-lifecycle, test_activation.py)

## [2.1.1] - 2025-12-01

### Added
- `scripts/check_self_contained.py` - Validates skills ship working tools, not just instructions
  - Detects Phantom Tools (referenced files that don't exist)
  - Detects Template Soup (scripts with TODO/FIXME markers)
  - Validates MCP server completeness (package.json, dependencies, source)
  - Checks agent definition completeness
  - Reports "instructions only" vs "self-contained with tools"

### Changed
- skill-coach now practices what it preaches (eats its own dogfood)

## [2.1.0] - 2025-12-01

### Added
- **Self-Contained Skills** section (RECOMMENDED) - strongly advocates shipping working tools
- `references/self-contained-tools.md` - Complete implementation patterns for:
  - Working scripts (not templates)
  - MCP server implementations
  - Subagent definitions and orchestration
- Decision tree: "What tools does my skill need?"
- Anti-patterns: Phantom Tools, Template Soup, Dependency Hell, MCP Without Purpose
- Self-contained checklist for skill authors

### Changed
- Skill structure now shows scripts/mcp-server/agents as **Strongly Recommended**
- Philosophy shift: "Skills with working tools are immediately useful"

### Why This Matters
Skills that only provide instructions require users to implement everything themselves.
Skills that ship working tools let users be productive immediately.

## [2.0.0] - 2025-11-29

### Changed
- **SKILL.md restructured** for progressive disclosure (471 → ~161 lines)
- Content organized into quick reference format

### Added
- `references/anti-patterns.md` - 12 documented anti-patterns with fixes
- `references/shibboleths.md` - 9 expert vs novice indicators
- `references/validation-checklist.md` - 30+ validation criteria organized by category
- Decision tree format for common scenarios
- Integration guide with other skills

### Migration
- No changes to frontmatter or activation triggers
- Validation checklist now available for systematic review
- Anti-patterns guide helps avoid common mistakes

## [1.2.0] - 2025-11-26

### Added
- **MCP & Tool Research (MANDATORY)** section - comprehensive guide for researching MCPs
- Research process with 4 steps: Web Search, Check Registries, Evaluate Quality, Add to Skill
- Domain-Specific MCP Examples table
- Anti-pattern: Assuming No MCPs Exist
- Anti-pattern: Adding MCPs Without Testing
- MCP research added to Quick Start workflow (step 2)
- MCP research added to Review Checklist (CRITICAL section)

### Changed
- Updated Review Checklist: `allowed-tools` guidance now emphasizes including relevant MCPs
- Quick Start now has 6 steps instead of 5 (added MCP research step)

## [1.1.0] - 2025-11-26

### Added
- Versioning Skills section with complete guidance
- CHANGELOG.md format template
- Version numbering explanation (MAJOR/MINOR/PATCH)
- "Why version skills?" rationale
- Recommended structure now includes CHANGELOG.md
- CHANGELOG.md tracking added to Review Checklist (HIGH PRIORITY)

## [1.0.0] - 2025-01-01

### Added
- Initial skill creation
- Progressive disclosure architecture
- Description field design patterns
- Anti-pattern detection framework
- Temporal knowledge capture
- Domain-specific shibboleths
- Skill review checklist
- Testing guidelines
- Decision trees for skill creation
