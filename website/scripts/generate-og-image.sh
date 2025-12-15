#!/bin/bash
# OG Image Generator - Generates social media preview image with dynamic skill count
# Uses: Ideogram background + ImageMagick text overlay with Press Start 2P font
# Maintained by: skill-documentarian
# Called by: pre-commit hook when skills change

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
# Use system-installed Press Start 2P font (registered name from `magick -list font`)
FONT_NAME="Press-Start-2P-Regular"
BG_IMAGE="$PROJECT_ROOT/static/img/og-background_2025-12-13T08-13-03-736Z.png"
OUTPUT_IMAGE="$PROJECT_ROOT/static/img/og-image.png"
METADATA_FILE="$PROJECT_ROOT/src/data/skillMetadata.json"

# Get skill count from metadata
get_skill_count() {
    if [ -f "$METADATA_FILE" ]; then
        # Count skills in the JSON file
        node -e "
            const data = require('$METADATA_FILE');
            console.log(Object.keys(data.skills).length);
        " 2>/dev/null || echo "60"
    else
        # Fallback: count skill directories
        ls -d "$PROJECT_ROOT/../.claude/skills/"*/ 2>/dev/null | wc -l | tr -d ' '
    fi
}

# Check dependencies
check_deps() {
    if ! command -v magick &> /dev/null; then
        echo "❌ ImageMagick not found. Install with: brew install imagemagick"
        exit 1
    fi

    # Check if Press Start 2P font is available to ImageMagick
    if ! magick -list font 2>/dev/null | grep -q "$FONT_NAME"; then
        echo "❌ Press Start 2P font not found in ImageMagick fonts"
        echo "   Install from: https://fonts.google.com/specimen/Press+Start+2P"
        echo "   Or download to ~/Library/Fonts/"
        exit 1
    fi

    if [ ! -f "$BG_IMAGE" ]; then
        echo "❌ Background image not found at $BG_IMAGE"
        echo "   Generate with Ideogram first"
        exit 1
    fi
}

# Generate the OG image
generate_og_image() {
    local skill_count=$(get_skill_count)

    echo "🖼️  Generating OG image with $skill_count skills..."

    # OG image dimensions: 1200x630 (Twitter/Facebook optimal)
    local width=1200
    local height=630
    local bottom_bar_height=50
    local skills_sticker_size=140

    # Create the composite image using ImageMagick
    # Layout: Title sticker (left), skills sticker (right), bottom bar (categories)
    magick "$BG_IMAGE" \
        -resize "${width}x${height}^" \
        -gravity center \
        -extent "${width}x${height}" \
        \
        \( -size "${width}x${bottom_bar_height}" xc:'rgba(20,20,40,0.92)' \) \
        -gravity south -composite \
        \
        \( -size "520x120" xc:'rgba(20,20,40,0.92)' \
           -fill '#FFFFFF' \
           -font "$FONT_NAME" \
           -pointsize 28 \
           -gravity center \
           -annotate +0-18 "Some Claude Skills" \
           -fill '#B0B0C0' \
           -pointsize 11 \
           -annotate +0+25 "Production-Ready AI Skills" \
           -annotate +0+45 "for Claude Code" \
           \( +clone -background black -shadow 60x8+4+4 \) +swap \
           -background none -layers merge +repage \
        \) \
        -gravity northwest -geometry +25+25 -composite \
        \
        \( -size "${skills_sticker_size}x${skills_sticker_size}" xc:'#FFD700' \
           -fill '#1a1a2e' \
           -font "$FONT_NAME" \
           -pointsize 32 \
           -gravity center \
           -annotate +0-12 "${skill_count}+" \
           -pointsize 14 \
           -annotate +0+22 "SKILLS" \
           \( +clone -background black -shadow 60x8+4+4 \) +swap \
           -background none -layers merge +repage \
        \) \
        -gravity east -geometry +30+0 -composite \
        \
        -gravity south \
        -fill '#FFFFFF' \
        -font "$FONT_NAME" \
        -pointsize 12 \
        -annotate +0+18 "ML • Computer Vision • Audio • Psychology • Dev Tools" \
        \
        "$OUTPUT_IMAGE"

    echo "✅ Generated: $OUTPUT_IMAGE"
    echo "   Skill count: $skill_count"
}

# Main
main() {
    check_deps
    generate_og_image
}

main "$@"
