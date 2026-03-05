# Product Definition: Urgent Communications Definition

**Week**: 5 (Mar 26 – Apr 1)
**Owner**: Tyler Sahagun
**Initiative**: Project Babar — Chief of Staff Agent
**Purpose**: Define precisely what constitutes an "Urgent Communication" for the event-based trigger system. This is the rulebook for the LLM urgency classifier that fires on every new `agent_event`.

---

## Core Principle

The Agent should only interrupt a rep's flow for communications where waiting a full day to respond could meaningfully harm a deal, relationship, or commitment. All other communications are batched into the daily brief.

---

## Urgency Classification Definitions

### HIGH (Real-Time Interrupt — P1 Feed Item)

A communication is `high` urgency if it meets ANY of the following conditions:

**Explicit ask with time pressure:**
- Sender asks a direct question that requires a timely answer to continue the deal (e.g., "Can you send the pricing doc today?")
- Sender sets a deadline in the message (e.g., "I need this by 5pm Friday")
- Sender indicates they are evaluating alternatives (e.g., "We're also looking at Competitor X")

**Deal-critical signals:**
- Sender is a known Champion or Decision Maker on an active deal > $25K
- Message contains words/phrases: "contract", "purchase order", "legal team", "sign", "closing", "budget approved", "ready to move forward"
- Message arrives within 24 hours of a scheduled meeting as a prep request

**At-risk signals:**
- Known contact has previously been very responsive (average response time < 2 hours) and is now asking something after a multi-day silence (signals re-engagement on a cold deal)
- Sender is escalating ("I need to loop in my VP about this")

**Auto-draft required**: All `high` urgency events trigger an auto-drafted reply.

---

### MEDIUM (Daily Brief — P3 Feed Item)

A communication is `medium` urgency if it meets ANY of the following conditions and is NOT high urgency:

- Known contact asks a question without explicit time pressure
- Known contact sends a follow-up to a prior exchange without a specific ask
- Internal teammate sends an action request related to an external deal
- Positive signal from a known contact (e.g., "We're interested, what's next?") with no explicit deadline
- First email/Slack received from a new potential contact who found the rep

**No auto-draft** for medium urgency items. The Agent surfaces the message with an option for the user to request a draft.

---

### LOW (No Feed Item — Skip)

A communication is `low` urgency and does NOT enter the Agent feed if:

- Social/relational messages with no ask (e.g., "Thanks!", "Great call!")
- Mass emails or newsletters (detected by BCC list size > 5 or unsubscribe links)
- Status updates from tools/integrations (e.g., HubSpot workflow notifications, calendar invites)
- Internal messages from teammates with no deal context
- Out-of-office auto-replies
- Any message from a sender not in the user's contacts list

---

## VIP Contact Rules

A "VIP Contact" is defined as any contact meeting at least 2 of the following criteria:

1. Deal value associated with their company > $50K
2. They have a title containing: CEO, CRO, CFO, VP, Director, President
3. They are marked as "Champion" or "Decision Maker" in CRM
4. They have responded to the rep within 24 hours in at least 3 of their last 5 exchanges

**Rule**: Any communication from a VIP Contact is automatically elevated to `high` urgency if it contains ANY question or request, regardless of explicit time pressure.

---

## LLM Classifier Prompt Reference

The following prompt is what the `TriggerEngine` sends per `agent_event` to classify urgency:

```
System: You are a triage agent for a sales rep. Classify the urgency of this incoming message.

Contact context:
- Name: {contact_name}
- Company: {company_name}
- Active deal value: {deal_value | "unknown"}
- Is VIP contact: {is_vip}

Return ONLY one of: "high" | "medium" | "low"

Rules:
- Return "high" if: contains a direct question or request AND sender is on an active deal, OR contains deal-closing language (contract, PO, signing, budget approved), OR sender is VIP with any request
- Return "medium" if: known contact with question but no explicit time pressure or deal-closing language
- Return "low" if: social/relational only, no ask, or unknown sender

Message: {content}
```

---

## Edge Cases

| Scenario | Classification | Notes |
|---|---|---|
| Prospect asks about pricing for the first time | HIGH | Price questions directly precede purchase intent |
| Existing customer asking about a bug in production | HIGH | Churn risk; route to Customer Success queue |
| Automated LinkedIn outreach | LOW | Not a known CRM contact |
| Internal Slack from AE asking for help with a deck | MEDIUM | Deal-related but no external urgency |
| Contact cancels a meeting via email | HIGH | Deal risk signal — triggers DETRACTED flag |
| Prospect forward-introduces the rep to a colleague | HIGH | New stakeholder entering deal = advancement signal |

---

_Last updated: 2026-02-26_
_Owner: Tyler_
