# Research: Meeting Prep

## Summary

Meeting prep is currently implicit and manual. Users need context and recommended focus before calls, especially for pipeline and renewal motion. Prep is often reconstructed from multiple sources in the final minutes before a call, and existing recap output is under-leveraged as prep input.

## Primary Job-to-Be-Done

> When **I have a scheduled meeting with a contact or account**, I want to **receive a pre-call context artifact with prior takeaways, risks, and recommended goals**, so I can **enter the conversation with confidence and focus on strategic quality instead of manual context gathering**.

## Key Findings

### Finding 1: Prep is reconstructed at the last minute

**Evidence:**

- Prep is often reconstructed from multiple sources (CRM, prior notes, tasks) in the final minutes before a call
- Users report context-switching and fragmentation across tools
- "I'm digging through emails and CRM right before the call"

**Implications:**

- Pre-call artifact must be delivered in a time window (e.g., 60 min) that allows absorption without last-minute scramble
- Single source of truth reduces cognitive load

### Finding 2: Recap output is under-leveraged as prep input

**Evidence:**

- Existing recap output (prior meeting takeaways, open risks, action items) exists but is not automatically funneled into prep
- Users manually copy/paste or re-read prior summaries
- "I have to remember what we talked about last time and hope I didn't miss something"

**Implications:**

- Recap → Prep flow is a differentiator; not siloed
- Prior meeting key takeaways, open risks, and pending actions should auto-populate prep blocks

### Finding 3: Users need confidence in what changed since last conversation

**Evidence:**

- Uncertainty about recent account/customer activity creates anxiety
- "What changed since we last spoke?" is a common internal question
- Trust in prep requires visible recency and linkage to source

**Implications:**

- Explicit "what changed since last touch" section in prep
- Source attribution (e.g., "From 2026-02-15 discovery call") builds confidence

## User Problems Identified

| Problem                                | Severity | Frequency  | Evidence                            |
| -------------------------------------- | -------- | ---------- | ----------------------------------- |
| Manual context gathering before calls  | High     | Common     | User feedback, workflow observation |
| Fragmentation across CRM, notes, tasks | High     | Common     | Multiple tools cited                |
| Recap not flowing into prep            | Medium   | Common     | Under-leveraged artifact            |
| Uncertainty about recency of context   | Medium   | Occasional | "What changed?" anxiety             |
| No persona-specific focus              | Low      | Occasional | Sellers vs CSM needs differ         |

## User Breakdown & Quantitative Context

| Segment               | % of Total Users | Engagement          | Data Source         |
| --------------------- | ---------------- | ------------------- | ------------------- |
| Sales Representatives | ~40%             | High meeting volume | PostHog (estimated) |
| Sales Leaders         | ~15%             | Key meetings, 1:1s  | PostHog (estimated) |
| CSMs                  | ~35%             | Renewals, QBRs      | PostHog (estimated) |
| RevOps                | ~10%             | Light meeting load  | PostHog (estimated) |

**Data availability:** Not instrumented for prep behavior; estimated from persona mix and initiative scope.

## Quantitative Context

- Prep artifact viewed before meeting: **Unknown** (target > 55% at Beta)
- Time spent gathering context: **Unknown** (target -40% at GA + 30 days)
- Competitors: Gong AI Briefer, Clari Groove, HubSpot Breeze prep—most focus post-call; pre-call is under-served

## Open Questions

1. What is the trigger window for prep generation (e.g., 60 min pre-meeting)?
2. Which meeting types should skip prep by default (e.g., internal standups)?
3. Validate preferred prep artifact length and structure
4. Validate which source blocks (prior takeaways vs risks vs goals) most impact user confidence
5. Persona-specific prep blocks: what differs for seller vs CSM vs leader?

## Feedback Plan

| Method    | Instrument                          | Owner   | Cadence        |
| --------- | ----------------------------------- | ------- | -------------- |
| Interview | Structured prep artifact review     | Tyler   | Beta + 2 weeks |
| Analytics | Prep view pre-meeting, time-to-view | PostHog | GA + 30 days   |
| Survey    | Prep usefulness (NPS-style)         | In-app  | GA + 60 days   |

### Feedback Already Collected

- Chief of Staff hypothesis validation (hyp-chief-of-staff-action-first)
- Agent Command Center v10 patterns (meeting clearing, action-first)
- Competitive landscape: Gong AI Briefer, HubSpot Breeze prep patterns

## Related Research

- [Action Items research](../action-items/research.md) — Shared action-first framing
- [Agent Command Center competitive landscape](../../agent-command-center/competitive-landscape.md)
- [Competitive landscape: Meeting Prep](./competitive-landscape.md)

## Research Gaps

1. Validate preferred prep artifact length and structure
2. Validate which source blocks most impact user confidence
3. Trigger window and meeting-type exclusions

---

_Last updated: 2026-02-17_
