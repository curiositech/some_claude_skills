# Monorepo Git Strategies

Patterns for managing large repositories with multiple packages, services, or teams.

---

## Performance at Scale

### Problem: Large Repos Are Slow

Git operations slow down with:
- Many files (&gt;100K): `git status` takes seconds
- Large history (&gt;100K commits): `git log`, `git blame` slow
- Large objects (binaries, ML models): clone takes forever

### Solutions

```bash
# Partial clone (skip blobs until needed)
git clone --filter=blob:none https://github.com/org/monorepo.git

# Shallow clone (truncate history)
git clone --depth=1 https://github.com/org/monorepo.git

# Sparse checkout (only work on your packages)
git sparse-checkout init --cone
git sparse-checkout set packages/my-service shared/

# Git maintenance (schedule background optimization)
git maintenance start
# Runs: prefetch, loose-objects, incremental-repack, pack-refs
```

### Filesystem Monitor (FSMonitor)

```bash
# Enable Watchman integration for faster git status
git config core.fsmonitor true
git config core.untrackedcache true

# On macOS, also:
git config core.fsmonitor.hookversion 2
```

---

## CODEOWNERS

```
# .github/CODEOWNERS

# Global — catch-all reviewers
* @org/platform-team

# Package-specific
/packages/auth/     @org/auth-team
/packages/billing/  @org/billing-team
/packages/ui/       @org/design-system-team

# Specific files
package.json        @org/platform-team
tsconfig.base.json  @org/platform-team

# CI/CD
/.github/workflows/ @org/devops-team
```

---

## Path-Based CI Triggers

### GitHub Actions

```yaml
on:
  push:
    paths:
      - 'packages/auth/**'
      - 'shared/types/**'
  pull_request:
    paths:
      - 'packages/auth/**'
      - 'shared/types/**'
```

### Turborepo-Aware

```bash
# Only test affected packages
npx turbo run test --filter=...[HEAD~1]

# Show what packages changed
npx turbo run build --dry-run --filter=...[main...HEAD]
```

---

## Branch Protection in Monorepos

### Per-Path Branch Protection (GitHub)

GitHub doesn't natively support per-path branch protection. Workarounds:

1. **CODEOWNERS + Required Reviews**: Different teams for different paths
2. **Rulesets (GitHub 2024+)**: Path-based restrictions
3. **CI Status Checks**: Per-package test jobs that only run when their paths change

### Recommended Setup

```yaml
# Required status checks:
# - packages/auth: auth-tests must pass
# - packages/billing: billing-tests must pass
# - global: lint, typecheck must always pass
```

---

## Commit Conventions for Monorepos

### Conventional Commits with Scope

```
feat(auth): add PKCE support for OAuth flow
fix(billing): correct proration calculation for annual plans
docs(ui): update Button component API reference
chore(deps): bump TypeScript to 5.4
```

Scopes map to package names. This enables:
- Automated changelogs per package
- Version bumping only affected packages (Changesets, Lerna)
- Filtering git log by package: `git log --oneline -- packages/auth/`

---

## Submodule Alternatives

| Approach | Use When | Trade-off |
|----------|---------|-----------|
| **Monorepo** | One team, shared tooling | Scales to ~100 devs well, then gets complex |
| **Subtree** | Vendoring small shared libs | No pointer indirection, but merge noise |
| **Package registry** | Shared code with semver | Clean boundaries, but publish/consume cycle |
| **Git submodule** | Large vendored dependency | Complex UX, detached HEAD trap, CI complexity |
| **Repo links (Nx)** | Multi-repo with monorepo DX | Tooling-dependent |

### Migrating FROM Submodules

```bash
# Convert submodule to subtree
git submodule deinit libs/shared
git rm libs/shared
rm -rf .git/modules/libs/shared

# Re-add as subtree
git subtree add --prefix=libs/shared https://github.com/org/shared.git main --squash
```

---

## Large File Handling

### Git LFS

```bash
# Install and enable
git lfs install

# Track file patterns
git lfs track "*.psd" "*.sketch" "*.zip" "models/*.bin"

# Check what's tracked
git lfs ls-files

# Migrate existing large files to LFS
git lfs migrate import --include="*.bin" --everything
```

### Cost Warning

Git LFS has storage and bandwidth limits on GitHub. For ML models (&gt;1GB), consider:
- DVC (Data Version Control) — pointers in git, data in S3/GCS
- Hugging Face Hub — purpose-built for model versioning
- Artifact registries — separate from git entirely
