# Update Your Workspace

Get the latest changes from the team and update the elephant-ai codebase.

## Usage

- `/update` - Pull all updates and sync submodules

## What This Does

1. Saves any uncommitted changes (stash)
2. Updates main branch with latest team changes
3. Updates elephant-ai submodule to latest version
4. Brings your branch up to date
5. Restores your uncommitted changes

## Process

### Step 1: Check for Uncommitted Changes

```bash
cd /Users/tylersahagun/Source/pm-workspace
STASHED=false
if [ -n "$(git status --porcelain)" ]; then
    echo "📦 Saving your uncommitted changes temporarily..."
    git stash push -m "auto-stash before update"
    STASHED=true
fi
```

### Step 2: Update Main Branch

```bash
CURRENT_BRANCH=$(git branch --show-current)
git fetch origin main
git checkout main
git pull origin main
```

### Step 3: Update Elephant-AI Submodule

```bash
git submodule update --remote elephant-ai
```

If there were submodule updates, commit them:
```bash
if [ -n "$(git status --porcelain elephant-ai)" ]; then
    git add elephant-ai
    git commit -m "chore: update elephant-ai submodule"
fi
```

### Step 4: Return to Your Branch and Rebase

```bash
git checkout "$CURRENT_BRANCH"
git rebase main
```

### Step 5: Restore Uncommitted Changes

```bash
if [ "$STASHED" = true ]; then
    echo "📦 Restoring your uncommitted changes..."
    git stash pop
fi
```

### Step 6: Update Dependencies (if needed)

Check if package-lock.json changed:
```bash
cd elephant-ai
if git diff HEAD~1 --name-only | grep -q "package-lock.json"; then
    echo "📦 New dependencies detected, installing..."
    npm install
fi
cd ..
```

### Step 7: Success Message

```
╔═══════════════════════════════════════════════════════════╗
║                 ✅ Workspace Updated!                     ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  ✓ Main branch updated                                    ║
║  ✓ elephant-ai synced to latest                           ║
║  ✓ Your branch rebased on main                            ║
║  [✓ Dependencies updated] (if applicable)                 ║
║  [✓ Uncommitted changes restored] (if applicable)         ║
║                                                           ║
║  You're ready to keep working!                            ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

## Handling Conflicts

If rebase encounters conflicts:

```
⚠️ There's a conflict between your changes and the team's updates.

Don't panic! Here's what happened:
- Someone else modified the same file(s) you did
- Git needs you to decide which version to keep

Conflicted files:
[list files]

Options:
1. Ask for help - I can try to resolve simple conflicts
2. Keep YOUR version: git checkout --ours [file]
3. Keep THEIR version: git checkout --theirs [file]
4. Abort and go back: git rebase --abort

What would you like to do?
```

### Auto-resolve Simple Conflicts

If conflicts are only in non-code files (like .md files), offer to resolve:

```bash
# For markdown files, prefer the user's version
git checkout --ours "*.md"
git add .
git rebase --continue
```

### If Auto-resolve Fails

```
❌ I couldn't resolve this conflict automatically.

The safest option is to ask Tyler or a team member for help.

To undo everything and go back to where you started:
git rebase --abort
```

## Troubleshooting

### "Submodule update failed"

```
⚠️ Couldn't update elephant-ai submodule

This usually means:
1. You don't have access to the elephant-ai repo
2. Network issues

Try:
- Check your internet connection
- Run: git submodule update --init --recursive
- Contact Tyler if you need repo access
```

### "Rebase failed"

If rebase completely fails:
```bash
git rebase --abort
git checkout main
git pull origin main
git checkout -b "collab/[username]-$(date +%Y-%m-%d)-fresh"
```

This creates a fresh branch from updated main.

## When to Run Update

- Before starting new work each day
- Before running /share to create a PR
- When someone tells you "I just pushed changes"
- If /save fails with a conflict message
