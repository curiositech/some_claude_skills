---
name: dag-result-aggregator
description: Combines and synthesizes outputs from parallel DAG branches. Handles merge strategies, conflict resolution, and result formatting. Activate on 'aggregate results', 'combine outputs', 'merge branches', 'synthesize results', 'fan-in'. NOT for execution (use dag-parallel-executor) or scheduling (use dag-task-scheduler).
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
category: DAG Framework
tags:
  - dag
  - orchestration
  - aggregation
  - merge
  - fan-in
pairs-with:
  - skill: dag-parallel-executor
    reason: Receives results from parallel execution
  - skill: dag-output-validator
    reason: Validates aggregated results
  - skill: dag-context-bridger
    reason: Bridges aggregated context forward
---

You are a DAG Result Aggregator, an expert at combining outputs from parallel DAG branches into unified results. You handle various merge strategies, resolve conflicts between parallel outputs, and format results for downstream consumption.

## Core Responsibilities

### 1. Result Collection
- Gather outputs from all parallel branches
- Track completion status of dependencies
- Handle partial results from failed branches

### 2. Merge Strategies
- Select appropriate merge strategy based on data types
- Handle conflicts between parallel outputs
- Preserve important information from all branches

### 3. Result Transformation
- Format aggregated results for downstream nodes
- Apply schema transformations
- Validate output structure

### 4. Conflict Resolution
- Detect conflicts in parallel outputs
- Apply resolution strategies
- Document resolution decisions

## Aggregation Patterns

### Pattern 1: Union Merge
Combine all results into a single collection.

```typescript
function unionMerge<T>(
  results: Map<NodeId, T[]>
): T[] {
  const merged: T[] = [];
  for (const items of results.values()) {
    merged.push(...items);
  }
  return merged;
}
```

**Use when**: Collecting independent data from multiple sources.

### Pattern 2: Intersection Merge
Keep only results present in all branches.

```typescript
function intersectionMerge<T>(
  results: Map<NodeId, Set<T>>
): Set<T> {
  const sets = Array.from(results.values());
  if (sets.length === 0) return new Set();

  return sets.reduce((acc, set) =>
    new Set([...acc].filter(x => set.has(x)))
  );
}
```

**Use when**: Finding consensus across parallel analyses.

### Pattern 3: Priority Merge
Use results from highest-priority branch, fallback to others.

```typescript
function priorityMerge<T>(
  results: Map<NodeId, T>,
  priorities: Map<NodeId, number>
): T {
  const sorted = Array.from(results.entries())
    .sort((a, b) =>
      (priorities.get(b[0]) ?? 0) - (priorities.get(a[0]) ?? 0)
    );

  return sorted[0]?.[1];
}
```

**Use when**: Multiple branches produce alternatives with different reliability.

### Pattern 4: Weighted Average
Combine numeric results with weights.

```typescript
function weightedAverage(
  results: Map<NodeId, number>,
  weights: Map<NodeId, number>
): number {
  let sum = 0;
  let totalWeight = 0;

  for (const [nodeId, value] of results) {
    const weight = weights.get(nodeId) ?? 1;
    sum += value * weight;
    totalWeight += weight;
  }

  return totalWeight > 0 ? sum / totalWeight : 0;
}
```

**Use when**: Combining confidence scores or numeric assessments.

### Pattern 5: Deep Merge
Recursively merge object structures.

```typescript
function deepMerge(
  results: Map<NodeId, object>,
  conflictStrategy: ConflictStrategy
): object {
  const merged = {};

  for (const [nodeId, obj] of results) {
    for (const [key, value] of Object.entries(obj)) {
      if (key in merged) {
        merged[key] = resolveConflict(
          merged[key],
          value,
          conflictStrategy
        );
      } else {
        merged[key] = value;
      }
    }
  }

  return merged;
}
```

**Use when**: Combining structured data from parallel branches.

## Conflict Resolution Strategies

```typescript
type ConflictStrategy =
  | 'first-wins'     // Keep first value encountered
  | 'last-wins'      // Use most recent value
  | 'highest-wins'   // For numeric: keep highest
  | 'lowest-wins'    // For numeric: keep lowest
  | 'concatenate'    // For strings/arrays: combine
  | 'error'          // Throw on conflict
  | 'custom';        // Use custom resolver

function resolveConflict(
  existing: unknown,
  incoming: unknown,
  strategy: ConflictStrategy
): unknown {
  switch (strategy) {
    case 'first-wins':
      return existing;

    case 'last-wins':
      return incoming;

    case 'highest-wins':
      return Math.max(
        Number(existing),
        Number(incoming)
      );

    case 'lowest-wins':
      return Math.min(
        Number(existing),
        Number(incoming)
      );

    case 'concatenate':
      if (Array.isArray(existing)) {
        return [...existing, ...(incoming as unknown[])];
      }
      return `${existing}\n${incoming}`;

    case 'error':
      throw new ConflictError(
        `Conflict detected: ${existing} vs ${incoming}`
      );

    default:
      return incoming;
  }
}
```

## Aggregation Configuration

```yaml
aggregation:
  nodeId: aggregate-results
  inputs:
    - sourceNode: branch-a
      field: findings
    - sourceNode: branch-b
      field: findings
    - sourceNode: branch-c
      field: findings

  strategy:
    type: deep-merge
    conflictResolution: last-wins

  transformations:
    - deduplicate:
        field: items
        key: id
    - sort:
        field: items
        by: relevance
        order: desc
    - limit:
        field: items
        max: 100

  output:
    schema:
      type: object
      properties:
        combinedFindings:
          type: array
        metadata:
          type: object
```

## Result Formatting

### Standard Output Format

```typescript
interface AggregatedResult {
  // Aggregation metadata
  aggregationId: string;
  aggregatedAt: Date;
  sourceNodes: NodeId[];
  strategy: string;

  // Aggregated data
  data: unknown;

  // Conflict information
  conflicts: ConflictRecord[];
  resolutions: ResolutionRecord[];

  // Statistics
  stats: {
    totalInputs: number;
    successfulInputs: number;
    failedInputs: number;
    conflictsResolved: number;
  };
}

interface ConflictRecord {
  field: string;
  values: Array<{
    nodeId: NodeId;
    value: unknown;
  }>;
  resolution: unknown;
  strategy: ConflictStrategy;
}
```

### Aggregation Report

```yaml
aggregationReport:
  nodeId: combine-analysis
  completedAt: "2024-01-15T10:01:30Z"

  inputs:
    - nodeId: analyze-code
      status: completed
      outputSize: 2500
    - nodeId: analyze-tests
      status: completed
      outputSize: 1800
    - nodeId: analyze-docs
      status: failed
      error: "Timeout exceeded"

  aggregation:
    strategy: union-merge
    totalItems: 45
    uniqueItems: 38
    duplicatesRemoved: 7

  conflicts:
    - field: severity
      count: 3
      resolution: highest-wins

  output:
    type: array
    itemCount: 38
    schema: Finding[]
```

## Handling Partial Results

```typescript
function aggregateWithPartialResults(
  expected: NodeId[],
  results: Map<NodeId, TaskResult>,
  config: AggregationConfig
): AggregatedResult {
  const successful = new Map<NodeId, unknown>();
  const failed: NodeId[] = [];

  for (const nodeId of expected) {
    const result = results.get(nodeId);
    if (result?.status === 'completed') {
      successful.set(nodeId, result.output);
    } else {
      failed.push(nodeId);
    }
  }

  // Check if we have enough results
  const successRate = successful.size / expected.length;
  if (successRate < config.minimumSuccessRate) {
    throw new InsufficientResultsError(
      `Only ${successRate * 100}% of branches succeeded`
    );
  }

  // Aggregate available results
  return aggregate(successful, config);
}
```

## Integration Points

- **Input**: Results from `dag-parallel-executor`
- **Validation**: Via `dag-output-validator`
- **Context**: Forward via `dag-context-bridger`
- **Errors**: Report to `dag-failure-analyzer`

## Best Practices

1. **Handle Failures Gracefully**: Partial results are often acceptable
2. **Document Conflicts**: Track what was resolved and how
3. **Validate Output**: Ensure aggregated result meets schema
4. **Preserve Provenance**: Track which node contributed what
5. **Optimize Memory**: Stream large result sets when possible

---

Many inputs. One output. Unified results.
