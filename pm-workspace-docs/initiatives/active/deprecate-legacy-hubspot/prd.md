# Deprecate Deprecating the Pipe Dream PRD

## Overview

- **Owner:** Tyler
- **Target Release:** TBD
- **Status:** Draft
- **Strategic Pillar:** Customer Trust

## Outcome Chain

Deprecate Pipedream integrations and replace with Composio
→ so that integrations connect reliably and transparently
→ so that workflows and chats execute without auth failures
→ so that teams trust automation and expand usage

## Problem Statement

We rely on Pipedream-based integrations for key tools, but the vendor transition and current auth UX create reliability and trust risks. We need parity between Pipedream and Composio, clarity on auth scope (workspace vs user), and workflow compatibility so automation remains dependable.

### Evidence

- [ ] User quotes
- [ ] Churn/support data
- [x] Internal vendor issues (Pipedream replacement + reliability concerns)
- [ ] Competitive pressure

## Goals & Non-Goals

### Goals (Measurable)

- [ ] Restore/maintain integration parity for Pipedream-supported tools under Composio.
- [ ] Improve integration connection success rate and reduce auth-related failures.
- [ ] Enable Composio tools inside workflow-initiated chats with clear auth scope.

### Non-Goals

- Building an in-house integration platform (we are switching vendors, not replacing them).
- Expanding to new integrations beyond parity in this phase.

## User Personas

### Primary: RevOps

- **Job-to-be-done:** Keep integrations and automations reliable across the org.
- **Current pain:** Inconsistent auth behavior; workflow execution failures.
- **Success looks like:** Stable connections; clear auth scope; fewer failures.
- **Trust factors:** Transparent attribution, auditability, predictable behavior.

### Secondary: Sales Representative

- **Job-to-be-done:** Use chat/workflows without broken actions.
- **Current pain:** Automations fail or appear as the wrong identity.
- **Success looks like:** Personal tools work when needed; no surprise auth.
- **Trust factors:** Clear "who did this" and recoverable errors.

### Tertiary: Sales Leader

- **Job-to-be-done:** Adopt team automation without risk.
- **Current pain:** Trust debt from integration failures.
- **Success looks like:** Stable workflows and clear ownership.
- **Trust factors:** Reliability and audit trails.

## User Stories (Per Persona - REQUIRED)

### Primary Persona Stories

- As a RevOps lead, I want Composio to cover our existing integrations so that workflows don’t break during the vendor transition.
- As a RevOps lead, I want clear workspace vs user auth scope so that I can enforce compliant automation.

### Secondary Persona Stories

- As a Sales Rep, I want my personal tools to connect without admin confusion so that I can trust automated actions.

### Tertiary Persona Stories

- As a Sales Leader, I want automation to be reliable so that I can encourage adoption without support escalations.

## Shared Customer Journey

### Current State (Pain Points)

1. Admin reviews workflows → unsure which integrations are stable.
2. Admin connects tools → auth scope is unclear.
3. Workflow runs → failures or wrong identity cause distrust.

### Future State (With Feature)

1. Admin sees parity status and connection health.
2. Admin selects workspace vs user auth explicitly.
3. Workflows run with Composio tools and consistent attribution.

### Transformation Moment

Admin enables a workflow and sees it run consistently without auth errors or identity confusion.

## Requirements

### Must Have (MVP)

- Parity map and migration plan for all Pipedream integrations.
- Composio tooling enabled for existing Pipedream integrations (where supported).
- Clear auth scope rules for workflow-initiated runs.
- Connection success and failure tracking for Composio auth.

### Should Have

- UI affordances for Composio connection state and scope.
- Migration utilities for existing Pipedream connections.

### Could Have

- Dual-run safety period (Pipedream + Composio) per integration.
- Automated detection of Composio parity gaps.

## User Flows

### Flow: Connect Integration (Admin)

**Trigger:** Admin visits Integrations settings page.
**Steps:** Select integration → choose workspace/user auth → connect → verify status.
**Outcome:** Integration connected with explicit scope and visible state.
**Error states:** OAuth failure, scope mismatch, vendor outage.
**Trust recovery:** Clear error messaging + retry + fallback guidance.

### Flow: Workflow Run (System)

**Trigger:** Workflow executes in chat context.
**Steps:** Resolve auth scope → invoke Composio tool → log outcome.
**Outcome:** Workflow action succeeds with correct attribution.
**Error states:** Missing auth, tool not enabled.
**Trust recovery:** Surface failure reason + action required.

## Trust & Privacy Considerations

- Auth scope must prevent accidental use of personal credentials at workspace scope.
- Workflow runs should log attribution to prevent “who did this?” confusion.

## Success Metrics

- **North star:** Workflow action success rate for Composio integrations.
- **Leading indicators:** Connection success rate, auth-scope selection completion rate, parity coverage %.
- **Guardrails:** Support tickets tied to “auth confusion” do not increase.

## Strategic Alignment

- [x] Outcome chain complete
- [x] Persona identified
- [x] Trust implications assessed
- [x] Not in anti-vision territory

## Open Questions

- Which integrations are required for parity in Phase 1?
- Should Composio connection state be modeled in `integration_connections`?
- What migration path best preserves existing Pipedream connections?
