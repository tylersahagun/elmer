# Elmer Roadmap Analysis

**Generated:** 2026-03-06
**Sources:** `AGENT-BRIEF.md`, `DEPLOYMENT.md`, `orchestrator/MIGRATION-READINESS.md`, Linear project `Elmer`
**Source of truth:** Linear is canonical for implementation status. This document is a derived interpretation of the board.

See also: `pm-workspace-docs/roadmap/elmer-sequenced-execution-checklist.md`

## Current State

Elmer is past the foundational Convex rebuild phase and is now in the completion phase where platform reliability, deterministic testing, and the Convex cutover matter more than net-new feature volume.

- Phases 0-5 are substantially complete
- Phase 6 has meaningful in-flight progress via blame-chain attribution and minimal live presence
- Phase 7 has moved from vague migration intent into explicit route-level execution
- Phase 8 Chat remains intentionally gated behind migration stability
- Phase 9 test infrastructure exists, but the minimum credible release gate is not done yet

## Linear Snapshot

At the time of this analysis, the Elmer Linear project shows:

- `28` issues in `Done`
- `7` issues in `In Progress`
- `12` issues in `Todo`
- `19` issues in `Backlog`
- `1` issue in `Canceled`

Live project metadata at reset time:

- status: `In Progress`
- health: `onTrack`
- priority: `Urgent`
- progress: about `41.9%`
- scope: `71`

Interpretation:

- `35` issues are `Done` or `In Progress`
- `31` issues remain in `Todo` or `Backlog`
- `38` issues are not yet `Done`
- `1` issue was explicitly canceled because it was superseded by a broader test suite

## Roadmap Changes Made

The roadmap needed to move from broad epics to executable blocker tickets. The following Linear changes were made:

- Canceled `GTM-68` because it is superseded by `GTM-83`
- Created `GTM-99`: personas + knowledgebase data-model decision
- Created `GTM-100`: Convex search strategy for documents + memory
- Created `GTM-101`: connected-account + GitHub integration state for settings
- Created `GTM-102`: workspace membership + invitation parity in Convex
- Created `GTM-103`: project detail page parity for docs, signals, prototypes, and graduation

These tickets turn the migration epic into a real burn-down plan instead of a single catch-all phase marker.

## Critical Path

The project should complete in this order:

1. Platform reliability
2. Deterministic E2E and test gates
3. Convex migration blocker burn-down
4. Team-safe multi-user operation
5. Chat / Agent Hub foundation
6. Context-rich chat and artifact workflows

This order aligns with the product vision because it reduces engineering waste first and postpones the highest-variance UX surface until the operational foundation is trustworthy.

## Milestones

### Milestone 1 — Stabilize Auth And Deployment

**Issues:** `GTM-94`, `GTM-95`, `GTM-96`, `GTM-97`, `GTM-98`

Exit criteria:

- `elmer.studio/login` loads reliably
- Clerk frontend API host, app origin, and Convex envs are aligned
- `npm run check:auth` is usable as a release gate
- Docs reflect the actual current deployment model

### Milestone 2 — Finish The Minimum Credible Test Baseline

**Issues:** `GTM-78`, `GTM-79`, `GTM-80`, `GTM-81`, `GTM-82`, `GTM-83`, `GTM-84`, `GTM-87`, `GTM-88`, `GTM-91`

Exit criteria:

- Workspace navigation, signal inbox, and agent execution are covered by deterministic E2E tests
- Test seeding does not depend on manual state
- CI can run the minimum smoke suite against the intended environment

### Milestone 3 — Complete The Named Convex Migration Blockers

**Issues:** `GTM-59`, `GTM-99`, `GTM-100`, `GTM-101`, `GTM-102`, `GTM-103`

Exit criteria:

- Remaining blockers are either migrated or explicitly marked intentional server-side
- The first migration tranche is stable on the highest-traffic routes
- Settings, search, and project detail have concrete implementation paths

### Milestone 4 — Finish Team-Safe Operation

**Issues:** `GTM-55`, `GTM-58`, `GTM-69`, `GTM-70`

Exit criteria:

- Every agent run is attributable end-to-end
- Presence is visible in the core collaboration surfaces
- The orchestrator can surface project health and proposals
- The internal AskElephant team can use Elmer concurrently with low ambiguity

### Milestone 5 — Ship Chat / Agent Hub MVP

**Issues:** `GTM-73`, `GTM-72`, `GTM-71`

Exit criteria:

- Persistent chat threads exist in Convex
- ElmerPanel shell works as the new operator surface
- Agent Hub supports live status, HITL routing, and trace navigation

### Milestone 6 — Add Context-Rich Chat

**Issues:** `GTM-74`, `GTM-77`, `GTM-76`, `GTM-75`

Exit criteria:

- Chat can pull full workspace context
- Entity previews and artifact discussion flows work
- Chat becomes meaningfully better than the legacy sidebar it replaces

## Deferred / Non-Blocking Follow-Ons

These are useful, but they should not block internal completion unless priorities shift:

- `GTM-37`
- `GTM-42`
- `GTM-53`
- `GTM-56`
- `GTM-57`
- `GTM-60`
- `GTM-85`
- `GTM-86`
- `GTM-89`
- `GTM-92`

## Working Definition Of "Project Complete"

For the internal AskElephant use case, Elmer should be considered complete enough when:

- The public and local auth paths are reliable
- The core daily routes are Convex-native or intentionally server-side
- The test baseline catches regressions before they ship
- The team can safely collaborate in the app
- The Chat / Agent Hub MVP works on top of the stable Convex foundation
