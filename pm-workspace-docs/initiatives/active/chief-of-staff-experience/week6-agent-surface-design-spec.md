# Design Spec: Chief of Staff Agent Surface — `/chief-of-staff`

**Week**: 6 (Apr 2 – Apr 8)
**Owner**: Skylar Sanford + Tyler Sahagun
**Initiative**: Project Babar — Chief of Staff Agent
**Status**: Defined

---

## Purpose

This document specifies the complete design requirements for the primary Agent surface: the `/chief-of-staff` route. This is the default landing page for all users after login. It replaces the legacy home dashboard.

---

## Design Principles for This Surface

1. **The Agent speaks first.** Every session starts with the Agent reporting in — not the user looking for something.
2. **Evidence, not assertions.** Every Agent statement includes the signal that drove it. No "You should do X" without "because Y happened."
3. **Maximum 3 actions per card.** Never overwhelm with options. Primary, secondary, dismiss — that's it.
4. **The background work is visible but not loud.** The "Active Agents" module shows what's running, but it should feel like a status bar — not a feature showcase.

---

## Agent Tone & Voice Guidelines

The Chief of Staff speaks in first person, is direct, and respects the user's intelligence. It does NOT:
- Use filler phrases ("Great job!", "Amazing!", "Looking good!")
- Add unnecessary hedges ("I think...", "It seems like...", "You might want to consider...")
- Repeat obvious context the user already knows
- Apologize for surfacing urgent items

**Greeting Copy Formulas:**

| Time of Day | Template |
|---|---|
| 7–11 AM | "Good morning, [First Name]." |
| 11 AM–1 PM | "Good afternoon, [First Name]." |
| 1–6 PM | "[First Name]." (no greeting — they've been working) |
| After 6 PM | "Still going, [First Name]?" |

**Subtitle Copy Formula:** "You have [N] focus actions and [M] meetings [today / this week]."

If no feed items: "You're clear right now. I'll flag anything urgent as it comes in."

---

## Feed Card Components

### Anatomy of a Feed Card

```
[Priority Badge] [Contact Avatar + Name · Company · Deal Value]

[Title — 1 sentence, direct]
[Evidence — 1 sentence, cites the signal]

[Primary CTA Button] [Secondary CTA: Remind me later]
```

### Priority Badge Labels

| Urgency | Badge Label | Badge Color Signal |
|---|---|---|
| P1 / high | "At Risk" or "Urgent" | Red |
| P2 / medium | "Overdue" or "Due Today" | Yellow/Orange |
| P3 / low | (no badge) | — |

### Card Type Variants

**Action Item Card:**
- Title: What needs to be done (1 sentence, action-oriented)
- Evidence: Why it matters + where it came from (Slack/Email/Meeting source quote)
- CTA: "Review" → opens action item detail + context history
- Secondary: "Remind me later" (snoozes 3 hours)

**Urgent Comm Card:**
- Title: Summary of the message (not the raw message)
- Evidence: The exact relevant quote from the Slack/Email
- CTA: "Send Reply" → opens a sheet with the auto-drafted reply for approval/edit
- Secondary: "Remind me later"

**Meeting Prep Card:**
- Title: "Meeting with [Contact] in 15 minutes"
- Evidence: Last key signal from that contact ("They last messaged 3 days ago asking about pricing")
- CTA: "View Brief" → opens the Impact Report for the most recent meeting with that contact, or a pre-meeting context summary if first time
- Secondary: "Dismiss"

**Impact Report Ready Card:**
- Title: "[Meeting Name] — [ADVANCED / NEUTRAL / DETRACTED]"
- Evidence: The `trajectory_evidence` sentence from the report
- CTA: "Read Report" → opens full Impact Report
- Secondary: "Remind me later"

---

## Active Agents Module

This module is a persistent footer section (or a sidebar panel on wide viewports). It is informational only — no primary actions.

### Required Stats

| Agent | Stat Label | Data Source |
|---|---|---|
| Email Agent | "[N] drafts this week" | Count of `agent_feed_items` with type `urgent_comm` and `draft_approved` or `draft_edited` in last 7 days |
| Churn Agent | "[N] deals analyzed" | Count of `impact_reports` generated in last 7 days |
| CRM Agent | "[N] objects updated" | Count of action items completed with CRM-related actions in last 7 days |
| Chief of Staff | "Active" (always) | Status indicator only |

**Design rule**: The stats must be real numbers from the database. No placeholder zeros. If a stat is 0, show "None this week" — never show 0 as a success metric.

---

## "Send Reply" Sheet (Drafted Reply Approval)

When a user taps "Send Reply" on an Urgent Comm card, a bottom sheet (or slide-in panel) opens:

**Sheet Contents:**
- Header: "Reply to [Contact Name] via [Gmail / Slack]"
- Full drafted reply in an editable text area
- Sending context: Thread subject or Slack channel
- CTA: "Send" (primary) + "Discard" (secondary)
- Micro-copy below: "Sent replies are logged in your activity history."

**Interaction rules:**
- User can freely edit the draft before sending
- Sending fires `POST /api/v1/agent/feed-items/:id/action` with `{ action: 'send_reply', body: '<edited_or_approved_text>' }`
- After send: sheet closes, card collapses with a "Sent" confirmation state, then fades from feed after 3 seconds

---

## Empty & Degraded States

| Scenario | State Copy |
|---|---|
| No feed items at all | "You're clear right now. I'll flag anything urgent as it comes in." |
| No integrations connected | Zero-state onboarding card (see `week1-oauth-flow-design-spec.md`) |
| Gmail disconnected | Warning banner above feed: "Gmail disconnected — some items may be missing. [Reconnect]" |
| Feed loading (fresh page) | Show skeleton cards for the first 3 items; resolve within 1.5s |

---

## Acceptance Criteria for Design Handoff

- [ ] All feed card variants designed (Action Item, Urgent Comm, Meeting Prep, Impact Report)
- [ ] Active Agents module designed (desktop sidebar + mobile footer)
- [ ] Send Reply sheet designed
- [ ] All empty/degraded states designed
- [ ] Priority badge design system tokens defined
- [ ] Figma handoff annotations complete for Palmer
- [ ] Tyler final approval on agent tone/copy

---

_Last updated: 2026-02-26_
_Owner: Skylar Sanford_
