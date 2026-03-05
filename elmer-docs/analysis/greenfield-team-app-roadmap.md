# Greenfield Team App Roadmap (3–6 Months)

Date: 2026-02-01
Approach: Full rebuild (new runtime + UI), reuse docs/prompts as assets

## Phase 0: Foundations (Weeks 1–4)

**Goal:** SaaS-ready platform shell and core data model.

- Multi-tenant auth + RBAC
- Team/workspace management
- Data model: teams, users, initiatives, agents, runs, artifacts
- Artifact storage and audit logging

**Gate: Demo-ready**

- Create team, create initiative, persist docs and artifacts

## Phase 1: Agent Runtime + A2UI (Weeks 5–8)

**Goal:** First-class agent execution with transparent runs.

- Agent registry and config UI
- Run tracing, tool execution, and audit logs
- A2UI experience (presence, transparency, control)

**Gate: Internal alpha**

- Run a full agent workflow with traceable outputs and artifacts

## Phase 2: Initiative Lifecycle (Weeks 9–12)

**Goal:** Discovery -> validate workflow and prototype embedding.

- Planner/worker/judge wiring
- Board view with automation controls
- Embedded Storybook/Chromatic with feedback loop
- Validation gating and jury output

**Gate: Internal alpha+**

- End-to-end initiative loop on one real initiative

## Phase 3: Signals + Autonomy (Weeks 13–16)

**Goal:** Signal-driven workflows and automation.

- Transcript webhook intake
- Slack ingestion and L1–L4 routing
- L3 auto-initiative runner
- Daily/weekly digests

**Gate: External beta**

- Auto-create initiative from signal and notify stakeholders

## Phase 4: Shipping + Metrics (Weeks 17–20)

**Goal:** Metrics lifecycle and handoff to engineering.

- Linear project and issue creation
- PostHog metrics gating (alpha/beta/GA)
- Release readiness dashboard

**Gate: Product MVP**

- One initiative shipped to Linear with metrics gating

## Risk Controls

- Weekly scope checkpoints to avoid feature creep
- Hard gate on “prototype-first validation” before shipping
- Audit trail for all agent actions

## Success Criteria

- Discovery time reduced from weeks to days
- Validation happens before engineering tickets
- Agent runs are transparent and controllable
