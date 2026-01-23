# Worktree Parallelization Guide

This project supports parallel development using git worktrees. This document outlines which tasks can run in parallel and how to coordinate.

---

## Parallelizable Streams

Three independent development streams can proceed simultaneously:

```
┌─────────────────────────────────────────────────────────────────┐
│                    PARALLEL DEVELOPMENT STREAMS                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Stream A (UI Components)                                        │
│  ─────────────────────────                                       │
│  Win31Modal → OnboardingModal → TutorialStep → VideoPlayer      │
│       │            │                │              │             │
│       ▼            ▼                ▼              ▼             │
│  [Reusable]   [3-step wizard]  [Interactive]  [VHS style]       │
│                                                                  │
│  Stream B (Data & Generation)                                    │
│  ─────────────────────────────                                   │
│  Types → Bundle YAML Schema → Generator Script → Bundle Page    │
│    │            │                   │                │           │
│    ▼            ▼                   ▼                ▼           │
│  [TS defs]  [YAML spec]      [Build script]    [React page]     │
│                                                                  │
│  Stream C (Infrastructure)                                       │
│  ─────────────────────────                                       │
│  Logger → Vitest Setup → Analytics Events → Performance         │
│     │          │               │                  │              │
│     ▼          ▼               ▼                  ▼              │
│  [Utility]  [Config]      [Plausible]       [Monitoring]        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Worktree Setup

### Creating Worktrees

```bash
# From main repository
cd /Users/erichowens/coding/some_claude_skills

# Create worktrees for each stream
git worktree add ../scs-stream-a -b feature/ui-components
git worktree add ../scs-stream-b -b feature/data-generation
git worktree add ../scs-stream-c -b feature/infrastructure
```

### Directory Structure After Setup

```
/Users/erichowens/coding/
├── some_claude_skills/     # Main worktree (main branch)
├── scs-stream-a/           # UI Components stream
├── scs-stream-b/           # Data & Generation stream
└── scs-stream-c/           # Infrastructure stream
```

---

## Stream Assignments

### Stream A: UI Components
**Branch**: `feature/ui-components`
**Focus**: Visual components and user-facing features

| Task | Dependencies | Files |
|------|--------------|-------|
| Win31Modal | None | `src/components/win31/Win31Modal.tsx`, `.module.css`, `.test.tsx` |
| Win31Button | None | `src/components/win31/Win31Button.tsx`, etc. |
| OnboardingModal | Win31Modal | `src/components/onboarding/OnboardingModal.tsx`, etc. |
| TutorialStep | Win31Button | `src/components/tutorial/TutorialStep.tsx`, etc. |
| Win31VideoPlayer | Win31Modal | `src/components/video/Win31VideoPlayer.tsx`, etc. |

### Stream B: Data & Generation
**Branch**: `feature/data-generation`
**Focus**: Data structures, schemas, and build scripts

| Task | Dependencies | Files |
|------|--------------|-------|
| Type definitions | None | `src/types/features.ts` |
| Bundle YAML schema | Types | `bundles/*.yaml` |
| Bundle generator | Schema | `scripts/generate-bundles.ts` |
| Skills generator updates | Types | `scripts/generate-skills.ts` |
| Bundle page | Generator | `src/pages/bundles.tsx` |

### Stream C: Infrastructure
**Branch**: `feature/infrastructure`
**Focus**: Tooling, testing, logging, analytics

| Task | Dependencies | Files |
|------|--------------|-------|
| Logger utility | None | `src/utils/logger.ts`, `.test.ts` |
| Vitest config | None | `vitest.config.ts`, `vitest.setup.ts` |
| Analytics events | Logger | Updates to `usePlausibleTracking.ts` |
| Performance monitoring | Logger | `src/utils/performance.ts` |

---

## Merge Coordination

### Merge Order

```
1. Stream C (Infrastructure) → main
   - Logger and Vitest are foundational
   - Other streams can then use them

2. Stream B (Data) → main
   - Types needed by components
   - Generator scripts needed before pages

3. Stream A (UI) → main
   - Components use types and logger
   - Final integration
```

### Conflict Prevention

Files that MUST NOT be edited in parallel:
- `package.json` - Coordinate dependency additions
- `src/pages/index.tsx` - Homepage changes need coordination
- `sidebars.js` - Sidebar structure changes
- `docusaurus.config.js` - Config changes

### Communication Protocol

Before merging:
1. Update `.project/PROGRESS.md` with work completed
2. Run full test suite: `npm test`
3. Run build: `npm run build`
4. Coordinate on Slack/Discord if touching shared files

---

## Quick Reference

### Start Work on Stream A
```bash
cd ../scs-stream-a
git pull origin main
npm install
npm run start
```

### Sync with Main
```bash
git fetch origin main
git rebase origin/main
```

### Complete Stream and Merge
```bash
# In stream worktree
git push origin feature/ui-components

# Create PR, get review, merge

# In main worktree
git pull origin main
git worktree remove ../scs-stream-a
```

---

## Current Status

| Stream | Branch | Status | Last Updated |
|--------|--------|--------|--------------|
| A (UI) | - | Not started | - |
| B (Data) | - | Not started | - |
| C (Infra) | - | Not started | - |

---

## Notes

- Each stream should have its own Claude Code session
- Share findings in `.project/PROGRESS.md`
- Complex decisions go in `.project/DECISIONS.md`
- Bugs discovered go in `.project/BUGS.md`
