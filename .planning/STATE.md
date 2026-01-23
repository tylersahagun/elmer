# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-22)

**Core value:** Every product decision traces back to user evidence. No more lost feedback, no more "why did we build this?"
**Current focus:** Phase 16 - Classification & Clustering (Phase 15 complete)

## Current Position

Phase: 15 of 20 (Signal Extraction & Embedding) - COMPLETE
Plan: 3 of 3 complete
Status: Phase complete
Last activity: 2026-01-23 - Completed 15-03-PLAN.md (/ingest Endpoint and Processing Integration)

Progress: [██████░░░░] 65%

## Performance Metrics

**Previous Milestone (v1.0 Multi-User Collaboration):**
- Total plans completed: 24
- Total execution time: ~360 minutes
- Phases: 10 (all complete)

**Current Milestone (v1.1 Signals System):**
- Total plans completed: 26
- Phases: 10 (Phases 11-20)
- Phase 11: 1/1 plans complete (verified)
- Phase 12: 3/3 plans complete (verified)
- Phase 12.5: 4/4 plans complete (verified)
- Phase 13: 2/2 plans complete (verified)
- Phase 14: 4/4 plans complete (verified)
- Phase 14.5: 3/3 plans complete (verified)
- Phase 14.6: 3/3 plans complete (verified)
- Phase 15: 3/3 plans complete (verified)

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

### Pending Todos

- Configure Google OAuth credentials in Google Cloud Console (v1.0 - PAUSED)
- Configure email service for password reset (v1.0 - PAUSED)
- Configure email service for invitations (v1.0 - PAUSED)
- Run migration for integrations table: `npx drizzle-kit migrate`
- Add OPENAI_API_KEY to .env.local for embeddings functionality
- Add ANTHROPIC_API_KEY to .env.local for signal extraction

### Blockers/Concerns

- None for v1.1 - signals system is self-contained

## Session Continuity

Last session: 2026-01-23
Stopped at: Completed 15-03-PLAN.md (/ingest Endpoint and Processing Integration)
Resume file: None
Next steps:
  - Phase 15 complete - proceed to Phase 16 (Classification & Clustering)
  - Embeddings now generated for all signal sources
  - Ready for similarity search and clustering features
