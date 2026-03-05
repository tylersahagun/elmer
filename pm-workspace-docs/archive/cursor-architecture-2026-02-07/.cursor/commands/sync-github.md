# Sync GitHub Command

Synchronize GitHub PR and merge data with PM workspace initiatives.

**Applies:** `github-sync` skill

## Usage

```
/sync-github                    # Last 24 hours of merged PRs
/sync-github --since yesterday  # Since specific time
/sync-github --week             # Last 7 days
/sync-github --release-notes    # Generate formatted release notes
/sync-github --json             # Output JSON format
```

## What It Does

1. **Fetches Merged PRs** via `gh` CLI:
   - PR titles, authors, merge times
   - Branch names and labels
   - Commit messages (for Linear refs)

2. **Maps to Initiatives** using:
   - PR labels (`initiative:global-chat`)
   - Branch prefixes (`feat/global-chat-*`)
   - Linear issue references in commits

3. **Updates Dev Activity** in each mapped initiative's metadata

4. **Generates Release Summary** showing:
   - PRs grouped by initiative
   - Changelog categorization
   - Unlinked changes

## Options

| Option            | Description                                       |
| ----------------- | ------------------------------------------------- |
| (none)            | Last 24 hours of merged PRs                       |
| `--since [date]`  | PRs merged since date (YYYY-MM-DD or "yesterday") |
| `--week`          | Last 7 days                                       |
| `--release-notes` | Format output as release notes                    |
| `--json`          | Output JSON format only                           |

## Output

### Default Output

```markdown
# GitHub Sync Report

**Generated:** 2026-01-23 18:00
**Period:** Last 24 hours
**PRs Merged:** 8

## By Initiative

### Global Chat (3 PRs)

- #128: Improve error handling (@palmer)
- #125: Add keyboard shortcuts (@dylan)
- #123: Fix context window bug (@skylar)

### CRM Agent (2 PRs)

- #127: Agent permission fixes (@adam)
- #124: HubSpot app card POC (@palmer)

### Unlinked (3 PRs)

- #129: CI improvements (@jason)
- #126: Dependency updates (@matt)
- #122: README updates (@tyler)

## Changelog

### Features

- Added keyboard shortcuts (#125)
- HubSpot app card POC (#124)

### Bug Fixes

- Fixed context window bug (#123)
- Fixed agent permissions (#127)

### Improvements

- Improved error handling (#128)

### Maintenance

- CI improvements (#129)
- Dependency updates (#126)
```

### Release Notes Format (`--release-notes`)

```markdown
# Release Notes - January 23, 2026

## Highlights

- **Global Chat**: Keyboard shortcuts and improved error handling
- **CRM Agent**: HubSpot app card integration

## Changes

### Features

- [Global Chat] Added keyboard shortcuts for common actions (#125)
- [CRM Agent] HubSpot app card proof of concept (#124)

### Bug Fixes

- [Global Chat] Fixed context window not updating after meeting (#123)
- [CRM Agent] Fixed agent permission handling (#127)

### Improvements

- [Global Chat] Improved error handling and recovery (#128)

---

**Full Changelog**: https://github.com/askelephant/elephant-ai/compare/...
```

## Files Updated

- `pm-workspace-docs/initiatives/*/meta.json` - dev_activity updated
- `pm-workspace-docs/signals/releases/YYYY-MM-DD-release.md` - Release signal saved

## Examples

### Daily Ship Check

```
/sync-github
```

What shipped in the last 24 hours.

### Weekly Review

```
/sync-github --week
```

Full week of merged PRs for sprint review.

### Generate Release Notes

```
/sync-github --release-notes --since 2026-01-20
```

Formatted release notes for external sharing.

## Mapping Configuration

Add to initiative `_meta.json` for automatic mapping:

```json
{
  "github_labels": ["initiative:global-chat"],
  "github_branch_prefix": "feat/global-chat"
}
```

PRs matching labels or branch prefix will be mapped to the initiative.

## Integration

### With Linear Sync

Use `/sync-dev` to combine GitHub + Linear into unified report:

- Linear issues → work planned/in-progress
- GitHub PRs → work shipped
- Complete planning-to-delivery pipeline

### With Portfolio Status

After syncing, `/status-all` will include:

- GitHub activity in artifact matrix
- Alerts for initiatives with shipping but stale docs

## Troubleshooting

### "gh CLI not found"

Install with: `brew install gh`

### "Not authenticated"

Run: `gh auth login`

### "No PRs found"

Try expanding date range: `/sync-github --week`

### PRs not mapping correctly

1. Check `_meta.json` has `github_labels` or `github_branch_prefix`
2. Verify PR has matching label or branch name
3. Check for Linear issue refs in PR body/commits
