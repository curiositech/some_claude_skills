---
slug: /skills/code_necromancer
id: code_necromancer
title: Code Necromancer
description: Systematic framework for resurrecting and modernizing legacy codebases through archaeology, resurrection, and rejuvenation phases
sidebar_label: Code Necromancer
---

# Code Necromancer

Raise dead codebases from the grave. A systematic framework for understanding, resurrecting, and modernizing legacy codebases.

## Quick Facts

| Attribute | Value |
|-----------|-------|
| **Category** | DevOps & Site Reliability |
| **Activation Keywords** | legacy code, inherited codebase, no documentation, technical debt, resurrect, modernize |
| **Tools Required** | Read, Write, Edit, Bash, WebFetch |

## What It Does

The Code Necromancer skill guides you through three phases:

1. **ARCHAEOLOGY** - Understanding what exists in a multi-repo legacy system
2. **RESURRECTION** - Getting the system running again after years of dormancy
3. **REJUVENATION** - Modernizing the stack for current standards

## When to Use

**Use for:**
- Inheriting a codebase with 5+ repos and no documentation
- Resurrecting a product that hasn't been maintained for 2+ years
- Joining a company with significant technical debt and tribal knowledge loss
- Performing due diligence on acquired codebases
- Modernizing legacy systems without breaking existing functionality

**NOT for:**
- Greenfield projects
- Well-documented active codebases
- Simple dependency updates

## Phase 1: ARCHAEOLOGY

Create a complete map of the system before touching anything.

**Outputs:**
- **Repo Inventory** - All repositories with metadata, language, last activity
- **Dependency Graph** - Inter-repo and external dependencies (Mermaid)
- **Architecture Diagram** - Visual system topology
- **Tech Stack Matrix** - Language/framework versions per repo
- **Maturity Assessment** - Code quality, test coverage, documentation
- **Missing Pieces** - Gaps, orphaned repos, dead dependencies

## Phase 2: RESURRECTION

Get the system running in a development environment.

**Outputs:**
- **Dependency Audit** - Outdated packages, security vulnerabilities
- **Environment Map** - All required environment variables
- **Secrets Inventory** - API keys, certificates, OAuth credentials needed
- **Infrastructure Status** - Cloud resources that exist/need updating
- **Resurrection Blockers** - Critical issues preventing launch
- **Integration Tests** - Tests verifying components work together

## Phase 3: REJUVENATION

Modernize the system while maintaining feature parity.

**Outputs:**
- **Security Recommendations** - Vulnerability fixes, best practices
- **Modernization Roadmap** - Prioritized upgrades with effort estimates
- **Architecture Improvements** - Scalability and maintainability enhancements

## Key Commands

```bash
# List all repos in an org
gh repo list ORG_NAME --limit 1000 --json name,description,primaryLanguage,pushedAt

# Node.js dependency audit
npm outdated && npm audit && npx depcheck

# Python dependency audit
pip list --outdated && safety check && pipdeptree
```

## Success Metrics

### Archaeology Complete When:
- All repos cataloged with metadata
- Dependency graph visualized
- Architecture diagram created
- Core vs peripheral repos identified

### Resurrection Complete When:
- All services start locally
- Services can communicate with each other
- Integration tests pass
- At least one full user flow works

### Rejuvenation Complete When:
- No critical security vulnerabilities
- All dependencies reasonably current
- CI/CD pipeline working
- Team can develop new features

## Anti-Patterns

| Anti-Pattern | Problem | Solution |
|--------------|---------|----------|
| Premature Resurrection | Don't understand before running | Complete archaeology first |
| Scope Creep | Mixing phases | Finish each phase before next |
| Big Bang Updates | Update all dependencies at once | Incremental updates |
| Ignoring Tests | No way to measure progress | Write resurrection tests |
| Undocumented Changes | Lost knowledge | Document everything you learn |

## Installation

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
  <TabItem value="download" label="Download" default>
    Download from the [Skills Gallery](/skills) and extract to your `.claude/skills/` directory.
  </TabItem>
  <TabItem value="git" label="Git Clone">
    ```bash
    git clone https://github.com/erichowens/some_claude_skills.git
    cp -r some_claude_skills/.claude/skills/code-necromancer ~/.claude/skills/
    ```
  </TabItem>
</Tabs>

## Related Skills

- [Site Reliability Engineer](/docs/skills/site_reliability_engineer) - Build validation and pre-commit hooks
- [Research Analyst](/docs/skills/research_analyst) - Deep research for understanding systems
- [Orchestrator](/docs/skills/orchestrator) - Coordinate multi-skill analysis
