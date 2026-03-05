# Status Workspace

This folder tracks operational status updates, audits, sync outputs, and
dashboard snapshots.

## Current Structure

- `activity/` - EOD/EOW/digest reports plus visuals and history JSON.
- `dev/` - Dev status and audit reports.
- `sync/` - Full sync outputs and validation reports.
- `notion/` - Notion sync and admin audits.
- `slack/` - Slack digests and monitor state.
- `posthog/` - PostHog metrics and analyses.
- `portfolio/` - Status snapshots and history.
- `workflow/` - Dashboards, plans, and initiative status notes.
- `videos/` - PMM video generation log.

## Naming Conventions

- Point-in-time: `<topic>-YYYY-MM-DD.md`
- Weekly: `<topic>-YYYY-WXX.md`
- Data sidecars: `<topic>-YYYY-MM-DD.json`
- Use clear prefixes: `dev-`, `notion-`, `posthog-`, `slack-`, `sync-`,
  `status-all-`

## Quick Find (by folder)

- Dev: `status/dev/status/`, `status/dev/audits/`
- Sync: `status/sync/full/`, `status/sync/validation/`
- Notion: `status/notion/sync/`, `status/notion/admin/`, `status/notion/cleanup/`
- Slack: `status/slack/digests/`, `status/slack/.slack-monitor-state.json`
- PostHog: `status/posthog/analysis/`
- Portfolio: `status/portfolio/snapshots/`, `status/portfolio/history.json`
- Workflow: `status/workflow/dashboards/`, `status/workflow/plans/`,
  `status/workflow/initiatives/`, `status/workflow/notes/`, `status/workflow/reviews/`
