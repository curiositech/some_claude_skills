# Changelog

All notable changes to the vaporwave-glassomorphic-ui-designer skill will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-11-26

### Changed
- **BREAKING**: Refactored from single 1586-line file to modular structure
- Reduced SKILL.md from 1586 lines to 185 lines (88% reduction)
- Moved detailed code patterns to `/references/` directory
- Updated frontmatter to standard `allowed-tools` format
- Simplified description with proper NOT clause and activation keywords

### Added
- **When to Use This Skill** section with clear scope boundaries
- **Do NOT use for** section with skill alternatives
- **MCP Integrations** section with workflow guidance
- Created `/references/glassmorphism-patterns.md`:
  - GlassCard component with variants (thin, regular, thick, neon)
  - Material hierarchy guide
  - Adaptive glass for dark/light mode
  - Performance optimization (LazyVGrid, drawingGroup)
  - Accessibility considerations (reduceTransparency)
- Created `/references/vaporwave-aesthetic.md`:
  - Complete color palette system (6 primary colors)
  - Gradient presets (Sunset Dream, Cyber Ocean, Twilight Zone, Pastel Candy)
  - Typography system (title, body, caption fonts)
  - VaporwaveTheme and ThemeManager implementations
  - Visual elements (grid background, scan lines, sun shape)
  - 2025 design philosophy evolution
- Created `/references/animations-interactions.md`:
  - Button styles (bouncy neon, glass, variants)
  - Staggered list and grid animations
  - Glow effects (pulsing, reactive)
  - Page transitions (dreamy dissolve, sliding panels)
  - Spring physics cheat sheet
  - Animation timing guidelines
- Created `/references/metal-shaders.md`:
  - Gaussian blur shader
  - Animated vaporwave gradient
  - Vaporwave grid shader
  - Holographic shimmer effect
  - Glass refraction with color shift
  - Neon glow shader
  - SwiftUI shader integration examples
  - Performance optimization tips

### Removed
- Custom YAML frontmatter format (tools, triggers, integrates_with)
- Extensive inline SwiftUI code examples (moved to references)
- Detailed shader implementations (moved to references)
- Redundant 21st Century Dev usage section (condensed)

### Improved
- Progressive disclosure: essential concepts in SKILL.md, full code in references
- Cross-references to related skills (windows-3-1, native-app, web-design, design-system)
- Color system condensed to quick-reference table
- Animation timing as actionable table

## [1.0.0] - 2024-XX-XX

### Added
- Initial vaporwave-glassomorphic-ui-designer skill
- Glassmorphism patterns for SwiftUI
- Vaporwave color palettes and gradients
- Typography system
- Grid and scan line visual elements
- Micro-interactions and button styles
- Metal shader examples
- 21st Century Dev integration
- Dark mode and accessibility support
- Photo app design guidelines
