#!/bin/bash
# Local sync hook for pm-workspace
# 
# Option A: Run manually when you remember
#   bash ~/Source/pm-workspace/scripts/sync.sh
#
# Option B: Add as a git hook in elephant-ai (runs on every pull)
#   ln -sf ~/Source/pm-workspace/scripts/sync.sh ~/Source/elephant-ai/.git/hooks/post-merge
#
# Option C: Add as a cron job (runs daily)
#   crontab -e
#   0 8 * * * /Users/tylersahagun/Source/pm-workspace/scripts/sync.sh >> /tmp/pm-sync.log 2>&1

set -e

PM_WORKSPACE="$HOME/Source/pm-workspace"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔄 Syncing pm-workspace submodule...${NC}"

cd "$PM_WORKSPACE"

# Fetch latest from elephant-ai
cd elephant-ai
git fetch origin main

# Check if update needed
CURRENT=$(git rev-parse HEAD)
LATEST=$(git rev-parse origin/main)

if [ "$CURRENT" = "$LATEST" ]; then
    echo -e "${GREEN}✓ Already up to date${NC}"
    exit 0
fi

# Count commits behind
COMMITS=$(git rev-list --count HEAD..origin/main)
echo "  Found $COMMITS new commit(s)"

# Update to latest
git checkout origin/main
cd ..

# Commit the update
git add elephant-ai
git commit -m "🔄 Update elephant-ai submodule ($COMMITS commits)"
git push

echo -e "${GREEN}✓ Updated and pushed!${NC}"

# Optional: Send Slack notification
# Uncomment and configure if you want local sync to notify
# curl -X POST -H 'Content-type: application/json' \
#   --data '{"text":"🔄 PM workspace synced with elephant-ai ('$COMMITS' commits)"}' \
#   YOUR_SLACK_WEBHOOK_URL

