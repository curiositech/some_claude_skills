#!/bin/bash
# translate-skill.sh
# Reads a SKILL.md file, strips YAML frontmatter, and outputs clean markdown.
#
# Usage:
#   source scripts/lib/translate-skill.sh
#   translate_skill <skill_md_path> [skill_name] [target_tool]
#
# Arguments:
#   skill_md_path  - Path to the SKILL.md file
#   skill_name     - (optional) Human-readable skill name for header comment
#   target_tool    - (optional) Tool name: cursor, windsurf, codex, gemini
#                    When set to cursor or windsurf, prepends a comment header.
#
# Output: clean markdown body printed to stdout

translate_skill() {
  local skill_md_path="$1"
  local skill_name="${2:-}"
  local target_tool="${3:-}"

  if [ ! -f "$skill_md_path" ]; then
    echo "translate-skill: file not found: $skill_md_path" >&2
    return 1
  fi

  # Strip YAML frontmatter (everything between the first pair of --- markers)
  local body
  body=$(awk '
    BEGIN { in_front=0; done=0; count=0 }
    /^---/ && !done {
      count++
      if (count == 1) { in_front=1; next }
      if (count == 2) { in_front=0; done=1; next }
    }
    !in_front && done { print }
  ' "$skill_md_path")

  # Trim leading blank lines from body
  body=$(echo "$body" | sed '/./,$!d')

  # For Cursor and Windsurf, prepend a comment header
  if [[ "$target_tool" == "cursor" || "$target_tool" == "windsurf" ]]; then
    if [ -n "$skill_name" ]; then
      printf "<!-- Skill: %s -->\n<!-- Source: some_claude_skills (https://github.com/curiositech/some_claude_skills) -->\n\n" "$skill_name"
    fi
  fi

  printf '%s\n' "$body"
}
