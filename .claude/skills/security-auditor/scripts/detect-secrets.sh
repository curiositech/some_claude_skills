#!/bin/bash
# Secret Detection Script
# Scans for high-entropy strings, API keys, credentials, and sensitive patterns

set -euo pipefail

TARGET_DIR="${1:-.}"
OUTPUT_FILE="${2:-secrets-report.json}"

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo "Scanning for secrets in: $TARGET_DIR"
echo "=================================="

# Initialize findings array
FINDINGS="[]"
CRITICAL_COUNT=0
HIGH_COUNT=0
MEDIUM_COUNT=0

# Function to add finding
add_finding() {
    local severity="$1"
    local pattern_name="$2"
    local file="$3"
    local line_num="$4"
    local evidence="$5"

    local finding=$(jq -n \
        --arg sev "$severity" \
        --arg pat "$pattern_name" \
        --arg file "$file" \
        --arg line "$line_num" \
        --arg ev "$evidence" \
        '{severity: $sev, pattern: $pat, file: $file, line: $line, evidence: $ev}')

    FINDINGS=$(echo "$FINDINGS" | jq ". + [$finding]")
}

# Skip patterns for files we shouldn't scan
SKIP_PATTERNS=(
    "node_modules"
    ".git"
    "dist"
    "build"
    ".next"
    "__pycache__"
    "*.min.js"
    "*.bundle.js"
    "package-lock.json"
    "yarn.lock"
    "*.woff"
    "*.woff2"
    "*.ttf"
    "*.png"
    "*.jpg"
    "*.gif"
    "*.ico"
    "*.svg"
)

# Build find exclusion
FIND_EXCLUDES=""
for pattern in "${SKIP_PATTERNS[@]}"; do
    FIND_EXCLUDES="$FIND_EXCLUDES -not -path '*/$pattern/*' -not -name '$pattern'"
done

echo -e "\n${YELLOW}[1/5] Checking for AWS credentials...${NC}"
# AWS Access Key ID
while IFS=: read -r file line content; do
    if [[ -n "$content" ]]; then
        echo -e "${RED}CRITICAL: AWS Key in $file:$line${NC}"
        add_finding "critical" "AWS Access Key" "$file" "$line" "AKIA... pattern detected"
        ((CRITICAL_COUNT++))
    fi
done < <(eval "find '$TARGET_DIR' -type f $FIND_EXCLUDES -exec grep -Hn 'AKIA[0-9A-Z]\{16\}' {} \; 2>/dev/null" || true)

# AWS Secret Key pattern
while IFS=: read -r file line content; do
    if [[ -n "$content" ]]; then
        echo -e "${RED}CRITICAL: Possible AWS Secret in $file:$line${NC}"
        add_finding "critical" "AWS Secret Key" "$file" "$line" "40-char base64 near 'secret'"
        ((CRITICAL_COUNT++))
    fi
done < <(eval "find '$TARGET_DIR' -type f $FIND_EXCLUDES -exec grep -Hin 'aws.*secret.*[A-Za-z0-9/+=]\{40\}' {} \; 2>/dev/null" || true)

echo -e "\n${YELLOW}[2/5] Checking for private keys...${NC}"
# Private keys
while IFS=: read -r file line content; do
    if [[ -n "$content" ]]; then
        echo -e "${RED}CRITICAL: Private key in $file:$line${NC}"
        add_finding "critical" "Private Key" "$file" "$line" "BEGIN PRIVATE KEY detected"
        ((CRITICAL_COUNT++))
    fi
done < <(eval "find '$TARGET_DIR' -type f $FIND_EXCLUDES -exec grep -Hn 'BEGIN.*PRIVATE KEY' {} \; 2>/dev/null" || true)

echo -e "\n${YELLOW}[3/5] Checking for API keys and tokens...${NC}"
# Generic API key patterns
while IFS=: read -r file line content; do
    if [[ -n "$content" ]]; then
        # Skip if it's a placeholder
        if [[ ! "$content" =~ (YOUR_|PLACEHOLDER|EXAMPLE|xxx|XXX) ]]; then
            echo -e "${YELLOW}HIGH: Possible API key in $file:$line${NC}"
            add_finding "high" "API Key Pattern" "$file" "$line" "api_key or apikey assignment detected"
            ((HIGH_COUNT++))
        fi
    fi
done < <(eval "find '$TARGET_DIR' -type f $FIND_EXCLUDES -exec grep -HinE '(api[_-]?key|apikey)[[:space:]]*[:=][[:space:]]*[\"'"'"'][A-Za-z0-9_-]{20,}[\"'"'"']' {} \; 2>/dev/null" || true)

# JWT tokens
while IFS=: read -r file line content; do
    if [[ -n "$content" ]]; then
        echo -e "${YELLOW}HIGH: JWT token in $file:$line${NC}"
        add_finding "high" "JWT Token" "$file" "$line" "eyJ... pattern detected"
        ((HIGH_COUNT++))
    fi
done < <(eval "find '$TARGET_DIR' -type f $FIND_EXCLUDES -exec grep -Hn 'eyJ[A-Za-z0-9_-]*\.eyJ[A-Za-z0-9_-]*\.' {} \; 2>/dev/null" || true)

echo -e "\n${YELLOW}[4/5] Checking for connection strings...${NC}"
# Database connection strings with passwords
while IFS=: read -r file line content; do
    if [[ -n "$content" ]]; then
        # Skip example/placeholder patterns
        if [[ ! "$content" =~ (localhost|127\.0\.0\.1|example\.com|PLACEHOLDER|password123) ]]; then
            echo -e "${RED}CRITICAL: Connection string with credentials in $file:$line${NC}"
            add_finding "critical" "Connection String" "$file" "$line" "URL with embedded credentials"
            ((CRITICAL_COUNT++))
        fi
    fi
done < <(eval "find '$TARGET_DIR' -type f $FIND_EXCLUDES -exec grep -HnE '(mysql|postgres|mongodb|redis)://[^:]+:[^@]+@' {} \; 2>/dev/null" || true)

echo -e "\n${YELLOW}[5/5] Checking for hardcoded passwords...${NC}"
# Password assignments (excluding common false positives)
while IFS=: read -r file line content; do
    if [[ -n "$content" ]]; then
        # Skip if test file, mock, or placeholder
        if [[ ! "$file" =~ (test|spec|mock|fixture) ]] && [[ ! "$content" =~ (PASSWORD|placeholder|example|changeme) ]]; then
            echo -e "${YELLOW}MEDIUM: Possible hardcoded password in $file:$line${NC}"
            add_finding "medium" "Hardcoded Password" "$file" "$line" "password assignment detected"
            ((MEDIUM_COUNT++))
        fi
    fi
done < <(eval "find '$TARGET_DIR' -type f $FIND_EXCLUDES -exec grep -HinE 'password[[:space:]]*[:=][[:space:]]*[\"'"'"'][^\"'"'"']{8,}[\"'"'"']' {} \; 2>/dev/null" || true)

# Generate report
REPORT=$(jq -n \
    --arg target "$TARGET_DIR" \
    --arg date "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    --argjson critical "$CRITICAL_COUNT" \
    --argjson high "$HIGH_COUNT" \
    --argjson medium "$MEDIUM_COUNT" \
    --argjson findings "$FINDINGS" \
    '{
        scan_target: $target,
        scan_date: $date,
        summary: {
            critical: $critical,
            high: $high,
            medium: $medium,
            total: ($critical + $high + $medium)
        },
        findings: $findings
    }')

echo "$REPORT" > "$OUTPUT_FILE"

echo ""
echo "=================================="
echo -e "Scan Complete!"
echo -e "  Critical: ${RED}$CRITICAL_COUNT${NC}"
echo -e "  High:     ${YELLOW}$HIGH_COUNT${NC}"
echo -e "  Medium:   $MEDIUM_COUNT"
echo ""
echo "Report saved to: $OUTPUT_FILE"

# Exit with error if critical findings
if [ "$CRITICAL_COUNT" -gt 0 ]; then
    echo -e "\n${RED}CRITICAL vulnerabilities found! Review and remediate before deployment.${NC}"
    exit 1
fi

exit 0
