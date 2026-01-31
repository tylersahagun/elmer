# Publish Digest

Prepare a shareable digest for stakeholders or Slack updates.

**Uses**: activity-reporter

## Usage

- `/publish-digest`

## Behavior

- Summarize highlights and decisions from the latest period.
- Format a shareable digest (include Slack-ready blocks when appropriate).
- Write output to `pm-workspace-docs/status/YYYY-MM-DD-published-digest.md` using `write_repo_files`.
