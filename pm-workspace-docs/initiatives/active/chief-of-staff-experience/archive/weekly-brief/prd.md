# Weekly Brief - PRD

## Overview

Weekly Brief is a cross-signal rollup that tracks progress, risks, and carry-forward commitments for the week ahead.

## Problem Statement

Current weekly review is inconsistent and dependent on manual synthesis. Users lack one reliable view of trends, completed work, unresolved risk, and next commitments.

## Target Personas

- [x] Sales Representative
- [x] Sales Leader
- [x] CSM
- [x] RevOps

## Outcome Chain

```
Weekly brief with trends and carry-forward commitments
  → so that teams can review progress and reset execution
    → so that missed follow-through decreases
      → so that forecast confidence improves
        → so that business outcomes improve
```

---

## Requirements

### Must Have

- [ ] Weekly brief includes trend deltas and highlights
- [ ] Unfinished critical items carry forward explicitly
- [ ] User can assign or schedule actions from weekly brief
- [ ] Narrative format (not raw data dump)
- [ ] Historical weekly briefs accessible

### Should Have

- [ ] Decision sections (commit / defer / drop)
- [ ] Risk acknowledgment workflow
- [ ] Publish vs draft (lock after publish)
- [ ] Role-aware emphasis (leader vs rep)

### Could Have

- [ ] Custom trend windows
- [ ] Export / share weekly brief
- [ ] Team rollup view for leaders

---

## Success Metrics

| Metric                             | Current | Target | Timeline       |
| ---------------------------------- | ------- | ------ | -------------- |
| Weekly brief open/completion       | Unknown | > 35%  | Beta + 30 days |
| Carry-forward completion next week | Unknown | > 65%  | GA + 30 days   |
| Weekly risk acknowledgment rate    | Unknown | > 70%  | GA + 30 days   |

---

## E2E Lifecycle

1. **Aggregation** — Daily brief outputs, meeting summaries, CRM changes, action status flow into weekly pipeline.
2. **Computation** — Trends calculated; carry-forward items identified; risk surfaced.
3. **Generation** — Weekly brief assembled with narrative and decision sections.
4. **Delivery** — User receives brief (in-app or link).
5. **Interaction** — User reviews, acknowledges risks, assigns/schedules carry-forward.
6. **Persistence** — Weekly snapshot stored; carry-forward items flow to next week.
7. **Feedback** — Completion and acknowledgment feed metrics.

---

## Dependencies

- Daily Brief (primary input)
- Meeting Summary and action artifacts
- CRM and activity data
- Action Items / workflow state

---

## Risks

| Risk                           | Likelihood | Impact | Mitigation                                            |
| ------------------------------ | ---------- | ------ | ----------------------------------------------------- |
| Carry-forward logic complexity | Medium     | High   | Start with explicit user tagging; automate later      |
| Low weekly engagement          | Medium     | High   | Validate narrative format; tie to existing rituals    |
| Overlap with forecast tools    | Low        | Medium | Position as operating brief, not forecast replacement |

---

## Timeline / Milestones

| Milestone        | Target          | Notes                               |
| ---------------- | --------------- | ----------------------------------- |
| v1 scope locked  | Define complete | Trend set, carry-forward rules      |
| Internal dogfood | Build           | Carry-forward and decision sections |
| Beta launch      | TBD             | After daily brief beta              |
| GA               | TBD             | Post-validate                       |

---

## User Stories

### Epic: Weekly execution reset

**As a** leader or operator,  
**I want to** review what changed this week and what must carry forward,  
**So that** I can run a better weekly planning and accountability cycle.

#### Acceptance Criteria

- [ ] Weekly brief includes trend deltas and highlights
- [ ] Unfinished critical items carry forward explicitly
- [ ] User can assign or schedule actions from weekly brief

---

## Scope

### In Scope

- Weekly rollup and trend cards
- Carry-forward queue
- Action handoff from weekly brief
- Historical weekly navigation

### Out of Scope

- Full BI dashboard replacement
- Long-term forecasting model design

---

## Open Questions

- [ ] Which trend windows are required for v1?
- [ ] Should weekly brief lock after publishing or allow edits?

---

_Last updated: 2026-02-17_  
_Owner: Tyler_
