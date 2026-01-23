# Changelog

## [1.1.0] - 2025-01-XX

### Changed
- **Frontmatter**: Added `allowed-tools:` (was missing tools entirely)
- **Description**: Added activation keywords and NOT clause for precise skill triggering
- **Structure**: Implemented progressive disclosure with /references/ directory

### Added
- `/references/investment-theory.md` - MPT, factor investing, sequence risk, emergency fund
- `/references/tax-optimization.md` - Asset location, tax-loss harvesting, Roth conversion
- `/references/withdrawal-math.md` - Trinity study, Monte Carlo simulation, FIRE calculations
- **Anti-Patterns section**: Tax optimization over returns, ignoring sequence risk, complexity
- **When to Use This Skill section**: Clear use/not-for guidance
- **Quick Reference tables**: SWR by CAPE, Factor premiums, FIRE numbers
- `python_dependencies` and `integrates_with` metadata

### Removed
- Detailed Python implementations (moved to references)
- Lengthy formula explanations (summarized in tables)
- Redundant disclaimers (consolidated)

### Metrics
- **Line reduction**: 559 → 137 lines (75% reduction)
- **Reference files created**: 3
- **Anti-patterns documented**: 4
