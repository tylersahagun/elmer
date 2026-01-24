# Phase 17: Smart Association - Context

**Gathered:** 2026-01-23
**Status:** Ready for planning

<domain>
## Phase Boundary

AI-suggested signal linking and bulk operations that build on Phase 12.5's manual linking infrastructure. This phase adds:
1. AI suggestions for linking unlinked signals to relevant projects (based on Phase 16 classification)
2. Bulk link/unlink operations for multiple signals at once
3. Accept/reject workflow for AI suggestions
4. Respect for existing manual associations during bulk operations

This phase does NOT include:
- Changes to the underlying classification algorithm (Phase 16)
- Project creation from signals (Phase 18)
- Automated linking without user approval (Phase 19)

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
User is comfortable with Claude deciding all implementation details for this phase, including:
- Suggestion presentation UI (inline, panel, badges, etc.)
- Acceptance/rejection flow (individual vs bulk, modification before accept, undo)
- Bulk operation UX (multi-select patterns, confirmations, progress feedback)
- Confidence thresholds (when to show suggestions, whether to display scores, UI differentiation)
- Integration points with existing signal list and detail views
- Error handling and edge cases

**Guidance for researcher/planner:**
- Leverage existing Phase 12.5 manual linking infrastructure
- Use Phase 16 classification results as the foundation for suggestions
- Follow existing UI patterns from Phases 12-16 for consistency
- Prioritize user control (accept/reject) over automation
- Ensure bulk operations are atomic and respect existing associations

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches that fit the existing Elmer UI patterns.

**Key constraint:** This phase builds on Phase 12.5 (manual linking) and Phase 16 (classification), so the researcher should review those implementations first.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 17-smart-association*
*Context gathered: 2026-01-23*
