# Changelog

All notable changes to the test-automation-expert skill will be documented in this file.

## [1.0.0] - 2024-12-08

### Added
- Initial release of test-automation-expert skill
- Comprehensive SKILL.md with test pyramid philosophy
- Framework selection guidance (Jest, Vitest, Playwright, Cypress, pytest)
- Unit testing patterns with mocking strategies
- Integration testing patterns for APIs and components
- E2E testing best practices with Playwright
- Flaky test detection and prevention guide
- Coverage optimization strategies
- CI/CD integration examples (GitHub Actions)
- Anti-patterns documentation
- Reference files:
  - `references/test-strategy.md` - Test strategy framework
  - `references/framework-comparison.md` - Framework comparison matrix
  - `references/coverage-patterns.md` - Coverage techniques
  - `references/ci-integration.md` - CI/CD configurations

### Technical Decisions
- Chose Vitest as recommended modern default over Jest
- Playwright recommended over Cypress for cross-browser needs
- Test pyramid distribution: 70% unit, 20% integration, 10% E2E
- Coverage thresholds: 80% lines, 75% branches, 90% functions

### References
- Based on testing best practices from Testing Library, Playwright, and Vitest documentation
- Anti-patterns derived from common issues in production codebases
