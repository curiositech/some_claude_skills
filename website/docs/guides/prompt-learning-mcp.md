---
sidebar_position: 5
---

# Prompt Learning MCP Server

**Your prompts get smarter every time you use Claude.**

The Prompt Learning MCP Server is a production-ready Model Context Protocol server that automatically optimizes your prompts using techniques from academic research: APE (Automatic Prompt Engineer), OPRO (Optimization by PROmpting), and DSPy-inspired patterns.

## The Problem

Every day, you write prompts to Claude. Some work brilliantly. Others fall flat. The good ones disappear into your chat history, never to be seen again. Meanwhile, you keep making the same mistakes:

- Vague instructions that produce vague outputs
- Missing structure that forces you to re-prompt
- Forgetting techniques that worked before
- No way to learn from what actually works

## The Solution

The Prompt Learning MCP Server solves this by creating a **feedback loop**:

```
Your Prompt → Optimization → Better Prompt → Results → Learning → Even Better Next Time
```

It does this through:

1. **Pattern-based improvements** - Instantly applies proven prompt engineering patterns (chain-of-thought, structured output, constraints)
2. **LLM-based evaluation** - Scores prompts on clarity, specificity, completeness, structure, and effectiveness
3. **Vector similarity search** - Finds high-performing prompts similar to yours and learns from them
4. **OPRO-style iteration** - Generates candidate improvements and keeps what works

## Quick Start

### Prerequisites

- Docker (for Qdrant vector DB and Redis)
- Node.js 18+
- OpenAI API key

### Installation

```bash
# Clone the repo
git clone https://github.com/erichowens/prompt-learning-mcp.git
cd prompt-learning-mcp

# Install dependencies
npm install

# Configure your API key
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY

# Start the infrastructure and configure Claude
npm run setup
```

The setup script will:
- Start Qdrant (vector database) on port 6333
- Start Redis (embedding cache) on port 6379
- Create the vector collection with proper indexes
- Configure Claude Code to use the MCP server

### Usage

Once configured, Claude will automatically have access to these tools:

| Tool | Purpose |
|------|---------|
| `optimize_prompt` | Transform a vague prompt into an optimized one |
| `record_outcome` | Log whether a prompt worked (builds the learning loop) |
| `find_similar` | Find high-performing prompts similar to yours |
| `get_suggestions` | Quick suggestions without full optimization |

## How It Works

### The Optimization Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                    PROMPT OPTIMIZATION                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. PATTERN MATCHING (instant, no API calls)                │
│     ├── add_structure: "Provide structured format..."       │
│     ├── add_chain_of_thought: "Think step by step..."       │
│     ├── add_constraints: "Requirements: - Be specific..."   │
│     ├── add_output_format: "Format your response..."        │
│     └── add_context_request: "Consider relevant context..." │
│                                                              │
│  2. RAG RETRIEVAL (vector similarity search)                │
│     ├── Embed the prompt using text-embedding-3-small       │
│     ├── Search Qdrant for similar high-performing prompts   │
│     └── Learn patterns from what worked before              │
│                                                              │
│  3. OPRO ITERATION (LLM-based candidate generation)         │
│     ├── Generate candidate improvements via meta-prompting  │
│     ├── Score each candidate on 5 weighted criteria         │
│     ├── Keep improvements, discard regressions              │
│     └── Repeat until convergence or target score reached    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Evaluation Criteria

Every prompt is scored (0-10) on five dimensions:

| Criterion | Weight | Description |
|-----------|--------|-------------|
| Clarity | 25% | How clear and unambiguous is the instruction? |
| Specificity | 25% | Does it provide specific guidance without being overly restrictive? |
| Completeness | 20% | Does it cover all necessary aspects of the task? |
| Structure | 15% | Is it well-organized with appropriate formatting? |
| Effectiveness | 15% | How likely is it to produce the desired output? |

### Before & After Example

**Before:**
```
What do you think? Does it work?
```
*Score: ~35%*

**After:**
```
I have conducted 78 comprehensive tests on my MCP server to assess
its functionality and performance under various conditions. Please
analyze the following detailed test results and provide structured
feedback.

**Output Format:**
1. **Summary of Findings:** A concise overview of the test results,
   highlighting key metrics.
2. **Issues Identified:** A detailed list of any failures, bugs, or
   performance issues encountered during testing.
3. **Recommendations:** Actionable suggestions for resolving identified
   issues and enhancing server performance.
4. **Conclusion:** A definitive assessment of the server's operational
   status, including any risks or concerns.

Please ensure your analysis is backed by specific data points from the
test results and includes logical reasoning for your conclusions.
```
*Score: ~82%*

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     MCP SERVER (Node.js)                     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │  Optimizer  │  │  Embeddings │  │   VectorDB  │          │
│  │  (APE/OPRO) │  │  (OpenAI)   │  │  (Qdrant)   │          │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘          │
│         │                │                │                  │
│         └────────────────┼────────────────┘                  │
│                          │                                   │
│                    ┌─────┴─────┐                            │
│                    │   Redis   │                            │
│                    │  (Cache)  │                            │
│                    └───────────┘                            │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Test Coverage

The server is production-ready with comprehensive test coverage:

| Suite | Tests | Description |
|-------|-------|-------------|
| Unit Tests | 61 | Pattern matching, convergence detection, mock LLM scoring |
| Integration Tests | 17 | Real API calls, vector search, end-to-end optimization |
| **Total** | **78** | All passing |

Run tests yourself:
```bash
npm run test              # Unit tests (~200ms)
npm run test:integration  # Integration tests (~50s, requires API key)
```

## CLI Usage

The server includes a CLI for quick testing:

```bash
# Optimize a prompt
npx tsx src/cli.ts optimize "Write code" --domain code

# Get quick suggestions
npx tsx src/cli.ts suggest "Help me with data"

# Check database stats
npx tsx src/cli.ts stats
```

## Configuration

Environment variables (in `.env`):

```bash
# Required
OPENAI_API_KEY=sk-your-key-here

# Optional (defaults shown)
VECTOR_DB_URL=http://localhost:6333
REDIS_URL=redis://localhost:6379
```

Optimization config (in code):

```typescript
const optimizer = new PromptOptimizer(openai, {
  maxIterations: 10,        // Max OPRO iterations
  targetScore: 0.95,        // Stop when this score is reached
  convergenceThreshold: 0.02, // Stop when improvements plateau
  convergenceWindow: 3      // Check last N iterations for plateau
});
```

## The Skill Connection

This MCP server powers the **automatic-stateful-prompt-improver** skill. When the skill is active, it instructs Claude to automatically call the MCP tools to optimize prompts and record outcomes—creating a continuous learning loop without any manual intervention.

## Links

- **GitHub:** [github.com/erichowens/prompt-learning-mcp](https://github.com/erichowens/prompt-learning-mcp)
- **Related Skill:** The `automatic-stateful-prompt-improver` skill uses this MCP server

## What's Next

- **Prompt templates** - Pre-optimized templates for common tasks
- **A/B testing** - Automatically test prompt variations
- **Team sharing** - Share high-performing prompts across your organization
- **Custom criteria** - Define your own evaluation dimensions
