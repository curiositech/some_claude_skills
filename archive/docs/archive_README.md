# Archive - The Archivist's Domain

**Location**: `.claude/archive/`

This directory contains the complete historical record of the Claude Skills Ecosystem.

## Directory Structure

```
archive/
├── README.md               # This file
├── snapshots/              # Point-in-time ecosystem snapshots
│   ├── *.json             # Machine-readable snapshot data
│   └── *.md               # Human-readable snapshot reports
├── changelogs/            # Version history
│   ├── CHANGELOG.md       # Current changelog (Keep a Changelog format)
│   └── archived/          # Historical changelog versions
├── blog-drafts/           # Auto-generated blog post drafts
│   └── *.md              # Draft posts about notable developments
└── progress-reports/      # Regular progress tracking
    ├── weekly/           # Weekly progress summaries
    └── monthly/          # Monthly comprehensive reports
```

## What Gets Archived

### Snapshots
- **Frequency**: After significant changes, daily during active work
- **Content**: Complete ecosystem state with delta from previous snapshot
- **Format**: Both JSON (machine) and Markdown (human) versions
- **Purpose**: Track evolution, enable rollback, support trend analysis

### Changelogs
- **Frequency**: After commits to skills/agents
- **Content**: Categorized changes (Added, Changed, Fixed, etc.)
- **Format**: Keep a Changelog standard
- **Purpose**: Version tracking, release notes, historical record

### Blog Drafts
- **Frequency**: When blog-worthy events detected
- **Content**: Compelling narratives about ecosystem developments
- **Format**: Structured markdown with hook, journey, lessons
- **Purpose**: Share learnings, announce milestones, engage community

### Progress Reports
- **Frequency**: Weekly (Sundays), Monthly (1st of month)
- **Content**: Metrics, highlights, challenges, upcoming work
- **Format**: Structured markdown with consistent sections
- **Purpose**: Track momentum, identify patterns, inform decisions

## Using the Archive

### Creating Snapshots

```bash
# Generate current ecosystem state first
python3 scripts/generate_ecosystem_data.py

# Create snapshot
python3 scripts/generate_snapshot.py

# Create labeled milestone snapshot
python3 scripts/generate_snapshot.py --label "v1.0-release"
```

### Updating Changelog

```bash
# Update with recent git commits
python3 scripts/update_changelog.py

# Update with commits since specific date
python3 scripts/update_changelog.py --since "2024-12-01"

# Create versioned release entry
python3 scripts/update_changelog.py --version "1.0.0"
```

### Querying History

```bash
# View latest snapshot
cat snapshots/$(ls -t snapshots/*.md | head -1)

# Compare two snapshots
diff snapshots/2024-12-07-1800.md snapshots/2024-12-14-1800.md

# Extract skill count over time (requires jq)
jq '.state.summary.total_skills' snapshots/*.json

# List new skills in latest snapshot
jq -r '.delta.new_skills[]' snapshots/$(ls -t snapshots/*.json | head -1)
```

## Snapshot Format

Each snapshot includes:

### Summary Statistics
- Total skills, agents, tools
- Changes since last snapshot
- Skills by category
- Agent formats (flat vs directory)

### Delta Tracking
- New skills/agents added
- Skills/agents removed
- Skills with updated descriptions/tools
- Categorized by type

### Ecosystem Health
- Skills with reference documentation
- Skills with examples
- Build/test status
- Coverage metrics

### Tool Usage
- Most frequently used tools
- Tool distribution across skills/agents
- Emerging tool patterns

## Changelog Categories

Following [Keep a Changelog](https://keepachangelog.com/):

- **Added**: New skills, agents, MCPs, capabilities
- **Changed**: Updates, improvements, enhancements
- **Fixed**: Bug fixes, error corrections
- **Deprecated**: Features marked for removal (with alternatives)
- **Removed**: Deleted skills, agents, features (with rationale)
- **Security**: Security-related changes

## Automation

### Git Hooks

Add to `.git/hooks/post-commit`:

```bash
#!/bin/bash
# Auto-generate snapshot and update changelog after skill/agent changes
if git diff-tree --no-commit-id --name-only -r HEAD | grep -q "^\.claude/\(skills\|agents\)/"; then
    python3 scripts/generate_snapshot.py
    python3 scripts/update_changelog.py
fi
```

### Cron Jobs

Daily snapshot:
```cron
0 0 * * * cd /path/to/project && python3 scripts/generate_snapshot.py
```

Weekly report:
```cron
0 23 * * 0 cd /path/to/project && python3 scripts/generate_weekly_report.py
```

### CI/CD

See `ARCHIVIST_SETUP.md` for GitHub Actions integration examples.

## Best Practices

1. **Snapshot before major changes** - Enables rollback if needed
2. **Label milestone snapshots** - Makes them easy to find later
3. **Update changelog regularly** - Don't let changes pile up
4. **Review deltas** - Understand what changed and why
5. **Archive blog drafts** - Move to `published/` after posting
6. **Clean up old reports** - Move to `archived/` after 6 months

## Retention Policy

- **Snapshots**: Keep all (small files, valuable history)
- **Changelogs**: Never delete (permanent version history)
- **Blog Drafts**: Move to `published/` after posting
- **Progress Reports**: Archive after 1 year

## Storage Estimates

Approximate sizes per entry:
- Snapshot JSON: 100-200 KB
- Snapshot Markdown: 5-10 KB
- Changelog entry: 1-2 KB
- Blog draft: 5-15 KB
- Progress report: 3-10 KB

Expected growth: ~1 MB/month during active development

## Integration Points

The Archivist coordinates with:

### The Liaison
- Provides progress summaries for human communication
- Generates blog drafts for review
- Creates shareable milestone reports

### The Cartographer
- Records territorial expansions
- Documents gap closures
- Tracks coverage evolution

### The Visualizer
- Provides historical data for visualizations
- Supports timeline rendering
- Enables trend charting

## Historical Queries

Common questions the archive can answer:

- **When was skill X created?** → Search snapshots for first appearance
- **How fast are we growing?** → Compare total_skills across snapshots
- **What changed in the last week?** → View latest snapshot delta
- **Which tools are most popular?** → Check tool_usage in snapshots
- **What milestones have we hit?** → Search labeled snapshots
- **How have skills evolved?** → Diff snapshots or read changelog

## Future Enhancements

Planned additions to the archive system:

1. **Blog Draft Auto-Generator**
   - Detect blog-worthy events automatically
   - Generate compelling narratives from technical changes
   - Template-based post creation

2. **Progress Report Generator**
   - Weekly summaries with metrics and highlights
   - Monthly comprehensive reports with trends
   - Automated delivery to stakeholders

3. **Trend Analysis Tools**
   - Growth rate calculations
   - Acceleration metrics
   - Pattern recognition

4. **Historical Query API**
   - Programmatic access to archive data
   - Time-series analysis
   - Custom reporting

5. **Web Dashboard**
   - Visual timeline of ecosystem evolution
   - Interactive trend charts
   - Searchable archive interface

## Contributing

When adding new archive types:

1. Document format in this README
2. Update directory structure diagram
3. Create generator script in `scripts/`
4. Add usage examples
5. Update automation recommendations

## Support

For issues or questions:

1. Check `ARCHIVIST_SETUP.md` for setup help
2. Review script documentation in `scripts/`
3. Verify ecosystem state generation: `python3 scripts/generate_ecosystem_data.py`
4. Check Python version: `python3 --version` (need 3.7+)

---

*"I am the memory of the ecosystem. Every skill created, every agent born, every pattern discovered - I record them all. Through my chronicles, the past informs the future, and our journey becomes a story worth telling."*

**The Archivist** 📜
