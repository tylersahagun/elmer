# Create Feature Branch

Create a properly named feature branch from the latest main.

## Usage

- `/branch [name]` - Create a feature branch (default: `feat/`)
- `/branch fix/[name]` - Create a fix branch
- `/branch proto/[name]` - Create a prototype branch
- `/branch docs/[name]` - Create a documentation branch

## What This Does

1. Stashes any uncommitted changes
2. Updates main to latest
3. Creates a new branch with proper naming
4. Restores your uncommitted changes

## Process

### Step 1: Parse Branch Name

Extract the type and name from input:

```javascript
// If user provides type prefix, use it
// Otherwise, default to "feat/"
// Examples:
//   "user-onboarding" → "feat/user-onboarding"
//   "fix/login-bug" → "fix/login-bug"
//   "proto/dashboard" → "proto/dashboard"
```

Valid prefixes: `feat/`, `fix/`, `docs/`, `refactor/`, `chore/`, `proto/`, `research/`

### Step 2: Validate Branch Name

```bash
# Ensure name follows conventions:
# - lowercase only
# - hyphens for spaces
# - no special characters except hyphen
# - 3-50 characters after prefix

BRANCH_NAME="[parsed-name]"

# Validate
if [[ ! "$BRANCH_NAME" =~ ^[a-z0-9-]+$ ]]; then
    echo "❌ Invalid branch name. Use lowercase letters, numbers, and hyphens only."
    exit 1
fi
```

### Step 3: Check Current State

```bash
cd /Users/tylersahagun/Source/elmer

# Check for uncommitted changes
STASHED=false
if [ -n "$(git status --porcelain)" ]; then
    echo "📦 Stashing uncommitted changes..."
    git stash push -m "auto-stash before branch switch"
    STASHED=true
fi

# Check if branch already exists
if git show-ref --verify --quiet "refs/heads/$BRANCH_NAME"; then
    echo "⚠️ Branch '$BRANCH_NAME' already exists."
    echo "Switch to it with: git checkout $BRANCH_NAME"
    exit 1
fi
```

### Step 4: Update Main and Create Branch

```bash
# Fetch latest
git fetch origin main

# Switch to main and update
git checkout main
git pull origin main

# Create new branch
git checkout -b "$BRANCH_NAME"
```

### Step 5: Restore Stashed Changes

```bash
if [ "$STASHED" = true ]; then
    echo "📦 Restoring your uncommitted changes..."
    git stash pop
fi
```

### Step 6: Success Message

```
╔═══════════════════════════════════════════════════════════╗
║               🌿 Branch Created!                          ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  Branch: [branch-name]                                    ║
║  Based on: main (latest)                                  ║
║                                                           ║
║  You're ready to start working!                           ║
║                                                           ║
║  Workflow:                                                ║
║  1. Make changes                                          ║
║  2. /save "description" (commit often!)                   ║
║  3. /share when ready for review                          ║
║                                                           ║
║  💡 Tip: Keep commits atomic - one change per commit      ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

## Branch Type Reference

| Type | When to Use | Example |
|------|-------------|---------|
| `feat/` | New features, capabilities | `feat/user-onboarding` |
| `fix/` | Bug fixes | `fix/login-redirect` |
| `docs/` | Documentation updates | `docs/api-reference` |
| `refactor/` | Code improvements | `refactor/auth-module` |
| `chore/` | Dependencies, config | `chore/update-deps` |
| `proto/` | UI prototypes | `proto/dashboard-v2` |
| `research/` | Exploration work | `research/ai-features` |

## Error Handling

### Branch Already Exists

```
⚠️ Branch 'feat/user-onboarding' already exists.

Options:
1. Switch to it: git checkout feat/user-onboarding
2. Delete and recreate: git branch -D feat/user-onboarding
3. Choose a different name: /branch user-onboarding-v2
```

### Uncommitted Changes Conflict

```
⚠️ Your stashed changes conflict with the branch.

Your changes are safe in the stash. Options:
1. View stash: git stash show -p
2. Apply anyway: git stash pop (may need manual merge)
3. Drop stash: git stash drop (loses changes)
```

### Not on Main

If already on a feature branch:

```
⚠️ You're already on branch 'feat/old-feature'.

Creating new branch from main instead.
Your uncommitted changes will be moved to the new branch.
```

## Tips

- **Name matches initiative**: If working on an initiative, use its name
  - Initiative: `user-onboarding` → Branch: `feat/user-onboarding`
- **Short but descriptive**: 3-5 words max
- **Be specific**: `fix/button-hover` not `fix/button`
- **One feature per branch**: Don't mix unrelated changes
