# Sync Dev Environment

Refresh local dev services, migrations, and environment health.

**Delegates to**: workspace-admin

## Usage

- `/sync-dev`

## Behavior

- Check Docker, database, and app services.
- Run pending migrations and report status.
- Write a sync summary to `pm-workspace-docs/status/sync-dev.md` using `write_repo_files`.
