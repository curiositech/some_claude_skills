#!/bin/bash

# Script to add hero images to skill markdown files

cd "$(dirname "$0")/website/docs/skills"

# Define skill file mappings (filename without .md => hero image name)
declare -A skills=(
  ["adhd_design_expert"]="adhd-design-expert"
  ["agent_creator"]="agent-creator"
  ["collage_layout_expert"]="collage-layout-expert"
  ["color_theory_palette_harmony_expert"]="color-theory-palette-harmony-expert"
  ["design_system_creator"]="design-system-creator"
  ["drone_cv_expert"]="drone-cv-expert"
  ["drone_inspection_specialist"]="drone-inspection-specialist"
  ["event_detection_temporal_intelligence_expert"]="event-detection-temporal-intelligence-expert"
  ["hrv_alexithymia_expert"]="hrv-alexithymia-expert"
  ["intimacy_avatar_engineer"]="intimacy-avatar-engineer"
  ["metal_shader_expert"]="metal-shader-expert"
  ["native_app_designer"]="native-app-designer"
  ["orchestrator"]="orchestrator"
  ["photo_content_recognition_curation_expert"]="photo-content-recognition-curation-expert"
  ["physics_rendering_expert"]="physics-rendering-expert"
  ["project_management_guru_adhd"]="project-management-guru-adhd"
  ["research_analyst"]="research-analyst"
  ["sound_engineer"]="sound-engineer"
  ["speech_pathology_ai"]="speech-pathology-ai"
  ["team_builder"]="team-builder"
  ["tech_entrepreneur_coach_adhd"]="tech-entrepreneur-coach-adhd"
  ["typography_expert"]="typography-expert"
  ["vaporwave_glassomorphic_ui_designer"]="vaporwave-glassomorphic-ui-designer"
  ["web_design_expert"]="web-design-expert"
  ["wisdom_accountability_coach"]="wisdom-accountability-coach"
)

for skill_file in "${!skills[@]}"; do
  hero_name="${skills[$skill_file]}"
  file="${skill_file}.md"

  if [ -f "$file" ]; then
    echo "Processing $file..."

    # Check if hero image already exists
    if grep -q "!\[.*Hero\](/img/skills/${hero_name}-hero.png)" "$file"; then
      echo "  Hero image already exists, skipping..."
      continue
    fi

    # Create temp file
    temp_file=$(mktemp)

    # Find where to insert the hero image (after SkillHeader or after first # heading)
    awk -v hero="![Hero Banner](/img/skills/${hero_name}-hero.png)" '
      /^<SkillHeader/ { in_header=1 }
      in_header && /^\/>/ {
        print
        print ""
        print hero
        print ""
        in_header=0
        next
      }
      { print }
    ' "$file" > "$temp_file"

    # Replace original file
    mv "$temp_file" "$file"
    echo "  ✓ Added hero image"
  else
    echo "Warning: $file not found"
  fi
done

echo "Done! Added hero images to all skill files."
