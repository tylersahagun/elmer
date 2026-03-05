# Cursor-Native Agentic Revamp Plan

Date: 2026-02-01  
Owner: Tyler Sahagun  
Status: Draft

## Goal

Recreate as much of the full agentic product flow as possible **inside Cursor** without a web app: stage-based progression, autonomous agent runs, shared context, signal ingestion, and metrics gates.

## Non-goals

- Multi-user real-time UI collaboration
- A2UI visual layer (avatars, action cards) beyond text summaries
- External stakeholder access without repo access

## Core Concept

Treat the repository as the application runtime. The workflow engine, automation policies, and project state live in files. A new **orchestrator agent** advances stages, runs workers in parallel, and invokes a **judge agent** to validate outputs before moving forward.

---

## Phase 1 — Workflow Engine (2–3 weeks)

**Objective:** Establish stage-based progression and configuration.

### New Files

- `pm-workspace-docs/workflows/workflow.yaml`
- `pm-workspace-docs/workflows/automation-policies.yaml`
- `pm-workspace-docs/workflows/metrics-gates.yaml`
- `pm-workspace-docs/projects/<project>/state.json`

### Checklist

- [ ] Define stage graph (discovery → docs → prototype → validate → build → release → metrics)
- [ ] Add iteration loops (PRD ↔ validate, prototype ↔ validate)
- [ ] Add autonomy levels per stage (auto, human gate, or manual)
- [ ] Add confidence scoring rules per stage

---

## Phase 2 — Orchestrator + A2A-Style Parallelism (3–4 weeks)

**Objective:** Planner/Worker/Validator orchestration with parallel execution.

### New/Updated Agents

- `.cursor/agents/orchestrator.md`
- `.cursor/agents/goal-planner.md`
- `.cursor/agents/work-judge.md`
- Update existing worker agents to emit structured outputs

### Checklist

- [ ] Orchestrator reads workflow config and project state
- [ ] Planner decomposes tasks when needed
- [ ] Orchestrator runs workers in parallel (multi-agent calls)
- [ ] Judge validates outputs and returns verdict + next step
- [ ] Orchestrator writes results + transitions stage state

---

## Phase 3 — Signal Ingestion + Autonomy Loop (2–3 weeks)

**Objective:** End-to-end signal routing and automated initiative creation.

### New Files / Agents

- `pm-workspace-docs/inbox/` (raw inputs)
- `.cursor/agents/signal-ingester.md`
- `.cursor/agents/signal-router.md`
- `.cursor/agents/initiative-runner.md`
- `.cursor/agents/ship-runner.md`

### Checklist

- [ ] Poll Slack/Linear/HubSpot via MCP on a schedule
- [ ] Accept AskElephant transcripts via local webhook receiver
- [ ] Route signals into L1–L4 levels
- [ ] Auto-create PRD/prototype/validate for L3
- [ ] Gate L4 (ship) with manual approval

---

## Phase 4 — Knowledge Base + Multi-Repo Support (2–3 weeks)

**Objective:** Workspace context mirrors `pm-workspace-docs` and supports multiple repos.

### New Files

- `pm-workspace-docs/workspace-config.yaml`

### Checklist

- [ ] Map knowledge domains (company-context, personas, signals, initiatives)
- [ ] Support multiple GitHub repos per workspace
- [ ] Add submodule-aware prototype output routing
- [ ] Ensure atomic commits for agent-generated artifacts

---

## Phase 5 — Cursor UX Layer (1–2 weeks)

**Objective:** Simulate the app’s “stage progression” feel with CLI + markdown dashboards.

### New Files

- `pm-workspace-docs/status/workflow/dashboards/workflow-dashboard.md`
- `pm-workspace-docs/status/workflow/initiatives/project-<name>.md`

### Checklist

- [ ] Auto-generate per-project status dashboards
- [ ] Display confidence scores + iteration warnings
- [ ] Provide next-action recommendations
- [ ] Enable sidebar chat agent to answer: “What’s stuck?” / “What’s next?”

---

## Minimal CLI Workflow (Example)

1. Drop transcript into `pm-workspace-docs/inbox/`
2. Run `/ingest` → signal routed to L1–L4
3. Orchestrator triggers stage progression
4. Judge validates output, updates `state.json`
5. Dashboard reflects progress and next steps

---

## Required Config Templates (Skeleton)

**`workflow.yaml`**

```yaml
stages:
  - id: discovery
    next: docs
    agents: [research-analyzer]
  - id: docs
    next: prototype
    agents: [prd-writer, design-brief]
    iterate_with: validate
  - id: prototype
    next: validate
    agents: [proto-builder]
  - id: validate
    next: build
    agents: [validator]
  - id: build
    next: release
    agents: [ship-runner]
  - id: release
    next: metrics
    agents: [posthog-analyst]
```

---

## Expected Outcome

By the end of Phase 5, you will have:

- Automated project progression across stages
- Parallelized agent execution (A2A-style)
- Signal-driven intake with L1–L4 routing
- Repo-native knowledge base with traceable artifacts
- Stage-based dashboards that mirror the “workflow feel” of a product app

---

## Next Step

If you want, I can now generate the actual **workflow configs**, **orchestrator agent**, and **signal ingestion agents** in the repo.
