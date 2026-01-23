# Changelog

All notable changes to the native-app-designer skill will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-11-26

### Changed
- **BREAKING**: Refactored from single 787-line file to modular structure
- Reduced SKILL.md from 787 lines to 189 lines (76% reduction)
- Moved detailed code patterns to `/references/` directory
- Updated frontmatter to standard `allowed-tools` format
- Simplified description with proper NOT clause

### Added
- **When to Use This Skill** section with clear scope boundaries
- **Do NOT use for** section with skill alternatives
- **MCP Integrations** section:
  - 21st Century Dev for component inspiration
  - Stability AI for design assets
  - Firecrawl for pattern research
  - Apple Developer Docs MCP (community)
- **Common Anti-Patterns** section (5 patterns):
  - Generic Card Syndrome
  - Linear Animation Death
  - Rainbow Vomit
  - Animation Overload
  - Inconsistent Spacing
- **App Personality Types** table for design direction
- **Spring Physics Cheat Sheet** for quick reference
- Created `/references/swiftui-patterns.md` - Full SwiftUI component examples
- Created `/references/react-patterns.md` - React/Vue animation patterns
- Created `/references/custom-shaders.md` - Metal and WebGL shader effects

### Removed
- Redundant Vue template code (moved to references)
- Extensive SwiftUI examples (moved to references)
- Shader code blocks (moved to references)
- Custom YAML frontmatter format (triggers, integrates_with, official_mcps)

### Improved
- Progressive disclosure: essential concepts in SKILL.md, code in references
- Cross-references to related skills
- Motion design principles condensed to actionable cheat sheet

## [1.0.0] - 2024-XX-XX

### Added
- Initial native-app-designer skill
- SwiftUI design patterns and components
- React/Vue animation patterns with Framer Motion
- Physics-based animation guidelines
- Color psychology for native apps
- Typography with personality
- Custom shader examples (Metal/WebGL)
- Anti-AI aesthetic philosophy
- Design tool recommendations
