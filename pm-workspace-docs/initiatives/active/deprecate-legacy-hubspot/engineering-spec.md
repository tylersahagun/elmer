# Deprecate Deprecating the Pipe Dream - Engineering Spec

## Summary

Replace Pipedream-backed integrations with Composio where possible, define auth scope for workflows, and surface integration state in UI.

## Current State

- Pipedream integrations are registered under `functions/src/contexts/integrations/pipedream/`.
- Composio toolkits are whitelisted in `functions/src/contexts/integrations/composio/composio-mcp.ts`.
- Composio tools are enabled only for real-user chats; workflow-initiated chats do not get Composio tools.

## Proposed Approach

1. **Parity Coverage**
   - Map Pipedream integrations to Composio toolkits.
   - Track missing coverage (Monday, Confluence, Sendoso).

2. **Auth Scope Model**
   - Define workspace vs user auth rules for Composio.
   - Decide whether to persist Composio auth in `integration_connections`.

3. **Workflow Compatibility**
   - Allow Composio tools to be available for workflow-initiated chats.
   - Enforce scope validation before tool execution.

## Data Model

Option A (Preferred):

- Add Composio connection records to `integration_connections` with scope metadata.
- Store provider metadata (composio session id, toolkit, scope).

Option B:

- Keep Composio session-only (no DB), infer via tool availability.

## API/Service Changes

- Extend integration data source to surface Composio connection state.
- Add validation gate for Composio tools in workflows (similar to existing `validateWorkflowAction` checks).

## Risks

- Migration could break existing workflows if auth scope is not explicit.
- Missing parity for Monday/Confluence/Sendoso may require fallback or deprecation plan.

## Open Questions

- Should we require workspace-level auth for workflow runs by default?
- Is a dual-run period necessary for high-risk integrations?
