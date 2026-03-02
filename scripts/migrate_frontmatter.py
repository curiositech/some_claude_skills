#!/usr/bin/env python3
"""
Frontmatter Migration Script — Move custom keys under metadata:

Migrates category, tags, pairs-with, badge from top-level YAML frontmatter
into the metadata: block, which is the official catch-all for custom data
recognized by skills-cli validate.

Also:
- Auto-assigns category for skills missing it (keyword matching)
- Injects pairs-with from generate_pairs.json (if present)
- Marks dag-* skills as metadata.deprecated: true
- Marks windags-* skills as metadata.private: true

Usage:
    python scripts/migrate_frontmatter.py                    # Migrate all skills
    python scripts/migrate_frontmatter.py --dry-run          # Preview changes
    python scripts/migrate_frontmatter.py --verbose          # Show details
    python scripts/migrate_frontmatter.py --skills-dir PATH  # Custom skills dir
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


# ──────────────────────────────────────────────────────────────────────
# Constants
# ──────────────────────────────────────────────────────────────────────

# Keys to move from top-level into metadata:
KEYS_TO_NEST = {"category", "tags", "pairs-with", "badge"}

# Category keyword matching (same logic as generate-skills.ts assignCategories)
CATEGORY_KEYWORDS: dict[str, list[str]] = {
    # Order matters: more specific categories first to avoid false matches
    "DAG Framework": ["dag-", "template-dag"],
    "Lifestyle & Personal": ["lifestyle", "personal", "wellness", "relationship", "health", "adhd", "grief", "jungian", "sobriety", "sober", "rehab", "recovery-", "pet-memorial", "panic-room", "partner-text", "fancy-yard", "digital-estate", "wisdom-accountability", "hrv-", "crisis-"],
    "AI & Machine Learning": ["machine-learning", "llm", "prompt-engineer", "neural", "embedding", "rag", "computer-vision", "drone-cv", "drone-inspection", "vr-avatar", "speech-pathology", "clip-aware", "wedding-immortalist", "photo-content", "event-detection", "physics-rendering", "metal-shader", "bot-developer"],
    "Design & Creative": ["design", "ui-", "ux-", "creative", "visual", "color-theory", "typography", "collage", "vaporwave", "pixel-art", "interior-design", "maximalist", "vibe-matcher", "sound-engineer", "voice-audio", "web-design", "windows-3", "windows-95", "neobrutalist", "web-weather", "web-wave", "web-cloud", "dark-mode", "2000s-visual"],
    "DevOps & Site Reliability": ["devops", "deploy", "infrastructure", "kubernetes", "docker", "terraform", "cloudflare", "vercel", "github-actions", "site-reliability", "playwright-e2e", "playwright-screenshot", "pwa-expert", "caching-strateg", "api-architect", "rest-api", "openapi", "oauth", "modern-auth", "microservice", "monorepo", "logging-observ", "error-handling", "performance-profil", "background-job", "websocket", "llm-stream", "llm-router", "real-time-collab", "reactive-dashboard"],
    "Code Quality & Testing": ["test-automation", "vitest", "code-review", "refactor", "fullstack-debug", "code-necromancer", "security-auditor", "webapp-testing", "form-validation", "code-architecture", "dependency-manage", "typescript-advanced", "database-design"],
    "Content & Writing": ["technical-writer", "knot-theory", "diagramming", "summariz", "mermaid-graph", "document-generation", "skill-documentarian", "email-composer"],
    "Data & Analytics": ["data-pipeline", "data-viz", "analytics", "etl", "geospatial", "chatbot-analytics"],
    "Business & Monetization": ["marketing", "monetiz", "career-biographer", "cv-creator", "job-application", "personal-finance", "entrepreneur", "seo-visibility", "claude-ecosystem-promoter", "indie-monetization", "product-appeal"],
    "Research & Analysis": ["research", "competitive-cartograph", "design-archivist", "hr-network"],
    "Productivity & Meta": ["skill-", "orchestrat", "team-build", "liaison", "swift-executor", "project-management", "mcp-creator", "agent-creator", "admin-dashboard", "feature-manifest"],
}

# Skills to mark as deprecated
DEPRECATED_SKILLS = {
    "dag-mutation-strategist",
    "dag-ops",
    "dag-planner",
    "dag-quality",
    "dag-replay-debugger",
    "dag-runtime",
    "dag-skills-matcher",
    "template-dag-library",
}

# Skills to mark as private
PRIVATE_SKILLS_PREFIX = "windags-"


# ──────────────────────────────────────────────────────────────────────
# YAML helpers
# ──────────────────────────────────────────────────────────────────────

def parse_skill_file(path: Path) -> tuple[dict[str, Any] | None, str, str | None]:
    """Parse SKILL.md, return (frontmatter_dict, body, error)."""
    content = path.read_text(encoding="utf-8")

    match = re.match(r"^---\n(.*?)\n---\n?(.*)", content, re.DOTALL)
    if not match:
        return None, content, "No YAML frontmatter found"

    try:
        fm = yaml.safe_load(match.group(1))
        if not isinstance(fm, dict):
            return None, content, "Frontmatter is not a dict"
        return fm, match.group(2), None
    except yaml.YAMLError as e:
        return None, content, f"YAML parse error: {e}"


def write_skill_file(path: Path, fm: dict[str, Any], body: str) -> None:
    """Write SKILL.md with updated frontmatter."""
    # Use a custom representer to get clean YAML output
    yaml_str = yaml.dump(
        fm,
        default_flow_style=False,
        allow_unicode=True,
        sort_keys=False,
        width=200,
    )
    path.write_text(f"---\n{yaml_str}---\n{body}", encoding="utf-8")


# ──────────────────────────────────────────────────────────────────────
# Category auto-assignment
# ──────────────────────────────────────────────────────────────────────

def guess_category(skill_id: str, description: str) -> str:
    """Guess category from skill ID using keyword matching.

    Only matches against the skill ID (folder name). Description matching
    is too unreliable — words like 'design', 'test', 'write' appear
    across many domains with different meanings.
    """
    lower_id = skill_id.lower()

    for category, keywords in CATEGORY_KEYWORDS.items():
        for kw in keywords:
            if kw in lower_id:
                return category

    return "Uncategorized"


# ──────────────────────────────────────────────────────────────────────
# Tag auto-generation
# ──────────────────────────────────────────────────────────────────────

def guess_tags(skill_id: str, description: str) -> list[str]:
    """Generate 3-5 tags from skill ID and description."""
    # Start with ID parts
    parts = skill_id.split("-")

    # Common stop words to skip
    stop_words = {"the", "a", "an", "and", "or", "for", "in", "on", "at", "to", "of",
                  "is", "it", "by", "as", "with", "from", "not", "use", "when", "this",
                  "that", "are", "be", "was", "were", "been", "has", "have", "had",
                  "do", "does", "did", "will", "would", "could", "should", "may",
                  "might", "can", "shall", "must", "need", "expert", "skill"}

    # Extract meaningful words from ID
    tags = [p for p in parts if len(p) > 2 and p not in stop_words][:3]

    # Extract quoted terms from description as additional tags
    quoted = re.findall(r'"([^"]+)"', description)
    for term in quoted[:3]:
        tag = term.lower().replace(" ", "-")
        if tag not in tags and len(tag) < 30:
            tags.append(tag)

    # Cap at 5 tags
    return tags[:5]


# ──────────────────────────────────────────────────────────────────────
# Migration logic
# ──────────────────────────────────────────────────────────────────────

def migrate_skill(
    skill_dir: Path,
    pairs_data: dict[str, list[dict]],
    dry_run: bool,
    verbose: bool,
) -> tuple[bool, list[str]]:
    """
    Migrate a single skill's frontmatter.
    Returns (was_modified, list_of_changes).
    """
    skill_id = skill_dir.name
    skill_md = skill_dir / "SKILL.md"

    if not skill_md.exists():
        return False, [f"SKILL.md not found in {skill_dir}"]

    fm, body, error = parse_skill_file(skill_md)
    if error:
        return False, [f"Parse error: {error}"]

    changes: list[str] = []
    modified = False

    # Ensure metadata dict exists
    if "metadata" not in fm or not isinstance(fm.get("metadata"), dict):
        fm["metadata"] = {}

    metadata = fm["metadata"]

    # 1. Move top-level keys into metadata
    for key in KEYS_TO_NEST:
        if key in fm and key != "metadata":
            val = fm.pop(key)
            # Only set if metadata doesn't already have it
            if key not in metadata:
                metadata[key] = val
                changes.append(f"Moved {key} under metadata")
            else:
                changes.append(f"Dropped duplicate top-level {key} (metadata already has it)")
            modified = True

    # 2. Auto-assign category if missing
    if not metadata.get("category") or metadata["category"] == "Uncategorized":
        desc = fm.get("description", "")
        category = guess_category(skill_id, desc)
        if category != "Uncategorized":
            metadata["category"] = category
            changes.append(f"Auto-assigned category: {category}")
            modified = True

    # 3. Auto-generate tags if missing
    if not metadata.get("tags"):
        desc = fm.get("description", "")
        tags = guess_tags(skill_id, desc)
        if tags:
            metadata["tags"] = tags
            changes.append(f"Auto-generated tags: {tags}")
            modified = True

    # 4. Inject pairs-with from JSON if missing
    if not metadata.get("pairs-with") and skill_id in pairs_data:
        metadata["pairs-with"] = pairs_data[skill_id]
        changes.append(f"Injected {len(pairs_data[skill_id])} pairs-with from JSON")
        modified = True

    # 5. Mark deprecated skills
    if skill_id in DEPRECATED_SKILLS and not metadata.get("deprecated"):
        metadata["deprecated"] = True
        changes.append("Marked as deprecated")
        modified = True

    # 6. Mark private skills
    if skill_id.startswith(PRIVATE_SKILLS_PREFIX) and not metadata.get("private"):
        metadata["private"] = True
        changes.append("Marked as private")
        modified = True

    # Write if modified
    if modified and not dry_run:
        # Reorder frontmatter: name, description, allowed-tools first, metadata last
        ordered_fm: dict[str, Any] = {}
        priority_keys = ["name", "description", "allowed-tools"]
        for k in priority_keys:
            if k in fm:
                ordered_fm[k] = fm[k]
        for k in fm:
            if k not in priority_keys and k != "metadata":
                ordered_fm[k] = fm[k]
        ordered_fm["metadata"] = metadata
        write_skill_file(skill_md, ordered_fm, body)

    return modified, changes


# ──────────────────────────────────────────────────────────────────────
# CLI
# ──────────────────────────────────────────────────────────────────────

def main() -> int:
    parser = argparse.ArgumentParser(
        description="Migrate skill frontmatter: nest custom keys under metadata:",
    )
    parser.add_argument(
        "--skills-dir",
        default=".claude/skills",
        help="Path to skills directory (default: .claude/skills)",
    )
    parser.add_argument(
        "--pairs-json",
        default="scripts/generate_pairs.json",
        help="Path to pairs-with JSON (default: scripts/generate_pairs.json)",
    )
    parser.add_argument("--dry-run", action="store_true", help="Preview changes without writing")
    parser.add_argument("--verbose", action="store_true", help="Show per-skill details")
    parser.add_argument("--skill", help="Migrate a single skill by name")

    args = parser.parse_args()

    skills_dir = Path(args.skills_dir).resolve()
    if not skills_dir.exists():
        print(f"Skills directory not found: {skills_dir}")
        return 1

    # Load pairs-with data
    pairs_data: dict[str, list[dict]] = {}
    pairs_path = Path(args.pairs_json)
    if pairs_path.exists():
        pairs_data = json.loads(pairs_path.read_text())
        print(f"Loaded pairs-with data for {len(pairs_data)} skills from {pairs_path}")
    else:
        print(f"No pairs JSON at {pairs_path} — skipping pairs-with injection")

    # Collect skills to process
    if args.skill:
        skill_dirs = [skills_dir / args.skill]
        if not skill_dirs[0].exists():
            print(f"Skill not found: {skill_dirs[0]}")
            return 1
    else:
        skill_dirs = sorted(
            [d for d in skills_dir.iterdir() if d.is_dir() and (d / "SKILL.md").exists()]
        )

    if not skill_dirs:
        print("No skills found")
        return 1

    print(f"\n{'DRY RUN — ' if args.dry_run else ''}Migrating {len(skill_dirs)} skills...\n")

    modified_count = 0
    error_count = 0
    deprecated_count = 0
    private_count = 0
    category_filled = 0
    tags_filled = 0
    pairs_filled = 0

    for skill_dir in skill_dirs:
        was_modified, changes = migrate_skill(skill_dir, pairs_data, args.dry_run, args.verbose)

        if was_modified:
            modified_count += 1

        # Track stats
        for change in changes:
            if "deprecated" in change:
                deprecated_count += 1
            if "private" in change:
                private_count += 1
            if "Auto-assigned category" in change:
                category_filled += 1
            if "Auto-generated tags" in change:
                tags_filled += 1
            if "pairs-with from JSON" in change:
                pairs_filled += 1
            if "Parse error" in change:
                error_count += 1

        if args.verbose or (changes and "Parse error" in str(changes)):
            icon = "E" if "Parse error" in str(changes) else ("M" if was_modified else ".")
            print(f"  [{icon}] {skill_dir.name}")
            if args.verbose and changes:
                for c in changes:
                    print(f"      {c}")

    # Summary
    print(f"\n{'='*60}")
    print(f"MIGRATION SUMMARY {'(DRY RUN)' if args.dry_run else ''}")
    print(f"{'='*60}")
    print(f"  Total skills:      {len(skill_dirs)}")
    print(f"  Modified:          {modified_count}")
    print(f"  Errors:            {error_count}")
    print(f"  Categories filled: {category_filled}")
    print(f"  Tags filled:       {tags_filled}")
    print(f"  Pairs injected:    {pairs_filled}")
    print(f"  Marked deprecated: {deprecated_count}")
    print(f"  Marked private:    {private_count}")
    print(f"{'='*60}")

    return 1 if error_count > 0 else 0


if __name__ == "__main__":
    sys.exit(main())
