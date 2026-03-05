# Chief of Staff Experience - PRD (Project Babar)

## Overview

Chief of Staff Experience (Project Babar) is a proactive, agent-first operating surface for revenue teams. 

Rather than forcing users to navigate to static artifact pages (Meeting Summary, Daily Brief, etc.) or configure complex workflows, the Chief of Staff Agent acts as an intelligent feed. It ingests cross-channel signals (Slack, Gmail, Calendar, Meetings), extracts structured data, and proactively surfaces high-urgency items, auto-drafted replies, and contextual reports directly in a chat/feed interface (`/chief-of-staff`).

## Problem Statement

Today, teams must navigate workflow logic to get recap value, which creates setup friction, fragmented outputs, and poor trust.

- Meeting summary behaves like workflow output instead of an editable artifact.
- Template changes require duplicating or re-routing workflows.
- Daily and weekly readouts are underpowered because they over-index on meeting context and miss cross-signal context.
- Actions are scattered and difficult to execute quickly.

## Target Personas

- [x] Sales Representative
- [x] Sales Leader
- [x] CSM
- [x] RevOps

## Agent-First Interaction Model

The primary interaction surface is shifting entirely from artifact pages to a chat-based Chief of Staff agent feed. This agent learns user preferences, surfaces critical items proactively, and orchestrates sub-agents (e.g., Meeting Prep Agent, Privacy Agent) which produce artifacts contextually. Users configure the agent through teaching via conversation rather than rigid settings.

## Outcome Chain

```
[Chief of Staff Agent] enables [rapid review and approval of proactive drafts, tasks, and impact reports in the feed]
  → so that [cognitive load and administrative time are significantly reduced]
    → so that [users respond to high-urgency items faster and follow up on meetings more consistently]
      → so that [100 Product Qualified Leads (PQLs) are driven by this single-player experience]
```

## Data Feeds (Formerly Sub-initiatives)

The following artifacts are no longer standalone destinations. Instead, they act as **data feeds** that the Chief of Staff Agent synthesizes and surfaces contextually:

| Data Feed       | Primary Source                    | Agent Surfacing Behavior                                     |
| --------------- | --------------------------------- | ------------------------------------------------------------ |
| Meeting Summary | Meeting Transcripts               | Surfaced as "Impact Report Ready" cards post-meeting.        |
| Meeting Prep    | CRM + Calendar + Past Meetings    | Elevated to P1 status 15 mins prior to an upcoming meeting.  |
| Daily Brief     | Cross-signal (Meetings/CRM/Comms) | Batched and surfaced at the start/end of the day (e.g., 7 AM). |
| Weekly Brief    | Historical Rollup                 | Surfaced weekly to track trends and carry-forward commitments. |
| Action Items    | Extracted Commitments             | Surfaced as Task Cards with in-place approve/edit/schedule.  |

## Requirements

### Must Have

- Chief of Staff chat-based agent as the primary operating surface (`/chief-of-staff`).
- Proactive Trigger Engine to surface high-urgency items from Slack, Gmail, and Meetings.
- Contextual feed items (Task Cards, Impact Reports, Urgent Comms, Auto-drafts).
- OAuth integrations for Gmail, Slack, and Google Calendar.
- In-place approval, editing, and execution of actions and drafts.

### Should Have

- Approval-by-exception (risk-tiered auto-run).
- Cross-signal context merging (meetings + CRM + comms).

### Could Have

- Persona-specific feed variants.
- Team-level approval routing.

---

## 10-Week Rollout Plan (Vertical Slices)

This implementation uses a Vertical Slice model. The primary UI is deployed empty in Week 1, and every subsequent week deploys visible functionality to that surface.

| Week | Dates | Focus | Visible Deployment Goal |
|---|---|---|---|
| **Week 1** | Feb 26 – Mar 4 | The Shell & OAuth | Users can navigate to `/chief-of-staff`, see the empty Zero-State UI, and connect their Gmail/Slack/Calendar accounts. |
| **Week 2** | Mar 5 – Mar 11 | Accountability Engine | The empty shell populates with extracted Task Cards. |
| **Week 3** | Mar 12 – Mar 18 | Transcript Migration | The feed shows legacy meeting summaries (TLDRs) alongside tasks as "Impact Report Ready" cards. |
| **Week 4** | Mar 19 – Mar 25 | The Brain Turns On | The feed rearranges itself proactively based on time (Daily Briefs) and proximity (Meeting Prep). |
| **Week 5** | Mar 26 – Apr 1 | Real-Time Urgency | Urgent comms instantly pop into the feed without a refresh. |
| **Week 6** | Apr 2 – Apr 8 | Auto-Drafting | Users can click "Send Reply" to edit and send AI drafts for urgent comms. |
| **Week 7** | Apr 9 – Apr 15 | The True Impact Report | Clicking a meeting opens the new, cross-signal Impact Report, replacing the legacy meeting page. |
| **Week 8** | Apr 16 – Apr 22 | Global Chat & Analytics | Chat sidebar works contextually; PostHog analytics firing. |
| **Week 9** | Apr 23 – Apr 29 | CSM Beta | Live to Beta group; rapid UI fixes deployed. |
| **Week 10** | Apr 30 – May 4 | GA Launch | Feature flags removed. Mass ingestion monitored. |

## Open Questions

- [ ] What is the minimum cross-signal set for v1 daily and weekly briefs in the feed?
- [ ] Which action categories auto-run vs require approval by persona?

---

_Last updated: 2026-02-26_  
_Owner: Tyler_
