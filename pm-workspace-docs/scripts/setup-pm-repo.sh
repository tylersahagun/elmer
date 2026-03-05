#!/bin/bash
# Setup script to create a separate private PM workspace repository
# This keeps your PM work separate from the elephant-ai repo

set -e

# Configuration - Update these
PM_REPO_NAME="pm-workspace"
PM_REPO_PATH="$HOME/Source/$PM_REPO_NAME"
ELEPHANT_AI_PATH="$HOME/Source/elephant-ai"
GITHUB_USERNAME="tylersahagun"  # Update if different

echo "🐘 Setting up separate PM Workspace Repository"
echo "================================================"
echo ""
echo "This script will:"
echo "  1. Create a new private repo: $PM_REPO_PATH"
echo "  2. Add elephant-ai as a git submodule (read-only reference)"
echo "  3. Move your PM workspace files to the new repo"
echo "  4. Set up Cursor commands and rules"
echo ""

# Check if directory already exists
if [ -d "$PM_REPO_PATH" ]; then
    echo "❌ Directory already exists: $PM_REPO_PATH"
    echo "   Please remove it first or choose a different location."
    exit 1
fi

echo "📁 Creating repository directory..."
mkdir -p "$PM_REPO_PATH"
cd "$PM_REPO_PATH"

echo ""
echo "🔧 Initializing git repository..."
git init

echo ""
echo "📦 Adding elephant-ai as submodule..."
git submodule add https://github.com/AskElephant/elephant-ai.git elephant-ai
git submodule update --init --recursive

echo ""
echo "📂 Creating PM workspace structure..."
mkdir -p .pm-workspace/{company-context,initiatives,research/user-interviews,meeting-notes,agents-docs,knowledge-base-sync,scripts}
mkdir -p .cursor/{commands,rules}
mkdir -p prototypes/src/components

echo ""
echo "📋 Copying PM workspace files..."
if [ -d "$ELEPHANT_AI_PATH/.pm-workspace" ]; then
    cp -r "$ELEPHANT_AI_PATH/.pm-workspace/"* .pm-workspace/ 2>/dev/null || true
    echo "   ✓ Copied .pm-workspace/"
fi

if [ -d "$ELEPHANT_AI_PATH/.cursor/commands" ]; then
    cp -r "$ELEPHANT_AI_PATH/.cursor/commands/"* .cursor/commands/ 2>/dev/null || true
    echo "   ✓ Copied .cursor/commands/"
fi

if [ -d "$ELEPHANT_AI_PATH/.cursor/rules" ]; then
    cp -r "$ELEPHANT_AI_PATH/.cursor/rules/"* .cursor/rules/ 2>/dev/null || true
    echo "   ✓ Copied .cursor/rules/"
fi

# Copy PM-workspace specific rules
if [ -d "$ELEPHANT_AI_PATH/.pm-workspace/scripts/cursor-rules-for-pm-repo" ]; then
    cp -r "$ELEPHANT_AI_PATH/.pm-workspace/scripts/cursor-rules-for-pm-repo/"* .cursor/rules/ 2>/dev/null || true
    echo "   ✓ Copied PM-specific Cursor rules"
fi

# Copy Slack commands reference
if [ -f "$ELEPHANT_AI_PATH/.pm-workspace/SLACK-COMMANDS.md" ]; then
    cp "$ELEPHANT_AI_PATH/.pm-workspace/SLACK-COMMANDS.md" ./SLACK-COMMANDS.md
    echo "   ✓ Copied SLACK-COMMANDS.md"
fi

if [ -d "$ELEPHANT_AI_PATH/prototypes" ]; then
    cp -r "$ELEPHANT_AI_PATH/prototypes/"* prototypes/ 2>/dev/null || true
    echo "   ✓ Copied prototypes/"
fi

echo ""
echo "📝 Creating README..."
cat > README.md << 'EOF'
# PM Workspace

Personal PM workspace for AskElephant product management and prototyping.

## Structure

```
pm-workspace/
├── elephant-ai/              # Git submodule - main codebase (read-only)
├── .pm-workspace/            # PM work (PRDs, research, notes)
│   ├── company-context/      # Product vision, personas, tech stack
│   ├── initiatives/          # Active projects
│   ├── research/             # User research
│   └── meeting-notes/        # Meeting documentation
├── prototypes/               # Storybook prototypes
└── .cursor/
    ├── commands/             # PM-specific commands
    └── rules/                # PM-specific AI rules
```

## Setup

1. Clone this repo
2. Initialize submodule: `git submodule update --init --recursive`
3. Install prototype deps: `cd prototypes && pnpm install`

## Updating elephant-ai reference

```bash
git submodule update --remote elephant-ai
git add elephant-ai
git commit -m "Update elephant-ai submodule"
```

## Cursor Slack Integration

This repo is connected to Cursor's Slack integration. Use `@Cursor` in Slack to trigger commands.

## Commands

- `@Cursor run research for [initiative]` - Analyze transcripts and extract insights
- `@Cursor run PM for [initiative]` - Create/update PRD
- `@Cursor run prototype for [initiative]` - Build Storybook prototype
EOF

echo ""
echo "📝 Creating .gitignore..."
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnpm-store/

# Build outputs
dist/
storybook-static/

# Environment
.env
.env.local
*.local.md

# OS
.DS_Store
Thumbs.db

# IDE
.idea/
*.swp
*.swo

# Logs
*.log
npm-debug.log*
EOF

echo ""
echo "📝 Updating Cursor rules for submodule reference..."
# Update rules to reference elephant-ai submodule
if [ -f ".cursor/rules/pm-copilot.mdc" ]; then
    sed -i '' 's|@web/src/|@elephant-ai/web/src/|g' .cursor/rules/*.mdc 2>/dev/null || true
    sed -i '' 's|@functions/src/|@elephant-ai/functions/src/|g' .cursor/rules/*.mdc 2>/dev/null || true
fi

echo ""
echo "🔧 Creating initial commit..."
git add .
git commit -m "Initial PM workspace setup with elephant-ai submodule"

echo ""
echo "================================================"
echo "✅ PM Workspace created at: $PM_REPO_PATH"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Create a PRIVATE GitHub repo:"
echo "   gh repo create $PM_REPO_NAME --private"
echo "   OR create at: https://github.com/new"
echo ""
echo "2. Push to GitHub:"
echo "   cd $PM_REPO_PATH"
echo "   git remote add origin git@github.com:$GITHUB_USERNAME/$PM_REPO_NAME.git"
echo "   git push -u origin main"
echo ""
echo "3. Connect to Cursor Slack:"
echo "   - Open Cursor Settings → Integrations"
echo "   - Connect Slack (if not already)"
echo "   - Select '$PM_REPO_NAME' as the default repo for Background Agents"
echo ""
echo "4. Test from Slack:"
echo "   @Cursor what files are in this repository?"
echo ""
echo "5. (Optional) Remove local PM files from elephant-ai:"
echo "   rm -rf $ELEPHANT_AI_PATH/.pm-workspace"
echo "   rm -rf $ELEPHANT_AI_PATH/.cursor/commands"
echo "   rm -rf $ELEPHANT_AI_PATH/.cursor/rules"
echo "   rm -rf $ELEPHANT_AI_PATH/prototypes"
echo ""
echo "6. Set up auto-sync for submodule:"
echo "   Copy the GitHub Action workflow:"
echo "   mkdir -p $PM_REPO_PATH/.github/workflows"
echo "   cp $ELEPHANT_AI_PATH/.pm-workspace/scripts/github-actions/sync-submodule.yml \\"
echo "      $PM_REPO_PATH/.github/workflows/"
echo "   git add .github && git commit -m 'Add submodule auto-sync' && git push"
echo ""
echo "   This will automatically update elephant-ai submodule daily at 6am UTC."
echo ""
echo "🎉 Your PM work is now separate from the dev team's repo!"

