# Changelog

All notable changes to the collage-layout-expert skill will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-11-26

### Changed
- **BREAKING**: Refactored from single 1761-line file to modular structure
- Reduced SKILL.md from 1761 lines to 287 lines (84% reduction)
- Moved detailed implementations to `/references/` directory
- Updated frontmatter from custom YAML to standard `allowed-tools` format
- Simplified description with proper NOT clause and activation keywords

### Added
- **When to Use This Skill** section with clear scope boundaries
- **Do NOT use for** section with skill alternatives
- **MCP Integrations** section (Firecrawl, Stability AI)
- Created `/references/hockney-technique.md`:
  - David Hockney's joiners technique (1982-1985)
  - Historical context and artistic intent
  - Computational implementation parameters
  - Art historical references (Rauschenberg, Höch, Baldessari, Rosler)
  - Style implementations dictionary
  - Contemporary trends (2025)
- Created `/references/line-detection.md`:
  - Algorithm comparison table (EDLines, LSD, Hough, LB-LSD, LETR)
  - EDLines algorithm overview and performance benchmarks
  - LSD and Hough implementation examples
  - When to use each algorithm guide
- Created `/references/edge-assembly.md`:
  - EdgeDescriptor dataclass
  - Edge compatibility scoring function
  - Angle and position alignment algorithms
  - Greedy edge growth algorithm
  - Edge urgency heuristics
  - Performance optimizations:
    - Hierarchical clustering (50x speedup)
    - Multi-scale matching (10x speedup)
    - Caching good pairs (1.5x speedup)
    - Pruning generic edges (2-3x speedup)
    - Backtracking strategy
- Created `/references/mathematical-foundations.md`:
  - Optimal transport for color harmonization
  - Wasserstein distance and Sinkhorn algorithm
  - Affine approximation for real-time
  - LAB color space rationale
  - Poisson blending for seamless junctions
  - Jacobi iteration solver (Python and Metal)
  - Energy function formulation
  - Semantic, geometric, and aesthetic energy components
  - User mode presets (Coherent, Balanced, Chaotic)
  - Aesthetic principles (Rule of thirds, visual weight, balance, golden ratio, negative space)
- Created `/references/advanced-techniques.md`:
  - Cross-photo interactions (gesture-response, pointing, gaze, passing)
  - InteractionDetector class
  - Negative space awareness and matching
  - Multi-layer compositing
  - Narrative sequences (journey, day_in_life, emotion_arc)
  - Simulated annealing for photo swapping
  - Genetic algorithms concept
  - CSP formulation concept
- Created `/references/implementation-guide.md`:
  - Metal shader pipeline (edge extraction, line detection, histogram, Poisson)
  - Core ML integration (MobileSAM, CLIP, MediaPipe)
  - HNSW database indexing
  - Performance targets table (Mac M2, iPhone 15 Pro)
  - Memory management strategies
  - Algorithm selection guide
  - Error handling patterns
  - Testing strategies
  - Python dependencies

### Removed
- Custom YAML frontmatter format (tools, triggers, integrates_with, python_dependencies)
- 1500+ lines of detailed implementations (moved to references)

### Improved
- Progressive disclosure: essential concepts in SKILL.md, full code in references
- Quick reference tables for algorithms and performance
- Cross-references to related skills (native-app-designer, clip-aware-embeddings, photo-composition-critic, color-theory-palette-harmony-expert)

## [1.0.0] - 2024-XX-XX

### Added
- Initial collage-layout-expert skill
- David Hockney's joiners technique documentation
- Line detection algorithms (EDLines, LSD, Hough)
- Edge-based assembly strategy with greedy growth
- Advanced collage concepts:
  - Cross-photo interactions
  - Negative space awareness
  - Multi-layer compositing
  - Narrative sequences
- Mathematical foundations:
  - Optimal transport (Wasserstein, Sinkhorn)
  - Poisson blending
  - Energy function optimization
- Aesthetic principles from art history
- Art historical references (Hockney, Rauschenberg, Höch, Baldessari, Rosler)
- Practical implementation guidance:
  - Metal shader pipeline
  - Core ML integration
  - Database indexing (HNSW)
- Performance optimization strategies
- Common patterns and best practices
- Advanced techniques (simulated annealing, genetic algorithms)
