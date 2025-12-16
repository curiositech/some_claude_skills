---
title: CI/CD Integration Reference
sidebar_label: CI/CD Integration Reference
sidebar_position: 1
---
# CI/CD Integration Reference

Automated build health for GitHub Actions and deployment pipelines.

## GitHub Actions Workflow

**File**: `.github/workflows/build-health.yml`

```yaml
name: Build Health Check
on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: cd website && npm ci

      - name: Run pre-build validation
        run: cd website && npm run validate:all

      - name: Build
        run: cd website && npm run build

      - name: Post-build health check
        run: cd website && npm run postbuild

      - name: Upload health report
        uses: actions/upload-artifact@v3
        with:
          name: build-health
          path: website/.build-health.json
```

## Health Report Schema

**File**: `website/.build-health.json` (generated post-build)

```json
{
  "timestamp": "2025-11-26T05:00:00Z",
  "build": {
    "success": true,
    "duration_ms": 45328,
    "bundle_size_mb": 8.2,
    "warnings": 3,
    "errors": 0
  },
  "broken_links": {
    "count": 2,
    "details": [
      {
        "file": "docs/skills/cv_creator.md",
        "line": 393,
        "target": "/planning/cv-creator-architecture.md",
        "type": "internal"
      }
    ]
  },
  "skills": {
    "total": 40,
    "with_hero_images": 40,
    "with_zips": 40,
    "in_skills_ts": 40
  },
  "recommendation": "Fix 2 broken internal links before deployment"
}
```

## npm Scripts for CI

Add to `website/package.json`:

```json
{
  "scripts": {
    "prebuild": "npm run validate:all",
    "postbuild": "node scripts/post-build-health-check.js",
    "validate:liquid": "node scripts/validate-liquid.js 'website/docs/**/*.md'",
    "validate:brackets": "node scripts/validate-brackets.js 'website/docs/**/*.md'",
    "validate:props": "node scripts/validate-skill-props.js 'website/docs/skills/*.md'",
    "validate:links": "node scripts/validate-internal-links.js",
    "validate:all": "npm run validate:liquid && npm run validate:brackets && npm run validate:props"
  }
}
```

## Thresholds Configuration

**File**: `website/.site-reliability.config.json`

```json
{
  "thresholds": {
    "bundleSizeMB": 10,
    "brokenLinksMax": 0,
    "imageMaxSizeKB": 1024,
    "buildTimeoutMinutes": 10
  },
  "validation": {
    "liquid": { "enabled": true, "autoFix": false },
    "brackets": { "enabled": true, "autoFix": true },
    "skillProps": {
      "enabled": true,
      "requiredProps": ["skillName", "fileName", "description"],
      "deprecatedProps": ["difficulty", "category", "tags"]
    }
  }
}
```

## CI Success Criteria

| Metric | Threshold | Action if Exceeded |
|--------|-----------|-------------------|
| Bundle size | 10MB | Fail build |
| Broken links | 0 | Fail build |
| Build time | 10 min | Warn |
| Hero images | 100% coverage | Warn |

## Deployment Gate Script

```javascript
// scripts/deployment-gate.js
const health = require('./.build-health.json');

const failures = [];

if (health.broken_links.count > 0) {
  failures.push(`${health.broken_links.count} broken links`);
}

if (health.build.bundle_size_mb > 10) {
  failures.push(`Bundle size ${health.build.bundle_size_mb}MB exceeds 10MB`);
}

if (health.skills.with_hero_images < health.skills.total) {
  failures.push(`Missing hero images: ${health.skills.total - health.skills.with_hero_images}`);
}

if (failures.length > 0) {
  console.error('❌ Deployment blocked:');
  failures.forEach(f => console.error(`   - $\{f\}`));
  process.exit(1);
}

console.log('✅ Deployment gate passed');
process.exit(0);
```
