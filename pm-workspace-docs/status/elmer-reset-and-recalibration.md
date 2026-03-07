# Elmer Reset And Recalibration

**Generated:** 2026-03-06  
**Audience:** Product, engineering, and agent builders working on Elmer  
**Primary inputs:** `AGENT-BRIEF.md`, `DEPLOYMENT.md`, `orchestrator/MIGRATION-READINESS.md`, `pm-workspace-docs/roadmap/roadmap-analysis.md`, `pm-workspace-docs/roadmap/elmer-sequenced-execution-checklist.md`, `pm-workspace-docs/status/ux-*.md`, and the live [Elmer Linear project](https://linear.app/askelephant/project/elmer-e42608f6079d/issues?layout=list&ordering=priority&grouping=workflowState&subGrouping=none&showCompletedIssues=all&showSubIssues=true&showTriageIssues=true)

## Objective
Reset Elmer around one coherent story: what the product is, what has been completed, what remains, and which artifacts agents should trust while the project moves from migration mode into completion mode.

## Executive Reset
Elmer is no longer in greenfield architecture mode. It is in finish-and-consolidate mode.

The three prior work threads converge on the same operating model:

1. Elmer is an AI-powered PM orchestrator that should compress discovery, reduce engineering waste, and keep humans in control through browser-native HITL.
2. The browser product should become project-first, not workspace-utility-first.
3. The system architecture should become Convex-first, with Clerk auth, Vercel hosting, and server-side agents.
4. The current critical path is reliability, deterministic test gates, and migration burn-down, not net-new Chat surface work.
5. Linear is the canonical implementation tracker. Repo docs should explain, reinforce, and operationalize the plan, not compete with it.

## What Elmer Is
Elmer is AskElephant's internal PM command center: a project-centric system where signals, documents, prototypes, validation, and agent work converge so the team can move from idea to validated output faster and with less rework.

The product vision still centers:

- discovery compression
- prototype-driven validation
- automated handoff into execution systems such as Linear
- iterative loops instead of waterfall
- human-in-the-loop control instead of black-box automation

## What Has Been Completed
Across the three threads and the current docs, the following work is clearly landed or substantially landed:

- The Convex rebuild foundation is in place across schema, agents, tools, MCP HTTP surfaces, and major runtime models.
- GitHub App and webhook setup are complete and verified.
- MCP UI apps are built.
- Playwright and the initial E2E scaffold are in place.
- The smoke suite was stabilized and reported green against `https://elmer.studio`.
- Route trust and canonical workspace-scoped project/document navigation were implemented as the first UX slice.
- The project cockpit direction is established:
  - `Projects` are the primary work surface
  - `Overview` is the default project landing tab
  - `Agents` are being reframed as a secondary catalog/admin surface
  - project-native active work has begun
- The migration program is no longer vague:
  - `orchestrator/MIGRATION-READINESS.md` exists
  - migration work is being executed in tranches
  - named blocker tickets `GTM-99` to `GTM-103` were created
- Core settings/auth parity is materially improved:
  - members
  - invitations
  - workspace save
  - activity feed
  - columns / graduation criteria
- Context parity is materially improved:
  - personas
  - signal-persona links
  - search
  - knowledgebase runtime bridging

## What Is In Progress
Live Linear and the current docs point to these active lanes:

### 1. Platform reliability
Still open and still first on the critical path:

- `GTM-94`
- `GTM-95`
- `GTM-96`
- `GTM-97`
- `GTM-98`

These remain the release gate for trustworthy auth and deployment behavior.

### 2. Minimum credible test baseline
This lane is real, but not complete.

Live issue evidence:

- `GTM-78` is `In Progress`
- `GTM-82` is `In Progress`
- `GTM-83` is `In Progress`
- `GTM-79`, `GTM-80`, `GTM-81`, `GTM-84`, `GTM-87`, `GTM-88`, and `GTM-91` are still open

Interpretation:
the scaffolding exists, but deterministic, release-gating coverage still needs to be finished.

### 3. Migration blocker burn-down
This is the main completion lane after reliability and testing:

- `GTM-59` remains the umbrella migration issue
- `GTM-99` to `GTM-103` are the named blocker tickets

The migration is now explicit, but not finished.

### 4. Team-safe operation
Initial blame-chain and presence work landed, but the milestone is not done:

- `GTM-69`
- `GTM-70`
- `GTM-55`
- `GTM-58`

### 5. UX progression
The project-first UX direction is clear and partially implemented, but the next major UX trust gap remains signal review and memory promotion.

## What Remains
The remaining work is best understood in milestone order:

1. Finish platform reliability and make auth/deployment trustworthy.
2. Finish the minimum credible test baseline beyond the smoke suite.
3. Burn down Phase 7 migration blockers and the remaining compatibility seams.
4. Finish team-safe operation for concurrent internal use.
5. Only then open the Chat / Agent Hub MVP lane.
6. After the MVP foundation is stable, build richer context-aware chat and artifact flows.

## Delivery Truth
The current completion story is not “build more foundations.” It is “finish the foundations cleanly enough that the product can be trusted.”

The strongest live Linear signals from the board are:

- Elmer is `In Progress`
- project health is `onTrack`
- project priority is `Urgent`
- project progress is about `41.9%`
- project scope is `71`

The highest-priority open issues visible in the live board cluster around:

- Phase 7 migration blockers: `GTM-99` to `GTM-103`
- reliability/auth debt: `GTM-94` to `GTM-98`
- deterministic E2E completion: `GTM-78` to `GTM-91`

That confirms the same critical path described in the architecture and roadmap docs.

## UX Truth
The UX work does not currently point toward a broad redesign. It points toward a clearer operating model:

- preserve the existing visual language
- make projects the cockpit
- make agents project-native before making them more global
- treat route trust as a prerequisite
- treat signal review and memory promotion as the next major UX trust boundary

This is aligned with the product vision because it improves clarity without drifting into “better notes” or generic dashboard behavior.

## Architecture Truth
The architecture is already decisively pointed in one direction:

- backend: Convex
- auth: Clerk
- hosting target: Vercel
- agents: server-side
- collaboration and HITL: browser-native

What remains is not architecture discovery. It is migration tail and consolidation:

- workspace shell tail
- project-detail compatibility seams
- legacy writer paths
- lingering settings/admin exceptions
- final production cutover boundaries

## Source Of Truth Rules
Use these rules going forward:

1. Linear is the canonical tracker for implementation status, issue state, sequencing, and what is currently done versus open.
2. `AGENT-BRIEF.md` is a strategic and architectural brief for agents. Its status sections are derived snapshots, not canonical tracking.
3. `DEPLOYMENT.md` is the operational runbook and release-gate reference, not the milestone tracker.
4. `pm-workspace-docs/roadmap/roadmap-analysis.md` is a derived interpretation of the Linear board.
5. `pm-workspace-docs/roadmap/elmer-sequenced-execution-checklist.md` is the execution checklist derived from the roadmap, not a replacement for Linear.
6. `pm-workspace-docs/status/ux-*.md` documents design and UX intent. They explain why and how, but not final execution truth.

## Drift Risks
These are the main risks of future agent drift:

- treating repo docs as live status instead of checking Linear first
- continuing to describe Elmer mainly as an infrastructure migration instead of an AI PM orchestrator
- letting transitional compatibility bridges linger without explicit ownership
- over-rotating into Chat / Agent Hub work before reliability, tests, and migration are ready
- letting stale artifacts remain discoverable without warning labels

## Non-Authoritative Or Stale Artifacts
The clearest stale artifact is:

- `pm-workspace-docs/roadmap/roadmap.md`

It currently reflects an unrelated empty initiative-style roadmap and should not be used for Elmer reset, sequencing, or implementation tracking.

## Recommended Next Execution Wave
Resume work in this order:

1. `GTM-94` to `GTM-98` — platform reliability
2. `GTM-78`, `GTM-79`, `GTM-80`, `GTM-81`, `GTM-82`, `GTM-83`, `GTM-84`, `GTM-87`, `GTM-88`, `GTM-91` — minimum credible test baseline
3. `GTM-59`, `GTM-99`, `GTM-100`, `GTM-101`, `GTM-102`, `GTM-103` — migration blocker burn-down
4. `GTM-55`, `GTM-58`, `GTM-69`, `GTM-70` — team-safe operation
5. `GTM-73`, `GTM-72`, `GTM-71` — Chat / Agent Hub MVP
6. `GTM-74`, `GTM-77`, `GTM-76`, `GTM-75` — context-rich chat and artifact flows

## Success Criteria For This Reset
This reset is successful if future agents can answer all of the following without guessing:

- What is Elmer?
- Why is the current sequencing the right sequencing?
- Which tracker is authoritative for execution status?
- Which docs are strategic versus operational versus derived?
- Which work is truly next?
- Which work is intentionally gated?
