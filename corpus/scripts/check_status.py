#!/usr/bin/env python3
"""
Check status of corpus skill draft generation.

Shows which books have:
- Knowledge maps completed (Pass 1 & 2)
- Skill drafts completed (Pass 3)
- Still need processing
"""

from pathlib import Path

def main():
    output_dir = Path("corpus/output")

    # Find all knowledge maps
    knowledge_maps = list(output_dir.glob("*_knowledge_map.json"))
    knowledge_map_stems = {km.stem.replace("_knowledge_map", "") for km in knowledge_maps}

    # Find all skill drafts
    skill_drafts = list(output_dir.glob("*_SKILL.md"))
    skill_draft_stems = {sd.stem.replace("_SKILL", "") for sd in skill_drafts}

    # Calculate what needs processing
    needs_skill_draft = knowledge_map_stems - skill_draft_stems

    print("="*70)
    print("CORPUS SKILL DRAFT GENERATION - STATUS CHECK")
    print("="*70)
    print()
    print(f"📊 Knowledge Maps (Pass 1 & 2 complete): {len(knowledge_maps)}")
    print(f"✅ Skill Drafts (Pass 3 complete):       {len(skill_drafts)}")
    print(f"⏳ Needs Skill Draft Generation:         {len(needs_skill_draft)}")
    print()

    if needs_skill_draft:
        print("="*70)
        print("BOOKS NEEDING SKILL DRAFT GENERATION")
        print("="*70)
        for i, stem in enumerate(sorted(needs_skill_draft), 1):
            # Try to make filename more readable
            display_name = stem
            if len(display_name) > 60:
                display_name = display_name[:57] + "..."
            print(f"{i:2d}. {display_name}")

        print()
        print("="*70)
        print(f"ESTIMATED COST: ${len(needs_skill_draft) * 0.05:.2f}")
        print(f"  (Based on ~$0.05 per skill draft)")
        print("="*70)
        print()
        print("Run: python scripts/generate_skills_from_maps.py")
    else:
        print("🎉 All skill drafts are complete!")
        print()
        print("Next steps:")
        print("  1. Review generated SKILL.md files")
        print("  2. Move high-quality skills to .claude/skills/")
        print("  3. Create corpus integration plan")

    print()

if __name__ == "__main__":
    main()
