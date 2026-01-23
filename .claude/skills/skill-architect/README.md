# Skill Architect

The authoritative meta-skill for creating, auditing, and improving Agent Skills.

## What It Does

Skill Architect combines:
- **Systematic workflow** from skill-creator (6-step process)
- **Domain expertise encoding** from skill-coach (shibboleths, anti-patterns)

Into one unified authority for skill development.

## Quick Start

**Creating a new skill**:
1. Gather 3-5 concrete examples
2. Plan reusable contents (scripts, references, assets)
3. Initialize: `scripts/init_skill.py <skill-name>`
4. Edit SKILL.md (keep &lt;500 lines)
5. Validate: `scripts/validate_skill.py <path>`
6. Package: `scripts/package_skill.py <path>`

**Improving an existing skill**:
1. Add NOT clause to description
2. Check line count (&lt;500 lines)
3. Add 1-2 anti-patterns
4. Remove dead files
5. Test activation

## What Makes a Great Skill

1. **Activates precisely** - Keywords + NOT clause
2. **Encodes shibboleths** - Expert knowledge
3. **Surfaces anti-patterns** - Common mistakes
4. **Captures temporal knowledge** - "Pre-2024 vs 2024+"
5. **Knows its limits** - "Use for X, NOT for Y"
6. **Provides decision trees** - Not templates
7. **Stays under 500 lines** - Progressive disclosure

## Key Concepts

### Progressive Disclosure
- **Level 1**: Metadata (~100 tokens) - Always in context
- **Level 2**: SKILL.md (&lt;5k tokens) - When skill triggers
- **Level 3**: Resources (unlimited) - As needed

### Shibboleths
Expert knowledge that separates novices from experts:
- Framework evolution (React: Classes → Hooks → Server Components)
- Model limitations (CLIP can't count objects)
- Tool architecture (when to use MCP vs Scripts)
- Temporal knowledge (what changed and when)

### Self-Contained Tools
Skills with working tools are immediately useful:
- **Scripts**: Repeatable operations
- **MCP Servers**: External APIs with auth
- **Subagents**: Multi-step workflows
- **Assets**: Templates and boilerplate

## Structure

```
skill-architect/
├── SKILL.md                       # Core instructions (&lt;500 lines)
├── CHANGELOG.md                   # Version history
├── README.md                      # This file
└── references/
    ├── antipatterns.md            # Shibboleths and case studies
    ├── self-contained-tools.md    # Scripts, MCP, subagent patterns
    ├── mcp-template.md            # Minimal MCP starter
    └── subagent-template.md       # Agent definition format
```

## Philosophy

**The best skill is one where the user can start working immediately.**

| Approach | Result |
|----------|--------|
| "Here's how to build X" | User spends 2 hours implementing |
| "Here's a working X, run it" | User is productive in 2 minutes |

## Examples

### Good Description
```yaml
description: CLIP semantic search. Use for image-text matching, zero-shot classification.
  Activate on 'CLIP', 'embeddings', 'similarity'.
  NOT for counting objects, spatial reasoning, or fine-grained classification.
```

### Good Anti-Pattern
```markdown
### Anti-Pattern: CLIP for Everything

**Novice thinking**: "CLIP does zero-shot classification, use it for all image tasks!"

**Reality**: CLIP has fundamental geometric limitations. Cannot handle:
- Counting objects
- Spatial relationships ("cat left of dog")
- Fine-grained classification (celebrity faces)

**Timeline**: 2021: CLIP released. 2024: Limitations well-documented.

**LLM mistake**: Training data predates limitation discoveries.
```

## Success Metrics

| Metric | Target |
|--------|--------|
| Correct activation | &gt;90% |
| False positive rate | &lt;5% |
| Token usage | &lt;5k |
| Time to productive | &lt;5 min |

## Replaces

This skill unifies and replaces:
- **skill-coach** - Expertise encoding
- **skill-creator** - Systematic workflow

## License

See LICENSE.txt for complete terms.
