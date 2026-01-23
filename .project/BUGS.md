# Known Issues & Blockers

Track bugs, blockers, and technical debt here.

---

## Active Issues

### High Priority

*None currently*

### Medium Priority

| ID | Issue | Impact | Status | Notes |
|----|-------|--------|--------|-------|
| UX-001 | Marquee text hard to read | Users miss important info | `open` | Navy on gray, small font |
| UX-002 | QuickView has 5 equal buttons | Decision paralysis | `open` | Need visual hierarchy |
| UX-003 | No first-time user guidance | High bounce rate | `open` | Onboarding modal will fix |
| UX-004 | No way to track learning progress | Users don't return | `open` | Tutorial system will fix |

### Low Priority

| ID | Issue | Impact | Status | Notes |
|----|-------|--------|--------|-------|
| PERF-001 | Large skill list may slow on mobile | Minor | `open` | Consider virtualization |
| A11Y-001 | Keyboard navigation incomplete | Accessibility | `open` | Tab order needs review |

---

## Resolved Issues

| ID | Issue | Resolution | Date |
|----|-------|------------|------|
| - | - | - | - |

---

## Technical Debt

| Item | Severity | Notes |
|------|----------|-------|
| No test coverage | High | Adding Vitest in Phase 0 |
| No logging system | Medium | Adding logger utility in Phase 0 |
| Inconsistent component patterns | Low | Will standardize with Win31 system |

---

## Blockers

*None currently*

---

## How to Add Issues

```markdown
| ID | Issue | Impact | Status | Notes |
|----|-------|--------|--------|-------|
| PREFIX-### | Short description | Who/what affected | `open`/`in-progress`/`blocked` | Context |
```

Prefixes:
- `UX-` : User experience issues
- `PERF-` : Performance issues
- `A11Y-` : Accessibility issues
- `BUG-` : Functional bugs
- `DEBT-` : Technical debt
