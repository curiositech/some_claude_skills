#!/usr/bin/env python3
"""
Visibility Validation — Cross-reference checker for private/deprecated skills.

Ensures:
1. No public skill's pairs-with references a private skill
2. No public skill's pairs-with references a deprecated skill (warning only)
3. Private skills are not tracked in git

Usage:
    python scripts/validate_visibility.py
    python scripts/validate_visibility.py --verbose
    python scripts/validate_visibility.py --json
"""

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any

try:
    import yaml
except ImportError:
    print("ERROR: pyyaml required. Install with: pip install pyyaml")
    sys.exit(1)


def parse_frontmatter(path: Path) -> dict[str, Any] | None:
    """Parse YAML frontmatter from SKILL.md."""
    content = path.read_text(encoding="utf-8")
    match = re.match(r"^---\n(.*?)\n---", content, re.DOTALL)
    if not match:
        return None
    try:
        return yaml.safe_load(match.group(1))
    except yaml.YAMLError:
        return None


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate skill visibility cross-references")
    parser.add_argument("--skills-dir", default=".claude/skills", help="Skills directory")
    parser.add_argument("--verbose", action="store_true")
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args()

    skills_dir = Path(args.skills_dir).resolve()
    if not skills_dir.exists():
        print(f"Skills directory not found: {skills_dir}")
        return 1

    # Build visibility map
    private_skills: set[str] = set()
    deprecated_skills: set[str] = set()
    all_skills: dict[str, dict] = {}

    for skill_dir in sorted(skills_dir.iterdir()):
        if not skill_dir.is_dir():
            continue
        skill_md = skill_dir / "SKILL.md"
        if not skill_md.exists():
            continue

        fm = parse_frontmatter(skill_md)
        if not fm:
            continue

        skill_id = skill_dir.name
        metadata = fm.get("metadata", {}) or {}
        all_skills[skill_id] = fm

        if metadata.get("private"):
            private_skills.add(skill_id)
        if metadata.get("deprecated"):
            deprecated_skills.add(skill_id)

    # Check cross-references
    errors: list[dict] = []
    warnings: list[dict] = []

    for skill_id, fm in all_skills.items():
        if skill_id in private_skills or skill_id in deprecated_skills:
            continue  # Skip checking private/deprecated skills themselves

        metadata = fm.get("metadata", {}) or {}
        pairs = metadata.get("pairs-with", []) or []

        for pair in pairs:
            if not isinstance(pair, dict):
                continue
            ref = pair.get("skill", "")

            if ref in private_skills:
                errors.append({
                    "skill": skill_id,
                    "references": ref,
                    "type": "private",
                    "message": f"Public skill '{skill_id}' references private skill '{ref}' in pairs-with",
                })
            elif ref in deprecated_skills:
                warnings.append({
                    "skill": skill_id,
                    "references": ref,
                    "type": "deprecated",
                    "message": f"Public skill '{skill_id}' references deprecated skill '{ref}' in pairs-with",
                })

    # Check git tracking of private skills
    git_tracked_private: list[str] = []
    try:
        import subprocess
        result = subprocess.run(
            ["git", "ls-files", "--error-unmatch"] + [f".claude/skills/{s}" for s in private_skills],
            capture_output=True, text=True, cwd=skills_dir.parent.parent,
        )
        if result.returncode == 0:
            tracked = result.stdout.strip().split("\n")
            git_tracked_private = [p for p in tracked if p]
    except Exception:
        pass

    for tracked in git_tracked_private:
        errors.append({
            "skill": tracked,
            "type": "git-tracked",
            "message": f"Private skill is tracked in git: {tracked}",
        })

    # Output
    if args.json:
        print(json.dumps({"errors": errors, "warnings": warnings}, indent=2))
    else:
        print(f"\nVisibility Validation Report")
        print(f"{'='*50}")
        print(f"  Total skills:     {len(all_skills)}")
        print(f"  Private:          {len(private_skills)}")
        print(f"  Deprecated:       {len(deprecated_skills)}")
        print(f"  Public:           {len(all_skills) - len(private_skills) - len(deprecated_skills)}")

        if errors:
            print(f"\n  ERRORS ({len(errors)}):")
            for e in errors:
                print(f"    {e['message']}")
        if warnings:
            print(f"\n  WARNINGS ({len(warnings)}):")
            for w in warnings:
                print(f"    {w['message']}")

        if not errors and not warnings:
            print(f"\n  All cross-references valid.")

        print(f"{'='*50}")

    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
