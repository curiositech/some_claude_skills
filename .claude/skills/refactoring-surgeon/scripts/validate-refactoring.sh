#!/bin/bash
# Refactoring Surgeon Skill Validation Script
# Validates code for refactoring readiness and quality

set -e

ERRORS=0
WARNINGS=0

echo "═══════════════════════════════════════════════════════════════"
echo "Refactoring Surgeon Validator"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Check for test coverage before refactoring
check_test_coverage() {
    echo "🧪 Checking test coverage..."

    # Look for test files
    test_count=0
    for pattern in "*.test.ts" "*.test.js" "*.spec.ts" "*.spec.js" "__tests__/*.ts" "__tests__/*.js"; do
        count=$(find . -name "$pattern" 2>/dev/null | wc -l)
        test_count=$((test_count + count))
    done

    if [ "$test_count" -eq 0 ]; then
        echo "❌ ERROR: No test files found - refactoring without tests is risky!"
        ((ERRORS++))
    else
        echo "  Found $test_count test files"
    fi

    # Check for test runner config
    if [ -f "jest.config.js" ] || [ -f "jest.config.ts" ] || [ -f "vitest.config.ts" ]; then
        echo "  ✅ Test runner configured"
    elif grep -q '"test"' package.json 2>/dev/null; then
        echo "  ✅ Test script found in package.json"
    else
        echo "⚠️  WARN: No test runner configuration found"
        ((WARNINGS++))
    fi
}

# Check for code smells
check_code_smells() {
    echo ""
    echo "👃 Checking for code smells..."

    # Long files (potential god classes)
    echo "  Checking for long files..."
    long_files=$(find . -name "*.ts" -o -name "*.js" 2>/dev/null | while read -r file; do
        lines=$(wc -l < "$file" 2>/dev/null || echo 0)
        if [ "$lines" -gt 300 ]; then
            echo "$file ($lines lines)"
        fi
    done)

    if [ -n "$long_files" ]; then
        echo "⚠️  WARN: Files over 300 lines (potential god classes):"
        echo "$long_files" | sed 's/^/    /'
        ((WARNINGS++))
    fi

    # Long functions (check for function declarations with many lines)
    echo "  Checking for long functions..."
    # This is a simple heuristic - real analysis would need AST parsing

    # Check for switch statements (potential polymorphism candidates)
    switch_count=$(grep -r "switch\s*(" --include="*.ts" --include="*.js" . 2>/dev/null | wc -l)
    if [ "$switch_count" -gt 5 ]; then
        echo "⚠️  WARN: Found $switch_count switch statements - consider Replace Conditional with Polymorphism"
        ((WARNINGS++))
    fi

    # Check for long parameter lists
    long_params=$(grep -rE "function\s+\w+\s*\([^)]{100,}\)" --include="*.ts" --include="*.js" . 2>/dev/null | wc -l)
    if [ "$long_params" -gt 0 ]; then
        echo "⚠️  WARN: Found $long_params functions with long parameter lists - consider Introduce Parameter Object"
        ((WARNINGS++))
    fi
}

# Check for duplication
check_duplication() {
    echo ""
    echo "📋 Checking for code duplication..."

    # Simple check for identical consecutive lines (very basic)
    dup_count=0
    for file in $(find . -name "*.ts" -o -name "*.js" 2>/dev/null | head -20); do
        # Check for blocks that repeat
        if [ -f "$file" ]; then
            repeats=$(sort "$file" | uniq -d | wc -l)
            if [ "$repeats" -gt 10 ]; then
                ((dup_count++))
            fi
        fi
    done

    if [ "$dup_count" -gt 0 ]; then
        echo "⚠️  WARN: $dup_count files may have duplicated code"
        ((WARNINGS++))
    else
        echo "  No obvious duplication detected"
    fi

    # Check for copy-paste comments
    if grep -rE "(copy|paste|duplicate|TODO.*refactor)" --include="*.ts" --include="*.js" . 2>/dev/null | grep -v node_modules | head -5 | grep -q .; then
        echo "⚠️  WARN: Found comments mentioning copy/paste or refactoring TODOs"
        ((WARNINGS++))
    fi
}

# Check for complexity indicators
check_complexity() {
    echo ""
    echo "🔄 Checking complexity indicators..."

    # Nested callbacks (callback hell)
    nested=$(grep -rE "\)\s*=>\s*\{" --include="*.ts" --include="*.js" . 2>/dev/null | wc -l)
    if [ "$nested" -gt 50 ]; then
        echo "⚠️  WARN: High arrow function usage ($nested) - check for callback nesting"
        ((WARNINGS++))
    fi

    # Deep nesting (multiple levels of indentation)
    deep_nesting=$(grep -rE "^\s{16,}" --include="*.ts" --include="*.js" . 2>/dev/null | wc -l)
    if [ "$deep_nesting" -gt 20 ]; then
        echo "⚠️  WARN: Found $deep_nesting deeply nested lines (4+ levels) - consider Extract Method"
        ((WARNINGS++))
    fi

    # Multiple return statements
    multi_return=$(grep -rE "return\s" --include="*.ts" --include="*.js" . 2>/dev/null | wc -l)
    echo "  Found $multi_return return statements across codebase"
}

# Check SOLID principles violations
check_solid_violations() {
    echo ""
    echo "📐 Checking for SOLID violations..."

    # Single Responsibility: files doing too many things
    # Check for files with many different imports (heuristic)

    # Open/Closed: check for type checking
    type_checks=$(grep -rE "typeof|instanceof" --include="*.ts" --include="*.js" . 2>/dev/null | wc -l)
    if [ "$type_checks" -gt 20 ]; then
        echo "⚠️  WARN: $type_checks type checks found - may violate Open/Closed Principle"
        ((WARNINGS++))
    fi

    # Dependency Inversion: check for direct instantiation
    new_calls=$(grep -rE "new\s+[A-Z]" --include="*.ts" --include="*.js" . 2>/dev/null | grep -v "Error\|Date\|Map\|Set\|Promise\|Array" | wc -l)
    if [ "$new_calls" -gt 30 ]; then
        echo "⚠️  WARN: $new_calls direct instantiations - consider dependency injection"
        ((WARNINGS++))
    fi
}

# Check refactoring safety
check_refactoring_safety() {
    echo ""
    echo "🔒 Checking refactoring safety..."

    # Check for version control
    if [ -d ".git" ]; then
        echo "  ✅ Git repository found"

        # Check for uncommitted changes
        if git diff --quiet 2>/dev/null && git diff --staged --quiet 2>/dev/null; then
            echo "  ✅ No uncommitted changes"
        else
            echo "⚠️  WARN: Uncommitted changes - commit before refactoring!"
            ((WARNINGS++))
        fi
    else
        echo "❌ ERROR: No git repository - can't safely refactor without version control"
        ((ERRORS++))
    fi

    # Check for CI/CD
    if [ -f ".github/workflows/ci.yml" ] || [ -f ".github/workflows/test.yml" ] || [ -f ".gitlab-ci.yml" ]; then
        echo "  ✅ CI/CD configuration found"
    else
        echo "⚠️  WARN: No CI/CD found - tests may not run automatically"
        ((WARNINGS++))
    fi
}

# Check for magic numbers and strings
check_magic_values() {
    echo ""
    echo "🔢 Checking for magic numbers and strings..."

    # Magic numbers (excluding common ones like 0, 1, 2)
    magic_nums=$(grep -rE "[^0-9][3-9][0-9]{2,}[^0-9]" --include="*.ts" --include="*.js" . 2>/dev/null | grep -v "node_modules\|\.d\.ts" | wc -l)
    if [ "$magic_nums" -gt 10 ]; then
        echo "⚠️  WARN: Found $magic_nums potential magic numbers - consider named constants"
        ((WARNINGS++))
    fi
}

# Run all checks
check_test_coverage
check_code_smells
check_duplication
check_complexity
check_solid_violations
check_refactoring_safety
check_magic_values

# Summary
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "Validation Complete"
echo "═══════════════════════════════════════════════════════════════"
echo "Errors:   $ERRORS"
echo "Warnings: $WARNINGS"
echo ""

if [ $ERRORS -gt 0 ]; then
    echo "❌ Validation FAILED - address errors before refactoring"
    exit 1
elif [ $WARNINGS -gt 5 ]; then
    echo "⚠️  Validation PASSED with warnings - many refactoring opportunities!"
    exit 0
else
    echo "✅ Validation PASSED - code is in good shape"
    exit 0
fi
