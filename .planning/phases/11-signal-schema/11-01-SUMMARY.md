---
phase: 11-signal-schema
plan: 01
subsystem: database
tags: [drizzle, postgres, signals, schema, migration]

# Dependency graph
requires:
  - phase: 10-multi-user
    provides: users table for linkedBy references
provides:
  - signals table with verbatim, source, status, AI fields
  - signal_projects junction table for many-to-many project links
  - signal_personas junction table for many-to-many persona links
  - TypeScript types (Signal, NewSignal, etc.)
  - Drizzle relations for query support
affects: [12-signal-crud, 13-signal-ingestion, 15-ai-extraction, 16-clustering, 17-linking, 18-provenance]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Union types for extensible enums (SignalStatus, SignalSource, etc.)
    - JSONB with typed interfaces (SignalSourceMetadata, SignalClassification)
    - Junction tables with unique constraints for many-to-many

key-files:
  created:
    - orchestrator/drizzle/0006_brave_purifiers.sql
  modified:
    - orchestrator/src/lib/db/schema.ts
    - orchestrator/src/lib/db/index.ts

key-decisions:
  - "Union types instead of PostgreSQL enums for extensibility without migrations"
  - "JSONB for source metadata and AI classification to handle varied source types"
  - "personaId as text (not FK) since personas are strings in ProjectMetadata, not a table"
  - "inboxItemId uses SET NULL on delete to preserve signals even if inbox item deleted"
  - "embedding stored as base64 text (matches existing memoryEntries pattern)"

patterns-established:
  - "Signal lifecycle: new -> reviewed -> linked -> archived"
  - "Source attribution pattern: source + sourceRef + sourceMetadata JSONB"
  - "Junction tables with linkedBy for tracking manual vs AI associations"

# Metrics
duration: 8min
completed: 2025-01-22
---

# Phase 11 Plan 01: Signal Schema & Storage Summary

**Drizzle schema foundation for signals system with signals table, junction tables for project/persona links, TypeScript types, and database migration**

## Performance

- **Duration:** 8 min
- **Started:** 2025-01-22T22:00:00Z
- **Completed:** 2025-01-22T22:08:00Z
- **Tasks:** 6
- **Files modified:** 3

## Accomplishments

- Created signals table with all core fields (verbatim, interpretation, severity, frequency, source, status, etc.)
- Created signal_projects and signal_personas junction tables with unique constraints
- Added TypeScript union types and interfaces for type-safe JSONB columns
- Added Drizzle relations for query support (workspace, inboxItem, projects, personas)
- Exported Signal, NewSignal, and related types from index.ts
- Generated database migration with foreign keys and constraints

## Task Commits

Each task was committed atomically:

1. **Task 1: Add signal types and interfaces** - `501ae6f` (feat)
2. **Task 2: Add signals table definition** - `e606c51` (feat)
3. **Task 3: Add junction tables** - `23fd588` (feat)
4. **Task 4: Add Drizzle relations** - `2a9baff` (feat)
5. **Task 5: Add type exports to index.ts** - `437f4a5` (feat)
6. **Task 6: Generate database migration** - `6752366` (feat)

## Files Created/Modified

- `orchestrator/src/lib/db/schema.ts` - Added signals, signalProjects, signalPersonas tables with types and relations
- `orchestrator/src/lib/db/index.ts` - Added Signal, NewSignal, and junction table type exports
- `orchestrator/drizzle/0006_brave_purifiers.sql` - Migration file for new tables

## Decisions Made

1. **Union types over PostgreSQL enums** - Allows adding new sources/statuses without migrations
2. **JSONB for flexible metadata** - sourceMetadata and aiClassification handle varied data shapes
3. **personaId as text** - Personas are strings in ProjectMetadata.personas[], not a separate table
4. **SET NULL for inboxItemId** - Preserve signals even if originating inbox item is deleted
5. **base64 for embedding** - Matches existing memoryEntries pattern for vector storage

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- **db:push failed** - Expected behavior without DATABASE_URL configured. Migration file generated successfully for application when database is available.
- **Pre-existing TypeScript errors** - Unrelated errors in signup/route.ts and activity-feed.tsx exist in codebase; signals schema compiles correctly.

## User Setup Required

None - no external service configuration required. Migration will be applied when database connection is available.

## Next Phase Readiness

- Schema foundation complete for Phase 12 (Signal CRUD endpoints)
- All types exported and relations defined for query support
- Migration ready to apply when database connection is configured

**Ready for:**
- Phase 12: Signal CRUD API endpoints
- Phase 13: Signal ingestion (webhooks, uploads)
- Phase 15: AI extraction (will populate severity, frequency, embedding, aiClassification)

---
*Phase: 11-signal-schema*
*Completed: 2025-01-22*
