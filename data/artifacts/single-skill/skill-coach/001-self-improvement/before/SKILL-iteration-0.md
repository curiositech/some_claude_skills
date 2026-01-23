---
name: skill-coach
description: Guides creation of high-quality Agent Skills with domain expertise, anti-pattern detection, and progressive disclosure best practices. Use when creating skills, reviewing existing skills, or when users mention improving skill quality, encoding expertise, or avoiding common AI tooling mistakes.
allowed-tools: Read,Write,Bash,Glob,Grep,Edit
---

# Skill Coach: Creating Expert-Level Agent Skills

This skill helps you create Agent Skills that encode real domain expertise, not just surface-level instructions. It focuses on the **shibboleths** - the deep knowledge that separates novices from experts.

## What Makes a Great Skill

Great skills are **progressive disclosure machines** that:
1. **Encode temporal knowledge** - "This worked pre-2024, but now..."
2. **Surface anti-patterns** - "If you see X, that's wrong because Y"
3. **Provide working code** - Scripts that demonstrate correct usage
4. **Include validation** - Pre-flight checks that catch errors early
5. **Know their limits** - "Use this for A, not for B; use Z for B instead"

## Quick Start

### Creating a New Skill

```bash
# Run the validation checklist
python scripts/validate_skill.py --check-structure /path/to/your-skill/

# Analyze for common anti-patterns
python scripts/analyze_skill.py /path/to/your-skill/

# Test effectiveness
python scripts/skill_tester.py /path/to/your-skill/
```

## Core Principles

### 1. Progressive Disclosure Architecture

Skills load in three phases:
- **Phase 1 (~100 tokens)**: Metadata (name, description) - "Should I activate?"
- **Phase 2 (&lt;5k tokens)**: Main instructions in SKILL.md - "How do I do this?"
- **Phase 3 (as needed)**: Scripts, references, assets - "Show me the details"

**Critical**: Keep SKILL.md under 500 lines. Split details into `/references`.

### 2. Description Field Design

The description is your activation trigger. It must include:
- **What**: What capability does this provide
- **When**: Specific contexts/keywords that should activate it
- **Not**: What it's NOT for (prevents false activation)

**Good example**:
```yaml
description: Analyzes image embeddings using CLIP alternatives. Use for image-text matching, semantic search, or visual similarity. NOT for fine-grained classification, counting objects, or spatial reasoning (use specialized models instead). Mention CLIP, embeddings, or image search.
```

**Bad example**:
```yaml
description: Helps with images
```

### 3. Anti-Pattern Detection

Great skills actively warn about common mistakes. Structure:

```markdown
## Common Anti-Patterns

### Pattern: [Name]
**What it looks like**: [Code example or description]
**Why it's wrong**: [Fundamental reason]
**What to do instead**: [Better approach]
**How to detect**: [Validation rule]
```

### 4. Temporal Knowledge

Technology evolves. Capture what changed and when:

```markdown
## Evolution Timeline

### Pre-2024: Old Approach
[What people used to do]

### 2024-Present: Current Best Practice
[What changed and why]

### Watch For
[Deprecated patterns LLMs might still suggest]
```

## Skill Structure

### Mandatory Files

```
your-skill/
├── SKILL.md           # Core instructions (&lt;500 lines)
├── LICENSE.txt        # If applicable
└── scripts/           # Executable code
    ├── validate.py    # Pre-flight validation
    └── example.py     # Working demonstration
```

### Optional Files

```
├── references/        # Detailed documentation
│   ├── antipatterns.md
│   ├── alternatives.md
│   └── deep_dive.md
├── assets/            # Supporting files
│   ├── templates/
│   └── config/
└── examples/          # Good/bad examples
    ├── good/
    └── bad/
```

## SKILL.md Template

```markdown
---
name: your-skill-name
description: [What] [When to use] [Specific triggers]. NOT for [What it's not for].
allowed-tools: Read,Write,Bash  # Only what you need
---

# Skill Name

[One sentence: what this skill does]

## When to Use

- Primary use case
- Secondary use case
- When NOT to use (important!)

## Quick Start

[Minimal example that works]

## Core Instructions

### Step 1: [Action]
[Clear, specific instructions]

### Step 2: [Action]
[More instructions]

## Common Anti-Patterns

### [Pattern Name]
**Symptom**: [How to recognize it]
**Problem**: [Why it's wrong]
**Solution**: [What to do instead]

## Validation Checklist

- [ ] Check 1
- [ ] Check 2
- [ ] Check 3

## Troubleshooting

### Issue: [Common problem]
**Cause**: [Why it happens]
**Fix**: [How to resolve]

## Further Reading

See `/references/deep_dive.md` for [detailed topic]
```

## Domain-Specific Shibboleths

These are the deep knowledge areas where skills add the most value:

### Technical Shibboleths

**Example: CLIP Embeddings**
- Novice knowledge: "CLIP is great for image-text matching"
- Expert knowledge: "CLIP fails at: counting objects, fine-grained classification, attribute binding, spatial relationships, negation. Use DCSMs for compositional reasoning, PC-CLIP for geometric properties, specialized models for counting."

**Example: React Patterns**
- Novice: "Use useState for everything"
- Expert: "useState for local UI, useReducer for complex state, Context for prop drilling, but NOT for high-frequency updates. Pre-2024 used Redux; 2024+ uses Zustand/Jotai for global state."

### Framework Evolution

**Example: Next.js**
- Pre-13: Pages Router, getServerSideProps
- 13+: App Router, Server Components, Server Actions
- Anti-pattern: Using Pages Router patterns in App Router code

### Tool Selection Shibboleths

**MCPs vs Scripts**:
- Use MCP for: Auth boundaries, external APIs, stateful connections
- Use Scripts for: Local transforms, batch operations, validation
- Anti-pattern: Building an MCP when a script would suffice

## Validation Patterns

### Plan-Validate-Execute

For complex operations:

```python
# 1. Generate plan
plan = create_plan(task)

# 2. Validate plan (BEFORE execution)
errors = validate_plan(plan)
if errors:
    raise ValidationError(errors)

# 3. Execute
result = execute_plan(plan)

# 4. Verify
verify_result(result)
```

### Pre-Flight Checks

Include a validation script that catches errors early:

```python
def validate_skill(skill_path):
    checks = [
        check_structure,
        check_description_quality,
        check_for_antipatterns,
        check_progressive_disclosure,
        check_line_count,
    ]
    
    results = []
    for check in checks:
        result = check(skill_path)
        results.append(result)
    
    return ValidationReport(results)
```

## Examples

### Good Skill: CLIP-Aware Image Processing

```markdown
---
name: clip-aware-image-processing
description: Image-text matching with CLIP and alternatives. Use for semantic image search, similarity matching. NOT for counting, fine-grained classification, or spatial reasoning. Mention CLIP, embeddings, image similarity.
---

# CLIP-Aware Image Processing

## When to Use

✅ Use for:
- Semantic image search ("find images of beaches")
- Coarse-grained classification
- Zero-shot image categorization

❌ Do NOT use for:
- Counting objects ("how many cars?") → Use object detection
- Fine-grained classification (car models, flower species) → Use specialized models
- Spatial relationships ("cat left of dog") → Use spatial relation models
- Attribute binding ("red car AND blue truck") → Use DCSMs or PC-CLIP

## Common Anti-Patterns

### Anti-Pattern: Using CLIP for Everything

**Problem**: "CLIP is pre-trained and works for everything!"

**Why wrong**: CLIP's latent space has fundamental geometric limitations. It cannot simultaneously represent:
1. Basic descriptions
2. Attribute binding
3. Spatial relationships
4. Negation

**What to do**: Task-specific model selection
- Counting → DETR, Faster R-CNN
- Fine-grained → EfficientNet with task-specific head
- Spatial → GQA models, SWIG
- Compositional → DCSMs, PC-CLIP

### Anti-Pattern: Ignoring Temporal Changes

**Problem**: Using pre-2023 CLIP papers as gospel

**Reality**: 
- 2021: Original CLIP
- 2023: Limitations discovered (attribute binding, spatial)
- 2024: PC-CLIP (pairwise), DCSMs (dense topology)
- 2025: SpLiCE (sparse interpretable)

## Scripts

See `/scripts/clip_validator.py` for checking if CLIP is appropriate
```

### Bad Skill: Overly Verbose

```markdown
---
name: image-processing
description: Processes images
---

# Image Processing

This skill helps you process images using various techniques including
but not limited to deep learning, computer vision, and classical image
processing methods. We can work with many different formats and...

[500 more lines of general information without specific guidance]
```

## Integration with Other Tools

### Works Well With

- **MCP Servers**: For API access, skill provides the workflow
- **Subagents**: Skill gives expertise, subagent gets tool permissions
- **Projects**: Skill available across all conversations

### Conflicts With

- **Overly specific prompts**: Skill already encodes the pattern
- **Too many tools**: Use `allowed-tools` to constrain scope

## Iteration Strategy

### With Claude Itself

1. Start working on a task
2. Ask Claude to capture successful approaches
3. Ask Claude to note common mistakes
4. Have Claude update the skill
5. Test the updated skill

### Pattern Recognition

Watch for:
- **Unexpected exploration paths**: Is structure intuitive?
- **Missed connections**: Are references clear?
- **Overreliance on sections**: Should content be in main SKILL.md?
- **Ignored content**: Is bundled file unnecessary?

## Security Considerations

### Allowed Tools

Only include what you need:
- Read-only skill: `Read,Grep,Glob`
- File creator: `Read,Write,Edit`
- Build tool: `Read,Write,Bash(npm:*,git:*)`

⚠️ **Never use**: `Bash` without restrictions for untrusted skills

### Code Execution

Skills can execute arbitrary code. Only install from trusted sources.

### Audit Checklist

- [ ] Read all scripts before enabling
- [ ] Check for network calls
- [ ] Verify allowed-tools scope
- [ ] Review any external dependencies
- [ ] Test in isolated environment first

## Testing Your Skill

### Activation Test

```bash
# Ask Claude a question that should trigger your skill
# Check Claude's chain of thought - did it activate?
```

### Effectiveness Test

```bash
python scripts/skill_tester.py your-skill/
```

Measures:
- Does Claude invoke it when appropriate?
- Does it prevent common errors?
- Does it provide better outputs than baseline?

### Integration Test

- Test with related skills
- Test with MCPs
- Test in different projects

## Further Documentation

- `/references/antipatterns.md` - Comprehensive anti-pattern catalog
- `/references/shibboleths.md` - Domain-specific deep knowledge
- `/references/evolution.md` - How AI tooling has evolved
- `/references/mcp_vs_scripts.md` - Architecture decision guide
- `/examples/good/` - Well-designed skills to study
- `/examples/bad/` - What to avoid

## Common Questions

### "How much should I put in SKILL.md vs references?"

**SKILL.md**: Instructions Claude needs every time (under 500 lines)
**References**: Deep dives, examples, alternatives Claude references as needed

### "Should I include an MCP or a script?"

**Script** if:
- Stateless operation
- No auth required
- Local execution
- Batch processing

**MCP** if:
- External API
- Auth boundaries
- Stateful connection
- Real-time data

### "How do I handle deprecated approaches?"

Explicitly call them out:

```markdown
## ⚠️ Deprecated Patterns

### Pattern: [Old approach]
**Used until**: [Date]
**Why deprecated**: [Reason]
**Current approach**: [What to use now]
**LLM mistake**: LLMs may still suggest this due to training data
```

## Metrics

Good skills have:
- Activation rate: 90%+ when appropriate
- False positive rate: &lt;5%
- Error prevention: Measurable reduction in common mistakes
- Token efficiency: &lt;5k tokens for typical invocation

## Version History

Track skill evolution:

```markdown
## Changelog

### v1.2.0 (2025-03-15)
- Added DCSMs alternative for compositional reasoning
- Updated anti-patterns for 2025 frameworks
- Improved validation script

### v1.1.0 (2025-01-10)
- Initial release
```

---

**Need help?** This skill can guide you through:
1. Creating a new skill from scratch
2. Auditing an existing skill
3. Adding anti-pattern detection
4. Improving progressive disclosure
5. Encoding domain expertise

Just ask Claude to help you with any of these tasks while this skill is active.
