import type { McpServer, McpExample } from '../types/mcp';

/**
 * All MCP Servers
 * Add new MCP servers here
 */
export const ALL_MCPS: McpServer[] = [
  {
    id: 'prompt-learning-mcp',
    name: 'Prompt Learning MCP',
    description: 'Your prompts get smarter every time you use Claude. Automatic optimization using APE, OPRO, and DSPy patterns.',
    longDescription: `The Prompt Learning MCP Server creates a feedback loop that makes your prompts better over time.

It combines pattern-based improvements (instant, no API calls), LLM-based evaluation (scores on clarity, specificity, completeness), vector similarity search (learns from your best prompts), and OPRO-style iteration (generates and tests candidates).

Transform vague prompts like "Write code" into structured, specific prompts scoring 80%+ on LLM evaluation.`,
    category: 'Prompt Engineering',
    status: 'stable',
    badge: 'FEATURED',
    githubUrl: 'https://github.com/curiositech/prompt-learning-mcp',
    docsUrl: '/docs/guides/prompt-learning-mcp',
    installConfig: {
      command: 'npx',
      args: ['-y', 'github:curiositech/prompt-learning-mcp'],
      env: {
        OPENAI_API_KEY: 'your-openai-api-key',
      },
    },
    installNotes: 'Requires Docker running for Qdrant (vector DB) and Redis. Run `docker-compose up -d` in the repo first.',
    tools: [
      { name: 'optimize_prompt', description: 'Transform a vague prompt into an optimized one' },
      { name: 'record_outcome', description: 'Log whether a prompt worked (builds the learning loop)' },
      { name: 'find_similar', description: 'Find high-performing prompts similar to yours' },
      { name: 'get_suggestions', description: 'Quick suggestions without full optimization' },
    ],
    requirements: [
      'Docker (for Qdrant vector DB and Redis)',
      'Node.js 18+',
      'OpenAI API key',
    ],
    features: [
      'Pattern-based improvements (instant, no API calls)',
      'LLM-based evaluation with clarity/specificity/completeness scores',
      'Vector similarity search learns from your best prompts',
      'OPRO-style iteration generates and tests candidates',
      'Automatic feedback loop improves over time',
      'Domain-specific learning (code_review, summarization, etc.)',
    ],
    examples: [
      {
        title: 'Optimize a Vague Prompt',
        description: 'Transform a generic prompt into a structured, specific one that gets better results.',
        prompt: 'Use optimize_prompt to improve: "Write code"',
      },
      {
        title: 'Find What Works',
        description: 'Search your prompt history for high-performing prompts similar to what you need.',
        prompt: 'Use find_similar to find prompts like "code review" with min_performance 0.8',
      },
      {
        title: 'Build the Learning Loop',
        description: 'Record outcomes so the system learns what works for you.',
        prompt: 'Use record_outcome to log that my last prompt succeeded with quality_score 0.9',
      },
    ],
    heroImage: '/img/mcps/prompt-learning-hero.png',
    icon: '🧠',
    author: 'Erich Owens',
    version: '1.0.0',
    lastUpdated: '2024-11-28',
  },
  {
    id: 'cv-creator-mcp',
    name: 'CV Creator MCP',
    description: 'Resume SEO powered by AI. ATS scoring, keyword optimization, job matching, and tailoring recommendations.',
    longDescription: `CV Creator MCP brings enterprise-grade resume optimization directly to Claude.

Built after analyzing market leaders like Jobscan ($49.95/mo), Resume Worded ($49/mo), and Kickresume, this MCP implements "Resume SEO" principles - treating job descriptions like search queries and resumes like web pages.

Features:
• Job description parsing with keyword extraction (TF-IDF analysis)
• Match scoring with gap analysis (STRONG_MATCH to SKIP recommendations)
• ATS compatibility checking (formatting, structure, content, keywords)
• Tailoring suggestions at LIGHT/MEDIUM/AGGRESSIVE levels
• A/B test variant generation (technical, leadership, impact focuses)
• Cover letter generation with keyword integration
• Keyword density analysis (optimal 2-4% like web SEO)

Works with career-biographer profiles and competitive-cartographer positioning strategies.`,
    category: 'Career & Resume',
    status: 'beta',
    badge: 'NEW',
    githubUrl: 'https://github.com/curiositech/cv-creator-mcp',
    docsUrl: '/docs/guides/cv-creator-mcp',
    installConfig: {
      command: 'npx',
      args: ['-y', 'github:curiositech/cv-creator-mcp'],
    },
    installNotes: 'Optional: Install Puppeteer for PDF export. Works standalone for analysis and recommendations.',
    tools: [
      { name: 'analyze_job', description: 'Parse job descriptions for keywords, requirements, and ATS hints' },
      { name: 'score_match', description: 'Calculate candidate-job fit with gap analysis' },
      { name: 'score_ats', description: 'Run comprehensive ATS compatibility check (0-100 score)' },
      { name: 'suggest_tailoring', description: 'Generate specific resume tailoring recommendations' },
      { name: 'generate_variants', description: 'Create A/B test resume variants (technical/leadership/impact)' },
      { name: 'generate_cover_letter', description: 'Create tailored cover letter with keywords' },
      { name: 'analyze_keyword_density', description: 'Resume SEO keyword density analysis' },
      { name: 'compare_resumes', description: 'Compare multiple resume versions to pick best' },
    ],
    requirements: [
      'Node.js 18+',
      'Puppeteer (for PDF generation)',
      'Natural language processing dependencies',
    ],
    features: [
      'TF-IDF keyword extraction from job descriptions',
      'Match scoring with STRONG_MATCH to SKIP recommendations',
      'ATS compatibility scoring (0-100) with specific fixes',
      'Three tailoring levels: LIGHT, MEDIUM, AGGRESSIVE',
      'A/B test variants for different focus areas',
      'Keyword density analysis (optimal 2-4% like web SEO)',
      'Integrates with career-biographer and competitive-cartographer',
    ],
    examples: [
      {
        title: 'Analyze a Job Posting',
        description: 'Extract keywords, requirements, and ATS hints from any job description.',
        prompt: 'Use analyze_job to parse this Senior Engineer job posting: [paste job URL or text]',
      },
      {
        title: 'Check Your ATS Score',
        description: 'Get a comprehensive ATS compatibility score with specific improvement recommendations.',
        prompt: 'Use score_ats on my resume to see how it will perform with applicant tracking systems',
      },
      {
        title: 'Generate Resume Variants',
        description: 'Create multiple versions of your resume optimized for different angles.',
        prompt: 'Use generate_variants to create technical, leadership, and impact-focused versions of my resume',
      },
      {
        title: 'Tailor for Specific Job',
        description: 'Get specific recommendations to customize your resume for a target role.',
        prompt: 'Use suggest_tailoring with MEDIUM intensity for this product manager position',
      },
    ],
    heroImage: '/img/mcps/cv-creator-hero.png',
    icon: '📄',
    author: 'Erich Owens',
    version: '1.0.0',
    lastUpdated: '2024-11-28',
  },
];

/**
 * Search MCPs by query
 */
export function searchMcps(query: string, mcps: McpServer[] = ALL_MCPS): McpServer[] {
  const lowerQuery = query.toLowerCase();
  return mcps.filter(mcp =>
    mcp.name.toLowerCase().includes(lowerQuery) ||
    mcp.description.toLowerCase().includes(lowerQuery) ||
    mcp.tools.some(tool =>
      tool.name.toLowerCase().includes(lowerQuery) ||
      tool.description.toLowerCase().includes(lowerQuery)
    )
  );
}

/**
 * Filter MCPs by category
 */
export function filterMcpsByCategory(category: string, mcps: McpServer[] = ALL_MCPS): McpServer[] {
  if (category === 'all') return mcps;
  return mcps.filter(mcp => mcp.category === category);
}
