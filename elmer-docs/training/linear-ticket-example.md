# Linear Ticket Example: Before vs. After Elmer

## Purpose

Use this in Slide 11 of the training to show the contrast between a current ticket and an Elmer-generated ticket.

---

## CURRENT STATE: A real ticket from Linear (Feb 2026)

**ASK-4872 — Populate toolkits**
```
Status: In Progress
State: In Progress  
Priority: —
Assignee: Engineer
Labels: —
Description: "Populate toolkits"
```

**ASK-4866 — Chat v2 system prompt refinement**
```
Status: Acceptance Review
Description: "Chat v2 system prompt refinement"
```

**ASK-4871 — Tool registry, search and execute**
```
Status: In Code Review
Description: "Tool registry, search and execute"
```

**Observation:** These are real, in-progress tickets from our Linear board as of Feb 1, 2026. Each has a title and a status — nothing else. No visual reference, no acceptance criteria, no PostHog events, no engineering spec link. An engineer implementing these is working from their own interpretation.

---

## FUTURE STATE: Elmer-Generated Ticket (what Gate 2 produces)

**[ACCC-001] — Morning Brief: Success State**

```
Title: Implement Morning Brief — Success State
Initiative: Agent Command Center v10
Phase: Build
Priority: P0
Assignee: —

──────────────────────────────────────────────────────
STORYBOOK REFERENCE (acceptance criteria)
──────────────────────────────────────────────────────
https://main--696c2c54e35ea5bca2a772d8.chromatic.com/
  ?path=/story/prototypes-agentcommandcenter-v10-morningbrief--success

Acceptance Criteria: 
  - Component renders in Success state matching Storybook story exactly
  - All 4 action items are displayed with correct hierarchy
  - "View all" link is present and navigable
  - Component is responsive at 320px, 768px, 1280px breakpoints
  - All props match story controls panel

──────────────────────────────────────────────────────
ENGINEERING SPEC REFERENCE
──────────────────────────────────────────────────────
/elmer-docs/initiatives/agent-command-center/engineering-spec.md#morning-brief

Key technical requirements from spec:
  - Component: MorningBrief (React FC)
  - Data source: useAgentBrief() hook (see spec §3.2)
  - Props: actionItems[], userName, date, isLoading, hasError
  - State management: local only, no Redux needed for MVP

──────────────────────────────────────────────────────
POSTHOG EVENTS (instrument these)
──────────────────────────────────────────────────────
  - morning_brief_viewed { userId, actionCount, date }
  - morning_brief_action_clicked { userId, actionId, actionType }
  - morning_brief_dismissed { userId, date }

──────────────────────────────────────────────────────
STATES TO IMPLEMENT (all have Storybook stories)
──────────────────────────────────────────────────────
  - Loading (short): .../morningbrief--loading-short
  - Loading (long): .../morningbrief--loading-long
  - Success: .../morningbrief--success ← THIS TICKET
  - Error: .../morningbrief--error (separate ticket: ACCC-002)
  - Empty: .../morningbrief--empty (separate ticket: ACCC-003)

──────────────────────────────────────────────────────
JURY VALIDATION RESULTS
──────────────────────────────────────────────────────
  Overall pass rate: 82% (above 70% gate)
  Sales Rep approval: 88%
  Sales Manager approval: 79%
  Top concern addressed: "Show why AI made this selection" 
    → Implemented as tooltip in Success state (see Storybook story)

Estimated size: 4–6 hours
```

---

## What To Say in the Training

> "Here's a real ticket from our Linear board — 'Populate toolkits.' That's the whole description. How do you know when you're done? What does 'populated' look like? What states should it handle?"

> "Now here's what Elmer generates from a validated prototype. Same 4–8 hour scope, but: the acceptance criteria is a Storybook URL — not a paragraph of description. The PostHog events are specified before you start, not discovered at the end. The engineering spec section links directly to the relevant section. And you can see the jury results — what percentage of synthetic users validated this direction."

> "The key difference: with the Elmer ticket, you can start writing code in 5 minutes. With the current ticket, you spend 30 minutes Slacking the PM asking what 'populate' means."

---

## The Contrast Table (for slide)

| Field | Current ticket | Elmer-generated ticket |
|-------|---------------|----------------------|
| Title | "Populate toolkits" | "Implement Morning Brief — Success State" |
| Description | None / 1 line | Full spec with sections |
| Visual reference | None | Storybook story URL |
| Acceptance criteria | Implicit | "Matches story exactly" |
| PostHog events | None | Explicitly listed |
| Engineering spec | None | Linked section |
| Scope estimate | None | 4–6 hours |
| Validation evidence | None | Jury 82% pass rate |
| States covered | Unknown | All 5 states, separate tickets |

---

## Notes

- The current Linear tickets shown are real (from the Feb 1 Linear sync in `pm-workspace-docs/signals/issues/2026-02-01-linear-recent-issues.md`)
- The Elmer-generated ticket is a mock/example based on the Agent Command Center v9/v10 initiative
- The Chromatic URL in the example is real and functional for the v9 prototype: `https://672502f3cbc6d0a63fdd76aa-luwvsxctjp.chromatic.com/?path=/story/prototypes-agentcommandcenter-v9`
