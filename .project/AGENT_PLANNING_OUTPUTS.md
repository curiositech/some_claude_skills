# Agent Planning Outputs - Rejuvenation Project

**Generated**: 2026-01-15
**Purpose**: Preserved raw outputs from Plan agents for reference and artifacts

---

## Agent 1: DAG Framework Extraction Plan

### Executive Summary

The DAG framework in `/Users/erichowens/coding/some_claude_skills/website/src/dag/` is a sophisticated ~38,000 line TypeScript system for orchestrating parallel AI agent execution. This plan details how to extract it into `claude-dag-framework`, a standalone npm package designed to impress Anthropic hiring managers while being genuinely useful for the community.

---

### Repository Structure

```
claude-dag-framework/
├── README.md                     # Impressive overview with architecture diagrams
├── LICENSE                       # MIT or Apache 2.0
├── CONTRIBUTING.md              # Contribution guidelines
├── CHANGELOG.md                 # Version history
├── package.json                 # npm package configuration
├── tsconfig.json                # TypeScript configuration
├── tsconfig.build.json          # Build-specific TypeScript config
├── vitest.config.ts             # Test configuration
├── .github/
│   ├── workflows/
│   │   ├── ci.yml               # CI pipeline
│   │   ├── publish.yml          # npm publish on release
│   │   └── docs.yml             # Documentation deployment
│   └── ISSUE_TEMPLATE/
├── docs/
│   ├── architecture.md          # System architecture deep dive
│   ├── getting-started.md       # Quick start guide
│   ├── api/                     # Auto-generated API docs (TypeDoc)
│   ├── guides/
│   │   ├── executors.md         # Choosing the right executor
│   │   ├── permissions.md       # Permission system guide
│   │   ├── feedback-loops.md    # Iterative refinement guide
│   │   └── persistence.md       # DAG persistence and recovery
│   └── examples/                # Detailed example walkthroughs
├── src/
│   ├── index.ts                 # Main entry point (clean re-exports)
│   ├── types/
│   │   ├── index.ts
│   │   ├── dag.ts               # Core DAG types
│   │   ├── permissions.ts       # Permission matrix types
│   │   └── agents.ts            # Agent-related types
│   ├── core/
│   │   ├── index.ts
│   │   ├── topology.ts          # Graph algorithms
│   │   ├── builder.ts           # Fluent DAG builder
│   │   ├── executor.ts          # Base executor
│   │   ├── state-manager.ts     # State machine
│   │   ├── task-decomposer.ts   # NL -> subtasks
│   │   ├── skill-matcher.ts     # Multi-strategy matcher (NEW: enhanced)
│   │   ├── embedding-service.ts # OpenAI embeddings
│   │   └── embedding-cache.ts   # Persistent cache
│   ├── executors/
│   │   ├── index.ts
│   │   ├── types.ts             # Executor interfaces
│   │   ├── registry.ts          # Executor registry
│   │   ├── process-executor.ts  # claude -p (DEFAULT)
│   │   ├── worktree-executor.ts # Git worktrees
│   │   └── task-tool-executor.ts # Task tool (legacy)
│   ├── permissions/
│   │   ├── index.ts
│   │   ├── presets.ts           # Permission presets
│   │   ├── validator.ts         # Permission validation
│   │   └── enforcer.ts          # Runtime enforcement
│   ├── coordination/
│   │   ├── index.ts
│   │   ├── file-lock-manager.ts # File conflict prevention
│   │   ├── singleton-task-coordinator.ts # Build/test serialization
│   │   └── conflict-detector.ts # Proactive conflict detection
│   ├── runtimes/
│   │   ├── index.ts
│   │   ├── claude-code-cli.ts   # Claude Code runtime
│   │   ├── sdk-typescript.ts    # TypeScript SDK runtime
│   │   └── http-api.ts          # HTTP API runtime
│   ├── registry/
│   │   ├── index.ts
│   │   ├── skill-registry.ts    # Skill catalog
│   │   ├── semantic-matcher.ts  # TF-IDF + keyword matching
│   │   ├── capability-ranker.ts # Skill ranking
│   │   └── skill-loader.ts      # Dynamic skill loading
│   ├── quality/
│   │   ├── index.ts
│   │   ├── output-validator.ts  # JSON schema validation
│   │   ├── hallucination-detector.ts # Fact checking
│   │   └── confidence-scorer.ts # Output confidence
│   ├── feedback/                # NEW: Enhanced for recovery
│   │   ├── index.ts
│   │   ├── iteration-detector.ts # When to retry
│   │   ├── feedback-synthesizer.ts # Actionable feedback
│   │   ├── convergence-monitor.ts # Goal tracking
│   │   └── recovery-manager.ts  # NEW: Failed task recovery
│   ├── observability/
│   │   ├── index.ts
│   │   ├── execution-tracer.ts  # Full execution traces
│   │   ├── performance-profiler.ts # Token/cost analysis
│   │   ├── failure-analyzer.ts  # Root cause analysis
│   │   └── pattern-learner.ts   # Learning from history
│   └── persistence/             # NEW: DAG persistence
│       ├── index.ts
│       ├── checkpoint-manager.ts # State checkpointing
│       ├── storage-adapters/
│       │   ├── memory-adapter.ts
│       │   ├── localstorage-adapter.ts
│       │   └── file-adapter.ts
│       └── dag-serializer.ts    # DAG JSON import/export
├── examples/
│   ├── basic/
│   │   ├── hello-world.ts       # Simplest possible DAG
│   │   ├── linear-pipeline.ts   # Sequential tasks
│   │   └── parallel-research.ts # Parallel execution demo
│   ├── advanced/
│   │   ├── code-review-system.ts    # Multi-agent code review
│   │   ├── content-pipeline.ts      # Research -> Write -> Edit
│   │   ├── iterative-refinement.ts  # Feedback loop demo
│   │   └── semantic-matching.ts     # Embedding-based skill selection
│   └── artifacts/               # Real execution artifacts
│       ├── code-review-result.json
│       ├── research-dag-output.json
│       └── README.md            # How artifacts were generated
├── __tests__/
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── scripts/
    ├── benchmark.ts             # Performance benchmarks
    └── generate-docs.ts         # TypeDoc generation
```

---

### Files to Extract vs Leave Behind

#### Files to EXTRACT (Core Framework)

| Source Path | Target Path | Notes |
|-------------|-------------|-------|
| `types/dag.ts` | `src/types/dag.ts` | Core types, no changes |
| `types/permissions.ts` | `src/types/permissions.ts` | Permission matrix |
| `types/agents.ts` | `src/types/agents.ts` | Agent types |
| `types/index.ts` | `src/types/index.ts` | Re-exports |
| `core/` (all files) | `src/core/` | Core algorithms |
| `executors/` (all files) | `src/executors/` | Executor system |
| `permissions/` (all files) | `src/permissions/` | Permission layer |
| `coordination/` (all files) | `src/coordination/` | File coordination |
| `runtimes/` (all files) | `src/runtimes/` | Runtime adapters |
| `registry/` (all files) | `src/registry/` | Skill registry |
| `quality/` (all files) | `src/quality/` | Quality assurance |
| `feedback/` (all files) | `src/feedback/` | Feedback layer |
| `observability/` (all files) | `src/observability/` | Observability |

#### Files to LEAVE BEHIND (Website-Specific)

| File | Reason |
|------|--------|
| `demos/` | Create new standalone demos |
| `registry/skill-loader.ts` | Depends on `../../data/skills` - need abstraction |
| `registry/skill-registry.ts` | Same dependency - needs refactoring |

#### Files to CREATE (New)

| New File | Purpose |
|----------|---------|
| `src/persistence/` | NEW module for checkpoint/recovery |
| `src/feedback/recovery-manager.ts` | NEW: Failed task recovery |
| `examples/` | All new standalone examples |

---

### Implementation Plan for the 3 Missing Features

#### Feature 1: LLM/Semantic Skill Matching (Embedding-Based)

**Current State:** The `skill-matcher.ts` already supports `keyword`, `semantic`, `llm`, and `hybrid` strategies. However:
- It relies on the website's skill data structure
- Embedding cache is file-based, not portable
- No pre-computed embedding index

**Implementation Plan:**

```typescript
// 1. Abstract skill data interface
export interface SkillDefinition {
  id: string;
  name: string;
  description: string;
  categories: string[];
  tags: string[];
  activationKeywords?: string[];
  exclusionKeywords?: string[];
}

// 2. Create portable embedding index
export interface EmbeddingIndex {
  version: string;
  model: string;
  dimensions: number;
  embeddings: Map<string, number[]>;
  metadata: Map<string, { description: string; computedAt: string }>;
}

// 3. Add pre-computed index loading
export class SemanticSkillMatcher {
  async loadIndex(index: EmbeddingIndex): Promise<void>;
  async computeIndex(skills: SkillDefinition[]): Promise<EmbeddingIndex>;
  async findBestMatch(query: string, threshold?: number): Promise<SkillMatch>;
}
```

**Files to Modify:**
- `src/core/skill-matcher.ts` - Abstract away website dependencies
- `src/core/embedding-cache.ts` - Support multiple storage backends
- `src/registry/skill-registry.ts` - Accept any `SkillDefinition[]` array

**New Files:**
- `src/registry/embedding-index.ts` - Pre-computed index management
- `src/registry/skill-adapters.ts` - Adapters for different skill formats

#### Feature 2: Feedback Loop for Failed Task Recovery

**Current State:** The feedback layer has `IterationDetector` and `FeedbackSynthesizer`, but no automatic recovery mechanism. Failed tasks just fail.

**Implementation Plan:**

```typescript
// 1. Recovery strategy types
export type RecoveryStrategy =
  | 'retry-same'           // Retry with same prompt
  | 'retry-with-feedback'  // Retry with synthesized feedback
  | 'decompose-further'    // Break into smaller subtasks
  | 'escalate-model'       // Use more capable model
  | 'human-intervention'   // Pause for human input
  | 'skip-with-fallback';  // Use fallback output

// 2. Recovery manager
export class RecoveryManager {
  async analyzeFailure(
    nodeId: NodeId,
    error: TaskError,
    executionHistory: ExecutionTrace
  ): Promise<RecoveryStrategy>;

  async executeRecovery(
    dag: DAG,
    nodeId: NodeId,
    strategy: RecoveryStrategy,
    context: ExecutionContext
  ): Promise<RecoveryResult>;

  // Configurable recovery policies
  setRecoveryPolicy(policy: RecoveryPolicy): void;
}

// 3. Integration with ClaudeCodeRuntime
interface ClaudeCodeRuntimeConfig {
  // ... existing config
  recoveryManager?: RecoveryManager;
  maxRecoveryAttempts?: number;
  recoveryPolicy?: RecoveryPolicy;
}
```

**Files to Modify:**
- `src/runtimes/claude-code-cli.ts` - Integrate recovery into wave execution
- `src/feedback/feedback-synthesizer.ts` - Add recovery-specific prompts

**New Files:**
- `src/feedback/recovery-manager.ts` - Core recovery logic
- `src/feedback/recovery-strategies.ts` - Strategy implementations

#### Feature 3: Persistence for Interrupted DAGs

**Current State:** No persistence. If execution is interrupted, all state is lost.

**Implementation Plan:**

```typescript
// 1. Storage adapter interface
export interface StorageAdapter {
  save(key: string, data: unknown): Promise<void>;
  load<T>(key: string): Promise<T | null>;
  delete(key: string): Promise<void>;
  list(prefix?: string): Promise<string[]>;
}

// 2. Built-in adapters
export class MemoryStorageAdapter implements StorageAdapter {}
export class LocalStorageAdapter implements StorageAdapter {}
export class FileStorageAdapter implements StorageAdapter {}

// 3. Checkpoint manager
export class CheckpointManager {
  constructor(adapter: StorageAdapter);

  async saveCheckpoint(
    executionId: ExecutionId,
    snapshot: ExecutionSnapshot
  ): Promise<string>;

  async loadCheckpoint(checkpointId: string): Promise<ExecutionSnapshot>;

  async listCheckpoints(dagId?: DAGId): Promise<CheckpointMetadata[]>;

  async resumeFromCheckpoint(
    checkpointId: string,
    runtime: ClaudeCodeRuntime
  ): Promise<DAGExecutionResult>;
}

// 4. DAG serialization
export class DAGSerializer {
  static toJSON(dag: DAG): DAGJson;
  static fromJSON(json: DAGJson): DAG;
  static toFile(dag: DAG, path: string): Promise<void>;
  static fromFile(path: string): Promise<DAG>;
}
```

**New Files:**
- `src/persistence/index.ts` - Module entry
- `src/persistence/storage-adapters/memory-adapter.ts`
- `src/persistence/storage-adapters/localstorage-adapter.ts`
- `src/persistence/storage-adapters/file-adapter.ts`
- `src/persistence/checkpoint-manager.ts`
- `src/persistence/dag-serializer.ts`

---

### Demo/Artifact Ideas

#### Demo 1: "Code Review Pipeline" (Showcases Parallel Execution)

```typescript
// examples/advanced/code-review-system.ts
/**
 * Multi-agent code review that runs:
 * - Security scanner
 * - Performance analyzer
 * - Style checker
 * - Documentation validator
 * ALL IN PARALLEL, then aggregates results
 */
```

**Artifact Output:** `artifacts/code-review-result.json` showing:
- Execution trace with parallel waves
- Token savings vs sequential execution
- Aggregated review with confidence scores

#### Demo 2: "Research to Publication" (Showcases Iterative Refinement)

```typescript
// examples/advanced/content-pipeline.ts
/**
 * DAG that:
 * 1. Researches a topic (web search + summarization)
 * 2. Writes initial draft
 * 3. Reviews and critiques draft
 * 4. Revises based on feedback (FEEDBACK LOOP)
 * 5. Final polish
 */
```

**Artifact Output:** Shows iteration count, feedback synthesis, and convergence.

#### Demo 3: "Interrupted Recovery" (Showcases Persistence)

```typescript
// examples/advanced/interrupted-recovery.ts
/**
 * Simulates a long-running DAG that gets interrupted.
 * Shows how to:
 * 1. Enable checkpointing
 * 2. Simulate interruption
 * 3. Resume from checkpoint
 * 4. Continue to completion
 */
```

#### Demo 4: "Semantic Skill Matching" (Showcases Embedding-Based Matching)

```typescript
// examples/advanced/semantic-matching.ts
/**
 * Shows how natural language queries get matched to skills:
 * - "Build me a chatbot" -> bot-developer skill
 * - "Make my website faster" -> performance-engineer skill
 * Uses pre-computed embedding index for instant matching.
 */
```

---

### Dependencies and Build System

#### package.json

```json
{
  "name": "@curiositech/claude-dag-framework",
  "version": "1.0.0",
  "description": "DAG-based orchestration framework for Claude AI agents",
  "main": "dist/cjs/index.js",
  "module": "dist/esm/index.js",
  "types": "dist/types/index.d.ts",
  "exports": {
    ".": {
      "require": "./dist/cjs/index.js",
      "import": "./dist/esm/index.js",
      "types": "./dist/types/index.d.ts"
    },
    "./executors": {
      "require": "./dist/cjs/executors/index.js",
      "import": "./dist/esm/executors/index.js",
      "types": "./dist/types/executors/index.d.ts"
    },
    "./persistence": {
      "require": "./dist/cjs/persistence/index.js",
      "import": "./dist/esm/persistence/index.js",
      "types": "./dist/types/persistence/index.d.ts"
    }
  },
  "files": ["dist", "README.md", "LICENSE"],
  "scripts": {
    "build": "npm run build:cjs && npm run build:esm && npm run build:types",
    "build:cjs": "tsc -p tsconfig.cjs.json",
    "build:esm": "tsc -p tsconfig.esm.json",
    "build:types": "tsc -p tsconfig.types.json",
    "test": "vitest",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint src/",
    "docs": "typedoc --out docs/api src/index.ts",
    "prepublishOnly": "npm run build && npm run test:coverage"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.71.2"
  },
  "peerDependencies": {
    "typescript": ">=5.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@vitest/coverage-v8": "^2.0.0",
    "eslint": "^9.0.0",
    "prettier": "^3.0.0",
    "typedoc": "^0.26.0",
    "typescript": "~5.6.0",
    "vitest": "^2.0.0"
  },
  "engines": {
    "node": ">=20.0.0"
  },
  "keywords": [
    "claude",
    "ai",
    "dag",
    "orchestration",
    "agents",
    "anthropic",
    "llm"
  ]
}
```

---

### Testing Strategy

#### Test Structure

```
__tests__/
├── unit/
│   ├── core/
│   │   ├── topology.test.ts      # Graph algorithm tests
│   │   ├── builder.test.ts       # DAG builder tests
│   │   ├── state-manager.test.ts # State machine tests
│   │   └── skill-matcher.test.ts # Matching algorithm tests
│   ├── executors/
│   │   ├── process-executor.test.ts
│   │   └── registry.test.ts
│   ├── permissions/
│   │   └── enforcer.test.ts
│   └── persistence/
│       ├── checkpoint-manager.test.ts
│       └── dag-serializer.test.ts
├── integration/
│   ├── dag-execution.test.ts     # Full DAG execution
│   ├── recovery.test.ts          # Failure recovery
│   └── skill-matching.test.ts    # Semantic matching
└── e2e/
    ├── code-review-pipeline.test.ts
    └── content-pipeline.test.ts
```

#### Coverage Targets

| Module | Target | Rationale |
|--------|--------|-----------|
| `core/` | 90%+ | Critical algorithms |
| `executors/` | 85%+ | Multiple code paths |
| `permissions/` | 95%+ | Security critical |
| `persistence/` | 90%+ | Data integrity |
| `feedback/` | 80%+ | Heuristic-heavy |
| `observability/` | 70%+ | Mostly logging |

---

## Agent 2: Site Rejuvenation Plan

### Phase 1: Information Architecture & Multi-Audience Entry Paths

#### Homepage Redesign Strategy

**Current State Analysis:**
- Homepage (`/website/src/pages/index.tsx`) is a single-path experience
- Contains: Install Hero, Skills Marquee, 3 Nav Windows, About section, Changelog
- No audience segmentation or personalized paths

**Proposed Multi-Audience Entry Points:**

The homepage will be restructured with a prominent "Choose Your Path" selector immediately below the hero, replacing the generic nav windows.

```
+----------------------------------------------------------+
|  [Existing Hero: "Make Claude an Expert at Anything"]    |
|  [Existing Install Command Box]                          |
+----------------------------------------------------------+
|                                                          |
|  WHO ARE YOU? (Choose to personalize your experience)    |
|                                                          |
|  +----------------+  +----------------+  +----------------+
|  | HIRING.EXE     |  | DEVELOPER.EXE  |  | LEARNER.EXE   |
|  | Hiring Manager |  | AI Developer   |  | Just Starting |
|  |                |  |                |  |               |
|  | See portfolio  |  | Browse working |  | Step-by-step  |
|  | & craft demos  |  | bundles & MCPs |  | tutorials     |
|  +----------------+  +----------------+  +----------------+
|                                                          |
+----------------------------------------------------------+
```

**Path-Specific Vibes (per Vibe Matcher skill):**

| Audience | Primary Color | Tone | Content Priority |
|----------|---------------|------|------------------|
| Hiring Managers | Deep navy + gold accents | Polished, professional, tasteful | Artifacts, case studies, technical depth |
| Developers | Lime green + terminal black | Practical, no-nonsense, efficient | Bundles, cost comparisons, install commands |
| Newcomers | Warm teal + friendly grays | Welcoming, patient, encouraging | Tutorials, step-by-step guides, video walkthroughs |

#### Audience Path Pages

**Path A: `/portfolio` (Hiring Managers)**
- Curated artifacts gallery showcasing technical skill
- "Featured Work" with before/after comparisons
- Case studies with metrics (cost savings, iteration counts)
- Links to LinkedIn, resume, and contact

**Path B: `/bundles` (Developers)**
- Bundle gallery with one-click install
- Cost comparison calculator (Claude API tokens)
- MCP integration examples
- "Recommended Stacks" for common use cases

**Path C: `/learn` (Newcomers)**
- Tutorial landing page with progress tracker
- Video walkthrough player
- Step-by-step guides with checkpoints
- FAQ and troubleshooting

---

### Phase 2: Bundle System Design

#### Bundle YAML Schema

```yaml
# website/bundles/startup-mvp-kit.yaml
name: startup-mvp-kit
title: Startup MVP Kit
description: Everything you need to build and launch an MVP in 2 weeks
version: 1.0.0
audience: developers
difficulty: intermediate

hero_image: /img/bundles/startup-mvp-kit-hero.png

skills:
  - id: web-design-expert
    role: "Creates responsive UI components"
  - id: api-architect
    role: "Designs REST/GraphQL APIs"
  - id: devops-automator
    role: "Sets up CI/CD pipelines"
  - id: competitive-cartographer
    role: "Maps your competitive landscape"
  - id: indie-monetization-strategist
    role: "Plans your revenue model"

use_cases:
  - "Building a SaaS product from scratch"
  - "Rapid prototyping for investor demos"
  - "Solo founder needing full-stack guidance"

install_command: "/plugin install @some-claude-skills/startup-mvp-kit"

estimated_cost:
  tokens_per_session: 50000
  cost_usd: 0.75

tags:
  - entrepreneurship
  - web
  - production-ready
```

#### Bundle Generator Script

**Location:** `website/scripts/generate-bundles.ts`

**Responsibilities:**
1. Parse all YAML files in `website/bundles/`
2. Validate skill IDs exist in ALL_SKILLS
3. Generate TypeScript data file: `website/src/data/bundles.ts`
4. Calculate aggregate metadata (total skills, combined tags)
5. Generate bundle zip files for download

**Output Interface:**

```typescript
// website/src/data/bundles.ts
export interface Bundle {
  id: string;
  title: string;
  description: string;
  skills: Array<{
    id: string;
    role: string;
    skill: Skill; // resolved from ALL_SKILLS
  }>;
  useCases: string[];
  installCommand: string;
  estimatedCost: {
    tokensPerSession: number;
    costUsd: number;
  };
  tags: string[];
  audience: 'developers' | 'hiring' | 'newcomers';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  heroImage: string;
}

export const ALL_BUNDLES: Bundle[];
```

#### Launch Bundles (5 Initial)

| Bundle | Target Audience | Skills Included |
|--------|-----------------|-----------------|
| Startup MVP Kit | Developers | web-design-expert, api-architect, devops-automator, competitive-cartographer, indie-monetization-strategist |
| Code Review Suite | Developers | refactoring-surgeon, security-auditor, test-automation-expert, code-review-checklist, technical-writer |
| Documentation Powerhouse | Developers | technical-writer, skill-documentarian, diagramming-expert, api-architect, seo-visibility-expert |
| AI Development Stack | Developers | clip-aware-embeddings, drone-cv-expert, agent-creator, orchestrator, automatic-stateful-prompt-improver |
| Personal Growth Bundle | Newcomers | jungian-psychologist, personal-finance-coach, career-biographer, adhd-daily-planner, wisdom-accountability-coach |

---

### Phase 3: Tutorial System Design

#### Tutorial Structure (Diataxis Framework)

Following the Technical Writer skill's Diataxis methodology:

- **Tutorials** (learning-oriented): Guided lessons for newcomers
- **How-to Guides** (task-oriented): Recipes for specific goals
- **Reference** (information-oriented): Comprehensive documentation
- **Explanation** (understanding-oriented): Deep conceptual content

#### Progress Tracking Hook

**Location:** `website/src/hooks/useTutorialProgress.ts`

```typescript
interface TutorialProgress {
  tutorialId: string;
  completedSteps: string[];
  currentStep: string;
  startedAt: Date;
  completedAt?: Date;
  timeSpent: number; // minutes
}

interface useTutorialProgressReturn {
  progress: Map<string, TutorialProgress>;
  markStepComplete: (tutorialId: string, stepId: string) => void;
  getCurrentStep: (tutorialId: string) => string | null;
  getCompletionPercentage: (tutorialId: string) => number;
  resetTutorial: (tutorialId: string) => void;
  getAllCompletedTutorials: () => string[];
}
```

**Storage:** localStorage with key `claude-skills-tutorial-progress`

#### Tutorial Components

**TutorialStep Component:**
```tsx
<TutorialStep
  id="install-marketplace"
  title="Add the Skill Marketplace"
  estimatedTime="30 seconds"
  required={true}
>
  <CodeBlock language="bash" copyable>
    /plugin marketplace add curiositech/some_claude_skills
  </CodeBlock>
  <Checkpoint
    question="Did you see 'Marketplace added successfully'?"
    onComplete={() => markStepComplete('getting-started', 'install-marketplace')}
  />
</TutorialStep>
```

#### Tutorial Content Plan

**Tutorial 1: Getting Started (5 minutes)**
1. Install Claude Code CLI
2. Add the skill marketplace
3. Install your first skill
4. Use the skill in a conversation
5. Celebrate with Konami code easter egg

**Tutorial 2: Building Your First Skill (15 minutes)**
1. Create skill folder structure
2. Write SKILL.md with YAML frontmatter
3. Add examples and templates
4. Test locally with Claude Code
5. Submit to marketplace (optional)

**Tutorial 3: Bundle Power User (10 minutes)**
1. Browse bundles by use case
2. Install a bundle
3. Understand skill composition
4. Customize bundle for your needs
5. Create your own bundle

**Tutorial 4: DAG Orchestration (Advanced, 20 minutes)**
1. Understand skill dependencies
2. View the skill DAG visualizer
3. Chain skills for complex tasks
4. Handle failures and retries
5. Build a multi-skill workflow

---

### ADHD Design Considerations

Per the ADHD Design Expert skill:

1. **Reduce Cognitive Load**
   - One primary CTA per section
   - Clear visual hierarchy with Win31 bevels
   - Progress indicators always visible

2. **Time Blindness Mitigation**
   - Estimated time on every tutorial step
   - Session time tracker in status bar
   - "Quick Win" labels on fast tutorials

3. **Dopamine-Aware Design**
   - Celebration animations on completion
   - Achievement badges (stored in localStorage)
   - Streak counter for daily visitors

4. **Executive Function Support**
   - Clear "Next Step" buttons
   - "Where was I?" resume feature
   - Bookmark current position

---

## Agent 3: UI/UX Polish Strategy

### Current State Analysis

**Strengths:**
- Strong Win31 design system foundation (`win31.css` - 827 lines of well-organized CSS)
- Comprehensive typography hierarchy (Press Start 2P, VT323, IBM Plex Mono, Courier Prime)
- Good component library (43+ components)
- Functional mobile responsiveness
- Established color palette and beveled button patterns

**Areas Needing Polish:**
1. **Inconsistent styling** - Some components use CSS modules (modern), others inline styles (messy)
2. **Animation gaps** - Limited micro-interactions, no consistent motion language
3. **Missing tactile feedback** - Buttons lack satisfying press states, hover states inconsistent
4. **Typography rhythm** - Some components don't follow the established hierarchy
5. **Performance** - Google Fonts loading could be optimized, some heavy animations
6. **Mobile experience** - Works but feels cramped, not "premium retro"

---

### Component Polish Priorities (Impact/Visibility Order)

#### Tier 1: Homepage Hero (Highest Impact)

**Current file:** `/Users/erichowens/coding/some_claude_skills/website/src/pages/index.tsx`

**Issues found:**
- Heavy inline styles (~200 lines of inline CSS in JSX)
- Install hero has inconsistent spacing
- Code blocks lack visual hierarchy
- Stickers feel "pasted on" rather than integrated

**Polish strategy:**
1. Extract all inline styles to CSS modules
2. Add CRT monitor frame around the install hero
3. Implement a subtle "boot sequence" animation on first load
4. Add keyboard sounds on button presses (via Web Audio API - optional, toggleable)

#### Tier 2: Skills Gallery Cards

**Polish strategy:**
1. Add consistent hover lift with proper Win31 shadow expansion
2. Implement "flip card" effect showing install command on hover (period-appropriate)
3. Add star animation when favoriting (pixel burst effect)
4. Improve image loading with skeleton states styled as "loading..." Win31 progress bars

#### Tier 3: Navigation & Title Bars

**Polish strategy:**
1. Add subtle gradient shine to active title bars (period-appropriate - Win31 had this)
2. Implement proper focus states for window buttons
3. Add "window glass" reflection effect (subtle linear gradient overlay)
4. Make minimize/maximize buttons functional on appropriate windows

#### Tier 4: Quick View Modal

**Issues:**
- All inline styles (300+ lines)
- Missing entrance/exit animations
- No keyboard navigation (Escape to close)

**Polish strategy:**
1. Extract to CSS module with Win31-consistent styling
2. Add "window open" animation (scale from 0.9 + fade)
3. Implement proper focus trap for accessibility
4. Add subtle scanline overlay for CRT effect

---

### Animation/Interaction Strategy (Period-Appropriate)

#### Core Animation Principles for Win31 Aesthetic

**DO:**
- Quick, snappy transitions (100-200ms max)
- Linear or ease-out timing (no bouncy physics)
- Pixel-perfect movements (translate in 1px increments)
- Subtle box-shadow changes for depth
- Simple fades and slides

**DO NOT:**
- Spring animations
- Elastic easing
- Complex transforms
- Parallax effects
- Blur transitions

#### Animation Tokens (add to `win31.css`)

```css
:root {
  /* Win31 Animation Tokens */
  --win31-transition-fast: 100ms linear;
  --win31-transition-normal: 150ms ease-out;
  --win31-transition-slow: 250ms ease-out;

  /* Button press depth */
  --win31-press-translate: 1px;

  /* Window movements */
  --win31-window-scale-closed: 0.95;
  --win31-window-scale-open: 1;
}
```

#### Specific Animations to Add

1. **Button Press (already exists, needs refinement)**
   - Current: `transform: translate(1px, 1px)` on `:active`
   - Improve: Add inset shadow swap animation

2. **Window Open**
   ```css
   @keyframes win31-window-open {
     from {
       transform: scale(0.95);
       opacity: 0;
     }
     to {
       transform: scale(1);
       opacity: 1;
     }
   }
   ```

3. **Star Toggle**
   ```css
   @keyframes win31-star-burst {
     0% { transform: scale(1); }
     50% { transform: scale(1.3); }
     100% { transform: scale(1); }
   }
   ```

---

### MCP Tools Integration Strategy

#### 21st Century Dev - Use For:
- **Hero section components** - Get modern "wow" effects wrapped in Win31 chrome
- **Loading states** - Skeleton loaders with retro styling
- **Toast notifications** - Win31-styled notification system

#### Magic UI - Use For:
- **Particle effects** - Subtle pixel dust on interactions
- **Text animations** - "Typing" effect for code examples
- **Grid backgrounds** - Retro grid patterns

#### v0 - Use For:
- **Prototyping new pages** - Quick iteration on layout
- **Component variations** - Generate options, then skin with Win31

#### Integration Pattern

```
1. Generate base component with MCP tool
2. Strip modern styling (border-radius, gradients, shadows)
3. Apply Win31 design tokens
4. Add period-appropriate animations
5. Test for consistency
```

---

### Performance Optimization Targets

#### Current Issues Identified:
1. Google Fonts import in CSS (render-blocking)
2. Large hero images (skills gallery)
3. Marquee animation on main thread
4. No image lazy loading strategy

#### Core Web Vitals Targets:

| Metric | Current (Est.) | Target |
|--------|---------------|--------|
| LCP | ~2.5s | < 1.5s |
| FID | ~50ms | < 50ms |
| CLS | ~0.1 | < 0.05 |
| INP | ~150ms | < 100ms |

#### Optimization Plan:

1. **Font Loading**
   - Move Google Fonts to `<link preload>` in head
   - Add `font-display: swap` to all @font-face
   - Consider self-hosting Press Start 2P and VT323

2. **Image Optimization**
   - Implement `loading="lazy"` on all skill hero images
   - Convert remaining PNGs to WebP
   - Add blur placeholder for hero images (LQIP)

3. **Animation Performance**
   - Move marquee to CSS animation (already done)
   - Add `will-change: transform` to animated elements
   - Implement `requestAnimationFrame` for any JS animations

4. **Code Splitting**
   - Lazy load WinampModal (heavy component)
   - Split VaporwavePlayer into separate chunk
   - Defer EcosystemDashboard components

---

### Mobile Responsiveness Approach: "Pocket Computer"

#### Philosophy
Instead of making Win31 "mobile-friendly" (which loses charm), position it as a **pocket computer from an alternate timeline** where Windows 3.1 devices existed.

#### Design Principles:

1. **Simplified Window Chrome**
   - Single-column layouts
   - Smaller title bar buttons
   - Collapsible sections as "windows"

2. **Touch Targets**
   - Minimum 44px tap targets (Apple guideline)
   - Increase button padding on mobile by 50%
   - Add subtle "touch ripple" effect (translucent white flash)

3. **Navigation Pattern**
   - Bottom-docked "taskbar" on mobile
   - Hamburger menu styled as "Start menu"
   - Swipe gestures for window switching (optional enhancement)

---

### Premium Feel Without Losing Authenticity

#### The Secret: **Obsessive Attention to Detail**

What makes Win31 feel "premium" rather than "cheap retro":

1. **Pixel-perfect borders** - Every border is exactly 2px, every shadow exactly 6px
2. **Consistent bevel direction** - Light always comes from top-left
3. **Authentic color palette** - Use only the 16 colors from Windows 3.1
4. **Period-appropriate fonts** - VT323 and Press Start 2P, not Comic Sans
5. **No anachronisms** - No rounded corners, no gradients (except title bars), no drop shadows with blur

#### Polish Checklist (Use Before Launch):

- [ ] All borders are solid (no dashed/dotted)
- [ ] All shadows are hard-edged (no blur)
- [ ] All buttons have proper inset/outset swap
- [ ] All windows have proper 4-color bevel
- [ ] All fonts use the established hierarchy
- [ ] All animations are under 250ms
- [ ] All touch targets are 44px+ on mobile
- [ ] All images have proper loading states

---

## Skills Explored (115 Total)

The following skills were identified as available in `.claude/skills/`:

### Directly Relevant to Project

1. **UX Friction Analyzer** - Cognitive psychology, Gestalt, flow state
2. **ADHD Design Expert** - Neurodivergent-friendly patterns
3. **Windows 3.1 Web Designer** - Aesthetic authority
4. **Vibe Matcher** - Emotional → visual DNA translation
5. **Web Design Expert** - Brand identity, visual systems
6. **Design System Creator** - Tokens, component library
7. **Technical Writer** - Diátaxis tutorial structure
8. **Skill Documentarian** - Metadata, tags, artifact sync
9. **Claude Ecosystem Promoter** - Multi-channel launch

### For Future Use

- color-theory-palette-harmony-expert
- competitive-cartographer
- interior-design-expert
- native-app-designer
- vaporwave-glassomorphic-ui-designer
- career-biographer
- cv-creator
- diagramming-expert
- feature-manifest
- orchestrator
- agent-creator
- bot-developer
- automatic-stateful-prompt-improver
- And 100+ more...

---

*This document preserves the raw planning outputs for artifact creation and future reference.*
