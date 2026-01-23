# Changelog

## [2.0.0] - 2024-12-XX

### Changed
- **SKILL.md restructured** for progressive disclosure (471 → ~130 lines)
- Detailed algorithms extracted to reference files
- HTML entity escaping for MDX compatibility (`&lt;`, `&gt;`)

### Added
- `references/core-algorithms.md` - PBD loop, Verlet integration, quaternion math, solver implementations
- `references/tangle-physics.md` - Multi-rope collision, Capstan friction, TangleConstraint
- Shibboleths table comparing novice vs expert approaches
- Performance budgets (single rope &lt;0.5ms, three-dog leash &lt;0.7ms)
- Evolution timeline (2006 PBD → 2024 ALEM/BDEM)

### Migration Guide
- No changes to frontmatter or activation triggers
- Code implementations now in reference files for copy-paste use
- Main SKILL.md focuses on decision-making and quick reference
