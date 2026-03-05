# HubSpot CRM Agent Usage Analytics (Workspace-Level)

## Purpose

Define analytics needed to measure how long it takes a workspace to:

1. Connect HubSpot
2. Run its first workflow that updates HubSpot properties
3. Reach a 14-day "stable" workflow period (no edits)
4. Use the HubSpot tool in chat for the first time

Workspace is defined by `workspaceId` (PostHog group).

---

## Current State (What We Can and Cannot Answer Today)

### Events observed in PostHog (last 90 days)

- `hubspot_agent:enabled`
- `hubspot_agent:toggled`
- `agents:hubspot:output_viewed`
- `workflows:run_started`
- `workflows:run_completed`
- `workflows:run_failed`
- `chat_created`
- `global_chat_opened`
- `clip_chat:message_submitted`

### Gaps blocking analysis

- No integration connection event.
- No "HubSpot property update" event.
- No workflow edit/update event.
- No "chat tool invoked" event for HubSpot tool usage.
- Web chat events appear to be missing workspace group context.

**Conclusion:** The time-to-value questions cannot be answered reliably today.

---

## Required Instrumentation (Proposed)

### A) Integration connection

**Event:** `integration:connected`  
**When:** HubSpot OAuth / Pipedream connection success  
**Properties:**

- `workspace_id`
- `integration_type` (e.g., `hubspot`)
- `connection_scope` (`workspace` | `user`)
- `integration_connection_id`
- `user_id` (if user scoped)
- `event_source` (`pipedream` | `oauth` | `admin`)

### B) HubSpot property updates (workflow outcome)

**Events:**

- `hubspot:property_update:attempted`
- `hubspot:property_update:completed`
- `hubspot:property_update:failed`

**When:** CRM push event executes and returns  
**Properties:**

- `workspace_id`
- `workflowId`
- `workflowRunId`
- `integration_connection_id`
- `object_type`
- `object_id`
- `property_name`
- `update_method` (`APPEND` | `REPLACE`)
- `status` (`success` | `failed`)
- `source` (`workflow` | `chat`)
- `push_event_id`

### C) Workflow edits (stability)

**Events:**

- `workflow:updated`
- `workflow:node_updated`

**When:** Any workflow mutation in UI or API  
**Properties:**

- `workspace_id`
- `workflowId`
- `editor_id`
- `edited_fields` (array)
- `change_source` (`ui` | `api` | `workflow_assistant`)

### D) Chat tool invocation (HubSpot tool usage)

**Events:**

- `chat:tool_invoked`
- `chat:tool_succeeded`
- `chat:tool_failed`

**When:** Tool executes in chat  
**Properties:**

- `workspace_id`
- `chat_id`
- `tool_name` (e.g., `HUBSPOT_MCP`)
- `tool_call_id`
- `invocation_source` (`user_chat` | `workflow_chat`)
- `is_workflow_context`
- `duration_ms` (optional)

### E) Ensure workspace group context for chat events

Ensure `chat_created`, `global_chat_opened`, and `clip_chat:message_submitted` include:

- `$groups: { workspaceId: <id> }`
- `workspace_id` property

---

## Recommended Insights (PostHog)

### Q1) HubSpot connected → first HubSpot property update

**Insight type:** Funnel (group by `workspaceId`)  
**Steps:**

1. `integration:connected` where `integration_type = 'hubspot'`
2. `hubspot:property_update:completed`

**HogQL (time to first update):**

```sql
WITH
  conn AS (
    SELECT
      group_id,
      min(timestamp) AS connected_at
    FROM events
    WHERE event = 'integration:connected'
      AND properties.integration_type = 'hubspot'
    GROUP BY group_id
  ),
  upd AS (
    SELECT
      group_id,
      min(timestamp) AS first_update_at
    FROM events
    WHERE event = 'hubspot:property_update:completed'
    GROUP BY group_id
  )
SELECT
  conn.group_id AS workspace_id,
  first_update_at - connected_at AS seconds_to_first_update
FROM conn
JOIN upd ON conn.group_id = upd.group_id;
```

### Q2) Time to 14-day stable workflow (no edits)

**Insight type:** HogQL

```sql
WITH edits AS (
  SELECT
    properties.workflowId AS workflow_id,
    min(timestamp) AS created_at,
    max(timestamp) AS last_edit_at
  FROM events
  WHERE event IN ('workflow:created', 'workflow:updated', 'workflow:node_updated')
  GROUP BY workflow_id
),
stable AS (
  SELECT
    workflow_id,
    last_edit_at + INTERVAL 14 DAY AS stable_at
  FROM edits
)
SELECT
  workflow_id,
  stable_at - created_at AS seconds_to_stable
FROM edits
JOIN stable USING (workflow_id);
```

### Q3) HubSpot connected → first HubSpot tool usage in chat

**Insight type:** Funnel  
**Steps:**

1. `integration:connected` where `integration_type = 'hubspot'`
2. `chat:tool_invoked` where `tool_name = 'HUBSPOT_MCP'`

### Q4) First HubSpot connection date per workspace

**Insight type:** HogQL table

```sql
SELECT
  group_id AS workspace_id,
  min(timestamp) AS first_integration_connected_at
FROM events
WHERE event = 'integration:connected'
  AND properties.integration_type = 'hubspot'
GROUP BY workspace_id;
```

---

## Dashboards / Placement

**Recommended placement:**

- Add Q1 + Q3 insights to the CRM Agent or HubSpot dashboard.
- Add Q2 to Workflow Health dashboard.

---

## Next Steps

1. Implement the missing instrumentation (A–E).
2. Backfill if possible (e.g., integration connection timestamps from DB).
3. Create the four insights above once events are in production.
