# Runbook: Project Registry

## Purpose

Project Registry is the machine-readable index that powers virtual per-project PM agents and portfolio-level routing.

## File Location

`pm-workspace-docs/company-context/project-registry.json`

Generated from:

`pm-workspace-docs/initiatives/active/*/_meta.json`

---

## Entry Schema

```json
{
  "project_id": "chief-of-staff-experience",
  "initiative_name": "Chief of Staff Experience",
  "initiative_path": "pm-workspace-docs/initiatives/active/chief-of-staff-experience",
  "phase": "define",
  "status": "on_track",
  "owner": "tyler",
  "sponsor": null,
  "linear": {
    "project_id": null,
    "project_url": null
  },
  "notion": {
    "project_id": "30af79b2-c8ac-8125-b850-d5df42f68e76",
    "project_url": "https://www.notion.so/..."
  },
  "slack": {
    "channel_ids": []
  },
  "posthog": {
    "dashboard_ids": []
  },
  "last_synced_at": "ISO-8601"
}
```

---

## Generation Rules

1. One entry per active initiative.
2. `project_id` defaults to initiative folder name.
3. Pull owner/sponsor/phase/status from `_meta.json`.
4. Pull linear/notion/slack/posthog IDs when present.
5. Preserve stable ordering by `project_id`.
6. Include top-level metadata block:
   - generated_at
   - total_projects
   - source_path

---

## Maintenance Checks

Audit must fail if:

1. An active initiative is missing from registry.
2. Registry entry points to non-existent initiative path.
3. Active initiative is missing `metrics-contract.json`.

---

## Workflow Integration

### `/project-agent <initiative> <question>`

1. Resolve initiative from registry.
2. Load canonical initiative files.
3. Query memory dossier/evidence with `project_id`.
4. Return evidence-backed answer with as-of timestamp.

### `/dossier <initiative>`

1. Resolve initiative from registry.
2. Build/update dossier markdown snapshot.
3. Write derived dossier object to memory service.

---

## Recommended Commands

Use these script entrypoints:

- `python3 pm-workspace-docs/scripts/memory/generate_project_registry.py`
- `python3 pm-workspace-docs/scripts/memory/validate_memory_contracts.py`

Run weekly as part of `/maintain audit` and after creating new initiatives.
