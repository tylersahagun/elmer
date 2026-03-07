# Elmer Swarm Operating Contract

**Generated:** 2026-03-07
**Purpose:** Define how the coordinator runs the Elmer internal-alpha swarm without creating a second source of truth.

## Canonical Rules

1. Linear is canonical for issue state, sequencing, blockers, and merge readiness.
2. Repo docs explain gates, architecture, and rationale. They do not override Linear.
3. Convex graph-backed memory is canonical for runtime context.
4. Saved swarm artifacts are derived snapshots for coordination, not substitute issue trackers.

## Current Lane Model

| Lane | Primary issues | Role |
| --- | --- | --- |
| `Source Of Truth` | `GTM-106` | Coordinator lane for reset docs, swarm artifacts, blocker map, and merge order |
| `Reliability` | `GTM-95`, `GTM-97`, `GTM-98` | Finish auth, smoke-check, and runbook trust |
| `Test Baseline` | `GTM-78`, `GTM-82`, `GTM-83`, `GTM-84` | Deterministic seeded E2E and release gating |
| `Memory Cutover` | `GTM-104`, `GTM-105` | Canonical runtime memory contract and fallback removal |
| `Convex Migration` | `GTM-59`, `GTM-99` to `GTM-103` | Burn down the named migration blockers |
| `Runtime Collaboration` | `GTM-55`, `GTM-58`, `GTM-69`, `GTM-70` | Attribution, presence, orchestrator visibility, and team access |
| `Internal Alpha UX` | `GTM-107`, `GTM-71` to `GTM-77` | Alpha script, feedback loop, and gated Chat rollout |

## Gate Order

### Gate 1 — Reliability

Must hold before the rest of the release gate is trusted.

### Gate 2 — Test Baseline

Must hold before the release can be called deterministic.

### Gate 3 — Memory Cutover

Must hold before runtime context authority is considered clean.

### Gate 4 — Convex Migration

Must hold before Chat implementation or broad alpha rollout is treated as safe.

## Allowed Parallelism

- Reliability, Test Baseline, Memory Cutover, and Convex Migration can move in parallel once they are not blocking each other locally.
- Runtime Collaboration can continue partial work in parallel, but `GTM-55` should remain downstream of the four release gates.
- Internal Alpha UX planning can continue in parallel.
- Chat / Agent Hub implementation must stay gated until Gates 1 to 4 are holding.

## Daily Coordinator Rhythm

### Kickoff

- confirm current Linear state for all active lanes
- publish one concise blocker map
- identify the next safe merge queue

### Midday

- escalate cross-lane blockers
- reject work that is trying to bypass the release gates
- tighten any stale tracker/docs that are drifting from Linear

### End Of Day

1. update Linear first if issue truth changed
2. refresh the swarm dashboard or daily artifact
3. note what changed, what is blocked, who moves next, and which branches are safe to merge first

## Evidence Rule

Every lane report must include:

- `as_of`
- owner
- blocker
- next action
- evidence or explicit evidence gap

## Escalate Immediately When

- docs and Linear materially disagree
- a lane claims progress without evidence
- `GTM-55` is treated as active implementation while the core alpha gates are still unstable
- Chat work becomes implementation before Gates 1 to 4 are holding
- memory/search/persona authority becomes ambiguous again
