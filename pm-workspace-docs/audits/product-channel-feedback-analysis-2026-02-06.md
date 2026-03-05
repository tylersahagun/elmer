# Product Channel Feedback Analysis

**Date:** February 6, 2026
**Channels Analyzed:** #product-requests, #product-forum
**Data Source:** ~100 most recent messages from each channel
**Cross-referenced with:** Linear issues, Slack discussions

---

## Executive Summary

| Metric | #product-requests | #product-forum |
|--------|------------------|----------------|
| **Distinct requests identified** | 18 | N/A (mixed content) |
| **Tickets created in Linear** | 6 (33%) | 2 |
| **Implemented / Done** | 1 (6%) | 1 |
| **In Progress / Todo** | 2 (11%) | 0 |
| **Backlog / Triage** | 3 (17%) | 1 |
| **No ticket created** | 12 (67%) | N/A |

**Key Finding:** Two-thirds of product requests posted to #product-requests have no Linear ticket and no formal tracking. The feedback loop from Slack to engineering is broken for most customer-sourced requests.

---

## #product-requests — Detailed Analysis

### How many have been implemented?

**1 out of 18 distinct requests (6%) is confirmed implemented.**

### Request Tracking Matrix

| # | Request | Source | Linear Ticket | Status | Assignee |
|---|---------|--------|---------------|--------|----------|
| 1 | Add seat/license column to team page | Tyler/Matt Bennett | [ASK-5017](https://linear.app/askelephant/issue/ASK-5017) | Todo | Jason Harmon |
| 2 | Cancel workflow mid-execution | John @ ObservePoint (via Erika) | [ASK-4982](https://linear.app/askelephant/issue/ASK-4982) | Triage | Unassigned |
| 3 | Calendar connect redirect bug | Customer (via Erika) | [ASK-4970](https://linear.app/askelephant/issue/ASK-4970) | Backlog | Jason Harmon |
| 4 | Meeting summary in automated email | Linear ticket referenced | ASK-4570 / EPD-1342 | Accepted | Unknown |
| 5 | Tools on by default in chat | Timothy @ Design Ergonomics | ASK-4540 | Unknown | Unknown |
| 6 | Mobile app global chat | Jasmin (REDO customer) | [ASK-4626](https://linear.app/askelephant/issue/ASK-4626) | **Done** ✅ | Eduardo Gueiros |
| 7 | Share link internal vs external | Phil @ Blend B2B | ❌ None | Not tracked | — |
| 8 | Slack coaching from AskElephant | Erika (Paramify request) | ❌ None | Discussed only | — |
| 9 | Live coaching on calls | Woody's client (Sherpa competitor) | ❌ None | Discussed, Eli building related | — |
| 10 | Stop workflow builder mid-build | Tyler | ❌ None | Just posted | — |
| 11 | Email from own address in workflows | Mike | ❌ None | "Needs new agent primitive" (Kaden) | — |
| 12 | Gamma integration | Mike | ❌ None | Requested only | — |
| 13 | Confusing "transcript not available" wording | Brandon/Laura @ Pearagon | ❌ None | Feedback posted | — |
| 14 | Prompt library with living objects | Timothy @ Design Ergonomics | ❌ None | Concept posted | — |
| 15 | Admin override recording settings (2-party consent) | Ben | ❌ None | Policy discussion | — |
| 16 | Calendar event popup/filter | Tyler | ❌ None | Loom shared | — |
| 17 | Auto-recording without desktop app (Granola comparison) | Customer via Michael Cook | ❌ None | Just posted | — |
| 18 | BAA agreement (HIPAA) | Team Recovery | ❌ None | Ben/Andrew handling | — |

### Status Breakdown

```
Implemented (Done):     ███░░░░░░░░░░░░░░░░░  1  (6%)
In Progress / Todo:     ████░░░░░░░░░░░░░░░░  2  (11%)
Backlog / Triage:       ██████░░░░░░░░░░░░░░  3  (17%)
No Ticket Created:      ████████████████████  12 (67%)
```

### Requests by Customer Origin

| Customer | Request | Status |
|----------|---------|--------|
| Blend B2B (Phil) | Share link handling | ❌ No ticket |
| ObservePoint (John) | Cancel workflow | Triage |
| Design Ergonomics (Timothy) | Tools default on + Prompt library | Backlog / No ticket |
| Paramify (via Erika) | Slack coaching | ❌ No ticket |
| REDO (via Jasmin) | Mobile chat | ✅ Done |
| Pearagon (Brandon/Laura) | Transcript wording | ❌ No ticket |
| Team Recovery | BAA/HIPAA | ❌ No ticket (legal) |
| Woody's client | Live coaching | ❌ No ticket |
| Michael Cook's customer | Auto-recording | ❌ No ticket |

### Competitive Intelligence from Requests

- **Sherpa** mentioned as competitor for live coaching (Woody's client looking at them)
- **Granola** mentioned as comparison for lightweight recording without desktop app
- **Otter** mentioned in #product-forum as comparison for meeting summaries

---

## #product-forum — Content Type Analysis

#product-forum serves a fundamentally different purpose than #product-requests. It's a mixed-use channel for internal product discussion, bug reports, and coordination.

### Content Categories

| Category | Count | % of Messages | Examples |
|----------|-------|---------------|----------|
| **Bug Reports / Issues** | ~15 | 15% | Real-time updates error, triple bot, workflow alignment |
| **Product Discussions** | ~25 | 25% | Beta rollout strategy, feature flags, Composio integration |
| **Process / Meta** | ~20 | 20% | How to track requests, Notion page deprecation, WoW visibility |
| **Integration Requests** | ~10 | 10% | ClickUp, HubSpot updates, Composio capabilities |
| **Customer Escalations** | ~10 | 10% | Veronika/Chili Publish requests via Notion |
| **Internal Coordination** | ~15 | 15% | Nav alpha, feature flag deployment, team alignment |
| **Wins / Celebrations** | ~5 | 5% | Composio shoutout, integration excitement |

### Notable Bug Reports Tracked

| Bug | Linear Ticket | Status |
|-----|--------------|--------|
| Real-time updates unavailable error banner | [ASK-5016](https://linear.app/askelephant/issue/ASK-5016) | Backlog (Matt Noxon) |
| Workflow actions text alignment | None (Adam fixing directly) | Fixed |
| Triple bot in meetings | None (Dylan investigating) | Investigating |

### Key Discussions / Themes

1. **Rollout Process Visibility** — Multiple people asked where to find weekly deployment plans. The "WoW" (What's on Wednesday) is buried and not everyone knows the cadence.

2. **Notion Product Requests Page (Deprecated)** — Veronika had been tracking requests in Notion for clients (Chili Publish). This was discussed as being deprecated in favor of something else, but the replacement is unclear.

3. **Integration Excitement** — Strong positive signal around Composio adoption and structured HubSpot Agent. Team members actively exploring capabilities.

4. **Beta Feature Visibility** — Questions about how beta features are rolled out and who can see what. Need clearer internal communication about feature flag states.

5. **ClickUp Integration** — Erika asking about ClickUp integration status, showing customer demand.

---

## Process Gaps Identified

### 1. No Systematic Triage from #product-requests → Linear
- **Problem:** 67% of requests have no ticket created
- **Impact:** Customer feedback disappears into Slack; no visibility into what was requested or its status
- **Recommendation:** Weekly triage of #product-requests → create Linear tickets or explicitly decline with reasoning

### 2. No Closed-Loop Communication Back to Requestors
- **Problem:** When a request IS implemented (e.g., mobile chat), there's no evidence the requesting CSM or customer was notified
- **Impact:** CSMs can't tell customers "this was built for you"; missed expansion/retention opportunity
- **Recommendation:** Tag original requestor when shipping related work

### 3. Channel Purpose Confusion
- **Problem:** #product-forum mixes bugs, feature discussions, process questions, and customer escalations
- **Impact:** Signal-to-noise ratio is low; important requests get buried
- **Recommendation:** Clarify channel purposes — #product-requests for trackable requests, #product-forum for discussions, #product-issues for bugs

### 4. Customer Request Attribution is Inconsistent
- **Problem:** Some requests clearly cite the customer ("John at ObservePoint"), others are vague ("a customer asked")
- **Impact:** Can't prioritize by revenue impact or strategic fit
- **Recommendation:** Require customer name + company when posting requests

### 5. Competitive Intelligence Not Captured
- **Problem:** Mentions of Sherpa, Granola, Otter appear in requests but aren't systematically tracked
- **Impact:** Missed competitive positioning insights
- **Recommendation:** Tag competitive mentions, route to PM for tracking

---

## Recommendations

### Quick Wins (This Week)

1. **Create missing Linear tickets** for the 12 untracked requests from #product-requests
2. **Pin a request template** in #product-requests requiring: Customer name, Company, Description, Priority
3. **Notify REDO** that mobile chat (their request) is now live

### Medium-Term (This Month)

4. **Weekly #product-requests triage** — PM reviews new requests every Monday, creates tickets or responds with reasoning
5. **Close the loop** — When shipping work related to a request, reply in the thread tagging the original poster
6. **Channel audit** — Clarify purpose of #product-forum vs #product-requests vs #product-issues

### Longer-Term (This Quarter)

7. **Automated signal ingestion** — Use `/ingest slack #product-requests` weekly to capture and categorize
8. **Request dashboard** — Track request → ticket → shipped pipeline metrics
9. **Customer feedback NPS** — Are CSMs satisfied with how their requests are handled?

---

## Appendix: Linear Tickets Referenced in Both Channels

| Ticket | Title | Status | Assignee | Channel |
|--------|-------|--------|----------|---------|
| ASK-5017 | Seat/license column on team page | Todo | Jason Harmon | #product-requests |
| ASK-4982 | Cancel workflow mid-execution | Triage | Unassigned | #product-requests |
| ASK-4970 | Calendar connect redirect bug | Backlog | Jason Harmon | #product-requests |
| ASK-5016 | Real-time updates error banner | Backlog | Matt Noxon | #product-forum |
| ASK-4626 | Global chat in mobile | **Done** | Eduardo Gueiros | #product-requests |
| ASK-4540 | Tools on by default (refactor) | Unknown | Unknown | #product-requests |
| ASK-4570 | Meeting summary in automated email | Accepted | Unknown | #product-requests |
