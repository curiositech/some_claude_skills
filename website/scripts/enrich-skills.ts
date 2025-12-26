/**
 * Skill Enrichment Script
 *
 * Adds categories, tags, and skill pairings to all SKILL.md files.
 * Run with: npx tsx scripts/enrich-skills.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';

// =============================================================================
// SKILL ENRICHMENT DATA
// Categories, tags, and pairings for each skill
// =============================================================================

interface SkillEnrichment {
  category: string;
  tags: string[];
  pairsWith: Array<{ skill: string; reason: string }>;
}

const SKILL_ENRICHMENTS: Record<string, SkillEnrichment> = {
  '2000s-visualization-expert': {
    category: 'Design & Creative',
    tags: ['audio', 'webgl', 'visualization', 'shaders', 'music'],
    pairsWith: [
      { skill: 'sound-engineer', reason: 'Audio processing feeds the visualizations' },
      { skill: 'metal-shader-expert', reason: 'Advanced GPU shader techniques' },
    ],
  },
  'adhd-daily-planner': {
    category: 'Lifestyle & Personal',
    tags: ['adhd', 'productivity', 'planning', 'neurodivergent', 'executive-function'],
    pairsWith: [
      { skill: 'project-management-guru-adhd', reason: 'Long-term project planning with ADHD context' },
      { skill: 'wisdom-accountability-coach', reason: 'Accountability and habit tracking' },
    ],
  },
  'adhd-design-expert': {
    category: 'Design & Creative',
    tags: ['adhd', 'ux', 'accessibility', 'neurodivergent', 'cognitive-load'],
    pairsWith: [
      { skill: 'native-app-designer', reason: 'Implement ADHD-friendly designs in apps' },
      { skill: 'vaporwave-glassomorphic-ui-designer', reason: 'Apply ADHD principles to aesthetic UI' },
    ],
  },
  'agent-creator': {
    category: 'Productivity & Meta',
    tags: ['agents', 'mcp', 'automation', 'meta', 'skill-development'],
    pairsWith: [
      { skill: 'skill-coach', reason: 'Quality review for created skills' },
      { skill: 'mcp-creator', reason: 'When skills need external tool integration' },
    ],
  },
  'api-architect': {
    category: 'Code Quality & Testing',
    tags: ['api', 'rest', 'graphql', 'grpc', 'architecture'],
    pairsWith: [
      { skill: 'data-pipeline-engineer', reason: 'Data layer design under APIs' },
      { skill: 'devops-automator', reason: 'Deployment and infrastructure for APIs' },
    ],
  },
  'automatic-stateful-prompt-improver': {
    category: 'AI & Machine Learning',
    tags: ['prompts', 'optimization', 'learning', 'embeddings', 'dspy'],
    pairsWith: [
      { skill: 'skill-coach', reason: 'Optimize skill prompts systematically' },
      { skill: 'skill-logger', reason: 'Track prompt performance over time' },
    ],
  },
  'bot-developer': {
    category: 'AI & Machine Learning',
    tags: ['discord', 'telegram', 'slack', 'bots', 'automation'],
    pairsWith: [
      { skill: 'api-architect', reason: 'Design robust bot backend APIs' },
      { skill: 'devops-automator', reason: 'Deploy and scale bot infrastructure' },
    ],
  },
  'career-biographer': {
    category: 'Business & Monetization',
    tags: ['career', 'narrative', 'portfolio', 'interviews', 'storytelling'],
    pairsWith: [
      { skill: 'cv-creator', reason: 'Turn career narratives into resumes' },
      { skill: 'competitive-cartographer', reason: 'Position your career competitively' },
    ],
  },
  'claude-ecosystem-promoter': {
    category: 'Business & Monetization',
    tags: ['marketing', 'community', 'mcp', 'developer-relations', 'promotion'],
    pairsWith: [
      { skill: 'seo-visibility-expert', reason: 'SEO for skill/MCP discoverability' },
      { skill: 'agent-creator', reason: 'Create the things you promote' },
    ],
  },
  'clip-aware-embeddings': {
    category: 'AI & Machine Learning',
    tags: ['clip', 'embeddings', 'vision', 'similarity', 'zero-shot'],
    pairsWith: [
      { skill: 'photo-content-recognition-curation-expert', reason: 'Content-aware photo processing' },
      { skill: 'collage-layout-expert', reason: 'Semantic image matching for layouts' },
    ],
  },
  'code-necromancer': {
    category: 'Code Quality & Testing',
    tags: ['legacy', 'modernization', 'technical-debt', 'archaeology', 'refactoring'],
    pairsWith: [
      { skill: 'refactoring-surgeon', reason: 'Clean up discovered legacy code' },
      { skill: 'technical-writer', reason: 'Document resurrected codebases' },
    ],
  },
  'collage-layout-expert': {
    category: 'Design & Creative',
    tags: ['collage', 'layout', 'photo-mosaic', 'composition', 'blending'],
    pairsWith: [
      { skill: 'color-theory-palette-harmony-expert', reason: 'Harmonize colors across collage' },
      { skill: 'photo-composition-critic', reason: 'Ensure aesthetic quality of result' },
    ],
  },
  'color-theory-palette-harmony-expert': {
    category: 'Design & Creative',
    tags: ['color', 'palette', 'harmony', 'lab-space', 'perceptual'],
    pairsWith: [
      { skill: 'web-design-expert', reason: 'Apply color theory to web designs' },
      { skill: 'interior-design-expert', reason: 'Color palettes for interior spaces' },
    ],
  },
  'competitive-cartographer': {
    category: 'Research & Analysis',
    tags: ['competitive-analysis', 'market', 'positioning', 'strategy', 'differentiation'],
    pairsWith: [
      { skill: 'career-biographer', reason: 'Position career narratives competitively' },
      { skill: 'research-analyst', reason: 'Deep market research backing' },
    ],
  },
  'cv-creator': {
    category: 'Business & Monetization',
    tags: ['resume', 'ats', 'career', 'pdf', 'latex'],
    pairsWith: [
      { skill: 'career-biographer', reason: 'Get structured career data' },
      { skill: 'job-application-optimizer', reason: 'Tailor CVs to specific roles' },
    ],
  },
  'data-pipeline-engineer': {
    category: 'Data & Analytics',
    tags: ['etl', 'spark', 'kafka', 'airflow', 'data-warehouse'],
    pairsWith: [
      { skill: 'api-architect', reason: 'APIs that consume pipeline data' },
      { skill: 'devops-automator', reason: 'Orchestrate pipeline infrastructure' },
    ],
  },
  'design-archivist': {
    category: 'Research & Analysis',
    tags: ['design-research', 'patterns', 'analysis', 'visual-database', 'trends'],
    pairsWith: [
      { skill: 'web-design-expert', reason: 'Apply researched patterns to designs' },
      { skill: 'competitive-cartographer', reason: 'Design-focused competitive analysis' },
    ],
  },
  'design-system-creator': {
    category: 'Design & Creative',
    tags: ['design-system', 'tokens', 'components', 'css', 'style-guide'],
    pairsWith: [
      { skill: 'typography-expert', reason: 'Typography decisions for the system' },
      { skill: 'color-theory-palette-harmony-expert', reason: 'Color token architecture' },
    ],
  },
  'devops-automator': {
    category: 'DevOps & Site Reliability',
    tags: ['ci-cd', 'terraform', 'docker', 'kubernetes', 'gitops'],
    pairsWith: [
      { skill: 'site-reliability-engineer', reason: 'Ensure deployed code is healthy' },
      { skill: 'security-auditor', reason: 'Secure the deployment pipeline' },
    ],
  },
  'diagramming-expert': {
    category: 'Content & Writing',
    tags: ['diagrams', 'ascii', 'visualization', 'architecture', 'documentation'],
    pairsWith: [
      { skill: 'technical-writer', reason: 'Visual documentation for technical content' },
      { skill: 'api-architect', reason: 'Diagram API architectures' },
    ],
  },
  'digital-estate-planner': {
    category: 'Lifestyle & Personal',
    tags: ['legacy', 'passwords', 'estate', 'death-preparedness', 'digital-assets'],
    pairsWith: [
      { skill: 'grief-companion', reason: 'Support for end-of-life planning' },
      { skill: 'security-auditor', reason: 'Ensure secure estate documentation' },
    ],
  },
  'drone-cv-expert': {
    category: 'AI & Machine Learning',
    tags: ['drone', 'slam', 'navigation', 'sensor-fusion', 'path-planning'],
    pairsWith: [
      { skill: 'drone-inspection-specialist', reason: 'Domain-specific inspection tasks' },
      { skill: 'physics-rendering-expert', reason: 'Physics simulation for drone systems' },
    ],
  },
  'drone-inspection-specialist': {
    category: 'AI & Machine Learning',
    tags: ['inspection', 'fire-detection', 'thermal', 'gaussian-splatting', 'insurance'],
    pairsWith: [
      { skill: 'drone-cv-expert', reason: 'Core drone navigation and CV' },
      { skill: 'clip-aware-embeddings', reason: 'Semantic understanding of inspected areas' },
    ],
  },
  'event-detection-temporal-intelligence-expert': {
    category: 'AI & Machine Learning',
    tags: ['temporal', 'clustering', 'events', 'spatio-temporal', 'photo-context'],
    pairsWith: [
      { skill: 'photo-content-recognition-curation-expert', reason: 'Content + temporal understanding' },
      { skill: 'wedding-immortalist', reason: 'Event detection for wedding albums' },
    ],
  },
  'fancy-yard-landscaper': {
    category: 'Lifestyle & Personal',
    tags: ['landscaping', 'garden', 'plants', 'outdoor', 'privacy-screen'],
    pairsWith: [
      { skill: 'interior-design-expert', reason: 'Indoor-outdoor design cohesion' },
      { skill: 'maximalist-wall-decorator', reason: 'Bold outdoor aesthetic choices' },
    ],
  },
  'grief-companion': {
    category: 'Lifestyle & Personal',
    tags: ['grief', 'bereavement', 'memorial', 'healing', 'loss'],
    pairsWith: [
      { skill: 'pet-memorial-creator', reason: 'Pet-specific grief support' },
      { skill: 'digital-estate-planner', reason: 'Practical legacy tasks during grief' },
    ],
  },
  'hr-network-analyst': {
    category: 'Research & Analysis',
    tags: ['network', 'superconnectors', 'influence', 'graph-theory', 'hr'],
    pairsWith: [
      { skill: 'career-biographer', reason: 'Understand network in career context' },
      { skill: 'competitive-cartographer', reason: 'Map competitive professional landscape' },
    ],
  },
  'hrv-alexithymia-expert': {
    category: 'Lifestyle & Personal',
    tags: ['hrv', 'biofeedback', 'interoception', 'emotional-awareness', 'vagal'],
    pairsWith: [
      { skill: 'jungian-psychologist', reason: 'Psychological context for HRV patterns' },
      { skill: 'wisdom-accountability-coach', reason: 'Track emotional growth over time' },
    ],
  },
  'indie-monetization-strategist': {
    category: 'Business & Monetization',
    tags: ['monetization', 'pricing', 'saas', 'indie', 'passive-income'],
    pairsWith: [
      { skill: 'tech-entrepreneur-coach-adhd', reason: 'ADHD-friendly founder guidance' },
      { skill: 'seo-visibility-expert', reason: 'Get traffic for monetization' },
    ],
  },
  'interior-design-expert': {
    category: 'Design & Creative',
    tags: ['interior', 'lighting', 'furniture', 'space-planning', 'color'],
    pairsWith: [
      { skill: 'color-theory-palette-harmony-expert', reason: 'Color decisions for interiors' },
      { skill: 'fancy-yard-landscaper', reason: 'Indoor-outdoor cohesion' },
    ],
  },
  'job-application-optimizer': {
    category: 'Business & Monetization',
    tags: ['job-search', 'ats', 'resume-seo', 'application', 'optimization'],
    pairsWith: [
      { skill: 'cv-creator', reason: 'Generate optimized CVs' },
      { skill: 'competitive-cartographer', reason: 'Understand job market positioning' },
    ],
  },
  'jungian-psychologist': {
    category: 'Lifestyle & Personal',
    tags: ['jung', 'archetypes', 'shadow', 'dreams', 'individuation'],
    pairsWith: [
      { skill: 'wisdom-accountability-coach', reason: 'Accountability on growth journey' },
      { skill: 'grief-companion', reason: 'Psychological depth for grief work' },
    ],
  },
  'knot-theory-educator': {
    category: 'Content & Writing',
    tags: ['knots', 'topology', 'braid-theory', 'visualization', 'education'],
    pairsWith: [
      { skill: 'diagramming-expert', reason: 'Visual representations of knots' },
      { skill: 'technical-writer', reason: 'Educational content creation' },
    ],
  },
  'liaison': {
    category: 'Productivity & Meta',
    tags: ['communication', 'briefings', 'coordination', 'human-interface', 'reporting'],
    pairsWith: [
      { skill: 'orchestrator', reason: 'Coordinate complex multi-skill work' },
      { skill: 'project-management-guru-adhd', reason: 'Structured status updates' },
    ],
  },
  'maximalist-wall-decorator': {
    category: 'Design & Creative',
    tags: ['maximalist', 'wall-decor', 'bold', 'gallery-wall', 'eclectic'],
    pairsWith: [
      { skill: 'interior-design-expert', reason: 'Room-scale design context' },
      { skill: 'color-theory-palette-harmony-expert', reason: 'Bold color theory' },
    ],
  },
  'mcp-creator': {
    category: 'Productivity & Meta',
    tags: ['mcp', 'model-context-protocol', 'tools', 'integration', 'servers'],
    pairsWith: [
      { skill: 'agent-creator', reason: 'Skills that use the MCP tools' },
      { skill: 'security-auditor', reason: 'Secure MCP server development' },
    ],
  },
  'metal-shader-expert': {
    category: 'AI & Machine Learning',
    tags: ['metal', 'shaders', 'gpu', 'pbr', 'apple'],
    pairsWith: [
      { skill: 'native-app-designer', reason: 'GPU-accelerated iOS/Mac apps' },
      { skill: '2000s-visualization-expert', reason: 'Advanced shader techniques' },
    ],
  },
  'modern-drug-rehab-computer': {
    category: 'Lifestyle & Personal',
    tags: ['recovery', 'addiction', 'treatment', 'mat', 'sobriety'],
    pairsWith: [
      { skill: 'sober-addict-protector', reason: 'Daily relapse prevention' },
      { skill: 'jungian-psychologist', reason: 'Psychological depth for recovery' },
    ],
  },
  'native-app-designer': {
    category: 'Design & Creative',
    tags: ['ios', 'swiftui', 'react', 'animations', 'motion'],
    pairsWith: [
      { skill: 'metal-shader-expert', reason: 'GPU-accelerated visual effects' },
      { skill: 'vaporwave-glassomorphic-ui-designer', reason: 'Aesthetic iOS design' },
    ],
  },
  'orchestrator': {
    category: 'Productivity & Meta',
    tags: ['coordination', 'multi-skill', 'delegation', 'synthesis', 'workflow'],
    pairsWith: [
      { skill: 'team-builder', reason: 'Design skill teams for tasks' },
      { skill: 'liaison', reason: 'Communicate orchestration results' },
    ],
  },
  'panic-room-finder': {
    category: 'Lifestyle & Personal',
    tags: ['hidden-rooms', 'architecture', 'investigation', 'safe-room', 'mapping'],
    pairsWith: [
      { skill: 'interior-design-expert', reason: 'Integrate hidden spaces into design' },
      { skill: 'diagramming-expert', reason: 'Map discovered spaces' },
    ],
  },
  'partner-text-coach': {
    category: 'Lifestyle & Personal',
    tags: ['relationships', 'communication', 'nvc', 'conflict', 'attachment'],
    pairsWith: [
      { skill: 'jungian-psychologist', reason: 'Deep psychological context' },
      { skill: 'wisdom-accountability-coach', reason: 'Relationship growth tracking' },
    ],
  },
  'personal-finance-coach': {
    category: 'Business & Monetization',
    tags: ['finance', 'investing', 'fire', 'tax', 'retirement'],
    pairsWith: [
      { skill: 'indie-monetization-strategist', reason: 'Monetization for wealth building' },
      { skill: 'digital-estate-planner', reason: 'Financial legacy planning' },
    ],
  },
  'pet-memorial-creator': {
    category: 'Lifestyle & Personal',
    tags: ['pets', 'memorial', 'grief', 'tribute', 'loss'],
    pairsWith: [
      { skill: 'grief-companion', reason: 'Broader grief support' },
      { skill: 'diagramming-expert', reason: 'Memorial timeline visualizations' },
    ],
  },
  'photo-composition-critic': {
    category: 'Design & Creative',
    tags: ['photography', 'composition', 'aesthetics', 'nima', 'critique'],
    pairsWith: [
      { skill: 'color-theory-palette-harmony-expert', reason: 'Color analysis of photos' },
      { skill: 'collage-layout-expert', reason: 'Quality photos for collages' },
    ],
  },
  'photo-content-recognition-curation-expert': {
    category: 'AI & Machine Learning',
    tags: ['face-recognition', 'deduplication', 'curation', 'indexing', 'nsfw'],
    pairsWith: [
      { skill: 'event-detection-temporal-intelligence-expert', reason: 'Temporal context for photos' },
      { skill: 'wedding-immortalist', reason: 'Curate wedding photo collections' },
    ],
  },
  'physics-rendering-expert': {
    category: 'AI & Machine Learning',
    tags: ['physics', 'pbd', 'verlet', 'simulation', 'constraints'],
    pairsWith: [
      { skill: 'metal-shader-expert', reason: 'GPU-accelerated physics rendering' },
      { skill: 'native-app-designer', reason: 'Physics in app animations' },
    ],
  },
  'project-management-guru-adhd': {
    category: 'Productivity & Meta',
    tags: ['adhd', 'project-management', 'context-switching', 'hyperfocus', 'deadlines'],
    pairsWith: [
      { skill: 'adhd-daily-planner', reason: 'Day-level planning within projects' },
      { skill: 'orchestrator', reason: 'Coordinate multiple project streams' },
    ],
  },
  'refactoring-surgeon': {
    category: 'Code Quality & Testing',
    tags: ['refactoring', 'code-smells', 'solid', 'dry', 'cleanup'],
    pairsWith: [
      { skill: 'code-necromancer', reason: 'Refactor resurrected legacy code' },
      { skill: 'test-automation-expert', reason: 'Tests before refactoring' },
    ],
  },
  'research-analyst': {
    category: 'Research & Analysis',
    tags: ['research', 'analysis', 'landscape', 'competitive', 'evidence-based'],
    pairsWith: [
      { skill: 'competitive-cartographer', reason: 'Market-focused research' },
      { skill: 'design-archivist', reason: 'Design-focused research' },
    ],
  },
  'security-auditor': {
    category: 'Code Quality & Testing',
    tags: ['security', 'owasp', 'vulnerabilities', 'sast', 'dependencies'],
    pairsWith: [
      { skill: 'devops-automator', reason: 'Secure deployment pipelines' },
      { skill: 'mcp-creator', reason: 'Secure MCP server development' },
    ],
  },
  'seo-visibility-expert': {
    category: 'Business & Monetization',
    tags: ['seo', 'llms-txt', 'discoverability', 'product-hunt', 'aeo'],
    pairsWith: [
      { skill: 'claude-ecosystem-promoter', reason: 'Promote with SEO backing' },
      { skill: 'technical-writer', reason: 'SEO-optimized documentation' },
    ],
  },
  'site-reliability-engineer': {
    category: 'DevOps & Site Reliability',
    tags: ['docusaurus', 'build-health', 'mdx', 'validation', 'deployment'],
    pairsWith: [
      { skill: 'devops-automator', reason: 'CI/CD for site deployments' },
      { skill: 'skill-documentarian', reason: 'Maintain skill documentation quality' },
    ],
  },
  'skill-coach': {
    category: 'Productivity & Meta',
    tags: ['skills', 'quality', 'anti-patterns', 'best-practices', 'review'],
    pairsWith: [
      { skill: 'agent-creator', reason: 'Quality review for new skills' },
      { skill: 'automatic-stateful-prompt-improver', reason: 'Optimize skill prompts' },
    ],
  },
  'skill-documentarian': {
    category: 'Content & Writing',
    tags: ['documentation', 'skills', 'sync', 'artifacts', 'metadata'],
    pairsWith: [
      { skill: 'site-reliability-engineer', reason: 'Ensure docs build correctly' },
      { skill: 'skill-coach', reason: 'Document quality skills' },
    ],
  },
  'skill-logger': {
    category: 'Productivity & Meta',
    tags: ['logging', 'analytics', 'metrics', 'quality', 'improvement'],
    pairsWith: [
      { skill: 'automatic-stateful-prompt-improver', reason: 'Data for prompt optimization' },
      { skill: 'skill-coach', reason: 'Quality tracking feeds coaching' },
    ],
  },
  'sober-addict-protector': {
    category: 'Lifestyle & Personal',
    tags: ['sobriety', 'relapse-prevention', 'triggers', 'recovery', 'daily'],
    pairsWith: [
      { skill: 'modern-drug-rehab-computer', reason: 'Comprehensive treatment knowledge' },
      { skill: 'wisdom-accountability-coach', reason: 'Accountability for recovery goals' },
    ],
  },
  'sound-engineer': {
    category: 'Design & Creative',
    tags: ['audio', 'spatial', 'wwise', 'fmod', 'game-audio'],
    pairsWith: [
      { skill: 'voice-audio-engineer', reason: 'Voice + spatial audio integration' },
      { skill: '2000s-visualization-expert', reason: 'Audio-reactive visuals' },
    ],
  },
  'speech-pathology-ai': {
    category: 'AI & Machine Learning',
    tags: ['speech-therapy', 'phonemes', 'articulation', 'voice', 'aac'],
    pairsWith: [
      { skill: 'voice-audio-engineer', reason: 'Voice synthesis for therapy' },
      { skill: 'diagramming-expert', reason: 'Visualize articulation patterns' },
    ],
  },
  'swift-executor': {
    category: 'Productivity & Meta',
    tags: ['execution', 'urgency', 'decisiveness', 'momentum', 'blockers'],
    pairsWith: [
      { skill: 'orchestrator', reason: 'Execute orchestrated tasks quickly' },
      { skill: 'project-management-guru-adhd', reason: 'Break through ADHD paralysis' },
    ],
  },
  'team-builder': {
    category: 'Productivity & Meta',
    tags: ['teams', 'composition', 'roles', 'collaboration', 'skills'],
    pairsWith: [
      { skill: 'orchestrator', reason: 'Orchestrate built teams' },
      { skill: 'agent-creator', reason: 'Create skills for team gaps' },
    ],
  },
  'tech-entrepreneur-coach-adhd': {
    category: 'Business & Monetization',
    tags: ['entrepreneur', 'adhd', 'startup', 'mvp', 'indie'],
    pairsWith: [
      { skill: 'indie-monetization-strategist', reason: 'Monetization for ADHD founders' },
      { skill: 'adhd-daily-planner', reason: 'Daily structure for founders' },
    ],
  },
  'technical-writer': {
    category: 'Content & Writing',
    tags: ['documentation', 'readme', 'api-docs', 'tutorials', 'runbooks'],
    pairsWith: [
      { skill: 'diagramming-expert', reason: 'Visual documentation' },
      { skill: 'seo-visibility-expert', reason: 'SEO for technical docs' },
    ],
  },
  'test-automation-expert': {
    category: 'Code Quality & Testing',
    tags: ['testing', 'jest', 'playwright', 'tdd', 'coverage'],
    pairsWith: [
      { skill: 'refactoring-surgeon', reason: 'Tests before refactoring' },
      { skill: 'devops-automator', reason: 'CI/CD test integration' },
    ],
  },
  'typography-expert': {
    category: 'Design & Creative',
    tags: ['typography', 'fonts', 'type-scale', 'variable-fonts', 'opentype'],
    pairsWith: [
      { skill: 'design-system-creator', reason: 'Typography in design systems' },
      { skill: 'web-design-expert', reason: 'Typography for web projects' },
    ],
  },
  'vaporwave-glassomorphic-ui-designer': {
    category: 'Design & Creative',
    tags: ['vaporwave', 'glassmorphism', 'swiftui', 'retro-futuristic', 'neon'],
    pairsWith: [
      { skill: 'native-app-designer', reason: 'Implement aesthetic in real apps' },
      { skill: 'color-theory-palette-harmony-expert', reason: 'Vaporwave color palettes' },
    ],
  },
  'vibe-matcher': {
    category: 'Design & Creative',
    tags: ['vibes', 'brand', 'aesthetic', 'synesthesia', 'mood'],
    pairsWith: [
      { skill: 'web-design-expert', reason: 'Apply matched vibes to designs' },
      { skill: 'color-theory-palette-harmony-expert', reason: 'Color for mood translation' },
    ],
  },
  'voice-audio-engineer': {
    category: 'Design & Creative',
    tags: ['voice', 'tts', 'elevenlabs', 'podcast', 'synthesis'],
    pairsWith: [
      { skill: 'sound-engineer', reason: 'Full audio production pipeline' },
      { skill: 'speech-pathology-ai', reason: 'Clinical voice applications' },
    ],
  },
  'vr-avatar-engineer': {
    category: 'AI & Machine Learning',
    tags: ['vr', 'avatar', 'facial-tracking', 'vision-pro', 'metaverse'],
    pairsWith: [
      { skill: 'metal-shader-expert', reason: 'GPU-accelerated avatar rendering' },
      { skill: 'physics-rendering-expert', reason: 'Avatar physics simulation' },
    ],
  },
  'web-design-expert': {
    category: 'Design & Creative',
    tags: ['web', 'brand', 'ui-ux', 'layout', 'visual-design'],
    pairsWith: [
      { skill: 'typography-expert', reason: 'Typography for web designs' },
      { skill: 'color-theory-palette-harmony-expert', reason: 'Color palettes for web' },
    ],
  },
  'webapp-testing': {
    category: 'Code Quality & Testing',
    tags: ['playwright', 'e2e', 'browser', 'automation', 'ui-testing'],
    pairsWith: [
      { skill: 'test-automation-expert', reason: 'Comprehensive testing strategy' },
      { skill: 'site-reliability-engineer', reason: 'Validate deployed web apps' },
    ],
  },
  'wedding-immortalist': {
    category: 'AI & Machine Learning',
    tags: ['wedding', '3dgs', 'gaussian-splatting', 'face-clustering', 'memories'],
    pairsWith: [
      { skill: 'photo-content-recognition-curation-expert', reason: 'Curate wedding photos' },
      { skill: 'event-detection-temporal-intelligence-expert', reason: 'Detect wedding events' },
    ],
  },
  'windows-3-1-web-designer': {
    category: 'Design & Creative',
    tags: ['retro', 'windows', '90s', 'beveled', 'nostalgia'],
    pairsWith: [
      { skill: 'web-design-expert', reason: 'Apply retro aesthetic to modern web' },
      { skill: 'native-app-designer', reason: 'Retro desktop app styling' },
    ],
  },
  'wisdom-accountability-coach': {
    category: 'Lifestyle & Personal',
    tags: ['accountability', 'stoicism', 'buddhism', 'growth', 'philosophy'],
    pairsWith: [
      { skill: 'jungian-psychologist', reason: 'Psychological depth for growth' },
      { skill: 'adhd-daily-planner', reason: 'Daily accountability structure' },
    ],
  },
};

// =============================================================================
// SKILL.MD UPDATER
// =============================================================================

function updateSkillFile(skillPath: string, enrichment: SkillEnrichment): void {
  const skillMdPath = path.join(skillPath, 'SKILL.md');

  if (!fs.existsSync(skillMdPath)) {
    console.log(`  ⚠️  SKILL.md not found: ${skillMdPath}`);
    return;
  }

  const content = fs.readFileSync(skillMdPath, 'utf-8');

  // Parse existing frontmatter
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    console.log(`  ⚠️  No frontmatter found: ${skillMdPath}`);
    return;
  }

  const existingFrontmatter = yaml.parse(match[1]);
  const body = match[2];

  // Merge enrichment data
  const updatedFrontmatter = {
    ...existingFrontmatter,
    category: enrichment.category,
    tags: enrichment.tags,
    'pairs-with': enrichment.pairsWith,
  };

  // Format as YAML
  const yamlStr = yaml.stringify(updatedFrontmatter, {
    lineWidth: 0,
    defaultKeyType: 'PLAIN',
  });

  // Write updated file
  const updatedContent = `---\n${yamlStr.trim()}\n---\n${body}`;
  fs.writeFileSync(skillMdPath, updatedContent, 'utf-8');
}

// =============================================================================
// MAIN
// =============================================================================

async function main() {
  const skillsDir = path.resolve(__dirname, '../../.claude/skills');

  // Alternative path if running from website/scripts
  const altSkillsDir = path.resolve(__dirname, '../../../.claude/skills');
  const actualDir = fs.existsSync(skillsDir) ? skillsDir : altSkillsDir;

  if (!fs.existsSync(actualDir)) {
    console.error('Skills directory not found:', actualDir);
    process.exit(1);
  }

  console.log('🔧 Enriching skills with categories, tags, and pairings...\n');

  const entries = fs.readdirSync(actualDir, { withFileTypes: true });
  let updated = 0;
  let skipped = 0;
  let missing = 0;

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const skillId = entry.name;
    const enrichment = SKILL_ENRICHMENTS[skillId];

    if (!enrichment) {
      console.log(`  ❓ No enrichment data for: ${skillId}`);
      missing++;
      continue;
    }

    const skillPath = path.join(actualDir, skillId);
    console.log(`  ✏️  Updating: ${skillId}`);
    updateSkillFile(skillPath, enrichment);
    updated++;
  }

  console.log(`\n✅ Done!`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Missing enrichment data: ${missing}`);
  console.log(`   Skipped: ${skipped}`);

  if (missing > 0) {
    console.log(`\n⚠️  Add enrichment data for missing skills in this script.`);
  }
}

main().catch(console.error);
