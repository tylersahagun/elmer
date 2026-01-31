---
name: linear-sync
description: Sync Linear issues and write sync reports to repo paths.
---

# Linear Sync

Pull Linear issues and write a summary of what was synced.

## When to Use

- `/sync-linear` or `/full-sync`
- Ticket ingestion requests

## Workflow

- Use `composio_execute` with Linear toolkits when connected.
- Summarize fetched issues and status.
- Write a sync report to `pm-workspace-docs/status/` using `write_repo_files`.

## Output

- `pm-workspace-docs/status/sync-linear.md`
