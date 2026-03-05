# Elmer v2 — Agent Brief

> For any AI agent building new features in `tylersahagun/elmer`
> Generated: 2026-03-05 — Last updated: 2026-03-05
> Scope: Complete context for the Convex rebuild of Elmer, the AskElephant internal PM command center

---

## Current Build Status

**Phases 0–5 substantially complete. Phase 8 (Testing) infrastructure in place. ~32 of 53 Linear issues Done or In Progress.**

> Last updated: 2026-03-05 — Phase 5 MCP Apps built, Phase 8 (E2E Testing) scaffolded with Playwright, TDD rule active.

| Phase | Status | Remaining |
|---|---|---|
| Phase 0: Foundation | ⚠️ Mostly done | GTM-33 In Progress (GitHub App — human action required), GTM-37 Backlog (elephant-ai submodule) |
| Phase 1: Agent Execution | ⚠️ Mostly done | GTM-42 Backlog (Fly.io CLI sandbox) |
| Phase 2: Sync + Memory Graph | ✅ Complete | — |
| Phase 3: Documents + Tasks | ⚠️ Mostly done | GTM-53 Backlog (prototype variants) |
| Phase 4: Signal Inbox | ⚠️ Nearly done | GTM-83 Todo (E2E tests — was GTM-68) |
| Phase 5: MCP Apps | ✅ Complete | All 5 apps built and served as MCP resources |
| Phase 6: Team + Orchestrator | 🔲 Not started | GTM-55 to GTM-58, GTM-69, GTM-70 |
| Phase 7: Full Migration | 🔲 Not started | GTM-59 to GTM-60 — **critical blocker** |
| Phase 8: Chat & Agent Hub | 🔲 Not started | GTM-71 to GTM-77 |
| Phase 9: E2E Testing | 🟡 In Progress | GTM-78–93: Playwright installed, config + e2e/ scaffold done, smoke + signal-inbox specs written |

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
- POM classes: `WorkspacePage`, `SignalInboxPage`, `AgentExecutionPage`
- TDD Cursor rule: `.cursor/rules/test-driven-development.mdc` — active on all agent sessions
- Run: `npm run test:e2e` | `npm run test:e2e:smoke` | `npm run test:e2e:ui`

**GitHub auth:** `GITHUB_TOKEN` (OAuth token) is set in Convex env vars. `convex/tools/github-auth.ts` supports full GitHub App installation tokens (preferred when `GITHUB_APP_ID` + `GITHUB_APP_PRIVATE_KEY_B64` + `GITHUB_APP_INSTALLATION_ID` are set) with PAT fallback. GitHub App browser setup guide: `GITHUB-APP-SETUP.md`.

**GTM-33 Remaining Steps (human action required — ~15 min):**
1. Go to https://github.com/settings/apps/new → create "Elmer Bot" app (see `GITHUB-APP-SETUP.md` for full form values)
2. Generate private key → `base64 < elmer-bot.pem | tr -d '\n'`
3. Install app on `tylersahagun/elmer` + `AskElephant/elephant-ai` repos
4. Note: App ID, Installation ID (from URL after install), Base64 private key
5. In Convex dashboard → Settings → Environment variables: set `GITHUB_APP_ID`, `GITHUB_APP_PRIVATE_KEY_B64`, `GITHUB_APP_INSTALLATION_ID`
6. Mark GTM-33 Done in Linear

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
| GitHub file read/write                 | `convex/tools/github-auth.ts` — GitHub App installation tokens (RS256 JWT via `jose`), PAT fallback. `codebase.ts` tools: `read_file`, `write_file`, `list_directory`, `search_code` |
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
- GitHub auth: `orchestrator/convex/tools/github-auth.ts` — App tokens + PAT fallback
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

All 37+ issues are in Linear: https://linear.app/askelephant/project/elmer-e42608f6079d/overview

Phase 0 (Foundation): GTM-33 to GTM-37
Phase 1 (Agent Execution): GTM-38 to GTM-43
Phase 2 (Sync + Memory Graph): GTM-44 to GTM-47
Phase 3 (Document + Task Views): GTM-48 to GTM-53
Phase 4 (Signal Inbox): GTM-50, GTM-52
Phase 5 (MCP Apps): GTM-54
Phase 6 (Team + Orchestrator): GTM-55 to GTM-58, GTM-69, GTM-70
Phase 7 (Full Migration): GTM-59 to GTM-60
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
