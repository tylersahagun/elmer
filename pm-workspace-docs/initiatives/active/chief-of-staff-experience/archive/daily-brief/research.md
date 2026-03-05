# Research: Daily Brief

## Summary

Daily Brief direction is inspired by the "newspaper" mental model: concise, scannable, role-aware, and action-oriented. A meeting-only daily view is insufficient for operating cadence; users need cross-signal context (meetings, CRM, comms, calendar, tasks) in one trusted readout.

---

## Jobs to Be Done

**When** I start or end my workday,  
**I want to** see a prioritized, contextual readout of what changed and what I need to do,  
**So that** I can execute higher-priority actions earlier and maintain consistent throughput.

---

## Evidence Quotes

> "A meeting-only daily view is insufficient for operating cadence." — Internal synthesis
> "Users want changing context across the day, but also need historical consistency." — Internal synthesis
> "Action and accountability framing is more motivating than insight-only framing." — Internal synthesis

_Note: External customer quotes to be added during interview-plan feedback._

---

## Key Findings

1. **Cross-signal is required** — Meetings alone don't drive daily operating decisions. CRM updates, Slack/email highlights, calendar, and tasks must be included.
2. **Time-of-day matters** — Morning and end-of-day needs differ. Morning = overnight recap + today prep. Evening = what to clear + tomorrow preview.
3. **Action-first > insight-first** — Users prefer "here's what to do" over "here's what to explore."
4. **Historical snapshots support trust** — Access to past daily briefs ("what did it say last Tuesday?") reinforces consistency and accountability.

---

## User Problem Table

| Persona      | Problem                                                                                              | Evidence Strength |
| ------------ | ---------------------------------------------------------------------------------------------------- | ----------------- |
| Sales Rep    | Context spread across meetings, CRM, Slack, email, calendar; cannot answer "what should I do today?" | Internal          |
| Sales Leader | No single trusted readout; team throughput varies by who keeps context                               | Internal          |
| CSM          | Post-meeting commitments scattered; easy to miss follow-through                                      | Internal          |
| RevOps       | Inconsistent visibility into rep activity and priorities                                             | Internal          |

---

## Quantitative Context

| Metric                        | Current | Target       | Notes                |
| ----------------------------- | ------- | ------------ | -------------------- |
| Daily brief open rate         | Unknown | > 50%        | Beta                 |
| Action completion from brief  | Unknown | > 60% in 24h | Beta + 30 days       |
| Repeat daily usage (7-day)    | Unknown | > 45%        | GA + 30 days         |
| Time to "what changed" answer | Unknown | < 2 minutes  | User research target |

---

## Open Questions

1. **Dynamic feed vs immutable daily snapshot** — Should v1 lock the brief at a point in time (newspaper) or allow live updates?
2. **Mandatory source systems** — Which sources (meetings, CRM, Slack, email, calendar, tasks) are required for v1 launch?
3. **Morning vs evening density** — Optimal information density and interaction level for each mode?
4. **Role-aware vs universal** — Same brief for all personas or persona-specific sections?

---

## Feedback Plan

| Method               | When             | Goal                                                 |
| -------------------- | ---------------- | ---------------------------------------------------- |
| Internal dogfooding  | Define phase     | Validate newspaper model and action ordering         |
| Customer interviews  | Define → Build   | Validate immutable vs dynamic, source prioritization |
| Beta usage analytics | Build → Validate | Open rate, action completion, repeat usage           |
| Post-launch surveys  | GA + 30 days     | Perceived volatility, missing context rate           |

---

## Research Gaps

1. Validate immutable vs dynamic daily model with external users.
2. Validate optimal density and interaction level for morning vs evening modes.
3. Gather verbatim quotes from sales reps and leaders on current "what changed?" behavior.

---

_Last updated: 2026-02-17_
