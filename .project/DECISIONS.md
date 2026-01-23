# Architecture Decision Records (ADRs)

Document significant technical and design decisions here.

---

## ADR-001: Windows 3.1 as Primary Design Language

**Date**: 2026-01-03
**Status**: Accepted
**Deciders**: Creative Design Virtuoso, UI/UX Designer

### Context
The site already uses Windows 3.1 aesthetic elements. Need to decide whether to embrace fully or modernize.

### Decision
Double down on Windows 3.1 as the primary differentiator. Create a comprehensive design system with:
- Beveled 3D buttons (outset/inset borders)
- Navy gradient title bars
- 4px black borders with 12px drop shadows
- System fonts (`var(--font-code)`, `var(--font-system)`)

### Rationale
- Creates instant recognition and memorability
- Differentiates from every other developer tool site
- Appeals to nostalgia while remaining functional
- Establishes brand identity without a traditional logo

### Consequences
- All new components must follow Win31 patterns
- May need accessibility review for contrast ratios
- Requires comprehensive component library

---

## ADR-002: Onboarding Before Tutorials

**Date**: 2026-01-03
**Status**: Accepted
**Deciders**: Product Launch Strategist, UX Analysis

### Context
New users have no guidance. Should we build tutorials first or onboarding?

### Decision
Build onboarding modal first (Phase 1), then tutorials (Phase 2).

### Rationale
- Onboarding captures intent immediately
- Enables personalized recommendations
- Simpler to implement (3-step wizard vs. full tutorial system)
- Can route to existing content while tutorials are built

### Consequences
- Need localStorage persistence for onboarding state
- Must track which path users choose for analytics
- Tutorials will build on onboarding data

---

## ADR-003: YAML-Driven Bundles

**Date**: 2026-01-03
**Status**: Accepted
**Deciders**: Frontend Developer, Backend considerations

### Context
How should bundle definitions be stored and managed?

### Decision
Use YAML files in `website/bundles/` with a build-time generator script.

### Rationale
- Human-readable and version-controllable
- No database required
- Easy for contributors to add bundles via PR
- Build-time validation catches errors early

### Consequences
- Need `scripts/generate-bundles.ts` to convert YAML → TypeScript
- Add to npm scripts: `npm run generate:bundles`
- Bundle changes require rebuild

---

## ADR-004: Vitest Over Jest

**Date**: 2026-01-03
**Status**: Accepted
**Deciders**: Frontend Developer

### Context
Need to add testing. Jest is traditional but Vitest is modern.

### Decision
Use Vitest with React Testing Library.

### Rationale
- Native ESM support (Docusaurus uses ESM)
- Faster than Jest
- Compatible API (easy migration if needed)
- Built-in coverage via c8

### Consequences
- Install `vitest`, `@testing-library/react`, `jsdom`
- Configure `vitest.config.ts`
- Test files: `*.test.tsx` alongside components

---

## ADR-005: localStorage for Progress Tracking

**Date**: 2026-01-03
**Status**: Accepted
**Deciders**: Frontend Developer, Privacy considerations

### Context
Need to persist user progress (onboarding, tutorials). Options: localStorage, cookies, backend.

### Decision
Use localStorage for all progress tracking.

### Rationale
- No backend required
- Privacy-friendly (data stays on device)
- Simple implementation
- Works offline
- Aligns with Plausible's privacy-first philosophy

### Consequences
- Progress won't sync across devices
- Need to handle localStorage unavailability gracefully
- Consider optional account system in future for sync

---

## Template

```markdown
## ADR-XXX: Title

**Date**: YYYY-MM-DD
**Status**: Proposed | Accepted | Deprecated | Superseded
**Deciders**: Who made this decision

### Context
What is the issue or situation?

### Decision
What was decided?

### Rationale
Why was this decision made?

### Consequences
What are the implications?
```
