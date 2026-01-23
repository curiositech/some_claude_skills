# Changelog

## [1.1.0] - 2025-01-XX

### Changed
- **Frontmatter**: Changed `tools:` to `allowed-tools:` format for Claude Code compatibility
- **Description**: Added activation keywords and NOT clause for precise skill triggering
- **Structure**: Implemented progressive disclosure with /references/ directory

### Added
- `/references/hrv-metrics.md` - Time/frequency domain calculations, EmotionalStateMonitor
- `/references/alexithymia-assessment.md` - TAS-20 details, emotion vocabulary ladder
- `/references/training-protocols.md` - HRVBiofeedbackTraining, case example
- **Anti-Patterns section**: Common mistakes (treating HRV as absolute, ignoring context, etc.)
- **When to Use This Skill section**: Clear use/not-for guidance

### Removed
- Redundant code examples (moved to references)
- Detailed case study (moved to training-protocols.md)
- Extensive tool/app lists (condensed)

### Metrics
- **Line reduction**: 550 → 141 lines (74% reduction)
- **Reference files created**: 3
- **Anti-patterns documented**: 4
