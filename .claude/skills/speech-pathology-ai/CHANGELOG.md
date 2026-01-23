# Changelog

## [1.1.0] - 2025-01-XX

### Changed
- **Frontmatter**: Changed `tools:` to `allowed-tools:` format for Claude Code compatibility
- **Description**: Added activation keywords and NOT clause for precise skill triggering
- **Structure**: Implemented progressive disclosure with /references/ directory

### Added
- `/references/ai-models.md` - PERCEPT-R classifier, wav2vec 2.0 implementations
- `/references/acoustic-analysis.md` - PhonemeAnalyzer, VocalTractVisualizer
- `/references/therapy-interventions.md` - MinimalPairTherapy, FluencyTherapy, AACDevice
- `/references/mellifluo-platform.md` - MellifluoFeedbackEngine, AdaptivePracticeEngine
- **Anti-Patterns section**: Common mistakes and how to avoid them
- **When to Use This Skill section**: Clear use/not-for guidance

### Metrics
- **Line reduction**: 1362 → 173 lines (87% reduction)
- **Reference files created**: 4
- **Anti-patterns documented**: 4
