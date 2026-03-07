# Elmer Lane Playbooks

**Generated:** 2026-03-07
**Purpose:** Give each active alpha-era lane one clear entry rule, exit rule, and evidence expectation.

## Shared Rules

- update Linear first when issue truth changes
- keep slices small enough to merge without blocking the next lane
- require evidence before claiming progress
- update only the docs that belong to the lane you changed

## Source Of Truth

**Issue:** `GTM-106`

- Objective: keep the control plane aligned with Linear and publish derived artifacts that do not compete with it
- Exit gate: current blocker map, merge order, and lane ownership are easy to answer from one coordinator checkpoint
- Evidence: refreshed swarm dashboard, reset docs, checklist, and daily artifact when needed

## Reliability

**Issues:** `GTM-95`, `GTM-97`, `GTM-98`

- Entry gate: none
- Exit gate: auth, smoke checks, and deployment docs are trustworthy
- Evidence: `check:auth`, public login validation, and runbook updates
- Doc owner: `DEPLOYMENT.md`

## Test Baseline

**Issues:** `GTM-78`, `GTM-82`, `GTM-83`, `GTM-84`

- Entry gate: reliability is stable enough for deterministic runs
- Exit gate: seeded core E2E is credible as a release gate
- Evidence: passing Playwright runs plus proof that flake-prone paths are stubbed or seeded
- Doc owner: checklist and any test-specific runbook notes

## Memory Cutover

**Issues:** `GTM-104`, `GTM-105`

- Entry gate: none, but it must stay coordinated with migration
- Exit gate: one runtime memory contract exists and cutover surfaces stop using legacy context fallbacks
- Evidence: memory contract plus explicit fallback-removal checkpoints
- Doc owner: `pm-workspace-docs/status/elmer-memory-cutover-contract.md`

## Convex Migration

**Issues:** `GTM-59`, `GTM-99`, `GTM-100`, `GTM-101`, `GTM-102`, `GTM-103`

- Entry gate: reliability is stable enough to validate migrated routes
- Exit gate: remaining blockers are resolved or marked as intentional boundaries
- Evidence: updated `orchestrator/MIGRATION-READINESS.md` and blocker issue checkpoints
- Dependency note: this lane should consume the memory contract rather than invent its own authority model

## Runtime Collaboration

**Issues:** `GTM-55`, `GTM-58`, `GTM-69`, `GTM-70`

- Entry gate: core alpha release gates are stable enough for multi-user validation
- Exit gate: blame chain, presence, orchestrator visibility, and team access are operational
- Evidence: visible attribution/presence UI plus proof that `GTM-55` is no longer only a cron stub
- Dependency note: merge `GTM-69` and `GTM-70` before treating `GTM-55` as active

## Internal Alpha UX

**Issues:** `GTM-107`, `GTM-71` to `GTM-77`

- Entry gate: planning can start now; implementation stays gated behind reliability, tests, memory cutover, and migration
- Exit gate: alpha cohort, script, and Linear intake path exist without weakening the release gate
- Evidence: alpha dogfood script, feedback template, and explicit rollout guardrail
- Dependency note: Chat / Agent Hub work should not jump the queue just because it is visible

When choosing the next slice inside a lane, prefer:

1. smallest slice that moves the gate forward
2. smallest slice with clear evidence expectations
3. smallest slice that can be reported cleanly in Linear

Avoid:

- multi-goal slices
- slices that change multiple lane contracts at once
- slices that produce no visible validation artifact
