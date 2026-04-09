#!/bin/bash

# Skill Conversion Script
# Converts GitHub Copilot agent format to Claude Skills format

set -e

echo "🔄 Converting Claude Skills..."
echo ""

# Function to create skill from template
convert_skill() {
    local old_name=$1
    local skill_name=$2
    local description=$3

    echo "Converting: $skill_name"

    # Create directory
    mkdir -p ".claude/skills/$skill_name"

    # Read original content (skip first line which is the title)
    content=$(tail -n +2 ".github/agents/${old_name}.md")

    # Create SKILL.md with frontmatter
    cat > ".claude/skills/$skill_name/SKILL.md" << EOF
---
name: $skill_name
description: $description
---

$content
EOF

    echo "  ✅ Created .claude/skills/$skill_name/SKILL.md"
}

# Phase 1: Simple conversions (already done web-design-expert)
echo "Phase 1: Simple Skills (< 400 lines)"
echo "========================================="

convert_skill "research_analyst" "research-analyst" \
    "Conducts thorough landscape research, competitive analysis, best practices evaluation, and evidence-based recommendations. Expert in market research and trend analysis."

convert_skill "design_system_creator" "design-system-creator" \
    "Builds comprehensive design systems and design bibles with production-ready CSS. Expert in design tokens, component libraries, and CSS architecture."

convert_skill "team_builder" "team-builder" \
    "Designs high-performing team structures using organizational psychology. Expert in team composition, personality balancing, and collaboration ritual design."

convert_skill "orchestrator" "orchestrator" \
    "Master coordinator that delegates to specialist skills and synthesizes outputs. Expert in problem decomposition, skill orchestration, and quality assurance."

convert_skill "drone_cv_expert" "drone-cv-expert" \
    "Expert in drone systems, computer vision, and autonomous navigation. Specializes in flight control, SLAM, object detection, and sensor fusion."

echo ""
echo "Phase 2: Medium Skills (400-570 lines)"
echo "========================================="

convert_skill "wisdom_accountability_coach" "wisdom-accountability-coach" \
    "Longitudinal memory tracking, philosophy teaching, and personal accountability with compassion. Expert in pattern recognition, Stoicism/Buddhism, and growth guidance."

convert_skill "hrv_alexithymia_expert" "hrv-alexithymia-expert" \
    "Heart rate variability biometrics and emotional awareness training. Expert in HRV analysis, interoception training, biofeedback, and emotional intelligence."

convert_skill "native_app_designer" "native-app-designer" \
    "Creates breathtaking iOS/Mac and web apps with organic, non-AI aesthetic. Expert in SwiftUI, React animations, physics-based motion, and human-crafted design."

convert_skill "agent_creator" "agent-creator" \
    "Meta-agent for creating new custom agents, skills, and MCP integrations. Expert in agent design, MCP development, skill architecture, and rapid prototyping."

echo ""
echo "✨ Simple and medium conversions complete!"
echo ""
echo "📝 Note: Large files (> 600 lines) need manual splitting:"
echo "  - adhd-design-expert (766 lines)"
echo "  - metal-shader-expert (726 lines)"
echo "  - tech-entrepreneur-coach-adhd (750 lines)"
echo "  - drone-inspection-specialist (653 lines)"
echo ""
echo "Run this script again after splitting those files."
