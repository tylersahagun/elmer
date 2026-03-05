# Design Spec: Zero-State OAuth Connection Flow

**Week**: 1 (Feb 26 – Mar 4)
**Owner**: Skylar Sanford
**Initiative**: Project Babar — Chief of Staff Agent
**Status**: Defined

---

## Purpose

This document specifies the design requirements for the onboarding flow that connects a new user's Slack, Gmail, and Google Calendar accounts to the Chief of Staff Agent. The design must create trust, communicate value clearly, and minimize drop-off at each permission step.

---

## Zero-State: The Empty Chief of Staff

When a user first reaches the Chief of Staff route (`/chief-of-staff`) with no integrations connected, they see an intentionally welcoming state — not a blank dashboard.

### Zero-State Screen Requirements

**Header (Agent Voice):**
> "Hi, I'm your Chief of Staff. Connect your tools and I'll start keeping track of what matters across your day."

**Visual Design:**
- A single centered card (max width 560px) with the Agent avatar/icon
- Warm, calm tone — not urgent or alarming
- Three integration tiles below the intro copy, each showing:
  - Integration icon (Gmail / Slack / Google Calendar)
  - One-line value proposition (see copy below)
  - "Connect" button (primary action)
- Footer: "You can connect these one at a time. I'll start working immediately with whatever you give me."

**Copy Per Integration Tile:**

| Integration | Value Copy |
|---|---|
| Gmail | "I'll surface urgent emails and draft replies based on your relationships." |
| Slack | "I'll catch commitments you make in messages and flag what needs a response." |
| Google Calendar | "I'll prep you before every meeting and remind you of what's next." |

---

## OAuth Consent Screen (Pre-Permission Modal)

**Triggered**: When user clicks "Connect" on any integration tile.

This is NOT the system OAuth screen. This is AskElephant's own explanatory layer that appears *before* the OS-level OAuth dialog.

### Modal Requirements

- **Title**: "Before we connect [Gmail / Slack / Calendar]"
- **Body**: Bullet list of what AskElephant will and will not do:
  - Will: [specific actions from auth scopes doc]
  - Will NOT: Share your data with teammates, use messages for AI training, delete anything
- **CTA**: "Continue to [Gmail / Slack / Calendar]" → triggers actual OAuth
- **Secondary**: "Not now" → dismisses modal, tile remains unconnected

**Design Rule**: This screen must be skimmable in under 10 seconds. No legal walls.

---

## Post-Connection State

After a user connects at least one integration:

- The zero-state card disappears
- The Agent feed begins rendering within 60 seconds (async ingestion starts immediately)
- A contextual toast appears:
  > "Connected. I'm pulling in the last 90 days now. I'll have your first briefing ready shortly."
- If the Agent feed has at least 3 items, it renders immediately without a loading skeleton

---

## States & Edge Cases

| State | Design Response |
|---|---|
| User connects Gmail but not Slack | Feed renders with Gmail-only context. Agent copy acknowledges partial connection: "Connect Slack to see full picture." |
| OAuth fails / user rejects permission | Error state with specific copy: "Couldn't connect [Gmail]. You may have declined a required permission. Try again or contact support." |
| User revokes access externally | Feed shows degraded state indicator: "Gmail disconnected. Reconnect to restore full briefings." |
| All three integrations connected | No special fanfare — Agent simply starts working. Avoid over-celebrating "setup complete." |

---

## Acceptance Criteria for Design Handoff

- [ ] Zero-state screen designed and approved by Tyler
- [ ] OAuth consent modal copy reviewed and approved by Tyler (Legal check required)
- [ ] All three integration tiles designed (connected + disconnected states)
- [ ] Post-connection toast and feed transition designed
- [ ] Error/degraded states designed
- [ ] Mobile-responsive layout (web only, no native app)
- [ ] Figma handoff annotations complete for Palmer

---

_Last updated: 2026-02-26_
_Owner: Skylar_
