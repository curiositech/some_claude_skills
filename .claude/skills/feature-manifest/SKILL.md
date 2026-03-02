---
name: feature-manifest
description: Manage feature manifests for code traceability — create features, validate manifest health, map features to code, update changelogs. Activates for 'feature manifest', 'feature tracking', 'code
  traceability'. NOT for project management, issue tracking, or git workflow.
allowed-tools: Read,Write,Edit,Bash(npm:*,npx:*)
metadata:
  category: Productivity & Meta
  tags:
  - feature-management
  - code-traceability
  - documentation
  pairs-with:
  - skill: git-workflow-expert
    reason: Feature branches map to manifest entries for tracking code-to-feature traceability
  - skill: technical-writer
    reason: Feature manifest documentation feeds into changelogs and release notes
  - skill: launch-readiness-auditor
    reason: Feature manifests provide the checklist for launch readiness feature completeness
---

# Feature Manifest Management

This skill helps you work with the feature manifest system that tracks the relationship between features and their implementations.

## When to Use This Skill

- Creating a new feature
- Modifying existing feature code
- Checking which feature owns a file
- Validating manifest accuracy
- Updating changelogs
- Running feature health checks

## Quick Commands

```bash
# List all features
npm run feature:info -- --list

# Get details about a feature
npm run feature:info -- <feature-id>

# Find which feature owns a file
npm run feature:info -- --files <filepath>

# Validate all manifests
npm run feature:validate

# Check feature health (staleness, orphans, coverage)
npm run feature:health

# Create a new feature manifest
npm run feature:create
```

## Workflow: Creating a New Feature

1. **Create the manifest first:**
   ```bash
   npm run feature:create -- --id=my-feature --name="My Feature"
   ```

2. **Implement the feature**, adding files as you go

3. **Update the manifest** with:
   - All implementation files in `implementation.files`
   - Tests in `tests.unit/integration/e2e`
   - Dependencies in `dependencies.internal/external`
   - Environment variables in `dependencies.env_vars`

4. **Validate before committing:**
   ```bash
   npm run feature:validate
   ```

## Workflow: Modifying an Existing Feature

1. **Read the manifest first:**
   ```bash
   npm run feature:info -- &lt;feature-id>
   ```

2. **Make your changes** to the implementation files

3. **Update the manifest:**
   - Add new files to `implementation.files`
   - Update `history.last_modified` to today's date
   - Add a changelog entry

4. **Validate:**
   ```bash
   npm run feature:validate
   ```

## Manifest Structure

```yaml
id: feature-id
name: Human Readable Name
status: complete  # planned | in-progress | complete | deprecated
priority: P1

description: |
  What this feature does and why it exists.

implementation:
  files:
    - src/app/api/feature/route.ts
    - src/lib/feature.ts
  entry_point: src/lib/feature.ts
  database_tables:
    - tableName
  api_routes:
    - POST /api/feature

tests:
  unit:
    - src/lib/__tests__/feature.test.ts
  integration: []
  e2e: []

dependencies:
  internal:
    - features/authentication.yaml
  external:
    - package-name
  env_vars:
    - FEATURE_SECRET
  secrets:
    - feature-api-key

history:
  created: "2024-12-01"
  last_modified: "2024-12-23"

changelog:
  - version: "1.0.0"
    date: "2024-12-23"
    changes:
      - "Initial implementation"
```

## Health Report Interpretation

When running `npm run feature:health`:

- **Healthy Features**: Manifest matches code, tests exist
- **Stale Features**: Manifest not updated in 90+ days, or code changed after manifest
- **Without Tests**: Complete features that have no tests listed
- **Orphaned Files**: Files in `src/` not tracked by any manifest
- **Suggested Manifests**: New directories that should have manifests

## Best Practices

1. **One feature per manifest** - Keep them focused
2. **Update on every change** - Don't let manifests go stale
3. **Changelog is append-only** - Never modify old entries
4. **Include all files** - Don't leave orphaned files
5. **Link dependencies** - Show which features depend on others
