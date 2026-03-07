# Elmer Internal Alpha Feedback Template

Use this template when filing new Linear issues from internal alpha sessions.

## Title
`[Alpha][Category] Short description`

Examples:
- `[Alpha][UX] Project overview does not make the next action obvious`
- `[Alpha][Runtime] Project route crashes after opening Signals`
- `[Alpha][Approval] Pending approval has no clear accept/reject path`
- `[Alpha][Agent Visibility] Active run does not show the last meaningful step`

## Body
```md
## Session Context
- Project:
- Workspace:
- Route:
- Tester:
- Date:

## Flow Attempted
1.
2.
3.

## Expected Behavior

## Actual Behavior

## Why This Matters For Internal Alpha
- [ ] Blocks real project work
- [ ] Makes agent activity hard to understand
- [ ] Makes approvals ambiguous
- [ ] Makes evidence provenance unclear
- [ ] Creates confidence loss but work can continue

## Evidence
- Screenshot:
- Job ID / trace:
- Artifact or document involved:

## Severity
- [ ] Release-blocking for internal alpha
- [ ] High-friction but test can continue
- [ ] Minor clarity issue

## Repeatability
- [ ] Reproduced once
- [ ] Reproduced multiple times
- [ ] Intermittent

## Related Issues
- GTM-107
- Related existing issue(s):
```

## Intake Rules
- If the problem already matches an existing Linear issue, add a comment there instead of opening a duplicate.
- If it is a new issue, relate it to `GTM-107` so the alpha loop stays queryable.
- Prefer concrete route names, project names, and job IDs over general impressions.
- File the issue before the session ends.
