#!/bin/bash

# Code Necromancer - Repository Scanner
# Scans a GitHub organization and creates initial inventory

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check for required tools
check_requirements() {
    echo -e "${BLUE}Checking requirements...${NC}"

    if ! command -v gh &> /dev/null; then
        echo -e "${RED}Error: GitHub CLI (gh) is not installed${NC}"
        echo "Install with: brew install gh"
        exit 1
    fi

    if ! command -v jq &> /dev/null; then
        echo -e "${RED}Error: jq is not installed${NC}"
        echo "Install with: brew install jq"
        exit 1
    fi

    # Check gh auth status
    if ! gh auth status &> /dev/null; then
        echo -e "${RED}Error: Not authenticated with GitHub CLI${NC}"
        echo "Run: gh auth login"
        exit 1
    fi

    echo -e "${GREEN}All requirements met${NC}"
}

# Usage
usage() {
    echo "Usage: $0 <org-name> [output-dir]"
    echo ""
    echo "Scans a GitHub organization and creates inventory files"
    echo ""
    echo "Arguments:"
    echo "  org-name    GitHub organization name"
    echo "  output-dir  Directory for output files (default: ./archaeology-output)"
    echo ""
    echo "Example:"
    echo "  $0 dolphin-ai ./dolphin-archaeology"
}

# Main scan function
scan_organization() {
    local ORG=$1
    local OUTPUT_DIR=$2

    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  Code Necromancer - Repository Scanner${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "Organization: ${GREEN}$ORG${NC}"
    echo -e "Output: ${GREEN}$OUTPUT_DIR${NC}"
    echo ""

    mkdir -p "$OUTPUT_DIR"

    # Phase 1: List all repos
    echo -e "${YELLOW}Phase 1: Listing repositories...${NC}"

    gh repo list "$ORG" --limit 1000 --json \
        name,description,primaryLanguage,pushedAt,createdAt,isArchived,isFork,url,sshUrl,diskUsage,defaultBranchRef \
        > "$OUTPUT_DIR/repos-raw.json"

    REPO_COUNT=$(jq 'length' "$OUTPUT_DIR/repos-raw.json")
    echo -e "  Found ${GREEN}$REPO_COUNT${NC} repositories"

    # Phase 2: Basic categorization
    echo -e "${YELLOW}Phase 2: Categorizing by language...${NC}"

    jq -r '.[].primaryLanguage.name // "Unknown"' "$OUTPUT_DIR/repos-raw.json" | \
        sort | uniq -c | sort -rn > "$OUTPUT_DIR/languages.txt"

    echo "  Language distribution:"
    cat "$OUTPUT_DIR/languages.txt" | while read count lang; do
        echo "    $lang: $count"
    done

    # Phase 3: Activity analysis
    echo -e "${YELLOW}Phase 3: Analyzing activity...${NC}"

    # Most recently active
    jq -r 'sort_by(.pushedAt) | reverse | .[0:5] | .[] | "\(.pushedAt)\t\(.name)"' \
        "$OUTPUT_DIR/repos-raw.json" > "$OUTPUT_DIR/recent-activity.txt"

    echo "  Most recently active:"
    cat "$OUTPUT_DIR/recent-activity.txt" | while read line; do
        echo "    $line"
    done

    # Oldest repos
    jq -r 'sort_by(.createdAt) | .[0:5] | .[] | "\(.createdAt)\t\(.name)"' \
        "$OUTPUT_DIR/repos-raw.json" > "$OUTPUT_DIR/oldest-repos.txt"

    # Archived repos
    ARCHIVED=$(jq '[.[] | select(.isArchived == true)] | length' "$OUTPUT_DIR/repos-raw.json")
    echo -e "  Archived repositories: ${YELLOW}$ARCHIVED${NC}"

    # Forked repos
    FORKED=$(jq '[.[] | select(.isFork == true)] | length' "$OUTPUT_DIR/repos-raw.json")
    echo -e "  Forked repositories: ${YELLOW}$FORKED${NC}"

    # Phase 4: Generate summary
    echo -e "${YELLOW}Phase 4: Generating summary...${NC}"

    LAST_ACTIVITY=$(jq -r 'sort_by(.pushedAt) | reverse | .[0].pushedAt' "$OUTPUT_DIR/repos-raw.json")
    FIRST_REPO=$(jq -r 'sort_by(.createdAt) | .[0].createdAt' "$OUTPUT_DIR/repos-raw.json")
    TOTAL_SIZE=$(jq '[.[].diskUsage] | add' "$OUTPUT_DIR/repos-raw.json")

    cat > "$OUTPUT_DIR/summary.md" << EOF
# Organization Scan Summary: $ORG

**Scan Date**: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
**Scanner**: Code Necromancer

## Overview

| Metric | Value |
|--------|-------|
| Total Repositories | $REPO_COUNT |
| Archived | $ARCHIVED |
| Forked | $FORKED |
| Total Size | ${TOTAL_SIZE:-0} KB |
| First Repository | $FIRST_REPO |
| Last Activity | $LAST_ACTIVITY |

## Language Distribution

\`\`\`
$(cat "$OUTPUT_DIR/languages.txt")
\`\`\`

## Most Recently Active

| Date | Repository |
|------|------------|
$(cat "$OUTPUT_DIR/recent-activity.txt" | awk -F'\t' '{print "| "$1" | "$2" |"}')

## Repository List

| Name | Language | Last Push | Archived |
|------|----------|-----------|----------|
$(jq -r '.[] | "| \(.name) | \(.primaryLanguage.name // "?") | \(.pushedAt | split("T")[0]) | \(.isArchived) |"' "$OUTPUT_DIR/repos-raw.json")

## Next Steps

1. Review the repository list above
2. Identify which repos are "core" vs "peripheral"
3. Run detailed analysis on priority repos
4. Create dependency graph between repos
EOF

    echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}  Scan Complete!${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
    echo ""
    echo "Output files:"
    echo "  - $OUTPUT_DIR/summary.md (start here)"
    echo "  - $OUTPUT_DIR/repos-raw.json (full data)"
    echo "  - $OUTPUT_DIR/languages.txt"
    echo "  - $OUTPUT_DIR/recent-activity.txt"
    echo "  - $OUTPUT_DIR/oldest-repos.txt"
    echo ""
    echo "Next: Review summary.md and run analyze-repo.sh on key repositories"
}

# Main
if [ $# -lt 1 ]; then
    usage
    exit 1
fi

ORG=$1
OUTPUT_DIR=${2:-"./archaeology-output"}

check_requirements
scan_organization "$ORG" "$OUTPUT_DIR"
