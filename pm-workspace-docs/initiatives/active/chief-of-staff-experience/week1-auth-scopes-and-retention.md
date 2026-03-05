# Product Definition: Auth Scopes & Data Retention Policy

**Week**: 1 (Feb 26 – Mar 4)
**Owner**: Tyler Sahagun
**Initiative**: Project Babar — Chief of Staff Agent
**Status**: Defined

---

## Purpose

This document defines the exact OAuth permissions AskElephant needs from Slack and Gmail, and the data retention rules that govern how long ingested data is stored. These definitions must be locked before engineering begins the OAuth implementation.

---

## Gmail OAuth Scopes

| Scope | Permission | Justification |
|---|---|---|
| `gmail.readonly` | Read all email threads and message metadata | Required to identify commitments, surface urgent emails, and feed the Meeting Impact Report |
| `gmail.compose` | Create new draft emails | Required for the Agent to auto-draft contextual follow-ups on the user's behalf |
| `gmail.send` | Send email from the user's account | Required for one-tap "Send drafted reply" from the Agent feed — must be explicitly user-approved per message |
| `gmail.labels` | Read and write labels | Required for the Agent to mark emails it has processed |

**Explicitly NOT Requested:**
- `gmail.modify` (delete/archive) — not needed for v1; avoid over-permissioning
- `gmail.settings` — not needed

---

## Slack OAuth Scopes

| Scope | Permission | Justification |
|---|---|---|
| `channels:history` | Read messages from public channels the user has joined | Required for ingesting cross-channel context linked to deals/contacts |
| `im:history` | Read direct messages | Required for extracting commitments made in 1:1 DMs (e.g., "I'll send the contract") |
| `channels:read` | View basic channel info | Required for routing messages to the correct project/account |
| `users:read` | View user profile data | Required for attributing commitments to the correct person |
| `chat:write` | Post messages as the user | Required for one-tap "Send drafted Slack reply" from the Agent feed — must be explicitly user-approved per message |

**Explicitly NOT Requested:**
- `files:read` — deferred to Phase 2; file attachments not part of v1 ingestion
- `admin.*` scopes — single-player only; no admin access needed

---

## Calendar OAuth Scopes (Google Calendar)

| Scope | Permission | Justification |
|---|---|---|
| `calendar.readonly` | Read calendar events | Required for Proximity Triggers (15 min before meeting) and linking meetings to accounts |

---

## Data Retention Policy

### Ingested Messages
- **Retention period**: 90 days of rolling window
- **Rationale**: Provides sufficient context for the "Continuous Story" without creating unnecessary data liability
- **Deletion**: Messages older than 90 days are purged from the `AgentEvents` table on a nightly cron

### Meeting Transcripts
- **Retention period**: 12 months (aligned to existing AskElephant policy)
- **No change required** to existing pipeline

### Generated Artifacts (Impact Reports, Drafted Replies)
- **Retention period**: Indefinite (stored as user-owned content)
- **User deletion**: Available via account settings (Phase 2)

### Action Items / Tasks
- **Retention period**: Indefinite until dismissed/completed by user
- **Completed tasks**: Archived after 30 days, not deleted (audit trail)

---

## Privacy & Consent Requirements

1. **Explicit consent screen**: Before any Slack or Gmail ingestion begins, users must see a screen explaining exactly what is being read and why.
2. **Scope justification copy**: Every scope must have user-facing justification shown at the time of OAuth consent.
3. **No cross-user data sharing**: A user's ingested Slack/Gmail is never visible to teammates in v1.
4. **No training on user data**: Ingested messages are not used to fine-tune models.

---

## What Needs to Be True Before Engineering Can Proceed

- [ ] Tyler confirms final scope list with Legal/Privacy review
- [ ] Skylar designs the consent/explanation screen (Week 1 Design todo)
- [ ] Palmer implements only the scopes listed in this document — no additions without product sign-off

---

_Last updated: 2026-02-26_
_Owner: Tyler_
