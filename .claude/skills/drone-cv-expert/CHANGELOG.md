# Changelog

## [2.0.0] - 2024-12-XX

### Changed
- **BREAKING**: Rewrote SKILL.md from 430 → 193 lines using skill-coach methodology
- Updated frontmatter from `tools:` to `allowed-tools:` format
- Added comprehensive NOT clause for skill differentiation from drone-inspection-specialist

### Added
- Decision tree for skill selection (drone-cv-expert vs drone-inspection-specialist vs others)
- 6 anti-patterns with corrections:
  1. Simulation-Only Syndrome
  2. EKF Overkill
  3. Max Resolution Assumption
  4. Single-Thread Processing
  5. GPS Trust
  6. One Model Fits All
- Quick reference tables (MAVLink messages, Kalman tuning, coordinate frames)
- Algorithm selection matrix (classical vs deep learning)
- Safety checklist for pre-flight
- Reference files with detailed implementations:
  - `references/navigation-algorithms.md` - SLAM, A*, RRT, VIO, AprilTag localization
  - `references/sensor-fusion-ekf.md` - EKF, UKF, complementary filter, multi-sensor fusion
  - `references/object-detection-tracking.md` - YOLO, TensorRT, ByteTrack, optical flow

### Removed
- Inline code examples (moved to reference files)
- Redundant tool configuration (triggers, integrates_with, python_dependencies in frontmatter)
- Verbose problem-solving examples

### Migration Guide
Code examples previously inline are now in `references/`:
- `WaypointNavigator`, `VisualSLAM` → `references/navigation-algorithms.md`
- `DroneEKF` → `references/sensor-fusion-ekf.md`
- `AerialObjectDetector`, tracking → `references/object-detection-tracking.md`
