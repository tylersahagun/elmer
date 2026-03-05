# Research: Chief of Staff Experience

## Summary

Research consolidates prior prototype iterations and leadership feedback into a parent initiative that separates five high-value outcomes from workflow configuration friction.

## Primary Job-to-Be-Done

> When I need to understand and act on what happened across my day/week, I want a proactive artifact-first assistant, so I can execute quickly without setup overhead.

## User Interviews

| Date       | Participant              | Role                          | Key Insights                                                      |
| ---------- | ------------------------ | ----------------------------- | ----------------------------------------------------------------- |
| 2026-01-29 | Rob Henderson            | Revenue leader                | Wants done/approval/scheduled framing; action-first experience    |
| 2026-01-29 | Sam Ho                   | Product leader                | Rejects workflow sprawl; insists on artifact-first interpretation |
| 2026-01-28 | Tyler + Sam conversation | Internal PM/product synthesis | Meeting recap flow currently too complex; should be first-class   |

## Key Findings

### Finding 1: Workflow-first recap delivery is the core friction

**Evidence:**

> "I don't want to click a meeting then a workflow out of a thousand workflows."

**Implications:**

Meeting Summary must be promoted into a default artifact with direct entry and AI editability.

### Finding 2: Action-first framing drives perceived value

**Evidence:**

> "Tell me what you've done, what needs approval, and what's scheduled."

**Implications:**

Daily and weekly experiences should lead with action queues and accountability, then supporting insight.

### Finding 3: Meeting-only framing underfits how work actually happens

**Evidence:**

Synthesized user framing from leadership and internal exploration emphasizes Slack, CRM, email, tasks, and calendar context.

**Implications:**

Daily and weekly briefs need cross-signal ingestion from day one, even if depth is limited in v1.

## User Problems Identified

| Problem                                     | Severity | Frequency | Evidence                           |
| ------------------------------------------- | -------- | --------- | ---------------------------------- |
| Workflow duplication to edit meeting output | High     | Common    | Recap hub + internal transcripts   |
| Fragmented daily context across systems     | High     | Common    | Chief of Staff concept discussions |
| Actions scattered and delayed               | High     | Common    | Action-first prototype feedback    |

## User Breakdown & Quantitative Context

| Segment       | % of Total Users | Engagement     | Data Source        |
| ------------- | ---------------- | -------------- | ------------------ |
| Sales reps    | Unknown          | High potential | Internal user base |
| Sales leaders | Unknown          | High potential | Internal user base |
| RevOps        | Unknown          | Moderate       | Internal user base |
| CSM           | Unknown          | Moderate       | Internal user base |

**Data availability:** Estimated. Baseline instrumentation needed.

### Quantitative Context

| Metric                        | Baseline         | Source                                  |
| ----------------------------- | ---------------- | --------------------------------------- |
| Workflow duplication attempts | Internal signals | Recap hub + duplicate workflow patterns |
| Daily context fragmentation   | Self-reported    | Chief of Staff concept discussions      |
| Action completion lag         | Unknown          | Target: > 60% within 24h                |

## Open Questions

1. What is the best historical model for daily brief state?
2. Which source categories materially improve weekly brief actionability?
3. What baseline should define action completion success per persona?

## Feedback Plan

| Method              | Instrument                      | Owner       | Cadence |
| ------------------- | ------------------------------- | ----------- | ------- |
| Customer interviews | Structured interview guide      | Tyler       | Weekly  |
| In-app feedback     | Product feedback database links | PM + Design | Ongoing |
| Usage analytics     | PostHog dashboards/events       | PM + Eng    | Weekly  |

### Feedback Already Collected

- `pm-workspace-docs/initiatives/archived/chief-of-staff-recap-hub/research.md`
- `pm-workspace-docs/floating-docs/chief-of-staff-slack-draft-for-rob.md`

## Related Research

- `pm-workspace-docs/initiatives/active/agent-command-center/research.md`
