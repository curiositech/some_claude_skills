# Claude Skills Conversion Log

## Overview
Converting 14 expert agent prompts from `.github/agents/` (GitHub Copilot format) to `.claude/skills/` (Claude Skills format).

## Before State (Screenshot 1)

### Current Structure
```
.github/agents/
├── adhd_design_expert.md (766 lines) ⚠️ NEEDS SPLIT
├── agent_creator.md (564 lines)
├── design_system_creator.md (231 lines) ✅
├── drone_cv_expert.md (397 lines) ✅
├── drone_inspection_specialist.md (653 lines) ⚠️ NEEDS SPLIT
├── hrv_alexithymia_expert.md (516 lines)
├── metal_shader_expert.md (726 lines) ⚠️ NEEDS SPLIT
├── native_app_designer.md (550 lines)
├── orchestrator.md (304 lines) ✅
├── research_analyst.md (185 lines) ✅
├── team_builder.md (262 lines) ✅
├── tech_entrepreneur_coach_adhd.md (750 lines) ⚠️ NEEDS SPLIT
├── web_design_expert.md (74 lines) ✅
└── wisdom_accountability_coach.md (502 lines)
```

### Current Format (web_design_expert.md)
```markdown
# Web Design Expert Agent

You are an expert web designer and brand identity specialist with deep knowledge of:
- Modern design principles and aesthetics
- Brand identity development
[...no YAML frontmatter...]
```

## Required Changes

### 1. Directory Structure
- ❌ Old: `.github/agents/web_design_expert.md`
- ✅ New: `.claude/skills/web-design-expert/SKILL.md`

### 2. YAML Frontmatter
Must add to every SKILL.md:
```yaml
---
name: web-design-expert
description: Creates unique web designs with brand identity, color palettes, typography, and modern UI/UX patterns. Use when you need distinctive visual designs or brand development.
---
```

### 3. File Naming
- ❌ Old: Any filename
- ✅ New: Must be named `SKILL.md`

### 4. Content Length
- ✅ Recommended: < 500 lines in SKILL.md
- ⚠️ If > 500 lines: Split into SKILL.md + reference.md + examples.md

### 5. Name Format
- ✅ Lowercase with hyphens
- ✅ Max 64 characters
- ✅ Already compliant: web-design-expert, adhd-design-expert, etc.

## Conversion Strategy

### Phase 1: Simple Conversions (< 500 lines)
These need only directory + frontmatter + rename:
1. ✅ web-design-expert (74 lines)
2. ✅ research-analyst (185 lines)
3. ✅ design-system-creator (231 lines)
4. ✅ team-builder (262 lines)
5. ✅ orchestrator (304 lines)
6. ✅ drone-cv-expert (397 lines)

### Phase 2: Borderline Files (500-570 lines)
Keep in SKILL.md, monitor:
7. ⚠️ wisdom-accountability-coach (502 lines)
8. ⚠️ hrv-alexithymia-expert (516 lines)
9. ⚠️ native-app-designer (550 lines)
10. ⚠️ agent-creator (564 lines)

### Phase 3: Must Split (> 600 lines)
Split into SKILL.md + reference.md:
11. 🔧 drone-inspection-specialist (653 lines)
12. 🔧 metal-shader-expert (726 lines)
13. 🔧 tech-entrepreneur-coach-adhd (750 lines)
14. 🔧 adhd-design-expert (766 lines)

## Conversion Process (Documented)

### Example: web-design-expert

#### Before
Location: `.github/agents/web_design_expert.md`
```markdown
# Web Design Expert Agent

You are an expert web designer and brand identity specialist...
```

#### After
Location: `.claude/skills/web-design-expert/SKILL.md`
```yaml
---
name: web-design-expert
description: Creates unique web designs with brand identity, color palettes, typography, and modern UI/UX patterns. Use when you need distinctive visual designs or brand development.
---

# Web Design Expert

You are an expert web designer and brand identity specialist...
```

#### Changes Made
1. ✅ Created directory: `.claude/skills/web-design-expert/`
2. ✅ Renamed file to: `SKILL.md`
3. ✅ Added YAML frontmatter with name and description
4. ✅ Simplified title (removed "Agent")
5. ✅ Content unchanged (under 500 lines)

## Testing Plan

After conversion, test that:
1. Claude Code can discover all skills
2. Skill descriptions appear in autocomplete
3. Skills load when invoked
4. Progressive disclosure works (reference.md files load when needed)

## Conversion Results

✅ **ALL 14 SKILLS SUCCESSFULLY CONVERTED!**

### Final Structure
```
.claude/skills/
├── adhd-design-expert/ (SKILL.md + reference.md)
├── agent-creator/
├── design-system-creator/
├── drone-cv-expert/
├── drone-inspection-specialist/ (SKILL.md + reference.md)
├── hrv-alexithymia-expert/
├── metal-shader-expert/ (SKILL.md + reference.md)
├── native-app-designer/
├── orchestrator/
├── research-analyst/
├── team-builder/
├── tech-entrepreneur-coach-adhd/ (SKILL.md + reference.md)
├── web-design-expert/
└── wisdom-accountability-coach/

14 directories, 18 files total
```

### Changes Made

#### All Skills
1. ✅ Added YAML frontmatter with `name` and `description`
2. ✅ Moved to `.claude/skills/[skill-name]/`
3. ✅ Renamed to `SKILL.md`
4. ✅ Converted names to kebab-case

#### Large Skills (4 files > 600 lines)
Split into SKILL.md + reference.md:
1. **adhd-design-expert** (766 → 341 + 425 lines)
   - SKILL.md: Core principles and mission
   - reference.md: Pattern library, components, testing

2. **metal-shader-expert** (726 → 400 + 326 lines)
   - SKILL.md: Core competencies and fundamentals
   - reference.md: Advanced techniques and examples

3. **tech-entrepreneur-coach-adhd** (750 → 400 + 350 lines)
   - SKILL.md: Core coaching framework
   - reference.md: Detailed strategies and tactics

4. **drone-inspection-specialist** (653 → 400 + 253 lines)
   - SKILL.md: Core inspection capabilities
   - reference.md: Advanced detection and 3D reconstruction

## Next Steps

1. ✅ Document current state
2. ✅ Convert Phase 1 skills (simple)
3. ✅ Convert Phase 2 skills (borderline)
4. ✅ Convert Phase 3 skills (split required)
5. ⏳ Test with Claude Code
6. ⏳ Update main documentation
7. ⏳ Create usage examples

## Validation

Run these commands to verify:
```bash
# Count skills (should be 14)
find .claude/skills -name "SKILL.md" | wc -l

# View structure
tree .claude/skills -L 2

# Test a skill with frontmatter
head -5 .claude/skills/web-design-expert/SKILL.md
```

---
*Conversion started: 2025-11-16*
*Conversion completed: 2025-11-16* ✅
