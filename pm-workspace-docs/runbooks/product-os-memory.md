# Runbook: Product OS Memory

## Purpose

Define what belongs in Product OS shared memory, how provenance works, and how retention/scope are enforced.

## Data Placement Policy

### Keep in source systems (SoR)

- Raw Slack message history
- Full Gmail thread bodies
- Full Linear/GitHub issue payloads
- Raw PostHog events
- AskElephant full transcript payloads

### Store in Product OS memory

1. Evidence pointers and metadata (+ optional snippets)
2. Derived objects:
   - DecisionRecord
   - ActionItemCandidate
   - ProjectDossier
   - InitiativeBrief
3. Metrics Contracts and readiness state
4. Canonical entity mapping (people, projects, tool identities)

---

## Provenance Requirements

Every derived object must include:

- `evidence_ids[]` (non-empty for high-impact records),
- `as_of` timestamp,
- `generated_by` command/agent identifier.

If no supporting evidence exists, explicitly mark:

```json
{
  "evidence_gap": true,
  "gap_reason": "No source artifacts linked yet"
}
```

---

## Scope and Visibility

Scopes:

- `org` — visible to all authorized workspace members
- `team` — visible to designated team members
- `private` — visible only to requestor + explicit delegates

Default scopes:

| Object | Default Scope |
|---|---|
| ProjectRegistry | org |
| EvidenceItem (initiative-linked) | team |
| DecisionRecord | team |
| ProjectDossier | team |
| MetricsContract | org |
| Person dossier with sensitive notes | private |

Runtime enforcement (local MCP server):

- `PRODUCT_OS_MEMORY_ALLOWED_SCOPES` (comma-separated)
- Example: `org,team` disables `private` queries/writes and returns `scope_denied`.

---

## Retention Policy (MVP)

| Record Type | Retention |
|---|---|
| Evidence pointers | 24 months (or mirror source policy) |
| Derived records | 24 months, then archival snapshot |
| Metrics contracts | Permanent by initiative lifecycle |
| Action candidates | 12 months after resolution |
| Embedding chunks | Rebuildable; purge and regenerate allowed |

If source data is deleted/expired, mark evidence tombstoned but keep historical reference.

---

## Write Rules

1. `memory.upsert_evidence` is idempotent by `evidence_id` or content hash.
2. `memory.write_derived` must reject missing `project_id`.
3. `memory.write_derived` should reject empty provenance for:
   - DecisionRecord
   - ActionItemCandidate
4. `memory.commit_candidate_to_linear` records target issue ID and transitions candidate state.

---

## Operational Procedures

## Daily

- Regenerate project dossiers for active P0/P1 initiatives.
- Revalidate metrics readiness for initiatives touched in the last 24h.
- Sync incoming signals into evidence store:
  - `python3 pm-workspace-docs/scripts/memory/sync_signals_to_memory.py`
- Sync status digests into evidence store:
  - `python3 pm-workspace-docs/scripts/memory/sync_status_digests_to_memory.py`
- Refresh deduped action candidates:
  - `python3 pm-workspace-docs/scripts/memory/generate_action_candidates.py`
- Auto-commit high-priority instrumentation candidates:
  - `python3 pm-workspace-docs/scripts/memory/auto_commit_instrumentation_candidates.py`

## Weekly

- Run registry coverage checks.
- Audit evidence-provenance coverage for new decisions.
- Review stale open loops >14 days.
- Rebuild graph projection:
  - `python3 pm-workspace-docs/scripts/memory/build_graph_projection.py`
- Validate graph provenance and query timings:
  - `python3 pm-workspace-docs/scripts/memory/validate_graph_projection.py`
- Run full MVP validation harness:
  - `python3 pm-workspace-docs/scripts/memory/run_mvp_validation_suite.py`

## Incident handling

If memory service unavailable:

1. Commands degrade to file-system-only context.
2. Status output must include:
   - "Memory service unavailable"
   - timestamp
   - impacted capabilities

---

## Security and Compliance

- Never store secrets/tokens in memory records.
- Redact PII in snippets when source requires restricted access.
- Preserve audit trails for all write operations:
  - who
  - when
  - what object
  - project scope
- Auto-commit instrumentation operations append daily logs at:
  - `pm-workspace-docs/status/memory-graph/auto-commit-log-YYYY-MM-DD.jsonl`

---

## References

- `pm-workspace-docs/analysis/memory/schema-memory.md`
- `pm-workspace-docs/analysis/memory/mcp-memory-tools.md`
- `pm-workspace-docs/runbooks/metrics-contract.md`
