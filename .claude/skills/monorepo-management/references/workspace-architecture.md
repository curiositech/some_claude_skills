# Workspace Architecture Reference

## Directory Structure Patterns

### Standard Layout

```
myorg-monorepo/
├── apps/
│   ├── web/                    # Next.js consumer application
│   ├── api/                    # Express/Hono/Fastify API
│   ├── docs/                   # Documentation site (Docusaurus, Nextra)
│   └── admin/                  # Internal admin dashboard
├── packages/
│   ├── ui/                     # Shared React component library
│   ├── ui-icons/               # Icon components
│   ├── utils/                  # Shared utility functions
│   ├── types/                  # Shared TypeScript type definitions
│   ├── api-client/             # Generated or hand-written API client
│   └── database/               # Drizzle/Prisma schema and client
├── configs/
│   ├── eslint-config/          # Shared ESLint configuration
│   ├── tsconfig/               # Shared tsconfig bases
│   └── prettier-config/        # Shared Prettier configuration
├── tools/
│   └── scripts/                # Build, deploy, and maintenance scripts
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
```

**Rule**: `apps/` are deployable end products. `packages/` are libraries consumed by apps or other packages. `configs/` are configuration-only packages with no runtime code.

---

## Shared TypeScript Configuration

```
configs/tsconfig/
├── package.json
├── base.json
├── nextjs.json
└── node.json
```

```json
// configs/tsconfig/package.json
{
  "name": "@myorg/tsconfig",
  "version": "0.0.0",
  "private": true,
  "files": ["*.json"]
}
```

```json
// configs/tsconfig/base.json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

```json
// configs/tsconfig/nextjs.json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "./base.json",
  "compilerOptions": {
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "preserve",
    "plugins": [{"name": "next"}],
    "module": "ESNext",
    "incremental": true
  }
}
```

Consuming in an app:
```json
// apps/web/tsconfig.json
{
  "extends": "@myorg/tsconfig/nextjs.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

---

## Shared ESLint Configuration

```
configs/eslint-config/
├── package.json
├── index.js          # ESLint flat config (ESLint 9+)
├── next.js
└── react-internal.js
```

```js
// configs/eslint-config/index.js
import js from "@eslint/js";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [
  js.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: { "@typescript-eslint": tsPlugin },
    languageOptions: { parser: tsParser },
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "warn",
      "no-console": "warn"
    }
  }
];
```

```js
// configs/eslint-config/react-internal.js — for UI packages
import baseConfig from "./index.js";
import reactPlugin from "eslint-plugin-react";
import hooksPlugin from "eslint-plugin-react-hooks";

export default [
  ...baseConfig,
  {
    plugins: { react: reactPlugin, "react-hooks": hooksPlugin },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react/prop-types": "off"
    }
  }
];
```

Consuming in a package:
```js
// packages/ui/eslint.config.js
import reactConfig from "@myorg/eslint-config/react-internal";
export default reactConfig;
```

---

## Internal Package Structure

Internal packages (not published to npm) have a simpler setup than published ones.

```
packages/ui/
├── src/
│   ├── index.ts          # Public API: re-exports everything consumers need
│   ├── button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx
│   │   └── index.ts
│   └── input/
│       ├── Input.tsx
│       └── index.ts
├── package.json
├── tsconfig.json
└── eslint.config.js
```

```json
// packages/ui/package.json — internal package
{
  "name": "@myorg/ui",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  },
  "devDependencies": {
    "@myorg/tsconfig": "workspace:*",
    "@myorg/eslint-config": "workspace:*",
    "typescript": "^5.4.0"
  },
  "peerDependencies": {
    "react": "^18 || ^19",
    "react-dom": "^18 || ^19"
  }
}
```

**Key pattern**: Internal packages use `./src/index.ts` as their entry point — raw TypeScript, not compiled. The consuming app's bundler (Next.js, Vite) compiles it. This avoids a separate build step for internal packages and gives the bundler full access to source for tree-shaking and fast refresh.

Published packages need a proper build step producing `dist/` with compiled JS and `.d.ts` files.

---

## Published Package Structure

```json
// packages/publishable-thing/package.json
{
  "name": "@myorg/publishable-thing",
  "version": "1.2.3",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsup src/index.ts --format esm,cjs --dts",
    "dev": "tsup src/index.ts --format esm,cjs --dts --watch"
  }
}
```

Use `tsup` for building published packages — it handles ESM + CJS dual output and `.d.ts` generation with minimal configuration.

---

## CODEOWNERS

Place `.github/CODEOWNERS` at the repository root. GitHub automatically requests review from the listed owners for PRs that touch matching paths.

```
# .github/CODEOWNERS

# Default: these people are responsible for anything not matched below
* @myorg/platform-team

# Apps
/apps/web/                    @myorg/frontend-team
/apps/api/                    @myorg/backend-team
/apps/admin/                  @myorg/frontend-team @myorg/platform-team

# Shared packages
/packages/ui/                 @myorg/design-system-team
/packages/database/           @myorg/backend-team
/packages/types/              @myorg/platform-team

# Infrastructure and configs
/configs/                     @myorg/platform-team
/turbo.json                   @myorg/platform-team
/pnpm-workspace.yaml          @myorg/platform-team
/.github/                     @myorg/platform-team

# Changesets
/.changeset/                  @myorg/release-team
```

---

## Dependency Direction Rules

Enforcing a dependency direction policy prevents circular deps from accumulating.

```
Allowed directions:
  apps/* → packages/*      (apps consume packages)
  packages/* → packages/*  (packages consume other packages)
  apps/* → configs/*       (apps use shared configs)
  packages/* → configs/*   (packages use shared configs)

Forbidden:
  packages/* → apps/*      (packages must never import apps)
  configs/* → packages/*   (configs are config-only)
  configs/* → apps/*       (configs are config-only)
```

Enforce with ESLint's `import/no-restricted-paths` or Nx's `@nx/enforce-module-boundaries`:

```js
// ESLint rule (for projects not using Nx)
{
  "import/no-restricted-paths": ["error", {
    "zones": [
      {
        "target": "./packages",
        "from": "./apps",
        "message": "Packages cannot import from apps."
      }
    ]
  }]
}
```

---

## Migration: Single Repo to Monorepo

When converting an existing project to a monorepo, the order of operations matters:

1. **Set up workspace tooling first** — pnpm-workspace.yaml, turbo.json, shared configs
2. **Move existing app to `apps/`** — `mv src apps/web/src`, update paths
3. **Extract one package** — pick the clearest shared utility, create `packages/utils/`
4. **Wire workspace deps** — replace relative imports with `@myorg/utils` workspace references
5. **Configure CI** — add `--filter=...[origin/main]` for affected-only runs
6. **Extract more packages** — continue peeling shared code into packages incrementally

**Do not try to extract everything at once**. Moving one clear boundary at a time keeps the git history readable and lets you validate each step before proceeding.

---

## Path Aliases vs Workspace Packages

Two options for sharing code across a monorepo:

| Approach | Pros | Cons |
|----------|------|------|
| **Workspace package** (`@myorg/ui`) | Clear ownership, independent versioning, enforced API boundary | Requires package.json setup, build step for published packages |
| **TypeScript path alias** (`@/components/ui`) | No setup, immediate refactoring | Leaks implementation details, no ownership, hard to publish |

**Rule**: Use workspace packages for anything shared between two or more apps. Use path aliases only for intra-app organization within a single app.
