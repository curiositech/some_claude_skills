# Skill Syncing System

## Overview

This project maintains the **canonical source** for 500+ AI skills. They can be synced to one or more AI tools on your machine. Sync targets are **opt-in** — you choose which tools you want on first run and your preferences are saved locally.

### Supported targets

| # | Tool | Output location | Format |
|---|------|-----------------|--------|
| 1 | **Claude Code** | `~/.claude/skills/` | Symlinks (existing behaviour) |
| 2 | **Cursor** | `.cursor/rules/` | Generated `.md` rule files |
| 3 | **Windsurf** | `.windsurf/rules/` | Generated `.md` rule files |
| 4 | **Codex CLI** | `~/.codex/instructions/` | Generated `.md` instruction files |
| 5 | **Gemini** | `.gemini/rules/` | Generated `.md` rule files |

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Project: some_claude_skills                                │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  .claude/skills/  (Source of Truth)                 │    │
│  │  ├── computer-vision-pipeline/                      │    │
│  │  ├── document-generation-pdf/                       │    │
│  │  ├── crisis-detection-intervention-ai/              │    │
│  │  └── ... (500+ skills)                              │    │
│  └─────────────────────────────────────────────────────┘    │
│                           │                                  │
│                           │ Git commits                      │
│                           ▼                                  │
│                   GitHub Repository                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ sync-skills-to-user.sh
                            │ (manual or via git hooks)
                            ▼
        ┌───────────────────┴───────────────────┐
        │                                       │
        ▼                                       ▼
~/.claude/skills/ (symlinks)       .cursor/rules/*.md
~/.codex/instructions/*.md         .windsurf/rules/*.md
                                   .gemini/rules/*.md
```

## How It Works

### 1. Source of Truth

All skills live in `.claude/skills/` in the project root:
- **Version controlled** in git
- **Tracked changes** via commits
- **Collaborative editing** via pull requests
- **Documentation** alongside skill code

### 2. First-run opt-in

The first time you run `./scripts/sync-skills-to-user.sh` interactively, it asks which AI tools you want to sync to:

```
🔧 First-time setup: Which AI tools should skills be synced to?
   Select all that apply (comma-separated, e.g. 1,3,5):

   [1] Claude Code       (~/.claude/skills/)
   [2] Cursor            (.cursor/rules/)
   [3] Windsurf          (.windsurf/rules/)
   [4] Codex CLI         (~/.codex/instructions/)
   [5] Gemini            (.gemini/rules/)
   [6] All of the above
   [0] None — skip sync entirely

Your choice:
```

No tool is pre-selected. Choices are saved to `.claude-sync.json` (gitignored).

### 3. Changing your preferences

```bash
# Re-run the setup wizard
./scripts/sync-skills-to-user.sh --reconfigure

# Or edit the file directly
$EDITOR .claude-sync.json
```

### 4. Non-interactive environments

When the script runs without a TTY (e.g., in a git hook on a fresh clone) and no
`.claude-sync.json` exists, it prints a single info line and exits cleanly:

```
ℹ️  No .claude-sync.json found. Run ./scripts/sync-skills-to-user.sh interactively to configure.
```

### 5. Format translation

For every target other than Claude Code, the script reads each `SKILL.md`, strips
the YAML frontmatter (everything between `---` markers), and writes the clean
markdown body to the target directory.  The helper library lives at
`scripts/lib/translate-skill.sh`.

### 6. Automatic Syncing

The `sync-skills-to-user.sh` script runs automatically via git hooks:

| Git Operation | When | Hook |
|---------------|------|------|
| `git checkout` | Switching branches | `post-checkout` |
| `git pull` | Pulling remote changes | `post-merge` |
| `git merge` | Merging branches | `post-merge` |

Because the hooks run non-interactively, they will silently do nothing until you
have configured `.claude-sync.json` at least once interactively.

## Usage

### First-time setup

```bash
./scripts/sync-skills-to-user.sh
# → interactive prompt; answer once, preferences saved
```

### Manual Sync

```bash
# From project root
./scripts/sync-skills-to-user.sh

# From website/ directory
npm run sync:user-skills
```

### Dry run (see what would change without touching anything)

```bash
./scripts/sync-skills-to-user.sh --dry-run
```

### Reconfigure targets

```bash
./scripts/sync-skills-to-user.sh --reconfigure
```

### After Creating New Skill

```bash
# 1. Create skill in project
mkdir -p .claude/skills/my-new-skill
echo "---\nname: my-new-skill\n..." > .claude/skills/my-new-skill/SKILL.md

# 2. Sync to user level
npm run sync:user-skills

# 3. Verify
ls -la ~/.claude/skills/my-new-skill
```

### After Pulling Changes

```bash
git pull origin main
# sync-skills.sh runs automatically via post-merge hook
```

### Verifying Sync

```bash
# Check counts match
echo "Project: $(ls -1 .claude/skills/ | wc -l)"
echo "User: $(ls -1 ~/.claude/skills/ | wc -l)"

# Check specific skill
ls -la ~/.claude/skills/computer-vision-pipeline
# Should show: symlink → /Users/.../some_claude_skills/.claude/skills/computer-vision-pipeline
```

## Troubleshooting

### Skills Not Appearing in Claude Code

**Symptom**: New skill not available in Claude Code sessions

**Solution**:
```bash
# Manual sync
npm run sync:user-skills

# Verify symlink created
ls -la ~/.claude/skills/your-skill-name
```

---

### Symlink Broken

**Symptom**: `ls ~/.claude/skills/skill-name` shows "No such file or directory"

**Cause**: Project skill was deleted or renamed

**Solution**:
```bash
# Remove broken symlinks and recreate
npm run sync:user-skills
```

---

### Git Hook Not Running

**Symptom**: After `git pull`, skills aren't synced

**Check**:
```bash
# Verify hooks are executable
ls -la .git/hooks/post-*
# Should show: -rwxr-xr-x

# If not executable
chmod +x .git/hooks/post-checkout
chmod +x .git/hooks/post-merge
```

---

### Skills in Wrong Location

**Symptom**: Skills in `~/.claude/skills/` instead of project

**Cause**: Created skill at user-level instead of project-level

**Solution**:
```bash
# Script will automatically migrate them
npm run sync:user-skills
```

## Benefits

### For Skill Authors

✅ **Version Control**: Track changes, revert mistakes
✅ **Collaboration**: Share skills via pull requests
✅ **Documentation**: Keep docs with code
✅ **Testing**: Test locally before committing

### For Skill Users

✅ **Always Updated**: Auto-sync with latest versions
✅ **No Manual Work**: Git operations handle syncing
✅ **Global Access**: Available in all projects
✅ **Reliable Source**: Single source of truth

### For the Project

✅ **Centralized**: All skills in one repo
✅ **Discoverable**: Easy to browse and search
✅ **Maintainable**: Easy to update and fix
✅ **Deployable**: Can publish to skill registry

## Implementation Files

| File | Purpose |
|------|---------|
| `scripts/sync-skills-to-user.sh` | Main sync script (multi-target, interactive) |
| `scripts/lib/translate-skill.sh` | Helper: strip YAML frontmatter from SKILL.md |
| `.claude-sync.json` | User-local config (gitignored) |
| `.git/hooks/post-checkout` | Auto-sync on branch switch |
| `.git/hooks/post-merge` | Auto-sync on pull/merge |
| `website/package.json` | `npm run sync:user-skills` |

## Architecture Decisions

### Why Symlinks (not copies)?

**Symlinks**:
- ✅ Always in sync (points to source)
- ✅ No duplication
- ✅ Instant updates

**Copies**:
- ❌ Can get out of sync
- ❌ Wasted disk space
- ❌ Manual copying required

### Why Project as Source of Truth?

**Project-level**:
- ✅ Version controlled
- ✅ Collaborative
- ✅ Documented
- ✅ Testable

**User-level**:
- ❌ Not version controlled
- ❌ Hard to share
- ❌ No change tracking
- ❌ Can't collaborate

### Why Automatic via Git Hooks?

**Automatic**:
- ✅ Never forget to sync
- ✅ Always up to date
- ✅ No manual steps

**Manual**:
- ❌ Easy to forget
- ❌ Inconsistent state
- ❌ Extra work

## Migration History

### Initial Setup (2026-01-15)

- Moved 143 skills from `~/.claude/skills/` to project
- Created `sync-skills.sh` script
- Added git hooks (post-checkout, post-merge)
- Added npm script: `sync:user-skills`
- Created 143 symlinks to user-level

**Skills migrated**:
- 5 from this session (crisis-detection, geospatial, react-performance, document-generation, computer-vision)
- 8 existing at user-level (background-job-orchestrator, form-validation-architect, etc.)
- 130 pre-existing project skills

**Result**: All 143 skills now symlinked and globally available
