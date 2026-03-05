---
name: team-dashboard
description: Pull real-time team status from Linear showing who's working on what, blockers, and what needs definition. Use when running /team command or answering "what's everyone working on?" questions.
---

# Team Dashboard Skill

Procedural knowledge for generating team visibility reports from Linear.

## When to Use

- Running `/team` command
- Running `/team [person]` for individual status
- Running `/team --help-needed` for items Tyler can unblock
- Answering "what's everyone working on?"
- Checking what's blocked or needs definition

## Prerequisites

Requires Linear MCP tools:

**Server:** `linear`

- `LINEAR_LIST_LINEAR_PROJECTS` - Get all projects
- `LINEAR_SEARCH_ISSUES` - Search issues by assignee/label
- `LINEAR_LIST_LINEAR_TEAMS` - Get team members
- `LINEAR_LIST_LINEAR_LABELS` - Get workflow labels

## Data Sources

### Linear Data

- **Teams:** Development (main), Product, IT
- **Projects:** Mapped to PM workspace initiatives
- **Issues:** Work items with assignee, state, labels
- **Labels:** Workflow labels (`workflow/needs-prd`, `workflow/ready-to-build`, etc.)

### Local Data

- `pm-workspace-docs/initiatives/active/*/_meta.json` - Initiative metadata with Linear mappings
- `pm-workspace-docs/roadmap/roadmap.json` - Priority and next_action fields

## Team Dashboard Procedure

### Step 1: Fetch Active Issues

```
1. Call LINEAR_LIST_LINEAR_TEAMS to get team members
2. Call LINEAR_SEARCH_ISSUES with filters:
   - state: In Progress, In Review, Todo
   - Exclude: Done, Canceled
3. Group issues by assignee
```

### Step 2: Map to Initiatives

```
1. For each issue, get project_id
2. Cross-reference with _meta.json linear_project_id
3. Add initiative context (phase, priority, next_action)
```

### Step 3: Identify Special Categories

**Blocked Items:**

- Issues with `workflow/blocked` label
- Issues with `workflow/needs-decisions` label
- Issues older than 7 days with no progress

**Needs Definition:**

- Issues with `workflow/needs-prd` label
- Issues with `workflow/needs-design` label
- Issues with `workflow/needs-eng-spec` label

**Ready to Build:**

- Issues with `workflow/ready-to-build` label
- Not yet started (state: Todo or Backlog)

### Step 4: Generate Output

## Output Format

### Full Team Status (`/team`)

```markdown
# Team Status - {Date}

## By Person

### {Person Name}

- **{Project Name}** ({Priority}, {Phase}) - {Current focus}
- **Next:** {next_action from \_meta.json}
- **Blocked:** {blocker or "None"}

### {Person 2 Name}

...

## Blocked Items (Action Required)

1. {Project} - {Blocker description} ({Owner} to resolve)
2. ...

## Needs Definition

- {Project}: {What's needed} (workflow/needs-prd)
- ...

## Ready to Build (Unassigned)

- {Issue title} ({Project})
- ...
```

### Individual Status (`/team [person]`)

```markdown
# {Person Name} - Status

## Active Work

| Project | Priority | Phase | Status      | Days |
| ------- | -------- | ----- | ----------- | ---- |
| {Name}  | P0       | Build | In Progress | 3    |

## Current Issues

- **{Issue Key}**: {Title} - {State}
- ...

## Blockers

- {Blocker or "None"}

## What's Next

- {next_action for each project}
```

### Help Needed View (`/team --help-needed`)

```markdown
# Items Tyler Can Help With

## Needs PRD / Product Definition

- **{Project}**: {Issue title}
  - Assigned: {Name}
  - Blocked since: {Date}
  - Action: Write PRD / Clarify scope

## Needs Decisions

- **{Project}**: {Open question}
  - Options: A, B, C
  - Owner: Tyler/Brian
  - Impact: Blocks {X} issues

## Unassigned Work

- **{Project}**: {Issue title}
  - Priority: {P0/P1}
  - Ready to build: {Yes/No}
```

## Error Handling

### No Linear Access

```
⚠️ Linear MCP tools not available.

Ensure Linear integration is configured in MCP settings.
```

### No Active Issues

```
✅ Team Status Clean

No in-progress issues found. Team may be:
- Between cycles
- Working on untracked items
- On PTO
```

## Integration Points

### With Portfolio Status

- `/team` complements `/status-all`
- `/status-all` = initiative-level health
- `/team` = person-level workload

### With Morning Planning

- `/morning` pulls from `/team` for Tyler's own work
- Shows Tyler's active issues and blockers

### With Linear Sync

- `/team` reads from Linear directly
- `/sync-linear` persists data to PM workspace
- Both use same MCP tools

## MCP Tool Reference

### LINEAR_LIST_LINEAR_TEAMS

```json
{
  "project_id": null // Optional filter
}
```

Returns: Teams with members and projects

### LINEAR_SEARCH_ISSUES

```json
{
  "query": "assignee:@me state:in-progress",
  "team_id": "2b25052e-675d-4530-90c6-f2b6085d15e2"
}
```

Returns: Matching issues with state, assignee, labels

## Known Team Members

| Name            | Email                        | Role        | Focus            |
| --------------- | ---------------------------- | ----------- | ---------------- |
| Bryan Lund      | bryan@askelephant.ai         | Engineering | Core development |
| Skylar Sanford  | skylar@askelephant.ai        | Design      | UX/UI            |
| Tyler Sahagun   | tyler.sahagun@askelephant.ai | Product     | PM               |
| Sam Ho          | sam.ho@askelephant.ai        | Product     | PM               |
| Ivan Garcia     | ivan.garcia@askelephant.ai   | Engineering | Development      |
| Jason Harmon    | jason@askelephant.ai         | Engineering | Core development |
| Adam Shumway    | adam.shumway@askelephant.ai  | Design      | UI               |
| Matt Noxon      | matt.noxon@askelephant.ai    | Engineering | Core development |
| Dylan Shallow   | dylan@askelephant.ai         | Engineering | Development      |
| Eduardo Gueiros | eduardo@askelephant.ai       | Engineering | Development      |

## Response Format

After generating the dashboard:

1. Display the formatted output
2. Highlight critical items (blocked, overdue)
3. Suggest next actions if issues found
4. Offer to drill into specific person or project
