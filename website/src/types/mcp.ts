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

export interface McpExample {
  title: string;
  description: string;
  prompt?: string;
}

/**
 * Installation configuration for an MCP
 * Provides the actual JSON config users need
 */
export interface McpInstallConfig {
  command: string;
  args?: string[];
  env?: Record<string, string>;
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

  // Installation
  installConfig: McpInstallConfig;
  installNotes?: string; // e.g. "Requires Docker for Qdrant and Redis"

  // Technical details
  tools: McpTool[];
  requirements?: string[];
  features?: string[];
  examples?: McpExample[];

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
  'Career & Resume',
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
  stable: { label: 'Stable', color: 'var(--theme-success)', bg: 'var(--theme-success-surface)' },
  beta: { label: 'Beta', color: 'var(--theme-warning)', bg: 'var(--theme-warning-surface)' },
  experimental: { label: 'Experimental', color: 'var(--theme-danger)', bg: 'var(--theme-danger-surface)' },
};
