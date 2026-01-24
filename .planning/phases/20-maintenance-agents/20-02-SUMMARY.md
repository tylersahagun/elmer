---
phase: 20
plan: 02
subsystem: maintenance
tags: [signals, orphan-detection, duplicate-detection, pgvector, database]
dependency-graph:
  requires: [20-01]
  provides: [orphan-detection, duplicate-detection, maintenance-module]
  affects: [20-03, 20-04]
tech-stack:
  added: []
  patterns: [pgvector-similarity, drizzle-subqueries, NOT-EXISTS-pattern]
key-files:
  created:
    - orchestrator/src/lib/maintenance/orphan-detector.ts
    - orchestrator/src/lib/maintenance/duplicate-detector.ts
    - orchestrator/src/lib/maintenance/index.ts
  modified: []
decisions:
  - pattern: "NOT EXISTS for orphan detection"
    reason: "Efficient SQL pattern for checking absence of related rows"
  - pattern: "Raw SQL for pgvector queries"
    reason: "Drizzle ORM lacks native pgvector operator support"
  - pattern: "Canonical pair IDs for deduplication"
    reason: "Sort signal IDs to ensure A-B equals B-A"
  - pattern: "High similarity threshold (0.9+)"
    reason: "Minimize false positives in duplicate detection"
metrics:
  duration: 2m
  completed: 2026-01-24
---

# Phase 20 Plan 02: Detection Layer Summary

Orphan and duplicate detection modules using pgvector for signal maintenance

## One-liner

Drizzle-based orphan detection with NOT EXISTS subqueries and pgvector cosine similarity for high-confidence duplicate detection

## What Was Built

### 1. Orphan Detector (`orphan-detector.ts`)

Identifies signals that have been unprocessed for too long:

```typescript
// Core function
findOrphanSignals(workspaceId, thresholdDays = 14, limit = 50)
// Returns: { signals: OrphanSignal[], total, oldestDays }

// Dashboard helper
getOrphanCount(workspaceId, thresholdDays = 14)
// Returns: number
```

**Orphan Definition:**
- Status is "new" (never reviewed, linked, or archived)
- Created more than N days ago (configurable threshold)
- Not linked to any project (via signalProjects table)
- Not linked to any persona (via signalPersonas table)

**SQL Pattern:**
```sql
SELECT ... FROM signals
WHERE status = 'new'
  AND created_at < threshold_date
  AND NOT EXISTS (SELECT 1 FROM signal_projects WHERE signal_id = signals.id)
  AND NOT EXISTS (SELECT 1 FROM signal_personas WHERE signal_id = signals.id)
```

### 2. Duplicate Detector (`duplicate-detector.ts`)

Finds semantically similar signals that may be duplicates:

```typescript
// Core function
findDuplicateSignals(workspaceId, similarityThreshold = 0.9, limit = 20)
// Returns: { pairs: DuplicatePair[], total }

// Dashboard helper
getDuplicateCount(workspaceId, similarityThreshold = 0.9)
// Returns: number
```

**Algorithm:**
1. Fetch up to 100 non-archived signals with embeddings
2. For each signal, query pgvector for 5 nearest neighbors
3. Filter by distance threshold (distance < 0.1 = similarity > 0.9)
4. Deduplicate pairs using canonical IDs (sorted signal IDs joined)
5. Return sorted by similarity (highest first)

**pgvector Query:**
```sql
SELECT id, verbatim, source, created_at,
       embedding_vector <=> $vector::vector AS distance
FROM signals
WHERE workspace_id = $workspaceId
  AND id != $signalId
  AND status != 'archived'
  AND embedding_vector IS NOT NULL
  AND embedding_vector <=> $vector::vector < $distanceThreshold
ORDER BY embedding_vector <=> $vector::vector
LIMIT 5
```

### 3. Module Index (`index.ts`)

Re-exports all detection utilities:
- `findOrphanSignals`, `getOrphanCount`, `OrphanSignal`, `OrphanDetectionResult`
- `findDuplicateSignals`, `getDuplicateCount`, `DuplicatePair`, `DuplicateDetectionResult`

## Key Patterns

### Pattern: NOT EXISTS for Orphan Detection
Used Drizzle's `notExists()` function with inline subqueries for efficient orphan detection. This pattern is well-supported by Drizzle and generates optimal SQL.

### Pattern: Raw SQL for pgvector
Since Drizzle lacks native pgvector operator support, raw SQL with `db.execute()` was used for the `<=>` cosine distance operator. This follows the same pattern established in `clustering.ts` and `queries.ts`.

### Pattern: Canonical Pair IDs
Duplicate pairs are deduplicated by sorting signal IDs and joining them. This ensures pair (A, B) and (B, A) are treated as identical.

## Decisions Made

| Decision | Context | Rationale |
|----------|---------|-----------|
| Default orphan threshold: 14 days | Configurable parameter | 2 weeks is reasonable time for signal triage |
| Default similarity threshold: 0.9 | High confidence duplicates | Minimize false positives; users can lower if needed |
| Process limit: 100 signals | Performance safeguard | Prevents timeout on large workspaces |
| Top 5 neighbors per signal | Balance coverage vs. performance | Most duplicates will be in top 5 |

## Files Created

| File | Purpose | LOC |
|------|---------|-----|
| `orchestrator/src/lib/maintenance/orphan-detector.ts` | Orphan signal detection | 137 |
| `orchestrator/src/lib/maintenance/duplicate-detector.ts` | Duplicate signal detection | 162 |
| `orchestrator/src/lib/maintenance/index.ts` | Module exports | 22 |

## Verification Results

- [x] TypeScript compiles without errors
- [x] `orchestrator/src/lib/maintenance/` directory exists
- [x] `orphan-detector.ts` exports `findOrphanSignals` and `getOrphanCount`
- [x] `duplicate-detector.ts` exports `findDuplicateSignals` and `getDuplicateCount`
- [x] `index.ts` re-exports all utilities
- [x] Orphan detection uses NOT EXISTS for project/persona links
- [x] Duplicate detection uses pgvector cosine distance operator (`<=>`)

## Deviations from Plan

None - plan executed exactly as written.

## Commits

1. `e9ce47c` - feat(20-02): create orphan-detector module
2. `24d641d` - feat(20-02): create duplicate-detector module
3. `f727b63` - feat(20-02): create maintenance module index

## Next Phase Readiness

**Ready for 20-03:** Archival Workflows
- Detection layer complete and exportable
- Functions return structured results for UI/API consumption
- Count helpers available for dashboard display

**Integration points for next plans:**
- API endpoints will call these detection functions
- Cron job will use count functions for batch processing
- UI will display results from detection queries
