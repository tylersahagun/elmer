# Design Brief: Action Items

## Overview

Action Items is the execution engine for Chief of Staff: a unified queue that surfaces recommended actions with evidence, confidence, and next-step controls. Users can approve, edit, snooze, or schedule follow-up with calendar-aware suggestions.

## Information Architecture

```
Chief of Staff Experience
└── Action Items
    ├── Action Queue (primary view)
    │   ├── Grouping: by urgency/impact or by source (meeting/account)
    │   └── Per-action card
    │       ├── Action description
    │       ├── Rationale + source evidence
    │       ├── Confidence indicator
    │       └── Controls: Approve / Edit / Snooze / Schedule
    └── Filters / States
        ├── Pending / Approved / Snoozed / Completed
        └── (Optional) Assigned to (for leader→rep routing)
```

## User Flow

1. **Surfacing** — Actions appear in queue from meeting recaps, workflows, or manual add
2. **Review** — User sees action with evidence and confidence
3. **Execute** — User chooses: Approve (execute), Edit (modify then execute), Snooze (defer), Schedule (follow-up with calendar)
4. **Schedule (if chosen)** — Calendar-aware slot suggestions; one-click or pick slot
5. **Completion** — Action marked done; optional CRM update or task creation

## Key Screens / States

| Screen                 | Purpose                                           |
| ---------------------- | ------------------------------------------------- |
| Action queue           | Primary list: prioritized, grouped, with controls |
| Action detail / expand | Full rationale, source quotes, evidence links     |
| Schedule modal         | Calendar-aware slots; pick time for follow-up     |
| Edit modal             | Modify action before approval                     |
| Empty state            | No actions; "You're all caught up"                |
| Loading state          | Queue loading                                     |
| Error state            | Failed to load; retry                             |

## Trust / Approval Behavior

- **Evidence required** — Every action shows rationale and source (e.g., meeting quote)
- **Confidence display** — Low/medium/high or numeric; sets expectation
- **Risk-tiered auto-run** — High-confidence actions may auto-run; lower confidence requires approval
- **Approval by exception** — User approves edits or overrides; default is approve all for low-risk
- **Audit trail** — What ran, when, result (per Relay.app pattern)

## Interaction Rules

- **Approve** — Execute action as-is (e.g., CRM update, task create)
- **Edit** — Modify action text/assignment before execute
- **Snooze** — Defer; reappear at chosen time (e.g., tomorrow, next week)
- **Schedule** — Create calendar event or task with due date; calendar-aware slots when applicable
- **Grouping** — By urgency, by account, or by meeting source (configurable)
- **Bulk actions** — Approve all (low-risk), or batch snooze (v1 scope TBD)

## Non-Goals (Out of Scope)

- Full project/task management replacement
- Autonomous high-risk actions without guardrails
- Cross-user assignment/notification (v1; leader→rep routing TBD)
- Custom workflow builder for actions (separate initiative)

## Design Principles

- **Action-first** — Queue is primary; insights are byproduct
- **Evidence-backed** — Every action has source; trust through transparency
- **Execution velocity** — One-click next steps; minimize friction
- **Human-in-the-loop** — Approval by exception; never fully autonomous for high-risk

## References

- [PRD](./prd.md)
- [Research](./research.md)
- [Competitive landscape](./competitive-landscape.md)

---

_Last updated: 2026-02-17_
