# DAG Visualization Research

Deep research on the best workflow DAG visualization libraries and UX patterns for rendering agent DAGs before, during, and after execution. Based on 2025-2026 landscape analysis.

---

## Library Recommendation: ReactFlow + ELKjs

### Why ReactFlow Wins

ReactFlow (XYFlow v12.4+, MIT license) is the clear leader for modern agent/workflow DAG visualization with live state updates.

**Key strengths**:
- Built for React with native hooks, TypeScript, modern component architecture
- Real-time state management via internal Zustand integration
- Viewport virtualization — only renders visible elements, scales to large graphs
- ELKjs auto-layout with official workflow editor template
- Production-proven: Carto (data pipelines), Hubql (data models), numerous AI platforms
- Active development through 2025-2026 with React Flow UI component library

**For live agent execution**:
```typescript
// Update node states during workflow execution
const { setNodes } = useReactFlow();

function updateNodeState(nodeId: string, status: NodeStatus) {
  setNodes(nodes =>
    nodes.map(n =>
      n.id === nodeId
        ? { ...n, data: { ...n.data, status } }
        : n
    )
  );
}
```

**Bundle**: ~350 KB (ReactFlow) + ~500 KB (ELKjs)
**License**: MIT (free) with Pro subscription for templates/support

### Layout Engine Comparison

| Engine | Speed | Quality | Edge Routing | Best For |
|--------|-------|---------|-------------|----------|
| **ELKjs** | Async, moderate | Best | Yes (clean, non-overlapping) | Production DAG visualization |
| **Dagre** | Fast, sync | Good | No (edges overlap) | Quick prototypes |
| **d3-dag** | Fast | Good for sugiyama | No | Avoid — maintenance mode |

**Recommendation**: ELKjs for production, Dagre for prototypes. d3-dag is deprecated by its author.

### Alternatives (When ReactFlow Isn't Right)

| Library | When to Use | License |
|---------|------------|---------|
| **Cytoscape.js** | 5000+ nodes, graph algorithm needs, WebGL required | MIT |
| **GoJS** | Enterprise with budget (~$3000+), BPMN diagram needs | Commercial |
| **JointJS** | SVG rendering is critical requirement, CSS animation needs | MIT / Commercial |
| **vis.js** | Quick prototype only, not production | MIT |

---

## How Existing Tools Visualize Execution State

### Temporal: The Gold Standard for Runtime Visualization

Three view modes of the same execution:

**Compact View**: Simplified left-to-right progression. Related events grouped into single lines. Identical concurrent events collapse with count badge. Shows what happened in what order, deliberately ignoring clock time.

**Timeline View**: Gantt-like horizontal timeline. Each event group is a row with length proportional to actual duration. Updates in real-time for running workflows. Pending activities shown as dashed forward-animating lines. Built on vis-timeline.

**Full History View**: Git-tree-style view of every event. Thick main line for the workflow itself, with branches for each activity/child. Click to reveal event details and highlight related events.

**Color vocabulary**:
- Green solid: Completed
- Red solid: Failed
- Dashed red: Retrying
- Dashed purple: Pending/awaiting
- Animated dashed lines: In-progress

**Key innovation**: Inline child workflow expansion — view child timeline within parent summary without navigating away.

### Dagster: Asset Health Badges

Asset-centric graph with health-based colors:
- Green: Successfully materialized (up to date)
- Yellow/Orange: Stale (upstream changed)
- Gray: Missing (never materialized)
- Red: Failed materialization
- Blue: Currently materializing

**Partitioned asset timeline**: Color-coded horizontal bars where each segment shows partition state. Drag-select time ranges for metadata inspection.

**Performance**: Invested in 10K+ asset graph rendering — reduced layout from minutes to ~5 seconds through caching and optimized algorithms.

### Prefect: State-Centric Dashboard

**Unique feature**: Radar/radial chart showing how flow branches across task tree. Each concentric ring = execution stage, green arcs = completion along each branch.

**Run history scatter plot**: Time on X-axis, duration on Y-axis, color-coded dots by terminal state. Makes outlier detection (unusually long/failing runs) immediately visible.

**Gantt chart**: Shows what tasks executed when, parallelism, bottlenecks.

### LangGraph Studio: State Inspection + Time-Travel

**Unique feature**: Time-travel debugging — step backward through execution, inspect AgentState at any checkpoint, edit state before/after node runs.

Uses Mermaid/ASCII for static structure. Studio provides graph mode with execution paths highlighted during runs. `interrupt_before`/`interrupt_after` act as breakpoints.

No standard color palette for node states — emphasizes state inspection over visual status.

### CrewAI Flows: Simplest Model

HTML flow plots showing event-driven method architecture. No runtime state colors. Streaming text output for real-time visibility but not visual dashboard.

---

## winDAGs Visualization Design

### Adopt and Combine

| Feature | Source | Adaptation |
|---------|--------|------------|
| Status color vocabulary | Temporal | Green/red/blue/gray/purple + animation states |
| Health badges on nodes | Dagster | Multi-dimensional status (quality, cost, speed) |
| Time-travel debugging | LangGraph Studio | Inspect agent state at any node, replay decisions |
| Three view modes | Temporal | Graph + Timeline + Detail inspection |
| Run history trends | Prefect | Scatter plot of DAG execution history |
| React + ELK rendering | ReactFlow | Custom agent nodes with live state updates |

### Custom Agent Node Component

```typescript
interface AgentNodeData {
  id: string;
  role: string;
  skills: string[];
  status: 'pending' | 'scheduled' | 'running' | 'completed' | 'failed' | 'retrying' | 'paused' | 'skipped' | 'mutated';
  input: any;
  output: any;
  metrics: {
    duration_ms: number;
    tokens_used: number;
    cost_usd: number;
    retries: number;
  };
  error?: string;
}

const AgentNode = ({ data }: NodeProps<AgentNodeData>) => {
  const statusColors = {
    pending: '#9CA3AF',
    scheduled: '#3B82F6',
    running: '#3B82F6',
    completed: '#10B981',
    failed: '#EF4444',
    retrying: '#F59E0B',
    paused: '#8B5CF6',
    skipped: '#D1D5DB',
    mutated: '#EAB308',
  };

  return (
    <div
      className={`agent-node status-${data.status}`}
      style={{ borderColor: statusColors[data.status] }}
    >
      <Handle type="target" position={Position.Top} />
      
      <div className="node-header">
        <StatusIcon status={data.status} />
        <span className="role">{data.role}</span>
      </div>
      
      <div className="node-skills">
        {data.skills.map(s => (
          <span key={s} className="skill-badge">{s}</span>
        ))}
      </div>
      
      {data.status === 'completed' && data.output && (
        <div className="node-output-preview">
          {data.output.summary?.slice(0, 80)}...
        </div>
      )}
      
      {data.status === 'failed' && data.error && (
        <div className="node-error">{data.error}</div>
      )}
      
      <div className="node-metrics">
        {data.metrics.duration_ms > 0 && (
          <span>{(data.metrics.duration_ms / 1000).toFixed(1)}s</span>
        )}
        {data.metrics.cost_usd > 0 && (
          <span>${data.metrics.cost_usd.toFixed(3)}</span>
        )}
      </div>
      
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};
```

### WebSocket State Streaming

```typescript
// Server emits state updates
interface DAGStateEvent {
  type: 'node_state_change' | 'edge_active' | 'dag_mutated' | 'execution_complete';
  dag_id: string;
  timestamp: number;
  payload: {
    node_id?: string;
    status?: NodeStatus;
    output?: any;
    metrics?: NodeMetrics;
    mutation?: DAGMutation;
  };
}

// Client consumes via WebSocket
const ws = new WebSocket(`/api/dags/${dagId}/stream`);
ws.onmessage = (event) => {
  const update: DAGStateEvent = JSON.parse(event.data);
  
  switch (update.type) {
    case 'node_state_change':
      updateNodeState(update.payload.node_id, update.payload.status);
      break;
    case 'edge_active':
      animateEdge(update.payload.from, update.payload.to);
      break;
    case 'dag_mutated':
      applyMutation(update.payload.mutation);
      break;
    case 'execution_complete':
      showSummary(update.payload);
      break;
  }
};
```

### Animation CSS

```css
.agent-node.status-running {
  animation: pulse 1.5s ease-in-out infinite;
  box-shadow: 0 0 12px rgba(59, 130, 246, 0.5);
}

.agent-node.status-retrying {
  animation: spin-border 2s linear infinite;
}

.agent-node.status-paused {
  animation: pulse-border 2s ease-in-out infinite;
  border-style: dashed;
}

.agent-node.status-mutated {
  animation: glow 1s ease-in-out;
  border-color: #EAB308;
  box-shadow: 0 0 16px rgba(234, 179, 8, 0.6);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.react-flow__edge.active path {
  animation: dash 1s linear infinite;
  stroke-dasharray: 8;
}

@keyframes dash {
  to { stroke-dashoffset: -16; }
}
```
