# Skill Coach: Master Agent Skills Development

A comprehensive guide and toolkit for creating expert-level Agent Skills that encode real domain knowledge, not just surface-level instructions.

**Latest**: Iteratively self-improved 5 times (Nov 2024), demonstrating the improvement loop it teaches.

## What This Skill Does

Skill Coach helps you build skills that:
- **Activate precisely** - Specific keywords + NOT clause prevents false activation
- **Encode shibboleths** - Domain knowledge separating experts from novices
- **Surface anti-patterns** - "If you see X, that's wrong because Y, use Z"
- **Capture temporal knowledge** - "Pre-2024: X. 2024+: Y. Watch for LLMs suggesting X"
- **Know their limits** - "Use this for A, B, C. NOT for D, E, F"
- **Provide decision trees** - Not templates, but "If X then A, if Y then B, never C"
- **Include validation** - Pre-flight checks catching errors early

## Quick Start

### 1. Install and Use

Copy this folder to your skills directory:

```bash
# For Claude Code
cp -r skill-coach ~/.claude/skills/

# For Claude.ai
# Upload via the Skills interface
```

### 2. Validate Your Skills

```bash
cd skill-coach
python scripts/validate_skill.py /path/to/your-skill/
```

### 3. Study Examples

Look at `/examples/good/clip-aware-embeddings/` to see all principles in action.

## What's Inside

```
skill-coach/
├── SKILL.md                    # Main skill instructions
├── scripts/
│   └── validate_skill.py       # Skill validation tool
├── references/
│   ├── antipatterns.md         # Domain shibboleths catalog
│   └── mcp_vs_scripts.md       # Architecture decisions
└── examples/
    ├── good/
    │   └── clip-aware-embeddings/  # Exemplary skill
    └── bad/
        └── (anti-examples)
```

## Key Concepts

### 1. Progressive Disclosure

Skills load in three phases:
- **Phase 1 (~100 tokens)**: Metadata - "Should I activate?"
- **Phase 2 (&lt;5k tokens)**: Instructions - "How do I do this?"
- **Phase 3 (as needed)**: Details - "Show me more"

### 2. The Shibboleths

Deep knowledge that reveals expertise:

**Example - CLIP Embeddings**:
- **Novice**: "CLIP is great for image-text tasks!"
- **Expert**: "CLIP fails at counting, fine-grained classification, spatial reasoning, and attribute binding. Use DETR for counting, specialized models for fine-grained, DCSMs for compositional."

### 3. Anti-Pattern Detection

Great skills actively warn about mistakes:

```markdown
### Anti-Pattern: Using CLIP to Count Objects

**Why wrong**: CLIP's architecture cannot preserve spatial information
**What to do**: Use DETR or Faster R-CNN
**How to detect**: If query contains "how many" or "count"
```

### 4. Temporal Knowledge

Capture what changed and when:

```markdown
## Evolution Timeline
- Pre-2024: Redux for all state management
- 2024+: Zustand/Jotai for global state, Context for simple cases
- Watch for: LLMs suggesting Redux by default
```

## Creating Your First Skill

### Step 1: Define Scope

```markdown
---
name: your-skill-name
description: [What it does] [When to use] [Specific triggers]. NOT for [What it's NOT for].
---
```

### Step 2: Add Instructions

```markdown
# Your Skill

## When to Use
✅ Use for: ...
❌ Do NOT use for: ...

## Quick Start
[Minimal working example]

## Common Anti-Patterns
[What looks right but is wrong]
```

### Step 3: Include Validation

```python
# scripts/validate.py
def validate_setup():
    # Check environment, dependencies, config
    pass
```

### Step 4: Test

```bash
python scripts/validate_skill.py your-skill/
```

## Quick Wins (Improve Existing Skills Fast)

Apply these immediately to existing skills:

1. **Add NOT clause** to description → Prevents false activation
2. **Add 1-2 anti-patterns** → Prevents common mistakes
3. **Check line count** (`wc -l`) → Should be &lt;500
4. **Remove dead files** → Delete unreferenced scripts/references
5. **Test activation** → Ask questions that should/shouldn't trigger it

## Validation Checklist (Prioritized)

**CRITICAL** (must-have):
- [ ] Description has keywords AND NOT clause
- [ ] SKILL.md under 500 lines
- [ ] All referenced files exist
- [ ] Test activation: Does it activate when it should?
- [ ] Test non-activation: Doesn't activate when it shouldn't?

**HIGH PRIORITY** (should-have):
- [ ] Has "When to Use" and "When NOT to Use" sections
- [ ] Includes 1-3 anti-patterns with "Why it's wrong"
- [ ] Encodes domain shibboleths (expert vs novice knowledge)
- [ ] `allowed-tools` is minimal

**NICE TO HAVE** (polish):
- [ ] Temporal knowledge (what changed when)
- [ ] Working code examples (not just templates)
- [ ] References for deep dives
- [ ] Bash restrictions if applicable

## Real Examples

### Good: CLIP-Aware Embeddings

See `/examples/good/clip-aware-embeddings/` for a skill that:
- Knows when CLIP works and when it doesn't
- Provides alternatives for each limitation
- Includes validation scripts
- Documents evolution (2021 → 2025)
- Has clear anti-patterns

### Study This Example

It demonstrates:
1. ✅ Progressive disclosure
2. ✅ Anti-pattern detection
3. ✅ Temporal knowledge
4. ✅ Task-specific guidance
5. ✅ Validation tooling
6. ✅ Clear alternatives

## Domain-Specific Shibboleths

These are the knowledge gaps where skills add most value:

### ML/AI Models
- CLIP limitations (counting, fine-grained, spatial)
- When to use specialized models
- Embedding model selection by task

### Framework Evolution
- Next.js: Pages Router → App Router (2022)
- React: Class Components → Hooks (2019)
- State Management: Redux → Zustand (2020+)

### Architecture
- When to use MCP vs Scripts
- Evolution from scripts → library → MCP
- Security and performance tradeoffs

**See `/references/antipatterns.md` for comprehensive catalog**

## Best Practices

### Description Field

**Good**:
```yaml
description: Semantic image search with CLIP. Use for finding similar images, zero-shot classification. NOT for counting objects, fine-grained classification, or spatial reasoning. Mention CLIP, embeddings, image similarity.
```

**Bad**:
```yaml
description: Helps with images
```

### Progressive Structure

**Good**:
```markdown
# Skill Name

## Quick Decision Tree
[Fast decision making]

## Common Anti-Patterns
[What to avoid]

## Validation
[How to check]

See /references/deep_dive.md for detailed theory
```

**Bad**:
```markdown
# Skill Name

[50 pages of comprehensive tutorial]
```

### Validation

**Good**:
```python
# scripts/validate.py
def check_environment():
    """Specific, actionable errors"""
    if not has_model():
        raise Error("Model X not found. Install: pip install x")

def check_task_appropriate(query):
    """Task-specific validation"""
    if "count" in query.lower():
        raise Error("Use object detection for counting, not CLIP")
```

**Bad**:
```python
# No validation script
# Or generic "check passed/failed" with no guidance
```

## Tools & Scripts

### Validate Skill Structure

```bash
python scripts/validate_skill.py your-skill/
```

Checks:
- Required files and structure
- Description quality
- Line count (&lt;500)
- Progressive disclosure
- Anti-patterns section
- allowed-tools scope

### Create New Skill

Ask Claude:
```
Using the skill-coach skill, help me create a new skill for [your domain].
Focus on anti-patterns where novices get it wrong.
```

## Common Mistakes

### ❌ Skill as Documentation Dump

Don't create a 500-line tutorial. Create actionable instructions with references.

### ❌ Missing "NOT for"

Without negative triggers, skills activate on false positives.

### ❌ No Temporal Context

LLMs suggest outdated patterns. Document what changed and when.

### ❌ Overly Permissive Tools

```yaml
allowed-tools: Bash  # Can execute ANYTHING
```

Better:
```yaml
allowed-tools: Bash(git:*,npm:run),Read,Write
```

### ❌ No Validation

Skills should include scripts to check if environment is correct.

## Integration with Other Tools

### Works with MCP

Skills can reference MCPs:
```markdown
## Requirements
- GitHub MCP (for API access)
- Scripts for local validation

Install: `/plugin marketplace add github-mcp`
```

### Works with Subagents

Subagents can use skills for domain expertise:
```
Skill provides knowledge → Subagent executes with tools
```

### Works with Projects

Skills available across all conversations in a project.

## Contributing Patterns

When you discover a new anti-pattern:

1. **Document what looks right but is wrong**
2. **Explain WHY it's wrong** (fundamental reason)
3. **Show the correct approach**
4. **Add temporal context** (when did this change?)
5. **Note why LLMs make this mistake**
6. **Include detection/validation if possible**

## Resources

### In This Skill

- `/references/antipatterns.md` - Comprehensive anti-pattern catalog
- `/references/mcp_vs_scripts.md` - When to use what
- `/examples/good/` - Exemplary skills to study
- `/scripts/validate_skill.py` - Validation tool

### External

- [Anthropic Skills Docs](https://docs.claude.com/en/docs/agents-and-tools/agent-skills)
- [Skills Explained](https://claude.com/blog/skills-explained)
- [Equipping Agents](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)
- [MCP Documentation](https://modelcontextprotocol.io/)

## Version History

### v2.0.0 (2025-11-24)
**5 Iterations of Self-Improvement:**
- Iteration 1: Added 5 skill-specific anti-patterns, Evolution Timeline, removed non-existent file references
- Iteration 2: Added Common Workflows, Tool Permissions explanation, actionable iteration strategy
- Iteration 3: Added Skill Creation Shibboleths, enhanced "What Makes a Great Skill" (5→7 items)
- Iteration 4: Added Quick Wins, simplified structure, Description progression (Bad→Better→Good)
- Iteration 5: Added Decision Trees (when to create, Skill vs MCP), prioritized checklist
- Result: 482 → 470 lines, more concise yet comprehensive

### v1.0.0 (2025-11-23)
- Initial release
- Comprehensive anti-patterns catalog
- CLIP-aware embeddings example
- Validation tooling
- MCP vs Scripts guide

---

## Get Started

1. Read SKILL.md **Quick Wins** for immediate improvements
2. Study `/examples/good/clip-aware-embeddings/`
3. Run validation on your existing skills
4. Use this skill when creating new skills
5. Share your domain-specific shibboleths

**Remember**: Great skills don't just say "here's how" - they say "here's how, and here's where everyone gets it wrong, and why, and what to use instead."
