---
name: roadmap-analysis
description: Analyze product roadmap for health, priorities, and insights. Use when running /roadmap commands or answering questions about initiative prioritization and planning.
---

# Roadmap Analysis Skill

Procedural knowledge for analyzing and reporting on product roadmap health.

## When to Use

- Running `/roadmap` command and subcommands
- User asks "what should I work on?", "what's the priority?"
- Checking roadmap health and blockers
- Planning work allocation

## Data Sources

Primary source of truth:
```
pm-workspace-docs/roadmap/roadmap.json
```

Derived views (regenerated from JSON):
```
pm-workspace-docs/roadmap/roadmap.md          # Narrative
pm-workspace-docs/roadmap/roadmap-gantt.md    # Mermaid Gantt
pm-workspace-docs/roadmap/roadmap-kanban.md   # Table kanban
pm-workspace-docs/roadmap/snapshots/          # Historical snapshots
```

Initiative details:
```
pm-workspace-docs/initiatives/active/[name]/_meta.json
```

## Roadmap JSON Schema

```json
{
  "generated_at": "ISO8601",
  "initiatives": [
    {
      "id": "initiative-name",
      "name": "Human Readable Name",
      "phase": "discovery | define | build | validate | launch",
      "status": "on_track | at_risk | blocked | paused",
      "priority": "P0 | P1 | P2 | P3",
      "personas": ["sales-rep", "revops"],
      "strategic_pillar": "pillar-name",
      "owner": "name",
      "days_in_phase": 5,
      "created_at": "ISO8601",
      "updated_at": "ISO8601",
      "blockers": [],
      "next_action": "description"
    }
  ],
  "summary": {
    "total": 10,
    "by_phase": { "discovery": 2, "define": 3, ... },
    "by_status": { "on_track": 7, "at_risk": 2, ... },
    "stale_count": 1
  }
}
```

## Analysis Procedures

### Health Assessment

Calculate health score based on:

| Metric | Healthy | Warning | Critical |
|--------|---------|---------|----------|
| Stale initiatives (>14d) | 0 | 1-2 | 3+ |
| Blocked initiatives | 0 | 1 | 2+ |
| At-risk initiatives | <20% | 20-40% | >40% |
| Missing owners | 0 | 1-2 | 3+ |

**Overall Health:**
- 🟢 **Healthy** - All metrics in healthy range
- 🟡 **Needs Attention** - 1-2 warnings
- 🔴 **Critical** - Any critical metric

### Phase Distribution Analysis

Ideal distribution (adjust based on team capacity):
- **Discovery**: 10-20% (pipeline)
- **Define**: 15-25% (specification)
- **Build**: 30-40% (active development)
- **Validate**: 10-20% (testing)
- **Launch**: 5-10% (shipping)

Flag imbalances:
- Too much in discovery → "Pipeline building but not shipping"
- Too much in build → "Risk of context switching"
- Nothing in validate → "Skipping validation?"

### Priority Analysis

Check for:
- Multiple P0s (should be rare)
- P0/P1 items blocked or at-risk (escalate)
- P3 items in build phase (misalignment?)

### Staleness Detection

| Days in Phase | Status |
|---------------|--------|
| 0-7 | Normal |
| 8-14 | Monitor |
| 15-21 | ⚠️ Stale |
| 22+ | 🔴 Very stale |

### Work Recommendations

Based on current state, recommend:

```
## Recommended Focus

### This Week
1. [P0/P1 item] - [phase] - [specific action]
2. [Stale item needing attention] - [what to do]

### Blockers to Resolve
- [Initiative]: [blocker description]

### Quick Wins Available
- [Low-effort items ready to advance]
```

## Output Formats

### Default Summary (`/roadmap`)

```markdown
# Product Roadmap

**Generated:** YYYY-MM-DD
**Health:** 🟢/🟡/🔴 [status]

## Overview
| Metric | Value |
|--------|-------|
| Total Initiatives | X |
| On Track | X |
| At Risk | X |
| Blocked | X |

## Phase Distribution
[Bar chart or table]

## Top Priorities
1. [P0/P1 items with next actions]

## Needs Attention
- [Stale/blocked items]

## Quick Actions
- `/status [name]` - View initiative details
- `/roadmap refresh` - Regenerate from initiatives
```

### By-Phase View (`/roadmap by-phase`)

Group initiatives by phase with key details.

### By-Persona View (`/roadmap by-persona`)

Group initiatives by target persona.

### By-Pillar View (`/roadmap by-pillar`)

Group initiatives by strategic pillar.

### Stale Report (`/roadmap stale`)

Focus on items needing attention:
- Stale (>14 days)
- At risk (7-14 days)
- Blocked
- Missing owner

### Refresh (`/roadmap refresh`)

1. Scan all `initiatives/*/\_meta.json`
2. Aggregate into `roadmap.json`
3. Regenerate derived views
4. Save snapshot to `snapshots/YYYY-MM-DD.json`
5. Compare to previous snapshot and report changes

## Snapshot Comparison

When refreshing, compare to previous snapshot:

```markdown
## Changes Since [previous date]

### New Initiatives
- [name] added in [phase]

### Phase Changes
- [name]: discovery → define

### Status Changes
- [name]: on_track → at_risk

### Completed
- [name] launched
```

## Integration

After roadmap analysis:
- Deep dive on initiative → `/status [name]`
- Initiative stuck → `/iterate [name]` or resolve blocker
- Missing research → `/research [name]`
- Ready to build → `/proto [name]`
