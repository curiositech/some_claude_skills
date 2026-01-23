# Skill-Coach: Overview

## What This Is

A **meta-skill** that guides creation of expert-level Agent Skills - the kind that encode real domain knowledge and shibboleths, not just surface-level instructions.

**Status**: Iteratively self-improved 5 times using its own guidance (Nov 2025), demonstrating the improvement loop it teaches.

## Key Innovation: Encoding the Shibboleths

Most skills say: "Here's how to use X"

This teaches: "Here's how to use X, and here's where everyone gets it wrong, and why, and what to use instead"

## Structure

```
skill-coach/
├── README.md                           # Start here
├── SKILL.md                            # The coach skill itself
├── scripts/
│   └── validate_skill.py              # ✅ Validates skill structure & quality
├── references/
│   ├── antipatterns.md                # 🎯 Domain-specific shibboleths
│   └── mcp_vs_scripts.md              # When to use MCP vs Scripts
└── examples/
    └── good/
        └── clip-aware-embeddings/     # 🌟 Exemplary skill
            ├── SKILL.md
            └── scripts/
                └── validate_clip_usage.py  # Domain-specific validator
```

## The CLIP Example: Why This Matters

Look at `examples/good/clip-aware-embeddings/SKILL.md` - it doesn't just say "use CLIP for image-text matching."

It says:

**Novice knowledge** (what LLMs trained on 2021-2023 data know):
> "CLIP is pre-trained on 400M image-text pairs! Use it for all image tasks!"

**Expert knowledge** (the shibboleth):
> "CLIP has fundamental geometric limitations. It CANNOT:
> - Count objects (use DETR instead)
> - Do fine-grained classification (use specialized models)
> - Understand spatial relationships (use GQA models)
> - Bind attributes ('red car AND blue truck' → use DCSMs)"

This is the knowledge gap that separates "it compiles" from "it's correct."

## What Makes This Different

### 1. Anti-Patterns Catalog

`references/antipatterns.md` documents:
- CLIP's actual limitations (with research citations)
- Framework evolution (Next.js Pages → App Router)
- Architecture decisions (MCP vs Scripts philosophy)
- Temporal context (when things changed and why)

### 2. Validation Tooling

**General validation** (`scripts/validate_skill.py`):
- Checks structure (YAML, required fields)
- Validates description quality
- Ensures progressive disclosure
- Checks line count (&lt;500)
- Verifies allowed-tools scope

**Domain-specific validation** (`examples/.../validate_clip_usage.py`):
- Detects counting queries → suggests object detection
- Identifies spatial queries → suggests spatial models
- Catches fine-grained tasks → suggests specialized models

This is **executable domain knowledge**.

### 3. Progressive Disclosure Done Right

The CLIP skill is 380 lines but FEELS concise because:
- Quick decision tree upfront
- Anti-patterns clearly marked
- References to deep dives (not inline)
- Validation scripts (run, don't read)

### 4. Temporal Knowledge

Every anti-pattern includes:
- **Timeline**: "2021: CLIP released, 2023: limitations discovered"
- **Why LLMs get it wrong**: "Training data predates the research"
- **Migration path**: "If you're doing X, use Y instead"

## Test It Out

### Validate Your Skills

```bash
cd skill-coach
python scripts/validate_skill.py /path/to/your-skill/
```

### See Domain Validation

```bash
cd examples/good/clip-aware-embeddings
python scripts/validate_clip_usage.py "How many cars are in this image?"
# → ❌ Use object detection: DETR, Faster R-CNN, YOLO

python scripts/validate_clip_usage.py "Find images of beaches"
# → ✅ CLIP is appropriate
```

## The MCP vs Scripts Philosophy

From `references/mcp_vs_scripts.md`:

> "MCP's job isn't to abstract reality for the agent; it's to manage the auth, networking, and security boundaries and then get out of the way."

**Use Scripts for**:
- Local file operations
- Stateless transformations
- CLI wrappers
- Batch processing

**Use MCPs for**:
- External APIs with auth
- Stateful connections
- Real-time data
- Multiple related operations

The guide includes decision matrix, evolution path, and anti-examples.

## Key Shibboleths Encoded

### ML/AI
- CLIP's geometric impossibilities
- Embedding model selection by task
- Model versioning and temporal changes

### Frameworks
- Next.js: Pages Router → App Router (Oct 2022)
- React: Class Components → Hooks (Feb 2019)
- State: Redux → Zustand/Context (2020+)

### Architecture
- When complexity justifies MCP over scripts
- Security via least-privilege tool access
- Performance vs simplicity tradeoffs

## What You Can Do With This

1. **Use it as-is**: Ask Claude to apply skill-coach when creating skills
2. **Study the example**: See all principles in action
3. **Add your shibboleths**: Contribute domain knowledge you've learned
4. **Validate existing skills**: Run the validator on skills you have

## Recent Improvements (5 Iterations)

The skill-coach has been iteratively improved using its own guidance:

**Iteration 1**: Foundation
- Added 5 skill-specific anti-patterns (Reference Illusion, Description Soup, Template Theater, Everything Skill, Orphaned Sections)
- Added Evolution Timeline (2024-2025 skill framework best practices)
- Created comprehensive Skill Review Checklist
- Removed all references to non-existent files

**Iteration 2**: Actionability
- Added 3 Common Workflows (create, debug activation, reduce false positives)
- Made iteration strategy actionable with specific prompts
- Explained why THIS skill uses each tool
- Condensed validation patterns to concepts

**Iteration 3**: Expert Knowledge
- Added Skill Creation Shibboleths (novice vs expert skill creator)
- Enhanced "What Makes a Great Skill" (5→7 items)
- Condensed domain examples
- Added meta-note about self-improvement

**Iteration 4**: Usability
- Added "Quick Wins" - 5 immediate improvements
- Simplified skill structure (honest about what's needed)
- Description progression (Bad→Better→Good)
- Realistic file structure (SKILL.md only is mandatory)

**Iteration 5**: Decision Support
- Added Decision Trees (when to create new skill, Skill vs Subagent vs MCP)
- Prioritized checklist (CRITICAL/HIGH PRIORITY/NICE TO HAVE)
- Final polish and consistency

**Result**: 482 → 470 lines, more concise yet more comprehensive.

## The Meta Point

This skill **practices what it preaches**:

- ✅ Progressive disclosure (SKILL.md → references/)
- ✅ Anti-patterns specific to skill creation
- ✅ Validation tooling (validate_skill.py)
- ✅ Working examples (CLIP skill)
- ✅ Temporal knowledge (2024-2025 evolution)
- ✅ Clear decision trees (when to create, Skill vs MCP)
- ✅ Iteratively improved using its own guidance

It's not just teaching - it's demonstrating.

## Start Here

1. Read `README.md` for getting started
2. Check `SKILL.md` for Quick Wins (immediate improvements)
3. Study `examples/good/clip-aware-embeddings/SKILL.md`
4. Review `references/antipatterns.md` for domain shibboleths
5. Use skill-coach when creating/improving your own skills

## The Philosophy

> "Great skills don't just say 'here's how' - they say 'here's how, and here's where everyone gets it wrong, and why, and what to use instead.'"

This is about encoding expertise and shibboleths, not just instructions.

---

Created: 2025-11-23
Last Improved: 2025-11-24 (5 iterations)
Version: 2.0.0
