# Elmer Sequenced Execution Checklist

**Generated:** 2026-03-07
**Purpose:** Keep the internal-alpha execution order explicit without replacing Linear.

## How To Use

- Trust Linear for current issue state and assignee truth
- Use this checklist for gate order, dependency order, and merge order
- Treat unchecked items as blockers unless they are explicitly called planning-only

## Milestone 1 — Reliability

**Issues:** `GTM-95`, `GTM-97`, `GTM-98`
**Already landed:** `GTM-94`, `GTM-96`

- [ ] `npm run check:auth` is trustworthy
- [ ] public `/login` is healthy
- [ ] deployment/auth docs match reality
- [ ] stale auth paths are no longer ambiguous

## Milestone 2 — Test Baseline

**Issues:** `GTM-78`, `GTM-82`, `GTM-83`, `GTM-84`

- [ ] POM coverage is sufficient for the core routes
- [ ] seeded Signal Inbox coverage is deterministic
- [ ] stubbed agent-execution E2E exists
- [ ] minimum smoke suite is ready to gate release confidence

## Milestone 3 — Memory Cutover

**Issues:** `GTM-104`, `GTM-105`

- [ ] one canonical runtime memory contract exists
- [ ] personas and knowledgebase are treated as lenses or mirrors, not parallel authorities
- [ ] cutover surfaces stop using legacy context fallbacks

## Milestone 4 — Convex Migration

**Issues:** `GTM-59`, `GTM-99`, `GTM-100`, `GTM-101`, `GTM-102`, `GTM-103`

- [ ] first Convex tranche stays stable
- [ ] membership/invitation parity is explicit
- [ ] GitHub/settings boundary is explicit
- [ ] search path is explicit
- [ ] project-detail parity work is sliced in dependency order

## Milestone 5 — Runtime Collaboration

**Issues:** `GTM-55`, `GTM-58`, `GTM-69`, `GTM-70`

- [ ] blame chain is complete end to end
- [ ] presence is visible on core surfaces
- [ ] `GTM-55` moves beyond the current orchestrator stub
- [ ] internal team access is ready for shared use

## Milestone 6 — Chat / Agent Hub MVP

**Issues:** `GTM-71`, `GTM-72`, `GTM-73`

- [ ] planning/spec can continue in parallel
- [ ] implementation stays gated until Milestones 1 to 4 are holding
- [ ] schema, panel shell, and Agent Hub do not bypass the release gates

## Milestone 7 — Context-Rich Chat

**Issues:** `GTM-74`, `GTM-75`, `GTM-76`, `GTM-77`

- [ ] remains downstream of Milestone 6
- [ ] does not become the active merge queue before the stable foundation exists

## Milestone 8 — Internal Alpha UX And Feedback Loop

**Issues:** `GTM-107`

- [ ] alpha cohort is defined
- [ ] dogfood script exists
- [ ] every alpha session creates structured Linear follow-up
- [ ] Chat rollout does not weaken the alpha release gate

## Parallel Work Rules

- Milestones 2, 3, and 4 can run in parallel once Milestone 1 is stable enough
- Milestone 5 can finish partial work in parallel, but `GTM-55` should stay downstream of Milestones 1 to 4
- Milestones 6 and 7 remain gated for implementation
- Milestone 8 planning can run in parallel, but the alpha release itself is still gated on Milestones 1 to 4

## Recommended Merge Order

1. coordinator and doc-control-plane changes (`GTM-106`, memory contract, tracker refresh)
2. reliability tail (`GTM-95`, `GTM-98`, `GTM-97`)
3. test-baseline foundation (`GTM-78`) before feature E2E slices (`GTM-82`, `GTM-83`, `GTM-84`)
4. memory contract and fallback removal (`GTM-104`, then `GTM-105`)
5. migration blockers in dependency order (`GTM-102`, `GTM-101`, `GTM-99`, `GTM-100`, `GTM-103`, with `GTM-59` as umbrella)
6. runtime collaboration (`GTM-69`, `GTM-70`, `GTM-55`, `GTM-58`)
7. alpha UX / feedback (`GTM-107`) and only then Chat / Agent Hub implementation (`GTM-73`, `GTM-72`, `GTM-71`, then `GTM-74` to `GTM-77`)
