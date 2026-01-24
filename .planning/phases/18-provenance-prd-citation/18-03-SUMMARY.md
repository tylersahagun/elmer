---
phase: 18-provenance-prd-citation
plan: 03
subsystem: signals
tags: [project-creation, clustering, kanban, signal-count]
dependency-graph:
  requires:
    - 16-03 (signal clustering)
    - 12.5 (signal-project linking)
  provides:
    - Project creation from signal clusters
    - Signal count on project cards
    - CreateProjectFromClusterModal component
  affects:
    - 18-04 (if any - PRD generation with cluster evidence)
    - Future signal-to-project workflows
tech-stack:
  added: []
  patterns:
    - Atomic project+link creation with bulk insert
    - Efficient count aggregation with groupBy
key-files:
  created:
    - orchestrator/src/app/api/projects/from-cluster/route.ts
    - orchestrator/src/components/signals/CreateProjectFromClusterModal.tsx
  modified:
    - orchestrator/src/lib/db/queries.ts
    - orchestrator/src/lib/store.ts
    - orchestrator/src/app/api/projects/route.ts
    - orchestrator/src/components/kanban/ProjectCard.tsx
decisions:
  - Signal count fetched via single aggregation query for efficiency
  - MessageSquare icon for signal badge (distinct from documents/prototypes)
  - Cluster theme becomes link reason for traceability
metrics:
  duration: 3 minutes
  completed: 2026-01-24
---

# Phase 18 Plan 03: Cluster-to-Project Creation Summary

Project creation from signal clusters with automatic linking and signal count badges on kanban cards.

## What Was Built

### 1. Project-from-Cluster API Endpoint

**File:** `orchestrator/src/app/api/projects/from-cluster/route.ts`

POST endpoint that atomically:
- Creates a new project with name and optional description
- Bulk-inserts signal-project links for all cluster signals
- Updates all signal statuses to "linked"
- Logs activity for audit trail

```typescript
// Request
POST /api/projects/from-cluster
{
  workspaceId: string,
  name: string,
  description?: string,
  signalIds: string[],
  clusterTheme?: string
}

// Response
{
  success: true,
  projectId: string,
  linkedSignals: number
}
```

### 2. Signal Count Query Function

**File:** `orchestrator/src/lib/db/queries.ts`

New `getProjectsWithCounts()` function that:
- Fetches all projects via existing `getProjects()`
- Gets signal counts in single aggregation query grouped by projectId
- Returns projects with `signalCount`, `documentCount`, `prototypeCount`

### 3. Projects API Update

**File:** `orchestrator/src/app/api/projects/route.ts`

Changed GET handler to use `getProjectsWithCounts()` so kanban cards receive signal counts.

### 4. Signal Count Badge on Project Cards

**File:** `orchestrator/src/components/kanban/ProjectCard.tsx`

Added MessageSquare icon with count in card footer:
- Shows only when `signalCount > 0`
- Positioned after prototype count badge
- Includes "Linked signals" tooltip

### 5. CreateProjectFromClusterModal Component

**File:** `orchestrator/src/components/signals/CreateProjectFromClusterModal.tsx`

Modal that:
- Pre-fills project name with cluster theme
- Shows preview of first 5 signals (verbatim + source)
- Calls POST /api/projects/from-cluster on submit
- Invalidates projects/signals queries on success
- Navigates to new project page

## Commits

| Hash | Description |
|------|-------------|
| 5e66d58 | feat(18-03): create project-from-cluster API endpoint |
| 7925bc4 | feat(18-03): add signal count to project queries |
| 906dd2d | feat(18-03): update projects API to include signal counts |
| 4b956c7 | feat(18-03): add signal count badge to ProjectCard |
| 6987d1d | feat(18-03): create CreateProjectFromClusterModal component |

## Verification

All success criteria met:
- [x] POST /api/projects/from-cluster creates project and bulk-links signals
- [x] Projects query returns signal counts via getProjectsWithCounts
- [x] Project cards show signal count badges with MessageSquare icon
- [x] CreateProjectFromClusterModal component created and functional
- [x] Signal statuses update to "linked" after bulk linking
- [x] TypeScript compiles without errors
- [x] No lint errors in modified files

## Deviations from Plan

None - plan executed exactly as written.

## Next Phase Readiness

Phase 18-03 complete. The cluster-to-project workflow is ready:
- Users can create projects from synthesize endpoint results
- Project cards show signal evidence at a glance
- All signals are linked with cluster theme as reason for traceability
