# Changelog

## [2.0.0] - 2024-12-XX

### Changed
- **SKILL.md restructured** for progressive disclosure (406 → ~115 lines)
- Shader code examples extracted to reference files
- Removed duplicate Philosophy section

### Added
- `references/pbr-shaders.md` - Complete Cook-Torrance BRDF, Fresnel-Schlick, GGX distribution, Smith geometry
- `references/noise-effects.md` - Hash functions, smooth noise, FBM, Voronoi, domain warping, animated effects
- `references/debug-tools.md` - Heat maps, debug modes, overdraw visualization, NaN detection, wireframe overlay
- Shibboleths table (half vs float, TBDR architecture, intersector API)
- Apple Family 9 note on threadgroup memory changes

### Migration Guide
- No changes to frontmatter or activation triggers
- Shader code now in reference files for copy-paste use
- Philosophy section deduplicated (single version retained)
