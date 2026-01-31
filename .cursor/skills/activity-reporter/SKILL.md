---
name: activity-reporter
description: Generate daily/weekly activity reports and write them to repo paths.
---

# Activity Reporter

Build concise end-of-day and end-of-week reports with highlights, blockers, and next steps.

## When to Use

- `/eod` or `/eow` commands
- `/visual-digest` or `/publish-digest` report generation
- Any request for status or activity summaries

## Workflow

- Gather recent job activity, stage transitions, sync events, and key project updates.
- Summarize wins, blockers, and next actions.
- Write outputs to `pm-workspace-docs/status/` using `write_repo_files`.

## Output

- `pm-workspace-docs/status/YYYY-MM-DD-eod.md`
- `pm-workspace-docs/status/YYYY-MM-DD-eow.md`
