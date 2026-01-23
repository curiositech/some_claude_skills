# Claude Code Task Tool Parallelization Investigation

**Date**: 2026-01-15
**Investigator**: AI Engineer Skill
**Status**: ⚠️ CRITICAL FINDINGS

---

## Executive Summary

The DAG framework's value proposition is based on parallel execution of tasks to achieve speedup (claimed 1.29x-3x faster). This investigation examined whether Claude Code's Task tool actually supports parallel execution and what the documented limits are.

**Key Findings**:
1. ✅ **Parallel execution IS supported** - Multiple Task calls in a single message execute concurrently
2. ⚠️ **Hard limit of 10 concurrent tasks** - Not unlimited parallelization
3. ⚠️ **20k token overhead per task** - Expensive for large DAGs
4. ❌ **Background mode has a critical bug** - Cannot write files in certain environments
5. ✅ **DAG framework defaults to foreground mode** - Not affected by the bug

---

## 1. Parallel Execution Capabilities

### Documented Behavior

According to community reports and official documentation:

> **Maximum Parallelism**: The Task tool is capped at **10 concurrent operations**. You can queue more tasks, but only 10 Tasks or subagents run simultaneously, executing in batches. ([ClaudeLog](https://claudelog.com/mechanics/task-agent-tools/))

> **Batching**: When providing a parallelism level, Claude Code will execute tasks in parallel but in batches, waiting until all tasks in the current batch are completed before starting the next batch. ([Medium - Multi-agent parallel coding](https://medium.com/@codecentrevibe/claude-code-multi-agent-parallel-coding-83271c4675fa))

### How to Parallelize

To execute tasks in parallel, **make multiple Task tool calls in a single message**:

```typescript
// ✅ CORRECT - Parallel execution
assistant: "I'll run these tasks in parallel:"
<Task call 1>
<Task call 2>
<Task call 3>
// All 3 execute concurrently

// ❌ WRONG - Sequential execution
assistant: "Running task 1..."
<Task call 1>
assistant: "Now running task 2..."
<Task call 2>
// Tasks execute one after another
```

**Our DAG Runtime**: The `executeWave()` method (line 408-480) is designed to generate multiple Task calls per wave, which **should enable parallel execution** when implemented in real Claude Code.

---

## 2. Performance Limits

### Token Overhead

Each Task starts with a **20k token overhead**:

> Each Task starts with a 20k token overhead, so a "quick file search" with 10 parallel tasks could cost 200k tokens before any actual work begins. ([Amit Kothari - Task tool vs subagents](https://amitkoth.com/claude-code-task-tool-vs-subagents/))

**Implications for DAG Framework**:
- Wave with 9 tasks = 180k token overhead minimum
- Add prompt content (100-500 tokens per task) = ~190k-185k tokens
- Approaching context limits quickly
- Much more expensive than anticipated

### Max Parallelism Cap

The **hard limit of 10 concurrent tasks** means:
- Waves with &gt;10 tasks must be split into batches
- Actual parallelism is capped, reducing speedup
- Claims of "unlimited parallelization" are false

**Example**: Wave with 15 tasks
- Batch 1: 10 tasks (parallel)
- Batch 2: 5 tasks (parallel)
- **Not** all 15 running simultaneously

---

## 3. Background Mode File Writing Bug

### The Critical Bug

**GitHub Issue #14242**: [Background task fails with EPERM when user lacks write access to drive root](https://github.com/anthropics/claude-code/issues/14242)

**Description**:
> Background tasks fail with "EPERM: operation not permitted" when Claude Code attempts to create a temp directory at the drive root (e.g., H:\tmp) instead of using the system temp directory.

**Affected Scenarios**:
- Mapped network drives
- Working directories where users lack root write permissions
- Drives without admin access

**Impact**: Background agents **cannot write files** in these environments, making `run_in_background: true` unusable for file modification tasks.

### DAG Framework Status

**✅ SAFE**: Our DAG runtime **defaults to foreground mode**:

```typescript
// website/src/dag/runtimes/claude-code-cli.ts:103
runInBackground: config.runInBackground || false,
```

**Recommendation**: **Do not enable background mode** until this bug is fixed upstream. The framework is safe to use in foreground mode.

---

## 4. Community Validation

Multiple practitioners have successfully used parallel Task execution:

1. **Zach Wills** - [How to Use Claude Code Subagents to Parallelize Development](https://zachwills.net/how-to-use-claude-code-subagents-to-parallelize-development/)
   - Documents "7-parallel-Task method" for feature implementation
   - Reports success with parallel workflows

2. **Cuong Tham** - [Multi-agent parallel coding](https://medium.com/@codecentrevibe/claude-code-multi-agent-parallel-coding-83271c4675fa)
   - Demonstrates Task orchestration in parallel
   - Confirms batching behavior

3. **Simon Willison** - [Embracing the parallel coding agent lifestyle](https://simonwillison.net/2025/Oct/5/parallel-coding-agents/)
   - Reports agents "so active they start hitting API rate limits"
   - Validates real-world parallel execution

---

## 5. Revised Performance Expectations

### Theoretical Speedup Calculation

Given the **10-task cap**, let's recalculate the example from `DAG_COMPLETE.md`:

**Original Claim**:
- 9 tasks total
- 7 waves (sequential)
- Claimed speedup: 1.29x

**Reality Check**:
- Wave 4: 2 tasks (parallel) ✅ Within cap
- Wave 5: 2 tasks (parallel) ✅ Within cap
- All other waves: 1 task (sequential)

**Conclusion**: The claimed 1.29x speedup **is achievable** because no wave exceeds 10 tasks.

**However**, for larger DAGs:
- Wave with 20 tasks → split into 2 batches (10 + 10)
- Actual speedup reduced by batching overhead
- Must revise speedup calculations

### Token Cost Reality

**Example DAG** (9 tasks, 7 waves):
- Token overhead: 9 × 20k = 180k tokens
- Prompt content: 9 × 300 = 2.7k tokens
- **Total before execution**: ~183k tokens
- Actual execution tokens: varies by task

**Cost Analysis**:
- Claude Sonnet: $3/M input tokens
- 183k tokens = $0.55 per DAG execution
- For claimed "100 decompositions/day": $55/day = $1,650/month

**Original Estimate** (~$3/month) was **off by 550x**!

---

## 6. Recommendations

### For DAG Framework

1. **✅ Keep background mode disabled** - Bug makes it unreliable
2. **⚠️ Add batch splitting for waves &gt;10 tasks** - Respect the cap
3. **⚠️ Revise cost estimates** - Account for 20k token overhead
4. **⚠️ Update speedup calculations** - Factor in batching
5. **✅ Document token overhead** - Set user expectations

### For Production Use

**When DAG Framework is Cost-Effective**:
- ✅ Small DAGs (3-10 tasks)
- ✅ High-value tasks (research, analysis, planning)
- ✅ Tasks with natural parallelism
- ❌ Large DAGs (&gt;20 tasks) - token costs explode
- ❌ Simple tasks - overhead exceeds benefit
- ❌ Budget-constrained scenarios

### Code Changes Needed

```typescript
// In ClaudeCodeRuntime.generateExecutionPlan()
// Split waves larger than 10 tasks into batches

private splitIntoB batches(nodeIds: NodeId[], batchSize: number = 10): NodeId[][] {
  const batches: NodeId[][] = [];
  for (let i = 0; i < nodeIds.length; i += batchSize) {
    batches.push(nodeIds.slice(i, i + batchSize));
  }
  return batches;
}

// Update wave generation to account for batching
for (const wave of waves) {
  if (wave.nodeIds.length > 10) {
    const batches = this.splitIntoBatches(wave.nodeIds);
    for (const batch of batches) {
      plan.waves.push({
        waveNumber: wave.waveNumber,
        nodeIds: batch,
        parallelizable: true,
        batchInfo: `Batch ${batches.indexOf(batch) + 1}/${batches.length}`,
      });
    }
  } else {
    // Existing logic
  }
}
```

---

## 7. Sources

All findings are based on official documentation and community reports from 2025:

1. [ClaudeLog - Task/Agent Tools](https://claudelog.com/mechanics/task-agent-tools/) - Parallelization limits documentation
2. [Multi-agent parallel coding - Medium](https://medium.com/@codecentrevibe/claude-code-multi-agent-parallel-coding-83271c4675fa) - Batching behavior
3. [GitHub Issue #14242](https://github.com/anthropics/claude-code/issues/14242) - Background mode file writing bug
4. [How to Use Claude Code Subagents](https://zachwills.net/how-to-use-claude-code-subagents-to-parallelize-development/) - 7-parallel-Task method
5. [Parallel coding agent lifestyle - Simon Willison](https://simonwillison.net/2025/Oct/5/parallel-coding-agents/) - Real-world usage
6. [Claude Code - Task tool vs subagents](https://amitkoth.com/claude-code-task-tool-vs-subagents/) - Token overhead analysis
7. [Claude Code Subagent Deep Dive](https://cuong.io/blog/2025/06/24-claude-code-subagent-deep-dive) - Architecture patterns

---

## 8. Conclusion

**Parallel execution IS real** ✅
- Multiple Task calls in single message execute concurrently
- Community validation confirms it works
- DAG framework design is sound

**But with significant caveats** ⚠️
- Hard cap of 10 concurrent tasks
- 20k token overhead per task (expensive!)
- Background mode has critical bugs
- Batching reduces speedup for large DAGs

**Action Items**:
1. Update `DAG_COMPLETE.md` with accurate cost estimates
2. Implement batch splitting for waves &gt;10 tasks
3. Add warning about token overhead to documentation
4. Keep background mode disabled
5. Revise "production ready" claim to include caveats

**Bottom Line**: The DAG framework **can achieve parallelization**, but the costs are much higher than anticipated and there are hard limits on concurrency. It's suitable for small, high-value DAGs but not for large-scale execution.
