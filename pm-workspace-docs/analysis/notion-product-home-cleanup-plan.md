# Notion Product Home Cleanup & PM Workspace Parity Plan

**Created:** 2026-02-21  
**Purpose:** Clean up Product teamspace sidebar, consolidate definition work, and align Notion structure with PM workspace conventions.

---

## Executive Summary

The Product teamspace sidebar is overloaded with top-level pages and databases in a flat structure. Definition work (PRDs, research, decisions, etc.) is scattered across standalone pages rather than linked to initiatives. This plan addresses:

1. **Sidebar cleanup** — Apply Notion best practices for a "true file structure" feel
2. **Definition work consolidation** — Create a single source of truth for initiative artifacts
3. **PM workspace parity** — Mirror the initiative-centric structure used locally

---

## Part 1: PM Workspace Document Types (Complete Inventory)

### Core Document Types (Always Considered)

| Doc Type | Canonical File | Count | Phase Relevance |
|----------|----------------|-------|-----------------|
| PRD | `prd.md` | 34 | Define+ |
| Research | `research.md` | 35 | Discovery, Define |
| Design Brief | `design-brief.md` | 25 | Define |
| Engineering Spec | `engineering-spec.md` | 14 | Build |
| GTM Brief | `gtm-brief.md` | 15 | Build, Launch |
| Prototype Notes | `prototype-notes.md` | 24 | Define, Build |
| Decisions | `decisions.md` | 18 | All phases |
| METRICS | `METRICS.md` | 10 | Build, Validate |
| Competitive Landscape | `competitive-landscape*.md` | 10+ | Discovery, Define |
| Placement Research | `placement-research.md` | 9 | Define |

### Supporting / Nested Document Types

| Doc Type | Notes |
|----------|-------|
| Analysis | `analysis.md`, research subfolders (`research/*.md`) |
| Jury / Validation | `jury-evaluations/*.md`, `validation-report*.md` |
| Visual Directions | `visual-directions.md`, mockup specs |
| Customer Story | `customer-story.md` |
| Source Packet | `source-packet.md` |
| Initiative Map | `initiative-map.md` (parent→child relationships) |
| Design Review / Audit | `design-review.md`, `design-audit.md` |
| Design Handoff | `design-handoff.md`, `design-handoff-slack.md` |
| PMM Video Brief | `pmm-video-brief.md` |
| README | `README.md` (per-initiative context) |

### Sub-Initiative Structure (Chief of Staff Example)

Parent initiative `chief-of-staff-experience` has sub-initiatives, each with their own full doc set:

- `meeting-summary`, `meeting-prep`, `daily-brief`, `weekly-brief`, `action-items`

Each sub-initiative folder contains: `prd.md`, `research.md`, `design-brief.md`, `engineering-spec.md`, `gtm-brief.md`, `prototype-notes.md`, `METRICS.md`, `competitive-landscape.md`, `handoff-readiness.md`, etc.

### Consolidated Doc Type Taxonomy for Notion

| Type | Description | Phase |
|------|-------------|-------|
| **prd** | Product requirements document | Define+ |
| **research** | User research, JTBD, evidence | Discovery, Define |
| **design-brief** | UX/UI design direction | Define |
| **engineering-spec** | Technical specification | Build |
| **gtm-brief** | Go-to-market, launch materials | Build, Launch |
| **prototype-notes** | Prototype flows, validation notes | Define, Build |
| **decisions** | Decision log (ADR-style) | All |
| **metrics** | Success metrics, baselines | Build, Validate |
| **competitive-landscape** | Competitive analysis | Discovery, Define |
| **placement-research** | Where features live in app | Define |
| **jury-validation** | Jury evaluations, validation reports | Define, Validate |
| **customer-story** | Customer narrative for GTM | Build |
| **design-review** | Design QA / audit | Define, Build |
| **initiative-map** | Parent/child scope mapping | Define |

---

## Part 2: Notion Sidebar Best Practices (Research Summary)

### Official Notion Guidance

1. **Top-level pages should be minimal** — "Stick to a small number of top-level pages and file all your other pages and work inside of them."
2. **Teamspaces = primary structure** — Each teamspace (e.g., Product) should reflect a department or project. Only join teamspaces relevant to daily work.
3. **Top-level pages = departments/areas** — Give each team its own top-level page that acts as a wiki. Use toggles to expand/collapse sub-pages.
4. **Databases can be tagged** — Notion uses "a series of tags to organize these by department or type" (e.g., Meeting Notes, Docs databases with tags).
5. **Drag-and-drop** — New pages belong inside top-level containers, not at root.
6. **Archive page** — Create an archive for old projects to reduce clutter.
7. **Favorites** — Rotate favorites based on current work; don't over-favorite.

### Recommended Product Teamspace Structure

```
Product (teamspace)
├── Product Home                    ← Single entry point
│   ├── 📁 Definition                ← New: consolidates all artifact work
│   │   ├── Projects Database        (linked view: active projects)
│   │   ├── Documents Database       (linked view: by initiative)
│   │   └── Launch Tracker           (linked view)
│   ├── 📁 Feedback & Signals
│   │   ├── Product Feedback         (existing DB)
│   │   └── Tasks                    (optional, if product-specific)
│   ├── 📁 Strategy & Context
│   │   ├── Product Strategy
│   │   ├── Customer Personas
│   │   └── Product Pillars
│   ├── 📁 Roadmap & Planning
│   │   └── 2026 Feb Roadmap Brief
│   ├── 📁 Templates
│   │   ├── Product Brief Template
│   │   └── DEFINITION OF DONE
│   └── 📁 Archive
│       └── (moved completed/deprecated pages)
└── [Minimal other top-level; everything else nested]
```

### Sidebar Cleanup Actions

1. **Create 5–6 top-level containers** under Product Home: Definition, Feedback & Signals, Strategy & Context, Roadmap & Planning, Templates, Archive.
2. **Move all standalone pages** into the appropriate container. Nothing should sit at the same level as "Product Home" except these containers.
3. **Hide databases from sidebar** — Databases don't need to appear in the sidebar; they can live as sub-pages or linked views inside Definition.
4. **Archive** — Move "Voice Prints - PRD," "Signals - PRD," "Onboarding - PRD" (and similar) into Archive or into the Documents database linked to Projects.

---

## Part 3: Database Strategy — Single vs Multiple

### Current Notion Databases (from notion-sync skill)

| Database | Purpose | Relation to Projects |
|----------|---------|----------------------|
| Projects | Main execution tracking | — |
| Engineering Specs | Technical specs | Related Project |
| Design Briefs | Design documentation | Related Project |
| Launch Planning | Ship dates & rollout | Projects Database |
| Roadmap | Strategic initiatives | — |
| Feedback | Customer signals | — |

### Recommendation: Add One "Documents" Database

**Do not** create a separate database for each doc type (PRD, Research, Decisions, etc.). That would create:

- 14+ databases to maintain
- Duplicate relation logic
- Sync complexity with PM workspace

**Instead:** Add a single **Product Documents** database with:

| Property | Type | Purpose |
|----------|------|---------|
| Name | Title | Document name |
| Type | Select | `prd`, `research`, `design-brief`, `engineering-spec`, `gtm-brief`, `prototype-notes`, `decisions`, `metrics`, `competitive-landscape`, `placement-research`, `jury-validation`, `customer-story`, `design-review`, `initiative-map` |
| Project | Relation | → Projects Database |
| Phase | Select | Discovery, Define, Build, Validate, Launch |
| Status | Select | Draft, In Progress, Review, Complete |
| Owner | Person | Optional |
| PM Workspace Path | URL or Text | Link to `pm-workspace-docs/initiatives/active/[name]/` |
| Last Synced | Date | For sync operations |

**Keep Engineering Specs and Design Briefs as separate DBs** — They already have rich schemas (Linear Epic, Figma Link, Complexity, etc.) and established sync workflows. The Documents database covers the *gap*: PRDs, research, decisions, prototype notes, competitive landscape, etc., which currently live as standalone pages.

### Initiative-Centric Views

Inside each **Project** page in the Projects database:

1. Add a **linked database** block: "Documents" filtered by `Project = [this project]`.
2. Group by `Type` to show PRD, research, decisions, etc., in one place.
3. This mimics the PM workspace folder: `initiatives/active/[name]/` with multiple doc types.

### Sub-Initiative Support

For parent initiatives with sub-initiatives (e.g., Chief of Staff):

- **Option A:** Projects database has a "Parent Project" relation. Sub-initiatives are separate project rows; Documents link to the sub-initiative project.
- **Option B:** Add an "Initiative" text property to Documents for `chief-of-staff/daily-brief`-style naming when the structure is hierarchical.

---

## Part 4: Migration Plan

### Phase 1: Sidebar Restructure (1–2 hours)

1. Under Product Home, create pages: `Definition`, `Feedback & Signals`, `Strategy & Context`, `Roadmap & Planning`, `Templates`, `Archive`.
2. Move existing pages into these containers per the mapping above.
3. Collapse containers in the sidebar so only 6 items show under Product Home.

### Phase 2: Create Documents Database (30 min)

1. Create new database: "Product Documents."
2. Add properties: Name, Type (Select), Project (Relation → Projects), Phase, Status, Owner, PM Workspace Path.
3. Add database to the Definition container (or as a sub-page of Definition).

### Phase 3: Migrate Standalone Docs (2–4 hours)

1. For each standalone PRD/research/decisions page:
   - Create a new row in Product Documents.
   - Set Type, link to Project, add PM Workspace Path if exists locally.
   - Move original page content into the new database row (or link to it as a child page).
2. Archive or delete the old top-level pages.

### Phase 4: Add Project-Linked Views

1. Open each active Project page.
2. Add a linked database block: Product Documents, filter `Project contains [this page]`, group by Type.
3. Ensures each initiative has a "documents" view matching the PM workspace folder.

### Phase 5: Sync & Notion MCP Updates

1. Update `notion-sync` skill / `_meta.json` schema to include `product_documents` in `notion_artifacts` or equivalent.
2. Update notion-admin audit to check for orphaned documents, missing Project links.

---

## Part 5: Mapping Standalone Pages → Containers

Based on the screenshot and common patterns:

| Current Page | Target Container |
|--------------|-------------------|
| Product Brief Template | Templates |
| Product brief - CRM u... | → Documents DB + Archive or Strategy |
| Product Strategy + All.. | Strategy & Context |
| 2026 Feb Roadmap Br. | Roadmap & Planning |
| Customer Personas | Strategy & Context |
| DEFINITION OF DONE | Templates |
| Voice Prints - PRD | → Documents DB (type: prd, project: Voice Prints) |
| Signals - PRD | → Documents DB |
| Onboarding - PRD | → Documents DB |
| Product Process / Tools | Strategy & Context or Definition |
| Projects Database | Definition (or keep as top-level under Product Home) |
| Product Feedback | Feedback & Signals |
| Launch Tracker | Definition |
| Tasks | Feedback & Signals or Definition |
| Product Pillars | Strategy & Context |
| Knowledge Base | Strategy & Context |
| Meeting Notes | Feedback & Signals or separate Meetings container |

---

## Part 6: Success Criteria

- [ ] Product Home sidebar shows ≤7 expandable sections; no flat list of 20+ items.
- [ ] All definition work (PRDs, research, decisions, etc.) lives in Product Documents or in Engineering Specs / Design Briefs DBs, linked to Projects.
- [ ] Each Project page has a "Documents" linked view showing all artifacts for that initiative.
- [ ] Document types align with PM workspace taxonomy (14 types).
- [ ] notion-sync can map Documents DB to local `initiatives/active/*/` structure.
- [ ] Archive contains deprecated/old initiative docs; active work is in Databases.

---

## Appendix: Doc Type → Notion Type Mapping

| PM Workspace File | Notion Documents Type |
|-------------------|------------------------|
| prd.md | prd |
| research.md | research |
| design-brief.md | design-brief |
| engineering-spec.md | (keep in Engineering Specs DB) |
| gtm-brief.md | gtm-brief |
| prototype-notes.md | prototype-notes |
| decisions.md | decisions |
| METRICS.md | metrics |
| competitive-landscape*.md | competitive-landscape |
| placement-research.md | placement-research |
| jury-evaluations/*.md | jury-validation |
| validation-report*.md | jury-validation |
| customer-story.md | customer-story |
| design-review.md, design-audit.md | design-review |
| initiative-map.md | initiative-map |
