# Share Your Work Command

Create a Pull Request to share prototypes and changes for review.

## Usage

```
/share
/share [title]
```

## Behavior

This is a thin wrapper around git commands. No subagent needed.

## Process

1. **Check branch** - Must be on feature branch (not main)
2. **Save changes** - Stage and commit any uncommitted work
3. **Push to remote** - `git push -u origin [branch]`
4. **Create PR** - Using `gh pr create` or provide URL

## Prerequisites

- Must be on a feature branch (not main)
- GitHub CLI (`gh`) recommended for auto-create

## Output

```
✅ Ready to Share!

Your changes are pushed and ready for review.

📋 Create your PR here:
[GitHub PR URL]

What happens next:
1. Click the link
2. Review changes
3. Add screenshots
4. Create Pull Request
5. Share with team

💡 Tip: Add screenshots of prototypes!
```

## Troubleshooting

### On main branch
Run `/setup` to create a feature branch.

### Auth issues
Install GitHub CLI: `brew install gh`
Login: `gh auth login`

### Conflicts
Run `/update` first to sync with main.

### PR already exists
New pushes automatically update the existing PR.
