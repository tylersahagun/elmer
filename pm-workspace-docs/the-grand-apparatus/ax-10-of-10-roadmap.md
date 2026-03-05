# AX 10/10 Roadmap: Honest Assessment & Path Forward

> Generated: 2026-03-04
> Purpose: What would it take to reach 10/10 across the AX framework, and should it be Elmer, new-build, or hybrid?

---

## The Honest State of Elmer

The schema looks comprehensive. The reality is more mixed. Here's what I found by reading the actual implementation:

### What's Actually Working

| Layer | Status | Details |
|-------|--------|---------|
| **PostgreSQL Schema** | Complete | 30+ tables, pgvector, full relations. The data model is solid. |
| **UI** | 80% working | Kanban, project detail (9 tabs), agents page, signals, knowledge base, chat sidebar, SSE job logs, settings. Real drag-and-drop, real-time updates. |
| **Job Worker** | Working | Polls every 2s, runs AgentExecutor (Claude + tools), auto-starts with Next.js. |
| **Webhooks** | Working | Slack Events API, Pylon, generic signal ingest, HMAC auth. |
| **Vector Embeddings** | Partial | OpenAI text-embedding-3-small generates embeddings. pgvector queries work. BUT: `embedding` (base64) and `embedding_vector` (pgvector column) are out of sync -- new signals don't populate the vector column without a manual migration step. |
| **Cron Endpoints** | Working | `/api/cron/signal-automation` (hourly), `/api/cron/maintenance` (daily). Protected by `CRON_SECRET`. |
| **Agent Execution Tracking** | Partial | Only tracks `execute_agent_definition` job type. Other jobs (generate_prd, run_jury, etc.) create NO execution records. |

### What's Stub or Placeholder

| Component | Status | Details |
|-----------|--------|---------|
| **MCP Server** | Mostly stubs | 9 of 22 tools work (8 job CRUD + deploy-chromatic). **13 tools are stubs** that return instruction templates, not real results. |
| **MCP Server DB** | SQLite, not PostgreSQL | The MCP server uses `better-sqlite3` against a separate SQLite file, NOT the main PostgreSQL database. This is a critical architectural gap. |
| **Memory Module** | Not exposed | `storeMemory`, `queryMemory`, `getProjectHistory` exist in code but are not registered as MCP tools. |
| **Document Generation** | Stubs | All 4 generation tools return templates telling Cursor to use the job flow. |
| **Research Analysis** | Stub | Returns placeholder structure. |
| **Jury Evaluation** | Stub | Returns placeholder evaluations. |
| **Linear Integration** | Stub | `createLinearIssue` and `syncLinearStatus` exist but aren't registered. |
| **MCP Client** | Not built | Architecture doc proposes `MCPClientManager` but it doesn't exist. Elmer can't call external MCP servers. |
| **Home Page Stats** | Hardcoded | Dashboard numbers are static (5, 12, 8, 24). |
| **Execution Worker** | Separate process | For stage automation; requires `npm run execution-worker` independently. Not auto-started. |

### The Critical MCP Server Gap

The MCP server connects to a **separate SQLite database**, not the main PostgreSQL database. This means:

- Agents calling Elmer MCP tools get a simplified view of data
- The rich PostgreSQL schema (pgvector, signals with embeddings, memory entries, agent executions) is **not accessible via MCP**
- The UI shows PostgreSQL data; MCP tools show SQLite data
- These two databases are not automatically synced

This alone means you can't just "point PM workspace agents at Elmer" and have it work. The MCP layer needs to be rewritten to talk to PostgreSQL.

---

## What 10/10 Actually Requires

### Foundations: 6.3 -> 10

| Gap | What 10 Looks Like | Effort |
|-----|-------------------|--------|
| **Tool Use** needs formal schemas | Every tool has a JSON schema, input validation, idempotency keys, cost/timeout budgets | Medium -- add schemas to existing MCP tools, add validation middleware |
| **Reflection** is weak | Every agent has a self-evaluation step: "Did my output meet the spec?" with automatic retry on failure | Medium -- add reflection prompt to agent harness, wire to execution tracker |
| **Planning** needs explicit state | Plan decomposition is visible and editable; human can modify the plan before execution | Medium -- stage recipes partially cover this; need plan visibility in UI |

### Patterns: 5.1 -> 10

| Gap | What 10 Looks Like | Effort |
|-----|-------------------|--------|
| **Multi-Agent Orchestration** | Persistent orchestrator watches initiative state, proposes next actions, manages agent-to-agent handoffs. Visible in UI. | HIGH -- this is the biggest single feature needed |
| **Autonomous Loops** | Agents can run in background loops with exit conditions, circuit breakers, and rate limiting. Night-mode processing. | HIGH -- needs execution worker + guardrails + monitoring |
| **Routing & Intent Detection** | Classifier routes inbound signals/requests to the right agent automatically. Model cascading (haiku for triage, sonnet for generation). | Medium -- intent classification exists in pm-foundation; needs to be formalized |
| **Computer Use** limited | Browser automation for competitive research, prototype testing, screenshot capture | Low priority -- nice to have, not essential |

### Infrastructure: 2.8 -> 10

| Gap | What 10 Looks Like | Effort |
|-----|-------------------|--------|
| **Memory** needs real implementation | Layered memory: working (context window), episodic (conversation history), semantic (pgvector), procedural (learned patterns). Agents query and write to memory as a first-class operation. | HIGH -- memory module exists in Elmer but isn't wired; needs MCP tools + agent integration |
| **Context Management** needs token budgeting | Agents know their context budget, compress old context, use RAG for retrieval. Context engineering, not just file loading. | Medium -- needs context window awareness in agent harness |
| **Guardrails** need enforcement | Per-agent permission scoping, cost caps, recursion limits. Programmatic, not philosophical. | Medium -- add guardrail config to agent definitions, enforce in harness |
| **Sandboxes** need implementation | Agents run in isolated environments. File system access scoped per agent. | HIGH -- fundamental architecture change |
| **Agent Harnesses** need building | Execution wrapper: retry on failure, timeout management, error reporting, graceful degradation. | Medium -- wrap AgentExecutor with harness layer |
| **Structured Output** needs enforcement | All agent outputs validate against schemas. Typed responses, not freeform markdown. | Medium -- add output schemas to agent definitions |

### Surfaces: 3.8 -> 10

| Gap | What 10 Looks Like | Effort |
|-----|-------------------|--------|
| **Generative UI / MCP Apps** | Rich inline visualizations during agent interactions. Initiative dashboards, signal maps, jury viewers. | Medium -- MCP Apps framework exists; build 3-5 apps |
| **Multi-Agent Workspaces** | Dashboard showing all agents, their current state, execution history, queue depth. A "control room." | Medium -- Elmer has agents page; needs execution monitoring, queue view |
| **Headless / CI Agents** | Webhook-triggered agents, scheduled runs, no human needed for routine work. | Medium -- webhooks exist in Elmer; needs event-to-agent routing |
| **IDE-Embedded** already strong | Keep current Cursor integration | Done |

### Design: 3.7 -> 10

| Gap | What 10 Looks Like | Effort |
|-----|-------------------|--------|
| **Observability & Tracing** | Every agent execution logged with: input context, tool calls, token usage, duration, output, errors. Trace visualization in UI. Step replay. | HIGH -- agent execution tracking exists but only for one job type; needs expansion + trace UI |
| **Evaluation & Testing** | Agent quality benchmarks. Trajectory testing (did the agent take the right steps?). Regression detection. Quality gates before deployment. | HIGH -- jury system covers prototype eval; need agent-level evals |
| **Human-in-the-Loop** already decent | Expand with confidence thresholds and escalation chains | Low -- refine existing patterns |

---

## The Build vs Extend Decision

### Option 1: Extend Elmer

**What's needed:**
1. Rewrite MCP server to use PostgreSQL instead of SQLite (1-2 weeks)
2. Wire memory module as MCP tools (3-5 days)
3. Fix vector embedding gap (embedding -> embedding_vector sync) (2-3 days)
4. Expand agent execution tracking to all job types (1 week)
5. Build orchestrator agent with UI visibility (2-3 weeks)
6. Add agent harness with retry/timeout/guardrails (1-2 weeks)
7. Build observability trace viewer in UI (1-2 weeks)
8. Wire headless execution from webhooks -> agents (1 week)
9. Build 3-5 MCP Apps for inline visualization (1-2 weeks)
10. Add evaluation framework for agent quality (2-3 weeks)

**Total estimate: 10-16 weeks of focused work**

**Pros:**
- UI is 80% built; don't rebuild what exists
- Schema is comprehensive; don't redesign the data model
- Job worker, webhooks, SSE already work
- Team collaboration (workspaceMembers) already exists

**Cons:**
- SQLite-to-PostgreSQL MCP rewrite is non-trivial
- 13 stub tools need real implementations
- Execution worker is a separate process, not integrated
- Some UI components may need significant rework for the new agent monitoring features

### Option 2: Build New (Lean Agent Platform)

**What you'd build:**
A focused agent infrastructure layer -- not a full PM tool, but the plumbing that makes agents work across any surface.

```
┌─────────────────────────────────────────┐
│  Agent Platform (NEW)                    │
│                                          │
│  ┌──────────┐  ┌───────────────────┐    │
│  │ Agent    │  │ Memory Store      │    │
│  │ Registry │  │ (pgvector)        │    │
│  └──────────┘  └───────────────────┘    │
│  ┌──────────┐  ┌───────────────────┐    │
│  │ Execution│  │ Context           │    │
│  │ Engine   │  │ Manager           │    │
│  └──────────┘  └───────────────────┘    │
│  ┌──────────┐  ┌───────────────────┐    │
│  │ Event    │  │ Observability     │    │
│  │ Router   │  │ (traces, logs)    │    │
│  └──────────┘  └───────────────────┘    │
│  ┌──────────┐  ┌───────────────────┐    │
│  │ Guardrail│  │ Harness           │    │
│  │ Engine   │  │ (retry, timeout)  │    │
│  └──────────┘  └───────────────────┘    │
│                                          │
│  MCP Server (tools for all of above)     │
│  REST API                                │
│  Dashboard UI                            │
└─────────────────────────────────────────┘
```

**What it focuses on:**
- Agent registry (import from .cursor/agents/, track state)
- Memory store with pgvector (episodic, semantic, procedural)
- Execution engine with harness (retry, timeout, guardrails)
- Event router (webhooks -> agent triggers)
- Observability (traces, tool call logs, cost attribution)
- MCP server that talks to PostgreSQL directly
- Dashboard UI for agent monitoring, not PM workflows

**Total estimate: 8-12 weeks for MVP**

**Pros:**
- Purpose-built for the agent infrastructure gaps (not a PM tool with agent features bolted on)
- Clean MCP integration from day 1 (no SQLite legacy)
- Focused scope -- doesn't try to replace Notion/Linear/Cursor for PM workflows
- Can be used by any team member for any agent system, not just PM

**Cons:**
- No UI head start -- building from scratch
- Duplicates some Elmer work (schema, job system)
- PM-specific features (kanban, documents, prototypes) not included -- still need Elmer or Cursor for those

### Option 3: Hybrid (Recommended)

**Use Elmer for what it does well, build the agent platform layer separately, connect them.**

```
┌─────────────────────────────────────────┐
│  Elmer (PM Workflows & Team UI)          │
│  - Kanban, project detail, documents     │
│  - Signals, knowledge base, chat         │
│  - Team collaboration, workspace mgmt    │
│  - REST API + PostgreSQL                 │
└───────────────┬─────────────────────────┘
                │ REST API
┌───────────────▼─────────────────────────┐
│  Agent Platform Layer (NEW)              │
│  - Agent registry + state                │
│  - Memory store (pgvector)               │
│  - Execution engine + harness            │
│  - Event router (webhooks -> agents)     │
│  - Observability (traces, logs, costs)   │
│  - Guardrail engine                      │
│  - MCP Server (all tools, PostgreSQL)    │
│  - Dashboard for agent monitoring        │
└───────────────┬─────────────────────────┘
                │ MCP Server (stdio)
┌───────────────▼─────────────────────────┐
│  Cursor (Agent Execution)                │
│  - 20 PM agents + skills + commands      │
│  - Local files (prototypes, storybook)   │
│  - IDE-embedded interaction              │
└─────────────────────────────────────────┘
```

**Phase 1: Fix Elmer's MCP server (2-3 weeks)**
- Rewrite MCP server to use PostgreSQL
- Wire memory module as MCP tools
- Fix embedding vector gap
- Expand agent execution tracking
- Result: Agents can read/write to Elmer's real database

**Phase 2: Build Agent Platform as Elmer module (3-4 weeks)**
- Add agent harness (retry, timeout, error reporting) to Elmer's executor
- Build event router (webhook -> agent trigger mapping)
- Build observability trace viewer (execution timeline, tool call log, cost attribution)
- Add guardrail config per agent (cost caps, permission scoping)
- Result: Elmer gains infrastructure-grade agent management

**Phase 3: Build shared session + monitoring UI (2-3 weeks)**
- Agent control room: see all agents, their queue, current state, recent executions
- Execution detail view: step-by-step trace replay with tool calls and outputs
- Memory browser: search and view what agents remember (semantic + episodic)
- Initiative-agent mapping: which agents touched which projects, when, and what they produced
- Result: Team can see what agents are doing in real-time

**Phase 4: Wire PM workspace agents to Elmer (2-3 weeks)**
- Update pm-foundation to load context from Elmer MCP
- Update key agents (signals-processor, research-analyzer, validator) to write outputs to Elmer
- Keep local files as working cache
- Set up Notion as downstream push from Elmer
- Result: Agents use Elmer as source of truth, team sees everything in UI

**Phase 5: Add autonomy features (2-3 weeks)**
- Orchestrator agent that watches Elmer project state and proposes next actions
- Scheduled execution (morning planner, EOD, EOW)
- Autonomous loops with exit conditions and circuit breakers
- Confidence thresholds for HITL escalation
- Result: System can run semi-autonomously with human approval gates

**Phase 6: MCP Apps + Evaluation (2-3 weeks)**
- Build 3-5 MCP Apps for inline Cursor visualization
- Add agent-level evaluation framework
- Trajectory testing for key agent workflows
- Quality gates before agent definition changes
- Result: Complete 10/10 coverage

**Total estimate: 14-19 weeks for full 10/10**

---

## Score Projection by Phase

| AX Category | Current | After Phase 1-2 | After Phase 3-4 | After Phase 5-6 |
|------------|---------|-----------------|-----------------|-----------------|
| **Foundations** | 6.3 | 7.5 | 8.5 | 10 |
| **Patterns** | 5.1 | 6.0 | 7.5 | 10 |
| **Infrastructure** | 2.8 | 6.0 | 8.0 | 10 |
| **Surfaces** | 3.8 | 5.0 | 8.0 | 10 |
| **Design** | 3.7 | 5.5 | 7.5 | 10 |
| **Overall** | 4.3 | 6.0 | 7.9 | 10 |

---

## What This Means for the PM Workspace

The PM workspace `.cursor/` layer (agents, skills, commands, rules) stays as-is. It's the agent logic layer -- the "brains." What changes is where those brains store data, how they're monitored, and who can see what they're doing.

| What Stays in PM Workspace | What Moves to Elmer |
|---------------------------|-------------------|
| Agent definitions (.cursor/agents/) | Agent execution tracking and traces |
| Skill definitions (.cursor/skills/) | Memory store (replaces Ansor + local signals) |
| Command definitions (.cursor/commands/) | Initiative metadata (replaces _meta.json as source of truth) |
| Rules (.cursor/rules/) | Document storage (research, PRDs, specs) |
| Prototype code (elephant-ai/) | Signal processing and storage |
| Local working files | Observability data (logs, costs, tool calls) |
| Cursor IDE interaction | Team dashboard and monitoring |

The key insight: **the PM workspace becomes the agent execution environment, and Elmer becomes the agent infrastructure and team interface.** They're complementary, not competing.
