# Changelog

## [2.0.0] - 2024-01-XX

### Changed
- **BREAKING**: Restructured from monolithic 691-line file to progressive disclosure architecture
- Fixed frontmatter format: `tools:` → `allowed-tools:` (comma-separated)
- Added NOT clause to description for precise activation boundaries
- Reduced SKILL.md from 691 lines to 153 lines (78% reduction)

### Added
- `references/resume-protocol.md` - 8-step generation protocol, ATS scoring breakdown
- `references/formatting-rules.md` - Best practices, templates, output formats
- `references/interfaces-integration.md` - TypeScript interfaces, three-skill workflow
- Anti-patterns section with "What it looks like / Why wrong / Instead" format
- ATS scoring quick reference (30/20/30/20 breakdown)
- Template system documentation (Minimalist, Traditional, Creative, Academic)

### Removed
- Inline TypeScript interfaces (moved to references)
- Verbose resume examples (condensed to key patterns)
- Redundant formatting rules

### Migration Guide
Reference files are now in `/references/` directory. Import patterns:
- Generation protocol → `references/resume-protocol.md`
- Template system → `references/formatting-rules.md`
- TypeScript types → `references/interfaces-integration.md`
