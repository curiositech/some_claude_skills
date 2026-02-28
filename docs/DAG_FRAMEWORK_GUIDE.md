# DAG Framework Guide

> **How to use the DAG execution framework for any project**

The DAG (Directed Acyclic Graph) Framework transforms complex tasks into parallelizable agent workflows. Instead of executing tasks sequentially, it identifies independent work that can run concurrently, dramatically reducing total execution time.

---

## Quick Start (30 Seconds)

```bash
# In any project with the DAG framework installed:
cd your-project/

# Option 1: Natural language task → Automatic decomposition
npx tsx src/dag/demos/decompose-and-execute.ts simple
# Then paste your task when prompted

# Option 2: Invoke via Claude Code skill
# Just say: "Execute this task using DAG: [your task description]"
```

---

## The Core Concept

### Before DAG (Sequential)
```
Task A → Task B → Task C → Task D → Task E
         Total time: 5 hours
```

### After DAG (Parallel Waves)
```
Wave 1:  [Task A, Task B]     ← Run in parallel
              ↓
Wave 2:  [Task C, Task D]     ← Run in parallel
              ↓
Wave 3:  [Task E]
         Total time: ~2.5 hours (2x speedup)
```

---

## The 5-Step Workflow

### Step 1: Task Decomposition

The framework uses Claude API to decompose your natural language task into subtasks:

**Input:**
> "Build me a landing page for a SaaS product"

**Output:**
```json
{
  "subtasks": [
    { "id": "brand-identity", "description": "Create brand identity...", "dependencies": [] },
    { "id": "copywriting", "description": "Write conversion copy...", "dependencies": [] },
    { "id": "wireframe", "description": "Design page structure...", "dependencies": ["brand-identity"] },
    { "id": "implementation", "description": "Build with React...", "dependencies": ["wireframe", "copywriting"] },
    { "id": "seo-optimization", "description": "Optimize for search...", "dependencies": ["implementation"] }
  ]
}
```

### Step 2: Skill Matching

Each subtask is matched to the best available skill using hybrid matching:
- **Keyword matching**: Direct term overlap (fast)
- **Semantic matching**: Meaning similarity via embeddings (accurate)
- **Capability matching**: Required abilities vs. skill capabilities

```
brand-identity    → web-design-expert      (confidence: 0.85)
copywriting       → technical-writer       (confidence: 0.78)
wireframe         → mobile-ux-optimizer    (confidence: 0.72)
implementation    → pwa-expert             (confidence: 0.80)
seo-optimization  → seo-visibility-expert  (confidence: 0.88)
```

### Step 3: Dependency Resolution

The framework builds a DAG by analyzing:
1. **Explicit dependencies** from decomposition
2. **File conflicts** (two tasks writing same file → sequential)
3. **Singleton tasks** (build, test, deploy → run alone)

```
brand-identity ─────┐
                    ├──→ wireframe ───┐
copywriting ────────┴─────────────────┼──→ implementation ──→ seo-optimization
```

### Step 4: Wave Scheduling

Tasks are grouped into waves using topological sort:

| Wave | Tasks | Parallelizable? | Why |
|------|-------|-----------------|-----|
| 1 | brand-identity, copywriting | ✅ Yes | No dependencies, different files |
| 2 | wireframe | ❌ No | Single task |
| 3 | implementation | ❌ No | Single task |
| 4 | seo-optimization | ❌ No | Single task |

### Step 5: Execution

For each wave, the framework generates Task tool calls:

```typescript
// Wave 1 - Execute BOTH in a single message for true parallelism
Task({
  description: "Execute web-design-expert: brand-identity",
  subagent_type: "web-design-expert",
  model: "sonnet",
  prompt: "Create a comprehensive brand identity system..."
});

Task({
  description: "Execute technical-writer: copywriting",
  subagent_type: "technical-writer",
  model: "sonnet",
  prompt: "Write conversion-optimized copy..."
});
```

---

## Using the Framework in Your Projects

### Option A: Copy the Framework

```bash
# Copy DAG components to your project
cp -r some_claude_skills/website/src/dag your-project/src/dag

# Copy the skills you need
cp -r some_claude_skills/.claude/skills/dag-* ~/.claude/skills/

# Install dependencies
npm install @anthropic-ai/sdk  # For decomposition
```

### Option B: Use as a Submodule

```bash
git submodule add https://github.com/curiositech/some_claude_skills.git lib/skills
```

### Option C: Just Use the Skills

```bash
# Copy only the DAG meta-skills
cp -r some_claude_skills/.claude/skills/dag-executor ~/.claude/skills/
cp -r some_claude_skills/.claude/skills/dag-graph-builder ~/.claude/skills/
# ... etc

# Then invoke in Claude Code:
# "Use dag-executor to decompose and run: [your task]"
```

---

## Creating Your Own DAG

### Manual DAG Creation (JSON)

```json
{
  "id": "my-project-dag",
  "name": "My Project Task",
  "nodes": [
    {
      "id": "task-a",
      "description": "First task",
      "dependencies": [],
      "skillMatch": "skill-name",
      "predictedFiles": ["src/file-a.ts"]
    },
    {
      "id": "task-b",
      "description": "Second task",
      "dependencies": ["task-a"],
      "skillMatch": "another-skill",
      "predictedFiles": ["src/file-b.ts"]
    }
  ],
  "edges": [
    { "from": "task-a", "to": ["task-b"] }
  ]
}
```

### Programmatic DAG Creation

```typescript
import { DAGBuilder } from './src/dag/core/dag-builder';

const builder = new DAGBuilder('my-dag');

builder
  .addNode({ id: 'research', description: 'Research phase' })
  .addNode({ id: 'design', description: 'Design phase' })
  .addNode({ id: 'implement', description: 'Implementation', dependencies: ['research', 'design'] })
  .addEdge('research', 'implement')
  .addEdge('design', 'implement');

const dag = builder.build();
const waves = dag.getExecutionWaves();
```

### Natural Language → DAG

```typescript
import { TaskDecomposer } from './src/dag/decomposition/task-decomposer';

const decomposer = new TaskDecomposer();
const result = await decomposer.decompose(
  "Build a REST API with authentication, database, and tests"
);

// result.dag contains the full DAG
// result.waves contains the execution plan
```

---

## Key Framework Components

| Component | Purpose | File |
|-----------|---------|------|
| **TaskDecomposer** | Natural language → subtasks | `src/dag/decomposition/task-decomposer.ts` |
| **SkillMatcher** | Subtasks → skill assignments | `src/dag/registry/skill-matcher.ts` |
| **DAGBuilder** | Construct graphs programmatically | `src/dag/core/dag-builder.ts` |
| **TopologicalScheduler** | Generate execution waves | `src/dag/scheduling/topological-scheduler.ts` |
| **ClaudeCodeRuntime** | Execute via Task tool | `src/dag/runtimes/claude-code-runtime.ts` |

---

## The 25 DAG Meta-Skills

The framework includes specialized skills for each concern:

### Core Orchestration
- **dag-executor** - End-to-end orchestration
- **dag-graph-builder** - Programmatic DAG construction
- **dag-task-scheduler** - Wave scheduling and optimization
- **dag-parallel-executor** - Concurrent task execution

### Skill Matching
- **dag-semantic-matcher** - Embedding-based similarity
- **dag-capability-ranker** - Multi-factor skill scoring
- **dag-skill-registry** - Skill catalog management

### Quality Assurance
- **dag-output-validator** - Result validation
- **dag-confidence-scorer** - Calibrated confidence
- **dag-hallucination-detector** - Fact verification

### Iteration & Feedback
- **dag-iteration-detector** - Detect when to retry
- **dag-feedback-synthesizer** - Actionable improvements
- **dag-convergence-monitor** - Track quality trends

### Observability
- **dag-execution-tracer** - Full execution paths
- **dag-performance-profiler** - Timing analysis
- **dag-failure-analyzer** - Root cause analysis

---

## Best Practices

### 1. Start with Decomposition

Don't manually create DAGs for complex tasks. Let the decomposer analyze:
```
npx tsx src/dag/demos/decompose-and-execute.ts simple
```

### 2. Use Haiku for Simple Tasks

Save tokens and cost:
```typescript
Task({
  model: "haiku",  // Fast, cheap for simple tasks
  // ...
});
```

### 3. Maximize Parallelism

When the plan shows `parallelizable: true`, make ALL Task calls in ONE message:
```typescript
// ✅ Correct - true parallelism
Task({ /* task A */ });
Task({ /* task B */ });
Task({ /* task C */ });

// ❌ Wrong - sequential execution
Task({ /* task A */ });
// wait...
Task({ /* task B */ });
// wait...
```

### 4. Pass Minimal Context

Don't overwhelm agents with data from previous waves:
```typescript
// ✅ Pass only what's needed
prompt: "Using the color palette from Wave 1 (primary: #000080, accent: #c0c0c0), create..."

// ❌ Don't dump entire previous outputs
prompt: "[10KB of Wave 1 output...] Now do..."
```

### 5. Handle Failures Gracefully

```typescript
// Mark dependent tasks as skipped if a task fails
if (waveResult.failed.includes('task-a')) {
  skipDependents(['task-b', 'task-c']);
}
```

---

## Example: Using DAG for a New Project

Say you're starting a new mobile app:

```bash
# 1. Create project
mkdir my-app && cd my-app

# 2. Copy DAG framework
cp -r ~/coding/some_claude_skills/website/src/dag src/dag

# 3. Ask Claude to decompose your task
claude "Use dag-executor to decompose and plan:
Build a React Native app with:
- User authentication (Firebase)
- Home feed with infinite scroll
- User profiles with edit capability
- Push notifications
- Offline support"

# 4. Review the generated DAG
cat generated-dag.json | jq '.waves'

# 5. Execute wave by wave
claude "Execute Wave 1 of the DAG"
# ... review results ...
claude "Execute Wave 2 of the DAG"
```

---

## Limitations

- **Max ~5-10 parallel tasks** per wave (Claude Code limit)
- **Isolated agents** - no shared memory between tasks
- **Context must be explicit** - pass data between waves manually
- **File prediction isn't perfect** - decomposer may miss conflicts
- **Critical path determines minimum time** - some work can't parallelize

---

## Further Reading

- [MASTER_IMPLEMENTATION_PLAN.md](./MASTER_IMPLEMENTATION_PLAN.md) - Strategic synthesis from 6 agents
- [site-revitalization-dag.json](../website/site-revitalization-dag.json) - Example DAG for this project
- [dag-executor SKILL.md](../.claude/skills/dag-executor/SKILL.md) - Core orchestration skill

---

*The DAG Framework turns "do this complex thing" into "here are 5 things you can do in parallel, then 3 more, then 2 more." That's the difference between 8 hours and 3 hours.*
