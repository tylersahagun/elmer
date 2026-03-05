# Codex Automation Migration - 2026-02-08

## Scope

Migrate recurring PM workflows from manual command/skill usage into Codex automations, while keeping creative and high-judgment workflows as manual skills.

## Automated Now (Phase 1)

- morning-focus
- midday-triage
- daily-sync-summary
- eod-report
- eow-report
- team-status-digest
- signals-synthesis
- notion-hygiene-audit
- roadmap-health-check
- portfolio-health
- posthog-health-scan

## Kept As Manual Skills

- prd-writer
- research-analyst
- prototype-builder
- placement-analysis
- design-companion
- figma-component-sync
- jury-system
- remotion-video
- brainstorm
- hypothesis-manager
- notion-admin write modes (projects, launches, prd, flags, sync ops)
- workspace-admin destructive modes

## Mapping Rationale

### Automation candidates

Recurring, time-bounded, operational, and report-oriented workflows with low ambiguity and clear output contracts.

### Manual skill candidates

Creative, strategic, or write-heavy workflows where human judgment and iterative back-and-forth are core to quality.

## Configuration Changes Applied

- Standardized automation `cwds` to:
  - `/Users/tylersahagun/Source/pm-workspace`
- Standardized RRULE format to weekly schedules with explicit `BYDAY`, `BYHOUR`, `BYMINUTE`.
- Removed legacy `RRULE:` prefix from `morning-focus`.

## Next Migration Wave (Suggested)

1. Add a "sync-linear" daily automation at end-of-day.
2. Add a "sync-github" weekday automation before EOD.
3. Add an "availability-check" automation tied to launch windows.
4. Add automation prompts that explicitly reference reusable skill docs.
5. Add a parity check script to detect drift between `.cursor/skills` and `~/.codex/skills`.
