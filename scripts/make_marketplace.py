#!/usr/bin/env python3
"""Generate .claude-plugin/marketplace.json and per-skill plugin.json files."""

import json
import os
import re

SKILLS_DIR = ".claude/skills"
MARKETPLACE_NAME = "some-claude-skills"
OWNER = {"name": "Erich Owens", "url": "https://www.erichowens.com"}
def extract_frontmatter(text):
    """Extract YAML frontmatter between --- delimiters without PyYAML."""
    match = re.match(r"^---\n(.*?)\n---", text, re.DOTALL)
    if not match:
        return {}
    raw = match.group(1)
    result = {}
    lines = raw.split("\n")
    current_key = None
    current_val_lines = []

    def flush():
        if current_key:
            val = " ".join(current_val_lines).strip()
            result[current_key] = val

    for line in lines:
        kv = re.match(r"^(\w[\w-]*):\s*(.*)", line)
        if kv:
            flush()
            current_key = kv.group(1)
            current_val_lines = [kv.group(2)]
        elif current_key and line.startswith(" "):
            current_val_lines.append(line.strip())

    flush()
    return result


plugins = []
skipped = []

skill_names = sorted(os.listdir(SKILLS_DIR))
for skill_name in skill_names:
    skill_path = os.path.join(SKILLS_DIR, skill_name)
    if not os.path.isdir(skill_path):
        continue

    skill_md = os.path.join(skill_path, "SKILL.md")
    if not os.path.exists(skill_md):
        if os.path.exists(os.path.join(skill_path, "DEPRECATED.md")):
            skipped.append((skill_name, "deprecated"))
        else:
            skipped.append((skill_name, "no SKILL.md"))
        continue

    with open(skill_md) as f:
        content = f.read()

    fm = extract_frontmatter(content)
    name = fm.get("name", skill_name)
    description = fm.get("description", "")

    plugin_name = re.sub(r"[^a-z0-9-]", "-", name.lower()).strip("-")

    plugin_dir = os.path.join(skill_path, ".claude-plugin")
    os.makedirs(plugin_dir, exist_ok=True)
    plugin_json = {"name": plugin_name, "description": description}
    with open(os.path.join(plugin_dir, "plugin.json"), "w") as f:
        json.dump(plugin_json, f, indent=2)
        f.write("\n")

    plugins.append({
        "name": plugin_name,
        "source": f"./{SKILLS_DIR}/{skill_name}",
        "description": description,
    })

os.makedirs(".claude-plugin", exist_ok=True)

marketplace = {
    "name": MARKETPLACE_NAME,
    "description": "A curated collection of 190+ Claude Code skills covering AI engineering, design, frontend, backend, DevOps, product, and creative domains.",
    "owner": OWNER,
    "plugins": plugins,
}

with open(".claude-plugin/marketplace.json", "w") as f:
    json.dump(marketplace, f, indent=2)
    f.write("\n")

print(f"Done: {len(plugins)} plugins added to marketplace.json")
if skipped:
    print(f"Skipped {len(skipped)}: {skipped[:5]}{'...' if len(skipped) > 5 else ''}")
