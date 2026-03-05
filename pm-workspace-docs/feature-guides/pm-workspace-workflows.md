# PM Workspace Workflows

This guide highlights the best workflows enabled by the PM Workspace and how
commands, skills, and agents connect the system end-to-end.

---

## Workflow 1: Signal → Research → PRD

**Best for:** Discovery and problem definition

**Entry command:** `/ingest` or `/research [initiative]`

**Flow:**

1. Ingest signals (Slack, HubSpot, Linear, manual notes)
2. Synthesize research and identify problem framing
3. Convert to a PRD with outcome chains and guardrail checks

**Commands + outputs:**

- `/ingest [type]` → `pm-workspace-docs/signals/`
- `/research [initiative]` → `pm-workspace-docs/initiatives/[name]/research.md`
- `/pm [initiative]` → `pm-workspace-docs/initiatives/[name]/prd.md`

---

## Workflow 2: PRD → Prototype → Validation

**Best for:** Rapid build/validate loops

**Entry command:** `/proto [initiative]` (after PRD)

**Flow:**

1. Build multi-state prototype with required AI states
2. Capture notes in prototype docs
3. Validate with jury evaluation

**Commands + outputs:**

- `/proto [initiative]` → `elephant-ai/web/src/components/prototypes/`
- `/validate [initiative]` → `pm-workspace-docs/initiatives/[name]/jury-evaluations/`

---

## Workflow 3: Placement → Context Prototype

**Best for:** UI placement decisions and in-app integration

**Entry command:** `/placement [initiative]`

**Flow:**

1. Analyze existing UI to determine proper placement
2. Build a context-aware prototype with real navigation
3. Document placement rationale

**Commands + outputs:**

- `/placement [initiative]` → `pm-workspace-docs/initiatives/[name]/placement-research.md`
- `/context-proto [initiative]` → context stories in `prototypes/[initiative]/`

---

## Workflow 4: Status → Sync → Reporting

**Best for:** Weekly and daily operations

**Entry command:** `/status` or `/sync-dev`

**Flow:**

1. Check initiative status and artifact readiness
2. Sync across Notion, Linear, GitHub
3. Generate EOD/EOW reports and digests

**Commands + outputs:**

- `/status [initiative]` → in-console status summary
- `/sync-dev` → `pm-workspace-docs/status/`
- `/eod` and `/eow` → `pm-workspace-docs/status/activity/`

---

## Workflow 5: Signals → Synthesis → Hypothesis

**Best for:** Theme detection and initiative prioritization

**Entry command:** `/synthesize [topic]`

**Flow:**

1. Aggregate multiple signals into a theme
2. Translate into a testable hypothesis
3. Track hypothesis lifecycle

**Commands + outputs:**

- `/synthesize [topic]` → `pm-workspace-docs/research/synthesis/`
- `/hypothesis new [name]` → `pm-workspace-docs/hypotheses/active/`

---

## Workflow 6: Notion Administration

**Best for:** Projects, launch tracking, PRD sync, and audits

**Entry command:** `/notion-admin [mode]`

**Flow:**

1. Pull Notion project state
2. Update PRDs, launches, or audits
3. Sync changes back to workspace docs

**Commands + outputs:**

- `/notion-admin [mode]` → Notion updates + local artifacts
- `/sync-notion` → `pm-workspace-docs/status/`

---

## Workflow 7: Workflow Orchestration Engine

**Best for:** End-to-end initiative advancement with quality gates

**Entry command:** `/workflow [initiative]`

**Flow:**

1. Run stage-based workflow engine
2. Validate outputs via `work-judge`
3. Advance or loop based on verdict

**Commands + outputs:**

- `/workflow [initiative]` → `pm-workspace-docs/initiatives/[name]/state.json`
- `work-judge` → verdicts used by orchestrator

---

## Workflow 8: Team Visibility + Triage

**Best for:** Team coordination and inbox management

**Entry command:** `/team` or `/epd-triage`

**Flow:**

1. Pull team status from Linear
2. Triage EPD issues and recommend actions
3. Keep backlog ready and clean

**Commands + outputs:**

- `/team` → in-console status summary
- `/epd-triage` → triage report output

---

## Workflow Notes (Internal Guardrails)

- Apply strategic guardrails before PRD or prototype work
- Avoid external actions without explicit approval (workflow engine guardrail)
- Route customer signals to the proper initiative before building

---

## External Sharing Guidance

If you are sharing externally:

- Remove command syntax (replace with generic workflow steps)
- Remove internal tool names and paths
- Use the redaction checklist in
  `pm-workspace-docs/feature-guides/pm-workspace-redaction-checklist.md`
