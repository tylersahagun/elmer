# Convex Cutover: Source of Truth

**Created:** 2026-03-09  
**Status:** In Progress  
**Goal:** Full elimination of Postgres/Neon/pgvector as application data backends. Convex + Clerk become the only data and auth backends.

---

## 1. Final Architecture Summary

```
┌─────────────────────────────────────────────────────────────┐
│  FINAL STATE                                                 │
│                                                              │
│  Auth: Clerk (identity) + Convex (membership/ACL)           │
│  Data: Convex (all application state)                        │
│  Search: Convex full-text search + stored embeddings         │
│  Workers: External processes, Convex as control plane        │
│  Integrations: GitHub OAuth (server-side), Composio          │
└─────────────────────────────────────────────────────────────┘
```

**Removed entirely:**
- `@neondatabase/serverless` + Neon cloud database
- `drizzle-orm` + `drizzle-kit`
- `pg` + `@types/pg`
- `next-auth` + `@auth/drizzle-adapter`
- `DATABASE_URL` environment variable
- All `src/lib/db/` module
- All Drizzle migration files

**Remains (intentional server-side):**
- GitHub OAuth token exchange (per-user, not workspace state)
- Composio tool execution (external service, not application state)
- AI provider calls (OpenAI embeddings, Anthropic LLM) — stateless

---

## 2. Subsystem Inventory

### 2.1 Auth

| Component | Current | Target | Status |
|-----------|---------|--------|--------|
| Request identity | Clerk `auth()` | Clerk `auth()` | ✅ Done |
| Middleware protection | `clerkMiddleware` | `clerkMiddleware` | ✅ Done |
| Workspace ACL | Convex `workspaceMembers` (primary) + Drizzle fallback | Convex `workspaceMembers` only | 🔴 Blocked |
| User identity bridge | `getCurrentAppUser()` → upserts into Drizzle `users` table | Pure Clerk identity (no Drizzle) | 🔴 Not started |
| Legacy credentials auth | NextAuth v5 + Drizzle adapter (`/api/auth/*`) | Remove entirely (Clerk handles signup/login) | 🔴 Not started |
| Legacy GitHub OAuth | NextAuth `GitHub` provider in `legacy-next-auth.ts` | Clerk OAuth (already handles GitHub) | 🔴 Not started |
| Invitation acceptance | `requireCurrentAppUser()` + Drizzle bridge | Clerk userId + Convex `invitations` | 🟡 Partial |

**Key files:**
- `src/lib/auth/server.ts` — `getCurrentAppUser()` calls `upsertUserByEmail()` → Drizzle
- `src/lib/auth/legacy-next-auth.ts` — NextAuth with DrizzleAdapter, must be removed
- `src/app/api/auth/signup/route.ts` — Inserts into Drizzle `users` table
- `src/lib/permissions.ts` — `requireWorkspaceAccess()` has Drizzle fallback path
- `src/lib/auth/coordinator-viewer.ts` — Coordinator viewer bridge (Drizzle-backed)

### 2.2 Workers

| Component | Current | Target | Status |
|-----------|---------|--------|--------|
| Agent worker (jobs queue) | Polls Drizzle `jobs` table | Convex jobs table already exists | 🟡 UI migrated, worker still Drizzle |
| Execution worker (stage runs) | Polls Drizzle `stage_runs` table | Convex `stageRuns` table (new) | 🔴 Not started |
| Worker heartbeats | Drizzle `worker_heartbeats` | Convex `workerHeartbeats` (new) | 🔴 Not started |
| Run logs (streaming) | Drizzle `run_logs` + SSE | Convex `runLogs` + Convex reactivity | 🔴 Not started |
| Artifacts | Drizzle `artifacts` | Convex `artifacts` (new) | 🔴 Not started |
| Stage recipes | Drizzle `stage_recipes` | Convex `stageRecipes` (new) | 🔴 Not started |
| `/api/worker` | Returns stub "migrated to Convex" | Keep stub | ✅ Done |
| `/api/runs` | Drizzle `stage_runs` | Convex `stageRuns` | 🔴 Not started |

**Key files:**
- `src/execution-worker.ts` — Entry point, uses Drizzle via `run-manager`
- `src/lib/execution/worker.ts` — Polls Drizzle `stage_runs`
- `src/lib/execution/run-manager.ts` — All Drizzle run state CRUD
- `src/lib/queue/index.ts` — Polls Drizzle `jobs` table
- `src/lib/agent/worker.ts` — Agent job runner (Drizzle)
- `src/app/api/runs/route.ts` — Drizzle-backed runs API

### 2.3 Search and Embeddings

| Component | Current | Target | Status |
|-----------|---------|--------|--------|
| Workspace text search | Convex `searchWorkspace` | Keep | ✅ Done |
| Signal similarity (duplicate detection) | pgvector `<=>` cosine distance | Convex stored embeddings + in-memory cosine | ✅ Done |
| Signal clustering | pgvector KNN via `getUnlinkedSignalsWithEmbeddings` | Convex embedding retrieval + in-memory cosine | ✅ Done |
| Project-signal matching | pgvector cosine in `findBestProjectMatch` | Convex embedding retrieval + in-memory cosine | ✅ Done |
| Embedding generation | OpenAI `text-embedding-3-small` (stateless) | Keep (stateless, not Postgres) | ✅ Keep |
| Embedding storage | Drizzle `signals.embedding_vector` (pgvector) | Convex `signals.embeddingVector` (array) | ✅ Done |

**Key files:**
- `src/lib/db/queries.ts` — `findSimilarSignals`, `findBestProjectMatch`, `getUnlinkedSignalsWithEmbeddings`
- `src/lib/classification/clustering.ts` — Uses pgvector KNN
- `src/lib/ai/embeddings.ts` — OpenAI embeddings (keep, stateless)
- `src/lib/db/migrate-vectors.ts` — Migration script (delete after migration)
- `src/app/api/signals/[id]/similar/route.ts` — Calls pgvector similarity
- `src/app/api/signals/duplicates/route.ts` — Uses clustering

**Search quality note:** Switching from pgvector's native index scan to in-memory cosine similarity over Convex-stored embeddings will have similar quality but **worse performance at scale**. For the signal corpus size expected (<50K signals per workspace), in-memory is acceptable. At very high scale, an external vector index (e.g. Upstash Vector) could be introduced, but this is not required for initial migration.

### 2.4 Routes

#### Postgres-backed API routes (to migrate):

| Route | Current | Target | Priority |
|-------|---------|--------|---------|
| `GET/POST /api/jobs` | Drizzle `jobs` | Convex `jobs` | High |
| `GET/PATCH/DELETE /api/jobs/[id]` | Drizzle `jobs` | Convex `jobs` | High |
| `GET /api/jobs/[id]/runs` | Drizzle `stage_runs` | Convex `stageRuns` | High |
| `POST /api/jobs/[id]/questions` | Drizzle `pendingQuestions` | Convex `pendingQuestions` | High |
| `GET/POST /api/runs` | Drizzle `stage_runs` | Convex `stageRuns` | High |
| `GET/PATCH /api/runs/[id]` | Drizzle `stage_runs` | Convex `stageRuns` | High |
| `GET /api/runs/[id]/logs` | Drizzle `run_logs` (SSE) | Convex `runLogs` reactive query | High |
| `GET/PUT/DELETE /api/agents/[id]` | Drizzle `agentDefinitions` | Convex `agentDefinitions` | Medium |
| `GET/POST /api/inbox` | Drizzle `inboxItems` | Convex `inboxItems` | Medium |
| `POST /api/inbox/[id]/process` | Drizzle `inboxItems` + pgvector | Convex | Medium |
| `GET/PUT/DELETE /api/documents/[id]` | Drizzle `documents` | Convex `documents` | Medium |
| `POST /api/discovery/import` | Drizzle `signals`, `projects` | Convex | Medium |
| `GET /api/projects/[id]/automation-status` | Drizzle `stage_runs` | Convex `stageRuns` | High |
| `GET /api/projects/[id]/commits` | Drizzle `projectCommits` | Convex `projectCommits` (new) | Low |
| `POST /api/projects/[id]/tickets/sync` | Drizzle `tickets` | Convex `tickets` (new) | Low |
| `POST /api/projects/from-cluster` | Drizzle `signals`, `projects` | Convex | Medium |
| `GET /api/signals/[id]/similar` | pgvector | Convex embedding similarity | ✅ Done |
| `GET /api/signals/[id]/suggestions` | pgvector | Convex embedding similarity | ✅ Done |
| `GET /api/signals/duplicates` | pgvector clustering | Convex clustering | ✅ Done |
| `POST /api/signals/ingest` | Drizzle `signals` | Convex `signals` | ✅ Done |
| `GET /api/signals` | Drizzle `signals` | Convex `signals` | ✅ Done |
| `GET /api/skills/[id]/summary` | Drizzle `skills` | Convex `skills` | Low |
| `POST /api/webhooks/ingest` | Drizzle `signals`, `inboxItems` | Convex | Medium |
| `GET /api/workspaces/[id]/signals/ingest` | Drizzle `signals` | Convex `signals` | Medium |
| `GET /api/workspaces/[id]/import/status` | Drizzle | Convex | Low |
| `POST /api/auth/signup` | Drizzle `users` | Remove (Clerk handles signup) | High |
| `GET /api/github/status` | Drizzle + GitHub OAuth | GitHub OAuth only (no Drizzle) | Low |

#### Already migrated/Convex-backed:
- `/api/worker` — stub
- `/api/search` — Convex `searchWorkspace`
- `/api/workspaces` — Convex (partially)
- `/api/projects/[id]` — Convex (main spine)

#### Intentional server-side (keep as is):
- `/api/github/repos`, `/api/github/tree`, `/api/github/contents` — GitHub OAuth adapter
- `/api/cron/*` — Cron endpoints (may use Convex internals)
- `/api/webhooks/github` — GitHub webhook verification

### 2.5 Webhooks

| Component | Current | Target | Status |
|-----------|---------|--------|--------|
| `/api/webhooks/ingest` | Drizzle `signals`, `inboxItems` | Convex mutations | 🔴 Not started |
| Webhook key validation | Drizzle `webhookKeys` | Convex `webhookKeys` | 🔴 Not started |
| Clerk webhook | `src/app/api/webhooks/clerk/route.ts` | Already Convex-backed | ✅ Check |

### 2.6 Cron / Background Jobs

| Component | Current | Target | Status |
|-----------|---------|--------|--------|
| Maintenance (archival, dedup, merge) | Drizzle `signals`, `inboxItems` | Convex | 🔴 Not started |
| Signal automation | Drizzle `signals`, jobs | Convex | 🔴 Not started |
| Activity logs | Drizzle `activityLogs` | Convex `activityLogs` | 🟡 Partial |

### 2.7 Integrations

| Component | Current | Target | Status |
|-----------|---------|--------|--------|
| Composio | External service calls (no Postgres state) | Keep | ✅ No migration |
| Slack integration | Drizzle `integrations`, `signals` | Convex | 🔴 Not started |
| Pylon integration | Drizzle `signals` | Convex | 🔴 Not started |
| Linear sync | Drizzle `tickets`, `linearMappings` | Convex `tickets`, `linearMappings` (new) | 🔴 Not started |
| GitHub OAuth | Per-user server-side (intentional) | Keep | ✅ No migration |

---

## 3. Current Dependency Map

### 3.1 Postgres / Neon

Used via: `process.env.DATABASE_URL`

**Tables in Drizzle schema (`src/lib/db/schema.ts`) not yet in Convex:**
- `stageRuns` — execution worker state (queued/running/succeeded/failed)
- `runLogs` — per-step execution logs with level/message/stepKey
- `artifacts` — execution artifacts (files, URLs, PRs produced by runs)
- `workerHeartbeats` — worker health monitoring
- `stageTransitionEvents` — audit trail of stage changes
- `stageRecipes` — per-stage automation configuration
- `skills` — global skills catalog
- `tickets` — project tickets (Linear/Jira sync)
- `linearMappings` — Linear project/issue mappings
- `projectCommits` — git commit history per project
- `webhookKeys` — inbound webhook authentication
- `integrations` — workspace OAuth integration records
- `users` / `accounts` / `sessions` / `verificationTokens` — legacy NextAuth tables (DELETE)

**Tables with Convex equivalents already built:**
- `workspaces` → Convex `workspaces` ✅
- `workspaceMembers` → Convex `workspaceMembers` ✅
- `projects` → Convex `projects` ✅
- `documents` → Convex `documents` ✅
- `jobs` → Convex `jobs` ✅
- `jobLogs` → Convex `jobLogs` ✅
- `pendingQuestions` → Convex `pendingQuestions` ✅
- `signals` → Convex `signals` (missing `embeddingVector`) ✅
- `signalProjects` → Convex `signalProjects` ✅
- `inboxItems` → Convex `inboxItems` ✅
- `memoryEntries` → Convex `memoryEntries` ✅
- `agentDefinitions` → Convex `agentDefinitions` ✅
- `agentExecutions` → Convex `agentExecutions` ✅
- `columnConfigs` → Convex `columnConfigs` ✅
- `invitations` → Convex `invitations` ✅
- `personas` → Convex `personas` ✅
- `knowledgebaseEntries` → Convex `knowledgebaseEntries` ✅
- `activityLogs` → Convex `activityLogs` ✅
- `tasks` → Convex `tasks` ✅
- `prototypeVersions` → Convex `prototypeVariants` ✅

### 3.2 Neon-specific

- `@neondatabase/serverless` used in `src/lib/db/index.ts` for Neon serverless HTTP driver
- `src/lib/db/migrate-vectors.ts` — migration script, delete after cutover

### 3.3 pgvector

- `embedding_vector` column type (`vector(1536)`) in Drizzle `signals` and `projects`
- `<=>` cosine distance operator in raw SQL in `findSimilarSignals`, `findBestProjectMatch`
- Drizzle migration `0009_pgvector_classification.sql`

### 3.4 Drizzle

- `drizzle-orm` — used throughout `src/lib/db/` and all consuming modules
- `drizzle-kit` — migration tooling
- `drizzle.config.ts` — points at `src/lib/db/schema.ts`
- `drizzle/` folder — 18 SQL migration files

### 3.5 Legacy Auth

- `next-auth@^5.0.0-beta.30` — NextAuth v5 with Drizzle adapter
- `@auth/drizzle-adapter` — bridges NextAuth → Drizzle tables
- `bcryptjs` — used in credentials auth (delete)
- Tables: `users`, `accounts`, `sessions`, `verificationTokens`
- Routes: `/api/auth/signup`, `/api/auth/[...nextauth]`

---

## 4. Target Convex Design for Each Subsystem

### 4.1 Auth (target)

```
Identity:   Clerk (userId from clerkAuth())
Membership: convex/workspaceMembers — indexed by clerkUserId
No Drizzle user table. No upsertUserByEmail().
requireWorkspaceAccess() reads Convex only.
```

`getCurrentAppUser()` is replaced by:
```typescript
const { userId: clerkUserId } = await clerkAuth();
// That's it. No Postgres lookup. Convex membership has clerkUserId.
```

### 4.2 Execution Worker (target)

New Convex tables:
```
stageRuns: {
  cardId, workspaceId, stage, status, automationLevel, provider,
  attempt, idempotencyKey, triggeredBy, metadata,
  claimedBy, claimedAt, startedAt, completedAt, errorMessage
}
runLogs: {
  runId, workspaceId, level, message, stepKey, meta
}
artifacts: {
  runId, workspaceId, cardId, type, content, url, metadata
}
workerHeartbeats: {
  workerId, workspaceId, lastSeen, activeRunIds, processedCount, failedCount
}
stageRecipes: {
  workspaceId, stage, automationLevel, provider, skills, gates, enabled
}
```

Worker claim protocol uses Convex mutations with optimistic concurrency:
- `claimRun` mutation: sets `status = "running"`, `claimedBy = workerId`, `claimedAt = now()`
- Returns null if run already claimed (safe parallel workers)

External worker processes use Convex HTTP actions or direct Convex client mutations to:
- Poll for queued runs
- Claim runs atomically
- Stream logs via mutations
- Write artifacts
- Update heartbeats

### 4.3 Search / Embeddings (target)

```
Convex signals table adds: embeddingVector: v.optional(v.array(v.float64()))

Similarity search:
1. Load candidate signals from Convex (filtered by workspace, status)
2. Compute cosine similarity in-process using stored embeddings
3. Return top-K results sorted by similarity

No pgvector. No Neon.
```

Convex `signals.ts` new queries:
- `getWithEmbeddings(workspaceId)` — returns signals with embeddings
- Search API routes compute cosine in-process (acceptable for <50K signals)

### 4.4 Tickets (target)

```
Convex tickets table:
{
  workspaceId, projectId, title, description, priority,
  linearId, linearIdentifier, jiraId, jiraKey,
  status, metadata
}

Convex linearMappings table:
{
  workspaceId, projectId, linearTeamId, linearProjectId
}
```

Ticket sync route calls Convex mutations instead of Drizzle.

### 4.5 Webhooks (target)

```
Convex webhookKeys table:
{
  workspaceId, keyHash, name, createdBy, lastUsedAt
}
```

Webhook ingest writes directly to Convex `signals` or `inboxItems` mutations.

---

## 5. Migration Order / Critical Path

### Phase 1: Auth Cleanup (do first — unblocks everything)
1. Remove `getCurrentAppUser()` Drizzle dependency from `requireWorkspaceAccess()`
2. Remove `/api/auth/signup` route (Clerk handles this)
3. Remove `legacy-next-auth.ts` and `GET/POST /api/auth/[...nextauth]`
4. Remove Drizzle auth tables: `users`, `accounts`, `sessions`, `verificationTokens`
5. Update `src/lib/auth/server.ts` — no more `upsertUserByEmail`

**Why first:** Every other migration depends on auth. The `getCurrentAppUser()` call is the most viral Drizzle dependency (pulled into `permissions.ts` which is used in ~20 routes).

### Phase 2: Execution Worker (highest product impact)
1. Add Convex schema tables: `stageRuns`, `runLogs`, `artifacts`, `workerHeartbeats`, `stageRecipes`
2. Rewrite `src/lib/execution/run-manager.ts` to use Convex client
3. Update `src/execution-worker.ts` to poll/claim via Convex mutations
4. Migrate `/api/runs` and `/api/runs/[id]` routes
5. Migrate `/api/projects/[id]/automation-status`
6. Remove Drizzle `stage_runs`, `run_logs`, `artifacts`, `worker_heartbeats` tables

### Phase 3: Signal Similarity / Search
1. Add `embeddingVector` field to Convex `signals` schema
2. Add `embeddingVector` to Convex `projects` schema (for project matching)
3. Rewrite `findSimilarSignals` as in-memory cosine (Convex query returns embeddings)
4. Rewrite `findBestProjectMatch` similarly
5. Migrate `/api/signals/[id]/similar`, `/api/signals/[id]/suggestions`, `/api/signals/duplicates`
6. Migrate `src/lib/classification/clustering.ts` to use Convex data
7. Update signal processor to store embedding in Convex

### Phase 4: Core API Route Migration
1. Migrate remaining signal routes (`/api/signals`, `/api/signals/ingest`)
2. Migrate inbox routes (`/api/inbox`, `/api/inbox/[id]/process`)
3. Migrate jobs routes (`/api/jobs`, `/api/jobs/[id]`, `/api/jobs/[id]/questions`)
4. Migrate document routes (`/api/documents/[id]`)
5. Migrate webhook routes (`/api/webhooks/ingest`)

### Phase 5: Secondary Routes + Ticket Sync
1. Add Convex `tickets` and `linearMappings` tables
2. Migrate `/api/projects/[id]/tickets/sync`
3. Migrate `/api/projects/[id]/commits` (add Convex `projectCommits` table)
4. Migrate discovery, scrape, maintenance flows
5. Migrate integration flows (Slack, Pylon)

### Phase 6: Cleanup
1. Delete `src/lib/db/` module entirely
2. Remove `drizzle-orm`, `drizzle-kit`, `@neondatabase/serverless`, `pg`, `@types/pg`, `next-auth`, `@auth/drizzle-adapter`, `bcryptjs` from `package.json`
3. Delete `drizzle/` SQL migration folder
4. Delete `drizzle.config.ts`
5. Remove `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_SECRET` from env
6. Delete `src/lib/db/migrate-vectors.ts`
7. Archive or delete `ORCHESTRATOR_EXECUTION.md` (superseded)
8. Update `MIGRATION-READINESS.md` to reflect completion

---

## 6. Parity and Verification Checklist

### Auth
- [ ] Workspace membership check works without Drizzle
- [ ] All protected routes return 401 for unauthenticated users
- [ ] All protected routes return 403 for non-members
- [ ] Invitation acceptance works end-to-end
- [ ] No `upsertUserByEmail` calls remain in codebase

### Workers
- [ ] `npm run execution-worker` starts and polls Convex for queued runs
- [ ] Two workers can run in parallel without claiming the same run
- [ ] Worker restart resumes from correct state (no duplicate execution)
- [ ] Run logs stream to UI in real-time
- [ ] Failed runs can be retried
- [ ] `/api/runs?workspaceId=X` returns correct runs
- [ ] `automation-status` route reflects correct run state

### Search
- [ ] `/api/signals/[id]/similar` returns semantically similar signals
- [ ] Signal duplicate detection works end-to-end
- [ ] Signal clustering (`/synthesize`) produces clusters
- [ ] Project-signal matching suggests correct projects for orphan signals
- [ ] No `pgvector` or `<=>` operators in any source file

### Routes
- [ ] All previously Drizzle-backed routes return correct data
- [ ] No 500 errors on any production routes
- [ ] TypeScript compiles without errors (`npx tsc --noEmit`)
- [ ] All existing tests pass

### Cleanup
- [ ] No import from `drizzle-orm` in src/
- [ ] No import from `@neondatabase/serverless` in src/
- [ ] No import from `next-auth` in src/
- [ ] `DATABASE_URL` not referenced in src/
- [ ] `npm run dev` works without `DATABASE_URL` set

---

## 7. Deletion Checklist

### Files to delete (after migration)
- [ ] `src/lib/db/` (entire directory)
- [ ] `src/lib/auth/legacy-next-auth.ts`
- [ ] `src/app/api/auth/signup/route.ts`
- [ ] `src/lib/db/migrate-vectors.ts`
- [ ] `drizzle/` (entire directory — SQL migrations)
- [ ] `drizzle.config.ts`
- [ ] `src/lib/auth/coordinator-viewer.ts` (Drizzle-backed coordinator bridge)

### Dependencies to remove from package.json
- [ ] `drizzle-orm`
- [ ] `drizzle-kit`
- [ ] `@neondatabase/serverless`
- [ ] `pg`
- [ ] `@types/pg`
- [ ] `next-auth`
- [ ] `@auth/drizzle-adapter`
- [ ] `bcryptjs` (used only in legacy credentials auth)

### Environment variables to remove
- [ ] `DATABASE_URL`
- [ ] `AUTH_SECRET`
- [ ] `NEXTAUTH_SECRET`
- [ ] `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` (if NextAuth was the only consumer — verify Clerk also doesn't use these)

### Drizzle migration files
- [ ] `drizzle/0000_magenta_sharon_carter.sql`
- [ ] `drizzle/0001_execution_system.sql`
- [ ] `drizzle/0002_add_chromatic_storybook_url.sql`
- [ ] `drizzle/0003_inbox_persona_and_ai_processing.sql`
- [ ] `drizzle/0004_skill_metadata.sql`
- [ ] `drizzle/0005_auth_tables.sql`
- [ ] `drizzle/0006_brave_purifiers.sql`
- [ ] `drizzle/0007_mute_warbird.sql`
- [ ] `drizzle/0008_colossal_havok.sql`
- [ ] `drizzle/0009_pgvector_classification.sql`
- [ ] `drizzle/0010_signal_automation.sql`
- [ ] `drizzle/0011_large_masked_marvel.sql`
- [ ] `drizzle/0012_agent_architecture_import.sql`
- [ ] `drizzle/0013_clammy_mordo.sql`
- [ ] `drizzle/0014_project_commits.sql`
- [ ] `drizzle/0015_automation_job_tracking.sql`
- [ ] `drizzle/0016_add_agent_enabled_column.sql`
- [ ] `drizzle/0017_add_graduation_columns.sql`
- [ ] `drizzle/meta/` (Drizzle kit metadata)

---

## 8. Data Migration Scripts

One-time scripts to move existing Postgres data into Convex. All scripts live in
`orchestrator/scripts/` and are run with `npx tsx` from the `orchestrator/`
directory.

### Prerequisites for all scripts

Add to `orchestrator/.env.local`:

```
NEXT_PUBLIC_CONVEX_URL=<your-convex-url>   # already set
DATABASE_URL=<your-neon-url>               # already set

# A valid Clerk JWT for the user who owns the target workspace.
# How to get it: open the app in Chrome → DevTools → Network → filter by
# "convex.cloud" → click any request → copy the "Authorization: Bearer <token>"
# header value (the token part only).  Tokens expire in ~1 hour.
CONVEX_AUTH_TOKEN=<clerk-jwt>
```

### `scripts/migrate-signals.ts`

Migrates all signals from Postgres to Convex.  Idempotent: re-runs skip signals
already present (detected via the `neonSignalId` field).

```bash
cd orchestrator
npx tsx scripts/migrate-signals.ts \
  --convex-workspace-id=<convex-id> \
  --postgres-workspace-id=<postgres-id> \
  [--batch-size=100] \
  [--dry-run]
```

**Side effects:** each migrated signal triggers Convex schedulers (inbox item
creation + AI processing pipeline).  To avoid AI costs, disable signal
automation in workspace settings before running.

### `scripts/migrate-project-embeddings.ts`

Copies `embedding_vector` from Postgres projects into Convex `embeddingVector`.
Matches Postgres projects to Convex projects by name.  Idempotent: skips Convex
projects that already have `embeddingUpdatedAt` set.

```bash
cd orchestrator
npx tsx scripts/migrate-project-embeddings.ts \
  --convex-workspace-id=<convex-id> \
  --postgres-workspace-id=<postgres-id> \
  [--dry-run]
```

### `scripts/migrate-tickets.ts`

Migrates tickets from Postgres to Convex.  Idempotent: duplicate detection by
`linearId` (if present) or title + project match.

```bash
cd orchestrator
npx tsx scripts/migrate-tickets.ts \
  --convex-workspace-id=<convex-id> \
  --postgres-workspace-id=<postgres-id> \
  [--batch-size=100] \
  [--dry-run]
```

### `scripts/verify-migration.ts`

Cross-checks record counts between Postgres and Convex.  Run this after all
migrate scripts to confirm parity before removing the Postgres dependency.

```bash
cd orchestrator
npx tsx scripts/verify-migration.ts \
  --convex-workspace-id=<convex-id> \
  --postgres-workspace-id=<postgres-id>
```

Example output:

```
Migration Verification Report — Workspace: k17abc123...
=====================================================
Table            Postgres    Convex    Delta    Status
---------        --------    ------    -----    ------
signals          1,234       1,230     -4       ⚠ MISMATCH
projects         45          45        0        ✓ OK
tickets          89          89        0        ✓ OK
documents        234         234       0        ✓ OK
projectCommits   12          12        0        ✓ OK
=====================================================
Overall: 1 table(s) with mismatches
```

### Recommended migration order

1. Run `migrate-signals.ts --dry-run` to preview scope.
2. Run `migrate-signals.ts` (disable signal automation first).
3. Run `migrate-project-embeddings.ts`.
4. Run `migrate-tickets.ts`.
5. Run `verify-migration.ts` — fix any mismatches before proceeding.
6. Continue with Phase 6 cleanup (removing Drizzle/Neon dependencies).

---

## 9. Progress Log

| Date | Phase | What Changed |
|------|-------|-------------|
| 2026-03-09 | Audit | Created this document. Full audit complete. |
| 2026-03-09 | Phase 1: Auth | Removed all Drizzle runtime calls from auth/permissions. `getCurrentAppUser()` now returns pure Clerk identity (no Postgres upsert). `requireWorkspaceAccess()` Drizzle fallback path removed — Convex membership is the only source of truth. Deleted `/api/auth/signup` route (Clerk handles signup). Updated `/api/auth/me`, invitation acceptance, workspace creation, and workspace sync routes. Updated 4 test files to reflect new auth model. |
| 2026-03-09 | Phase 2: Execution Worker | Added Convex schema tables: `stageRuns`, `runLogs`, `artifacts`, `workerHeartbeats`, `stageRecipes`. Created `convex/stageRuns.ts` with full run lifecycle mutations/queries. Created `src/lib/execution/run-manager-convex.ts` using `ConvexHttpClient`. Updated `execution/index.ts` to export from Convex run manager instead of Drizzle. Migrated `execution/worker.ts` and `execution/providers.ts` to use Convex. Updated `automation-status` route to query Convex `jobs` table. Added 8 passing Convex contract tests in `convex/__tests__/stageRuns.test.ts`. |
| 2026-03-09 | Phase 3: Signal Search | Added `embeddingVector` field to Convex `signals` and `projects` schema. Created `src/lib/signals/similarity.ts` with in-process cosine similarity (replaces pgvector). Added `listWithEmbeddings` and `storeEmbedding` to Convex signals/projects modules. Migrated `/api/signals/[id]/similar` and `/api/signals/[id]/suggestions` to use Convex. Updated `clustering.ts` to use Convex-backed data. |
| 2026-03-09 | Phase 4 (partial): Core Routes | Created `convex/tickets.ts`, `convex/projectCommits.ts` Convex modules. Migrated `projects/[id]/tickets/sync/route.ts` to write to Convex tickets table. Migrated `projects/[id]/commits/route.ts` to Clerk auth + Convex (removing legacy NextAuth). Removed `DocumentType` Drizzle import from ProjectDetailPage.tsx. Added `tickets` and `linearMappings` tables to Convex schema. Updated `admin/migrate` route to Clerk auth. |
| 2026-03-09 | Phase 2 (Stage Executors) | Migrated all 7 stage executors (`inbox`, `discovery`, `prd`, `design`, `prototype`, `validate`, `tickets`) from Drizzle to `ConvexHttpClient`. Rewrote `StageContext` and `VerificationContext` types to plain TypeScript (no Drizzle inference). `loadStageContext` queries Convex for project, recipe, and documents. `executeTaskLoop` queries workspace settings from Convex. Replaced `recordProjectCommit` (Drizzle) with `api.projectCommits.create`. Added `juryEvaluations` table to Convex schema + `convex/juryEvaluations.ts`. Added `linearMappingByProject` query to `convex/tickets.ts`. `prototype-executor` writes to `prototypeVariants` via `api.prototypes.createVariant`. `default-recipes.ts` no longer imports from `@/lib/db/schema`. Re-ran `npx convex codegen`. All 52 execution tests pass. Zero Drizzle imports in `src/lib/execution/stage-executors/`, `verification.ts`, `default-recipes.ts`. |
| 2026-03-09 | Remaining scope | ~60 API routes still use Drizzle for data operations. GitHub routes are intentional server-side adapters (blocked by GitHub OAuth migration to Clerk). Legacy NextAuth still needed for GitHub OAuth token storage. Full Drizzle removal blocked until: (a) GitHub OAuth migrated to Clerk, (b) remaining routes migrated to Convex, (c) data migration from Postgres to Convex complete. |
| 2026-03-09 | Phase 4 (inbox/jobs/documents/agents/webhooks) | Migrated 17 API route files — zero Drizzle imports in touched files, zero new test failures (596/598 pass; 2 pre-existing failures in auth tests not touched). **Routes migrated:** `GET/POST/PATCH/DELETE /api/inbox`, `POST /api/inbox/[id]/process`, `GET/POST/PATCH/DELETE /api/jobs`, `GET/POST /api/jobs/[id]`, `GET /api/jobs/[id]/runs` (stub), `GET /api/jobs/[id]/questions`, `POST /api/jobs/[id]/questions/[questionId]/respond`, `POST /api/jobs/[id]/questions/[questionId]/skip`, `POST/GET /api/jobs/process` (stub), `GET/PATCH /api/documents/[id]`, `GET/POST /api/documents`, `GET /api/agents`, `GET/PATCH/DELETE /api/agents/[id]`, `GET /api/agents/[id]/executions`, `POST /api/agents/execute`, `POST/GET /api/webhooks/ingest`, `POST /api/workspaces/[id]/signals/ingest`. **Convex additions:** `jobs.retry`, `jobs.bulkRetry`, `jobs.bulkDelete`; `inboxItems.update`, `inboxItems.remove`, `inboxItems.createFromWebhook`; `agentDefinitions.remove`; `agentExecutions.listByAgentDefinition`; `pendingQuestions.skip`; `webhookKeys.ts` (new module); `by_key_hash` index on `webhookKeys` schema. |
| 2026-03-09 | GitHub OAuth → Clerk | Rewrote `src/lib/github/auth.ts` to use Clerk `getUserOauthAccessToken` (no Drizzle `accounts` table). Updated all 11 `src/app/api/github/*` routes + `agents/sync`, `discovery/route`, `discovery/import`, `integrations/sync`, `onboarding/re-discover`, `projects/[id]/metrics`, `projects/[id]/prototypes/[prototypeId]` to use `clerkAuth()`. `legacy-next-auth.ts` NOT deleted yet — 3 files outside this PR scope still import it (see Unblocked section below). |
| 2026-03-09 | Phase 4 (signals pipeline) | Migrated signal creation and processing pipeline from Drizzle/pgvector to Convex. **`convex/signals.ts` extended:** `getBySourceRef` query added; `create` mutation gains `frequency`, `userSegment`, `sourceRef`, `inboxItemId` args; `update` mutation gains `frequency`, `userSegment`, `processedAt` args. **Routes migrated:** `GET/POST /api/signals`, `POST /api/signals/ingest`, `POST /api/signals/upload`, `POST /api/signals/video`, `GET /api/signals/duplicates` (rewritten to use in-process cosine similarity over Convex embeddings — no pgvector), `GET/PATCH/DELETE /api/signals/[id]`, `POST /api/signals/[id]/classify`. **Lib files migrated:** `src/lib/signals/processor.ts` (ConvexHttpClient for get/update/storeEmbedding; drops base64 embedding, uses float64 vector directly); `src/lib/signals/sync.ts` (Convex for signal writes + idempotency check; workspace read stays Drizzle per plan); `src/lib/classification/classifier.ts` (uses `findBestProjectMatchConvex` from similarity lib; Convex for classification/embedding updates); `src/lib/automation/signal-automation.ts` (uses `getConvexWorkspace` via MCP secret for automation settings — no Drizzle). Activity logging in upload/video routes replaced with `createConvexWorkspaceActivity`. Zero new test failures (595/598 pass; 2 pre-existing auth failures unrelated). |
| 2026-03-09 | Phase 5 (workspace/column/discovery routes) | Migrated all 15 remaining route files from Drizzle to Convex. **Convex additions:** Appended `updateWorkspaceOnboarding` internal mutation to `convex/mcp.ts`; added `PATCH /mcp/workspace/onboarding` HTTP route to `convex/http.ts`; added `updateConvexWorkspaceOnboarding` helper to `src/lib/convex/server.ts`. **Routes migrated:** `GET /workspaces/[id]/members` (type-only fix), `GET/POST/DELETE /workspaces/[id]/invitations` (type-only fix), `GET /workspaces/[id]/pending-questions` (ConvexHttpClient + `api.pendingQuestions.listPending`), `GET/POST /workspaces/[id]/swarm` (`getConvexWorkspace` + `api.jobs.create`), `POST /workspaces/[id]/syncKnowledge` (`getConvexWorkspace`), `POST /workspaces/[id]/syncSignals` (`getConvexWorkspace`), `POST /workspaces/[id]/onboarding` (`getConvexWorkspace` + `updateConvexWorkspaceOnboarding`), `GET /workspaces/[id]/import/status` (ConvexHttpClient + `api.projects.list` + `api.agentDefinitions.list` + `listConvexKnowledge`), `GET/PUT /columns/[id]/automation` (ConvexHttpClient + `api.columns.getById/update`), `POST /agents/sync` (`getConvexWorkspace` + `ensureConvexColumns`), `GET /discovery` (`getConvexWorkspace`), `POST /discovery/import` (`getConvexWorkspace` + `listConvexProjects/createConvexProject/updateConvexProject` + `updateConvexWorkspaceOnboarding`), `POST /integrations/sync` (`getConvexWorkspace`), `POST /onboarding/re-discover` (`getConvexWorkspace`), `GET /invitations/[token]` (type-only fix). **Test fix:** Updated `src/app/api/discovery/__tests__/route.test.ts` to mock `@/lib/convex/server` instead of `@/lib/db/queries`. Zero new test failures (all modified files pass; remaining failures are pre-existing in untracked files). TypeScript clean for all 15 files. |

| 2026-03-09 | Workstream 1+2: Type cleanups + lib file migrations | **Workstream 1 (type-only imports):** Eliminated all `import type { ... } from "@/lib/db/schema"` from 29 files across `src/components/`, `src/hooks/`, `src/app/(app)/`, `src/app/(dashboard)/`, and `src/app/(public)/`. Complex interfaces (`MaintenanceSettings`, `GraduationCriteria`, `SourceRepoTransformation`, `PathMapping`, `TaskVerificationResult`, `SignalAutomationSettings`) inlined in full. `DEFAULT_SIGNAL_AUTOMATION` const inlined in `SignalAutomationSettings.tsx`. **Workstream 2 (runtime lib migrations):** (a) `webhooks/auth.ts` — ConvexHttpClient `findByKeyHash`; HMAC deprecated. (b) `webhooks/processor.ts` — `api.signals.createFromWebhook` no-auth mutation. (c) `signals/sync.ts` — replaced `getWorkspace` Drizzle call with `getConvexWorkspace`. (d) `github/writeback-service.ts` — removed `githubWriteOps` Drizzle audit; `getConvexWorkspace`/`getConvexProjectWithDocuments`/`listConvexWorkspaceMembers`. (e) `automation/column-automation.ts` — Convex columns+agents; in-memory loop prevention; `createConvexJobInternal`. (f) `automation/auto-actions.ts` — `createConvexProject` + `linkConvexSignalToProject` + `bulkUpdateConvexSignalStatus`. (g) `maintenance/archival.ts` — `listConvexWorkspaceSignals` + `bulkUpdateConvexSignalStatus`. (h) `maintenance/orphan-detector.ts` — in-memory filtering from Convex data. (i) `maintenance/duplicate-detector.ts` — in-memory cosine similarity (replaces pgvector SQL). (j) `maintenance/merge.ts` — Convex signal get + link helpers. **Dead code marked:** `jobs/processor.ts`, `jobs/executor.ts`, `queue/index.ts`, `agent/worker.ts`, `agent/executor.ts`, `agent/tools.ts`, `invitations.ts`. **Convex additions:** `convex/signals.ts` + `convex/jobs.ts` + `convex/http.ts` get new internal mutations/HTTP actions; `src/lib/convex/server.ts` gets 5 maintenance helpers. Zero new test failures (3 pre-existing failures unchanged). |
| 2026-03-09 | Phase 4 (final sweep — all remaining signal/project routes + auth cleanup) | **15 API routes migrated** — zero Drizzle imports in all 15 files. **Signal routes:** `POST /api/signals/bulk` (loop calls to `api.signals.linkToProject`/`unlinkFromProject`); `GET /api/signals/orphans` (Convex signals.list + age filter, replaces orphan-detector.ts); `GET /api/signals/suggestions` (Convex signals.list + classification filter, replaces pgvector raw SQL); `GET/POST/DELETE /api/signals/[id]/personas` (replaced `getSignal` Drizzle call with Convex); `GET/POST/DELETE /api/signals/[id]/projects` (full Convex — linkToProject/unlinkFromProject/linkedProjects); `POST /api/signals/[id]/suggestions/dismiss` (stores dismissal in classification.dismissed field via signals.update). **Project routes:** `GET/POST /api/projects` (removed `getProjectsWithCounts` Drizzle call, Convex-only list; counts default to 0; `createJob` → `api.jobs.create`); `POST /api/projects/[id]/prototypes` (removed legacy-next-auth, Clerk auth, Convex `api.prototypes.createVariant`); `GET /api/projects/[id]/signals` (Convex `api.signals.byProject`); `GET /api/projects/[id]/graduation` (inline Convex-backed graduation check replacing Drizzle criteria-service); `POST /api/projects/[id]/documents/[docId]/publish` (Convex for project+document lookup); `POST /api/projects/from-cluster` (Convex `createConvexProject` + bulk `api.signals.linkToProject`); `POST /api/projects/[id]/unlock` (Convex `api.jobs.byProject` + `api.jobs.cancel`); `POST/PATCH /api/projects/[id]/metrics` (Convex for project/document CRUD). **Auth cleanup:** `src/lib/auth/helpers.ts` replaced legacy-next-auth with Clerk `auth()`. **Deleted:** `src/lib/auth/legacy-next-auth.ts`, `src/app/api/auth/[...nextauth]/route.ts`. **Replaced:** `src/auth.ts` → empty stub. **Zero** `legacy-next-auth` imports remain. Updated `projects/__tests__/route.test.ts` to match Convex-only list. All pre-existing test failures unchanged (none introduced). |

### Open Questions

- **Clerk GitHub OAuth `repo` scope**: The legacy NextAuth config explicitly requested `scope: "read:user user:email repo"`. Verify the Clerk Dashboard GitHub OAuth app configuration (OAuth → GitHub → Scopes) includes `repo` scope to ensure repository write operations (commits, PRs) continue to work after migration.
|| 2026-03-10 | Final lib file migrations + Phase 2 prerequisite re-check | **`src/lib/automation/rate-limiter.ts`:** Replaced Drizzle `automationActions` table with in-memory `Map<string, number[]>` rate limiter. Chose Option B (in-memory) — best-effort cooldown is acceptable at current scale; no audit trail required. `AutomationActionType` and `SignalAutomationSettings` inlined from schema. `signal-automation.ts` is a clean consumer (defines its own interface, only imports the 3 functions). **`src/lib/status/portfolio-status.ts`:** Removed Drizzle-first fallback path (`getWorkspace` + `getProjectsWithCounts`). File now uses only `getConvexWorkspace` + `listConvexProjects`. Inlined `ProjectStage` type (was `import type from "@/lib/db/schema"`). `checkGraduationCriteria` now called with Convex `project._id` (was Drizzle `project.id`). **Phase 2 prerequisite re-check result: 1 blocker remains** (`src/lib/discovery/population-engine.ts`). All other 13 previously-blocked files have been cleared across earlier workstreams. Phase 2 (package removal + `src/lib/db/` deletion) blocked until `population-engine.ts` is migrated. **Tests:** 593/597 pass (2 pre-existing env-var failures in `convex.test.ts` + `agents-stub.test.ts`; `migrations.test.ts` uses intentional Drizzle scripts — no new failures). |
| 2026-03-09 | Phase 5: Content-Management Routes | Migrated all 10 route files and 5 lib files in the content-management cluster. **Convex schema additions:** `skills` table (replaces Postgres `skills`), `knowledgeSources` table (replaces Postgres `knowledge_sources`), extended `stageRecipes` with `recipeSteps`/`gateDefinitions`/`onFailBehavior` optional fields. **New Convex modules:** `convex/skills.ts` (CRUD + `upsertByEntrypoint`), `convex/knowledgeSources.ts` (CRUD). **Extended Convex modules:** `convex/notifications.ts` gained `getById`, `createPublic`, `updateStatus`, `deleteNotification`, `countUnread`, `markAllReadForWorkspace`, `listFiltered`, `createThresholdAware`; `convex/stageRuns.ts` gained `deleteRecipe`, `upsertRecipeFull`. **Routes migrated (10):** `GET/POST/PATCH /api/notifications`, `GET/PATCH/DELETE /api/notifications/[id]`, `GET/POST /api/knowledge-sources`, `PATCH/DELETE /api/knowledge-sources/[id]`, `GET/PUT /api/knowledgebase/[type]` (removed Drizzle type import), `GET/PATCH/DELETE /api/skills/[id]` (removed Drizzle TrustLevel import), `GET /api/skills/[id]/summary` (replaced db calls with Convex cache lookup), `GET/POST/PATCH /api/stage-recipes`, `GET/PATCH/DELETE /api/stage-recipes/[stage]`, `POST /api/stage-recipes/chat`. **Lib files migrated (5):** `src/lib/skills/skills-service.ts` (full Convex migration; filesystem scanning preserved), `src/lib/skills/stage-recipes-service.ts` (uses `api.stageRuns.upsertRecipeFull`/`deleteRecipe`), `src/lib/notifications/threshold-filter.ts` (uses `api.notifications.createThresholdAware`), `src/lib/knowledgebase/sync.ts` (replaced single `getWorkspace` Drizzle call with `getConvexWorkspace`), `src/lib/graduation/criteria-service.ts` (full Convex migration using `api.projects.get`, `api.documents.byProject`, `api.juryEvaluations.listByProject`, `api.prototypes.listByProject`, `api.signals.byProject`, `api.columns.listByWorkspace`). **Test updates:** Skills and stage-recipes tests rewritten to mock Convex client (eliminated Drizzle setup/teardown). Result: 595/598 pass (2 pre-existing auth failures unchanged; 0 new failures). Zero Drizzle runtime imports in all 15 owned files. TypeScript clean. |
| 2026-03-09 | Final Active Lib Files Migration | Migrated the last 6 active lib files with Drizzle runtime imports. **`src/lib/activity.ts`:** Removed Drizzle `activityLogs`+`users` reads/writes; replaced user lookup with `clerkClient().users.getUser()` (Clerk SDK); replaced dual-write with single `createConvexWorkspaceActivity()` call. **`src/lib/context/resolve.ts`:** Removed remaining Drizzle `documents` reads/writes from `getProjectState`, `updateProjectState`, `getDocumentByType`; replaced with new MCP HTTP helpers. **Convex additions for resolve.ts:** `getDocumentByProjectAndType` internal query + `upsertDocumentByType` internal mutation in `convex/mcp.ts`; `GET /mcp/project-document-by-type` + `POST /mcp/project-document-upsert` HTTP routes; helpers in `src/lib/convex/server.ts`. **`src/lib/agents/sync.ts`:** Replaced Drizzle `agentDefinitions` delete+insert with `syncConvexAgentDefinitions()` MCP helper; replaced `agentKnowledgeSources` with `syncConvexAgentKnowledgeSources()`. **Convex additions for agents/sync.ts:** Added `agentKnowledgeSources` table + `sourceRepo`/`sourceRef`/`sourcePath`/`syncedAt` fields to `agentDefinitions` in Convex schema; `syncAgentDefinitions` + `syncAgentKnowledgeSources` internal mutations; corresponding MCP HTTP routes. **`src/lib/integrations/slack.ts`:** Replaced Drizzle `signals` idempotency + insert with `api.signals.createFromIntegration`; replaced `db.insert(activityLogs)` with `logActivity()`. **`src/lib/integrations/pylon.ts`:** Same pattern as slack.ts. **Convex addition for integrations:** `createFromIntegration` no-auth mutation in `convex/signals.ts`; `sourceMetadata: v.optional(v.any())` added to signals Convex schema. **`src/lib/invitations.ts`:** Rewrote dead-code file using Convex helpers. **Test update:** Rewrote `src/__tests__/auth/invitations.test.ts` to use vi.mock for Convex helpers (12/12 pass). **Result:** 594/595 pass excluding slow runtime-routes (1 pre-existing `convex.test.ts` env-var failure unchanged). Zero Drizzle runtime imports in all 6 owned files. TypeScript clean. |
| 2026-03-09 | TypeScript fixes: resolved 29 errors across 8 files; fixed 1 remaining Drizzle route; removed 2 type-only schema imports | **`src/app/api/workers/route.ts` (13 errors):** Added `WorkerRecord` type; cast `getActiveWorkers()` result; fixed `updateWorkerHeartbeat` arg count. **`src/lib/execution/worker.ts` (7 errors):** `run.id` → `run._id`; `updateWorkerHeartbeat(workerId, "idle", null)` → `(workerId, undefined)`; heartbeat string arg → `[]\|undefined`; removed extra 4th arg from `completeRun` calls (3-param only). **`src/lib/classification/clustering.ts` (4 errors):** `seed.id`→`seed._id`; `interpretation ?? null`. **`src/lib/signals/similarity.ts` (2 errors):** Cast map callbacks to `any` to bridge Convex `Id<T>` vs `string`. **`src/app/api/agents/sync/route.ts`:** Inlined `SourceRepoTransformation`+`PathMapping`; removed Drizzle import. **`src/app/api/projects/[id]/prototypes/[prototypeId]/route.ts`:** Replaced `getProject`/`updatePrototype`/`deletePrototype` (Drizzle) with `getConvexProjectWithDocuments`+`api.prototypes.get`/`updateVariant`/`deleteVariant`. **`src/lib/permissions.ts`:** Added `export type WorkspaceRole`; removed Drizzle import. **`src/lib/auth/coordinator-viewer.ts`:** Changed Drizzle import → `from "@/lib/permissions"`. Result: 0 TS errors in all 8 owned files; 595/598 tests pass (2 pre-existing auth failures). |
| 2026-03-09 | Phase 6 Cleanup (partial): Dead code deletion + Phase 2 blocker audit | **Dead code deleted (Phase 1 — 12 files):** `src/lib/jobs/processor.ts`, `src/lib/jobs/executor.ts`, `src/lib/jobs/index.ts` (barrel), `src/lib/queue/index.ts`, `src/lib/agent/worker.ts`, `src/lib/agent/executor.ts`, `src/lib/agent/tools.ts`, `src/lib/agent/types.ts`, `src/lib/agent/prompts.ts`, `src/lib/agent/security.ts`, `src/lib/execution/run-manager.ts`, `src/lib/db/migrate.ts`. Each verified at zero active imports before deletion. **Annotated** `src/lib/migrations/assign-workspaces.ts` and `src/lib/migrations/backfill-actors.ts` as admin-only Drizzle migration scripts (retain Drizzle intentionally). **Tests after deletion:** 595/598 pass — no new failures introduced. **Files NOT deleted (active imports):** `src/lib/automation/rate-limiter.ts` (imported by `signal-automation.ts`; `automationActions` table has no Convex equivalent yet), `src/lib/discovery/status-mapper.ts` (imported within discovery module), `src/lib/discovery/types.ts` (imported by 8 active files). **Phase 2 (Drizzle removal) prerequisite check: FAILED** — 14 files still import `@/lib/db` or `drizzle-orm`. `src/lib/db/` NOT deleted, Drizzle packages NOT removed. |

|| 2026-03-10 | Final type cleanup + 2 lib migrations | **Type-only fixes (7 files):** Replaced all `import type { ... } from "@/lib/db/schema"` with inline literals. `src/lib/ai/extraction.ts` → `SignalSeverity = "critical"|"high"|"medium"|"low"`, `SignalFrequency = "common"|"occasional"|"rare"`. `src/lib/discovery/status-mapper.ts` + `discovery/types.ts` → `ProjectStage = string`. `src/lib/knowledgebase.ts` → `KnowledgebaseType = string`. `src/lib/status/types.ts` → `DocumentType = ProjectStage = ProjectStatus = string`. `src/lib/swarm/planner.ts` → `JobType = string`. `src/lib/status/initiative-status.ts` → full inline `ReleaseMetricsThreshold`/`ReleaseMetricsValues` interfaces. **`src/lib/rules/engine.ts` runtime migration:** Replaced `getProject`/`getColumnConfigs`/`getDocumentByType` Drizzle calls with `ConvexHttpClient` queries (`api.projects.get`, `api.columns.listByWorkspace`, `api.documents.byProject`, `api.juryEvaluations.listByProject`). Inlined `ProjectStage` union and `GraduationCriteria` interface. **`src/lib/discovery/population-engine.ts` runtime migration:** Replaced all 8 Drizzle function calls (`upsertProject`, `createColumnConfig`, `getColumnConfigs`, `updateWorkspace`, `getWorkspace`, `createDocument`, `createPrototype`, `updatePrototype`) with Convex helpers from `@/lib/convex/server`. `upsertProject` replaced with list-by-name + create/update pattern; returns `Map<initiativeId, convexId>` used by document and prototype creation. **Convex additions:** `convex/prototypes.ts` gained `patchVariant` internal mutation; `convex/http.ts` gained `POST /mcp/prototypes/create` and `PATCH /mcp/prototypes/variant` MCP endpoints; `src/lib/convex/server.ts` gained `createConvexPrototypeVariant` and `patchConvexPrototypeVariant` helpers. Zero Drizzle imports in all 9 owned files. 594/597 tests pass (same 2 pre-existing auth failures unchanged; 2 skipped). |

The following 14 files must be migrated to Convex before `src/lib/db/` can be deleted and Drizzle packages removed. Run the prerequisite check again after migrating all of them:

```bash
grep -rn "from.*@/lib/db\b\|from.*drizzle-orm\b\|from.*@/lib/db'" src --include="*.ts" --include="*.tsx" \
  | grep -v node_modules \
  | grep -v "src/lib/db/" \
  | grep -v "__tests__" \
  | grep -v "src/lib/migrations/" \
  | sed 's|:.*||' | sort -u
```

| File | Dependency | Notes |
|------|-----------|-------|
| ~~`src/lib/automation/rate-limiter.ts`~~ | ~~`automationActions` Drizzle table~~ | ✅ Migrated to in-memory rate limiter (2026-03-10) |
| ~~`src/lib/ai/extraction.ts`~~ | ~~`@/lib/db`~~ | ✅ Inlined types (2026-03-10) |
| ~~`src/lib/discovery/population-engine.ts`~~ | ~~`@/lib/db`~~ | ✅ Migrated to Convex helpers (2026-03-10) |
| ~~`src/lib/discovery/status-mapper.ts`~~ | ~~Drizzle types~~ | ✅ Inlined (cleared in earlier workstream) |
| ~~`src/lib/discovery/types.ts`~~ | ~~Drizzle/schema types~~ | ✅ Inlined (cleared in earlier workstream) |
| ~~`src/lib/integrations/pylon.ts`~~ | ~~`@/lib/db`~~ | ✅ Migrated (earlier workstream) |
| ~~`src/lib/integrations/slack.ts`~~ | ~~`@/lib/db`~~ | ✅ Migrated (earlier workstream) |
| ~~`src/lib/invitations.ts`~~ | ~~`@/lib/db`~~ | ✅ Migrated (earlier workstream) |
| ~~`src/lib/knowledgebase.ts`~~ | ~~`@/lib/db`~~ | ✅ Migrated (earlier workstream) |
| ~~`src/lib/rules/engine.ts`~~ | ~~`@/lib/db`~~ | ✅ Migrated (earlier workstream) |
| ~~`src/lib/status/initiative-status.ts`~~ | ~~`@/lib/db`~~ | ✅ Migrated (earlier workstream) |
| ~~`src/lib/status/portfolio-status.ts`~~ | ~~`@/lib/db`~~ | ✅ Migrated to Convex-only (2026-03-10) |
| ~~`src/lib/status/types.ts`~~ | ~~Drizzle types~~ | ✅ Inlined (cleared in earlier workstream) |
| ~~`src/lib/swarm/planner.ts`~~ | ~~`@/lib/db`~~ | ✅ Migrated (earlier workstream) |

| 2026-03-10 | TS fix: agent barrel stub + schema inline type | Fixed 6 TypeScript errors caused by deleted agent barrel file — replaced `agent/index.ts` with stub exporting `startWorker`/`stopWorker` no-ops (maintains compatibility with `src/worker.ts`), inlined `AgentSecuritySettings` type in `src/lib/db/schema.ts` (replaced deleted `@/lib/agent/security` import with `type AgentSecuritySettings = Record<string, unknown>`). Zero TS errors in owned files; zero new test failures. |
