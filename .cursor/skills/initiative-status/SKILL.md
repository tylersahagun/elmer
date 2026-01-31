---
name: initiative-status
description: Analyze initiative status including phase progress, artifact completeness, graduation readiness, and next steps. Use when checking initiative health, answering "where are we" questions, or running /status command.
---

# Initiative Status Skill

Procedural knowledge for analyzing initiative status and determining next steps.

## When to Use

- Running `/status [initiative-name]`
- Answering "where are we with [initiative]?"
- Checking if initiative is ready to advance phases
- Identifying blockers or gaps
- Generating status reports

## Data Sources

Load these files for analysis:

```
pm-workspace-docs/initiatives/[name]/  # preferred
elmer-docs/initiatives/[name]/         # fallback
├── _meta.json          # Phase, status, updated_at
├── research.md         # User research
├── prd.md              # Product requirements
├── design-brief.md     # Design specifications
├── engineering-spec.md # Technical spec
├── prototype-notes.md  # Prototype documentation
├── gtm-brief.md        # Go-to-market plan
└── jury-evaluations/   # Validation results
```

Also check:

- `pm-workspace-docs/signals/_index.json` (fallback: `elmer-docs/signals/_index.json`) - Linked signals
- `pm-workspace-docs/roadmap/roadmap.json` (fallback: `elmer-docs/roadmap/roadmap.json`) - Roadmap position

## MCP Tools Available (Optional Enhancement)

**Server:** `user-mcp-config-2mgoji` (Composio)

Use MCP tools to enrich initiative status with live data:

| Source      | Tools                                               | Enhancement                                 |
| ----------- | --------------------------------------------------- | ------------------------------------------- |
| **Linear**  | `LINEAR_GET_LINEAR_PROJECT`, `LINEAR_SEARCH_ISSUES` | Pull live issue status, assignees, blockers |
| **PostHog** | `POSTHOG_RETRIEVE_PROJECT_INSIGHT_DETAILS`          | Pull current success metric values          |
| **Notion**  | `NOTION_RETRIEVE_PAGE`                              | Sync with Notion project status             |

**When to use:**

- Initiative has `linear_project_id` in `_meta.json` → Query Linear for live dev status
- Initiative has `posthog.dashboard_id` in `_meta.json` → Query PostHog for metrics
- Status conflicts between local and external → Show discrepancy in report

## Analysis Framework

### Step 1: Read Metadata

From `_meta.json`, extract:

```json
{
  "name": "initiative-name",
  "phase": "discovery | define | build | validate | launch",
  "status": "on_track | at_risk | blocked | paused",
  "personas": ["persona-id"],
  "strategic_pillar": "pillar-name",
  "current_version": "v1",
  "updated_at": "ISO8601",
  "created_at": "ISO8601"
}
```

Calculate:

- **Days in phase:** `now - updated_at` (or phase transition date)
- **Total age:** `now - created_at`

### Step 2: Check Artifact Completeness

| Artifact         | File                    | Completeness Criteria                                 |
| ---------------- | ----------------------- | ----------------------------------------------------- |
| Research         | `research.md`           | Has user quotes, problems identified, personas tagged |
| PRD              | `prd.md`                | Has outcome chain, success metrics, user stories      |
| Design Brief     | `design-brief.md`       | Has user flows, states, edge cases                    |
| Engineering Spec | `engineering-spec.md`   | Has technical approach, dependencies                  |
| Prototype        | `prototype-notes.md`    | Has component list, Chromatic URL, version            |
| GTM Brief        | `gtm-brief.md`          | Has launch plan, success criteria                     |
| Jury Evaluation  | `jury-evaluations/*.md` | Has verdict, pass rate                                |

**Status Levels:**

- ✅ **Complete** - File exists and meets criteria
- ⚠️ **Incomplete** - File exists but missing key sections
- ❌ **Missing** - File doesn't exist

### Step 3: Evaluate Graduation Criteria

#### Discovery → Define

| Criterion                | How to Check                                |
| ------------------------ | ------------------------------------------- |
| Research exists          | `research.md` exists and has content        |
| User problems documented | Research has `## User Problems` with quotes |
| Personas identified      | `_meta.json.personas` is non-empty          |
| 3+ evidence points       | Count quotes/data points in research        |

#### Define → Build

| Criterion                 | How to Check                                       |
| ------------------------- | -------------------------------------------------- |
| PRD exists and approved   | `prd.md` exists, check for approval marker         |
| Design brief exists       | `design-brief.md` exists                           |
| Outcome chain defined     | PRD has `## Outcome Chain` section                 |
| Success metrics specified | PRD has `## Success Metrics` with measurable items |

#### Build → Validate

| Criterion              | How to Check                                     |
| ---------------------- | ------------------------------------------------ |
| Prototype documented   | `prototype-notes.md` exists                      |
| All states implemented | Notes list Loading, Error, Empty, Success states |
| Flow stories complete  | Notes mention `Flow_*` stories                   |
| Chromatic URL present  | `_meta.json.chromatic_url` or in prototype-notes |

#### Validate → Launch

| Criterion            | How to Check                   |
| -------------------- | ------------------------------ |
| Jury pass rate ≥70%  | Latest jury evaluation verdict |
| Stakeholder approval | Approval marker in docs        |
| No P0 blockers       | No `P0` or `blocker` tags      |
| GTM brief complete   | `gtm-brief.md` exists          |

### Step 4: Check Linked Signals

From `signals/_index.json`, find signals where `initiative_id` matches:

```json
{
  "signals": [
    {
      "id": "sig-2026-01-20-...",
      "initiative_id": "initiative-name",
      "processed": true,
      "created_at": "ISO8601"
    }
  ]
}
```

Count:

- Total linked signals
- Unprocessed signals (processed: false)
- New since last update (created_at > \_meta.updated_at)

### Step 5: Determine Health Status

| Status          | Criteria                                        |
| --------------- | ----------------------------------------------- |
| 🟢 **On Track** | All criteria met for current phase, no blockers |
| 🟡 **At Risk**  | Missing 1-2 artifacts, or >14 days in phase     |
| 🔴 **Blocked**  | Missing critical artifacts, or explicit blocker |
| ⏸️ **Paused**   | Explicitly paused in \_meta.json                |

### Step 6: Generate Next Steps

Based on gaps found, suggest in priority order:

| Gap                  | Suggested Action                          |
| -------------------- | ----------------------------------------- |
| No research          | `/research [name]` - Gather user evidence |
| Research incomplete  | Add more user quotes and evidence         |
| No PRD               | `/pm [name]` - Create requirements        |
| PRD incomplete       | Fill in missing sections                  |
| No design brief      | `/design [name]` - Create design brief    |
| No prototype         | `/proto [name]` - Build prototype         |
| Prototype incomplete | `/iterate [name]` - Add missing states    |
| Ready for validation | `/validate [name]` - Run jury evaluation  |
| Jury failed          | `/iterate [name]` - Address feedback      |
| Ready for launch     | `/share` - Create PR for review           |

## Output Template

### Workspace Status (no initiative specified)

```markdown
# Workspace Status

**Generated:** YYYY-MM-DD

## Active Initiatives

| Initiative | Phase   | Status   | Days | Next Step |
| ---------- | ------- | -------- | ---- | --------- |
| [name]     | [phase] | 🟢/🟡/🔴 | [N]  | [action]  |

## Pending Actions

- [ ] [Initiative]: [what's needed]

## Recent Activity

- [Date]: [what happened]

## Roadmap Summary

[Link to roadmap or brief summary]
```

### Initiative Status (specific initiative)

```markdown
# Status: [Initiative Name]

**Phase:** [phase] (Day [N])
**Status:** 🟢 On Track / 🟡 At Risk / 🔴 Blocked
**Personas:** [list]
**Strategic Pillar:** [pillar]

## Artifact Status

| Artifact        | Status   | Notes    |
| --------------- | -------- | -------- |
| Research        | ✅/⚠️/❌ | [detail] |
| PRD             | ✅/⚠️/❌ | [detail] |
| Design Brief    | ✅/⚠️/❌ | [detail] |
| Prototype       | ✅/⚠️/❌ | [detail] |
| Jury Evaluation | ✅/⚠️/❌ | [detail] |

## Graduation Criteria ([current] → [next])

| Criterion   | Status              |
| ----------- | ------------------- |
| [criterion] | ✅ Met / ❌ Not met |

**Ready to advance:** Yes / No - [reason]

## Linked Signals

- **Total:** [N] signals
- **Unprocessed:** [N] signals
- **New since last update:** [N] signals

## Blockers

- [Blocker if any]

## Next Steps

1. **[Priority action]** - [why]
2. **[Secondary action]** - [why]

**Suggested command:** `/[command] [name]`
```

## Edge Cases

### Initiative Not Found

```
❌ Initiative "[name]" not found.

Did you mean one of these?
- [similar-name-1]
- [similar-name-2]

Or create new: `/new-initiative [name]`
```

### No \_meta.json

```
⚠️ Initiative "[name]" exists but missing _meta.json.

Run `/maintain fix` to generate metadata, or create manually.
```

### Stale Initiative (>30 days no update)

```
⚠️ This initiative hasn't been updated in [N] days.

Options:
- Resume work: [suggested command]
- Pause intentionally: Update _meta.json status to "paused"
- Archive: Move to archived/ folder
```
