# Build Strategy Recommendation (Product-Grade MVP)

Date: 2026-02-01
Goal: Decide between incremental build on `orchestrator` vs greenfield for a SaaS-ready team app.

## Executive Recommendation

**Choose a hybrid path: greenfield UI and product surface with incremental reuse of the orchestrator runtime and data model.** This maximizes speed to product-grade MVP while preserving proven execution systems (jobs, tools, stage recipes) and avoiding UX/architecture constraints in the current app shell.

This is not "start over," nor "just extend the current app." It is a **strangler approach**: keep the runtime, replace the surface.

## Current Orchestrator Parity: What To Reuse vs Rebuild

### Reusable strengths (retain and wrap)

- **Execution backbone**: job/run tracking (`stageRuns`, `runLogs`, `artifacts`).
- **Skill + stage recipe system**: prompt scaffolding and automation flow.
- **Tool execution**: integrations and tool abstraction.
- **Workspace isolation**: multi-tenant primitives at workspace level.
- **GitHub writeback foundations**: repo linking and file browsing.

### Gaps that block product-grade MVP (rebuild or re-architect)

- **Command parity**: missing `/status`, `/roadmap`, `/iterate`, `/context-proto`, `/admin`, `/posthog`, sync workflows.
- **Agent control**: no first-class agent configuration UI or editing.
- **Signal and intake**: ingestion and synthesis are partial, not surfaced as artifacts.
- **Prototype experience**: missing embedded Storybook/Chromatic and feedback loop.
- **Validation gating**: jury results exist but not enforced in lifecycle.
- **Metrics lifecycle**: PostHog integration and alpha/beta/GA gating missing.
- **Visual system**: current UI not aligned to glassmorphic minimalism.

## Build Strategy Comparison

### Option A: Incremental on `orchestrator`

**Pros**

- Reuse existing execution engine and data model immediately.
- Faster access to existing integrations and job pipeline.
- Lower migration risk for backend logic.

**Cons**

- UI/UX constraints and legacy patterns slow down A2UI experience.
- Risk of accumulating UX debt that conflicts with product vision.
- Refactoring cost can exceed greenfield UI build.

**Best for**: internal MVP, if product-grade feel is not required.

### Option B: Greenfield (rebuild everything)

**Pros**

- Clean architecture aligned to A2UI and SaaS requirements.
- Full control over data model, workflows, and UX.
- Easier to bake in multi-tenant product-grade foundations.

**Cons**

- Slower time-to-value and higher reimplementation cost.
- Risk of duplicating what already works in orchestrator.

**Best for**: large team, runway for 6-9 months, or if runtime is unsuitable.

### Option C: Hybrid (Recommended)

**Approach**: Build a new product UI and API surface while **reusing the orchestrator runtime** as the agent execution layer. Migrate to a shared data model over time.

**Pros**

- Fast path to product-grade UX and A2UI patterns.
- Avoids rewriting the execution backbone.
- Allows gradual migration and controlled de-risking.

**Cons**

- Requires clear boundary and API contract between UI and runtime.
- Needs a migration plan for data model and artifacts.

## Recommendation Rationale

The orchestrator already contains valuable execution primitives, but product-grade UX and multi-agent configuration need a clean UI surface. A hybrid approach captures the runtime strengths without being constrained by current UI limitations. This best aligns with the product vision: minimal, glassmorphic, prototype-first, and human-controlled automation.

## Proposed Roadmap (Hybrid)

### Phase 0: Foundations (4-6 weeks)

**Goal**: SaaS-ready platform shell with identity, teams, and artifact storage.

- Multi-tenant auth + RBAC + audit logs.
- Team/workspace management and API boundaries.
- Artifact storage and repo writeback pipeline.
  **Gate**: demo-ready with team creation and basic initiative view.

### Phase 1: Agent Runtime Surface (4-6 weeks)

**Goal**: A2UI agent experience, agent library, and run tracing.

- Agent identity + configuration UI (model, tools, memory).
- Streaming runs with tool traces and citations.
- Planner/worker/judge workflow wiring.
  **Gate**: end-to-end agent run with judgment and artifact output.

### Phase 2: Initiative Lifecycle (4-6 weeks)

**Goal**: full discovery -> validate loop with embedded prototypes.

- Board with automation controls per stage.
- Doc studio and artifact linking.
- Embedded Storybook/Chromatic with feedback capture.
  **Gate**: complete loop on one initiative (research -> proto -> validate).

### Phase 3: Signals + Autonomy (4-6 weeks)

**Goal**: signal ingestion and L1-L4 routing to initiatives.

- Intake pipeline from Slack/HubSpot/Linear/transcripts.
- Signal router and synthesis artifacts.
- L3 autonomous initiative runner.
  **Gate**: weekly digest and auto-created initiative from signal.

### Phase 4: Metrics + Shipping (3-4 weeks)

**Goal**: alpha/beta/GA gating and Linear shipping.

- PostHog integration with lifecycle gating.
- Linear project/issue generation from validated initiatives.
  **Gate**: one initiative shipped to Linear with metrics gates.

## No-Regrets Foundations

- Multi-tenant schema and strict data isolation.
- Agent configuration model (identity, tools, memory, policy).
- Audit logs and run tracing for every agent action.
- Repo-first artifact writeback across all workflows.

## Decision Gates

1. **Demo-ready**: end-to-end agent run with artifacts.
2. **Internal alpha**: full initiative loop with prototype validation.
3. **External beta**: signal-driven workflow and team usage.

## Summary

For a product-grade MVP, the hybrid approach provides the best balance of speed, leverage, and UX quality. It preserves the proven orchestration engine while allowing a clean, A2UI-first product surface that meets the SaaS bar.
