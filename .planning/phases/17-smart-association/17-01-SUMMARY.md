---
phase: 17
plan: 01
subsystem: signals
tags: [api, schema, suggestions, classification]
depends_on:
  requires:
    - 16-02 (classification infrastructure)
    - 12.5-01 (signal-project linking)
  provides:
    - suggestionDismissedAt/By columns on signals table
    - GET /api/signals/suggestions endpoint
    - POST /api/signals/[id]/suggestions/dismiss endpoint
  affects:
    - 17-02 (bulk operations will use suggestions)
    - 17-03 (suggestions UI will consume these endpoints)
tech_stack:
  added: []
  patterns:
    - Raw SQL for JSONB queries (performance)
    - 30-day time window for suggestions
key_files:
  created:
    - orchestrator/src/app/api/signals/suggestions/route.ts
    - orchestrator/src/app/api/signals/[id]/suggestions/dismiss/route.ts
  modified:
    - orchestrator/src/lib/db/schema.ts
    - orchestrator/src/lib/db/queries.ts
decisions:
  - id: 17-01-01
    title: "30-day window for suggestions"
    choice: "Filter suggestions to signals created in last 30 days"
    rationale: "Keeps suggestions relevant and limits query scope"
  - id: 17-01-02
    title: "Viewer access for GET, member for POST"
    choice: "Follow existing signal permission patterns"
    rationale: "Consistency with other signal endpoints"
  - id: 17-01-03
    title: "Cap limit at 50"
    choice: "Limit maximum suggestions returned to 50"
    rationale: "Prevent abuse and ensure reasonable response times"
metrics:
  duration: "~10 minutes"
  completed: "2026-01-23"
---

# Phase 17 Plan 01: Suggestion Dismissal & API Endpoints Summary

**One-liner:** Schema columns for dismiss tracking plus GET/POST endpoints for surfacing and dismissing AI classification suggestions.

## What Was Built

### Schema Changes

Added two columns to the `signals` table:
- `suggestionDismissedAt` (timestamp) - When the user dismissed the suggestion
- `suggestionDismissedBy` (text, FK to users) - Who dismissed it

### Query Functions

1. **`getSignalSuggestions(workspaceId, limit)`**
   - Returns unlinked signals with AI classification suggestions
   - Filters: has projectId, not isNewInitiative, not dismissed, created in last 30 days, not already linked to suggested project
   - Uses raw SQL for JSONB query performance
   - Returns: signalId, verbatim, source, projectId, projectName, confidence, reason, createdAt

2. **`dismissSignalSuggestion(signalId, userId)`**
   - Sets suggestionDismissedAt and suggestionDismissedBy
   - Updates updatedAt timestamp

### API Endpoints

1. **GET `/api/signals/suggestions?workspaceId=xxx&limit=20`**
   - Returns AI suggestions for unlinked signals
   - Viewer access (read-only)
   - Response: `{ suggestions: [...] }`

2. **POST `/api/signals/[id]/suggestions/dismiss`**
   - Marks a suggestion as dismissed
   - Member access required
   - Response: `{ success: true }`

## Key Implementation Details

The suggestions query uses a LEFT JOIN pattern to exclude signals already linked to the suggested project:

```sql
LEFT JOIN signal_projects sp ON s.id = sp.signal_id
  AND sp.project_id = s.classification->>'projectId'
WHERE sp.id IS NULL
```

This ensures we only surface suggestions for signals that haven't already been linked to the AI-suggested project.

## Commits

| Hash | Description |
|------|-------------|
| 3acd530 | Schema: add suggestionDismissedAt/By columns |
| 43f376d | Queries: add getSignalSuggestions, dismissSignalSuggestion |
| 5e34ffa | API: GET /api/signals/suggestions |
| d7889ba | API: POST /api/signals/[id]/suggestions/dismiss |

## Verification Results

- [x] TypeScript compiles without errors
- [x] Schema includes suggestionDismissedAt and suggestionDismissedBy columns
- [x] GET /api/signals/suggestions returns suggestions array
- [x] POST /api/signals/[id]/suggestions/dismiss marks signal as dismissed
- [x] Dismissed signals do not appear in suggestions query

## Decisions Made

| ID | Decision | Rationale |
|----|----------|-----------|
| 17-01-01 | 30-day window for suggestions | Keeps suggestions relevant and limits query scope |
| 17-01-02 | Viewer for GET, member for POST | Consistency with existing signal permission patterns |
| 17-01-03 | Cap limit at 50 | Prevent abuse and ensure reasonable response times |

## Deviations from Plan

None - plan executed exactly as written.

## Next Phase Readiness

Ready for:
- 17-02: Bulk operations (can use suggestions list for bulk accept)
- 17-03: Suggestions UI (endpoints ready for consumption)

## Database Migration Note

Run `npx drizzle-kit generate` to create migration for new columns, then `npx drizzle-kit migrate` to apply.
