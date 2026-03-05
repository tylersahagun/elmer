# Command Center Sync Ops Runbook

## Purpose

Operate Product Command Center V2 sync jobs for unified roadmap, demand, and outcome metrics.

## Sync Jobs

- `sync_hierarchy_from_notion`: Notion hierarchy + outcomes + timeline.
- `sync_meta_from_workspace`: `_meta.json` enrichment and owner profiles.
- `sync_linear_execution`: Linear execution + engineering capacity.
- `sync_metrics_posthog_stripe`: Usage/revenue/trust snapshots.
- `sync_demand_hubspot_pylon_slack_askelephant`: Account/contact demand ingestion.

## Manual Triggers

```bash
curl -X POST http://localhost:3333/api/scheduler/trigger/sync_hierarchy_from_notion
curl -X POST http://localhost:3333/api/scheduler/trigger/sync_meta_from_workspace
curl -X POST http://localhost:3333/api/scheduler/trigger/sync_linear_execution
curl -X POST http://localhost:3333/api/scheduler/trigger/sync_metrics_posthog_stripe
curl -X POST http://localhost:3333/api/scheduler/trigger/sync_demand_hubspot_pylon_slack_askelephant
curl -X POST http://localhost:3333/api/roadmap/sync
```

## Health Checks

```bash
curl http://localhost:3333/api/health
curl http://localhost:3333/api/scheduler/status
curl http://localhost:3333/api/roadmap/hierarchy
curl http://localhost:3333/api/capacity/overview
curl http://localhost:3333/api/metrics/dashboard
```

## Expected Degraded Modes

- Missing HubSpot/PostHog/Stripe sessions: sync continues with degraded flags.
- Missing Pylon/AskElephant credentials: demand sync continues from Slack/local signals.
- Notion unavailable: hierarchy falls back to previously synced local state.

## Conflict Handling

- Cross-domain conflicts are persisted to `sync_conflicts`.
- Domain ownership:
  - Notion: hierarchy/outcomes/timeline.
  - `_meta.json`: engineering metadata.
  - Linear: execution workload.
- Use `POST /api/actions/propose-sync-fix` for operator-reviewed correction paths.

## Failure Triage

1. Check `/api/health` integration flags.
2. Check `/api/scheduler/status` for failing job + error text.
3. Inspect latest sync run in `sync_runs`.
4. Re-run failed job manually.
5. If connector auth failed, rotate credentials and restart server.

