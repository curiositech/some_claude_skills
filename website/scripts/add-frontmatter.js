const fs = require('fs');
const path = require('path');

// Map of skill filenames to their display titles and categories
const skillMetadata = {
  'web_design_expert.md': {
    title: 'Web Design Expert',
    category: 'Design & Development',
    description: 'Creates unique, professionally designed web applications with strong brand identity',
    sidebar_position: 1
  },
  'design_system_creator.md': {
    title: 'Design System Creator',
    category: 'Design & Development',
    description: 'Builds comprehensive design systems and design bibles with production-ready CSS',
    sidebar_position: 2
  },
  'native_app_designer.md': {
    title: 'Native App Designer',
    category: 'Design & Development',
    description: 'Breathtaking iOS/Mac and web apps with organic, non-AI aesthetic',
    sidebar_position: 3
  },
  'drone_cv_expert.md': {
    title: 'Drone & Computer Vision Expert',
    category: 'Specialized Technical',
    description: 'Expert in drone systems, computer vision, and autonomous navigation',
    sidebar_position: 4
  },
  'drone_inspection_specialist.md': {
    title: 'Drone Inspection Specialist',
    category: 'Specialized Technical',
    description: 'Advanced CV for infrastructure inspection with thermal analysis and 3D reconstruction',
    sidebar_position: 5
  },
  'metal_shader_expert.md': {
    title: 'Metal Shader Expert',
    category: 'Specialized Technical',
    description: 'Real-time graphics, shaders, and visual effects with 20 years Weta/Pixar experience',
    sidebar_position: 6
  },
  'research_analyst.md': {
    title: 'Research Analyst',
    category: 'Research & Strategy',
    description: 'Conducts thorough research on landscapes, best practices, and methodologies',
    sidebar_position: 7
  },
  'team_builder.md': {
    title: 'Team Builder & Organizational Psychologist',
    category: 'Research & Strategy',
    description: 'Designs high-performing teams using organizational psychology principles',
    sidebar_position: 8
  },
  'hrv_alexithymia_expert.md': {
    title: 'HRV & Alexithymia Expert',
    category: 'Health & Personal Growth',
    description: 'Heart rate variability biometrics and emotional awareness training',
    sidebar_position: 9
  },
  'adhd_design_expert.md': {
    title: 'ADHD Design Expert',
    category: 'Health & Personal Growth',
    description: 'Neuroscience-backed UX design specifically for ADHD brains',
    sidebar_position: 10
  },
  'wisdom_accountability_coach.md': {
    title: 'Wisdom & Accountability Coach',
    category: 'Health & Personal Growth',
    description: 'Longitudinal memory tracking, philosophy teaching, and personal accountability',
    sidebar_position: 11
  },
  'tech_entrepreneur_coach_adhd.md': {
    title: 'Tech Entrepreneur Coach',
    category: 'Health & Personal Growth',
    description: 'Big tech ML engineer to indie founder transition for ADHD brains',
    sidebar_position: 12
  },
  'agent_creator.md': {
    title: 'Agent & Skill Creator',
    category: 'Meta Skills',
    description: 'Meta-agent for creating new custom agents, skills, and MCP integrations',
    sidebar_position: 13
  },
  'orchestrator.md': {
    title: 'Orchestrator - Pluripotent Meta-Skill',
    category: 'Meta Skills',
    description: 'Coordinates all specialists to solve complex, multi-domain problems',
    sidebar_position: 14
  },
  'collage_layout_expert.md': {
    title: 'Collage Layout Expert',
    category: 'Design & Development',
    description: 'Computational collage composition inspired by David Hockney\'s joiners technique',
    sidebar_position: 15
  },
  'color_theory_palette_harmony_expert.md': {
    title: 'Color Theory & Palette Harmony Expert',
    category: 'Design & Development',
    description: 'Expert in color theory, palette creation, and visual harmony',
    sidebar_position: 16
  },
  'event_detection_temporal_intelligence_expert.md': {
    title: 'Event Detection & Temporal Intelligence Expert',
    category: 'Specialized Technical',
    description: 'Expert in event detection and temporal intelligence for computer vision systems',
    sidebar_position: 17
  },
  'vr_avatar_engineer.md': {
    title: 'VR Avatar Engineer',
    category: 'Specialized Technical',
    description: 'Expert in building photorealistic and stylized avatar systems for VR platforms',
    sidebar_position: 18
  },
  'photo_content_recognition_curation_expert.md': {
    title: 'Photo Content Recognition & Curation Expert',
    category: 'Specialized Technical',
    description: 'Expert in photo content recognition, curation, and intelligent organization systems',
    sidebar_position: 19
  },
  'physics_rendering_expert.md': {
    title: 'Physics & Rendering Expert',
    category: 'Specialized Technical',
    description: 'Computational physics, mechanical engineering, and abstract algebra for real-time simulations',
    sidebar_position: 20
  },
  'sound_engineer.md': {
    title: 'Sound Engineer',
    category: 'Specialized Technical',
    description: 'Expert audio engineer specializing in spatial audio, procedural sound design, and real-time DSP',
    sidebar_position: 21
  },
  'speech_pathology_ai.md': {
    title: 'Speech Pathology AI',
    category: 'Health & Neuroscience',
    description: 'Expert speech-language pathologist specializing in AI-powered speech therapy',
    sidebar_position: 22
  },
  'vaporwave_glassomorphic_ui_designer.md': {
    title: 'Vaporwave Glassomorphic UI Designer',
    category: 'Design & Development',
    description: 'Expert in creating modern UI designs blending vaporwave nostalgia with glassomorphic elegance',
    sidebar_position: 23
  },
  'project_management_guru_adhd.md': {
    title: 'Project Management Guru (ADHD)',
    category: 'Personal Growth & Business',
    description: 'Expert project manager for ADHD engineers managing multiple concurrent projects',
    sidebar_position: 24
  }
};

const guideMetadata = {
  'claude-skills-guide.md': {
    title: 'Claude Skills Guide',
    description: 'Complete guide to understanding and creating Claude Skills',
    sidebar_position: 1
  },
  'examples.md': {
    title: 'Examples & Use Cases',
    description: 'Real-world examples and use cases for Claude Skills',
    sidebar_position: 2
  },
  'skills-documentation.md': {
    title: 'Skills Documentation',
    description: 'Comprehensive documentation for all available skills',
    sidebar_position: 3
  }
};

function addFrontmatter(filePath, metadata) {
  const content = fs.readFileSync(filePath, 'utf8');

  // Check if frontmatter already exists
  if (content.startsWith('---')) {
    console.log(`Skipping ${path.basename(filePath)} - already has frontmatter`);
    return;
  }

  const frontmatter = `---
title: ${metadata.title}
${metadata.description ? `description: ${metadata.description}` : ''}
${metadata.category ? `category: ${metadata.category}` : ''}
sidebar_position: ${metadata.sidebar_position}
---

`;

  const newContent = frontmatter + content;
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log(`Added frontmatter to ${path.basename(filePath)}`);
}

// Process skill files
const skillsDir = path.join(__dirname, '../docs/skills');
const skillFiles = fs.readdirSync(skillsDir);

console.log('Processing skill files...');
skillFiles.forEach(file => {
  if (file.endsWith('.md') && skillMetadata[file]) {
    const filePath = path.join(skillsDir, file);
    addFrontmatter(filePath, skillMetadata[file]);
  }
});

// Process guide files
const guidesDir = path.join(__dirname, '../docs/guides');
const guideFiles = fs.readdirSync(guidesDir);

console.log('\nProcessing guide files...');
guideFiles.forEach(file => {
  if (file.endsWith('.md') && guideMetadata[file]) {
    const filePath = path.join(guidesDir, file);
    addFrontmatter(filePath, guideMetadata[file]);
  }
});

console.log('\nDone!');
