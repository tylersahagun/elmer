# Engineering Spec: Chief Of Staff Hub

## Overview

Technical approach for a proactive daily hub that aggregates actions, approvals, and schedules.

**Related PRD:** [prd.md](./prd.md)  
**Status:** Draft  
**Type:** Technical Spec  
**Complexity:** Medium  
**Estimated Effort:** 3-5 weeks (pilot)

---

## Architecture (High Level)

```
┌───────────────┐   ┌────────────────┐   ┌───────────────────┐
│ Data Sources  │→→│ Orchestration  │→→│ Daily Hub Service  │
│ Calendar/CRM  │   │ Engine         │   │ + Approval Queue  │
└───────────────┘   └────────────────┘   └───────────────────┘
       │                    │                     │
       ▼                    ▼                     ▼
Meeting signals       Action proposals        Hub UI + Notifications
CRM events            Risk scoring            Audit log + policy tiers
```

---

## Key Decisions

1. **Hub as aggregation layer** (not a new workflow engine)
2. **Approval tiers by action risk** (low = auto-run, medium/high = approve)
3. **Single queue with persona filters** (rep/leader/CSM/RevOps)

---

## Data Model (Conceptual)

### `hub_items`

```json
{
  "id": "hub_123",
  "persona_view": "sales_rep",
  "bucket": "needs_approval",
  "action_type": "send_followup",
  "confidence": 0.78,
  "source_refs": ["meeting_456", "deal_789"],
  "scheduled_for": "2026-02-01T16:00:00Z",
  "created_at": "2026-01-29T12:00:00Z"
}
```

### `approval_requests`

```json
{
  "id": "apr_456",
  "hub_item_id": "hub_123",
  "risk_level": "medium",
  "status": "pending",
  "requested_by": "system",
  "approved_by": null,
  "decision_at": null,
  "audit_log": []
}
```

### `approval_policies`

```json
{
  "action_type": "send_external_message",
  "risk_level": "high",
  "requires_approval": true,
  "approver_role": "sales_leader"
}
```

---

## API Design (Draft)

### GET `/api/hub/summary`

Returns hub buckets for the current user and persona.

### POST `/api/hub/approval/{id}`

Approve, reject, edit, or snooze an item.

### GET `/api/hub/audit`

Returns approval audit log for RevOps and leaders.

### GET `/api/hub/policies`

Returns approval thresholds by action type.

---

## Services

### DailyHubService

- Aggregates actions and schedules by persona
- Applies policy tiers and risk levels
- Generates hub buckets

### ApprovalPolicyService

- Evaluates action risk
- Decides auto-run vs approve
- Writes audit events

---

## Analytics Events

| Event                 | Properties                  | Trigger                  |
| --------------------- | --------------------------- | ------------------------ |
| `hub_viewed`          | persona_view, bucket_counts | User opens hub           |
| `hub_approval_action` | action_type, decision       | Approve/reject/edit      |
| `hub_auto_run`        | action_type, confidence     | Auto-run action executed |
| `hub_error`           | error_type                  | Failed action or fetch   |

---

## Risks & Mitigations

| Risk                         | Impact | Likelihood | Mitigation                             |
| ---------------------------- | ------ | ---------- | -------------------------------------- |
| Approval queue overload      | High   | Medium     | Escalation rules + summarization       |
| Low confidence actions       | Medium | Medium     | Clear confidence UI + require approval |
| Privacy or policy violations | High   | Low        | Strict approval tiers + audit logs     |

---

## Open Technical Questions

1. Where does risk scoring live (existing service vs new)?
2. What is the source of truth for approval policies?
3. How do we merge items across sources without duplicates?

---

_Engineering Owner: TBD_  
_Last Updated: 2026-01-29_
