# Sync Linear Command

Synchronize Linear project and cycle data with PM workspace initiatives.

**Applies:** `linear-sync` skill

## Usage

```
/sync-linear                    # Sync all active work
/sync-linear --cycle            # Current cycle only (Development team)
/sync-linear --project [name]   # Specific project by name
/sync-linear --team ASK|VAN     # Specific team's work
/sync-linear --map              # Suggest initiative mappings
/sync-linear --json             # Output JSON format
```

## What It Does

1. **Fetches Linear Data** via MCP tools:
   - Active cycle progress (issues completed vs total)
   - In-progress and in-review issues
   - Project issue counts and states

2. **Maps to Initiatives** using `linear_project_id` in `_meta.json`

3. **Updates Dev Activity** in each mapped initiative's metadata

4. **Generates Status Report** showing:
   - Cycle progress percentage
   - Work grouped by initiative
   - Unlinked work (issues without initiative mapping)

## Options

| Option                      | Description                                   |
| --------------------------- | --------------------------------------------- |
| (none)                      | Full sync of all teams and projects           |
| `--cycle`                   | Focus on current cycle progress only          |
| `--project [name]`          | Sync specific project by name or ID           |
| `--team ASK\|VAN\|CEX\|EPD` | Sync specific team's issues                   |
| `--map`                     | Show suggested initiative-to-project mappings |
| `--json`                    | Output JSON format only                       |

## Teams Reference

| Team            | Key | Focus                 |
| --------------- | --- | --------------------- |
| Development     | ASK | Core development work |
| Vanguard        | VAN | Experimental features |
| Core Experience | CEX | UX/UI polish          |
| Product         | EPD | Product direction     |

## Output

### Default Output

```markdown
# Linear Sync Report

**Generated:** 2026-01-23 12:00
**Cycle:** Cycle 79 (28% complete)

## Cycle Progress

- **Total Issues:** 50
- **Completed:** 14
- **In Progress:** 10
- **In Review:** 3

## Work by Initiative

### Global Chat

- Total: 57 issues
- Completed: 23 (40%)
- In Progress: 8

Active:

- [ ] ASK-4592: Global Chat first time experience (@Skylar)
- [ ] ASK-4477: New condensed chat input (@Skylar)

### Call Import Engine

- Total: 12 issues
- Completed: 3 (25%)
- In Progress: 2

## Unlinked Work

Issues not mapped to any initiative:

- [ ] ASK-4583: BBL (@Matt)
- [ ] ASK-4575: Engagement card re-design (@Adam)
```

### Files Updated

- `pm-workspace-docs/initiatives/*/meta.json` - dev_activity updated
- `pm-workspace-docs/status/dev-status-YYYY-MM-DD.md` - Status report saved

## Examples

### Daily Standup Check

```
/sync-linear --cycle
```

Quick view of current cycle progress.

### Specific Project Deep Dive

```
/sync-linear --project "Global Chat"
```

All issues for Global Chat project.

### Map New Initiatives

```
/sync-linear --map
```

Shows suggestions for unmapped initiatives.

## Data Flow

```
Linear API
    │
    ▼
linear_getActiveCycle / linear_searchIssues
    │
    ▼
Map to initiatives via linear_project_id
    │
    ▼
Update _meta.json dev_activity
    │
    ▼
Generate dev-status report
```

## Integration

### With Portfolio Status

After running `/sync-linear`, the `/status-all` command will include:

- Dev progress column in artifact matrix
- Initiative health factoring in dev activity
- Alerts for initiatives with stale docs but high activity

### With GitHub Sync

Use `/sync-dev` to combine Linear + GitHub data into unified report.

## Troubleshooting

### "Linear MCP tools not available"

Ensure Linear integration is configured in Cursor MCP settings.

### "No mapped initiatives"

Run `/sync-linear --map` to see suggested mappings, then add `linear_project_id` to initiative `_meta.json` files.

### Stale Data

Linear data is fetched fresh on each run. If data seems stale, verify Linear project IDs are correct.
