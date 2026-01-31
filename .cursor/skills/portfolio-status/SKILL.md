---
name: portfolio-status
description: Summarize portfolio status across projects and stages.
---

# Portfolio Status

Provide a workspace-wide portfolio snapshot with stage distribution and key risks.

## When to Use

- `/status-all` or `/status` requests
- Portfolio health reviews
- Executive updates

## Workflow

- Count projects by stage and status.
- Highlight stalled stages, blockers, and risk signals.
- Write a status snapshot to `pm-workspace-docs/status/` using `write_repo_files`.

## Output

- `pm-workspace-docs/status/portfolio-status.md`
