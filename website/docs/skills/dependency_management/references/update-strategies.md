---
title: Dependency Update Strategies
sidebar_label: Dependency Update Strategies
sidebar_position: 2
---
# Dependency Update Strategies

Automated dependency updates are table stakes for production software. The question isn't whether to automate — it's how to configure automation so it helps without drowning your team in PRs.

---

## Renovate vs Dependabot

| Dimension | Renovate | Dependabot |
|-----------|----------|------------|
| **Platform** | Any (GitHub, GitLab, Bitbucket, Gitea, self-hosted) | GitHub only |
| **Config format** | `renovate.json` (rich JSON with extends) | `.github/dependabot.yml` (simpler YAML) |
| **Grouping** | Powerful: group by ecosystem, pattern, type, semver range | Limited: package-based only |
| **Automerge** | Yes, with conditions (tests, security) | Yes (since 2022, with Actions) |
| **Scheduling** | Cron syntax, timezone-aware | Weekly/daily, limited |
| **PRs for lockfile-only** | Yes | No |
| **Dashboard** | Dependency Dashboard issue (overview of all pending) | None |
| **Regex versioning** | Yes (Docker image tags, GitHub releases) | Limited |
| **Self-hosted** | Yes (Mend Renovate or self-run) | No |
| **Cost** | Free (cloud app) or self-hosted | Free for public, limited for private |

**Recommendation**: Use Renovate for any project where you want fine-grained control. Use Dependabot if you just want GitHub's built-in security alerting with minimal config.

---

## Renovate Configuration

### Starter Config

```json
// renovate.json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": [
    "config:recommended"
  ],
  "timezone": "America/New_York",
  "schedule": ["before 9am on Monday"],
  "packageRules": [
    {
      "matchUpdateTypes": ["patch", "pin", "digest"],
      "matchPackagePatterns": ["*"],
      "automerge": true,
      "automergeType": "pr",
      "platformAutomerge": true
    },
    {
      "matchUpdateTypes": ["minor"],
      "matchDepTypes": ["devDependencies"],
      "groupName": "dev dependency minor updates",
      "automerge": true
    },
    {
      "matchUpdateTypes": ["major"],
      "dependencyDashboardApproval": true
    }
  ]
}
```

### Grouping Strategies

Group updates to reduce PR noise:

```json
{
  "packageRules": [
    {
      "matchPackagePatterns": ["^@types/"],
      "groupName": "DefinitelyTyped",
      "automerge": true
    },
    {
      "matchPackagePatterns": ["eslint", "prettier", "^@typescript-eslint"],
      "groupName": "linting and formatting",
      "automerge": true
    },
    {
      "matchPackagePatterns": ["vitest", "jest", "testing-library"],
      "groupName": "testing framework",
      "automerge": false
    },
    {
      "matchPackagePrefixes": ["@aws-sdk/"],
      "groupName": "AWS SDK",
      "automerge": false
    },
    {
      "matchPackagePrefixes": ["react", "@react"],
      "groupName": "React ecosystem",
      "automerge": false
    }
  ]
}
```

### Automerge Policy

Safe to automerge (after tests pass):
- All patch updates for non-critical packages
- Dev-dependency minor updates (formatters, linters, type definitions)
- Lockfile-only updates (no version change)

Require human review:
- All major version bumps
- Production dependency minor/major changes
- Any security-flagged update (review the fix, not just merge it)
- Framework core packages (React, Next.js, Vue, etc.)

```json
{
  "packageRules": [
    {
      "matchUpdateTypes": ["patch"],
      "excludePackagePatterns": ["express", "fastify", "koa", "next", "react"],
      "automerge": true,
      "automergeType": "branch"   // "branch" merges without PR; "pr" creates PR
    },
    {
      "matchUpdateTypes": ["major"],
      "labels": ["dependencies", "major-update"],
      "assignees": ["your-github-username"],
      "automerge": false
    }
  ]
}
```

### Testing Strategy for Update PRs

Never automerge without a CI gate. Your CI pipeline for dependency PRs should:

1. **Unit tests**: Catch obvious breakage (changed APIs, removed exports)
2. **Integration tests**: Catch subtle breakage (behavior changes, protocol changes)
3. **Type check**: `tsc --noEmit` catches type-level API breaks
4. **Build check**: `npm run build` catches bundler and resolution issues
5. **Security rescan**: Run `npm audit` on the PR branch — the update may itself introduce a CVE

For major version bumps, add a checklist:
```markdown
## Major Version Review Checklist
- [ ] Read CHANGELOG / BREAKING CHANGES section
- [ ] Check if any of our usage patterns are deprecated
- [ ] Run full test suite manually
- [ ] Check transitive dependency changes (`npm ls <package>`)
- [ ] Verify Docker build still works
- [ ] Test in staging for 24h before merging
```

---

## Dependabot Configuration

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
      time: "09:00"
      timezone: "America/New_York"
    open-pull-requests-limit: 10
    groups:
      dev-dependencies:
        dependency-type: "development"
        update-types:
          - "minor"
          - "patch"
      production-patches:
        dependency-type: "production"
        update-types:
          - "patch"
    ignore:
      - dependency-name: "some-broken-package"
        versions: ["2.x"]
    labels:
      - "dependencies"
    reviewers:
      - "your-github-username"

  - package-ecosystem: "pip"
    directory: "/"
    schedule:
      interval: "weekly"
    ignore:
      - dependency-name: "*"
        update-types: ["version-update:semver-major"]

  - package-ecosystem: "docker"
    directory: "/"
    schedule:
      interval: "weekly"

  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "monthly"
```

### Dependabot Auto-Merge via GitHub Actions

```yaml
# .github/workflows/dependabot-automerge.yml
name: Dependabot auto-merge
on: pull_request

permissions:
  contents: write
  pull-requests: write

jobs:
  dependabot:
    runs-on: ubuntu-latest
    if: github.actor == 'dependabot[bot]'
    steps:
      - name: Dependabot metadata
        id: metadata
        uses: dependabot/fetch-metadata@v2
        with:
          github-token: "${{ secrets.GITHUB_TOKEN }}"

      - name: Auto-merge patch/minor dev deps
        if: |
          steps.metadata.outputs.update-type == 'version-update:semver-patch' ||
          (steps.metadata.outputs.update-type == 'version-update:semver-minor' &&
           steps.metadata.outputs.dependency-type == 'direct:development')
        run: gh pr merge --auto --squash "$PR_URL"
        env:
          PR_URL: ${{ github.event.pull_request.html_url }}
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## Update Cadence Recommendations

| Update Type | Cadence | Rationale |
|------------|---------|-----------|
| Security patches (CVE) | ASAP (&lt; 24h for critical) | Non-negotiable |
| Patch versions | Weekly | Low risk; batch to reduce noise |
| Minor versions (dev deps) | Weekly/biweekly | Safe; automerge after tests |
| Minor versions (prod) | Monthly | Review changelog first |
| Major versions | Quarterly or per release | Read migration guide; test thoroughly |
| OS-level images (Docker) | Monthly | Check for security notices |

---

## Stale Dependency Audit

Run quarterly to find dependencies that should be removed:

```bash
# Find unused dependencies (Node)
npx depcheck

# Find packages with no updates in > 1 year
npm outdated --long 2>/dev/null | awk 'NR&gt;1 {print $1}' | while read pkg; do
  info=$(npm view $pkg time.modified 2>/dev/null)
  echo "$pkg: $info"
done

# Find large packages (size audit)
npx cost-of-modules

# Python: check for unused imports and packages
pip install pigar
pigar generate  # Regenerates requirements from imports
```

---

## Handling Update Failures

When a dependency update breaks tests:

1. **Check the CHANGELOG** for the version that broke things
2. **Search GitHub issues** for `"v2.0.0 breaking"` or the symptom
3. **Pin to the last working version** in the short term:
   ```json
   // renovate.json: ignore this version
   { "ignoreDeps": ["broken-package"] }

   // package.json: pin explicitly
   { "overrides": { "broken-package": "1.99.0" } }
   ```
4. **Open an issue** with the upstream maintainer if it's a regression
5. **Schedule a migration** for the breaking change; don't ignore it indefinitely

---

## Language-Specific Notes

### Python
- Use `pip-compile` (pip-tools) to generate pinned `requirements.txt` from `requirements.in`
- `pip-sync` installs *exactly* the pinned set (removes extras)
- Renovate supports Python pip, poetry, pipenv, pdm, uv
- `uv lock` generates `uv.lock` — use `uv sync --frozen` in CI

### Rust
- `Cargo.lock` is committed for binaries, `.gitignore`d for libraries
- `cargo update` updates within SemVer constraints
- `cargo audit` checks for CVEs in crates.io

### Go
- `go.sum` is the lockfile equivalent — always commit it
- `go get -u ./...` updates all deps; risky for major version jumps
- `govulncheck ./...` for CVE scanning (official Go tool)

### Java/Maven
- `versions:use-latest-releases` plugin for updates
- OWASP Dependency Check plugin for CVEs
- Dependabot supports `maven` ecosystem
