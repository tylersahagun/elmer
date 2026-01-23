---
phase: 15-signal-extraction-and-embedding
plan: 02
subsystem: ai
tags: [signal-processing, extraction, embedding, openai, claude, batch-processing]

# Dependency graph
requires:
  - phase: 15-01
    provides: AI modules (extraction.ts, embeddings.ts) for signal field extraction and embedding generation
  - phase: 11-01
    provides: Signal schema with embedding, severity, frequency, userSegment, processedAt fields
provides:
  - updateSignalProcessing query function for AI-processed fields
  - processSignalExtraction function for single signal processing with idempotency
  - batchProcessSignals function for bulk backfill operations
  - lib/signals barrel export for clean imports
affects: [15-03, signal-ingestion, batch-processing]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Optimistic processedAt locking for duplicate prevention
    - Reset-on-failure pattern for retry support
    - Batch processing with rate limit handling

key-files:
  created:
    - orchestrator/src/lib/signals/processor.ts
    - orchestrator/src/lib/signals/index.ts
  modified:
    - orchestrator/src/lib/db/queries.ts

key-decisions:
  - "processedAt set BEFORE processing to prevent duplicate processing in concurrent scenarios"
  - "processedAt reset to null on failure to allow retry"
  - "Preserve user interpretation if already set (don't overwrite with AI interpretation)"
  - "Batch size of 10 with 100ms delay between batches for rate limiting"

patterns-established:
  - "Idempotency via timestamp locking: set lock before work, reset on failure"
  - "Batch processing with Promise.allSettled for error isolation"
  - "Never throw in batch context - log and continue"

# Metrics
duration: 2min
completed: 2026-01-23
---

# Phase 15 Plan 02: Signal Processor Summary

**Signal processing orchestrator with idempotent single-signal processing and rate-limited batch backfill support**

## Performance

- **Duration:** 2 min
- **Started:** 2026-01-23T20:01:22Z
- **Completed:** 2026-01-23T20:03:29Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments

- Created `updateSignalProcessing` query function for AI-processed fields (nullable severity, frequency, userSegment, interpretation, embedding, processedAt)
- Built `processSignalExtraction` with idempotency via optimistic processedAt locking and reset-on-failure for retry
- Built `batchProcessSignals` for backfill operations with batch size 10 and 100ms delay between batches
- Created barrel export at `@/lib/signals` for clean imports

## Task Commits

Each task was committed atomically:

1. **Task 1: Add updateSignalProcessing Query Function** - `3b22311` (feat)
2. **Task 2: Create Signal Processor Module** - `171dd9f` (feat)
3. **Task 3: Create lib/signals Index File** - `171dd9f` (feat, combined with Task 2)

_Note: Tasks 2 and 3 were committed together as they form a cohesive module_

## Files Created/Modified

- `orchestrator/src/lib/db/queries.ts` - Added updateSignalProcessing function for AI-processed field updates
- `orchestrator/src/lib/signals/processor.ts` - Signal processing orchestrator with idempotency and batch support
- `orchestrator/src/lib/signals/index.ts` - Barrel export for signal processing utilities

## Decisions Made

1. **Optimistic processedAt locking:** Set processedAt BEFORE processing starts to prevent duplicate processing in concurrent scenarios (e.g., multiple webhook retries)
2. **Reset-on-failure pattern:** Reset processedAt to null on any error so the signal can be retried
3. **Preserve user interpretation:** If user provided interpretation, don't overwrite with AI interpretation
4. **Rate limiting strategy:** Batch size of 10 with 100ms delay between batches - conservative for API rate limits

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - TypeScript compilation passed, all modules import correctly.

## User Setup Required

None - no external service configuration required. (OPENAI_API_KEY and ANTHROPIC_API_KEY already required from Phase 15-01)

## Next Phase Readiness

- Signal processor ready for integration into ingestion endpoints
- Plan 15-03 can now add after() processing to /ingest endpoint
- Batch processing function ready for future backfill endpoint

---
*Phase: 15-signal-extraction-and-embedding*
*Completed: 2026-01-23*
