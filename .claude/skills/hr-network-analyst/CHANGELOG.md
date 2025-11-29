# Changelog

## [2.0.0] - 2024-01-XX

### Changed
- **BREAKING**: Restructured from monolithic 694-line file to progressive disclosure architecture
- Fixed frontmatter format: `tools:` → `allowed-tools:` (comma-separated)
- Added NOT clause to description for precise activation boundaries
- Reduced SKILL.md from 694 lines to 148 lines (79% reduction)

### Added
- `references/network-theory.md` - Betweenness centrality, structural holes, Gladwell archetypes
- `references/data-sources-implementation.md` - Network construction, data extraction, Python code
- Anti-patterns section with "What it looks like / Why wrong / Instead" format
- Quick reference for Gladwell archetypes (Connectors, Mavens, Salesmen)
- Compact analysis workflow table

### Removed
- Verbose network science explanations (moved to references)
- Inline Python implementations (moved to references)
- Redundant metric calculations

### Migration Guide
Reference files are now in `/references/` directory. Import patterns:
- Network theory background → `references/network-theory.md`
- Python implementations → `references/data-sources-implementation.md`
