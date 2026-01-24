---
phase: 19-workflow-automation
plan: 01
subsystem: database
tags: [drizzle, postgres, signals, automation, schema]

# Dependency graph
requires:
  - phase: 16-classification-clustering
    provides: SignalSeverity type for automation thresholds
  - phase: 18-provenance
    provides: Signal clustering foundation for automation triggers
provides:
  - SignalAutomationSettings interface for configurable automation depth
  - DEFAULT_SIGNAL_AUTOMATION constant with sensible defaults
  - automationActions table for tracking automation history
  - AutomationActionType union type for action categorization
  - Rate limiting and cooldown infrastructure via indexes
affects:
  - 19-02 (automation engine will use these types and table)
  - 19-03 (settings UI will use SignalAutomationSettings)
  - 19-04 (notification system will query automationActions)
  - 19-05 (integration tests will verify automation tracking)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Union types for extensible action categories (AutomationActionType)"
    - "JSONB signalAutomation field in WorkspaceSettings for per-workspace config"
    - "Composite indexes for cooldown checks (workspace_id, cluster_id)"
    - "Descending timestamp index for rate limit queries"

key-files:
  created:
    - orchestrator/drizzle/0010_signal_automation.sql
  modified:
    - orchestrator/src/lib/db/schema.ts
    - orchestrator/drizzle/meta/_journal.json

key-decisions:
  - "automationDepth levels: manual, suggest, auto_create, full_auto"
  - "Default automation depth is 'suggest' (conservative)"
  - "Default thresholds: 5 signals for auto-PRD, 3 for auto-initiative"
  - "Cluster confidence minimum 0.7 for automation triggers"
  - "Rate limiting: 10 auto-actions per day, 60 minute cooldown per cluster"
  - "Duplicate notification suppression enabled by default"

patterns-established:
  - "SignalAutomationSettings in WorkspaceSettings for per-workspace automation config"
  - "automationActions table for action history and rate limiting"

# Metrics
duration: 3min
completed: 2026-01-24
---

# Phase 19 Plan 01: Database Schema for Signal Automation Summary

**SignalAutomationSettings interface with configurable depth/thresholds and automationActions table for tracking automation history with rate limiting indexes**

## Performance

- **Duration:** 3 min
- **Started:** 2026-01-24T04:18:37Z
- **Completed:** 2026-01-24T04:21:45Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Added SignalAutomationSettings interface with automation depth, thresholds, and rate limiting configuration
- Created DEFAULT_SIGNAL_AUTOMATION constant with sensible defaults (suggest mode, conservative thresholds)
- Extended WorkspaceSettings with optional signalAutomation field for per-workspace config
- Created automationActions table with foreign keys to workspaces and projects
- Added composite indexes for efficient cooldown and rate limit queries

## Task Commits

Each task was committed atomically:

1. **Task 1: Add SignalAutomationSettings and automationActions to schema** - `79f0c2f` (feat)
2. **Task 2: Generate and apply database migration** - `ccc7903` (feat)

## Files Created/Modified
- `orchestrator/src/lib/db/schema.ts` - Added AutomationActionType, SignalAutomationSettings, DEFAULT_SIGNAL_AUTOMATION, automationActions table, and relations
- `orchestrator/drizzle/0010_signal_automation.sql` - Migration creating automation_actions table with indexes
- `orchestrator/drizzle/meta/_journal.json` - Updated migration journal with new entries

## Decisions Made
- **Automation depth levels:** Chose four levels (manual, suggest, auto_create, full_auto) to provide granular control
- **Default to 'suggest' mode:** Conservative default lets users opt-in to more automation
- **Thresholds:** 5 signals for auto-PRD (substantial evidence), 3 for initiative creation (emerging pattern)
- **Rate limiting:** 10 actions/day and 60-min cooldown prevent automation overload
- **Duplicate notification suppression:** Prevents spam when same cluster triggers repeatedly

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed migration file naming conflict**
- **Found during:** Task 2 (Generate and apply database migration)
- **Issue:** Drizzle generated `0009_little_sunspot.sql` with changes already in database (embedding_vector columns), causing migration failure
- **Fix:** Created manual migration `0010_signal_automation.sql` with only the automation_actions table, updated journal to include existing `0009_pgvector_classification.sql`
- **Files modified:** orchestrator/drizzle/0010_signal_automation.sql (created), orchestrator/drizzle/meta/_journal.json (updated)
- **Verification:** Migration applied successfully, automation_actions table exists with all columns and indexes
- **Committed in:** ccc7903 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Migration naming conflict resolved by creating clean migration file. No scope creep.

## Issues Encountered
- Drizzle-kit generate included pending schema changes from previous phases in the new migration, causing column-already-exists errors. Resolved by creating a focused migration file with only the new table.

## User Setup Required

None - no external service configuration required. Database migration was applied automatically.

## Next Phase Readiness
- SignalAutomationSettings interface ready for automation engine (19-02)
- automationActions table ready for tracking automation history
- DEFAULT_SIGNAL_AUTOMATION available for settings initialization
- Indexes in place for efficient cooldown and rate limit checks

---
*Phase: 19-workflow-automation*
*Completed: 2026-01-24*
