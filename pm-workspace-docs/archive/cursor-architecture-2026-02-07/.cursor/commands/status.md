# Status Command

Show workspace overview and initiative status.

**Applies:** `initiative-status` skill

## Usage

```
/status                    # Overall workspace status
/status [initiative-name]  # Specific initiative status
```

## Workspace Status

Shows:

- Active initiatives and their phases
- Recent activity
- Pending action items
- Roadmap summary

## Initiative Status

For a specific initiative, shows:

### Metadata

- Current phase (discovery → define → build → validate → launch)
- Days in current phase
- Target personas
- Strategic pillar
- **Owner:** [name] or **Owner: UNASSIGNED** (flagged as blocker)
- **Eng Lead:** [name or unassigned]
- **Design Lead:** [name or unassigned]
- **Feedback Method:** [method] or **UNDEFINED** (flagged if Build+ phase)

### Artifact Status

| Artifact        | Status                                   |
| --------------- | ---------------------------------------- |
| Research        | ✅ Complete / ⚠️ Incomplete / ❌ Missing |
| PRD             | ✅ Complete / ⚠️ Incomplete / ❌ Missing |
| Design Brief    | ✅ Complete / ⚠️ Incomplete / ❌ Missing |
| Prototype       | ✅ Complete / ⚠️ Incomplete / ❌ Missing |
| Jury Evaluation | ✅ Complete / ⚠️ Incomplete / ❌ Missing |
| METRICS         | ✅ Complete / ⚠️ Incomplete / ❌ Missing |
| Decisions       | ✅ Complete / ⚠️ Incomplete / ❌ Missing |

### Success Metrics Summary

- Pull from METRICS.md (if exists)
- Show current values from PostHog (if dashboard_id is set in \_meta.json)

### Experience Completion

| Step                          | Status                              |
| ----------------------------- | ----------------------------------- |
| Discovery (how users find it) | Designed / Not designed / N/A       |
| Activation (first-time setup) | Designed / Not designed / N/A       |
| Usage (core interaction)      | Built / In progress / Not started   |
| Ongoing Value (day 2+)        | Designed / Not designed / N/A       |
| Feedback Loop                 | Instrument live / Planned / Missing |

### Graduation Criteria

- What's needed to advance to next phase
- What's currently blocking

### Recent Signals

- New feedback linked to this initiative
- Unprocessed signals count

## Data Sources

- `pm-workspace-docs/initiatives/active/[name]/_meta.json`
- `pm-workspace-docs/roadmap/roadmap.json`
- `pm-workspace-docs/signals/_index.json`

## Next Steps

Based on current status, suggests:

- `/research [name]` if research missing
- `/pm [name]` if PRD missing
- `/proto [name]` if prototype missing
- `/validate [name]` if ready for validation
- `/iterate [name]` if feedback pending
