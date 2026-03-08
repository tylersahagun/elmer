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

1. durable workspace membership / invitation parity for the coordinator workspace and public invite flows
2. explicit write-side boundary closeout for personas + knowledgebase export adapters
3. explicit GitHub browsing / connected-account server boundaries in settings
4. project detail parity outside the Convex read spine

## Owned Blocker Status

| Ticket | Status | Current truth on integration baseline | Alpha-path impact | Next minimal implementation slice |
|---|---|---|---|---|
| `GTM-59` | `in-progress` | The high-traffic workspace/project runtime is largely on Convex, but `/api/workspaces` root listing/creation is still Drizzle-first and remains the clearest remaining route bridge. | Indirect. Not the first blocker on alpha now, but still prevents a clean "Elmer is source of truth" claim. | Replace `/api/workspaces` GET/POST with Convex-backed membership-scoped listing/create so `/` no longer depends on `requireCurrentAppUser()` + Drizzle. |
| `GTM-99` | `explicit-boundary, not closed` | Personas and knowledgebase runtime authority is already Convex-first. Repo file writes are now explicit secondary export adapters via `runSecondaryExport()`. | No longer blocking alpha runtime. | Decide whether export remains a supported backup path or is removed. If retained, surface `207` export warnings in the authoring UI so the boundary is operationally explicit. |
| `GTM-100` | `defined-path, not closed` | `/api/search` already delegates to Convex search. The migration question is no longer storage authority; it is scope, ranking, and what content classes are searchable. | None on current alpha blocker path. | Codify search corpus and ranking contract: documents + runtime memory + knowledgebase/personas excerpts, then add focused search tests instead of more migration plumbing. |
| `GTM-101` | `blocked-by-boundary-ownership` | Settings-owned workspace repo/config state is Convex-backed, but GitHub connection status, repo browsing, tree, and contents are still per-user server adapters. | Secondary. Not blocking current alpha board/project path. | Mark the four GitHub routes as intentional external adapters and stop treating them as workspace source-of-truth debt; then remove any remaining settings assumptions that those endpoints own workspace config. |
| `GTM-102` | `active parity blocker` | Settings page member/invitation reads are already Convex-backed, but the coordinator workspace still has no durable `workspaceMembers` mirror rows and invitation acceptance still depends on `requireCurrentAppUser()`. `GTM-110` and `GTM-112` were symptoms of this gap. | Direct. This was the root parity class behind the signed-in board/project authorization failures. | Backfill the coordinator workspace membership mirror for the real Clerk user ids and remove the temporary viewer fallback from the happy path. After that, migrate `/api/invitations/[token]` off the app-user bridge. |
| `GTM-103` | `in-progress` | `/api/projects/[id]` is now Convex-backed for project + documents + optional prototypes/signals, and the signed-in cockpit path is healthy enough for alpha. Remaining gaps are explicit empty-state seams and legacy subroutes, not hidden authority in the main route. | Direct. This owned the authenticated cockpit degradation after the generic `500` was removed. | Break the remaining project detail work into three slices: `read-only parity` (`commits`, `graduation`), `interactive parity` (`tickets sync`, prototype mutations still using legacy helpers), and `history/jury` display parity. |

### Alpha-path interpretation

- `GTM-110` and `GTM-112` were not new standalone migration themes.
- `GTM-110` was a `GTM-102` membership parity failure on the coordinator workspace.
- `GTM-112` was the same parity class surfacing inside the board shell's Convex workspace lookup after auth refresh.
- The current deployed alpha path is healthy enough for board + project verification, but the durable fix is still to create/maintain real Convex membership rows instead of leaning on the coordinator viewer fallback.

## Route Map

| Route / Surface | Current backend path | Target Convex path | Status | Notes |
|---|---|---|---|---|
| `/` | `src/app/page.tsx` → `/api/workspaces` | `convex/workspaces.ts` | `blocked` | The page shell is ready, but `/api/workspaces` is still a Drizzle-first bridge for list/create. This is the cleanest remaining root-route cutover. |
| `/workspace/[id]` | `WorkspacePageClient.tsx` → Convex `workspaces.get`, `/api/projects`, `/api/columns`, `/api/workspaces/[id]` | `convex/workspaces.ts`, `convex/projects.ts`, `convex/columns.ts` | `migrate-now` | Deployed alpha path is stable again. Remaining debt is durable Convex membership parity for the coordinator workspace, not the board data APIs. |
| `/projects/[id]` | `ProjectDetailPage.tsx` → `/api/projects/[id]`, Convex columns/prototypes/signals, legacy subroutes | `convex/projects.ts`, `convex/documents.ts`, `convex/signals.ts`, `convex/prototypes.ts` | `migrate-now` | Main project detail read spine is now Convex-backed. Remaining gaps are explicit slices: graduation, commits, tickets sync, and jury/history parity. |
| `/workspace/[id]/signals` | `SignalsPageClient.tsx`, `SignalsTable.tsx`, `SignalDetailModal.tsx` → `/api/signals*` | `convex/signals.ts` | `migrate-now` | Table + route shell already read Convex data; remaining blockers are suggestion/orphan maintenance flows that still depend on legacy membership + persona parity. |
| `/workspace/[id]/inbox` | `InboxPageClient.tsx` | `convex/inbox.ts`, `convex/inboxItems.ts` | `already-mostly-convex` | Keep hardening tests and selectors; only minor glue remains. |
| `/workspace/[id]/tasks` | tasks pages + Convex hooks | `convex/tasks.ts` | `already-mostly-convex` | Good reference surface for future migrations. |
| `/workspace/[id]/agents` | `AgentsList.tsx` still fetches `/api/agents` | `convex/agents.ts`, `convex/agentDefinitions.ts` | `migrate-now` | UI already uses Convex actions for sync and job scheduling; list fetch should move next. |
| `/workspace/[id]/settings` | workspace route, Convex members/invitations, GitHub status routes | mixed Convex + server-side | `blocked` | Member and invitation reads are already Convex-backed. Remaining blockers are the public invitation acceptance bridge and explicit ownership of GitHub/account routes. |
| `/workspace/[id]/knowledgebase` | `KnowledgebasePageClient.tsx` → `/api/knowledgebase*` | `convex/knowledgebase.ts` | `migrate-now` | Runtime reads are Convex-authoritative and writes are Convex-first with explicit secondary export. Remaining work is policy closeout, not runtime authority migration. |
| `/workspace/[id]/personas` | `PersonasPageClient.tsx` → `/api/personas` | `convex/personas.ts` | `migrate-now` | Runtime reads are Convex-backed and writes are Convex-first with explicit secondary export. Remaining work is the long-term export decision and authoring UX for export failures. |
| `/workspace/[id]/commands` | mostly static / agent-definition driven | `convex/agentDefinitions.ts` | `migrate-now` | Low-risk after agent list moves. |
| `/workspace/[id]/onboarding` | mixed repo-discovery / auth / workspace bootstrap | mixed Convex + server-side | `blocked` | Coupled to GitHub discovery and legacy auth bridge. |
| `/search` | `src/app/(dashboard)/search/page.tsx` → `/api/search` | `convex/search.ts` | `migrate-now` | Search authority is already Convex-backed. Remaining blocker work is to define the search corpus/ranking contract, not to remove a legacy DB read path. |

## Legacy API Boundaries to Inventory

### Workspace / project spine

- `src/app/api/workspaces/route.ts`
- `src/app/api/workspaces/[id]/route.ts`
- `src/app/api/projects/route.ts`
- `src/app/api/projects/[id]/route.ts`

`src/app/api/workspaces/route.ts` is still the clearest live Drizzle-first bridge in the owned blocker set.

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

These GitHub routes are `intentional-server-side`. They are external adapter surfaces for per-user OAuth state and live GitHub browsing, not workspace source-of-truth.

## Missing Convex Parity

These are the biggest missing building blocks before a clean full migration:

- durable workspace membership parity rows for the coordinator workspace instead of viewer-only fallback
- invitation acceptance without the `requireCurrentAppUser()` bridge in `src/app/api/invitations/[token]/route.ts`
- explicit retention/removal decision for personas + knowledgebase secondary export
- search corpus/ranking contract on top of the Convex-backed workspace search surface
- project-detail parity for `graduation`, `commits`, ticket sync, and jury/history edge cases without restoring legacy authority

## Recommended Implementation Order

1. Finish the durable coordinator workspace parity work:
   - create/backfill real Convex `workspaceMembers` rows for the coordinator workspace
   - remove the temporary viewer fallback from the happy path
2. Replace the remaining root route bridge:
   - `/api/workspaces` GET/POST
3. Close the explicit boundary tickets:
   - GitHub tree/contents/status/repos stay server-side
   - personas / knowledgebase export remains or is removed intentionally
4. Finish project detail via explicit parity slices:
   - read-only parity (`graduation`, `commits`)
   - interactive parity (`tickets sync`, prototype mutations if still legacy-backed)
   - display parity (`history`, `jury`)

## Success Criteria for Lane C

- Every major route is categorized as `migrate-now`, `blocked`, or `intentional-server-side`
- The first migration tranche is small and executable
- Remaining blockers are named as concrete parity gaps, not vague “legacy complexity”
- The alpha board/project path is explainable in terms of `GTM-102` and `GTM-103`, not as unexplained route instability
