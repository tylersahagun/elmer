# Product Definition: Trigger Priority Matrix

**Week**: 4 (Mar 19 – Mar 25)
**Owner**: Tyler Sahagun
**Initiative**: Project Babar — Chief of Staff Agent
**Purpose**: Define exactly what justifies surfacing something to a user's Agent feed, at what priority level, and via which trigger type. This matrix is the rulebook for the `TriggerEngine`.

---

## Core Principle

Every item that enters the Agent feed must pass a single test:
> "If the rep does not see this within the next [X hours], will it meaningfully hurt a deal, relationship, or commitment?"

If the answer is no, it does not generate an interrupt. It may appear in the periodic daily brief instead.

---

## Priority Levels

| Level | Label | Max Latency to Surface | Interrupt User? | Example |
|---|---|---|---|---|
| P1 | Critical | < 60 seconds | Yes (badge/notification) | VIP contact asks for contract; deal at risk signal |
| P2 | High | < 2 hours | Yes (badge) | Overdue action item; meeting in 15 min |
| P3 | Medium | Next morning daily brief | No | New Impact Report ready; follow-up due today |
| P4 | Low | Weekly rollup only | No | General status update; no action required |

---

## Trigger Decision Tree

```
New signal received (email, Slack, calendar event, meeting end)
        │
        ├─► Is sender/contact a KNOWN contact in the user's CRM?
        │         No → P4 (skip to weekly rollup)
        │         Yes → continue
        │
        ├─► Does the signal contain a question, request, or commitment?
        │         No → P4 (unless scheduled meeting approaching)
        │         Yes → continue
        │
        ├─► Is this related to an active deal (deal stage < Closed)?
        │         Yes + high deal value (> $50K) → P1
        │         Yes + any deal → P2
        │         No deal, but active relationship → P3
        │
        └─► Calendar proximity check (runs independently)
                  Meeting in < 20 min → P1 (meeting prep)
                  Meeting in < 2 hours → P2 (meeting prep)
```

---

## Priority Matrix by Signal Type

### Gmail Signals

| Signal | Condition | Priority |
|---|---|---|
| Inbound email | From a known contact on an active deal | P1 if contains question/request; P3 otherwise |
| Inbound email | From unknown/external sender | P4 |
| No response to sent email | > 72 hours on an active deal | P2 |
| No response to sent email | > 5 days on any contact | P3 |
| Email marked with urgency ("URGENT", "time-sensitive") | From known contact | P1 |
| Contract or proposal attached by the other party | Active deal | P1 |

### Slack Signals

| Signal | Condition | Priority |
|---|---|---|
| Direct message | From a known contact on an active deal | P1 if question/request; P2 otherwise |
| Direct message | From internal teammate | P3 if action request; P4 otherwise |
| Message in a shared external channel | Known contact, contains request | P1 |
| Unanswered DM | > 4 hours during business hours | P2 |

### Calendar / Meeting Signals

| Signal | Condition | Priority |
|---|---|---|
| Meeting starting in < 15 minutes | Any external meeting | P1 (meeting prep brief) |
| Meeting ending (completed) | Any recorded meeting | P3 (Impact Report ready) |
| Meeting cancelled by the other party | Active deal | P2 (flag potential deal risk) |
| Meeting scheduled by the other party | Active deal | P3 (add to daily brief) |

### Action Item Signals

| Signal | Condition | Priority |
|---|---|---|
| Action item due today | Agent-generated task | P2 |
| Action item overdue by > 1 day | Agent-generated task | P1 |
| Action item created from meeting | Any new extraction | P3 (next daily brief) |

---

## Daily Brief Composition Rules

The daily brief (P3 batch, delivered at 7 AM) is composed using the following priority order:

1. All P1 items not yet actioned (carry-forwards from the day before)
2. All P2 items not yet actioned
3. Today's meetings (in chronological order)
4. New Impact Reports from meetings in the last 24 hours
5. Action items due today
6. Action items overdue (sorted by age, oldest first)

**Cap**: Maximum 15 items per daily brief. If > 15, the lowest-priority items roll to the next day.

---

## What Does NOT Trigger a Feed Item

To prevent alert fatigue, the following are explicitly excluded:

- Emails from mass mailing lists or known newsletter domains
- Slack messages where the user is not directly addressed (`@mentioned` or DM'd)
- Meeting invites to internal-only meetings (no external attendees)
- CRM update notifications from the system itself
- Duplicate signals (same underlying event already surfaced)
- Any signal from a contact not in the user's CRM contacts

---

## Quiet Hours

No P1 or P2 items are surfaced between **8:00 PM and 7:00 AM** user local time. Exception: P1 items from a time zone 8+ hours ahead (e.g., APAC deals for a US-based user) may be queued for 7 AM delivery with a note.

---

_Last updated: 2026-02-26_
_Owner: Tyler_
