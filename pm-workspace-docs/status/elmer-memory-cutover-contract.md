# Elmer Memory Cutover Contract

**Generated:** 2026-03-07  
**Purpose:** Define the canonical runtime context model for the internal-alpha reset so migration, search, and collaboration work stop competing on where memory lives.

## Canonical Rules

1. Linear is canonical for implementation state, issue ownership, and sequencing.
2. Convex graph-backed memory is canonical for runtime context retrieval inside Elmer.
3. Personas, knowledgebase entries, signals, inbox summaries, and project metadata are user-facing lenses over shared memory, not separate runtime authorities.
4. File-backed mirrors and markdown exports may continue during migration, but no new business-critical context may exist only in file-backed or legacy database paths.
5. External adapters such as GitHub, Notion, and MCP may remain server-side, but they must read from or write through explicit Convex-owned runtime authority when they affect in-app context.

## Runtime Memory Model

The runtime contract should converge on five concepts:

- `entities`: canonical nodes such as project, document, signal, person, account, agent, task, or concept
- `relations`: typed edges between entities with provenance and recency
- `observations`: grounded facts, notes, summaries, or extracted evidence attached to an entity or relation
- `provenance`: where the context came from, when it was observed, and whether it is a compatibility mirror or first-party runtime data
- `promotion state`: whether a piece of context is draft, promoted, archived, or compatibility-only

## Lens And Mirror Rules

These surfaces may remain visible, but they should stop acting like parallel backends:

- `personas`: lens over shared memory plus any temporary compatibility mirror required for export
- `knowledgebaseEntries`: document-style lens over shared memory and company context
- `signals` and `inbox`: event-driven inputs that promote evidence into shared memory
- `pm-workspace-docs/`: backup, export, and audit surface; not runtime authority

## Cutover Boundaries

### Must move to canonical memory

- runtime context injection for agents
- search direction for documents, memory, and knowledge lookups
- project and workspace context retrieval on Convex-first routes
- any new alpha-era context features

### May remain temporary compatibility mirrors

- markdown export/writeback paths used for archival or downstream sync
- file-backed editing surfaces that have not yet been migrated, if they are explicitly marked as mirrors
- external server-side adapter routes that do not claim runtime authority

## Operational Cutover Status

As of the integrated `codex/elmer-alpha-integration` baseline plus the GTM-104 / GTM-105 cleanup slice, the contract is operational on the declared cutover surfaces:

### Canonical runtime-authority surfaces

- `orchestrator/convex/runtimeMemory.ts`
- `orchestrator/convex/search.ts`
- `orchestrator/convex/mcp.ts` runtime queries:
  - `searchWorkspace`
  - `listWorkspaceRuntimeContext`
  - `getProjectRuntimeContext`
- `orchestrator/src/lib/context/resolve.ts` runtime context helpers:
  - `getWorkspaceContext`
  - `getProjectContext`
  - `getPRDContext`
  - `getAllVerificationContext`

These surfaces must fail fast on missing or malformed canonical payloads. They may not degrade to empty context, stale file-backed state, or mirror-table authority.

### Intentional adapters

- `orchestrator/convex/http.ts` runtime/search MCP routes
- `orchestrator/src/lib/convex/server.ts` server-side HTTP helpers into those MCP routes
- file export / writeback paths for personas and knowledgebase while migration remains in progress

These adapters are allowed to exist, but they must only transport or mirror canonical Convex-owned runtime authority. They are not allowed to decide authority themselves.

### Migration-owned hybrid boundary

- `orchestrator/src/lib/context/resolve.ts` state document helpers:
  - `getProjectState`
  - `updateProjectState`
  - `getDocumentByType`

This boundary is explicitly outside runtime-authority cutover. It may remain hybrid until migration finishes the project-state/document path, but it must not be reused as runtime context authority.

## Issue Mapping

- `GTM-104`: define the canonical memory contract and the lens/mirror model
- `GTM-105`: remove legacy fallbacks from cutover surfaces after the contract is explicit
- `GTM-99`: depends on this contract for personas and knowledgebase boundary decisions
- `GTM-100`: depends on this contract for search direction
- `GTM-103`: depends on this contract for project-detail parity where context is still split
- `GTM-55`: should not become the active orchestrator implementation lane until this contract is stable enough to support trustworthy project-health logic

## Exit Evidence

This contract is holding when:

- one runtime memory contract can be named without caveats
- cutover surfaces no longer resolve context from file-backed or Drizzle-first fallbacks
- personas and knowledge surfaces are described as lenses or mirrors, not separate authorities
- migration docs classify any remaining server-side paths as explicit adapters, not accidental runtime dependencies
