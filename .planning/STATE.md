# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-22)

**Core value:** Every product decision traces back to user evidence. No more lost feedback, no more "why did we build this?"
**Current focus:** Phase 20 - Maintenance Agents (In Progress)

## Current Position

Phase: 20 of 20 (Maintenance Agents)
Plan: 2 of TBD
Status: In progress
Last activity: 2026-01-24 - Completed 20-02-PLAN.md (Detection Layer)

Progress: [██████████] 97%

## Performance Metrics

**Previous Milestone (v1.0 Multi-User Collaboration):**
- Total plans completed: 24
- Total execution time: ~360 minutes
- Phases: 10 (all complete)

**Current Milestone (v1.1 Signals System):**
- Total plans completed: 45
- Phases: 11 (Phases 11-20, including 18.1 gap closure)
- Phase 11: 1/1 plans complete (verified)
- Phase 12: 3/3 plans complete (verified)
- Phase 12.5: 4/4 plans complete (verified)
- Phase 13: 2/2 plans complete (verified)
- Phase 14: 4/4 plans complete (verified)
- Phase 14.5: 3/3 plans complete (verified)
- Phase 14.6: 3/3 plans complete (verified)
- Phase 15: 3/3 plans complete (verified)
- Phase 16: 3/3 plans complete (verified)
- Phase 17: 4/4 plans complete (verified)
- Phase 18: 3/3 plans complete (verified)
- Phase 18.1: 1/1 plans complete (verified)
- Phase 19: 6/6 plans complete (verified, including gap closure)
- Phase 20: 2/TBD plans complete

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- v1.0: User-owned workspaces with three-role permission model
- v1.0: Magic links for invites only (not general auth)
- v1.1: Inbox becomes signal processing queue (not project queue)
- v1.1: Pre-transcribed text only (Ask Elephant handles transcription)
- v1.1: Three-layer architecture: Ingestion -> Intelligence -> Integration
- v1.1: Provenance chain for PRDs (every decision traces to user evidence)
- v1.1 (11-01): Union types for extensible enums (SignalStatus, SignalSource, etc.)
- v1.1 (11-01): JSONB for source metadata and AI classification
- v1.1 (11-01): personaId as text since personas are ProjectMetadata strings
- v1.1 (11-01): SET NULL for inboxItemId to preserve signals on inbox item deletion
- v1.1 (12-01): Default source to "paste" for manual signal entry
- v1.1 (12-01): Viewer access for GET, member access for POST/PATCH/DELETE signals
- v1.1 (12-01): ILIKE search on both verbatim and interpretation fields
- v1.1 (12-02): Debounce search input by 300ms to reduce API calls
- v1.1 (12-02): Default sort by createdAt descending (newest first)
- v1.1 (12-02): Reset pagination to page 1 when filters change
- v1.1 (12-03): Limit manual entry sources to paste, interview, email, other
- v1.1 (12-03): Quick status actions (Mark Reviewed, Archive) without edit mode
- v1.1 (12-03): Collapsible technical details for metadata/IDs/timestamps
- v1.1 (12.5-01): Signal status auto-updates to 'linked' on first project link
- v1.1 (12.5-01): Signal status reverts to 'reviewed' when last project unlinked
- v1.1 (12.5-01): Persona linking does not affect signal status
- v1.1 (12.5-01): Project signals ordered by linkedAt DESC
- v1.1 (12.5-03): Project badges navigate to project page in new tab
- v1.1 (12.5-03): Persona badges display personaId (no name lookup for MVP)
- v1.1 (12.5-03): Show first badge with +N count for multiple associations
- v1.1 (12.5-02): Use Select dropdown for linking (inline UX over dialog)
- v1.1 (12.5-02): Query linked data separately from signal for targeted refetch
- v1.1 (12.5-04): Section collapsed by default to reduce visual noise
- v1.1 (12.5-04): Filter out already-linked signals in picker to prevent duplicates
- v1.1 (12.5-04): Sequential linking in bulk operation for simplicity
- v1.1 (13-01): Unique constraint on apiKey ensures no duplicate keys across workspaces
- v1.1 (13-01): createdBy uses SET NULL to preserve key records after user deletion
- v1.1 (13-01): isActive flag allows deactivation without deletion for audit trail
- v1.1 (13-02): Dual auth: API key for simple integrations, HMAC for secure integrations
- v1.1 (13-02): Queue-first pattern: return 200 immediately, process via after()
- v1.1 (13-02): Check-then-insert pattern for sourceRef idempotency
- v1.1 (13-02): Never throw in after() context - log errors for debugging
- v1.1 (14-01): 5MB file size limit to stay under Vercel serverless 4.5MB body limit
- v1.1 (14-01): Both MIME type AND extension checked for defense in depth
- v1.1 (14-01): Magic bytes verification for PDFs to detect spoofed MIME types
- v1.1 (14-01): CSV rows converted to readable text format for signal verbatim
- v1.1 (14-02): File metadata stored in sourceMetadata.rawPayload for schema compatibility
- v1.1 (14-02): sourceRef format upload-{timestamp}-{nanoid(6)} for uniqueness
- v1.1 (14-03): react-dropzone for drag-and-drop (de facto React standard)
- v1.1 (14-03): Controlled file state in parent component for flexibility
- v1.1 (14-03): Error state derived from both prop and dropzone rejections
- v1.1 (14-04): Modal widened from 500px to 600px to accommodate tabs
- v1.1 (14-04): DialogFooter moved inside paste TabsContent (upload has its own)
- v1.1 (14-04): activeTab resets to paste on modal close
- v1.1 (14.5-01): youtube-caption-extractor chosen for serverless compatibility, no API key required
- v1.1 (14.5-01): Loom URLs detected but not implemented (platform='loom') for future extension
- v1.1 (14.5-01): Timestamp format: M:SS for <1hr, H:MM:SS for >=1hr
- v1.1 (14.5-01): CaptionExtractionResult interface mirrors lib/files/ExtractionResult pattern
- v1.1 (14.5-02): Loom returns 400 with helpful "coming soon" message (not 501)
- v1.1 (14.5-02): sourceRef format video-{platform}-{timestamp}-{nanoid(6)} for uniqueness
- v1.1 (14.5-02): sourceMetadata includes videoUrl, videoPlatform, sourceName, rawPayload
- v1.1 (14.5-03): Client-side URL validation hints for UX; server does real validation
- v1.1 (14.5-03): Same prop interface as FileUploadTab (workspaceId, onSuccess, onClose)
- v1.1 (14.6-01): integrations table stores per-workspace Pylon/Slack credentials
- v1.1 (14.6-01): Platform-specific fields for Slack OAuth tokens and Pylon account IDs
- v1.1 (14.6-02): Slack signature uses v0:{timestamp}:{body} format with 5-min replay window
- v1.1 (14.6-02): Pylon signature uses {timestamp}.{body} format with optional hs256= prefix
- v1.1 (14.6-02): Both use crypto.timingSafeEqual for timing-safe signature comparison
- v1.1 (14.6-03): Dedicated endpoints per platform (not overloading generic webhook)
- v1.1 (14.6-03): Pylon uses integration_id query param for workspace mapping
- v1.1 (14.6-03): Slack uses team_id from payload for workspace mapping
- v1.1 (14.6-03): Slack endpoint handles url_verification challenge for setup
- v1.1 (14.6-03): Slack filters bot messages, subtypes, and empty messages
- v1.1 (14.6-01): Union type for IntegrationPlatform (pylon | slack)
- v1.1 (14.6-01): OAuth tokens stored directly in integrations table for MVP
- v1.1 (14.6-01): Platform-specific fields nullable to avoid polymorphism
- v1.1 (14.6-01): IntegrationConfig as JSONB for flexible channel/event filtering
- v1.1 (14.6-02): Slack signature uses v0:{timestamp}:{body} format with 5-minute replay window
- v1.1 (14.6-02): Pylon signature uses {timestamp}.{body} format with hs256= prefix handling
- v1.1 (14.6-02): Timing-safe HMAC comparison with crypto.timingSafeEqual
- v1.1 (14.6-02): Platform-specific sourceRef patterns for idempotency
- v1.1 (14.6-03): Pylon workspace mapping via integration_id query parameter
- v1.1 (14.6-03): Slack workspace lookup via team_id from payload
- v1.1 (14.6-03): URL verification challenge handled before signature verification
- v1.1 (14.6-03): Filter bot messages and message subtypes from Slack signals
- v1.1 (15-01): OpenAI SDK v6.16.0 for text-embedding-3-small embeddings
- v1.1 (15-01): Claude claude-sonnet-4-20250514 for signal field extraction
- v1.1 (15-01): 30000 char truncation limit for embedding input
- v1.1 (15-01): Float32Array for Base64 embedding storage (matches memoryEntries pattern)
- v1.1 (15-02): processedAt set BEFORE processing to prevent duplicate processing
- v1.1 (15-02): processedAt reset to null on failure to allow retry
- v1.1 (15-02): Preserve user interpretation if already set (don't overwrite with AI)
- v1.1 (15-02): Batch size 10 with 100ms delay between batches for rate limiting
- v1.1 (15-03): Source defaults to "paste" for ingest endpoint (consistent with 12-01)
- v1.1 (15-03): sourceRef format ingest-{timestamp}-{nanoid(6)} for uniqueness
- v1.1 (16-01): Keep Base64 embedding column as backup during pgvector transition
- v1.1 (16-01): HNSW index for cosine similarity (no training required, O(log n))
- v1.1 (16-01): 1536 dimensions for text-embedding-3-small compatibility
- v1.1 (16-01): Batch size 100 for vector migration script memory efficiency
- v1.1 (16-02): Two-tier classification: embedding similarity first (free), LLM only for 0.5-0.75 ambiguous range
- v1.1 (16-02): Thresholds: >0.75 auto-classify to project, <0.5 classify as new initiative
- v1.1 (16-02): Classification failure doesn't fail signal processing (best-effort)
- v1.1 (16-02): Project embeddings generated from name + description concatenation
- v1.1 (16-03): K-NN clustering with distance threshold 0.3 (similarity > 0.7)
- v1.1 (16-03): Minimum cluster size 2 signals for pattern discovery
- v1.1 (16-03): Cluster themes generated via Claude with 5-signal context window
- v1.1 (16-03): Suggested actions based on cluster size and severity (new_project vs review)
- v1.1 (16-03): Distance threshold 0.3 for K-NN clustering (similarity > 0.7)
- v1.1 (16-03): Minimum cluster size of 2 signals to form a cluster
- v1.1 (16-03): Theme generation via Claude claude-sonnet-4-20250514 (max 100 tokens)
- v1.1 (16-03): Aggregate severity/frequency by taking highest from cluster signals
- v1.1 (16-03): Suggested action "new_project" for clusters with 3+ signals
- v1.1 (17-02): Bulk link skips signals already linked to target project
- v1.1 (17-02): Bulk unlink reverts status to "reviewed" only when no remaining project links
- v1.1 (17-02): Maximum 50 signals per bulk operation to prevent timeout
- v1.1 (17-01): 30-day window for suggestions to keep results relevant
- v1.1 (17-01): Viewer for GET suggestions, member for POST dismiss
- v1.1 (17-01): Cap suggestions limit at 50 to prevent abuse
- v1.1 (17-03): Accept mutation uses linkReason 'AI-suggested association accepted by user'
- v1.1 (17-03): Dismiss All is session-only (not persisted via API)
- v1.1 (17-03): Confidence color thresholds: green >= 80%, amber >= 60%, gray below
- v1.1 (17-03): 5-minute staleTime for suggestions query cache
- v1.1 (17-04): Set<string> for selectedSignals state (O(1) add/remove/check)
- v1.1 (17-04): Selection clears on data change to prevent stale references
- v1.1 (17-04): Toolbar only shows when signals selected (progressive disclosure)
- v1.1 (17-04): Checkbox click stops propagation to prevent row click handler
- v1.1 (18-01): LinkedSignalsSection header changed to "Signals that informed this project"
- v1.1 (18-01): Provenance display shows linkedBy name, confidence %, and linkReason
- v1.1 (18-01): getSignalsForProject joins linkedByUser relation for provenance data
- v1.1 (18-02): PRD generation fetches up to 10 linked signals for evidence
- v1.1 (18-02): "Supporting User Evidence" section injected into PRD generation prompt
- v1.1 (18-02): PRD system prompt includes citation requirements
- v1.1 (18-03): POST /api/projects/from-cluster creates project from signal cluster
- v1.1 (18-03): getProjectsWithCounts aggregates signal counts for all projects
- v1.1 (18-03): ProjectCard displays MessageSquare badge when signalCount > 0
- v1.1 (18-03): CreateProjectFromClusterModal component created but not wired to UI (gap)
- v1.1 (18-02): Limit signal citations to 10 to prevent context bloat
- v1.1 (18-02): Truncate verbatim quotes to 200 characters in PRD evidence
- v1.1 (18-02): "Supporting User Evidence" section format for PRD citations
- v1.1 (18-03): Signal count fetched via single aggregation query for efficiency
- v1.1 (18-03): MessageSquare icon for signal badge (distinct from documents/prototypes)
- v1.1 (18-03): Cluster theme becomes link reason for traceability
- v1.1 (18.1-01): Use SignalCluster type from lib/classification for type safety
- v1.1 (18.1-01): Panel placed between suggestions banner and signals table for natural flow
- v1.1 (18.1-01): Cluster cards with theme, badges (count, severity, confidence), and signal previews
- v1.1 (19-01): AutomationActionType union: initiative_created, prd_triggered, notification_sent
- v1.1 (19-01): automationDepth levels: manual, suggest, auto_create, full_auto (default: suggest)
- v1.1 (19-01): Default thresholds: 5 signals for auto-PRD, 3 for auto-initiative
- v1.1 (19-01): Cluster confidence minimum 0.7 for automation triggers
- v1.1 (19-01): Rate limiting: 10 auto-actions per day, 60 minute cooldown per cluster
- v1.1 (19-01): Duplicate notification suppression enabled by default
- v1.1 (19-03): getWorkspaceAutomationSettings merges workspace config with defaults
- v1.1 (19-03): Severity threshold uses ordered comparison (critical > high > medium > low)
- v1.1 (19-03): Duplicate suppression checks recent notifications for matching clusterId
- v1.1 (19-03): Notification priority derived from cluster severity
- v1.1 (19-02): Cluster evaluation order: already_actioned -> rate_limited -> low_confidence -> severity_filter -> below_threshold
- v1.1 (19-02): PRD generation only triggers if automationDepth is full_auto AND cluster meets autoPrdThreshold
- v1.1 (19-02): Auto-created projects have linkedBy=null to distinguish from user-linked signals
- v1.1 (19-02): Activity logs record automation as actor with userId='automation'
- v1.1 (19-04): Automation check runs after classification in signal processor
- v1.1 (19-04): Cron allows requests without secret in development for testing
- v1.1 (19-04): 5 minute max duration for cron to handle many workspaces
- v1.1 (19-04): Hourly schedule (0 * * * *) balances coverage with resource usage
- v1.1 (19-06): Single notification per cluster: auto-create and full-auto both notify after project creation, PRD is secondary action
- v1.1 (19-06): Suggest mode uses threshold >= 3 for new_project action, else review
- v1.1 (20-01): Conservative defaults: auto-archive off by default
- v1.1 (20-01): MaintenanceSettings pattern follows SignalAutomationSettings - optional JSONB in WorkspaceSettings
- v1.1 (20-01): 11 fields covering orphan detection, duplicate detection, archival, suggestions, notifications
- v1.1 (20-02): NOT EXISTS pattern for orphan detection (efficient subqueries)
- v1.1 (20-02): Raw SQL for pgvector queries (Drizzle lacks native operator support)
- v1.1 (20-02): Canonical pair IDs for duplicate deduplication (sorted signal IDs)
- v1.1 (20-02): High similarity threshold 0.9+ for duplicate detection (minimize false positives)

### Pending Todos

- Configure Google OAuth credentials in Google Cloud Console (v1.0 - PAUSED)
- Configure email service for password reset (v1.0 - PAUSED)
- Configure email service for invitations (v1.0 - PAUSED)
- Run migration for pgvector extension: `npx drizzle-kit migrate`
- Run vector migration script: `npx tsx src/lib/db/migrate-vectors.ts`
- Add OPENAI_API_KEY to .env.local for embeddings functionality
- Add ANTHROPIC_API_KEY to .env.local for signal extraction
- Generate project embeddings for existing projects (call generateProjectEmbedding)

### Blockers/Concerns

- None for v1.1 - signals system is self-contained

## Session Continuity

Last session: 2026-01-24
Stopped at: Completed 20-02-PLAN.md (Detection Layer)
Resume file: None
Next steps:
  - Continue Phase 20: Execute 20-03-PLAN.md (Archival Workflows)
  - Run database migration to enable pgvector extension
  - Run vector migration script after deploying schema changes
