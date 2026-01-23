# Project Roadmap

## Current Sprint: Phase 1 - Foundation & Onboarding

**Goal**: Establish infrastructure and create first-time user experience

### Week 1-2: Foundation

| Task | Status | Owner | Notes |
|------|--------|-------|-------|
| Logger utility (`src/utils/logger.ts`) | `pending` | - | Debug/info/warn/error with namespace |
| TypeScript types (`src/types/features.ts`) | `pending` | - | Tutorial, Bundle, Video, Onboarding interfaces |
| Vitest configuration | `pending` | - | `vitest.config.ts` + test setup |
| Win31 design system components | `pending` | - | Modal, Button, Window base components |

### Week 2-4: Onboarding Modal

| Task | Status | Owner | Notes |
|------|--------|-------|-------|
| `Win31Modal` base component | `pending` | - | Reusable dialog with title bar, close button |
| `useOnboarding` hook | `pending` | - | localStorage persistence, path selection |
| `OnboardingModal` component | `pending` | - | 3-step wizard with path selection |
| Homepage integration | `pending` | - | Show on first visit, re-trigger from menu |
| Tests for onboarding flow | `pending` | - | Hook + component tests |

---

## Future Sprints

### Phase 2: Tutorial System (Weeks 5-8)

- `useTutorialProgress` hook with localStorage
- `TutorialStep` component with code copying
- `TutorialLayout` wrapper for MDX
- 3 launch tutorials:
  1. Getting Started (install → first skill)
  2. Building Your First Skill
  3. MCP Integration
- Progress dashboard page

### Phase 3: Skill Bundles (Weeks 9-11)

- Bundle YAML schema definition
- `scripts/generate-bundles.ts` generator
- `BundleCard` component
- `/bundles` page with filtering
- 5 launch bundles:
  - Startup MVP Kit
  - Code Review Suite
  - Documentation Powerhouse
  - DevOps Essentials
  - AI Development Stack

### Phase 4: Video Walkthroughs (Weeks 12-14)

- `Win31VideoPlayer` component (VHS aesthetic)
- Video gallery page
- YouTube/Loom embed integration
- 3 launch videos:
  1. Install to First Skill (5 min)
  2. Building a Custom Skill (10 min)
  3. Bundles Deep Dive (8 min)

### Phase 5: UX Polish (Weeks 15-16)

- Fix marquee readability
- Improve QuickView button hierarchy
- Add "New" badges to recent skills
- Performance optimizations
- Accessibility audit

---

## Backlog (Unprioritized)

- [ ] Skill search with fuzzy matching
- [ ] User accounts with progress sync
- [ ] Skill ratings and reviews
- [ ] Community skill submissions
- [ ] AI-powered skill recommendations
- [ ] Skill dependency graphs
- [ ] Interactive skill playground
- [ ] Newsletter integration
- [ ] Discord bot for skill lookup
- [ ] CLI tool: `npx some-claude-skills install <bundle>`

---

## Success Metrics

| Metric | Current | Target (Phase 1) | Target (Launch) |
|--------|---------|------------------|-----------------|
| Bounce rate | Unknown | &lt;60% | &lt;40% |
| Avg. session duration | Unknown | &gt;2 min | &gt;4 min |
| Skills installed (estimated) | Unknown | +20% | +100% |
| Tutorial completion rate | N/A | &gt;50% | &gt;70% |
| Return visitor rate | Unknown | &gt;20% | &gt;35% |

---

*Last updated: 2026-01-03*
