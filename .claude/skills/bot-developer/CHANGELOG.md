# Changelog

## [2.0.0] - 2024-01-XX

### Changed
- **BREAKING**: Restructured from monolithic 624-line file to progressive disclosure architecture
- Fixed frontmatter format: `tools:` → `allowed-tools:` (comma-separated)
- Added NOT clause to description for precise activation boundaries
- Reduced SKILL.md from 624 lines to 154 lines (75% reduction)

### Added
- `references/architecture-patterns.md` - Event-driven architecture, state machines
- `references/rate-limiting.md` - Distributed rate limiters, adaptive strategies
- `references/moderation-system.md` - Point-based moderation, AutoMod rules
- `references/platform-templates.md` - Discord.py, Telegram FastAPI, security checklist
- Anti-patterns section with "What it looks like / Why wrong / Instead" format
- Platform comparison table (Discord, Telegram, Slack)

### Removed
- Inline Python class implementations (moved to references)
- Verbose rate limiting explanations (condensed to quick reference)
- Redundant platform-specific examples

### Migration Guide
Reference files are now in `/references/` directory. Import patterns:
- Architecture patterns → `references/architecture-patterns.md`
- Rate limiting code → `references/rate-limiting.md`
- Moderation system → `references/moderation-system.md`
- Platform templates → `references/platform-templates.md`
