# Daily Brief - PRD

## Overview

Daily Brief is a cross-signal Chief of Staff readout that helps users start and end the day with prioritized actions, contextual updates, and decision support.

## Problem Statement

Users cannot reliably answer "what changed and what should I do today?" because context is spread across meetings, CRM, Slack, email, calendar, and tasks.

## Target Personas

- [x] Sales Representative
- [x] Sales Leader
- [x] CSM
- [x] RevOps

## Outcome Chain

```
Cross-signal daily brief with action-first ordering
  → so that users have one trusted daily operating readout
    → so that they execute higher-priority actions earlier
      → so that team throughput and consistency increase
        → so that revenue outcomes improve
```

---

## Requirements

### Must Have

- [ ] Daily brief includes meetings + CRM + comms (Slack/email) + calendar/task context
- [ ] Brief supports morning and end-of-day modes with distinct content
- [ ] User can execute actions inline from brief (approve, edit, schedule)
- [ ] Historical daily snapshots are accessible
- [ ] Action-first ordering; scannable in < 2 minutes

### Should Have

- [ ] Value banner: "AI processed X meetings, Y CRM updates"
- [ ] Evidence linking for meeting-derived actions
- [ ] Email or Slack delivery option for morning brief
- [ ] User override for morning vs evening mode

### Could Have

- [ ] Role-aware sections (rep vs leader)
- [ ] Custom section ordering
- [ ] Offline/cached view

---

## Success Metrics

| Metric                             | Current | Target       | Timeline       |
| ---------------------------------- | ------- | ------------ | -------------- |
| Daily brief open rate              | Unknown | > 50%        | Beta           |
| Action completion from daily brief | Unknown | > 60% in 24h | Beta + 30 days |
| Repeat daily usage (7-day)         | Unknown | > 45%        | GA + 30 days   |

---

## E2E Lifecycle

1. **Ingestion** — Signals flow from meetings, CRM, Slack, email, calendar, tasks into brief pipeline.
2. **Generation** — Brief is assembled with priority ordering; morning/evening mode applied.
3. **Delivery** — User receives brief (in-app, email, or Slack).
4. **Interaction** — User scans, executes actions inline.
5. **Persistence** — Daily snapshot is stored for historical access.
6. **Feedback** — Usage and action completion feed metrics.

---

## Dependencies

- Chief of Staff cross-signal ingestion (meetings, CRM, comms)
- Meeting Summary artifact (for meeting-derived actions)
- Action Items / workflow outputs (for approval queue)
- Calendar and task integrations (for context)

---

## Risks

| Risk                           | Likelihood | Impact | Mitigation                                      |
| ------------------------------ | ---------- | ------ | ----------------------------------------------- |
| Signal coverage gaps           | Medium     | High   | Define v1 mandatory sources; degrade gracefully |
| Brief fatigue / low open rate  | Medium     | High   | Validate newspaper model; optimize density      |
| Morning vs evening scope creep | Low        | Medium | Ship morning first; add evening in v2           |

---

## Timeline / Milestones

| Milestone        | Target          | Notes                                       |
| ---------------- | --------------- | ------------------------------------------- |
| v1 scope locked  | Define complete | Mandatory sources, morning/evening behavior |
| Internal dogfood | Build           | Newspaper model validation                  |
| Beta launch      | TBD             | Limited rollout                             |
| GA               | TBD             | Post-validate                               |

---

## User Stories

### Epic: Actionable daily operating paper

**As a** revenue operator,  
**I want to** see an interactive daily recap with prioritized actions and why they matter,  
**So that** I can execute quickly with confidence.

#### Acceptance Criteria

- [ ] Daily brief includes meetings + CRM + comms + calendar/task context
- [ ] Brief supports morning and end-of-day modes
- [ ] User can execute actions inline from brief
- [ ] Historical daily snapshots are accessible

---

## Scope

### In Scope

- Daily brief artifact
- Cross-signal ingestion (v1 subset)
- Interactive action cards
- Historical daily navigation

### Out of Scope

- Fully custom dashboard builder
- Real-time arbitrary analytics exploration

---

## Open Questions

- [ ] Dynamic feed vs immutable daily snapshot model for v1?
- [ ] Which source systems are mandatory for v1 launch?

---

_Last updated: 2026-02-17_  
_Owner: Tyler_
