# Transcript: Meeting Page View Brainstorm

**Date:** 2026-01-30  
**Source:** Meeting transcript  
**Participants:** Sam Ho, Adam Shumway, Skylar Sanford

## TL;DR

The team aligned on an end-state "chief of staff" experience that starts with a clean, default meeting summary and builds upward into daily and weekly review views. Action items and meeting intelligence need to be accurate, prioritized, and presented as artifacts (not chat threads). The current meeting page is cluttered and workflow-driven; the proposal is to simplify UI, remove workflow chips, and shift to artifact modules with global chat that changes context (meeting, company, deal).

## Key Decisions

- Sequence delivery from meeting summary -> meeting prep -> meeting intelligence/action items -> daily and weekly review.
- Treat workflow outputs as artifacts, not chat threads; the meeting view should show artifact modules.
- Default experience should be plug-and-play (no configuration required).
- Use a three-bucket task model: automated, approval-needed, decision-needed.
- Plan for ALHF (agentic learning with human feedback) via thumbs up/down and lightweight feedback collection.

## Action Items

- [ ] Review meeting prep workflow as a POC for artifact output in the meeting view.
- [ ] Assess whether workflow chips below chat can be removed as a near-term simplification.
- [ ] Locate any existing designs/POCs for deal-context views and share for review.
- [ ] Investigate feasibility of surfacing legacy action items for UX evaluation.

## Problems Identified

### Problem 1: Action items were inaccurate and overwhelming

> "They were very inaccurate. And often, there was just way too many of them, and no one was using them, so we got rid of them." — Adam

- **Persona:** Sales reps, leaders
- **Severity:** High
- **Frequency:** Common

### Problem 2: Action items lacked ownership and permanence

> "There was no sense of, like, permanence. So they might live just on a meeting page. And then if somebody else gets the exact same to dos that you do and they mark it off, but it was for you, it disappears." — Adam

- **Persona:** Sales reps
- **Severity:** High
- **Frequency:** Common

### Problem 3: Meeting page is cluttered and confusing

> "I go to this meeting... it's just a lot of things I could click here. There's a lot of options for me. Cannot have that." — Sam

- **Persona:** New users, sales reps
- **Severity:** High
- **Frequency:** Common

### Problem 4: Workflows output chats instead of useful artifacts

> "These workflows don't generate a chat. They generate artifacts." — Sam

- **Persona:** All personas
- **Severity:** Medium
- **Frequency:** Common

### Problem 5: Prioritization is missing across action items

> "There's, like, 50 things you could be doing... cutting through all the noise and just, like, really helping me surface those top things is really big." — Sam

- **Persona:** Sales reps, leaders
- **Severity:** Medium
- **Frequency:** Common

## Feature Requests

- Default meeting summary as the primary meeting view (no configuration).
- Meeting prep module that pulls deal context and previous meetings.
- Action items with prioritization and review workflow.
- Three-bucket daily review: automated, approval-needed, decision-needed.
- Global chat that reuses context (meeting vs company vs deal).
- Artifact editing for summaries and outputs (shareable, editable docs).
- ALHF feedback loop: thumbs up/down with quick voice feedback.
- Feedback log and traceability for agent learning.
- Weekly coaching rollup instead of per-meeting coaching noise.
- Deal-centric views that show meetings and communications in context.

## Strategic Alignment

- Strong alignment with chief-of-staff vision and AI-first UX.
- Supports trust-building via human-in-the-loop approvals and feedback.
- Requires clear prioritization logic to avoid cognitive overload.

## Problems Status Tracking

### problems_open

- Action items inaccurate and too many.
- Action items lack ownership and permanence.
- Meeting page clutter and workflow confusion.
- Workflow outputs as chat instead of artifacts.
- Prioritization missing for follow-ups.

### problems_resolved

- None noted.

### problems_workaround

- None noted.

### problems_tracked

- None noted (no Linear IDs mentioned).

## Hypothesis Candidates

1. Default meeting summaries with artifact output improve activation and retention.
2. Converting workflow chats to artifacts reduces cognitive load and increases trust.
3. Prioritized three-bucket task review increases follow-up completion rates.

## Notes

Key quotes:

- "We should loop around on action items and make them better and make them part of the my day... but we just haven't gotten around to it."
- "If we don't have the granularity at the bottom level, then, like, we can't really build the aggregations at the next levels."
- "Immediately, you've already lost people." (on configuration)
