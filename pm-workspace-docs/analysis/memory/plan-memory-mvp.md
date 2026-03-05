# Product OS Memory MVP Plan

## Objective

Ship an org-wide shared memory foundation that powers:

- Head-of-Product portfolio intelligence,
- per-project PM agents,
- metrics instrumentation guardrails with PostHog readiness enforcement,
- evidence-backed outputs for operational trust.

Pilot initiative: **chief-of-staff-experience**.

---

## Scope (MVP)

### In scope

1. Canonical memory architecture docs and schema.
2. Project Registry generated from active initiative metadata.
3. Metrics Contract per active initiative.
4. `product-os-memory` MCP server contract + local stub.
5. Command and subagent wiring:
   - `/project-agent`
   - `/dossier`
   - readiness sections in `/metrics`, `/status`, `/status-all`
6. New desktop app scaffold (`product-os-desktop`) as flagship control-plane shell.
7. Fully automated candidate-to-Linear flow (no manual gate in MVP).

### Out of scope (post-MVP)

- Full production ingestion workers for all external systems.
- Multi-tenant auth/SSO hardening.
- High-scale graph query optimization.

---

## Work Breakdown

## Track A — Contracts and Data Model

- [x] ADR decision and schema contracts
- [x] MCP tool contracts
- [x] Runbooks for retention/scope/provenance

## Track B — Registry and Metrics Guardrail

- [x] Generate `project-registry.json` from initiative metadata
- [x] Add maintenance validation for registry + metrics-contract coverage
- [x] Scaffold `metrics-contract.json` for each active initiative
- [x] Define readiness rubric and standard gap taxonomy

## Track C — Agent Experience

- [x] Add `/project-agent <initiative> <question>`
- [x] Add `/dossier <initiative>`
- [x] Add dossier output snapshots under `pm-workspace-docs/status/projects/`
- [x] Include evidence refs and as-of timestamps by default

## Track D — MCP Integration

- [x] Add `.cursor/mcp.json` with `product-os-memory` server
- [x] Add local server stub in `packages/product-os-memory/`
- [x] Wire command docs to use memory tools

## Track E — New Desktop Surface

- [x] Create new app shell `product-os-desktop/` (do not extend legacy command-center)
- [x] Add views for:
  - Project selector
  - PM agent chat panel
  - Dossier + open loops
  - Measurement readiness card
  - Knowledge graph panel (projection-backed)

## Validation Harness

- [x] Gold query set documented in `gold-queries.md`
- [x] Graph integrity/performance audit script
- [x] Full suite runner:
  - `pm-workspace-docs/scripts/memory/run_mvp_validation_suite.py`

---

## 30 / 60 / 90 Day Roadmap

## 30 days (MVP operating)

- Registry + metrics contracts in repo
- Memory MCP stub callable
- Project agent + dossier commands documented and runnable
- Chief-of-staff pilot dossier generated automatically

## 60 days (automation depth)

- Automated evidence ingestion from Slack/Gmail/Linear/AskElephant
- Candidate dedupe and confidence calibration
- Graph projection pipeline with evidence-backed edges

## 90 days (production hardening)

- Scope-aware access controls and audit logs
- Retention/expiry enforcement
- Dashboarded SLOs: freshness, provenance coverage, query latency, readiness coverage

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Metadata inconsistency in `_meta.json` | Broken registry generation | Add schema fallback + validation report |
| Tool sprawl in memory MCP | High complexity | Strict 8-tool cap for MVP |
| False confidence in metrics readiness | Poor launch decisions | Always show status + top gaps + evidence links |
| Automation creating noisy Linear tickets | Team fatigue | Candidate dedupe + deterministic title hashing |

---

## Success Metrics

1. 100% active initiatives appear in Project Registry.
2. 100% active initiatives have `metrics-contract.json`.
3. `/status` and `/status-all` include Measurement Readiness by default.
4. Chief-of-staff pilot has daily dossier snapshot generation.
5. At least one end-to-end candidate→Linear automated commit path validated.
