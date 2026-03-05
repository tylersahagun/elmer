# /team Command

Show real-time team status from Linear - who's working on what, what's blocked, and what needs definition.

## Usage

```
/team                    # Full team status
/team [person]          # Individual status (e.g., /team bryan)
/team --help-needed     # Items Tyler can unblock
/team --blocked         # Show only blocked items
```

## Behavior

**Delegates to:** `team-dashboard` skill

### Full Team Status (`/team`)

1. Fetches active issues from Linear via MCP
2. Groups by assignee
3. Cross-references with PM workspace initiatives
4. Identifies blocked items and items needing definition
5. Generates formatted team dashboard

### Individual Status (`/team [person]`)

1. Searches Linear issues by assignee
2. Shows their active projects, current issues, blockers
3. Lists what's next for each project they own

### Help Needed (`/team --help-needed`)

1. Finds issues with `workflow/needs-prd` label
2. Finds issues with `workflow/needs-decisions` label
3. Finds unassigned high-priority work
4. Shows what Tyler can do to unblock the team

## Output

### Example: Full Team Status

```markdown
# Team Status - Jan 31, 2026

## By Person

### Bryan Lund

- **Rep Workspace** (P0, Build) - Proving deal context + Composio actions
- **Next:** Demo story milestone
- **Blocked:** None

### Tyler Sahagun

- **Flagship Meeting Recap** (P1, Build) - Advancing to Validate
- **Feature Availability Audit** (P0, Build) - Review findings with Eng
- **Blockers:** Privacy gating decision needed

### Skylar Sanford

- **Design System Workflow** (P2, Build) - Component documentation
- **Next:** Review new tokens with Adam
- **Blocked:** None

## Blocked Items (Action Required)

1. Settings Redesign - Need Sam involvement (Rob to loop in)
2. Composio Agent Framework - Revenue team needs clarity (Rob to clarify)

## Needs Definition

- CRM Readiness Diagnostic: Positioning decision (customer-facing vs partner-only)
- Call Import Engine: PRD completion needed

## Ready to Build (Unassigned)

- Universal Signals table migration (P0)
```

## MCP Tools Used

- `LINEAR_LIST_LINEAR_TEAMS` - Get team structure
- `LINEAR_SEARCH_ISSUES` - Find active issues
- `LINEAR_LIST_LINEAR_LABELS` - Get workflow labels

## Key Questions Answered

| Question                           | How `/team` Answers It               |
| ---------------------------------- | ------------------------------------ |
| What projects are being worked on? | Lists active projects per person     |
| What are their statuses?           | Shows phase and state for each       |
| Who is working on it?              | Grouped by assignee                  |
| What are they working on next?     | Shows `next_action` from \_meta.json |
| What's blocking release?           | "Blocked Items" section              |
| Which ones can Tyler help?         | `--help-needed` flag                 |

## Related Commands

- `/status-all` - Portfolio-level health (initiative-focused)
- `/sync-linear` - Sync Linear data to PM workspace
- `/morning` - Daily planning (includes Tyler's own work)
