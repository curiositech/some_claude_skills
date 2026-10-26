/**
 * DAGNode Component
 *
 * Visual representation of a single node in a DAG execution graph.
 * Shows node type, status, and provides interaction handlers.
 */

import React from 'react';
import type { DAGNode as DAGNodeType, TaskState } from '@site/src/dag/types';
import styles from './DAGNode.module.css';

export interface DAGNodeProps {
  /** The node data */
  node: DAGNodeType;
  /** Position in the graph */
  position: { x: number; y: number };
  /** Is this node selected? */
  selected?: boolean;
  /** Click handler */
  onClick?: (nodeId: string) => void;
  /** Double-click handler (e.g., for editing) */
  onDoubleClick?: (nodeId: string) => void;
  /** Size of the node */
  size?: 'small' | 'medium' | 'large';
}

const NODE_SIZES = {
  small: { width: 120, height: 60, fontSize: 10 },
  medium: { width: 160, height: 80, fontSize: 12 },
  large: { width: 200, height: 100, fontSize: 14 },
};

const STATUS_ROLES: Record<TaskState['status'], {background: string; text: string}> = {
  pending: { background: 'var(--theme-sunken)', text: 'var(--theme-muted)' },
  ready: { background: 'var(--theme-info-surface)', text: 'var(--theme-info)' },
  running: { background: 'var(--theme-warning-surface)', text: 'var(--theme-warning)' },
  completed: { background: 'var(--theme-success-surface)', text: 'var(--theme-success)' },
  failed: { background: 'var(--theme-danger-surface)', text: 'var(--theme-danger)' },
  skipped: { background: 'var(--theme-sunken)', text: 'var(--theme-muted)' },
  cancelled: { background: 'var(--theme-sunken)', text: 'var(--theme-muted)' },
};

const NODE_TYPE_ICONS: Record<DAGNodeType['type'], string> = {
  skill: '⚙️',
  agent: '🤖',
  'mcp-tool': '🔧',
  composite: '📦',
  conditional: '🔀',
};

function getStatusLabel(state: TaskState): string {
  switch (state.status) {
    case 'pending':
      return 'Pending';
    case 'ready':
      return 'Ready';
    case 'running':
      return 'Running...';
    case 'completed':
      return 'Done';
    case 'failed':
      return 'Failed';
    case 'skipped':
      return 'Skipped';
    case 'cancelled':
      return 'Cancelled';
  }
}

export function DAGNode({
  node,
  position,
  selected = false,
  onClick,
  onDoubleClick,
  size = 'medium',
}: DAGNodeProps): React.ReactElement {
  const dimensions = NODE_SIZES[size];
  const statusRole = STATUS_ROLES[node.state.status];
  const icon = NODE_TYPE_ICONS[node.type];

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.(node.id as string);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDoubleClick?.(node.id as string);
  };

  // Extract name from node
  const nodeName = node.skillId || (node.id as string);

  return (
    <g
      transform={`translate(${position.x}, ${position.y})`}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      className={styles.nodeGroup}
    >
      {/* Shadow */}
      <rect
        x={4}
        y={4}
        width={dimensions.width}
        height={dimensions.height}
        rx={8}
        fill="#000000"
        opacity={0.15}
      />

      {/* Main node body - Win31 style */}
      <rect
        x={0}
        y={0}
        width={dimensions.width}
        height={dimensions.height}
        rx={8}
        fill="var(--theme-surface)"
        stroke={selected ? 'var(--theme-focus)' : 'var(--theme-border)'}
        strokeWidth={selected ? 3 : 2}
        className={styles.nodeBody}
      />

      {/* Title bar - Navy blue Win31 style */}
      <rect
        x={2}
        y={2}
        width={dimensions.width - 4}
        height={20}
        fill="var(--theme-titlebar)"
      />

      {/* Title text */}
      <text
        x={8}
        y={15}
        fill="var(--theme-titlebar-text)"
        fontSize={dimensions.fontSize - 2}
        fontWeight="bold"
        fontFamily="var(--font-code)"
      >
        {icon} {node.type}
      </text>

      {/* Node name */}
      <text
        x={dimensions.width / 2}
        y={dimensions.height / 2 + 2}
        textAnchor="middle"
        fill="var(--theme-text)"
        fontSize={dimensions.fontSize}
        fontWeight="bold"
        fontFamily="var(--font-code)"
      >
        {nodeName.length > 18 ? `${nodeName.slice(0, 15)}...` : nodeName}
      </text>

      {/* Status badge */}
      <g transform={`translate(${dimensions.width / 2 - 30}, ${dimensions.height - 20})`}>
        <rect
          x={0}
          y={0}
          width={60}
          height={14}
          rx={3}
          fill={statusRole.background}
        />
        <text
          x={30}
          y={10}
          textAnchor="middle"
          fill={statusRole.text}
          fontSize={9}
          fontWeight="bold"
          fontFamily="var(--font-system)"
        >
          {getStatusLabel(node.state)}
        </text>
      </g>

      {/* Running indicator (animated) */}
      {node.state.status === 'running' && (
        <g className={styles.runningIndicator}>
          <circle
            cx={dimensions.width - 12}
            cy={12}
            r={5}
            fill="#f59e0b"
          >
            <animate
              attributeName="opacity"
              values="1;0.3;1"
              dur="1s"
              repeatCount="indefinite"
            />
          </circle>
        </g>
      )}

      {/* Selection indicator */}
      {selected && (
        <rect
          x={-4}
          y={-4}
          width={dimensions.width + 8}
          height={dimensions.height + 8}
          rx={10}
          fill="none"
          stroke="var(--theme-focus)"
          strokeWidth={2}
          strokeDasharray="4,4"
        />
      )}
    </g>
  );
}

export default DAGNode;
