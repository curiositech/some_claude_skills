#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# CONVERT ALL PNGs TO WEBP + REMOVE ICON BACKGROUNDS
# Requirements: ImageMagick (convert) or cwebp
# ═══════════════════════════════════════════════════════════════════════════

set -e

cd "$(dirname "$0")/.."

echo "═══════════════════════════════════════════════════════════════"
echo "WEBP CONVERSION + ICON BACKGROUND REMOVAL"
echo "═══════════════════════════════════════════════════════════════"

# Check for ImageMagick
if ! command -v convert &> /dev/null; then
    echo "Installing ImageMagick..."
    sudo apt-get update && sudo apt-get install -y imagemagick
fi

# Count files
ICON_COUNT=$(ls -1 public/img/skill-icons/*.png 2>/dev/null | wc -l)
HERO_COUNT=$(ls -1 public/img/skill-heroes/*.png 2>/dev/null | wc -l)

echo "Found $ICON_COUNT icons, $HERO_COUNT heroes"
echo ""

# Process icons - remove background and convert to WebP
echo "Processing icons (removing backgrounds)..."
mkdir -p public/img/skill-icons-webp

for file in public/img/skill-icons/*.png; do
    if [ -f "$file" ]; then
        filename=$(basename "$file" .png)
        output="public/img/skill-icons-webp/${filename}.webp"
        
        if [ ! -f "$output" ]; then
            echo "  Processing: $filename"
            # Remove white/near-white background, make transparent, then convert to webp
            convert "$file" \
                -fuzz 15% \
                -transparent white \
                -trim +repage \
                -resize 64x64 \
                -quality 90 \
                "$output" 2>/dev/null || \
            # Fallback: just convert without background removal
            convert "$file" \
                -resize 64x64 \
                -quality 90 \
                "$output"
        fi
    fi
done

# Process heroes - just convert to WebP (keep quality)
echo ""
echo "Processing heroes (converting to WebP)..."
mkdir -p public/img/skill-heroes-webp

for file in public/img/skill-heroes/*.png; do
    if [ -f "$file" ]; then
        filename=$(basename "$file" .png)
        output="public/img/skill-heroes-webp/${filename}.webp"
        
        if [ ! -f "$output" ]; then
            echo "  Processing: $filename"
            convert "$file" \
                -quality 85 \
                -define webp:lossless=false \
                "$output"
        fi
    fi
done

# Count results
WEBP_ICONS=$(ls -1 public/img/skill-icons-webp/*.webp 2>/dev/null | wc -l)
WEBP_HEROES=$(ls -1 public/img/skill-heroes-webp/*.webp 2>/dev/null | wc -l)

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "COMPLETE"
echo "═══════════════════════════════════════════════════════════════"
echo "WebP icons:  $WEBP_ICONS"
echo "WebP heroes: $WEBP_HEROES"

# Show size comparison
PNG_SIZE=$(du -sh public/img/skill-icons public/img/skill-heroes 2>/dev/null | awk '{sum+=$1}END{print sum"M"}' || echo "N/A")
WEBP_SIZE=$(du -sh public/img/skill-icons-webp public/img/skill-heroes-webp 2>/dev/null | awk '{sum+=$1}END{print sum"M"}' || echo "N/A")

echo ""
echo "Size comparison:"
du -sh public/img/skill-icons/ public/img/skill-heroes/ 2>/dev/null || true
du -sh public/img/skill-icons-webp/ public/img/skill-heroes-webp/ 2>/dev/null || true
