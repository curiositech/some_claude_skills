# Skill-Coach: Overview

## What I Built

A comprehensive skill authoring guide that teaches how to create **expert-level Agent Skills** - the kind that encode real domain knowledge and shibboleths, not just surface-level instructions.

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

## The Meta Point

This skill demonstrates its own principles:

- ✅ Progressive disclosure (SKILL.md → references/)
- ✅ Anti-patterns (MCP for everything, overly verbose, etc.)
- ✅ Validation tooling (validate_skill.py)
- ✅ Working examples (CLIP skill)
- ✅ Temporal knowledge (what changed when)
- ✅ Clear alternatives (when NOT to use what)

It's not just teaching - it's demonstrating.

## Start Here

1. Read `README.md` for overview
2. Study `examples/good/clip-aware-embeddings/SKILL.md`
3. Run validation on the example
4. Check `references/antipatterns.md` for shibboleths
5. Use skill-coach when creating your own skills

## The Philosophy

> "Great skills don't just say 'here's how' - they say 'here's how, and here's where everyone gets it wrong.'"

This is about encoding expertise, not just instructions.

---

Created: 2025-11-23
Version: 1.0.0
