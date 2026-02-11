/**
 * SKILL TAXONOMY - Meaningful Categories for 170+ Skills
 * 
 * Instead of putting everything in "development", we create
 * logical groupings that help users discover relevant skills.
 */

export type SkillCategory =
  | 'ai-agents'        // AI, LLMs, agents, orchestration
  | 'design-ux'        // Design, UX, UI, typography, colors
  | 'web-frontend'     // Web development, React, Next.js
  | 'backend-infra'    // Backend, DevOps, databases
  | 'audio-media'      // Audio, video, visualization
  | 'career-personal'  // Career, productivity, personal
  | 'health-wellness'  // Health, recovery, mental health
  | 'testing-quality'  // Testing, code review, quality
  | 'data-analytics'   // Data pipelines, visualization
  | 'writing-docs';    // Documentation, writing, research

export interface CategoryMeta {
  label: string;
  icon: string;
  emoji: string;
  description: string;
  color: string;
}

export const categoryMeta: Record<SkillCategory, CategoryMeta> = {
  'ai-agents': {
    label: 'AI & Agents',
    icon: '🤖',
    emoji: '🤖',
    description: 'AI engineering, LLM orchestration, and autonomous agents',
    color: '#00FFFF'
  },
  'design-ux': {
    label: 'Design & UX',
    icon: '🎨',
    emoji: '🎨',
    description: 'Visual design, user experience, and creative tools',
    color: '#FF69B4'
  },
  'web-frontend': {
    label: 'Web & Frontend',
    icon: '🌐',
    emoji: '🌐',
    description: 'Modern web development, React, Next.js, and UI',
    color: '#00FF00'
  },
  'backend-infra': {
    label: 'Backend & Infra',
    icon: '⚙️',
    emoji: '⚙️',
    description: 'APIs, databases, DevOps, and cloud infrastructure',
    color: '#FFA500'
  },
  'audio-media': {
    label: 'Audio & Media',
    icon: '🎵',
    emoji: '🎵',
    description: 'Audio engineering, video production, and visualization',
    color: '#FF00FF'
  },
  'career-personal': {
    label: 'Career & Personal',
    icon: '📈',
    emoji: '📈',
    description: 'Career development, productivity, and personal growth',
    color: '#FFD700'
  },
  'health-wellness': {
    label: 'Health & Wellness',
    icon: '💚',
    emoji: '💚',
    description: 'Mental health, recovery support, and wellness tools',
    color: '#90EE90'
  },
  'testing-quality': {
    label: 'Testing & Quality',
    icon: '🧪',
    emoji: '🧪',
    description: 'Testing frameworks, code review, and quality assurance',
    color: '#87CEEB'
  },
  'data-analytics': {
    label: 'Data & Analytics',
    icon: '📊',
    emoji: '📊',
    description: 'Data pipelines, visualization, and analytics',
    color: '#DDA0DD'
  },
  'writing-docs': {
    label: 'Writing & Docs',
    icon: '✍️',
    emoji: '✍️',
    description: 'Technical writing, documentation, and research',
    color: '#F5DEB3'
  }
};

/**
 * Maps skill IDs to their proper categories based on content analysis
 */
export const skillCategoryMap: Record<string, SkillCategory> = {
  // AI & Agents
  'ai-engineer': 'ai-agents',
  'agent-creator': 'ai-agents',
  'orchestrator': 'ai-agents',
  'mcp-creator': 'ai-agents',
  'prompt-engineer': 'ai-agents',
  'automatic-stateful-prompt-improver': 'ai-agents',
  'llm-streaming-response-handler': 'ai-agents',
  'clip-aware-embeddings': 'ai-agents',
  'dag-capability-ranker': 'ai-agents',
  'dag-confidence-scorer': 'ai-agents',
  'dag-context-bridger': 'ai-agents',
  'dag-convergence-monitor': 'ai-agents',
  'dag-dependency-resolver': 'ai-agents',
  'dag-dynamic-replanner': 'ai-agents',
  'dag-execution-tracer': 'ai-agents',
  'dag-executor': 'ai-agents',
  'dag-failure-analyzer': 'ai-agents',
  'dag-feedback-synthesizer': 'ai-agents',
  'dag-graph-builder': 'ai-agents',
  'dag-hallucination-detector': 'ai-agents',
  'dag-isolation-manager': 'ai-agents',
  'dag-iteration-detector': 'ai-agents',
  'dag-output-validator': 'ai-agents',
  'dag-parallel-executor': 'ai-agents',
  'dag-pattern-learner': 'ai-agents',
  'dag-performance-profiler': 'ai-agents',
  'dag-permission-validator': 'ai-agents',
  'dag-result-aggregator': 'ai-agents',
  'dag-scope-enforcer': 'ai-agents',
  'dag-semantic-matcher': 'ai-agents',
  'dag-skill-registry': 'ai-agents',
  'dag-task-scheduler': 'ai-agents',
  'dag-visual-editor-design': 'ai-agents',
  'execution-lifecycle-manager': 'ai-agents',
  'chatbot-analytics': 'ai-agents',
  'vibe-matcher': 'ai-agents',

  // Design & UX
  'design-system-creator': 'design-ux',
  'design-system-generator': 'design-ux',
  'design-archivist': 'design-ux',
  'design-critic': 'design-ux',
  'design-justice': 'design-ux',
  'adhd-design-expert': 'design-ux',
  'ux-friction-analyzer': 'design-ux',
  'typography-expert': 'design-ux',
  'color-contrast-auditor': 'design-ux',
  'color-theory-palette-harmony-expert': 'design-ux',
  'dark-mode-design-expert': 'design-ux',
  'neobrutalist-web-designer': 'design-ux',
  'vaporwave-glassomorphic-ui-designer': 'design-ux',
  'web-design-expert': 'design-ux',
  'web-wave-designer': 'design-ux',
  'web-cloud-designer': 'design-ux',
  'web-weather-creator': 'design-ux',
  'mobile-ux-optimizer': 'design-ux',
  'native-app-designer': 'design-ux',
  'interior-design-expert': 'design-ux',
  'fancy-yard-landscaper': 'design-ux',
  'maximalist-wall-decorator': 'design-ux',
  'product-appeal-analyzer': 'design-ux',
  'collage-layout-expert': 'design-ux',
  'photo-composition-critic': 'design-ux',
  'pixel-art-infographic-creator': 'design-ux',
  'hand-drawn-infographic-creator': 'design-ux',
  'diagramming-expert': 'design-ux',
  'win31-audio-design': 'design-ux',
  'win31-pixel-art-designer': 'design-ux',
  'windows-3-1-web-designer': 'design-ux',
  'windows-95-web-designer': 'design-ux',

  // Web & Frontend
  'nextjs-app-router-expert': 'web-frontend',
  'react-performance-optimizer': 'web-frontend',
  'frontend-architect': 'web-frontend',
  'pwa-expert': 'web-frontend',
  'form-validation-architect': 'web-frontend',
  'real-time-collaboration-engine': 'web-frontend',
  'reactive-dashboard-performance': 'web-frontend',
  'admin-dashboard': 'web-frontend',
  'mdx-sanitizer': 'web-frontend',

  // Backend & Infrastructure
  'api-architect': 'backend-infra',
  'rest-api-design': 'backend-infra',
  'openapi-spec-writer': 'backend-infra',
  'cloudflare-worker-dev': 'backend-infra',
  'vercel-deployment': 'backend-infra',
  'devops-automator': 'backend-infra',
  'terraform-iac-expert': 'backend-infra',
  'github-actions-pipeline-builder': 'backend-infra',
  'site-reliability-engineer': 'backend-infra',
  'background-job-orchestrator': 'backend-infra',
  'supabase-admin': 'backend-infra',
  'drizzle-migrations': 'backend-infra',
  'postgresql-optimization': 'backend-infra',
  'oauth-oidc-implementer': 'backend-infra',
  'modern-auth-2026': 'backend-infra',
  'security-auditor': 'backend-infra',
  'hipaa-compliance': 'backend-infra',
  'fullstack-debugger': 'backend-infra',
  'bot-developer': 'backend-infra',

  // Audio & Media
  '2000s-visualization-expert': 'audio-media',
  'sound-engineer': 'audio-media',
  'voice-audio-engineer': 'audio-media',
  'video-processing-editing': 'audio-media',
  'ai-video-production-master': 'audio-media',
  'physics-rendering-expert': 'audio-media',
  'metal-shader-expert': 'audio-media',
  'vr-avatar-engineer': 'audio-media',
  'photo-content-recognition-curation-expert': 'audio-media',
  'computer-vision-pipeline': 'audio-media',
  'drone-cv-expert': 'audio-media',
  'drone-inspection-specialist': 'audio-media',
  'event-detection-temporal-intelligence-expert': 'audio-media',

  // Career & Personal
  'career-biographer': 'career-personal',
  'cv-creator': 'career-personal',
  'job-application-optimizer': 'career-personal',
  'adhd-daily-planner': 'career-personal',
  'project-management-guru-adhd': 'career-personal',
  'tech-entrepreneur-coach-adhd': 'career-personal',
  'personal-finance-coach': 'career-personal',
  'indie-monetization-strategist': 'career-personal',
  'team-builder': 'career-personal',
  'liaison': 'career-personal',
  'competitive-cartographer': 'career-personal',
  'launch-readiness-auditor': 'career-personal',
  'hr-network-analyst': 'career-personal',
  'email-composer': 'career-personal',
  'partner-text-coach': 'career-personal',
  'wisdom-accountability-coach': 'career-personal',
  'claude-ecosystem-promoter': 'career-personal',
  'seo-visibility-expert': 'career-personal',

  // Health & Wellness
  'recovery-app-onboarding': 'health-wellness',
  'recovery-app-legal-terms': 'health-wellness',
  'recovery-coach-patterns': 'health-wellness',
  'recovery-community-moderator': 'health-wellness',
  'recovery-education-writer': 'health-wellness',
  'recovery-social-features': 'health-wellness',
  'crisis-response-protocol': 'health-wellness',
  'crisis-detection-intervention-ai': 'health-wellness',
  'grief-companion': 'health-wellness',
  'jungian-psychologist': 'health-wellness',
  'hrv-alexithymia-expert': 'health-wellness',
  'modern-drug-rehab-computer': 'health-wellness',
  'sober-addict-protector': 'health-wellness',
  'sobriety-tools-guardian': 'health-wellness',
  'speech-pathology-ai': 'health-wellness',
  'panic-room-finder': 'health-wellness',
  'pet-memorial-creator': 'health-wellness',
  'wedding-immortalist': 'health-wellness',
  'digital-estate-planner': 'health-wellness',

  // Testing & Quality
  'playwright-e2e-tester': 'testing-quality',
  'playwright-screenshot-inspector': 'testing-quality',
  'vitest-testing-patterns': 'testing-quality',
  'test-automation-expert': 'testing-quality',
  'webapp-testing': 'testing-quality',
  'code-review-checklist': 'testing-quality',
  'code-necromancer': 'testing-quality',
  'refactoring-surgeon': 'testing-quality',
  'cost-accrual-tracker': 'testing-quality',
  'cost-verification-auditor': 'testing-quality',
  'feature-manifest': 'testing-quality',

  // Data & Analytics
  'data-pipeline-engineer': 'data-analytics',
  'data-viz-2025': 'data-analytics',
  'geospatial-data-pipeline': 'data-analytics',
  'large-scale-map-visualization': 'data-analytics',

  // Writing & Documentation
  'technical-writer': 'writing-docs',
  'skill-documentarian': 'writing-docs',
  'skill-creator': 'writing-docs',
  'skill-architect': 'writing-docs',
  'skill-coach': 'writing-docs',
  'skill-logger': 'writing-docs',
  'research-analyst': 'writing-docs',
  'document-generation-pdf': 'writing-docs',
  '2026-legal-research-agent': 'writing-docs',
  'national-expungement-expert': 'writing-docs',
  'knot-theory-educator': 'writing-docs',
  'swift-executor': 'writing-docs',  // Documentation-focused
};

/**
 * Get the proper category for a skill
 */
export function getSkillCategory(skillId: string): SkillCategory {
  return skillCategoryMap[skillId] || 'web-frontend'; // Default to web-frontend instead of development
}

/**
 * Get all skills in a category
 */
export function getSkillsInCategory(skillId: string, allSkillIds: string[]): string[] {
  const category = getSkillCategory(skillId);
  return allSkillIds.filter(id => getSkillCategory(id) === category);
}
