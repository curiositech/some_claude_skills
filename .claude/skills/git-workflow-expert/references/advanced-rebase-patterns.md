# Advanced Rebase Patterns

Deep dives for complex rebase scenarios that go beyond basic `git rebase main`.

---

## Rebase --onto (Transplant Commits)

When you branched from `feature-a` but now want your commits on `main`:

```bash
# Situation: feature-b was branched from feature-a
# main --- A --- B (feature-a)
#                \--- C --- D (feature-b, you are here)

# You want: main --- C' --- D' (feature-b, rebased onto main)
git rebase --onto main feature-a feature-b

# This says: take commits between feature-a and feature-b,
# and replay them onto main
```

### Multi-level --onto

```bash
# Rebasing a sub-feature onto a new base after upstream was rebased
git rebase --onto new-base old-base current-branch
```

---

## Rebase Conflict Strategies

### Strategy 1: Ours/Theirs During Rebase

During a rebase, "ours" and "theirs" are REVERSED from merge:
- `--ours` = the branch you're rebasing ONTO (e.g., main)
- `--theirs` = YOUR commits being replayed

```bash
# Accept the upstream version for a specific file during rebase
git checkout --ours package-lock.json
git add package-lock.json
git rebase --continue
```

### Strategy 2: rerere (Reuse Recorded Resolution)

```bash
# Enable globally
git config --global rerere.enabled true

# Now git remembers how you resolve conflicts
# Next time the same conflict appears, it auto-resolves

# See recorded resolutions
git rerere status
git rerere diff

# Forget a bad resolution
git rerere forget path/to/file
```

### Strategy 3: Abort and Decompose

When a rebase has too many conflicts:

```bash
git rebase --abort

# Instead of rebasing 20 commits at once, do it in chunks:
git rebase -i HEAD~20
# Mark the first 5 as "pick", the rest as "pick"
# Save. Resolve conflicts for just those 5.
# Then rebase the next batch.
```

---

## Autosquash Workflow

The fastest way to clean up work-in-progress commits:

```bash
# While working, create fixup commits:
git commit --fixup abc123       # Will be squashed into abc123
git commit --fixup :/"Add auth" # Match by commit message substring

# When ready to clean up:
git rebase -i --autosquash main

# fixup! commits automatically arrange themselves
# Just save the editor and they squash in order
```

### Squash vs Fixup

- `git commit --squash abc123` — Squashes AND lets you edit the final message
- `git commit --fixup abc123` — Squashes AND keeps the original message (most common)

---

## Preserving Merge Commits During Rebase

```bash
# By default, rebase flattens merge commits
# To preserve them:
git rebase --rebase-merges main

# This recreates the merge structure on the new base
# Useful for feature branches that had their own sub-branches
```

---

## Rebase Safety Checklist

1. **Am I the only one pushing to this branch?** If no → DON'T REBASE
2. **Do I have uncommitted changes?** If yes → `git stash` first
3. **Is the rebase complex (&gt;10 commits)?** If yes → make a backup branch first: `git branch backup-feature`
4. **Have I fetched recently?** `git fetch origin` before rebasing onto remote branches
5. **Do I know reflog?** If yes → you can always recover. If no → learn it before complex rebases.
