"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FEATURED_SKILLS = exports.ALL_SKILLS = void 0;
exports.getSkillsByCategory = getSkillsByCategory;
exports.searchSkills = searchSkills;
var skillDescriptions_json_1 = require("./skillDescriptions.json");
// Create a map for quick lookup
var descriptionMap = new Map(skillDescriptions_json_1.default.map(function (item) { return [item.id, item.description]; }));
// Helper to get description with fallback
var getDesc = function (id, fallback) { return descriptionMap.get(id) || fallback; };
/**
 * Complete skills data - Single Source of Truth
 * Used by both index.tsx and skills.tsx
 */
exports.ALL_SKILLS = [
    // 🎭 Orchestration & Meta (5 skills)
    { id: 'orchestrator', title: 'Orchestrator', category: 'Orchestration & Meta', path: '/docs/skills/orchestrator', description: getDesc('orchestrator', 'Master coordinator that delegates to specialist skills and synthesizes outputs.'), tags: ['orchestration', 'automation', 'production-ready'] },
    { id: 'agent-creator', title: 'Agent Creator', category: 'Orchestration & Meta', path: '/docs/skills/agent_creator', description: getDesc('agent-creator', 'Meta-agent for creating new custom agents, skills, and MCP integrations.'), tags: ['creation', 'code', 'mcp', 'advanced'] },
    { id: 'skill-coach', title: 'Skill Coach', category: 'Orchestration & Meta', path: '/docs/skills/skill_coach', description: getDesc('skill-coach', 'Guide for creating high-quality Agent Skills with domain expertise, anti-pattern detection, and progressive disclosure.'), tags: ['coaching', 'validation', 'beginner-friendly'], badge: 'NEW' },
    { id: 'skill-documentarian', title: 'Skill Documentarian', category: 'Orchestration & Meta', path: '/docs/skills/skill_documentarian', description: getDesc('skill-documentarian', 'Website sync guardian. Ensures .claude/skills/ stays in sync with website/docs/skills/, validates metadata, creates blog-style artifacts.'), tags: ['automation', 'validation', 'document', 'devops'], badge: 'NEW' },
    { id: 'swift-executor', title: 'Swift Executor', category: 'Orchestration & Meta', path: '/docs/skills/swift_executor', description: getDesc('swift-executor', 'Rapid task execution without hesitation. Overcomes blockers through pragmatic solutions. Ships and iterates.'), tags: ['automation', 'production-ready'], badge: 'NEW' },
    { id: 'automatic-stateful-prompt-improver', title: 'Automatic Prompt Improver', category: 'Orchestration & Meta', path: '/docs/skills/automatic_stateful_prompt_improver', description: getDesc('automatic-stateful-prompt-improver', 'Automatically intercepts and optimizes prompts using APE, OPRO, and DSPy patterns. Learns from performance over time.'), tags: ['automation', 'mcp', 'advanced'], badge: 'NEW' },
    { id: 'seo-visibility-expert', title: 'SEO & Visibility Expert', category: 'Orchestration & Meta', path: '/docs/skills/seo_visibility_expert', description: getDesc('seo-visibility-expert', 'Comprehensive SEO, llms.txt setup, schema markup, social launch strategies, and Answer Engine Optimization.'), tags: ['research', 'strategy', 'devops'], badge: 'NEW' },
    // 🎨 Visual Design & UI (9 skills)
    { id: 'web-design-expert', title: 'Web Design Expert', category: 'Visual Design & UI', path: '/docs/skills/web_design_expert', description: getDesc('web-design-expert', 'Creates unique web designs with brand identity, color palettes, and modern UI/UX patterns.'), tags: ['creation', 'design', 'visual', 'code', 'beginner-friendly'] },
    { id: 'design-system-creator', title: 'Design System Creator', category: 'Visual Design & UI', path: '/docs/skills/design_system_creator', description: getDesc('design-system-creator', 'Builds comprehensive design systems and design bibles with production-ready CSS.'), tags: ['creation', 'design', 'code', 'document', 'production-ready'] },
    { id: 'native-app-designer', title: 'Native App Designer', category: 'Visual Design & UI', path: '/docs/skills/native_app_designer', description: getDesc('native-app-designer', 'Creates breathtaking iOS/Mac and web apps with organic, non-AI aesthetic.'), tags: ['creation', 'design', 'code', 'visual', 'advanced'] },
    { id: 'vaporwave-glassomorphic-ui-designer', title: 'Vaporwave UI Designer', category: 'Visual Design & UI', path: '/docs/skills/vaporwave_glassomorphic_ui_designer', description: getDesc('vaporwave-glassomorphic-ui-designer', 'Modern aesthetic UI blending vaporwave nostalgia with glassomorphic elegance.'), tags: ['creation', 'design', 'visual', 'code'] },
    { id: 'windows-3-1-web-designer', title: 'Windows 3.1 Web Designer', category: 'Visual Design & UI', path: '/docs/skills/windows_3_1_web_designer', description: getDesc('windows-3-1-web-designer', 'Authentic Windows 3.1 aesthetic for modern web. Beveled borders, system gray, pixel fonts.'), tags: ['creation', 'design', 'visual', 'code'], badge: 'NEW' },
    { id: 'typography-expert', title: 'Typography Expert', category: 'Visual Design & UI', path: '/docs/skills/typography_expert', description: getDesc('typography-expert', 'Master typographer: font pairing, OpenType features, variable fonts, performance.'), tags: ['analysis', 'design', 'advanced'] },
    { id: 'vibe-matcher', title: 'Vibe Matcher', category: 'Visual Design & UI', path: '/docs/skills/vibe_matcher', description: getDesc('vibe-matcher', 'Synesthete designer that translates emotional vibes and brand keywords into concrete visual DNA.'), tags: ['analysis', 'creation', 'design', 'data', 'beginner-friendly'], badge: 'NEW' },
    { id: 'interior-design-expert', title: 'Interior Design Expert', category: 'Visual Design & UI', path: '/docs/skills/interior_design_expert', description: getDesc('interior-design-expert', 'Expert interior designer with color science (Munsell), IES lighting standards, and computational space planning.'), tags: ['creation', 'design', 'spatial', 'visual', 'advanced'], badge: 'NEW' },
    { id: 'design-archivist', title: 'Design Archivist', category: 'Visual Design & UI', path: '/docs/skills/design_archivist', description: getDesc('design-archivist', 'Long-running design anthropologist that builds comprehensive visual databases from 500-1000 real-world examples.'), tags: ['research', 'design', 'data', 'advanced'], badge: 'NEW' },
    { id: '2000s-visualization-expert', title: '2000s Visualization Expert', category: 'Visual Design & UI', path: '/docs/skills/2000s_visualization_expert', description: getDesc('2000s-visualization-expert', 'Expert in Milkdrop, AVS, Geiss music visualization and modern WebGL implementations with Butterchurn.'), tags: ['creation', 'audio', 'visual', 'code', 'advanced'], badge: 'NEW' },
    // 🎮 Graphics, 3D & Simulation (4 skills)
    { id: 'metal-shader-expert', title: 'Metal Shader Expert', category: 'Graphics, 3D & Simulation', path: '/docs/skills/metal_shader_expert', description: getDesc('metal-shader-expert', '20 years Weta/Pixar experience in real-time graphics, Metal shaders, and visual effects.'), tags: ['creation', '3d', 'code', 'advanced', 'production-ready'] },
    { id: 'vr-avatar-engineer', title: 'VR Avatar Engineer', category: 'Graphics, 3D & Simulation', path: '/docs/skills/vr_avatar_engineer', description: getDesc('vr-avatar-engineer', 'Photorealistic VR avatars with face tracking, voice, and cross-platform support.'), tags: ['creation', '3d', 'ml', 'code', 'advanced'] },
    { id: 'physics-rendering-expert', title: 'Physics Rendering Expert', category: 'Graphics, 3D & Simulation', path: '/docs/skills/physics_rendering_expert', description: getDesc('physics-rendering-expert', 'Real-time rope and cable dynamics simulation with constraint solvers and rendering.'), tags: ['creation', '3d', 'code', 'advanced'] },
    { id: 'collage-layout-expert', title: 'Collage Layout Expert', category: 'Graphics, 3D & Simulation', path: '/docs/skills/collage_layout_expert', description: getDesc('collage-layout-expert', 'Expert in computational collage composition inspired by David Hockney joiners.'), tags: ['creation', 'cv', 'photography', 'visual', 'advanced'], badge: 'UPDATED' },
    // 🔊 Audio & Sound Design (2 skills)
    { id: 'sound-engineer', title: 'Sound Engineer', category: 'Audio & Sound Design', path: '/docs/skills/sound_engineer', description: getDesc('sound-engineer', 'Expert audio engineering with spatial audio, procedural sound design, and real-time DSP.'), tags: ['creation', 'audio', 'code', 'advanced'] },
    { id: 'voice-audio-engineer', title: 'Voice & Audio Engineer', category: 'Audio & Sound Design', path: '/docs/skills/voice_audio_engineer', description: getDesc('voice-audio-engineer', 'Expert audio engineer with deep signal processing knowledge, spatial audio (Ambisonics, binaural), and production-ready DSP.'), tags: ['creation', 'audio', 'code', 'elevenlabs', 'production-ready'], badge: 'NEW' },
    // 👁️ Computer Vision & Image AI (5 skills)
    { id: 'clip-aware-embeddings', title: 'CLIP-Aware Embeddings', category: 'Computer Vision & Image AI', path: '/docs/skills/clip_aware_embeddings', description: getDesc('clip-aware-embeddings', 'Semantic image-text matching with CLIP and alternatives, knowing when CLIP works and when to use specialized models.'), tags: ['analysis', 'cv', 'ml', 'data', 'advanced'], badge: 'UPDATED' },
    { id: 'photo-content-recognition-curation-expert', title: 'Photo Content Recognition', category: 'Computer Vision & Image AI', path: '/docs/skills/photo_content_recognition_curation_expert', description: getDesc('photo-content-recognition-curation-expert', 'Advanced photo content recognition and intelligent curation.'), tags: ['analysis', 'cv', 'photography', 'ml', 'data'], badge: 'UPDATED' },
    { id: 'event-detection-temporal-intelligence-expert', title: 'Event Detection Expert', category: 'Computer Vision & Image AI', path: '/docs/skills/event_detection_temporal_intelligence_expert', description: getDesc('event-detection-temporal-intelligence-expert', 'Event detection and temporal intelligence for photo analysis.'), tags: ['analysis', 'cv', 'photography', 'ml', 'data', 'advanced'], badge: 'UPDATED' },
    { id: 'photo-composition-critic', title: 'Photo Composition Critic', category: 'Computer Vision & Image AI', path: '/docs/skills/photo_composition_critic', description: getDesc('photo-composition-critic', 'Expert photography critic grounded in graduate-level visual aesthetics and computational aesthetics research (NIMA, AVA, LAION).'), tags: ['analysis', 'validation', 'photography', 'ml', 'advanced'], badge: 'UPDATED' },
    { id: 'color-theory-palette-harmony-expert', title: 'Color Theory Expert', category: 'Computer Vision & Image AI', path: '/docs/skills/color_theory_palette_harmony_expert', description: getDesc('color-theory-palette-harmony-expert', 'Color palette harmony and theory expert for visual design.'), tags: ['analysis', 'design', 'photography', 'data'], badge: 'UPDATED' },
    // 🤖 Autonomous Systems & Robotics (2 skills)
    { id: 'drone-cv-expert', title: 'Drone CV Expert', category: 'Autonomous Systems & Robotics', path: '/docs/skills/drone_cv_expert', description: getDesc('drone-cv-expert', 'Expert in drone systems, computer vision, and autonomous navigation.'), tags: ['creation', 'robotics', 'cv', 'code', 'advanced'], badge: 'UPDATED' },
    { id: 'drone-inspection-specialist', title: 'Drone Inspection Specialist', category: 'Autonomous Systems & Robotics', path: '/docs/skills/drone_inspection_specialist', description: getDesc('drone-inspection-specialist', 'Advanced CV for infrastructure inspection including thermal analysis and 3D reconstruction.'), tags: ['analysis', 'robotics', 'cv', '3d', 'advanced'], badge: 'UPDATED' },
    // 💬 Conversational AI & Bots (1 skill)
    { id: 'bot-developer', title: 'Bot Developer', category: 'Conversational AI & Bots', path: '/docs/skills/bot_developer', description: getDesc('bot-developer', 'Production-grade bot development for Discord, Telegram, Slack with state machines, rate limiting, and moderation systems.'), tags: ['creation', 'automation', 'code', 'production-ready'], badge: 'NEW' },
    // 🔬 Research & Strategy (4 skills)
    { id: 'research-analyst', title: 'Research Analyst', category: 'Research & Strategy', path: '/docs/skills/research_analyst', description: getDesc('research-analyst', 'Thorough landscape research, competitive analysis, and evidence-based recommendations.'), tags: ['research', 'analysis', 'document', 'strategy', 'beginner-friendly'] },
    { id: 'team-builder', title: 'Team Builder', category: 'Research & Strategy', path: '/docs/skills/team_builder', description: getDesc('team-builder', 'Designs high-performing team structures using organizational psychology.'), tags: ['analysis', 'strategy', 'psychology'] },
    { id: 'competitive-cartographer', title: 'Competitive Cartographer', category: 'Research & Strategy', path: '/docs/skills/competitive_cartographer', description: getDesc('competitive-cartographer', 'Strategic analyst that maps competitive landscapes and identifies white space opportunities.'), tags: ['research', 'analysis', 'strategy', 'entrepreneurship', 'career'], badge: 'NEW' },
    { id: 'hr-network-analyst', title: 'HR Network Analyst', category: 'Research & Strategy', path: '/docs/skills/hr_network_analyst', description: getDesc('hr-network-analyst', 'Hypermodern HR data scientist for professional network graph analysis to find superconnectors.'), tags: ['research', 'analysis', 'data', 'career', 'strategy', 'advanced', 'mcp'], badge: 'NEW' },
    // 🌱 Coaching & Personal Development (10 skills)
    { id: 'career-biographer', title: 'Career Biographer', category: 'Coaching & Personal Development', path: '/docs/skills/career_biographer', description: getDesc('career-biographer', 'AI-powered career biographer that conducts empathetic interviews and transforms professional stories into portfolios, CVs, and personal brand assets.'), tags: ['coaching', 'career', 'document', 'beginner-friendly'], badge: 'NEW' },
    { id: 'cv-creator', title: 'CV Creator', category: 'Coaching & Personal Development', path: '/docs/skills/cv_creator', description: getDesc('cv-creator', 'Professional resume builder that transforms career narratives into ATS-optimized, multi-format resumes with strategic positioning.'), tags: ['creation', 'career', 'document', 'beginner-friendly', 'production-ready'], badge: 'NEW' },
    { id: 'job-application-optimizer', title: 'Job Application Optimizer', category: 'Coaching & Personal Development', path: '/docs/skills/job_application_optimizer', description: getDesc('job-application-optimizer', 'Strategic job application planning and Resume SEO optimization. ATS scoring, keyword research, and application campaign strategy.'), tags: ['optimization', 'job-search', 'career', 'strategy', 'mcp', 'beginner-friendly'], badge: 'NEW' },
    { id: 'personal-finance-coach', title: 'Personal Finance Coach', category: 'Coaching & Personal Development', path: '/docs/skills/personal_finance_coach', description: getDesc('personal-finance-coach', 'Expert personal finance coach grounded in academic research: MPT, factor investing, tax optimization, and retirement mathematics.'), tags: ['coaching', 'finance', 'analysis', 'beginner-friendly'], badge: 'NEW' },
    { id: 'tech-entrepreneur-coach-adhd', title: 'Tech Entrepreneur Coach', category: 'Coaching & Personal Development', path: '/docs/skills/tech_entrepreneur_coach_adhd', description: getDesc('tech-entrepreneur-coach-adhd', 'Big tech ML engineer to indie founder transition coach.'), tags: ['coaching', 'entrepreneurship', 'career', 'accessibility', 'strategy'] },
    { id: 'project-management-guru-adhd', title: 'Project Management Guru', category: 'Coaching & Personal Development', path: '/docs/skills/project_management_guru_adhd', description: getDesc('project-management-guru-adhd', 'Expert project manager for ADHD engineers managing concurrent projects.'), tags: ['coaching', 'accessibility', 'strategy', 'beginner-friendly'] },
    { id: 'jungian-psychologist', title: 'Jungian Psychologist', category: 'Coaching & Personal Development', path: '/docs/skills/jungian_psychologist', description: getDesc('jungian-psychologist', 'Expert in Jungian analytical psychology: shadow work, archetypes, dream analysis, and individuation grounded in primary sources.'), tags: ['coaching', 'psychology', 'analysis', 'advanced'], badge: 'NEW' },
    { id: 'wisdom-accountability-coach', title: 'Wisdom & Accountability Coach', category: 'Coaching & Personal Development', path: '/docs/skills/wisdom_accountability_coach', description: getDesc('wisdom-accountability-coach', 'Longitudinal memory tracking, philosophy teaching, and personal accountability.'), tags: ['coaching', 'psychology', 'beginner-friendly'] },
    { id: 'hrv-alexithymia-expert', title: 'HRV & Alexithymia Expert', category: 'Coaching & Personal Development', path: '/docs/skills/hrv_alexithymia_expert', description: getDesc('hrv-alexithymia-expert', 'Heart rate variability biometrics and emotional awareness training.'), tags: ['coaching', 'health', 'psychology', 'data', 'advanced'] },
    { id: 'speech-pathology-ai', title: 'Speech Pathology AI', category: 'Coaching & Personal Development', path: '/docs/skills/speech_pathology_ai', description: getDesc('speech-pathology-ai', 'AI-powered speech therapy, phoneme analysis, and articulation visualization.'), tags: ['coaching', 'health', 'audio', 'ml', 'accessibility'] },
    { id: 'adhd-design-expert', title: 'ADHD Design Expert', category: 'Coaching & Personal Development', path: '/docs/skills/adhd_design_expert', description: getDesc('adhd-design-expert', 'Designs digital experiences for ADHD brains using neuroscience research.'), tags: ['creation', 'design', 'accessibility', 'research', 'beginner-friendly'] },
    // ⚙️ DevOps & Site Reliability (2 skills)
    { id: 'site-reliability-engineer', title: 'Site Reliability Engineer', category: 'DevOps & Site Reliability', path: '/docs/skills/site_reliability_engineer', description: getDesc('site-reliability-engineer', 'Proactive validation and build reliability expert that prevents SSG failures through pre-commit hooks, MDX validation, and systematic error detection.'), tags: ['validation', 'automation', 'devops', 'code', 'production-ready'], badge: 'NEW' },
    { id: 'code-necromancer', title: 'Code Necromancer', category: 'DevOps & Site Reliability', path: '/docs/skills/code_necromancer', description: getDesc('code-necromancer', 'Systematic framework for resurrecting and modernizing legacy codebases through archaeology, resurrection, and rejuvenation phases.'), tags: ['analysis', 'code', 'devops', 'advanced'], badge: 'NEW' },
    // 💰 Business & Monetization (1 skill)
    { id: 'indie-monetization-strategist', title: 'Indie Monetization Strategist', category: 'Business & Monetization', path: '/docs/skills/indie_monetization_strategist', description: getDesc('indie-monetization-strategist', 'Monetization strategies for indie developers: freemium, SaaS pricing, sponsorships, donations, and passive income.'), tags: ['strategy', 'entrepreneurship', 'beginner-friendly'], badge: 'NEW' },
];
/**
 * Featured skills for homepage display
 */
exports.FEATURED_SKILLS = [
    exports.ALL_SKILLS.find(function (s) { return s.id === 'cv-creator'; }), // Production implementation with artifact
    exports.ALL_SKILLS.find(function (s) { return s.id === 'metal-shader-expert'; }),
    exports.ALL_SKILLS.find(function (s) { return s.id === 'vr-avatar-engineer'; }),
    exports.ALL_SKILLS.find(function (s) { return s.id === 'drone-cv-expert'; }),
    exports.ALL_SKILLS.find(function (s) { return s.id === 'collage-layout-expert'; }),
    exports.ALL_SKILLS.find(function (s) { return s.id === 'adhd-design-expert'; }),
    exports.ALL_SKILLS.find(function (s) { return s.id === 'sound-engineer'; }),
];
/**
 * Get skills by category
 */
function getSkillsByCategory(category) {
    if (category === 'all')
        return exports.ALL_SKILLS;
    return exports.ALL_SKILLS.filter(function (skill) { return skill.category === category; });
}
/**
 * Search skills by query
 */
function searchSkills(skills, query) {
    if (!query)
        return skills;
    var lowerQuery = query.toLowerCase();
    return skills.filter(function (skill) {
        return skill.title.toLowerCase().includes(lowerQuery) ||
            skill.description.toLowerCase().includes(lowerQuery);
    });
}
