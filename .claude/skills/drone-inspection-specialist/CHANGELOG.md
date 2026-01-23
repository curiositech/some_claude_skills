# Changelog

## [2.0.0] - 2024-12-XX

### Changed
- **BREAKING**: Rewrote SKILL.md from 444 → 205 lines using skill-coach methodology
- Updated frontmatter from `tools:` to `allowed-tools:` format
- Added comprehensive NOT clause differentiating from drone-cv-expert

### Added
- Decision tree for skill selection
- 6 anti-patterns with corrections:
  1. Single-Sensor Dependence (fire detection)
  2. Ignoring Hail Pattern (damage validation)
  3. Thermal Temperature Trust (calibration)
  4. 3DGS Frame Overload (processing efficiency)
  5. Insurance Claim Speculation (material-based costing)
  6. Defensible Space Zone Confusion (CAL FIRE compliance)
- Quick reference tables (fire confidence, damage severity, risk factors, 3DGS settings)
- Data collection strategy (satellite, drone, ground integration)
- Insurance workflow diagram (underwriting, claims, reinsurance)
- Reference files with detailed implementations:
  - `references/fire-detection.md` - Multi-modal fire detection, thermal cameras, progression tracking
  - `references/roof-inspection.md` - Damage detection, thermal analysis, material classification, hail damage
  - `references/insurance-risk-assessment.md` - Hail damage patterns, wildfire risk modeling, catastrophe models, reinsurance data pipelines, satellite/drone/ground data integration
  - `references/gaussian-splatting-3d.md` - COLMAP SfM, 3DGS training, inspection measurements, change detection

### Expanded Domain Coverage
- **Wildfire Risk Assessment**: NDVI, fuel load, defensible space evaluation per CAL FIRE/NFPA 1144
- **Hail Damage Analysis**: Impact pattern validation (random vs. linear), size estimation, insurance claim packaging
- **Insurance Integration**: Claim documentation, cost estimation by material, weather correlation
- **Reinsurance Modeling**: Catastrophe models, loss distributions (AAL, PML, TCE), portfolio concentration risk
- **Multi-Source Data**: Satellite (Sentinel-2, Landsat-8, Planet) + drone + ground truth fusion

### Removed
- Inline code examples (moved to reference files)
- Redundant frontmatter (triggers, outputs, python_dependencies)

### Migration Guide
Code examples previously inline are now in `references/`:
- `ForestFireDetector`, `FireAlertSystem` → `references/fire-detection.md`
- `RoofInspector`, `ThermalRoofAnalysis` → `references/roof-inspection.md`
- `HailDamageDetector`, `WildfireRiskAssessor`, `CatastropheRiskModel` → `references/insurance-risk-assessment.md`
- `GaussianSplattingReconstructor`, `InspectionMeasurement` → `references/gaussian-splatting-3d.md`
