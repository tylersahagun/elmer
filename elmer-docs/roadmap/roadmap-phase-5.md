# Roadmap Phase 5 — Full pm-workspace Parity (No Gaps)

## Outcome

100% functional parity with `pm-workspace` commands, artifacts, skills, and rules.

## Milestone Checklist

### Command parity completion

- Git workflow: `/save`, `/update`, `/branch`, `/share`, `/setup`
- Status/portfolio: `/status`, `/status-all`, `/roadmap`
- Growth/thinking: `/think`, `/teach`, `/reflect`, `/unstick`, `/collab`
- Digests/reports: `/eod`, `/eow`, `/visual-digest`, `/publish-digest`
- Design system/tools: `/design-system`, `/image`
- Design sync: `/figma-sync`, `/figjam`
- Admin/maintenance: `/maintain`, `/admin` (full behavior parity)
- Measurement: `/measure`, `/availability-check`
- Sync pipelines: `/sync`, `/sync-dev`, `/sync-notion`, `/sync-linear`, `/sync-github`, `/full-sync`

### Artifact parity completion

- `pm-workspace-docs/status/` outputs (activity reports, digests, sync reports)
- `pm-workspace-docs/roadmap/` outputs + snapshots
- `pm-workspace-docs/agents-docs/` AGENTS.md generation
- `pm-workspace-docs/hypotheses/` lifecycle + index updates
- `pm-workspace-docs/signals/_index.json` + synthesis reports

### Skills and subagent parity

- Implement missing skills (activity-reporter, portfolio-status, visual-digest, github-sync, linear-sync, notion-sync, design-companion, roadmap-analysis)
- Implement missing subagents (figma-sync, figjam-generator, slack-monitor, workspace-admin equivalents)
- Route all commands to appropriate skills/subagents with MCP tool wiring

### Rules parity

- Enforce `pm-foundation` style always-on behavior
- Strategic alignment checks before PM work
- Response conventions and file output guarantees

## Success Metrics

- 100% command coverage validated against pm-workspace.
- 100% artifact coverage validated against pm-workspace structure.
- Zero parity gaps in audit checklist.

## Completion Notes (2026-01-29)

- Added missing command definitions and routed `/status`, `/roadmap`, `/ingest`, `/synthesize` through agent execution.
- Created `pm-workspace-docs/` structure with status, roadmap, agents-docs, hypotheses, and signals index.
- Updated command outputs to write into `pm-workspace-docs` and added new sync/digest/design commands.
- Wired command delegation to skills/subagents in the agent executor and fixed local skills path resolution.
- Added `pm-foundation` always-on rule and ensured knowledge/signal sync defaults include `pm-workspace-docs`.
