#!/bin/bash
#
# check-github-issues.sh
#
# Checks GitHub for open issues, skill submissions, and stale PRs.
# Run daily or on-demand to stay on top of community contributions.
#
# Usage: ./scripts/check-github-issues.sh
#
# Requires: gh (GitHub CLI) installed and authenticated
#

set -e

REPO="curiositech/some_claude_skills"

echo "========================================"
echo "GitHub Issues & PRs Check"
echo "$(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================"
echo ""

# Check if gh is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed"
    echo "   Install: brew install gh"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub CLI"
    echo "   Run: gh auth login"
    exit 1
fi

# ══════════════════════════════════════════════════════════════════════════════
# OPEN ISSUES
# ══════════════════════════════════════════════════════════════════════════════

echo "📋 OPEN ISSUES"
echo "────────────────────────────────────────"

OPEN_ISSUES=$(gh issue list --repo "$REPO" --state open --json number,title,labels,createdAt --limit 20)
ISSUE_COUNT=$(echo "$OPEN_ISSUES" | jq 'length')

if [ "$ISSUE_COUNT" -eq 0 ]; then
    echo "✅ No open issues"
else
    echo "Found $ISSUE_COUNT open issue(s):"
    echo ""
    echo "$OPEN_ISSUES" | jq -r '.[] | "  #\(.number): \(.title)"'
    echo ""

    # Check for skill submissions (issues with skill-submission label)
    SKILL_SUBMISSIONS=$(echo "$OPEN_ISSUES" | jq '[.[] | select(.labels[].name == "skill-submission")]')
    SUBMISSION_COUNT=$(echo "$SKILL_SUBMISSIONS" | jq 'length')

    if [ "$SUBMISSION_COUNT" -gt 0 ]; then
        echo "📦 SKILL SUBMISSIONS: $SUBMISSION_COUNT pending"
        echo "$SKILL_SUBMISSIONS" | jq -r '.[] | "  #\(.number): \(.title)"'
        echo ""
    fi
fi

echo ""

# ══════════════════════════════════════════════════════════════════════════════
# OPEN PULL REQUESTS
# ══════════════════════════════════════════════════════════════════════════════

echo "🔀 OPEN PULL REQUESTS"
echo "────────────────────────────────────────"

OPEN_PRS=$(gh pr list --repo "$REPO" --state open --json number,title,createdAt,author,isDraft --limit 20)
PR_COUNT=$(echo "$OPEN_PRS" | jq 'length')

if [ "$PR_COUNT" -eq 0 ]; then
    echo "✅ No open PRs"
else
    echo "Found $PR_COUNT open PR(s):"
    echo ""
    echo "$OPEN_PRS" | jq -r '.[] | "  #\(.number): \(.title) (@\(.author.login))\(if .isDraft then " [DRAFT]" else "" end)"'
    echo ""

    # Check for stale PRs (older than 7 days)
    WEEK_AGO=$(date -v-7d '+%Y-%m-%dT%H:%M:%SZ' 2>/dev/null || date -d '7 days ago' --iso-8601=seconds 2>/dev/null)
    STALE_PRS=$(echo "$OPEN_PRS" | jq --arg date "$WEEK_AGO" '[.[] | select(.createdAt < $date)]')
    STALE_COUNT=$(echo "$STALE_PRS" | jq 'length')

    if [ "$STALE_COUNT" -gt 0 ]; then
        echo "⚠️  STALE PRs (>7 days old): $STALE_COUNT"
        echo "$STALE_PRS" | jq -r '.[] | "  #\(.number): \(.title) - created \(.createdAt[:10])"'
        echo ""
    fi
fi

echo ""

# ══════════════════════════════════════════════════════════════════════════════
# RECENT ACTIVITY
# ══════════════════════════════════════════════════════════════════════════════

echo "📊 RECENT ACTIVITY (last 7 days)"
echo "────────────────────────────────────────"

# Recently closed issues
WEEK_AGO=$(date -v-7d '+%Y-%m-%dT%H:%M:%SZ' 2>/dev/null || date -d '7 days ago' --iso-8601=seconds 2>/dev/null)
CLOSED_ISSUES=$(gh issue list --repo "$REPO" --state closed --json number,title,closedAt --limit 50 | jq --arg date "$WEEK_AGO" '[.[] | select(.closedAt > $date)]')
CLOSED_COUNT=$(echo "$CLOSED_ISSUES" | jq 'length')

if [ "$CLOSED_COUNT" -gt 0 ]; then
    echo "✅ Closed issues: $CLOSED_COUNT"
    echo "$CLOSED_ISSUES" | jq -r '.[] | "  #\(.number): \(.title)"'
else
    echo "  No issues closed this week"
fi

echo ""

# Recently merged PRs
MERGED_PRS=$(gh pr list --repo "$REPO" --state merged --json number,title,mergedAt --limit 50 | jq --arg date "$WEEK_AGO" '[.[] | select(.mergedAt > $date)]')
MERGED_COUNT=$(echo "$MERGED_PRS" | jq 'length')

if [ "$MERGED_COUNT" -gt 0 ]; then
    echo "✅ Merged PRs: $MERGED_COUNT"
    echo "$MERGED_PRS" | jq -r '.[] | "  #\(.number): \(.title)"'
else
    echo "  No PRs merged this week"
fi

echo ""
echo "========================================"
echo "Check complete!"
echo "========================================"
