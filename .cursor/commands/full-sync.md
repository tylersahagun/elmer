# Full Sync

Run all sync pipelines in sequence and summarize results.

**Delegates to**: workspace-admin

## Usage

- `/full-sync`

## Behavior

- Run `/sync`, `/sync-linear`, `/sync-notion`, and `/sync-github`.
- Summarize changes and risks.
- Write a consolidated report to `pm-workspace-docs/status/full-sync.md` using `write_repo_files`.
