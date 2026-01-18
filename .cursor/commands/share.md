# Share Your Work

Create a Pull Request with a clean, single commit for review.

## Usage

- `/share` - Create a PR with auto-generated description
- `/share [title]` - Create a PR with a custom title
- `/share --no-squash` - Create PR without squashing (not recommended)

## What This Does

1. Saves any unsaved changes
2. **Squashes commits** into a single, well-formatted commit
3. Pushes your branch to GitHub
4. Creates a Pull Request for review
5. Provides a link to view and discuss

## Why Squash?

Single-commit PRs keep git history clean and make it easy to:
- Understand what each PR changed
- Revert changes if needed
- Navigate history with AI tools

## Process

### Step 1: Check Current Branch

```bash
cd /Users/tylersahagun/Source/elmer
BRANCH=$(git branch --show-current)
```

If on main, stop:

```
❌ You're on the main branch!

You need to be on your personal branch to share work.
Run /setup to create one, or check out an existing branch.
```

### Step 2: Save Any Unsaved Changes

```bash
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 You have unsaved changes. Saving them first..."
    git add -A
    git commit -m "chore: save changes before PR"
fi
```

### Step 3: Check Commit Count and Squash

```bash
COMMIT_COUNT=$(git rev-list --count origin/main..HEAD)
echo "📊 Branch has $COMMIT_COUNT commit(s)"

if [ $COMMIT_COUNT -gt 1 ]; then
    echo "🔄 Squashing $COMMIT_COUNT commits into one..."
    
    # Get all commit messages for the squash message
    MESSAGES=$(git log origin/main..HEAD --pretty=format:"- %s" --reverse)
    
    # Soft reset to main, keeping changes staged
    git reset --soft origin/main
    
    # Create single commit with combined message
    # Use the PR title or generate from branch name
    COMMIT_MSG="[PR_TITLE_OR_GENERATED]"
    git commit -m "$COMMIT_MSG" -m "Changes included:" -m "$MESSAGES"
    
    echo "✅ Commits squashed into one"
fi
```

**Squash commit message format:**
```
feat(scope): PR title or description

Changes included:
- Original commit 1
- Original commit 2
- Original commit 3
```

### Step 4: Push to GitHub

```bash
# Force push since we rewrote history (only safe on feature branches)
if [ $COMMIT_COUNT -gt 1 ]; then
    git push -u origin "$BRANCH" --force-with-lease
else
    git push -u origin "$BRANCH"
fi
```

### Step 4: Generate PR Description

Auto-generate based on what changed:

```markdown
## What's in this PR

[Auto-detect and list:]

- New/updated prototypes in elephant-ai/web/src/components/prototypes/
- Documentation changes in elmer-docs/
- Command/rule updates in .cursor/

## Preview

[If prototypes exist:]
Run Storybook locally to preview:
\`\`\`bash
cd elephant-ai && npm run storybook -w web
\`\`\`
Then navigate to Prototypes/ in the sidebar.

## Screenshots

[Leave placeholder for user to add]

## Notes

[Any context from recent commits]
```

### Step 5: Create Pull Request

Use the GitHub CLI if available, otherwise provide URL:

**Option A: GitHub CLI (gh)**

```bash
if command -v gh &> /dev/null; then
    gh pr create --title "[PR Title]" --body "[Generated description]" --base main
fi
```

**Option B: Generate URL**

```bash
REPO="tylersahagun/elmer"
TITLE=$(echo "[PR Title]" | sed 's/ /%20/g')
URL="https://github.com/${REPO}/compare/main...${BRANCH}?expand=1&title=${TITLE}"
echo "Open this URL to create your PR: $URL"
```

### Step 6: Success Message

```
╔═══════════════════════════════════════════════════════════════╗
║                    ✅ Ready to Share!                         ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  Your changes are pushed and ready for review.                ║
║                                                               ║
║  📋 Create your PR here:                                      ║
║  [GitHub PR URL]                                              ║
║                                                               ║
║  What happens next:                                           ║
║  1. Click the link above                                      ║
║  2. Review the changes shown                                  ║
║  3. Add any screenshots or notes                              ║
║  4. Click "Create Pull Request"                               ║
║  5. Share the PR link with your team                          ║
║                                                               ║
║  💡 Tip: Add screenshots of your prototypes to the PR!        ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
```

## What Reviewers Will See

The PR will show:

- All files you added or changed
- Visual diffs for code changes
- A preview link (once Chromatic is set up)

## After Creating the PR

### Getting Feedback

- Reviewers can leave comments on specific lines
- You'll get email/Slack notifications
- Check the PR page for any requested changes

### Making Changes After Review

If reviewers request changes:

1. Make the changes locally
2. Run `/save` to commit them
3. The PR automatically updates!

No need to create a new PR.

### Merging

Once approved:

1. Tyler or a lead will merge the PR
2. Your changes become part of main
3. Everyone gets them on next `/update`

## Troubleshooting

### "Authentication failed"

You may need to set up GitHub credentials:

- Install GitHub CLI: `brew install gh`
- Login: `gh auth login`

### "Branch has conflicts"

Run `/update` first to sync with main, then try `/share` again.

### PR Already Exists

If a PR already exists for this branch:

```
ℹ️ A PR already exists for this branch!

View it here: [existing PR URL]

Your new changes have been pushed to the existing PR.
```

## Tips

- Share early, share often - smaller PRs are easier to review
- Include context about what you're trying to achieve
- Screenshots make a huge difference for design work
- Tag specific people if you need their input
