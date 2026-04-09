#!/usr/bin/env python3
import os
import re

# Mapping of skill files to hero image names
skills = {
    "intimacy_avatar_engineer": "intimacy-avatar-engineer",
    "metal_shader_expert": "metal-shader-expert",
    "native_app_designer": "native-app-designer",
    "orchestrator": "orchestrator",
    "photo_content_recognition_curation_expert": "photo-content-recognition-curation-expert",
    "physics_rendering_expert": "physics-rendering-expert",
    "project_management_guru_adhd": "project-management-guru-adhd",
    "research_analyst": "research-analyst",
    "sound_engineer": "sound-engineer",
    "speech_pathology_ai": "speech-pathology-ai",
    "team_builder": "team-builder",
    "tech_entrepreneur_coach_adhd": "tech-entrepreneur-coach-adhd",
    "typography_expert": "typography-expert",
    "vaporwave_glassomorphic_ui_designer": "vaporwave-glassomorphic-ui-designer",
    "web_design_expert": "web-design-expert",
    "wisdom_accountability_coach": "wisdom-accountability-coach",
}

docs_path = "website/docs/skills"

for skill_file, hero_name in skills.items():
    filepath = os.path.join(docs_path, f"{skill_file}.md")

    if not os.path.exists(filepath):
        print(f"Warning: {filepath} not found")
        continue

    with open(filepath, 'r') as f:
        content = f.read()

    # Check if hero image already exists
    if f"![Hero Banner](/img/skills/{hero_name}-hero.png)" in content or f"![.*Hero.*](/img/skills/{hero_name}-hero.png)" in content:
        print(f"✓ {skill_file}.md already has hero image")
        continue

    hero_line = f"\n![Hero Banner](/img/skills/{hero_name}-hero.png)\n"

    # Try to add after SkillHeader component
    if "<SkillHeader" in content:
        # Find the closing /> of SkillHeader
        pattern = r'(<SkillHeader[^>]*/>)\n\n'
        if re.search(pattern, content):
            new_content = re.sub(pattern, r'\1' + hero_line + '\n', content)
            with open(filepath, 'w') as f:
                f.write(new_content)
            print(f"✓ Added hero to {skill_file}.md")
        else:
            print(f"⚠ Could not find pattern in {skill_file}.md")
    else:
        # Add after the first # heading
        pattern = r'(# [^\n]+\n)\n'
        if re.search(pattern, content):
            new_content = re.sub(pattern, r'\1' + hero_line, content, count=1)
            with open(filepath, 'w') as f:
                f.write(new_content)
            print(f"✓ Added hero to {skill_file}.md")
        else:
            print(f"⚠ Could not find heading in {skill_file}.md")

print("\nDone!")
