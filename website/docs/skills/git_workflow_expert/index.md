---
name: git-workflow-expert
description: Git branching strategies, conflict resolution, rebase workflows, monorepo patterns, and advanced operations like cherry-pick, bisect, and reflog recovery. Activate on "git", "branching strategy",
  "merge conflict", "rebase", "cherry-pick", "monorepo git", "git bisect", "git reflog", "squash commits". NOT for GitHub Actions CI/CD (use github-actions-pipeline-builder), GitHub API/webhooks, or PR
  review processes (use code-review-checklist).
allowed-tools: Read,Write,Edit,Bash,Grep,Glob
metadata:
  tags:
  - git
  - workflow
  - branching-strategy
  - merge-conflict
  pairs-with:
  - skill: github-actions-pipeline-builder
    reason: Git branching strategies determine which CI/CD pipelines trigger on which events
  - skill: monorepo-management
    reason: Monorepo git workflows require specialized branching, tagging, and merge strategies
  - skill: code-review-checklist
    reason: PR-based code review workflows depend on sound git branching practices
---

# Git Workflow Expert

Master git operations from daily workflow to disaster recovery. Covers branching strategies, merge vs rebase decisions, conflict resolution, monorepo patterns, and advanced operations that most developers never learn but desperately need.

## When to Use

**Use for**:
- Choosing a branching strategy for a project (trunk-based, GitHub Flow, git-flow)
- Resolving merge conflicts (especially complex multi-file conflicts)
- Rebase workflows (interactive rebase, rebase onto, autosquash)
- Cherry-picking across branches
- Using git bisect to find bug-introducing commits
- Recovering lost work with reflog
- Monorepo git patterns (sparse checkout, subtree, submodules)
- Cleaning up messy git history
- Setting up git hooks for quality gates
- Force push safety and shared branch protocols

**NOT for**:
- GitHub Actions / CI/CD pipelines (use `github-actions-pipeline-builder`)
- PR review process and checklists (use `code-review-checklist`)
- GitHub API / webhooks / repository management
- Git LFS setup (mention it, but not the core focus)

---

## Core Decision: Branching Strategy

```mermaid
flowchart TD
    Start[New project or rethinking strategy?] --> Team{Team size?}
    Team -->|Solo or 2-3| Trunk[Trunk-Based Development]
    Team -->|4-15| GHFlow[GitHub Flow]
    Team -->|15+ or regulated| Q2{Release cadence?}
    Q2 -->|Continuous deploy| GHFlow
    Q2 -->|Scheduled releases| GitFlow[Git-Flow]
    Q2 -->|Multiple supported versions| GitFlow

    Trunk --> T1[Main branch only]
    T1 --> T2[Short-lived feature branches < 1 day]
    T2 --> T3[Feature flags for incomplete work]

    GHFlow --> G1[main + feature branches]
    G1 --> G2[PR-based review]
    G2 --> G3[Deploy from main after merge]

    GitFlow --> GF1[main + develop + feature + release + hotfix]
    GF1 --> GF2[Formal release branches]
    GF2 --> GF3[Hotfix branches from main]
```

### Strategy Comparison

| Dimension | Trunk-Based | GitHub Flow | Git-Flow |
|-----------|------------|-------------|----------|
| **Branch lifetime** | Hours | Days | Days-weeks |
| **Merge frequency** | Multiple/day | Daily | Per-sprint |
| **CI requirement** | Mandatory | Strong | Optional |
| **Rollback mechanism** | Feature flags | Revert commit | Release branch |
| **Best for** | High-trust teams | Most web projects | Versioned releases |
| **Worst for** | Junior-heavy teams | Multiple live versions | Fast iteration |

---

## Merge vs Rebase Decision

```mermaid
flowchart TD
    Q[Integrating changes?] --> Shared{Is the branch shared?}
    Shared -->|Yes, others push to it| Merge[Use merge]
    Shared -->|No, only me| Q2{Want clean history?}
    Q2 -->|Yes| Rebase[Use rebase]
    Q2 -->|No, preserve context| Merge
    Rebase --> Q3{Long-lived branch?}
    Q3 -->|Yes, many conflicts expected| RebaseOnto[Consider rebase --onto]
    Q3 -->|No| RebaseSimple[Simple rebase]
```

### Anti-Pattern: Rebase Shared Branches

**Novice**: "I'll rebase main into the shared feature branch to keep it clean."
**Expert**: Never rebase branches others are pushing to. Rebase rewrites commit SHAs — anyone who already pulled will get duplicate commits and merge hell. Use `merge` for shared branches, `rebase` for personal branches.
**Detection**: Multiple developers report "weird duplicate commits" after a pull.

### Anti-Pattern: Merge Commit Soup

**Novice**: "I'll just merge main into my feature branch every morning to stay current."
**Expert**: Daily merge commits from main create an unreadable history. Instead: `git rebase main` on your personal branch (one clean operation), or if you must merge, at least squash when merging back to main.
**Timeline**: Before 2020, merge was the default. Modern teams prefer rebase for feature branches, merge (or squash-merge) for PRs.

---

## Conflict Resolution

### The Calm Approach

```bash
# 1. Before resolving: understand what happened
git log --merge --oneline          # Show conflicting commits
git diff --name-only --diff-filter=U  # List conflicted files

# 2. For each file: understand both sides
git diff :2:file :3:file           # :2 = ours, :3 = theirs

# 3. Resolve, then verify
git add resolved-file.ts
git diff --cached                  # Review what you're about to commit

# 4. After all files resolved
git merge --continue               # or git rebase --continue
```

### Anti-Pattern: Accept Ours/Theirs Blindly

**Novice**: "This conflict is too complex, I'll just `git checkout --ours .` and be done."
**Expert**: Blindly accepting one side loses the other person's work. If a conflict is genuinely too complex, use a 3-way merge tool (`git mergetool`) to see base + ours + theirs simultaneously. For large-scale conflicts, consider `rerere` (reuse recorded resolution) to cache conflict solutions.
**Detection**: Features mysteriously disappear after merges.

---

## Advanced Operations

### Cherry-Pick Workflow

```bash
# Pick a specific commit from another branch
git cherry-pick abc123

# Pick a range (exclusive start, inclusive end)
git cherry-pick abc123..def456

# Cherry-pick without committing (stage only)
git cherry-pick --no-commit abc123

# If conflicts: resolve then
git cherry-pick --continue
```

**When to cherry-pick**: Hotfixes that need to go to multiple release branches. Bug fixes from a feature branch that's not ready to merge.

**When NOT to**: If you need many commits, merge or rebase instead. Cherry-pick creates duplicate commits with different SHAs.

### Git Bisect (Find Bug-Introducing Commit)

```bash
# Start bisect
git bisect start
git bisect bad                     # Current commit is broken
git bisect good v1.2.0             # This tag was working

# Git checks out a middle commit. Test it, then:
git bisect good                    # or: git bisect bad

# Repeat until git identifies the first bad commit

# Automated bisect with a test script:
git bisect start HEAD v1.2.0
git bisect run npm test            # Runs test at each step automatically
```

### Reflog Recovery (Undo Almost Anything)

```bash
# See recent HEAD positions
git reflog --oneline -20

# Recover a dropped stash
git stash list                     # Empty? Check reflog:
git fsck --no-reflogs | grep commit  # Find dangling commits
git show <sha>                     # Inspect to find your stash

# Undo a bad rebase
git reflog
# Find the SHA before the rebase started
git reset --hard HEAD@{5}          # Reset to that point

# Recover deleted branch
git reflog | grep "branch-name"
git checkout -b recovered-branch <sha>
```

### Interactive Rebase (Clean History)

```bash
# Rewrite last 5 commits
git rebase -i HEAD~5

# In the editor:
# pick   abc123 Add user model        ← keep as-is
# squash def456 Fix typo in user model ← squash into previous
# reword ghi789 Add auth              ← edit commit message
# drop   jkl012 WIP debugging         ← remove entirely
# edit   mno345 Add migration         ← pause to amend

# Autosquash: commits prefixed with "fixup!" or "squash!" auto-arrange
git commit --fixup abc123          # Creates "fixup! Add user model"
git rebase -i --autosquash HEAD~5  # Automatically squashes it
```

---

## Monorepo Git Patterns

### Sparse Checkout (Work on Subset)

```bash
# Enable sparse checkout
git sparse-checkout init --cone
git sparse-checkout set packages/core packages/cli

# Now only packages/core and packages/cli are checked out
# Other directories exist in git but aren't on disk
```

### Subtree (Embed Another Repo)

```bash
# Add a subtree
git subtree add --prefix=libs/shared https://github.com/org/shared.git main --squash

# Pull updates
git subtree pull --prefix=libs/shared https://github.com/org/shared.git main --squash

# Push changes back upstream
git subtree push --prefix=libs/shared https://github.com/org/shared.git feature-x
```

### Submodules vs Subtree

| Dimension | Submodules | Subtree |
|-----------|-----------|---------|
| **Model** | Pointer to external repo | Copy of external repo |
| **Clone** | Requires `--recurse-submodules` | Just works |
| **Update** | `git submodule update` | `git subtree pull` |
| **CI complexity** | Higher (need init step) | Lower |
| **Best for** | Large vendored deps | Small shared libs |
| **Footgun risk** | High (detached HEAD trap) | Low |

---

## Git Hooks for Quality

```bash
# .git/hooks/pre-commit (or use husky/lefthook)
#!/bin/sh
# Run linter on staged files only
npx lint-staged

# .git/hooks/commit-msg
#!/bin/sh
# Enforce conventional commits
if ! grep -qE "^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?: .+" "$1"; then
  echo "Commit message must follow Conventional Commits format"
  exit 1
fi

# .git/hooks/pre-push
#!/bin/sh
# Run tests before push
npm test || exit 1
```

### Anti-Pattern: Skipping Hooks

**Novice**: "The pre-commit hook is slow, I'll just `--no-verify`."
**Expert**: If hooks are too slow, fix the hooks (use lint-staged for incremental linting, parallelize tests). `--no-verify` becomes a habit that defeats the purpose. If you truly need to skip once (emergency hotfix), document why in the commit message.

---

## TODO(human)

Implement the `selectBranchingStrategy()` decision function below. This determines which branching strategy to recommend based on project characteristics. Consider factors beyond team size — deployment target, regulatory requirements, release cadence, and whether the project is a library vs. application.

```
function selectBranchingStrategy(project) {
  // TODO(human): Implement branching strategy selection logic
  // Input: { teamSize, deployCadence, isRegulated, isLibrary, hasMultipleVersions, ciMaturity }
  // Output: { strategy: 'trunk-based' | 'github-flow' | 'git-flow',
  //           reasoning: string,
  //           migrationSteps?: string[] }
  //
  // Consider:
  // - Libraries with semver need different patterns than web apps
  // - Regulated industries (healthcare, finance) may require audit trails
  // - CI maturity affects whether trunk-based is safe
  // - Migration path from current strategy matters
}
```

---

## Force Push Safety

```bash
# NEVER force push to main/master
# Use --force-with-lease instead of --force
git push --force-with-lease origin feature-branch

# --force-with-lease checks that remote hasn't been updated
# since your last fetch. Prevents overwriting others' work.

# Set as default (never use bare --force again):
git config --global alias.pushf "push --force-with-lease"
```

---

## References

- `references/advanced-rebase-patterns.md` — Consult for complex rebase scenarios: rebase --onto, interactive rebase strategies, handling rebase conflicts in long-lived branches
- `references/monorepo-git-strategies.md` — Consult for monorepo-specific patterns: sparse checkout optimization, CODEOWNERS, path-based CI triggers, large repo performance
