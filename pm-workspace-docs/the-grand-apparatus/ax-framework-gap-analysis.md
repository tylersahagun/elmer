# Agent Experience Framework: Gap Analysis & System Architecture

> Generated: 2026-03-04
> Reference: [agent-experience.dev](https://agent-experience.dev) -- Patterns, Surfaces & Design Principles for AI Agents
> Purpose: Map the PM workspace agent architecture against the AX framework, identify gaps, and evaluate Elmer as the shared system layer

---

## Table of Contents

1. [AX Framework Taxonomy](#1-ax-framework-taxonomy)
2. [Current Architecture Mapped to AX](#2-current-architecture-mapped-to-ax)
3. [Gap Analysis by Category](#3-gap-analysis-by-category)
4. [The Storage & Collaboration Problem](#4-the-storage--collaboration-problem)
5. [Elmer as the Shared System Layer](#5-elmer-as-the-shared-system-layer)
6. [MCP Apps for Visualization](#6-mcp-apps-for-visualization)
7. [Recommended Architecture](#7-recommended-architecture)
8. [Implementation Roadmap](#8-implementation-roadmap)

---

## 1. AX Framework Taxonomy

The [agent-experience.dev](https://agent-experience.dev) framework organizes agent architecture into 5 categories with 24 patterns total:

### Foundations (4 patterns)
> The mental models you need before building anything

| Pattern | Core Idea | Key Concepts |
|---------|-----------|-------------|
| **Tool Use & Function Calling** | The building block of every agent | Strict API contracts, validation, idempotency, structured outputs, cost/timeout budgets |
| **ReAct Pattern** | Think, act, observe, repeat | Thought-Action-Observation loop, chain-of-thought + tool use, knowing when to stop |
| **Planning & Decomposition** | Breaking big problems into small steps | Task decomposition, plan-then-execute, hierarchical planning |
| **Reflection & Self-Correction** | Agents that check their own work | Self-evaluation, error detection, iterative refinement |

### Patterns (7 patterns)
> Concrete architectures you'll implement

| Pattern | Core Idea | Key Concepts |
|---------|-----------|-------------|
| **Model Context Protocol** | A universal plug for AI tools | Tool discovery, resource serving, MCP servers/clients, composable integrations |
| **Computer Use Agents** | AI that sees and clicks like a human | Screen-level interaction, browser automation, visual grounding |
| **Skills** | Plug-in expertise for agents | Dynamic prompt composition, SKILL.md convention, progressive disclosure |
| **agents.md** | A spec file for your agent | Agent identity, capabilities, boundaries in a single file |
| **Multi-Agent Orchestration** | Agents managing agents | Supervisor/worker, hierarchical delegation, fan-out/fan-in |
| **Routing & Intent Detection** | Sending tasks to the right agent | Classifier dispatch, model cascading, fallback chains |
| **Autonomous Loops** | Let it cook | While-loop agents, exit conditions, circuit breakers, rate limiting |

### Infrastructure (6 patterns)
> The plumbing that holds it all together

| Pattern | Core Idea | Key Concepts |
|---------|-----------|-------------|
| **Memory Patterns** | Giving agents a past and a future | Short-term/long-term, episodic/semantic/procedural, graph memory, temporal knowledge graphs |
| **Context Management** | Fitting the world into a window | Sliding window, compaction, RAG, token budgeting, context engineering |
| **Structured Output** | Getting reliable data out of language models | JSON schemas, validation, typed responses |
| **Guardrails & Safety** | Keeping agents on the rails | Input/output validation, cost caps, recursion limits, sandboxing, permission scoping |
| **Sandboxes** | Letting agents act without breaking things | Isolated execution, container-based environments, safe file system access |
| **Agent Harnesses** | The outer loop that makes agents reliable | Retry logic, error recovery, timeout management, execution wrappers |

### Surfaces (6 patterns)
> Where agents meet humans

| Pattern | Core Idea | Key Concepts |
|---------|-----------|-------------|
| **Generative UI** | Interfaces that write themselves | Dynamic component rendering, MCP Apps, inline rich UIs |
| **IDE-Embedded Agents** | The agent lives in your editor | Cursor, VS Code, Claude Code integration patterns |
| **TUI / CLI Agents** | Agents in your terminal | Terminal-based interaction, REPL patterns |
| **Chat Interfaces** | The conversation as the interface | Conversational UI, streaming, tool-use visualization |
| **Multi-Agent Workspaces** | A control room for your agents | Dashboard UIs, agent coordination views, status boards |
| **Headless / CI Agents** | No human watching | Automated pipelines, webhook-driven, scheduled execution |

### Design (3 patterns)
> Making agents usable, testable, and trustworthy

| Pattern | Core Idea | Key Concepts |
|---------|-----------|-------------|
| **Human-in-the-Loop** | Knowing when to ask for help | Approval gates, escalation, confidence thresholds, intervention points |
| **Observability & Tracing** | Debugging the black box | Trace visualization, step replay, token/cost attribution, OpenTelemetry |
| **Evaluation & Testing** | How do you know your agent is good? | Trajectory testing, benchmark suites, regression detection, quality gates |

---

## 2. Current Architecture Mapped to AX

### Foundations

| AX Pattern | PM Workspace Implementation | Score |
|-----------|---------------------------|-------|
| **Tool Use & Function Calling** | All 20 agents use MCP tools (composio, linear, posthog, etc.). Tool definitions are in agent markdown. No formal schemas, validation, or idempotency. | 6/10 |
| **ReAct Pattern** | Every agent implicitly follows ReAct via Cursor's agent loop. No explicit ReAct implementation -- Cursor handles the loop. | 7/10 |
| **Planning & Decomposition** | `workflow.yaml` defines a stage graph (intake -> discovery -> prd -> ... -> metrics). Commands decompose work (e.g., `/proto` runs placement -> inventory -> build -> deploy). | 7/10 |
| **Reflection & Self-Correction** | `validator` agent runs jury evaluation (reflection on prototype quality). `proto-audit` checks against standards. No general self-correction pattern across agents. | 5/10 |

### Patterns

| AX Pattern | PM Workspace Implementation | Score |
|-----------|---------------------------|-------|
| **Model Context Protocol** | Heavy MCP usage: 9 servers (composio, linear, posthog, hubspot, google, notion, figma, ansor, ask-elephant). Only 2 agents declare MCP in frontmatter. | 7/10 |
| **Computer Use Agents** | `competitive-analysis` skill uses browser-use for screenshots. Limited to one use case. | 2/10 |
| **Skills** | 36 skills in `.cursor/skills/` following SKILL.md convention. Well-structured with triggers, context, tools, output. | 9/10 |
| **agents.md** | 20 agent definitions in `.cursor/agents/` with markdown spec files. Missing: formal capability boundaries, failure modes. | 7/10 |
| **Multi-Agent Orchestration** | `/agent-team` command spawns parallel agents. `hubspot-activity` called by `activity-reporter`. No persistent orchestrator. | 4/10 |
| **Routing & Intent Detection** | `pm-foundation` rule has intent detection mapping (research intent -> `/research`, prototype intent -> `/proto`). No classifier model, no cascading. | 6/10 |
| **Autonomous Loops** | No autonomous loops. All agents run once per invocation. No while-loop, no exit conditions, no background execution. | 1/10 |

### Infrastructure

| AX Pattern | PM Workspace Implementation | Score |
|-----------|---------------------------|-------|
| **Memory Patterns** | Ansor (graph memory for evidence/decisions). File-based memory (`_meta.json`, signals, state files). No episodic memory, no temporal graphs. Only 1 agent writes to Ansor. | 3/10 |
| **Context Management** | `pm-foundation` always loads 4 context files. Agents load initiative-scoped files. No compaction, no token budgeting, no RAG. Context is file-read-based. | 5/10 |
| **Structured Output** | `validator` produces JSON verdicts. `signals-processor` produces structured signal files. Most agents output markdown, not structured data. | 5/10 |
| **Guardrails & Safety** | `strategic-guardrails.md` provides philosophical guardrails. `hubspot-activity` has disallowedTools. No cost caps, no recursion limits, no permission scoping per agent. | 3/10 |
| **Sandboxes** | No sandboxing. All agents run in the same workspace with full file system access. | 0/10 |
| **Agent Harnesses** | No harness. No retry logic, no error recovery, no timeout management. Agent failures are silent. | 1/10 |

### Surfaces

| AX Pattern | PM Workspace Implementation | Score |
|-----------|---------------------------|-------|
| **Generative UI** | None. All output is markdown/text in Cursor chat. No dynamic UI rendering. | 0/10 |
| **IDE-Embedded Agents** | Fully IDE-embedded via Cursor. Slash commands, agent delegation, skill loading all work within Cursor. | 9/10 |
| **TUI / CLI Agents** | Slash commands function as a CLI within Cursor chat. Not a standalone TUI. | 6/10 |
| **Chat Interfaces** | Cursor chat is the primary interface. Interactive commands use AskQuestion. | 7/10 |
| **Multi-Agent Workspaces** | No dashboard, no control room, no status board. The only "workspace view" is running `/status-all`. | 1/10 |
| **Headless / CI Agents** | No headless execution. No webhook-driven agents. No scheduled agents. | 0/10 |

### Design

| AX Pattern | PM Workspace Implementation | Score |
|-----------|---------------------------|-------|
| **Human-in-the-Loop** | Three tiers: auto-run, confirm-first, interactive. Well-defined in `pm-foundation`. No confidence thresholds or escalation chains. | 7/10 |
| **Observability & Tracing** | No tracing. No execution logging. No step replay. `workspace-admin audit` checks structure but not execution history. | 1/10 |
| **Evaluation & Testing** | `validator` (jury system) evaluates prototypes. `proto-audit` evaluates quality. No agent-level evals, no regression testing, no trajectory testing. | 3/10 |

### Score Summary

| Category | Average Score | Assessment |
|----------|--------------|------------|
| **Foundations** | 6.3/10 | Solid basics, missing self-correction |
| **Patterns** | 5.1/10 | Strong skills/MCP, weak orchestration/autonomy |
| **Infrastructure** | 2.8/10 | Major gaps in memory, guardrails, harnesses, sandboxes |
| **Surfaces** | 3.8/10 | Cursor-locked, no UI, no headless |
| **Design** | 3.7/10 | Good HITL, missing observability and evals |
| **Overall** | 4.3/10 | **The agent logic is strong. The infrastructure, surfaces, and observability are the gaps.** |

---

## 3. Gap Analysis by Category

### Critical Gaps (Score 0-2)

| Gap | AX Pattern | Impact | What's Needed |
|-----|-----------|--------|--------------|
| **No autonomous loops** | Autonomous Loops | Agents can't run background tasks, process backlogs, or operate overnight | Event-driven triggers, while-loop wrapper, exit conditions |
| **No sandboxing** | Sandboxes | All agents have full workspace access; no isolation | Per-agent permission scoping, workspace-level access control |
| **No agent harness** | Agent Harnesses | Failures are silent; no retry, no recovery | Execution wrapper with retry logic, error reporting, timeout management |
| **No generative UI** | Generative UI | Team can't see agent output without Cursor | MCP Apps for visualization, or Elmer UI |
| **No headless execution** | Headless / CI | Can't schedule agents, no webhook triggers | Event router, cron scheduler, webhook endpoints |
| **No observability** | Observability & Tracing | Can't debug agent behavior, no execution history | Execution logging, trace visualization, cost tracking |
| **No multi-agent workspace** | Multi-Agent Workspaces | No dashboard to see what agents are doing across initiatives | Status dashboard, agent execution monitor |

### Moderate Gaps (Score 3-5)

| Gap | AX Pattern | Impact | What's Needed |
|-----|-----------|--------|--------------|
| **Weak memory** | Memory Patterns | Context is file-based, not queryable; only 1 agent uses Ansor | Expand Ansor usage, add episodic memory, wire more agents |
| **No guardrail enforcement** | Guardrails & Safety | Strategic guardrails are philosophical, not programmatic | Cost caps per agent, permission scoping, output validation |
| **Weak orchestration** | Multi-Agent Orchestration | No persistent orchestrator, no automatic downstream triggering | Orchestrator agent or external coordinator |
| **Limited reflection** | Reflection & Self-Correction | Only validator reflects; other agents don't self-evaluate | Add reflection steps to key agents |
| **Limited evals** | Evaluation & Testing | No systematic agent quality testing | Agent-level evals, trajectory testing |

---

## 4. The Storage & Collaboration Problem

The fundamental problem is that the current system has **two parallel data stores that don't talk well**:

```
PM Workspace (local markdown)          Notion (cloud, collaborative)
├── _meta.json (rich, nested)    ←→    Projects DB (flat properties)
├── research.md                  →     Sometimes pushed as subpages
├── prd.md                       →     Sometimes pushed as subpages
├── signals/                     ✗     Not in Notion
├── jury-evaluations/            ✗     Not in Notion
├── prototype-notes.md           ✗     Not in Notion
└── company-context/             ✗     Not in Notion
```

The sync is painful because these are fundamentally different data models. And neither is accessible to the broader team without Tyler mediating.

### What Other Team Members Need

| Person | What They Need | Current Access |
|--------|---------------|---------------|
| **Rob** (CEO) | Initiative status, roadmap, key decisions | Notion (stale), verbal updates |
| **Ben** (CTO) | Engineering specs, prototype status, technical decisions | Notion (partial), Slack |
| **Adam/Skylar** (Design) | Design briefs, prototypes, visual directions | Slack notifications, Chromatic links |
| **Kenzi** (GTM) | Feature guides, launch plans, customer research | Notion (partial), Slack |
| **Engineering team** | Specs, tickets, prototype references | Linear, Notion (partial) |
| **Tyler** (PM) | Everything | Local workspace + Cursor |

---

## 5. Elmer as the Shared System Layer

### What Elmer Already Has

Elmer is not just a database -- it's a full PM orchestration platform with:

| Capability | Elmer Feature | PM Workspace Equivalent |
|-----------|--------------|------------------------|
| **Project Registry** | `projects` table with stages, status, embeddings | `_meta.json` files |
| **Documents** | `documents` table (research, PRD, design_brief, eng_spec, gtm_brief) | Markdown files in initiative folders |
| **Prototypes** | `prototypes` + `prototypeVersions` tables with Chromatic URLs | `prototype-notes.md` + file paths |
| **Signals** | `signals` + `signalProjects` + `signalPersonas` tables | `signals/` folder + `_index.json` |
| **Memory** | `memoryEntries` table with semantic search (pgvector) | Ansor (partial) |
| **Jury** | `juryEvaluations` table | `jury-evaluations/` folder |
| **Agents** | `agentDefinitions` + `agentExecutions` tables | `.cursor/agents/` files |
| **Skills** | `skills` table | `.cursor/skills/` files |
| **Stage Pipeline** | `stageRecipes` + `stageRuns` + `runLogs` + `artifacts` | `workflow.yaml` + manual commands |
| **Knowledge Base** | `knowledgebaseEntries` + `knowledgeSources` | `company-context/` files |
| **Notifications** | `notifications` + `inboxItems` tables | Slack DMs (manual) |
| **Execution Tracking** | `agentExecutions` + `runLogs` | None (Gap: no observability) |
| **Webhooks** | `webhookKeys` + Slack/Pylon webhook handlers | None (Gap: no headless) |
| **Collaboration** | `workspaceMembers` with roles (admin/member/viewer) | None (Gap: Tyler-only) |
| **UI** | Full Next.js app with Kanban, project detail, knowledge base | None (Gap: no UI) |
| **MCP Server** | `mcp-server/` with tools for all operations | `.cursor/agents/` with MCP references |

### What This Means

**Elmer already solves most of the gaps identified in the AX framework analysis:**

| AX Gap | Elmer Solution |
|--------|---------------|
| No generative UI | Elmer has a full Next.js UI with Kanban, project detail, and knowledge base |
| No multi-agent workspace | `agentDefinitions` + `agentExecutions` tables provide agent monitoring |
| No headless execution | Webhook handlers (Slack, Pylon) + `jobs` system for background work |
| No observability | `runLogs` + `agentExecutions` + `stageRuns` provide execution history |
| No memory (beyond files) | `memoryEntries` with pgvector for semantic search |
| Weak orchestration | `stageRecipes` with graduation rules, `columnConfigs` with automated transitions |
| No collaboration | `workspaceMembers` with role-based access |
| No agent harness | `jobRuns` with status tracking, `pendingQuestions` for HITL |
| No sandboxing | Jobs system provides isolation per execution |

### The Key Question: Should Agents Use Elmer Instead of Local Files?

**Yes, for Tier 1 (shared context) and Tier 2 (initiative metadata).** Here's why:

1. **Elmer's schema is a superset of `_meta.json`.** The `projects` table has stage, status, embeddings, and relations. The `documents` table stores the same artifact types.

2. **Elmer has an MCP server.** Agents can call `get-project-details`, `save-document`, `get-company-context` via MCP instead of reading local files.

3. **Elmer has a UI.** Rob, Ben, and the team can see initiative status, research, and decisions in a browser without needing Cursor.

4. **Elmer has webhooks.** Slack events and Pylon signals can trigger agent work automatically.

5. **Elmer has collaboration.** `workspaceMembers` with admin/member/viewer roles means different people can have different access levels.

**No, for Tier 3 (agent working artifacts).** Prototypes, Storybook components, and detailed signal files should stay local because:
- Prototype code needs to be in the `elephant-ai` repo for Storybook/Chromatic
- Agents work fastest with local file access
- Detailed signals and jury markdown don't need real-time collaboration

---

## 6. MCP Apps for Visualization

[MCP Apps](https://modelcontextprotocol.io/extensions/apps/build) allow agents to serve interactive UIs inline. This could provide:

| Visualization | What It Shows | Who Benefits |
|--------------|--------------|-------------|
| **Initiative Dashboard** | Phase, status, blockers, next actions for all initiatives | Tyler, Rob, team |
| **Agent Execution Monitor** | Which agents ran, what they produced, any failures | Tyler (debugging) |
| **Signal Map** | Ingested signals by source, theme, initiative linkage | Tyler, research |
| **Jury Results Viewer** | Persona votes, pass/fail, themes from jury evaluations | Tyler, design |
| **Roadmap Visualization** | Gantt/Kanban of initiatives by phase and timeline | Rob, Tyler, team |
| **Context Graph** | How company context, signals, hypotheses, and initiatives connect | Tyler, Rob |

### MCP Apps vs Elmer UI

| Approach | Pros | Cons |
|---------|------|------|
| **MCP Apps** | Inline in Claude/Cursor, lightweight, agent-native | Requires MCP host support, limited to tool-call context, no persistent dashboard |
| **Elmer UI** | Full web app, persistent, collaborative, already built | Separate app, needs deployment, sync overhead |
| **Both** | MCP Apps for inline agent interaction + Elmer for persistent dashboard | Two systems to maintain |

**Recommendation:** Use Elmer as the persistent dashboard and source of truth. Use MCP Apps selectively for inline visualizations during agent interactions (e.g., showing a signal map while running `/synthesize`). Elmer's UI already exists and handles the "other people need to see this" problem. MCP Apps handle "I want a rich view while working with the agent."

---

## 7. Recommended Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                         ELMER (Source of Truth)                       │
│  PostgreSQL + pgvector + Next.js UI + MCP Server + Webhook Handlers  │
│                                                                      │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌──────────────────┐   │
│  │ projects │  │documents │  │  signals  │  │  memoryEntries   │   │
│  │ (init.)  │  │ (PRDs,   │  │ (ingested │  │  (decisions,     │   │
│  │          │  │  specs)  │  │  feedback)│  │   evidence)      │   │
│  └──────────┘  └──────────┘  └───────────┘  └──────────────────┘   │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌──────────────────┐   │
│  │  agents  │  │  skills  │  │stageRuns  │  │  notifications   │   │
│  │  (defs)  │  │ (catalog)│  │ (traces)  │  │  (HITL inbox)    │   │
│  └──────────┘  └──────────┘  └───────────┘  └──────────────────┘   │
└───────────┬──────────────────────────────────────────┬───────────────┘
            │ MCP Server (stdio)                       │ REST API + UI
            │                                          │
    ┌───────▼─────────┐                       ┌────────▼────────┐
    │  Cursor Agents  │                       │   Team Members  │
    │  (PM Workspace) │                       │  (Browser UI)   │
    │                 │                       │                 │
    │  20 agents read │                       │  Rob: roadmap   │
    │  and write via  │                       │  Ben: specs     │
    │  Elmer MCP      │                       │  Kenzi: guides  │
    │                 │                       │  Adam: briefs   │
    │  Local files:   │                       │  Eng: tickets   │
    │  - prototypes/  │                       │                 │
    │  - storybook/   │                       └─────────────────┘
    │  - jury detail  │
    └─────────────────┘
            │
    ┌───────▼─────────┐         ┌─────────────────┐
    │  Notion         │         │  Linear          │
    │  (downstream    │◄────────│  (dev tracking)  │
    │   dashboard)    │  push   │                  │
    └─────────────────┘         └─────────────────┘
```

### Data Flow

1. **Agents write to Elmer** via MCP server when they produce artifacts (research, PRDs, jury verdicts, signals, decisions)
2. **Agents read from Elmer** for initiative state, company context, and signal history
3. **Local files** remain for prototype code, Storybook components, and detailed working documents
4. **Elmer publishes to Notion** one-way for team visibility (replaces bidirectional sync)
5. **Webhooks flow into Elmer** from Slack, Pylon, Linear -- Elmer creates jobs that agents pick up
6. **Team members access Elmer UI** for dashboards, knowledge base, and status
7. **MCP Apps** (optional) provide inline visualizations during agent interactions in Cursor

### What Changes for the Agents

| Agent | Current Approach | New Approach |
|-------|-----------------|-------------|
| signals-processor | Writes to `signals/` folder + Ansor | Writes to Elmer `signals` table via MCP |
| research-analyzer | Writes `research.md` locally | Writes to Elmer `documents` table + keeps local copy |
| prd-writer | Writes `prd.md` locally | Writes to Elmer `documents` table + keeps local copy |
| validator | Writes `jury-evaluations/` locally | Writes verdict to Elmer `juryEvaluations` + keeps local detail |
| context-reviewer | Updates local `company-context/` | Updates Elmer `knowledgebaseEntries` + keeps local cache |
| prototype-builder | Local-only (code in elephant-ai) | Registers prototype in Elmer `prototypes` table; code stays local |
| All agents | Read `_meta.json` for initiative state | Read from Elmer `projects` via MCP; local `_meta.json` becomes cache |

### What Changes for Ansor

Ansor's role narrows. Instead of being the shared memory layer, Ansor becomes a lightweight semantic memory supplement:

| Ansor Role | New Role | Reason |
|-----------|---------|--------|
| project_registry | Replaced by Elmer `projects` | Elmer's schema is richer and has UI |
| evidence_item | Replaced by Elmer `memoryEntries` | Elmer has pgvector for semantic search |
| decision_record | Replaced by Elmer `memoryEntries` | Elmer tracks decisions with project context |
| action_item_candidate | Replaced by Elmer `notifications` / `inboxItems` | Elmer has HITL inbox |
| person | Keep or replace | Elmer has `users` + `workspaceMembers` |

---

## 8. Implementation Roadmap

### Phase 1: Wire Elmer MCP Server to PM Workspace (1 week)

**Goal:** Agents can read/write initiative state and documents via Elmer's MCP server.

- Add Elmer MCP server to `.cursor/mcp.json` configuration
- Update `pm-foundation` rule to load company context from Elmer's `get-company-context` tool
- Update agents that read `_meta.json` to read from Elmer's `get-project-details` tool
- Seed Elmer with current initiative data from `pm-workspace-docs/initiatives/`
- Keep local files as write-through cache (update both Elmer + local)

### Phase 2: Migrate Signal Ingestion to Elmer (1 week)

**Goal:** Signals flow into Elmer's database instead of (or in addition to) local files.

- Update `signals-processor` to write signals to Elmer's `signals` table
- Update `context-reviewer` to read signal candidates from Elmer
- Wire Elmer's Slack webhook to receive signals automatically (replaces manual `/ingest slack`)
- Set up Elmer's knowledge base with company context documents

### Phase 3: Enable Team Access (3-5 days)

**Goal:** Other team members can view initiative status, research, and decisions in Elmer.

- Deploy Elmer (or use existing deployment)
- Create workspace and invite team members with appropriate roles
- Import existing documents (research, PRDs, specs) into Elmer
- Set up Notion one-way push from Elmer (replaces bidirectional `/full-sync`)
- Train team on accessing dashboards and knowledge base

### Phase 4: Add Execution Tracking (1 week)

**Goal:** Agent runs are logged and visible, solving the observability gap.

- Update agents to log execution start/end to Elmer's `agentExecutions` table
- Capture tool calls and outputs in `runLogs`
- Build or enable execution history view in Elmer UI
- Add failure notifications to Elmer's `notifications` table

### Phase 5: Add Event-Driven Triggers (1 week)

**Goal:** Agents can be triggered by events, solving the autonomous loops gap.

- Wire Elmer's webhook handlers (Slack, Pylon) to create `inboxItems`
- Build job dispatcher that proposes agent actions from inbox items
- Add scheduled jobs (morning planner at 8am, EOD at 5pm, EOW Friday)
- Add HITL approval flow via Elmer's `notifications` + `pendingQuestions`

### Phase 6: MCP Apps for Inline Visualization (optional, 1 week)

**Goal:** Rich visualizations appear inline during agent interactions.

- Build initiative dashboard MCP App (shows phase/status/blockers)
- Build signal map MCP App (shows signal distribution during `/synthesize`)
- Build jury results viewer MCP App (shows voting breakdown during `/validate`)
- Register these as tools in Elmer's MCP server

---

## Summary Decision

| Question | Answer |
|---------|--------|
| Should you use Ansor or Elmer? | **Elmer.** It already has the full schema, UI, MCP server, webhooks, and collaboration that Ansor would need to be built out to match. |
| Should initiatives live in Notion, Linear, or Elmer? | **Elmer as source of truth.** Notion becomes a downstream dashboard. Linear stays as dev tracking input. |
| Should agents read from Elmer or local files? | **Both.** Elmer for shared state (Tier 1+2). Local files for working artifacts (Tier 3). Write-through to both. |
| Should you build MCP Apps? | **Yes, selectively.** For inline visualizations during agent work. Elmer UI handles the persistent dashboard. |
| What about the team? | **Elmer UI.** Team members access Elmer in a browser. No Cursor needed. Role-based access controls who sees what. |
| What happens to Notion? | **Read-only dashboard.** One-way push from Elmer. No more bidirectional sync pain. |
| What happens to Ansor? | **Phased out** or kept as a lightweight supplement. Elmer's `memoryEntries` with pgvector replaces Ansor's evidence/decision tracking. |
