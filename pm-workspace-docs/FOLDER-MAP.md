# PM Workspace Docs — Folder Map by Document Type

This document maps each document type to its canonical location(s) within `pm-workspace-docs/`.

---

## Initiative Documents

| Document Type | Location | Notes |
|---------------|----------|-------|
| `_meta.json` | `initiatives/active/<name>/`<br>`initiatives/done/<name>/`<br>`initiatives/archived/<name>/` | Source of truth: phase, status, owner, dates, Linear/Notion links |
| `prd.md` | `initiatives/active/<name>/`<br>`initiatives/archived/<name>/`<br>`initiatives/done/<name>/` | Product requirements; E2E experience (5 steps) |
| `research.md` | `initiatives/active/<name>/`<br>`initiatives/archived/<name>/`<br>`initiatives/done/<name>/`<br>`initiatives/_template/research/` | User research, JTBD, user breakdown |
| `design-brief.md` | `initiatives/active/<name>/`<br>`initiatives/archived/<name>/` | Design brief |
| `engineering-spec.md` | `initiatives/active/<name>/`<br>`initiatives/archived/<name>/` | Engineering specification |
| `gtm-brief.md` | `initiatives/active/<name>/`<br>`initiatives/archived/<name>/` | Go-to-market: customer story, launch checklist |
| `decisions.md` | `initiatives/active/<name>/`<br>`initiatives/archived/<name>/`<br>`initiatives/done/<name>/` | Decision log (who/when/why) |
| `prototype-notes.md` | `initiatives/active/<name>/`<br>`initiatives/archived/<name>/` | Discovery/activation/day-2 flows, prototype docs |
| `METRICS.md` | `initiatives/active/<name>/` | Success metrics, data sources, baselines |

### Initiative Subfolders

| Subfolder | Purpose |
|-----------|---------|
| `jury-evaluations/` | Validation reports, build reports |
| `assets/` | Mockups, competitive screenshots |
| `iterations/` | Prototype iteration artifacts |
| `research/` | Deep-dive research (some initiatives) |
| `transcripts/` | Meeting or interview transcripts |
| `action-items/`, `daily-brief/`, `weekly-brief/`, `meeting-prep/`, `meeting-summary/` | Chief-of-staff sub-initiatives |

---

## Signals (Incoming Feedback)

| Document Type | Location | Naming / Format |
|---------------|----------|-----------------|
| Slack signals | `signals/slack/` | `YYYY-MM-DD-<channel>-<topic>.md` |
| Meeting transcripts | `signals/transcripts/` | `YYYY-MM-DD-<meeting>-<topic>.md` |
| Research signals | `signals/research/` | `YYYY-MM-DD-<topic>.md` |
| Release notes | `signals/releases/` | `YYYY-MM-DD-github-sync.md` |
| Memos | `signals/memos/` | `memo-<n>.md` |
| Inbox (pre-processed) | `signals/inbox/transcripts/`<br>`signals/inbox/memos/`<br>`signals/inbox/documents/`<br>`signals/inbox/issues/` | Raw intake before routing |
| Index | `signals/_index.json` | Index of ingested signals (linked to initiatives) |

---

## Status & Activity Reports

| Document Type | Location | Naming / Format |
|---------------|----------|-----------------|
| EOD reports | `status/activity/eod/` | `eod-YYYY-MM-DD.md` |
| EOW reports | `status/activity/eow/` | `eow-YYYY-MM-N.md` |
| Digests | `status/activity/digest/` | `digest-YYYY-MM-DD.md` or `digest-YYYY-Wnn.md` |
| Team member activity | `status/activity/<name>/` | `sam-eod-*.md`, `rob-*.md` |
| Product updates | `status/activity/product-updates/` | `product-update-YYYY-MM-DD.md` |
| Slack digests | `status/slack/digests/` | `slack-digest-YYYY-MM-DD-*.md` |
| Digest manifest | `status/activity/digest-manifest.json` | — |
| Activity history | `status/activity/activity-history.json` | — |
| Today / misc | `status/today.md`, `status/*.md` | Ad-hoc status docs |

---

## Company Context

| Document Type | Location |
|---------------|----------|
| Product vision | `company-context/product-vision.md` |
| Strategic guardrails | `company-context/strategic-guardrails.md` |
| Personas | `company-context/personas.md` |
| Tyler context | `company-context/tyler-context.md` |
| Org chart | `company-context/org-chart.md` |
| Tech stack | `company-context/tech-stack.md` |
| Integrations | `company-context/integrations.md` |
| Changelog | `company-context/CHANGELOG.md` |
| Prototype checklist | `company-context/prototype-alignment-checklist.md` |
| Storybook guide | `company-context/storybook-guide.md` |

---

## Roadmap

| Document Type | Location |
|---------------|----------|
| Roadmap (live) | `roadmap/roadmap.json` |
| Roadmap markdown | `roadmap/roadmap.md`, `roadmap/roadmap-kanban.md`, `roadmap/roadmap-gantt.md` |
| Snapshots | `roadmap/snapshots/` | `YYYY-MM-DD.json` (daily snapshots) |

---

## Hypotheses

| Document Type | Location |
|---------------|----------|
| Active hypotheses | `hypotheses/active/<name>.md` |
| Validated | `hypotheses/validated/<name>.md` |
| Committed | `hypotheses/committed/<name>.md` |
| Index | `hypotheses/_index.json` |
| Template | `hypotheses/_template.md` |

---

## Research (Standalone)

| Document Type | Location |
|---------------|----------|
| General research | `research/<topic>.md` |
| Brainstorms | `research/brainstorms/` |
| User interviews | `research/user-interviews/` |
| Synthesis | `research/synthesis/` |
| Instrumentation / feature-flag | `research/instrumentation/`, `research/feature-flag/` |
| Remotion | `research/remotion/` |

---

## Personas & Jury System

| Document Type | Location |
|---------------|----------|
| Jury system README | `personas/JURY-SYSTEM-README.md` |
| Persona schema | `personas/persona-schema.json` |
| Archetypes | `personas/archetypes/<role>.json` |
| Generated personas | `personas/generated/batch-YYYY-MM-DD/` |
| Notion-synced personas | `personas/Personas/Customer Personas/` |

---

## Templates

| Document Type | Location |
|---------------|----------|
| Notion page templates | `templates/notion-pages/` | `prd.md`, `design-brief.md`, `eng-spec.md`, `gtm-brief.md`, `research.md`, `marketing-brief.md`, `faq.md`, `launch-checklist.md` |
| Launch tier templates | `templates/notion-pages/tier-templates/` | `p1-major-launch.md`, `p2-significant-launch.md`, `p3-minor-launch.md`, `p4-internal-only.md` |
| Initiative template | `initiatives/_template/` | Full initiative structure |
| Linear project | `templates/linear-project-template.md` |

---

## Workflows & Runbooks

| Document Type | Location |
|---------------|----------|
| Workflow definition | `workflows/workflow.yaml` |
| Runbooks | `runbooks/` | `codex-automations-ops-cadence.md`, `codex-mcp-healthcheck.md` |

---

## Audits & Analysis

| Document Type | Location |
|---------------|----------|
| Audits | `audits/` | Slack, Notion, PostHog, Linear, MCP, projects, etc. |
| Analysis | `analysis/` | Migration baselines, architecture comparisons |
| Plans | `plans/` | Implementation plans, architecture memos |

---

## Feature Guides

| Document Type | Location |
|---------------|----------|
| Customer-facing | `feature-guides/global-chat.md`, `feature-guides/internal-search.md` |
| Internal | `feature-guides/internal-search-internal.md`, `feature-guides/global-chat-internal.md` |
| PM workspace | `feature-guides/pm-workspace-*.md` |

---

## Other Locations

| Folder | Purpose |
|-------|---------|
| `floating-docs/` | Ad-hoc docs, job-role notes, drafts |
| `agents-docs/` | Multi-agent architecture, synthetic user research guides |
| `personal/reflections/` | Personal reflection notes |
| `inbox/transcripts/` | Raw transcripts before processing |
| `maintenance/` | Workspace maintenance artifacts |
| `archive/` | Archived configs (e.g. cursor-architecture) |
| `scripts/` | Automation scripts (sync, migration, ingest) |
| `the-grand-apparatus/` | Mermaid diagrams, visuals |
| `guides/` | General guides |
| `profiles/` | Team member profiles |
| `scenarios/` | Scenario definitions |

---

## Quick Reference: Canonical Paths

```
pm-workspace-docs/
├── company-context/          # product-vision, strategic-guardrails, personas
├── initiatives/
│   ├── _template/            # Initiative template
│   ├── active/               # Active initiatives (≈ Notion Projects)
│   ├── done/                 # Completed initiatives
│   └── archived/             # Archived initiatives
├── research/                 # Standalone research archives
├── signals/                  # Incoming feedback (Slack, transcripts, memos)
├── status/                   # EOD, EOW, digests, activity
├── roadmap/                  # roadmap.json, snapshots, kanban/gantt views
├── hypotheses/               # active, validated, committed
├── personas/                 # Jury personas, archetypes
├── templates/                # Notion templates
├── runbooks/                 # Ops procedures
├── audits/                   # System audits
├── analysis/                 # Migration/architecture analysis
├── plans/                    # Implementation plans
├── feature-guides/           # Customer/internal feature docs
├── workflows/                # workflow.yaml
└── floating-docs/            # Ad-hoc drafts, job notes
```
