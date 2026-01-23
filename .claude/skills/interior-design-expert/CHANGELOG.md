# Changelog

All notable changes to the interior-design-expert skill will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-11-26

### Changed
- **BREAKING**: Refactored from single file to modular structure with references
- Reduced SKILL.md from 583 lines to 189 lines (68% reduction)
- Moved detailed technical content to `/references/` directory
- Updated frontmatter to standard `allowed-tools` format

### Added
- **When to Use This Skill** section with clear scope boundaries
- **Do NOT use for** section with alternatives
- **MCP Integrations** section with Stability AI and Ideogram
- **Common Anti-Patterns** section (4 patterns):
  - Ignoring Traffic Flow
  - Single Light Source
  - Scale Mismatch
  - Paint Color from Memory
- Created `/references/color-science.md` - Munsell system deep dive
- Created `/references/lighting-design.md` - IES standards, CCT programming
- Created `/references/space-planning.md` - Anthropometrics, room layout solver code
- Created `/references/style-guide.md` - Style DNA for 6 major styles
- AI Visualization Prompts section with prompt engineering guidance

### Improved
- Progressive disclosure: core concepts in SKILL.md, details in references
- Cross-references between files
- NOT clause in description for better activation

## [1.0.0] - 2024-XX-XX

### Added
- Initial interior-design-expert skill
- Munsell color system documentation
- IES lighting standards
- Space planning mathematics with constraint solver
- Style reference guide (Mid-Century, Scandinavian, Japandi, Maximalist)
- AI visualization prompt templates
