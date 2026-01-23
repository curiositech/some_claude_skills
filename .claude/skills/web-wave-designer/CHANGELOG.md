# Changelog

All notable changes to the web-wave-designer skill.

## [1.0.0] - 2026-01-22

### Added
- Initial release of web-wave-designer skill
- Core SVG filter pipeline documentation (feTurbulence, feDisplacementMap, feComponentTransfer)
- Critical distinction between `type="turbulence"` vs `type="fractalNoise"` for water effects
- Two-value baseFrequency explanation for directional wave patterns
- Wave type recipes: ocean surface, pond ripples, beach shore, underwater distortion, liquid glass, stylized/cartoon
- Layering strategy for multi-depth ocean scenes
- Animation techniques comparison: CSS transforms, requestAnimationFrame, SVG animate, GSAP
- Color palettes: deep ocean, tropical, stormy, sunset reflection
- Complete implementation templates (vanilla HTML/CSS, React component, CSS-only)
- Performance optimization guide with tier system (Ultra/High/Medium/Low)
- Framework integration examples (Next.js, Vue 3, Tailwind CSS)
- Reference documentation:
  - `turbulence-deep-dive.md`: Complete feTurbulence parameter guide
  - `displacement-and-color.md`: feDisplacementMap, caustics, foam, reflections
  - `animation-patterns.md`: Performance-aware animation strategies
- Integration guidance with web-cloud-designer for complete atmospheric scenes
- Browser compatibility notes
- Debugging tips and common issues

### Technical Notes
- Designed to pair with web-cloud-designer skill for complete sky + ocean scenes
- Based on research from Red Stapler, Mitkov Systems (2025), CSS-Tricks, and MDN
- Emphasizes performance-first approach with adaptive quality tiers
- Includes reduced motion support for accessibility
