# Codex MCP Healthcheck Runbook

## Purpose

Validate codex-native MCP connectivity and degraded-mode behavior for PM workflows.

## Primary and Secondary Servers

Primary:
- `pm-mcp-config` (Slack, Linear, Notion, HubSpot, PostHog)

Secondary:
- `Figma`
- `product-os-memory` (shared memory service; local stub in MVP)

## Pre-checks

1. Confirm `.codex/config.toml` exists and declares both servers.
2. Confirm Codex session is opened from workspace root.

## Smoke Test Matrix

### Slack

1. List channels.
2. Fetch recent history for one known channel.

Pass criteria:
- Channel metadata and messages return without auth/tool errors.

### Linear

1. List projects.
2. Query issues for one active project/cycle.

Pass criteria:
- At least one query returns structured issue/project objects.

### Notion

1. Search a known page/database.
2. Query one target database.

Pass criteria:
- Structured records are returned with identifiers.

### HubSpot

1. Retrieve deals for a recent date range.
2. Retrieve owners for ID->name mapping.

Pass criteria:
- Deals and owners return with usable IDs and timestamps.

### PostHog

1. Retrieve at least one insight/dashboard object.
2. Retrieve insight details or cohort metadata.

Pass criteria:
- Insight metadata and at least one result set are returned.

### Figma

1. Confirm server connectivity.
2. Run one lightweight diagram/context operation.

Pass criteria:
- Tool call returns valid object/URL payload.

### Product OS Memory

1. Start local stub: `python3 packages/product-os-memory/server.py`
2. Verify tool list includes `memory.get_project_dossier` and `memory.get_measurement_readiness`.
3. Call one read and one write tool with stub payload.
4. Verify graph view response from `memory.get_graph_view` after running graph projection script.
5. Run graph audit script and confirm pass:
   - `python3 pm-workspace-docs/scripts/memory/validate_graph_projection.py`
6. Run MCP smoke suite and confirm pass:
   - `python3 pm-workspace-docs/scripts/memory/run_mcp_smoke_tests.py`

Pass criteria:
- Server responds on stdio with valid JSON-RPC envelopes.

## Degraded Mode Policy

If one toolkit fails:
1. Continue workflow with available toolkits.
2. Annotate exact missing source in output.
3. Include confidence downgrade and retry guidance.

If `pm-mcp-config` is fully unavailable:
1. Switch to dedicated MCP server for affected domain if configured.
2. If no fallback exists, produce report from local artifacts and mark external-data gap.

## Incident Log Template

Record failures at:
- `pm-workspace-docs/status/sync/mcp-incidents-YYYY-MM.md`

Template:
1. Date/time
2. Server/toolkit affected
3. Error signature
4. Workflow impact
5. Fallback used
6. Resolution status
