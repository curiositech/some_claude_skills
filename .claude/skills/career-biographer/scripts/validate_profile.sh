#!/bin/bash
# Validation script for Career Biographer outputs
# Checks that generated CareerProfile JSON contains required fields

set -e

if [ $# -eq 0 ]; then
    echo "Usage: $0 <career_profile.json>"
    exit 1
fi

PROFILE_FILE="$1"

if [ ! -f "$PROFILE_FILE" ]; then
    echo "Error: File '$PROFILE_FILE' not found"
    exit 1
fi

echo "Validating CareerProfile: $PROFILE_FILE"

# Check if file is valid JSON
if ! jq empty "$PROFILE_FILE" 2>/dev/null; then
    echo "❌ Invalid JSON format"
    exit 1
fi

# Required top-level fields
REQUIRED_FIELDS=("name" "headline" "summary" "timelineEvents" "skills" "projects" "aspirations" "brand")

for field in "${REQUIRED_FIELDS[@]}"; do
    if ! jq -e ".$field" "$PROFILE_FILE" > /dev/null 2>&1; then
        echo "❌ Missing required field: $field"
        exit 1
    fi
done

# Validate timelineEvents structure
EVENT_COUNT=$(jq '.timelineEvents | length' "$PROFILE_FILE")
if [ "$EVENT_COUNT" -eq 0 ]; then
    echo "⚠️  Warning: No timeline events found"
fi

# Validate skills have required fields
SKILL_COUNT=$(jq '.skills | length' "$PROFILE_FILE")
if [ "$SKILL_COUNT" -eq 0 ]; then
    echo "⚠️  Warning: No skills found"
else
    # Check first skill has required fields
    if ! jq -e '.skills[0] | .category, .name, .proficiency, .yearsOfExperience' "$PROFILE_FILE" > /dev/null 2>&1; then
        echo "❌ Skills missing required fields (category, name, proficiency, yearsOfExperience)"
        exit 1
    fi
fi

# Validate projects structure
PROJECT_COUNT=$(jq '.projects | length' "$PROFILE_FILE")
if [ "$PROJECT_COUNT" -eq 0 ]; then
    echo "⚠️  Warning: No projects found"
fi

echo "✅ CareerProfile validation passed"
echo "   - Events: $EVENT_COUNT"
echo "   - Skills: $SKILL_COUNT"
echo "   - Projects: $PROJECT_COUNT"
