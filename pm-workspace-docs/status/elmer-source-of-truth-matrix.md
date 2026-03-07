# Elmer Source Of Truth Matrix

**Generated:** 2026-03-06  
**Purpose:** Make it explicit which artifacts agents should trust for execution status, strategy, architecture, and operations.

## Rules

1. If a doc and Linear disagree on implementation status, trust Linear first.
2. If a doc explains architecture, release gates, or UX intent, use it to understand the system, not to override current issue state.
3. If an artifact is stale or generic, label it clearly instead of letting it silently compete with the active roadmap.

## Matrix

| Artifact | Role | Trust level | What it should answer | Update rule |
|---|---|---|---|---|
| [Elmer Linear project](https://linear.app/askelephant/project/elmer-e42608f6079d/issues?layout=list&ordering=priority&grouping=workflowState&subGrouping=none&showCompletedIssues=all&showSubIssues=true&showTriageIssues=true) | Canonical implementation tracker | Canonical | Issue state, sequencing, blockers, milestones, current progress | Update whenever meaningful implementation progress lands |
| `AGENT-BRIEF.md` | Strategic + architectural brief for agents | High, but derived for status | What Elmer is, architecture direction, key phases, important constraints | Update when architecture or operating model changes; treat status text as a snapshot derived from Linear |
| `DEPLOYMENT.md` | Operational runbook | High for operations | Current deployment model, release gates, auth/deployment checks, cutover steps | Update when env/config/runbook behavior changes |
| `pm-workspace-docs/status/elmer-memory-cutover-contract.md` | Runtime context contract | High for migration and memory authority | What owns runtime context, what counts as a lens or mirror, and how cutover should behave | Update when runtime memory authority or fallback boundaries change |
| `orchestrator/MIGRATION-READINESS.md` | Migration contract | High | Which routes are migrate-now, blocked, or intentional-server-side | Update when migration blockers or route classifications change |
| `pm-workspace-docs/roadmap/roadmap-analysis.md` | Derived roadmap interpretation | Medium-high | Current milestone framing, critical path, completion definition | Regenerate or update when the Linear board meaningfully changes |
| `pm-workspace-docs/roadmap/elmer-sequenced-execution-checklist.md` | Derived execution checklist | Medium-high | Milestone gates, exit criteria, execution order | Update when the roadmap or acceptance criteria change |
| `pm-workspace-docs/status/ux-ui-review.md` | UX review artifact | High for design intent | Why the current UX is project-first, what is wrong with the current mental model | Update when UX strategy changes materially |
| `pm-workspace-docs/status/ux-priority-roadmap.md` | UX sequencing artifact | High for UX sequencing | UX work order, scope boundaries, rationale | Update when UX priorities change |
| `pm-workspace-docs/status/ux-release-gates.md` | UX acceptance gates | High for UX validation | What must pass before UX phases are considered safe | Update when validation rules change |
| `pm-workspace-docs/status/agent-experience-review.md` | Agent UX intent artifact | High for product shape | How agents should appear in the product experience | Update when agent interaction model changes |
| `pm-workspace-docs/status/elmer-reset-and-recalibration.md` | Reset summary | High | What Elmer is, what has been done, what remains, and how to avoid drift | Refresh after major roadmap resets |
| `pm-workspace-docs/roadmap/roadmap.md` | Generic auto-generated roadmap snapshot | Low / stale for Elmer | Nothing reliable for current Elmer execution | Do not use for Elmer planning until regenerated to match the active product |

## Practical Use

### Before doing work
- Check Linear for the current issue state.
- Use `AGENT-BRIEF.md` to understand the architecture and product frame.
- Use `pm-workspace-docs/status/elmer-memory-cutover-contract.md` when memory, search, personas, or knowledgebase authority is in question.
- Use `DEPLOYMENT.md` for release-gate and operational context.
- Use `MIGRATION-READINESS.md` and the roadmap docs for execution framing.

### Before proposing product changes
- Re-read the product vision and strategic guardrails.
- Confirm the work still supports discovery compression, reduced engineering waste, and human-in-the-loop control.

### Before reporting status
- Report issue truth from Linear.
- Report rationale and system shape from docs.
- Do not invent blended status if the two disagree. Resolve the disagreement or call it out explicitly.
