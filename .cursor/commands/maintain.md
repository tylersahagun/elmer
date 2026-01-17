# Workspace Maintenance

Keep the PM workspace clean, organized, and synchronized.

## Usage

- `maintain audit` - Full workspace audit, report all issues
- `maintain fix` - Auto-fix safe issues
- `maintain sync` - Regenerate all derived files
- `maintain clean` - Remove orphaned files (with confirmation)

## Subcommands

### `maintain audit`

Run a comprehensive workspace audit and generate a report.

**Checks performed:**

#### Structure Integrity
- [ ] All required root folders exist
- [ ] Every initiative has `_meta.json`
- [ ] Every initiative has `research.md`
- [ ] Index files exist and are valid JSON
- [ ] No files outside defined structure

#### Data Consistency
- [ ] `_meta.json` phase matches file presence
- [ ] `_meta.json` schema is valid
- [ ] Hypothesis index matches hypothesis files
- [ ] Signal index matches signal files
- [ ] Roadmap reflects current initiative states

#### Health Checks
- [ ] No initiatives stale >14 days
- [ ] No hypotheses active >30 days without progress
- [ ] All P0/P1 initiatives have owners
- [ ] All blockers have descriptions
- [ ] No unlinked committed hypotheses

#### Cleanup Candidates
- [ ] Empty folders
- [ ] Orphaned files (not in expected locations)
- [ ] Old snapshots (>30 days)
- [ ] Duplicate content

**Output:** Save report to `elmer-docs/maintenance/latest-audit.md`

**Report format:**

```markdown
# Workspace Maintenance Audit

**Generated:** YYYY-MM-DD HH:MM
**Status:** ✅ Clean | ⚠️ X issues | ❌ X critical issues

## Summary

| Category | Status | Issues |
|----------|--------|--------|
| Structure Integrity | ✅/⚠️/❌ | X |
| Data Consistency | ✅/⚠️/❌ | X |
| Health Checks | ✅/⚠️/❌ | X |
| Cleanup Candidates | ✅/⚠️/❌ | X |

## Issues Found

### Critical (must fix)
1. [Issue description] - [location]

### Warning (should fix)
1. [Issue description] - [location]

### Info (optional)
1. [Issue description] - [location]

## Auto-Fixable

These can be fixed with `maintain fix`:
- [ ] [Issue 1]
- [ ] [Issue 2]

## Requires Human Decision

These need manual review:
- [ ] [Issue 1] - [why manual]
- [ ] [Issue 2] - [why manual]

## Historical Comparison

| Metric | Last Audit | This Audit | Change |
|--------|------------|------------|--------|
| Total Issues | X | Y | +/-Z |
| Initiatives | X | Y | +/-Z |
| Stale Items | X | Y | +/-Z |
```

### `maintain fix`

Automatically fix safe issues identified in audit.

**Safe to auto-fix:**
- Missing `_meta.json` (generate from files)
- Stale index files (regenerate)
- Missing `.gitkeep` files
- Invalid timestamps (set to now)

**Not auto-fixed (require confirmation):**
- File deletions
- Phase changes
- Status changes
- Moving files between folders

**Process:**
1. Run audit to identify issues
2. Filter to auto-fixable issues
3. Apply fixes one by one
4. Log each fix
5. Re-run audit to verify
6. Report results

### `maintain sync`

Regenerate all derived/computed files.

**Files regenerated:**
1. `roadmap/roadmap.json` - from all `_meta.json`
2. `roadmap/roadmap.md` - from `roadmap.json`
3. `roadmap/roadmap-gantt.md` - from `roadmap.json`
4. `roadmap/roadmap-kanban.md` - from `roadmap.json`
5. `hypotheses/_index.json` - from hypothesis files
6. `signals/_index.json` - from signal files

**Process:**
1. Run `python scripts/generate-roadmap.py`
2. Scan and rebuild index files
3. Save snapshot
4. Report what changed

### `maintain clean`

Remove orphaned and outdated files.

**Candidates for removal:**
- Empty folders (except those with `.gitkeep`)
- Files not matching expected patterns
- Old snapshots (>30 days, keep at least 5)
- Temporary files

**Process:**
1. Identify cleanup candidates
2. List all files to be removed
3. **Require explicit confirmation**
4. Remove files
5. Log removals
6. Update audit report

## Schema Reference

The audit uses `elmer-docs/maintenance/structure-schema.json` to validate:
- Required folders and files
- Valid phase and status values
- Stale thresholds
- File naming patterns

## Audit History

Previous audits are saved to:
`elmer-docs/maintenance/audit-history/YYYY-MM-DD-HHMM.md`

## Automation Suggestions

Consider running maintenance:
- Weekly: `maintain audit`
- After major changes: `maintain sync`
- Monthly: `maintain clean`

## Integration

The maintain command integrates with:
- `/roadmap refresh` - calls `maintain sync` internally
- `/hypothesis commit` - should trigger `maintain sync`
- `/status` - can flag maintenance issues

## Quick Reference

```
# See current state
maintain audit

# Fix what can be auto-fixed
maintain fix

# Regenerate computed files
maintain sync

# Clean up old files (careful!)
maintain clean
```
