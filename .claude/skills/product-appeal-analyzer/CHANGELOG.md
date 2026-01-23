# Changelog

All notable changes to this skill will be documented here.

## [1.0.0] - 2026-01-15

### Added
- Initial skill release
- Core frameworks: Desirability Triangle, 5-Second Test
- SKILL.md with activation patterns and anti-patterns
- `scripts/appeal_scorer.py` for structured analysis
- Reference documents:
  - `references/scoring-templates.md` - Full assessment templates
  - `references/trust-ladder.md` - Trust building stages deep dive
  - `references/identity-signals.md` - Visual/verbal identity catalog
  - `references/objection-catalog.md` - Universal objections and counters

### Integrations
- Pairs with `ux-friction-analyzer` (appeal + friction = complete picture)
- Pairs with `competitive-cartographer` (positioning against alternatives)
- Pairs with `web-design-expert` (implementing recommendations)

### Design Decisions
- Kept SKILL.md under 300 lines for fast activation
- Moved detailed templates to `/references` for progressive disclosure
- Encoded 4 shibboleths as anti-patterns:
  1. Feature Soup Headline
  2. Screenshot Hero
  3. Trust Ladder Violation
  4. Identity Mismatch
- Python scoring script provides structure without requiring external dependencies
