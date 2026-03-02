# Turborepo Patterns Reference

## turbo.json Configuration Deep Dive

### Full Task Configuration Options

```json
{
  "$schema": "https://turbo.build/schema.json",
  "ui": "tui",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": [
        "src/**",
        "public/**",
        "package.json",
        "tsconfig.json",
        "next.config.*",
        "!**/*.test.*",
        "!**/*.spec.*"
      ],
      "outputs": [
        ".next/**",
        "!.next/cache/**",
        "dist/**",
        "build/**"
      ],
      "env": ["NODE_ENV", "NEXT_PUBLIC_API_URL"]
    },
    "test": {
      "dependsOn": ["^build"],
      "inputs": ["src/**", "**/*.test.*", "**/*.spec.*", "vitest.config.*"],
      "outputs": ["coverage/**"],
      "env": ["NODE_ENV"]
    },
    "lint": {
      "inputs": ["src/**", ".eslintrc*", "eslint.config.*"],
      "outputs": []
    },
    "typecheck": {
      "dependsOn": ["^build"],
      "inputs": ["src/**", "tsconfig.json"],
      "outputs": []
    },
    "dev": {
      "cache": false,
      "persistent": true,
      "dependsOn": ["^build"]
    },
    "clean": {
      "cache": false
    }
  },
  "globalEnv": ["CI", "VERCEL_ENV"],
  "globalDependencies": [".env.local", "turbo.json"]
}
```

### Input Patterns

- `src/**` — all files under src
- `!**/*.test.*` — exclude test files from build cache key (tests don't affect build output)
- `$TURBO_DEFAULT$` — expands to the default Turborepo input set (all files tracked by git)

**Critical**: `env` in task config adds environment variables to the cache key. If your build reads `NEXT_PUBLIC_API_URL`, add it here or cache hits in CI won't match local builds.

### Output Patterns

- `.next/**` followed by `!.next/cache/**` — include .next but exclude the Next.js build cache (it's large and managed separately)
- `dist/**` — TypeScript compiled output
- `""` — empty outputs array, still cache the task completion (useful for lint, typecheck)

---

## Task Filtering

```bash
# Run for a specific package by name
turbo build --filter=web
turbo build --filter=@myorg/ui

# Run for a package and all its dependencies (packages it imports)
turbo build --filter=web...

# Run for a package and all packages that depend on it (downstream)
turbo build --filter=...web

# Packages changed since branching from main
turbo build --filter=...[origin/main]

# Changed packages and their dependents (full impact)
turbo build --filter=...[origin/main]...

# Exclude a package
turbo build --filter=!docs-site

# Multiple filters
turbo build --filter=web --filter=api

# From a specific directory
turbo build --filter=./apps/web
```

---

## Remote Caching

### Vercel Remote Cache (Recommended)

```bash
# Authenticate (one-time setup)
npx turbo login
npx turbo link

# Environment variables for CI
TURBO_TOKEN=your-token    # from Vercel dashboard → Settings → Tokens
TURBO_TEAM=your-org-slug  # from Vercel team URL
```

```yaml
# GitHub Actions
- name: Build
  run: turbo build
  env:
    TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
    TURBO_TEAM: ${{ vars.TURBO_TEAM }}
```

### Self-Hosted Remote Cache

Turborepo 2.x includes a built-in HTTP cache server:

```bash
# Start cache server
turbo daemon

# Or use the open-source turbo-remote-cache package
npx turbo-remote-cache
```

Environment variables for custom cache server:
```
TURBO_API=http://your-cache-server.internal
TURBO_TOKEN=your-token
TURBO_TEAM=your-team
```

---

## Docker Pruning for Deployment

Turborepo's `prune` command creates a minimal workspace with only the packages needed for a specific app. This is essential for Docker builds — without it, you'd copy the entire monorepo into the container.

```bash
# Prune to only what 'web' needs
turbo prune web --docker
```

This produces:
```
out/
├── json/          # Only package.json files (for dependency install layer)
│   ├── package.json
│   └── packages/ui/package.json
└── full/          # Full source for packages that 'web' depends on
    ├── apps/web/
    └── packages/ui/
```

### Dockerfile Pattern with Turbo Prune

```dockerfile
FROM node:20-alpine AS base
RUN corepack enable pnpm

# Stage 1: Prune to only what 'web' needs
FROM base AS pruner
WORKDIR /app
COPY . .
RUN npx turbo prune web --docker

# Stage 2: Install dependencies (cached layer)
FROM base AS installer
WORKDIR /app
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile

# Stage 3: Build
FROM installer AS builder
COPY --from=pruner /app/out/full/ .
RUN pnpm turbo build --filter=web...

# Stage 4: Production image
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
```

**Why this order matters**: The `out/json/` copy + install step is a separate Docker layer. If package.json files don't change, this layer is cached and `pnpm install` doesn't re-run. Source code changes only invalidate the build layer.

---

## Debugging Cache Misses

```bash
# See exactly why each package ran or was cached
turbo build --verbosity=2

# Generate a graph of what would run
turbo build --graph

# Summarize cache status without running
turbo build --dry-run

# Force a run ignoring cache
turbo build --force
```

**Common cache miss causes**:

1. **Missing `inputs` field** — Turborepo hashes the whole package directory including IDE files
2. **Non-deterministic build** — Build output differs on each run (timestamps in files, random seeds)
3. **Environment variable not in `env`** — Build uses an env var that's not in the cache key
4. **Global dependency changed** — `globalDependencies` includes a file that changed

**Verification**:
```bash
# Check what files Turborepo is hashing for a package
turbo build --summarize
# Creates .turbo/runs/HASH.json with full hash details
```

---

## Pipeline Dependency Patterns

```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["build"]
    },
    "deploy": {
      "dependsOn": ["build", "test", "^deploy"]
    },
    "db:migrate": {
      "cache": false,
      "dependsOn": ["^build"]
    }
  }
}
```

- `"^build"` — topological: dependencies build first
- `"build"` — same-package: this package's build must complete first
- `"^deploy"` — deploy all dependencies before deploying this package (useful for infrastructure ordering)

---

## Package-Level turbo.json Overrides

Individual packages can override task config (Turborepo 2.x):

```json
// apps/web/turbo.json
{
  "extends": ["//"],
  "tasks": {
    "build": {
      "env": ["NEXT_PUBLIC_API_URL", "NEXT_PUBLIC_ANALYTICS_ID"]
    }
  }
}
```

`//` refers to the root `turbo.json`. This is preferred over duplicating root config.
