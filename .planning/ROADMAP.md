# Roadmap: Elmer v1.1 Signals System

## Milestones

- v1.0 Multi-User Collaboration - Phases 1-10 (shipped 2026-01-22)
- **v1.1 Signals System** - Phases 11-20 (in progress)

## Overview

The Signals System transforms Elmer from a project management tool into a user evidence platform. Signals flow in from multiple sources (webhooks, uploads, manual entry), get processed through an intelligence layer (extraction, classification, clustering), and link to projects with full provenance tracking. Every PRD decision traces back to the user feedback that sparked it.

This roadmap delivers the three-layer architecture: Ingestion (Phases 11-14.6), Intelligence (Phases 15-16), and Integration (Phases 17-20). Foundation phases establish schema and UI, ingestion phases handle multi-source input, intelligence phases add AI processing, and integration phases connect signals to projects with provenance.

## Phases

**Phase Numbering:**
- Continues from v1.0 (Phases 1-10 complete)
- Integer phases (11, 12, 13): Planned milestone work
- Decimal phases (12.5, 14.5, 14.6): Scoped insertions for better parallelization

**Parallelization Note:**
Phases 12 and 13 both depend only on Phase 11, enabling parallel execution:
```
       +--> 12 (UI) --> 12.5 (Manual Association)
11 ----+
       +--> 13 (Webhook) --> 14 --> 14.5 --> 14.6
```

- [x] **Phase 11: Signal Schema & Storage** - Foundation tables and core data model
- [x] **Phase 12: Signal Management UI** - List, search, filter, and manual entry
- [x] **Phase 12.5: Manual Association** - Basic link/unlink signals to projects/personas
- [x] **Phase 13: Webhook Ingestion** - Core webhook infrastructure with queue-first pattern
- [x] **Phase 14: File & Paste Upload** - Upload documents/transcripts and paste text
- [x] **Phase 14.5: Video Caption Fetch** - Fetch existing captions from YouTube/Loom APIs
- [x] **Phase 14.6: Third-Party Integrations** - Pylon and Slack integrations
- [x] **Phase 15: Signal Extraction & Embedding** - LLM extraction and vector embeddings
- [x] **Phase 16: Classification & Clustering** - Auto-classify and semantic clustering
- [x] **Phase 17: Smart Association** - AI-suggested links and bulk operations
- [x] **Phase 18: Provenance & PRD Citation** - Project integration and evidence tracking
- [x] **Phase 18.1: Wire Cluster-to-Project Creation** - Connect orphaned modal to UI
- [x] **Phase 19: Workflow Automation** - Auto triggers and notification thresholds
- [ ] **Phase 20: Maintenance Agents** - Cleanup, orphan detection, and archival

## Phase Details

### Phase 11: Signal Schema & Storage
**Goal**: Establish the data foundation for signals with schema, storage, and source tracking
**Depends on**: v1.0 complete (workspace and auth infrastructure)
**Requirements**: SGNL-01, SGNL-02, SGNL-07, SGNL-08
**Success Criteria** (what must be TRUE):
  1. Signal table exists with source, verbatim, interpretation, severity, frequency fields
  2. Signals are associated with workspaces (workspace-scoped data)
  3. Source attribution captures where signal originated (Slack, email, interview, webhook)
  4. Status tracking shows signal lifecycle (new, reviewed, linked, archived)
**Plans**: 1 plan

Plans:
- [x] 11-01-PLAN.md — Schema definitions, types, relations, and migration

---

### Phase 12: Signal Management UI
**Goal**: Users can view, search, filter, and manually create signals
**Depends on**: Phase 11
**Parallel with**: Phase 13 (both depend only on Phase 11)
**Requirements**: SGNL-03, SGNL-04, SGNL-05, SGNL-06
**Success Criteria** (what must be TRUE):
  1. User can paste or type feedback directly to create a signal
  2. User can view paginated list of all signals in workspace
  3. User can search signals by keyword and find matching results
  4. User can filter signals by date range, source type, and status
**Plans**: 3 plans

Plans:
- [x] 12-01-PLAN.md — Signal CRUD API endpoints with filtering, pagination, and search
- [x] 12-02-PLAN.md — Signals table UI with search, filters, pagination, and sorting
- [x] 12-03-PLAN.md — Create and Detail modals for signal entry and viewing/editing

---

### Phase 12.5: Manual Association
**Goal**: Users can manually link and unlink signals to projects and personas (P0 table stakes)
**Depends on**: Phase 12
**Requirements**: ASSC-01, ASSC-02, ASSC-03, ASSC-04, ASSC-05
**Success Criteria** (what must be TRUE):
  1. User can link a signal to one or more projects (many-to-many)
  2. User can link a signal to a persona (build evidence library)
  3. User can unlink signals from projects or personas
  4. User can view all signals linked to a specific project
  5. User can view all signals linked to a specific persona
**Plans**: 4 plans

Plans:
- [x] 12.5-01-PLAN.md — API routes for link/unlink operations (projects and personas)
- [x] 12.5-02-PLAN.md — Signal modal extensions for inline project/persona linking
- [x] 12.5-03-PLAN.md — SignalRow badge visibility for projects and personas
- [x] 12.5-04-PLAN.md — Project page signals section with bulk linking modal

---

### Phase 13: Webhook Ingestion
**Goal**: External systems can post signals via authenticated webhooks with reliable delivery
**Depends on**: Phase 11
**Parallel with**: Phase 12 (both depend only on Phase 11)
**Requirements**: INGST-01, INGST-02, INGST-03
**Success Criteria** (what must be TRUE):
  1. Webhook endpoint accepts POST requests from external sources (Ask Elephant, etc.)
  2. Webhooks are authenticated via API key or HMAC signature verification
  3. Webhook returns 200 within 5 seconds (queue-first, async processing)
  4. Duplicate webhooks are handled idempotently (no duplicate signals)
**Plans**: 2 plans

Plans:
- [x] 13-01-PLAN.md — WebhookKeys schema table and database migration
- [x] 13-02-PLAN.md — Webhook auth utilities and /api/webhooks/signals endpoint

---

### Phase 14: File & Paste Upload
**Goal**: Users can ingest signals from uploaded files (paste text already exists from Phase 12)
**Depends on**: Phase 13
**Requirements**: INGST-04, INGST-05
**Success Criteria** (what must be TRUE):
  1. User can upload documents and transcripts (PDF, CSV, TXT) to create signals
  2. User can paste text with source selection to create a signal (pre-existing from Phase 12)
  3. Uploaded files are processed and signal created with source attribution
**Note**: Success criterion 2 (paste text) was already delivered in Phase 12 via CreateSignalModal. This phase adds FILE upload capability.
**Plans**: 4 plans

Plans:
- [x] 14-01-PLAN.md — File parsing infrastructure (unpdf, papaparse, validators)
- [x] 14-02-PLAN.md — Upload API endpoint with text extraction and signal creation
- [x] 14-03-PLAN.md — FileDropZone and FileUploadTab components
- [x] 14-04-PLAN.md — CreateSignalModal tabbed interface integration

---

### Phase 14.5: Video Caption Fetch
**Goal**: Users can create signals from YouTube video links by fetching existing captions
**Depends on**: Phase 14
**Requirements**: INGST-06, INGST-07
**Success Criteria** (what must be TRUE):
  1. User can input YouTube link and system fetches existing captions via library
  2. Timestamps are extracted and preserved in signal verbatim
  3. Signal created with video source attribution and link to original
  4. Loom URLs show "coming soon" message (deferred pending official API)
**Note**: This is NOT transcription. We fetch pre-existing captions using youtube-caption-extractor library. Loom support deferred due to lack of official API.
**Plans**: 3 plans

Plans:
- [x] 14.5-01-PLAN.md — Video caption infrastructure (validators, formatters, extractCaptions)
- [x] 14.5-02-PLAN.md — /api/signals/video endpoint with caption fetch and signal creation
- [x] 14.5-03-PLAN.md — VideoLinkTab component and CreateSignalModal third tab integration

---

### Phase 14.6: Third-Party Integrations
**Goal**: Signals flow in from Pylon support tickets and Slack channel messages
**Depends on**: Phase 14.5
**Requirements**: INGST-08, INGST-09
**Success Criteria** (what must be TRUE):
  1. Pylon integration can be configured to flow support tickets into signals
  2. Slack integration can be configured to flow channel messages into signals
  3. Integration credentials stored securely per workspace
  4. Source attribution clearly shows Pylon or Slack origin
**Plans**: 3 plans

Plans:
- [x] 14.6-01-PLAN.md — Integrations schema table and database migration
- [x] 14.6-02-PLAN.md — Integration utilities (Slack/Pylon signature verification, signal creation)
- [x] 14.6-03-PLAN.md — Pylon and Slack webhook endpoints

---

### Phase 15: Signal Extraction & Embedding
**Goal**: Raw signals are processed into structured data with semantic embeddings
**Depends on**: Phase 11 (works on ANY signal regardless of ingestion source)
**Requirements**: INTL-03, INTL-04, INTL-06
**Success Criteria** (what must be TRUE):
  1. LLM extracts structured data from raw input (severity, frequency, user segment)
  2. Signals have embeddings generated (OpenAI text-embedding-3-small)
  3. `/ingest` command processes raw input into structured signal
  4. Raw content is preserved alongside extracted structure
**Plans**: 3 plans

Plans:
- [x] 15-01-PLAN.md — AI Infrastructure (OpenAI SDK, extraction module, embeddings module)
- [x] 15-02-PLAN.md — Signal Processor (processing orchestration, batch processing)
- [x] 15-03-PLAN.md — /ingest endpoint and processing integration across all signal sources

---

### Phase 16: Classification & Clustering
**Goal**: Signals are auto-classified to projects and clustered by semantic similarity
**Depends on**: Phase 15
**Requirements**: INTL-01, INTL-02, INTL-05, INTL-07
**Success Criteria** (what must be TRUE):
  1. System auto-classifies signals as "belongs to Project X" or "new initiative"
  2. Classification includes confidence score with configurable threshold
  3. Related signals cluster together by semantic similarity (pgvector)
  4. `/synthesize` command finds patterns and proposes new initiatives from clusters
**Plans**: 3 plans

Plans:
- [x] 16-01-PLAN.md — pgvector migration, native vector columns, and HNSW indexes
- [x] 16-02-PLAN.md — Two-tier hybrid classifier (embedding similarity + LLM verification)
- [x] 16-03-PLAN.md — K-NN clustering, /synthesize endpoint, and similar signals API

---

### Phase 17: Smart Association
**Goal**: AI-suggested signal linking and bulk operations (builds on Phase 12.5 manual linking)
**Depends on**: Phase 16, Phase 12.5
**Requirements**: ASSC-06
**Success Criteria** (what must be TRUE):
  1. User can bulk link/unlink multiple signals at once
  2. System suggests relevant projects for unlinked signals based on classification
  3. User can accept/reject AI-suggested associations
  4. Bulk operations respect existing manual associations
**Plans**: 4 plans

Plans:
- [x] 17-01-PLAN.md — Schema & Suggestions API (dismiss columns, GET suggestions, POST dismiss)
- [x] 17-02-PLAN.md — Bulk Operations API (atomic bulk link/unlink endpoint)
- [x] 17-03-PLAN.md — Suggestions UI (SuggestionCard, SignalSuggestionsBanner)
- [x] 17-04-PLAN.md — Bulk Operations UI (multi-select, toolbar, modals)

---

### Phase 18: Provenance & PRD Citation
**Goal**: Projects show signal evidence with provenance tracking and PRD citation
**Depends on**: Phase 17
**Requirements**: PROV-01, PROV-02, PROV-03, PROV-04, PROV-05, PROV-06
**Success Criteria** (what must be TRUE):
  1. Project page shows linked signals as evidence section
  2. "Signals that informed this project" section visible on project detail
  3. Provenance chain is immutable (junction table with link reason preserved)
  4. Generated PRDs automatically cite linked signals as evidence
  5. User can create new project from a cluster of related signals
  6. Project cards show signal count badge
**Plans**: 3 plans

Plans:
- [x] 18-01-PLAN.md — Enhanced provenance display (LinkedSignalsSection with who/when/why)
- [x] 18-02-PLAN.md — PRD citation (signal evidence injection in prd-executor)
- [x] 18-03-PLAN.md — Project from cluster and signal count badges

---

### Phase 18.1: Wire Cluster-to-Project Creation
**Goal**: Enable users to create projects from signal clusters by connecting the orphaned CreateProjectFromClusterModal to the UI
**Depends on**: Phase 18
**Requirements**: PROV-05 (gap closure)
**Gap Closure**: Closes verification gap from Phase 18 - CreateProjectFromClusterModal exists but not wired into UI
**Success Criteria** (what must be TRUE):
  1. User can view signal clusters on a dedicated UI page or section
  2. Each cluster display has a "Create Project" action/button
  3. Clicking "Create Project" opens CreateProjectFromClusterModal with cluster data
  4. Modal successfully creates project and links signals with cluster theme as provenance
**Plans**: 1 plan

Plans:
- [x] 18.1-01-PLAN.md — SignalClustersPanel component and signals page integration

---

### Phase 19: Workflow Automation
**Goal**: System automatically triggers actions based on signal patterns and thresholds
**Depends on**: Phase 18
**Requirements**: AUTO-01, AUTO-02, AUTO-03, AUTO-04
**Success Criteria** (what must be TRUE):
  1. User can configure automation depth per workflow stage
  2. System auto-triggers PRD generation when N+ signals cluster on unlinked topic
  3. Notifications only fire when configurable thresholds are met
  4. System auto-creates initiatives from signal clusters above threshold
**Plans**: 6 plans

Plans:
- [x] 19-01-PLAN.md — Schema and types (SignalAutomationSettings, automationActions table)
- [x] 19-02-PLAN.md — Automation core (signal-automation, auto-actions, rate-limiter modules)
- [x] 19-03-PLAN.md — Notification threshold filtering
- [x] 19-04-PLAN.md — Event integration and cron endpoint
- [x] 19-05-PLAN.md — Settings UI (SignalAutomationSettingsPanel in workspace settings)
- [x] 19-06-PLAN.md — Notification wiring (gap closure for AUTO-03)

---

### Phase 20: Maintenance Agents
**Goal**: System maintains signal hygiene with cleanup suggestions and archival
**Depends on**: Phase 19
**Requirements**: MAINT-01, MAINT-02, MAINT-03, MAINT-04
**Success Criteria** (what must be TRUE):
  1. Cleanup agent suggests signal-to-project associations for unlinked signals
  2. System detects and flags orphan signals after configurable days
  3. System detects duplicate signals and suggests merges
  4. Signal archival workflow moves old signals to archived status
**Plans**: 5 plans

Plans:
- [ ] 20-01-PLAN.md — MaintenanceSettings schema and defaults
- [ ] 20-02-PLAN.md — Orphan and duplicate detection modules
- [ ] 20-03-PLAN.md — Archival and merge workflow modules
- [ ] 20-04-PLAN.md — Maintenance cron and API endpoints
- [ ] 20-05-PLAN.md — Maintenance UI components (banner, cards, settings panel)

---

## Progress

**Execution Order:**
Phases 12 and 13 can run in parallel after Phase 11 completes.
```
11 --> 12 --> 12.5 -----------------------> 17 --> 18 --> 18.1 --> 19 --> 20
  \--> 13 --> 14 --> 14.5 --> 14.6 --> 15 --> 16 --^
```

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 11. Signal Schema & Storage | 1/1 | Complete | 2026-01-22 |
| 12. Signal Management UI | 3/3 | Complete | 2026-01-22 |
| 12.5. Manual Association | 4/4 | Complete | 2026-01-22 |
| 13. Webhook Ingestion | 2/2 | Complete | 2026-01-22 |
| 14. File & Paste Upload | 4/4 | Complete | 2026-01-23 |
| 14.5. Video Caption Fetch | 3/3 | Complete | 2026-01-23 |
| 14.6. Third-Party Integrations | 3/3 | Complete | 2026-01-23 |
| 15. Signal Extraction & Embedding | 3/3 | Complete | 2026-01-23 |
| 16. Classification & Clustering | 3/3 | Complete | 2026-01-23 |
| 17. Smart Association | 4/4 | Complete | 2026-01-23 |
| 18. Provenance & PRD Citation | 3/3 | Complete | 2026-01-24 |
| 18.1. Wire Cluster-to-Project Creation | 1/1 | Complete | 2026-01-24 |
| 19. Workflow Automation | 6/6 | Complete | 2026-01-24 |
| 20. Maintenance Agents | 0/5 | Planning complete | - |

---
*Roadmap created: 2026-01-22*
*Roadmap revised: 2026-01-24 (Phase 20 planned - 5 plans in 3 waves)*
*Milestone: v1.1 Signals System*
*Phases: 11-20 (continues from v1.0)*
