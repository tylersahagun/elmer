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
- [ ] **Phase 12: Signal Management UI** - List, search, filter, and manual entry
- [ ] **Phase 12.5: Manual Association** - Basic link/unlink signals to projects/personas
- [ ] **Phase 13: Webhook Ingestion** - Core webhook infrastructure with queue-first pattern
- [ ] **Phase 14: File & Paste Upload** - Upload documents/transcripts and paste text
- [ ] **Phase 14.5: Video Caption Fetch** - Fetch existing captions from YouTube/Loom APIs
- [ ] **Phase 14.6: Third-Party Integrations** - Pylon and Slack integrations
- [ ] **Phase 15: Signal Extraction & Embedding** - LLM extraction and vector embeddings
- [ ] **Phase 16: Classification & Clustering** - Auto-classify and semantic clustering
- [ ] **Phase 17: Smart Association** - AI-suggested links and bulk operations
- [ ] **Phase 18: Provenance & PRD Citation** - Project integration and evidence tracking
- [ ] **Phase 19: Workflow Automation** - Auto triggers and notification thresholds
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
**Plans**: TBD

Plans:
- [ ] 12.5-01: TBD

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
**Plans**: TBD

Plans:
- [ ] 13-01: TBD

---

### Phase 14: File & Paste Upload
**Goal**: Users can ingest signals from uploaded files and pasted text
**Depends on**: Phase 13
**Requirements**: INGST-04, INGST-05
**Success Criteria** (what must be TRUE):
  1. User can upload documents and transcripts (PDF, CSV, TXT) to create signals
  2. User can paste text with source selection to create a signal
  3. Uploaded files are processed and signal created with source attribution
**Plans**: TBD

Plans:
- [ ] 14-01: TBD

---

### Phase 14.5: Video Caption Fetch
**Goal**: Users can create signals from video links by fetching existing captions via API
**Depends on**: Phase 14
**Requirements**: INGST-06, INGST-07
**Success Criteria** (what must be TRUE):
  1. User can input YouTube link and system fetches existing captions via YouTube API
  2. User can input Loom link and system fetches existing transcript via Loom API
  3. Timestamps are extracted and preserved in signal metadata
  4. Signal created with video source attribution and link to original
**Note**: This is NOT transcription. We fetch pre-existing captions/transcripts from video platform APIs.
**Plans**: TBD

Plans:
- [ ] 14.5-01: TBD

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
**Plans**: TBD

Plans:
- [ ] 14.6-01: TBD

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
**Plans**: TBD

Plans:
- [ ] 15-01: TBD

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
**Plans**: TBD

Plans:
- [ ] 16-01: TBD

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
**Plans**: TBD

Plans:
- [ ] 17-01: TBD

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
**Plans**: TBD

Plans:
- [ ] 18-01: TBD

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
**Plans**: TBD

Plans:
- [ ] 19-01: TBD

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
**Plans**: TBD

Plans:
- [ ] 20-01: TBD

---

## Progress

**Execution Order:**
Phases 12 and 13 can run in parallel after Phase 11 completes.
```
11 --> 12 --> 12.5 -----------------------> 17 --> 18 --> 19 --> 20
  \--> 13 --> 14 --> 14.5 --> 14.6 --> 15 --> 16 --^
```

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 11. Signal Schema & Storage | 1/1 | Complete | 2026-01-22 |
| 12. Signal Management UI | 3/3 | Complete | 2026-01-22 |
| 12.5. Manual Association | 0/TBD | Not started | - |
| 13. Webhook Ingestion | 0/TBD | Not started | - |
| 14. File & Paste Upload | 0/TBD | Not started | - |
| 14.5. Video Caption Fetch | 0/TBD | Not started | - |
| 14.6. Third-Party Integrations | 0/TBD | Not started | - |
| 15. Signal Extraction & Embedding | 0/TBD | Not started | - |
| 16. Classification & Clustering | 0/TBD | Not started | - |
| 17. Smart Association | 0/TBD | Not started | - |
| 18. Provenance & PRD Citation | 0/TBD | Not started | - |
| 19. Workflow Automation | 0/TBD | Not started | - |
| 20. Maintenance Agents | 0/TBD | Not started | - |

---
*Roadmap created: 2026-01-22*
*Roadmap revised: 2026-01-22*
*Milestone: v1.1 Signals System*
*Phases: 11-20 (continues from v1.0)*
