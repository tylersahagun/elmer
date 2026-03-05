# PostHog Event Catalog

**Last Updated:** 2026-01-23  
**Project ID:** 81505

This document defines event naming conventions and serves as the canonical reference for PostHog instrumentation in AskElephant.

---

## Naming Convention

### Pattern

```
domain:entity:action
```

**Examples:**
- `chat:conversation:created`
- `workflow:run:started`
- `hubspot:contact:synced`
- `meeting:recording:completed`
- `onboarding:step:completed`

### Components

| Component | Description | Examples |
|-----------|-------------|----------|
| **Domain** | Product area or feature | `chat`, `workflow`, `hubspot`, `meeting`, `onboarding`, `mobile` |
| **Entity** | What is being acted on | `conversation`, `run`, `contact`, `recording`, `step`, `agent` |
| **Action** | What happened (past tense) | `created`, `started`, `completed`, `failed`, `enabled`, `viewed` |

### Guidelines

1. **Use past tense** for actions (`created` not `create`)
2. **Be specific** - `workflow:run:failed` not just `error`
3. **Include failure pairs** - every `started` should have `completed` and `failed`
4. **Consistent separators** - always use colons (`:`)
5. **Lowercase** - all lowercase with underscores only within component names

---

## Required Properties

Every event should include these properties when applicable:

| Property | Required | Type | Description |
|----------|----------|------|-------------|
| `workspaceId` | **Yes** | string | UUID for group analytics |
| `workspaceName` | **Yes** | string | Human-readable workspace name |
| `platform` | Recommended | string | `web`, `mobile`, `desktop`, `backend` |
| `feature_version` | Recommended | string | For A/B test context |

### Group Analytics

**Critical:** Include `$groups` for workspace-level analytics:

```typescript
posthog.capture('event:name', {
  workspaceId: currentWorkspaceId,
  workspaceName: currentWorkspaceName,
  // other properties
}, {
  $groups: { workspace: currentWorkspaceId }
});
```

---

## Event Categories

### Chat Events

| Event | Description | Status |
|-------|-------------|--------|
| `chat:conversation:created` | New chat conversation started | Needs workspace context |
| `chat:message:sent` | Message sent in conversation | Needs workspace context |
| `global_chat_opened` | Global chat panel opened | Needs workspace context |
| `clip_chat:message_submitted` | Message in clip chat | Tracked |

**Gap:** Chat events are missing workspace context. See [EPD-1329](https://linear.app/askelephant/issue/EPD-1329).

### Workflow Events

| Event | Description | Status |
|-------|-------------|--------|
| `workflows:run:started` | Workflow execution began | ✅ Well-tracked |
| `workflows:run:completed` | Workflow execution succeeded | ✅ Well-tracked |
| `workflows:run:failed` | Workflow execution failed | ✅ Well-tracked |
| `pipelines:run:started` | Pipeline run started | ✅ Tracked |
| `pipelines:run:completed` | Pipeline run completed | ✅ Tracked |
| `pipelines:run:failed` | Pipeline run failed | ✅ Tracked |

### Agent Events

| Event | Description | Status |
|-------|-------------|--------|
| `hubspot_agent:enabled` | HubSpot agent activated | ✅ Tracked |
| `hubspot_agent:toggled` | HubSpot agent toggle changed | ✅ Tracked |
| `salesforce_agent:enabled` | Salesforce agent activated | ✅ Tracked |
| `email_agent:enabled` | Email agent activated | ✅ Tracked |
| `asana_agent:enabled` | Asana agent activated | ✅ Tracked |

### Onboarding Events

| Event | Description | Status |
|-------|-------------|--------|
| `onboarding:step:viewed` | Onboarding step displayed | ✅ Tracked |
| `onboarding:step:completed` | Onboarding step finished | ✅ Tracked |
| `onboarding:step:skipped` | Onboarding step skipped | ✅ Tracked |
| `onboarding:flow:completed` | Full onboarding finished | ✅ Tracked |
| `onboarding:flow:abandoned` | User left onboarding | ✅ Tracked |
| `onboarding:carousel:navigated` | Carousel navigation | ✅ Tracked |
| `onboarding:calendar_connection:started` | Calendar connect began | ✅ Tracked |
| `onboarding:calendar_connection:completed` | Calendar connected | ✅ Tracked |
| `onboarding:app_download:clicked` | App download CTA clicked | ✅ Tracked |

### Recording Events

| Event | Description | Status |
|-------|-------------|--------|
| `audio_recording_started` | Recording began | ⚠️ Legacy naming |
| `audio_recording_upload_completed` | Upload finished | ⚠️ Legacy naming |
| `recall:bot_joining_call` | Bot joining meeting | ✅ Tracked |
| `recall:bot_done` | Bot finished recording | ✅ Tracked |
| `recall:bot_fatal` | Bot encountered fatal error | ✅ Tracked |
| `recall:bot_recording_permission_denied` | Recording permission denied | ✅ Tracked |

### Mobile Events

| Event | Description | Status |
|-------|-------------|--------|
| `mobile:local_recording:saved` | Local recording saved | ✅ Tracked |
| `mobile:upload_file:success` | File upload succeeded | ✅ Tracked |
| `mobile:posthog_logger:failed` | PostHog logging failed | ✅ Error event |
| `mobile:loading_meeting:failed` | Meeting load failed | ✅ Error event |
| `mobile:google_sign_in:error` | Google sign-in error | ✅ Error event |

### User Events

| Event | Description | Status |
|-------|-------------|--------|
| `users:create_user:created` | New user created | ✅ Tracked |
| `users:create_user:form_started` | User creation form opened | ✅ Tracked |
| `users:create_user:seat_type_changed` | Seat type changed | ✅ Tracked |
| `users:create_user:role_changed` | Role changed | ✅ Tracked |
| `users:create_user:transaction_failed` | User creation failed | ✅ Tracked |

### Property Events

| Event | Description | Status |
|-------|-------------|--------|
| `properties:created` | Property created | ✅ Tracked |
| `properties:updated` | Property updated | ✅ Tracked |
| `properties:deleted` | Property deleted | ✅ Tracked |
| `properties:columns_added_to_search` | Columns added to search | ✅ Tracked |
| `properties:property_page:viewed` | Property page viewed | ✅ Tracked |

---

## High-Value Events (Missing)

These events would significantly improve analytics but are not currently tracked:

| Event | Purpose | Priority |
|-------|---------|----------|
| `meeting:viewed` | Track engagement with meeting pages | High |
| `transcript:engaged` | Time spent reading transcripts | High |
| `search:performed` | Search usage and relevance | High |
| `insight:shared` | Measure sharing/collaboration | Medium |
| `value_realized` | Track "aha moment" achievement | Medium |
| `workspace:created` | New workspace creation | Medium |

---

## AI/LLM Events

PostHog automatically captures LLM events when instrumented:

| Event | Description |
|-------|-------------|
| `$ai_generation` | AI generation completed |
| `$ai_embedding` | Embedding created |
| `$ai_evaluation` | AI evaluation run |

**Required Properties for LLM Events:**

```typescript
{
  $ai_model: 'claude-3',
  $ai_input_tokens: 500,
  $ai_output_tokens: 200,
  workspaceId: currentWorkspaceId,  // Add for group analytics
  chat_type: 'meeting_question',    // Categorize question types
}
```

**Question Type Taxonomy:**

| Type | Description |
|------|-------------|
| `meeting_question` | Questions about specific meetings |
| `contact_lookup` | Questions about people/companies |
| `workflow_help` | Questions about automation |
| `general_chat` | General conversation |
| `action_request` | "Send email", "Update HubSpot" |

---

## Deprecated/Stale Events

These events haven't been seen recently and may be removed:

| Event | Last Seen | Notes |
|-------|-----------|-------|
| `pipelines:artifact_interacted_with` | Dec 2024 | Likely deprecated |
| `conversation_created` | June 2025 | Replaced by `chat:conversation:created`? |
| `settings.press` | Aug 2025 | Mobile navigation |
| `open_meeting.press` | Aug 2025 | Mobile navigation |

---

## Implementation Guide

### Adding a New Event

1. **Choose the name** following `domain:entity:action` pattern
2. **Add to this catalog** with description and properties
3. **Include workspace context** for group analytics
4. **Pair with failure event** if applicable
5. **Test in PostHog** that event appears correctly

### Example Implementation

```typescript
// Good: Full context, proper naming, group analytics
posthog.capture('feature:entity:action', {
  workspaceId: currentWorkspaceId,
  workspaceName: currentWorkspaceName,
  platform: 'web',
  // Feature-specific properties
  entity_id: entityId,
  action_type: 'specific_action',
}, {
  $groups: { workspace: currentWorkspaceId }
});

// Bad: Missing context, inconsistent naming
posthog.capture('entityAction', {
  id: entityId,
});
```

### Frontend (Web)

Use the analytics abstraction layer when possible:

```typescript
// Preferred: Uses analytics wrapper
analytics.track('feature:entity:action', { properties });

// Direct PostHog (when wrapper doesn't apply)
posthog.capture('feature:entity:action', { properties });
```

### Backend (Node.js)

```typescript
import { posthogClient } from '@/contexts/infra/post-hog/client';

posthogClient.capture({
  distinctId: userId,
  event: 'feature:entity:action',
  properties: {
    workspaceId,
    workspaceName,
    // other properties
  },
  groups: { workspace: workspaceId },
});
```

---

## Related Resources

- [PostHog Audit (Jan 2026)](../audits/posthog-audit-2026-01-23.md) - Current state analysis
- [PostHog Alerts Config](../status/posthog-alerts.md) - Alert configuration
- [PostHog Cohorts](../status/posthog-cohorts.md) - Cohort definitions

---

## Changelog

| Date | Change |
|------|--------|
| 2026-01-23 | Initial catalog created from audit findings |
