#!/bin/bash
# Validation script for Design Archivist archive outputs
# Checks that generated archive contains required structure and minimum viable dataset

set -e

if [ $# -eq 0 ]; then
    echo "Usage: $0 <archive_output.json>"
    exit 1
fi

ARCHIVE_FILE="$1"

if [ ! -f "$ARCHIVE_FILE" ]; then
    echo "Error: File '$ARCHIVE_FILE' not found"
    exit 1
fi

echo "Validating Design Archive: $ARCHIVE_FILE"

# Check if file is valid JSON
if ! jq empty "$ARCHIVE_FILE" 2>/dev/null; then
    echo "❌ Invalid JSON format"
    exit 1
fi

# Required top-level fields
REQUIRED_FIELDS=("meta" "examples" "patterns" "insights" "recommendations")

for field in "${REQUIRED_FIELDS[@]}"; do
    if ! jq -e ".$field" "$ARCHIVE_FILE" > /dev/null 2>&1; then
        echo "❌ Missing required field: $field"
        exit 1
    fi
done

# Check meta information
if ! jq -e '.meta | .domain, .examplesAnalyzed, .dateRange' "$ARCHIVE_FILE" > /dev/null 2>&1; then
    echo "❌ meta field missing required fields (domain, examplesAnalyzed, dateRange)"
    exit 1
fi

# Validate example count
EXAMPLE_COUNT=$(jq '.examples | length' "$ARCHIVE_FILE")
MIN_EXAMPLES=50

if [ "$EXAMPLE_COUNT" -lt "$MIN_EXAMPLES" ]; then
    echo "⚠️  Warning: Only $EXAMPLE_COUNT examples (minimum recommended: $MIN_EXAMPLES)"
fi

# Check patterns structure
if ! jq -e '.patterns | .dominant, .emerging, .deprecated, .outliers' "$ARCHIVE_FILE" > /dev/null 2>&1; then
    echo "❌ patterns field missing required categories (dominant, emerging, deprecated, outliers)"
    exit 1
fi

DOMINANT_PATTERNS=$(jq '.patterns.dominant | length' "$ARCHIVE_FILE")
EMERGING_PATTERNS=$(jq '.patterns.emerging | length' "$ARCHIVE_FILE")

# Check insights
INSIGHT_CATEGORIES=("colorTrends" "typographyTrends" "layoutTrends" "interactionTrends" "technicalTrends")
for category in "${INSIGHT_CATEGORIES[@]}"; do
    if ! jq -e ".insights.$category" "$ARCHIVE_FILE" > /dev/null 2>&1; then
        echo "❌ Missing insight category: $category"
        exit 1
    fi
done

# Check recommendations
if ! jq -e '.recommendations | .safeChoices, .differentiators, .avoid' "$ARCHIVE_FILE" > /dev/null 2>&1; then
    echo "❌ recommendations field missing required arrays (safeChoices, differentiators, avoid)"
    exit 1
fi

echo "✅ Design Archive validation passed"
echo "   - Examples analyzed: $EXAMPLE_COUNT"
echo "   - Dominant patterns: $DOMINANT_PATTERNS"
echo "   - Emerging patterns: $EMERGING_PATTERNS"
echo "   - Domain: $(jq -r '.meta.domain' "$ARCHIVE_FILE")"
