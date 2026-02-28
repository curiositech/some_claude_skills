---
title: Observability
description: Execution tracing, performance profiling, and pattern learning for DAG workflow optimization
sidebar_position: 4
---

# Observability

The DAG framework provides full observability into every execution: structured traces, performance flamegraphs, failure analysis, and a pattern learner that improves routing decisions over time.

## Execution Tracing

Every node execution produces a structured trace span with timing, inputs, outputs, and metadata:

```json
{
  "traceId": "trace-a1b2c3",
  "dagId": "code-review-pipeline",
  "spans": [
    {
      "nodeId": "lint",
      "skillId": "code-review-checklist",
      "startedAt": "2026-02-27T14:00:00.000Z",
      "completedAt": "2026-02-27T14:00:03.412Z",
      "durationMs": 3412,
      "status": "completed",
      "tokenUsage": { "input": 1240, "output": 387 },
      "confidence": 0.91
    }
  ]
}
```

### Enabling the Tracer

```typescript
import { ExecutionTracer } from '@site/src/dag/observability';

const tracer = new ExecutionTracer({
  outputDir: './traces/',
  format: 'json',        // json | otel | jaeger
  includeTokenUsage: true,
  includeInputOutput: false,  // set true only for debugging (PII risk)
});

// Pass to the runtime
const runtime = new HTTPAPIRuntime({ tracer });
```

### OpenTelemetry Export

Traces can be exported to any OpenTelemetry-compatible backend (Jaeger, Honeycomb, Datadog):

```typescript
const tracer = new ExecutionTracer({
  format: 'otel',
  otlpEndpoint: 'http://localhost:4318/v1/traces',
  serviceName: 'dag-execution',
});
```

## Performance Profiling

The performance profiler identifies bottlenecks across multiple workflow runs:

```typescript
import { PerformanceProfiler } from '@site/src/dag/observability';

const profiler = new PerformanceProfiler();
await profiler.loadTraces('./traces/');

const report = profiler.analyze();
console.log(report.slowestNodes);
// [
//   { nodeId: 'security-audit', p95DurationMs: 8200, runCount: 47 },
//   { nodeId: 'documentation', p95DurationMs: 4100, runCount: 47 },
// ]
```

### Profiler Metrics

| Metric | Description |
|--------|-------------|
| `p50DurationMs` | Median execution time for this node |
| `p95DurationMs` | 95th-percentile execution time |
| `p99DurationMs` | 99th-percentile execution time |
| `errorRate` | Fraction of runs that failed |
| `retryRate` | Fraction of runs that needed a retry |
| `avgConfidence` | Average confidence score across runs |
| `avgTokensInput` | Average input token count |
| `avgTokensOutput` | Average output token count |

## Failure Analysis

When a node fails, the failure analyzer classifies the error and suggests remediation:

```typescript
import { FailureAnalyzer } from '@site/src/dag/observability';

const analyzer = new FailureAnalyzer();
const analysis = await analyzer.analyze(failedNode, executionContext);

console.log(analysis);
// {
//   errorCode: 'OUTPUT_VALIDATION_FAILED',
//   category: 'quality',
//   severity: 'high',
//   likelyCause: 'Model returned markdown instead of JSON for outputSchema',
//   suggestions: [
//     'Add explicit JSON formatting instruction to the node prompt',
//     'Lower maxTokens to reduce truncation risk',
//     'Consider using sonnet instead of haiku for structured output'
//   ]
// }
```

## Pattern Learner

The pattern learner analyses historical execution data to improve future routing and scheduling decisions:

### What It Learns

- **Skill-task affinity**: Which skills perform best on which categories of task
- **Optimal model selection**: When haiku is sufficient vs when sonnet is worth the cost  
- **Retry prediction**: Which node+task combinations are likely to need retries, enabling pre-emptive prompt hardening
- **Parallelism tuning**: Optimal `maxParallelism` for your infrastructure based on latency patterns

### Enabling Pattern Learning

```typescript
import { PatternLearner } from '@site/src/dag/observability';

const learner = new PatternLearner({
  storageDir: './patterns/',
  minSamplesBeforeLearning: 10,
  updateIntervalMs: 60_000,  // recompute every minute
});

// Attach to runtime — patterns are applied automatically
const runtime = new HTTPAPIRuntime({ patternLearner: learner });
```

### Viewing Learned Patterns

```typescript
const patterns = await learner.getTopPatterns();
// {
//   skillAffinities: { 'ai-engineer': ['rag', 'embeddings', 'llm'] },
//   modelRecommendations: { 'code-review': 'haiku', 'legal-review': 'sonnet' },
//   avgRetryRateBySkill: { 'ai-engineer': 0.05, 'computer-vision': 0.18 },
// }
```

## Real-Time Monitoring

Watch executions live in the [Execution Monitor](/dag/monitor). The monitor shows:

- Node status in real-time (pending → ready → running → completed/failed)
- A live log stream with timestamps
- Running totals for tokens consumed, duration, and error count
- A quality score for the overall execution

## Retention and Storage

By default, traces are stored in-memory during execution and written to disk on completion. For production use, configure a persistent backend:

```typescript
const runtime = new HTTPAPIRuntime({
  traceStorage: 'filesystem',       // filesystem | postgres | s3
  traceRetentionDays: 30,
  tracePath: './data/traces/',
});
```
