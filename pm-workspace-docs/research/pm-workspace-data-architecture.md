# PM Workspace Data Architecture

**Date:** 2026-01-15  
**Purpose:** Define the data flow, storage locations, and state management for the PM automation system

---

## 1. System Overview

The PM workspace operates as a **signal-to-outcome pipeline** with four major layers:

```mermaid
flowchart TB
    subgraph InputLayer[Input Layer]
        direction LR
        T[Transcripts]
        TK[Support Tickets]
        LI[Linear Issues]
        SL[Slack Messages]
        CO[Code Changes]
        NO[Notion Docs]
    end

    subgraph ProcessingLayer[Processing Layer]
        direction LR
        IN[Ingest Processor]
        SIG[Signal Extractor]
        CTX[Context Assembler]
    end

    subgraph KnowledgeLayer[Knowledge Layer]
        direction LR
        HYP[Hypotheses]
        INIT[Initiatives]
        RES[Research]
        ROAD[Roadmap]
    end

    subgraph OutputLayer[Output Layer]
        direction LR
        PRD[PRDs]
        PROTO[Prototypes]
        SPEC[Specs]
        NOT[Notion Pages]
    end

    InputLayer --> ProcessingLayer
    ProcessingLayer --> KnowledgeLayer
    KnowledgeLayer --> OutputLayer
    OutputLayer -.->|Feedback| ProcessingLayer
```

---

## 2. Data Entities and Storage Locations

### 2.1 Entity Map

| Entity | Description | Storage Location | Format |
|--------|-------------|------------------|--------|
| **Signal** | Raw input from any source | `signals/[type]/` | `.md` or `.json` |
| **Hypothesis** | Unvalidated problem statement | `hypotheses/active/` | `.md` |
| **Validated Problem** | Hypothesis with evidence | `hypotheses/validated/` | `.md` |
| **Initiative** | Committed work item | `initiatives/[name]/` | folder |
| **Research** | Synthesized findings | `initiatives/[name]/research.md` | `.md` |
| **PRD** | Product requirements | `initiatives/[name]/prd.md` | `.md` |
| **Design Brief** | UX specifications | `initiatives/[name]/design-brief.md` | `.md` |
| **Engineering Spec** | Technical spec | `initiatives/[name]/engineering-spec.md` | `.md` |
| **Prototype** | Interactive UI | `elephant-ai/web/.../prototypes/` | `.tsx` |
| **Jury Evaluation** | Validation results | `initiatives/[name]/jury-evaluations/` | `.json/.md` |
| **Phase Metadata** | Lifecycle state | `initiatives/[name]/_meta.json` | `.json` |
| **Context Docs** | Vision, guardrails, personas | `company-context/` | `.md` |

### 2.2 Directory Structure

```
pm-workspace-docs/
├── company-context/                    # STATIC CONTEXT
│   ├── product-vision.md              # Core identity and principles
│   ├── strategic-guardrails.md        # Decision framework
│   ├── personas.md                    # User archetypes
│   ├── integrations.md                # System integrations
│   └── tech-stack.md                  # Technical constraints
│
├── signals/                            # RAW INPUT CAPTURE
│   ├── transcripts/                   # Meeting transcripts
│   │   └── YYYY-MM-DD-[source]-[topic].md
│   ├── tickets/                       # Support tickets
│   │   └── YYYY-MM-DD-[id]-[summary].md
│   ├── issues/                        # Linear/GitHub issues
│   │   └── [source]-[id].md
│   ├── conversations/                 # Slack/email threads
│   │   └── YYYY-MM-DD-[channel]-[topic].md
│   └── _index.json                    # Signal index with metadata
│
├── hypotheses/                         # PROBLEM TRACKING
│   ├── _template.md                   # Hypothesis template
│   ├── active/                        # Unvalidated hypotheses
│   │   └── [hypothesis-name].md
│   ├── validated/                     # Evidence-backed problems
│   │   └── [hypothesis-name].md
│   ├── committed/                     # On roadmap
│   │   └── [hypothesis-name].md       # → links to initiative
│   ├── retired/                       # Invalidated/completed
│   │   └── [hypothesis-name].md
│   └── _index.json                    # Hypothesis index
│
├── initiatives/                        # ACTIVE WORK
│   ├── _template/                     # Initiative template
│   └── [initiative-name]/
│       ├── _meta.json                 # Phase, status, timestamps
│       ├── research.md                # Synthesized research
│       ├── prd.md                     # Requirements
│       ├── design-brief.md            # UX spec
│       ├── engineering-spec.md        # Technical spec
│       ├── gtm-brief.md               # Launch plan
│       ├── decisions.md               # Decision log
│       ├── prototype-notes.md         # Prototype documentation
│       ├── iterations/                # Iteration history
│       │   └── iter-[timestamp]/
│       └── jury-evaluations/          # Validation results
│           └── [phase]-eval-[timestamp].json
│
├── roadmap/                            # AGGREGATED VIEW
│   ├── roadmap.md                     # Auto-generated roadmap
│   ├── by-phase.md                    # Initiatives grouped by phase
│   ├── by-persona.md                  # Initiatives by persona
│   └── stale-items.md                 # Items needing attention
│
├── research/                           # GENERAL RESEARCH
│   ├── competitive/
│   ├── user-interviews/
│   └── [topic]/
│
├── personas/                           # SYNTHETIC PERSONAS
│   ├── archetypes/                    # Base persona definitions
│   ├── generated/                     # Expanded persona pool
│   └── cohorts/                       # Segment definitions
│
└── scripts/                            # AUTOMATION
    ├── jury-system/
    ├── notion-obsidian-sync/
    └── [other automation]/
```

---

## 3. State Machine: Initiative Lifecycle

### 3.1 Phase Definitions

```mermaid
stateDiagram-v2
    [*] --> Signal: New input detected

    Signal --> Hypothesis: Extract problem
    Hypothesis --> Validated: Evidence gathered
    Validated --> Committed: Prioritized for roadmap

    Committed --> Discovery: Work begins
    Discovery --> Define: Problem understood
    Define --> Build: PRD approved
    Build --> Validate: Prototype ready
    Validate --> Build: Iteration needed
    Validate --> Launch: Validation passed

    Launch --> Measure: Released
    Measure --> Learn: Data collected
    Learn --> [*]: Complete

    Hypothesis --> Retired: Invalidated
    Validated --> Retired: Deprioritized
    Committed --> Retired: Cancelled

    state Signal {
        [*] --> Captured
        Captured --> Processed
        Processed --> Routed
    }

    state Discovery {
        [*] --> ResearchActive
        ResearchActive --> ResearchComplete
    }

    state Define {
        [*] --> PRDDraft
        PRDDraft --> PRDReview
        PRDReview --> PRDApproved
    }

    state Build {
        [*] --> PrototypeV1
        PrototypeV1 --> Iteration
        Iteration --> PrototypeVN
    }

    state Validate {
        [*] --> JuryEval
        JuryEval --> StakeholderReview
        StakeholderReview --> Decision
    }
```

### 3.2 Phase Metadata Schema (`_meta.json`)

```json
{
  "initiative": "hubspot-agent-config-ui",
  "hypothesis_id": "hyp-config-complexity",
  "phase": "build",
  "sub_phase": "iteration",
  "version": 2,
  "created_at": "2026-01-05T10:00:00Z",
  "updated_at": "2026-01-15T14:30:00Z",
  "phase_history": [
    {"phase": "discovery", "entered": "2026-01-05T10:00:00Z", "exited": "2026-01-07T09:00:00Z"},
    {"phase": "define", "entered": "2026-01-07T09:00:00Z", "exited": "2026-01-09T11:00:00Z"},
    {"phase": "build", "entered": "2026-01-09T11:00:00Z", "exited": null}
  ],
  "owner": "tyler",
  "priority": "P1",
  "personas": ["sales-rep", "revops"],
  "pillar": "customer-trust",
  "blockers": [],
  "next_action": "Run jury validation on prototype v2",
  "graduation_criteria": {
    "discovery_to_define": {"evidence_count": 3, "met": true},
    "define_to_build": {"prd_approved": true, "met": true},
    "build_to_validate": {"prototype_complete": true, "met": true},
    "validate_to_launch": {"jury_pass_rate": 70, "current": 65, "met": false}
  },
  "metrics": {
    "days_in_phase": 6,
    "total_iterations": 2,
    "jury_evaluations": 3
  }
}
```

### 3.3 Graduation Criteria by Phase

| From | To | Criteria |
|------|----|----------|
| Signal | Hypothesis | Problem statement extracted, persona identified |
| Hypothesis | Validated | 3+ evidence points, frequency/severity assessed |
| Validated | Committed | Outcome chain defined, prioritized vs alternatives |
| Committed | Discovery | Owner assigned, capacity allocated |
| Discovery | Define | Research complete, user problems documented |
| Define | Build | PRD approved, design brief complete |
| Build | Validate | Prototype covers all states, stories complete |
| Validate | Launch | Jury pass rate ≥70%, stakeholder approval |
| Launch | Measure | Released to users, instrumentation active |
| Measure | Learn | Success metrics evaluated, learnings documented |

---

## 4. Data Flow Diagrams

### 4.1 Signal Capture Flow

```mermaid
flowchart LR
    subgraph Sources[External Sources]
        MT[Meeting Transcript]
        ST[Support Ticket]
        LI[Linear Issue]
        SL[Slack Thread]
        GH[GitHub PR/Issue]
    end

    subgraph Ingest[Ingest Layer]
        ING[/ingest command/]
        PARSE[Parse and Normalize]
        EXTRACT[Extract Signals]
        TAG[Auto-tag metadata]
    end

    subgraph Store[Signal Storage]
        SIG[(signals/)]
        IDX[(signals/_index.json)]
    end

    subgraph Route[Signal Routing]
        MATCH{Match existing hypothesis?}
        NEW[Create new hypothesis]
        ADD[Add evidence to existing]
    end

    MT --> ING
    ST --> ING
    LI --> ING
    SL --> ING
    GH --> ING

    ING --> PARSE
    PARSE --> EXTRACT
    EXTRACT --> TAG
    TAG --> SIG
    TAG --> IDX

    SIG --> MATCH
    MATCH -->|No| NEW
    MATCH -->|Yes| ADD

    NEW --> HYP[(hypotheses/active/)]
    ADD --> HYP
```

### 4.2 Context Assembly Flow

```mermaid
flowchart TB
    subgraph Trigger[Command Triggered]
        CMD[Any PM Command]
        INIT_NAME[Initiative Name]
    end

    subgraph Lookup[Context Lookup]
        META[Read _meta.json]
        PHASE[Determine Phase]
        PERSONAS[Identify Personas]
        PILLAR[Identify Pillar]
    end

    subgraph Load[Context Loading]
        VIS[product-vision.md]
        GUARD[strategic-guardrails.md]
        PERS[personas.md - filtered]
        EXIST_RES[Existing research.md]
        EXIST_PRD[Existing prd.md]
        HYP_DOC[Linked hypothesis]
    end

    subgraph Assemble[Context Assembly]
        CTX_PKG[Assembled Context Package]
    end

    CMD --> INIT_NAME
    INIT_NAME --> META
    META --> PHASE
    META --> PERSONAS
    META --> PILLAR

    PHASE --> VIS
    PHASE --> GUARD
    PERSONAS --> PERS
    PHASE -->|if define+| EXIST_RES
    PHASE -->|if build+| EXIST_PRD
    META --> HYP_DOC

    VIS --> CTX_PKG
    GUARD --> CTX_PKG
    PERS --> CTX_PKG
    EXIST_RES --> CTX_PKG
    EXIST_PRD --> CTX_PKG
    HYP_DOC --> CTX_PKG

    CTX_PKG --> CMD
```

### 4.3 Hypothesis Lifecycle Flow

```mermaid
flowchart TB
    subgraph Create[Hypothesis Creation]
        SIG[Signal Detected]
        HYP_NEW[/hypothesis new/]
        EXTRACT_PROB[Extract Problem Statement]
        ASSIGN_PERS[Assign Persona]
        INIT_EVIDENCE[Initial Evidence]
    end

    subgraph Validate[Hypothesis Validation]
        GATHER[Gather More Evidence]
        SYNTH[/synthesize/]
        ASSESS[Assess Frequency/Severity]
        OUTCOME[Define Outcome Chain]
    end

    subgraph Commit[Hypothesis Commitment]
        PRIORITIZE[Prioritize vs Alternatives]
        ROADMAP_ADD[Add to Roadmap]
        CREATE_INIT[Create Initiative]
        LINK[Link Hypothesis to Initiative]
    end

    subgraph Retire[Hypothesis Retirement]
        INVALIDATE[Evidence contradicts]
        DEPRIORITIZE[Lower priority]
        COMPLETE[Initiative shipped]
        ARCHIVE[Archive with reason]
    end

    SIG --> HYP_NEW
    HYP_NEW --> EXTRACT_PROB
    EXTRACT_PROB --> ASSIGN_PERS
    ASSIGN_PERS --> INIT_EVIDENCE
    INIT_EVIDENCE --> GATHER

    GATHER --> SYNTH
    SYNTH --> ASSESS
    ASSESS --> OUTCOME
    OUTCOME -->|Strong| PRIORITIZE
    OUTCOME -->|Weak| INVALIDATE

    PRIORITIZE --> ROADMAP_ADD
    ROADMAP_ADD --> CREATE_INIT
    CREATE_INIT --> LINK

    INVALIDATE --> ARCHIVE
    DEPRIORITIZE --> ARCHIVE
    COMPLETE --> ARCHIVE
```

### 4.4 Initiative Execution Flow

```mermaid
flowchart TB
    subgraph Discovery[Discovery Phase]
        RES_CMD[/research/]
        TRANSCRIPT[Analyze Transcripts]
        INTERVIEWS[User Interviews]
        COMPETITIVE[Competitive Analysis]
        RES_DOC[research.md]
    end

    subgraph Define[Define Phase]
        PM_CMD[/pm/]
        PRD_GEN[Generate PRD]
        DESIGN_GEN[Generate Design Brief]
        ENG_GEN[Generate Eng Spec]
        GTM_GEN[Generate GTM Brief]
        NOTION_SYNC[Sync to Notion]
    end

    subgraph Build[Build Phase]
        PROTO_CMD[/proto/]
        COMP_GEN[Generate Components]
        STORY_GEN[Generate Stories]
        PROTO_DOC[prototype-notes.md]
        ITERATE_CMD[/iterate/]
        UPDATE_ALL[Update All Docs]
    end

    subgraph Validate[Validate Phase]
        JURY_CMD[/validate/]
        JURY_RUN[Run Jury Evaluation]
        JURY_REPORT[jury-evaluations/]
        STAKE_REV[Stakeholder Review]
        DECISION{Pass?}
    end

    subgraph Launch[Launch Phase]
        RELEASE[Release to Users]
        INSTRUMENT[Activate Metrics]
        ANNOUNCE[GTM Execution]
    end

    subgraph Measure[Measure Phase]
        COLLECT[Collect Data]
        ANALYZE[Analyze Results]
        COMPARE[Compare to Targets]
    end

    subgraph Learn[Learn Phase]
        RETRO_CMD[/retro/]
        LEARNINGS[Document Learnings]
        UPDATE_HYP[Update Hypothesis]
        FEED_BACK[Feed to Signal Detection]
    end

    Discovery --> Define
    Define --> Build
    Build --> Validate

    DECISION -->|No| ITERATE_CMD
    ITERATE_CMD --> Build
    DECISION -->|Yes| Launch

    Launch --> Measure
    Measure --> Learn
    Learn -.->|New Signals| Discovery

    RES_CMD --> RES_DOC
    PM_CMD --> PRD_GEN
    PROTO_CMD --> COMP_GEN
    JURY_CMD --> JURY_REPORT
    RETRO_CMD --> LEARNINGS
```

---

## 5. Data Relationships

### 5.1 Entity Relationship Diagram

```mermaid
erDiagram
    SIGNAL ||--o{ HYPOTHESIS : "contributes to"
    HYPOTHESIS ||--o| INITIATIVE : "becomes"
    INITIATIVE ||--|{ ARTIFACT : "produces"
    INITIATIVE ||--o{ JURY_EVAL : "validated by"
    INITIATIVE ||--o{ ITERATION : "has"
    INITIATIVE }|--|| PHASE : "in"
    INITIATIVE }o--o{ PERSONA : "targets"
    INITIATIVE }o--|| PILLAR : "supports"
    CONTEXT_DOC }o--o{ INITIATIVE : "informs"

    SIGNAL {
        string id PK
        string source
        string type
        datetime captured_at
        string content
        string[] extracted_problems
        string[] personas_mentioned
    }

    HYPOTHESIS {
        string id PK
        string name
        string status
        string problem_statement
        string[] evidence_ids FK
        string persona FK
        string outcome_chain
        int evidence_count
        string severity
        string frequency
        datetime created_at
        datetime validated_at
        string initiative_id FK
    }

    INITIATIVE {
        string id PK
        string name
        string hypothesis_id FK
        string phase
        string sub_phase
        int version
        string owner
        string priority
        string[] persona_ids FK
        string pillar_id FK
        datetime created_at
        datetime updated_at
        json graduation_criteria
    }

    ARTIFACT {
        string id PK
        string initiative_id FK
        string type
        string path
        datetime created_at
        datetime updated_at
        string version
    }

    JURY_EVAL {
        string id PK
        string initiative_id FK
        string phase
        datetime timestamp
        int jury_size
        float approval_rate
        json results
        string report_path
    }

    ITERATION {
        string id PK
        string initiative_id FK
        int version
        datetime timestamp
        string[] changes
        string trigger
    }

    PHASE {
        string id PK
        string name
        string[] allowed_transitions
        json graduation_criteria
    }

    PERSONA {
        string id PK
        string name
        string archetype
        json attributes
    }

    PILLAR {
        string id PK
        string name
        string description
    }

    CONTEXT_DOC {
        string id PK
        string type
        string path
        datetime updated_at
    }
```

### 5.2 Information Flow Matrix

| Source | Destination | Trigger | Data Transferred |
|--------|-------------|---------|------------------|
| External → Signal | `signals/` | `/ingest` | Raw content, extracted problems, tags |
| Signal → Hypothesis | `hypotheses/active/` | `/hypothesis new` | Problem statement, initial evidence |
| Signal → Hypothesis | `hypotheses/[status]/` | Auto-match | Additional evidence |
| Hypothesis → Initiative | `initiatives/` | `/hypothesis commit` | Problem, outcome chain, persona |
| Context → Command | In-memory | Any command | Vision, guardrails, personas, existing docs |
| Initiative → PRD | `prd.md` | `/pm` | Requirements, user stories, scope |
| Initiative → Design | `design-brief.md` | `/pm` | Flows, states, patterns |
| Initiative → Prototype | `prototypes/` | `/proto` | React components, stories |
| Prototype → Jury | `jury-evaluations/` | `/validate` | Evaluation results, recommendations |
| Jury → Initiative | `_meta.json`, docs | Auto | Updated phase, iteration triggers |
| Initiative → Roadmap | `roadmap/` | Auto-generated | Aggregated view by phase |
| Launch → Metrics | External | Release | Instrumentation data |
| Metrics → Learn | `decisions.md` | `/retro` | Outcomes, learnings |
| Learn → Signal | `signals/` | Auto | New signals from learnings |

---

## 6. Index Files and Aggregation

### 6.1 Signal Index (`signals/_index.json`)

```json
{
  "last_updated": "2026-01-15T14:30:00Z",
  "total_signals": 47,
  "by_source": {
    "transcript": 23,
    "ticket": 12,
    "linear": 8,
    "slack": 4
  },
  "by_status": {
    "unprocessed": 3,
    "processed": 44
  },
  "recent": [
    {
      "id": "sig-2026-01-15-001",
      "source": "transcript",
      "topic": "Customer Journey Discovery",
      "captured_at": "2026-01-15T10:00:00Z",
      "status": "processed",
      "hypothesis_ids": ["hyp-journey-mapping"]
    }
  ]
}
```

### 6.2 Hypothesis Index (`hypotheses/_index.json`)

```json
{
  "last_updated": "2026-01-15T14:30:00Z",
  "total": 12,
  "by_status": {
    "active": 4,
    "validated": 3,
    "committed": 3,
    "retired": 2
  },
  "hypotheses": [
    {
      "id": "hyp-config-complexity",
      "name": "HubSpot Configuration Complexity",
      "status": "committed",
      "persona": "revops",
      "evidence_count": 7,
      "severity": "high",
      "frequency": "common",
      "initiative_id": "hubspot-agent-config-ui"
    }
  ]
}
```

### 6.3 Roadmap View (`roadmap/roadmap.md`)

Auto-generated from initiative `_meta.json` files:

```markdown
# Product Roadmap

**Generated:** 2026-01-15 14:30

## By Phase

### Discovery (2 initiatives)
| Initiative | Owner | Days | Persona | Priority |
|------------|-------|------|---------|----------|
| customer-journey-map | tyler | 5 | sales-leader | P1 |
| notification-engine | - | 12 | all | P2 |

### Define (1 initiative)
| Initiative | Owner | Days | Persona | Priority |
|------------|-------|------|---------|----------|
| release-lifecycle-process | tyler | 3 | revops | P1 |

### Build (2 initiatives)
| Initiative | Owner | Days | Persona | Priority |
|------------|-------|------|---------|----------|
| hubspot-agent-config-ui | tyler | 6 | revops | P1 |
| universal-signal-tables | - | 8 | sales-rep | P2 |

### Validate (0 initiatives)

### Launched (3 initiatives)
...

## Stale Items (>14 days in phase)
- notification-engine: 12 days in Discovery, no activity
- universal-signal-tables: 8 days in Build, blocked

## By Pillar
...

## By Persona
...
```

---

## 7. Automation Hooks

### 7.1 Event Triggers

| Event | Trigger | Action |
|-------|---------|--------|
| New file in `signals/` | File watcher | Run signal processor, update index |
| Hypothesis evidence_count ≥ 3 | Index update | Suggest validation |
| Initiative enters new phase | `_meta.json` update | Update roadmap, notify |
| Initiative stale > 7 days | Daily cron | Add to stale report |
| Jury pass rate ≥ 70% | Jury completion | Suggest phase graduation |
| PRD updated | File change | Trigger design brief review |
| Prototype committed | Git hook | Run jury pre-validation |

### 7.2 Command → File Mapping

| Command | Reads | Writes |
|---------|-------|--------|
| `/ingest` | Input source | `signals/[type]/`, `signals/_index.json` |
| `/hypothesis new` | `signals/` | `hypotheses/active/`, `hypotheses/_index.json` |
| `/hypothesis validate` | `hypotheses/active/` | `hypotheses/validated/`, index |
| `/hypothesis commit` | `hypotheses/validated/` | `hypotheses/committed/`, `initiatives/`, index |
| `/status` | `_meta.json`, indexes | stdout |
| `/research` | Context docs, signals | `research.md`, Notion |
| `/pm` | Context, research | `prd.md`, `design-brief.md`, `engineering-spec.md`, `gtm-brief.md`, Notion |
| `/proto` | PRD, design-brief | `prototypes/`, `prototype-notes.md` |
| `/iterate` | Feedback, existing docs | Updated docs, new prototype version |
| `/validate` | Prototype, personas | `jury-evaluations/`, `_meta.json` |
| `/roadmap` | All `_meta.json` | `roadmap/*.md` |
| `/synthesize` | `signals/`, `hypotheses/` | Synthesis report |
| `/retro` | Metrics, initiative docs | `decisions.md`, new signals |

---

## 8. Implementation Notes

### 8.1 Key Design Decisions

1. **File-based over database** - All state in git-tracked markdown/JSON for transparency and versioning
2. **Indexes for performance** - JSON index files prevent scanning all files for aggregation
3. **Phase in metadata** - Phase is stored in `_meta.json`, not inferred from file presence
4. **Hypothesis-first** - No initiative without a linked hypothesis (enforced)
5. **Context auto-assembly** - Commands don't require manual `@` references
6. **Graduation gates** - Phase transitions require explicit criteria, not just time

### 8.2 Migration Path

For existing initiatives without `_meta.json`:
1. Run migration script to infer phase from existing files
2. Create `_meta.json` with inferred state
3. Create placeholder hypothesis if none exists
4. Update indexes

### 8.3 Notion Sync Strategy

- **One-way for read**: Pull signals from Notion (transcripts, feedback)
- **One-way for write**: Push initiative docs to Notion (PRD, specs)
- **Bidirectional**: Project status synced both ways
- **Source of truth**: Local files are authoritative; Notion is a view

---

## 9. Summary: Where Does Each Thing Live?

| Information Type | Location | Format | Updated By |
|------------------|----------|--------|------------|
| Company vision and strategy | `company-context/` | `.md` | Manual (rare) |
| Raw customer input | `signals/` | `.md` | `/ingest` |
| Problem hypotheses | `hypotheses/` | `.md` | `/hypothesis` |
| Active work items | `initiatives/[name]/` | folder | PM commands |
| Work item status | `initiatives/[name]/_meta.json` | `.json` | All commands |
| Research findings | `initiatives/[name]/research.md` | `.md` | `/research` |
| Requirements | `initiatives/[name]/prd.md` | `.md` | `/pm` |
| UI specifications | `initiatives/[name]/design-brief.md` | `.md` | `/pm` |
| Technical specs | `initiatives/[name]/engineering-spec.md` | `.md` | `/pm` |
| Prototype code | `elephant-ai/.../prototypes/` | `.tsx` | `/proto` |
| Validation results | `initiatives/[name]/jury-evaluations/` | `.json/.md` | `/validate` |
| Aggregated roadmap | `roadmap/` | `.md` | Auto-generated |
| Synthetic personas | `personas/` | `.json` | Scripts |
| Decision log | `initiatives/[name]/decisions.md` | `.md` | Manual + `/retro` |

---

*This architecture ensures every piece of information has a clear home, flows through defined paths, and supports tracking work through its entire lifecycle.*
