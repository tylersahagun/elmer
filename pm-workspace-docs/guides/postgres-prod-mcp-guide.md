# AskElephant Production Database (postgres-prod) — PM Guide

> **Access**: Read-only SQL queries via the `user-postgres-prod-query` MCP tool.
> **Usage**: `user-postgres-prod-query` with a `sql` parameter containing any SELECT statement.
> **Constraint**: Read-only — no INSERT, UPDATE, DELETE, or DDL allowed.

---

## Table of Contents

1. [Quick Start — Useful Queries](#quick-start--useful-queries)
2. [Database at a Glance](#database-at-a-glance)
3. [Core Entity Model](#core-entity-model)
4. [Domain Reference](#domain-reference)
   - [Workspaces & Users](#1-workspaces--users)
   - [Engagements (Meetings, Calls, Emails)](#2-engagements-meetings-calls-emails)
   - [Companies & Contacts (CRM)](#3-companies--contacts-crm)
   - [Annotations (AI Extraction)](#4-annotations-ai-extraction)
   - [Chats & Chat Messages (AI Assistant)](#5-chats--chat-messages-ai-assistant)
   - [Tasks (Action Items)](#6-tasks-action-items)
   - [Projects](#7-projects)
   - [Workflows (Automation)](#8-workflows-automation)
   - [Knowledge Bases](#9-knowledge-bases)
   - [Media Clips](#10-media-clips)
   - [Integrations](#11-integrations)
   - [Calendar Events](#12-calendar-events)
   - [Tags](#13-tags)
   - [Billing & Subscriptions](#14-billing--subscriptions)
5. [Enum Reference](#enum-reference)
6. [Key Relationships (JOIN Patterns)](#key-relationships-join-patterns)
7. [PM Query Cookbook](#pm-query-cookbook)
8. [Views & System Tables](#views--system-tables)
9. [Important Notes](#important-notes)

---

## Quick Start — Useful Queries

```sql
-- How many workspaces are active?
SELECT count(*) FROM workspaces WHERE deleted_at IS NULL;

-- Top 10 workspaces by engagement volume
SELECT w.name, count(e.id) as engagement_count
FROM workspaces w
JOIN engagements e ON e.workspace_id = w.id
WHERE w.deleted_at IS NULL
GROUP BY w.name
ORDER BY engagement_count DESC
LIMIT 10;

-- Recent engagement processing failures
SELECT id, title, processing_status, data_source, created_at
FROM engagements
WHERE processing_status = 'FAILED'
ORDER BY created_at DESC
LIMIT 20;

-- Chat usage (AI assistant) by workspace
SELECT w.name, count(c.id) as chat_count
FROM workspaces w
JOIN chats c ON c.workspace_id = w.id
WHERE c.deleted_at IS NULL
GROUP BY w.name
ORDER BY chat_count DESC
LIMIT 10;
```

---

## Database at a Glance

| Metric                                        |      Count |
| --------------------------------------------- | ---------: |
| **Workspaces**                                |        727 |
| **Users**                                     |     25,553 |
| **Engagements** (meetings/calls/emails)       |  5,652,051 |
| **Companies**                                 |  2,997,114 |
| **Contacts**                                  |    861,366 |
| **Chats** (AI conversations)                  |  4,837,770 |
| **Tasks** (action items)                      |  2,035,787 |
| **Annotation Definitions** (AI extractors)    |      2,910 |
| **Annotation Values** (extracted data points) | 11,686,275 |
| **Workflows**                                 |     12,042 |
| **Media Clips**                               |    325,605 |
| **Knowledge Bases**                           |        741 |
| **Total tables**                              |       ~130 |

---

## Core Entity Model

```
┌───────────────┐
│  WORKSPACE    │ ← Tenant. Everything belongs to one workspace.
└──────┬────────┘
       │ 1:N
  ┌────┴─────┐
  │          │
  ▼          ▼
┌──────┐  ┌─────────────┐
│ USER │  │ ENGAGEMENT  │ ← Meeting, Call, Email, Document, etc.
└──┬───┘  └──────┬──────┘
   │             │
   │     ┌───────┼───────────┬────────────┐
   │     │       │           │            │
   │     ▼       ▼           ▼            ▼
   │  ┌──────┐ ┌──────────┐ ┌──────┐  ┌────────────┐
   │  │ CHAT │ │ANNOTATION│ │ TASK │  │ MEDIA CLIP │
   │  └──────┘ │  VALUE   │ └──────┘  └────────────┘
   │           └──────────┘
   │               ▲
   │               │
   │     ┌─────────┴──────────┐
   │     │ ANNOTATION         │
   │     │ DEFINITION         │ ← Template for what to extract
   │     └────────────────────┘
   │
   ├──→ COMPANY ──→ CONTACT
   │
   ├──→ PROJECT (deal/opp tracking)
   │
   ├──→ WORKFLOW (automation)
   │
   └──→ KNOWLEDGE BASE (RAG context)
```

**Key principle**: `workspace_id` is the tenant boundary on every table. Always filter by it when querying customer-specific data.

---

## Domain Reference

### 1. Workspaces & Users

**`workspaces`** — Multi-tenant root. Each AskElephant customer org is a workspace.

| Column                     | Type         | Notes                 |
| -------------------------- | ------------ | --------------------- |
| `id`                       | text (ULID)  | Primary key           |
| `name`                     | varchar      | Display name          |
| `slug`                     | varchar      | URL-safe identifier   |
| `plan`                     | USER-DEFINED | Subscription tier     |
| `allowed_seats`            | int          | Licensed seat count   |
| `deleted_at`               | timestamp    | Soft delete           |
| `industry`, `company_size` | varchar      | Firmographics         |
| `onboarding_*`             | various      | Onboarding flow state |

**`users`** — Individual accounts within a workspace.

| Column                            | Type        | Notes                                       |
| --------------------------------- | ----------- | ------------------------------------------- |
| `id`                              | text (ULID) | Primary key                                 |
| `workspace_id`                    | text        | FK → workspaces                             |
| `email`                           | varchar     | Login email                                 |
| `first_name`, `last_name`         | varchar     | Display name                                |
| `role`                            | enum        | OWNER, MANAGER, USER, INACTIVE, NOT_INVITED |
| `seat_tier`                       | enum        | FREE, BASIC, PLUS, PREMIUM                  |
| `job_title`, `department`, `team` | varchar     | Org metadata                                |
| `ai_model`                        | enum        | recommended, lite, creative, analytical     |

**Related tables**: `user_settings` (17 cols), `user_emails`, `user_phone_numbers`, `user_groups`, `auth_users`

```sql
-- Users by role per workspace
SELECT w.name, u.role, count(*)
FROM users u JOIN workspaces w ON w.id = u.workspace_id
WHERE u.deleted_at IS NULL
GROUP BY w.name, u.role
ORDER BY w.name, count(*) DESC;
```

---

### 2. Engagements (Meetings, Calls, Emails)

**`engagements`** — The central content entity. Every meeting recording, call, email, or document processed by AskElephant.

| Column                                           | Type        | Notes                                                                                 |
| ------------------------------------------------ | ----------- | ------------------------------------------------------------------------------------- |
| `id`                                             | text (ULID) | Primary key                                                                           |
| `workspace_id`                                   | text        | FK → workspaces                                                                       |
| `title`                                          | varchar     | Meeting/email subject                                                                 |
| `type`                                           | enum        | MEETING, CALL, EMAIL, TASK, NOTE, DOCUMENT, CALENDAR_EVENT                            |
| `data_source`                                    | enum        | ZOOM, RECALL, UPLOAD, HUBSPOT_CALL, GONG, RING_CENTRAL_CALL, DIALPAD_CALL, NYLAS, ... |
| `processing_status`                              | enum        | PENDING, PROCESSING, COMPLETED, FAILED                                                |
| `scheduled_start_at` / `started_at` / `ended_at` | timestamp   | Timing                                                                                |
| `duration_seconds`                               | int         | Length                                                                                |
| `is_private`                                     | boolean     | Privacy flag                                                                          |
| `will_record`                                    | boolean     | Bot recording intent                                                                  |
| `external_url`                                   | varchar     | Source platform link                                                                  |
| `media_bucket_path`                              | text        | Cloud storage path                                                                    |
| `model`                                          | enum        | AI model used                                                                         |
| `language`                                       | varchar     | Detected language                                                                     |

**Related tables**:

- `engagement_participant_contacts` — links engagements ↔ contacts (with `speaking_percentage`)
- `engagement_participant_users` — links engagements ↔ internal users
- `engagement_companies` — links engagements ↔ companies
- `engagement_tags` — tag associations
- `engagement_contents` — raw content storage
- `engagement_recall_bots` — Recall.ai bot tracking
- `engagements_search_index` — full-text search (tsvector)
- `transcript_timelines` — timestamped transcript segments
- `transcript_embeddings` — vector embeddings for semantic search

```sql
-- Engagement volume by type over the last 30 days
SELECT type, data_source, count(*)
FROM engagements
WHERE created_at > now() - interval '30 days'
GROUP BY type, data_source
ORDER BY count(*) DESC;

-- Failed processing by source
SELECT data_source, count(*) as failures
FROM engagements
WHERE processing_status = 'FAILED'
  AND created_at > now() - interval '7 days'
GROUP BY data_source
ORDER BY failures DESC;
```

---

### 3. Companies & Contacts (CRM)

**`companies`** — CRM company records, synced or auto-created.

| Column                                | Type        | Notes                       |
| ------------------------------------- | ----------- | --------------------------- |
| `id`                                  | text (ULID) | Primary key                 |
| `workspace_id`                        | text        | FK → workspaces             |
| `name`                                | varchar     | Company name                |
| `industry`, `employee_count`          | varchar/int | Firmographics               |
| `owner_user_id`                       | text        | FK → users (assigned owner) |
| `health_score`                        | int         | Computed health score       |
| `last_contacted_at`                   | timestamp   | Recency of engagement       |
| `external_crm_id`, `external_crm_url` | text        | Salesforce/HubSpot link     |

**`contacts`** — Individual people associated with companies.

| Column                                | Type        | Notes           |
| ------------------------------------- | ----------- | --------------- |
| `id`                                  | text (ULID) | Primary key     |
| `workspace_id`                        | text        | FK → workspaces |
| `first_name`, `last_name`             | varchar     | Name            |
| `email`                               | varchar     | Primary email   |
| `title`, `department`                 | varchar     | Role info       |
| `company_id`                          | text        | FK → companies  |
| `owner_user_id`                       | text        | FK → users      |
| `external_crm_id`, `external_crm_url` | text        | CRM link        |

**Related tables**: `contact_emails`, `contact_phone_numbers`, `company_domains`, `company_projects`, `companies_search_index`, `contact_property_values`, `company_property_values`

```sql
-- Companies with most engagements
SELECT co.name, count(ec.engagement_id) as mtg_count
FROM companies co
JOIN engagement_companies ec ON ec.company_id = co.id
WHERE co.deleted_at IS NULL
GROUP BY co.name
ORDER BY mtg_count DESC
LIMIT 20;

-- Contacts without recent engagement (churn risk signal)
SELECT c.first_name, c.last_name, c.email, co.name as company
FROM contacts c
LEFT JOIN companies co ON co.id = c.company_id
WHERE c.deleted_at IS NULL
  AND c.last_contacted_at < now() - interval '90 days'
  AND c.workspace_id = '<WORKSPACE_ID>'
LIMIT 50;
```

---

### 4. Annotations (AI Extraction)

This is AskElephant's core differentiator — structured data extraction from conversations.

**`annotation_definitions`** — Templates defining _what_ to extract (e.g., "MEDDIC Score", "Budget Mentioned", "Decision Maker Identified").

| Column                      | Type         | Notes                                              |
| --------------------------- | ------------ | -------------------------------------------------- |
| `id`                        | text (ULID)  | Primary key                                        |
| `workspace_id`              | text         | FK → workspaces                                    |
| `name`                      | varchar      | Human-readable name                                |
| `description`               | text         | What this extracts                                 |
| `data_type`                 | USER-DEFINED | The value type (text, number, boolean, enum, etc.) |
| `category`                  | USER-DEFINED | Grouping category                                  |
| `is_system`                 | boolean      | Built-in vs custom                                 |
| `prompt_text`               | text         | AI extraction prompt                               |
| `enum_values`               | jsonb        | Options for enum type                              |
| `extraction_engine_version` | int          | Model version                                      |

**`annotation_values`** — The actual extracted data points (11.6M+ rows).

| Column                      | Type        | Notes                       |
| --------------------------- | ----------- | --------------------------- |
| `id`                        | text (ULID) | Primary key                 |
| `annotation_definition_id`  | text        | FK → annotation_definitions |
| `engagement_id`             | text        | FK → engagements            |
| `workspace_id`              | text        | FK → workspaces             |
| `value`                     | text        | Extracted value             |
| `confidence_score`          | numeric     | AI confidence (0-1)         |
| `citations`                 | jsonb       | Transcript references       |
| `reasoning`                 | text        | AI's reasoning              |
| `agent_annotation_value_id` | text        | Agent-generated flag        |

**Related tables**: `annotation_integration_mappings` (CRM field sync), `annotation_push_events` (push history), `annotation_dynamic_enum_values`, `annotation_embedding_queue`

```sql
-- Most-used annotation definitions
SELECT ad.name, ad.data_type, count(av.id) as usage_count
FROM annotation_definitions ad
JOIN annotation_values av ON av.annotation_definition_id = ad.id
WHERE ad.deleted_at IS NULL
GROUP BY ad.name, ad.data_type
ORDER BY usage_count DESC
LIMIT 20;

-- Annotation values for a specific engagement
SELECT ad.name, av.value, av.confidence_score
FROM annotation_values av
JOIN annotation_definitions ad ON ad.id = av.annotation_definition_id
WHERE av.engagement_id = '<ENGAGEMENT_ID>'
ORDER BY ad.name;
```

---

### 5. Chats & Chat Messages (AI Assistant)

**`chats`** — AI assistant conversations (4.8M+). The "Ask Elephant" experience.

| Column          | Type         | Notes                                               |
| --------------- | ------------ | --------------------------------------------------- |
| `id`            | text (ULID)  | Primary key                                         |
| `workspace_id`  | text         | FK → workspaces                                     |
| `user_id`       | text         | FK → users (who started it)                         |
| `title`         | varchar      | Conversation title                                  |
| `engagement_id` | text         | FK → engagements (context for meeting-specific Q&A) |
| `context_type`  | USER-DEFINED | What the chat is about                              |
| `summary`       | text         | Auto-generated summary                              |
| `ai_model`      | varchar      | Model used                                          |

**`chat_messages`** — Individual messages in a chat thread.

| Column              | Type         | Notes                   |
| ------------------- | ------------ | ----------------------- |
| `id`                | text (ULID)  | Primary key             |
| `chat_id`           | text         | FK → chats              |
| `role`              | USER-DEFINED | user, assistant, system |
| `content`           | text         | Message text            |
| `tool_calls`        | jsonb        | Function calls made     |
| `tool_call_results` | jsonb        | Function call results   |
| `citations`         | jsonb        | Source references       |
| `model`             | varchar      | Model used              |

**Related tables**: `chat_attachments`

```sql
-- Daily chat volume trend
SELECT date_trunc('day', created_at) as day, count(*) as chats
FROM chats
WHERE created_at > now() - interval '30 days'
  AND deleted_at IS NULL
GROUP BY day
ORDER BY day;

-- Average messages per chat (engagement depth)
SELECT avg(msg_count) as avg_messages_per_chat
FROM (
  SELECT chat_id, count(*) as msg_count
  FROM chat_messages
  WHERE created_at > now() - interval '30 days'
  GROUP BY chat_id
) sub;
```

---

### 6. Tasks (Action Items)

**`tasks`** — AI-extracted action items from engagements (2M+ rows).

| Column                                          | Type         | Notes                 |
| ----------------------------------------------- | ------------ | --------------------- |
| `id`                                            | text         | Primary key           |
| `title`                                         | text         | Action item text      |
| `engagement_id`                                 | text         | FK → engagements      |
| `status`                                        | USER-DEFINED | Completion status     |
| `due_on`                                        | text         | Due date              |
| `tool`                                          | text         | Integration target    |
| `commitment_citations`                          | array        | Transcript references |
| `assigned_to_transcript_timeline_speaker_index` | text         | Who committed         |

```sql
-- Task completion rates
SELECT status, count(*)
FROM tasks
WHERE deleted_at IS NULL
  AND created_at > now() - interval '30 days'
GROUP BY status;
```

---

### 7. Projects

**`projects`** — Deal/opportunity tracking objects. Currently shows 0 rows (feature may be new or unused in prod).

| Column          | Type        | Notes           |
| --------------- | ----------- | --------------- |
| `id`            | text (ULID) | Primary key     |
| `workspace_id`  | text        | FK → workspaces |
| `name`          | varchar     | Project name    |
| `description`   | text        | Description     |
| `owner_user_id` | text        | FK → users      |
| `stage`         | varchar     | Current stage   |

**Related tables**: `project_definitions`, `project_stages`, `project_stage_definitions`, `project_engagements`, `project_property_values`

---

### 8. Workflows (Automation)

**`workflows`** — User-built automation flows (12K+).

| Column           | Type         | Notes            |
| ---------------- | ------------ | ---------------- |
| `id`             | text (ULID)  | Primary key      |
| `workspace_id`   | text         | FK → workspaces  |
| `name`           | varchar      | Workflow name    |
| `description`    | text         | Description      |
| `is_active`      | boolean      | Enabled/disabled |
| `trigger_config` | jsonb        | What triggers it |
| `type`           | USER-DEFINED | Workflow type    |

**Related tables**: `workflow_nodes`, `workflow_edges`, `workflow_runs`, `workflow_run_steps`, `workflow_recipes`, `workflow_assistant_runs`, `static_workflow_runs`

```sql
-- Active workflows by workspace
SELECT w.name, count(wf.id) as active_workflows
FROM workflows wf
JOIN workspaces w ON w.id = wf.workspace_id
WHERE wf.is_active = true AND wf.deleted_at IS NULL
GROUP BY w.name
ORDER BY active_workflows DESC
LIMIT 10;
```

---

### 9. Knowledge Bases

**`knowledge_bases`** — RAG context collections for the AI assistant (741 total).

| Column         | Type        | Notes                    |
| -------------- | ----------- | ------------------------ |
| `id`           | text (ULID) | Primary key              |
| `workspace_id` | text        | FK → workspaces          |
| `name`         | varchar     | KB name                  |
| `description`  | text        | Description              |
| `is_default`   | boolean     | Default KB for workspace |
| `domains`      | array       | Scoped domains           |

**Related tables**: `knowledge_base_sources`, `knowledge_sources`

---

### 10. Media Clips

**`media_clips`** — Shareable snippets from meeting recordings (325K+).

| Column                          | Type         | Notes                   |
| ------------------------------- | ------------ | ----------------------- |
| `id`                            | text (ULID)  | Primary key             |
| `engagement_id`                 | text         | FK → engagements        |
| `name`                          | varchar      | Clip title              |
| `start_seconds` / `end_seconds` | int          | Time range in recording |
| `media_bucket_path`             | text         | Storage path            |
| `summary_markdown`              | text         | AI summary              |
| `action_items_markdown`         | text         | AI action items         |
| `recording_processing_status`   | USER-DEFINED | Processing state        |

---

### 11. Integrations

**`integration_connections`** — Connected third-party services.

| Column          | Type         | Notes                                                                          |
| --------------- | ------------ | ------------------------------------------------------------------------------ |
| `id`            | text (ULID)  | Primary key                                                                    |
| `workspace_id`  | text         | FK → workspaces                                                                |
| `type`          | enum         | ZOOM, HUBSPOT, SALESFORCE, SLACK, GONG, LINEAR, NOTION, GMAIL, ... (20+ types) |
| `status`        | USER-DEFINED | Connection status                                                              |
| `user_id`       | text         | FK → users (who connected)                                                     |
| `configuration` | jsonb        | Integration config                                                             |
| `scopes`        | jsonb        | OAuth scopes                                                                   |

**Related tables**: `integration_connection_fields`, `integration_push_events`

```sql
-- Integration adoption
SELECT type, count(*) as connections
FROM integration_connections
WHERE deleted_at IS NULL
GROUP BY type
ORDER BY connections DESC;
```

---

### 12. Calendar Events

**`calendar_events`** — Synced calendar data for bot scheduling.

| Column                | Type         | Notes                   |
| --------------------- | ------------ | ----------------------- |
| `id`                  | text (ULID)  | Primary key             |
| `workspace_id`        | text         | FK → workspaces         |
| `user_id`             | text         | FK → users              |
| `title`               | varchar      | Event title             |
| `start_at` / `end_at` | timestamp    | Timing                  |
| `attendees`           | jsonb        | Participant list        |
| `meeting_platform`    | varchar      | zoom, teams, meet, etc. |
| `calendar_provider`   | USER-DEFINED | google, microsoft       |
| `will_record`         | boolean      | Bot scheduled           |

---

### 13. Tags

**`tags`** — User-created labels for organizing engagements.

| Column         | Type        | Notes           |
| -------------- | ----------- | --------------- |
| `id`           | text (ULID) | Primary key     |
| `workspace_id` | text        | FK → workspaces |
| `name`         | varchar     | Tag name        |
| `color`        | varchar     | Display color   |

**Related tables**: `engagement_tags`, `signals_tags`

---

### 14. Billing & Subscriptions

**`payment_subscriptions`** — Stripe billing state.

| Column                          | Type         | Notes                            |
| ------------------------------- | ------------ | -------------------------------- |
| `id`                            | text (ULID)  | Primary key                      |
| `workspace_id`                  | text         | FK → workspaces                  |
| `status`                        | USER-DEFINED | active, canceled, past_due, etc. |
| `stripe_customer_id`            | varchar      | Stripe customer                  |
| `stripe_subscription_id`        | varchar      | Stripe subscription              |
| `plan`                          | USER-DEFINED | Plan tier                        |
| `base_price_cents`              | int          | Monthly price                    |
| `seat_price_cents`              | int          | Per-seat price                   |
| `included_seats`                | int          | Seats in base price              |
| `current_period_start` / `_end` | timestamp    | Billing cycle                    |
| `trial_start` / `trial_end`     | timestamp    | Trial period                     |

```sql
-- Revenue analysis (MRR)
SELECT
  plan,
  status,
  count(*) as subscription_count,
  sum(base_price_cents + (seat_price_cents * included_seats)) / 100.0 as total_monthly_revenue
FROM payment_subscriptions
WHERE deleted_at IS NULL
GROUP BY plan, status
ORDER BY total_monthly_revenue DESC;
```

---

## Enum Reference

| Enum Type                        | Values                                                                                                                                                                                                     |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **engagement_type**              | EMAIL, TASK, MEETING, CALL, NOTE, DOCUMENT, CALENDAR_EVENT                                                                                                                                                 |
| **engagement_processing_status** | PENDING, PROCESSING, COMPLETED, FAILED                                                                                                                                                                     |
| **engagement_data_source**       | ZOOM, ZOOM_PHONE, GRAIN, ZAPIER, RECALL, UPLOAD, MOBILE_UPLOAD, WEB_RECORDING_UPLOAD, DESKTOP_UPLOAD, FILE_UPLOAD, HUBSPOT_CALL, GONG, RING_CENTRAL_CALL, DIALPAD_CALL, NYLAS                              |
| **user_role**                    | OWNER, MANAGER, USER, INACTIVE, NOT_INVITED                                                                                                                                                                |
| **user_seat_tier**               | FREE, BASIC, PLUS, PREMIUM                                                                                                                                                                                 |
| **model_options**                | recommended, lite, creative, analytical                                                                                                                                                                    |
| **integration_type**             | ASANA, CONFLUENCE, DIALPAD, ELEPHANT, GMAIL, GONG, GOOGLE_CALENDAR, GOOGLE_DRIVE, GRAIN, HUBSPOT, LINEAR, MICROSOFT_OUTLOOK, MONDAY, NOTION, RING_CENTRAL, SALESFORCE, SALESFORCE_V2, SENDOSO, SLACK, ZOOM |

---

## Key Relationships (JOIN Patterns)

### Engagement → Participants (contacts + users)

```sql
-- Who was on a meeting?
SELECT
  c.first_name || ' ' || c.last_name as contact_name,
  c.email,
  epc.speaking_percentage
FROM engagement_participant_contacts epc
JOIN contacts c ON c.id = epc.contact_id
WHERE epc.engagement_id = '<ENGAGEMENT_ID>'
ORDER BY epc.speaking_percentage DESC;
```

### Engagement → Company

```sql
-- Company activity timeline
SELECT e.title, e.type, e.started_at, e.duration_seconds
FROM engagements e
JOIN engagement_companies ec ON ec.engagement_id = e.id
WHERE ec.company_id = '<COMPANY_ID>'
ORDER BY e.started_at DESC;
```

### Engagement → Annotations

```sql
-- All extracted data for a meeting
SELECT ad.name, ad.data_type, av.value, av.confidence_score
FROM annotation_values av
JOIN annotation_definitions ad ON ad.id = av.annotation_definition_id
WHERE av.engagement_id = '<ENGAGEMENT_ID>'
ORDER BY av.confidence_score DESC;
```

### User → Chats → Messages

```sql
-- A user's recent AI conversations
SELECT c.title, c.created_at,
  (SELECT count(*) FROM chat_messages cm WHERE cm.chat_id = c.id) as msg_count
FROM chats c
WHERE c.user_id = '<USER_ID>'
  AND c.deleted_at IS NULL
ORDER BY c.created_at DESC
LIMIT 10;
```

---

## PM Query Cookbook

### Product Usage & Adoption

```sql
-- Weekly active users (by workspace)
SELECT w.name, count(DISTINCT u.id) as active_users
FROM users u
JOIN workspaces w ON w.id = u.workspace_id
WHERE u.last_active_at > now() - interval '7 days'
  AND u.deleted_at IS NULL
GROUP BY w.name
ORDER BY active_users DESC;

-- Feature adoption: which annotation definitions are most popular?
SELECT ad.name, ad.category, ad.is_system,
  count(DISTINCT ad.workspace_id) as workspace_count,
  count(av.id) as total_extractions
FROM annotation_definitions ad
LEFT JOIN annotation_values av ON av.annotation_definition_id = ad.id
WHERE ad.deleted_at IS NULL
GROUP BY ad.name, ad.category, ad.is_system
ORDER BY workspace_count DESC
LIMIT 20;

-- Chat model usage distribution
SELECT ai_model, count(*) as chats
FROM chats
WHERE deleted_at IS NULL
  AND created_at > now() - interval '30 days'
GROUP BY ai_model
ORDER BY chats DESC;
```

### Data Source Trends

```sql
-- Engagement sources over time (weekly)
SELECT
  date_trunc('week', created_at) as week,
  data_source,
  count(*) as count
FROM engagements
WHERE created_at > now() - interval '90 days'
GROUP BY week, data_source
ORDER BY week DESC, count DESC;
```

### Integration Health

```sql
-- Integration push failures (last 7 days)
SELECT ic.type, ipe.status, count(*) as events
FROM integration_push_events ipe
JOIN integration_connections ic ON ic.id = ipe.integration_connection_id
WHERE ipe.created_at > now() - interval '7 days'
GROUP BY ic.type, ipe.status
ORDER BY events DESC;
```

### Customer Health

```sql
-- Workspaces with declining engagement (compare last 30 vs prior 30)
WITH recent AS (
  SELECT workspace_id, count(*) as recent_count
  FROM engagements
  WHERE created_at BETWEEN now() - interval '30 days' AND now()
  GROUP BY workspace_id
),
prior AS (
  SELECT workspace_id, count(*) as prior_count
  FROM engagements
  WHERE created_at BETWEEN now() - interval '60 days' AND now() - interval '30 days'
  GROUP BY workspace_id
)
SELECT w.name,
  COALESCE(r.recent_count, 0) as last_30_days,
  COALESCE(p.prior_count, 0) as prior_30_days,
  COALESCE(r.recent_count, 0) - COALESCE(p.prior_count, 0) as change
FROM workspaces w
LEFT JOIN recent r ON r.workspace_id = w.id
LEFT JOIN prior p ON p.workspace_id = w.id
WHERE w.deleted_at IS NULL
  AND COALESCE(p.prior_count, 0) > 10  -- only workspaces with meaningful volume
ORDER BY change ASC
LIMIT 20;
```

### Billing & Revenue

```sql
-- Workspace plan + seat + engagement overview
SELECT
  w.name,
  w.plan,
  w.allowed_seats,
  ps.status as subscription_status,
  (ps.base_price_cents + ps.seat_price_cents * ps.included_seats) / 100.0 as monthly_price,
  (SELECT count(*) FROM users u WHERE u.workspace_id = w.id AND u.deleted_at IS NULL AND u.role != 'INACTIVE') as active_users,
  (SELECT count(*) FROM engagements e WHERE e.workspace_id = w.id AND e.created_at > now() - interval '30 days') as recent_engagements
FROM workspaces w
LEFT JOIN payment_subscriptions ps ON ps.workspace_id = w.id AND ps.deleted_at IS NULL
WHERE w.deleted_at IS NULL
ORDER BY monthly_price DESC NULLS LAST
LIMIT 20;
```

---

## Views & System Tables

The database includes Google Cloud SQL advisor views (prefixed `google_db_advisor_*`) and PostgreSQL stat views. These are infrastructure-level and typically not needed for PM work:

- `google_db_advisor_recommended_indexes` — Index suggestions
- `google_db_advisor_workload_report` — Query performance stats
- `pg_stat_statements` — Query execution statistics
- `hypopg_list_indexes` — Hypothetical index testing

---

## Important Notes

1. **Read-only access** — You can only run SELECT queries. No data modification possible.

2. **Soft deletes** — Most tables use `deleted_at IS NULL` to indicate active records. Always include this filter unless you specifically want to see deleted data.

3. **ULID primary keys** — IDs are prefixed ULIDs (e.g., `eng_01H...`), not UUIDs. They sort chronologically.

4. **Workspace isolation** — Always filter by `workspace_id` when looking at customer-specific data to avoid cross-tenant data leakage in reports.

5. **JSONB columns** — Many tables use `jsonb` for flexible data (`configuration`, `citations`, `tool_calls`, etc.). Use PostgreSQL JSON operators: `->`, `->>`, `@>`, `?`.

6. **Large tables** — Engagements (5.6M), annotation_values (11.7M), chats (4.8M), and companies (3M) are large. Always use LIMIT and date filters to avoid slow queries.

7. **USER-DEFINED types** — Many columns use PostgreSQL enums. See the [Enum Reference](#enum-reference) for valid values.

8. **Timestamps** — All timestamps are `timestamp without time zone`, stored in UTC.

9. **Search indexes** — `engagements_search_index` and `companies_search_index` provide full-text search via `tsvector` columns.

10. **No schema changes** — The Drizzle ORM manages migrations. The `drizzle` schema contains migration tracking metadata.
