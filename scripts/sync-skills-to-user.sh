#!/bin/bash
# sync-skills-to-user.sh
# Syncs skills and agents from this repo to one or more AI tool configurations.
# On first run (no .claude-sync.json), interactively asks which tools to sync to.
# Non-interactive environments (CI, git hooks without a TTY) skip silently when
# no config exists.
#
# Usage:
#   ./scripts/sync-skills-to-user.sh              # normal sync
#   ./scripts/sync-skills-to-user.sh --reconfigure  # re-run setup wizard
#   ./scripts/sync-skills-to-user.sh --dry-run      # show what would happen

set -e

# ============================================================
# Configuration
# ============================================================
REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || echo "$(cd "$(dirname "$0")/.." && pwd)")"
CONFIG_FILE="$REPO_ROOT/.claude-sync.json"
REPO_SKILLS_DIR="$REPO_ROOT/.claude/skills"
REPO_AGENTS_DIR="$REPO_ROOT/.claude/agents"
LIB_DIR="$REPO_ROOT/scripts/lib"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================================
# Flags
# ============================================================
RECONFIGURE=false
DRY_RUN=false

for arg in "$@"; do
  case "$arg" in
    --reconfigure) RECONFIGURE=true ;;
    --dry-run)     DRY_RUN=true ;;
  esac
done

# ============================================================
# Helper: translate a SKILL.md to clean markdown
# ============================================================
# Source lib if available; otherwise define an inline fallback
if [ -f "$LIB_DIR/translate-skill.sh" ]; then
  # shellcheck source=scripts/lib/translate-skill.sh
  source "$LIB_DIR/translate-skill.sh"
else
  translate_skill() {
    local skill_md_path="$1"
    awk '
      BEGIN { in_front=0; done=0; count=0 }
      /^---/ && !done {
        count++
        if (count == 1) { in_front=1; next }
        if (count == 2) { in_front=0; done=1; next }
      }
      !in_front && done { print }
    ' "$skill_md_path" | sed '/./,$!d'
  }
fi

# ============================================================
# Helper: write the config file from a targets JSON array string
# ============================================================
write_config() {
  local targets_json="$1"   # e.g. ["claude","cursor"]
  local today
  today=$(date +%Y-%m-%d 2>/dev/null || echo "unknown")
  cat > "$CONFIG_FILE" <<EOF
{
  "targets": $targets_json,
  "created": "$today",
  "note": "Edit this file or run ./scripts/sync-skills-to-user.sh --reconfigure to change targets"
}
EOF
}

# ============================================================
# Helper: read targets array from config (space-separated list)
# ============================================================
read_targets() {
  # Simple parsing — extract the array value without requiring jq
  # Strips brackets/quotes, converts commas to spaces, then trims leading/trailing whitespace
  grep '"targets"' "$CONFIG_FILE" \
    | sed 's/.*"targets"[[:space:]]*:[[:space:]]*//' \
    | tr -d '[]"' \
    | tr ',' ' ' \
    | sed 's/^[[:space:]]*//;s/[[:space:]]*$//'
}

# ============================================================
# Interactive first-run setup
# ============================================================
run_setup() {
  echo -e "${BLUE}🔧 First-time setup: Which AI tools should skills be synced to?${NC}"
  echo -e "   Select all that apply (comma-separated, e.g. 1,3,5):"
  echo ""
  echo -e "   [1] Claude Code       (~/.claude/skills/)"
  echo -e "   [2] Cursor            (.cursor/rules/)"
  echo -e "   [3] Windsurf          (.windsurf/rules/)"
  echo -e "   [4] Codex CLI         (~/.codex/instructions/)"
  echo -e "   [5] Gemini            (.gemini/rules/)"
  echo -e "   [6] All of the above"
  echo -e "   [0] None — skip sync entirely"
  echo ""
  printf "Your choice: "

  local input
  read -r input

  # Parse comma-separated numbers
  local selected_targets=()
  IFS=',' read -ra choices <<< "$input"

  local do_all=false
  local do_none=false
  for choice in "${choices[@]}"; do
    choice="${choice// /}"   # strip spaces
    case "$choice" in
      6) do_all=true ;;
      0) do_none=true ;;
    esac
  done

  if $do_none; then
    selected_targets=()
  elif $do_all; then
    selected_targets=("claude" "cursor" "windsurf" "codex" "gemini")
  else
    for choice in "${choices[@]}"; do
      choice="${choice// /}"
      case "$choice" in
        1) selected_targets+=("claude") ;;
        2) selected_targets+=("cursor") ;;
        3) selected_targets+=("windsurf") ;;
        4) selected_targets+=("codex") ;;
        5) selected_targets+=("gemini") ;;
      esac
    done
  fi

  # Build JSON array
  local json_array="["
  local first=true
  for t in "${selected_targets[@]}"; do
    if $first; then
      json_array+="\"$t\""
      first=false
    else
      json_array+=",\"$t\""
    fi
  done
  json_array+="]"

  write_config "$json_array"

  echo ""
  echo -e "${GREEN}✅ Preferences saved to .claude-sync.json${NC}"
  echo -e "${YELLOW}💡 To change later, run: ./scripts/sync-skills-to-user.sh --reconfigure${NC}"
  echo -e "   Or edit .claude-sync.json directly."
  echo ""
}

# ============================================================
# Decide whether to run setup
# ============================================================
if $RECONFIGURE; then
  run_setup
elif [ ! -f "$CONFIG_FILE" ]; then
  # No config — only prompt if stdin is a real terminal
  if [ -t 0 ]; then
    run_setup
  else
    echo -e "ℹ️  No .claude-sync.json found. Run ./scripts/sync-skills-to-user.sh interactively to configure."
    exit 0
  fi
fi

# If config still doesn't exist (user chose none or something odd), exit cleanly
if [ ! -f "$CONFIG_FILE" ]; then
  exit 0
fi

# ============================================================
# Read persisted targets
# ============================================================
TARGETS=$(read_targets)

if [ -z "$TARGETS" ]; then
  echo -e "${YELLOW}ℹ️  No sync targets configured. Run with --reconfigure to set up.${NC}"
  exit 0
fi

if $DRY_RUN; then
  echo -e "${BLUE}🔍 Dry run — no changes will be made${NC}"
fi

echo -e "${BLUE}🔄 Syncing skills to: ${TARGETS}${NC}"
echo ""

# ============================================================
# Per-target counters (use regular variables for compatibility)
# ============================================================
SYNCED_claude=0; SKIPPED_claude=0
SYNCED_cursor=0; SKIPPED_cursor=0
SYNCED_windsurf=0; SKIPPED_windsurf=0
SYNCED_codex=0; SKIPPED_codex=0
SYNCED_gemini=0; SKIPPED_gemini=0

inc_synced()  { eval "SYNCED_${1}=\$((SYNCED_${1} + 1))"; }
inc_skipped() { eval "SKIPPED_${1}=\$((SKIPPED_${1} + 1))"; }
get_synced()  { eval "echo \$SYNCED_${1}"; }
get_skipped() { eval "echo \$SKIPPED_${1}"; }

# ============================================================
# Helper: write a file or print dry-run message
# ============================================================
ensure_dir() {
  local dir="$1"
  if ! $DRY_RUN; then
    mkdir -p "$dir"
  fi
}

create_symlink() {
  local src="$1"
  local dest="$2"
  if $DRY_RUN; then
    echo -e "  ${YELLOW}[dry-run] would symlink: $dest → $src${NC}"
  else
    ln -s "${src%/}" "$dest"
  fi
}

write_file() {
  local path="$1"
  local content="$2"
  if $DRY_RUN; then
    echo -e "  ${YELLOW}[dry-run] would write: $path${NC}"
  else
    printf '%s\n' "$content" > "$path"
  fi
}

# ============================================================
# TARGET: Claude Code — symlink skill directories
# ============================================================
sync_claude() {
  local user_skills_dir="$HOME/.claude/skills"
  local user_agents_dir="$HOME/.claude/agents"

  ensure_dir "$user_skills_dir"
  ensure_dir "$user_agents_dir"

  echo -e "${YELLOW}📦 [Claude Code] Syncing skills...${NC}"

  if [ -d "$REPO_SKILLS_DIR" ]; then
    for skill_dir in "$REPO_SKILLS_DIR"/*/; do
      [ -d "$skill_dir" ] || continue
      local skill_name
      skill_name=$(basename "$skill_dir")
      [[ "$skill_name" == .* ]] && continue

      local skill_file="$skill_dir/SKILL.md"
      if [ ! -f "$skill_file" ]; then
        echo -e "  ${YELLOW}⚠ Skipping $skill_name (no SKILL.md)${NC}"
        inc_skipped "claude"
        continue
      fi

      local user_skill_dir="$user_skills_dir/$skill_name"

      if [ -L "$user_skill_dir" ]; then
        local current_target
        current_target=$(readlink "$user_skill_dir")
        if [ "$current_target" = "$skill_dir" ] || [ "$current_target" = "${skill_dir%/}" ]; then
          inc_skipped "claude"
          continue
        fi
        $DRY_RUN || rm "$user_skill_dir"
      fi

      if [ -d "$user_skill_dir" ] && [ ! -L "$user_skill_dir" ]; then
        echo -e "  ${YELLOW}⚠ Replacing regular directory with symlink: $skill_name${NC}"
        $DRY_RUN || rm -rf "$user_skill_dir"
      fi

      create_symlink "${skill_dir%/}" "$user_skill_dir"
      echo -e "  ${GREEN}✓ Linked: $skill_name${NC}"
      inc_synced "claude"
    done
  fi

  echo -e "${YELLOW}🤖 [Claude Code] Syncing agents...${NC}"

  if [ -d "$REPO_AGENTS_DIR" ]; then
    for agent_item in "$REPO_AGENTS_DIR"/*; do
      local agent_name
      agent_name=$(basename "$agent_item")
      [[ "$agent_name" == .* ]] && continue
      [[ "$agent_name" == "FOUNDING_COUNCIL.md" ]] && continue

      if [ -d "$agent_item" ]; then
        local agent_file="$agent_item/AGENT.md"
        if [ ! -f "$agent_file" ]; then
          echo -e "  ${YELLOW}⚠ Skipping $agent_name (no AGENT.md)${NC}"
          continue
        fi

        local user_agent_dir="$user_agents_dir/$agent_name"

        if [ -L "$user_agent_dir" ]; then
          local current_target
          current_target=$(readlink "$user_agent_dir")
          if [ "$current_target" = "$agent_item" ] || [ "$current_target" = "${agent_item%/}" ]; then
            continue
          fi
          $DRY_RUN || rm "$user_agent_dir"
        fi

        if [ -d "$user_agent_dir" ] && [ ! -L "$user_agent_dir" ]; then
          echo -e "  ${YELLOW}⚠ Replacing regular directory with symlink: $agent_name${NC}"
          $DRY_RUN || rm -rf "$user_agent_dir"
        fi

        if [ -f "$user_agent_dir" ] && [ ! -L "$user_agent_dir" ]; then
          $DRY_RUN || rm "$user_agent_dir"
        fi

        create_symlink "${agent_item%/}" "$user_agent_dir"
        echo -e "  ${GREEN}✓ Linked: $agent_name/${NC}"

      elif [ -f "$agent_item" ] && [[ "$agent_name" == *.md ]]; then
        local user_agent_file="$user_agents_dir/$agent_name"

        if [ -L "$user_agent_file" ]; then
          local current_target
          current_target=$(readlink "$user_agent_file")
          if [ "$current_target" = "$agent_item" ]; then
            continue
          fi
          $DRY_RUN || rm "$user_agent_file"
        fi

        create_symlink "$agent_item" "$user_agent_file"
        echo -e "  ${GREEN}✓ Linked: $agent_name${NC}"
      fi
    done
  fi
}

# ============================================================
# TARGET: Cursor — generate .md rule files in .cursor/rules/
# ============================================================
sync_cursor() {
  local rules_dir="$REPO_ROOT/.cursor/rules"
  ensure_dir "$rules_dir"

  echo -e "${YELLOW}🖱  [Cursor] Generating rule files in .cursor/rules/...${NC}"

  if [ -d "$REPO_SKILLS_DIR" ]; then
    for skill_dir in "$REPO_SKILLS_DIR"/*/; do
      [ -d "$skill_dir" ] || continue
      local skill_name
      skill_name=$(basename "$skill_dir")
      [[ "$skill_name" == .* ]] && continue

      local skill_file="$skill_dir/SKILL.md"
      if [ ! -f "$skill_file" ]; then
        inc_skipped "cursor"
        continue
      fi

      local dest="$rules_dir/${skill_name}.md"
      local content
      content=$(translate_skill "$skill_file" "$skill_name" "cursor")
      write_file "$dest" "$content"
      echo -e "  ${GREEN}✓ Written: .cursor/rules/${skill_name}.md${NC}"
      inc_synced "cursor"
    done
  fi
}

# ============================================================
# TARGET: Windsurf — generate .md rule files in .windsurf/rules/
# ============================================================
sync_windsurf() {
  local rules_dir="$REPO_ROOT/.windsurf/rules"
  ensure_dir "$rules_dir"

  echo -e "${YELLOW}🌊 [Windsurf] Generating rule files in .windsurf/rules/...${NC}"

  if [ -d "$REPO_SKILLS_DIR" ]; then
    for skill_dir in "$REPO_SKILLS_DIR"/*/; do
      [ -d "$skill_dir" ] || continue
      local skill_name
      skill_name=$(basename "$skill_dir")
      [[ "$skill_name" == .* ]] && continue

      local skill_file="$skill_dir/SKILL.md"
      if [ ! -f "$skill_file" ]; then
        inc_skipped "windsurf"
        continue
      fi

      local dest="$rules_dir/${skill_name}.md"
      local content
      content=$(translate_skill "$skill_file" "$skill_name" "windsurf")
      write_file "$dest" "$content"
      echo -e "  ${GREEN}✓ Written: .windsurf/rules/${skill_name}.md${NC}"
      inc_synced "windsurf"
    done
  fi
}

# ============================================================
# TARGET: Codex CLI — generate instruction files in ~/.codex/instructions/
# ============================================================
sync_codex() {
  local instructions_dir="$HOME/.codex/instructions"
  ensure_dir "$instructions_dir"

  echo -e "${YELLOW}🤖 [Codex CLI] Generating instruction files in ~/.codex/instructions/...${NC}"

  if [ -d "$REPO_SKILLS_DIR" ]; then
    for skill_dir in "$REPO_SKILLS_DIR"/*/; do
      [ -d "$skill_dir" ] || continue
      local skill_name
      skill_name=$(basename "$skill_dir")
      [[ "$skill_name" == .* ]] && continue

      local skill_file="$skill_dir/SKILL.md"
      if [ ! -f "$skill_file" ]; then
        inc_skipped "codex"
        continue
      fi

      local dest="$instructions_dir/${skill_name}.md"
      local content
      content=$(translate_skill "$skill_file" "$skill_name" "codex")
      write_file "$dest" "$content"
      echo -e "  ${GREEN}✓ Written: ~/.codex/instructions/${skill_name}.md${NC}"
      inc_synced "codex"
    done
  fi
}

# ============================================================
# TARGET: Gemini — generate rule files in .gemini/rules/
# ============================================================
sync_gemini() {
  local rules_dir="$REPO_ROOT/.gemini/rules"
  ensure_dir "$rules_dir"

  echo -e "${YELLOW}💎 [Gemini] Generating rule files in .gemini/rules/...${NC}"

  if [ -d "$REPO_SKILLS_DIR" ]; then
    for skill_dir in "$REPO_SKILLS_DIR"/*/; do
      [ -d "$skill_dir" ] || continue
      local skill_name
      skill_name=$(basename "$skill_dir")
      [[ "$skill_name" == .* ]] && continue

      local skill_file="$skill_dir/SKILL.md"
      if [ ! -f "$skill_file" ]; then
        inc_skipped "gemini"
        continue
      fi

      local dest="$rules_dir/${skill_name}.md"
      local content
      content=$(translate_skill "$skill_file" "$skill_name" "gemini")
      write_file "$dest" "$content"
      echo -e "  ${GREEN}✓ Written: .gemini/rules/${skill_name}.md${NC}"
      inc_synced "gemini"
    done
  fi
}

# ============================================================
# Dispatch to each selected target
# ============================================================
for target in $TARGETS; do
  case "$target" in
    claude)   sync_claude ;;
    cursor)   sync_cursor ;;
    windsurf) sync_windsurf ;;
    codex)    sync_codex ;;
    gemini)   sync_gemini ;;
    *)
      echo -e "${YELLOW}⚠ Unknown target in .claude-sync.json: $target (skipping)${NC}"
      ;;
  esac
  echo ""
done

# ============================================================
# Summary
# ============================================================
echo -e "${GREEN}✅ Sync complete!${NC}"
if $DRY_RUN; then
  echo -e "   ${YELLOW}(dry run — no files were changed)${NC}"
fi
echo ""
for target in $TARGETS; do
  synced=$(get_synced "$target")
  skipped=$(get_skipped "$target")
  echo -e "   ${BLUE}${target}${NC}: ${synced} synced, ${skipped} already up-to-date / skipped"
done
echo ""
echo -e "   Config: $CONFIG_FILE"
