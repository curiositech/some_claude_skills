---
sidebar_label: Refactoring Surgeon
sidebar_position: 1
---

# ✅ Refactoring Surgeon

Expert code refactoring specialist for improving code quality without changing behavior. Activate on: refactor, code smell, technical debt, legacy code, cleanup, simplify, extract method, extract class, DRY, SOLID principles. NOT for: new feature development (use feature skills), bug fixing (use debugging skills), performance optimization (use performance skills).

---

## Allowed Tools

```
Read, Write, Edit, Bash(npm test:*, npm run lint:*, git:*)
```

## Tags

`refactoring` `code-smells` `solid` `dry` `cleanup`

## 🤝 Pairs Great With

- **[Code Necromancer](/docs/skills/code_necromancer)**: Refactor resurrected legacy code
- **[Test Automation Expert](/docs/skills/test_automation_expert)**: Tests before refactoring

# Refactoring Surgeon

Expert code refactoring specialist focused on improving code quality without changing behavior.

## Quick Start

1. **Ensure tests exist** - Never refactor without a safety net
2. **Identify the smell** - Name the specific code smell you're addressing
3. **Make small changes** - One refactoring at a time, commit frequently
4. **Run tests after each change** - Behavior must remain identical
5. **Don't add features** - Refactoring ≠ enhancement
6. **Document significant changes** - Explain the "why" for future maintainers

## Core Capabilities

| Category | Techniques |
|----------|------------|
| **Extraction** | Extract Method, Extract Class, Extract Interface |
| **Movement** | Move Method, Move Field, Inline Method |
| **Simplification** | Replace Conditional with Polymorphism, Decompose Conditional |
| **Organization** | Introduce Parameter Object, Replace Magic Numbers |
| **Legacy Migration** | Strangler Fig, Branch by Abstraction, Parallel Change |

## Code Smells Reference

### Bloaters
```
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│    Long Method      │    │    Large Class      │    │   Long Parameter    │
│  > 20 lines?        │    │  > 200 lines?       │    │       List          │
│  → Extract Method   │    │  → Extract Class    │    │  → Parameter Object │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
```

### OO Abusers
```
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│  Switch Statements  │    │   Refused Bequest   │    │   Parallel          │
│  Type-checking?     │    │  Unused inheritance?│    │   Hierarchies       │
│  → Polymorphism     │    │  → Delegation       │    │  → Move Method      │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
```

### Change Preventers
```
┌─────────────────────┐    ┌─────────────────────┐
│  Divergent Change   │    │  Shotgun Surgery    │
│  One class, many    │    │  One change, many   │
│  reasons to change? │    │  classes affected?  │
│  → Extract Class    │    │  → Move/Inline      │
└─────────────────────┘    └─────────────────────┘
```

## Reference Examples

Complete refactoring examples in `./references/`:

| File | Pattern | Use Case |
|------|---------|----------|
| `extract-method.ts` | Extract Method | Long methods → focused functions |
| `replace-conditional-polymorphism.ts` | Replace Conditional | switch/if → polymorphic classes |
| `introduce-parameter-object.ts` | Parameter Object | Long params → structured objects |
| `strangler-fig-pattern.ts` | Strangler Fig | Legacy code → gradual migration |

## Anti-Patterns (10 Critical Mistakes)

### 1. Big Bang Refactoring
**Symptom**: Rewriting entire modules in one massive change
**Fix**: Strangler fig pattern, small incremental changes with tests

### 2. Refactoring Without Tests
**Symptom**: Changing structure without test coverage
**Fix**: Write characterization tests first, add coverage for affected areas

### 3. Premature Abstraction
**Symptom**: Creating generic frameworks "for future flexibility"
**Fix**: Wait for three concrete examples before abstracting (Rule of Three)

### 4. Renaming Without IDE Support
**Symptom**: Find-and-replace that misses occurrences
**Fix**: Use IDE refactoring tools, search for usages first

### 5. Mixing Refactoring and Features
**Symptom**: Adding new functionality while restructuring
**Fix**: Separate commits - refactor first, then add features

### 6. Ignoring Code Reviews
**Symptom**: Large refactoring PRs that are hard to review
**Fix**: Small, focused PRs with clear commit messages

### 7. Over-Abstracting
**Symptom**: Three layers of abstraction for a simple operation
**Fix**: YAGNI - start concrete, abstract when patterns emerge

### 8. Incomplete Refactoring
**Symptom**: Starting Extract Method but leaving partial duplication
**Fix**: Complete the refactoring or revert - no half-measures

### 9. Refactoring Production During Incidents
**Symptom**: "I'll just clean this up while I'm here..."
**Fix**: Never refactor during incidents - fix the bug, create a ticket

### 10. Not Measuring Improvement
**Symptom**: Refactoring without knowing if it helped
**Fix**: Track metrics: complexity, test coverage, build time

## Safety Checklist

**Before Refactoring:**
- [ ] Code compiles/runs successfully
- [ ] All tests pass
- [ ] Test coverage is adequate for area being refactored
- [ ] Commit current state (can rollback)

**During Refactoring:**
- [ ] Make small, incremental changes
- [ ] Run tests after each change
- [ ] Keep behavior identical
- [ ] Don't add features while refactoring

**After Refactoring:**
- [ ] All tests still pass
- [ ] No new warnings/errors
- [ ] Code is more readable
- [ ] Complexity metrics improved
- [ ] Document significant changes

## Quality Checklist

- [ ] No behavior changes (tests prove this)
- [ ] Improved readability
- [ ] Reduced complexity (cyclomatic, cognitive)
- [ ] Better adherence to SOLID principles
- [ ] Removed duplication (DRY)
- [ ] More testable code
- [ ] Clear naming
- [ ] Appropriate abstractions (not over-engineered)

## Validation Script

Run `./scripts/validate-refactoring.sh` to check:
- Test coverage presence
- Code smell indicators
- Duplication patterns
- Complexity metrics
- SOLID violations
- Refactoring safety (git, uncommitted changes)

## External Resources

- [Refactoring.Guru](https://refactoring.guru/)
- [Martin Fowler's Refactoring Catalog](https://refactoring.com/catalog/)
- [Working Effectively with Legacy Code](https://www.oreilly.com/library/view/working-effectively-with/0131177052/)
