# Project Bapar - PRD

> **Status:** In Progress — Research (Rob) captured. Skyler, Palmer, Ivan pending.
> **Last updated:** 2026-03-09
> **Owner:** Tyler

---

## Overview

Project Bapar is an **AI-powered proactive chief-of-staff experience** for AskElephant users. It's not a meeting summary tool — it's a persistent, intelligent surface that continuously monitors what's happening across recordings, email, calendar, and Slack, and proactively tells users what needs to be done, what's already been handled, and what to prioritize — all in context of their role and business.

The v1 experience is an **interactive chat-based homepage with artifacts** that creates a "lightbulb moment": the user realizes AskElephant has done real cognitive work on their behalf, not just stored notes.

Two core sub-projects ship under this initiative:
1. **Meeting Summary** — Structured output from AskElephant note taker recordings
2. **Action Items** — Extracted, attributed, and proactively surfaced tasks with timing context

---

## Problem Statement

Users are overwhelmed by the cognitive load of managing their own context. It's not that they lack information — it's that the constant loop of organizing, remembering what to do, and remembering when to do it is exhausting and error-prone.

> "The biggest pain points from users is that organizing everything and having to actually remember to do things and then remembering them — that process, that loop is just really taxing." — Rob Henderson

> "We're trying to take the cognitive load off of them of not only remembering what to do, but when to do it and doing as much as possible for them in a way that is extremely contextual to their role in their business." — Rob Henderson

The opportunity: be the system that holds all of that context, reasons over it, and takes action or surfaces the right thing at the right time — so the user doesn't have to.

---

## Target Personas

- **Primary:** AskElephant users who run many meetings and manage follow-through (sales reps, revenue team, founders, team leads)
- **Secondary:** Anyone whose work is relationship + task driven across email, calendar, and Slack
- **Pilot users:** AskElephant's internal revenue team + an early adopter group already willing to test

---

## V1 Definition

> "V1 is an interactive chat-based homepage with artifacts that is proactively communicating what needs to be done and what has been done in a way that gives a light bulb moment to the user that Ask Elephant took considerable thinking and work off of their plate." — Rob Henderson

**What this means concretely:**
- An always-on homepage (not a per-meeting view)
- Chat interface for interaction + artifacts (summaries, action item lists) as structured outputs
- Proactive push: the system surfaces things before the user asks
- Covers both "what's done" and "what needs doing" — closing the loop visibly
- Creates a felt sense that the AI did real work, not just transcription

---

## Sub-Projects

### Sub-Project 1: Meeting Summary
**Goal:** Auto-generate structured summaries from AskElephant note taker recordings.

**Key outputs:**
- TL;DR (3–5 sentences)
- Key decisions made
- Discussion topics with brief context
- Participants

**Input:** AskElephant native note taker recordings (primary). Slack, Gmail as supplementary context.

**Status:** `[ ] Research` `[x] PRD` `[ ] Design` `[ ] Prototype` `[ ] Validation` `[ ] Eng Handoff`

---

### Sub-Project 2: Action Items
**Goal:** Extract, attribute, time-contextualize, and proactively surface action items from meeting recordings and integrated sources.

**Key outputs:**
- Action item list with attributed owner
- Timing context (when it needs to happen, inferred or explicit)
- Back-link to source moment
- Proactive surfacing on the homepage before user asks

**Status:** `[ ] Research` `[x] PRD` `[ ] Design` `[ ] Prototype` `[ ] Validation` `[ ] Eng Handoff`

---

## Success Metrics

| Metric | Current | Target | Timeline |
|--------|---------|--------|----------|
| "Lightbulb moment" — user feels AI did real work (qualitative pilot eval) | — | Majority of pilot sessions | v1 launch |
| Action item recall (explicit AIs captured) | — | ≥ 90% | TBD |
| Time user spends reconstructing meeting context | — | Near zero | TBD |
| Pilot user retention / return rate to homepage | — | > 70% D7 | TBD |
| Eval framework | Not yet defined | Define before pilot | Pre-launch |

---

## Scope

### In Scope (v1)
- Chat-based homepage with artifact output
- Proactive surfacing of action items and meeting summaries
- Input: AskElephant native note taker recordings
- Integrations: Calendar, Email (Gmail), Slack
- Role-contextual relevance filtering
- "What's done" + "what needs doing" dual surface

### Out of Scope (v1 → later)
- CRM integration
- Google Drive
- Linear / Jira
- Notion
- Real-time transcription
- Full task management system

### Future Considerations
- CRM, Google Drive, Linear, Notion integrations (post-v1)
- Proactive reminders / follow-up nudges
- Multi-workspace / multi-role context
- Public eval framework for summary quality

---

## Design

### Core UX Principle
The homepage must deliver a "lightbulb moment" — the user should immediately feel that the system has done something they couldn't easily do themselves. This is the north star for every design decision.

### User Flow (v1)
1. User opens AskElephant → lands on the proactive homepage
2. Homepage proactively surfaces: "Here's what happened + here's what needs to happen"
3. User can interact via chat to drill in, ask questions, or take action
4. Artifacts (summaries, action lists) are rendered inline as structured cards
5. User confirms, delegates, or dismisses items — closing the loop

### Wireframes/Mockups
> *(Link to existing UI work — document what has already been built)*

### Prototype
> *(Link to Storybook prototype if exists)*

---

## Technical Considerations
- Native integration with AskElephant note taker output (recording → transcript → structured data)
- Calendar API (Google Calendar v1)
- Gmail API (v1)
- Slack API (v1)
- Role context modeling: how do we know the user's role and business context?
- LLM reasoning layer: proactive surfacing requires inference, not just retrieval
- Artifact rendering: structured cards alongside chat responses

---

## Dependencies
- AskElephant note taker pipeline (recording → transcript)
- Calendar + Gmail + Slack integrations
- Role/context model for the user
- Chat + artifact UI components

---

## Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Proactive surfacing surfaces wrong/irrelevant things | High | Medium | Role context model + pilot feedback loop |
| No eval framework → can't know if it's working | High | High | Define eval rubric before pilot launch |
| Integration auth complexity (Calendar/Gmail/Slack) | Medium | Medium | Start with one, validate, then add |
| "Lightbulb moment" is hard to design for | High | Medium | Prototype early, test with revenue team |
| LLM misses implicit action items | High | Medium | Human review/edit step in homepage UX |

---

## Open Questions

- [ ] What does the eval framework look like? (No framework yet — must define before pilot)
- [ ] What did Skyler, Palmer, and Ivan say? (Still pending — need those interviews)
- [ ] What UI work already exists? (Need to document / link)
- [ ] How does role context get established — onboarding, inference, or both?
- [ ] What's the exact format of AskElephant note taker output (raw transcript? structured JSON?)
- [ ] Which Calendar integration first — Google only, or also Outlook?

---

## Timeline

| Milestone | Date | Status |
|-----------|------|--------|
| Research — Rob | 2026-03-09 | ✅ |
| Research — Skyler, Palmer, Ivan | TBD | ⏳ |
| PRD Complete | 2026-03-09 | 🔄 |
| Eval Framework Defined | TBD | ⬜ |
| Design Brief | TBD | ⬜ |
| Prototype Review | TBD | ⬜ |
| Pilot Launch (revenue team) | TBD | ⬜ |
| GA | TBD | ⬜ |
