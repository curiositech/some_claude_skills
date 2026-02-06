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

### Business Model + Skill Lifecycle (v1.0.3)
- `references/business-model.md` — Three-layer business (open core + cloud SaaS + skill marketplace). Skill marketplace with Elo-based ranking powered by execution data. Network effect flywheel. Competitive positioning vs LangGraph/CrewAI/Temporal/n8n. Go-to-market in 4 phases. Revenue projections.
- `references/skill-lifecycle.md` — Four evaluators (self/peer/downstream/human) with trust weighting. Elo-based multi-dimensional skill ranking. Full skill lifecycle state machine: Crystallization → Ranking → Improvement → Kuhnian Revolution → Retirement. Automated paradigm shift detection. Skill crystallization from successful executions. Code for all key algorithms.
- SKILL.md: Added Section 7 "Skill Lifecycle" summarizing the four evaluators, Elo ranking, and Kuhnian revolution.

### LLM Routing (v1.0.2)
- `references/llm-routing.md` — Comprehensive LLM routing guide based on Martian, Unify.ai, and RouteLLM research. Covers: tier-based static routing (node role → model class), adaptive routing (learns from execution history), cascading router (try cheap first, escalate on low quality), RouteLLM integration (matrix factorization on preference data). Cost model showing 76-92% savings. 4-phase adoption roadmap.

### Research Additions (v1.0.1)
- `references/sdk-implementation.md` — Claude Messages API integration, LLM-agnostic provider abstraction (Claude + OpenAI + Ollama), provider router for mixed-model DAGs, streaming for live visualization, Temporal durable execution pattern
- `references/skills-vs-research.md` — Deep analysis: skills compress repeated decision costs (54% cost savings), prevent the errors that matter most (anti-patterns), define output contracts (DAG reliability), enable model downgrading (10x cost reduction). Hybrid architecture: skill-first, research-augmented.
- `references/skill-gap-analysis.md` — Full audit of 180-skill library. 40 directly useful, 26 dag-* skills to consolidate into 5, 15 missing skills enumerated by priority (P0: task-decomposer, output-contract-enforcer, llm-router; P1: reactflow-expert, websocket-streaming, human-gate-designer, cost-optimizer)

### Based On
- 2025-2026 research: ReactFlow/XYFlow v12.4, ELKjs, Dagre, d3-dag, Cytoscape.js, vis.js, GoJS, JointJS
- Visualization UX patterns from: Temporal, Dagster, Prefect, LangGraph Studio, CrewAI Flows
