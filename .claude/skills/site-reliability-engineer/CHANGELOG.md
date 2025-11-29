# Changelog

## [2.0.0] - 2024-01-XX

### Changed
- **BREAKING**: Restructured from monolithic 789-line file to progressive disclosure architecture
- Fixed frontmatter format: `tools:` → `allowed-tools:` (comma-separated)
- Added NOT clause to description for precise activation boundaries
- Reduced SKILL.md from 789 lines to 132 lines (83% reduction)

### Added
- `references/ci-cd-integration.md` - GitHub Actions workflows, Docker configs
- `references/monitoring-alerting.md` - Prometheus, Grafana dashboards, alert rules
- `references/incident-response.md` - Runbooks, post-mortem templates, escalation
- Anti-patterns section with "What it looks like / Why wrong / Instead" format
- Quick reference tables for SLO targets and incident severity

### Removed
- Inline YAML/Python examples (moved to references)
- Verbose incident response procedures (condensed to decision trees)
- Redundant monitoring configurations

### Migration Guide
Reference files are now in `/references/` directory. Import patterns:
- CI/CD templates → `references/ci-cd-integration.md`
- Alert configurations → `references/monitoring-alerting.md`
- Incident runbooks → `references/incident-response.md`
