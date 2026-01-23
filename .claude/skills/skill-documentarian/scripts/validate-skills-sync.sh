#!/bin/bash
# Validates that .claude/skills/ and website/docs/skills/ are in sync

set -e

echo "🔍 Skill-Documentarian: Validating skill-website sync..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0

# Check 1: Skills without docs
echo "📁 Checking for skills without documentation pages..."
for skill_dir in .claude/skills/*/; do
  skill_name=$(basename "$skill_dir")
  # Convert hyphens to underscores for website filenames
  doc_name=$(echo "$skill_name" | tr '-' '_')
  doc_file="website/docs/skills/${doc_name}.md"

  if [ ! -f "$doc_file" ]; then
    echo -e "${RED}❌ Missing doc:${NC} $skill_name has no $doc_file"
    ERRORS=$((ERRORS + 1))
  fi
done

# Check 2: Docs without skills
echo ""
echo "📄 Checking for documentation pages without skills..."
for doc_file in website/docs/skills/*.md; do
  doc_name=$(basename "$doc_file" .md)
  # Convert underscores to hyphens for skill folder names
  skill_name=$(echo "$doc_name" | tr '_' '-')
  skill_dir=".claude/skills/${skill_name}"

  if [ ! -d "$skill_dir" ]; then
    echo -e "${YELLOW}⚠️  Orphaned doc:${NC} $doc_name has no skill folder"
    # Not an error, might be intentional
  fi
done

# Check 3: Hero images
echo ""
echo "🎨 Checking for missing hero images..."
for skill_dir in .claude/skills/*/; do
  skill_name=$(basename "$skill_dir")
  hero_image="website/static/img/skills/${skill_name}-hero.png"

  if [ ! -f "$hero_image" ]; then
    echo -e "${YELLOW}⚠️  Missing hero:${NC} $skill_name has no $hero_image"
    # Not a critical error, but should be generated
  fi
done

# Check 4: Sidebar entries
echo ""
echo "📚 Checking sidebar entries..."
if ! grep -q "skill_documentarian" website/sidebars.ts; then
  echo -e "${YELLOW}⚠️  skill_documentarian not in sidebar${NC}"
fi
if ! grep -q "swift_executor" website/sidebars.ts; then
  echo -e "${YELLOW}⚠️  swift_executor not in sidebar${NC}"
fi

echo ""
if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}✅ All critical checks passed!${NC}"
  exit 0
else
  echo -e "${RED}❌ Found $ERRORS critical errors${NC}"
  exit 1
fi
