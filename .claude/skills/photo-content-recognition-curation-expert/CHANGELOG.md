# Changelog: photo-content-recognition-curation-expert

## [2.0.0] - 2025-11-26

### Major Refactoring
- **Reduced SKILL.md from 1513 lines to 322 lines** (79% reduction)
- Extracted detailed implementations to reference files
- Added proper skill-coach compliant structure

### Added
- **Frontmatter**: Updated to `allowed-tools` format with integration points
- **NOT clause**: Clear boundaries with sister skills (event-detection, color-theory, clip-aware-embeddings)
- **Decision tree**: Quick algorithm selection guide for all recognition tasks
- **6 Anti-patterns**: Common mistakes specific to photo curation
  - Euclidean distance for face embeddings (use cosine)
  - Fixed clustering thresholds
  - Raw pixel comparison for duplicates
  - Sequential face detection (use batching)
  - No confidence filtering
  - Forcing every photo into clusters
- **Quick reference tables**: Method comparisons, parameters, performance benchmarks
- **Integration points**: Links to event-detection, color-theory, collage-layout, clip-aware-embeddings

### Reference Files Created
- `references/perceptual-hashing.md` - Hash algorithms and duplicate detection
  - DINOHash (2025 state-of-the-art)
  - dHash, pHash implementations
  - Hybrid duplicate detection pipeline
  - BK-Tree for efficient search (100K+ photos)
  - Method comparison table

- `references/face-clustering.md` - Face recognition and clustering
  - FaceEmbeddingExtractor (MTCNN + InceptionResnetV1)
  - Apple-style two-pass agglomerative clustering
  - HDBSCAN alternative
  - Incremental updates for new photos
  - Method comparison (Agglomerative vs HDBSCAN)

- `references/content-detection.md` - Content analysis
  - PetRecognizer (YOLO + CLIP)
  - BurstPhotoSelector with multi-criteria scoring
  - ScreenshotDetector with multi-signal approach
  - Scoring weight tables

- `references/photo-indexing.md` - Indexing pipeline
  - QuickPhotoIndexer with caching
  - PhotoIndex container class
  - Complete curation pipeline
  - Performance benchmarks (10K photos)

### Performance Targets (Documented)
| Operation | 10K Photos |
|-----------|-----------|
| Perceptual hashing | &lt; 2 minutes |
| CLIP embeddings | &lt; 3 minutes (GPU) |
| Face detection | &lt; 4 minutes |
| Face clustering | &lt; 30 seconds |
| Duplicate detection | &lt; 20 seconds |
| Full pipeline (first run) | ~13 minutes |
| Incremental updates | &lt; 1 minute |

### Dependencies
```
torch transformers facenet-pytorch ultralytics hdbscan opencv-python scipy numpy scikit-learn pillow pytesseract
```

## [1.0.0] - 2025-11 (Initial)

### Initial Implementation
- DINOHash perceptual hashing
- Apple-style face clustering
- HDBSCAN clustering alternative
- Pet/animal recognition
- Burst photo selection
- Screenshot detection
- Quick indexing pipeline
- Complete curation workflow
