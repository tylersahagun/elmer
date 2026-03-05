# Design Brief: Meeting Prep

## Overview

Meeting Prep creates a pre-call context artifact so users enter conversations with relevant history, risks, goals, and recommended next moves. The artifact is persona-aware, time-windowed, and feeds from prior recap output.

## Information Architecture

```
Chief of Staff Experience
└── Meeting Prep
    ├── Prep Packet (per meeting)
    │   ├── Prior Meeting Takeaways
    │   ├── Open Risks / Pending Actions
    │   ├── Recommended Agenda & Goals
    │   └── What Changed Since Last Touch
    └── Scheduling / Trigger
        ├── Generation window (e.g., 60 min pre-meeting)
        └── Meeting type filters (skip internal, etc.)
```

## User Flow

1. **Trigger** — Scheduled meeting approaches (configurable window)
2. **Generation** — System assembles prep from: prior recaps, open actions, CRM context
3. **Delivery** — Prep packet surfaced in Chief of Staff hub (or email/Slack per config)
4. **Consumption** — User reviews prep before joining call
5. **(Optional)** — User adjusts or adds notes; flows into meeting

## Key Screens / States

| Screen                        | Purpose                                                   |
| ----------------------------- | --------------------------------------------------------- |
| Prep packet view              | Primary artifact: takeaways, risks, goals, "what changed" |
| Prep list (multi-meeting day) | Chronological list of upcoming meetings with prep status  |
| Empty state                   | No prior context; "First meeting with this contact"       |
| Loading state                 | Prep generating (e.g., "Assembling your prep...")         |
| Error state                   | Generation failed; retry or manual prep                   |

## Trust / Approval Behavior

- Prep is **read-only** in v1; no AI actions triggered from prep
- Source attribution for each block ("From 2026-02-15 discovery call")
- No approval gate; prep is informational, not workflow-triggered
- Privacy: Prep follows existing capture/privacy rules for meeting data

## Interaction Rules

- Prep generated automatically within trigger window (e.g., 60 min)
- Meeting types: configurable skip list (e.g., internal standups)
- Persona-aware blocks: seller vs CSM vs leader get relevant sections
- Linkage: Each block links to source (prior meeting, CRM field) where applicable
- Recency indicator: "Last touch: 2026-02-15" or "No prior meeting"

## Non-Goals (Out of Scope)

- Full account plan authoring
- Advanced coaching analytics
- Prep editing with AI assistance (v1)
- Real-time prep updates during call
- Prep sharing / collaboration (v1)

## Design Principles

- **Artifact-first** — Prep is a consumed document, not a dashboard to explore
- **Continuity** — Recap flows into prep; explicit linkage
- **Right moment** — Time-windowed delivery, not buried
- **Confidence** — "What changed" reduces anxiety

## References

- [PRD](./prd.md)
- [Research](./research.md)
- [Competitive landscape](./competitive-landscape.md)

---

_Last updated: 2026-02-17_
