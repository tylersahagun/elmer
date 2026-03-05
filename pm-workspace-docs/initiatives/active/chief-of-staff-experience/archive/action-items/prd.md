# Action Items - PRD

## Overview

Action Items is the execution engine for Chief of Staff: a unified queue that surfaces recommended actions with evidence, confidence, and next-step controls. Users can approve, edit, snooze, or schedule follow-up with calendar-aware suggestions.

## Problem Statement

Action recommendations are currently fragmented across recap outputs and disconnected systems, causing delayed follow-through and lost momentum.

## Target Personas

- [x] Sales Representative
- [x] Sales Leader
- [x] CSM
- [x] RevOps

## Outcome Chain

```
Unified action queue with approve/edit/schedule controls
  → so that users can execute high-impact actions quickly
    → so that follow-up latency decreases
      → so that opportunities and accounts progress faster
        → so that win/retention outcomes improve
```

## Success Metrics

| Metric                           | Current | Target | Timeline       |
| -------------------------------- | ------- | ------ | -------------- |
| 24-hour action completion        | Unknown | > 60%  | Beta + 30 days |
| Action recommendation acceptance | Unknown | > 50%  | Beta + 30 days |
| Follow-up scheduling conversion  | Unknown | > 35%  | GA + 30 days   |

## Requirements

### Must Have

- [ ] Action queue with prioritization (urgency/impact or source)
- [ ] Each action includes rationale and source evidence (quote, meeting link)
- [ ] Confidence indicator per action (low/medium/high)
- [ ] Controls: Approve, Edit, Snooze, Schedule
- [ ] Approve executes action (e.g., CRM update, task create)
- [ ] Edit allows modification before execution
- [ ] Snooze defers with time picker (tomorrow, next week)
- [ ] Schedule: calendar-aware slot suggestions when applicable
- [ ] Evidence-backed display (source quotes, meeting reference)

### Should Have

- [ ] Risk-tiered auto-run (high confidence auto-execute; low requires approval)
- [ ] Grouping options: by urgency, by account, by meeting
- [ ] Bulk approve (low-risk actions)
- [ ] Audit trail: what ran, when, result

### Could Have

- [ ] Leader→rep action routing (assign to rep)
- [ ] Custom confidence thresholds by persona
- [ ] Action templates for repeat patterns

## E2E Lifecycle

1. **Surfacing** — Actions enter queue from meeting recaps, workflows, manual add
2. **Prioritization** — Queue sorted by urgency/impact
3. **Review** — User sees action with evidence and confidence
4. **Execute** — Approve / Edit / Snooze / Schedule
5. **Completion** — Action marked done; CRM/task updated
6. **Feedback loop** — 24h completion, acceptance, scheduling conversion metrics

## Dependencies

- **Recap pipeline** — Actions extracted from meeting summaries
- **Workflow engine** — Action creation from workflows (or manual)
- **CRM integration** — Execute approved actions (HubSpot, Salesforce)
- **Calendar integration** — Schedule follow-up with slots
- **Chief of Staff hub** — Queue surface (parent initiative)

## Risks

| Risk                                          | Likelihood | Impact | Mitigation                                 |
| --------------------------------------------- | ---------- | ------ | ------------------------------------------ |
| Approval fatigue (too many low-value actions) | Medium     | High   | Risk-tiered auto-run; confidence threshold |
| Low acceptance (< 50%)                        | Medium     | High   | Evidence quality; tune confidence model    |
| Scheduling conversion below 35%               | Medium     | Medium | Calendar UX; one-click slots               |
| Confidence threshold wrong                    | Medium     | Medium | Configurable; validate by persona          |

## Timeline / Milestones

| Milestone | Target  | Deliverables                                   |
| --------- | ------- | ---------------------------------------------- |
| Define    | 2026-02 | Confidence model, approval flows, design brief |
| Build v1  | TBD     | Queue, controls, evidence display              |
| Beta      | TBD     | 5–10 users; 24h completion, acceptance metrics |
| GA        | TBD     | Full rollout; scheduling conversion target     |

## User Stories

### Epic: Fast action execution

**As a** revenue user,  
**I want to** see a prioritized action queue with confidence and one-click next steps,  
**So that** I can move work forward immediately after key signals.

#### Acceptance Criteria

- [ ] Actions are grouped by urgency and impact
- [ ] Each action includes rationale and source evidence
- [ ] User can approve, edit, snooze, or schedule follow-up
- [ ] Follow-up suggestions include calendar-aware slots when applicable
- [ ] Confidence displayed per action
- [ ] Risk-tiered auto-run (configurable)

## Scope

### In Scope

- Action item queue and prioritization
- Approve/edit/snooze/schedule controls
- Confidence + rationale display
- Evidence (source quotes, meeting link)
- Calendar-aware scheduling
- Risk-tiered approval (approval by exception)

### Out of Scope

- Full project/task management replacement
- Autonomous high-risk actions without guardrails
- Leader→rep routing (v1 TBD)
- Custom workflow builder (separate initiative)

## Open Questions

- [ ] What confidence threshold should trigger auto-run versus approval?
- [ ] Should team leaders route actions to reps directly in v1?
- [ ] Preferred grouping: by urgency vs account vs meeting?
- [ ] Bulk approve scope for v1?

---

_Last updated: 2026-02-17_  
_Owner: Tyler_
