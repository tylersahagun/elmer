---
name: notion-sync
description: Sync Notion docs and write sync reports to repo paths.
---

# Notion Sync

Pull Notion pages and capture a status report.

## When to Use

- `/sync-notion` or `/full-sync`
- Documentation import requests

## Workflow

- Use `composio_execute` with Notion toolkits when connected.
- Summarize fetched pages and errors.
- Write a sync report to `pm-workspace-docs/status/` using `write_repo_files`.

## Output

- `pm-workspace-docs/status/sync-notion.md`
