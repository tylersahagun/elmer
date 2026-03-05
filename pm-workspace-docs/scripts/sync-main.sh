#!/bin/bash
# Sync with main while preserving local PM work
# Usage: bash .pm-workspace/scripts/sync-main.sh

set -e

echo "🐘 AskElephant PM Workspace - Syncing with main..."
echo ""

# Check for uncommitted changes in tracked files
if ! git diff --quiet HEAD 2>/dev/null; then
    echo "📦 Stashing uncommitted changes..."
    git stash push -m "PM-workspace-sync-$(date +%Y%m%d-%H%M%S)"
    STASHED=true
else
    echo "✓ No uncommitted changes to stash"
    STASHED=false
fi

echo ""
echo "📡 Fetching latest from origin..."
git fetch origin

echo ""
echo "🔄 Rebasing on origin/main..."
if git rebase origin/main; then
    echo "✓ Rebase successful"
else
    echo ""
    echo "⚠️  Rebase conflicts detected!"
    echo "   Resolve conflicts, then run: git rebase --continue"
    echo "   Or abort with: git rebase --abort"
    exit 1
fi

if [ "$STASHED" = true ]; then
    echo ""
    echo "📦 Restoring stashed changes..."
    if git stash pop; then
        echo "✓ Stash restored"
    else
        echo ""
        echo "⚠️  Stash conflicts detected!"
        echo "   Your changes are in: git stash list"
        echo "   Resolve and run: git stash drop"
    fi
fi

echo ""
echo "✅ Synced with main!"
echo ""
echo "📁 Your local PM files are untouched:"
echo "   • .pm-workspace/ - PRDs, research, docs"
echo "   • prototypes/    - Storybook prototypes"
echo "   • .cursor/rules/ - PM copilot rules"
echo ""

