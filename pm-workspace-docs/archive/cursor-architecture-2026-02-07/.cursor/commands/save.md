# Save Your Work

Simple command to save and push all your changes. No git knowledge required.

## Usage

- `/save` - Save all changes with auto-generated message
- `/save [message]` - Save with a custom message (optional)

## What This Does

1. Checks if you have any changes to save
2. Stages all your changes
3. Commits with a descriptive message
4. Pushes to your branch on GitHub

## Process

### Step 1: Check Current Branch

```bash
cd /Users/tylersahagun/Source/pm-workspace
BRANCH=$(git branch --show-current)
echo "You're on branch: $BRANCH"
```

If branch is `main`, warn the user:
```
⚠️ You're on the main branch! 

Run /setup first to create your personal branch, 
or run: git checkout -b collab/[your-name]-$(date +%Y-%m-%d)
```

### Step 2: Check for Changes

```bash
git status --porcelain
```

If empty, tell the user:
```
✨ No changes to save - you're all caught up!
```

### Step 3: Show What Will Be Saved

```bash
git status --short
```

Display to user:
```
📝 Changes to save:
[show git status output]
```

### Step 4: Generate Commit Message

If user provided a message, use it. Otherwise, auto-generate based on files changed:

**Logic for auto-message:**
- If changes in `elephant-ai/web/src/components/prototypes/` → "Update [FolderName] prototype"
- If changes in `.cursor/commands/` → "Update workspace commands"
- If changes in `pm-workspace-docs/initiatives/` → "Update [initiative-name] documentation"
- If changes in `pm-workspace-docs/research/` → "Add research notes"
- Otherwise → "Update workspace files"

### Step 5: Stage and Commit

```bash
git add -A
git commit -m "[generated or provided message]"
```

### Step 6: Push to Remote

```bash
git push origin $(git branch --show-current)
```

If push fails due to upstream, set it:
```bash
git push -u origin $(git branch --show-current)
```

### Step 7: Success Message

```
╔═══════════════════════════════════════════════════╗
║              ✅ Work Saved!                       ║
╠═══════════════════════════════════════════════════╣
║                                                   ║
║  Message: [commit message]                        ║
║  Branch:  [branch name]                           ║
║  Files:   [X] files changed                       ║
║                                                   ║
║  Your work is safely backed up on GitHub.         ║
║                                                   ║
║  Next steps:                                      ║
║  • Keep working and /save again anytime           ║
║  • Run /share when ready for review               ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
```

## Handling Submodule Changes

If there are changes in the `elephant-ai` submodule (prototype work):

```bash
# Check for submodule changes
cd elephant-ai
if [ -n "$(git status --porcelain)" ]; then
    git add -A
    git commit -m "[message]"
    git push origin $(git branch --show-current)
    cd ..
    git add elephant-ai
fi
cd /Users/tylersahagun/Source/pm-workspace
```

## Error Handling

### "Permission denied"

```
❌ Couldn't push to GitHub

You might not have permission to push to this repository.
Contact Tyler to be added as a collaborator.
```

### "Merge conflict"

```
⚠️ There's a conflict with changes from someone else.

Don't worry! Run /update to get their changes first,
then try /save again.

If you need help, ask Tyler or another team member.
```

### "No upstream branch"

This is automatically handled by setting the upstream on first push.

## Tips

- Save often! Small, frequent saves are better than big ones
- You can always see your save history on GitHub
- If something goes wrong, your work is safe - we can recover it
