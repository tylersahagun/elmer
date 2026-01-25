# PM Workspace Knowledge Base Structure

This document describes the directory structure and organization patterns used in the `pm-workspace-docs/` repository. Understanding this structure is essential for syncing knowledge from external repositories.

## Root Directory Structure

The `pm-workspace-docs/` root contains:

### Top-Level Directories

| Directory | Purpose | Contents |
|-----------|---------|----------|
| `company-context/` | Company-wide context and vision | Product vision, strategic guardrails, personas, tech stack |
| `initiatives/` | Product initiatives and projects | One folder per initiative with PRD, research, prototypes |
| `personas/` | User personas and archetypes | Archetype definitions, generated personas, jury system configs |
| `signals/` | User feedback and research signals | Transcripts, tickets, issues, conversations, documents |
| `research/` | General research documents | Competitive analysis, best practices, audits |
| `hypotheses/` | Product hypotheses tracking | Active, committed, and retired hypotheses |
| `roadmap/` | Product roadmap | Roadmap files, snapshots, Gantt/Kanban views |
| `agents-docs/` | AI agent documentation | AGENTS.md files for codebases |
| `audits/` | System audits | Workspace audits, recommendations |
| `maintenance/` | Maintenance tasks | Cleanup, archival, duplicate detection |
| `meeting-notes/` | Meeting documentation | Meeting transcripts and notes |
| `scenarios/` | User scenarios | Scenario definitions |
| `scripts/` | Automation scripts | Python/bash scripts for workspace management |
| `floating-docs/` | Temporary/unorganized docs | Documents pending organization |
| `personal/` | Personal notes | Individual contributor notes |
| `status/` | Status tracking | Current status documents |
| `knowledge-base-sync/` | Sync configuration | Knowledge base sync settings |

### Root-Level Files

- `AGENTS.md` - AI agent documentation
- `README.md` - Workspace overview
- `SLACK-COMMANDS.md` - Slack command reference
- `chatgpt-recommendations-audit.md` - Audit document
- `cursor-optimization-plan-v2.md` - Optimization plan
- `sync-queue.md` - Sync queue documentation

---

## Company Context (`company-context/`)

**Purpose**: Company-wide context that informs all product decisions.

### Files

| File | Purpose |
|------|---------|
| `product-vision.md` | Core product vision, mission, principles, anti-vision |
| `strategic-guardrails.md` | Red flags, alignment checks, pushback questions |
| `personas.md` | High-level persona definitions |
| `tech-stack.md` | Technology stack documentation |
| `org-chart.md` | Organizational structure |
| `integrations.md` | Integration documentation |
| `tyler-context.md` | Personal context (individual contributor) |
| `product-vision-research-prompt.md` | Research prompts for vision |
| `prototype-alignment-checklist.md` | Checklist for prototype alignment |
| `storybook-coverage-gaps.md` | Storybook coverage analysis |
| `storybook-guide.md` | Storybook usage guide |

**Naming Convention**: kebab-case markdown files (`.md`)

---

## Initiatives (`initiatives/`)

**Purpose**: One folder per product initiative containing all related documentation.

### Folder Structure

Each initiative follows this structure:

```
initiatives/
├── _template/              # Template for new initiatives
│   ├── prd.md             # Product Requirements Document
│   ├── research.md        # Research notes
│   ├── decisions.md       # Decision log
│   ├── prototype-notes.md # Prototype documentation
│   ├── research/          # Research subdirectory
│   │   └── interview-notes.md
│   └── prototype/         # Prototype subdirectory
│       └── README.md
│
└── [initiative-name]/     # Actual initiative folders
    ├── _meta.json         # Initiative metadata (see below)
    ├── prd.md
    ├── research.md
    ├── decisions.md
    └── prototype-notes.md
```

### Initiative Naming Convention

- **Format**: kebab-case (e.g., `admin-onboarding`, `crm-exp-ete`)
- **Examples**:
  - `admin-onboarding`
  - `automated-metrics-observability`
  - `call-import-engine`
  - `condorcet-jury-system`
  - `settings-redesign`

### Initiative Metadata (`_meta.json`)

Each initiative can have a `_meta.json` file with the following schema:

```json
{
  "$schema": "pm-workspace-meta-v1",
  "initiative": "initiative-name",
  "hypothesis_id": null,
  "phase": "define" | "design" | "prototype" | "validate" | "build" | "launch",
  "sub_phase": null,
  "status": "on_track" | "at_risk" | "blocked" | "complete",
  "priority": "P0" | "P1" | "P2" | "P3",
  "owner": null,
  "personas": [],
  "pillar": null,
  "created_at": "ISO-8601 datetime",
  "updated_at": "ISO-8601 datetime",
  "phase_history": [
    {
      "phase": "phase-name",
      "entered": "ISO-8601 datetime",
      "exited": "ISO-8601 datetime | null"
    }
  ],
  "blockers": [],
  "next_action": "string",
  "graduation_criteria": {},
  "timeline": {
    "started": "ISO-8601 datetime | null",
    "target_launch": "ISO-8601 datetime | null"
  },
  "metrics": {
    "days_in_phase": 0,
    "total_iterations": 0
  },
  "linear_project_id": "uuid",
  "linear_project_url": "https://linear.app/...",
  "notion_project_id": null,
  "notion_project_url": null,
  "notion_artifacts": {
    "engineering_specs": [],
    "design_briefs": [],
    "launch_planning": []
  },
  "github_labels": ["initiative:name", "category"],
  "github_branch_prefix": "feat/initiative-name",
  "dev_activity": {
    "last_synced": "ISO-8601 datetime | null",
    "linear_issues_total": null,
    "linear_issues_completed": null,
    "linear_issues_in_progress": null,
    "github_prs_merged_30d": null
  },
  "_generated": "auto-generated by maintain fix"
}
```

### Initiative File Types

| File | Purpose | Required |
|------|---------|----------|
| `prd.md` | Product Requirements Document | Yes |
| `research.md` | Research notes and findings | Yes |
| `decisions.md` | Decision log | Yes |
| `prototype-notes.md` | Prototype documentation | Optional |
| `_meta.json` | Initiative metadata | Optional (auto-generated) |

---

## Personas (`personas/`)

**Purpose**: User personas for product decisions and jury system evaluation.

### Structure

```
personas/
├── persona-schema.json        # JSON schema for persona validation
├── generation-config.json      # Configuration for persona generation
├── JURY-SYSTEM-README.md      # Jury system documentation
├── archetypes/                # Base persona archetypes
│   ├── sales-rep.json
│   ├── sales-leader.json
│   ├── csm.json
│   ├── operations.json
│   └── strategic-consultant.json
├── Personas/                  # Generated personas
│   └── Customer Personas/
└── generated/                 # Generated persona files
```

### Persona Archetypes

Archetypes define base persona templates with variation dimensions:

**Available Archetypes**:
- `sales-rep` - Sales Representative
- `sales-leader` - Sales Leader
- `csm` - Customer Success Manager
- `operations` - Operations
- `strategic-consultant` - Strategic Consultant

**Archetype Structure** (from `sales-rep.json`):

```json
{
  "archetype_id": "sales-rep",
  "archetype_name": "Sales Representative",
  "source_documents": ["path/to/source.md"],
  "core_definition": {
    "goal": "Primary goal",
    "pain": "Main pain points",
    "success": "Success criteria",
    "key_workflows": ["workflow1", "workflow2"]
  },
  "variation_dimensions": {
    "company_size": {
      "distribution": {
        "1-50": 0.15,
        "51-200": 0.35,
        ...
      }
    },
    "tech_literacy": { ... },
    "ai_adoption_stage": { ... },
    "sales_cycle_length": { ... },
    "seniority": { ... }
  },
  "common_titles": [...]
}
```

### Persona Schema

Personas follow a strict JSON schema (`persona-schema.json`) with required fields:

- `id` - Unique identifier (pattern: `persona_[a-z0-9]{8}`)
- `archetype_id` - Base archetype (enum)
- `demographics` - Name, age, location
- `role` - Job role details
- `firmographics` - Company details
- `psychographics` - Behavioral traits
- `context` - Work context
- `voice_quotes` - Example quotes

**Optional fields**:
- `sub_type` - Sub-type within archetype
- `generation_metadata` - Generation tracking (batch_id, model, etc.)

---

## Signals (`signals/`)

**Purpose**: User feedback, research signals, and input from various sources.

### Structure

```
signals/
├── _index.json              # Signals index (metadata)
├── transcripts/             # Call transcripts
├── tickets/                 # Support tickets
├── issues/                  # GitHub/Linear issues
├── conversations/           # Chat conversations
├── documents/               # Documents
└── releases/                # Release notes
```

### Signal Index (`_index.json`)

The signals index tracks all signals with metadata:

```json
{
  "$schema": "pm-workspace-signals-index-v1",
  "last_updated": "ISO-8601 datetime",
  "total_signals": 11,
  "by_source": {
    "transcript": 9,
    "ticket": 0,
    "issue": 0,
    "conversation": 0,
    "document": 2
  },
  "by_status": {
    "unprocessed": 2,
    "processed": 9
  },
  "signals": [
    {
      "id": "sig-2026-01-15-1225d797",
      "type": "transcript",
      "source": "test-customer-call.md",
      "topic": "customer-call-acme-corp",
      "captured_at": "ISO-8601 datetime",
      "status": "unprocessed" | "processed",
      "problems_extracted": ["problem statement"],
      "personas_mentioned": ["sales-rep", "csm"],
      "severity": "low" | "medium" | "high",
      "word_count": 109,
      "file_path": "signals/transcripts/2026-01-15-customer-call-acme-corp-1225d797.md",
      "hypothesis_matches": [],
      "hypothesis_candidates": [],
      "related_signals": []
    }
  ]
}
```

### Signal File Naming Convention

**Format**: `YYYY-MM-DD-[topic]-[hash].md`

**Examples**:
- `2026-01-15-customer-call-acme-corp-1225d797.md`
- `2026-01-16-internal-crm-exp-ete-planning.md`
- `2026-01-21-crispy-feedback.md`

**Pattern**: `[date]-[descriptive-topic]-[optional-hash].md`

---

## Research (`research/`)

**Purpose**: General research documents, competitive analysis, best practices.

### Structure

```
research/
├── automation-research-cursor-slack-workflow.md
├── human-centric-ai-design-research.md
├── metrics-framework-best-practices.md
├── north-star-validation-results.md
├── pm-workspace-data-architecture.md
├── pm-workspace-system-audit-2026-01-15.md
├── posthog-best-practices-sachin.md
├── posthog-event-catalog.md
├── competitive/              # Competitive research
└── feature-flag/             # Feature flag research
```

**Naming Convention**: kebab-case markdown files (`.md`)

---

## Hypotheses (`hypotheses/`)

**Purpose**: Track product hypotheses through their lifecycle.

### Structure

```
hypotheses/
├── _index.json              # Hypotheses index
├── _template.md             # Hypothesis template
├── active/                  # Active hypotheses
├── committed/               # Committed hypotheses
└── retired/                 # Retired hypotheses
```

**Naming Convention**: Hypotheses are organized by lifecycle stage in subdirectories.

---

## Roadmap (`roadmap/`)

**Purpose**: Product roadmap documentation and views.

### Structure

```
roadmap/
├── roadmap.md               # Main roadmap document
├── roadmap.json             # Roadmap data (JSON)
├── roadmap-gantt.md         # Gantt chart view
├── roadmap-kanban.md        # Kanban board view
└── snapshots/               # Historical snapshots
```

---

## Key Patterns and Conventions

### File Naming Conventions

1. **Markdown Files**: kebab-case (e.g., `product-vision.md`, `admin-onboarding.md`)
2. **JSON Files**: kebab-case (e.g., `_meta.json`, `persona-schema.json`)
3. **Signal Files**: `YYYY-MM-DD-[topic]-[hash].md` format
4. **Initiative Folders**: kebab-case matching initiative name

### Directory Naming Conventions

1. **All directories**: kebab-case (e.g., `company-context`, `initiatives`)
2. **Special directories**:
   - `_template` - Template folders (underscore prefix)
   - `Personas` - PascalCase for generated personas
   - Subdirectories follow parent naming style

### Metadata Files

Several directories use `_index.json` or `_meta.json` files:

- `signals/_index.json` - Signals index
- `hypotheses/_index.json` - Hypotheses index
- `initiatives/[name]/_meta.json` - Initiative metadata

**Convention**: Metadata files use underscore prefix (`_`) to indicate they're system files.

### Schema Versioning

Metadata files include schema versions:

- `$schema: "pm-workspace-meta-v1"` - Initiative metadata
- `$schema: "pm-workspace-signals-index-v1"` - Signals index

---

## Import/Sync Considerations

When syncing knowledge from this repository:

### Required Context

1. **Company Context** (`company-context/`) - Must be synced first
   - `product-vision.md` - Core vision
   - `strategic-guardrails.md` - Alignment checks
   - `personas.md` - High-level personas

2. **Initiative Structure** (`initiatives/`)
   - Each initiative folder is self-contained
   - `_meta.json` provides integration metadata (Linear, GitHub, Notion)
   - Template structure in `_template/` defines standard files

3. **Personas** (`personas/`)
   - Archetypes define base templates
   - Generated personas follow strict schema
   - Used by jury system for evaluation

4. **Signals** (`signals/`)
   - Index file (`_index.json`) tracks all signals
   - Signals organized by type (transcripts, tickets, etc.)
   - File naming includes date and topic

### Integration Points

The structure supports integrations with:

- **Linear**: `linear_project_id`, `linear_project_url` in `_meta.json`
- **GitHub**: `github_labels`, `github_branch_prefix` in `_meta.json`
- **Notion**: `notion_project_id`, `notion_project_url`, `notion_artifacts` in `_meta.json`

### Sync Priorities

1. **High Priority** (Core context):
   - `company-context/` - All files
   - `initiatives/_template/` - Template structure

2. **Medium Priority** (Active work):
   - `initiatives/[active-initiatives]/` - Current initiatives
   - `signals/_index.json` - Signal tracking
   - `personas/archetypes/` - Base persona definitions

3. **Low Priority** (Reference):
   - `research/` - Historical research
   - `roadmap/` - Roadmap views
   - `hypotheses/` - Hypothesis tracking

---

## Summary

The PM workspace knowledge base follows a structured, hierarchical organization:

- **Company context** at the root level informs all decisions
- **Initiatives** are self-contained folders with standard documentation
- **Personas** use archetypes with variation dimensions
- **Signals** are indexed and organized by type
- **Metadata files** (`_meta.json`, `_index.json`) provide integration and tracking

This structure enables:
- Clear separation of concerns
- Easy navigation and discovery
- Integration with external tools (Linear, GitHub, Notion)
- Automated tracking and maintenance
- Consistent documentation patterns
