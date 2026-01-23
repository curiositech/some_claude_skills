# Changelog: event-detection-temporal-intelligence-expert

## [2.0.0] - 2025-11-26

### Major Refactoring
- **Reduced SKILL.md from 1662 lines to 310 lines** (81% reduction)
- Extracted detailed implementations to reference files
- Added proper skill-coach compliant structure

### Added
- **Frontmatter**: Updated to `allowed-tools` format with integration points
- **NOT clause**: Clear boundaries with sister skills
- **Decision tree**: Quick algorithm selection guide
- **6 Anti-patterns**: Common mistakes specific to temporal clustering
  - Time-only clustering
  - Fixed epsilon values
  - Ignoring visual content
  - Euclidean distance for GPS (use Haversine)
  - No noise handling
  - Shareability without event context
- **Quick reference tables**: Parameters, performance targets, method comparisons
- **Integration points**: Links to collage-layout-expert, photo-content-recognition-curation-expert, color-theory-palette-harmony-expert, clip-aware-embeddings

### Reference Files Created
- `references/st-dbscan-implementation.md` - Core clustering algorithms
  - Standard DBSCAN review
  - ST-DBSCAN (spatio-temporal)
  - DeepDBSCAN (visual content integration)
  - Hierarchical event detection
  - Parameter tuning guide

- `references/event-scoring-shareability.md` - Scoring systems
  - EventSignificanceScorer class
  - Multi-factor weighted model (8 factors)
  - ShareabilityPredictor class
  - Training methodology
  - Decision tree for shareability

- `references/place-recognition-life-events.md` - Location intelligence
  - PlaceRecognizer with multi-level abstraction
  - Location-based event labeling
  - LifeEventDetector for major life events
  - Detection methods: graduation, wedding, birth, moves, travel milestones
  - CLIP zero-shot classification integration

- `references/temporal-diversity-pipeline.md` - Selection algorithms
  - Temporal binning method
  - Temporal MMR (Maximal Marginal Relevance)
  - Event-based diversity selection
  - Complete EventDetectionPipeline class
  - Event-aware collage assembly integration
  - Performance benchmarks

### Performance Targets (Documented)
| Operation | Target |
|-----------|--------|
| ST-DBSCAN (10K photos) | &lt; 2 seconds |
| Event significance scoring | &lt; 100ms/event |
| Shareability prediction | &lt; 50ms/photo |
| Place recognition (cached) | &lt; 10ms/photo |
| Full pipeline (10K photos) | &lt; 5 seconds |

### Dependencies
```
numpy scipy scikit-learn hdbscan geopy transformers xgboost pandas opencv-python
```

## [1.0.0] - 2025-11 (Initial)

### Initial Implementation
- ST-DBSCAN algorithm for photo event detection
- Event significance scoring
- Shareability prediction model
- Life event detection (graduation, wedding, birth, moves)
- Place recognition and semantic location
- Temporal diversity selection methods
