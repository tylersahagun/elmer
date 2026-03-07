# Elmer Lane Playbooks

**Generated:** 2026-03-06  
**Purpose:** Give every Elmer swarm lane a consistent execution playbook: entry gate, exit gate, validation, evidence, and update discipline.

## How To Use

For any active lane:

1. verify the entry gate
2. choose the smallest meaningful slice inside the lane
3. require evidence before claiming progress
4. update Linear first
5. update only the derived docs affected by the slice

## Shared Playbook Pattern

Every lane should answer:

- objective
- issue list
- entry gate
- exit gate
- allowed parallelism
- required validation
- required evidence
- required Linear update
- required doc update

## Lane 0 — Platform Reliability

### Objective
Make auth and deployment health trustworthy enough to support the rest of the Elmer completion push.

### Issue list
- `GTM-94`
- `GTM-95`
- `GTM-96`
- `GTM-97`
- `GTM-98`

### Entry gate
- None. This is the first active lane.

### Exit gate
- `/login` loads reliably
- auth/domain checks are trustworthy
- Clerk, Convex, and app-origin configuration agree
- deployment/auth docs match the real stack

### Allowed parallelism
- Run alone as the active lane until stable enough to open the next phase safely.

### Required validation
- browser validation on login and authenticated shell
- auth/domain smoke checks
- deployment/auth runbook review

### Required evidence
- working login route
- successful auth smoke output
- clear env/domain alignment evidence
- updated runbook reference

### Required Linear update
- checkpoint comments for working auth fixes or blocker discoveries
- state changes when the reliability milestone meaningfully advances

### Required doc update
- `DEPLOYMENT.md` when runbook/config behavior changes
- `AGENT-BRIEF.md` only if the operating model or gating story changes
- `pm-workspace-docs/roadmap/elmer-sequenced-execution-checklist.md` only if gates/order change

## Lane A — Testing Completion

### Objective
Establish a deterministic minimum credible test baseline for the core Elmer surfaces.

### Issue list
- `GTM-78`
- `GTM-79`
- `GTM-80`
- `GTM-81`
- `GTM-82`
- `GTM-83`
- `GTM-84`
- `GTM-87`
- `GTM-88`
- `GTM-91`

### Entry gate
- `Lane 0` is stable enough that deterministic testing is not fighting basic auth/deployment failure.

### Exit gate
- seeded E2E scenarios run deterministically
- CI can run the minimum smoke suite
- the app has a usable release gate beyond manual clicking

### Allowed parallelism
- Can run in parallel with `Lane B` and `Lane C` once `Lane 0` is holding well enough.

### Required validation
- Playwright runs
- seeded scenario verification
- CI validation where applicable
- targeted unit tests for new test helpers or backend test surfaces

### Required evidence
- passing E2E output
- passing seeded test evidence
- CI evidence or workflow result
- clear note if a scenario is still flaky or blocked

### Required Linear update
- checkpoint comments for major test milestones
- issue state updates when a test surface moves from setup to reliable execution

### Required doc update
- `DEPLOYMENT.md` if test/runbook commands or environments change
- `AGENT-BRIEF.md` if the official testing story materially changes
- `pm-workspace-docs/roadmap/roadmap-analysis.md` only if test completion meaningfully shifts milestone interpretation

## Lane B — Team-Safe Operation

### Objective
Make Elmer safe and legible for concurrent internal use by the AskElephant team.

### Issue list
- `GTM-55`
- `GTM-58`
- `GTM-69`
- `GTM-70`

### Entry gate
- `Lane 0` is stable enough that collaboration work is not masked by auth/deployment instability.

### Exit gate
- every agent run is attributable
- core collaboration surfaces show who is active where
- the orchestrator gives usable project-health visibility
- the internal team can safely use the app together

### Allowed parallelism
- Can run in parallel with `Lane A` and `Lane C` after `Lane 0` stabilizes.

### Required validation
- browser validation of attribution, presence, and orchestrator surfaces
- end-to-end checks for visible collaboration state
- targeted tests for presence or attribution helpers where relevant

### Required evidence
- visible blame-chain evidence
- visible presence evidence
- working orchestrator/proposals evidence
- proof that internal-user access or onboarding behavior is correct

### Required Linear update
- checkpoint comments for milestone-visible progress
- blocker comments when operational trust still depends on unresolved upstream gates

### Required doc update
- `AGENT-BRIEF.md` if the multi-user operating model changes materially
- `pm-workspace-docs/roadmap/roadmap-analysis.md` only if the milestone meaning shifts

## Lane C — Migration Blocker Burn-Down

### Objective
Finish the Convex migration tail by resolving the named blockers and stabilizing the high-traffic route tranche.

### Issue list
- `GTM-59`
- `GTM-99`
- `GTM-100`
- `GTM-101`
- `GTM-102`
- `GTM-103`

### Entry gate
- `Lane 0` is stable enough that migration work can be validated against a trustworthy runtime.

### Exit gate
- remaining blockers are resolved or explicitly intentional boundaries
- high-traffic routes are stable on Convex-native data paths
- settings, search, and project detail have credible implementation paths

### Allowed parallelism
- Can run in parallel with `Lane A` and `Lane B` after `Lane 0` stabilizes.

### Required validation
- route-level browser validation
- migration checklist verification
- targeted tests for migrated surfaces
- explicit boundary decisions for intentional server-side exceptions

### Required evidence
- updated route classification
- evidence of migrated or intentionally-server-side boundaries
- named blocker resolution notes
- proof that the first tranche is stable

### Required Linear update
- update blocker issue comments and states as each decision or migration slice lands
- keep `GTM-59` as the umbrella, not the only place where work is described

### Required doc update
- `orchestrator/MIGRATION-READINESS.md` whenever route classifications or blocker decisions change
- `pm-workspace-docs/roadmap/roadmap-analysis.md` if the migration milestone meaning shifts
- `pm-workspace-docs/roadmap/elmer-sequenced-execution-checklist.md` only if gates/order change

## Lane D — Chat / Agent Hub MVP

### Objective
Deliver the foundational Chat / Agent Hub surface only after the lower-level stability gates are holding.

### Issue list
- `GTM-71`
- `GTM-72`
- `GTM-73`
- `GTM-74`
- `GTM-75`
- `GTM-76`
- `GTM-77`

### Entry gate
- `Lane 0` holding
- `Lane A` holding
- `Lane C` holding

### Exit gate
- persistent chat thread state exists in Convex
- ElmerPanel works as the operator surface
- Agent Hub is functional enough to replace the legacy log pattern
- context-rich follow-on work has a stable foundation

### Allowed parallelism
- Planning/spec work is allowed before gates open.
- Full implementation is not allowed before the first three gates are holding.

### Required validation
- browser validation of chat and agent surfaces
- route and runtime validation
- tests for Convex chat surfaces where applicable
- proof that the experience is not built on unstable foundations

### Required evidence
- working panel, thread, and hub flows
- clear HITL routing evidence
- trace navigation evidence
- stable runtime evidence

### Required Linear update
- checkpoint comments whenever a Chat contract becomes implementation-ready or a milestone slice lands
- do not move implementation-state issues prematurely just because planning advanced

### Required doc update
- `AGENT-BRIEF.md` if the target operator model changes
- `DEPLOYMENT.md` only if deployment/runbook requirements for Chat change
- `pm-workspace-docs/status/agent-experience-review.md` if the agent interaction model materially changes

## Per-Lane Slice Rule

When choosing the next slice inside a lane, prefer:

1. smallest slice that moves the gate forward
2. smallest slice with clear evidence expectations
3. smallest slice that can be reported cleanly in Linear

Avoid:

- multi-goal slices
- slices that change multiple lane contracts at once
- slices that produce no visible validation artifact
