# Transcript: Weekly Team End-of-Week Report

**Date:** 2026-01-30  
**Source:** Meeting transcript  
**Participants:** Bryan Lund, Matt Noxon, Jason Harmon, Palmer Turley

## TL;DR

Engineering reported major latency improvements (p99 down 2-3x, still targeting <5s), strong progress on NX and code review skill work, and onboarding improvements with personalization plus a new PostHog dashboard. Palmer is redefining chat around artifacts (notes object + new prompt + Composio + AskElephant tools). Bryan automated a full ticket end-to-end and flagged the need for architectural upgrades and human-in-loop controls for multi-ticket automation. Product/design direction is limited this week due to board prep.

## Key Decisions

- Target p99 latency below five seconds as the reliability goal.
- Proceed with NX migration planning for the monorepo.
- Continue building automation with human-in-the-loop controls for advanced ticketing.

## Action Items

- [ ] Finalize NX migration plan and sequence for the monorepo. (Owner: Eng)
- [ ] Track p99 latency until it stays below five seconds. (Owner: Eng)
- [ ] Define human-in-loop design for multi-ticket automation. (Owner: Eng/Product)
- [ ] Share onboarding PostHog dashboard with Product for review. (Owner: Eng/Product)
- [ ] Clarify privacy determination agent open beta status and marketing plan. (Owner: Product/Marketing)

## Problems Identified

### Problem 1: p99 latency still above target

> "We still have the goal of keeping p 99 below five seconds." — Matt

- **Persona:** Internal (engineering)
- **Severity:** Medium
- **Frequency:** Ongoing

### Problem 2: Privacy determination agent open beta status unclear

> "I don't know where it's in at terms of marketing and stuff." — Jason

- **Persona:** Product, GTM
- **Severity:** Medium
- **Frequency:** Ongoing

### Problem 3: Project direction limited due to board prep

> "We haven't had a ton of direction from design and product because they've been distracted by getting ready for the board deck and board meeting." — Bryan

- **Persona:** Engineering
- **Severity:** Medium
- **Frequency:** Short-term

### Problem 4: Automation needs architectural upgrades + human-in-loop

> "Updates needed to handle architectural concerns and more advanced ticketing and then introduce human in the loop." — Bryan

- **Persona:** Engineering
- **Severity:** Medium
- **Frequency:** Ongoing

## Feature Requests

- Human-in-the-loop approval for automation workflows.
- Multi-ticket automation with lightweight oversight.
- Artifact-centric chat experience (notes object, improved prompt).
- Onboarding durability dashboard for visibility.

## Strategic Alignment

- Medium alignment with **Trust Foundation** (human-in-loop).
- Medium alignment with **Data Knowledge** (onboarding insights).
- Supports **Quality over Velocity** (latency, architectural upgrades).

## Problems Status Tracking

### problems_open

- p99 latency not yet consistently below five seconds.
- Privacy determination agent open beta status unclear.
- Product/design direction limited due to board prep.
- Automation architecture upgrades pending for advanced ticketing.

### problems_resolved

- None noted.

### problems_workaround

- None noted.

### problems_tracked

- None noted (no Linear IDs mentioned).

## Hypothesis Candidates

1. Human-in-loop controls will make automation trustworthy enough to scale across multiple concurrent tickets.
2. Artifact-first chat (notes object + prompt) improves user comprehension and follow-through.
3. Onboarding personalization + durability visibility increases activation and retention.

## Notes

Key quotes:

- "We got the p 99 latency... improved it by probably, like, two x at least, maybe closer to three."
- "Created a bunch of cool insights and a post hoc dashboard for durability into the onboarding process."
