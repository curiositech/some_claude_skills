#!/bin/bash
# Validation script for Competitive Cartographer outputs
# Checks that competitive map contains proper structure and actionable strategy

set -e

if [ $# -eq 0 ]; then
    echo "Usage: $0 <competitive_map.json>"
    exit 1
fi

MAP_FILE="$1"

if [ ! -f "$MAP_FILE" ]; then
    echo "Error: File '$MAP_FILE' not found"
    exit 1
fi

echo "Validating Competitive Map: $MAP_FILE"

# Check if file is valid JSON
if ! jq empty "$MAP_FILE" 2>/dev/null; then
    echo "❌ Invalid JSON format"
    exit 1
fi

# Required top-level fields
REQUIRED_FIELDS=("axes" "players" "clusters" "whiteSpace")

for field in "${REQUIRED_FIELDS[@]}"; do
    if ! jq -e ".$field" "$MAP_FILE" > /dev/null 2>&1; then
        echo "❌ Missing required field: $field"
        exit 1
    fi
done

# Validate axes structure
if ! jq -e '.axes | .x, .y' "$MAP_FILE" > /dev/null 2>&1; then
    echo "❌ axes field missing x or y axis"
    exit 1
fi

if ! jq -e '.axes.x | .name, .low, .high' "$MAP_FILE" > /dev/null 2>&1; then
    echo "❌ x axis missing required fields (name, low, high)"
    exit 1
fi

# Validate players
PLAYER_COUNT=$(jq '.players | length' "$MAP_FILE")
if [ "$PLAYER_COUNT" -lt 3 ]; then
    echo "⚠️  Warning: Only $PLAYER_COUNT players mapped (minimum recommended: 3)"
fi

# Check first player has required fields
if [ "$PLAYER_COUNT" -gt 0 ]; then
    if ! jq -e '.players[0] | .name, .position' "$MAP_FILE" > /dev/null 2>&1; then
        echo "❌ Players missing required fields (name, position)"
        exit 1
    fi

    if ! jq -e '.players[0].position | .x, .y' "$MAP_FILE" > /dev/null 2>&1; then
        echo "❌ Player position missing x or y coordinate"
        exit 1
    fi
fi

# Validate clusters
CLUSTER_COUNT=$(jq '.clusters | length' "$MAP_FILE")
if [ "$CLUSTER_COUNT" -eq 0 ]; then
    echo "⚠️  Warning: No clusters identified"
fi

# Validate white space opportunities
WHITESPACE_COUNT=$(jq '.whiteSpace | length' "$MAP_FILE")
if [ "$WHITESPACE_COUNT" -eq 0 ]; then
    echo "❌ No white space opportunities identified - competitive map must identify positioning opportunities"
    exit 1
fi

# Check white space has proper structure
if ! jq -e '.whiteSpace[0] | .position, .description, .why' "$MAP_FILE" > /dev/null 2>&1; then
    echo "❌ White space missing required fields (position, description, why)"
    exit 1
fi

echo "✅ Competitive Map validation passed"
echo "   - Players mapped: $PLAYER_COUNT"
echo "   - Clusters identified: $CLUSTER_COUNT"
echo "   - White space opportunities: $WHITESPACE_COUNT"
echo "   - X-axis: $(jq -r '.axes.x.name' "$MAP_FILE")"
echo "   - Y-axis: $(jq -r '.axes.y.name' "$MAP_FILE")"
