# Elmer Internal Alpha Playbook

## Overview
This playbook defines the minimum operating model for Elmer's internal production alpha.

The goal is not broad feature exploration. The goal is to prove that product, design, and engineering can use Elmer to move real project work forward, observe agent activity clearly, and file structured feedback into Linear after each session.

## Audience
- Product
- Design
- Engineering

## Alpha Scope
The internal alpha path is intentionally narrow:

- `Projects` is the primary cockpit for daily work.
- `Agent Catalog` is a secondary admin and provenance surface.
- Internal alpha testing should stay focused on project evidence, project commands, active agent work, approvals, artifacts, and ticket handoff.
- Do not expand the alpha scope to deep reliability investigations, memory infrastructure redesign, or broad Chat / Agent Hub exploration unless a session is explicitly assigned to those lanes.

## Go / No-Go Gate
Internal alpha is a go only if all of the following are true for the current build:

1. Auth and workspace entry are stable enough to reach an active project without manual recovery.
2. A project page loads and shows evidence, active work, and approvals clearly.
3. At least one project command or agent run can be started or inspected from the project cockpit.
4. Human gates can be answered from the project flow without guesswork.
5. The tester can file structured feedback in Linear before ending the session.

If any of these fail, the session becomes a release-blocking alpha finding.

## What To Test
Each tester should use one real project and run one complete daily-flow pass.

The preferred flow is:

1. Open an active project from the workspace `Projects` view.
2. Review the `Overview` tab and confirm the next best action makes sense.
3. Inspect linked evidence in `Signals`.
4. Inspect or trigger work from `Commands` or `Active Work`.
5. Check whether agent visibility is clear enough to answer:
   - what is running
   - what just happened
   - whether a human decision is blocking progress
6. If approvals or questions appear, resolve them from the project flow.
7. Review the resulting artifact, prototype, ticket output, or task update.
8. File feedback in Linear using the template in [elmer-internal-alpha-feedback-template.md](/Users/tylersahagun/Source/elmer-alpha/pm-workspace-docs/templates/elmer-internal-alpha-feedback-template.md).

## Session Script
Use this script for every internal alpha session.

### 1. Pick the project
- Choose a real active project, not a sandbox.
- Stay inside the project route unless the task explicitly requires the catalog/admin layer.

### 2. Confirm project footing
Check:
- evidence count
- current stage and readiness
- active runs
- pending approvals
- next best action

If any of those are unclear, log it as `UX`.

### 3. Run one meaningful action
Choose one:
- review evidence and link missing signals
- open and edit a project artifact
- run a project command
- inspect an active run
- resolve a pending approval
- review generated tickets or tasks

If the user has to switch into `Agent Catalog` to keep normal project work moving, log it as `UX`.

### 4. Inspect agent visibility
Confirm whether the project cockpit makes these answers obvious:
- which agent or command is acting
- current status
- last meaningful action
- artifact or output produced
- whether human input is required

If not, log it as `Approval`, `Observability`, or `UX` depending on the failure mode.

### 5. Capture feedback immediately
Do not rely on Slack, memory, or verbal follow-up.

For every session:
- Create a new Linear issue if the problem is new.
- Comment on an existing issue if the session reproduces or sharpens a known problem.
- Relate the issue to `GTM-107` if it is part of the internal alpha feedback loop.

## Linear Intake Rules
Linear is canonical for internal alpha findings.

Use these categories in the issue title:
- `[Alpha][UX]`
- `[Alpha][Runtime]`
- `[Alpha][Approval]`
- `[Alpha][Evidence]`
- `[Alpha][Agent Visibility]`

Use existing issues when the failure clearly matches them. Create a new issue when it does not.

Every alpha issue should include:
- project name
- workspace or route
- the exact flow attempted
- expected behavior
- actual behavior
- whether the issue blocks continued testing
- screenshots, trace IDs, or job IDs when available

## Stable Path vs. Secondary Surfaces
For this alpha, the stable daily path is:

1. `Projects`
2. project `Overview`
3. `Signals`, `Documents`, `Commands`, `Tasks`, `Tickets`
4. `Active Work` and approvals

Treat these as secondary or admin surfaces:
- `Agent Catalog`
- broad workspace utility browsing
- speculative Chat / Agent Hub usage that is not required for the daily project flow

## Session Exit Evidence
A completed session should hand back:
- the project used
- the action completed
- whether the project cockpit was understandable
- whether agent visibility was sufficient
- whether approvals were clear
- the Linear issue or comment ID created from the session

## Current Lane Intent
This playbook supports `GTM-107` and the internal-alpha UX lane by making the testing path explicit without widening scope into unrelated platform or memory work.
