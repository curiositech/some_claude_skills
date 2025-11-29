/**
 * MCP Server type definition
 * For the MCP Gallery page
 */
export type McpBadge = 'NEW' | 'UPDATED' | 'FEATURED';

export type McpStatus = 'stable' | 'beta' | 'experimental';

export interface McpTool {
  name: string;
  description: string;
}

export interface McpServer {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  category: string;
  status: McpStatus;
  badge?: McpBadge;

  // Links
  githubUrl: string;
  docsUrl?: string;
  npmUrl?: string;

  // Technical details
  tools: McpTool[];
  requirements?: string[];

  // Visual
  heroImage?: string;
  icon?: string;

  // Metadata
  author: string;
  version?: string;
  lastUpdated?: string;
  stars?: number;
}

/**
 * Category options for MCP filtering
 */
export const MCP_CATEGORIES = [
  'all',
  'Prompt Engineering',
  'Code Quality',
  'Data & Analytics',
  'External Services',
  'Productivity',
] as const;

export type McpCategory = (typeof MCP_CATEGORIES)[number];

/**
 * Status labels and colors
 */
export const MCP_STATUS_CONFIG: Record<McpStatus, { label: string; color: string; bg: string }> = {
  stable: { label: 'Stable', color: '#166534', bg: '#dcfce7' },
  beta: { label: 'Beta', color: '#854d0e', bg: '#fef9c3' },
  experimental: { label: 'Experimental', color: '#9a3412', bg: '#ffedd5' },
};
