# Convex Migration Readiness

This document is the route-by-route migration checklist for Phase 7 (`GTM-59`, `GTM-60`). It identifies the biggest remaining PostgreSQL / Drizzle / REST / SSE dependencies and categorizes each surface as:

- `migrate-now` — Convex parity exists or is close enough to start
- `blocked` — missing Convex schema/query parity
- `intentional-server-side` — likely to remain server-route driven even after UI migration

## Summary

### Best first tranche

1. `/`
2. `/workspace/[id]`
3. `/workspace/[id]/signals`
4. `/workspace/[id]/tasks`
5. `/workspace/[id]/inbox`

These routes unlock the highest-traffic UI and already have the strongest Convex footing.

### Biggest blockers

1. workspace membership / invitations parity
2. explicit write-side boundary decisions for personas + knowledgebase
3. explicit GitHub browsing / connected-account server boundaries
4. project detail page write-side parity outside the Convex read spine

## Route Map

| Route / Surface | Current backend path | Target Convex path | Status | Notes |
|---|---|---|---|---|
| `/` | `src/app/page.tsx` → `/api/workspaces` | `convex/workspaces.ts` | `migrate-now` | Initial workspace fetch/create is on Convex; remaining parity gap is membership-scoped listing/roles. |
| `/workspace/[id]` | `WorkspacePageClient.tsx` → `/api/workspaces/[id]`, `/api/projects` | `convex/workspaces.ts`, `convex/projects.ts` | `migrate-now` | Highest-value spine of the app. Slug/metadata path is safe on Convex; membership-aware chrome still blocks full cleanup. |
| `/projects/[id]` | `ProjectDetailPage.tsx` → `/api/projects/[id]`, docs, signals, prototypes, columns, graduation | `convex/projects.ts`, `convex/documents.ts`, `convex/signals.ts`, `convex/jobs.ts` | `migrate-now` | Main project detail read spine is now Convex-backed. Remaining gaps are explicit empty-state/compatibility seams for tickets, stage history, and jury parity rather than hidden legacy authority. |
| `/workspace/[id]/signals` | `SignalsPageClient.tsx`, `SignalsTable.tsx`, `SignalDetailModal.tsx` → `/api/signals*` | `convex/signals.ts` | `migrate-now` | Table + route shell already read Convex data; remaining blockers are suggestion/orphan maintenance flows that still depend on legacy membership + persona parity. |
| `/workspace/[id]/inbox` | `InboxPageClient.tsx` | `convex/inbox.ts`, `convex/inboxItems.ts` | `already-mostly-convex` | Keep hardening tests and selectors; only minor glue remains. |
| `/workspace/[id]/tasks` | tasks pages + Convex hooks | `convex/tasks.ts` | `already-mostly-convex` | Good reference surface for future migrations. |
| `/workspace/[id]/agents` | `AgentsList.tsx` still fetches `/api/agents` | `convex/agents.ts`, `convex/agentDefinitions.ts` | `migrate-now` | UI already uses Convex actions for sync and job scheduling; list fetch should move next. |
| `/workspace/[id]/settings` | workspace, members, invitations, GitHub status routes | mixed Convex + server-side | `blocked` | Workspace-owned settings state is Convex-backed. Remaining blockers are memberships/invitations parity plus explicit GitHub/account adapters that intentionally stay server-side. |
| `/workspace/[id]/knowledgebase` | `KnowledgebasePageClient.tsx` → `/api/knowledgebase*` | `convex/knowledgebase.ts` | `blocked` | Runtime reads are Convex-authoritative. The route is now an explicit lens over Convex plus a compatibility export adapter for file sync/writeback. |
| `/workspace/[id]/personas` | `PersonasPageClient.tsx` → `/api/personas` | `convex/personas.ts` | `blocked` | Runtime reads are Convex-backed. The route is now an explicit lens over Convex plus a compatibility export adapter while the final authoring model is decided. |
| `/workspace/[id]/commands` | mostly static / agent-definition driven | `convex/agentDefinitions.ts` | `migrate-now` | Low-risk after agent list moves. |
| `/workspace/[id]/onboarding` | mixed repo-discovery / auth / workspace bootstrap | mixed Convex + server-side | `blocked` | Coupled to GitHub discovery and legacy auth bridge. |
| `/search` | `src/app/(dashboard)/search/page.tsx` → `/api/search` | `convex/search.ts` | `already-mostly-convex` | Search authority is Convex-backed and `results[]` is canonical. Legacy category buckets remain compatibility output only for callers that have not switched yet. |

## Legacy API Boundaries to Inventory

### Workspace / project spine

- `src/app/api/workspaces/route.ts`
- `src/app/api/workspaces/[id]/route.ts`
- `src/app/api/projects/route.ts`
- `src/app/api/projects/[id]/route.ts`

### Jobs / runs / transport

- `src/app/api/jobs/route.ts`
- `src/app/api/jobs/process/route.ts`
- `src/app/api/runs/route.ts`
- `src/app/api/runs/[id]/route.ts`
- `src/hooks/useRunStatus.ts`

### Signals

- `src/components/signals/SignalsTable.tsx`
- `src/components/signals/SignalDetailModal.tsx`
- `src/components/signals/CreateSignalModal.tsx`

### File-backed / special-case surfaces

- `src/app/api/personas/route.ts` — canonical Convex read/write with compatibility export side effect
- `src/app/api/knowledgebase/[type]/route.ts` — canonical Convex read/write with compatibility export side effect
- `src/app/api/search/route.ts` — canonical Convex search; compatibility buckets only in response contract
- `src/components/settings/GithubRepoSelector.tsx`
- `src/app/api/github/status/route.ts`
- `src/app/api/github/repos/route.ts`
- `src/app/api/github/tree/route.ts`
- `src/app/api/github/contents/[...path]/route.ts`

These GitHub routes are `intentional-server-side`. They are external adapter surfaces for per-user OAuth state and live GitHub browsing, not workspace source-of-truth.

## Memory Cutover Classification

### Fully canonical runtime-authority paths

- `convex/runtimeMemory.ts`
- `convex/search.ts`
- `convex/mcp.ts` runtime queries:
  - `searchWorkspace`
  - `listWorkspaceRuntimeContext`
  - `getProjectRuntimeContext`
- `src/lib/context/resolve.ts` workspace/project/verification context helpers

These surfaces now fail fast on missing or malformed canonical runtime payloads and no longer downgrade to empty file/Drizzle-backed context.

### Intentional server-side adapters

- `convex/http.ts` runtime/search MCP routes
- `src/lib/convex/server.ts` runtime context + search helpers
- `src/app/api/search/route.ts`

These surfaces are allowed to remain server-side because they are adapters into the Convex runtime authority, not separate sources of truth.

### Intentional hybrid lens / mirror paths

- `src/app/api/personas/route.ts` — Convex authority, file export mirror
- `src/app/api/knowledgebase/[type]/route.ts` — Convex authority, file export mirror

### Still hybrid outside cutover runtime authority

- `src/lib/context/resolve.ts` project state document helpers (`getProjectState`, `updateProjectState`, `getDocumentByType`) still use legacy documents storage

## Missing Convex Parity

These are the biggest missing building blocks before a clean full migration:

- workspace membership and invitation parity
- memberships / invitations parity for the settings page
- persona and knowledgebase write-side boundary cleanup after Convex read cutover
- search ranking / UX tuning on top of the Convex-backed workspace search surface
- project-detail parity for tickets / history / jury / graduation edge cases without restoring legacy authority

## Recommended Implementation Order

1. Migrate the workspace/project spine:
   - `/`
   - `/workspace/[id]`
   - `/workspace/[id]/agents`
   - `/workspace/[id]/signals`
2. Treat inbox and tasks as validation/reference surfaces because they are already mostly Convex-backed.
3. Decide the post-migration server-side boundary explicitly:
   - GitHub tree/contents browsing
   - file-backed personas / knowledgebase if retained temporarily
4. Only then move `/projects/[id]` and `/workspace/[id]/settings`.

## Success Criteria for Lane C

- Every major route is categorized as `migrate-now`, `blocked`, or `intentional-server-side`
- The first migration tranche is small and executable
- Remaining blockers are named as concrete parity gaps, not vague “legacy complexity”
