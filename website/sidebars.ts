import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  // Main documentation sidebar
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Guides',
      collapsed: false,
      items: [
        'guides/claude-skills-guide',
        'guides/examples',
        'guides/skills-documentation',
      ],
    },
    {
      type: 'category',
      label: 'Design & Development Skills',
      collapsed: false,
      items: [
        'skills/web_design_expert',
        'skills/design_system_creator',
        'skills/native_app_designer',
        'skills/collage_layout_expert',
        'skills/vaporwave_glassomorphic_ui_designer',
      ],
    },
    {
      type: 'category',
      label: 'Specialized Technical Skills',
      collapsed: false,
      items: [
        'skills/drone_cv_expert',
        'skills/drone_inspection_specialist',
        'skills/metal_shader_expert',
        'skills/vr_avatar_engineer',
        'skills/physics_rendering_expert',
        'skills/sound_engineer',
      ],
    },
    {
      type: 'category',
      label: 'Research & Strategy Skills',
      collapsed: false,
      items: [
        'skills/research_analyst',
        'skills/team_builder',
      ],
    },
    {
      type: 'category',
      label: 'Photo Intelligence Skills',
      collapsed: false,
      items: [
        'skills/color_theory_palette_harmony_expert',
        'skills/event_detection_temporal_intelligence_expert',
        'skills/photo_content_recognition_curation_expert',
      ],
    },
    {
      type: 'category',
      label: 'Health & Personal Growth Skills',
      collapsed: false,
      items: [
        'skills/hrv_alexithymia_expert',
        'skills/adhd_design_expert',
        'skills/speech_pathology_ai',
        'skills/wisdom_accountability_coach',
        'skills/tech_entrepreneur_coach_adhd',
        'skills/project_management_guru_adhd',
      ],
    },
    {
      type: 'category',
      label: 'Meta Skills',
      collapsed: false,
      items: [
        'skills/agent_creator',
        'skills/orchestrator',
      ],
    },
  ],
};

export default sidebars;
