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
2. personas and knowledgebase file-backed flows
3. search and legacy GitHub repo discovery paths
4. project detail page cross-cutting dependencies

## Route Map

| Route / Surface | Current backend path | Target Convex path | Status | Notes |
|---|---|---|---|---|
| `/` | `src/app/page.tsx` → `/api/workspaces` | `convex/workspaces.ts` | `migrate-now` | Initial workspace fetch/create is on Convex; remaining parity gap is membership-scoped listing/roles. |
| `/workspace/[id]` | `WorkspacePageClient.tsx` → `/api/workspaces/[id]`, `/api/projects` | `convex/workspaces.ts`, `convex/projects.ts` | `migrate-now` | Highest-value spine of the app. Slug/metadata path is safe on Convex; membership-aware chrome still blocks full cleanup. |
| `/projects/[id]` | `ProjectDetailPage.tsx` → `/api/projects/[id]`, docs, signals, prototypes, columns, graduation | `convex/projects.ts`, `convex/documents.ts`, `convex/signals.ts`, `convex/jobs.ts` | `blocked` | Needs a deliberate split between Convex data and server-side GitHub/prototype flows. |
| `/workspace/[id]/signals` | `SignalsPageClient.tsx`, `SignalsTable.tsx`, `SignalDetailModal.tsx` → `/api/signals*` | `convex/signals.ts` | `migrate-now` | Table + route shell already read Convex data; remaining blockers are suggestion/orphan maintenance flows that still depend on legacy membership + persona parity. |
| `/workspace/[id]/inbox` | `InboxPageClient.tsx` | `convex/inbox.ts`, `convex/inboxItems.ts` | `already-mostly-convex` | Keep hardening tests and selectors; only minor glue remains. |
| `/workspace/[id]/tasks` | tasks pages + Convex hooks | `convex/tasks.ts` | `already-mostly-convex` | Good reference surface for future migrations. |
| `/workspace/[id]/agents` | `AgentsList.tsx` still fetches `/api/agents` | `convex/agents.ts`, `convex/agentDefinitions.ts` | `migrate-now` | UI already uses Convex actions for sync and job scheduling; list fetch should move next. |
| `/workspace/[id]/settings` | workspace, members, invitations, GitHub status routes | mixed Convex + server-side | `blocked` | Missing Convex parity for memberships/invitations and a decision on GitHub settings boundaries. |
| `/workspace/[id]/knowledgebase` | `/api/knowledgebase/[type]` + file writes | `convex/knowledgebase.ts` | `blocked` | Needs a product decision: model fully in Convex or keep file-backed sync as exception. |
| `/workspace/[id]/personas` | `/api/personas` + `fs/promises` writes into docs | no first-class Convex personas model | `blocked` | Not a simple fetch swap. Requires data-model decision first. |
| `/workspace/[id]/commands` | mostly static / agent-definition driven | `convex/agentDefinitions.ts` | `migrate-now` | Low-risk after agent list moves. |
| `/workspace/[id]/onboarding` | mixed repo-discovery / auth / workspace bootstrap | mixed Convex + server-side | `blocked` | Coupled to GitHub discovery and legacy auth bridge. |
| `/search` | `/api/search/route.ts` uses Drizzle directly | likely `convex/knowledgebase.ts` + `convex/memory.ts` | `blocked` | Needs a dedicated Convex search/query strategy. |

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

- `src/app/api/personas/route.ts`
- `src/app/api/knowledgebase/[type]/route.ts`
- `src/app/api/search/route.ts`
- `src/components/settings/GithubRepoSelector.tsx`
- `src/app/api/github/status/route.ts`
- `src/app/api/github/repos/route.ts`
- `src/app/api/github/tree/route.ts`
- `src/app/api/github/contents/[...path]/route.ts`

## Missing Convex Parity

These are the biggest missing building blocks before a clean full migration:

- workspace membership and invitation parity
- connected-account / GitHub integration state suitable for settings UI
- personas as a first-class Convex model
- a clear Convex-backed search strategy for documents + memory
- project-detail parity for columns / graduation / prototypes edge cases

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
