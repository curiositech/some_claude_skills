---
title: Skill Orchestration
description: How the DAG framework orchestrates skills into parallel pipelines with dependency management and smart scheduling
sidebar_position: 1
---

# Skill Orchestration

The DAG framework orchestrates skills into intelligent pipelines that execute in parallel wherever possible, respecting the dependency relationships you define between nodes.

## How It Works

When you submit a workflow, the DAG engine:

1. **Validates** the graph is acyclic (no circular dependencies)
2. **Topologically sorts** the nodes to determine execution order
3. **Identifies ready nodes** — those whose dependencies have all completed
4. **Executes ready nodes in parallel** up to the configured `maxParallelism` limit
5. **Propagates outputs** from completed nodes to their dependents
6. **Handles failures** according to the configured `errorHandling` strategy

```
Input
  │
  ▼
[Node A]──────[Node B]
     \              \
      └──[Node C]────[Node D]  ← runs once B and C complete
```

## Node Types

| Type | What It Does |
|------|-------------|
| `skill` | Invokes a Claude Code skill with a prompt |
| `agent` | Spawns a sub-agent with its own context window |
| `mcp-tool` | Calls an MCP server tool directly |
| `composite` | Contains a nested sub-DAG |
| `conditional` | Branches based on a runtime condition |
| `aggregator` | Combines outputs from multiple upstream nodes |
| `transformer` | Transforms data between pipeline stages |
| `checkpoint` | Saves state for resumption after failure |

## DAG Configuration

```yaml
config:
  maxParallelism: 5      # Max nodes running at once
  defaultTimeout: 30000  # ms per node
  errorHandling: stop-on-failure  # or: continue, retry-failed
```

### Error Handling Strategies

- **`stop-on-failure`** — Cancel all running nodes the moment any node fails. Best for workflows where later steps depend on accurate earlier results.
- **`continue`** — Keep executing independent branches even if one fails. Useful for data processing pipelines where partial results are valuable.
- **`retry-failed`** — Automatically retry failed nodes using the node's `retryPolicy` before considering the workflow failed.

## Task Configuration Per Node

Each node inherits the DAG's `defaultTimeout` but can override it:

```yaml
nodes:
  - id: slow-analysis
    type: skill
    skillId: ai-engineer
    config:
      timeoutMs: 120000   # 2 minutes for this node
      maxRetries: 3
      retryDelayMs: 2000
      exponentialBackoff: true
      model: haiku         # haiku | sonnet | opus
```

## Input/Output Mapping

Nodes can pull specific fields from upstream outputs:

```yaml
nodes:
  - id: summarize
    type: skill
    skillId: documentation
    inputMapping:
      text: "$.nodes.analyze.output.report"  # JSONPath from analyze node output
```

## Parallelism in Practice

For a 5-node pipeline `A → B, A → C, B → D, C → D, D → E`:

| Wave | Nodes | Explanation |
|------|-------|-------------|
| 1 | A | No dependencies |
| 2 | B, C | Both depend only on A (parallel) |
| 3 | D | Waits for B and C |
| 4 | E | Waits for D |

With `maxParallelism: 5`, waves 2 and 3 run concurrently within their wave.

## Building Workflows

Use the [DAG Builder](/dag/builder) to visually compose pipelines. You can:
- Add nodes for any installed Claude Code skill
- Draw dependency arrows between nodes  
- Configure timeout and model per node
- Export to JSON or YAML for use with the API

## API Usage

```bash
# Submit a workflow
curl -X POST https://your-api.workers.dev/api/dag/execute \
  -H "Content-Type: application/json" \
  -d @my-workflow.json

# Check status
curl https://your-api.workers.dev/api/dag/status/{jobId}
```

See the [execution guide](/docs/dag-execution-guide) for full examples.
