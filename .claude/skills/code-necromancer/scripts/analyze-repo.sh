#!/bin/bash

# Code Necromancer - Single Repository Analyzer
# Deep analysis of a single repository

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

usage() {
    echo "Usage: $0 <repo-path> [output-file]"
    echo ""
    echo "Performs deep analysis of a repository"
    echo ""
    echo "Arguments:"
    echo "  repo-path   Path to cloned repository"
    echo "  output-file Output JSON file (default: repo-analysis.json)"
}

analyze_repo() {
    local REPO_PATH=$1
    local OUTPUT_FILE=${2:-"repo-analysis.json"}

    if [ ! -d "$REPO_PATH" ]; then
        echo -e "${RED}Error: Directory not found: $REPO_PATH${NC}"
        exit 1
    fi

    cd "$REPO_PATH"
    local REPO_NAME=$(basename "$REPO_PATH")

    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  Analyzing: $REPO_NAME${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo ""

    # Initialize JSON output
    echo "{" > "$OUTPUT_FILE"
    echo "  \"name\": \"$REPO_NAME\"," >> "$OUTPUT_FILE"
    echo "  \"analyzed_at\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\"," >> "$OUTPUT_FILE"

    # Git info
    echo -e "${CYAN}[1/10] Git History...${NC}"
    if [ -d ".git" ]; then
        FIRST_COMMIT=$(git log --reverse --format="%ai" 2>/dev/null | head -1 || echo "unknown")
        LAST_COMMIT=$(git log -1 --format="%ai" 2>/dev/null || echo "unknown")
        TOTAL_COMMITS=$(git rev-list --count HEAD 2>/dev/null || echo "0")
        CONTRIBUTORS=$(git shortlog -sn --all 2>/dev/null | wc -l | tr -d ' ')
        BRANCHES=$(git branch -a 2>/dev/null | wc -l | tr -d ' ')

        echo "  \"git\": {" >> "$OUTPUT_FILE"
        echo "    \"first_commit\": \"$FIRST_COMMIT\"," >> "$OUTPUT_FILE"
        echo "    \"last_commit\": \"$LAST_COMMIT\"," >> "$OUTPUT_FILE"
        echo "    \"total_commits\": $TOTAL_COMMITS," >> "$OUTPUT_FILE"
        echo "    \"contributors\": $CONTRIBUTORS," >> "$OUTPUT_FILE"
        echo "    \"branches\": $BRANCHES" >> "$OUTPUT_FILE"
        echo "  }," >> "$OUTPUT_FILE"

        echo "    First commit: $FIRST_COMMIT"
        echo "    Last commit: $LAST_COMMIT"
        echo "    Total commits: $TOTAL_COMMITS"
    else
        echo "  \"git\": null," >> "$OUTPUT_FILE"
        echo "    Not a git repository"
    fi

    # File structure
    echo -e "${CYAN}[2/10] File Structure...${NC}"
    TOTAL_FILES=$(find . -type f -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/venv/*" -not -path "*/__pycache__/*" 2>/dev/null | wc -l | tr -d ' ')
    echo "  \"total_files\": $TOTAL_FILES," >> "$OUTPUT_FILE"
    echo "    Files (excl. node_modules, .git): $TOTAL_FILES"

    # Language detection
    echo -e "${CYAN}[3/10] Languages...${NC}"
    echo "  \"languages\": {" >> "$OUTPUT_FILE"
    FIRST=true
    for ext in js ts jsx tsx py go java rb rs php; do
        COUNT=$(find . -name "*.$ext" -not -path "*/node_modules/*" -not -path "*/.git/*" 2>/dev/null | wc -l | tr -d ' ')
        if [ "$COUNT" -gt 0 ]; then
            if [ "$FIRST" = true ]; then
                FIRST=false
            else
                echo "," >> "$OUTPUT_FILE"
            fi
            echo -n "    \"$ext\": $COUNT" >> "$OUTPUT_FILE"
            echo "    $ext: $COUNT files"
        fi
    done
    echo "" >> "$OUTPUT_FILE"
    echo "  }," >> "$OUTPUT_FILE"

    # Framework detection
    echo -e "${CYAN}[4/10] Framework Detection...${NC}"
    FRAMEWORKS=""

    # Node.js / JavaScript
    if [ -f "package.json" ]; then
        if grep -q '"react"' package.json 2>/dev/null; then FRAMEWORKS="$FRAMEWORKS React"; fi
        if grep -q '"vue"' package.json 2>/dev/null; then FRAMEWORKS="$FRAMEWORKS Vue"; fi
        if grep -q '"angular"' package.json 2>/dev/null; then FRAMEWORKS="$FRAMEWORKS Angular"; fi
        if grep -q '"express"' package.json 2>/dev/null; then FRAMEWORKS="$FRAMEWORKS Express"; fi
        if grep -q '"next"' package.json 2>/dev/null; then FRAMEWORKS="$FRAMEWORKS Next.js"; fi
        if grep -q '"nest"' package.json 2>/dev/null; then FRAMEWORKS="$FRAMEWORKS NestJS"; fi
        if grep -q '"electron"' package.json 2>/dev/null; then FRAMEWORKS="$FRAMEWORKS Electron"; fi
    fi

    # Python
    if [ -f "requirements.txt" ] || [ -f "setup.py" ] || [ -f "pyproject.toml" ]; then
        if grep -qE "django|Django" requirements.txt setup.py pyproject.toml 2>/dev/null; then FRAMEWORKS="$FRAMEWORKS Django"; fi
        if grep -qE "flask|Flask" requirements.txt setup.py pyproject.toml 2>/dev/null; then FRAMEWORKS="$FRAMEWORKS Flask"; fi
        if grep -qE "fastapi|FastAPI" requirements.txt setup.py pyproject.toml 2>/dev/null; then FRAMEWORKS="$FRAMEWORKS FastAPI"; fi
    fi

    # Go
    if [ -f "go.mod" ]; then
        if grep -q "gin-gonic" go.mod 2>/dev/null; then FRAMEWORKS="$FRAMEWORKS Gin"; fi
        if grep -q "echo" go.mod 2>/dev/null; then FRAMEWORKS="$FRAMEWORKS Echo"; fi
    fi

    FRAMEWORKS=$(echo "$FRAMEWORKS" | xargs)  # Trim
    echo "  \"frameworks\": \"$FRAMEWORKS\"," >> "$OUTPUT_FILE"
    echo "    Detected: ${FRAMEWORKS:-None detected}"

    # Configuration files
    echo -e "${CYAN}[5/10] Configuration Files...${NC}"
    echo "  \"config_files\": [" >> "$OUTPUT_FILE"
    FIRST=true
    for cf in package.json tsconfig.json webpack.config.js vite.config.js rollup.config.js \
              requirements.txt setup.py pyproject.toml setup.cfg \
              go.mod Cargo.toml Gemfile pom.xml build.gradle \
              Dockerfile docker-compose.yml docker-compose.yaml \
              .env.example .env.sample \
              .github/workflows .travis.yml .circleci jenkins* \
              terraform*.tf serverless.yml sam.yaml; do
        if [ -e "$cf" ]; then
            if [ "$FIRST" = true ]; then
                FIRST=false
            else
                echo "," >> "$OUTPUT_FILE"
            fi
            echo -n "    \"$cf\"" >> "$OUTPUT_FILE"
            echo "    Found: $cf"
        fi
    done
    echo "" >> "$OUTPUT_FILE"
    echo "  ]," >> "$OUTPUT_FILE"

    # Environment variables
    echo -e "${CYAN}[6/10] Environment Variables...${NC}"
    echo "  \"env_vars\": [" >> "$OUTPUT_FILE"

    # Extract from various sources
    ENV_VARS=""

    # From .env.example
    if [ -f ".env.example" ]; then
        ENV_VARS="$ENV_VARS $(grep -E "^[A-Z_]+=" .env.example 2>/dev/null | cut -d= -f1 || true)"
    fi

    # From JS/TS files
    ENV_VARS="$ENV_VARS $(grep -rh "process\.env\." --include="*.js" --include="*.ts" 2>/dev/null | \
        grep -oE "process\.env\.[A-Z_]+" | sed 's/process.env.//' | sort -u || true)"

    # From Python files
    ENV_VARS="$ENV_VARS $(grep -rhE "os\.environ|os\.getenv" --include="*.py" 2>/dev/null | \
        grep -oE '"[A-Z_]+"' | tr -d '"' | sort -u || true)"

    # Deduplicate and format
    ENV_VARS=$(echo "$ENV_VARS" | tr ' ' '\n' | sort -u | grep -v "^$")

    FIRST=true
    for var in $ENV_VARS; do
        if [ "$FIRST" = true ]; then
            FIRST=false
        else
            echo "," >> "$OUTPUT_FILE"
        fi
        echo -n "    \"$var\"" >> "$OUTPUT_FILE"
    done
    echo "" >> "$OUTPUT_FILE"
    echo "  ]," >> "$OUTPUT_FILE"

    ENV_COUNT=$(echo "$ENV_VARS" | wc -w | tr -d ' ')
    echo "    Found $ENV_COUNT unique environment variables"

    # Database detection
    echo -e "${CYAN}[7/10] Database Detection...${NC}"
    DATABASES=""

    # Check package.json
    if [ -f "package.json" ]; then
        if grep -qE "pg|postgres" package.json 2>/dev/null; then DATABASES="$DATABASES PostgreSQL"; fi
        if grep -q "mysql" package.json 2>/dev/null; then DATABASES="$DATABASES MySQL"; fi
        if grep -q "mongodb\|mongoose" package.json 2>/dev/null; then DATABASES="$DATABASES MongoDB"; fi
        if grep -q "redis" package.json 2>/dev/null; then DATABASES="$DATABASES Redis"; fi
        if grep -q "sqlite" package.json 2>/dev/null; then DATABASES="$DATABASES SQLite"; fi
    fi

    # Check requirements.txt
    if [ -f "requirements.txt" ]; then
        if grep -qE "psycopg|asyncpg" requirements.txt 2>/dev/null; then DATABASES="$DATABASES PostgreSQL"; fi
        if grep -q "pymysql\|mysqlclient" requirements.txt 2>/dev/null; then DATABASES="$DATABASES MySQL"; fi
        if grep -q "pymongo" requirements.txt 2>/dev/null; then DATABASES="$DATABASES MongoDB"; fi
        if grep -q "redis" requirements.txt 2>/dev/null; then DATABASES="$DATABASES Redis"; fi
    fi

    DATABASES=$(echo "$DATABASES" | tr ' ' '\n' | sort -u | xargs)
    echo "  \"databases\": \"$DATABASES\"," >> "$OUTPUT_FILE"
    echo "    Detected: ${DATABASES:-None detected}"

    # Tests
    echo -e "${CYAN}[8/10] Test Detection...${NC}"
    TEST_FILES=$(find . -name "*test*.js" -o -name "*test*.ts" -o -name "*test*.py" -o -name "*_test.go" \
        -not -path "*/node_modules/*" -not -path "*/.git/*" 2>/dev/null | wc -l | tr -d ' ')
    SPEC_FILES=$(find . -name "*.spec.*" -not -path "*/node_modules/*" 2>/dev/null | wc -l | tr -d ' ')

    HAS_JEST=$(grep -q '"jest"' package.json 2>/dev/null && echo "true" || echo "false")
    HAS_MOCHA=$(grep -q '"mocha"' package.json 2>/dev/null && echo "true" || echo "false")
    HAS_PYTEST=$(grep -q "pytest" requirements.txt 2>/dev/null && echo "true" || echo "false")

    echo "  \"tests\": {" >> "$OUTPUT_FILE"
    echo "    \"test_files\": $TEST_FILES," >> "$OUTPUT_FILE"
    echo "    \"spec_files\": $SPEC_FILES," >> "$OUTPUT_FILE"
    echo "    \"jest\": $HAS_JEST," >> "$OUTPUT_FILE"
    echo "    \"mocha\": $HAS_MOCHA," >> "$OUTPUT_FILE"
    echo "    \"pytest\": $HAS_PYTEST" >> "$OUTPUT_FILE"
    echo "  }," >> "$OUTPUT_FILE"
    echo "    Test files: $TEST_FILES, Spec files: $SPEC_FILES"

    # Documentation
    echo -e "${CYAN}[9/10] Documentation...${NC}"
    HAS_README=$([ -f "README.md" ] || [ -f "README.rst" ] || [ -f "README" ] && echo "true" || echo "false")
    HAS_DOCS=$([ -d "docs" ] && echo "true" || echo "false")
    HAS_CHANGELOG=$([ -f "CHANGELOG.md" ] || [ -f "CHANGELOG" ] && echo "true" || echo "false")
    HAS_CONTRIBUTING=$([ -f "CONTRIBUTING.md" ] && echo "true" || echo "false")

    echo "  \"documentation\": {" >> "$OUTPUT_FILE"
    echo "    \"readme\": $HAS_README," >> "$OUTPUT_FILE"
    echo "    \"docs_folder\": $HAS_DOCS," >> "$OUTPUT_FILE"
    echo "    \"changelog\": $HAS_CHANGELOG," >> "$OUTPUT_FILE"
    echo "    \"contributing\": $HAS_CONTRIBUTING" >> "$OUTPUT_FILE"
    echo "  }," >> "$OUTPUT_FILE"
    echo "    README: $HAS_README, /docs: $HAS_DOCS, CHANGELOG: $HAS_CHANGELOG"

    # CI/CD
    echo -e "${CYAN}[10/10] CI/CD...${NC}"
    HAS_GH_ACTIONS=$([ -d ".github/workflows" ] && echo "true" || echo "false")
    HAS_TRAVIS=$([ -f ".travis.yml" ] && echo "true" || echo "false")
    HAS_CIRCLE=$([ -d ".circleci" ] && echo "true" || echo "false")
    HAS_DOCKER=$([ -f "Dockerfile" ] && echo "true" || echo "false")
    HAS_COMPOSE=$([ -f "docker-compose.yml" ] || [ -f "docker-compose.yaml" ] && echo "true" || echo "false")

    echo "  \"ci_cd\": {" >> "$OUTPUT_FILE"
    echo "    \"github_actions\": $HAS_GH_ACTIONS," >> "$OUTPUT_FILE"
    echo "    \"travis\": $HAS_TRAVIS," >> "$OUTPUT_FILE"
    echo "    \"circleci\": $HAS_CIRCLE," >> "$OUTPUT_FILE"
    echo "    \"dockerfile\": $HAS_DOCKER," >> "$OUTPUT_FILE"
    echo "    \"docker_compose\": $HAS_COMPOSE" >> "$OUTPUT_FILE"
    echo "  }" >> "$OUTPUT_FILE"
    echo "}" >> "$OUTPUT_FILE"

    echo "    GitHub Actions: $HAS_GH_ACTIONS, Docker: $HAS_DOCKER"

    echo ""
    echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}  Analysis Complete!${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
    echo ""
    echo "Output: $OUTPUT_FILE"
}

# Main
if [ $# -lt 1 ]; then
    usage
    exit 1
fi

analyze_repo "$1" "${2:-repo-analysis.json}"
