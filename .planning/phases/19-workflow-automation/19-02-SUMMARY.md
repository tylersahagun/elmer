---
phase: 19-workflow-automation
plan: 02
subsystem: automation
tags: [signals, clustering, automation, rate-limiting, jobs]

# Dependency graph
requires:
  - phase: 19-01
    provides: SignalAutomationSettings interface, automationActions table, DEFAULT_SIGNAL_AUTOMATION
  - phase: 16-classification-clustering
    provides: findSignalClusters, SignalCluster type
  - phase: 18-provenance
    provides: Signal-to-project linking patterns
provides:
  - checkSignalAutomation function for cron-based automation checks
  - checkSignalAutomationForNewSignal function for after() context triggers
  - createProjectFromClusterAuto function for automated project creation
  - triggerPrdGeneration function for automated PRD job creation
  - canPerformAutoAction function for rate limit checking
  - recordAutomationAction function for tracking automation history
  - hasClusterBeenActioned function for deduplication
affects:
  - 19-03 (settings UI will configure automation depth)
  - 19-04 (cron will call checkSignalAutomation)
  - 19-05 (integration tests will verify automation flows)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Orchestrator pattern: signal-automation.ts coordinates rate-limiter and auto-actions"
    - "Safe error handling in after() context via checkSignalAutomationForNewSignal"
    - "Deduplication via hasClusterBeenActioned before processing"
    - "Two-phase action: initiative_created then prd_triggered for full_auto depth"

key-files:
  created:
    - orchestrator/src/lib/automation/rate-limiter.ts
    - orchestrator/src/lib/automation/auto-actions.ts
    - orchestrator/src/lib/automation/signal-automation.ts
  modified:
    - orchestrator/src/lib/db/schema.ts (ProjectMetadata, NotificationMetadata extensions)

key-decisions:
  - "Cluster evaluation checks: already_actioned -> rate_limited -> low_confidence -> severity_filter -> below_threshold"
  - "PRD generation only triggers if automationDepth is full_auto AND cluster meets autoPrdThreshold"
  - "Projects created by automation have linkedBy=null to distinguish from user-linked signals"
  - "Activity logs record automation as actor with userId='automation'"

patterns-established:
  - "Automation orchestration with separate rate-limiter, auto-actions, and orchestrator modules"
  - "Safe after() context error handling: never throw, always log"
  - "Cluster deduplication: check hasClusterBeenActioned before any processing"

# Metrics
duration: 8min
completed: 2026-01-24
---

# Phase 19 Plan 02: Automation Engine Summary

**Signal automation orchestrator with rate-limited auto-actions for initiative creation and PRD triggering based on cluster thresholds**

## Performance

- **Duration:** 8 min
- **Started:** 2026-01-24T05:25:00Z
- **Completed:** 2026-01-24T05:33:00Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments
- Created rate limiter module with cooldown and daily limit enforcement
- Created auto-actions module for project creation and PRD job triggering
- Created signal automation orchestrator coordinating cluster evaluation
- Extended ProjectMetadata with autoCreated, sourceClusterId, clusterConfidence
- Extended NotificationMetadata with cluster tracking fields

## Task Commits

Each task was committed atomically:

1. **Task 1: Create rate limiter module** - `7c8ba94` (feat)
2. **Task 2: Create auto-actions module** - `6f2a461` (feat)
3. **Task 3: Create signal automation orchestrator** - `1aead88` (feat)

## Files Created/Modified
- `orchestrator/src/lib/automation/rate-limiter.ts` - Rate limiting with canPerformAutoAction, recordAutomationAction, hasClusterBeenActioned
- `orchestrator/src/lib/automation/auto-actions.ts` - createProjectFromClusterAuto, triggerPrdGeneration
- `orchestrator/src/lib/automation/signal-automation.ts` - checkSignalAutomation, checkSignalAutomationForNewSignal, evaluateCluster
- `orchestrator/src/lib/db/schema.ts` - Extended ProjectMetadata and NotificationMetadata interfaces

## Decisions Made
- **Cluster evaluation order:** already_actioned first (cheapest check), then rate_limited, then confidence, then severity, then threshold - fail fast on cheapest checks
- **Auto-actions use null linkedBy:** Distinguishes automation from user actions in signalProjects
- **Activity logs use 'automation' as userId:** Enables filtering/searching for automated actions
- **Safe error handling:** checkSignalAutomationForNewSignal catches all errors to prevent after() context failures

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Extended ProjectMetadata with automation tracking fields**
- **Found during:** Task 2 (Create auto-actions module)
- **Issue:** ProjectMetadata interface didn't include autoCreated, sourceClusterId, clusterConfidence fields needed for tracking auto-created projects
- **Fix:** Added autoCreated?: boolean, sourceClusterId?: string, clusterConfidence?: number to ProjectMetadata
- **Files modified:** orchestrator/src/lib/db/schema.ts
- **Verification:** TypeScript compiles, auto-actions module can set these fields
- **Committed in:** 6f2a461 (Task 2 commit)

**2. [Rule 2 - Missing Critical] Extended NotificationMetadata with cluster tracking fields**
- **Found during:** Task 2 (Create auto-actions module - revealed by threshold-filter.ts compilation)
- **Issue:** NotificationMetadata didn't include clusterId, clusterSize, clusterSeverity, clusterTheme, suggestedAction fields used by threshold-filter.ts
- **Fix:** Added cluster tracking fields to NotificationMetadata interface
- **Files modified:** orchestrator/src/lib/db/schema.ts
- **Verification:** TypeScript compiles, threshold-filter.ts works correctly
- **Committed in:** 6f2a461 (handled by linter auto-fix)

---

**Total deviations:** 2 auto-fixed (2 missing critical)
**Impact on plan:** Schema extensions necessary for proper type safety. No scope creep - these fields are essential for automation tracking.

## Issues Encountered
- getWorkspaceAutomationSettings already existed in queries.ts from a previous plan execution (19-03 notification filter) - no action needed, just verified it exists

## User Setup Required

None - no external service configuration required. All automation logic is internal.

## Next Phase Readiness
- Automation engine ready for integration with cron scheduler (19-04)
- Settings UI can configure automationDepth to enable automation (19-03)
- All automation respects rate limits and cooldowns
- Safe for after() context integration via checkSignalAutomationForNewSignal

---
*Phase: 19-workflow-automation*
*Completed: 2026-01-24*
