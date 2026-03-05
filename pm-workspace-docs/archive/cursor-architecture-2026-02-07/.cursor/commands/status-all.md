# Status All Command

Generate comprehensive portfolio status report across ALL initiatives.

**Applies:** `portfolio-status` skill

## Usage

```
/status-all                    # Full portfolio report
/status-all --priority P0      # Only P0 initiatives
/status-all --phase build      # Only initiatives in build phase
/status-all --stale            # Only stale/at-risk initiatives
/status-all --json             # Output JSON format only
/status-all --no-save          # Don't save report to file
```

## What It Does

Unlike `/status [name]` (one initiative) or `/roadmap` (high-level overview), `/status-all` provides:

1. **Artifact Gap Matrix** - See what's missing across ALL initiatives at once
2. **Prioritized Action Queue** - Ordered list of what to do next
3. **Health Scoring** - Quantified portfolio health with trends
4. **Stale Detection** - Surface initiatives that need attention
5. **Graduation Readiness** - Which initiatives can advance phases?

## Output

### Report Sections

1. **Executive Summary** - Initiative counts, priority breakdown, attention needed
2. **Attention Required** - Stale, blocked, or at-risk initiatives
3. **Artifact Gap Matrix** - Visual grid of missing/complete artifacts
4. **Ready to Advance** - Initiatives that can move to next phase
5. **Prioritized Action Queue** - Top 10 actions ranked by impact
6. **Phase Distribution** - Balance of work across phases
7. **Trends** - Comparison to last status check
8. **All Initiatives** - Complete table with status

### Health Score (0-100)

Calculated from:

- No blocked initiatives (25 pts)
- Artifact completeness (25 pts)
- No stale initiatives (20 pts)
- Phase distribution balance (15 pts)
- Jury pass rates (15 pts)

### Files Saved

```
pm-workspace-docs/status/
├── status-all-YYYY-MM-DD.md     # Human-readable report
├── status-all-YYYY-MM-DD.json   # Machine-readable data
└── history.json                  # Trend tracking
```

## Options

| Option                                               | Description                                       |
| ---------------------------------------------------- | ------------------------------------------------- |
| `--priority P0\|P1\|P2\|P3`                          | Filter to specific priority level                 |
| `--phase discovery\|define\|build\|validate\|launch` | Filter to specific phase                          |
| `--stale`                                            | Only show stale (>14 days) or at-risk initiatives |
| `--json`                                             | Output JSON format only (no markdown)             |
| `--no-save`                                          | Display report but don't save to file             |

## Examples

### Daily Standup Check

```
/status-all --stale
```

Shows only initiatives needing attention.

### P0 Focus Review

```
/status-all --priority P0
```

Shows only highest-priority initiatives with full detail.

### Build Phase Check

```
/status-all --phase build
```

Shows all initiatives in build phase - are prototypes complete?

### Export for Automation

```
/status-all --json
```

Outputs structured JSON for scripts or dashboards.

## Data Sources

- `pm-workspace-docs/initiatives/*/` - All initiative folders
- `pm-workspace-docs/initiatives/*/_meta.json` - Initiative metadata
- `pm-workspace-docs/roadmap/roadmap.json` - Roadmap data
- `pm-workspace-docs/signals/_index.json` - Linked signals
- `pm-workspace-docs/status/history.json` - Previous snapshots

## Follow-Up Commands

Based on the report, common next actions:

| Finding           | Suggested Command                                   |
| ----------------- | --------------------------------------------------- |
| Initiative stale  | `/status [name]` - Deep dive on specific initiative |
| Missing research  | `/research [name]` - Gather user evidence           |
| Missing PRD       | `/pm [name]` - Create requirements                  |
| Missing prototype | `/proto [name]` - Build prototype                   |
| Jury failed       | `/iterate [name]` - Address feedback                |
| Ready for launch  | `/share` - Create PR for review                     |
| Phase imbalance   | `/roadmap` - Review priorities                      |

## When to Use

- **Daily**: Quick check with `--stale` to catch blockers
- **Weekly**: Full report to track portfolio health
- **Planning**: Filter by priority or phase for focused review
- **Standup**: Share artifact matrix with team
