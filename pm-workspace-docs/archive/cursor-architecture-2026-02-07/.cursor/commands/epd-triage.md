# /epd-triage Command

Manage the Linear triage queue for the EPD/Product team only (never Engineering).

## Usage

```
/epd-triage             # Review + recommendations (no changes)
/epd-triage --apply     # Apply approved changes (EPD only)
```

## Behavior

**Delegates to:** `linear-triage` subagent

1. **Resolve EPD team** - Finds the EPD/Product team by key or name
2. **Find Triage state** - Locates the team's "Triage" workflow state
3. **Fetch triage issues** - Lists EPD issues and filters to Triage state
4. **Classify & recommend** - Groups by outcome (needs info, backlog, handoff)
5. **Apply (optional)** - If `--apply` is present, applies safe updates

## Guardrails (Hard Constraints)

- **EPD-only:** Never operate on Engineering team issues
- **No cross-team moves:** Do not transfer issues to other teams
- **Safe updates only:** No deletions or irreversible actions

## Output

```markdown
# EPD Triage Report

**Team:** EPD (Product)
**State:** Triage
**Issues:** 14

## Recommended Actions

### ✅ Ready for Backlog (5)

- EPD-214: "Add call outcome filtering" → Move to Backlog
- EPD-219: "Workspace settings audit" → Move to Todo

### ❓ Needs Info (4)

- EPD-198: "Import is broken" → Request repro steps
- EPD-203: "Salesforce sync slow" → Ask for account + timestamps

### 🧭 Needs Engineering Handoff (3)

- EPD-187: "Crash on upload" → Add handoff note, leave in triage

### 🧹 Possible Duplicates (2)

- EPD-176: "CRM field mismatch" → Link to EPD-122, recommend close

## Changes Applied

- Moved 3 issues to Backlog
- Added 4 info-request comments
- No cross-team updates performed
```

## MCP Tools Used

- `LINEAR_LIST_LINEAR_TEAMS`
- `LINEAR_LIST_LINEAR_STATES`
- `LINEAR_LIST_ISSUES_BY_TEAM_ID`
- `LINEAR_LIST_LINEAR_LABELS`
- `LINEAR_UPDATE_ISSUE`
- `LINEAR_CREATE_LINEAR_COMMENT`

## Best Practices

- Run daily or twice weekly to keep triage under control
- Keep a short list of "Ready for Backlog" items
- Use comments to request missing info, not long back-and-forth
