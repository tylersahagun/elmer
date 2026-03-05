# Codex-Native Migration Baseline Snapshot

Date: 2026-02-07
Repo: /Users/tylersahagun/.codex/worktrees/edca/pm-workspace
Branch-at-capture: codex/feat-codex-native
Commit-at-capture: be50774

## Legacy Architecture Inventory

1. Commands: 54 files under `.cursor/commands/`
2. Subagents: 26 files under `.cursor/agents/`
3. Skills: 28 files under `.cursor/skills/*/SKILL.md`
4. Rules: 5 files under `.cursor/rules/`

## Heavy Legacy Artifacts (by line count)

Commands:
1. `.cursor/commands/full-sync.md` (498)
2. `.cursor/commands/posthog.md` (490)
3. `.cursor/commands/sync-dev.md` (365)

Subagents:
1. `.cursor/agents/posthog-analyst.md` (1518)
2. `.cursor/agents/signals-processor.md` (975)
3. `.cursor/agents/notion-admin.md` (756)

## Workflow Engine Inputs

- `pm-workspace-docs/workflows/workflow.yaml`
- `pm-workspace-docs/workflows/automation-policies.yaml`
- `pm-workspace-docs/workflows/metrics-gates.yaml`
- `pm-workspace-docs/workflows/workspace-config.yaml`

## MCP Baseline

Primary unified server:
- `pm-mcp-config` with Slack, Linear, Notion, HubSpot, PostHog toolkits.

Secondary dedicated server:
- `Figma`

Source audit:
- `pm-workspace-docs/audits/mcp-configuration-audit.md`

## Critical Operational Workflows to Preserve

1. Morning planning
2. Triage
3. End-of-day report
4. End-of-week report
5. Dev/system sync visibility

## Baseline Risks

1. Legacy docs strongly reference Cursor command/subagent model.
2. Workflow config paths include hard-coded `.cursor` locations.
3. Some historical files assume slash command entry points.

## Cutover Target

1. Codex-native config and prompt contracts are authoritative.
2. Legacy `.cursor` tree archived under `pm-workspace-docs/archive/cursor-architecture-2026-02-07/`.
3. Root operating docs no longer require legacy command/subagent handlers.
