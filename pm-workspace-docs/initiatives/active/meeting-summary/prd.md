# Meeting Summary PRD

**Status:** DRAFT — Pending Tyler's clarification on scope questions  
**Owner:** Tyler Sahagun  
**Eng Lead:** Palmer Turley  
**Design Lead:** Skylar Sanford  
**Revenue Lead:** Robert  
**Phase:** Build  
**Target Launch:** May 4, 2026  
**Open Beta Target:** April 15, 2026  
**Parent:** Standalone (previously: Chief of Staff Experience > meeting-summary)  
**Project Sprint:** Project Babar

---

> **NOTE:** This is a standalone initiative extracted from `chief-of-staff-experience/archive/meeting-summary`. The full PRD lives in the archive. This document captures the evolved build-phase scope and open questions. See `research.md` for full context.

---

## Initiative Scope (Confirmed by Tyler, 2026-03-04)

| Question | Answer |
|---|---|
| Relationship to Meeting Prep | **Separate initiative.** This covers Meeting Summary agent only. |
| Relationship to Chief of Staff | **Prerequisite.** Meeting Summary feeds back into CoS once shipped. CoS = 5-agent product launching May 4. |
| May 4 scope | **Full Chief of Staff product with 5 agents:** Meeting Summary + Meeting Prep + Daily Brief + Weekly Brief + Action Items. |
| Template approach | **No template picker.** Learning agent that infers meeting type from patterns. User shapes preferences through chat input. Implicit, not explicit. |

---

## What Changed from the Archive

The Chief of Staff archive had Meeting Summary as an artifact-tab within the engagement detail view. The scope has evolved under Project Babar:

1. **Event page redesign** — Not just a tab; a full redesign of the meeting page (event page) with Meeting Summary as the hero artifact alongside transcript
2. **Meeting Prep companion** — Meeting Prep ships alongside Meeting Summary as a paired experience
3. **Sharing as first-class flow** — End-to-end sharing (not just a button) is a key deliverable for open beta
4. **Simpler template configuration** — Drag-and-drop prompt-based config replacing workflow-based configuration
5. **May 4 launch target** — Full Chief of Staff 5-agent product launch with Tony coordinating PR
6. **Learning agent instead of template picker** — No explicit template selection; the system learns meeting type and user preferences from patterns and adapts via chat. Palmer's "implicit configuration" model: watch what users engage with, adapt over time without asking. Users correct via natural chat ("Make future discovery call summaries more concise.")

---

## Core Outcome Chain (Unchanged)

```
Meeting Summary as first-class editable artifact
  → users shape output to match team needs (zero workflow config)
    → recap consumption and trust increase (evidence-backed, editable)
      → follow-up execution improves (action items trusted and acted on)
        → revenue workflow reliability improves
          → deal velocity and retention improve
```

---

## Scope (Build Phase — Needs Confirmation)

### In Scope (Current Sprint)
- [ ] Meeting summary v1.1 — minor UI updates (Palmer, in progress)
- [ ] Event page redesign — formal redesign of the meeting detail page (Palmer, queued)
- [ ] End-to-end Meeting Summary + Sharing prototype (Skylar, in progress)
- [ ] Artifact variants design: Full view, In-line chat, Reference Chip (Skylar)
- [ ] Meeting Prep end-to-end prototype (Skylar, Robert)
- [ ] 3 customer syncs for feedback (Robert)

### Open Questions on Scope
- Does Meeting Prep live in this initiative or separately?
- Does the event page redesign include transcript view changes?
- What is the v1 template experience: drag-and-drop config OR curated template picker?
- What's the exact sharing scope for open beta (link/email/Slack/external)?

---

## Success Metrics (Inherited — Confirm Baseline)

| Metric | Target | Timeline |
|---|---|---|
| Summary weekly engagement rate | >60% of users with meetings view summary/week | GA + 60 days |
| Template applied rate (non-default) | >35% | GA + 60 days |
| AI section edit usage | >25% of summary views | GA + 60 days |
| Summary share rate | >30% improvement over baseline | GA + 60 days |
| Time to first summary view | <2 minutes post-meeting | Beta |

**PostHog Dashboard:** [Chief of Staff Dashboard](https://us.posthog.com/shared/TXZ6pyGjHhS3RNKsnK-i-K0q3Qr6ug)

---

## Release Gates (To Be Defined)

Tyler committed to defining release gates on 2026-02-24. Questions to answer:

- What's the minimum bar for open beta?
- What's the hard "no-launch" threshold on summary generation latency?
- What quality threshold triggers "Summary may be incomplete" warning?

---

## Key Dependencies

- **Global Chat** — AI section edit uses the conversational interface
- **Transcript pipeline** — Summary generation depends on transcript processing
- **Privacy/trust rails** — Share controls inherit from platform privacy framework
- **PostHog** — Feature flags for staged rollout + analytics

---

## Full Specification Reference

All detailed specs (user stories, flows, trust model, competitive landscape, engineering spec) are preserved in the archive:

- **PRD:** `chief-of-staff-experience/archive/meeting-summary/prd.md`
- **Research:** `chief-of-staff-experience/archive/meeting-summary/research.md`  
- **Design Brief:** `chief-of-staff-experience/archive/meeting-summary/design-brief.md`
- **Engineering Spec:** `chief-of-staff-experience/archive/meeting-summary/engineering-spec.md`
- **GTM Brief:** `chief-of-staff-experience/archive/meeting-summary/gtm-brief.md`
- **Prototype Notes:** `chief-of-staff-experience/archive/meeting-summary/prototype-notes.md` (v1–v4)

---

_Last updated: 2026-03-04_  
_Owner: Tyler Sahagun_
