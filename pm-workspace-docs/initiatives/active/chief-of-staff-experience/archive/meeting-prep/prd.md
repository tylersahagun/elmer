# Meeting Prep - PRD

## Overview

Meeting Prep creates a pre-call context artifact so users can enter conversations with relevant history, risks, goals, and recommended next moves. The artifact is persona-aware, time-windowed, and feeds from prior recap output.

## Problem Statement

Pre-meeting prep is manual and fragmented across CRM, prior meeting notes, and tasks. This slows execution and increases missed context.

## Target Personas

- [x] Sales Representative
- [x] Sales Leader
- [x] CSM
- [ ] RevOps

## Outcome Chain

```
Automated prep artifact before meetings
  → so that users enter calls with context and clear objectives
    → so that call quality and decision quality improve
      → so that post-call follow-through improves
        → so that revenue outcomes improve
```

## Success Metrics

| Metric                              | Current | Target     | Timeline     |
| ----------------------------------- | ------- | ---------- | ------------ |
| Prep artifact viewed before meeting | Unknown | > 55%      | Beta         |
| Time spent gathering context        | Unknown | -40%       | GA + 30 days |
| Follow-up quality rating            | Unknown | +20% trend | GA + 60 days |

## Requirements

### Must Have

- [ ] Prep packet generated automatically before scheduled meetings (configurable window, e.g., 60 min)
- [ ] Includes prior meeting key takeaways, open risks, and pending actions
- [ ] Shows recommended agenda and follow-up goals
- [ ] Linkage to prior recap; explicit "what changed since last touch"
- [ ] Persona-aware prep blocks (seller vs CSM vs leader)
- [ ] Source attribution for each block (meeting date, CRM)
- [ ] Delivery in Chief of Staff hub (or configurable channel)

### Should Have

- [ ] Meeting type skip list (e.g., internal standups)
- [ ] Prep list view for multi-meeting days (chronological)
- [ ] Empty state for first meeting with contact
- [ ] Recency indicator ("Last touch: [date]" or "No prior meeting")

### Could Have

- [ ] Prep artifact length/structure customization
- [ ] Email/Slack delivery option
- [ ] Prep editing with AI assistance (post-v1)

## E2E Lifecycle

1. **Trigger** — Scheduled meeting in window (e.g., 60 min)
2. **Generation** — System assembles prep from recaps, open actions, CRM
3. **Delivery** — Prep surfaced in Chief of Staff hub
4. **Consumption** — User reviews before call
5. **Feedback loop** — View/usage analytics inform iteration

## Dependencies

- **Recap pipeline** — Prior meeting summaries must exist for recap→prep flow
- **CRM integration** — Account/contact context for prep blocks
- **Calendar integration** — Meeting schedule for trigger
- **Chief of Staff hub** — Surface for prep artifact (parent initiative)

## Risks

| Risk                         | Likelihood | Impact | Mitigation                                     |
| ---------------------------- | ---------- | ------ | ---------------------------------------------- |
| Prep window too short/long   | Medium     | Medium | Configurable; validate in Beta                 |
| Low prior recap coverage     | Medium     | High   | Graceful degradation; "No prior meeting" state |
| Persona blocks insufficient  | Low        | Medium | Start with seller/CSM; iterate                 |
| Adoption below 55% view rate | Medium     | High   | Delivery placement, notification timing        |

## Timeline / Milestones

| Milestone | Target  | Deliverables                                       |
| --------- | ------- | -------------------------------------------------- |
| Define    | 2026-02 | Prep packet schema, trigger behavior, design brief |
| Build v1  | TBD     | Generation, delivery, hub integration              |
| Beta      | TBD     | 5–10 users; view rate, time-to-context metrics     |
| GA        | TBD     | Full rollout; -40% context-gathering time target   |

## User Stories

### Epic: Pre-call intelligence packet

**As a** seller or CSM,  
**I want to** receive a prep packet before each key meeting,  
**So that** I can focus on strategic conversation quality instead of manual context gathering.

#### Acceptance Criteria

- [ ] Prep packet generated before scheduled meetings
- [ ] Includes prior meeting key takeaways, open risks, and pending actions
- [ ] Shows recommended agenda and follow-up goals
- [ ] Persona-aware blocks
- [ ] "What changed since last touch" section
- [ ] Source attribution per block

## Scope

### In Scope

- Automatic prep generation
- Persona-aware prep blocks
- Linkage to prior summary and open actions
- Time-windowed delivery
- Chief of Staff hub surface

### Out of Scope

- Full account plan authoring
- Advanced coaching analytics
- Prep editing with AI (v1)
- Real-time prep updates during call

## Open Questions

- [ ] What is the trigger window for prep generation (e.g., 60 min pre-meeting)?
- [ ] Which meeting types should skip prep by default?
- [ ] Preferred prep artifact length and structure?
- [ ] Email/Slack delivery in v1 or post-v1?

---

_Last updated: 2026-02-17_  
_Owner: Tyler_
