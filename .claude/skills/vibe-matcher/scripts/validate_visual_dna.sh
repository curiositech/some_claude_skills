#!/bin/bash
# Validation script for Vibe Matcher outputs
# Checks that generated VisualDNA contains all required elements and rationale

set -e

if [ $# -eq 0 ]; then
    echo "Usage: $0 <visual_dna.json>"
    exit 1
fi

DNA_FILE="$1"

if [ ! -f "$DNA_FILE" ]; then
    echo "Error: File '$DNA_FILE' not found"
    exit 1
fi

echo "Validating VisualDNA: $DNA_FILE"

# Check if file is valid JSON
if ! jq empty "$DNA_FILE" 2>/dev/null; then
    echo "❌ Invalid JSON format"
    exit 1
fi

# Required top-level fields
REQUIRED_FIELDS=("colors" "typography" "layout" "interactions" "moodBoard")

for field in "${REQUIRED_FIELDS[@]}"; do
    if ! jq -e ".$field" "$DNA_FILE" > /dev/null 2>&1; then
        echo "❌ Missing required field: $field"
        exit 1
    fi
done

# Validate colors structure with rationale
if ! jq -e '.colors | .primary, .secondary, .accent, .neutrals, .rationale' "$DNA_FILE" > /dev/null 2>&1; then
    echo "❌ colors field missing required fields or rationale"
    exit 1
fi

# Check hex color format for primary
PRIMARY_COLOR=$(jq -r '.colors.primary' "$DNA_FILE")
if ! echo "$PRIMARY_COLOR" | grep -qE '^#[0-9A-Fa-f]{6}$'; then
    echo "❌ Invalid hex color format for primary: $PRIMARY_COLOR"
    exit 1
fi

# Validate typography structure with rationale
if ! jq -e '.typography | .headings, .body, .rationale' "$DNA_FILE" > /dev/null 2>&1; then
    echo "❌ typography field missing required fields or rationale"
    exit 1
fi

if ! jq -e '.typography.headings | .family, .weight, .characteristics' "$DNA_FILE" > /dev/null 2>&1; then
    echo "❌ typography.headings missing required fields"
    exit 1
fi

# Validate layout structure with rationale
if ! jq -e '.layout | .system, .spacing, .hierarchy, .rationale' "$DNA_FILE" > /dev/null 2>&1; then
    echo "❌ layout field missing required fields or rationale"
    exit 1
fi

# Validate interactions structure with rationale
if ! jq -e '.interactions | .speed, .patterns, .rationale' "$DNA_FILE" > /dev/null 2>&1; then
    echo "❌ interactions field missing required fields or rationale"
    exit 1
fi

# Validate moodBoard has references
REFERENCE_COUNT=$(jq '.moodBoard.references | length' "$DNA_FILE" 2>/dev/null || echo "0")
if [ "$REFERENCE_COUNT" -eq 0 ]; then
    echo "⚠️  Warning: No mood board references provided"
fi

# Check all rationales are non-empty
RATIONALES=$(jq -r '.colors.rationale, .typography.rationale, .layout.rationale, .interactions.rationale' "$DNA_FILE")
if echo "$RATIONALES" | grep -q "^$"; then
    echo "❌ One or more rationales are empty - all design choices must be explained"
    exit 1
fi

echo "✅ VisualDNA validation passed"
echo "   - Primary color: $PRIMARY_COLOR"
echo "   - Heading font: $(jq -r '.typography.headings.family' "$DNA_FILE")"
echo "   - Layout system: $(jq -r '.layout.system' "$DNA_FILE")"
echo "   - Mood board references: $REFERENCE_COUNT"
