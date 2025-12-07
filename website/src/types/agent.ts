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
  active: { label: 'Active', color: '#166534', bg: '#dcfce7', glow: '#22c55e' },
  idle: { label: 'Idle', color: '#6b7280', bg: '#f3f4f6', glow: '#9ca3af' },
  creating: { label: 'Creating...', color: '#7c3aed', bg: '#ede9fe', glow: '#a78bfa' },
};

/**
 * Badge configuration for display
 */
export const AGENT_BADGE_CONFIG: Record<AgentBadge, { label: string; color: string; bg: string }> = {
  FOUNDING: { label: 'Founding Council', color: '#92400e', bg: '#fef3c7' },
  NEW: { label: 'New', color: '#166534', bg: '#dcfce7' },
  ACTIVE: { label: 'Active', color: '#1d4ed8', bg: '#dbeafe' },
};
