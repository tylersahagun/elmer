# Elmer v2 — Agent Brief

> For any AI agent building new features in `tylersahagun/elmer`
> Generated: 2026-03-05 — Last updated: 2026-03-06
> Scope: Complete context for the Convex rebuild of Elmer, the AskElephant internal PM command center

---

## How To Use This Brief

- **Implementation source of truth:** the live Linear project for Elmer is canonical for issue state, sequencing, and what is currently done versus open.
- **This file's role:** strategic and architectural context for agents building Elmer.
- **Status language here is derived:** if status text in this brief conflicts with Linear, trust Linear first and then update the brief as a snapshot.
- **Reset context:** see `pm-workspace-docs/status/elmer-reset-and-recalibration.md` and `pm-workspace-docs/status/elmer-source-of-truth-matrix.md` for the current reset framing and artifact trust rules.

---

## Current Build Status (Derived Snapshot)

**Phases 0–5 are substantially complete. The current critical path is platform reliability, deterministic E2E coverage, and Phase 7 Convex cutover work. GitHub App + webhook are verified. This status section is a derived snapshot of the Linear board, not the board itself.**

> Last updated: 2026-03-06 — Playwright fixtures + agent-execution spec added, blame-chain attribution + minimal presence shipped, migration-readiness map written, and the first Convex migration tranche is in progress.

| Phase | Status | Remaining |
|---|---|---|
| Phase 0: Foundation | ✅ Complete | GTM-33 complete, GTM-37 remains optional follow-on (elephant-ai submodule hardening) |
| Phase 1: Agent Execution | ⚠️ Mostly done | GTM-42 Backlog (Fly.io CLI sandbox) |
| Phase 2: Sync + Memory Graph | ✅ Complete | — |
| Phase 3: Documents + Tasks | ⚠️ Mostly done | GTM-53 Backlog (prototype variants) |
| Phase 4: Signal Inbox | ⚠️ Nearly done | GTM-83 In Progress (expanded E2E coverage; GTM-68 is now canceled as superseded) |
| Phase 5: MCP Apps | ✅ Complete | All 5 apps built and served as MCP resources |
| Phase 6: Team + Orchestrator | 🟡 In Progress | GTM-69 and GTM-70 have initial implementation; GTM-55 to GTM-58 remain |
| Phase 7: Full Migration | 🟡 In Progress | Route-by-route migration map is complete in `orchestrator/MIGRATION-READINESS.md`; GTM-59 is active and GTM-99 to GTM-103 now track the named blocker tickets |
| Phase 8: Chat & Agent Hub | 🔲 Not started | GTM-71 to GTM-77 |
| Phase 9: E2E Testing | 🟡 In Progress | GTM-78–93: Playwright installed, config + e2e/ scaffold done, smoke + signal-inbox specs written; next wave is POM expansion + route coverage + signal-flow seeding |

**What is live in Convex today:**
- Full Convex schema (all tables including graph, tasks, prototypeVariants)
- Agentic loop with model routing, HITL, tool catalog, execution tracing
- pm-workspace sync (agent definitions + docs via GitHub webhook)
- MCP server rewrite (20 P0 tools via Convex HTTP API)
- **MCP UI Apps (Phase 5 ✅):** 5 apps built as self-contained HTML bundles in `mcp-server/apps/dist/` — `agent-monitor`, `initiative-dashboard`, `jury-viewer`, `pm-navigator`, `signal-map`
- Memory graph (5 tables, access reinforcement, decay cron)
- Signal inbox (Slack + Pylon webhooks, auto-classify, TL;DR, impact scoring)
- Project TL;DR cards
- Task + document views

**Testing infrastructure (Phase 9 — In Progress):**
- Playwright installed in `orchestrator/` with `playwright.config.ts`
- `e2e/` folder: `tests/`, `pages/` (POM classes), `fixtures/`, `auth.setup.ts`
- Smoke tests: `e2e/tests/smoke.spec.ts` (all major routes, @smoke tag)
- Signal inbox tests: `e2e/tests/signal-inbox.spec.ts`
- Agent execution tests: `e2e/tests/agent-execution.spec.ts`
- POM classes: `WorkspacePage`, `SignalInboxPage`, `AgentExecutionPage`
- Convex-backed seed helpers: `e2e/fixtures/inbox.ts`, `e2e/fixtures/jobs.ts`
- TDD Cursor rule: `.cursor/rules/test-driven-development.mdc` — active on all agent sessions
- Run: `npm run test:e2e` | `npm run test:e2e:smoke` | `npm run test:e2e:ui`

**Team-awareness progress (Phase 6 — In Progress):**
- Job attribution fields added to `orchestrator/convex/schema.ts`: `initiatedBy`, `initiatedByName`, `rootInitiator`, `rootInitiatorName`, `parentJobId`
- Attribution now persists on the canonical Convex job path in `orchestrator/convex/jobs.ts`
- Execution UI renders blame metadata via `orchestrator/src/components/jobs/AgentBlameChain.tsx`
- Minimal live presence shipped: `orchestrator/convex/presence.ts`, `orchestrator/src/hooks/usePresence.ts`
- Presence is currently surfaced in the navbar and document viewer

**Migration-readiness progress (Phase 7 — In Progress):**
- Route-by-route migration checklist created: `orchestrator/MIGRATION-READINESS.md`
- Surfaces are categorized as `migrate-now`, `blocked`, or `intentional-server-side`
- Recommended first migration tranche: `/`, `/workspace/[id]`, `/workspace/[id]/signals`, `/workspace/[id]/tasks`, `/workspace/[id]/inbox`
- First migration tranche started:
  - `/` UI and `/api/workspaces` list/create are now Convex-backed, but invitation acceptance and some import/sync flows still remain on the legacy app-user bridge
  - `/workspace/[id]` now loads workspace and project spine from Convex
  - `/workspace/[id]/signals` now uses Convex for workspace lookup and core signal list/create/update/delete flows
- Second migration tranche checkpoint:
  - `/workspace/[id]/agents` now reads agent definitions from Convex and toggles enabled state via Convex mutation
  - `/projects/[id]` now merges Convex-backed project, workspace, and document state into the existing page model while blocked tabs remain on legacy boundaries
- Third migration tranche checkpoint:
  - core project-detail actions now use Convex where parity exists, including job scheduling and document save
  - project detail continues to run as a compatibility layer: Convex-backed core model, legacy-only tabs and blocked edges still isolated behind existing server routes
- Fourth migration tranche checkpoint:
  - project-detail command execution and prototype iteration now queue jobs through Convex
  - project signal linking now uses Convex queries/mutations instead of the legacy signal-link route for the picker flow
- Fifth migration tranche checkpoint:
  - project branch metadata updates now use Convex project mutation
  - the linked-signals section in project detail now reads and unlinks through Convex-backed signal queries/mutations
- Sixth migration tranche checkpoint:
  - the project-detail prototype list now overlays Convex-backed prototype variants into the compatibility model
  - manual prototype link and delete flows now use public Convex prototype mutations instead of the legacy project-prototypes routes
- Membership/auth parity foundation checkpoint:
  - Convex now owns `workspaceMembers` and `invitations`
  - workspace create writes the creator's admin membership into Convex
  - server-side permission checks now consult Convex membership first, with legacy Drizzle membership as a fallback during migration
  - workspace member routes and invite-token read paths now proxy through the Convex-backed parity layer
  - onboarding workspace lookup and the workspace-role hook now read from the Convex parity path
- Membership/auth parity consumer checkpoint:
  - workspace settings now reads members and invitations from the Convex parity layer
  - workspace settings saves through the Convex workspace mutation path
  - the invite modal now creates invitations directly through the Convex invitation mutation
- Remaining parity caveat:
  - invitation acceptance and several sync/import flows still depend on the legacy app-user bridge and are not fully Convex-native yet
- Settings lane unblock checkpoint:
  - the missing workspace-columns route is restored
  - the settings page now sources its pipeline column state from the dedicated columns route instead of expecting `columnConfigs` on the Convex workspace object
  - graduation criteria and column settings can load again under the new auth/membership layer
- Activity parity checkpoint:
  - Convex now stores workspace activity logs
  - the legacy activity helper dual-writes new events into Convex during migration
  - the workspace activity route now reads from the Convex-backed activity feed, so the settings activity tab no longer depends on the old Drizzle-only activity log path
- Column / graduation parity checkpoint:
  - Convex now stores `columnConfigs`
  - the default pipeline columns are seeded into Convex for new or uninitialized workspaces
  - the existing `/api/columns*` and `/api/workspaces/[id]/columns` bridges now point at the Convex-backed column source of truth
  - `ColumnsSettingsCard` and `GraduationCriteriaCard` are now operating against the Convex-backed column model through the existing route layer
- Settings lane status:
  - the core settings surfaces now have parity across members, invitations, workspace save, activity feed, and pipeline columns / graduation criteria
  - the remaining settings work is now the long tail: deeper admin/settings exceptions and external/file-backed integrations, not missing core source-of-truth models
- Convex-native context lane checkpoint:
  - Convex now owns first-class `personas` and `signalPersonas`
  - Convex now exposes a unified workspace search surface across documents, memory, knowledgebase, and personas
  - `/api/personas`, `/api/signals/[id]/personas`, `/api/search`, and knowledgebase runtime routes now bridge to Convex-backed sources of truth
  - personas writes still dual-write to repo files for compatibility, but runtime reads are now Convex-first

**GitHub auth:** `GITHUB_TOKEN` (OAuth token) is set in Convex env vars as a fallback. `convex/tools/githubAuth.ts` now supports full GitHub App installation tokens (preferred when `GITHUB_APP_ID` + `GITHUB_APP_PRIVATE_KEY_B64` + `GITHUB_APP_INSTALLATION_ID` are set) with PAT fallback.

**GTM-33 Verification (complete):**
1. GitHub App created and installed on Elmer
2. Convex env vars configured: `GITHUB_APP_ID`, `GITHUB_APP_PRIVATE_KEY_B64`, `GITHUB_APP_INSTALLATION_ID`, `GITHUB_WEBHOOK_SECRET`
3. Webhook URL verified against `https://fortunate-parakeet-796.convex.site/webhooks/github`
4. Signature verification confirmed: unsigned test requests return `401`, signed GitHub push returns `200`
5. Webhook repo filter fixed to accept both `tylersahagun/elmer` (current) and `AskElephant/pm-workspace` (future)
6. Convex module naming fixed (`githubAuth.ts`) so deployments succeed

---

## Swarm Plan — Next Wave

Run the next push as five parallel lanes with one orchestrator agent coordinating handoffs and status updates. The goal is to stabilize auth/deployment first, keep the app testable during migration, and avoid premature work on Chat before the Convex foundation is ready.

### Lane 0 — Platform Reliability

**Owner agents:** platform / auth / deployment agents  
**Linear issues:** `GTM-94`, `GTM-95`, `GTM-96`, `GTM-97`, `GTM-98`

- Restore reliable Clerk asset loading on `elmer.studio`
- Align Clerk, Convex, and app-origin configuration across local and deployed environments
- Add lightweight auth/domain smoke checks so uptime and auth breakage are not conflated
- Remove stale NextAuth/Auth.js migration debt after the Clerk path is confirmed stable
- Update deployment/auth docs to reflect the real current stack and cutover sequence

**Definition of done for this lane:**
- `/login` loads reliably on the public URL
- `npm run check:auth` is a trustworthy release gate
- Deployment docs no longer mix legacy and target-state steps ambiguously

### Lane A — Testing Completion

**Owner agents:** `gsd-executor` or implementation agents focused on test infra  
**Linear issues:** `GTM-78`, `GTM-82`, `GTM-83`, `GTM-84`

- Expand the POM layer beyond `WorkspacePage`, `SignalInboxPage`, and `AgentExecutionPage`
- Finish route smoke coverage for all major dashboard surfaces
- Add seed/fixture path for signal inbox tests so tests don't depend on manual data
- Add the first agent-execution E2E happy path using stub data

**Definition of done for this lane:**
- `npm run test:e2e:smoke` passes locally
- Signal inbox specs cover seeded data and empty state
- Route coverage is broad enough to catch page-level regressions

### Lane B — Team Awareness Surfaces

**Owner agents:** UI + Convex implementation agents  
**Linear issues:** `GTM-69`, `GTM-70`, `GTM-55` to `GTM-58`

- Persist job attribution fields (`initiatedBy`, `rootInitiator`, `parentJobId`)
- Ship `ExecutionBadge` / blame-chain UI in existing execution surfaces
- Add lightweight `presence` table and `usePresence` hook
- Surface presence avatars in navbar, project detail, and document views

**Definition of done for this lane:**
- Every agent run is attributable end-to-end
- Two or more users can see each other's active location in the app

### Lane C — Migration Readiness

**Owner agents:** architecture + implementation agents  
**Linear issues:** `GTM-59`, `GTM-99`, `GTM-100`, `GTM-101`, `GTM-102`, `GTM-103`

- Inventory all remaining PostgreSQL / Drizzle / REST / SSE dependencies still used by the UI
- Create a route-by-route migration map from old data access to Convex `useQuery` / `useMutation`
- Separate "can migrate now" pages from pages blocked by missing Convex hooks
- Convert the named blocker categories into executable tickets:
  - workspace membership + invitations parity
  - connected-account / GitHub settings state
  - personas + knowledgebase boundary decision
  - Convex search strategy for documents + memory
  - project detail page parity slices
- Prepare the Clerk + Vercel cutover checklist so migration work can begin immediately after Phase 6

**Definition of done for this lane:**
- A route-level migration checklist exists
- Every remaining legacy dependency is mapped to a Convex replacement, an intentional server-side boundary, or a named blocker ticket

### Lane D — Chat Readiness (do not fully implement yet)

**Owner agents:** design / planning agents  
**Linear issues:** `GTM-71` to `GTM-77`

- Finalize surface contracts for `ElmerPanel`, `Agent Hub`, `Context Peek`, and artifact panel
- Define the exact Convex hooks and UI integration points these features will require post-migration
- Do **not** fully implement the new chat surface before Lane C makes the UI Convex-native

**Definition of done for this lane:**
- Chat phase is implementation-ready but not prematurely built against legacy data paths

### Recommended Execution Order

1. Start **Lane 0** immediately and treat auth/deployment stability as the release gate
2. Run **Lane A** and **Lane B** in parallel once the public auth path is stable enough to test against
3. Keep **Lane C** running in parallel as the cutover-planning and blocker-burn-down stream
4. Keep **Lane D** to planning/spec/contract work until Lane C has moved the main app surfaces onto Convex
5. Start the full Chat implementation push only after platform stability, test confidence, and the first migration tranche are holding

---

## What You Are Building

Elmer is AskElephant's internal PM command center. It is a platform where:

- All 22 PM workflow agents run **server-side** as Convex Actions (no Cursor session required)
- The entire product lifecycle (signals → research → PRD → prototype → validation → launch) is orchestrated
- The team (Tyler, Rob, Ben, Adam, Kenzi) has real-time visibility into everything
- Multiple agents can work on a project simultaneously
- Human-in-the-loop (HITL) happens in the browser, not in a chat window

This is an **internal tool for AskElephant only** — not multi-workspace, not multi-tenant. Single org, `@askelephant.ai` email domain. It could eventually become a product, but for now simplicity beats generality.

---

## Technology Decisions (All Final, Not Up for Debate)

| Decision          | Answer                                                                                       |
| ----------------- | -------------------------------------------------------------------------------------------- |
| Backend           | **Convex** (replaces PostgreSQL + Drizzle + NextAuth + workers + SSE)                        |
| Auth              | **Clerk** (Google OAuth restricted to `@askelephant.ai` domain)                              |
| Hosting           | **Vercel**                                                                                   |
| Vector sidecar    | **Neon PostgreSQL** (pgvector only — signal embeddings and similarity search)                |
| React UI          | Keep all existing components. Zero UI rewrites unless a component needs new Convex hooks.    |
| Prototype code    | **elephant-ai** repo (`product-repos/elephant-ai/` submodule). Elmer commits via GitHub API. |
| Agent definitions | `.cursor/` files in **pm-workspace** repo. Synced to Elmer's DB via GitHub App webhook.      |
| Cursor's role     | Dev tool for building Elmer itself. NOT used for running PM workflows.                       |

---

## Repository Structure

```
tylersahagun/elmer  ← You are here. Build everything here.
├── orchestrator/           ← Next.js app (keep all React components, replace backend)
│   ├── src/app/            ← All existing pages and UI components — keep as-is
│   ├── src/lib/agent/      ← DELETE: replace with convex/agents/
│   ├── src/lib/db/         ← DELETE: replace with convex/schema.ts
│   └── src/app/api/        ← Mostly DELETE: most routes become Convex mutations/queries
├── convex/                 ← NEW: entire Convex backend lives here
│   ├── schema.ts           ← All table definitions
│   ├── agents/             ← run.ts, resume.ts, sync.ts
│   ├── projects.ts
│   ├── signals.ts
│   ├── documents.ts
│   ├── memory.ts
│   ├── graph.ts
│   ├── orchestrator.ts
│   ├── crons.ts            ← Replaces all Vercel cron endpoints
│   └── tools/              ← composio.ts, github.ts, webSearch.ts, etc.
├── mcp-server/             ← REWRITE: call Convex HTTP API instead of SQLite
├── product-repos/
│   └── elephant-ai/        ← git submodule (AskElephant/elephant-ai@main)
└── elmer-docs/             ← Local cache of pm-workspace context (generated, not edited)
```

---

## What Gets Deleted vs. Kept

### Delete

- `orchestrator/src/lib/db/` — all Drizzle ORM code
- `orchestrator/src/lib/agent/worker.ts` — job worker process
- `orchestrator/src/lib/execution/worker.ts` — stage execution worker
- `orchestrator/worker.ts` — worker entry point
- `orchestrator/execution-worker.ts` — execution worker entry point
- `orchestrator/src/app/api/jobs/stream/` — SSE job stream (replaced by Convex `useQuery`)
- `orchestrator/src/app/api/runs/[id]/logs/` — SSE log stream
- `orchestrator/src/app/api/discovery/stream/` — SSE discovery stream
- `orchestrator/src/app/api/cron/` — Vercel cron routes (replaced by `convex/crons.ts`)
- `orchestrator/drizzle/` — all migration files
- `orchestrator/drizzle.config.ts`
- `orchestrator/src/lib/queue/` — dead code (never imported)
- Unused npm deps: `@tiptap/extension-bubble-menu`, `@tiptap/extension-floating-menu`, `@tiptap/extension-code-block-lowlight`, `lowlight`, `rehype-highlight`, `motion` (framer-motion is used instead)
- `elephant-ai/` (root-level manual stub) — replaced by `product-repos/elephant-ai/` submodule
- `prototypes/` (standalone Storybook 8 app) — replaced by elephant-ai's Storybook 9.1
- `orchestrator/src/components/chat/ChatSidebar.tsx` — replaced by the new ElmerPanel (stateless, single-turn, no tools — see Chat & Agent Hub section)
- `orchestrator/src/app/api/chat/route.ts` — replaced by `convex/chat.ts` streaming action
- `JobLogsDrawer` as a floating right-side drawer — functionality moves to Agent Hub tab + dedicated trace pages at `/workspace/[id]/agents/[jobId]`
- `PendingQuestionsPanel` as a floating bottom-right panel — HITL questions move inline to chat thread + Agent Hub HITL indicators

### Keep (do not modify without good reason)

- All React components in `orchestrator/src/app/(dashboard)/`
- `orchestrator/src/components/` — all UI components including TipTap editor, Kanban, signals table, document viewer, agents page
- `orchestrator/src/lib/composio/` — ComposioService, already works server-side
- `orchestrator/src/lib/github/` — writeback service, already uses Octokit
- `orchestrator/src/lib/classification/` — signal clustering, keep (needs Neon sidecar for embeddings)
- `orchestrator/src/lib/signals/` — signal processor, keep
- `mcp-server/` — keep the structure, rewrite the internals to call Convex

---

## Convex Schema

The complete schema is in `pm-workspace-docs/the-grand-apparatus/elmer-v2-architecture.md`. Key tables:

```
workspaces       projects        documents       jobs
jobLogs          pendingQuestions signals         signalProjects
inboxItems       memoryEntries   agentDefinitions agentExecutions
notifications    tasks (NEW)     graphNodes (NEW) graphEdges (NEW)
graphObservations (NEW)          graphCommunities (NEW)  graphEvents (NEW)
knowledgebaseEntries             prototypeVariants (NEW)
chatThreads (NEW)                chatMessages (NEW)
```

The `tasks`, all `graph*` tables, and both `chat*` tables are new (don't exist in current Elmer). Everything else migrates from PostgreSQL to Convex.

### Chat Schema Detail

```typescript
// convex/schema.ts additions
chatThreads: defineTable({
  workspaceId: v.id("workspaces"),
  userId: v.string(),                          // Clerk user ID
  title: v.string(),                           // auto-generated or user-renamed
  contextEntityType: v.optional(v.string()),   // "project" | "document" | "signal" | null
  contextEntityId: v.optional(v.string()),     // if thread is context-specific
  lastMessageAt: v.number(),
  model: v.optional(v.string()),               // user's model override
  isArchived: v.boolean(),
}).index("by_workspace_user", ["workspaceId", "userId"])
  .index("by_last_message", ["workspaceId", "lastMessageAt"]),

chatMessages: defineTable({
  threadId: v.id("chatThreads"),
  role: v.union(v.literal("user"), v.literal("assistant"), v.literal("tool")),
  content: v.string(),
  toolCalls: v.optional(v.array(v.any())),     // MCP tool calls made in this message
  tokenCount: v.optional(v.number()),
  agentJobId: v.optional(v.id("jobs")),        // if this message triggered an agent run
  isHITL: v.optional(v.boolean()),             // true if this is an agent's pending question
  hitlJobId: v.optional(v.id("jobs")),         // which job asked the HITL question
}).index("by_thread", ["threadId"]),
```

---

## The Agentic Loop (Core of Phase 1)

Every PM workflow agent runs as a Convex `internalAction`. The pattern:

```typescript
// convex/agents/run.ts
export const runAgent = internalAction({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, { jobId }) => {
    // 1. Load agent definition (content, model, requiredArtifacts)
    // 2. Load project context from memory graph
    // 3. Build system prompt: company context + TL;DR + agent instructions
    // 4. Run Anthropic API call with tool definitions
    // 5. For each tool call: route to composio/github/db/etc.
    // 6. On ask_question: write pendingQuestion, pause (return early)
    // 7. On completion: write agentExecution trace, schedule orchestrator
  },
});
```

Model routing: agent's `model` frontmatter → stored in `executionProfile.model` → resolved at execution:

- `haiku` → `claude-3-haiku-20240307` (triage, classification)
- `sonnet` → `claude-sonnet-4-20250514` (research, analysis)
- `inherit` → `claude-sonnet-4-5` (PRD, prototypes, validation)

Long-running agents (prd-writer, validator, prototype-builder) use state machine chunking: one Convex Action per step, each step writes to DB and schedules the next step. This stays within Convex's 10-minute action limit.

---

## Server-Side Tool Catalog

Agents don't lose any capability vs. Cursor. All tools are available server-side:

| Category                               | Implementation                                                            |
| -------------------------------------- | ------------------------------------------------------------------------- |
| Slack, Linear, Notion, HubSpot, Google | Composio SDK (`@composio/core`) — already works, API key per workspace    |
| GitHub file read/write                 | `convex/tools/githubAuth.ts` — GitHub App installation tokens (RS256 JWT via `jose`), PAT fallback. `codebase.ts` tools: `read_file`, `write_file`, `list_directory`, `search_code` |
| Codebase search                        | GitHub Code Search API — replaces `rg` shell command                      |
| PostHog                                | Direct REST API calls                                                     |
| Figma                                  | Direct REST API calls                                                     |
| Web search                             | Brave Search API                                                          |
| Screenshots                            | Browserless.io                                                            |
| Image generation (nano-banana)         | Sandbox service on Fly.io — Convex Action calls `fetch` to sandbox        |
| DB operations                          | Convex mutations (save_document, store_memory, create_task, etc.)         |
| HITL                                   | Write `pendingQuestion` to Convex, pause action                           |

Full tool catalog with TypeScript implementations: `pm-workspace-docs/the-grand-apparatus/server-side-tools.md`

---

## Memory Graph

Five new Convex tables connect every entity in the system:

```
graphNodes: entityType, entityId, name, accessWeight, decayRate, pagerank, communityId
graphEdges: fromNodeId, toNodeId, relationType, weight, confidence, source
graphObservations: nodeId, depth (0=summary → 3=raw), content, supersededBy
graphCommunities: name, theme, memberCount
graphEvents: eventType, entityId, actor, details
```

**Auto-create graph nodes** when these are inserted:

- New project → `graph_node(type: project, decayRate: 0.005)`
- New document → graph node + `produced_for` edge to project
- New signal → graph node + `linked_to` edges to linked projects

**Learning:**

- Access reinforcement: `accessWeight *= 1.1 + 0.1` on every read
- Daily decay cron: `accessWeight *= (1 - decayRate)`, archive below 0.1
- Novelty check: cosine similarity > 0.85 → reinforce existing node instead of creating duplicate

Full schema and SQL: `pm-workspace-docs/the-grand-apparatus/memory-graph-architecture.md`

---

## MCP Server Rewrite

The current `mcp-server/` uses SQLite and has 13 stub tools. Rewrite to:

1. Call Convex HTTP API instead of SQLite
2. Remove all 13 stubs (they're Convex Actions now, not MCP tools)
3. Implement the P0 tool set (projects, signals, agents, jobs, KB, memory, PM workspace)

Full tool catalog (95 tools): `pm-workspace-docs/the-grand-apparatus/mcp-parity-plan.md`

MCP Apps (SEP-1865 spec): 5 priority apps that render interactive UI inline in Claude Desktop and embed in Elmer via `@mcp-ui/client` AppRenderer. Full spec: `pm-workspace-docs/the-grand-apparatus/mcp-parity-plan.md`

---

## Signal Inbox Behavior

On every signal insert, a Convex Action auto-runs:

1. Generate embedding (Neon sidecar)
2. Classify: find best project match + confidence
3. Generate 1-sentence TL;DR
4. Score impact 0-100: severity × frequency × strategic alignment
5. Direction change detection: does this signal suggest a project should change scope/timeline/priority?
   - If yes: populate `projectDirectionChange` object
   - Set `suggestsVisionUpdate = true`
6. Create notification if impact > 70 or vision update detected

Inbox UI (`/workspace/inbox`): sorted by impact score, sections for HIGH IMPACT and SUGGESTS DIRECTION CHANGE. "Review Impact" opens a diff panel showing current document section vs. suggested change, with Accept/Modify/Ignore.

---

## Project TL;DR

Every project has a 4-sentence machine-generated TL;DR stored in `project.metadata.tldr`:

1. What we're building (concrete)
2. Why (tied to strategic pillars)
3. Who it's for (persona + problem)
4. Current status + blocker

Auto-generates on: project creation, phase advance, research.md update, PRD update.
Injected into every agent's system prompt so agents always know what the project is about.
Displayed on: Kanban card, project detail header.

---

## Prototype Architecture

**Canonical:** Storybook/Chromatic. Components live in `elephant-ai/apps/web/src/components/prototypes/[Initiative]/v1/`. Import via `@/` alias. Chromatic URL stored in Elmer `prototypes` table.

**Variants:** `prototypeVariants` Convex table. Platforms: `storybook | v0 | nano_banana | magic_patterns | figma_make | replit`. Output types: `iframe_url | static_images | tsx_code | github_repo`. Variants can be "promoted" to Storybook: agent adapts `@/` imports and commits to elephant-ai via GitHub API.

**elephant-ai as submodule:** `product-repos/elephant-ai/` → `git submodule add git@github.com:AskElephant/elephant-ai.git product-repos/elephant-ai`. Sync before prototype sessions via "Sync product repo" button.

---

## Orchestrator

Convex cron every 2 hours: `crons.interval('orchestrator', { minutes: 120 }, internal.orchestrator.run)`

Checks each active project across 8 health dimensions:

1. Artifact completeness (required docs for current phase)
2. Evidence chain (graph edges: PRD → research, prototype → PRD)
3. Signal recency (last signal linked < 30 days)
4. Stakeholder coverage (required role contributed in this phase)
5. Decision logging (key decisions in memoryEntries)
6. Metric baseline (PostHog baseline before launch)
7. Communication (weekly brief in last 7 days)
8. Dependency graph (no broken edges)

Creates `pendingQuestion` proposals for approval, auto-schedules fully-auto actions. Proposals panel at `/workspace/orchestrator`.

---

## PM Workspace Sync

Two sync flows:

**1. Agent definition sync** (triggered by GitHub webhook on pm-workspace push):

- Reads `.cursor/commands/*.md` (68), `.cursor/agents/*.md` (22), `.cursor/skills/**` (33+), `.cursor/rules/*.mdc` (5)
- Parses graph edges from content: `delegates_to`, `uses_skill`, `reads_context`, `produces`, `human_gate`
- Stores as `agentDefinitions` records + `graphEdges`
- Archives old version on change (validTo set, supersededBy edge created)

**2. pm-workspace-docs sync** (same webhook):

- `company-context/` → `knowledgebaseEntries`
- `initiatives/active/*/` → `projects` + `documents`
- `feature-guides/` → documents (type: feature_guide)
- `hypotheses/` → hypotheses table
- `roadmap/roadmap.json` → roadmap data

---

## What Already Works in Elmer (Don't Rebuild These)

**Convex backend (built in this rebuild):**
- Full schema: `orchestrator/convex/schema.ts` — all 19 tables including graph, tasks, prototypeVariants
- Agentic loop: `orchestrator/convex/agents.ts` — run, resume, sync, model routing, HITL
- Server-side tools: `orchestrator/convex/tools/` — db, services (Composio/PostHog/Brave), codebase (GitHub)
- GitHub auth: `orchestrator/convex/tools/githubAuth.ts` — App tokens + PAT fallback
- Signal inbox: `orchestrator/convex/inbox.ts`, `inboxItems.ts` — auto-classify, TL;DR, impact scoring
- Memory graph: `orchestrator/convex/graph.ts` — 5 tables, reinforcement, decay
- MCP server: `mcp-server/src/` — 20 P0 tools backed by Convex HTTP API
- Convex HTTP routes: `orchestrator/convex/http.ts` — GitHub webhook, all MCP endpoints
- Crons: `orchestrator/convex/crons.ts` — decay, maintenance, orchestrator
- pm-workspace sync: agent definitions + docs sync via GitHub push webhook

**React UI (kept from pre-Convex, DO NOT REWRITE):**
- All pages: `orchestrator/src/app/(dashboard)/` — Kanban, project detail, signals, agents, inbox, tasks, documents
- All components: `orchestrator/src/components/` — TipTap editor, Kanban, signals table, document viewer, agents page, pending questions panel
- Signal classification: `orchestrator/src/lib/classification/` — needs Neon sidecar for embeddings
- Signal processing: `orchestrator/src/lib/signals/`
- Composio service: `orchestrator/src/lib/composio/service.ts`
- GitHub writeback: `orchestrator/src/lib/github/` — path-resolver, writeback-service
- Inbox panel: `orchestrator/src/components/inbox/InboxPanel.tsx`

---

## Chat & Agent Hub

The existing `ChatSidebar.tsx` is broken and will be deleted. It is stateless (resets on navigation), single-turn (sends one message with no conversation history), has no tool access, and cannot query documents, signals, or the Memory Graph. It is replaced by two new surfaces.

### Surface 1: ElmerPanel (right-side expandable panel)

**Activation:** `Cmd+L` keyboard shortcut or click the small floating icon on the right edge of the viewport.

**Collapsed state:** A small floating icon button on the right edge — always visible, never intrusive.

**Open state:** Slides in from the right, default ~25% viewport width, drag handle to resize freely.

**Two tabs inside the panel:**

#### Chat Tab

- Multiple named persistent conversation threads — auto-named by topic, user-renameable
- History persisted in Convex `chatThreads` + `chatMessages` tables (never lost on navigation)
- Streaming responses — token by token (no waiting for full completion)
- **Model routing:** Haiku for quick factual Q&A, claude-sonnet-4-20250514 for complex queries + agent interactions. User can override with a model toggle in the panel header.

**Context always available (no @mention required):**
- Current page context (which project/document/signal you're viewing)
- All workspace projects + their TL;DRs
- Active + recently-run agents
- Recent signals (last 7 days, top 10 by impact)
- Company context (product vision, personas, strategic guardrails from knowledgebaseEntries)
- Memory Graph top nodes by pagerank/accessWeight

**@mention anything in the workspace:**
- `@project-name` → loads full project context (linked docs, signals, metadata)
- `@document-title` → loads document content
- `@signal-title` → loads signal + linked projects
- `@agent-name` → loads agent definition + recent execution history
- Typeahead picker appears when you type `@`

**Triggering agents:**
- Slash commands: `/prd-writer`, `/proto`, `/validate`, etc. with context picker
- Natural language: "Write a PRD for the Elmer chat initiative" → intent detection routes to the correct agent
- When triggered: compact agent card appears in chat — "🤖 PRD Writer — Running on [Project Name]" with a nav link to that page. No inline log stream — logs live in the Agent Hub tab.

**HITL (Human-in-the-Loop):**
- Agent questions appear as messages in the chat thread — reply inline and the agent resumes
- Notification badge on the panel icon when a question arrives while the panel is closed

**Document artifact panel:**
- When an agent produces a document, the chat shows a preview card
- Click → artifact panel opens alongside the chat showing the doc in TipTap
- Artifact panel supports: read, edit, discuss with AI, and trigger agents directly on the document
- The same document renders as an MCP App (SEP-1865 AppRenderer) for Claude Desktop and other MCP clients

#### Agent Hub Tab

The observability and control surface for all running agents. Replaces the floating `JobLogsDrawer`.

**Shows all active + recent (24h) agent runs:**

| Field | Description |
|---|---|
| Agent name | e.g. "PRD Writer" |
| Status | Running / Waiting for input / Complete / Failed |
| Working on | Clickable link to the page/project the agent is operating on |
| HITL | 🔴 badge if the agent needs your input |
| Duration | Time elapsed since job started |
| Last action | Most recent tool call (e.g. "Called GitHub: read PRD.md") |
| Cost | Token usage estimate |

**Interactions:**
- Click a HITL-flagged agent → switches to Chat tab with that agent's thread loaded
- Click "Working on [project]" → navigates to that page
- Click a completed run → opens full trace page at `/workspace/[id]/agents/[jobId]`
- Filter bar: All / Running / Waiting / Complete / Failed

**Hub location rationale:** Collocated as a tab in ElmerPanel (not a separate page) so HITL → Chat flow stays in one surface with no context switch. Matches VS Code multi-agent platform pattern where agent status is adjacent to the chat. A research swarm + jury validation will be run to confirm this vs. dedicated page vs. persistent top-bar ticker before implementation begins.

---

### Surface 2: Context Peek

- **Trigger:** Hover any project card, signal row, or document title for 500ms
- **Shows:** Floating popover with a fresh AI-generated 2-3 sentence summary of that entity (Haiku model, result cached for 1 hour), any active agents currently working on it, and a "Chat about this →" button
- **"Chat about this" button:** Opens the ElmerPanel chat tab with the entity pre-loaded as context in a new thread

---

### Chat Implementation Notes

**Convex backend (`convex/chat.ts`):**
- `sendMessage` mutation — appends user message, triggers streaming action
- `streamChatResponse` action — builds context payload (page state + memory graph query + company context), calls Anthropic with full `messages[]` array and tool definitions, streams response back via Convex HTTP endpoint
- `listThreads` / `listMessages` queries — real-time subscriptions for the panel UI
- Tool definitions available in chat: all MCP tools (read projects, documents, signals, memory graph) + `trigger_agent` (creates a job) + `create_document` + `search_workspace`

**What gets deleted (chat-related):**
- `orchestrator/src/components/chat/ChatSidebar.tsx`
- `orchestrator/src/app/api/chat/route.ts`
- `JobLogsDrawer` as a floating panel (becomes Agent Hub tab + dedicated trace pages)
- `PendingQuestionsPanel` as a floating panel (HITL moves to chat thread + Agent Hub indicators)

**Build phases for this feature:**

| Issue | Phase | Deliverable |
|---|---|---|
| [GTM-73](https://linear.app/askelephant/issue/GTM-73) | Chat-0 | Schema: `chatThreads` + `chatMessages` in Convex with queries/mutations |
| [GTM-72](https://linear.app/askelephant/issue/GTM-72) | Chat-1 | ElmerPanel shell, Cmd+L activation, floating icon, streaming chat, delete ChatSidebar |
| [GTM-74](https://linear.app/askelephant/issue/GTM-74) | Chat-2 | Full context injection (all sources), @mention typeahead picker |
| [GTM-71](https://linear.app/askelephant/issue/GTM-71) | Chat-3 | Agent Hub tab: live job list, HITL routing, trace links |
| [GTM-77](https://linear.app/askelephant/issue/GTM-77) | Chat-4 | Context Peek: hover previews on all entities |
| [GTM-76](https://linear.app/askelephant/issue/GTM-76) | Chat-5 | Document Artifact Panel + SEP-1865 MCP App renderer |
| [GTM-75](https://linear.app/askelephant/issue/GTM-75) | Chat-6 | Slash command picker improvements + NL intent routing + model switching UI |

---

## Linear Project

The active roadmap is in Linear: https://linear.app/askelephant/project/elmer-e42608f6079d/overview

Phase 0 (Foundation): GTM-33 to GTM-37
Phase 1 (Agent Execution): GTM-38 to GTM-43
Phase 2 (Sync + Memory Graph): GTM-44 to GTM-47
Phase 3 (Document + Task Views): GTM-48 to GTM-53
Phase 4 (Signal Inbox): GTM-50, GTM-52
Phase 5 (MCP Apps): GTM-54
Phase 6 (Team + Orchestrator): GTM-55 to GTM-58, GTM-69, GTM-70
Phase 7 (Full Migration): GTM-59, GTM-99 to GTM-103
Platform reliability: GTM-94 to GTM-98
Graph analytics follow-on: GTM-60
Phase 8 (Chat & Agent Hub): GTM-73, GTM-72, GTM-74, GTM-71, GTM-77, GTM-76, GTM-75

---

## Team Awareness Features (Phase 6)

Two features that make Elmer safe for concurrent multi-person use. Both depend on Phase 1 (jobs table) being in place first. The schema fields for blame tracking should be added in Phase 1 so data is captured from day one; the UI ships in Phase 6.

### GTM-69: Agent Blame Thread

Every job carries attribution through the full agent chain:

```
jobs.initiatedBy     — Clerk user ID of the human who triggered the run ("system" or "cron" for automated)
jobs.rootInitiator   — original human Clerk ID, propagated to all child jobs spawned by this job
jobs.parentJobId     — links child jobs back to their parent, enabling chain reconstruction
```

UI surfaces:
- `ExecutionBadge` (Kanban card level) — small avatar icon in the corner showing who started the run
- `ExecutionPanel` (live log view) — "Initiated by [name]" line in the header
- `AgentBlameChain` component — expandable view: Tyler → research-analyst → prd-writer → validator

Key implementation note: the `jobs.createAndSchedule` mutation already calls `ctx.auth.getUserIdentity()` and verifies identity — it just does not persist `identity.subject`. That one-line fix captures all human-triggered runs. When an agent action creates a child job, it passes `rootInitiator` from the parent job through.

### GTM-70: Live Presence

A lightweight ephemeral presence layer showing where each teammate is in the app, inspired by Notion and FigJam. **Explicitly out of scope: per-cursor position tracking** (requires Y.js or WebSocket sidecar — much higher lift, not worth it for a 5-person internal tool).

New `presence` Convex table:

```typescript
presence: defineTable({
  workspaceId: v.id("workspaces"),
  userId: v.string(),          // Clerk user ID
  displayName: v.string(),
  avatarUrl: v.optional(v.string()),
  location: v.string(),        // "kanban" | "project:[id]" | "document:[id]" | "inbox"
  projectId: v.optional(v.id("projects")),
  documentId: v.optional(v.id("documents")),
  lastSeen: v.number(),        // Date.now() — stale after 30s
}).index("by_workspace", ["workspaceId"])
  .index("by_user_workspace", ["userId", "workspaceId"]),
```

Cleanup: a 60s cron archives records where `lastSeen < Date.now() - 30_000`.

UI surfaces:
- Kanban project cards — stacked avatar cluster showing who's viewing that project
- Project detail modal header — avatar row of who has this project open
- `SimpleNavbar` — horizontal cluster of active users (green = now, gray = last 5 min)
- `DocumentViewer` header — "N people viewing" indicator

Clerk provides avatar URLs directly — no profile picture system needed. The `usePresence` hook calls `upsertPresence` on mount and every 10s (debounced), subscribes to `useQuery(api.presence.byWorkspace)` for live updates using the same reactive pattern as `useRealtimeJobs`.

---

## Architecture Reference Documents

All in `pm-workspace-docs/the-grand-apparatus/`:

| Document                                | What It Contains                                                                 |
| --------------------------------------- | -------------------------------------------------------------------------------- |
| `elmer-v2-architecture.md`              | Complete Convex schema, all 8 decisions resolved, phased plan                    |
| `server-side-tools.md`                  | Every tool available to server-side agents with TypeScript implementations       |
| `memory-graph-architecture.md`          | Graph schema, learning mechanisms, decay, community detection                    |
| `mcp-parity-plan.md`                    | All 95 MCP tools, 5 MCP App specs, migration approach                            |
| `elmer-pm-command-center.md`            | All 32 agents (22 existing + 10 new), lifecycle stage config, orchestrator logic |
| `pm-workspace-mcp-architecture.md`      | How pm-workspace agent definitions sync to Elmer, persistent memory vs hardcoded |
| `multi-platform-prototyping.md`         | Prototype variants schema, v0/nano-banana/Magic Patterns integration             |
| `elephant-ai-submodule-architecture.md` | Submodule setup, prototype path config, how Storybook connects                   |
| `agent-model-architecture.md`           | Model routing from frontmatter, cost tracking, server vs Cursor comparison       |
| `agent-architecture-map.md`             | All 20 agents: triggers, context sources, tools, outputs, handoffs               |
| `elmer-audit-option3.md`                | What to keep/remove/fix in current Elmer, critical issues list                   |
| `master-plan.md`                        | Summary of all phases with timelines and milestones                              |
