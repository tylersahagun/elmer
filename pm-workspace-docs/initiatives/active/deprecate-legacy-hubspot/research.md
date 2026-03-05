# Research: Deprecate Deprecating the Pipe Dream

## Summary

This initiative deprecates Pipedream-backed integrations in favor of Composio, with a focus on parity, auth, and workflow support. Current Pipedream integrations include Monday, Linear, Notion, Google Drive, Confluence, and Sendoso; Composio's whitelist covers only a subset.

## Scope

- Identify parity gaps between Pipedream integrations and Composio toolkits.
- Document current auth + UI behaviors for integrations.
- Determine whether Composio can be used inside workflows (and what is missing).

## Parity Matrix (Pipedream -> Composio)

| Pipedream integration | IntegrationType | Composio toolkit | Status                  | Notes                                        |
| --------------------- | --------------- | ---------------- | ----------------------- | -------------------------------------------- |
| monday                | MONDAY          | -                | Missing                 | Not in Composio whitelist.                   |
| linear                | LINEAR          | linear           | Covered                 | Composio toolkit matches.                    |
| notion                | NOTION          | notion           | Covered                 | Composio toolkit matches.                    |
| google_drive          | GOOGLE_DRIVE    | googledrive      | Covered (name mismatch) | Composio uses `googledrive` (no underscore). |
| confluence            | CONFLUENCE      | -                | Missing                 | Not in Composio whitelist.                   |
| sendoso               | SENDOSO         | -                | Missing                 | Not in Composio whitelist.                   |

## Auth + UI Findings

- Pipedream integrations expose `connectionUrl` and use a popup OAuth flow in `web` settings (special handling via `isIntegrationFromPipedream`).
- Composio tools are initialized in chat via `createComposioMcpTools()` and `COMPOSIO_API_KEY`, gated by the `COMPOSIO_ENABLED` feature flag.
- Composio sessions are created per `externalUserId` (userId for real users); there is no integration settings UI for Composio connect/disconnect.
- No Composio integration connection records are stored in `integration_connections` yet; auth visibility is not surfaced in the settings page.

## Workflow Parity Findings

- Workspace integrations are filtered by `workflowsOnly`; workflow actions are validated in `validateWorkflowAction`.
- Pipedream tools are dynamically loaded for chat and can select workspace-level connections when workflow-initiated.
- Composio tools are only initialized when `isRealUserSendingMessage` is true; workflow-initiated chats do not get Composio tools.
- There is no Composio equivalent to `isIntegrationFromPipedream` or workflow action gating tied to Composio auth status.

## Gaps / Risks

- Missing Composio coverage for Monday, Confluence, and Sendoso.
- Auth scope for workflow-initiated Composio usage is undefined (workspace vs user).
- UI lacks Composio connection management or status visibility.

---

## Codebase Deprecation Inventory (2026-02-09)

Full analysis of Pipedream integration surface area in elephant-ai.

### Pipedream Core (`apps/functions/src/contexts/integrations/pipedream/`)

| File                       | Purpose                                                                                              | Impact     |
| -------------------------- | ---------------------------------------------------------------------------------------------------- | ---------- |
| `config.ts`                | `PIPEDREAM_INTEGRATIONS` array (6 integrations), slug-to-type mapping                                | **Remove** |
| `types.ts`                 | `PipedreamExternalAccountId`, slug enums                                                             | **Remove** |
| `utils.ts`                 | `getPipedreamClient()`, `getPipedreamAccessToken()`, `buildAuthenticatedMcpClient()`, agent prompts  | **Remove** |
| `tools.ts`                 | `fetchPipedreamIntegrationTools()` — loads MCP tools for chat, checks feature flags per integration  | **Remove** |
| `mcp-actions.ts`           | `buildMcpActionsForIntegration()`, `executeMcpTool()` — converts MCP tools to workflow actions       | **Remove** |
| `dynamic-action-loader.ts` | `resolveDynamicPipedreamAction()` — resolves Pipedream Connect actions for workflows                 | **Remove** |
| `feature-flags.ts`         | Per-integration flags (`isPipedreamSlugEnabled`, `shouldIncludePipedreamIntegration`)                | **Remove** |
| `index.ts`                 | `getConnectionUrlForPipedreamIntegration()`, `disconnectPipedreamIntegration()`, default definitions | **Remove** |

### Integration Definitions (`pipedream/integrations/`)

6 workspace-level + 6 user-level integration files + action files per integration:

- `monday.ts` / `monday-user.ts` + action files
- `linear.ts` / `linear-user.ts` + action files
- `notion.ts` / `notion-user.ts` + action files
- `google-drive.ts` / `google-drive-user.ts` + action files
- `confluence.ts` / `confluence-user.ts` + action files
- `sendoso.ts` / `sendoso-user.ts` + 18 action files

**Total: ~50+ files to remove.**

### Workflow System References

| File                                              | Reference                                             | What Changes                     |
| ------------------------------------------------- | ----------------------------------------------------- | -------------------------------- |
| `workflows.context.ts` (L37, 416, 546, 595, 1316) | Calls `resolveDynamicPipedreamAction()`               | Remove dynamic action fallback   |
| `workflows.functions.ts` (L17, 299)               | Imports `resolveDynamicPipedreamAction`               | Remove import + fallback         |
| `validation.ts` (L9, 128, 332)                    | Uses `resolveDynamicPipedreamAction` for state checks | Remove Pipedream validation path |
| `resolvers/WorkflowNode.ts` (L4, 11)              | Resolves Pipedream actions for GraphQL                | Remove resolver                  |

### Chat Tool Loading

| File                                 | Reference                           | What Changes                |
| ------------------------------------ | ----------------------------------- | --------------------------- |
| `chat-config.ts` (L431-443)          | Composio tool loading (replacement) | Keep — this is the new path |
| `evaluate-chat-tool-availability.ts` | Pipedream tool availability checks  | Remove Pipedream checks     |

### Agent Nodes

| File                                                  | Nodes                                            | What Changes            |
| ----------------------------------------------------- | ------------------------------------------------ | ----------------------- |
| `agents/agent-nodes/feature-agent-nodes/pipedream.ts` | `mondayAgent`, `linearAgent`, `googleDriveAgent` | **Remove**              |
| `agents/agent-nodes/feature-agent-nodes/notion.v1.ts` | Uses `notionMcpTools` from Pipedream             | **Migrate to Composio** |

### Integration Settings UI (`apps/web/`)

| File                                                               | Reference                                                         | What Changes            |
| ------------------------------------------------------------------ | ----------------------------------------------------------------- | ----------------------- |
| `components/integrations/utils.ts`                                 | `isIntegrationFromPipedream()` — hardcoded list of 6 slugs        | **Remove**              |
| `settings/integrations.tsx` (L36, 241, 272, 303, 363)              | Pipedream-specific connection UI, `refreshPipedreamConnectionUrl` | **Remove Pipedream UI** |
| `settings/components/personal-settings-tab.tsx` (L36, 62, 97, 167) | User-level Pipedream integration UI                               | **Remove**              |

### GraphQL / API

| File                                                  | Reference                                | What Changes |
| ----------------------------------------------------- | ---------------------------------------- | ------------ |
| `schema.graphql` (L149-162)                           | `refreshPipedreamConnectionUrl` mutation | **Remove**   |
| `resolvers/Mutation/refreshPipedreamConnectionUrl.ts` | Mutation resolver                        | **Remove**   |

### Webhook Handler

| File                                            | Reference                                               | What Changes      |
| ----------------------------------------------- | ------------------------------------------------------- | ----------------- |
| `integrations.functions.ts` (L144-207)          | `pipedreamWebhookHandler` — processes connection events | **Remove**        |
| `index.ts` (L1194)                              | `export const pipedreamWebhook` HTTP function           | **Remove export** |
| `firebase.json` / `firebase.dev.json` (L97-100) | Route `/api/v1/pipedream/webhook`                       | **Remove route**  |

### Feature Flags (12 Pipedream-specific)

| Flag                                        | Type     |
| ------------------------------------------- | -------- |
| `INTEGRATION_MONDAY_WORKFLOW_ENABLED`       | Workflow |
| `INTEGRATION_MONDAY_MCP_ENABLED`            | Chat     |
| `INTEGRATION_LINEAR_WORKFLOW_ENABLED`       | Workflow |
| `INTEGRATION_LINEAR_MCP_ENABLED`            | Chat     |
| `INTEGRATION_NOTION_WORKFLOW_ENABLED`       | Workflow |
| `INTEGRATION_NOTION_MCP_ENABLED`            | Chat     |
| `INTEGRATION_GOOGLE_DRIVE_WORKFLOW_ENABLED` | Workflow |
| `INTEGRATION_GOOGLE_DRIVE_MCP_ENABLED`      | Chat     |
| `INTEGRATION_CONFLUENCE_WORKFLOW_ENABLED`   | Workflow |
| `INTEGRATION_CONFLUENCE_MCP_ENABLED`        | Chat     |
| `INTEGRATION_SENDOSO_WORKFLOW_ENABLED`      | Workflow |
| `INTEGRATION_SENDOSO_MCP_ENABLED`           | Chat     |

### Database Impact

- **Table:** `integration_connections` — stores Pipedream connection records
- **Metadata:** `PipedreamIntegrationMetadata` interface with `accountId`, `accountExternalId`, `environment` fields
- **Migration needed:** Existing Pipedream rows need a deprecation/cleanup path

### Package Dependencies

- `@pipedream/sdk` (v2.0.0-rc.13) in `apps/web/package.json` — **Remove**
- Secrets: `pipedreamClientId`, `pipedreamClientSecret` in Cloud Functions — **Remove**

### HubSpot (NOT Pipedream-dependent)

HubSpot actions in `contexts/integrations/hubspot/actions.ts` and `contexts/crm/hubspot/mcp/` (20+ tool files) are **independent of Pipedream**. They use direct HubSpot API client and are gated by the `HUBSPOT_MCP` feature flag. No Pipedream deprecation impact.

---

## Recommended Deprecation Phases

### Phase 1: Prepare (No customer impact)

- Audit which customers have active Pipedream connections (query `integration_connections`)
- Map existing Pipedream workflows to Composio equivalents
- Add deprecation warnings in code (console.warn in Pipedream paths)

### Phase 2: Disable New Connections

- Remove Pipedream connection UI from settings (but keep existing connections working)
- Add migration banner: "This integration will be replaced by [Composio equivalent]"
- Disable `refreshPipedreamConnectionUrl` mutation

### Phase 3: Migrate Workflows

- For covered integrations (Linear, Notion, Google Drive): migrate workflow actions to Composio
- For missing integrations (Monday, Confluence, Sendoso): communicate deprecation timeline
- Provide dual-run period for high-risk workflows

### Phase 4: Remove Code

- Remove Pipedream core files (~50+ files)
- Remove webhook handler + Firebase route
- Remove feature flags (12 flags)
- Remove `@pipedream/sdk` dependency
- Remove agent nodes
- Clean up `integration_connections` table (mark Pipedream rows as deprecated)

### Phase 5: Cleanup

- Remove Pipedream secrets from Cloud Functions
- Archive Pipedream account
- Update documentation

---

## Open Questions

1. Should Composio support workspace-level auth for workflow runs (to mirror Pipedream behavior)?
2. Should Composio connection state be modeled in `integration_connections` and surfaced in the Integrations settings UI?
3. What is the migration path for existing Pipedream connections and metadata?
4. Do we need a dual-run period (Pipedream + Composio) for specific integrations?
5. How many customers have active Pipedream connections? (Requires DB query)
6. Are any customers actively using Monday, Confluence, or Sendoso integrations?

## Assumptions (to validate)

- Strategic pillar: **customer-trust**, since integration reliability and auth transparency are prerequisites for workflow adoption.
- Primary persona: **RevOps**, as they configure workflows and integration automations.

## Source Files

### Pipedream Core

- [`apps/functions/src/contexts/integrations/pipedream/config.ts`](../../../elephant-ai/apps/functions/src/contexts/integrations/pipedream/config.ts)
- [`apps/functions/src/contexts/integrations/pipedream/types.ts`](../../../elephant-ai/apps/functions/src/contexts/integrations/pipedream/types.ts)
- [`apps/functions/src/contexts/integrations/pipedream/utils.ts`](../../../elephant-ai/apps/functions/src/contexts/integrations/pipedream/utils.ts)
- [`apps/functions/src/contexts/integrations/pipedream/tools.ts`](../../../elephant-ai/apps/functions/src/contexts/integrations/pipedream/tools.ts)
- [`apps/functions/src/contexts/integrations/pipedream/mcp-actions.ts`](../../../elephant-ai/apps/functions/src/contexts/integrations/pipedream/mcp-actions.ts)
- [`apps/functions/src/contexts/integrations/pipedream/dynamic-action-loader.ts`](../../../elephant-ai/apps/functions/src/contexts/integrations/pipedream/dynamic-action-loader.ts)
- [`apps/functions/src/contexts/integrations/pipedream/feature-flags.ts`](../../../elephant-ai/apps/functions/src/contexts/integrations/pipedream/feature-flags.ts)
- [`apps/functions/src/contexts/integrations/pipedream/index.ts`](../../../elephant-ai/apps/functions/src/contexts/integrations/pipedream/index.ts)
- [`apps/functions/src/contexts/integrations/pipedream/integrations/`](../../../elephant-ai/apps/functions/src/contexts/integrations/pipedream/integrations/)

### Composio (Replacement)

- [`apps/functions/src/contexts/integrations/composio/composio-mcp.ts`](../../../elephant-ai/apps/functions/src/contexts/integrations/composio/composio-mcp.ts)

### Workflow System

- [`apps/functions/src/contexts/workflows/workflows.context.ts`](../../../elephant-ai/apps/functions/src/contexts/workflows/workflows.context.ts)
- [`apps/functions/src/contexts/workflows/workflows.functions.ts`](../../../elephant-ai/apps/functions/src/contexts/workflows/workflows.functions.ts)
- [`apps/functions/src/contexts/workflows/validation.ts`](../../../elephant-ai/apps/functions/src/contexts/workflows/validation.ts)

### Chat System

- [`apps/functions/src/contexts/chats/chat-config.ts`](../../../elephant-ai/apps/functions/src/contexts/chats/chat-config.ts)
- [`apps/functions/src/contexts/chats/evaluate-chat-tool-availability.ts`](../../../elephant-ai/apps/functions/src/contexts/chats/evaluate-chat-tool-availability.ts)

### Agent Nodes

- [`apps/functions/src/contexts/llm/agents/agent-nodes/feature-agent-nodes/pipedream.ts`](../../../elephant-ai/apps/functions/src/contexts/llm/agents/agent-nodes/feature-agent-nodes/pipedream.ts)
- [`apps/functions/src/contexts/llm/agents/agent-nodes/feature-agent-nodes/notion.v1.ts`](../../../elephant-ai/apps/functions/src/contexts/llm/agents/agent-nodes/feature-agent-nodes/notion.v1.ts)

### UI

- [`apps/web/src/components/integrations/utils.ts`](../../../elephant-ai/apps/web/src/components/integrations/utils.ts)
- [`apps/web/src/routes/workspaces/$workspaceId/settings/integrations.tsx`](../../../elephant-ai/apps/web/src/routes/workspaces/$workspaceId/settings/integrations.tsx)
- [`apps/web/src/routes/workspaces/$workspaceId/settings/components/personal-settings-tab.tsx`](../../../elephant-ai/apps/web/src/routes/workspaces/$workspaceId/settings/components/personal-settings-tab.tsx)

### Infrastructure

- [`apps/functions/src/contexts/integrations/integrations.functions.ts`](../../../elephant-ai/apps/functions/src/contexts/integrations/integrations.functions.ts) (webhook handler)
- [`apps/functions/src/index.ts`](../../../elephant-ai/apps/functions/src/index.ts) (function export)
- [`firebase.json`](../../../elephant-ai/firebase.json) (route)
- [`apps/functions/src/contexts/infra/feature-flags/constants.ts`](../../../elephant-ai/apps/functions/src/contexts/infra/feature-flags/constants.ts)
- [`apps/functions/src/db/schema.ts`](../../../elephant-ai/apps/functions/src/db/schema.ts) (`integration_connections` table)
- [`apps/functions/src/contexts/integration-connections/schema.model.ts`](../../../elephant-ai/apps/functions/src/contexts/integration-connections/schema.model.ts) (Pipedream metadata)
