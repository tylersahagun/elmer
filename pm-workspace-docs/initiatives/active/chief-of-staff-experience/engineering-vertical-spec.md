# Engineering Spec: Project Babar — Chief of Staff Agent (Vertical Slices)

**Owner**: Palmer Turley
**Product**: Tyler Sahagun
**Timeline**: Feb 26 – May 4, 2026
**Initiative**: Project Babar — Chief of Staff Agent (single-player)

---

## Architecture Overview

The Chief of Staff Agent is an event-driven intelligence layer that sits on top of AskElephant's existing meeting data pipeline. It ingests cross-channel signals (Slack, Gmail, Calendar), extracts structured data (tasks, commitments, relationship signals), synthesizes narratives (Meeting Impact Reports), and proactively surfaces what matters to the user via a trigger engine.

This implementation uses a **Vertical Slice model**. The primary UI (`/chief-of-staff`) is deployed empty in Week 1, and every subsequent week deploys visible functionality to that surface.

```
[Slack] ──┐
[Gmail] ──┼──► IngestionWorker ──► AgentEvents table ──► ExtractionWorker ──► ActionItems / RelationshipSignals
[Calendar]┘                                                                          │
                                                                                     │
                                                                   SynthesisWorker ◄─┘
                                                                         │
                                                                   ImpactReports table
                                                                         │
                                                               TriggerEngine (cron + webhook)
                                                                         │
                                                            ┌────────────┴─────────────┐
                                                      AgentFeed API              PushNotification
                                                            │
                                                    /chief-of-staff UI
```

---

## Week 1: The Shell & OAuth (Feb 26 – Mar 4)

**Visible Deployment Goal:** Users can navigate to `/chief-of-staff`, see the empty Zero-State UI, and connect their Gmail/Slack/Calendar accounts.

### 1.1 The UI Shell

**Frontend (`/chief-of-staff` route):**
- Build the static Zero-State UI based on Skylar's North Star Prototype.
- Build the "Active Agents" footer/sidebar (hardcode stats to 0 for now).
- Build the OAuth connection buttons (`[Connect Gmail]`, `[Connect Slack]`, `[Connect Calendar]`).

### 1.2 OAuth Implementation

**Task**: Implement OAuth 2.0 flows for Gmail, Slack, and Google Calendar.

**Database Schema — `user_integrations`:**
```sql
CREATE TABLE user_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  provider TEXT NOT NULL, -- 'gmail' | 'slack' | 'google_calendar'
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expiry TIMESTAMPTZ,
  external_user_id TEXT, -- Slack user ID or Gmail address
  workspace_id TEXT, -- Slack team ID
  scopes TEXT[], -- actual scopes granted
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  disconnected_at TIMESTAMPTZ,
  UNIQUE(user_id, provider)
);
```

### 1.3 Ingestion Workers

**Task**: Build background workers to ingest messages from connected integrations.
- Initial sync: Pull last 90 days.
- Store raw message metadata in `agent_events` table (expires in 90 days).

**Database Schema — `agent_events`:**
```sql
CREATE TABLE agent_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  source TEXT NOT NULL, -- 'gmail' | 'slack' | 'meeting_transcript'
  source_id TEXT NOT NULL, -- external message/thread ID
  event_type TEXT NOT NULL, -- 'email_received' | 'email_sent' | 'slack_message' | 'meeting_completed'
  content TEXT NOT NULL, -- raw message body
  participants JSONB, -- [{name, email/slack_id, role}]
  related_contact_id UUID REFERENCES contacts(id),
  related_company_id UUID REFERENCES companies(id),
  related_meeting_id UUID REFERENCES meetings(id),
  occurred_at TIMESTAMPTZ NOT NULL,
  ingested_at TIMESTAMPTZ DEFAULT NOW(),
  processed BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ
);
```

---

## Week 2: Accountability Engine (Mar 5 – Mar 11)

**Visible Deployment Goal:** The empty shell now populates with extracted Task Cards.

### 2.1 Task Extraction LLM Pipeline

**Task**: Build the extraction pipeline that reads `agent_events` and identifies committed action items. (Use Tyler's 50 tuning examples).

### 2.2 Feed API & UI Wiring

**API Endpoint (`GET /api/v1/agent/feed`):**
- Returns extracted tasks mapped to `agent_feed_items` schema.

**Frontend:**
- Render the "Task Card" variant in the feed.
- Implement `[Mark Done]` and `[Snooze]` actions locally (mock backend update if needed).

---

## Week 3: Transcript Migration (Mar 12 – Mar 18)

**Visible Deployment Goal:** The feed now shows legacy meeting summaries (TLDRs) alongside tasks.

### 3.1 Legacy Feed Integration

**Task**: Route existing meeting TLDRs into the Agent Feed API as "Impact Report Ready" cards.

**Frontend:**
- Render the "Impact Report Ready" card variant.
- `[Review]` button links to the existing legacy meeting page.

---

## Week 4: The Brain Turns On (Mar 19 – Mar 25)

**Visible Deployment Goal:** The feed rearranges itself proactively based on time and proximity.

### 4.1 TriggerEngine Service

**Task**: Build the cron jobs that prioritize feed items.
- **Time-based**: Batch Daily Briefs at 7 AM.
- **Proximity**: Elevate upcoming meetings to P1 status 15 mins prior.

**Frontend:**
- Ensure the feed auto-sorts based on the new `priority` field from the API.
- Render the "Meeting Prep" card variant.

---

## Week 5: Real-Time Urgency (Mar 26 – Apr 1)

**Visible Deployment Goal:** Urgent comms instantly pop into the feed without a refresh.

### 5.1 Event-Based Triggers

**Task**: Process inbound Slack/Gmail events in real time and flag urgent items via WebSockets/Server-Sent Events to the frontend.

**Frontend:**
- Render the "Urgent Comm" card variant with the Red Accent border.

---

## Week 6: Auto-Drafting (Apr 2 – Apr 8)

**Visible Deployment Goal:** Users can click "Send Reply" to edit and send AI drafts.

### 6.1 Draft LLM & UI

**Task**: Auto-generate drafts for P1 Urgent Comms.
**Frontend**: Build the inline "Send Reply" sheet and wire it to the Gmail/Slack APIs.

---

## Week 7: The True Impact Report (Apr 9 – Apr 15)

**Visible Deployment Goal:** Clicking a meeting opens the new, cross-signal Impact Report.

### 7.1 Synthesis Pipeline & UI Route

**Task**: Build the `ADVANCED/DETRACTED` LLM logic and the new `/chief-of-staff/report/:id` UI, completely replacing the legacy meeting page.

---

## Week 8: Global Chat & Analytics (Apr 16 – Apr 22)

**Visible Deployment Goal:** Chat sidebar works contextually; analytics firing.

### 8.1 PostHog & Context Payload

**Task**: Expose `context_payload` to the Global Chat component. Instrument all `cos_*` tracking events.

---

## Week 9: CSM Beta (Apr 23 – Apr 29)

**Visible Deployment Goal:** Live to Beta group; rapid UI fixes deployed.

---

## Week 10: GA Launch (Apr 30 – May 4)

**Visible Deployment Goal:** Feature flags removed. Mass ingestion monitored.

---

_Last updated: 2026-02-26_
_Owner: Palmer Turley_
