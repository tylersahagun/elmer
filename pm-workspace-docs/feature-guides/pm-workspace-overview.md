# PM Workspace Overview

This guide explains how the PM Workspace operates, what it enables, and how the
system is structured (rules, skills, agents, and commands).

---

## What This Workspace Is

The PM Workspace is an outcome-driven product operations system for AskElephant.
It connects research, planning, prototyping, validation, and reporting into one
repeatable workflow with clear guardrails.

**Core principles (short form):**

- Outcomes over outputs
- Human-centered AI (orchestration, not replacement)
- Trust and privacy first
- Consistency before speed

---

## Who It Is For

- PMs who need reliable, repeatable product workflows
- Engineering and Design partners who need shared context and artifacts
- Cross-functional stakeholders who want visibility into status and decisions

---

## What It Enables

- Turn signals and research into PRDs, prototypes, and validation quickly
- Keep artifacts organized by initiative phase
- Sync status across Linear, Notion, GitHub, Slack, and PostHog
- Generate repeatable reports (EOD/EOW), roadmaps, and digests
- Teach others a consistent product operating model

---

## How The System Works

The workspace is built on four layers that load in order:

1. **Rules**: Always-on context and file-specific behavior
2. **Skills**: Procedural recipes (how to do a thing well)
3. **Agents**: Subagents for complex workflows
4. **Commands**: Simple entry points that route to skills and agents

**Context flow (simplified):**

```
User request
  -> Rules (always-on + file scoped)
  -> Skills (when relevant)
  -> Agents (when complex)
  -> Commands (as the main interface)
  -> Artifacts saved to pm-workspace-docs/
```

---

## System Inventory

### Rules

| Rule               | Path                                   | Purpose                              |
| ------------------ | -------------------------------------- | ------------------------------------ |
| pm-foundation      | `.cursor/rules/pm-foundation.mdc`      | Core PM copilot behavior and routing |
| component-patterns | `.cursor/rules/component-patterns.mdc` | UI component organization guidance   |
| cursor-admin       | `.cursor/rules/cursor-admin.mdc`       | Workspace administration guardrails  |
| growth-companion   | `.cursor/rules/growth-companion.mdc`   | Reflection and resilience support    |
| remotion-video     | `.cursor/rules/remotion-video.mdc`     | PMM video guidance                   |

### Skills

| Skill                  | Primary Use                        |
| ---------------------- | ---------------------------------- |
| activity-reporter      | End-of-day/week reports            |
| agents-generator       | Generate AGENTS.md documentation   |
| brainstorm             | Structured ideation                |
| daily-planner          | Daily focus and calendar blocks    |
| design-companion       | Human-centered design review       |
| digest-website         | Publish shareable digest site      |
| feature-availability   | Feature flag visibility checks     |
| github-sync            | GitHub PR and release sync         |
| initiative-status      | Initiative health checks           |
| jury-system            | Persona-based validation           |
| linear-sync            | Linear project and cycle sync      |
| notion-admin           | Notion workspace operations        |
| notion-sync            | Notion project sync                |
| placement-analysis     | Component placement research       |
| portfolio-status       | Full portfolio health              |
| prd-writer             | PRD creation                       |
| prototype-builder      | Storybook prototype creation       |
| prototype-notification | Slack DM after prototype           |
| remotion-video         | PMM video creation                 |
| research-analyst       | Research synthesis                 |
| roadmap-analysis       | Roadmap review                     |
| signal-routing         | Signal classification (L1-L4)      |
| signals-synthesis      | Cross-signal pattern analysis      |
| slack-block-kit        | Slack message formatting           |
| slack-sync             | Slack activity sync                |
| team-dashboard         | Team status from Linear            |
| visual-digest          | Visual digest generation           |
| workflow-engine        | Stage-based workflow orchestration |

### Subagents

| Subagent              | Command(s)                 | Purpose                           |
| --------------------- | -------------------------- | --------------------------------- |
| context-proto-builder | /context-proto, /placement | Placement + context prototypes    |
| context-reviewer      | /context-review            | Promote signal context into canon |
| docs-generator        | /agents                    | Generate AGENTS.md                |
| feature-guide         | /feature-guide             | Customer-facing feature guides    |
| figjam-generator      | /figjam                    | Mermaid-to-FigJam diagrams        |
| figma-sync            | /figma-sync                | Figma to Storybook scaffolds      |
| goal-planner          | (internal)                 | Stage-aware task plans            |
| hubspot-activity      | (internal)                 | HubSpot activity for EOD/EOW      |
| hypothesis-manager    | /hypothesis                | Hypothesis lifecycle              |
| initiative-runner     | /workflow                  | Orchestrate initiative stages     |
| iterator              | /iterate                   | Prototype iteration               |
| linear-triage         | /epd-triage                | Product team triage               |
| notion-admin          | /notion-admin              | Notion administration             |
| orchestrator          | /workflow                  | Workflow engine                   |
| posthog-analyst       | /posthog                   | Analytics lifecycle               |
| proto-builder         | /proto, /lofi-proto        | Storybook prototype               |
| remotion-video        | /pmm-video                 | PMM video creation                |
| research-analyzer     | /research                  | Research analysis                 |
| ship-runner           | (internal)                 | Build tickets + ship artifacts    |
| signal-ingester       | (internal)                 | Ingest to inbox                   |
| signal-router         | (internal)                 | Route signals to workflows        |
| signals-processor     | /ingest, /synthesize       | Signal processing                 |
| slack-monitor         | /slack-monitor             | Slack digest + response recs      |
| validator             | /validate                  | Jury evaluation                   |
| work-judge            | (internal)                 | Stage quality gate                |
| workspace-admin       | /admin, /maintain          | Workspace maintenance             |

### Commands (Entry Points)

**Auto-execute (low risk):**

`/save`, `/update`, `/status`, `/status-all`, `/help`, `/roadmap`,
`/sync-linear`, `/sync-github`, `/sync-notion`, `/sync-dev`, `/full-sync`,
`/sync`, `/eod`, `/eow`, `/visual-digest`, `/publish-digest`,
`/design-system`, `/image`, `/morning`, `/team`, `/triage`, `/block`

**Confirm-first (complex workflows):**

`/research`, `/pm`, `/proto`, `/lofi-proto`, `/context-proto`, `/placement`,
`/validate`, `/iterate`, `/design`, `/design-handoff`, `/new-initiative`,
`/merge-initiative`, `/share`, `/setup`, `/figma-sync`, `/figjam`, `/agents`,
`/hypothesis`, `/ingest`, `/synthesize`, `/brainstorm-board`, `/collab`,
`/posthog`, `/maintain`, `/admin`, `/slack-monitor`, `/availability-check`,
`/notion-admin`, `/pmm-video`, `/feature-guide`, `/workflow`,
`/context-review`, `/epd-triage`, `/posthog-sql`

---

## File System Map (Where Things Live)

| Content         | Location                                     |
| --------------- | -------------------------------------------- |
| Company context | `pm-workspace-docs/company-context/`         |
| Initiatives     | `pm-workspace-docs/initiatives/[name]/`      |
| Research        | `pm-workspace-docs/research/`                |
| Signals         | `pm-workspace-docs/signals/`                 |
| Status reports  | `pm-workspace-docs/status/`                  |
| Roadmap         | `pm-workspace-docs/roadmap/`                 |
| Prototypes      | `elephant-ai/web/src/components/prototypes/` |

---

## External Sharing

If you are preparing a public-facing version, use the external guide and apply
the redaction checklist.

- External guide: `pm-workspace-docs/feature-guides/pm-workspace-external.md`
- Redaction checklist:
  `pm-workspace-docs/feature-guides/pm-workspace-redaction-checklist.md`

---

## Where To Go Next

- See the workflow playbooks in
  `pm-workspace-docs/feature-guides/pm-workspace-workflows.md`
- Use the teaching guide and onboarding exercises in
  `pm-workspace-docs/feature-guides/pm-workspace-teaching-guide.md`
