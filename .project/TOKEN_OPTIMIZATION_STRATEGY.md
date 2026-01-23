# DAG Framework: Token Optimization Strategy

**Date**: 2026-01-15
**Goal**: Reduce 20k token overhead per Task to &lt;5k tokens
**Target**: 75% reduction while maintaining functionality

---

## Problem Analysis

### Current Overhead Sources (from `buildPrompt()`)

```typescript
// Lines 235-291 in claude-code-cli.ts
private buildPrompt(node: DAGNode, context: ExecutionContext): string {
  // 1. Full JSON dumps of context
  JSON.stringify(context.parentContext, null, 2)

  // 2. Full results from ALL dependencies
  for (const depId of node.dependencies) {
    JSON.stringify(depResult, null, 2)  // Could be huge!
  }

  // 3. Full variable dump
  JSON.stringify(Object.fromEntries(context.variables), null, 2)

  // 4. Verbose output format instructions (boilerplate)
}
```

**Estimated Overhead**:
- Base Task initialization: ~10k tokens (Claude Code system)
- Parent context JSON: ~2k tokens
- Dependencies (avg 3): ~6k tokens (2k each)
- Variables: ~1k tokens
- Format instructions: ~1k tokens
- **Total**: ~20k tokens

---

## Research-Backed Optimization Strategies

### 1. Lazy Loading (54% Reduction)

**Source**: [GitHub Gist - Context Optimization](https://gist.github.com/johnlindquist/849b813e76039a908d962b2f0923dc9a)

**Key Insight**:
> "Claude doesn't need verbose documentation upfront—it needs triggers to know when to load detailed context."

**Application to DAG**:
```typescript
// BEFORE: Load everything upfront
parts.push('## Context from Parent');
parts.push(JSON.stringify(context.parentContext, null, 2));

// AFTER: Lazy load with triggers
parts.push('## Available Context');
parts.push('- Parent context: Use <context:parent> to load');
parts.push('- Variables: Use <context:vars> to load');
parts.push('- Only load what you need for this task');
```

**Savings**: ~3k tokens per task (context not loaded unless needed)

### 2. Dependency Result Filtering (95-98% Reduction)

**Source**: [Medium - MCP Response Analysis](https://medium.com/@pierreyohann16/optimizing-token-efficiency-in-claude-code-workflows-managing-large-model-context-protocol-f41eafdab423)

**Key Insight**:
> "Achieve 95–98% reduction on typical large MCP responses by filtering and summarizing data."

**Application to DAG**:
```typescript
// BEFORE: Full dependency results
for (const depId of node.dependencies) {
  const depResult = context.nodeResults.get(depId);
  parts.push(JSON.stringify(depResult, null, 2));  // 2k tokens each!
}

// AFTER: Extract only relevant fields
for (const depId of node.dependencies) {
  const depResult = context.nodeResults.get(depId);
  const summary = this.extractRelevantFields(depResult, node);
  parts.push(`${depId}: ${summary}`);  // 100 tokens
}

private extractRelevantFields(result: TaskResult, node: DAGNode): string {
  // Analyze what this node actually needs from dependency
  // Return only those fields in compact format

  // Example: If node needs "userId" from auth result
  if (result.output?.userId) {
    return `userId: ${result.output.userId}`;  // Not full auth object
  }

  return 'Completed successfully';  // Minimal fallback
}
```

**Savings**: ~5k tokens per task (from 6k → 1k for dependencies)

### 3. Context Editing & Pruning (84% Reduction)

**Source**: [ClaudeLog - Token Usage Optimization](https://claudelog.com/faqs/how-to-optimize-claude-code-token-usage/)

**Key Insight**:
> "Context editing enabled agents to complete workflows that would fail due to context exhaustion—while reducing token consumption by 84%."

**Application to DAG**:
```typescript
// Add context pruning before building prompt
private pruneContext(context: ExecutionContext, node: DAGNode): ExecutionContext {
  // Remove variables not needed by this node
  const relevantVars = this.findRelevantVariables(node);
  const prunedVars = new Map();

  for (const [key, value] of context.variables) {
    if (relevantVars.has(key)) {
      prunedVars.set(key, value);
    }
  }

  return {
    ...context,
    variables: prunedVars,
    // Also prune parentContext to only relevant fields
    parentContext: this.pruneParentContext(context.parentContext, node),
  };
}
```

**Savings**: ~2k tokens per task (from 3k → 1k for variables/context)

### 4. Tiered Documentation (60% Reduction)

**Source**: [Medium - Stop Wasting Tokens](https://medium.com/@jpranav97/stop-wasting-tokens-how-to-optimize-claude-code-context-by-60-bfad6fd477e5)

**Key Insight**:
> "Implement a 3-tier system: (1) Brief trigger, (2) Mid-level overview, (3) Full documentation (on-demand)."

**Application to DAG**:
```typescript
// BEFORE: Verbose instructions
parts.push('## Output Format');
parts.push('Return your result as valid JSON with the following structure:');
parts.push('```json');
parts.push(JSON.stringify({ output: '...', confidence: 0.95 }, null, 2));
parts.push('```');

// AFTER: Compact instruction
parts.push('Return: {output, confidence}');  // 5 tokens vs 50!
```

**Savings**: ~1k tokens per task (from 1k → 50 for boilerplate)

### 5. Shared Context Pool for Parallel Waves

**New Strategy** (not in research, but obvious optimization)

**Concept**: Tasks in same wave often need same context. Load once, reference many times.

```typescript
private buildPromptForWave(
  nodes: DAGNode[],
  context: ExecutionContext
): Map<NodeId, string> {
  // Extract shared context for entire wave
  const sharedContext = this.extractSharedContext(nodes, context);

  // Build individual prompts with references to shared context
  const prompts = new Map<NodeId, string>();

  for (const node of nodes) {
    const prompt = this.buildCompactPrompt(node, sharedContext);
    prompts.set(node.id, prompt);
  }

  return prompts;
}

// Instead of N copies of same data, store once
private extractSharedContext(nodes: DAGNode[], context: ExecutionContext) {
  // Identify what context is needed by multiple nodes
  // Store in shared location (e.g., StateManager)
  // Reference via pointer in prompts
}
```

**Savings**: For wave of 5 tasks sharing same dependencies:
- Before: 5 × 6k = 30k tokens (5 copies)
- After: 6k + (5 × 100) = 6.5k tokens (1 copy + 5 pointers)
- **Savings**: 23.5k tokens per wave!

---

## Implementation Roadmap

### Phase 1: Quick Wins (Week 1)
**Target**: 50% reduction (20k → 10k tokens)

1. **Compact Output Instructions** (1k savings)
   - Replace verbose format with 1-line instruction
   - File: `claude-code-cli.ts`, line 282-289

2. **Dependency Result Summaries** (5k savings)
   - Implement `extractRelevantFields()` method
   - Only pass fields actually used by downstream task
   - File: `claude-code-cli.ts`, line 257-270

3. **Variable Pruning** (2k savings)
   - Implement `pruneContext()` method
   - Remove variables not referenced by task
   - File: `claude-code-cli.ts`, before line 235

**Expected Result**: 20k → 12k tokens (40% reduction)

### Phase 2: Advanced Optimizations (Week 2)
**Target**: 75% reduction (20k → 5k tokens)

4. **Lazy Context Loading** (3k savings)
   - Add context loading triggers instead of inline JSON
   - Implement on-demand context fetching
   - File: New `context-loader.ts`

5. **Shared Context Pool** (varies by wave size)
   - Extract common context for parallel tasks
   - Reference instead of duplicate
   - File: `claude-code-cli.ts`, new method `buildPromptForWave()`

6. **Smart Dependency Analysis** (additional 2k savings)
   - Analyze actual data flow between nodes
   - Only pass fields that are read by downstream task
   - File: New `dependency-analyzer.ts`

**Expected Result**: 20k → 5k tokens (75% reduction)

### Phase 3: Experimental (Future)
**Target**: 90% reduction (20k → 2k tokens)

7. **Tool Search Integration**
   - Use Anthropic's Tool Search pattern for skills
   - Load skill details on-demand
   - Requires: Skill metadata index

8. **Context Compression**
   - Compress JSON before passing (gzip)
   - Decompress in subagent
   - Requires: Custom encoding/decoding

9. **Incremental Context Building**
   - Start with minimal context
   - Agent requests more as needed
   - Requires: Multi-turn context loading protocol

---

## Code Changes

### Quick Win #1: Compact Output Instructions

```typescript
// BEFORE (line 281-289)
parts.push('## Output Format');
parts.push('Return your result as valid JSON with the following structure:');
parts.push('```json');
parts.push(JSON.stringify({
  output: '/* your result data */',
  confidence: 0.95,
}, null, 2));
parts.push('```');

// AFTER (1 line)
parts.push('Return: {output: <your result>, confidence: 0-1}');
```

### Quick Win #2: Dependency Summaries

```typescript
// NEW METHOD: Add after line 292
private extractRelevantFields(
  result: TaskResult,
  node: DAGNode
): string {
  // Analyze node's skill/agent to determine what fields it needs
  const skillId = node.skillId;
  const output = result.output;

  // Simple heuristic: Common field names
  const essentialFields = ['id', 'status', 'result', 'data', 'userId'];
  const extracted: Record<string, unknown> = {};

  for (const field of essentialFields) {
    if (output && typeof output === 'object' && field in output) {
      extracted[field] = output[field];
    }
  }

  // Return compact representation
  if (Object.keys(extracted).length > 0) {
    return JSON.stringify(extracted);  // Only essential fields
  }

  // Fallback: Just indicate success
  return `completed (${result.confidence})`;
}

// UPDATE: Lines 258-270
if (node.dependencies.length > 0) {
  parts.push('## Dependencies');
  for (const depId of node.dependencies) {
    const depResult = context.nodeResults.get(depId);
    if (depResult) {
      const summary = this.extractRelevantFields(depResult, node);
      parts.push(`- ${depId}: ${summary}`);  // Compact!
    }
  }
  parts.push('');
}
```

### Quick Win #3: Variable Pruning

```typescript
// NEW METHOD: Add before buildPrompt()
private pruneContext(
  context: ExecutionContext,
  node: DAGNode
): ExecutionContext {
  // For now, simple heuristic: Keep only small variables
  const prunedVars = new Map<string, unknown>();

  for (const [key, value] of context.variables) {
    const size = JSON.stringify(value).length;
    if (size < 100) {  // Only keep small vars
      prunedVars.set(key, value);
    } else {
      // Large vars available via lazy load
      prunedVars.set(key, '<large-value>');
    }
  }

  return {
    ...context,
    variables: prunedVars,
  };
}

// UPDATE: Line 235 (buildPrompt)
private buildPrompt(node: DAGNode, context: ExecutionContext): string {
  const prunedContext = this.pruneContext(context, node);  // ADD THIS
  const parts: string[] = [];
  // ... rest of method uses prunedContext
}
```

---

## Validation Plan

### Metrics to Track

1. **Token Count per Task**
   - Measure prompt length in tokens
   - Target: &lt;5k tokens per task
   - Current: ~20k tokens

2. **Cost per DAG Execution**
   - 9-task example should drop from $0.55 to $0.14
   - Track via API token usage

3. **Accuracy/Success Rate**
   - Ensure optimization doesn't break functionality
   - Monitor task completion rates
   - Target: Same success rate as verbose prompts

### A/B Testing

Run parallel comparisons:
- **Control**: Current 20k token prompts
- **Test**: Optimized 5k token prompts
- **Measure**: Success rate, cost, execution time

If success rate drops &gt;5%, roll back optimization.

---

## Expected ROI

### Cost Savings (9-task example)

| Metric | Before | After Phase 1 | After Phase 2 |
|--------|--------|---------------|---------------|
| Tokens/task | 20k | 10k | 5k |
| Total tokens | 180k | 90k | 45k |
| Cost/execution | $0.55 | $0.27 | $0.14 |
| 100/day cost | $1,650/mo | $810/mo | $420/mo |
| **Savings** | Baseline | $840/mo | $1,230/mo |

### Scalability Unlocked

With 75% token reduction:
- **Can now run**: 20-task DAGs (previously too expensive)
- **Batch size**: 10 tasks in parallel (was limited by cost)
- **Use cases**: Larger, more complex workflows become viable

---

## Sources

All optimization strategies are backed by 2025 research and production use cases:

1. [Claude Code Context Optimization - 54% reduction](https://gist.github.com/johnlindquist/849b813e76039a908d962b2f0923dc9a)
2. [ClaudeLog - Token Usage Optimization](https://claudelog.com/faqs/how-to-optimize-claude-code-token-usage/)
3. [Medium - Stop Wasting Tokens (60% reduction)](https://medium.com/@jpranav97/stop-wasting-tokens-how-to-optimize-claude-code-context-by-60-bfad6fd477e5)
4. [Medium - MCP Response Analysis (95-98% reduction)](https://medium.com/@pierreyohann16/optimizing-token-efficiency-in-claude-code-workflows-managing-large-model-context-protocol-f41eafdab423)
5. [Continuous Claude Context Management](https://www.vibesparking.com/blog/ai/claude-code/continuous-claude-code/2025-12-25-continuous-claude-context-management-guide/)
6. [GitHub Issue - Lazy-load MCP tools](https://github.com/anthropics/claude-code/issues/11364)

---

## Next Steps

1. **Implement Phase 1** (Quick Wins) - 1 week
2. **Validate with A/B testing** - 1 week
3. **Measure actual token reduction** - ongoing
4. **Deploy Phase 2** if Phase 1 successful - 2 weeks
5. **Update documentation** with new cost estimates

**Priority**: Start with Quick Win #2 (Dependency Summaries) - biggest impact, lowest risk.
