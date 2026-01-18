# Save Your Work

Create atomic commits with proper conventional commit messages.

## Usage

- `/save` - Save all changes with auto-generated message
- `/save [message]` - Save with a custom commit message
- `/save --amend` - Amend the previous commit (add changes to last commit)

## What This Does

1. Validates you're on a feature branch (not main)
2. Checks for changes to commit
3. Creates an atomic commit with conventional format
4. Pushes to your branch on GitHub
5. Checks CI status (if PR exists for this branch)

## Process

### Step 1: Check Current Branch

```bash
cd /Users/tylersahagun/Source/elmer
BRANCH=$(git branch --show-current)
echo "You're on branch: $BRANCH"
```

If branch is `main`, **STOP and create a feature branch**:
```
🛑 You're on the main branch!

Direct commits to main are not allowed. Create a feature branch first:

  /branch [feature-name]

Examples:
  /branch user-onboarding
  /branch fix/login-bug
  /branch proto/dashboard

This keeps our git history clean and enables proper code review.
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

### Step 4: Generate Commit Message (Conventional Format)

Format: `type(scope): description`

If user provided a message, parse and format it. Otherwise, auto-generate:

**Auto-detection logic:**
| Changed Files | Type | Scope | Message |
|---------------|------|-------|---------|
| `prototypes/src/components/` | `proto` | component name | `proto(ComponentName): update prototype` |
| `.cursor/commands/` | `chore` | `commands` | `chore(commands): update workspace commands` |
| `.cursor/rules/` | `chore` | `rules` | `chore(rules): update workspace rules` |
| `elmer-docs/initiatives/` | `docs` | initiative name | `docs(initiative): update documentation` |
| `elmer-docs/research/` | `docs` | `research` | `docs(research): add research notes` |
| `.github/workflows/` | `ci` | - | `ci: update workflow` |
| `orchestrator/` | `feat` or `fix` | `orchestrator` | `feat(orchestrator): update` |
| Mixed changes | `chore` | - | `chore: update workspace files` |

**User-provided message parsing:**
- If already formatted (`feat: xyz`), use as-is
- If plain text, infer type from context and format
- Example: "add login button" → `feat(ui): add login button`

**Commit message requirements:**
- Must be lowercase (except proper nouns)
- No period at the end
- Max 72 characters for the subject line
- Imperative mood ("add" not "added")

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

### Step 7: Check CI Status (using GitHub CLI)

After pushing, check if there's a PR for this branch and show CI status:

```bash
BRANCH=$(git branch --show-current)

# Check if PR exists for this branch
PR_NUMBER=$(gh pr list --head "$BRANCH" --json number --jq '.[0].number' 2>/dev/null)

if [ -n "$PR_NUMBER" ]; then
    # PR exists - check CI status
    echo "📋 PR #$PR_NUMBER exists - checking CI..."
    
    # Get the latest workflow runs for this branch
    gh run list --branch "$BRANCH" --limit 3 --json status,conclusion,name,databaseId \
        --jq '.[] | "\(.status) \(.conclusion // "pending") \(.name)"'
else
    echo "ℹ️  No PR yet - CI will run when you create one with /share"
fi
```

**CI Status Display:**

If PR exists and CI is running:
```
📋 PR #42 exists - checking CI...

| Workflow | Status |
|----------|--------|
| CI | 🔄 in_progress |
| PR Standards | ✅ completed (success) |

💡 CI is running. Check back in a few minutes or view at:
   https://github.com/tylersahagun/elmer/actions
```

If PR exists and CI completed:
```
📋 PR #42 - CI Status:

| Workflow | Status |
|----------|--------|
| CI | ✅ success |
| PR Standards | ✅ success |

All checks passing! Ready to merge when approved.
```

If PR exists and CI failed:
```
📋 PR #42 - CI Status:

| Workflow | Status |
|----------|--------|
| CI | ❌ failure |
| PR Standards | ✅ success |

⚠️  CI failed! View details:
   gh run view [run-id] --log-failed
```

If no PR exists:
```
ℹ️  No PR yet for branch 'fix/reduce-polling-frequency'
   CI will run automatically when you create a PR with /share
```

### Step 8: Success Message

**If no PR exists:**
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
║  ℹ️  No PR yet - CI will run when you /share      ║
║                                                   ║
║  Next steps:                                      ║
║  • Keep working and /save again anytime           ║
║  • Run /share when ready for review               ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
```

**If PR exists with CI passing:**
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
║  📋 PR #[number] CI Status:                       ║
║     ✅ CI - success                               ║
║     ✅ PR Standards - success                     ║
║                                                   ║
║  All checks passing! Ready for review.            ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
```

**If PR exists with CI running:**
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
║  📋 PR #[number] CI Status:                       ║
║     🔄 CI - in_progress                           ║
║     ✅ PR Standards - success                     ║
║                                                   ║
║  CI is running... check back in a few minutes.    ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
```

**If PR exists with CI failed:**
```
╔═══════════════════════════════════════════════════╗
║              ✅ Work Saved (CI Failed!)           ║
╠═══════════════════════════════════════════════════╣
║                                                   ║
║  Message: [commit message]                        ║
║  Branch:  [branch name]                           ║
║  Files:   [X] files changed                       ║
║                                                   ║
║  Your work is safely backed up on GitHub.         ║
║                                                   ║
║  📋 PR #[number] CI Status:                       ║
║     ❌ CI - failure                               ║
║     ✅ PR Standards - success                     ║
║                                                   ║
║  ⚠️  CI failed! View logs with:                   ║
║     gh run view [run-id] --log-failed             ║
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
cd /Users/tylersahagun/Source/elmer
```

## Prerequisites

This command uses the GitHub CLI (`gh`) to check CI status. If not installed:

```bash
# macOS
brew install gh

# Then authenticate
gh auth login
```

If `gh` is not available, the CI check step will be skipped and the save will still work.

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

### CI Check Failed

If the `gh` CLI command fails (not authenticated, rate limited, etc.):
```
⚠️ Couldn't check CI status (gh CLI error)

Your code is saved and pushed successfully.
Check CI manually at: https://github.com/tylersahagun/elmer/actions
```

### Viewing CI Logs

To view detailed CI logs when a check fails:
```bash
# List recent runs
gh run list --branch $(git branch --show-current)

# View a specific run's logs
gh run view [RUN_ID]

# View only failed logs
gh run view [RUN_ID] --log-failed

# Watch a running workflow
gh run watch [RUN_ID]
```

## Atomic Commit Guidelines

### What is an Atomic Commit?

An atomic commit is a single, focused change that:
- Does ONE thing
- Can be described in one sentence
- Can be reverted without breaking other features
- Makes sense on its own

### Good vs Bad Examples

| ❌ Bad (Too Big) | ✅ Good (Atomic) |
|------------------|------------------|
| "update everything" | "feat(ui): add Button component" |
| "fix bugs and add features" | "fix(auth): resolve login redirect" |
| "WIP" | "docs: add API reference" |

### When to Commit

Commit after completing each logical unit:
- ✅ Finished a component → commit
- ✅ Fixed a bug → commit  
- ✅ Added a feature → commit
- ✅ Updated documentation → commit

### Tips

- **Commit often** - Smaller commits are easier to review and revert
- **One purpose per commit** - If you're using "and", split it up
- **Review before committing** - Use `git diff` to check what you're committing
- **Don't mix refactors with features** - Separate them into different commits
