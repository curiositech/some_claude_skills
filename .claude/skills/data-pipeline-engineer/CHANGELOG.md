# Changelog

All notable changes to the data-pipeline-engineer skill will be documented in this file.

## [2.0.0] - 2024-12-12

### Changed
- **BREAKING**: Restructured SKILL.md from 590 lines to ~160 lines for progressive disclosure
- Moved all large code examples to `./references/` directory
- Expanded anti-patterns section from 5 to 10 patterns

### Added
- `references/dbt-project-structure.md` - Complete dbt project layout with staging, intermediate, marts examples
- `references/airflow-dag.py` - Production DAG with sensors, task groups, and quality checks
- `references/spark-streaming.py` - Kafka-to-Delta streaming processor with windowing
- `references/great-expectations-suite.json` - Comprehensive data quality expectation suite
- `scripts/validate-pipeline.sh` - Validation for dbt, Airflow, Spark, and data quality setup
- Version field in frontmatter for skill tracking

### Improved
- Anti-patterns section now covers 10 common mistakes with solutions
- Quality checklist expanded to cover all pipeline components
- Better cross-references to external documentation

## [1.0.0] - 2024-01-01

### Added
- Initial data-pipeline-engineer skill
- dbt medallion architecture guidance
- Airflow DAG patterns
- Spark optimization strategies
- Great Expectations integration
