/**
 * DAG Visualization Component
 *
 * Displays DAG execution graphs with:
 * - Node visualization with status indicators
 * - Edge connections showing dependencies
 * - Wave grouping for parallel execution
 * - Real-time execution progress
 */

import React, { useEffect, useRef, useState } from 'react';
import styles from './DAGVisualizer.module.css';
import type { DAG, DAGNode, NodeId, TaskState } from '../../dag/types';

export interface DAGVisualizerProps {
  dag: DAG;
  executionState?: Map<NodeId, TaskState>;
  onNodeClick?: (nodeId: NodeId) => void;
  highlightCriticalPath?: boolean;
}

// Image cache for skill hero images
const imageCache = new Map<string, HTMLImageElement>();

// ============================================================================
// CONFIGURABLE CONSTANTS - Adjust these to change the layout
// ============================================================================
const NODE_WIDTH = 120;
const NODE_HEIGHT = 100;
const TITLE_BAR_HEIGHT = 18;
const HORIZONTAL_SPACING = 250; // Space between waves (columns)
const VERTICAL_SPACING = 180; // Space between nodes in a wave
const CANVAS_PADDING = 50; // Padding around the entire graph
// ============================================================================

export function DAGVisualizer({
  dag,
  executionState,
  onNodeClick,
  highlightCriticalPath = false,
}: DAGVisualizerProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredNode, setHoveredNode] = useState<NodeId | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [zoom, setZoom] = useState(1.0);
  const [autoFit, setAutoFit] = useState(true);
  const [isPanning, setIsPanning] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Preload skill hero images
  useEffect(() => {
    const loadImages = async () => {
      const promises: Promise<void>[] = [];

      for (const [_, node] of dag.nodes) {
        if (node.skillId && !imageCache.has(node.skillId)) {
          const promise = new Promise<void>((resolve) => {
            const img = new Image();
            img.onload = () => {
              imageCache.set(node.skillId!, img);
              resolve();
            };
            img.onerror = () => resolve(); // Continue even if image fails to load
            img.src = `/img/skills/${node.skillId}-hero.webp`;
          });
          promises.push(promise);
        }
      }

      await Promise.all(promises);
      setImagesLoaded(true);
    };

    loadImages();
  }, [dag]);

  useEffect(() => {
    if (!canvasRef.current || !imagesLoaded) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Draw the DAG with zoom and pan
    drawDAG(ctx, dag, executionState, hoveredNode, highlightCriticalPath, zoom, autoFit, panOffset);
  }, [dag, executionState, hoveredNode, highlightCriticalPath, imagesLoaded, zoom, autoFit, panOffset]);

  // Mouse wheel zoom - attach manually with passive: false to allow preventDefault
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      setAutoFit(false); // Disable auto-fit when manually zooming
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom(prev => Math.max(0.1, Math.min(3.0, prev + delta)));
    };

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, []);

  const handleZoomIn = () => {
    setAutoFit(false);
    setZoom(prev => Math.min(3.0, prev + 0.2));
  };

  const handleZoomOut = () => {
    setAutoFit(false);
    setZoom(prev => Math.max(0.1, prev - 0.2));
  };

  const handleResetZoom = () => {
    setZoom(1.0);
    setAutoFit(true);
    setPanOffset({ x: 0, y: 0 }); // Reset pan when resetting zoom
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsPanning(true);
    setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Update mouse position for tooltip
    setMousePos({ x: e.clientX, y: e.clientY });

    // Handle panning
    if (isPanning) {
      const newPanOffset = {
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      };
      setPanOffset(newPanOffset);
      setAutoFit(false); // Disable auto-fit when manually panning
      canvas.style.cursor = 'grabbing';
      return;
    }

    // Find node under cursor (accounting for zoom and transformations)
    const node = findNodeAtPosition(x, y, dag, zoom, autoFit, panOffset);
    setHoveredNode(node);

    // Change cursor if hovering over node
    canvas.style.cursor = node ? 'pointer' : 'grab';
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!hoveredNode || !onNodeClick) return;
    onNodeClick(hoveredNode);
  };

  return (
    <div className={styles.container}>
      <div className={styles.zoomControls}>
        <button onClick={handleZoomIn} className={styles.zoomButton} title="Zoom In">+</button>
        <button onClick={handleZoomOut} className={styles.zoomButton} title="Zoom Out">−</button>
        <button onClick={handleResetZoom} className={styles.zoomButton} title="Reset Zoom">⊙</button>
        <span className={styles.zoomLevel}>{Math.round(zoom * 100)}%</span>
      </div>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleClick}
      />
      {hoveredNode && mousePos && (
        <div className={styles.tooltip} style={{ left: `${mousePos.x + 15}px`, top: `${mousePos.y + 15}px` }}>
          {renderNodeTooltip(dag.nodes.get(hoveredNode)!, executionState?.get(hoveredNode))}
        </div>
      )}
    </div>
  );
}

/**
 * Draw the entire DAG on canvas
 */
function drawDAG(
  ctx: CanvasRenderingContext2D,
  dag: DAG,
  executionState: Map<NodeId, TaskState> | undefined,
  hoveredNode: NodeId | null,
  highlightCriticalPath: boolean,
  zoom: number,
  autoFit: boolean,
  panOffset: { x: number; y: number }
): void {
  const width = ctx.canvas.width / window.devicePixelRatio;
  const height = ctx.canvas.height / window.devicePixelRatio;

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  // Layout nodes in layers (wave-based)
  const layout = calculateLayout(dag, width, height);

  // Calculate bounding box and auto-fit scale
  const bounds = calculateBoundingBox(layout);
  let scale = zoom;

  if (autoFit && bounds) {
    // Calculate scale to fit all nodes with padding
    const scaleX = (width - 2 * CANVAS_PADDING) / bounds.width;
    const scaleY = (height - 2 * CANVAS_PADDING) / bounds.height;
    scale = Math.min(scaleX, scaleY); // Allow scaling up to fill canvas
  }

  // Save context and apply transformations
  ctx.save();

  if (autoFit && bounds) {
    // Center the graph with padding
    const scaledWidth = bounds.width * scale;
    const scaledHeight = bounds.height * scale;
    const offsetX = (width - scaledWidth) / 2 - bounds.minX * scale;
    const offsetY = (height - scaledHeight) / 2 - bounds.minY * scale;
    ctx.translate(offsetX + panOffset.x, offsetY + panOffset.y);
  } else {
    // Manual pan without auto-fit
    ctx.translate(panOffset.x, panOffset.y);
  }

  ctx.scale(scale, scale);

  // Draw edges first (behind nodes)
  drawEdges(ctx, dag, layout, executionState);

  // Draw nodes
  for (const [nodeId, position] of layout.entries()) {
    const node = dag.nodes.get(nodeId)!;
    const state = executionState?.get(nodeId);
    const isHovered = nodeId === hoveredNode;

    drawNode(ctx, nodeId, node, position, state, isHovered);
  }

  // Restore context
  ctx.restore();

  // Draw legend (unscaled, in corner)
  drawLegend(ctx, width, height);
}

/**
 * Calculate node positions using wave-based layout (left-to-right)
 */
function calculateLayout(
  dag: DAG,
  width: number,
  height: number
): Map<NodeId, { x: number; y: number }> {
  const layout = new Map<NodeId, { x: number; y: number }>();

  // Group nodes by wave (dependency depth)
  const waves = groupByWaves(dag);

  waves.forEach((nodeIds, waveIndex) => {
    // Position waves from left to right
    const waveX = waveIndex * HORIZONTAL_SPACING;

    nodeIds.forEach((nodeId, nodeIndex) => {
      // Position nodes top to bottom within a wave
      const y = nodeIndex * VERTICAL_SPACING;
      layout.set(nodeId, { x: waveX, y });
    });
  });

  return layout;
}

/**
 * Calculate bounding box of all nodes
 */
function calculateBoundingBox(layout: Map<NodeId, { x: number; y: number }>): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
} | null {
  if (layout.size === 0) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const { x, y } of layout.values()) {
    const nodeLeft = x - NODE_WIDTH / 2;
    const nodeRight = x + NODE_WIDTH / 2;
    const nodeTop = y - NODE_HEIGHT / 2;
    const nodeBottom = y + NODE_HEIGHT / 2;

    minX = Math.min(minX, nodeLeft);
    maxX = Math.max(maxX, nodeRight);
    minY = Math.min(minY, nodeTop);
    maxY = Math.max(maxY, nodeBottom);
  }

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/**
 * Group nodes by execution wave (dependency depth)
 */
function groupByWaves(dag: DAG): NodeId[][] {
  const waves: NodeId[][] = [];
  const visited = new Set<NodeId>();
  const inDegree = new Map<NodeId, number>();

  // Calculate in-degrees
  for (const nodeId of dag.nodes.keys()) {
    inDegree.set(nodeId, 0);
  }
  for (const [_, targets] of dag.edges) {
    for (const target of targets) {
      inDegree.set(target, (inDegree.get(target) || 0) + 1);
    }
  }

  // Process waves
  while (visited.size < dag.nodes.size) {
    const wave: NodeId[] = [];

    // Find all nodes with in-degree 0
    for (const [nodeId, degree] of inDegree.entries()) {
      if (degree === 0 && !visited.has(nodeId)) {
        wave.push(nodeId);
      }
    }

    if (wave.length === 0) break; // Cycle detected

    waves.push(wave);

    // Mark as visited and update in-degrees
    for (const nodeId of wave) {
      visited.add(nodeId);
      const targets = dag.edges.get(nodeId) || [];
      for (const target of targets) {
        inDegree.set(target, inDegree.get(target)! - 1);
      }
    }
  }

  return waves;
}

/**
 * Draw edges between nodes (left-to-right with arrows)
 */
function drawEdges(
  ctx: CanvasRenderingContext2D,
  dag: DAG,
  layout: Map<NodeId, { x: number; y: number }>,
  executionState: Map<NodeId, TaskState> | undefined
): void {
  ctx.strokeStyle = '#666';
  ctx.lineWidth = 2;

  for (const [fromId, toIds] of dag.edges) {
    const fromPos = layout.get(fromId);
    if (!fromPos) continue;

    for (const toId of toIds) {
      const toPos = layout.get(toId);
      if (!toPos) continue;

      // Draw curved arrow from right edge of source window to left edge of target window
      const startX = fromPos.x + NODE_WIDTH / 2;
      const startY = fromPos.y;
      const endX = toPos.x - NODE_WIDTH / 2;
      const endY = toPos.y;

      ctx.beginPath();
      ctx.moveTo(startX, startY);

      const midX = (startX + endX) / 2;
      ctx.bezierCurveTo(
        midX, startY,
        midX, endY,
        endX, endY
      );

      ctx.stroke();

      // Draw arrowhead pointing right (toward target)
      drawArrowhead(ctx, endX, endY, 0);
    }
  }
}

/**
 * Draw an arrowhead
 */
function drawArrowhead(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number
): void {
  const size = 8;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x - size * Math.cos(angle - Math.PI / 6), y - size * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(x - size * Math.cos(angle + Math.PI / 6), y - size * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fillStyle = '#666';
  ctx.fill();
}

/**
 * Draw a single node as a Windows 3.1 style window
 */
function drawNode(
  ctx: CanvasRenderingContext2D,
  nodeId: NodeId,
  node: any,
  position: { x: number; y: number },
  state: TaskState | undefined,
  isHovered: boolean
): void {
  const x = position.x - NODE_WIDTH / 2;
  const y = position.y - NODE_HEIGHT / 2;

  // Determine title bar color based on state
  let titleBarColor = '#000080'; // Navy blue (pending)

  if (state) {
    switch (state.status) {
      case 'ready':
        titleBarColor = '#ffeb3b'; // Yellow
        break;
      case 'running':
        titleBarColor = '#2196f3'; // Blue
        break;
      case 'completed':
        titleBarColor = '#4caf50'; // Green
        break;
      case 'failed':
        titleBarColor = '#f44336'; // Red
        break;
      case 'skipped':
        titleBarColor = '#9e9e9e'; // Gray
        break;
    }
  }

  // Draw outer border (black)
  ctx.fillStyle = '#000';
  ctx.fillRect(x, y, NODE_WIDTH, NODE_HEIGHT);

  // Draw white highlight (top-left)
  ctx.fillStyle = '#fff';
  ctx.fillRect(x + 2, y + 2, NODE_WIDTH - 4, 2); // Top
  ctx.fillRect(x + 2, y + 2, 2, NODE_HEIGHT - 4); // Left

  // Draw dark shadow (bottom-right)
  ctx.fillStyle = '#808080';
  ctx.fillRect(x + 2, y + NODE_HEIGHT - 4, NODE_WIDTH - 4, 2); // Bottom
  ctx.fillRect(x + NODE_WIDTH - 4, y + 2, 2, NODE_HEIGHT - 4); // Right

  // Draw title bar
  ctx.fillStyle = titleBarColor;
  ctx.fillRect(x + 4, y + 4, NODE_WIDTH - 8, TITLE_BAR_HEIGHT);

  // Draw title bar text
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  const title = node.name || nodeId;
  const truncatedTitle = title.length > 14 ? title.substring(0, 11) + '...' : title;
  ctx.fillText(truncatedTitle, x + 8, y + 4 + TITLE_BAR_HEIGHT / 2);

  // Draw window content area (light gray)
  ctx.fillStyle = '#c0c0c0';
  ctx.fillRect(x + 4, y + 4 + TITLE_BAR_HEIGHT, NODE_WIDTH - 8, NODE_HEIGHT - 8 - TITLE_BAR_HEIGHT);

  // Draw skill hero image if available
  if (node.skillId) {
    const img = imageCache.get(node.skillId);
    if (img) {
      const imgX = x + 6;
      const imgY = y + 6 + TITLE_BAR_HEIGHT;
      const imgWidth = NODE_WIDTH - 12;
      const imgHeight = NODE_HEIGHT - 12 - TITLE_BAR_HEIGHT;

      ctx.save();
      ctx.beginPath();
      ctx.rect(imgX, imgY, imgWidth, imgHeight);
      ctx.clip();

      // Draw image maintaining aspect ratio
      const aspectRatio = img.width / img.height;
      const targetAspect = imgWidth / imgHeight;
      let drawWidth = imgWidth;
      let drawHeight = imgHeight;
      let drawX = imgX;
      let drawY = imgY;

      if (aspectRatio > targetAspect) {
        drawHeight = imgWidth / aspectRatio;
        drawY = imgY + (imgHeight - drawHeight) / 2;
      } else {
        drawWidth = imgHeight * aspectRatio;
        drawX = imgX + (imgWidth - drawWidth) / 2;
      }

      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
      ctx.restore();
    }
  }

  // Draw hover border
  if (isHovered) {
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, NODE_WIDTH, NODE_HEIGHT);
  }
}

/**
 * Draw legend
 */
function drawLegend(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const legendItems = [
    { color: '#f0f0f0', border: "var(--theme-border)", label: 'Pending' },
    { color: '#ffffcc', border: '#ffeb3b', label: 'Ready' },
    { color: '#bbdefb', border: '#2196f3', label: 'Running' },
    { color: '#c8e6c9', border: '#4caf50', label: 'Completed' },
    { color: '#ffcdd2', border: '#f44336', label: 'Failed' },
  ];

  const legendX = 20;
  const legendY = height - (legendItems.length * 25 + 20);

  ctx.font = '12px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';

  legendItems.forEach((item, index) => {
    const y = legendY + index * 25;

    // Draw circle
    ctx.beginPath();
    ctx.arc(legendX + 10, y, 8, 0, 2 * Math.PI);
    ctx.fillStyle = item.color;
    ctx.fill();
    ctx.strokeStyle = item.border;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw label
    ctx.fillStyle = '#000';
    ctx.fillText(item.label, legendX + 25, y);
  });
}

/**
 * Find node at position (accounting for zoom and transformations)
 */
function findNodeAtPosition(
  x: number,
  y: number,
  dag: DAG,
  zoom: number,
  autoFit: boolean,
  panOffset: { x: number; y: number }
): NodeId | null {
  const canvas = document.querySelector('canvas');
  if (!canvas) return null;

  const width = canvas.offsetWidth;
  const height = canvas.offsetHeight;

  const layout = calculateLayout(dag, width, height);
  const bounds = calculateBoundingBox(layout);

  // Calculate the same transformations applied during drawing
  let scale = zoom;
  let offsetX = 0;
  let offsetY = 0;

  if (autoFit && bounds) {
    const scaleX = (width - 2 * CANVAS_PADDING) / bounds.width;
    const scaleY = (height - 2 * CANVAS_PADDING) / bounds.height;
    scale = Math.min(scaleX, scaleY);

    const scaledWidth = bounds.width * scale;
    const scaledHeight = bounds.height * scale;
    offsetX = (width - scaledWidth) / 2 - bounds.minX * scale + panOffset.x;
    offsetY = (height - scaledHeight) / 2 - bounds.minY * scale + panOffset.y;
  } else {
    offsetX = panOffset.x;
    offsetY = panOffset.y;
  }

  // Transform mouse coordinates to graph space (inverse transformation)
  const graphX = (x - offsetX) / scale;
  const graphY = (y - offsetY) / scale;

  // Check if mouse is over any node (using rectangular bounds, not radius)
  for (const [nodeId, position] of layout.entries()) {
    const nodeLeft = position.x - NODE_WIDTH / 2;
    const nodeRight = position.x + NODE_WIDTH / 2;
    const nodeTop = position.y - NODE_HEIGHT / 2;
    const nodeBottom = position.y + NODE_HEIGHT / 2;

    if (
      graphX >= nodeLeft &&
      graphX <= nodeRight &&
      graphY >= nodeTop &&
      graphY <= nodeBottom
    ) {
      return nodeId;
    }
  }

  return null;
}

/**
 * Render rich tooltip for node
 */
function renderNodeTooltip(node: DAGNode, state: TaskState | undefined): JSX.Element {
  return (
    <div style={{
      background: "var(--theme-elevated)",
      border: "2px solid var(--theme-border)",
      padding: '12px',
      borderRadius: '4px',
      maxWidth: '320px',
      fontSize: '13px',
      lineHeight: '1.5'
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '14px' }}>
        {node.name || node.id}
      </div>

      <div style={{ marginBottom: '4px' }}>
        <strong>Type:</strong> {node.type}
      </div>

      {node.description && (
        <div style={{ marginBottom: '4px', fontStyle: 'italic', color: "var(--theme-muted)" }}>
          {node.description}
        </div>
      )}

      {node.skillId && (
        <div style={{ marginBottom: '4px' }}>
          <strong>Skill:</strong> {node.skillId}
        </div>
      )}

      {node.agentId && (
        <div style={{ marginBottom: '4px' }}>
          <strong>Agent:</strong> {node.agentId}
        </div>
      )}

      {node.mcpTool && (
        <div style={{ marginBottom: '4px' }}>
          <strong>MCP Tool:</strong> {node.mcpTool.server}/{node.mcpTool.tool}
        </div>
      )}

      {node.dependencies.length > 0 && (
        <div style={{ marginBottom: '4px' }}>
          <strong>Dependencies:</strong> {node.dependencies.join(', ')}
        </div>
      )}

      {node.config && (
        <div style={{ marginBottom: '4px', fontSize: '12px', color: "var(--theme-muted)" }}>
          <strong>Config:</strong>
          {node.config.model && ` Model: ${node.config.model} |`}
          {` Timeout: ${node.config.timeoutMs}ms`}
          {node.config.maxRetries > 0 && ` | Retries: ${node.config.maxRetries}`}
        </div>
      )}

      {state && (
        <div style={{
          marginTop: '8px',
          paddingTop: '8px',
          borderTop: "1px solid var(--theme-border)",
          fontWeight: 'bold'
        }}>
          Status: <span style={{
            color: state.status === 'completed' ? '#4caf50' :
                   state.status === 'failed' ? '#f44336' :
                   state.status === 'running' ? '#2196f3' : '#666'
          }}>
            {state.status}
          </span>
          {state.status === 'running' && 'attempt' in state && (
            <span style={{ fontWeight: 'normal', fontSize: '12px' }}>
              {' '}(Attempt {state.attempt})
            </span>
          )}
          {state.status === 'completed' && 'durationMs' in state && (
            <span style={{ fontWeight: 'normal', fontSize: '12px' }}>
              {' '}in {state.durationMs}ms
            </span>
          )}
        </div>
      )}
    </div>
  );
}
