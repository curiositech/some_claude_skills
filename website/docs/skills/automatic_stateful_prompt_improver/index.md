---
slug: /skills/automatic_stateful_prompt_improver
id: automatic_stateful_prompt_improver
title: Automatic Stateful Prompt Improver
description: Automatically intercepts and optimizes prompts using APE, OPRO, and DSPy patterns with learning from performance
sidebar_label: Automatic Prompt Improver
---

# Automatic Stateful Prompt Improver

Automatically intercept and optimize prompts using the prompt-learning MCP server. Learns from performance over time via embedding-indexed history.

## Quick Facts

| Attribute | Value |
|-----------|-------|
| **Category** | Orchestration & Meta |
| **Activation Keywords** | optimize prompt, improve this prompt, prompt engineering, complex task request |
| **Tools Required** | prompt-learning MCP server tools |

## What It Does

The Automatic Stateful Prompt Improver skill:

- **Automatically intercepts** complex task requests before responding
- **Optimizes prompts** using APE (Automatic Prompt Engineering), OPRO, and DSPy patterns
- **Learns from outcomes** via embedding-indexed history
- **Records feedback** to improve future retrievals
- **Suggests improvements** for existing prompts

## Auto-Optimization Triggers

This skill AUTOMATICALLY calls optimization BEFORE responding when:

1. **Complex task** - Multi-step, requires reasoning
2. **Technical output** - Code, analysis, structured data
3. **Reusable content** - System prompts, templates, instructions
4. **Explicit request** - "improve", "better", "optimize"
5. **Ambiguous requirements** - Underspecified, multiple interpretations
6. **Precision-critical** - Code, legal, medical, financial

## Do NOT Optimize

- Simple questions ("what is X?")
- Direct commands ("run npm install")
- Conversational responses ("hello", "thanks")
- File operations without reasoning
- Already-optimized prompts

## Iteration Decision Matrix

| Factor | Low (3-5) | Medium (5-10) | High (10-20) |
|--------|-----------|---------------|--------------|
| Complexity | Simple | Multi-step | Agent/pipeline |
| Ambiguity | Clear | Some | Underspecified |
| Domain | Known | Moderate | Novel |
| Stakes | Low | Moderate | Critical |

## Performance Expectations

| Scenario | Improvement | Iterations |
|----------|-------------|------------|
| Simple task | 10-20% | 3-5 |
| Complex reasoning | 20-40% | 10-15 |
| Agent/pipeline | 30-50% | 15-20 |
| With history | +10-15% bonus | Varies |

## Anti-Patterns

| Anti-Pattern | Problem | Solution |
|--------------|---------|----------|
| Over-optimization | Prompt becomes complex, brittle | Apply Occam's Razor - simplest sufficient prompt |
| Template obsession | Templates don't generalize | Focus on WHAT task requires, not HOW to format |
| Iteration without measurement | Can't know if changes help | Define success criteria before optimizing |
| Ignoring model capabilities | Over-scaffolding wastes tokens | Test capabilities before heavy prompting |

## Requirements

This skill requires the **prompt-learning MCP server**:

```json
{
  "mcpServers": {
    "prompt-learning": {
      "command": "npx",
      "args": ["-y", "github:erichowens/prompt-learning-mcp"],
      "env": {
        "OPENAI_API_KEY": "your-openai-api-key"
      }
    }
  }
}
```

**Infrastructure needed:** Docker (Qdrant + Redis), Node.js 18+, OpenAI API key

## Installation

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
  <TabItem value="download" label="Download" default>
    Download from the [Skills Gallery](/skills) and extract to your `.claude/skills/` directory.
  </TabItem>
  <TabItem value="git" label="Git Clone">
    ```bash
    git clone https://github.com/erichowens/some_claude_skills.git
    cp -r some_claude_skills/.claude/skills/automatic-stateful-prompt-improver ~/.claude/skills/
    ```
  </TabItem>
</Tabs>

## Related Skills

- [Orchestrator](/docs/skills/orchestrator) - Coordinate specialists and create skills on-the-fly
- [Skill Coach](/docs/skills/skill_coach) - Guide creation of high-quality Claude Skills
- [Research Analyst](/docs/skills/research_analyst) - Deep research and analysis
