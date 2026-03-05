# Product OS Memory Schema (Canonical)

## Design Goals

1. Separate system-of-record data from Product OS memory.
2. Preserve evidence provenance for every derived claim.
3. Support per-project and portfolio agents with shared/org/team/private scope.
4. Enforce metrics instrumentation as policy memory.

---

## 1) Identity and Canonical Entities

### `Person`

| Field | Type | Notes |
|---|---|---|
| `person_id` | string (pk) | Stable canonical ID |
| `display_name` | string | e.g., "Woody Klemetson" |
| `primary_email` | string \| null | Optional |
| `slack_user_id` | string \| null | From org chart |
| `role_title` | string \| null | Job title |
| `org_unit_id` | string \| null | FK to OrgUnit |
| `manager_person_id` | string \| null | FK Person |
| `is_active` | boolean | Active employee status |
| `updated_at` | timestamp | Metadata |

### `ToolIdentity`

| Field | Type | Notes |
|---|---|---|
| `tool_identity_id` | string (pk) | |
| `person_id` | string (fk) | Canonical person link |
| `tool` | enum | slack, gmail, linear, github, notion, posthog, askelephant |
| `external_id` | string | Tool-native identifier |
| `handle` | string \| null | Display handle |
| `is_primary` | boolean | Preferred identity per tool |
| `updated_at` | timestamp | |

### `OrgUnit`

| Field | Type | Notes |
|---|---|---|
| `org_unit_id` | string (pk) | |
| `name` | string | e.g., Product, Sales |
| `parent_org_unit_id` | string \| null | Hierarchy |
| `owner_person_id` | string \| null | Leader |
| `updated_at` | timestamp | |

---

## 2) Project Registry

### `ProjectRegistry`

| Field | Type | Notes |
|---|---|---|
| `project_id` | string (pk) | Slug, stable |
| `initiative_name` | string | Human title |
| `initiative_path` | string | Path to initiative docs |
| `status` | string | active, done, archived |
| `phase` | string | discovery/define/build/validate/launch |
| `owner_person_id` | string \| null | Canonical owner |
| `sponsor_person_id` | string \| null | Optional |
| `linear_project_id` | string \| null | |
| `notion_project_id` | string \| null | |
| `slack_channel_ids` | string[] | Array |
| `posthog_dashboard_ids` | string[] | Optional |
| `visibility_scope` | enum | org, team, private |
| `last_synced_at` | timestamp | Registry sync timestamp |

---

## 3) Evidence Layer (Immutable Pointers)

### `EvidenceItem`

| Field | Type | Notes |
|---|---|---|
| `evidence_id` | string (pk) | Stable ID |
| `source_type` | enum | slack_message, gmail_thread, linear_issue, github_pr, meeting_transcript, posthog_insight, notion_page, doc_fragment |
| `source_system` | enum | slack, gmail, linear, github, askelephant, posthog, notion, local-docs |
| `external_id` | string | Source identifier |
| `source_url` | string | Deep link |
| `project_id` | string \| null | FK ProjectRegistry |
| `actor_person_ids` | string[] | Canonical participants |
| `occurred_at` | timestamp | Event/artifact time |
| `ingested_at` | timestamp | Ingestion time |
| `summary_snippet` | string \| null | Optional excerpt |
| `content_hash` | string \| null | De-dupe |
| `scope` | enum | org/team/private |
| `is_deleted_at_source` | boolean | Tombstone marker |

**Rule:** Evidence records are append-only; never overwrite historical truth.

---

## 4) Derived Knowledge Layer

### `DecisionRecord`

| Field | Type | Notes |
|---|---|---|
| `decision_id` | string (pk) | |
| `project_id` | string | FK ProjectRegistry |
| `title` | string | Decision title |
| `decision_statement` | string | Final decision |
| `rationale` | string | Why |
| `status` | enum | proposed, approved, superseded |
| `supersedes_decision_id` | string \| null | FK DecisionRecord |
| `superseded_by_decision_id` | string \| null | FK DecisionRecord |
| `decided_by_person_ids` | string[] | Who decided |
| `decided_at` | timestamp | |
| `evidence_ids` | string[] | REQUIRED provenance |
| `updated_at` | timestamp | |

### `ActionItemCandidate`

| Field | Type | Notes |
|---|---|---|
| `candidate_id` | string (pk) | |
| `project_id` | string | |
| `title` | string | Candidate action |
| `description` | string | Context |
| `proposed_owner_person_id` | string \| null | Suggested assignee |
| `due_date` | date \| null | Optional |
| `priority` | enum | P0-P3 |
| `confidence` | number | 0-1 |
| `state` | enum | extracted, triaged, committed, rejected |
| `target_system` | enum | linear, github, none |
| `target_external_id` | string \| null | Created issue/PR ID |
| `evidence_ids` | string[] | REQUIRED provenance |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

### `ProjectDossier`

| Field | Type | Notes |
|---|---|---|
| `dossier_id` | string (pk) | |
| `project_id` | string | |
| `as_of` | timestamp | Snapshot time |
| `summary` | string | High-level state |
| `open_loops` | jsonb | Structured unresolved threads |
| `risks` | jsonb | Risk list |
| `recent_decision_ids` | string[] | Decision refs |
| `measurement_readiness` | enum | instrumented, partial, missing |
| `evidence_ids` | string[] | REQUIRED provenance |
| `generated_by` | string | command/agent name |

### `InitiativeBrief`

| Field | Type | Notes |
|---|---|---|
| `brief_id` | string (pk) | |
| `project_id` | string | |
| `outcome_chain` | string | Feature → behavior → business result |
| `personas` | string[] | |
| `status_summary` | string | |
| `next_actions` | jsonb | Owner + due |
| `evidence_ids` | string[] | REQUIRED provenance |
| `as_of` | timestamp | |

---

## 5) Policy Memory (Behavior-Changing)

### `MetricsContract`

| Field | Type | Notes |
|---|---|---|
| `contract_id` | string (pk) | One per project |
| `project_id` | string | FK ProjectRegistry |
| `north_star_metric` | jsonb | {name, definition, unit, window, segmentation[]} |
| `instrumentation_spec` | jsonb | Required events/properties + mappings |
| `validation_status` | enum | instrumented, partial, missing |
| `gaps` | jsonb | Structured list of instrumentation gaps |
| `linked_linear_issue_ids` | string[] | Tickets for instrumentation work |
| `last_validated_at` | timestamp | |
| `validated_by` | string | command/agent/tool |

### `InstrumentationSpec` (embedded or normalized)

```json
{
  "required_events": [
    {
      "event_name": "string",
      "required_properties": ["workspace_id", "initiative_id"],
      "description": "why this event matters",
      "mapped_posthog_insight_ids": ["optional"],
      "mapped_dashboard_ids": ["optional"]
    }
  ]
}
```

---

## 6) Vector Index

### `MemoryEmbedding`

| Field | Type | Notes |
|---|---|---|
| `embedding_id` | string (pk) | |
| `entity_type` | enum | evidence, decision, dossier, brief |
| `entity_id` | string | FK reference |
| `chunk_index` | integer | |
| `text_chunk` | text | Embedded text |
| `embedding` | vector | pgvector |
| `project_id` | string \| null | Filterable |
| `scope` | enum | org/team/private |
| `created_at` | timestamp | |

---

## 7) Graph Projection Contract

Graph is computed from canonical tables:

- Node types: Person, Project, Decision, Evidence, Metric, Risk, ActionCandidate
- Edge types: owns, reported_by, backed_by, supersedes, blocks, references_metric

**Constraint:** every non-identity edge carries one or more `evidence_ids`.

---

## 8) Minimal API Object Examples

### `DecisionRecord` example

```json
{
  "decision_id": "dec_20260301_001",
  "project_id": "chief-of-staff-experience",
  "title": "Default to Overwatch-style summaries",
  "decision_statement": "Use opinionated defaults for summary generation",
  "status": "approved",
  "evidence_ids": [
    "evi_sig_2026_02_20_feedback",
    "evi_doc_chief_of_staff_design_principle"
  ],
  "decided_at": "2026-03-01T00:00:00Z"
}
```

### `MetricsContract` example

```json
{
  "contract_id": "metrics_chief-of-staff-experience",
  "project_id": "chief-of-staff-experience",
  "validation_status": "partial",
  "north_star_metric": {
    "name": "Approval-complete action loop rate",
    "definition": "% of extracted action items completed or explicitly deferred within 7 days",
    "unit": "percentage",
    "window": "7d",
    "segmentation": ["workspace", "persona", "initiative-surface"]
  },
  "linked_linear_issue_ids": []
}
```
