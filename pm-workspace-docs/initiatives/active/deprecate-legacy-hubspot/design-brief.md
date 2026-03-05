# Deprecate Deprecating the Pipe Dream - Design Brief

## Overview

We need UI and UX support for Composio-based integrations that preserves trust and reliability, with clear auth scope and workflow compatibility.

## Design Goals

- Make auth scope explicit (workspace vs user).
- Reduce confusion about “who did this?” by clarifying attribution.
- Surface integration parity and connection status.
- Provide fast recovery from auth failures.

## User Flows

### Flow: Integrations Settings (Admin)

1. Admin views Integration list.
2. Integration indicates Composio-backed vs Pipedream legacy.
3. Admin selects scope (workspace or user).
4. Admin connects with OAuth and sees success state.

### Flow: Workflow Execution (System)

1. Workflow run resolves scope.
2. Action executes with Composio tool.
3. UI shows success or failure with actionable next steps.

## UI Requirements

- Add a “scope” indicator wherever integration status is shown.
- Provide a “Composio-backed” badge or equivalent for migration visibility.
- Standardize connection states: Connected, Needs Reconnect, Missing Scope, Setup Required.

## Error States

- OAuth denied or timed out
- Scope mismatch (workflow requires workspace scope, user only connected)
- Vendor outage / tool unavailable

## Trust & Privacy UX

- Clear attribution labels: “AskElephant Bot (workspace)” vs “User account (personal)”
- Warning when a workspace workflow depends on a personal connection

## Open Questions

- Where should scope be configured: within Integrations settings, or within workflow configuration?
- Do we need a deprecation banner for legacy Pipedream integrations?
