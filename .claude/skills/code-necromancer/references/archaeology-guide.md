# Code Archaeology Guide

A deep dive into techniques for understanding legacy codebases.

## Philosophy

**"Understand before you touch."**

The cardinal rule of code archaeology is to fully map and understand a system before making any changes. Premature modification leads to:
- Breaking unknown dependencies
- Introducing regressions in untested code
- Missing the actual architecture (vs. assumed architecture)
- Wasted effort on deprecated components

## The Archaeological Method

### 1. Surface Survey

Start with the broadest possible view:

```bash
# Get organization overview
gh repo list ORG --limit 1000 --json name,description,primaryLanguage,pushedAt,isArchived

# Count repos by language
gh repo list ORG --json primaryLanguage -q '.[].primaryLanguage.name' | sort | uniq -c

# Find most recently active
gh repo list ORG --json name,pushedAt --jq 'sort_by(.pushedAt) | reverse | .[0:5]'

# Find oldest
gh repo list ORG --json name,createdAt --jq 'sort_by(.createdAt) | .[0:5]'
```

### 2. Stratification

Categorize repos into layers:

**Layer 1: User-Facing**
- Web frontends
- Mobile apps
- CLI tools
- Signs: "react", "vue", "angular", "flutter", "swift"

**Layer 2: API Gateway**
- Main API servers
- GraphQL endpoints
- Signs: "express", "fastapi", "gin", "/api/", "graphql"

**Layer 3: Services**
- Background workers
- Microservices
- Signs: "worker", "service", "processor", "queue"

**Layer 4: Data**
- Database migrations
- Data pipelines
- Signs: "migrations", "etl", "pipeline", "warehouse"

**Layer 5: Infrastructure**
- Deployment configs
- Terraform/CDK
- Signs: "infra", "terraform", "cdk", "k8s", "deploy"

**Layer 6: Libraries**
- Shared code
- Internal packages
- Signs: "@org/", "common", "shared", "utils", "lib"

### 3. Excavation

Deep dive into each significant repo:

#### README Analysis
```bash
# Check for README
ls -la README*

# Extract key sections
grep -A 10 "^## " README.md
```

#### Package Manifest Analysis
```bash
# Node.js - Find all package.json files
find . -name "package.json" -not -path "*/node_modules/*"

# Extract dependencies
jq '.dependencies, .devDependencies' package.json

# Find internal dependencies
jq '.dependencies | keys[] | select(startswith("@org"))' package.json

# Python - requirements
cat requirements*.txt

# Go - modules
cat go.mod
```

#### Configuration Discovery
```bash
# Find all config files
find . -name "*.config.*" -o -name ".env*" -o -name "*.yaml" -o -name "*.yml"

# Extract environment variables from code
grep -r "process.env\." --include="*.js" --include="*.ts" | \
  sed 's/.*process.env.\([A-Z_]*\).*/\1/' | sort -u

# Python env vars
grep -r "os.environ\|os.getenv" --include="*.py" | \
  grep -oE '"[A-Z_]+"' | sort -u
```

#### Database Schema Discovery
```bash
# Find migration files
find . -name "*migration*" -o -name "*schema*" -type f

# Look for ORM models
grep -r "class.*Model\|@Entity\|db.Model" --include="*.py" --include="*.ts" --include="*.js"

# Find SQL files
find . -name "*.sql"
```

#### API Endpoint Discovery
```bash
# Express routes
grep -r "app\.\(get\|post\|put\|delete\|patch\)" --include="*.js" --include="*.ts"

# FastAPI/Flask routes
grep -r "@app\.\(get\|post\|put\|delete\|route\)" --include="*.py"

# Find OpenAPI/Swagger specs
find . -name "swagger*" -o -name "openapi*"
```

### 4. Dating (Timeline Reconstruction)

```bash
# First commit ever
git log --reverse --format="%H %ai %s" | head -1

# Last commit
git log -1 --format="%H %ai %s"

# Commits per month over project lifetime
git log --format="%ai" | cut -d'-' -f1,2 | sort | uniq -c

# Most active contributors
git shortlog -sn --all

# When was each file last modified?
git ls-tree -r --name-only HEAD | while read f; do
  echo "$(git log -1 --format="%ai" -- "$f") $f"
done | sort -r
```

### 5. Cross-Referencing

Find how repos connect:

```bash
# Find internal package references
grep -r "@org/" --include="package.json" | grep -v node_modules

# Find API calls between services
grep -r "http://\|https://\|localhost:" --include="*.js" --include="*.ts" --include="*.py"

# Find shared database names
grep -r "DATABASE_URL\|DB_NAME\|MONGO_URI" --include="*.env*" --include="*.yaml"
```

## Pattern Recognition

### Common Architecture Patterns

**Monolith Signs:**
- Single repo with /api, /frontend, /workers directories
- Single package.json with many scripts
- Single database connection

**Microservices Signs:**
- Multiple repos with similar structure
- Service discovery config (consul, eureka)
- Message queues (RabbitMQ, Kafka, SQS)
- API gateway repo

**Monorepo Signs:**
- Lerna/Nx/Turborepo config
- packages/ or apps/ directory
- Shared workspace dependencies

**JAMstack Signs:**
- Static site generators (Gatsby, Next, Hugo)
- Netlify/Vercel configs
- Headless CMS references

### Common Problems to Look For

**Dependency Hell:**
- Multiple versions of same package
- Circular dependencies between repos
- Pinned versions that are EOL

**Configuration Sprawl:**
- Environment variables everywhere
- No .env.example files
- Hardcoded values in code

**Documentation Rot:**
- README refers to non-existent files
- Installation instructions don't work
- API docs don't match code

**Test Desert:**
- No test files
- Empty test directories
- Tests that don't run

## Tools of the Trade

### Essential CLI Tools

```bash
# Code statistics
cloc .                    # Count lines of code
tokei .                   # Faster alternative

# Dependency analysis
npm ls --all              # Node dependency tree
pipdeptree                # Python dependency tree
go mod graph              # Go dependency graph

# Security scanning
npm audit                 # Node vulnerabilities
safety check              # Python vulnerabilities
govulncheck ./...         # Go vulnerabilities

# Git archaeology
git-fame                  # Contributor statistics
git log --graph --oneline # Visual history
```

### Visualization Tools

- **Mermaid**: For architecture diagrams
- **D2**: For more complex diagrams
- **Graphviz**: For dependency graphs
- **PlantUML**: For UML diagrams

### Analysis Scripts

See `scripts/` directory for automated analysis tools.

## Documentation Templates

### Repo Profile Template

```markdown
# [Repo Name]

## Purpose
[One sentence description]

## Category
[core|support|library|deprecated|unknown]

## Tech Stack
- Language:
- Framework:
- Database:
- Runtime:

## Dependencies
- Internal: [@org/lib1, @org/lib2]
- External critical: [express, mongoose, ...]

## Environment
- Required vars: [LIST]
- Config files: [LIST]

## Status
- Last active: [DATE]
- Maturity: [1-5]
- Test coverage: [%]

## Notes
[Anything notable discovered]
```

## Anti-Patterns to Avoid

1. **Premature Optimization**: Don't start fixing things before understanding the whole
2. **Tunnel Vision**: Don't focus too long on one interesting repo
3. **Assumption Bias**: Don't assume you know what something does—verify
4. **Documentation Trust**: Don't trust old docs—verify against code
5. **Recency Bias**: Old repos may be more important than recent ones

## Checklist: Is Archaeology Complete?

- [ ] All repos identified and cataloged
- [ ] Primary language/framework per repo known
- [ ] Inter-repo dependencies mapped
- [ ] External service dependencies listed
- [ ] Database schemas identified
- [ ] API surfaces documented
- [ ] Environment requirements known
- [ ] Core vs peripheral repos identified
- [ ] Development timeline understood
- [ ] Missing pieces documented
- [ ] Architecture diagram created
