# Corpus Skill Draft Generation - Complete Guide

## Quick Start

To resume skill draft generation from existing knowledge maps:

```bash
cd corpus
python scripts/generate_skills_from_maps.py
```

**Estimated cost**: ~$0.90 for 18 remaining books

## Overview

This corpus distillation pipeline extracts expert knowledge from professional books and converts it into Claude Code skill files.

### Three-Pass Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Pass 1    │────▶│    Pass 2    │────▶│   Pass 3    │
│ Haiku Army  │     │   Sonnet     │     │   Sonnet    │
│ (Parallel)  │     │  Synthesis   │     │ Skill Draft │
└─────────────┘     └──────────────┘     └─────────────┘
Extract chunks      Merge into map      Generate SKILL.md
  ~$0.30/book         ~$0.19/book          ~$0.05/book
```

**Total cost per book**: ~$0.54 (for 300-page book)

### Current Status (as of 2026-02-06)

| Stage | Complete | Remaining | Cost Spent | Est. Remaining |
|-------|----------|-----------|------------|----------------|
| Pass 1 & 2 (Knowledge Maps) | 22 | 0 | ~$10.78 | $0.00 |
| Pass 3 (Skill Drafts) | 4 | 18 | $1.20 | $0.90 |
| **Total** | **4** | **18** | **$11.98** | **$0.90** |

## Scripts

### 1. Main Distillation Pipeline

**File**: `scripts/distill.py`

```bash
# Process single file
python scripts/distill.py books/my_book.pdf --output-mode skill-draft

# Process entire directory
python scripts/distill.py books/ --output-mode skill-draft
```

**Output modes**:
- `summary` - Pass 1 only (chunk summaries)
- `knowledge-map` - Pass 1 & 2 (knowledge map JSON)
- `skill-draft` - All 3 passes (generates SKILL.md)

### 2. Optimized Skill Generator (RECOMMENDED FOR RESUMPTION)

**File**: `scripts/generate_skills_from_maps.py`

```bash
python scripts/generate_skills_from_maps.py
```

**Why use this**:
- ✅ Skips expensive Pass 1 & 2 (already complete)
- ✅ Processes only books without SKILL.md files
- ✅ 5-10x faster than re-running full pipeline
- ✅ Detailed progress and cost tracking
- ✅ Graceful error handling

**What it does**:
1. Scans `corpus/output/` for knowledge map files
2. Filters to those without corresponding SKILL.md
3. Generates skill drafts using Sonnet 4.5
4. Reports per-book costs and progress

### 3. Status Checker

**File**: `scripts/check_status.py`

```bash
python scripts/check_status.py
```

Shows:
- Number of completed knowledge maps
- Number of completed skill drafts
- Which books still need processing
- Estimated cost for remaining work

## Directory Structure

```
corpus/
├── books/                      # Original source books (not in repo)
├── books_skill_draft/          # Books to process (symlinks or copies)
├── output/
│   ├── *_pass1_extractions.json    # Pass 1 chunk extractions
│   ├── *_knowledge_map.json        # Pass 2 knowledge maps (22 files)
│   └── *_SKILL.md                  # Pass 3 skill drafts (4 complete, 18 pending)
└── scripts/
    ├── distill.py                  # Main pipeline
    ├── generate_skills_from_maps.py # Optimized skill generator
    └── check_status.py             # Status checker
```

## Books Processed

### Complete (4 skill drafts)
1. ✅ 0551113 - $0.10
2. ✅ The Craft of Research - $0.55
3. ✅ The Sociological Imagination - $0.56
4. ✅ How to Solve It (Polya) - (from earlier run)

### Knowledge Maps Complete (18 pending skill drafts)
5. ⏳ 4bb8d08a9b309df7d86e62ec4056ceef
6. ⏳ 7 Principles of Public Speaking
7. ⏳ The Checklist Manifesto (Gawande)
8. ⏳ How to Solve It (George Polya variant)
9. ⏳ Gödel, Escher, Bach
10. ⏳ Lakatos (Proofs and Refutations)
11. ⏳ Thinking in Systems (Meadows)
12. ⏳ How to Solve It (Polya variant)
13. ⏳ Poor Charlie's Almanack
14. ⏳ Seeing Like a State
15. ⏳ Clean Code
16. ⏳ Data Science for Business
17. ⏳ Design Patterns
18. ⏳ Lakatos (variant 2)
19. ⏳ The Mythical Man-Month
20. ⏳ The Passionate Programmer
21. ⏳ A Philosophy of Software Design
22. ⏳ What Is Mathematics, Really? (Hersh)

## Cost Breakdown

### Historical Costs (Successful Completions)

| Book | Pages | Pass 1 | Pass 2 | Pass 3 | Total |
|------|-------|--------|--------|--------|-------|
| 0551113 | 2 | $0.0045 | $0.0421 | ~$0.05 | $0.10 |
| Craft of Research | 275 | $0.3031 | $0.1946 | ~$0.05 | $0.55 |
| Sociological Imagination | 255 | $0.3126 | $0.1927 | ~$0.05 | $0.56 |

### Pricing (Sonnet 4.5)
- **Input**: $3.00 per million tokens
- **Output**: $15.00 per million tokens

### Pass 3 Estimates
- Average input: ~2,000 tokens (knowledge map)
- Average output: ~1,500 tokens (SKILL.md)
- Cost per skill: **$0.05**

### Remaining Budget
- **18 books × $0.05 = $0.90 total**

## Quality Assurance

Each generated SKILL.md should contain:

### Required Sections
- ✅ YAML frontmatter (name, description, allowed-tools)
- ✅ "When to Use" with ✅ and ❌ examples
- ✅ Core Process (as decision trees, not prose)
- ✅ Anti-Patterns section
- ✅ References section with source book

### Quality Indicators
- **Decision trees**: Core processes should be flowcharts/conditionals, not paragraphs
- **Anti-patterns**: Should use Novice/Expert/Timeline template
- **Temporal knowledge**: Includes dates and historical context where relevant
- **Shibboleths**: Encodes mental models and metaphors from the source

### Post-Generation Review
After generation completes:

1. **Validation**:
   ```bash
   # Check all skill files parse correctly
   for skill in output/*_SKILL.md; do
     echo "Checking: $skill"
     head -20 "$skill" | grep -q "^---" || echo "  ❌ Missing frontmatter"
   done
   ```

2. **Manual Review**:
   - Read 2-3 random skill drafts
   - Verify they capture book's core concepts
   - Check decision trees are actually tree-structured
   - Ensure anti-patterns are specific, not generic

3. **Integration**:
   - Move high-quality skills to `.claude/skills/`
   - Create bundles for related books (e.g., "problem-solving-bundle" for Polya books)
   - Document any books that need skill refinement

## Troubleshooting

### API Credit Exhaustion
**Symptom**: Script stops with `credit balance too low` error

**Solution**:
1. Check Anthropic dashboard for credit status
2. Add credits if needed
3. Re-run `generate_skills_from_maps.py` - it will resume from where it stopped

### Knowledge Map Missing
**Symptom**: Script complains about missing knowledge map

**Solution**:
1. Run `check_status.py` to verify which files exist
2. If knowledge map is missing, run full pipeline:
   ```bash
   python scripts/distill.py books_skill_draft/BOOK_NAME.pdf --output-mode knowledge-map
   ```
3. Then re-run skill generator

### Malformed Skill Draft
**Symptom**: Generated SKILL.md doesn't follow template

**Causes**:
- Knowledge map had parsing errors
- Model didn't follow instructions

**Solution**:
1. Check source knowledge map for `parse_error: true`
2. If knowledge map is malformed, re-run Pass 2:
   ```bash
   # Edit distill.py to start from Pass 2 with existing extractions
   ```
3. If knowledge map is valid but skill is bad, manually edit or re-generate

## Next Steps

After all 18 skill drafts are complete:

### 1. Skill Quality Review
- [ ] Validate all 22 SKILL.md files parse correctly
- [ ] Manual review of 5-10 random skills
- [ ] Identify books needing skill refinement

### 2. Integration Planning
- [ ] Move validated skills to `.claude/skills/`
- [ ] Create skill bundles:
  - `problem-solving-bundle` (Polya, Lakatos, Gawande)
  - `software-craftsmanship-bundle` (Clean Code, Design Patterns, Mythical Man-Month, POSD)
  - `systems-thinking-bundle` (Meadows, Seeing Like a State, GEB)
  - `research-methods-bundle` (Craft of Research, Sociological Imagination)

### 3. Documentation
- [ ] Create corpus skill index
- [ ] Document which skills replace/augment existing skills
- [ ] Write integration guide for using corpus skills

### 4. Expansion
- [ ] Identify next batch of books to distill
- [ ] Estimate costs for full library (100+ books)
- [ ] Consider creating specialized distillation prompts per domain

## References

- [Master Implementation Plan](../docs/MASTER_IMPLEMENTATION_PLAN.md)
- [Skill Resumption Plan](SKILL_DRAFT_RESUMPTION_PLAN.md)
- [Original Distillation Pipeline](scripts/distill.py)
