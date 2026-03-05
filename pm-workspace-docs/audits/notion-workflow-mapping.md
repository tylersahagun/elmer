# Notion Workflow Mapping

**Date:** 2026-01-26
**Status:** ✅ IMPLEMENTED
**Purpose:** Translate the PM workspace workflow into Notion visibility

## What Was Updated (2026-01-26)

### Product System Guide
- Replaced with new initiative lifecycle documentation
- Added phase definitions (Discovery → Definition → Build → Test → Done)
- Documented where things live (Notion, Linear, PM Workspace)
- Added project schema reference
- Created step-by-step "Creating a New Initiative" guide
- **Backup:** "Product System Guide (pre-2026-01-26)"

### Product Command Center  
- Simplified to 4 key sections: Building, Pipeline, Launch Calendar, Roadmap
- Added Quick Reference for reading the dashboard
- Linked to Projects Database, Launch Planning, and Roadmap databases
- **Backup:** "Product Command Center (pre-2026-01-26)"

### Manual Follow-up Needed in Notion:
1. **Add toggle content** in Product System Guide (phase definitions need details)
2. **Create linked database views** instead of bookmarks (manually embed the databases)
3. **Create the 5 recommended views** in Projects Database

---

## Your Current Workflow

Based on your `pm-workspace` structure:

```
pm-workspace-docs/
├── initiatives/[name]/        # Main working folder
│   ├── _meta.json            # Status, phase, metadata
│   ├── research.md           # User evidence
│   ├── prd.md                # Requirements
│   ├── design-brief.md       # Design specs
│   ├── engineering-spec.md   # Tech approach
│   ├── prototype-notes.md    # Prototype docs
│   ├── gtm-brief.md          # Launch plan
│   └── jury-evaluations/     # Validation results
├── signals/                  # Incoming feedback
├── hypotheses/               # Ideas to validate
└── roadmap/                  # Strategic view
```

### Initiative Lifecycle

```
discovery → define → build → validate → launch
   │          │        │         │         │
   │          │        │         │         └── GTM execution
   │          │        │         └── Jury validation (≥70% pass)
   │          │        └── Prototype with all states
   │          └── PRD + Design brief
   └── Research with user quotes
```

---

## Notion Mapping Strategy

### Projects Database = Initiative Tracker

The cleaned-up Projects Database (15 properties) now maps directly to your workflow:

| PM Workspace | Notion Property | Purpose |
|--------------|-----------------|---------|
| `_meta.phase` | **Project Phase** | Discovery → Build → Done |
| `_meta.priority` | **Priority** | P0-P4 |
| `_meta.owner` | **Sponsors** | Accountability |
| Engineering assigned | **Engineering** | Dev ownership |
| Design assigned | **Design** | Design ownership |
| Business outcome | **Outcome** | "So that..." statement |
| Linear project | **Linear Link** | Engineering tracking |
| Figma file | **Figma Link** | Design source |
| Launch plan | **GTM** | → Launch Planning database |
| Strategic alignment | **Roadmap Initiative** | → Roadmap database |
| Start/target dates | **Start date / End Date** | Timeline |
| AI context | **AI summary** | Quick LLM context |
| When updated | **Last meaningful update** | Staleness detection |

### Launch Planning Database = GTM Execution

Tracks the "ship" side of initiatives:

| Field | Maps To |
|-------|---------|
| Launch Planning | Initiative name |
| Date | Target ship date |
| Status | Not Started → In Progress → Done |
| Launch Tier | P1 (Major) → P4 (Silent) |
| 🚧 Projects Database | ← Link back to project |

### Roadmap Database = Strategic Context

Tracks the "why" behind initiatives:

| Field | Maps To |
|-------|---------|
| Theme | Strategic pillar (Trust, Data Knowledge, Trend Visibility) |
| Horizon | Now / Next / Later |
| Quarter | Q1 2026, etc. |

---

## Recommended Views

### View 1: Active Work (Default)

**Filter:** Project Phase = Build OR Test
**Sort:** Priority (P0 first)
**Properties shown:**
- Project name
- Project Phase
- Priority
- Linear Link (as icon)
- Engineering

**Use:** Daily standup, quick status check

---

### View 2: Pipeline (Board)

**Group by:** Project Phase
**Filter:** Project Phase ≠ Done - Full Release
**Properties shown:**
- Project name
- Priority
- Outcome

**Columns:**
- Discovery (idea validation)
- Definition (PRD/design)
- Build (engineering)
- Test (validation)
- Done - Beta

**Use:** Visual pipeline management

---

### View 3: Shipped

**Filter:** Project Phase = Done - Full Release OR Done - Beta
**Sort:** End Date (newest first)
**Properties shown:**
- Project name
- End Date
- GTM (launch plan link)

**Use:** Release notes, retrospectives

---

### View 4: Needs Attention

**Filter:** 
- (Project Phase = Build OR Test) AND Linear Link is empty
- OR (Project Phase = Build OR Test) AND GTM is empty

**Properties shown:**
- Project name
- Project Phase
- Linear Link
- GTM
- Last meaningful update

**Use:** Find incomplete projects

---

### View 5: By Person

**Filter:** Engineering contains [person] OR Design contains [person]
**Group by:** Engineering
**Properties shown:**
- Project name
- Project Phase
- Priority

**Use:** Workload visibility

---

## Views to Create (Manual in Notion)

Since Notion API doesn't support view creation, create these manually:

### How to create each view:

1. **Open Projects Database** in Notion
2. Click **+ Add a view** (top-left)
3. Choose view type:
   - **Active Work** → Table
   - **Pipeline** → Board (group by Project Phase)
   - **Shipped** → Table
   - **Needs Attention** → Table
   - **By Person** → Table (group by Engineering)
4. Set filters and visible properties per specs above

---

## Workflow Integration Points

### When an initiative starts:

1. Create entry in **Projects Database** (Notion)
   - Set Project Phase = Discovery
   - Fill: Project name, Priority, Outcome, Sponsors
   - Link to Roadmap Initiative if strategic

2. Create folder in `pm-workspace-docs/initiatives/[name]/`
   - Initialize `_meta.json` with Notion page ID

### When moving to Build:

1. Update **Project Phase** → Build
2. Create Linear project, add **Linear Link**
3. Assign **Engineering** and **Design**

### When shipping:

1. Link to **GTM** (Launch Planning entry)
2. Update **Project Phase** → Done - Beta or Done - Full Release
3. Set **End Date**

### Sync commands:

```bash
# Pull Linear status into local metadata
/sync-linear

# Push local changes to Notion
/sync-notion

# Full pipeline sync
/sync-dev
```

---

## Data Flow

```
┌──────────────────────────────────────────────────────────────┐
│                     NOTION (Visibility)                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │  Projects   │──│   Launch    │──│  Roadmap    │          │
│  │  Database   │  │  Planning   │  │  Database   │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
│         │                                                     │
└─────────┼────────────────────────────────────────────────────┘
          │ /sync-notion
          ▼
┌──────────────────────────────────────────────────────────────┐
│                PM WORKSPACE (Source of Truth)                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │ initiatives/│  │  signals/   │  │ hypotheses/ │          │
│  │ [name]/     │  │  [type]/    │  │ [status]/   │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
│         │                                                     │
└─────────┼────────────────────────────────────────────────────┘
          │ Linear Link
          ▼
┌──────────────────────────────────────────────────────────────┐
│                    LINEAR (Engineering)                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │  Projects   │──│   Issues    │──│   Cycles    │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
└──────────────────────────────────────────────────────────────┘
```

---

## Summary

| System | Role | When Used |
|--------|------|-----------|
| **Notion** | Stakeholder visibility, status tracking | Meetings, check-ins, leadership updates |
| **PM Workspace** | Deep work, artifacts, analysis | Day-to-day PM work, research, PRDs |
| **Linear** | Engineering execution, sprint planning | Dev standups, issue tracking |
| **PostHog** | Success metrics, feature flags | Launch validation, metrics review |

### Key Principle

> **Notion = "What are we working on?"**
> **PM Workspace = "Why and how are we doing it?"**
> **Linear = "Who's doing what by when?"**

---

## Next Actions

- [ ] Create the 5 recommended views manually in Notion
- [ ] Add `notion_project_id` to `_meta.json` for each initiative
- [ ] Run `/sync-notion` to establish bidirectional sync
- [ ] Consider creating a "Dashboard" page that embeds all 5 views
