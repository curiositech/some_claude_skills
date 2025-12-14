#!/bin/bash
# sync-skills-to-user.sh
# Syncs skills and agents from this repo to user-level Claude Code configuration
# Called by pre-commit hook to keep user config up to date

set -e

# Configuration
REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || echo "$(cd "$(dirname "$0")/.." && pwd)")"
USER_CLAUDE_DIR="$HOME/.claude"
REPO_SKILLS_DIR="$REPO_ROOT/.claude/skills"
REPO_AGENTS_DIR="$REPO_ROOT/.claude/agents"
USER_SKILLS_DIR="$USER_CLAUDE_DIR/skills"
USER_AGENTS_DIR="$USER_CLAUDE_DIR/agents"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔄 Syncing skills and agents to user-level Claude Code config...${NC}"

# Create user directories if they don't exist
mkdir -p "$USER_SKILLS_DIR"
mkdir -p "$USER_AGENTS_DIR"

# Track counts
SKILLS_SYNCED=0
SKILLS_SKIPPED=0
AGENTS_SYNCED=0
AGENTS_SKIPPED=0

# ========================================
# SYNC SKILLS
# ========================================
echo -e "${YELLOW}📦 Syncing skills...${NC}"

if [ -d "$REPO_SKILLS_DIR" ]; then
  for skill_dir in "$REPO_SKILLS_DIR"/*/; do
    # Skip if not a directory
    [ -d "$skill_dir" ] || continue

    # Get skill name from directory
    skill_name=$(basename "$skill_dir")

    # Skip hidden directories and special files
    [[ "$skill_name" == .* ]] && continue

    # Check for SKILL.md
    skill_file="$skill_dir/SKILL.md"
    if [ ! -f "$skill_file" ]; then
      echo -e "  ${YELLOW}⚠ Skipping $skill_name (no SKILL.md)${NC}"
      SKILLS_SKIPPED=$((SKILLS_SKIPPED + 1))
      continue
    fi

    # Target symlink path
    user_skill_dir="$USER_SKILLS_DIR/$skill_name"

    # If symlink already exists and points to the right place, skip
    if [ -L "$user_skill_dir" ]; then
      current_target=$(readlink "$user_skill_dir")
      if [ "$current_target" = "$skill_dir" ] || [ "$current_target" = "${skill_dir%/}" ]; then
        SKILLS_SKIPPED=$((SKILLS_SKIPPED + 1))
        continue
      fi
      # Remove stale symlink
      rm "$user_skill_dir"
    fi

    # Remove if it's a regular directory (shouldn't happen normally)
    if [ -d "$user_skill_dir" ] && [ ! -L "$user_skill_dir" ]; then
      echo -e "  ${YELLOW}⚠ Replacing regular directory with symlink: $skill_name${NC}"
      rm -rf "$user_skill_dir"
    fi

    # Create symlink
    ln -s "${skill_dir%/}" "$user_skill_dir"
    echo -e "  ${GREEN}✓ Linked: $skill_name${NC}"
    SKILLS_SYNCED=$((SKILLS_SYNCED + 1))
  done
fi

# ========================================
# SYNC AGENTS
# ========================================
echo -e "${YELLOW}🤖 Syncing agents...${NC}"

if [ -d "$REPO_AGENTS_DIR" ]; then
  for agent_item in "$REPO_AGENTS_DIR"/*; do
    # Get base name
    agent_name=$(basename "$agent_item")

    # Skip hidden files and special files
    [[ "$agent_name" == .* ]] && continue
    [[ "$agent_name" == "FOUNDING_COUNCIL.md" ]] && continue

    # Handle directory-based agents (with AGENT.md)
    if [ -d "$agent_item" ]; then
      agent_file="$agent_item/AGENT.md"
      if [ ! -f "$agent_file" ]; then
        echo -e "  ${YELLOW}⚠ Skipping $agent_name (no AGENT.md)${NC}"
        AGENTS_SKIPPED=$((AGENTS_SKIPPED + 1))
        continue
      fi

      # Target: symlink the entire directory
      user_agent_dir="$USER_AGENTS_DIR/$agent_name"

      # If symlink already exists and points to the right place, skip
      if [ -L "$user_agent_dir" ]; then
        current_target=$(readlink "$user_agent_dir")
        if [ "$current_target" = "$agent_item" ] || [ "$current_target" = "${agent_item%/}" ]; then
          AGENTS_SKIPPED=$((AGENTS_SKIPPED + 1))
          continue
        fi
        # Remove stale symlink
        rm "$user_agent_dir"
      fi

      # Remove if it's a regular directory
      if [ -d "$user_agent_dir" ] && [ ! -L "$user_agent_dir" ]; then
        echo -e "  ${YELLOW}⚠ Replacing regular directory with symlink: $agent_name${NC}"
        rm -rf "$user_agent_dir"
      fi

      # Remove if it's a regular file (flat agent from old format)
      if [ -f "$user_agent_dir" ] && [ ! -L "$user_agent_dir" ]; then
        echo -e "  ${YELLOW}⚠ Replacing flat file with directory symlink: $agent_name${NC}"
        rm "$user_agent_dir"
      fi

      # Create symlink to directory
      ln -s "${agent_item%/}" "$user_agent_dir"
      echo -e "  ${GREEN}✓ Linked: $agent_name/${NC}"
      AGENTS_SYNCED=$((AGENTS_SYNCED + 1))

    # Handle flat .md agents (already in flat format)
    elif [ -f "$agent_item" ] && [[ "$agent_name" == *.md ]]; then
      # Skip non-agent md files
      user_agent_file="$USER_AGENTS_DIR/$agent_name"

      # If symlink already exists and points to the right place, skip
      if [ -L "$user_agent_file" ]; then
        current_target=$(readlink "$user_agent_file")
        if [ "$current_target" = "$agent_item" ]; then
          AGENTS_SKIPPED=$((AGENTS_SKIPPED + 1))
          continue
        fi
        # Remove stale symlink
        rm "$user_agent_file"
      fi

      # Create symlink
      ln -s "$agent_item" "$user_agent_file"
      echo -e "  ${GREEN}✓ Linked: $agent_name${NC}"
      AGENTS_SYNCED=$((AGENTS_SYNCED + 1))
    fi
  done
fi

# ========================================
# SUMMARY
# ========================================
echo ""
echo -e "${GREEN}✅ Sync complete!${NC}"
echo -e "   Skills: ${SKILLS_SYNCED} synced, ${SKILLS_SKIPPED} already up-to-date"
echo -e "   Agents: ${AGENTS_SYNCED} synced, ${AGENTS_SKIPPED} already up-to-date"
echo -e "   User config: $USER_CLAUDE_DIR"
