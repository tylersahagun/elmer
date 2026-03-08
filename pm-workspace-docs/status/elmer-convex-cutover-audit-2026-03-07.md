# Elmer Convex Cutover Audit

**Generated:** 2026-03-07
**Baseline:** `codex/elmer-alpha-integration` @ `6f5307f`
**Purpose:** State the current cutover reality after the integration merge/fix pass, identify what is already Convex-authoritative, identify what is still bridge-mode or legacy, and define the shortest path to a fully functional source-of-truth architecture.

## Executive Summary

Elmer is not fully cut over yet.

The important distinction is:

- The **runtime alpha spine** is now mostly on Convex.
- The **full application data architecture** is still mixed.
- The remaining debt is no longer vague. It is concentrated in a small set of named route classes and parity gaps.

As of `6f5307f`, the internal-alpha baseline is materially healthier:

- workspace board and project detail core paths are on Convex-backed reads
- runtime memory/search authority is explicitly Convex-first
- personas and knowledgebase runtime reads are Convex-first with compatibility export mirrors
- auth/reliability gate is green locally
- typecheck and targeted integration tests are green locally
- the `Documents` tab crash path is fixed locally and covered by regression tests

What is **not** true yet:

- root workspace list/create is now Convex-backed, but invitation and import/sync identity still preserve legacy bridge behavior
- invitation acceptance still depends on `requireCurrentAppUser()`
- several sync/import routes still use the app-user bridge and Drizzle workspace lookup
- project detail still has explicit parity gaps in commits, automation/tickets, and legacy-adjacent subroutes
- a long tail of route handlers and internal services still read/write through Drizzle

## What Is Canonical Today

### 1. Implementation truth

- Linear is canonical for issue state and sequencing.

### 2. Runtime context truth

- Convex graph-backed memory is canonical for runtime context retrieval.
- Canonical cutover surfaces:
  - `orchestrator/convex/runtimeMemory.ts`
  - `orchestrator/convex/search.ts`
  - `orchestrator/convex/mcp.ts`
  - `orchestrator/src/lib/context/resolve.ts`

### 3. Core alpha UI spine

These surfaces are now substantially Convex-backed:

- `/workspace/[id]`
- `/projects/[id]` read spine
- `/workspace/[id]/signals` core list/read/create flows
- `/workspace/[id]/tasks`
- `/workspace/[id]/inbox`
- workspace members/invitations/settings parity surfaces
- personas runtime reads
- knowledgebase runtime reads
- workspace search

### 4. Compatibility mirrors, not runtime authority

- personas file export
- knowledgebase file export
- MCP HTTP adapter routes
- server-side Convex helper fetch layer in `orchestrator/src/lib/convex/server.ts`

These are acceptable only if they remain adapters or mirrors and do not reclaim authority.

## Code Reality Snapshot

These counts are from production route files under `orchestrator/src/app/api` after the `/api/workspaces` cutover:

- `121` route files total
- `50` still import `@/lib/db/queries`
- `20` import `@/lib/convex/server`
- `64` use `requireWorkspaceAccess`
- `5` still use `requireCurrentAppUser`
- `40` still contain direct Drizzle / `db.query` usage

This means the codebase is **past the architecture-decision phase** but **not past the migration phase**.

## What Has Actually Been Converted

### Converted enough to support the current alpha spine

#### Workspace / membership / settings parity

- `orchestrator/src/app/api/workspaces/route.ts`
- `orchestrator/convex/workspaces.ts`
- `orchestrator/convex/memberships.ts`
- `orchestrator/src/app/api/workspaces/[id]/route.ts`
- `orchestrator/src/app/api/workspaces/[id]/members/route.ts`

Current state:

- root workspace list/create now proxies through the Convex MCP bridge instead of SQL authority
- workspace details read through Convex
- workspace member reads proxy through Convex
- permission checks consult Convex membership first
- coordinator fallback exists for the special internal workspace

#### Project detail read spine

- `orchestrator/src/app/api/projects/[id]/route.ts`
- `orchestrator/src/app/(dashboard)/projects/[id]/ProjectDetailPage.tsx`

Current state:

- project + documents + workspace + linked signals + prototype overlays are Convex-backed
- project detail is still a compatibility model around a Convex core

#### Runtime context / search / memory

- `orchestrator/src/app/api/search/route.ts`
- `orchestrator/src/lib/context/resolve.ts`
- `orchestrator/convex/runtimeMemory.ts`
- `orchestrator/convex/search.ts`
- `orchestrator/convex/mcp.ts`

Current state:

- search is Convex-first
- runtime context fails fast on malformed/missing canonical payloads
- declared cutover surfaces no longer degrade to empty legacy context

#### Personas / knowledgebase

- `orchestrator/src/app/api/personas/route.ts`
- `orchestrator/src/app/api/knowledgebase/[type]/route.ts`

Current state:

- reads are Convex-authoritative
- writes are Convex-first
- file export is secondary compatibility behavior only

## What Is Still Not Converted

### 1. Invitation acceptance still bridges through the legacy app user

**File:** `orchestrator/src/app/api/invitations/[token]/route.ts`

Current behavior:

- invitation lookup is Convex-backed
- acceptance still requires `requireCurrentAppUser()`
- acceptance still depends on the old app-user identity existing alongside Clerk identity

Why it matters:

- this is the direct remaining GTM-102 parity seam
- it keeps onboarding/access dependent on the old user model

### 2. Import/sync routes still depend on app-user + legacy workspace lookup

**Files:**

- `orchestrator/src/app/api/workspaces/[id]/import/route.ts`
- `orchestrator/src/app/api/workspaces/[id]/syncKnowledge/route.ts`
- `orchestrator/src/app/api/workspaces/[id]/syncSignals/route.ts`

Current behavior:

- require workspace access, but still also require the legacy app user
- still use Drizzle workspace reads
- still bind downstream GitHub/sync behavior to the old user path

Why it matters:

- these flows are still operationally important
- they preserve a split identity/data model even where Convex ownership exists

### 3. Project detail parity is incomplete

Main read path is migrated, but several explicit edges are not:

- `orchestrator/src/app/api/projects/[id]/commits/route.ts`
- `orchestrator/src/app/api/projects/[id]/tickets/sync/route.ts`
- `orchestrator/src/app/api/projects/[id]/automation-status/route.ts`
- `orchestrator/src/app/api/projects/from-cluster/route.ts`

Why it matters:

- these are the remaining reasons project detail is still a compatibility shell instead of a fully Convex-native surface

### 4. Jobs, signals ingest, documents, and a service long tail still use Drizzle

Representative route files with direct Drizzle usage:

- `orchestrator/src/app/api/jobs/route.ts`
- `orchestrator/src/app/api/jobs/[id]/route.ts`
- `orchestrator/src/app/api/jobs/[id]/runs/route.ts`
- `orchestrator/src/app/api/jobs/[id]/questions/route.ts`
- `orchestrator/src/app/api/inbox/route.ts`
- `orchestrator/src/app/api/inbox/[id]/process/route.ts`
- `orchestrator/src/app/api/documents/[id]/route.ts`
- `orchestrator/src/app/api/signals/[id]/suggestions/route.ts`
- `orchestrator/src/app/api/workspaces/[id]/signals/ingest/route.ts`
- `orchestrator/src/app/api/webhooks/ingest/route.ts`

Representative internal services still anchored on Drizzle:

- `orchestrator/src/lib/jobs/processor.ts`
- `orchestrator/src/lib/queue/index.ts`
- `orchestrator/src/lib/agent/worker.ts`
- `orchestrator/src/lib/status/portfolio-status.ts`
- `orchestrator/src/lib/automation/*`
- several stage executors still query SQL-backed state

Why it matters:

- this is not blocking the narrow alpha spine the same way `/api/workspaces` and invitations are
- but it does mean the “main data architecture” is still hybrid at the route/service layer

## Intentional Boundaries vs Real Debt

### Intentional boundaries that may remain server-side

These are acceptable to keep server-side if they are explicitly treated as adapters:

- GitHub status/repo/tree/contents routes
- MCP HTTP transport routes
- external sync/auth adapters
- file export mirrors for personas and knowledgebase

### Real debt that should still be removed

- any route that treats Drizzle as the authoritative source for workspace/project/user-facing product state
- any route that still requires `requireCurrentAppUser()` for core workspace access or invitation acceptance
- any project detail flow where Convex has the core entity but the user-visible action still depends on legacy state

## Current Verdict

### Is Elmer “on Convex” yet?

**Partially, yes. Fully, no.**

More precise answer:

- **Yes** for runtime memory/search authority and the current alpha board/project read spine.
- **No** for the full main data architecture, because core route ownership is still mixed and the legacy app-user bridge still exists on important flows.

### Is the architecture direction coherent now?

**Yes.**

The remaining work is no longer “figure out the architecture.” It is “finish the migration and remove the last false authorities.”

## What Remains To Reach A Fully Functional Main Data Architecture

### Stage 1. Prove the current integration build in production

Objective:

- deploy `codex/elmer-alpha-integration` @ `953b959`
- rerun the real alpha path
- confirm the `Documents` tab no longer crashes on the deployed app

Exit evidence:

- alpha rerun is at least `Conditional go`
- `GTM-113` is cleared from deployed behavior, not just local code

### Stage 2. Remove the highest-value remaining false authority

#### A. Finish membership/invitation parity

Do:

- backfill durable `workspaceMembers` rows for the coordinator workspace
- remove viewer fallback from the normal happy path
- migrate invitation acceptance off `requireCurrentAppUser()`

This is the cleanest way to actually close `GTM-102`.

### Stage 3. Finish the explicit project parity slices

Do these as separate slices:

1. `read-only parity`
   - commits
   - graduation / automation status surfaces

2. `interactive parity`
   - tickets sync
   - any project mutation path still routed through legacy helpers

3. `display parity`
   - history
   - jury
   - any cockpit tab still depending on compatibility-only data

This is the cleanest way to finish `GTM-103`.

### Stage 4. Make the boundary decisions operational

#### GTM-99

Decide and encode one of:

- keep personas/knowledgebase export as a supported compatibility mirror
- or retire it

If kept:

- surface export degradation clearly in UI and API contracts

#### GTM-100

Define the search contract:

- which content classes are searchable
- ranking rules
- whether results remain bucketed for compatibility or move to canonical flat results everywhere

#### GTM-101

Document GitHub routes as intentional external adapters and stop treating them as core data-authority debt.

### Stage 5. Collapse the long tail

After the alpha spine is stable:

- move remaining user-facing jobs/inbox/document/signal routes off direct Drizzle authority
- decide which internal processors remain SQL-backed temporarily versus move to Convex next
- shrink `@/lib/db/queries` from product authority into a legacy-compatibility layer only

## Recommended Execution Order

1. Deploy the latest integration build and rerun alpha.
2. Remove invitation/app-user bridge and backfill durable membership parity.
3. Finish project detail parity slices.
4. Close search and export policy decisions.
5. Tackle the remaining route/service long tail.

## Definition Of “Fully Functional” For This Architecture

Elmer should be considered fully functional on the target architecture when all of the following are true:

- workspace/project/user-facing runtime state is Convex-authoritative
- runtime context and search are Convex-authoritative without fallback
- invitation and membership flows no longer require the legacy app-user bridge
- remaining server-side paths are explicitly adapters, not accidental sources of truth
- the deployed alpha path is stable enough to use daily without route-level or authority-level surprises

## Bottom Line

The main architecture is close enough to be operationally real, but not close enough to be called finished.

The good news is that the remaining work is now narrow:

- one invitation/membership parity seam
- a bounded project-detail parity set
- a documented long tail of legacy route/service debt

That is a finishable migration, not a vague rebuild.
