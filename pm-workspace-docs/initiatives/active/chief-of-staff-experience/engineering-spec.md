# Engineering Spec: Project Babar — Chief of Staff Agent

**Owner**: Palmer Turley
**Product**: Tyler Sahagun
**Timeline**: Feb 26 – May 4, 2026
**Initiative**: Project Babar — Chief of Staff Agent (single-player)

---

## Architecture Overview

The Chief of Staff Agent is an event-driven intelligence layer that sits on top of AskElephant's existing meeting data pipeline. It ingests cross-channel signals (Slack, Gmail, Calendar), extracts structured data (tasks, commitments, relationship signals), synthesizes narratives (Meeting Impact Reports), and proactively surfaces what matters to the user via a trigger engine.

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

## Week 1: OAuth & Ingestion Infrastructure (Feb 26 – Mar 4)

### 1.1 OAuth Implementation

**Task**: Implement OAuth 2.0 flows for Gmail, Slack, and Google Calendar.

**Gmail:**
- Use Google Identity Services OAuth 2.0 flow
- Scopes: `gmail.readonly`, `gmail.compose`, `gmail.send`, `gmail.labels` (see `week1-auth-scopes-and-retention.md`)
- Store: `access_token`, `refresh_token`, `token_expiry` in `user_integrations` table
- Auto-refresh tokens before expiry using a background cron

**Slack:**
- Use Slack OAuth v2
- Scopes: `channels:history`, `im:history`, `channels:read`, `users:read`, `chat:write`
- Store: `access_token`, `bot_token`, `team_id` in `user_integrations` table

**Google Calendar:**
- Scope: `calendar.readonly`
- Reuse Google OAuth session from Gmail if already connected

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

### 1.2 Ingestion Workers

**Task**: Build background workers to ingest messages from connected integrations.

**Gmail Ingestion Worker:**
- Initial sync: Pull last 90 days of email threads on first connection
- Ongoing: Poll Gmail API every 5 minutes for new messages (use `historyId` for incremental sync)
- Filter: Only ingest emails where user is sender or recipient
- Store raw message metadata in `agent_events` table

**Slack Ingestion Worker:**
- Initial sync: Pull last 90 days of messages from user's joined channels and DMs
- Ongoing: Listen to Slack Events API webhooks for `message.channels`, `message.im`
- Store raw message data in `agent_events` table

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
  expires_at TIMESTAMPTZ -- 90 days from ingested_at for Slack/Gmail
);
CREATE INDEX idx_agent_events_user_processed ON agent_events(user_id, processed);
CREATE INDEX idx_agent_events_occurred ON agent_events(occurred_at DESC);
```

### 1.3 Retention Cron

**Task**: Nightly cron that deletes Slack/Gmail events older than 90 days.

```
CRON: 0 3 * * * DELETE FROM agent_events WHERE expires_at < NOW() AND source IN ('gmail', 'slack')
```

**Acceptance Criteria (Week 1):**
- [ ] User can connect Gmail via OAuth and see success state
- [ ] User can connect Slack via OAuth and see success state
- [ ] User can connect Google Calendar via OAuth and see success state
- [ ] `agent_events` table populated within 60 seconds of connection
- [ ] Token refresh works without user re-auth
- [ ] Retention cron deletes expired records

---

## Week 2: Extraction & Relational Mapping (Mar 5 – Mar 11)

### 2.1 Task Extraction LLM Pipeline

**Task**: Build the extraction pipeline that reads `agent_events` and identifies committed action items.

**Extraction Prompt Design:**
- Input: Raw message content + participants
- Task: Identify commitments that are concrete, assigned, and time-sensitive
- Output: Structured JSON array of action items

```
System: You are an extraction agent for a sales CRM. From the following message, extract only concrete commitments — things someone explicitly agreed or promised to do. Do NOT extract casual mentions, wishes, or vague plans.

A "commitment" requires:
1. A clear action ("send the contract", "schedule a call", "update the CRM")
2. An implicit or explicit owner (who said it, or who it was said to)
3. A target or recipient (the person/company the action is for)

Return ONLY a JSON array. Return empty array [] if no commitments found.

Format: [{"action": string, "owner_name": string, "target_name": string, "due_hint": string | null, "source_quote": string, "urgency": "high" | "medium" | "low"}]
```

**Processing Flow:**
1. Worker queries `agent_events WHERE processed = FALSE` in batches of 50
2. Calls extraction LLM for each event
3. For each returned commitment, inserts into `action_items` table
4. Marks `agent_events.processed = TRUE`

### 2.2 Relational Mapping

**Task**: Associate extracted action items to the correct Contact, Company, or Meeting.

**Matching Logic (in priority order):**
1. Match participant email/Slack ID to `contacts` table
2. Match company name via contact's company
3. Match to most recent `meetings` record shared with that contact within 7 days
4. If no match: store with `related_contact_id = NULL` and flag for user review in the Agent feed

**Database Schema — `action_items` (enhanced):**
```sql
ALTER TABLE action_items ADD COLUMN IF NOT EXISTS source_event_id UUID REFERENCES agent_events(id);
ALTER TABLE action_items ADD COLUMN IF NOT EXISTS source_quote TEXT;
ALTER TABLE action_items ADD COLUMN IF NOT EXISTS urgency TEXT DEFAULT 'medium'; -- 'high' | 'medium' | 'low'
ALTER TABLE action_items ADD COLUMN IF NOT EXISTS owner_name TEXT;
ALTER TABLE action_items ADD COLUMN IF NOT EXISTS target_name TEXT;
ALTER TABLE action_items ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending'; -- 'pending' | 'approved' | 'snoozed' | 'completed' | 'dismissed'
ALTER TABLE action_items ADD COLUMN IF NOT EXISTS snoozed_until TIMESTAMPTZ;
ALTER TABLE action_items ADD COLUMN IF NOT EXISTS agent_generated BOOLEAN DEFAULT TRUE;
```

### 2.3 Legacy Cleanup

**Task**: Delete all existing 2B-pattern action items and reset the feature flag.

```sql
-- Run once, with backup first
DELETE FROM action_items WHERE created_at < '2026-02-26' AND agent_generated IS NULL;
-- Reset feature flag
UPDATE feature_flags SET enabled = FALSE WHERE key = 'action_items_v1';
```

**Acceptance Criteria (Week 2):**
- [ ] Extraction worker processes all unprocessed `agent_events` within 10 minutes of ingestion
- [ ] Correctly ignores casual chatter (validate against the 50 product examples in `week2-task-extraction-examples.md`)
- [ ] Action items linked to the correct contact and company
- [ ] 2B legacy items removed from production DB
- [ ] Average < 10 action items per meeting (quality check)

---

## Week 3: Meeting Impact Report — Data Layer (Mar 12 – Mar 18)

### 3.1 Synthesis Prompt & Pipeline

**Task**: Build the synthesis pipeline that generates a Meeting Impact Report for each completed meeting.

**Input Sources:**
1. Pre-meeting emails (Gmail events with participants matching meeting attendees, last 30 days)
2. Pre-meeting Slack messages (same participants, last 14 days)
3. Meeting transcript (existing AskElephant transcript data)
4. Post-meeting emails and Slack (within 48 hours of meeting end)

**Synthesis Prompt Design:**
```
System: You are a relationship intelligence analyst. Given the following communication context surrounding a meeting, generate a Meeting Impact Report.

The report must include:
1. RELATIONSHIP_SUMMARY: 2–3 sentences on the state of the relationship before this meeting (based on email/Slack tone)
2. MEETING_NARRATIVE: What was discussed, decided, and left open (from transcript)
3. TRAJECTORY_VERDICT: One of: "ADVANCED" | "NEUTRAL" | "DETRACTED" with a 1-sentence rationale
4. TRAJECTORY_EVIDENCE: The specific signal that drove the trajectory verdict
5. NEXT_BEST_ACTIONS: Up to 3 concrete follow-up actions, ranked by deal/relationship impact
6. OPEN_COMMITMENTS: Any commitments made in the meeting that don't yet have a corresponding action item

Return as structured JSON matching the ImpactReport schema.
```

**Database Schema — `impact_reports`:**
```sql
CREATE TABLE impact_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meetings(id),
  user_id UUID NOT NULL,
  relationship_summary TEXT,
  meeting_narrative TEXT,
  trajectory_verdict TEXT, -- 'ADVANCED' | 'NEUTRAL' | 'DETRACTED'
  trajectory_evidence TEXT,
  next_best_actions JSONB, -- [{action: string, rationale: string, urgency: string}]
  open_commitments JSONB,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  generation_model TEXT,
  user_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMPTZ,
  UNIQUE(meeting_id, user_id)
);
```

### 3.2 Pre-Generation Pipeline

**Task**: Pre-generate Impact Reports for all meetings in last 30 days, and generate new ones within 5 minutes of meeting end.

**Trigger**: `meeting.completed` event already exists in the pipeline — hook into it.

**Acceptance Criteria (Week 3):**
- [ ] Impact Report generated within 5 minutes of meeting end
- [ ] Report accurately distinguishes ADVANCED / NEUTRAL / DETRACTED (validate against rubric in `week3-impact-report-rubric.md`)
- [ ] Pre-generation runs for last 30 days on user's first connection
- [ ] Load time for pre-generated report < 2 seconds
- [ ] If no pre-meeting context exists, report degrades gracefully (meeting-only narrative)

---

## Week 4: TriggerEngine — Time-Based & Proximity (Mar 19 – Mar 25)

### 4.1 TriggerEngine Service

**Task**: Build the `TriggerEngine` — the service responsible for deciding when and what to surface to the user's Agent feed.

**Architecture:**
```
TriggerEngine
├── TimeBasedScheduler (cron, runs daily)
├── ProximityScheduler (cron, runs every 5 min, checks upcoming calendar events)
└── EventBridge (listens to agent_events insertions, runs per-event for high-urgency signals)
```

**Database Schema — `agent_feed_items`:**
```sql
CREATE TABLE agent_feed_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  type TEXT NOT NULL, -- 'daily_brief' | 'meeting_prep' | 'urgent_comm' | 'action_item' | 'impact_report_ready'
  priority INTEGER NOT NULL, -- 1 = highest; used for feed ordering
  title TEXT NOT NULL,
  body TEXT,
  evidence TEXT, -- the source quote or signal driving this item
  action_label TEXT, -- e.g., "Review", "Send Reply", "Approve"
  action_type TEXT, -- 'open_impact_report' | 'approve_action_item' | 'send_draft' | 'snooze'
  action_payload JSONB, -- data needed to execute the action
  related_meeting_id UUID REFERENCES meetings(id),
  related_action_item_id UUID REFERENCES action_items(id),
  related_contact_id UUID REFERENCES contacts(id),
  status TEXT DEFAULT 'active', -- 'active' | 'actioned' | 'snoozed' | 'dismissed' | 'expired'
  snoozed_until TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  actioned_at TIMESTAMPTZ
);
CREATE INDEX idx_feed_user_active ON agent_feed_items(user_id, status, priority);
```

### 4.2 Time-Based Trigger: Daily Brief

**Cron**: Runs at 7:00 AM user local time, every weekday.

**Logic:**
1. Pull all `action_items` for the user with `status = 'pending'` and `urgency IN ('high', 'medium')`
2. Pull calendar events for today
3. Rank and insert into `agent_feed_items` with type = `daily_brief`
4. Top item gets priority 1, subsequent items priority 2–N

### 4.3 Proximity Trigger: Meeting Prep

**Cron**: Runs every 5 minutes.

**Logic:**
1. Check for calendar events starting in 10–20 minute window
2. If meeting found and `impact_report` exists for a prior meeting with same participants: surface prep brief
3. If meeting found and `impact_report` does NOT exist: surface summary of last 3 emails with those participants
4. Insert into `agent_feed_items` with type = `meeting_prep`, priority = 1 (highest urgency)

**Acceptance Criteria (Week 4):**
- [ ] Daily brief feed items appear in user feed by 7:15 AM local time
- [ ] Meeting prep item surfaces 15 minutes before scheduled event
- [ ] Feed renders correctly in `/chief-of-staff` route (even if minimal UI — feed endpoint must be live)
- [ ] Priority ordering is respected in the feed API response

---

## Week 5: TriggerEngine — Event-Based & Auto-Drafting (Mar 26 – Apr 1)

### 5.1 Event-Based Triggers

**Task**: Process inbound Slack/Gmail events in real time and flag urgent items.

**Urgency Classification Logic** (see `week5-urgent-comms-definition.md`):
1. LLM call on each new `agent_event` with a simple classifier prompt
2. If urgency = `high`: immediately insert into `agent_feed_items` with priority = 1
3. If urgency = `medium`: batch into the next daily brief cycle
4. If urgency = `low`: no feed insertion

**Urgency Classifier Prompt:**
```
System: You are a triage agent. Classify the urgency of this message for a sales rep.

Return one of: "high" | "medium" | "low"

"high" = requires response within 2 hours; affects deal progression, contains explicit question or request, or is from a known VIP contact
"medium" = should be addressed today but not immediately
"low" = FYI, no action required

Message: {content}
Sender: {sender_name} | {sender_role_if_known}
```

### 5.2 Auto-Drafting LLM

**Task**: For `high` urgency events, auto-generate a contextual draft reply.

**Input:**
- The original urgent message
- Last 5 emails/messages in thread with that contact
- Any open action items related to that contact
- Most recent Impact Report for meetings with that contact (if exists)

**Draft Prompt:**
```
System: You are drafting a reply on behalf of a sales rep. Write a reply that:
1. Acknowledges the message directly
2. References the relevant context (previous commitments, meeting outcomes)
3. Answers or advances the ask
4. Is professional, concise (under 150 words), and matches the channel tone (email vs Slack)

Do NOT add pleasantries that weren't in the original exchange tone.
```

**Output stored in `agent_feed_items.action_payload`:**
```json
{
  "draft_body": "...",
  "channel": "gmail|slack",
  "send_to": "email or slack_user_id",
  "thread_id": "external_thread_id"
}
```

**Acceptance Criteria (Week 5):**
- [ ] High-urgency inbound message surfaces in Agent feed within 60 seconds
- [ ] Drafted reply is contextually relevant (validated against 10 test cases)
- [ ] "Send Reply" action sends the message and marks the feed item as actioned
- [ ] User can edit the draft before sending (inline edit in feed card)
- [ ] Medium/low urgency items do not interrupt the feed

---

## Week 6: Agent Feed UI — `/chief-of-staff` Route (Apr 2 – Apr 8)

### 6.1 Frontend Route: `/chief-of-staff`

**Task**: Build the primary Agent surface as a dedicated route.

**API Endpoint (Backend):**
```
GET /api/v1/agent/feed
Params: limit=20, cursor=<feed_item_id>, type=<optional filter>
Response: { items: AgentFeedItem[], next_cursor: string | null, agent_status: AgentStatus }
```

**AgentStatus Object:**
```typescript
interface AgentStatus {
  email_agent: { active: boolean; drafts_this_week: number };
  churn_agent: { active: boolean; deals_analyzed: number };
  crm_agent: { active: boolean; objects_updated: number };
  chief_of_staff: { active: boolean };
}
```

**Feed Card Component Requirements:**
- Each card renders: title, body/evidence text, company+deal badge (if applicable), action buttons
- Primary action: "Review" (opens full artifact) or "Send Reply" (sends draft)
- Secondary action: "Remind me later" (snoozes item for 3 hours, re-surfaces at top)
- Urgent/At-Risk/Overdue badges driven by `urgency` field and `action_item.due_date`

**Homepage Module (Greeting):**
- Personalized greeting: "Good morning, [first name]" at top of feed
- Subtitle: "You have [N] focus actions and [M] meetings today."

### 6.2 Action Execution

**Task**: Wire "Review", "Send Reply", and "Remind me later" buttons to their API actions.

```
POST /api/v1/agent/feed-items/:id/action
Body: { action: 'review' | 'send_reply' | 'snooze' | 'dismiss', snooze_minutes?: number }
```

**Acceptance Criteria (Week 6):**
- [ ] `/chief-of-staff` route renders with real data
- [ ] Feed cards display action buttons and execute correctly
- [ ] "Remind me later" snoozes item and removes it from feed for 3 hours
- [ ] "Active Agents" module shows live stats
- [ ] Empty state renders if no feed items
- [ ] Feed is responsive on desktop (minimum 1280px wide; mobile deferred)

---

## Week 7: Dynamic Templates & Global Chat Integration (Apr 9 – Apr 15)

### 7.1 Call-Type Auto-Detection

**Task**: Auto-detect meeting type from transcript and title, apply template to Impact Report.

**Detection Prompt:**
```
System: Classify this meeting into one of four types based on title and first 500 words of transcript.
Types: "discovery" | "demo" | "internal" | "renewal"
Return ONLY the type as a string.
```

**Template Routing:**
- `discovery`: Emphasize relationship stage, open questions, next steps
- `demo`: Emphasize product fit signals, objections raised, purchase intent
- `internal`: Emphasize decisions made, owners assigned, blockers
- `renewal`: Emphasize health signals, at-risk indicators, expansion opportunity

### 7.2 Global Chat Integration

**Task**: Connect the Impact Report page to the Global Chat architecture (owned by separate team track).

**Requirements from Palmer's side:**
- Impact Report page exposes a `context_payload` prop that pre-loads the chat with the current meeting's data
- `context_payload` schema:
  ```typescript
  interface ImpactReportChatContext {
    meeting_id: string;
    contact_names: string[];
    company_name: string;
    trajectory_verdict: string;
    summary_snippet: string;
  }
  ```
- Chat should answer queries like "What were the action items?" or "Draft a follow-up email" using this context
- Palmer's responsibility ends at providing the `context_payload`; Global Chat team owns the chat rendering

### 7.3 Inline AI Rewrite

**Task**: Enable section-level edit/rewrite within the Impact Report page.

- Each section (relationship_summary, meeting_narrative, trajectory_evidence) has an "Edit / Ask AI" affordance
- Clicking "Ask AI" opens a single-line prompt inline (no modal)
- AI rewrites the section content in place
- "Undo" restores the previous version (stored in component state)

**Acceptance Criteria (Week 7):**
- [ ] Impact Report auto-detects meeting type and applies correct template
- [ ] User can manually override the detected type
- [ ] `context_payload` passed to Global Chat correctly
- [ ] Inline AI rewrite works on all three main sections
- [ ] Template type and override stored in `impact_reports` table

---

## Week 8: Instrumentation & Load Testing (Apr 16 – Apr 22)

### 8.1 PostHog Event Instrumentation

**Task**: Instrument all key interactions for the metrics dashboard (see `week8-posthog-event-schema.md`).

**Events to Track:**
```
cos_feed_viewed           - user loads /chief-of-staff
cos_feed_item_reviewed    - user clicks Review on any card
cos_feed_item_snoozed     - user clicks Remind me later
cos_feed_item_dismissed   - user dismisses a card
cos_draft_approved        - user clicks Send Reply without editing
cos_draft_edited          - user edits draft before sending
cos_action_item_completed - user marks an action item done
cos_impact_report_viewed  - user opens an impact report
cos_impact_report_edited  - user edits a section of an impact report
cos_integration_connected - user connects Gmail/Slack/Calendar (property: provider)
```

### 8.2 Load Testing

**Task**: Simulate concurrent Slack/Gmail webhook ingestion to verify the ingestion worker can handle production load.

**Baseline targets:**
- 1,000 concurrent `agent_events` inserts: < 500ms p95
- Extraction worker processes 50 events in < 30 seconds
- TriggerEngine daily brief cron completes for 100 users in < 2 minutes

**Acceptance Criteria (Week 8):**
- [ ] All PostHog events fire correctly on staging
- [ ] Load test results meet baseline targets
- [ ] No P0 bugs open in staging environment
- [ ] Skylar 80% polish review complete

---

## Week 9: Beta Deployment & Tuning (Apr 23 – Apr 29)

### 9.1 Beta Feature Flag

**Task**: Deploy all new routes behind `feature_flag: 'project_babar_beta'`.

- Flag enabled for: 5–10 CSM beta users (sourced by Robert) + internal team
- All new DB tables and routes gated behind this flag server-side

### 9.2 Alert Fatigue Mitigation

**Task**: Based on beta feedback, tune the TriggerEngine to reduce noise.

**Tuning levers:**
- `max_feed_items_per_day`: Cap on number of new items inserted per user per day (default: 15, tune based on feedback)
- `high_urgency_quiet_hours`: No high-urgency pushes between 8 PM and 7 AM local time
- `snooze_auto_dismiss`: If user snoozes the same item 3 times without acting, auto-dismiss it

**Acceptance Criteria (Week 9):**
- [ ] Beta group onboarded and active
- [ ] At least 1 design iteration shipped based on beta feedback
- [ ] p50 prompt latency for Impact Report < 8 seconds
- [ ] No user in beta reports "too many notifications" as a blocker

---

## Week 10: GA Launch (Apr 30 – May 4)

### 10.1 Feature Flag Removal

**Task**: Remove `project_babar_beta` flag and make all routes available by default.

- Coordinate with Tyler on release communication timing
- Deploy during low-traffic window (Tuesday/Wednesday morning)

### 10.2 Post-Launch Monitoring

**Task**: Monitor key signals for 72 hours post-launch.

**Monitors:**
- Ingestion worker queue depth: alert if > 1,000 unprocessed events
- Error rate on `/api/v1/agent/feed`: alert if > 1%
- Gmail/Slack token refresh failures: alert if > 5% of connected users
- PostHog: watch `cos_feed_viewed` for day-1 adoption signal

**Hotfix Criteria:**
- P0: feed does not load for > 5% of users → immediate rollback
- P1: Impact Reports not generating within 30 minutes of meeting end → disable synthesis worker, fall back to transcript-only view

**Acceptance Criteria (Week 10):**
- [ ] Feature flags removed
- [ ] No P0 bugs in first 72 hours
- [ ] Monitoring dashboards live
- [ ] `/chief-of-staff` is the default landing route for all users
- [ ] 100 PQLs target confirmed in PostHog by June 1 milestone

---

_Last updated: 2026-02-26_
_Owner: Palmer Turley_
_Reviewed by: Tyler Sahagun_
