# Phase 12: Signal Management UI - Context

**Gathered:** 2026-01-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can view, search, filter, and manually create signals within their workspace. This phase delivers the core signal management interface.

**Out of scope:**
- Signal association with projects/personas (Phase 12.5)
- Webhook ingestion (Phase 13)
- File uploads (Phase 14)
- AI processing (Phases 15-16)

</domain>

<decisions>
## Implementation Decisions

### Layout & Navigation
- **Display format:** Table (row-based) - spreadsheet-style with sortable columns
- **Detail view:** Modal (overlay) - popup to view full signal details without losing table context
- **Default sort:** Newest first - most recent signals at top of table
- **Sorting:** All columns should be sortable by user

### Manual Entry Experience
- **Entry UI:** Modal form (overlay) - focused signal creation experience
- **Batch creation:** "Create & add another" button - allows creating multiple signals in one session without closing modal
- **Modal behavior:** After creating signal, form clears but stays open if user clicks "add another"

### Search & Filter Behavior
- **Search interaction:** Real-time (as you type) - results filter instantly while typing
- **Search scope:** All text fields - search verbatim, interpretation, and metadata text
- **Filter persistence:** Reset on page load - always start with fresh/unfiltered view
- **No URL state:** Filters are not saved in URL or persisted across sessions

### Signal Detail View
- **Capabilities:** Full CRUD - user can edit any field, delete signal, change status from detail modal
- **Status transitions:** Auto-transition based on actions (e.g., linking a signal auto-sets status to 'linked')
- **Technical metadata:** Collapsible section - show/hide IDs, timestamps, and raw source metadata JSON

### Claude's Discretion
- Column selection and customization (start with sensible defaults)
- Required fields for manual entry (minimum: verbatim content)
- Source type selection UX (limit to manual-appropriate sources or default to 'manual')
- Filter UI presentation (inline, collapsible, or side panel based on complexity)
- Navigation between signals in detail modal (prev/next buttons or keyboard shortcuts)

</decisions>

<specifics>
## Specific Ideas

No specific requirements - open to standard approaches for data management UIs.

</specifics>

<deferred>
## Deferred Ideas

None - discussion stayed within phase scope.

</deferred>

---

*Phase: 12-signal-management-ui*
*Context gathered: 2026-01-22*
