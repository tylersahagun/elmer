# Roadmap View

Display and manage the product roadmap.

**Applies:** `roadmap-analysis` skill

## Usage

- `roadmap` - Show roadmap summary
- `roadmap by-phase` - Group initiatives by lifecycle phase
- `roadmap by-persona` - Group initiatives by target persona
- `roadmap by-pillar` - Group initiatives by strategic pillar
- `roadmap stale` - Show items needing attention (>14 days)
- `roadmap refresh` - Regenerate all roadmap files

## Data Sources

- **Source of truth:** `pm-workspace-docs/roadmap/roadmap.json`
- **Narrative view:** `pm-workspace-docs/roadmap/roadmap.md`
- **Gantt chart:** `pm-workspace-docs/roadmap/roadmap-gantt.md`
- **Kanban board:** `pm-workspace-docs/roadmap/roadmap-kanban.md`

## Subcommands

### `roadmap` (default)

Show high-level summary from `roadmap.json`:

```markdown
# Product Roadmap

**Last Updated:** [generated_at]
**Total Initiatives:** [count]

## Health Overview
| Status | Count |
|--------|-------|
| ✅ On Track | X |
| ⚠️ At Risk | X |
| 🚫 Blocked | X |
| 💤 Stale | X |

## Phase Distribution
| Phase | Count |
|-------|-------|
| Discovery | X |
| Define | X |
| Build | X |
| Validate | X |
| Launch | X |

## Top Priorities (P0/P1)
1. [Initiative 1] - [phase] - [status]
2. [Initiative 2] - [phase] - [status]

## Attention Needed
- [Stale or blocked items]

## Quick Actions
- View details: `/status [name]`
- Refresh data: `/roadmap refresh`
- Full report: Open `roadmap/roadmap.md`
```

### `roadmap by-phase`

Group and display by phase:

```markdown
## Discovery (X initiatives)
| Initiative | Owner | Priority | Days | Status |
|------------|-------|----------|------|--------|

## Define (X initiatives)
...

## Build (X initiatives)
...

## Validate (X initiatives)
...

## Launched (X initiatives)
...
```

### `roadmap by-persona`

Group and display by target persona:

```markdown
## Sales Rep (X initiatives)
| Initiative | Phase | Priority | Status |
|------------|-------|----------|--------|

## Sales Leader (X initiatives)
...

## CSM (X initiatives)
...

## RevOps (X initiatives)
...
```

### `roadmap by-pillar`

Group and display by strategic pillar:

```markdown
## Customer Trust (X initiatives)
| Initiative | Phase | Priority | Status |
|------------|-------|----------|--------|

## Data Knowledge (X initiatives)
...

## Trend Visibility (X initiatives)
...
```

### `roadmap stale`

Show items that need attention:

```markdown
# Stale Items Report

## Stale (>14 days in current phase)
| Initiative | Phase | Days | Last Activity |
|------------|-------|------|---------------|
| [name] | build | 18 | 2026-01-01 |

## At Risk (7-14 days)
| Initiative | Phase | Days | Last Activity |
|------------|-------|------|---------------|

## Blocked
| Initiative | Blocker | Since |
|------------|---------|-------|

## Missing Owner
| Initiative | Phase | Priority |
|------------|-------|----------|

## Recommended Actions
1. Review [initiative] - stale for 18 days
2. Assign owner to [initiative]
3. Resolve blocker on [initiative]
```

### `roadmap refresh`

Regenerate all roadmap files:

1. Run `python pm-workspace-docs/scripts/generate-roadmap.py`
2. Save snapshot to `roadmap/snapshots/YYYY-MM-DD.json`
3. Report changes from last snapshot:
   - New initiatives added
   - Phase changes
   - Status changes

## Gemini/AI Integration

The `roadmap.json` file is designed for direct use with AI:

```
Paste roadmap.json into Gemini and ask:
- "What initiatives are at risk?"
- "What should I focus on this week?"
- "Show me the critical path to launching X"
- "What's blocking progress?"
```

## Visualization Files

### roadmap-gantt.md
Contains a Mermaid Gantt chart that renders in:
- GitHub/GitLab markdown
- Obsidian
- VS Code preview
- Notion (with Mermaid block)

### roadmap-kanban.md
Contains a table-based kanban view showing:
- Initiatives grouped by phase
- Status indicators
- Key details for each

## Refresh Trigger

Roadmap should be refreshed when:
- Initiative phase changes
- New initiative created
- Initiative status changes
- Weekly (manual or automated)

Consider adding `/roadmap refresh` to end of:
- `/hypothesis commit`
- `/pm` command
- `/validate` command
