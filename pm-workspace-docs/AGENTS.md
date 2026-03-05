# PM Workspace Docs

This directory stores PM artifacts for AskElephant.

## Directory Structure

```
pm-workspace-docs/
├── company-context/      # Product vision, guardrails, personas, org chart
├── initiatives/
│   ├── _template/        # Initiative template
│   ├── active/           # 1:1 mapped with Notion Projects DB
│   │   └── [name]/
│   │       ├── _meta.json
│   │       ├── research.md
│   │       ├── prd.md
│   │       ├── design-brief.md
│   │       ├── engineering-spec.md
│   │       ├── gtm-brief.md
│   │       ├── decisions.md
│   │       └── prototype-notes.md
│   ├── done/
│   └── archived/
├── research/             # General research archives
│   └── synthesis/        # Cross-signal synthesis reports
├── signals/              # Incoming feedback/signals
│   ├── slack/
│   └── transcripts/
├── hypotheses/           # Tracked product assumptions
│   ├── active/
│   ├── validated/
│   ├── committed/
│   └── retired/
├── feature-guides/       # Customer-facing feature documentation
├── status/               # Recurring reporting outputs
│   ├── slack/digests/
│   ├── gmail/digests/
│   └── daily/
├── runbooks/             # Operational procedures
├── analysis/             # Architecture and migration analysis
├── roadmap/              # Product roadmap (JSON + derived views)
│   └── snapshots/
├── floating-docs/        # Raw AI analysis outputs awaiting synthesis
├── archive/              # Completed one-off projects
└── maintenance/          # Workspace audit outputs
```

## Notion Integration

The Product teamspace in Notion follows the V2 4-layer structure.
Full DB IDs and architecture: `runbooks/notion-v2-implementation-guide.md`

## Initiative Lifecycle

1. Discovery
2. Define
3. Build
4. Validate
5. Launch

## Output Rules

All PM artifacts should include:
1. Objective and audience
2. Evidence basis
3. Decision and rationale
4. Risks and mitigations
5. Concrete next actions

## Company Context (Always Load First)

Before any PM work:
- `company-context/product-vision.md` - Identity, mission, anti-vision
- `company-context/strategic-guardrails.md` - Decision framework
- `company-context/org-chart.md` - Team structure and Slack IDs
