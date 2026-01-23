# Agent Coordination System

**Date**: 2026-01-14
**Version**: 1.0
**Status**: Implemented

---

## Overview

The DAG Framework now includes a comprehensive coordination system that prevents parallel agents from stepping on each other during execution. This solves the critical problem of file conflicts and resource contention when multiple agents run simultaneously.

### The Problem

When multiple Task agents execute in parallel:
- ❌ They might edit the same file simultaneously (data loss/conflicts)
- ❌ They might all run `npm run build` at once (wasted resources)
- ❌ They might all try to fix the same linter error
- ❌ No mechanism to prevent collisions

### The Solution

Three-layer coordination:
1. **File Lock Manager** - Prevents file edit conflicts
2. **Singleton Task Coordinator** - Ensures build/lint/test run once
3. **Conflict Detector** - Analyzes waves for conflicts during planning

---

## Architecture

```
Task Decomposition (Claude API)
    ↓
Conflict Detection (analyzes predicted files)
    ↓
Execution Planning (marks waves as parallelizable or not)
    ↓
File Lock Acquisition (runtime - not yet implemented)
    ↓
Parallel Task Execution (Claude Code Task tool)
    ↓
Lock Release (automatic cleanup)
```

---

## Components

### 1. FileLockManager

**Location**: `website/src/dag/coordination/file-lock-manager.ts`

**Purpose**: Coordinates file access across parallel agents

**How it works**:
```typescript
import { getSharedLockManager } from './dag';

const lockManager = getSharedLockManager();

// Agent 1 tries to edit src/App.tsx
const result = lockManager.acquireLock('src/App.tsx', 'agent-1', 'write');

if (result.success) {
  // Agent 1 can safely edit
} else {
  // File locked by ${result.owner}, wait ${result.expiresIn}ms
}

// When done
lockManager.releaseLock('src/App.tsx', 'agent-1');
```

**Features**:
- File-based locking (`.claude/locks/*.lock`)
- Auto-expiry (default: 5 minutes TTL)
- Read/write lock support
- Automatic cleanup of expired locks

**Lock File Format**:
```json
{
  "filePath": "src/App.tsx",
  "owner": "agent-brand-identity",
  "timestamp": 1705235400000,
  "ttl": 300000,
  "operation": "write"
}
```

---

### 2. SingletonTaskCoordinator

**Location**: `website/src/dag/coordination/singleton-task-coordinator.ts`

**Purpose**: Ensures singleton operations (build, lint, test) run once at a time

**How it works**:
```typescript
import { getSharedSingletonCoordinator, SINGLETON_TASKS } from './dag';

const coordinator = getSharedSingletonCoordinator();

// Agent wants to run build
const result = coordinator.acquire(
  SINGLETON_TASKS.BUILD,
  'agent-implementation',
  'npm run build'
);

if (result.success) {
  // Run build
} else {
  // Build already running by ${result.currentOwner}
  // Wait ${result.estimatedTimeRemaining}ms
}

// When done
coordinator.release(SINGLETON_TASKS.BUILD, 'agent-implementation');
```

**Singleton Types**:
- `build` - npm run build, yarn build, etc.
- `lint` - eslint, npm run lint
- `test` - jest, vitest, npm test
- `typecheck` - tsc --noEmit
- `install` - npm install, yarn install
- `deploy` - Deployment operations

**Auto-Detection**:
```typescript
const detected = SingletonTaskCoordinator.detectSingletonTask(
  'Run npm run build to compile the project'
);
// → SINGLETON_TASKS.BUILD
```

---

### 3. ConflictDetector

**Location**: `website/src/dag/coordination/conflict-detector.ts`

**Purpose**: Analyzes DAG waves for file conflicts and singleton violations

**How it works**:
```typescript
import { ConflictDetector } from './dag';

const analysis = ConflictDetector.analyzeWave(
  dag,
  ['task-1', 'task-2'],
  subtaskMap
);

if (analysis.canParallelize) {
  // Execute tasks in parallel
} else {
  // Conflicts detected: ${analysis.remediation}
  // Execute sequentially
}
```

**Conflict Types**:

1. **File Conflicts**:
```typescript
{
  type: 'file',
  nodeIds: ['brand-identity', 'wireframe'],
  filePath: 'src/App.tsx',
  description: 'File src/App.tsx modified by multiple tasks'
}
```

2. **Singleton Conflicts**:
```typescript
{
  type: 'singleton',
  nodeIds: ['implementation', 'testing'],
  singletonType: 'build',
  description: 'Multiple build tasks cannot run in parallel'
}
```

---

## Integration

### Task Decomposition

The TaskDecomposer now asks Claude API to predict files:

```json
{
  "subtasks": [
    {
      "id": "brand-identity",
      "description": "Create brand identity system",
      "predictedFiles": [
        "src/styles/colors.css",
        "src/styles/typography.css"
      ],
      "singletonType": null
    },
    {
      "id": "build",
      "description": "Run npm run build",
      "predictedFiles": [],
      "singletonType": "build"
    }
  ]
}
```

**Decomposition Prompt Enhancement**:
```
6. **CRITICAL**: Predict which files each subtask will modify
   - Be specific (e.g., "src/components/Header.tsx" not "components")
   - Include all files the agent might create/modify

7. **CRITICAL**: Set "singletonType" if task is build/lint/test
   - These operations should only run once at a time
   - Examples: "npm run build" → "build"
```

---

### Execution Planning

The ClaudeCodeRuntime now uses conflict detection:

```typescript
// Before (simple check)
parallelizable: wave.nodeIds.length > 1

// After (conflict analysis)
const analysis = ConflictDetector.analyzeWave(dag, wave.nodeIds, subtaskMap);
parallelizable: analysis.canParallelize
```

**Execution Plan with Conflicts**:
```typescript
{
  waveNumber: 2,
  nodeIds: ['brand-identity', 'wireframe'],
  parallelizable: false,
  conflicts: [{
    type: 'file',
    nodeIds: ['brand-identity', 'wireframe'],
    filePath: 'src/App.tsx'
  }],
  conflictReason: 'File src/App.tsx modified by multiple tasks. Add dependencies to make sequential.'
}
```

---

## Examples

### Example 1: File Conflict Prevention

**Scenario**: Two tasks both modify `src/App.tsx`

```typescript
// Task decomposition
{
  subtasks: [
    {
      id: 'add-header',
      predictedFiles: ['src/App.tsx', 'src/components/Header.tsx']
    },
    {
      id: 'add-footer',
      predictedFiles: ['src/App.tsx', 'src/components/Footer.tsx']
    }
  ]
}

// Conflict detection
Conflict: Both tasks modify src/App.tsx
Resolution: Tasks marked as sequential

// Execution plan
Wave 2a: [add-header]  ← Runs first
Wave 2b: [add-footer]  ← Runs after
```

**Result**: No file conflicts ✅

---

### Example 2: Singleton Task Coordination

**Scenario**: Multiple agents try to run build

```typescript
// Task decomposition
{
  subtasks: [
    { id: 'implementation', singletonType: null },
    { id: 'build-1', singletonType: 'build' },
    { id: 'build-2', singletonType: 'build' }
  ]
}

// Conflict detection
Conflict: Multiple build tasks in same wave
Resolution: Build tasks separated into sequential waves

// Execution plan
Wave 3: [implementation]
Wave 4: [build-1]  ← Only one build runs
Wave 5: [build-2]  ← (This shouldn't happen - decomposer should prevent)
```

**Better Decomposition**:
```typescript
{
  subtasks: [
    { id: 'implementation' },
    { id: 'build', singletonType: 'build' }  ← Single build task
  ]
}
```

---

### Example 3: Smart Parallelization

**Scenario**: Tasks modify different files

```typescript
// Task decomposition
{
  subtasks: [
    {
      id: 'brand-identity',
      predictedFiles: ['src/styles/colors.css', 'src/styles/typography.css']
    },
    {
      id: 'wireframe',
      predictedFiles: ['src/components/Layout.tsx', 'src/pages/Home.tsx']
    }
  ]
}

// Conflict detection
No conflicts: Different file sets
Resolution: Can parallelize

// Execution plan
Wave 2: [brand-identity, wireframe]
  Parallelizable: Yes ✅
  Conflicts: None
```

**Result**: Tasks run in parallel, 2x faster ⚡

---

## Best Practices

### For Task Decomposition

1. **Be specific about files**:
   - ✅ `"src/components/Header.tsx"`
   - ❌ `"components"`

2. **Predict all modifications**:
   - Include files to be created
   - Include files to be modified
   - Don't include files that are only read

3. **Avoid file overlap**:
   - If two tasks modify same file, add dependency
   - Better: decompose differently to avoid overlap

4. **Mark singleton tasks**:
   - Any build/lint/test operation
   - Only one instance should run

### For Execution

1. **Trust the planner**:
   - If `parallelizable: true`, safe to run in parallel
   - If `parallelizable: false`, conflicts detected - run sequentially

2. **Check conflicts**:
   ```typescript
   if (wave.conflicts) {
     console.log('Conflicts:', wave.conflictReason);
   }
   ```

3. **Monitor locks**:
   ```typescript
   const activeLocks = lockManager.getAllLocks();
   console.log(`Active locks: ${activeLocks.length}`);
   ```

---

## Testing

### Manual Testing

```bash
cd website/

# Test decomposition with file prediction
npx tsx src/dag/demos/decompose-and-execute.ts simple

# Verify conflict detection
# - Check for "predictedFiles" in subtasks
# - Check for "conflicts" in waves
# - Verify "parallelizable" is based on conflicts
```

### Unit Testing

```typescript
// Test file conflict detection
const analysis = ConflictDetector.analyzeWave(dag, ['task1', 'task2'], subtaskMap);
expect(analysis.canParallelize).toBe(false);
expect(analysis.conflicts[0].type).toBe('file');

// Test singleton detection
const type = SingletonTaskCoordinator.detectSingletonTask('npm run build');
expect(type).toBe(SINGLETON_TASKS.BUILD);

// Test lock acquisition
const result = lockManager.acquireLock('src/App.tsx', 'agent1', 'write');
expect(result.success).toBe(true);
```

---

## Limitations

### Current Limitations

1. **File prediction accuracy**: Depends on Claude API's ability to predict file modifications
   - Claude may not always predict correctly
   - Edge cases (dynamic file creation) may be missed

2. **No runtime lock enforcement**: Locks are acquired during planning but not enforced during execution
   - Agents must cooperate
   - No enforcement if agent directly uses Write tool

3. **No cross-session coordination**: Locks only work within a single Claude Code session
   - Multiple sessions can conflict
   - Git worktrees still needed for true isolation

4. **Simple conflict resolution**: Only detects exact file path matches
   - Wildcard patterns have limited support
   - Directory-level conflicts not detected

### Future Enhancements

1. **Runtime lock enforcement**:
   - Wrap Write/Edit tools to check locks before execution
   - Return error if file is locked by another agent

2. **Cross-session coordination**:
   - Use Redis or SQLite for shared lock storage
   - Enable coordination across multiple Claude Code sessions

3. **Advanced conflict detection**:
   - Directory-level locks (`src/components/*`)
   - Conflict prediction based on import analysis
   - Merge conflict risk assessment

4. **Lock visualization**:
   - Dashboard showing active locks
   - Visual DAG with file ownership coloring
   - Real-time conflict warnings

---

## Files Created

1. `website/src/dag/coordination/file-lock-manager.ts` (335 lines)
   - File locking implementation

2. `website/src/dag/coordination/singleton-task-coordinator.ts` (303 lines)
   - Singleton task management

3. `website/src/dag/coordination/conflict-detector.ts` (282 lines)
   - Conflict analysis

**Total**: 920 lines of coordination infrastructure

---

## Summary

The Agent Coordination System provides:
- ✅ File conflict prevention through predicted file analysis
- ✅ Singleton task coordination (build/lint/test)
- ✅ Smart parallelization based on conflict detection
- ✅ Automatic lock management (file-based, auto-expiring)

**Impact**:
- Prevents data loss from concurrent file edits
- Prevents wasted resources (multiple builds)
- Enables safe parallel agent execution
- Works within Claude Code's shared-filesystem model

**Recommendation**:
Use this coordination system for all DAG executions. The decomposer will automatically predict files and detect conflicts, ensuring safe parallelization.

For true filesystem isolation, git worktrees are still recommended (future work).
