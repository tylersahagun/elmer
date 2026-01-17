# Initiative Status

Show the current status of an initiative or all initiatives.

## Usage

- `status [initiative-name]` - Show detailed status for one initiative
- `status` or `status all` - Show summary of all initiatives
- `status stale` - Show only stale items (>14 days in phase)
- `status blocked` - Show only blocked items

## For Single Initiative

When given an initiative name, read `elmer-docs/initiatives/[name]/_meta.json` and display:

### Status Report Format

```markdown
# Status: [Initiative Name]

## Overview
| Field | Value |
|-------|-------|
| **Phase** | [phase] |
| **Sub-phase** | [sub_phase or "-"] |
| **Status** | [emoji] [status] |
| **Priority** | [priority] |
| **Owner** | [owner or "Unassigned"] |
| **Days in Phase** | [calculated from updated_at] |

## Personas
- [persona 1]
- [persona 2]

## Pillar
[pillar or "Unassigned"]

## Timeline
- **Started:** [timeline.started]
- **Target Launch:** [timeline.target_launch or "Not set"]
- **Last Updated:** [updated_at]

## Blockers
[List blockers or "None"]

## Next Action
[next_action or "Not specified"]

## Graduation Criteria
[Show criteria for advancing to next phase]
- [ ] Criterion 1 (met/not met)
- [ ] Criterion 2 (met/not met)

## Files
- [x] _meta.json
- [x/blank] research.md
- [x/blank] prd.md
- [x/blank] design-brief.md
- [x/blank] prototype-notes.md
- [x/blank] jury-evaluations/

## Linked Hypothesis
[hypothesis_id with link to hypotheses/committed/[id].md]
```

## For All Initiatives

When no initiative specified or `status all`, read all `_meta.json` files and display:

### Summary Report Format

```markdown
# Initiatives Status

**Generated:** [timestamp]
**Total:** [count]

## By Phase

| Phase | Count | Initiatives |
|-------|-------|-------------|
| Discovery | X | [names] |
| Define | X | [names] |
| Build | X | [names] |
| Validate | X | [names] |
| Launch | X | [names] |

## Health

| Status | Count |
|--------|-------|
| ✅ On Track | X |
| ⚠️ At Risk | X |
| 🚫 Blocked | X |
| 💤 Stale | X |

## Attention Needed

### Stale (>14 days)
- [initiative]: [days] days in [phase]

### Blocked
- [initiative]: [blocker reason]

### Missing Owner
- [initiative]

## Quick Actions

- `/status [name]` - View specific initiative
- `/roadmap` - View full roadmap
- `/maintain audit` - Run integrity check
```

## Implementation

1. Read `elmer-docs/initiatives/[name]/_meta.json`
2. Calculate days in phase from `updated_at`
3. Check which files exist in the initiative folder
4. Format and display the report

## Status Emojis

| Status | Emoji |
|--------|-------|
| on_track | ✅ |
| at_risk | ⚠️ |
| blocked | 🚫 |
| stale | 💤 |

## Phase Order

1. discovery
2. define
3. build
4. validate
5. launch
6. measure
7. learn
