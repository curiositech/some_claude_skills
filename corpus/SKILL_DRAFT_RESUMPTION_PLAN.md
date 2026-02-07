# Corpus Skill Draft Generation - Resumption Plan

**Date**: 2026-02-06
**Status**: Ready to resume Pass 3 (skill draft generation)
**Estimated Cost**: ~$0.90 for 18 remaining books

## Current Status

### Completed (3 skill drafts, $1.20 spent)
1. ✅ **0551113.pdf** - $0.0966 total
2. ✅ **1667121038craft.pdf** - $0.5477 total
3. ✅ **2015.101543.The-Sociological-Imagination_text.pdf** - $0.5554 total

**Total spent on successful completions**: $1.20

### Existing Knowledge Maps (22 total)
All Pass 1 & 2 complete for these books:
- 0551113
- 1667121038craft
- 2015.101543.The-Sociological-Imagination_text
- 4bb8d08a9b309df7d86e62ec4056ceef
- 7_principles_of_public_speaking
- AtulGawandeTheChecklistManifestoHowToGetThingsRight2010
- George_Polya_How_To_Solve_It_
- Gödel Escher Bach_ An Eternal Golden Braid
- How to Solve It_ A New Aspect - Polya, G._7564
- Lakatos
- Meadows-2008.-Thinking-in-Systems
- Polya_G._How_to_solve_it__1957
- Poor Charlie's Almanack_ The Essential Wit and Wisdom of Charles T. Munger
- Seeing Like a State
- clean_code
- data_science_for_business
- design_patterns
- lakatos2
- mythical-man-month
- passionate_programmer
- philosophy_of_software_design
- what_is_mathematis_really-reuben_hersh

### Remaining Work
**18 books need skill draft generation** (Pass 3 only)

These have knowledge maps but no SKILL.md:
- 4bb8d08a9b309df7d86e62ec4056ceef (failed on Pass 3 during last run)
- 7_principles_of_public_speaking
- AtulGawandeTheChecklistManifestoHowToGetThingsRight2010
- George_Polya_How_To_Solve_It_
- Gödel Escher Bach_ An Eternal Golden Braid
- Lakatos
- Meadows-2008.-Thinking-in-Systems
- Polya_G._How_to_solve_it__1957
- Poor Charlie's Almanack_ The Essential Wit and Wisdom of Charles T. Munger
- Seeing Like a State
- clean_code
- data_science_for_business
- design_patterns
- lakatos2
- mythical-man-month
- passionate_programmer
- philosophy_of_software_design
- what_is_mathematis_really-reuben_hersh

## Cost Analysis

### Historical Costs (from successful runs)
| Book | Pass 1 | Pass 2 | Pass 3 | Total |
|------|--------|--------|--------|-------|
| 0551113 | $0.0045 | $0.0421 | ~$0.05 | $0.0966 |
| 1667121038craft | $0.3031 | $0.1946 | ~$0.05 | $0.5477 |
| 2015.101543... | $0.3126 | $0.1927 | ~$0.05 | $0.5554 |

**Average Pass 3 cost**: ~$0.05 per book

### Estimated Cost for Remaining Work
- **18 books × $0.05/book = ~$0.90 total**
- Using Sonnet 4.5 ($3/MTok in, $15/MTok out)
- Pass 3 only (no re-running of Pass 1 or 2)

## Execution Plan

### Option 1: Optimized Script (RECOMMENDED)
Use the new `generate_skills_from_maps.py` script that:
- ✅ Processes only knowledge maps without SKILL.md files
- ✅ Skips expensive Pass 1 & 2 (already complete)
- ✅ Generates skill drafts directly from existing knowledge maps
- ✅ Reports progress and costs per book
- ✅ Handles API credit errors gracefully

**Command**:
```bash
cd corpus
python scripts/generate_skills_from_maps.py
```

**Advantages**:
- Much faster (no text extraction, chunking, or Pass 1/2)
- Cheaper (only runs Pass 3)
- Progress tracking with individual book costs
- Automatic detection of existing skill drafts

### Option 2: Original Script (NOT RECOMMENDED)
Re-run the original distill.py script:
```bash
cd corpus
python scripts/distill.py books_skill_draft/ --output-mode skill-draft
```

**Disadvantages**:
- Will attempt Pass 1 & 2 again (already complete)
- Less efficient
- Same total cost but more API calls
- May hit rate limits

## Expected Output

After completion, you should have:
- **22 knowledge maps** (corpus/output/*_knowledge_map.json)
- **22 skill drafts** (corpus/output/*_SKILL.md)
- Total corpus cost: ~$2.10 ($1.20 spent + $0.90 remaining)

## Monitoring Progress

The script will output:
```
Found 22 knowledge maps
Need to generate 18 skill drafts

[1/18] Processing: 4bb8d08a9b309df7d86e62ec4056ceef
   ✅ Saved: corpus/output/4bb8d08a9b309df7d86e62ec4056ceef_SKILL.md
   Cost: $0.0500 (1,234 in + 567 out)

[2/18] Processing: 7_principles_of_public_speaking
   ✅ Saved: corpus/output/7_principles_of_public_speaking_SKILL.md
   Cost: $0.0450 (1,100 in + 500 out)

...

============================================================
SUMMARY
============================================================
Successfully generated: 18/18 skill drafts
Failed: 0
Total cost: $0.9012
Average cost per skill: $0.0501
```

## Error Handling

If API credits run out mid-process:
1. Script will stop gracefully
2. Report how many completions succeeded before failure
3. Knowledge maps remain intact
4. Can re-run script to complete remaining books

## Next Steps After Completion

1. Review generated SKILL.md files for quality
2. Potentially move skills to `.claude/skills/` directory
3. Create integration plan for incorporating book knowledge into existing skills
4. Consider creating a "corpus-distilled-skills" bundle

## Files Created

- `corpus/scripts/generate_skills_from_maps.py` - Optimized skill generation script
- `corpus/SKILL_DRAFT_RESUMPTION_PLAN.md` - This document
