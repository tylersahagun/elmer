# Plan Creation Framework (How to Build This Plan)

## Purpose

Use this when you need to quickly create a high-confidence execution plan for PM + Notion migrations without over-scoping.

## 1) Define the Plan in One Sentence

Write:

`We need to [change] so that [behavior] so that [business outcome].`

Example:

`We need to unify Product Feedback schema so that recurring vs novel patterns are trustworthy so that roadmap and CS actions improve retention/expansion outcomes.`

## 2) Lock Scope Before Solutions

Capture three lists:

1. In scope (must happen now)
2. Out of scope (explicitly deferred)
3. Constraints (API limits, dependencies, timeline)

Rule: if a task does not move the one-sentence outcome, defer it.

## 3) Build a Workstream Map

Split work into 3 tracks:

1. Data model (schema + relations)
2. Data quality (backfill + QA)
3. Operations (views + digest/reporting)

For each track, define:

- owner
- entry criteria
- done criteria
- risk level (low/med/high)

## 4) Sequence by Dependencies

Order work using this stack:

1. Foundations: schema creation
2. Population: backfill
3. Validation: QA checks
4. Consumption: views and digest

If a step is blocked, convert it into:

- manual runbook
- unblock owner
- exact verification signal

## 5) Define Measurable Gates

Create one gate per phase:

1. Schema gate: all required properties exist
2. Data gate: required fields are populated above target
3. Reporting gate: views and digest produce correct rows

Each gate should be binary: pass/fail.

## 6) Write the Plan Document in This Shape

1. Objective
2. Current state (done vs blocked)
3. Recommended path
4. Step-by-step runbook
5. Acceptance criteria
6. Risks + mitigations
7. Owner sequencing

Keep each section concise and action-oriented.

## 7) Add a “What To Do If Blocked” Branch

Always include:

1. top 3 probable blockers
2. fallback procedure for each blocker
3. maximum wait time before escalation

This prevents freeze when APIs or permissions fail.

## 8) Close with Next Action

End every plan with:

1. immediate next action (today)
2. who does it
3. what evidence confirms completion

## Quick Template

Copy/paste and fill:

1. Objective:
2. Outcome chain:
3. In scope:
4. Out of scope:
5. Constraints:
6. Track A (Data model):
7. Track B (Data quality):
8. Track C (Operations):
9. Blockers + fallback:
10. Acceptance criteria:
11. Today’s next action:

## Quality Check (60 seconds)

Before finalizing, ask:

1. Does each step tie to the outcome chain?
2. Are dependencies explicit?
3. Are gates measurable?
4. Is there a clear unblock branch?
5. Is the next action immediately executable?
