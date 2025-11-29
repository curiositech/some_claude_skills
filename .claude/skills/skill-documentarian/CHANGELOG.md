# Changelog

## [2.0.0] - 2024-01-XX

### Changed
- **BREAKING**: Restructured from monolithic 1124-line file to progressive disclosure architecture
- Fixed frontmatter format: `tools:` → `allowed-tools:` (comma-separated)
- Added NOT clause to description for precise activation boundaries
- Reduced SKILL.md from 1124 lines to 182 lines (84% reduction)

### Added
- `references/automation-scripts.md` - Git hooks, sync scripts, validation
- `references/documentation-templates.md` - MDX templates, frontmatter specs
- `references/workflow-integration.md` - Orchestrator patterns, CI/CD integration
- Anti-patterns section with "What it looks like / Why wrong / Instead" format
- Clear integration points with skill-coach and orchestrator

### Removed
- Inline code examples (moved to references)
- Verbose workflow descriptions (condensed to quick reference)
- Redundant documentation patterns

### Migration Guide
Reference files are now in `/references/` directory. Import patterns:
- Automation scripts → `references/automation-scripts.md`
- MDX templates → `references/documentation-templates.md`
- Workflow patterns → `references/workflow-integration.md`
