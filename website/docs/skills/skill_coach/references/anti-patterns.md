---
title: Skill Creation Anti-Patterns
sidebar_label: Skill Creation Anti-Patterns
sidebar_position: 1
---
# Skill Creation Anti-Patterns

Detailed examples of common mistakes and how to fix them.

## Anti-Pattern: The Reference Illusion

**What it looks like**: Skill references scripts/files that don't exist
```yaml
# Quick Start
Run `python scripts/validate.py` to check your skill
```
But `/scripts/validate.py` doesn't exist in the skill directory.

**Why it's wrong**: Claude will try to use non-existent files, causing errors.

**What to do instead**: Only reference files that actually exist. If suggesting scripts:
1. Include them in the skill
2. Show inline code examples
3. Clearly mark as "Example - not included"

**How to detect**: `find skill-dir/ -type f` and verify all referenced paths exist

## Anti-Pattern: Description Soup

**What it looks like**:
```yaml
description: Helps with many things including X, Y, Z, and also A, B, C, plus general assistance
```

**Why it's wrong**: Vague descriptions cause:
- False activations (activates when shouldn't)
- Missed activations (doesn't activate when should)
- Token waste (loads unnecessary context)

**What to do instead**: Specific trigger keywords + clear exclusions
```yaml
description: [Core capability]. Use for [A, B, C]. Activate on keywords: "X", "Y", "Z". NOT for [D, E, F].
```

## Anti-Pattern: Template Theater

**What it looks like**: Skill is 90% templates and examples, 10% actual instructions

**Why it's wrong**: Claude doesn't need templates - it needs expert knowledge and decision trees. Templates are for humans.

**What to do instead**:
- Focus on WHEN to use patterns, not just WHAT the patterns are
- Encode decision logic: "If X, use A; if Y, use B; never use C"
- Include anti-patterns and edge cases

## Anti-Pattern: The Everything Skill

**What it looks like**: One skill trying to handle an entire domain
```yaml
name: web-dev-expert
description: Handles all web development tasks
```

**Why it's wrong**:
- Too broad to activate correctly
- Mixes concerns (React ≠ API design ≠ CSS)
- Violates progressive disclosure

**What to do instead**: Create focused, composable skills:
- `react-performance-expert`
- `api-design-expert`
- `css-layout-expert`

## Anti-Pattern: Orphaned Sections

**What it looks like**: Skill has `/references/deep_dive.md` but never tells Claude when to read it

**Why it's wrong**: Files exist but are never used = wasted space

**What to do instead**: Explicit triggers in main SKILL.md:
```markdown
For database-specific anti-patterns, see `/references/database_antipatterns.md`
```

## Anti-Pattern: Tool Overload

**What it looks like**:
```yaml
allowed-tools: Read,Write,Edit,Bash,Glob,Grep,Task,WebSearch,WebFetch
```

**Why it's wrong**: More tools = more attack surface, more token usage

**What to do instead**: Minimal tools for the task:
- Read-only skill: `Read,Grep,Glob`
- File modifier: `Read,Write,Edit`
- Build integration: `Read,Write,Bash(npm:*,git:*)`

## Anti-Pattern: Missing Exclusions

**What it looks like**:
```yaml
description: Helps with database queries
```

**Why it's wrong**: Activates on ANY database question, even ones it can't handle

**What to do instead**:
```yaml
description: PostgreSQL query optimization. Activate on "slow query", "explain analyze", "index tuning". NOT for MySQL, MongoDB, schema design, or ORM issues.
```
