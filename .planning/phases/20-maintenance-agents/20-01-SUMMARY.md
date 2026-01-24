---
phase: 20-maintenance-agents
plan: 01
subsystem: database
tags: [schema, maintenance, signals, configuration, typescript]

# Dependency graph
requires:
  - phase: 19-workflow-automation
    provides: SignalAutomationSettings pattern for WorkspaceSettings
provides:
  - MaintenanceSettings interface with 11 configuration fields
  - DEFAULT_MAINTENANCE_SETTINGS constant with conservative defaults
  - WorkspaceSettings.maintenance optional field
affects: [20-02 orphan detection, 20-03 duplicate detection, 20-04 auto-archival]

# Tech tracking
tech-stack:
  added: []
  patterns: [optional JSONB field pattern for workspace-level configuration]

key-files:
  created: []
  modified: [orchestrator/src/lib/db/schema.ts]

key-decisions:
  - "Conservative defaults: auto-archive off by default"
  - "Pattern follows SignalAutomationSettings - optional JSONB field in WorkspaceSettings"
  - "11 fields covering orphan detection, duplicate detection, archival, suggestions, and notifications"

patterns-established:
  - "Maintenance configuration: per-workspace settings via WorkspaceSettings.maintenance JSONB field"

# Metrics
duration: 1min
completed: 2026-01-24
---

# Phase 20 Plan 01: Maintenance Settings Schema Summary

**MaintenanceSettings interface with 11 configurable fields for signal hygiene agents - conservative defaults with auto-archive off**

## Performance

- **Duration:** 1 min
- **Started:** 2026-01-24T05:38:09Z
- **Completed:** 2026-01-24T05:39:05Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments
- Defined MaintenanceSettings interface with orphan detection, duplicate detection, archival, and notification settings
- Added DEFAULT_MAINTENANCE_SETTINGS with conservative defaults (auto-archive disabled)
- Extended WorkspaceSettings with optional maintenance field following Phase 19 pattern

## Task Commits

Each task was committed atomically:

1. **Tasks 1-2: Add MaintenanceSettings interface and extend WorkspaceSettings** - `4886083` (feat)

## Files Created/Modified
- `orchestrator/src/lib/db/schema.ts` - Added MaintenanceSettings interface, DEFAULT_MAINTENANCE_SETTINGS constant, and maintenance field on WorkspaceSettings

## Decisions Made
- **Conservative defaults:** Auto-archive is disabled by default to prevent data loss without explicit opt-in
- **Pattern consistency:** Followed SignalAutomationSettings pattern with optional JSONB field in WorkspaceSettings
- **11 configuration fields:** Comprehensive coverage of orphan detection (2), duplicate detection (2), auto-archival (3), cleanup suggestions (2), and notifications (2)

## Deviations from Plan
None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- MaintenanceSettings interface ready for use in maintenance agent implementations
- 20-02 can now implement orphan detection using flagOrphansEnabled and orphanThresholdDays
- 20-03 can implement duplicate detection using duplicateDetectionEnabled and duplicateSimilarityThreshold
- 20-04 can implement auto-archival using autoArchiveEnabled and related thresholds

---
*Phase: 20-maintenance-agents*
*Completed: 2026-01-24*
