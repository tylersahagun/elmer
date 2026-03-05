# Runbook: Metrics Contract and Measurement Readiness

## Purpose

Metrics Contract is behavior-changing memory: every initiative must define measurable outcomes and required instrumentation.

## Required File

Each active initiative must include:

`pm-workspace-docs/initiatives/active/<initiative>/metrics-contract.json`

---

## Contract Schema (MVP)

```json
{
  "project_id": "initiative-slug",
  "north_star_metric": {
    "name": "string",
    "definition": "string",
    "unit": "string",
    "window": "7d|14d|30d|quarter",
    "segmentation": ["workspace", "persona", "region"]
  },
  "instrumentation": {
    "required_events": [
      {
        "event_name": "string",
        "description": "string",
        "required_properties": ["workspace_id", "initiative_id"],
        "mapped_posthog_insight_ids": [],
        "mapped_dashboard_ids": []
      }
    ]
  },
  "validation": {
    "status": "instrumented|partial|missing",
    "last_validated_at": null,
    "gaps": [],
    "linked_linear_issue_ids": []
  }
}
```

---

## Measurement Readiness Rubric

| Status | Criteria |
|---|---|
| `instrumented` | All required events exist, required properties present, and at least one mapped insight/dashboard for north-star tracking |
| `partial` | Some instrumentation exists, but one or more required events/properties/insights are missing |
| `missing` | No validated instrumentation for contract-critical events |

---

## Gap Taxonomy

Each gap entry should follow:

```json
{
  "type": "missing_event|missing_property|missing_insight|missing_dashboard|definition_incomplete",
  "severity": "high|medium|low",
  "detail": "human-readable gap description",
  "recommended_action": "next deterministic step"
}
```

---

## Command Responsibilities

### `/new-initiative`

- Scaffold `metrics-contract.json` with `validation.status = "missing"`.

### `/metrics <initiative>`

- Update metric definitions and required events.
- Validate readiness using PostHog APIs.
- Persist validation results and gaps.
- In fully automated mode, create/update Linear instrumentation tickets when high-severity gaps exist.

### `/status <initiative>` and `/status-all`

- Always include Measurement Readiness section:
  - current status
  - top gaps
  - linked PostHog assets
  - linked instrumentation tickets

---

## Operational Workflow

1. Define north star and supporting indicators.
2. Define required events/properties.
3. Validate with PostHog event/property definitions.
4. Update readiness state.
5. If gaps exist, auto-create remediation tasks.
6. Revalidate after instrumentation merges.

Automation helper:

```bash
python3 pm-workspace-docs/scripts/memory/auto_commit_instrumentation_candidates.py
```

Auto-commit audit log output:

- `pm-workspace-docs/status/memory-graph/auto-commit-log-YYYY-MM-DD.jsonl`
- Emits one `candidate_committed` event per auto-linked instrumentation gap plus a `run_summary` event.

---

## Chief-of-Staff Pilot Defaults

Pilot project: `chief-of-staff-experience`

Suggested starting north star:

- **Approval-complete action loop rate**
  - `% of extracted action items completed or deferred within 7 days`

Suggested required events:

- `chief_of_staff.action_item_extracted`
- `chief_of_staff.action_item_completed`
- `chief_of_staff.daily_brief_viewed`
- `chief_of_staff.weekly_brief_viewed`

Required properties:

- `workspace_id`
- `initiative_id`
- `surface`
- `confidence_score` (when available)

---

## Audit Checklist

- [ ] Every active initiative has `metrics-contract.json`
- [ ] Every contract has non-empty `north_star_metric.name`
- [ ] Validation status is present
- [ ] Gap list is structured
- [ ] Linked Linear issue IDs are tracked for unresolved high/medium gaps
