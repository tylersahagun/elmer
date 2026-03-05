# PostHog Event Mapping Inventory

**Generated:** 2026-01-24  
**Purpose:** Comprehensive mapping of all tracked events with workspace context assessment

---

## Executive Summary

| Metric                               | Count |
| ------------------------------------ | ----- |
| **Total Events Tracked**             | 100+  |
| **Events with Workspace Context**    | ~60%  |
| **Events Missing Workspace Context** | ~40%  |
| **Critical Gaps Identified**         | 5     |

### Critical Gaps (Block Company-Level Analysis)

| Event                            | Issue                           | Impact                                     | Priority |
| -------------------------------- | ------------------------------- | ------------------------------------------ | -------- |
| `hubspot_agent:enabled`          | Only has `chatId`, no workspace | Cannot track CRM adoption by company       | P1       |
| `salesforce_agent:enabled`       | Likely same issue               | Cannot track CRM adoption by company       | P1       |
| `mobile:*` events                | No workspace context            | Cannot attribute mobile usage to companies | P1       |
| `recall:bot_*`                   | No workspace context            | Cannot attribute bot health to companies   | P2       |
| `deepgram:transcription_created` | Has `engagement_id` only        | Requires join, not direct lookup           | P3       |

---

## Event Inventory by Category

### 1. Onboarding Events

| Event                                      | Platform | Has Workspace | Key Properties                                     | Business Question                      |
| ------------------------------------------ | -------- | ------------- | -------------------------------------------------- | -------------------------------------- |
| `onboarding:step_viewed`                   | Web      | Yes           | `step_index`, `step_name`, `workspace_id`          | Where do users drop off in onboarding? |
| `onboarding:step_completed`                | Web      | Yes           | `step_index`, `step_name`, `workspace_id`          | What's the completion rate per step?   |
| `onboarding:step_skipped`                  | Web      | Yes           | `step_index`, `step_name`, `workspace_id`          | Which steps do users skip?             |
| `onboarding:carousel_navigated`            | Web      | Yes           | `direction`, `from_step`, `to_step`                | How do users navigate onboarding?      |
| `onboarding:calendar_connection_started`   | Web      | Yes           | `integration_type`, `workspace_id`                 | Which calendar do users prefer?        |
| `onboarding:calendar_connection_completed` | Web      | Yes           | `integration_type`, `workspace_id`                 | Calendar connection success rate?      |
| `onboarding:app_download_clicked`          | Web      | Yes           | `platform`, `workspace_id`                         | Which platforms are popular?           |
| `onboarding:flow_completed`                | Web      | Yes           | `completed_steps`, `skipped_steps`, `workspace_id` | Overall onboarding completion?         |
| `onboarding:flow_abandoned`                | Web      | Yes           | `last_step`, `workspace_id`                        | Where do users abandon?                |

**Assessment:** Onboarding tracking is comprehensive with full workspace context.

---

### 2. Workflow Events

| Event                     | Platform | Has Workspace | Key Properties                               | Business Question                   |
| ------------------------- | -------- | ------------- | -------------------------------------------- | ----------------------------------- |
| `workflows:run_started`   | Backend  | Yes           | `workflowId`, `workspaceId`, `viewerId`      | How many workflows run per company? |
| `workflows:run_completed` | Backend  | Yes           | `workflowId`, `workspaceId`, `workflowRunId` | Workflow success rate?              |
| `workflows:run_failed`    | Backend  | Yes           | `workflowId`, `workspaceId`, `error`         | What causes workflow failures?      |
| `pipelines:run_started`   | Backend  | Yes           | Similar to workflows                         | Legacy pipeline tracking            |
| `pipelines:run_completed` | Backend  | Yes           | Similar to workflows                         | Legacy pipeline tracking            |
| `pipelines:run_failed`    | Backend  | Yes           | Similar to workflows                         | Legacy pipeline tracking            |

**Assessment:** Workflow tracking is excellent - full workspace context, success/failure states.

---

### 3. Agent Events

| Event                        | Platform | Has Workspace | Key Properties | Business Question            |
| ---------------------------- | -------- | ------------- | -------------- | ---------------------------- |
| `agents:run_started`         | Backend  | ?             | TBD            | Agent execution frequency?   |
| `hubspot_agent:enabled`      | Backend  | **NO**        | `chatId` only  | CRM adoption by company?     |
| `hubspot_agent:toggled`      | Backend  | **NO**        | TBD            | Agent configuration changes? |
| `salesforce_agent:enabled`   | Backend  | **NO**        | Likely same    | CRM adoption by company?     |
| `email_agent:enabled`        | Backend  | **NO**        | Likely same    | Email agent adoption?        |
| `email_agent:toggled`        | Backend  | **NO**        | TBD            | Agent configuration changes? |
| `asana_agent:enabled`        | Backend  | **NO**        | Likely same    | Integration adoption?        |
| `notion_agent:enabled`       | Backend  | **NO**        | Likely same    | Integration adoption?        |
| `google_drive_agent:enabled` | Backend  | **NO**        | Likely same    | Integration adoption?        |
| `monday_agent:enabled`       | Backend  | **NO**        | Likely same    | Integration adoption?        |
| `linear_agent:enabled`       | Backend  | **NO**        | Likely same    | Integration adoption?        |

**Assessment:** CRITICAL GAP - Agent events lack workspace context. Cannot measure integration adoption by company.

---

### 4. Chat Events

| Event                         | Platform | Has Workspace | Key Properties                                      | Business Question       |
| ----------------------------- | -------- | ------------- | --------------------------------------------------- | ----------------------- |
| `chat_created`                | Web      | Yes           | `source`, `chat_id`, `workspaceId`, `workspaceName` | Chat creation patterns? |
| `global_chat_opened`          | Web      | Yes           | `pathname`, `source`, `workspaceId`                 | Global chat adoption?   |
| `clip_chat:message_submitted` | Web      | Yes           | `clip_id`, `message_content`, `message_word_count`  | Clip chat usage?        |
| `conversation:message_sent`   | Backend  | ?             | TBD                                                 | Message volume?         |

**Assessment:** Web chat events have workspace context. Backend chat events need verification.

---

### 5. Recording Events (Desktop/Mobile)

| Event                              | Platform | Has Workspace | Key Properties             | Business Question        |
| ---------------------------------- | -------- | ------------- | -------------------------- | ------------------------ |
| `audio_recording_started`          | Desktop  | ?             | TBD                        | Desktop recording usage? |
| `audio_recording_upload_completed` | Desktop  | ?             | TBD                        | Upload success rate?     |
| `audio_recording_upload_started`   | Desktop  | ?             | TBD                        | Upload attempts?         |
| `audio_recording_permission_error` | Desktop  | ?             | TBD                        | Permission issues?       |
| `mobile:local_recording_saved`     | Mobile   | **NO**        | `message`, `severity` only | Mobile recording usage?  |
| `mobile:stop_recording_success`    | Mobile   | **NO**        | Similar                    | Recording completion?    |
| `mobile:stop_recording_failed`     | Mobile   | **NO**        | Similar                    | Recording failures?      |
| `mobile:upload_file_starting`      | Mobile   | **NO**        | Similar                    | Mobile uploads?          |
| `mobile:upload_file_success`       | Mobile   | **NO**        | Similar                    | Upload success?          |
| `mobile:upload_file_failed`        | Mobile   | **NO**        | Similar                    | Upload failures?         |

**Assessment:** CRITICAL GAP - Mobile events completely lack workspace context.

---

### 6. Notetaker Bot Events

| Event                                    | Platform | Has Workspace | Key Properties              | Business Question        |
| ---------------------------------------- | -------- | ------------- | --------------------------- | ------------------------ |
| `recall:bot_joining_call`                | Backend  | **NO**        | `bot_id` only               | Bot join rate?           |
| `recall:bot_done`                        | Backend  | **NO**        | `bot_id`, `code`, `message` | Bot completion rate?     |
| `recall:bot_recording_permission_denied` | Backend  | **NO**        | Similar                     | Permission denial rate?  |
| `recall:bot_fatal`                       | Backend  | **NO**        | Similar                     | Bot crash rate?          |
| `recall:bot_status_change`               | Backend  | **NO**        | Similar                     | Bot state transitions?   |
| `notetaker:bot_resend_clicked`           | Web      | Yes           | TBD                         | Manual resend frequency? |

**Assessment:** Bot events lack direct workspace context. Need to join via engagement.

---

### 7. Transcription Events

| Event                            | Platform | Has Workspace | Key Properties                            | Business Question           |
| -------------------------------- | -------- | ------------- | ----------------------------------------- | --------------------------- |
| `deepgram:transcription_created` | Backend  | **Indirect**  | `engagement_id`, `duration`, `model_info` | Transcription volume?       |
| `deepgram:transcription_failed`  | Backend  | **Indirect**  | Similar                                   | Transcription failure rate? |

**Assessment:** Has `engagement_id` for joining, but no direct workspace lookup.

---

### 8. User Management Events

| Event                                  | Platform | Has Workspace | Key Properties          | Business Question       |
| -------------------------------------- | -------- | ------------- | ----------------------- | ----------------------- |
| `users:create_user:created`            | Backend  | ?             | TBD                     | User growth?            |
| `users:create_user:form_started`       | Web      | Yes           | via standard properties | Form abandonment?       |
| `users:create_user:role_changed`       | Backend  | ?             | TBD                     | Role distribution?      |
| `users:create_user:seat_type_changed`  | Web      | Yes           | via standard properties | Seat type distribution? |
| `users:create_user:job_title_changed`  | Backend  | ?             | TBD                     | Job title distribution? |
| `users:create_user:transaction_failed` | Backend  | ?             | TBD                     | Transaction failures?   |
| `create_team_member:form_submit`       | Web      | Yes           | via standard properties | Team member additions?  |
| `auth:first_login`                     | ?        | ?             | TBD                     | New user activation?    |

**Assessment:** Mixed - web events have context, backend events need verification.

---

### 9. Page/Feature View Events

| Event                               | Platform | Has Workspace | Key Properties                         | Business Question         |
| ----------------------------------- | -------- | ------------- | -------------------------------------- | ------------------------- |
| `$pageview`                         | Web      | Yes           | `path`, `workspaceId`, `workspaceName` | Feature adoption?         |
| `$pageleave`                        | Web      | Yes           | Similar                                | Session patterns?         |
| `$feature_view`                     | Web      | Yes           | Feature flag context                   | Feature exposure?         |
| `$feature_interaction`              | Web      | Yes           | Feature flag context                   | Feature engagement?       |
| `action_item:viewed`                | Web      | Yes           | TBD                                    | Action item engagement?   |
| `properties:viewed_on_engagement`   | Web      | Yes           | TBD                                    | Properties feature usage? |
| `engagement:prepare_button_clicked` | Web      | Yes           | TBD                                    | Meeting prep usage?       |

**Assessment:** Good coverage with workspace context.

---

### 10. Error/Technical Events

| Event                         | Platform | Has Workspace | Key Properties    | Business Question   |
| ----------------------------- | -------- | ------------- | ----------------- | ------------------- |
| `$exception`                  | All      | Via user      | Exception details | Error patterns?     |
| `$rageclick`                  | Web      | Yes           | Element info      | UX friction points? |
| `slow_graphql_query`          | Web      | ?             | TBD               | Performance issues? |
| `legacy_route_failed`         | Web      | Yes           | TBD               | Routing issues?     |
| `thumbnail:generation_failed` | Web      | ?             | TBD               | Thumbnail failures? |
| `email_draft:open_failed`     | Web      | Yes           | TBD               | Email draft issues? |

**Assessment:** Error tracking exists but needs workspace context audit.

---

### 11. AI/LLM Events

| Event            | Platform | Has Workspace | Key Properties          | Business Question  |
| ---------------- | -------- | ------------- | ----------------------- | ------------------ |
| `$ai_generation` | All      | ?             | Model, tokens, duration | AI usage patterns? |
| `$ai_embedding`  | All      | ?             | Model, dimensions       | Embedding usage?   |
| `$ai_evaluation` | All      | ?             | Evaluation scores       | AI quality?        |

**Assessment:** PostHog built-in AI tracking. Workspace context needs verification.

---

## Codebase Event Definition Locations

### Web (`elephant-ai/web/`)

**Central Definition:** `web/src/lib/constants.ts`

```typescript
enum AnalyticsEvent {
  MESSAGE_SENT = "message_sent",
  CONVERSATION_CREATED = "conversation_created",
  CREATE_TEAM_MEMBER_FORM_STARTED = "users:create_user:form_started",
  CREATE_TEAM_MEMBER_SEAT_TYPE_CHANGED = "users:create_user:seat_type_changed",
  CLIP_CHAT_MESSAGE_SUBMITTED = "clip_chat:message_submitted",
  ONBOARDING_STEP_VIEWED = "onboarding:step_viewed",
  ONBOARDING_STEP_COMPLETED = "onboarding:step_completed",
  ONBOARDING_STEP_SKIPPED = "onboarding:step_skipped",
  ONBOARDING_CAROUSEL_NAVIGATED = "onboarding:carousel_navigated",
  ONBOARDING_CALENDAR_CONNECTION_STARTED = "onboarding:calendar_connection_started",
  ONBOARDING_CALENDAR_CONNECTION_COMPLETED = "onboarding:calendar_connection_completed",
  ONBOARDING_APP_DOWNLOAD_CLICKED = "onboarding:app_download_clicked",
  ONBOARDING_FLOW_COMPLETED = "onboarding:flow_completed",
  ONBOARDING_FLOW_ABANDONED = "onboarding:flow_abandoned",
}
```

**Direct Calls:** Additional events tracked via direct `posthog.capture()` calls:

- `chat_created`
- `global_chat_opened`
- `web_push_error`
- `thumbnail:*` events

### Backend (`elephant-ai/functions/`)

**Central Definition:** `functions/src/contexts/infra/analytics/constants.ts`

```typescript
enum AnalyticsEventName {
  // Deepgram
  DeepgramTranscriptionCreated = "deepgram:transcription_created",
  DeepgramTranscriptionFailed = "deepgram:transcription_failed",

  // Recall Bot
  RecallBotJoiningCall = "recall:bot_joining_call",
  RecallBotDone = "recall:bot_done",
  RecallBotRecordingPermissionDenied = "recall:bot_recording_permission_denied",
  RecallBotFatal = "recall:bot_fatal",
  RecallBotStatusChange = "recall:bot_status_change",

  // Workflows
  WorkflowRunStarted = "workflows:run_started",
  WorkflowRunCompleted = "workflows:run_completed",
  WorkflowRunFailed = "workflows:run_failed",

  // Agents
  AgentRunStarted = "agents:run_started",
  EmailAgentEnabled = "email_agent:enabled",
  HubspotAgentEnabled = "hubspot_agent:enabled",
  // ... etc
}
```

### Mobile (`elephant-ai/mobile/`)

**Pattern:** Uses `mobile:` prefix via logger transport
**Location:** `mobile/services/logger/transports.ts`
**Issue:** No centralized enum, events extracted from log messages

---

## Instrumentation Gap Analysis

### Questions That Cannot Be Answered

| Question                                         | Missing Data                           | Priority |
| ------------------------------------------------ | -------------------------------------- | -------- |
| "Which companies have enabled HubSpot agent?"    | Agent events lack workspace context    | P1       |
| "What's the mobile recording volume by company?" | Mobile events lack workspace context   | P1       |
| "What's the bot health score per company?"       | Bot events only have `bot_id`          | P2       |
| "How do IC reps vs managers use the product?"    | `user_role` inconsistent across events | P2       |
| "What's the search-to-result click-through?"     | No search events tracked               | P2       |
| "Which meetings have transcript engagement?"     | No `meeting:transcript:viewed` event   | P2       |
| "What % of automated chat outputs are viewed?"   | No `chat:response:viewed` event        | P3       |

### Required Instrumentation Fixes

#### Priority 1: Critical (Block Company Analytics)

| Fix                            | Event(s)                             | Properties to Add                 |
| ------------------------------ | ------------------------------------ | --------------------------------- |
| Add workspace to agent events  | `*_agent:enabled`, `*_agent:toggled` | `workspaceId`, `workspaceName`    |
| Add workspace to mobile events | All `mobile:*` events                | `workspaceId`, `workspaceName`    |
| Existing ticket                | EPD-1329                             | Chat events (already has context) |

#### Priority 2: High Value

| Fix                          | Event(s)                                         | Properties to Add                     |
| ---------------------------- | ------------------------------------------------ | ------------------------------------- |
| Add workspace to bot events  | `recall:bot_*`                                   | `workspaceId` (via engagement lookup) |
| Add user role consistently   | All events                                       | `user_role` standard property         |
| Create search events         | New: `search:performed`, `search:result_clicked` | Query, results count, clicked result  |
| Create transcript view event | New: `meeting:transcript:viewed`                 | `engagement_id`, `view_duration`      |

#### Priority 3: Nice to Have

| Fix                      | Event(s)                    | Purpose                           |
| ------------------------ | --------------------------- | --------------------------------- |
| Add chat response viewed | New: `chat:response:viewed` | Automation value attribution      |
| Standardize event naming | Various                     | Migrate to `domain:entity:action` |

---

## Event Naming Conventions

### Current Patterns (Inconsistent)

| Pattern                | Example                      | Count |
| ---------------------- | ---------------------------- | ----- |
| `domain:entity:action` | `workflows:run_completed`    | ~30%  |
| `domain_entity_action` | `audio_recording_started`    | ~20%  |
| `entity_action`        | `chat_created`               | ~15%  |
| `$builtin`             | `$pageview`, `$autocapture`  | ~25%  |
| `mobile:description`   | `mobile:upload_file_success` | ~10%  |

### Recommended Standard

All custom events should follow: `domain:entity:action`

| Current                   | Recommended                 |
| ------------------------- | --------------------------- |
| `audio_recording_started` | `recording:audio:started`   |
| `chat_created`            | `chat:conversation:created` |
| `global_chat_opened`      | `chat:global:opened`        |
| `slow_graphql_query`      | `performance:graphql:slow`  |

---

## Next Steps

1. **Create Linear tickets** for P1 instrumentation fixes
2. **Validate workspace context** on events marked with "?"
3. **Add missing high-value events** (search, transcript viewed)
4. **Run data warehouse discovery** to understand join capabilities
5. **Create standard cohorts** once instrumentation is complete

---

_Generated as part of PostHog Metrics Discovery initiative_
