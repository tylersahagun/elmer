# Phase 2: Structure Discovery & Workspace Population - Context

**Gathered:** 2026-01-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Automatically scan GitHub repository for pm-workspace structure (initiatives/, knowledge/, personas/, signals/, etc.), show user what was discovered with preview and validation, let them select what to import via checkboxes and filters, then populate their Elmer workspace with projects assigned to correct Kanban columns based on status.

Excludes: Real-time streaming feedback (Phase 3), conversational disambiguation (Phase 4), template generation for repos without structure (v2).

</domain>

<decisions>
## Implementation Decisions

### Discovery Heuristics & Ranking

- **Pattern matching strictness:** Moderate - exact matches plus plural variations (initiative/initiatives, project/projects, feature/features). Don't use permissive pattern-based matching.
- **Multi-candidate handling:** Show all candidate folders with equal weight. Let user choose which folder(s) contain their initiatives during preview (don't auto-rank by name or contents).
- **Nested structure support:** Import multiple workspaces - support monorepos with multiple pm-workspace structures. Namespace projects by their source path when importing multiple.
- **Context path discovery:** More permissive for knowledge/, personas/, signals/ - include variations like docs/, kb/, team/, etc. since they're less structured than initiative folders.

### Preview Presentation & Clarity

- **Display grouping:** Group discovered items by target column (Discovery, Development, etc.) rather than by source folder. This helps users visualize the populated workspace state.
- **Information per item:** Standard level - show name, source path, and mapped status/column. Example: "Feature A (initiatives/feature-a) → Discovery column".
- **Validation summary placement:** Display summary at top of preview ("This will create 12 projects, sync 24 knowledge docs, import 5 personas"). Users see big picture before reviewing details.
- **Empty state handling:** When no structure found, offer to scan different branch. Give user recovery path rather than dead end.

### Selection & Filtering Controls

- **Default selection state:** All items selected by default. User deselects what they don't want. Optimized for "import most things" workflow.
- **Bulk operations:** Simple toggle buttons - "Select All" / "Deselect All" at the top. Clear and straightforward.
- **Filter options:** Combination approach - offer status-based filters (by target column), source-based filters (by source folder), and active/archived toggles. Maximum flexibility for complex repos.
- **Skip import option:** Yes, but subtle - provide "Skip import" as a small link, not a prominent button. Don't emphasize this path since auto-population is core value.

### Status Mapping Strategy

- **Matching approach:** Fuzzy matching for status fields - handle variations like 'Discovery'/'discovery'/'disc', 'Development'/'dev'/'in-progress'. More forgiving of real-world usage without being too loose.
- **Ambiguous status handling:** Flag items with multiple interpretations for user review in preview. Example: 'discovery-dev-ready' marked as ambiguous so user can verify before import.
- **Column creation:** Create columns dynamically to match discovered statuses. If _meta.json uses 'Beta Testing', create a 'Beta Testing' column. Preserves exact workflow from repository.

### Claude's Discretion

- Fallback strategy when _meta.json is missing or has no recognizable status (can default to Discovery, create Backlog column, or infer from folder structure)
- Exact fuzzy matching algorithm and thresholds
- Layout and spacing for preview UI
- Loading states and progress indicators
- Error handling for malformed _meta.json files

</decisions>

<specifics>
## Specific Ideas

- Dynamic column creation should preserve user's existing workflow from their repo rather than forcing them into predefined columns
- Multiple workspace import should namespace projects to avoid naming collisions (e.g., "workspace-a/feature-x" vs "workspace-b/feature-x")
- Ambiguous status mappings should be visually distinct in preview (maybe warning icon or highlight) so users can spot and correct them

</specifics>

<deferred>
## Deferred Ideas

None - discussion stayed within phase scope.

</deferred>

---

*Phase: 02-structure-discovery-a-workspace-population*
*Context gathered: 2026-01-26*
