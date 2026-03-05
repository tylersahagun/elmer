# Workspace Maintenance Command

Keep the PM workspace clean, organized, and synchronized.

## Usage

```
/maintain audit
/maintain fix
/maintain sync
/maintain clean
```

## Behavior

**Delegates to**: `workspace-admin` subagent

## Subcommands

### `audit` - Full Workspace Audit

Checks:

- **Structure** - Required folders, `_meta.json` presence, index validity
- **Consistency** - Phase matches files, schemas valid, indexes match files
- **Health** - Stale initiatives (>14d), stuck hypotheses (>30d), missing owners
- **Cleanup** - Empty folders, orphaned files, old snapshots

**Output:** `pm-workspace-docs/maintenance/latest-audit.md`

### `fix` - Auto-Fix Safe Issues

Safe to fix:

- Missing `_meta.json` (generate from files)
- Stale index files (regenerate)
- Missing `.gitkeep` files
- Invalid timestamps

**Not auto-fixed:** File deletions, phase changes, status changes

### `sync` - Regenerate Derived Files

Regenerates:

1. `roadmap/roadmap.json`
2. `roadmap/roadmap.md`
3. `roadmap/roadmap-gantt.md`
4. `roadmap/roadmap-kanban.md`
5. `hypotheses/_index.json`
6. `signals/_index.json`

### `clean` - Remove Orphaned Files

Candidates:

- Empty folders (except `.gitkeep`)
- Files not matching patterns
- Old snapshots (>30 days, keep 5)

**Requires explicit confirmation before removal.**

## Recommended Schedule

| Frequency           | Command           |
| ------------------- | ----------------- |
| Weekly              | `/maintain audit` |
| After major changes | `/maintain sync`  |
| Monthly             | `/maintain clean` |

## Next Steps

After audit:

- Auto-fix issues: `/maintain fix`
- Review manual items listed in report
