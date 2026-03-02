---
name: code-review-checklist
description: Generate context-aware code review checklists from PR diffs — tailored to language, codebase patterns, and team standards. Identifies what reviewers should focus on. NOT for automated code
  fixing, test generation, or security auditing.
allowed-tools: Read,Grep,Glob
metadata:
  category: Code Quality & Testing
  tags:
  - code-review
  - quality
  - checklist
  - pr-review
  - best-practices
  pairs-with:
  - skill: security-auditor
    reason: Security checks are a critical section of any thorough code review checklist
  - skill: refactoring-surgeon
    reason: Code smell detection during review leads directly to targeted refactoring
  - skill: test-automation-expert
    reason: Test coverage verification is a key code review checkpoint
---

# Code Review Checklist Generator

Generate thorough, contextual code review checklists that help reviewers focus on what matters most for each specific PR.

## When to Use

- Before starting a code review to know what to look for
- When onboarding new team members to review standards
- To ensure consistent review quality across the team
- When reviewing unfamiliar parts of the codebase

## Approach

1. **Analyze the Diff**: Understand what files changed and the nature of changes
2. **Identify Patterns**: Detect the type of change (feature, bugfix, refactor, etc.)
3. **Language-Specific Checks**: Apply relevant checks for the programming language
4. **Project Context**: Consider existing patterns and conventions in the codebase
5. **Generate Checklist**: Produce prioritized, actionable review items

## Checklist Categories

### Security
- [ ] Input validation present
- [ ] No hardcoded secrets or credentials
- [ ] Proper authentication/authorization checks
- [ ] SQL injection prevention
- [ ] XSS prevention for web code

### Performance
- [ ] No N+1 query patterns
- [ ] Appropriate caching considered
- [ ] No unnecessary loops or iterations
- [ ] Efficient data structures used

### Maintainability
- [ ] Code is readable and self-documenting
- [ ] Functions are appropriately sized
- [ ] No code duplication
- [ ] Consistent naming conventions

### Testing
- [ ] Unit tests cover new functionality
- [ ] Edge cases are tested
- [ ] Tests are meaningful, not just for coverage

## Best Practices

- Prioritize security issues first
- Focus on logic errors over style nitpicks
- Consider the reviewer's time - highlight critical items
- Adapt checklist to project maturity level