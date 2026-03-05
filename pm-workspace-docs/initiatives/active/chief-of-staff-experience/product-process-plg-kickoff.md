# Chief of Staff - Single-Player PLG Kickoff

Date: 2026-02-18
Owner: Tyler
Initiative: `chief-of-staff-experience`

## Intent

Use Chief of Staff Experience as the first product path for a single-player experience and validate it as a Product-Led Growth motion.

## Working thesis

If Chief of Staff becomes the default single-player operating surface (what happened, what needs approval, what to do next), users will reach value faster, return more often, and complete more high-impact actions without assisted onboarding.

## Current evidence status

- **Discussed and directionally supported:** Yes (Sam/Rob/Tyler internal signals)
- **External customer validation:** Not yet sufficient
- **Baseline instrumentation:** Not yet established for key behavior metrics
- **Status call:** Strong hypothesis with internal evidence; requires external validation before commitment

## Hypothesis to validate

1. Single-player artifact-first entry increases daily active usage versus workflow-first navigation.
2. Action-first ordering increases 24-hour action completion and perceived usefulness.
3. Cross-signal context (meetings + CRM + comms) improves recurring usage versus meeting-only recap.
4. Approval-by-exception reduces friction without reducing trust.

## Product-Led Growth framing

### North-star behavior

Users self-serve value in one session and return without hand-holding.

### PLG success signals (leading)

- Time to first useful artifact < 2 minutes
- Daily engagement (targeted users) > 50%
- 24-hour action completion > 60%
- 7-day repeat usage > 45%

### PLG guardrails

- Trust regression (privacy/control confusion) remains flat or improves
- Incorrect auto-action rate stays below threshold
- User confidence in recommendations trends upward

## Research sprint (10 business days)

## 1) External validation (5 interviews minimum)

Target mix:

- 2 Sales leaders
- 2 Sales reps/CSMs
- 1 RevOps

Core questions:

1. What is your current "start of day" workflow?
2. Where do your commitments currently fall through?
3. If this was your default daily entry point, what must be true for trust?
4. Would you prefer approval-by-default or approval-by-exception? Why?
5. What would make you come back every day without prompting?

## 2) Instrumentation baseline

Define/confirm event schema before build:

- `cos_home_opened`
- `cos_first_artifact_viewed`
- `cos_action_approved`
- `cos_action_completed_24h`
- `cos_brief_opened_daily`
- `cos_brief_opened_weekly`
- `cos_recommendation_edited`

## 3) Comparative test design

Set up a simple before/after or A/B readout:

- Cohort A: workflow-first path
- Cohort B: single-player artifact-first path

Primary comparison window: 14 days.

## Product process gates

### Gate A - Discovery complete

Required:

- 5+ external interviews complete
- 3+ direct quotes supporting/contradicting thesis
- baseline events emitting correctly
- explicit trust/approval concerns documented

### Gate B - Define ready

Required:

- MVP scope for single-player path finalized
- approval threshold policy draft by persona
- measurable success criteria locked for Beta

### Gate C - Build ready

Required:

- design flow for single-player entry approved
- instrumentation owner/date committed
- feedback loop plan scheduled (weekly review cadence)

## MVP scope recommendation (single-player first)

In:

- Chief of Staff Home as default entry
- Meeting Summary artifact
- Action Items queue with evidence and edit/approve
- Daily Brief (minimum cross-signal set)

Out (phase after MVP):

- advanced team routing/delegation
- deep persona-specific variants
- full multi-user coordination layer

## Immediate next actions (this week)

1. Schedule 5 validation interviews (target roles above).
2. Finalize baseline event schema and instrumentation owner.
3. Draft approval-by-exception policy v0 by persona.
4. Produce one-page readout after first 3 interviews:
   - keep / change / kill recommendation for single-player PLG thesis.

## Decision rule

If external validation and baseline movement do not support increased self-serve value and repeat engagement, do not scale this as PLG messaging until the entry path is adjusted.
