# The Archivist - Auto-Documentation Pipeline Setup

This document guides you through setting up the auto-documentation infrastructure for the Claude Skills Ecosystem.

## What Was Built

The Archivist agent now has a complete auto-documentation pipeline:

### 1. Scripts

**`scripts/generate_snapshot.py`**
- Creates point-in-time snapshots of ecosystem state
- Compares to previous snapshot for delta tracking
- Outputs both JSON (machine-readable) and Markdown (human-readable)
- Usage: `python3 scripts/generate_snapshot.py [--label LABEL]`

**`scripts/update_changelog.py`**
- Analyzes git history for changes to skills and agents
- Auto-generates changelog entries in Keep a Changelog format
- Categorizes changes: Added, Changed, Fixed, Deprecated, Removed
- Usage: `python3 scripts/update_changelog.py [--since DATE] [--version VERSION]`

**`scripts/run_initial_archive.sh`**
- One-command setup script
- Creates directory structure
- Generates first snapshot and changelog

### 2. Archive Structure

```
.claude/archive/
├── snapshots/          # Point-in-time ecosystem snapshots
│   ├── *.json          # Machine-readable
│   └── *.md            # Human-readable
├── changelogs/
│   ├── CHANGELOG.md    # Current changelog
│   └── archived/       # Historical versions
├── blog-drafts/        # Auto-generated blog posts
└── progress-reports/
    ├── weekly/
    └── monthly/
```

## Setup Instructions

### Step 1: Run Initial Setup

```bash
cd /Users/erichowens/coding/some_claude_skills_worktrees/archivist
chmod +x scripts/run_initial_archive.sh
./scripts/run_initial_archive.sh
```

This will:
1. Create the `.claude/archive/` directory structure
2. Generate ecosystem state from current skills/agents
3. Create the initial snapshot
4. Create the initial CHANGELOG.md

### Step 2: Verify Setup

Check that these files were created:

```bash
# Should see snapshot files
ls .claude/archive/snapshots/

# Should see CHANGELOG.md
cat .claude/archive/changelogs/CHANGELOG.md
```

### Step 3: Manual First Run (if script fails)

If the shell script has issues, run manually:

```bash
# Create directories
mkdir -p .claude/archive/snapshots
mkdir -p .claude/archive/changelogs
mkdir -p .claude/archive/blog-drafts
mkdir -p .claude/archive/progress-reports/weekly
mkdir -p .claude/archive/progress-reports/monthly

# Generate ecosystem state
python3 scripts/generate_ecosystem_data.py

# Create initial snapshot
python3 scripts/generate_snapshot.py --label initial

# Create initial changelog
python3 scripts/update_changelog.py
```

## Usage

### Creating Snapshots

```bash
# Basic snapshot (uses timestamp)
python3 scripts/generate_snapshot.py

# Milestone snapshot (with label)
python3 scripts/generate_snapshot.py --label "v1.0-release"

# Custom output location
python3 scripts/generate_snapshot.py --output /path/to/snapshots/
```

**When to snapshot:**
- After adding new skills
- After creating new agents
- Before major changes
- Daily during active work
- At release milestones

### Updating Changelog

```bash
# Update with all git history
python3 scripts/update_changelog.py

# Update with recent commits
python3 scripts/update_changelog.py --since "1 week ago"
python3 scripts/update_changelog.py --since "2024-12-01"

# Create versioned release
python3 scripts/update_changelog.py --version "1.0.0"
```

**When to update:**
- After committing skill/agent changes
- Before releases
- Weekly during active development

## Snapshot Format

### JSON Output (machine-readable)

```json
{
  "timestamp": "2024-12-07 18:00 UTC",
  "state": {
    "version": "1.0.0",
    "summary": {
      "total_agents": 9,
      "total_skills": 51,
      "unique_tools": 18
    },
    "agents": [...],
    "skills": [...]
  },
  "delta": {
    "is_initial": false,
    "skills_added": 2,
    "new_skills": ["new-skill-1", "new-skill-2"],
    "changed_skills": ["updated-skill"]
  }
}
```

### Markdown Output (human-readable)

```markdown
# Ecosystem Snapshot: 2024-12-07 18:00 UTC

## Summary Statistics

| Metric | Count | Change |
|--------|-------|--------|
| Total Skills | 51 | +2 |
| Total Agents | 9 | 0 |

## Changes Since Last Snapshot

### New Skills
- **new-skill-1**: Description...
- **new-skill-2**: Description...

### Updated Skills
- **updated-skill**: Description or tools updated

## Ecosystem Health
- Skills with References: 42
- Skills with Examples: 15

## Tool Usage
Top 10 most used tools:
- **Read**: 14 uses
- **Write**: 14 uses
...
```

## Changelog Format

Follows [Keep a Changelog](https://keepachangelog.com/) format:

```markdown
# Changelog

All notable changes to the Claude Skills Ecosystem.

## [Unreleased] - 2024-12-07

### Added
- **new-skill** (skill): Expert in new domain
- **new-agent** (agent): Role description

### Changed
- **updated-skill** (skill): Improved documentation
- **updated-agent** (agent): Enhanced capabilities

### Fixed
- **buggy-skill** (skill): Fixed error in processing

### Removed
- **old-skill** (skill): Deprecated and removed
```

## Automation Options

### Git Hooks

Add to `.git/hooks/post-commit`:

```bash
#!/bin/bash
# Auto-snapshot after skill/agent changes
if git diff-tree --no-commit-id --name-only -r HEAD | grep -q "^\.claude/\(skills\|agents\)/"; then
    python3 scripts/generate_snapshot.py
    python3 scripts/update_changelog.py
fi
```

Make executable:
```bash
chmod +x .git/hooks/post-commit
```

### Cron Jobs

For daily snapshots at midnight:

```bash
# Edit crontab
crontab -e

# Add line:
0 0 * * * cd /Users/erichowens/coding/some_claude_skills_worktrees/archivist && python3 scripts/generate_snapshot.py
```

### CI/CD Integration

GitHub Actions example (`.github/workflows/snapshot.yml`):

```yaml
name: Generate Ecosystem Snapshot

on:
  push:
    paths:
      - '.claude/skills/**'
      - '.claude/agents/**'

jobs:
  snapshot:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: pip install pyyaml

      - name: Generate snapshot
        run: |
          python3 scripts/generate_ecosystem_data.py
          python3 scripts/generate_snapshot.py
          python3 scripts/update_changelog.py

      - name: Commit snapshot
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add .claude/archive/
          git commit -m "chore: auto-generate snapshot [skip ci]" || true
          git push
```

## Querying the Archive

### View Latest Snapshot

```bash
# List all snapshots (newest first)
ls -lt .claude/archive/snapshots/*.md | head -5

# View latest
cat .claude/archive/snapshots/$(ls -t .claude/archive/snapshots/*.md | head -1)
```

### Extract Metrics with jq

```bash
# Skills count over time
jq '.state.summary.total_skills' .claude/archive/snapshots/*.json

# List new skills in latest snapshot
jq -r '.delta.new_skills[]' .claude/archive/snapshots/$(ls -t .claude/archive/snapshots/*.json | head -1)

# Get all agent names
jq -r '.state.agents[].name' .claude/data/ecosystem-state.json
```

### Compare Snapshots

```bash
# Compare two snapshots
diff .claude/archive/snapshots/2024-12-07-1800-initial.md \
     .claude/archive/snapshots/2024-12-14-1800-week1.md
```

## Troubleshooting

### "No ecosystem state found"

Run the data generator first:
```bash
python3 scripts/generate_ecosystem_data.py
```

### "Not a git repository"

The changelog generator works better with git, but will create a basic changelog without it. To initialize git:
```bash
git init
git add .
git commit -m "Initial commit"
```

### Permission Denied

Make scripts executable:
```bash
chmod +x scripts/*.py scripts/*.sh
```

### Import Errors

Install required dependencies:
```bash
pip install pyyaml
```

## Next Steps

1. **Run the initial setup** (see Step 1 above)
2. **Review the first snapshot** - Check `.claude/archive/snapshots/`
3. **Review the changelog** - Check `.claude/archive/changelogs/CHANGELOG.md`
4. **Set up automation** - Choose git hooks, cron, or CI/CD
5. **Start using regularly** - Snapshot after changes, update changelog after commits

## Future Enhancements

The Archivist pipeline can be extended with:

- **Blog Draft Generator**: Auto-detect blog-worthy events and draft posts
- **Progress Report Generator**: Weekly/monthly summaries
- **Trend Analysis**: Growth rate, acceleration metrics
- **Historical Queries**: API for querying archive data
- **Web Dashboard**: Visualize ecosystem evolution over time

## Support

If you encounter issues:

1. Check that Python 3.7+ is installed: `python3 --version`
2. Verify PyYAML is installed: `pip list | grep PyYAML`
3. Ensure `.claude/` directory exists with `agents/` and `skills/`
4. Check file permissions on scripts: `ls -l scripts/`

---

**The Archivist** - *"I am the memory of the ecosystem."*
