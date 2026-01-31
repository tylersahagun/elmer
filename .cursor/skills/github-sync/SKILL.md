---
name: github-sync
description: Sync GitHub data and write sync reports to repo paths.
---

# GitHub Sync

Pull repository metadata, recent commits, and PR status into a structured report.

## When to Use

- `/sync-github` or `/full-sync`
- Repo health checks

## Workflow

- Use `composio_execute` to call GitHub tools when available.
- Summarize what was synced and any errors.
- Write a sync report to `pm-workspace-docs/status/` using `write_repo_files`.

## Output

- `pm-workspace-docs/status/sync-github.md`
