#!/bin/bash
# Full Security Audit Script
# Runs all security checks and generates a unified report

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_DIR="${1:-.}"
OUTPUT_DIR="${2:-./security-reports}"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

# Colors
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           FULL SECURITY AUDIT                              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "Target: $TARGET_DIR"
echo "Output: $OUTPUT_DIR"
echo "Time:   $(date)"
echo ""

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Track overall status
OVERALL_STATUS="pass"
CRITICAL_TOTAL=0
HIGH_TOTAL=0

# ─────────────────────────────────────────────────────────────────────────────
echo -e "\n${BLUE}[1/4] Dependency Vulnerability Scan${NC}"
echo "────────────────────────────────────"

DEP_REPORT="$OUTPUT_DIR/dependencies-$TIMESTAMP.json"

# Check for package managers and run appropriate audits
if [ -f "$TARGET_DIR/package.json" ]; then
    echo "  Found package.json - running npm audit..."
    if npm audit --json --prefix "$TARGET_DIR" > "$DEP_REPORT" 2>/dev/null; then
        echo -e "  ${GREEN}✓ No vulnerabilities found${NC}"
    else
        # Parse npm audit output
        VULN_CRITICAL=$(jq -r '.metadata.vulnerabilities.critical // 0' "$DEP_REPORT" 2>/dev/null || echo "0")
        VULN_HIGH=$(jq -r '.metadata.vulnerabilities.high // 0' "$DEP_REPORT" 2>/dev/null || echo "0")
        echo -e "  ${RED}Critical: $VULN_CRITICAL${NC}"
        echo -e "  ${YELLOW}High: $VULN_HIGH${NC}"
        CRITICAL_TOTAL=$((CRITICAL_TOTAL + VULN_CRITICAL))
        HIGH_TOTAL=$((HIGH_TOTAL + VULN_HIGH))
        if [ "$VULN_CRITICAL" -gt 0 ]; then
            OVERALL_STATUS="fail"
        fi
    fi
fi

if [ -f "$TARGET_DIR/requirements.txt" ] || [ -f "$TARGET_DIR/pyproject.toml" ]; then
    echo "  Found Python project - checking for pip-audit..."
    if command -v pip-audit &> /dev/null; then
        PY_REPORT="$OUTPUT_DIR/pip-audit-$TIMESTAMP.json"
        if pip-audit --format json --output "$PY_REPORT" -r "$TARGET_DIR/requirements.txt" 2>/dev/null; then
            echo -e "  ${GREEN}✓ No Python vulnerabilities found${NC}"
        else
            echo -e "  ${YELLOW}Python vulnerabilities found - see $PY_REPORT${NC}"
        fi
    else
        echo -e "  ${YELLOW}pip-audit not installed. Run: pip install pip-audit${NC}"
    fi
fi

# ─────────────────────────────────────────────────────────────────────────────
echo -e "\n${BLUE}[2/4] Secret Detection Scan${NC}"
echo "────────────────────────────────────"

SECRET_REPORT="$OUTPUT_DIR/secrets-$TIMESTAMP.json"

if [ -f "$SCRIPT_DIR/detect-secrets.sh" ]; then
    if bash "$SCRIPT_DIR/detect-secrets.sh" "$TARGET_DIR" "$SECRET_REPORT"; then
        echo -e "  ${GREEN}✓ No secrets detected${NC}"
    else
        SECRET_CRITICAL=$(jq -r '.summary.critical // 0' "$SECRET_REPORT" 2>/dev/null || echo "0")
        SECRET_HIGH=$(jq -r '.summary.high // 0' "$SECRET_REPORT" 2>/dev/null || echo "0")
        CRITICAL_TOTAL=$((CRITICAL_TOTAL + SECRET_CRITICAL))
        HIGH_TOTAL=$((HIGH_TOTAL + SECRET_HIGH))
        if [ "$SECRET_CRITICAL" -gt 0 ]; then
            OVERALL_STATUS="fail"
        fi
    fi
else
    echo -e "  ${YELLOW}detect-secrets.sh not found${NC}"
fi

# ─────────────────────────────────────────────────────────────────────────────
echo -e "\n${BLUE}[3/4] OWASP Static Analysis${NC}"
echo "────────────────────────────────────"

OWASP_REPORT="$OUTPUT_DIR/owasp-$TIMESTAMP.json"

if [ -f "$SCRIPT_DIR/owasp-check.py" ]; then
    if python3 "$SCRIPT_DIR/owasp-check.py" "$TARGET_DIR" --json --output "$OWASP_REPORT"; then
        echo -e "  ${GREEN}✓ No OWASP violations found${NC}"
    else
        OWASP_CRITICAL=$(jq -r '.summary.critical // 0' "$OWASP_REPORT" 2>/dev/null || echo "0")
        OWASP_HIGH=$(jq -r '.summary.high // 0' "$OWASP_REPORT" 2>/dev/null || echo "0")
        echo -e "  ${RED}Critical: $OWASP_CRITICAL${NC}"
        echo -e "  ${YELLOW}High: $OWASP_HIGH${NC}"
        CRITICAL_TOTAL=$((CRITICAL_TOTAL + OWASP_CRITICAL))
        HIGH_TOTAL=$((HIGH_TOTAL + OWASP_HIGH))
        if [ "$OWASP_CRITICAL" -gt 0 ]; then
            OVERALL_STATUS="fail"
        fi
    fi
else
    echo -e "  ${YELLOW}owasp-check.py not found${NC}"
fi

# ─────────────────────────────────────────────────────────────────────────────
echo -e "\n${BLUE}[4/4] Configuration Security Check${NC}"
echo "────────────────────────────────────"

CONFIG_ISSUES=0

# Check for .env files in git
if [ -d "$TARGET_DIR/.git" ]; then
    if git -C "$TARGET_DIR" ls-files --error-unmatch .env 2>/dev/null; then
        echo -e "  ${RED}✗ .env file is tracked in git!${NC}"
        CONFIG_ISSUES=$((CONFIG_ISSUES + 1))
        OVERALL_STATUS="fail"
    else
        echo -e "  ${GREEN}✓ .env not in git${NC}"
    fi
fi

# Check .gitignore for common security files
if [ -f "$TARGET_DIR/.gitignore" ]; then
    MISSING_IGNORES=""
    for pattern in ".env" "*.pem" "*.key" "credentials.json" "*.p12"; do
        if ! grep -q "^$pattern" "$TARGET_DIR/.gitignore" 2>/dev/null; then
            MISSING_IGNORES="$MISSING_IGNORES $pattern"
        fi
    done
    if [ -n "$MISSING_IGNORES" ]; then
        echo -e "  ${YELLOW}Consider adding to .gitignore:$MISSING_IGNORES${NC}"
    else
        echo -e "  ${GREEN}✓ Sensitive patterns in .gitignore${NC}"
    fi
fi

# Check for debug flags in common config files
for config in "$TARGET_DIR/package.json" "$TARGET_DIR/tsconfig.json"; do
    if [ -f "$config" ]; then
        if grep -q '"debug"\s*:\s*true' "$config" 2>/dev/null; then
            echo -e "  ${YELLOW}Debug flag found in $(basename "$config")${NC}"
        fi
    fi
done

# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    AUDIT SUMMARY                           ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  Critical Issues: ${RED}$CRITICAL_TOTAL${NC}"
echo -e "  High Issues:     ${YELLOW}$HIGH_TOTAL${NC}"
echo ""

# Generate unified report
UNIFIED_REPORT="$OUTPUT_DIR/security-report-$TIMESTAMP.json"

jq -n \
    --arg target "$TARGET_DIR" \
    --arg date "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    --arg status "$OVERALL_STATUS" \
    --argjson critical "$CRITICAL_TOTAL" \
    --argjson high "$HIGH_TOTAL" \
    '{
        audit_target: $target,
        audit_date: $date,
        overall_status: $status,
        summary: {
            critical: $critical,
            high: $high
        },
        reports: {
            dependencies: "dependencies-'$TIMESTAMP'.json",
            secrets: "secrets-'$TIMESTAMP'.json",
            owasp: "owasp-'$TIMESTAMP'.json"
        }
    }' > "$UNIFIED_REPORT"

echo "Reports saved to: $OUTPUT_DIR/"
echo "  - security-report-$TIMESTAMP.json (unified)"
echo "  - dependencies-$TIMESTAMP.json"
echo "  - secrets-$TIMESTAMP.json"
echo "  - owasp-$TIMESTAMP.json"
echo ""

if [ "$OVERALL_STATUS" = "fail" ]; then
    echo -e "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║  AUDIT FAILED - Critical vulnerabilities require action    ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}"
    exit 1
else
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  AUDIT PASSED - No critical issues found                   ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
    exit 0
fi
