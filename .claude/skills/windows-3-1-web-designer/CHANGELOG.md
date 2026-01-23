# Changelog

All notable changes to the windows-3-1-web-designer skill will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2024-01-XX

### Changed
- **BREAKING**: Restructured from monolithic 539-line file to progressive disclosure architecture
- Reduced SKILL.md from 539 lines to 137 lines (75% reduction)

### Added
- `references/design-system.md` - Color palette, beveled borders, typography
- `references/component-patterns.md` - Window chrome, buttons, forms, panels CSS
- `references/anti-patterns.md` - Vaporwave comparison, decision tree, conversion examples
- Anti-patterns section with "What it looks like / Why wrong / Instead" format
- Quick Test checklist for Win31 authenticity

### Removed
- Inline CSS examples (moved to references)
- Verbose design explanations (condensed to quick reference)

### Migration Guide
Reference files are now in `/references/` directory. Import patterns:
- Color palette & typography → `references/design-system.md`
- Component CSS → `references/component-patterns.md`
- Vaporwave vs Win31 → `references/anti-patterns.md`

## [1.1.0] - 2025-11-26

### Changed
- Updated frontmatter to standard `allowed-tools` format
- Improved description with proper NOT clause and activation keywords

### Added
- **When to Use This Skill** section with clear scope boundaries
- **Do NOT use for** section with skill alternatives
- **MCP Integrations** section:
  - 21st Century Dev for component scaffolding
  - Component Refiner for Win31 styling conversion
- Cross-references to related skills (vaporwave, native-app, web-design)

### Fixed
- Removed duplicate "when to use" content

## [1.0.0] - 2024-XX-XX

### Added
- Initial windows-3-1-web-designer skill
- Comprehensive Win31 color palette (system gray, navy, accents)
- Sacred Rule of Beveled Borders (outset, inset, pressed states)
- Typography system (VT323, Press Start 2P, MS Sans Serif)
- Component patterns:
  - Window chrome with titlebar
  - 3D push buttons with pressed states
  - Form controls (inputs, checkboxes)
  - Panels and group boxes
- Anti-patterns: Windows 3.1 vs Vaporwave comparison table
- Decision tree for component design
- Responsive considerations for modern screens
- Vaporwave-to-Win31 conversion example
- Hotdog Stand high-contrast mode
- Quick reference card for all elements
