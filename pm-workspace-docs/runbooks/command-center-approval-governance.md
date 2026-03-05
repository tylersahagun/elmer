# Command Center Approval Governance

## Phase 1 Policy

All external state changes are proposal-first and approval-gated.

## Action Types

- `sync_fix`: Proposed cross-system corrections.
- `notification`: Internal shipment/status notifications.
- Existing operational actions: `dispatch`, `ticket`, `slack`, `notion`.

## Required Preview Metadata

Each proposed action should include:

- `targetSystem`
- `operation`
- `blastRadius`
- `before`
- `after`
- `warnings`

## Approval Endpoints

```bash
curl -X POST http://localhost:3333/api/actions/propose-sync-fix \
  -H "Content-Type: application/json" \
  -d '{"title":"Sync phase mismatch","payload":{"targetSystem":"notion","operation":"phase_update"}}'

curl -X POST http://localhost:3333/api/actions/propose-notification \
  -H "Content-Type: application/json" \
  -d '{"title":"Closed beta launched","summary":"Feature X entered closed beta"}'

curl -X POST http://localhost:3333/api/actions/<ACTION_ID>/approve
```

## Domain Ownership Rules

- Notion fields are authoritative for hierarchy/outcome/timeline.
- `_meta.json` is authoritative for engineering metadata.
- Linear is authoritative for execution item status and assignee throughput.

If a proposed write violates ownership:

1. Mark as warning in preview.
2. Keep action pending.
3. Require manual approver acknowledgment before execution.

## Internal Notifications

Internal notifications are allowed in phase 1. Customer outreach is manual.

## Auditability

- All action proposals and approvals are stored in `pending_actions`.
- Sync conflicts are stored in `sync_conflicts`.
- Sync executions are stored in `sync_runs`.

