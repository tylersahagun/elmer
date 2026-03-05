# Codex Automations Runbook - Ops Cadence

Workspace CWD:
- `/Users/tylersahagun/.codex/worktrees/edca/pm-workspace`

Timezone:
- Local workspace timezone (US)

## Automation Set (Phase 1)

1. Morning Focus
- Schedule: weekdays at 8:30 AM
- Task prompt: "Generate today's PM focus plan using current status, active initiatives, and urgent Slack/Linear signals."
- Output: priorities, time blocks, blockers, collaborators

2. Midday Triage
- Schedule: weekdays at 12:00 PM
- Task prompt: "Triage Slack + email + Linear activity since last check and produce an action queue."
- Output: urgent replies, defer list, delegation, draft responses

3. EOD Report
- Schedule: weekdays at 5:30 PM
- Task prompt: "Create EOD report with shipped progress, decisions, risks, and tomorrow setup."
- Output: moved today, decisions, risks, tomorrow actions

4. EOW Report
- Schedule: Fridays at 4:30 PM
- Task prompt: "Create EOW report with wins, trends, KPI movement, and next-week priorities."
- Output: outcomes, trends, KPI view, next-week plan

5. Daily Sync Summary (Optional)
- Schedule: weekdays at 3:00 PM
- Task prompt: "Summarize current Notion, Linear, and GitHub status alignment and highlight mismatches requiring correction."
- Output: aligned state, mismatches, fix actions

## Authoring Rules

1. Prompt contains only task intent, never schedule details.
2. Each run must open an inbox item.
3. Include degraded-mode behavior if MCP sources are unavailable.

## Manual Test Checklist

1. Trigger each automation manually once.
2. Verify inbox item creation and sectioned output.
3. Verify weekday-only and Friday-only schedule behavior.
4. Validate references to real artifacts under `pm-workspace-docs/`.

## Verification Log

Record each test execution in:
- `pm-workspace-docs/status/activity/codex-automation-verification-2026-02.md`
