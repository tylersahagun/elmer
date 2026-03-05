---
name: notion-admin
description: Operate Notion as product command center for projects, launches, PRDs, EOW syncs, and rollout tracking. Use for /notion-admin workflows.
---

# Notion Admin Skill

Procedural guidance for high-safety Notion administration in AskElephant's PM system.

## When to Use

- Running `/notion-admin [mode]`
- Running `/full-sync` when Notion write operations are required
- Auditing Notion project hygiene or launch readiness data

## MCP Servers

- `notion` (primary)
- `composio-config` (fallback where Notion toolkit is routed through Composio)

## Core Operations

- `audit`: orphaned rows, stale projects, missing links
- `projects`: normalize and update project metadata
- `launches`: maintain launch planning and rollout status
- `roadmap`: maintain Now/Next/Later mapping
- `prd [name]`: create or update PRD-linked records
- `eow [date]`: create weekly sync artifacts
- `flags [name]`: update feature-flag rollout tracking
- `sync-gtm`, `disconnect-design`, `disconnect-specs`, and targeted link/update/create/search operations

## Safety Rules

1. Never hard-delete. Archive or mark inactive instead.
2. Confirm before any bulk write pattern.
3. Fetch schema before mutating unknown properties.
4. Log every operation to a dated status file.
5. Preserve privacy when syncing research content.

## Output and Logging

- Audit and operation logs: `pm-workspace-docs/status/notion-admin-*.md`
- EOW artifacts: `pm-workspace-docs/status/eow-*.md`
- Notable changes as signals: `pm-workspace-docs/signals/notion/`

