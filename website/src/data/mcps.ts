import type { McpServer } from '../types/mcp';

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
    githubUrl: 'https://github.com/erichowens/prompt-learning-mcp',
    docsUrl: '/docs/guides/prompt-learning-mcp',
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
    heroImage: '/img/mcps/prompt-learning-hero.png',
    icon: '🧠',
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
