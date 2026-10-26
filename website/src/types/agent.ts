/**
 * Agent type definition for the Founding Council
 * These are meta-orchestrating agents that create and manage skills
 */
export type AgentBadge = 'FOUNDING' | 'NEW' | 'ACTIVE';

export type AgentStatus = 'active' | 'idle' | 'creating';

/**
 * Tools an agent can use
 */
export type AgentTool =
  | 'Read'
  | 'Write'
  | 'Edit'
  | 'Glob'
  | 'Grep'
  | 'Bash'
  | 'Task'
  | 'WebFetch'
  | 'WebSearch'
  | 'TodoWrite';

/**
 * Coordination relationship between agents
 */
export interface AgentCoordination {
  agentId: string;
  relationship: 'collaborates' | 'feeds' | 'reviews' | 'coordinates';
}

/**
 * Output types an agent can produce
 */
export interface AgentOutput {
  type: string;
  description: string;
}

/**
 * Main Agent interface
 */
export interface Agent {
  id: string;
  name: string;
  role: string;
  emoji: string;
  description: string;
  longDescription?: string;

  // Core capabilities
  triggers: string[];
  allowedTools: AgentTool[];
  coordinatesWith: string[]; // agent IDs
  outputs: string[];

  // Philosophy/Identity
  beliefs: string[];
  pledge?: string;

  // Status
  status: AgentStatus;
  badge?: AgentBadge;

  // Metadata
  createdDate: string;
  lastActive?: string;

  // Stats (for visualization)
  skillsCreated?: number;
  agentsSpawned?: number;
  tasksCompleted?: number;
}

/**
 * Agent categories for filtering
 */
export const AGENT_ROLES = [
  'all',
  'Orchestration',
  'Infrastructure',
  'Knowledge',
  'Intelligence',
  'Communication',
  'Visualization',
] as const;

export type AgentRole = (typeof AGENT_ROLES)[number];

/**
 * Status configuration for display
 */
export const AGENT_STATUS_CONFIG: Record<AgentStatus, { label: string; color: string; bg: string; glow: string }> = {
  active: { label: 'Active', color: 'var(--theme-success)', bg: 'var(--theme-success-surface)', glow: '#22c55e' },
  idle: { label: 'Idle', color: 'var(--theme-info)', bg: 'var(--theme-info-surface)', glow: '#9ca3af' },
  creating: { label: 'Creating...', color: 'var(--theme-info)', bg: 'var(--theme-info-surface)', glow: '#a78bfa' },
};

/**
 * Badge configuration for display
 */
export const AGENT_BADGE_CONFIG: Record<AgentBadge, { label: string; color: string; bg: string }> = {
  FOUNDING: { label: 'Founding Council', color: 'var(--theme-warning)', bg: 'var(--theme-warning-surface)' },
  NEW: { label: 'New', color: 'var(--theme-success)', bg: 'var(--theme-success-surface)' },
  ACTIVE: { label: 'Active', color: 'var(--theme-info)', bg: 'var(--theme-info-surface)' },
};
