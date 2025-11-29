# Badge and Metadata Management Reference

## Badge System

### Badge Types

| Badge | Color | Purpose | Duration |
|-------|-------|---------|----------|
| `NEW` | Green (lime) | Recently added skills | ~60 days |
| `UPDATED` | Blue (cyan) | Recently improved skills | ~30 days |

### Badge Assignment Criteria

**NEW Badge**:
- Skill is first published to showcase
- Persists until next batch of skills arrives
- Auto-remove after ~60 days

**UPDATED Badge**:
- Major content expansion (50%+ more content)
- New sections added (anti-patterns, decision trees)
- Structural improvements (references folders)
- Auto-remove after ~30 days

### Badge Rules
1. **One badge per skill** - UPDATED takes precedence over NEW
2. **Meaningful changes only** - Typo fixes don't warrant badges
3. **Lifecycle management** - Remove stale badges periodically

### Where to Update Badges

In `website/src/data/skills.ts`:
```typescript
{ id: 'new-skill', title: '...', badge: 'NEW' }
{ id: 'updated-skill', title: '...', badge: 'UPDATED' }
```

### Badge Lifecycle

```
Skill created → Add NEW badge
     ↓
60 days pass (or new batch arrives)
     ↓
Remove NEW badge
     ↓
Skill significantly improved → Add UPDATED badge
     ↓
30 days pass → Remove UPDATED badge
     ↓
Repeat as improvements are made
```

### Validation Commands

```bash
# Count skills with badges
echo "NEW badges: $(grep "badge: 'NEW'" website/src/data/skills.ts | wc -l)"
echo "UPDATED badges: $(grep "badge: 'UPDATED'" website/src/data/skills.ts | wc -l)"

# List skills with badges
grep -E "badge: '(NEW|UPDATED)'" website/src/data/skills.ts
```

---

## Metadata System

### Metadata Fields

Stored in `website/src/data/skillMetadata.json`:

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Skill identifier (folder name) |
| `createdAt` | ISO date | First git commit date |
| `updatedAt` | ISO date | Latest git commit date |
| `totalLines` | number | Total lines in skill folder |
| `totalFiles` | number | Number of files in folder |
| `skillMdSize` | number | SKILL.md size in bytes |
| `skillMdLines` | number | Lines in SKILL.md |
| `hasReferences` | boolean | Has `references/` folder |
| `hasExamples` | boolean | Has `examples/` folder |
| `hasChangelog` | boolean | Has CHANGELOG.md |

### Automatic Generation

Pre-commit hook triggers metadata regeneration:
```bash
# When any .claude/skills/ file is staged:
npx tsx scripts/generateSkillMetadata.ts
# Updated skillMetadata.json auto-added to commit
```

### Manual Regeneration

```bash
# From website/ directory
npx tsx scripts/generateSkillMetadata.ts

# Or as part of prebuild
npm run prebuild
```

### Website Features Powered by Metadata

- **Sortable list view** (`/skills` page "List" mode)
- **Sort options**: Updated, Created, Lines, Size
- **Relative dates**: "2 days ago", "Last week"
- **Metadata badges**: refs, files indicators

### Validation Commands

```bash
# Verify counts match
echo "Skills: $(ls -d .claude/skills/*/ | wc -l)"
echo "Metadata entries: $(grep '"id":' website/src/data/skillMetadata.json | wc -l)"

# Check for stale entries
for id in $(grep '"id":' website/src/data/skillMetadata.json | sed 's/.*"id": "\([^"]*\)".*/\1/'); do
  if [ ! -d ".claude/skills/$id" ]; then
    echo "Stale metadata: $id"
  fi
done

# Find skills missing metadata
for skill in .claude/skills/*/; do
  name=$(basename "$skill")
  if ! grep -q "\"id\": \"$name\"" website/src/data/skillMetadata.json; then
    echo "Missing metadata: $name"
  fi
done
```

### Metadata JSON Example

```json
{
  "id": "skill-name",
  "createdAt": "2025-01-15",
  "updatedAt": "2025-01-20",
  "totalLines": 450,
  "totalFiles": 5,
  "skillMdSize": 15234,
  "skillMdLines": 293,
  "hasReferences": true,
  "hasExamples": false,
  "hasChangelog": true
}
```
