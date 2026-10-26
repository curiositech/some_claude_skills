/**
 * DAGGraph Component
 *
 * Renders a complete DAG visualization with nodes and edges.
 * Uses SVG for rendering with automatic layout calculation.
 */

import React, { useMemo, useState, useCallback } from 'react';
import type { DAG, DAGNode as DAGNodeType, NodeId } from '@site/src/dag/types';
import { DAGNode } from './DAGNode';
import styles from './DAGGraph.module.css';

export interface DAGGraphProps {
  /** The DAG to visualize */
  dag: DAG;
  /** Width of the graph container */
  width?: number;
  /** Height of the graph container */
  height?: number;
  /** Node size */
  nodeSize?: 'small' | 'medium' | 'large';
  /** Callback when a node is selected */
  onNodeSelect?: (nodeId: string | null) => void;
  /** Callback when a node is double-clicked */
  onNodeEdit?: (nodeId: string) => void;
  /** Show node details panel */
  showDetails?: boolean;
  /** Layout direction */
  direction?: 'horizontal' | 'vertical';
  /** Enable zoom and pan */
  interactive?: boolean;
}

interface NodePosition {
  x: number;
  y: number;
  level: number;
}

const NODE_DIMENSIONS = {
  small: { width: 120, height: 60 },
  medium: { width: 160, height: 80 },
  large: { width: 200, height: 100 },
};

/**
 * Calculate node positions using topological levels
 */
function calculateLayout(
  dag: DAG,
  nodeSize: 'small' | 'medium' | 'large',
  direction: 'horizontal' | 'vertical'
): Map<string, NodePosition> {
  const positions = new Map<string, NodePosition>();
  const dims = NODE_DIMENSIONS[nodeSize];

  // Calculate levels using topological ordering
  const levels = new Map<string, number>();
  const nodes = Array.from(dag.nodes.values());

  // Initialize all nodes at level 0
  for (const node of nodes) {
    levels.set(node.id as string, 0);
  }

  // Calculate max level for each node based on dependencies
  let changed = true;
  while (changed) {
    changed = false;
    for (const node of nodes) {
      const nodeId = node.id as string;
      for (const depId of node.dependencies) {
        const depLevel = levels.get(depId as string) ?? 0;
        const currentLevel = levels.get(nodeId) ?? 0;
        if (depLevel + 1 > currentLevel) {
          levels.set(nodeId, depLevel + 1);
          changed = true;
        }
      }
    }
  }

  // Group nodes by level
  const levelGroups = new Map<number, string[]>();
  for (const [nodeId, level] of levels) {
    if (!levelGroups.has(level)) {
      levelGroups.set(level, []);
    }
    levelGroups.get(level)!.push(nodeId);
  }

  // Calculate positions
  const horizontalGap = dims.width + 60;
  const verticalGap = dims.height + 40;

  for (const [level, nodeIds] of levelGroups) {
    const totalNodes = nodeIds.length;

    for (let i = 0; i < nodeIds.length; i++) {
      const nodeId = nodeIds[i];

      // Center nodes vertically within their level
      const offset = (i - (totalNodes - 1) / 2);

      if (direction === 'horizontal') {
        positions.set(nodeId, {
          x: level * horizontalGap + 40,
          y: offset * verticalGap + 200,
          level,
        });
      } else {
        positions.set(nodeId, {
          x: offset * horizontalGap + 400,
          y: level * verticalGap + 40,
          level,
        });
      }
    }
  }

  return positions;
}

/**
 * Generate edge path between two nodes
 */
function getEdgePath(
  from: NodePosition,
  to: NodePosition,
  nodeSize: 'small' | 'medium' | 'large',
  direction: 'horizontal' | 'vertical'
): string {
  const dims = NODE_DIMENSIONS[nodeSize];

  let startX: number, startY: number, endX: number, endY: number;

  if (direction === 'horizontal') {
    startX = from.x + dims.width;
    startY = from.y + dims.height / 2;
    endX = to.x;
    endY = to.y + dims.height / 2;
  } else {
    startX = from.x + dims.width / 2;
    startY = from.y + dims.height;
    endX = to.x + dims.width / 2;
    endY = to.y;
  }

  // Use bezier curve for smooth edges
  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;

  if (direction === 'horizontal') {
    return `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;
  } else {
    return `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`;
  }
}

export function DAGGraph({
  dag,
  width = 800,
  height = 600,
  nodeSize = 'medium',
  onNodeSelect,
  onNodeEdit,
  showDetails = true,
  direction = 'horizontal',
  interactive = true,
}: DAGGraphProps): React.ReactElement {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Calculate node positions
  const positions = useMemo(
    () => calculateLayout(dag, nodeSize, direction),
    [dag, nodeSize, direction]
  );

  // Generate edges
  const edges = useMemo(() => {
    const edgeList: Array<{
      from: string;
      to: string;
      path: string;
      fromStatus: DAGNodeType['state']['status'];
      toStatus: DAGNodeType['state']['status'];
    }> = [];

    for (const node of dag.nodes.values()) {
      const toPos = positions.get(node.id as string);
      if (!toPos) continue;

      for (const depId of node.dependencies) {
        const fromPos = positions.get(depId as string);
        if (!fromPos) continue;

        const fromNode = dag.nodes.get(depId as NodeId);

        edgeList.push({
          from: depId as string,
          to: node.id as string,
          path: getEdgePath(fromPos, toPos, nodeSize, direction),
          fromStatus: fromNode?.state.status ?? 'pending',
          toStatus: node.state.status,
        });
      }
    }

    return edgeList;
  }, [dag, positions, nodeSize, direction]);

  // Calculate viewBox
  const viewBox = useMemo(() => {
    let minX = 0, minY = 0, maxX = width, maxY = height;
    const dims = NODE_DIMENSIONS[nodeSize];

    for (const pos of positions.values()) {
      minX = Math.min(minX, pos.x - 20);
      minY = Math.min(minY, pos.y - 20);
      maxX = Math.max(maxX, pos.x + dims.width + 20);
      maxY = Math.max(maxY, pos.y + dims.height + 20);
    }

    return { minX, minY, width: maxX - minX + 40, height: maxY - minY + 40 };
  }, [positions, nodeSize, width, height]);

  const handleNodeClick = useCallback((nodeId: string) => {
    setSelectedNodeId(prev => prev === nodeId ? null : nodeId);
    onNodeSelect?.(nodeId);
  }, [onNodeSelect]);

  const handleNodeDoubleClick = useCallback((nodeId: string) => {
    onNodeEdit?.(nodeId);
  }, [onNodeEdit]);

  const handleBackgroundClick = useCallback(() => {
    setSelectedNodeId(null);
    onNodeSelect?.(null);
  }, [onNodeSelect]);

  // Pan handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!interactive) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
  }, [interactive, transform]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    setTransform(prev => ({
      ...prev,
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    }));
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Zoom handler
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!interactive) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setTransform(prev => ({
      ...prev,
      scale: Math.max(0.25, Math.min(2, prev.scale * delta)),
    }));
  }, [interactive]);

  // Get edge color based on status
  const getEdgeColor = (fromStatus: string, toStatus: string) => {
    if (fromStatus === 'completed' && toStatus === 'completed') return 'var(--theme-success)';
    if (fromStatus === 'completed' && toStatus === 'running') return 'var(--theme-warning)';
    if (fromStatus === 'failed' || toStatus === 'failed') return 'var(--theme-danger)';
    if (fromStatus === 'completed') return 'var(--theme-info)';
    return 'var(--theme-border)';
  };

  const selectedNode = selectedNodeId ? dag.nodes.get(selectedNodeId as NodeId) : null;

  return (
    <div className={styles.container}>
      {/* Graph header */}
      <div className={styles.header}>
        <div className={styles.title}>
          <span className={styles.icon}>📊</span>
          {dag.name}
        </div>
        <div className={styles.stats}>
          <span>{dag.nodes.size} nodes</span>
          <span>•</span>
          <span>{edges.length} edges</span>
        </div>
      </div>

      {/* SVG Canvas */}
      <svg
        className={styles.canvas}
        width={width}
        height={height}
        viewBox={`${viewBox.minX} ${viewBox.minY} ${viewBox.width} ${viewBox.height}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onClick={handleBackgroundClick}
      >
        {/* Grid background */}
        <defs>
          <pattern
            id="grid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="var(--theme-border)"
              strokeOpacity={0.15}
              strokeWidth="1"
            />
          </pattern>

          {/* Arrow marker for edges */}
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill="var(--theme-border)"
            />
          </marker>
          <marker
            id="arrowhead-active"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill="var(--theme-success)"
            />
          </marker>
        </defs>

        <rect
          x={viewBox.minX}
          y={viewBox.minY}
          width={viewBox.width}
          height={viewBox.height}
          fill="url(#grid)"
        />

        {/* Transform group for pan/zoom */}
        <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}>
          {/* Edges */}
          <g className={styles.edges}>
            {edges.map((edge, i) => (
              <path
                key={`${edge.from}-${edge.to}-${i}`}
                d={edge.path}
                fill="none"
                stroke={getEdgeColor(edge.fromStatus, edge.toStatus)}
                strokeWidth={2}
                markerEnd={edge.fromStatus === 'completed' ? 'url(#arrowhead-active)' : 'url(#arrowhead)'}
                className={styles.edge}
              />
            ))}
          </g>

          {/* Nodes */}
          <g className={styles.nodes}>
            {Array.from(dag.nodes.values()).map((node) => {
              const pos = positions.get(node.id as string);
              if (!pos) return null;

              return (
                <DAGNode
                  key={node.id as string}
                  node={node}
                  position={pos}
                  selected={selectedNodeId === node.id}
                  onClick={handleNodeClick}
                  onDoubleClick={handleNodeDoubleClick}
                  size={nodeSize}
                />
              );
            })}
          </g>
        </g>
      </svg>

      {/* Node details panel */}
      {showDetails && selectedNode && (
        <div className={styles.detailsPanel}>
          <div className={styles.detailsHeader}>
            <span>Node Details</span>
            <button
              className={styles.closeButton}
              onClick={() => setSelectedNodeId(null)}
            >
              ×
            </button>
          </div>
          <div className={styles.detailsContent}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>ID:</span>
              <span className={styles.detailValue}>{selectedNode.id}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Type:</span>
              <span className={styles.detailValue}>{selectedNode.type}</span>
            </div>
            {selectedNode.skillId && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Skill:</span>
                <span className={styles.detailValue}>{selectedNode.skillId}</span>
              </div>
            )}
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Status:</span>
              <span className={styles.detailValue}>{selectedNode.state.status}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Dependencies:</span>
              <span className={styles.detailValue}>
                {selectedNode.dependencies.length > 0
                  ? selectedNode.dependencies.join(', ')
                  : 'None'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      {interactive && (
        <div className={styles.controls}>
          <button
            className={styles.controlButton}
            onClick={() => setTransform({ x: 0, y: 0, scale: 1 })}
            title="Reset view"
          >
            🔄
          </button>
          <button
            className={styles.controlButton}
            onClick={() => setTransform(prev => ({ ...prev, scale: prev.scale * 1.2 }))}
            title="Zoom in"
          >
            +
          </button>
          <button
            className={styles.controlButton}
            onClick={() => setTransform(prev => ({ ...prev, scale: prev.scale * 0.8 }))}
            title="Zoom out"
          >
            −
          </button>
        </div>
      )}

      {/* Legend */}
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: 'var(--theme-muted)' }} />
          <span>Pending</span>
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: 'var(--theme-info)' }} />
          <span>Ready</span>
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: 'var(--theme-warning)' }} />
          <span>Running</span>
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: 'var(--theme-success)' }} />
          <span>Completed</span>
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: 'var(--theme-danger)' }} />
          <span>Failed</span>
        </div>
      </div>
    </div>
  );
}

export default DAGGraph;
