/**
 * DAG Monitor Page
 *
 * Real-time monitoring interface for DAG execution.
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import { ExecutionMonitor } from '@site/src/components/DAG';
import type { ExecutionLogEntry, ExecutionStats } from '@site/src/components/DAG';
import type { DAG, DAGNode, NodeId, DAGId } from '@site/src/dag/types';
import styles from './dag.module.css';

// Create a sample DAG for demonstration
function createSampleDAG(): DAG {
  const nodes = new Map<NodeId, DAGNode>();
  const edges = new Map<NodeId, NodeId[]>();

  const nodeConfigs: Array<{
    id: string;
    type: DAGNode['type'];
    skillId: string;
    deps: string[];
  }> = [
    { id: 'node-1', type: 'skill', skillId: 'fetch-data', deps: [] },
    { id: 'node-2', type: 'skill', skillId: 'validate', deps: ['node-1'] },
    { id: 'node-3', type: 'skill', skillId: 'transform', deps: ['node-2'] },
    { id: 'node-4', type: 'skill', skillId: 'analyze', deps: ['node-2'] },
    { id: 'node-5', type: 'skill', skillId: 'export', deps: ['node-3', 'node-4'] },
  ];

  for (const config of nodeConfigs) {
    const node: DAGNode = {
      id: config.id as NodeId,
      type: config.type,
      skillId: config.skillId,
      dependencies: config.deps as NodeId[],
      inputMappings: [],
      state: { status: 'pending' },
      config: {
        timeoutMs: 30000,
        maxRetries: 3,
        retryDelayMs: 1000,
        exponentialBackoff: true,
      },
    };
    nodes.set(config.id as NodeId, node);

    // Build edges
    for (const dep of config.deps) {
      const existing = edges.get(dep as NodeId) ?? [];
      edges.set(dep as NodeId, [...existing, config.id as NodeId]);
    }
  }

  return {
    id: 'sample-dag' as DAGId,
    name: 'Data Processing Pipeline',
    nodes,
    edges,
    config: {
      maxParallelism: 3,
      defaultTimeout: 30000,
      errorHandling: 'stop-on-failure',
    },
    inputs: [],
    outputs: [],
  };
}

type ExecutionState = 'idle' | 'running' | 'paused' | 'completed' | 'failed';

export default function DAGMonitorPage(): React.ReactElement {
  const [dag, setDag] = useState<DAG>(createSampleDAG);
  const [executionState, setExecutionState] = useState<ExecutionState>('idle');
  const [logs, setLogs] = useState<ExecutionLogEntry[]>([]);
  const [stats, setStats] = useState<ExecutionStats | undefined>();
  const executionRef = useRef<NodeJS.Timeout | null>(null);
  const nodeQueueRef = useRef<string[]>([]);

  const addLog = useCallback((level: ExecutionLogEntry['level'], message: string, nodeId?: string) => {
    setLogs(prev => [...prev, {
      timestamp: new Date(),
      level,
      message,
      nodeId,
    }]);
  }, []);

  const updateNodeStatus = useCallback((nodeId: string, status: DAGNode['state']['status']) => {
    setDag(prev => {
      const newNodes = new Map(prev.nodes);
      const node = newNodes.get(nodeId as NodeId);
      if (node) {
        const newNode = { ...node };
        if (status === 'running') {
          newNode.state = { status: 'running', startedAt: new Date() };
        } else if (status === 'completed') {
          const startedAt = 'startedAt' in node.state ? node.state.startedAt : new Date();
          newNode.state = {
            status: 'completed',
            result: { output: { success: true } },
            completedAt: new Date(),
            startedAt,
          } as DAGNode['state'];
        } else if (status === 'failed') {
          newNode.state = {
            status: 'failed',
            error: { message: 'Task execution failed', code: 'EXEC_ERROR', recoverable: true },
            failedAt: new Date(),
          } as DAGNode['state'];
        } else {
          newNode.state = { status };
        }
        newNodes.set(nodeId as NodeId, newNode);
      }
      return { ...prev, nodes: newNodes };
    });
  }, []);

  // Simulation of DAG execution
  const runSimulation = useCallback(() => {
    const nodeIds = Array.from(dag.nodes.keys()).map(id => id as string);
    nodeQueueRef.current = [...nodeIds];

    let currentIndex = 0;
    const processNextNode = () => {
      if (currentIndex >= nodeIds.length) {
        setExecutionState('completed');
        addLog('info', 'Workflow execution completed successfully');
        setStats(prev => prev ? { ...prev, endTime: new Date() } : undefined);
        return;
      }

      const nodeId = nodeIds[currentIndex];
      const node = dag.nodes.get(nodeId as NodeId);
      if (!node) return;

      // Check dependencies
      const depsCompleted = node.dependencies.every(depId => {
        const depNode = dag.nodes.get(depId);
        return depNode?.state.status === 'completed';
      });

      if (!depsCompleted) {
        // Try next node
        currentIndex++;
        processNextNode();
        return;
      }

      // Run this node
      updateNodeStatus(nodeId, 'running');
      addLog('info', `Starting task: ${node.skillId}`, nodeId);

      // Simulate execution time (1-3 seconds)
      const executionTime = 1000 + Math.random() * 2000;

      executionRef.current = setTimeout(() => {
        // 90% success rate
        const success = Math.random() < 0.9;

        if (success) {
          updateNodeStatus(nodeId, 'completed');
          addLog('info', `Task completed: ${node.skillId}`, nodeId);
          setStats(prev => prev ? {
            ...prev,
            completedNodes: prev.completedNodes + 1,
            totalTokens: prev.totalTokens + Math.floor(Math.random() * 1000),
            estimatedCost: prev.estimatedCost + Math.random() * 0.01,
          } : undefined);
        } else {
          updateNodeStatus(nodeId, 'failed');
          addLog('error', `Task failed: ${node.skillId}`, nodeId);
          setStats(prev => prev ? {
            ...prev,
            failedNodes: prev.failedNodes + 1,
          } : undefined);
        }

        currentIndex++;
        processNextNode();
      }, executionTime);
    };

    processNextNode();
  }, [dag.nodes, addLog, updateNodeStatus]);

  const handleStart = useCallback(() => {
    // Reset state
    setDag(createSampleDAG());
    setLogs([]);
    setStats({
      startTime: new Date(),
      completedNodes: 0,
      failedNodes: 0,
      runningNodes: 0,
      pendingNodes: dag.nodes.size,
      totalTokens: 0,
      estimatedCost: 0,
    });
    setExecutionState('running');
    addLog('info', 'Starting workflow execution...');

    // Start simulation
    setTimeout(runSimulation, 500);
  }, [dag.nodes.size, addLog, runSimulation]);

  const handlePause = useCallback(() => {
    if (executionRef.current) {
      clearTimeout(executionRef.current);
    }
    setExecutionState('paused');
    addLog('warn', 'Execution paused');
  }, [addLog]);

  const handleResume = useCallback(() => {
    setExecutionState('running');
    addLog('info', 'Execution resumed');
    runSimulation();
  }, [addLog, runSimulation]);

  const handleStop = useCallback(() => {
    if (executionRef.current) {
      clearTimeout(executionRef.current);
    }
    setExecutionState('idle');
    addLog('warn', 'Execution stopped by user');
    setStats(prev => prev ? { ...prev, endTime: new Date() } : undefined);
  }, [addLog]);

  const handleRetry = useCallback((nodeIds: string[]) => {
    addLog('info', `Retrying ${nodeIds.length} failed node(s)...`);
    for (const nodeId of nodeIds) {
      updateNodeStatus(nodeId, 'pending');
    }
    setExecutionState('running');
    runSimulation();
  }, [addLog, updateNodeStatus, runSimulation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (executionRef.current) {
        clearTimeout(executionRef.current);
      }
    };
  }, []);

  return (
    <Layout
      title="DAG Monitor"
      description="Monitor DAG workflow execution in real-time"
    >
      <div className={styles.container}>
        {/* Breadcrumbs */}
        <div className={styles.breadcrumbs}>
          <Link to="/dag" className={styles.breadcrumbLink}>DAG Framework</Link>
          <span className={styles.breadcrumbSeparator}>›</span>
          <span className={styles.breadcrumbCurrent}>Monitor</span>
        </div>

        {/* Header */}
        <div className={styles.monitorHeader}>
          <h1 className={styles.monitorTitle}>
            📈 Execution Monitor
          </h1>
          <div className={styles.monitorActions}>
            <Link to="/dag/builder" className={styles.secondaryCta}>
              📊 Builder
            </Link>
          </div>
        </div>

        {/* Monitor Component */}
        <div className={styles.monitorContainer}>
          <ExecutionMonitor
            dag={dag}
            executionState={executionState}
            logs={logs}
            stats={stats}
            onStart={handleStart}
            onPause={handlePause}
            onResume={handleResume}
            onStop={handleStop}
            onRetry={handleRetry}
          />
        </div>

        {/* Instructions */}
        <div
          style={{
            marginTop: '24px',
            padding: '16px',
            background: "var(--theme-surface)",
            border: '2px solid',
            borderColor: "var(--theme-border-light) var(--theme-border) var(--theme-border) var(--theme-border-light)",
          }}
        >
          <h3 style={{ margin: '0 0 8px 0', fontFamily: 'var(--font-system)', fontSize: '14px' }}>
            Demo Instructions
          </h3>
          <p style={{ margin: 0, fontFamily: 'var(--font-system)', fontSize: '12px', color: "var(--theme-text)" }}>
            Click "Start" to begin the simulated workflow execution. The demo will process nodes
            in dependency order, showing real-time progress, logs, and statistics. You can pause,
            resume, or stop execution at any time. Failed nodes can be retried.
          </p>
        </div>
      </div>
    </Layout>
  );
}
