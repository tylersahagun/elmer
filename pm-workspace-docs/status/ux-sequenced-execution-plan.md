# UX Sequenced Execution Plan

## Objective
Turn the UX review and planning swarm outputs into a concrete, staged execution plan for Elmer's next product UX phases.

## Audience
Product, design, and engineering leads coordinating implementation across routing, project cockpit, agent experience, and memory-model work.

## Evidence Basis
- `pm-workspace-docs/status/ux-ui-review.md`
- `pm-workspace-docs/status/ux-flow-map.md`
- `pm-workspace-docs/status/agent-experience-review.md`
- `pm-workspace-docs/status/ux-priority-roadmap.md`
- `AGENT-BRIEF.md`

## Decision
Sequence UX work in five phases, with route trust and canonical navigation as the release gate before any larger IA changes.

## Rationale
The swarm agreed that the biggest UX risks are not just information architecture. They are also route instability, inconsistent canonical URLs, and hybrid project surfaces. If those remain unstable, later project-first and agent-first improvements will not feel trustworthy.

## Phase 0: Route Trust
### Goal
Re-establish navigation trust and canonical route behavior.

### Scope
- eliminate route/runtime failures
- standardize canonical project and document routes under workspace scope
- normalize remaining hardcoded legacy `/projects/...` callers
- add smoke and deep-link regression coverage

### Exit Criteria
- `login -> workspace -> project -> document -> back` works reliably
- canonical route helpers are the source of truth
- route-level regressions are protected by tests

## Phase 1: Portfolio Clarity
### Goal
Make the workspace clearly a portfolio surface that hands users into projects.

### Scope
- strengthen `Projects` framing in navigation and board entry
- demote quick preview relative to full project open
- preserve return/source context across workspace, project, and document flows

### Exit Criteria
- users can tell the board is for prioritization and routing
- project open is unambiguous and primary

## Phase 2: Project Cockpit Foundation
### Goal
Make the project page the obvious default work surface.

### Scope
- add `Overview` as the default tab
- add summary block with TL;DR, readiness, blockers, evidence summary, active work summary, and next action
- reduce `ProjectDetailModal` to preview-level behavior
- start converging the page toward `Overview`, `Evidence`, `Artifacts`, `Execution`, `History`

### Exit Criteria
- first paint of a project answers “what does this project need next?”
- modal and page no longer compete as peers

## Phase 3: Active Work And Approvals
### Goal
Make agents feel project-native and visible.

### Scope
- add a compact active work surface above the tab strip
- show active runs, current step, blockers, outputs, and pending approvals
- reframe command launching around project outcomes
- route detailed inspection into `ElmerPanel` / `Agent Hub`

### Exit Criteria
- project page becomes the default place to understand automation state
- HITL reads as project decisions, not generic interruptions

## Phase 4: Signal Review And Memory Promotion
### Goal
Make signals the trust boundary where raw evidence becomes accepted memory.

### Scope
- redesign signal review around `Evidence`, `AI reading`, and `Memory actions`
- expose AI reasoning, confidence, and memory impact
- separate suggested vs accepted relationships
- start using graph-backed provenance without forcing graph-heavy UI

### Exit Criteria
- users can review and promote evidence into trusted memory with provenance
- suggested relationships never look canonical by default

## Phase 5: Blocked-Surface Resolution
### Goal
Resolve migration-blocked surfaces and align memory storage contracts.

### Scope
- define explicit policy for `knowledgebase` and `personas`
- move persona relationships and related memory contracts toward Convex
- extend graph metadata for provenance and approval state

### Exit Criteria
- blocked surfaces are categorized as migrate-now, compatibility-only, or deferred
- future control-room work is building on stable contracts

## First 3 Slices
1. `Slice 1: Route Trust And Canonical Navigation`
2. `Slice 2: Cockpit Entry And Overview`
3. `Slice 3: Active Work And Approvals`

## Risks
- project detail may become more complex before compatibility debt is reduced
- route normalization may stall if hardcoded callers remain scattered
- agent UX may reintroduce competing patterns if old log surfaces remain primary
- memory UX may get blocked by unresolved personas/knowledgebase storage decisions

## Mitigations
- use route trust as the first gate
- keep `lib/projects/navigation.ts` as source of truth
- reuse existing UI components and data where possible
- phase larger structural changes after navigation and cockpit defaults stabilize

## Concrete Next Actions
1. Execute `Slice 1` first and do not broaden UX scope until route trust is restored.
2. Write and maintain slice-specific implementation docs under `pm-workspace-docs/status/slices/`.
3. Use the release gates in `ux-release-gates.md` as the acceptance checklist for every phase.
