# The Plan: Elmer as Agent Command Center

> Generated: 2026-03-04
> Status: Synthesis of all research, audits, and architecture decisions from this conversation
> Purpose: What the system looks like end-state, what outstanding decisions remain, and where you might be misunderstanding

---

## What You're Building (The End State)

A shared platform where multiple agents can work on a project simultaneously, the team can see and control what they're doing in real-time, and the same interface works whether you're in a browser, Cursor, or Claude.

```
┌──────────────────────────────────────────────────────────────────────┐
│                        ELMER (The Platform)                           │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │  Project: meeting-summary  ·  Build phase  ·  3 agents live  │    │
│  │                                                               │    │
│  │  ⚡ research-analyzer  running 45s  [Step 4/7: User quotes]  │    │
│  │  ⚡ posthog-analyst    running 12s  [Creating dashboard]     │    │
│  │  ⏸ prd-writer          awaiting    [Question: net-new or ?]  │    │
│  │       → "New feature"  "Extend existing"                     │    │
│  │                                                               │    │
│  │  Documents           Signals (8)      Prototypes (3)         │    │
│  │  ✓ research.md        ● Export ×4      Storybook v2 ✓        │    │
│  │  ✓ prd.md             ● Format ×3      v0 variant A          │    │
│  │  ✗ feature-guide      ● Context ×1     nano-banana refs      │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐    │
│  │ Kanban   │  │ Agents   │  │ Signals  │  │ Knowledge Base   │    │
│  │ Board    │  │ Monitor  │  │ + Map    │  │ + Graph          │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘    │
└──────────────────────────────────────────────────────────────────────┘
         │ MCP Server (95 tools)
         │ Same tools = same capabilities in Cursor, Claude, or browser
         ▼
┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│  Cursor           │   │  Claude Desktop   │   │  Other agents    │
│  (Tyler, coding)  │   │  (team members)   │   │  (automation)    │
│  text fallback    │   │  MCP Apps UI      │   │  structured JSON │
└──────────────────┘   └──────────────────┘   └──────────────────┘
```

---

## The Six Core Capabilities

### 1. Multiple Agents Running Simultaneously on a Project

**What it is:** Several agents work on one project at once without blocking each other. research-analyzer reads signals while posthog-analyst creates a dashboard while prd-writer waits for a human answer.

**How it works today in Elmer:** The job system already supports concurrency. `workerMaxConcurrency` is configurable. Jobs are independent rows with status tracking. SSE streams each job's logs separately.

**What's missing:** No UI view that shows multiple concurrent jobs on one project. The current jobs list is flat, not project-scoped in real-time. No orchestrator proposing and sequencing which agents run next.

**What needs to be built:** The project detail page needs a live "Active Agents" panel showing all running jobs for that project with real-time status. The orchestrator agent watches project state and proposes sequences (Phase 1 of the command center doc).

---

### 2. Visualize What Agents Are Doing

**What it is:** Real-time view of every agent: what step it's on, what tool it just called, what it's about to produce, how long it's been running.

**How it works today in Elmer:** SSE exists at `/api/jobs/[id]/logs`. The `JobLogsDrawer` component streams logs. `agentExecutions` table tracks start/end/tokens but only for `execute_agent_definition` jobs.

**What's missing:**
- Execution tracking only works for one job type. All other job types (generate_prd, run_jury, etc.) produce no trace.
- No visual "what is this agent doing right now" across all agents.
- No timeline replay -- you can't see the sequence of tool calls an agent made.
- The Agent Execution Monitor MCP App (App 3 from the MCP parity plan) isn't built yet.

**What needs to be built:** Expand `agentExecutions` to capture tool calls as structured events. Build the execution trace viewer. Add the Agent Execution Monitor MCP App.

---

### 3. The UI for Controlling Work

**What it is:** A human-facing interface for all PM work -- research, competitive analysis, documents, projects -- that doesn't require knowing Cursor slash commands.

**How it works today in Elmer:** The Kanban board, project detail (9 real tabs), signals page, agents page, and chat sidebar all exist and work. The chat sidebar accepts slash commands. Team members can log in today.

**What's missing:**
- The chat sidebar knows PM slash commands but doesn't have the full 68-command context loaded from pm-workspace-docs.
- The commands page (`/workspace/[id]/commands`) shows commands but doesn't let you run them with project context from the UI.
- No "Run this agent on this project" button that non-technical team members can use without knowing command syntax.
- The PM workspace context (initiatives, feature guides, research, signals) is mostly not synced into Elmer.

**What needs to be built:**
- Full pm-workspace sync into Elmer's memory graph (the PM workspace MCP architecture doc).
- Command execution panel that presents commands by phase with one-click execution.
- Role-based permissions so designers see design commands, engineers see spec/ticket commands.

---

### 4. How MCP-UI Manages That

**What it is:** The same UI views render whether you're in the browser (Elmer), Cursor, or Claude -- without building them three times.

**How MCP Apps work:** Per [SEP-1865](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/1865), an MCP tool can include a `_meta.ui.resourceUri` pointing to a bundled HTML/React app. When a compliant host (Claude Desktop, Claude web) calls the tool, it renders the UI inline. When a non-compliant host (current Cursor) calls the same tool, it gets text markdown fallback. The `@mcp-ui/client` package lets Elmer's own web UI render these same MCP Apps in iframes using `AppRenderer`.

**What this means practically:**
- You build the Initiative Dashboard once as an MCP App.
- It renders in Claude Desktop inline when an agent calls `elmer_get_project`.
- It renders in Elmer's project detail page via `AppRenderer`.
- Cursor agents get the text version today; when Cursor adds MCP Apps support, the interactive version appears automatically.
- **One codebase. Three surfaces. No duplication.**

**What's missing:** The MCP server doesn't have `@modelcontextprotocol/ext-apps` installed. No MCP Apps are built yet. The 8 priority Apps (Initiative Dashboard, Signal Map, Agent Monitor, Jury Viewer, Context Graph, PM Navigator, Initiative Context, Agent Inspector) need to be built.

---

## What's Confirmed (No Open Questions)

These decisions are fully researched and settled:

| Decision | Answer | Source |
|----------|--------|--------|
| Use Elmer as the platform | Yes -- UI is 80% built, schema is comprehensive, signal processing works end-to-end | elmer-audit-option3.md |
| Elmer's MCP server needs rewrite | Yes -- it uses SQLite separately from PostgreSQL; 13/27 tools are stubs | elmer-audit-option3.md |
| elephant-ai as Elmer submodule | Yes -- `product-repos/elephant-ai/` via git submodule; Elmer stores metadata, elephant-ai stores code | elephant-ai-submodule-architecture.md |
| Storybook/Chromatic as canonical prototype | Yes -- with multi-platform variants (v0, nano-banana, Magic Patterns, Figma Make) | multi-platform-prototyping.md |
| Memory graph architecture | Yes -- PostgreSQL + pgvector, Sven-style nodes/edges/observations/decay/communities | memory-graph-architecture.md |
| Agent definitions as persistent memory | Yes -- not hardcoded; synced from git via webhook; nodes in memory graph | pm-workspace-mcp-architecture.md |
| Notion as downstream only | Yes -- one-way push from Elmer; no more bidirectional sync | context-architecture-options.md |
| Ansor replaced by Elmer | Yes -- Elmer's memoryEntries + graph replaces Ansor's project_registry and evidence | context-architecture-options.md |

---

## Outstanding Decisions

These are the questions that still need answers before or during implementation:

### Decision 1: Who deploys Elmer and where?

**The question:** Is Elmer hosted by AskElephant as a shared platform for the team, or does Tyler run it locally? Is it Vercel + Neon (easiest), Railway + managed Postgres, or self-hosted?

**Why it matters:** The multi-agent visualization and team collaboration goals require a deployed instance the team can access. Local-only doesn't work for Rob, Ben, Kenzi, Adam seeing what agents are doing.

**Options:**
- Vercel (Next.js native) + Neon (Postgres native) -- easiest, ~$30/mo
- Railway -- more control, similar cost
- Self-hosted (VPS) -- most control, most maintenance

**Recommended:** Vercel + Neon. Lowest friction to get team access. Can migrate later.

---

### Decision 2: How does Cursor connect to the deployed Elmer MCP server?

**The question:** When Tyler runs agents in Cursor, how do they call Elmer's MCP tools? The MCP server runs as a subprocess (stdio transport) today, which means it runs locally. But if Elmer is deployed at `https://elmer.askelephant.com`, the MCP server needs to be either:
- A local process that calls the remote Elmer REST API (current architecture, just fix the SQLite issue)
- An HTTP/SSE-based remote MCP server that Cursor connects to directly

**Why it matters:** The execution mode (`cursor` vs `server` vs `hybrid`) per agent determines who runs what. Some agents need Cursor's local file access (prototype-builder writing to elephant-ai). Others can run server-side (signals-processor, validator). This determines how the MCP config is structured.

**Recommended:** Keep stdio MCP server locally (calls remote Elmer REST API). This is the simplest change. The server is a thin client proxy: it receives tool calls from Cursor, calls `https://elmer.askelephant.com/api/...`, and returns results.

---

### Decision 3: What's the execution boundary for agents that need local files?

**The question:** Some agents need Cursor running locally because they write code (prototype-builder writes to elephant-ai Storybook components). Other agents only need API access. How does Elmer know which is which, and how does the handoff work?

**Concretely:** When the orchestrator says "run prototype-builder on meeting-summary," does it:
- (A) Create a job in Elmer's DB + wait for Cursor to pick it up via MCP?
- (B) Try to run it server-side and fail because it can't write local files?
- (C) Notify Tyler with a "this needs to run in Cursor" prompt?

**Why it matters:** If this isn't clear, the agent monitoring UI will show "queued" forever for agents that need Cursor but Cursor isn't running.

**Recommended:** The per-agent `executionMode` setting (already in Elmer's workspace settings) should be set per-agent-type. `cursor`-mode agents create jobs that show as "waiting for Cursor" in the UI with a deeplink. `server`-mode agents run immediately. The Elmer UI makes this visible.

---

### Decision 4: How does the pm-workspace repo get connected to Elmer?

**The question:** The pm-workspace lives at `github.com/[org]/pm-workspace` (private). For Elmer to sync it, it needs GitHub access. Does Elmer use:
- The existing GitHub OAuth (already in Elmer's auth)?
- A GitHub App with specific repo permissions?
- A Personal Access Token?

**Why it matters:** The git webhook (which keeps the memory graph current) needs push event access. The sync needs read access to `.cursor/` and `pm-workspace-docs/`. This is a configuration step, not a build step, but it blocks everything else.

---

### Decision 5: Is Elmer a private internal tool or a product AskElephant ships?

**The question:** Right now this conversation has been about Tyler using Elmer for AskElephant's PM work. But Elmer is also structured as a product (multi-workspace, auth, billing hooks). Is the plan to:
- (A) Use Elmer as an internal tool only, and potentially turn it into a product later?
- (B) Actively develop Elmer as a product that AskElephant ships to customers?

**Why it matters:** The architecture decisions (especially around what gets hardcoded vs. per-workspace) change significantly if this is a multi-tenant product. The 95-tool MCP catalog, memory graph, and sync all need to be workspace-scoped if it's a product.

**Current status:** Elmer is already workspace-scoped (every DB query filters by `workspaceId`). The product path is viable. But the team and resourcing question is separate.

---

### Decision 6: What's the MCP App rendering story for Elmer's own UI?

**The question:** The MCP Apps (Initiative Dashboard, Signal Map, etc.) can render in:
- Claude Desktop/web via MCP Apps spec
- Elmer's web UI via `@mcp-ui/client`'s `AppRenderer`
- Cursor (text fallback today; MCP Apps when Cursor implements spec)

But if Elmer's web UI uses `AppRenderer` to render MCP Apps inline, that means the MCP Apps are the UI. Do you want Elmer's UI to be fully MCP-App-driven (purist, one codebase), or do you want native React components in Elmer plus MCP Apps for external hosts (pragmatic, faster)?

**Recommended:** Pragmatic hybrid. Build the core Elmer pages as native React (the Kanban, project detail, etc. -- already built and working). Build the 8 MCP Apps for the interactive views that need to work across surfaces (Initiative Dashboard, Signal Map, Agent Monitor, Jury Viewer, Context Graph). Use `AppRenderer` to embed MCP Apps in the relevant Elmer pages.

---

## Where You Might Be Misunderstanding

These are the points where the architecture could be interpreted differently than what's actually planned:

### Misunderstanding 1: "MCP server = the UI"

MCP is the **API layer**, not the rendering layer. The MCP server exposes 95 tools. The UI (whether Elmer's web interface or MCP Apps) calls those tools. When you say "MCP UI manages that," what you mean is: the 8 MCP Apps provide interactive views that are served via the MCP protocol, so the same view works in any compliant host. But the Elmer web app (the Kanban, project detail pages, etc.) is still a normal React app that calls Elmer's REST API and optionally embeds MCP App views via `AppRenderer`.

### Misunderstanding 2: "Elmer replaces Cursor"

Cursor stays as the execution environment for agents that write code. Elmer is the coordination and visibility layer. The flow is:
- Human interaction + team collaboration + visualization: **Elmer**
- Code writing (prototypes, Storybook, configurations): **Cursor**
- Context loading for agents: **Elmer's memory graph via MCP**

Elmer doesn't replace Cursor's code editing. It wraps it -- providing the project context, tracking execution, and showing results.

### Misunderstanding 3: "Multiple agents = multi-threading requires new infrastructure"

Elmer's job system already supports multiple concurrent jobs. `workerMaxConcurrency` controls how many run at once. What doesn't exist is the **visibility** -- the UI that shows you "3 agents are running on this project right now." That's a UI gap, not an infrastructure gap. The backend already works.

### Misunderstanding 4: "All 95 MCP tools need to be built before anything is useful"

No. The value accrues in phases:
- **3 weeks:** MCP parity for P0 (projects, signals, agents, jobs, KB, memory) → agents can read/write Elmer's real database
- **5 weeks:** Write-through from PM workspace agents → team sees research, PRDs, jury results in Elmer
- **7 weeks:** Team access + observability → Rob, Ben, Kenzi see live initiative status
- **14-16 weeks:** Full 10/10 with MCP Apps, orchestrator, evals

You don't need 95 tools before it's useful. You need ~20 P0 tools and the memory graph sync to unlock the first real value.

### Misunderstanding 5: "The memory graph is a separate database"

The memory graph is **5 new tables in Elmer's existing PostgreSQL** (graph_nodes, graph_edges, graph_observations, graph_communities, graph_events). It's not a separate graph database. It uses pgvector for embeddings and is fully integrated with Elmer's existing schema. The graph layer connects existing entities (projects, documents, signals) that are already in Elmer -- it doesn't replace them.

---

## The Phased Plan

### Phase 0: Foundation (1 week)
**Goal:** Elmer deployed, connected to pm-workspace, team can log in.

- [ ] Deploy Elmer to Vercel + Neon (Decision 1 resolved)
- [ ] Connect pm-workspace GitHub repo to Elmer workspace
- [ ] Run initial full sync: agents, skills, commands, rules into `agentDefinitions`
- [ ] Invite Rob, Ben, Adam, Kenzi as workspace members
- [ ] Import active initiatives as projects (21 initiatives → 21 Elmer projects)
- [ ] Fix broken webhook (`/api/webhooks/signals/[key]`)
- [ ] Remove dead code (`lib/queue/`)

**End state:** Team can see the Kanban with real initiatives. Agents page shows all 68 commands and 22 agents. No MCP, no graph yet.

---

### Phase 1: MCP Bridge (2 weeks)
**Goal:** Cursor agents read/write Elmer's real database.

- [ ] Rewrite MCP server to call Elmer REST API (not SQLite)
- [ ] Implement 20 P0 tools: projects, signals, agents, jobs, KB, memory
- [ ] Wire memory module (already coded, not registered)
- [ ] Fix embedding vector gap (embedding → embedding_vector)
- [ ] Add Elmer MCP server to `.cursor/mcp.json`
- [ ] Test: `/research` in Cursor writes `research.md` to Elmer documents table

**End state:** Agents in Cursor write to Elmer. Research, PRDs, jury results appear in Elmer UI immediately. Team can see what agents produced without Tyler sharing manually.

---

### Phase 2: Memory Graph + Full Sync (2 weeks)
**Goal:** Everything in pm-workspace-docs is in Elmer's memory graph.

- [ ] Add 5 graph tables to Elmer's PostgreSQL
- [ ] Expand sync to read full pm-workspace-docs (initiatives, feature guides, hypotheses, personas)
- [ ] Parse graph edges from command/agent definitions at sync time
- [ ] Add git webhook for live sync on push
- [ ] Implement P0 graph tools: `elmer_graph_get_context`, `elmer_graph_search`, `elmer_graph_add_observation`
- [ ] Update pm-foundation rule to load context from Elmer graph

**End state:** Agents call `elmer_graph_get_context("meeting-summary")` and get back the full web of related entities. Company context is always current. Initiative state is queryable.

---

### Phase 3: Multi-Agent Visibility (2-3 weeks)
**Goal:** Team can see multiple agents running on a project in real-time.

- [ ] Expand `agentExecutions` tracking to all job types
- [ ] Build "Active Agents" panel in project detail (shows concurrent jobs + live logs)
- [ ] Build orchestrator agent: watches project state, proposes next agents
- [ ] Build project-health-agent: daily health check across 8 dimensions
- [ ] Per-agent `executionMode` (cursor/server) configuration
- [ ] "Waiting for Cursor" status with deeplink for Cursor-mode agents
- [ ] Add Install `@modelcontextprotocol/ext-apps` to mcp-server

**End state:** Tyler opens Elmer, sees 3 agents running on meeting-summary with live progress. Rob opens Elmer, sees the orchestrator's proposals for what to do next. Agents don't block each other.

---

### Phase 4: MCP Apps (2-3 weeks)
**Goal:** Interactive views work in Claude, Cursor, and Elmer.

- [ ] Build Initiative Dashboard (App 1)
- [ ] Build Agent Execution Monitor (App 3)
- [ ] Build Signal Map (App 2)
- [ ] Build PM Workspace Navigator (App 6)
- [ ] Embed apps in Elmer via `@mcp-ui/client` `AppRenderer`
- [ ] Build multi-platform prototype variants tab (nano-banana, v0, Magic Patterns)

**End state:** Tyler in Claude Desktop calls `elmer_get_project("meeting-summary")` and sees a full interactive dashboard inline. Same view in Elmer browser. Cursor gets text fallback.

---

### Phase 5: Autonomy + Communication (2-3 weeks)
**Goal:** Agents run on schedule, communication is automated.

- [ ] Scheduled execution: `/morning` at 8am, `/eod` 5pm, `/eow` Friday
- [ ] Slack webhook → signal ingestion → auto-classify → notify Tyler
- [ ] stakeholder-summary agent: sends phase completion to Rob/Kenzi
- [ ] design-handoff agent: sends Chromatic URL to Adam/Skylar
- [ ] engineering-handoff agent: sends spec + tickets to Ben
- [ ] Confidence thresholds for HITL escalation

**End state:** Signal arrives in Slack → Elmer classifies it → assigns to meeting-summary → notifies Tyler. Phase completes → Rob gets a summary automatically. No manual communication orchestration.

---

### Phase 6: Evals + 10/10 (2-3 weeks)
**Goal:** AX framework 10/10.

- [ ] Agent-level evaluation framework (trajectory testing)
- [ ] Quality gates before agent definition changes
- [ ] Autonomous loops with circuit breakers
- [ ] Remaining MCP Apps (Jury Viewer, Context Graph, Agent Inspector)
- [ ] Guardrail engine: cost caps, permission scoping per agent
- [ ] Community detection and graph analytics (weekly cron)

**End state:** AX 10/10 across Foundations, Patterns, Infrastructure, Surfaces, Design.

---

## Timeline Summary

| Phase | Duration | What You Can Do After |
|-------|----------|----------------------|
| 0: Foundation | 1 week | Team logs into Elmer, sees initiatives on Kanban |
| 1: MCP Bridge | 2 weeks | Agents write to Elmer; team sees all outputs |
| 2: Memory Graph | 2 weeks | Full PM workspace in graph; agents use live context |
| 3: Multi-Agent Visibility | 2-3 weeks | See multiple agents running on a project in real-time |
| 4: MCP Apps | 2-3 weeks | Interactive UI in Claude, Cursor text fallback |
| 5: Autonomy | 2-3 weeks | Signals auto-ingest; comms auto-send |
| 6: Evals | 2-3 weeks | Full 10/10 AX, quality gating |
| **Total** | **13-17 weeks** | |

The first useful milestone is **3 weeks**: team sees initiative status, agents write to shared database, research and PRDs are visible to everyone without Tyler copying files manually.
