# Flagship Product OS Swarm Kickoff — 2026-03-01

## Objective

Execute the next flagship phase with a coordinated four-lane swarm:

1. shared memory productionization
2. live external integrations
3. runtime + agent observability
4. desktop control-plane experience

## Lane Ownership

| Lane | Owner Agent Pattern | Focus |
| --- | --- | --- |
| Memory Platform | workspace-admin + signals-processor | Postgres+pgvector migration contract, memory service auth/scope, evidence model integrity |
| Integrations | slack-monitor + gmail-monitor + linear-triage | Slack/Gmail/Linear/GitHub normalized ingestion with idempotent cursors |
| Agent Runtime | project-pm-agent + head-of-product-agent | Dossier/open-loop runtime, task lifecycle conventions, run observability contracts |
| Desktop UX | context-proto-builder + proto-builder | Portfolio map, org view, agent view, graph/drilldown experience |

## P0 Backlog (Current Wave)

- [ ] Production Product OS memory backend contract + migration scaffold
- [ ] Authenticated MCP access pattern for shared team usage
- [ ] Canonical identity mapping (Person ↔ tool identities)
- [ ] Live evidence sync for pilot project connectors
- [ ] Woody dossier computed output contract
- [ ] Metrics readiness guardrail enforcement with remediation links

## Phase Breakdown

### Wave 1 — Foundation
- Memory platform + Integrations lanes deliver ingestion + identity + scopes.

### Wave 2 — Runtime
- Agent runtime lane delivers dossier/open-loop contracts and task lifecycle status semantics.

### Wave 3 — Experience
- Desktop lane integrates portfolio map + org + agent views and validates end-to-end.

## Validation Gate

```bash
python3 pm-workspace-docs/scripts/memory/run_mvp_validation_suite.py
npm run lint --prefix product-os-desktop
```

## Evidence Expectations

Every lane output must include:
- `as_of` timestamp
- evidence references or explicit evidence gap
- owner and next action

## Blockers

No blockers captured at kickoff.
