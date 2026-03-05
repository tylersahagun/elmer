# Research: Action Items

## Summary

Action items are repeatedly cited as the highest-value output when they are specific, fast to execute, and tied to business context. Users respond strongly to action-first framing. Evidence and confidence are required for trust. Scheduling support can convert intent into execution.

## Primary Job-to-Be-Done

> When **I finish a meeting or receive a signal that requires follow-up**, I want to **see a prioritized action queue with evidence, confidence, and one-click next steps**, so I can **execute high-impact actions quickly and reduce follow-up latency**.

## Key Findings

### Finding 1: Users respond strongly to action-first framing

**Evidence:**

- Rob (v10 validation): "Focus on the action, insights are a byproduct"
- Agent Command Center v10: 88% validation on rapid-fire meeting clearing
- "I want to know what needs my attention, not browse a dashboard"

**Implications:**

- Action queue as primary surface, not secondary widget
- Prioritization by urgency and impact matters

### Finding 2: Evidence and confidence are required for trust

**Evidence:**

- Users hesitate to approve AI-suggested actions without rationale
- "Why did it recommend this?" is a trust barrier
- Source quotes and confidence scores increase acceptance

**Implications:**

- Every action must include rationale and source evidence
- Confidence display (e.g., low/medium/high) sets expectations
- Link to originating meeting/quote where possible

### Finding 3: Scheduling support converts intent into execution

**Evidence:**

- Users delay follow-up when scheduling is manual
- Calendar-aware slot suggestions reduce friction
- "If I could click to schedule, I'd do it; if I have to leave the app, it slips"

**Implications:**

- Approve/edit/snooze/schedule controls
- Calendar-aware slots when follow-up is time-sensitive
- One-click scheduling where applicable

## User Problems Identified

| Problem                                     | Severity | Frequency  | Evidence                                     |
| ------------------------------------------- | -------- | ---------- | -------------------------------------------- |
| Actions fragmented across recap and systems | High     | Common     | User feedback, Agent Command Center research |
| Delayed follow-through                      | High     | Common     | 24-hour completion target                    |
| Lack of evidence for AI suggestions         | Medium   | Common     | Trust barrier in v10                         |
| Manual scheduling creates friction          | Medium   | Occasional | "Leaving the app to schedule"                |
| All-or-nothing approval fatigue             | Medium   | Occasional | Need risk-tiered auto-run                    |

## User Breakdown & Quantitative Context

| Segment               | % of Total Users | Engagement                      | Data Source         |
| --------------------- | ---------------- | ------------------------------- | ------------------- |
| Sales Representatives | ~40%             | High action volume              | PostHog (estimated) |
| Sales Leaders         | ~15%             | Delegation, approvals           | PostHog (estimated) |
| CSMs                  | ~35%             | Renewal actions, QBR follow-ups | PostHog (estimated) |
| RevOps                | ~10%             | Workflow configuration          | PostHog (estimated) |

**Data availability:** Not instrumented for action queue behavior; estimated from persona mix. Target metrics defined in PRD (24h completion > 60%, acceptance > 50%, scheduling conversion > 35%).

## Quantitative Context

- 24-hour action completion: **Unknown** (target > 60% at Beta + 30 days)
- Action recommendation acceptance: **Unknown** (target > 50% at Beta + 30 days)
- Follow-up scheduling conversion: **Unknown** (target > 35% at GA + 30 days)
- Competitors: Clari Omnibar (closest), Gong Tasker, Relay.app (approval patterns)

## Open Questions

1. What confidence threshold should trigger auto-run versus approval?
2. Should team leaders route actions to reps directly in v1?
3. Validate confidence/risk thresholds by persona
4. Validate preferred defaults for follow-up scheduling suggestions
5. Grouping: by urgency, by account, by meeting source?

## Feedback Plan

| Method          | Instrument                             | Owner   | Cadence        |
| --------------- | -------------------------------------- | ------- | -------------- |
| Usage analytics | 24h completion, acceptance, scheduling | PostHog | Beta + 30 days |
| Interview       | Action queue usability                 | Tyler   | Beta + 2 weeks |
| Survey          | Action usefulness, trust               | In-app  | GA + 60 days   |

### Feedback Already Collected

- Chief of Staff hypothesis validation (hyp-chief-of-staff-action-first)
- Agent Command Center v10: meeting clearing, approval patterns
- Competitive: Clari Omnibar, Relay.app human-in-the-loop

## Related Research

- [Meeting Prep research](../meeting-prep/research.md) — Shared Chief of Staff context
- [Agent Command Center competitive landscape](../../agent-command-center/competitive-landscape.md)
- [Competitive landscape: Action Items](./competitive-landscape.md)

## Research Gaps

1. Validate confidence/risk thresholds by persona
2. Validate preferred defaults for follow-up scheduling suggestions
3. Auto-run vs approval threshold tuning

---

_Last updated: 2026-02-17_
