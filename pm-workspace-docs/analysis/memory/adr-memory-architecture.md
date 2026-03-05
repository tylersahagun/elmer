# ADR: Product OS Shared Memory Architecture

- **Status:** Accepted (MVP)
- **Date:** 2026-03-01
- **Owner:** Product Ops / PM Workspace
- **Scope:** Org-wide shared memory for Head-of-Product + per-project PM agents

## Decision

Use a **canonical relational store (Postgres) + pgvector index** as the MVP architecture for Product OS memory.

This repository will treat external systems (Slack, Linear, Gmail, GitHub, AskElephant, Notion, PostHog) as systems of record, while storing:

1. immutable evidence references,
2. curated derived knowledge (decision records, dossiers, briefs),
3. operational memory state for agent workflows.

Knowledge graph views are a **projection layer**, not the source of truth.

## Context

We need memory that is:

- shareable across the org (not laptop-local),
- queryable by per-project PM agents and a portfolio-level Head-of-Product agent,
- provenance-safe (every high-impact claim backed by evidence links),
- able to enforce behavior-changing policy memory (Metrics Contract + PostHog readiness).

The selected pilot is **chief-of-staff-experience**.

## Options Considered

### 1) Vector DB only

**Pros**
- Fast semantic retrieval.

**Cons**
- Weak relational modeling for people/projects/ownership.
- Poor fit for supersession and audit requirements.
- Harder to enforce policy constraints (measurement readiness, approvals).

**Decision:** Rejected.

### 2) Postgres only (no vectors)

**Pros**
- Strong transactional and relational guarantees.

**Cons**
- Poor semantic retrieval for long-form docs/signals.
- Lower answer quality for natural language Q&A.

**Decision:** Rejected.

### 3) Relational DB + separate external vector DB

**Pros**
- Good separation.

**Cons**
- Extra ops surface area and consistency complexity for MVP.

**Decision:** Deferred.

### 4) **Postgres + pgvector (Chosen)**

**Pros**
- Single system for transactional truth + semantic retrieval.
- Easier governance, ACL, provenance joins, and migration.
- Strong fit for project/person/tool graph projection.

**Cons**
- Requires careful indexing/tuning at scale.

**Decision:** Accepted for MVP.

## Architecture Boundaries

### System of Record (not copied wholesale)

- Slack, Gmail, Linear, GitHub, AskElephant, Notion, PostHog

### Product OS Memory (owned here)

- Canonical entities: Person, Team/OrgUnit, ToolIdentity, ProjectRegistry, Initiative linkages
- Evidence layer: EvidenceItem pointers (+ optional snippets)
- Derived layer: DecisionRecord, ActionItemCandidate, ProjectDossier, InitiativeBrief
- Policy layer: MetricsContract + InstrumentationSpec + MeasurementReadiness

### Projection layer

- Knowledge graph nodes/edges for visualization
- Every edge stores supporting evidence IDs

## Migration Path

### MVP (30 days)

1. Define schema + contracts.
2. Add Project Registry generated from active initiative metadata.
3. Create metrics-contract stubs for all active initiatives.
4. Add `product-os-memory` MCP server stub + tool contracts.
5. Integrate command routing for `/metrics`, `/status`, `/status-all`, `/project-agent`, `/dossier`.

### Scale-up (60 days)

1. Add ingestion pipelines from Slack/Gmail/Linear/AskElephant.
2. Add dedupe, confidence scoring, and candidate→commit automation.
3. Add graph projection job and explorer API.

### Production hardening (90 days)

1. Add row-level scope controls (org/team/private).
2. Add retention and legal hold rules.
3. Add observability dashboards (latency, freshness, provenance coverage).
4. Add versioned migration strategy for schema evolution.

## Consequences

### Positive

- Strong data integrity and auditability.
- Better quality answers with evidence traceability.
- Enables behavior enforcement (metrics readiness) as memory policy.

### Tradeoffs

- More up-front schema design effort.
- Requires explicit ingestion discipline to avoid stale derived knowledge.

## Related Artifacts

- `pm-workspace-docs/analysis/memory/schema-memory.md`
- `pm-workspace-docs/analysis/memory/mcp-memory-tools.md`
- `pm-workspace-docs/analysis/memory/plan-memory-mvp.md`
- `pm-workspace-docs/runbooks/product-os-memory.md`
