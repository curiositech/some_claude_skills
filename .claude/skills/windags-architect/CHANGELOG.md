# Changelog: windags-architect

## v1.0.0 (2026-02-05)

### Created
- System architecture overview with Mermaid diagram
- Local execution: process models, node/DAG YAML schemas, execution engine pseudocode
- Web service deployment: API design, WebSocket streaming, template DAGs
- Meta-DAGs: DAG-creating-DAG architecture, Haiku loop for cheap orchestration
- Dynamic DAGs: mutation types, beyond-DAG control structures (loops, human gates, conditional branches)
- Visualization: ReactFlow + ELKjs recommendation, node state color vocabulary, three view modes
- End-to-end example: "Build a Portfolio Website" DAG

### Reference Files
- `references/visualization-research.md` — Deep research on DAG visualization libraries (ReactFlow, Cytoscape, GoJS, JointJS, dagre, ELKjs, d3-dag), UX patterns from Temporal/Dagster/Prefect/LangGraph/CrewAI, custom agent node React component, WebSocket state streaming, CSS animations
- `references/execution-engines.md` — Execution models, topological scheduling, failure handling matrix, DAG mutation on failure, node state machine, cost tracking

### Based On
- 2025-2026 research: ReactFlow/XYFlow v12.4, ELKjs, Dagre, d3-dag, Cytoscape.js, vis.js, GoJS, JointJS
- Visualization UX patterns from: Temporal, Dagster, Prefect, LangGraph Studio, CrewAI Flows
