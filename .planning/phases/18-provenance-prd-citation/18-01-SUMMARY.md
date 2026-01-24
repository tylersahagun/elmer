---
phase: 18
plan: 01
subsystem: project-signals
tags: [provenance, signals, ui, drizzle]
depends_on:
  - phase-17-smart-association
provides:
  - provenance-display-for-linked-signals
  - enhanced-signals-query-with-user-data
affects:
  - phase-18-02-prd-signal-citations
  - phase-18-03-cluster-to-project
tech-stack:
  added: []
  patterns:
    - drizzle-relation-joins-for-user-lookup
key-files:
  created: []
  modified:
    - orchestrator/src/lib/db/queries.ts
    - orchestrator/src/components/projects/LinkedSignalsSection.tsx
decisions: []
metrics:
  duration: 2m
  completed: 2026-01-24
---

# Phase 18 Plan 01: Signal Provenance Display Summary

**One-liner:** Enhanced LinkedSignalsSection to show full provenance chain - who linked each signal, when, why, and AI confidence.

## What Was Built

### Task 1: Enhanced getSignalsForProject Query
Updated the database query to return full provenance data for linked signals:

- Added `linkedByUser` relation join to fetch user info
- Returns `confidence` field from signalProjects junction table
- Returns `linkedBy` object with `id` and `name` when a user performed the linking

**Key change in queries.ts:**
```typescript
const links = await db.query.signalProjects.findMany({
  where: eq(signalProjects.projectId, projectId),
  with: {
    signal: true,
    linkedByUser: true,  // New relation
  },
  orderBy: [desc(signalProjects.linkedAt)],
  limit,
  offset,
});

return links.map((link) => ({
  ...link.signal,
  linkedAt: link.linkedAt,
  linkReason: link.linkReason,
  confidence: link.confidence,        // New field
  linkedBy: link.linkedByUser ? {     // New field
    id: link.linkedByUser.id,
    name: link.linkedByUser.name,
  } : null,
}));
```

### Task 2: Enhanced LinkedSignalsSection Component
Updated the UI component to display provenance information:

1. **Updated header text:** Changed from "Signals ({count})" to "Signals that informed this project ({count})"

2. **Extended LinkedSignal interface:**
   - Added `linkReason?: string | null`
   - Added `confidence?: number | null`
   - Added `linkedBy?: { id: string; name: string | null } | null`

3. **Enhanced signal item display:**
   - Shows "Linked {date} by {name}" when linkedBy.name is available
   - Shows "({X}% AI confidence)" when confidence is set
   - Shows "Reason: {linkReason}" in italic text below badges when present

**Example UI output:**
```
"Users are frustrated with the slow loading times..."
[paste badge] [high severity badge] Linked Jan 24 by John Smith (85% AI confidence)
Reason: AI-suggested association accepted by user
```

## Technical Details

### Existing Infrastructure Leveraged
- `signalProjectsRelations` already had `linkedByUser` relation defined in schema.ts (line 1329-1332)
- `signalProjects` table already had `linkedBy`, `linkReason`, and `confidence` columns

### API Response Shape
The `/api/projects/[id]/signals` endpoint now returns signals with:
```typescript
{
  id: string;
  verbatim: string;
  source: string;
  severity?: string | null;
  linkedAt: string;
  linkReason?: string | null;
  confidence?: number | null;
  linkedBy?: {
    id: string;
    name: string | null;
  } | null;
}
```

## Deviations from Plan

None - plan executed exactly as written.

## Commits

| Task | Commit | Message |
|------|--------|---------|
| 1 | 7b03624 | feat(18-01): enhance getSignalsForProject to return provenance data |
| 2 | b57cfe4 | feat(18-01): enhance LinkedSignalsSection with provenance display |

## Verification

- [x] TypeScript compiles: `cd orchestrator && npx tsc --noEmit` passes
- [x] Lint passes: `cd orchestrator && npm run lint` passes (only pre-existing test warnings)
- [x] Section header shows "Signals that informed this project"
- [x] LinkedSignal interface includes provenance fields
- [x] UI displays linkedBy name, confidence percentage, and link reason

## Next Phase Readiness

Phase 18-02 (PRD Signal Citations) can now:
- Query signals with full provenance chain
- Display attribution in generated PRDs showing who linked which signals
- Build confidence indicators based on AI vs manual linking
