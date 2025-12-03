---
slug: /skills/skill_coach
id: skill_coach
name: skill-coach
description: Guide for creating high-quality Agent Skills with domain expertise, anti-pattern detection, and progressive disclosure best practices
---

# Skill Coach: Creating Expert-Level Agent Skills

<SkillHeader
  skillName="Skill Coach"
  fileName="skill-coach"
  description={"\"Guides creation of high-quality Agent Skills with domain expertise, anti-pattern detection, and progressive disclosure best practices. Use when creating skills, reviewing existing skills, or when users mention improving skill quality, encoding expertise, or avoiding common AI tooling mistakes. Activate on keywords: create skill, review skill, skill quality, skill best practices, skill anti-patterns. NOT for general coding advice or non-skill Claude Code features.\""}
  tags={["coaching","validation","beginner-friendly"]}
/>

This meta-skill helps you create Agent Skills that encode real domain expertise, not just surface-level instructions. It focuses on the **shibboleths** - the deep knowledge that separates novices from experts.

## Your Mission

Create skills that are progressive disclosure machines encoding temporal knowledge, anti-patterns, and expert-level domain understanding.

## What Makes a Great Skill

Great skills:
1. **Encode temporal knowledge** - "This worked pre-2024, but now..."
2. **Surface anti-patterns** - "If you see X, that's wrong because Y"
3. **Provide working code** - Scripts that demonstrate correct usage
4. **Include validation** - Pre-flight checks that catch errors early
5. **Know their limits** - "Use this for A, not for B; use Z for B instead"

## When to Use This Skill

### Perfect For:
- 📝 Creating new skills from scratch
- 🔍 Auditing existing skills for quality
- 🛡️ Adding anti-pattern detection
- 📊 Improving progressive disclosure
- 🧠 Encoding domain expertise

### Not For:
- ❌ Generic prompt writing
- ❌ Simple task automation
- ❌ Skills without domain depth

## Core Principles

### 1. Progressive Disclosure Architecture

Skills load in three phases:
- **Phase 1 (~100 tokens)**: Metadata - "Should I activate?"
- **Phase 2 (under 5k tokens)**: Main SKILL.md - "How do I do this?"
- **Phase 3 (as needed)**: Scripts, references - "Show me details"

**Critical**: Keep SKILL.md under 500 lines. Split details into `/references`.

### 2. Description Field Design

The description is your activation trigger. It must include:
- **What**: What capability this provides
- **When**: Specific contexts/keywords for activation
- **Not**: What it's NOT for (prevents false activation)

**Good**:
```yaml
description: Analyzes image embeddings using CLIP alternatives. Use for image-text matching, semantic search. NOT for fine-grained classification, counting, or spatial reasoning.
```

**Bad**:
```yaml
description: Helps with images
```

### 3. Anti-Pattern Detection

Structure for capturing common mistakes:

```markdown
### Pattern: [Name]
**What it looks like**: [Code or description]
**Why it's wrong**: [Fundamental reason]
**What to do instead**: [Better approach]
**How to detect**: [Validation rule]
```

## Skill Structure

### Mandatory Files
```
your-skill/
├── SKILL.md           # Core instructions (under 500 lines)
└── scripts/           # Executable code
    ├── validate.py    # Pre-flight validation
    └── example.py     # Working demonstration
```

### Optional Files
```
├── references/        # Detailed documentation
├── assets/            # Supporting files
└── examples/          # Good/bad examples
```

## Domain-Specific Shibboleths

These are deep knowledge areas where skills add most value:

**CLIP Embeddings**:
- Novice: "CLIP is great for image-text matching"
- Expert: "CLIP fails at counting, fine-grained classification, attribute binding, spatial relationships. Use DCSMs for compositional reasoning."

**React Patterns**:
- Novice: "Use useState for everything"
- Expert: "useState for local UI, useReducer for complex state, Context for prop drilling but NOT for high-frequency updates."

## Validation Checklist

Good skills have:
- [ ] Activation rate: 90%+ when appropriate
- [ ] False positive rate: under 5%
- [ ] Error prevention: Measurable reduction in mistakes
- [ ] Token efficiency: under 5k tokens for typical invocation

## Security Considerations

### Allowed Tools

Only include what you need:
- Read-only skill: `Read,Grep,Glob`
- File creator: `Read,Write,Edit`
- Build tool: `Read,Write,Bash(npm:*,git:*)`

**Never use**: `Bash` without restrictions for untrusted skills

### Audit Checklist
- [ ] Read all scripts before enabling
- [ ] Check for network calls
- [ ] Verify allowed-tools scope
- [ ] Review external dependencies

## Common Questions

### "How much in SKILL.md vs references?"
- **SKILL.md**: Instructions Claude needs every time (under 500 lines)
- **References**: Deep dives Claude references as needed

### "MCP or Script?"
- **Script**: Stateless, no auth, local execution, batch processing
- **MCP**: External API, auth boundaries, stateful connection, real-time data

## Key Insight

Skills are **progressive disclosure machines**. They load incrementally, giving Claude just enough context at each stage. The best skills encode the temporal knowledge and anti-patterns that distinguish experts from novices.
