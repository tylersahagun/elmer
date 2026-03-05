# Product OS Memory MCP Tool Contracts

## Principles

- Keep surface small: **8 tools**.
- All write tools require provenance fields.
- All read tools are scope-aware (`org`, `team`, `private`).
- Project-scoped queries use `project_id`.

---

## Tool 1 — `memory.upsert_evidence`

Create or idempotently update immutable evidence metadata.

### Input schema

```json
{
  "evidence_id": "string",
  "source_type": "slack_message|gmail_thread|linear_issue|github_pr|meeting_transcript|posthog_insight|notion_page|doc_fragment",
  "source_system": "slack|gmail|linear|github|askelephant|posthog|notion|local-docs",
  "external_id": "string",
  "source_url": "string",
  "project_id": "string|null",
  "actor_person_ids": ["string"],
  "occurred_at": "ISO-8601",
  "summary_snippet": "string|null",
  "scope": "org|team|private",
  "content_hash": "string|null"
}
```

### Output schema

```json
{
  "ok": true,
  "evidence_id": "string",
  "ingested_at": "ISO-8601"
}
```

---

## Tool 2 — `memory.write_derived`

Write a derived object with required provenance.

### Input schema

```json
{
  "kind": "decision_record|action_item_candidate|project_dossier|initiative_brief",
  "project_id": "string",
  "payload": {},
  "evidence_ids": ["string"],
  "scope": "org|team|private",
  "author": "string"
}
```

### Output schema

```json
{
  "ok": true,
  "kind": "string",
  "id": "string",
  "updated_at": "ISO-8601"
}
```

---

## Tool 3 — `memory.search`

Semantic + metadata retrieval over memory embeddings.

### Input schema

```json
{
  "query": "string",
  "project_id": "string|null",
  "scope": "org|team|private",
  "k": 8,
  "filters": {
    "entity_type": ["evidence|decision|dossier|brief"],
    "source_system": ["optional"],
    "since": "ISO-8601|null"
  }
}
```

### Output schema

```json
{
  "results": [
    {
      "entity_type": "string",
      "entity_id": "string",
      "score": 0.87,
      "snippet": "string",
      "evidence_ids": ["string"]
    }
  ]
}
```

---

## Tool 4 — `memory.get_project_dossier`

Get latest dossier snapshot for a project.

### Input schema

```json
{
  "project_id": "string",
  "as_of": "ISO-8601|null"
}
```

### Output schema

```json
{
  "project_id": "string",
  "as_of": "ISO-8601",
  "summary": "string",
  "open_loops": [],
  "risks": [],
  "measurement_readiness": "instrumented|partial|missing",
  "evidence_ids": ["string"]
}
```

---

## Tool 5 — `memory.get_person_dossier`

Cross-tool communication state and open loops for a stakeholder.

### Input schema

```json
{
  "person_id": "string",
  "project_id": "string|null",
  "window": "7d|14d|30d"
}
```

### Output schema

```json
{
  "person_id": "string",
  "window": "string",
  "signals": [],
  "open_loops": [],
  "recent_decisions": [],
  "evidence_ids": ["string"]
}
```

---

## Tool 6 — `memory.get_measurement_readiness`

Validate and fetch Metrics Contract readiness state.

### Input schema

```json
{
  "project_id": "string",
  "revalidate": true
}
```

### Output schema

```json
{
  "project_id": "string",
  "status": "instrumented|partial|missing",
  "last_validated_at": "ISO-8601|null",
  "gaps": [
    {
      "type": "missing_event|missing_property|missing_insight|missing_dashboard",
      "detail": "string",
      "severity": "high|medium|low"
    }
  ],
  "linked_linear_issue_ids": ["string"]
}
```

---

## Tool 7 — `memory.commit_candidate_to_linear`

Commit an action-item candidate into Linear (fully automated mode supported).

### Input schema

```json
{
  "candidate_id": "string",
  "team": "Product",
  "assignee": "string|null",
  "apply": true
}
```

### Output schema

```json
{
  "ok": true,
  "candidate_id": "string",
  "linear_issue_id": "string",
  "linear_identifier": "string"
}
```

---

## Tool 8 — `memory.get_graph_view`

Return graph projection nodes/edges (portfolio or project scoped).

### Input schema

```json
{
  "project_id": "string|null"
}
```

### Output schema

```json
{
  "ok": true,
  "as_of": "ISO-8601",
  "project_id": "string|null",
  "nodes": [
    {
      "id": "string",
      "type": "project|metric_contract|dossier|action_candidate|evidence",
      "label": "string",
      "project_id": "string|null",
      "metadata": {}
    }
  ],
  "edges": [
    {
      "id": "string",
      "source": "string",
      "target": "string",
      "type": "string",
      "evidence_ids": ["string"]
    }
  ]
}
```

---

## Error Contract

All tools return:

```json
{
  "ok": false,
  "error": {
    "code": "not_found|validation_error|scope_denied|dependency_unavailable|conflict",
    "message": "string",
    "details": {}
  }
}
```

---

## Example Flow: `/project-agent chief-of-staff-experience ...`

1. `memory.search` for recent evidence and open loops.
2. `memory.get_project_dossier` for latest synthesized view.
3. `memory.get_measurement_readiness` for guardrail status.
4. Answer includes evidence IDs + deep links + as-of timestamp.
