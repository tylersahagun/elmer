---
phase: 20
plan: 05
subsystem: maintenance
tags: [signals, ui, react, maintenance, orphan-detection, duplicates, settings]
dependency-graph:
  requires: [20-03, 20-04]
  provides: [maintenance-ui-components, orphan-banner, duplicate-cards, maintenance-settings]
  affects: [maintenance-dashboard]
tech-stack:
  added: []
  patterns: [banner-with-expandable-items, settings-panel-dirty-state, query-based-components]
key-files:
  created:
    - orchestrator/src/components/signals/OrphanSignalsBanner.tsx
    - orchestrator/src/components/signals/DuplicateSuggestionCard.tsx
    - orchestrator/src/components/signals/MaintenanceDashboard.tsx
    - orchestrator/src/components/settings/MaintenanceSettingsPanel.tsx
  modified:
    - orchestrator/src/app/(dashboard)/workspace/[id]/signals/SignalsPageClient.tsx
    - orchestrator/src/app/(dashboard)/workspace/[id]/settings/page.tsx
decisions:
  - "State-based collapsible instead of Radix Collapsible (simpler, no new dep)"
  - "Project link via /api/signals/{id}/projects endpoint (consistent with existing)"
  - "Older signal kept as primary during merge (maintains chronological ordering)"
  - "Workspace interface extended to include settings.maintenance"
metrics:
  duration: 5m
  completed: 2026-01-24
---

# Phase 20 Plan 05: Maintenance UI Components Summary

Maintenance UI with OrphanSignalsBanner (MAINT-01 project suggestions), DuplicateSuggestionCard, MaintenanceDashboard, and MaintenanceSettingsPanel wired into signals and settings pages

## Performance

- **Duration:** 5 min
- **Started:** 2026-01-24T05:50:47Z
- **Completed:** 2026-01-24T05:56:00Z
- **Tasks:** 5
- **Files created:** 4
- **Files modified:** 2

## Accomplishments

- OrphanSignalsBanner with expandable project suggestions per signal (MAINT-01)
- DuplicateSuggestionCard for merge/dismiss duplicate pairs
- MaintenanceDashboard showing orphan and duplicate counts
- MaintenanceSettingsPanel with full settings configuration
- Components wired into signals page and settings page

## Task Commits

Each task was committed atomically:

1. **Task 1: Create OrphanSignalsBanner component** - `9a9b8ce` (feat)
2. **Task 2: Create DuplicateSuggestionCard and MaintenanceDashboard** - `4c443c9` (feat)
3. **Task 3: Create MaintenanceSettingsPanel component** - `af7ff8f` (feat)
4. **Task 4: Wire OrphanSignalsBanner into signals page** - `f3ce99d` (feat)
5. **Task 5: Wire MaintenanceSettingsPanel into settings page** - `607d896` (feat)

## Files Created/Modified

| File | Purpose |
|------|---------|
| `orchestrator/src/components/signals/OrphanSignalsBanner.tsx` | Banner with orphan count, expandable signals with project suggestions |
| `orchestrator/src/components/signals/DuplicateSuggestionCard.tsx` | Card for merge/dismiss duplicate signal pairs |
| `orchestrator/src/components/signals/MaintenanceDashboard.tsx` | Overview panel with orphan/duplicate counts |
| `orchestrator/src/components/settings/MaintenanceSettingsPanel.tsx` | Settings form for all maintenance configuration |
| `orchestrator/src/app/(dashboard)/workspace/[id]/signals/SignalsPageClient.tsx` | Added OrphanSignalsBanner import and render |
| `orchestrator/src/app/(dashboard)/workspace/[id]/settings/page.tsx` | Added MaintenanceSettingsPanel import and render |

## Key Patterns

### Pattern: Banner with Expandable Items

OrphanSignalsBanner uses a state-based expand/collapse instead of Radix Collapsible, which avoids adding a new dependency. Each signal can be expanded to show project suggestions.

```typescript
const [expandedSignal, setExpandedSignal] = useState<string | null>(null);

// Toggle on button click
onClick={() => setExpandedSignal(expandedSignal === signal.id ? null : signal.id)}

// Conditional render
{expandedSignal === signal.id && (
  <div className="mt-3 pt-3 border-t">...</div>
)}
```

### Pattern: Settings Panel with Dirty State

MaintenanceSettingsPanel tracks dirty state to enable/disable save button and show reset option:

```typescript
const [isDirty, setIsDirty] = useState(false);

const updateField = <K extends keyof MaintenanceSettings>(field: K, value: MaintenanceSettings[K]) => {
  setSettings((prev) => ({ ...prev, [field]: value }));
  setIsDirty(true);
};
```

### Pattern: Query-based Components

All components use React Query for data fetching with appropriate stale times:

```typescript
const { data: orphanData, isLoading } = useQuery({
  queryKey: ["orphan-signals", workspaceId],
  queryFn: async () => { ... },
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

## Decisions Made

| Decision | Context | Rationale |
|----------|---------|-----------|
| State-based collapsible | Expand/collapse UX | Avoids adding @radix-ui/react-collapsible dependency |
| Link via /api/signals/{id}/projects | Project association | Consistent with existing signal-project linking pattern |
| Older signal as primary on merge | Duplicate handling | Maintains chronological ordering of signal data |
| Extended Workspace interface | Settings page | Needed to pass maintenance settings to panel |

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## API Endpoints Used

The UI components consume the following APIs from Plan 20-04:

| Component | Endpoint | Purpose |
|-----------|----------|---------|
| OrphanSignalsBanner | GET /api/signals/orphans | Fetch orphan signals |
| OrphanSignalsBanner | GET /api/signals/{id}/suggestions | Fetch project suggestions (MAINT-01) |
| OrphanSignalsBanner | POST /api/signals/{id}/projects | Link signal to project |
| DuplicateSuggestionCard | POST /api/signals/merge | Merge or dismiss duplicate pair |
| MaintenanceDashboard | GET /api/signals/orphans | Fetch orphan count |
| MaintenanceDashboard | GET /api/signals/duplicates | Fetch duplicate count |
| MaintenanceSettingsPanel | PATCH /api/workspaces/{id}/settings | Update maintenance settings |

## Next Phase Readiness

**Phase 20 Complete:** All maintenance agent components are now implemented:
- Settings (20-01)
- Detection (20-02)
- Workflows (20-03)
- API & Cron (20-04)
- UI (20-05)

**Integration Complete:**
- OrphanSignalsBanner shows on signals page when orphans exist
- MaintenanceSettingsPanel available in workspace settings
- Daily cron runs maintenance checks automatically
- MAINT-01 cleanup agent suggestions fully functional

---
*Phase: 20-maintenance-agents*
*Completed: 2026-01-24*
