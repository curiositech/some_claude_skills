# Corpus Skill Generation - Quick Start

## TL;DR

```bash
cd corpus
python scripts/generate_skills_from_maps.py
```

**This will**:
- Generate 18 remaining skill drafts
- Cost ~$0.90
- Take ~10-15 minutes
- Create SKILL.md files in `corpus/output/`

## Before You Start

1. **Check API Credits**:
   - Visit https://console.anthropic.com/settings/billing
   - Ensure you have at least $1.00 available

2. **Verify Environment**:
   ```bash
   # API key should be set
   echo $ANTHROPIC_API_KEY
   # Should show your key, not empty
   ```

3. **Check Current Status**:
   ```bash
   python scripts/check_status.py
   ```
   Should show:
   - 22 knowledge maps ✅
   - 4 skill drafts ✅
   - 18 need processing ⏳

## Run the Generator

```bash
python scripts/generate_skills_from_maps.py
```

You'll see output like:
```
Found 22 knowledge maps
Need to generate 18 skill drafts

[1/18] Processing: clean_code
   ✅ Saved: corpus/output/clean_code_SKILL.md
   Cost: $0.0500 (1,234 in + 567 out)

[2/18] Processing: design_patterns
   ✅ Saved: corpus/output/design_patterns_SKILL.md
   Cost: $0.0480 (1,180 in + 542 out)

...
```

## Expected Results

After completion:
- **22 SKILL.md files** in `corpus/output/`
- **Total cost**: ~$0.90
- **Time**: 10-15 minutes

## If Something Goes Wrong

### API Credit Error
```
❌ Error: Your credit balance is too low
```

**Fix**:
1. Add credits at https://console.anthropic.com/settings/billing
2. Re-run the script (it will skip completed files)

### API Key Not Found
```
❌ Error: ANTHROPIC_API_KEY not set
```

**Fix**:
```bash
export ANTHROPIC_API_KEY='your-key-here'
python scripts/generate_skills_from_maps.py
```

### Script Not Found
```
❌ No such file or directory: scripts/generate_skills_from_maps.py
```

**Fix**:
```bash
# Make sure you're in the corpus/ directory
cd /Users/erichowens/coding/some_claude_skills/corpus
python scripts/generate_skills_from_maps.py
```

## After Completion

1. **Verify Success**:
   ```bash
   python scripts/check_status.py
   # Should show 22/22 skill drafts complete
   ```

2. **Review Quality**:
   ```bash
   # Read a few random skills
   cat output/clean_code_SKILL.md
   cat output/design_patterns_SKILL.md
   ```

3. **Next Steps**:
   - See [README_SKILL_GENERATION.md](README_SKILL_GENERATION.md) for integration plan
   - Move validated skills to `.claude/skills/`
   - Create skill bundles

## Files

| File | Purpose |
|------|---------|
| `scripts/generate_skills_from_maps.py` | ⭐ Run this to generate skills |
| `scripts/check_status.py` | Check what's complete |
| `scripts/distill.py` | Original full pipeline (slower) |
| `output/*_knowledge_map.json` | Source data (22 files) |
| `output/*_SKILL.md` | Generated skills (4→22 files) |

## Cost Reference

| What | Cost |
|------|------|
| Already spent (Passes 1 & 2) | $10.78 |
| Already spent (4 skill drafts) | $1.20 |
| **Remaining (18 skill drafts)** | **$0.90** |
| **Total project** | **$12.88** |

## Help

- **Full documentation**: [README_SKILL_GENERATION.md](README_SKILL_GENERATION.md)
- **Detailed plan**: [SKILL_DRAFT_RESUMPTION_PLAN.md](SKILL_DRAFT_RESUMPTION_PLAN.md)
- **Issue tracker**: Create GitHub issue or ask in project chat
