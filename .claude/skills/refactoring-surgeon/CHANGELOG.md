# Changelog

All notable changes to the refactoring-surgeon skill will be documented in this file.

## [2.0.0] - 2024-12-13

### Changed
- **BREAKING**: Restructured SKILL.md from 655 lines to ~170 lines for progressive disclosure
- Moved all large code examples to `./references/` directory
- Expanded anti-patterns section from 5 to 10 patterns

### Added
- `references/extract-method.ts` - Complete Extract Method example with before/after
- `references/replace-conditional-polymorphism.ts` - Polymorphism refactoring with Factory pattern
- `references/introduce-parameter-object.ts` - Parameter Object pattern with Builder variant
- `references/strangler-fig-pattern.ts` - Legacy code migration strategy with parallel run
- `scripts/validate-refactoring.sh` - Pre-refactoring validation script
- Version field in frontmatter for skill tracking

### Improved
- Anti-patterns section now covers 10 common refactoring mistakes
- Safety checklist expanded with before/during/after phases
- Better cross-references to code smell diagrams

## [1.0.0] - 2024-01-01

### Added
- Initial refactoring-surgeon skill
- Code smell detection guidance (Bloaters, OO Abusers, Change Preventers)
- Extract Method, Replace Conditional, Introduce Parameter Object examples
- Strangler Fig pattern for legacy migration
- Refactoring safety checklist
