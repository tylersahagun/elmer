# Elmer v2 — Agent Brief

> For any AI agent building new features in `tylersahagun/elmer`
> Generated: 2026-03-05
> Scope: Complete context for the Convex rebuild of Elmer, the AskElephant internal PM command center

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

| Decision | Answer |
|----------|--------|
| Backend | **Convex** (replaces PostgreSQL + Drizzle + NextAuth + workers + SSE) |
| Auth | **Clerk** (Google OAuth restricted to `@askelephant.ai` domain) |
| Hosting | **Vercel** |
| Vector sidecar | **Neon PostgreSQL** (pgvector only — signal embeddings and similarity search) |
| React UI | Keep all existing components. Zero UI rewrites unless a component needs new Convex hooks. |
| Prototype code | **elephant-ai** repo (`product-repos/elephant-ai/` submodule). Elmer commits via GitHub API. |
| Agent definitions | `.cursor/` files in **pm-workspace** repo. Synced to Elmer's DB via GitHub App webhook. |
| Cursor's role | Dev tool for building Elmer itself. NOT used for running PM workflows. |

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
```

The `tasks` and all `graph*` tables are new (don't exist in current Elmer). Everything else migrates from PostgreSQL to Convex.

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
  }
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

| Category | Implementation |
|----------|---------------|
| Slack, Linear, Notion, HubSpot, Google | Composio SDK (`@composio/core`) — already works, API key per workspace |
| GitHub file read/write | Octokit — read files from pm-workspace/elephant-ai, commit prototype code |
| Codebase search | GitHub Code Search API — replaces `rg` shell command |
| PostHog | Direct REST API calls |
| Figma | Direct REST API calls |
| Web search | Brave Search API |
| Screenshots | Browserless.io |
| Image generation (nano-banana) | Sandbox service on Fly.io — Convex Action calls `fetch` to sandbox |
| DB operations | Convex mutations (save_document, store_memory, create_task, etc.) |
| HITL | Write `pendingQuestion` to Convex, pause action |

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

- All React UI components (Kanban, project detail 9 tabs, signals page, agents page, chat sidebar)
- TipTap rich text editor (`orchestrator/src/components/ui/rich-text-editor.tsx`)
- Document viewer/editor (`orchestrator/src/components/documents/`)
- Signal classification pipeline (`orchestrator/src/lib/classification/`)
- Composio SDK integration (`orchestrator/src/lib/composio/service.ts`)
- GitHub writeback via Octokit (`orchestrator/src/lib/github/`)
- Signal processing with embeddings (`orchestrator/src/lib/signals/`)
- Inbox panel (`orchestrator/src/components/inbox/InboxPanel.tsx`)
- All signal maintenance (orphan detection, duplicate detection, archival)
- SSE-based job log streaming (until converted to Convex `useQuery`)

---

## Linear Project

All 28 issues are in Linear: https://linear.app/askelephant/project/elmer-e42608f6079d/overview

Phase 0 (Foundation): GTM-33 to GTM-37
Phase 1 (Agent Execution): GTM-38 to GTM-43
Phase 2 (Sync + Memory Graph): GTM-44 to GTM-47
Phase 3 (Document + Task Views): GTM-48 to GTM-53
Phase 4 (Signal Inbox): GTM-50, GTM-52
Phase 5 (MCP Apps): GTM-54
Phase 6 (Team + Orchestrator): GTM-55 to GTM-58
Phase 7 (Full Migration): GTM-59 to GTM-60

---

## Architecture Reference Documents

All in `pm-workspace-docs/the-grand-apparatus/`:

| Document | What It Contains |
|----------|-----------------|
| `elmer-v2-architecture.md` | Complete Convex schema, all 8 decisions resolved, phased plan |
| `server-side-tools.md` | Every tool available to server-side agents with TypeScript implementations |
| `memory-graph-architecture.md` | Graph schema, learning mechanisms, decay, community detection |
| `mcp-parity-plan.md` | All 95 MCP tools, 5 MCP App specs, migration approach |
| `elmer-pm-command-center.md` | All 32 agents (22 existing + 10 new), lifecycle stage config, orchestrator logic |
| `pm-workspace-mcp-architecture.md` | How pm-workspace agent definitions sync to Elmer, persistent memory vs hardcoded |
| `multi-platform-prototyping.md` | Prototype variants schema, v0/nano-banana/Magic Patterns integration |
| `elephant-ai-submodule-architecture.md` | Submodule setup, prototype path config, how Storybook connects |
| `agent-model-architecture.md` | Model routing from frontmatter, cost tracking, server vs Cursor comparison |
| `agent-architecture-map.md` | All 20 agents: triggers, context sources, tools, outputs, handoffs |
| `elmer-audit-option3.md` | What to keep/remove/fix in current Elmer, critical issues list |
| `master-plan.md` | Summary of all phases with timelines and milestones |
