# Skill Gap Analysis for winDAGs

Audit of the 180-skill some_claude_skills library against what winDAGs needs. Organized into: (1) skills you already have that are directly useful, (2) existing dag-* skills that should be consolidated, and (3) skills you're missing.

---

## Skills You Already Have (Directly Useful)

These 180 skills are your library. The ones most relevant to winDAGs fall into tiers:

### Tier 1: Core Infrastructure (Needed by winDAGs itself)

| Skill | winDAGs Role |
|-------|-------------|
| `skill-architect` | Creating/improving skills for DAG nodes |
| `skill-grader` | Quality control of the skill library |
| `skillful-subagent-creator` | Designing the agents that populate DAG nodes |
| `windags-architect` | Architecture of the system itself |
| `mermaid-graph-writer` | Generating DAG visualizations |
| `mermaid-graph-renderer` | Exporting diagrams to images |
| `orchestrator` | General orchestration patterns |
| `prompt-engineer` | Optimizing agent prompts |
| `agent-creator` | Creating agent definitions |

### Tier 2: Common DAG Node Skills (Reusable Across Many DAG Templates)

| Skill | DAG Template Use |
|-------|-----------------|
| `research-analyst` | Research-synthesis DAGs |
| `technical-writer` | Any DAG that produces documentation |
| `code-review-checklist` | Code-related DAGs (refactor, review, build) |
| `refactoring-surgeon` | Codebase refactor DAGs |
| `test-automation-expert` | Any DAG involving code changes |
| `api-architect` | API design DAGs |
| `frontend-architect` | Web app building DAGs |
| `web-design-expert` | Portfolio/website DAGs |
| `seo-visibility-expert` | Website deployment DAGs |
| `security-auditor` | Security review DAGs |
| `fullstack-debugger` | Debugging DAGs |
| `data-pipeline-engineer` | Data processing DAGs |

### Tier 3: Domain-Specific (Used by Specific DAG Templates)

| Skill | Template |
|-------|----------|
| `cv-creator` | Resume/portfolio builder |
| `job-application-optimizer` | Job search workflow |
| `nextjs-app-router-expert` | Next.js app building |
| `react-performance-optimizer` | React optimization |
| `postgresql-optimization` | Database optimization |
| `github-actions-pipeline-builder` | CI/CD setup |
| `playwright-e2e-tester` | Testing workflows |
| `terraform-iac-expert` | Infrastructure provisioning |

---

## Existing dag-* Skills: Consolidation Needed

You have **26 dag-* skills** from a prior generation. These are micro-skills — each handles one narrow aspect of DAG execution. The problem: this many small skills creates catalog bloat and makes it hard for the orchestrator to select the right ones.

### Recommended Consolidation

Merge the 26 micro-skills into 5-6 consolidated skills:

| New Consolidated Skill | Absorbs | Purpose |
|----------------------|---------|---------|
| **dag-planner** | dag-graph-builder, dag-dependency-resolver, dag-task-scheduler, dag-dynamic-replanner | Builds, validates, and schedules DAGs |
| **dag-runtime** | dag-executor, dag-parallel-executor, dag-execution-tracer, dag-isolation-manager, dag-scope-enforcer, dag-permission-validator | Executes DAGs with isolation and tracing |
| **dag-quality** | dag-output-validator, dag-confidence-scorer, dag-hallucination-detector, dag-convergence-monitor, dag-iteration-detector, dag-feedback-synthesizer | Validates outputs and decides on iteration |
| **dag-skills-matcher** | dag-semantic-matcher, dag-capability-ranker, dag-skill-registry | Matches tasks to skills |
| **dag-ops** | dag-failure-analyzer, dag-performance-profiler, dag-result-aggregator, dag-context-bridger, dag-pattern-learner | Operations, debugging, optimization |

This takes 26 skills down to 5, each substantial enough to be useful as a preloaded skill for a subagent.

The existing `dag-visual-editor-design` and `execution-lifecycle-manager` should be absorbed into `windags-architect`.

---

## Skills You're Missing

### Critical (Build These First)

| Missing Skill | Why winDAGs Needs It | Priority |
|--------------|---------------------|----------|
| **llm-router** | Decides which model/provider to use per DAG node based on task complexity, cost budget, and capability requirements. The Haiku-vs-Sonnet-vs-Opus decision. | P0 |
| **output-contract-enforcer** | Validates that a node's output matches its declared JSON schema before passing to downstream nodes. The glue that makes DAGs reliable. | P0 |
| **task-decomposer** | Breaks a natural-language problem description into sub-tasks suitable for DAG nodes. The first step of the meta-DAG. | P0 |
| **cost-optimizer** | Tracks cumulative cost across a DAG execution and makes real-time decisions: downgrade models, skip optional nodes, or stop early. | P1 |
| **human-gate-designer** | Designs human-in-the-loop review points: what to present, how to collect feedback, how to route approve/reject/modify decisions back into the DAG. | P1 |

### Important (Build Soon)

| Missing Skill | Why winDAGs Needs It | Priority |
|--------------|---------------------|----------|
| **reactflow-expert** | Builds ReactFlow-based DAG visualizations with custom nodes, ELKjs layout, live state updates, and WebSocket integration. The visualization implementation skill. | P1 |
| **websocket-streaming** | Implements real-time bidirectional communication between DAG execution engine and dashboard. Node state updates, progress streaming, human gate events. | P1 |
| **template-dag-library** | Curates, documents, and maintains a library of reusable DAG templates (portfolio-builder, codebase-refactor, research-synthesis, etc.). | P2 |
| **dag-mutation-strategist** | Decides HOW to mutate a DAG when a node fails: add a validator? swap the model? fork into parallel approaches? loop back with feedback? | P2 |
| **llm-tool-adapter** | Translates tool definitions between provider formats (Claude tool_use ↔ OpenAI function_calling ↔ Gemini tool declarations). | P2 |

### Nice to Have (Build When Needed)

| Missing Skill | Why | Priority |
|--------------|-----|----------|
| **temporal-workflow-expert** | Implements durable DAG execution using Temporal SDK (activities, retries, signals, child workflows). | P3 |
| **dag-cost-tracker** | Real-time cost visualization per node and cumulative, with budget alerts and automatic model downgrading triggers. | P3 |
| **skill-crystallizer** | Extracts a new skill from a successful research-agent execution. The "research → skill" pipeline. | P3 |
| **dag-replay-debugger** | Time-travel debugging: inspect agent state at any node, replay decisions, edit state and re-execute. LangGraph Studio pattern. | P3 |
| **multi-model-benchmark** | Runs the same prompt through multiple models and compares quality/cost/speed. Helps calibrate the llm-router. | P3 |

---

## Skill Inventory Summary

| Category | Count | Status |
|----------|-------|--------|
| Existing useful skills | ~40 | Ready to use |
| Existing dag-* (consolidate) | 26 → 5 | Needs merge |
| Existing domain skills | ~110 | Available for specialized DAGs |
| New P0 (critical) | 3 | Need to create |
| New P1 (important) | 4 | Need to create |
| New P2 (soon) | 3 | Need to create |
| New P3 (nice to have) | 5 | Create when needed |
| **Total for winDAGs launch** | **~55 active** | **3 to create, 26 to consolidate** |

---

## Recommended Build Order

### Phase 1: Core (Before First DAG Runs)
1. Create `task-decomposer` (the meta-DAG's entry point)
2. Create `output-contract-enforcer` (makes DAGs reliable)
3. Create `llm-router` (makes DAGs cost-effective)
4. Consolidate 26 dag-* skills into 5

### Phase 2: Visualization (Before User-Facing Launch)
5. Create `reactflow-expert`
6. Create `websocket-streaming`
7. Create `human-gate-designer`

### Phase 3: Optimization (After First Users)
8. Create `cost-optimizer`
9. Create `template-dag-library`
10. Create `dag-mutation-strategist`

### Phase 4: Production Hardening
11. Create `temporal-workflow-expert`
12. Create `skill-crystallizer`
13. Create `dag-replay-debugger`

---

## Do You Need More Research?

| Topic | Research Value | Suggested Query |
|-------|--------------|----------------|
| Temporal SDK patterns for agent DAGs | High | "How to implement LLM agent workflows using Temporal SDK with activities, retries, and signals" |
| ReactFlow custom node best practices | High | "ReactFlow v12 custom node patterns for workflow editors with live state updates and ELKjs auto-layout" |
| LLM routing/model selection strategies | Medium | "How do LLM routers like Martian, Unify.ai, and RouteLLM decide which model to use per query?" |
| Cost tracking patterns for multi-LLM apps | Medium | "How to track and optimize LLM API costs across multiple providers in production" |
| Skill crystallization from agent traces | Low (novel area) | "Can LLM agents extract reusable skills/procedures from successful execution traces?" |
