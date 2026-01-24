---
phase: 20
plan: 03
subsystem: maintenance
tags: [signals, archival, merge, soft-delete, database, drizzle]
dependency-graph:
  requires: [20-02]
  provides: [archival-workflows, merge-workflows, signal-soft-delete]
  affects: [20-04]
tech-stack:
  added: []
  patterns: [soft-delete-archival, link-transfer-merge, activity-log-audit]
key-files:
  created:
    - orchestrator/src/lib/maintenance/archival.ts
    - orchestrator/src/lib/maintenance/merge.ts
  modified:
    - orchestrator/src/lib/maintenance/index.ts
decisions:
  - pattern: "Soft-delete via status change"
    reason: "Signals are evidence and must never be permanently deleted"
  - pattern: "Restore to 'reviewed' status (not 'new')"
    reason: "Archived signals were already processed"
  - pattern: "Primary signal receives links from secondary"
    reason: "Consolidate associations during merge"
  - pattern: "Link reason annotated with 'Merged from signal' prefix"
    reason: "Preserve provenance of transferred links"
  - pattern: "Canonical pair ID for dismissals"
    reason: "Sort signal IDs to ensure A-B equals B-A for filtering"
metrics:
  duration: 3m
  completed: 2026-01-24
---

# Phase 20 Plan 03: Archival Workflows Summary

Soft-delete archival workflow with time-based criteria and duplicate merge workflow with link transfer and provenance preservation

## Performance

- **Duration:** 3 min
- **Started:** 2026-01-24T05:42:58Z
- **Completed:** 2026-01-24T05:46:00Z
- **Tasks:** 3
- **Files created:** 2
- **Files modified:** 1

## Accomplishments

- Archival workflow: archiveSignals, unarchiveSignals, getArchivableCount
- Merge workflow: mergeSignals with project/persona link transfer
- Dismissal tracking: dismissDuplicatePair with canonical pair IDs
- Activity logging for all operations (audit trail)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create archival workflow module** - `3f05ce6` (feat)
2. **Task 2: Create merge workflow module** - `55bf4ad` (feat)
3. **Task 3: Update maintenance index with workflow exports** - `33a111e` (feat)

## Files Created/Modified

- `orchestrator/src/lib/maintenance/archival.ts` - Archive/unarchive functions with time-based criteria
- `orchestrator/src/lib/maintenance/merge.ts` - Merge duplicates with link transfer
- `orchestrator/src/lib/maintenance/index.ts` - Re-exports all detection and workflow utilities

## Key Patterns

### Pattern: Soft-Delete Archival
Signals are never permanently deleted. Archival changes status to "archived" while preserving all data, links, and metadata for audit purposes.

```typescript
// Archive: status = "archived"
await db.update(signals).set({ status: "archived", updatedAt: now })

// Unarchive: status = "reviewed" (not "new" since already processed)
await db.update(signals).set({ status: "reviewed", updatedAt: now })
```

### Pattern: Link Transfer on Merge
When merging duplicates, the secondary signal's links are transferred to the primary signal (if not already present), then the secondary is archived.

```typescript
// Check existing links
const existingProjectIds = new Set(existingProjectLinks.map(l => l.projectId));
// Transfer only non-duplicate links
if (!existingProjectIds.has(link.projectId)) {
  await db.insert(signalProjects).values({ ...link, signalId: primarySignalId });
}
```

### Pattern: Canonical Pair IDs
For duplicate dismissals, signal IDs are sorted to create a canonical pair ID, ensuring (A,B) and (B,A) are treated identically when filtering future suggestions.

```typescript
pairId: [signalId1, signalId2].sort().join("-")
```

## API Reference

### archiveSignals(workspaceId, criteria, userId?)
Archives signals based on criteria (time-based or manual selection).

```typescript
const result = await archiveSignals(workspaceId, {
  linkedOlderThanDays: 90,      // Archive linked signals older than 90 days
  reviewedOlderThanDays: 30,    // Archive reviewed signals older than 30 days
  signalIds: ["sig1", "sig2"],  // Or specify explicit IDs
});
// Returns: { archivedCount, signalIds, archivedAt }
```

### unarchiveSignals(workspaceId, signalIds, userId?)
Restores archived signals to "reviewed" status.

```typescript
const result = await unarchiveSignals(workspaceId, ["sig1", "sig2"]);
// Returns: { restoredCount }
```

### getArchivableCount(workspaceId, linkedDays, reviewedDays)
Returns count of signals that would be archived with given thresholds.

```typescript
const counts = await getArchivableCount(workspaceId, 90, 30);
// Returns: { linked: number, reviewed: number }
```

### mergeSignals(workspaceId, primaryId, secondaryId, userId?)
Merges secondary signal into primary, transferring links and archiving secondary.

```typescript
const result = await mergeSignals(workspaceId, "primary", "secondary");
// Returns: { primarySignalId, mergedSignalId, projectsTransferred, personasTransferred }
```

### dismissDuplicatePair(workspaceId, signalId1, signalId2, userId?)
Records dismissal so pair won't be suggested again.

```typescript
await dismissDuplicatePair(workspaceId, "sig1", "sig2");
```

## Decisions Made

| Decision | Context | Rationale |
|----------|---------|-----------|
| Soft-delete via status change | Archival mechanism | Signals are evidence; must preserve for audit |
| Restore to "reviewed" not "new" | Unarchive behavior | Archived signals were already processed |
| Transfer links on merge | Duplicate handling | Consolidate all associations to primary |
| Annotate link reason with source | Merge provenance | Track where transferred links originated |
| Canonical pair IDs | Dismissal deduplication | Ensure (A,B) = (B,A) for filtering |

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## Next Phase Readiness

**Ready for 20-04:** API Endpoints & Cron
- Detection layer (20-02) provides orphan/duplicate detection
- Workflow layer (20-03) provides archival and merge operations
- API endpoints will expose these functions to the UI
- Cron job will use these for automated maintenance

**Integration points for next plan:**
- `POST /api/signals/archive` - manual/bulk archival
- `POST /api/signals/unarchive` - restore archived signals
- `POST /api/signals/merge` - merge duplicate pair
- `POST /api/signals/duplicates/dismiss` - dismiss false positive
- Cron endpoint for periodic auto-archival

---
*Phase: 20-maintenance-agents*
*Completed: 2026-01-24*
