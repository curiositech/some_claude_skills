/**
 * DAGBuilder Component
 *
 * Visual interface for building DAG workflows by adding nodes and connections.
 * Provides a Win31-styled interface for creating execution graphs.
 */

import React, { useState, useCallback, useMemo } from 'react';
import type {
  DAG,
  DAGNode as DAGNodeType,
  NodeId,
  DAGId,
  TaskConfig,
} from '@site/src/dag/types';
import { FlowGraph } from './FlowGraph';
import styles from './DAGBuilder.module.css';

export interface DAGBuilderProps {
  /** Initial DAG to edit */
  initialDag?: DAG;
  /** Available skills for node creation */
  availableSkills?: Array<{ id: string; name: string; category: string }>;
  /** Callback when DAG is saved */
  onSave?: (dag: DAG) => void;
  /** Callback when export is requested */
  onExport?: (dag: DAG, format: 'json' | 'yaml') => void;
  /** Callback when execution is requested (wires to real API when configured) */
  onExecute?: (dag: DAG) => void;
}

type NodeType = DAGNodeType['type'];

const NODE_TYPES: Array<{ type: NodeType; label: string; icon: string }> = [
  { type: 'skill', label: 'Skill Node', icon: '⚙️' },
  { type: 'agent', label: 'Agent Node', icon: '🤖' },
  { type: 'mcp-tool', label: 'MCP Tool', icon: '🔧' },
  { type: 'composite', label: 'Composite', icon: '📦' },
  { type: 'conditional', label: 'Conditional', icon: '🔀' },
];

const DEFAULT_CONFIG: TaskConfig = {
  timeoutMs: 30000,
  maxRetries: 3,
  retryDelayMs: 1000,
  exponentialBackoff: true,
};

function createEmptyDAG(name: string): DAG {
  return {
    id: `dag-${Date.now()}` as DAGId,
    name,
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
    nodes: new Map(),
    edges: new Map(),
    config: {
      maxParallelism: 5,
      maxExecutionTimeMs: 600_000,
      defaultRetryPolicy: {
        maxAttempts: 2,
        baseDelayMs: 1000,
        maxDelayMs: 30_000,
        backoffMultiplier: 2,
        retryableErrors: ['TIMEOUT', 'RATE_LIMITED'],
        nonRetryableErrors: ['PERMISSION_DENIED'],
      },
      failFast: false,
      enableCheckpoints: false,
      enableCaching: false,
      executionMode: 'wave' as const,
    },
    inputs: [],
    outputs: [],
  };
}

function generateNodeId(): NodeId {
  return `node-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` as NodeId;
}

export function DAGBuilder({
  initialDag,
  availableSkills = [],
  onSave,
  onExport,
  onExecute,
}: DAGBuilderProps): React.ReactElement {
  const [dag, setDag] = useState<DAG>(
    initialDag ?? createEmptyDAG('New Workflow')
  );
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isAddingNode, setIsAddingNode] = useState(false);
  const [newNodeType, setNewNodeType] = useState<NodeType>('skill');
  const [newNodeSkill, setNewNodeSkill] = useState('');
  const [newNodeName, setNewNodeName] = useState('');
  const [newNodeDesc, setNewNodeDesc] = useState('');
  const [newNodeModel, setNewNodeModel] = useState<'haiku' | 'sonnet' | 'opus' | ''>('haiku');
  const [newNodeDeps, setNewNodeDeps] = useState<string[]>([]);
  const [dagName, setDagName] = useState(dag.name);
  const [showExportModal, setShowExportModal] = useState(false);

  // Get existing node IDs for dependency selection
  const existingNodeIds = useMemo(
    () => Array.from(dag.nodes.keys()).map(id => id as string),
    [dag.nodes]
  );

  // Add a new node
  const handleAddNode = useCallback(() => {
    const nodeId = generateNodeId();
    const newNode: DAGNodeType = {
      id: nodeId,
      name: newNodeName || (newNodeType === 'skill' ? newNodeSkill : newNodeType),
      description: newNodeDesc || undefined,
      type: newNodeType,
      skillId: newNodeType === 'skill' ? newNodeSkill : undefined,
      dependencies: newNodeDeps as NodeId[],
      state: { status: 'pending' },
      config: {
        ...DEFAULT_CONFIG,
        model: newNodeModel || undefined,
      },
    };

    setDag(prev => {
      const newNodes = new Map(prev.nodes);
      newNodes.set(nodeId, newNode);

      // Update edges
      const newEdges = new Map(prev.edges);
      for (const depId of newNodeDeps) {
        const existing = newEdges.get(depId as NodeId) ?? [];
        newEdges.set(depId as NodeId, [...existing, nodeId]);
      }

      return { ...prev, nodes: newNodes, edges: newEdges };
    });

    // Reset form
    setIsAddingNode(false);
    setNewNodeName('');
    setNewNodeDesc('');
    setNewNodeSkill('');
    setNewNodeModel('haiku');
    setNewNodeDeps([]);
  }, [newNodeType, newNodeSkill, newNodeName, newNodeDesc, newNodeModel, newNodeDeps]);

  // Delete selected node
  const handleDeleteNode = useCallback(() => {
    if (!selectedNodeId) return;

    setDag(prev => {
      const newNodes = new Map(prev.nodes);
      newNodes.delete(selectedNodeId as NodeId);

      // Remove from edges
      const newEdges = new Map<NodeId, NodeId[]>();
      for (const [fromId, toIds] of prev.edges) {
        if (fromId === selectedNodeId) continue;
        const filtered = toIds.filter(id => id !== selectedNodeId);
        if (filtered.length > 0) {
          newEdges.set(fromId, filtered as NodeId[]);
        }
      }

      // Remove from dependencies
      for (const node of newNodes.values()) {
        node.dependencies = node.dependencies.filter(
          dep => dep !== selectedNodeId
        );
      }

      return { ...prev, nodes: newNodes, edges: newEdges };
    });

    setSelectedNodeId(null);
  }, [selectedNodeId]);

  // Update DAG name
  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setDagName(name);
    setDag(prev => ({ ...prev, name }));
  }, []);

  // Save DAG
  const handleSave = useCallback(() => {
    onSave?.(dag);
  }, [dag, onSave]);

  // Export DAG
  const handleExport = useCallback((format: 'json' | 'yaml') => {
    onExport?.(dag, format);
    setShowExportModal(false);
  }, [dag, onExport]);

  // Toggle dependency selection
  const toggleDependency = useCallback((nodeId: string) => {
    setNewNodeDeps(prev =>
      prev.includes(nodeId)
        ? prev.filter(id => id !== nodeId)
        : [...prev, nodeId]
    );
  }, []);

  // Clear all nodes
  const handleClear = useCallback(() => {
    if (confirm('Are you sure you want to clear all nodes?')) {
      setDag(prev => ({
        ...prev,
        nodes: new Map(),
        edges: new Map(),
      }));
      setSelectedNodeId(null);
    }
  }, []);

  return (
    <div className={styles.container}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarSection}>
          <label className={styles.nameLabel}>
            Workflow:
            <input
              type="text"
              value={dagName}
              onChange={handleNameChange}
              className={styles.nameInput}
              placeholder="Workflow name"
            />
          </label>
        </div>

        <div className={styles.toolbarSection}>
          <button
            className={styles.toolButton}
            onClick={() => setIsAddingNode(true)}
            disabled={isAddingNode}
          >
            ➕ Add Node
          </button>
          <button
            className={styles.toolButton}
            onClick={handleDeleteNode}
            disabled={!selectedNodeId}
          >
            🗑️ Delete
          </button>
          <button
            className={styles.toolButton}
            onClick={handleClear}
            disabled={dag.nodes.size === 0}
          >
            🧹 Clear
          </button>
        </div>

        <div className={styles.toolbarSection}>
          <button
            className={styles.toolButton}
            onClick={handleSave}
            disabled={dag.nodes.size === 0}
          >
            💾 Save
          </button>
          <button
            className={styles.toolButton}
            onClick={() => setShowExportModal(true)}
            disabled={dag.nodes.size === 0}
          >
            📤 Export
          </button>
          {onExecute && (
            <button
              className={styles.primaryButton}
              onClick={() => onExecute(dag)}
              disabled={dag.nodes.size === 0}
              title="Execute workflow via Haiku API"
            >
              ▶ Run
            </button>
          )}
        </div>
      </div>

      {/* Main content area */}
      <div className={styles.content}>
        {/* Graph visualization */}
        <div className={styles.graphArea}>
          {dag.nodes.size > 0 ? (
            <FlowGraph
              dag={dag}
              onNodeSelect={setSelectedNodeId}
            />
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📊</div>
              <div className={styles.emptyTitle}>No nodes yet</div>
              <div className={styles.emptyText}>
                Click "Add Node" to start building your workflow
              </div>
            </div>
          )}
        </div>

        {/* Add Node Panel */}
        {isAddingNode && (
          <div className={styles.sidePanel}>
            <div className={styles.panelHeader}>
              <span>Add New Node</span>
              <button
                className={styles.closeButton}
                onClick={() => setIsAddingNode(false)}
              >
                ×
              </button>
            </div>

            <div className={styles.panelContent}>
              {/* Node Type Selection */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Node Type:</label>
                <div className={styles.nodeTypeGrid}>
                  {NODE_TYPES.map(({ type, label, icon }) => (
                    <button
                      key={type}
                      className={`${styles.nodeTypeButton} ${
                        newNodeType === type ? styles.nodeTypeSelected : ''
                      }`}
                      onClick={() => setNewNodeType(type)}
                    >
                      <span className={styles.nodeTypeIcon}>{icon}</span>
                      <span className={styles.nodeTypeLabel}>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Skill Selection (for skill nodes) */}
              {newNodeType === 'skill' && (
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Skill:</label>
                  <select
                    className={styles.select}
                    value={newNodeSkill}
                    onChange={e => setNewNodeSkill(e.target.value)}
                  >
                    <option value="">Select a skill...</option>
                    {availableSkills.map(skill => (
                      <option key={skill.id} value={skill.id}>
                        {skill.name} ({skill.category})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Display Name */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Display Name:</label>
                <input
                  type="text"
                  className={styles.textInput}
                  value={newNodeName}
                  onChange={e => setNewNodeName(e.target.value)}
                  placeholder={newNodeSkill || newNodeType || 'Node name'}
                />
              </div>

              {/* Task / Prompt */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Task / Prompt:</label>
                <textarea
                  className={styles.textArea}
                  value={newNodeDesc}
                  onChange={e => setNewNodeDesc(e.target.value)}
                  placeholder="What should this node do? e.g. 'Review the code for security issues'"
                  rows={3}
                />
              </div>

              {/* Model */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Model:</label>
                <select
                  className={styles.select}
                  value={newNodeModel}
                  onChange={e => setNewNodeModel(e.target.value as 'haiku' | 'sonnet' | 'opus' | '')}
                >
                  <option value="haiku">claude-haiku (fast, free tier)</option>
                  <option value="sonnet">claude-sonnet (balanced)</option>
                  <option value="opus">claude-opus (most capable)</option>
                </select>
              </div>

              {/* Dependencies */}
              {existingNodeIds.length > 0 && (
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Dependencies:</label>
                  <div className={styles.depsList}>
                    {existingNodeIds.map(nodeId => {
                      const node = dag.nodes.get(nodeId as NodeId);
                      return (
                        <label key={nodeId} className={styles.depItem}>
                          <input
                            type="checkbox"
                            checked={newNodeDeps.includes(nodeId)}
                            onChange={() => toggleDependency(nodeId)}
                          />
                          <span>{node?.skillId || nodeId}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className={styles.formActions}>
                <button
                  className={styles.primaryButton}
                  onClick={handleAddNode}
                  disabled={newNodeType === 'skill' && !newNodeSkill}
                >
                  Add Node
                </button>
                <button
                  className={styles.secondaryButton}
                  onClick={() => setIsAddingNode(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <span>Export Workflow</span>
              <button
                className={styles.closeButton}
                onClick={() => setShowExportModal(false)}
              >
                ×
              </button>
            </div>
            <div className={styles.modalContent}>
              <p>Choose export format:</p>
              <div className={styles.exportButtons}>
                <button
                  className={styles.exportButton}
                  onClick={() => handleExport('json')}
                >
                  📄 Export as JSON
                </button>
                <button
                  className={styles.exportButton}
                  onClick={() => handleExport('yaml')}
                >
                  📝 Export as YAML
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status bar */}
      <div className={styles.statusBar}>
        <span>Nodes: {dag.nodes.size}</span>
        <span>•</span>
        <span>
          Selected: {selectedNodeId
            ? (dag.nodes.get(selectedNodeId as NodeId)?.name || dag.nodes.get(selectedNodeId as NodeId)?.skillId || selectedNodeId)
            : 'None'}
        </span>
        {selectedNodeId && dag.nodes.get(selectedNodeId as NodeId)?.config.model && (
          <>
            <span>•</span>
            <span>{dag.nodes.get(selectedNodeId as NodeId)?.config.model}</span>
          </>
        )}
      </div>
    </div>
  );
}

export default DAGBuilder;
