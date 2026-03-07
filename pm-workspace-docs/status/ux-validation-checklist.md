# UX Validation Checklist

## Objective
Provide the validation sequence and concrete checks required for route-heavy UX work.

## Audience
Developers and reviewers validating Elmer UX changes locally and on the deployed environment.

## Evidence Basis
- `pm-workspace-docs/status/ux-release-gates.md`
- `pm-workspace-docs/status/ux-sequenced-execution-plan.md`
- planning swarm validation lane synthesis

## Validation Sequence
1. Auth and shell health
2. Route crash sweep
3. Canonical route compliance
4. Deep-link durability
5. Blocked-surface policy confirmation
6. Browser signoff

## Auth And Shell Health
- `/login` loads
- authenticated home loads
- first workspace opens
- refresh on workspace shell does not crash

## Route Crash Sweep
Check these routes manually and via smoke tests:
- `/workspace/[id]`
- `/workspace/[id]/signals`
- `/workspace/[id]/inbox`
- `/workspace/[id]/tasks`
- `/workspace/[id]/settings`
- `/workspace/[id]/projects/[projectId]`
- `/workspace/[id]/projects/[projectId]/documents/[docId]`

Expected:
- no client error overlay
- no redirect loops
- no blank shell followed by crash

## Canonical Route Compliance
- project links use workspace-scoped project routes
- document links use workspace-scoped document routes
- helper functions from `lib/projects/navigation.ts` are used instead of raw string building
- legacy `/projects/...` routes are not the primary in-app destination

## Deep-Link Durability
### Project
- open `/workspace/[id]/projects/[projectId]?tab=documents`
- open `/workspace/[id]/projects/[projectId]?tab=tasks`
- open `/workspace/[id]/projects/[projectId]?tab=commands`
- refresh each URL
- invalid tab falls back safely

### Signals
- open `/workspace/[id]/signals?id=<signalId>`
- refresh
- close modal and confirm query param cleanup

### Documents
- open a standalone document from a project
- use back
- use “Open in Project”
- confirm correct project context is retained

## Redirect And Blocked-Surface Checks
- determine whether `/knowledgebase` and `/personas` are:
  - stable enough for this release
  - compatibility-only
  - intentionally deferred

If included:
- test direct open
- test refresh
- test deterministic redirect target

## Required Automated Coverage
- project route smoke tests
- document route smoke tests
- project tab deep-link tests
- signals deep-link tests
- redirect shim tests where applicable
- route-helper tests

## Browser Signoff
Validate both:
- local environment
- deployed environment

Critical flows:
- workspace -> project
- project -> document
- inbox -> project
- signals -> project
- tasks -> project
- project -> Elmer panel / active work interactions once added

## Decision
Validation is complete only when both automated and browser checks are green for the relevant slice.

## Concrete Next Actions
1. Use this checklist as the acceptance checklist for `Slice 1`.
2. Append environment-specific notes once local and deployed validations are run.
3. Expand with slice-specific checks as later phases land.
