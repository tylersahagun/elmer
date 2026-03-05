# Transcript: Weekly Development Progress Update

**Date:** 2026-01-30  
**Source:** Meeting transcript  
**Participants:** Kaden Wilkinson

## TL;DR

Infra reliability work moved forward: the monorepo migrated from npm to pnpm to reduce deploy errors and prepare for splitting services, Cloud SQL managed connection pooling shipped to reduce latency and improve tuning, and a Firebase CLI fork was created to unblock faster fixes. Next steps focus on Composio rollout controls (tool disable + human-in-loop), fixing draft-email sends, and improving tool selection to prefer internal search.

## Key Decisions

- Migrate monorepo from npm to pnpm to reduce deploy risk and enable service separation.
- Enable Cloud SQL managed connection pooling for functions to improve latency and scaling.
- Fork Firebase tools to gain faster control over CLI fixes and releases.
- Keep Composio tools behind a feature flag until safer controls are in place.

## Action Items

- [ ] Define rollout plan for Composio tools with customer safety controls. (Owner: Product/Eng)
- [ ] Add tool disable + human-in-the-loop approvals for Composio tool execution. (Owner: Eng)
- [ ] Fix "draft email" behavior so drafts do not send automatically. (Owner: Eng)
- [ ] Tune system prompt to prefer internal search over Composio search where appropriate. (Owner: Eng)
- [ ] Enable NX caching and measure CI/agent iteration time improvements. (Owner: Eng)

## Problems Identified

### Problem 1: Draft emails can send without review

> "When they ask to create email drafts, it will actually send the email instead of just draft it before they have a chance to review it." — Kaden

- **Persona:** Sales reps, CSMs
- **Severity:** High
- **Frequency:** Common (multiple complaints)

### Problem 2: Tool selection favors Composio search over internal search

> "Composio tools being searched rather than our own internal search. That's been a problem for people as well." — Kaden

- **Persona:** Reps, leaders
- **Severity:** Medium
- **Frequency:** Common

### Problem 3: Deploy errors increase outage risk

> "Reduce a bunch errors that we have on deploy that is possible could possibly cause us outages at some point down the future." — Kaden

- **Persona:** Internal (engineering)
- **Severity:** Medium
- **Frequency:** Occasional

### Problem 4: Composio rollout lacks safety controls

> "We want to be able to get it out to more customers... controls in place that can prevent things going south." — Kaden

- **Persona:** Admins, RevOps
- **Severity:** Medium
- **Frequency:** Ongoing

## Feature Requests

- Tool disable controls for Composio tools (per tool or workspace).
- Human-in-the-loop approvals for risky tool actions.
- Tool selection improvements to prefer internal search when appropriate.
- Wider customer rollout once safety controls exist.

## Strategic Alignment

- Strong alignment with **Trust Foundation** (human approvals, safer automation).
- Strong alignment with **Quality over Velocity** (reducing deploy risk).
- Supports **AI-first UX** by stabilizing tool behavior and search.

## Problems Status Tracking

### problems_open

- Draft email actions can send without review.
- Tool selection prefers Composio search over internal search.
- Deploy errors still present for some workflows.
- Composio rollout safety controls incomplete.

### problems_resolved

- None noted.

### problems_workaround

- None noted.

### problems_tracked

- None noted (no Linear IDs mentioned).

## Hypothesis Candidates

1. Adding human-in-the-loop controls for tools will reduce trust incidents and enable broader adoption.
2. Prioritizing internal search over Composio search will improve relevance and user trust.
3. pnpm + NX caching will materially reduce CI iteration time and increase engineering velocity.

## Notes

Key quotes:

- "Cloud SQL's managed connection pooling... helped a little bit with latency... and it's also a thing that we can tweak and tune very easily without needing to do deploys."
- "We got our own fork of Firebase tools so that we have more ownership and control over the CLI."
