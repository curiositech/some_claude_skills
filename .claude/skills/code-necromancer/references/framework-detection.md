# Framework Detection Patterns

Techniques for identifying frameworks, libraries, and tech stacks in legacy code.

---

## Quick Detection Matrix

### Backend Frameworks

| Framework | Config Files | Key Imports | Directory Structure |
|-----------|--------------|-------------|---------------------|
| Express | - | `require('express')` | routes/, middleware/ |
| NestJS | nest-cli.json | `@nestjs/core` | src/modules/, src/*.controller.ts |
| Django | manage.py, settings.py | `from django` | apps/, templates/, static/ |
| Flask | - | `from flask` | app.py, templates/ |
| FastAPI | - | `from fastapi` | routers/, models/ |
| Rails | Gemfile, config/routes.rb | - | app/controllers/, app/models/ |
| Laravel | composer.json, artisan | - | app/Http/Controllers/, routes/ |
| Spring | pom.xml, build.gradle | `@SpringBootApplication` | src/main/java/, src/main/resources/ |

### Frontend Frameworks

| Framework | Config Files | Key Indicators | Build Output |
|-----------|--------------|----------------|--------------|
| React | - | `import React`, `useState`, JSX | build/ |
| Next.js | next.config.js | `next/` imports | .next/ |
| Vue | vue.config.js | `.vue` files, `createApp` | dist/ |
| Nuxt | nuxt.config.js | `pages/`, `composables/` | .nuxt/ |
| Angular | angular.json | `@Component`, `@NgModule` | dist/ |
| Svelte | svelte.config.js | `.svelte` files | build/ |

---

## Detection Scripts

### Universal Framework Detector

```bash
#!/bin/bash
# detect-framework.sh

detect_framework() {
  local dir="${1:-.}"

  # Node.js
  if [ -f "$dir/package.json" ]; then
    if grep -q '"next"' "$dir/package.json"; then echo "Next.js"; fi
    if grep -q '"nuxt"' "$dir/package.json"; then echo "Nuxt"; fi
    if grep -q '"@nestjs/core"' "$dir/package.json"; then echo "NestJS"; fi
    if grep -q '"express"' "$dir/package.json"; then echo "Express"; fi
    if grep -q '"fastify"' "$dir/package.json"; then echo "Fastify"; fi
    if grep -q '"react"' "$dir/package.json"; then echo "React"; fi
    if grep -q '"vue"' "$dir/package.json"; then echo "Vue"; fi
    if grep -q '"@angular/core"' "$dir/package.json"; then echo "Angular"; fi
    if grep -q '"svelte"' "$dir/package.json"; then echo "Svelte"; fi
  fi

  # Python
  if [ -f "$dir/requirements.txt" ] || [ -f "$dir/pyproject.toml" ]; then
    if grep -qi 'django' "$dir/requirements.txt" 2>/dev/null; then echo "Django"; fi
    if grep -qi 'flask' "$dir/requirements.txt" 2>/dev/null; then echo "Flask"; fi
    if grep -qi 'fastapi' "$dir/requirements.txt" 2>/dev/null; then echo "FastAPI"; fi
  fi

  # Ruby
  if [ -f "$dir/Gemfile" ]; then
    if grep -q 'rails' "$dir/Gemfile"; then echo "Rails"; fi
    if grep -q 'sinatra' "$dir/Gemfile"; then echo "Sinatra"; fi
  fi

  # PHP
  if [ -f "$dir/composer.json" ]; then
    if grep -q 'laravel' "$dir/composer.json"; then echo "Laravel"; fi
    if grep -q 'symfony' "$dir/composer.json"; then echo "Symfony"; fi
  fi

  # Java
  if [ -f "$dir/pom.xml" ]; then
    if grep -q 'spring-boot' "$dir/pom.xml"; then echo "Spring Boot"; fi
  fi

  # Go
  if [ -f "$dir/go.mod" ]; then
    if grep -q 'gin-gonic' "$dir/go.mod"; then echo "Gin"; fi
    if grep -q 'echo' "$dir/go.mod"; then echo "Echo"; fi
    if grep -q 'fiber' "$dir/go.mod"; then echo "Fiber"; fi
  fi
}
```

---

## Version Detection

### Node.js / npm
```bash
# Get exact versions from lockfile
jq '.packages | to_entries[] | select(.key | contains("express")) | .value.version' package-lock.json

# From package.json (may be range)
jq '.dependencies.express' package.json
```

### Python
```bash
# From frozen requirements
grep -i 'django' requirements.txt  # django==4.2.1

# From installed packages
pip show django | grep Version
```

### Runtime Version Detection
```bash
# Node.js version requirements
jq '.engines.node' package.json  # ">=18.0.0"

# Python version
grep 'python_requires' setup.py
grep 'requires-python' pyproject.toml

# .nvmrc / .python-version files
cat .nvmrc .python-version .ruby-version 2>/dev/null
```

---

## Build System Detection

| Build Tool | Config File | Ecosystem |
|------------|-------------|-----------|
| webpack | webpack.config.js | Node.js |
| Vite | vite.config.js | Node.js |
| esbuild | esbuild.config.js | Node.js |
| Rollup | rollup.config.js | Node.js |
| Parcel | package.json (source field) | Node.js |
| Gradle | build.gradle | JVM |
| Maven | pom.xml | JVM |
| Make | Makefile | Universal |
| CMake | CMakeLists.txt | C/C++ |
| Cargo | Cargo.toml | Rust |

---

## ORM / Database Layer Detection

```bash
# Sequelize (Node.js)
find . -name "*.js" -exec grep -l "sequelize" {} \;
ls models/*.js  # Sequelize convention

# TypeORM
find . -name "*.entity.ts"  # TypeORM entity files
grep -r "@Entity" --include="*.ts"

# Prisma
ls prisma/schema.prisma

# Django ORM
find . -name "models.py"
grep -r "models.Model" --include="*.py"

# SQLAlchemy
grep -r "from sqlalchemy" --include="*.py"

# ActiveRecord (Rails)
ls app/models/*.rb
```

---

## Test Framework Detection

| Framework | Config File | Test Pattern |
|-----------|-------------|--------------|
| Jest | jest.config.js | *.test.js, *.spec.js |
| Mocha | .mocharc.js | test/*.js |
| Vitest | vite.config.js (test) | *.test.ts |
| pytest | pytest.ini, pyproject.toml | test_*.py |
| unittest | - | test*.py |
| RSpec | .rspec | *_spec.rb |
| JUnit | - | *Test.java |
| Go test | - | *_test.go |

---

## CI/CD Detection

| Platform | Config File |
|----------|-------------|
| GitHub Actions | .github/workflows/*.yml |
| GitLab CI | .gitlab-ci.yml |
| CircleCI | .circleci/config.yml |
| Travis CI | .travis.yml |
| Jenkins | Jenkinsfile |
| Azure Pipelines | azure-pipelines.yml |
| Bitbucket Pipelines | bitbucket-pipelines.yml |

---

## Container / Infrastructure Detection

```bash
# Docker
ls Dockerfile docker-compose*.yml

# Kubernetes
find . -name "*.yaml" -path "*k8s*" -o -name "*.yaml" -path "*kubernetes*"
ls helm/

# Terraform
find . -name "*.tf"

# Serverless
ls serverless.yml serverless.ts

# Cloud Formation
find . -name "*cloudformation*.yml" -o -name "*cfn*.yml"
```
