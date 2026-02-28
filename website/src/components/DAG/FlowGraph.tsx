/**
 * FlowGraph — React Flow backed DAG visualization with Win31 aesthetics.
 *
 * Uses BrowserOnly to prevent SSR failures since @xyflow/react requires DOM APIs.
 */

import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import type { DAG, DAGNode as DAGNodeType, NodeId } from '@site/src/dag/types';
import styles from './FlowGraph.module.css';

// --------------------------------------------------------------------------
// Layout helpers
// --------------------------------------------------------------------------

const NODE_W = 180;
const NODE_H = 76;
const H_GAP = 50;
const V_GAP = 90;

function computeLayeredLayout(
  dag: DAG
): Map<string, { x: number; y: number }> {
  const nodes = Array.from(dag.nodes.values());
  const levels = new Map<string, number>();

  for (const n of nodes) levels.set(n.id as string, 0);

  let changed = true;
  while (changed) {
    changed = false;
    for (const n of nodes) {
      const id = n.id as string;
      for (const dep of n.dependencies) {
        const depLevel = levels.get(dep as string) ?? 0;
        if (depLevel + 1 > (levels.get(id) ?? 0)) {
          levels.set(id, depLevel + 1);
          changed = true;
        }
      }
    }
  }

  const byLevel = new Map<number, string[]>();
  for (const [id, lvl] of levels) {
    if (!byLevel.has(lvl)) byLevel.set(lvl, []);
    byLevel.get(lvl)!.push(id);
  }

  const positions = new Map<string, { x: number; y: number }>();
  for (const [lvl, ids] of byLevel) {
    const rowW = ids.length * NODE_W + (ids.length - 1) * H_GAP;
    ids.forEach((id, i) => {
      positions.set(id, {
        x: i * (NODE_W + H_GAP) - rowW / 2,
        y: lvl * (NODE_H + V_GAP),
      });
    });
  }
  return positions;
}

// --------------------------------------------------------------------------
// Status colours
// --------------------------------------------------------------------------

const STATUS_BG: Record<string, string> = {
  pending: '#808080',
  ready: '#000080',
  running: '#a06000',
  completed: '#007040',
  failed: '#a00000',
  skipped: '#606060',
  cancelled: '#606060',
};

// --------------------------------------------------------------------------
// Data converters: DAG → React Flow nodes/edges
// --------------------------------------------------------------------------

function dagToFlowData(dag: DAG, positions: Map<string, { x: number; y: number }>) {
  const rfNodes = Array.from(dag.nodes.values()).map((n) => {
    const pos = positions.get(n.id as string) ?? { x: 0, y: 0 };
    return {
      id: n.id as string,
      type: 'win31',
      position: pos,
      data: { node: n },
    };
  });

  const rfEdges: Array<{
    id: string;
    source: string;
    target: string;
    animated: boolean;
    style: React.CSSProperties;
  }> = [];
  for (const n of dag.nodes.values()) {
    for (const dep of n.dependencies) {
      rfEdges.push({
        id: `${dep as string}->${n.id as string}`,
        source: dep as string,
        target: n.id as string,
        animated: n.state.status === 'running',
        style: { stroke: '#000000', strokeWidth: 2 },
      });
    }
  }

  return { rfNodes, rfEdges };
}

// --------------------------------------------------------------------------
// Inner component (browser-only)
// --------------------------------------------------------------------------

export interface FlowGraphProps {
  dag: DAG;
  onNodeSelect?: (nodeId: string | null) => void;
}

function FlowGraphInner({ dag, onNodeSelect }: FlowGraphProps) {
  // Dynamic require — only runs inside BrowserOnly
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const rf = require('@xyflow/react') as typeof import('@xyflow/react');
  const { ReactFlow, Background, Controls, useNodesState, useEdgesState, Handle, Position } = rf;

  const positions = React.useMemo(() => computeLayeredLayout(dag), [dag]);
  const { rfNodes: initialNodes, rfEdges: initialEdges } = React.useMemo(
    () => dagToFlowData(dag, positions),
    [dag, positions]
  );

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  // Custom Win31 node
  const Win31Node = React.useCallback(
    ({ data }: { data: { node: DAGNodeType } }) => {
      const n = data.node;
      const statusBg = STATUS_BG[n.state.status] ?? STATUS_BG.pending;
      const label = n.name || n.skillId || n.id;
      const icon =
        n.type === 'skill' ? '⚙️' :
        n.type === 'agent' ? '🤖' :
        n.type === 'mcp-tool' ? '🔧' :
        n.type === 'composite' ? '📦' :
        n.type === 'conditional' ? '🔀' : '⬡';

      return (
        <div className={styles.win31Node} style={{ width: NODE_W }}>
          {/* Input handle */}
          <Handle type="target" position={Position.Top} style={{ background: '#000000', width: 10, height: 10 }} />

          {/* Title bar */}
          <div className={styles.win31NodeTitle} style={{ background: statusBg }}>
            <span>{icon} {n.type}</span>
            <span className={styles.win31NodeStatus}>{n.state.status}</span>
          </div>

          {/* Body */}
          <div className={styles.win31NodeBody}>
            <div className={styles.win31NodeLabel}>{label}</div>
            {n.description && (
              <div className={styles.win31NodeDesc}>{n.description}</div>
            )}
            {n.config.model && (
              <div className={styles.win31NodeMeta}>{n.config.model}</div>
            )}
          </div>

          {/* Output handle */}
          <Handle type="source" position={Position.Bottom} style={{ background: '#000000', width: 10, height: 10 }} />
        </div>
      );
    },
    []
  );

  const nodeTypes = React.useMemo(() => ({ win31: Win31Node }), [Win31Node]);

  return (
    <div className={styles.flowContainer}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onNodeClick={(_: unknown, node: { id: string }) => onNodeSelect?.(node.id)}
        onPaneClick={() => onNodeSelect?.(null)}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.3}
        maxZoom={2}
        deleteKeyCode={null}
        style={{ background: '#c0c0c0' }}
      >
        <Background color="#a0a0a0" gap={16} size={1} />
        <Controls style={{ background: '#c0c0c0', border: '2px solid #808080' }} />
      </ReactFlow>
    </div>
  );
}

// --------------------------------------------------------------------------
// Public component (SSR safe)
// --------------------------------------------------------------------------

export function FlowGraph(props: FlowGraphProps): React.ReactElement {
  return (
    <BrowserOnly
      fallback={
        <div className={styles.flowContainer}>
          <div className={styles.flowPlaceholder}>Loading graph…</div>
        </div>
      }
    >
      {() => <FlowGraphInner {...props} />}
    </BrowserOnly>
  );
}

export default FlowGraph;
