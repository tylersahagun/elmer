# Elmer Reset And Recalibration

**Generated:** 2026-03-07
**Audience:** Product, engineering, and agent builders coordinating the Elmer internal-alpha reset

## Objective

Keep Elmer on one coherent completion story:

- Linear is canonical for implementation status and sequencing
- Convex graph-backed memory is canonical for runtime context
- the release target is internal production alpha
- Chat / Agent Hub can plan in parallel, but release stays gated on reliability, tests, memory cutover, and Convex migration

## Executive Reset

Elmer is in finish-and-consolidate mode, not greenfield architecture discovery.

The current critical path is:

1. reliability and auth/deployment trust
2. deterministic E2E and release gates
3. memory cutover to a single runtime context model
4. Convex migration blocker burn-down
5. runtime collaboration and orchestrator legibility
6. internal alpha UX, feedback loop, and only then broader Chat rollout

## What Is Clearly Landed

- Convex foundation, schema, agent loop, MCP surfaces, and major runtime models exist
- GitHub App and webhook setup are complete
- blame-chain fields and presence foundations are in the codebase
- Playwright scaffold and first smoke/inbox coverage exist
- migration readiness is explicit and named blocker tickets exist
- `GTM-94` and `GTM-96` are done, so the first Clerk incident tranche is no longer the active blocker

## What Is Active Now

### 1. Reliability tail

Open issues:

- `GTM-95`
- `GTM-97`
- `GTM-98`

Meaning:
the remaining work is docs, smoke checks, and legacy auth cleanup, not the original incident restore.

### 2. Minimum credible test baseline

Live issue state:

- `GTM-78` in progress
- `GTM-82` in progress
- `GTM-83` in progress
- `GTM-84` todo

Meaning:
the scaffold is real, but the alpha release gate is not yet deterministic.

### 3. Memory cutover

New reset issues:

- `GTM-104`
- `GTM-105`

Meaning:
runtime context still has split authority. This is now explicit work, not implied migration residue.

### 4. Convex migration blocker burn-down

Open issues:

- `GTM-59` in progress
- `GTM-99`
- `GTM-100`
- `GTM-101`
- `GTM-102`
- `GTM-103`

Meaning:
the migration lane remains active, but it now depends on the memory contract being explicit.

### 5. Runtime collaboration

Live issue state:

- `GTM-69` in progress
- `GTM-70` in progress
- `GTM-55` backlog
- `GTM-58` backlog

Meaning:
attribution and presence are partially landed, but orchestrator health/proposals and broad internal onboarding are still downstream.

### 6. Internal alpha UX and feedback loop

New reset issue:

- `GTM-107`

Gated planning set:

- `GTM-71` to `GTM-77`

Meaning:
the team should define the alpha cohort, script, and Linear intake path now, but Chat / Agent Hub implementation must stay gated behind the stable foundation.

## Coordination Truth

`GTM-106` is the coordinator issue for the control plane itself:

- retarget the swarm presets around the alpha-era lanes
- keep saved swarm artifacts clearly derived from Linear truth
- use the swarm surface and derived docs as the control room, not as a second tracker

## Anti-Drift Rules

- Do not treat `AGENT-BRIEF.md` status text as canonical when Linear disagrees
- Do not let memory, personas, knowledgebase, and file-backed mirrors compete on runtime authority
- Do not move Chat work into active implementation just because it is visible or strategically attractive
- Do not hide blocker decisions inside broad umbrella tickets once they deserve named ownership

## Success Condition For This Reset

The reset is working when a coordinator can answer, without guessing:

- what is blocked right now
- which lane owns the next move
- which docs are strategic versus canonical
- which branches are safe to merge first
- why the alpha release is still gated
