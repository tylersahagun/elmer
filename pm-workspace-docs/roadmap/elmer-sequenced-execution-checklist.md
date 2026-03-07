# Elmer Sequenced Execution Checklist

**Generated:** 2026-03-06
**Purpose:** Convert the current Elmer completion roadmap into an execution-ready sequence with clear gates, dependencies, and concrete outcomes.
**Primary sources:** `pm-workspace-docs/roadmap/roadmap-analysis.md`, `AGENT-BRIEF.md`, `DEPLOYMENT.md`, `orchestrator/MIGRATION-READINESS.md`, Linear project `Elmer`
**Source of truth:** Use Linear for current issue status and assignee/state truth. Use this checklist as the derived execution order and gate definition.

## How To Use This Checklist

- Work top to bottom unless a step is explicitly marked parallel-safe
- Do not start the Chat implementation tranche until the migration and reliability gates are holding
- Treat unchecked items as blockers to advancing the milestone unless they are explicitly marked optional
- If this checklist and Linear disagree on issue state, trust Linear first and update this document afterward

## Milestone 1 — Platform Reliability

**Goal:** Make auth and deployment health trustworthy enough to support the rest of the completion push.
**Linear issues:** `GTM-94`, `GTM-95`, `GTM-96`, `GTM-97`, `GTM-98`
**Can run now:** Yes
**Blocks:** Milestones 2, 5, and any public-environment validation

### Checklist

- [ ] Fix Clerk asset loading and public login reliability on `elmer.studio`
- [ ] Align Clerk frontend API host, `CLERK_JWT_ISSUER_DOMAIN`, app origin, and Convex env configuration
- [ ] Verify `npm run check:auth` catches broken auth/domain setups reliably
- [ ] Update deployment/auth docs to match the real current stack and cutover path
- [ ] Remove stale NextAuth/Auth.js migration debt only after the Clerk path is stable

### Exit Criteria

- [ ] `https://elmer.studio/login` loads reliably
- [ ] `npm run check:auth` is usable as a release gate
- [ ] The team has one clear auth/deployment runbook

### Suggested Execution Slice

1. Stabilize prod/login behavior
2. Lock env + domain configuration
3. Add/verify smoke checks
4. Clean up legacy auth debt
5. Finalize docs

## Milestone 2 — Minimum Credible Test Baseline

**Goal:** Establish deterministic test coverage for the core daily surfaces.
**Linear issues:** `GTM-78`, `GTM-79`, `GTM-80`, `GTM-81`, `GTM-82`, `GTM-83`, `GTM-84`, `GTM-87`, `GTM-88`, `GTM-91`
**Can run now:** Yes, once Milestone 1 is stable enough to test against
**Blocks:** Milestones 3, 4, 5 for safe rollout confidence

### Checklist

- [ ] Finish Page Object Model coverage for the highest-traffic routes
- [ ] Stabilize auth setup / storageState flow for Playwright
- [ ] Finish workspace navigation smoke coverage
- [ ] Expand seeded Signal Inbox E2E coverage under `GTM-83`
- [ ] Finish the first agent-execution happy path under `GTM-84`
- [ ] Add project/task management E2E coverage
- [ ] Add CI execution for the minimum smoke suite
- [ ] Add Convex backend unit tests for changed schema/mutations/queries
- [ ] Add MCP server function tests for the P0 tool surface
- [ ] Add production smoke tests for the deployed app

### Exit Criteria

- [ ] Core seeded E2E scenarios run deterministically
- [ ] CI can run the minimum smoke suite
- [ ] The app has a usable release gate beyond manual clicking

### Suggested Execution Slice

1. Finish auth setup + POM base coverage
2. Lock smoke coverage for workspace navigation
3. Finish seeded inbox + agent execution scenarios
4. Add project/task flow coverage
5. Add CI and production smoke enforcement

## Milestone 3 — Convex Migration Blocker Burn-Down

**Goal:** Convert the migration from a broad epic into route-level completion work.
**Linear issues:** `GTM-59`, `GTM-99`, `GTM-100`, `GTM-101`, `GTM-102`, `GTM-103`
**Can run now:** Yes, in parallel with Milestone 2
**Blocks:** Milestones 5 and 6

### Checklist

- [ ] Keep the first migration tranche stable on `/`, `/workspace/[id]`, and `/workspace/[id]/signals`
- [ ] Resolve workspace membership + invitation parity in Convex (`GTM-102`)
- [ ] Resolve connected-account / GitHub settings state (`GTM-101`)
- [ ] Make the personas + knowledgebase architecture decision explicit (`GTM-99`)
- [ ] Define the Convex-native search strategy for documents + memory (`GTM-100`)
- [ ] Break `/projects/[id]` into executable migration slices (`GTM-103`)
- [ ] Update `orchestrator/MIGRATION-READINESS.md` as blockers move from unknown to resolved or intentional
- [ ] Keep `GTM-59` as the umbrella issue, not a catch-all dumping ground

### Exit Criteria

- [ ] Remaining blockers are named and resolved or intentionally deferred
- [ ] High-traffic routes are stable on Convex-native data paths
- [ ] Settings, search, and project detail all have credible implementation paths

### Suggested Execution Slice

1. Hold tranche 1 steady
2. Resolve settings blockers: memberships/invitations, GitHub state
3. Resolve architecture blockers: personas/knowledgebase, search
4. Slice project detail migration
5. Reclassify remaining legacy surfaces as migrate-now or intentional-server-side

## Milestone 4 — Team-Safe Operation

**Goal:** Make Elmer safe and legible for concurrent internal use by the AskElephant team.
**Linear issues:** `GTM-55`, `GTM-58`, `GTM-69`, `GTM-70`
**Can run now:** Yes, in parallel with Milestones 2 and 3
**Blocks:** Full internal adoption and trust

### Checklist

- [ ] Finish end-to-end job attribution and blame-chain visibility
- [ ] Expand presence surfaces beyond the minimum initial implementation
- [ ] Complete orchestrator health/proposals surface work
- [ ] Finish team access controls, domain restrictions, and onboarding for internal users

### Exit Criteria

- [ ] Every agent run is attributable
- [ ] Core collaboration surfaces show who is active where
- [ ] The orchestrator gives usable project-health visibility
- [ ] The internal team can safely use the app together

### Suggested Execution Slice

1. Finish attribution chain
2. Finish presence surfaces
3. Finish orchestrator health/proposals
4. Finish internal team access/onboarding

## Milestone 5 — Chat / Agent Hub MVP

**Goal:** Ship the foundational Convex-native replacement for the legacy chat sidebar.
**Linear issues:** `GTM-73`, `GTM-72`, `GTM-71`
**Can run now:** No
**Start only after:** Milestones 1, 2, and 3 are holding

### Checklist

- [ ] Add `chatThreads` and `chatMessages` schema + core queries/mutations
- [ ] Ship ElmerPanel shell with persistent thread behavior
- [ ] Replace the legacy `ChatSidebar` path
- [ ] Ship Agent Hub tab with live runs, HITL routing, and trace navigation

### Exit Criteria

- [ ] Persistent thread state exists in Convex
- [ ] ElmerPanel works as the new operator surface
- [ ] Agent Hub is functional enough to replace the floating log pattern

### Suggested Execution Slice

1. Chat schema
2. Panel shell
3. Agent Hub
4. Remove legacy sidebar path

## Milestone 6 — Context-Rich Chat And Artifact Flows

**Goal:** Make the new chat surface context-aware enough to become a core product differentiator.
**Linear issues:** `GTM-74`, `GTM-77`, `GTM-76`, `GTM-75`
**Can run now:** No
**Start only after:** Milestone 5 is stable

### Checklist

- [ ] Add full workspace context injection and `@mention` lookup
- [ ] Ship Context Peek on key entities
- [ ] Ship the document artifact panel + MCP App renderer path
- [ ] Add slash command picker improvements, NL routing, and model switching

### Exit Criteria

- [ ] Chat can reason over relevant workspace context
- [ ] Users can pivot from entities into conversation quickly
- [ ] Artifact workflows are embedded in the panel, not bolted on

## Parallel Work Rules

- Milestones 2, 3, and 4 can run in parallel once Milestone 1 is stable enough
- Milestones 5 and 6 should remain gated behind the migration and test baseline
- `GTM-60` and other follow-on enhancements should not interrupt the critical path unless priorities change

## Deferred / Non-Blocking Follow-Ons

- [ ] `GTM-37` elephant-ai submodule hardening
- [ ] `GTM-42` Fly.io CLI sandbox
- [ ] `GTM-53` multi-platform prototype variants
- [ ] `GTM-56` Notion downstream cleanup
- [ ] `GTM-57` scheduled agents
- [ ] `GTM-60` graph analytics follow-on
- [ ] `GTM-85` MCP UI app tests
- [ ] `GTM-86` memory graph integration tests
- [ ] `GTM-89` agent self-validation pattern
- [ ] `GTM-92` Chromatic visual regression

## Completion Gate

Elmer is complete enough for the current internal AskElephant goal when all of the following are true:

- [ ] Auth and deployment are reliable
- [ ] Core release-gating tests are deterministic
- [ ] High-traffic routes are Convex-native or intentionally server-side
- [ ] Multi-user operation is safe and understandable
- [ ] Chat / Agent Hub MVP works on top of the stable foundation
