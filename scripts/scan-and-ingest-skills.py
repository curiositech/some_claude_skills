#!/usr/bin/env python3
"""
Skill Scanner and Ingester
Scans ~/coding/ recursively for Claude skills and ingests them into the website.

Run manually: python3 scripts/scan-and-ingest-skills.py
Run with --dry-run to see what would be ingested without making changes.
"""

import os
import re
import sys
import json
import shutil
import subprocess
import argparse
from pathlib import Path
from datetime import datetime

# Configuration
SCAN_ROOT = Path.home() / "coding"
REPO_ROOT = Path(__file__).parent.parent
SKILLS_DIR = REPO_ROOT / ".claude" / "skills"
HERO_IMAGES_DIR = REPO_ROOT / "website" / "static" / "img" / "skills"
LOG_FILE = REPO_ROOT / "logs" / "skill-scan.log"

# Directories to skip
SKIP_DIRS = {
    "node_modules", ".git", "dist", "build", "__pycache__",
    ".venv", "venv", ".next", ".nuxt", "out", "coverage",
    "some_claude_skills"  # Skip our own repo
}

# Skill file patterns
SKILL_PATTERNS = ["SKILL.md", "skill.md"]


def log(message: str, level: str = "INFO"):
    """Log message to console and file."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    formatted = f"[{timestamp}] [{level}] {message}"
    print(formatted)

    LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(LOG_FILE, "a") as f:
        f.write(formatted + "\n")


def find_skill_files() -> list[Path]:
    """Recursively find all skill files in ~/coding/."""
    skill_files = []

    for root, dirs, files in os.walk(SCAN_ROOT):
        # Skip excluded directories
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]

        for pattern in SKILL_PATTERNS:
            if pattern in files:
                skill_path = Path(root) / pattern
                skill_files.append(skill_path)

    return skill_files


def parse_frontmatter(content: str) -> dict | None:
    """Extract YAML frontmatter from skill file."""
    if not content.startswith("---"):
        return None

    try:
        end = content.index("---", 3)
        frontmatter = content[3:end].strip()

        result = {}
        for line in frontmatter.split("\n"):
            if ":" in line and not line.startswith(" ") and not line.startswith("-"):
                key, value = line.split(":", 1)
                result[key.strip()] = value.strip()

        return result
    except (ValueError, IndexError):
        return None


def sanitize_skill_name(name: str) -> str:
    """Sanitize skill name to be filesystem and URL safe."""
    # Convert to lowercase
    name = name.lower()
    # Replace spaces and underscores with hyphens
    name = re.sub(r'[\s_]+', '-', name)
    # Remove any non-alphanumeric characters except hyphens
    name = re.sub(r'[^a-z0-9-]', '', name)
    # Remove consecutive hyphens
    name = re.sub(r'-+', '-', name)
    # Remove leading/trailing hyphens
    name = name.strip('-')
    return name


def get_skill_name(skill_path: Path, content: str) -> str | None:
    """Extract skill name from frontmatter or directory name."""
    frontmatter = parse_frontmatter(content)

    if frontmatter and "name" in frontmatter:
        return sanitize_skill_name(frontmatter["name"])

    # Use parent directory name as fallback
    return sanitize_skill_name(skill_path.parent.name)


def skill_exists(skill_name: str) -> bool:
    """Check if skill already exists in our repo."""
    return (SKILLS_DIR / skill_name).exists()


def needs_frontmatter(content: str) -> bool:
    """Check if skill file needs frontmatter added."""
    return not content.startswith("---")


def generate_frontmatter(skill_name: str, content: str) -> str:
    """Generate basic frontmatter for a skill file."""
    # Extract first paragraph as description
    lines = content.split("\n")
    description = ""
    in_content = False

    for line in lines:
        if line.startswith("#"):
            in_content = True
            continue
        if in_content and line.strip():
            description = line.strip()
            break

    # Truncate description if too long
    if len(description) > 200:
        description = description[:197] + "..."

    frontmatter = f"""---
name: {skill_name}
description: {description}
allowed-tools: Read,Write,Edit,Bash(python:*,npm:*),WebFetch
category: Uncategorized
tags:
  - imported
  - needs-review
---

"""
    return frontmatter


def copy_skill(skill_path: Path, skill_name: str, dry_run: bool = False) -> bool:
    """Copy skill directory to our repo."""
    source_dir = skill_path.parent
    dest_dir = SKILLS_DIR / skill_name

    if dry_run:
        log(f"[DRY RUN] Would copy {source_dir} -> {dest_dir}")
        return True

    try:
        # Copy entire skill directory
        shutil.copytree(source_dir, dest_dir, dirs_exist_ok=True)

        # Rename skill.md to SKILL.md if needed
        skill_md = dest_dir / "skill.md"
        if skill_md.exists():
            skill_md.rename(dest_dir / "SKILL.md")

        log(f"Copied skill: {skill_name}")
        return True
    except Exception as e:
        log(f"Failed to copy {skill_name}: {e}", "ERROR")
        return False


def add_frontmatter_if_needed(skill_name: str, dry_run: bool = False) -> bool:
    """Add frontmatter to skill file if missing."""
    skill_file = SKILLS_DIR / skill_name / "SKILL.md"

    if not skill_file.exists():
        return False

    content = skill_file.read_text()

    if not needs_frontmatter(content):
        return True

    if dry_run:
        log(f"[DRY RUN] Would add frontmatter to {skill_name}")
        return True

    new_content = generate_frontmatter(skill_name, content) + content
    skill_file.write_text(new_content)
    log(f"Added frontmatter to {skill_name}")
    return True


def generate_hero_image(skill_name: str, dry_run: bool = False) -> bool:
    """Generate hero image using Ideogram API via Claude."""
    hero_path = HERO_IMAGES_DIR / f"{skill_name}-hero.png"

    if hero_path.exists():
        log(f"Hero image already exists for {skill_name}")
        return True

    if dry_run:
        log(f"[DRY RUN] Would generate hero image for {skill_name}")
        return True

    # For now, copy a placeholder or skip
    # In practice, this would call Claude to generate via Ideogram
    log(f"Hero image needed for {skill_name} - manual generation required", "WARN")
    return False


def run_skill_generation(dry_run: bool = False) -> bool:
    """Run the skill generation script."""
    if dry_run:
        log("[DRY RUN] Would run npm run skills:generate")
        return True

    try:
        result = subprocess.run(
            ["npm", "run", "skills:generate"],
            cwd=REPO_ROOT / "website",
            capture_output=True,
            text=True,
            timeout=300
        )

        if result.returncode == 0:
            log("Skill generation completed successfully")
            return True
        else:
            log(f"Skill generation failed: {result.stderr}", "ERROR")
            return False
    except Exception as e:
        log(f"Failed to run skill generation: {e}", "ERROR")
        return False


def git_commit_and_push(skills_added: list[str], dry_run: bool = False) -> bool:
    """Commit and push changes."""
    if not skills_added:
        log("No new skills to commit")
        return True

    if dry_run:
        log(f"[DRY RUN] Would commit and push {len(skills_added)} skills")
        return True

    try:
        # Stage all changes
        subprocess.run(["git", "add", "-A"], cwd=REPO_ROOT, check=True)

        # Commit
        skill_list = ", ".join(skills_added[:5])
        if len(skills_added) > 5:
            skill_list += f", and {len(skills_added) - 5} more"

        commit_msg = f"feat(skills): Auto-ingest {len(skills_added)} skills from ~/coding/\n\nSkills added: {skill_list}"
        subprocess.run(
            ["git", "commit", "-m", commit_msg],
            cwd=REPO_ROOT,
            check=True
        )

        # Push
        subprocess.run(["git", "push"], cwd=REPO_ROOT, check=True)

        log(f"Committed and pushed {len(skills_added)} skills")
        return True
    except subprocess.CalledProcessError as e:
        log(f"Git operation failed: {e}", "ERROR")
        return False


def main():
    parser = argparse.ArgumentParser(description="Scan and ingest Claude skills")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be done without making changes")
    parser.add_argument("--no-push", action="store_true", help="Don't push changes to remote")
    args = parser.parse_args()

    log("=" * 60)
    log("Starting skill scan" + (" (DRY RUN)" if args.dry_run else ""))
    log(f"Scanning: {SCAN_ROOT}")
    log("=" * 60)

    # Find all skill files
    skill_files = find_skill_files()
    log(f"Found {len(skill_files)} skill files")

    # Process each skill
    skills_added = []
    skills_skipped = []
    skills_failed = []

    for skill_path in skill_files:
        content = skill_path.read_text()
        skill_name = get_skill_name(skill_path, content)

        if not skill_name:
            log(f"Could not determine name for {skill_path}", "WARN")
            skills_failed.append(str(skill_path))
            continue

        if skill_exists(skill_name):
            log(f"Skipping existing skill: {skill_name}")
            skills_skipped.append(skill_name)
            continue

        log(f"Processing new skill: {skill_name}")

        # Copy skill directory
        if not copy_skill(skill_path, skill_name, args.dry_run):
            skills_failed.append(skill_name)
            continue

        # Add frontmatter if needed
        add_frontmatter_if_needed(skill_name, args.dry_run)

        # Note: Hero image generation needs manual intervention or Claude API
        generate_hero_image(skill_name, args.dry_run)

        skills_added.append(skill_name)

    # Run skill generation
    if skills_added and not args.dry_run:
        run_skill_generation(args.dry_run)

    # Commit and push
    if not args.no_push:
        git_commit_and_push(skills_added, args.dry_run)

    # Summary
    log("=" * 60)
    log("SCAN COMPLETE")
    log(f"  Added: {len(skills_added)}")
    log(f"  Skipped (existing): {len(skills_skipped)}")
    log(f"  Failed: {len(skills_failed)}")

    if skills_added:
        log("New skills:")
        for skill in skills_added:
            log(f"  - {skill}")

    if skills_failed:
        log("Failed skills:", "WARN")
        for skill in skills_failed:
            log(f"  - {skill}", "WARN")

    log("=" * 60)

    return 0 if not skills_failed else 1


if __name__ == "__main__":
    sys.exit(main())
