# Requirements: Elmer v1.1 Signals System

**Defined:** 2026-01-22
**Core Value:** Every product decision traces back to user evidence. Signals flow in, get processed, route to projects, and become the provenance chain for PRDs and prototypes.

## v1.1 Requirements

Requirements for signals system release. Each maps to roadmap phases.

### Signal Foundation

- [ ] **SGNL-01**: Signal schema with source, verbatim, interpretation, severity, frequency fields
- [ ] **SGNL-02**: Signal storage in database with workspace association
- [ ] **SGNL-03**: Manual signal entry form (paste/type feedback)
- [ ] **SGNL-04**: Signal list view with pagination
- [ ] **SGNL-05**: Search signals by keyword
- [ ] **SGNL-06**: Filter signals by date, source, status
- [ ] **SGNL-07**: Source attribution field (Slack, email, interview, webhook, etc.)
- [ ] **SGNL-08**: Status tracking (new, reviewed, linked, archived)

### Signal Ingestion

- [ ] **INGST-01**: Webhook endpoint to receive signals from external sources
- [ ] **INGST-02**: Webhook authentication (API key or signature verification)
- [ ] **INGST-03**: Queue-first webhook pattern (fast ACK, async processing)
- [ ] **INGST-04**: File upload for documents and transcripts
- [ ] **INGST-05**: Paste text entry with source selection
- [ ] **INGST-06**: Video link input (YouTube, Loom)
- [ ] **INGST-07**: Video timestamp extraction from links
- [ ] **INGST-08**: Pylon integration for support ticket ingestion
- [ ] **INGST-09**: Slack integration for channel message ingestion

### Signal Intelligence

- [ ] **INTL-01**: Auto-classify signal: "belongs to Project X" vs "new initiative"
- [ ] **INTL-02**: Classification confidence score with threshold
- [ ] **INTL-03**: Extract structured data: severity, frequency, user segment
- [ ] **INTL-04**: Generate embeddings for signals (OpenAI text-embedding-3-small)
- [ ] **INTL-05**: Cluster related signals by semantic similarity
- [ ] **INTL-06**: `/ingest` command to process raw input into structured signal
- [ ] **INTL-07**: `/synthesize` command to find patterns and propose initiatives

### Signal Association

- [ ] **ASSC-01**: Link signal to existing project (many-to-many)
- [ ] **ASSC-02**: Link signal to persona (build persona evidence library)
- [ ] **ASSC-03**: Unlink signal from project/persona
- [ ] **ASSC-04**: View all signals linked to a project
- [ ] **ASSC-05**: View all signals linked to a persona
- [ ] **ASSC-06**: Bulk link/unlink signals

### Signal → Project Integration

- [ ] **PROV-01**: Signals visible on project page as linked evidence
- [ ] **PROV-02**: "Signals that informed this project" section on project detail
- [ ] **PROV-03**: Provenance chain: immutable junction table with link reason
- [ ] **PROV-04**: PRD citation: auto-cite signals in generated PRDs
- [ ] **PROV-05**: Create new project from clustered signals
- [ ] **PROV-06**: Signal count badge on project cards

### Automation & Workflow

- [ ] **AUTO-01**: Configurable automation depth per workflow stage
- [ ] **AUTO-02**: Auto-PRD trigger when N+ signals cluster on unlinked topic
- [ ] **AUTO-03**: Notification thresholds (only notify when criteria met)
- [ ] **AUTO-04**: Signal → initiative auto-creation from clusters

### Maintenance & Hygiene

- [ ] **MAINT-01**: Cleanup agent: suggest signal → project associations
- [ ] **MAINT-02**: Orphan signal detection (flag unlinked signals after X days)
- [ ] **MAINT-03**: Duplicate signal detection and merge suggestion
- [ ] **MAINT-04**: Signal archival workflow

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Enhanced Intelligence

- **INTL-V2-01**: AI-suggested tags based on content
- **INTL-V2-02**: Signal strength scoring (frequency × severity × segment value)
- **INTL-V2-03**: Trend detection (alert when theme volume spikes)
- **INTL-V2-04**: Adaptive taxonomy (categories evolve with product)

### Additional Integrations

- **INGST-V2-01**: Intercom integration
- **INGST-V2-02**: Zendesk integration
- **INGST-V2-03**: Linear issue ingestion
- **INGST-V2-04**: Email forwarding ingestion

### Advanced Features

- **ADV-V2-01**: Revenue attribution (link signal to customer ARR)
- **ADV-V2-02**: Customer segment weighting
- **ADV-V2-03**: Evidence dashboard ("why we built this" view)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Audio/video transcription | Handled externally by Ask Elephant; elmer receives pre-transcribed text |
| Public voting board | Creates vocal minority bias, popularity contest; PM judgment preferred |
| Customer-facing feedback portal | Support/spam burden; signals come from curated sources |
| Feature roadmap publishing | Over-commitment risk; separate changelog after ship |
| Real-time notifications | Notification fatigue; batch digests and threshold-based only |
| Granular per-signal permissions | Complexity; workspace-level permissions sufficient |
| Custom signal fields | Schema fragmentation; standardized extraction + interpretation field |
| Signal assignment to team member | Creates ownership silos; tag for topic instead |
| Customer response/reply | Scope creep into CRM; use source system for communication |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| SGNL-01 | TBD | Pending |
| SGNL-02 | TBD | Pending |
| SGNL-03 | TBD | Pending |
| SGNL-04 | TBD | Pending |
| SGNL-05 | TBD | Pending |
| SGNL-06 | TBD | Pending |
| SGNL-07 | TBD | Pending |
| SGNL-08 | TBD | Pending |
| INGST-01 | TBD | Pending |
| INGST-02 | TBD | Pending |
| INGST-03 | TBD | Pending |
| INGST-04 | TBD | Pending |
| INGST-05 | TBD | Pending |
| INGST-06 | TBD | Pending |
| INGST-07 | TBD | Pending |
| INGST-08 | TBD | Pending |
| INGST-09 | TBD | Pending |
| INTL-01 | TBD | Pending |
| INTL-02 | TBD | Pending |
| INTL-03 | TBD | Pending |
| INTL-04 | TBD | Pending |
| INTL-05 | TBD | Pending |
| INTL-06 | TBD | Pending |
| INTL-07 | TBD | Pending |
| ASSC-01 | TBD | Pending |
| ASSC-02 | TBD | Pending |
| ASSC-03 | TBD | Pending |
| ASSC-04 | TBD | Pending |
| ASSC-05 | TBD | Pending |
| ASSC-06 | TBD | Pending |
| PROV-01 | TBD | Pending |
| PROV-02 | TBD | Pending |
| PROV-03 | TBD | Pending |
| PROV-04 | TBD | Pending |
| PROV-05 | TBD | Pending |
| PROV-06 | TBD | Pending |
| AUTO-01 | TBD | Pending |
| AUTO-02 | TBD | Pending |
| AUTO-03 | TBD | Pending |
| AUTO-04 | TBD | Pending |
| MAINT-01 | TBD | Pending |
| MAINT-02 | TBD | Pending |
| MAINT-03 | TBD | Pending |
| MAINT-04 | TBD | Pending |

**Coverage:**
- v1.1 requirements: 44 total
- Mapped to phases: 0 (pending roadmap creation)
- Unmapped: 44

---
*Requirements defined: 2026-01-22*
*Last updated: 2026-01-22 after initial definition*
