# Elmer MCP Parity + MCP Apps: Complete Plan

> Generated: 2026-03-04
> Goal: Every capability in the Elmer UI is also accessible via MCP tools, so an agent in Cursor/Claude can do exactly what a human does in the browser. MCP Apps provide dynamic interactive UIs that render inline in compliant hosts.

---

## The Principle: UI = MCP

Every interaction in the Elmer web UI corresponds to exactly one MCP tool call. The UI is a rendering layer on top of MCP, not a separate system. This means:

- An agent in Cursor calling `elmer_ingest_signal` does the same thing as a human pasting text into the Signals page
- An agent calling `elmer_run_agent` does the same thing as clicking "Execute" on the agents page
- The Elmer web UI itself can be rebuilt as MCP App views if needed
- Third-party agents, Claude Projects, external automations -- all use the same MCP tools as the UI

---

## Current Reality: 6% Coverage

The MCP server has 27 registered tools. Only 7 do real work. The other 20 are stubs returning templates.

| Domain | API Endpoints | Working MCP | Gap |
|--------|--------------|-------------|-----|
| Projects | 17 | 1 partial | 94% |
| Signals | 22 | 0 | 100% |
| Agents | 5 | 0 | 100% |
| Jobs | 13 | 30% via SQLite bypass | 70% |
| Knowledge Base | 5 | 0 | 100% |
| Memory | 2 | 0 (code exists, not wired) | 100% |
| Prototypes | 4 | 0 (deploy only, no DB) | 75% |
| Notifications | 4 | 0 | 100% |
| Workspace | 14 | 5% | 95% |
| Pipeline/Skills | 18 | 0 | 100% |
| **Total** | **~120** | **~7** | **~94%** |

---

## The Full MCP Tool Catalog

Every tool Elmer needs. Grouped by domain with priority (P0 = critical path for PM workflow, P1 = important, P2 = nice to have).

### Core Architecture Change

The MCP server needs to be rebuilt to call the orchestrator's **REST API**, not SQLite directly. This gives:
- Same validation, auth, and business logic as the UI
- Access to PostgreSQL (not a stale SQLite mirror)
- Webhook events when things change
- Real-time SSE streams via HTTP

```typescript
// mcp-server/src/client.ts
const ORCHESTRATOR_URL = process.env.ORCHESTRATOR_URL ?? 'http://localhost:3000';

async function callOrchestrator(path: string, method = 'GET', body?: unknown) {
  const res = await fetch(`${ORCHESTRATOR_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-workspace-id': process.env.DEFAULT_WORKSPACE_ID ?? '',
      'x-mcp-token': process.env.MCP_SECRET_TOKEN ?? '', // internal auth
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`Orchestrator error: ${res.status} ${await res.text()}`);
  return res.json();
}
```

---

### Domain: Projects (P0)

| Tool Name | Method | API Route | What It Does |
|-----------|--------|-----------|-------------|
| `elmer_list_projects` | GET | `/api/projects` | List all projects for workspace with stage, status, signal/doc counts |
| `elmer_get_project` | GET | `/api/projects/[id]` | Get full project with documents, signals, prototypes, metadata |
| `elmer_create_project` | POST | `/api/projects` | Create project from name + description + optional signal links |
| `elmer_update_project` | PATCH | `/api/projects/[id]` | Update stage, status, metadata, blockers, next_action |
| `elmer_advance_stage` | PATCH | `/api/projects/[id]` | Advance project to next stage (triggers automation) |
| `elmer_check_graduation` | GET | `/api/projects/[id]/graduation` | Check graduation criteria for current stage |
| `elmer_unlock_project` | POST | `/api/projects/[id]/unlock` | Unlock a stuck/locked project card |
| `elmer_get_project_signals` | GET | `/api/projects/[id]/signals` | List all signals linked to a project |
| `elmer_publish_document` | POST | `/api/projects/[id]/documents/[id]/publish` | Publish document to GitHub |
| `elmer_list_prototypes` | GET | `/api/projects/[id]/prototypes` | List all prototypes (Storybook + variants) for project |
| `elmer_create_prototype` | POST | `/api/projects/[id]/prototypes` | Register a prototype with Chromatic URL, branch, path |
| `elmer_update_prototype` | PATCH | `/api/projects/[id]/prototypes/[id]` | Update prototype status, URL, variant platform |
| `elmer_delete_project` | DELETE | `/api/projects/[id]` | Archive a project |

---

### Domain: Signals (P0)

| Tool Name | Method | API Route | What It Does |
|-----------|--------|-----------|-------------|
| `elmer_ingest_signal` | POST | `/api/signals/ingest` | Ingest raw text/transcript as signal (auto-classifies, embeds, links) |
| `elmer_list_signals` | GET | `/api/signals` | List signals with filters (status, source, search, date range, project) |
| `elmer_get_signal` | GET | `/api/signals/[id]` | Get full signal with classification, links, personas |
| `elmer_link_signal` | POST | `/api/signals/[id]/projects` | Link signal to a project |
| `elmer_unlink_signal` | DELETE | `/api/signals/[id]/projects` | Unlink signal from project |
| `elmer_classify_signal` | POST | `/api/signals/[id]/classify` | Re-classify signal against all projects using embeddings |
| `elmer_find_similar_signals` | GET | `/api/signals/[id]/similar` | Find semantically similar signals |
| `elmer_synthesize_signals` | POST | `/api/signals/synthesize` | Cluster unlinked signals into themes, suggest new projects |
| `elmer_find_orphan_signals` | GET | `/api/signals/orphans` | Find signals not linked to any project |
| `elmer_find_duplicate_signals` | GET | `/api/signals/duplicates` | Find potential duplicate signal pairs |
| `elmer_merge_signals` | POST | `/api/signals/merge` | Merge duplicate signals |
| `elmer_bulk_link_signals` | POST | `/api/signals/bulk` | Bulk link up to 50 signals to a project |
| `elmer_update_signal` | PATCH | `/api/signals/[id]` | Update signal severity, status, segment, interpretation |
| `elmer_archive_signals` | POST | `/api/signals/archive` | Archive stale signals |

---

### Domain: Agents (P0)

| Tool Name | Method | API Route | What It Does |
|-----------|--------|-----------|-------------|
| `elmer_list_agents` | GET | `/api/agents` | List all agent definitions (by type: subagent, skill, command, rule) |
| `elmer_get_agent` | GET | `/api/agents/[id]` | Get agent definition with full content and metadata |
| `elmer_run_agent` | POST | `/api/agents/execute` | Execute an agent definition on a project (creates job, returns job_id) |
| `elmer_sync_agents` | POST | `/api/agents/sync` | Sync agent architecture from GitHub (reads .cursor/agents/, skills/, commands/, rules/) |
| `elmer_get_agent_executions` | GET | `/api/agents/[id]/executions` | Get execution history for an agent |

---

### Domain: Jobs (P0)

| Tool Name | Method | API Route | What It Does |
|-----------|--------|-----------|-------------|
| `elmer_list_jobs` | GET | `/api/jobs` | List jobs (filter by status, project, type) |
| `elmer_get_job` | GET | `/api/jobs/[id]` | Get job status, output, error, pending questions |
| `elmer_create_job` | POST | `/api/jobs` | Create a job of any type (generate_prd, run_jury, build_prototype, etc.) |
| `elmer_cancel_job` | POST | `/api/jobs/[id]` | Cancel a running or pending job |
| `elmer_retry_job` | POST | `/api/jobs/[id]` | Retry a failed job |
| `elmer_respond_to_question` | POST | `/api/jobs/[id]/questions/[qid]/respond` | Answer a pending question to unblock a job |
| `elmer_skip_question` | POST | `/api/jobs/[id]/questions/[qid]/skip` | Skip a question and use its default response |
| `elmer_get_job_logs` | GET | `/api/jobs/[id]/logs` | Get execution logs for a job (paginated) |
| `elmer_get_pending_questions` | GET | `/api/workspaces/[id]/pending-questions` | List all pending questions across workspace needing response |

---

### Domain: Knowledge Base (P0)

| Tool Name | Method | API Route | What It Does |
|-----------|--------|-----------|-------------|
| `elmer_get_context` | GET | `/api/knowledgebase/[type]` | Read company context (product_vision, personas, guardrails, roadmap, rules) |
| `elmer_update_context` | PUT | `/api/knowledgebase/[type]` | Write/update company context |
| `elmer_list_context` | GET | `/api/knowledgebase` | List all knowledge base entries |
| `elmer_search` | GET | `/api/search` | Full-text search across documents and memory entries |
| `elmer_sync_knowledge` | POST | `/api/workspaces/[id]/syncKnowledge` | Sync knowledge base from GitHub (reads company-context/ files) |

---

### Domain: Memory (P0)

| Tool Name | Method | API Route | What It Does |
|-----------|--------|-----------|-------------|
| `elmer_store_memory` | POST | `/api/memory` | Store a memory entry (decision, feedback, context, artifact, conversation) |
| `elmer_query_memory` | GET | `/api/memory` | Query memory entries (by type, project, text search, embedding similarity) |
| `elmer_get_project_memory` | GET | `/api/memory?projectId=[id]` | Get all memory entries for a project |

---

### Domain: Notifications (P1)

| Tool Name | Method | API Route | What It Does |
|-----------|--------|-----------|-------------|
| `elmer_list_notifications` | GET | `/api/notifications` | List notifications (unread, by priority, by type) |
| `elmer_mark_notification_read` | PATCH | `/api/notifications/[id]` | Mark notification as read/actioned/dismissed |
| `elmer_create_notification` | POST | `/api/notifications` | Create a notification (for external agent to surface information) |
| `elmer_mark_all_read` | PATCH | `/api/notifications` | Mark all notifications read |

---

### Domain: Pipeline (P1)

| Tool Name | Method | API Route | What It Does |
|-----------|--------|-----------|-------------|
| `elmer_list_stage_recipes` | GET | `/api/stage-recipes` | List automation recipes for each stage |
| `elmer_get_stage_recipe` | GET | `/api/stage-recipes/[stage]` | Get recipe config for a stage |
| `elmer_update_stage_recipe` | PATCH | `/api/stage-recipes/[stage]` | Update automation level, steps, gates for a stage |
| `elmer_list_columns` | GET | `/api/columns` | List Kanban column configs |
| `elmer_update_column` | PATCH | `/api/columns/[id]` | Update column automation rules and graduation criteria |

---

### Domain: Graph (P1 — new, not yet built)

| Tool Name | API Route (new) | What It Does |
|-----------|----------------|-------------|
| `elmer_graph_add_node` | POST `/api/graph/nodes` | Create a graph node for any entity |
| `elmer_graph_add_edge` | POST `/api/graph/edges` | Create a typed relationship between nodes |
| `elmer_graph_add_observation` | POST `/api/graph/observations` | Add an observation at a given depth |
| `elmer_graph_search` | POST `/api/graph/search` | Hybrid FTS + vector search across graph |
| `elmer_graph_traverse` | POST `/api/graph/traverse` | BFS traversal from a node |
| `elmer_graph_get_context` | GET `/api/graph/context/[projectId]` | Get full project context from graph |
| `elmer_graph_analyze` | POST `/api/graph/analyze` | Run PageRank, betweenness, communities |

---

### Domain: Workspace (P1)

| Tool Name | Method | API Route | What It Does |
|-----------|--------|-----------|-------------|
| `elmer_get_workspace` | GET | `/api/workspaces/[id]` | Get workspace settings, GitHub config, context paths |
| `elmer_update_workspace` | PATCH | `/api/workspaces/[id]` | Update workspace settings |
| `elmer_list_members` | GET | `/api/workspaces/[id]/members` | List workspace members and roles |
| `elmer_list_integrations` | GET | `/api/workspaces/[id]/integrations` | List connected integrations (GitHub, Linear, Slack, etc.) |
| `elmer_check_integration_status` | GET | `/api/workspaces/[id]/integrations/status` | Check health of all integrations |

---

### Domain: Discovery (P2)

| Tool Name | Method | API Route | What It Does |
|-----------|--------|-----------|-------------|
| `elmer_discover_repo` | GET | `/api/discovery` | Scan connected GitHub repo for initiatives, agents, context |
| `elmer_import_discovery` | POST | `/api/discovery/import` | Import discovered initiatives as projects |

---

## Total: 72 MCP Tools

| Priority | Tools | Coverage |
|----------|-------|---------|
| P0 (critical path) | 46 | Projects, Signals, Agents, Jobs, KB, Memory |
| P1 (important) | 20 | Notifications, Pipeline, Graph, Workspace |
| P2 (nice to have) | 6 | Discovery, advanced workspace ops |
| **Total** | **72** | **~95% of UI surface** |

---

## MCP Apps: Interactive Views

MCP Apps (`@modelcontextprotocol/ext-apps`) let tool responses render as interactive UIs inline in compliant hosts. The `content` text array always serves as fallback for non-compliant hosts (including current Cursor).

### Install

```bash
cd mcp-server
npm install @modelcontextprotocol/ext-apps
npm install -D vite vite-plugin-singlefile @vitejs/plugin-react
npm install react react-dom @tanstack/react-query
```

### Five Priority MCP Apps

These five cover the most critical PM workflow interactions:

---

#### App 1: Initiative Dashboard

**Tool:** `elmer_get_project` — when called, renders an interactive project dashboard.

```
┌────────────────────────────────────────────────────────────┐
│  Meeting Summary AI Feed                     Build  ●━━━◉  │
│  Owner: Tyler  ·  P1  ·  Updated 2h ago                   │
│                                                            │
│  ┌─────────┐ ┌──────────┐ ┌────────┐ ┌─────────────────┐ │
│  │Research │ │   PRD    │ │ Proto  │ │   Jury Results  │ │
│  │   ✓     │ │    ✓     │ │  v2 ✓  │ │  84% pass ✓    │ │
│  └─────────┘ └──────────┘ └────────┘ └─────────────────┘ │
│                                                            │
│  Next: Feature Guide  [Run Now] [Schedule] [Skip]         │
│                                                            │
│  Recent Signals (4)                              [View ▾] │
│  · "Export needed for handoffs" — high severity           │
│  · "Weekly digest would be helpful" — medium              │
│  · "Summary layout needs more context" — high             │
│                                                            │
│  Memory  ·  Artifacts  ·  Team  ·  History               │
└────────────────────────────────────────────────────────────┘
```

The UI calls `elmer_run_agent`, `elmer_advance_stage`, `elmer_list_signals` via `app.callServerTool()` when the user clicks buttons. No page reload. No browser needed.

---

#### App 2: Signal Map

**Tool:** `elmer_synthesize_signals` — renders a visual cluster map of all unlinked signals.

```
┌────────────────────────────────────────────────────────────┐
│  Signal Map  ·  47 signals  ·  12 unlinked                │
│                                                            │
│     ● Export (8)          ● Digest format (5)              │
│   ●   ●   ●             ●   ●   ●   ●   ●                 │
│     ●   ●                  ●   ●                          │
│                   ● Meeting context (11)                  │
│             ●   ●   ●   ●   ●   ●   ●   ●   ●   ●   ●    │
│                                                            │
│  Cluster: "Export" (8 signals)          [Create Project]  │
│  · "Need to export to Salesforce"                         │
│  · "PDF download for weekly review"                       │
│  · "Slack integration for sharing"                        │
│                                                 [Link All] │
└────────────────────────────────────────────────────────────┘
```

Clicking a cluster calls `elmer_bulk_link_signals`. Clicking "Create Project" calls `elmer_create_project`. The full map is interactive -- drag, zoom, select.

---

#### App 3: Agent Execution Monitor

**Tool:** `elmer_list_agents` — renders a live view of all agents, their queue, and recent executions.

```
┌────────────────────────────────────────────────────────────┐
│  Agents  ·  3 running  ·  2 queued  ·  1 awaiting input   │
│                                                            │
│  ⚡ research-analyzer  ·  Meeting Summary  ·  Running 45s  │
│     Step 4/7: Extracting user quotes...                    │
│     [View Logs]                                            │
│                                                            │
│  ⏸ prd-writer  ·  Rep Workspace  ·  Awaiting input        │
│     "Is this a net new feature or extending existing UI?"  │
│     [Product extension of existing Rep UI] [New feature]  │
│                                                            │
│  ● validator  ·  Engagement Tracking  ·  Queued            │
│                                                            │
│  Recent Completions                                        │
│  ✓ signals-processor  ·  3 signals ingested  ·  2m ago    │
│  ✓ posthog-analyst  ·  Dashboard created  ·  12m ago      │
│                                           [Run Agent ▾]   │
└────────────────────────────────────────────────────────────┘
```

The "Awaiting input" card calls `elmer_respond_to_question` when a choice is clicked. The "View Logs" expands inline SSE log stream. "Run Agent" opens a project + agent picker.

---

#### App 4: Jury Evaluation Viewer

**Tool:** `elmer_get_project` with `?include=jury` — renders jury results interactively.

```
┌────────────────────────────────────────────────────────────┐
│  Jury Results  ·  Meeting Summary v2  ·  Prototype         │
│                                                            │
│  Overall: 84%  ✓ PASS                                      │
│  ████████████████████░░░░  100 personas                   │
│                                                            │
│  By Segment:                                               │
│  Sales Rep    ████████████████████  91% (40 personas)     │
│  Team Leader  █████████████████░░░  84% (25 personas)     │
│  CSM          ██████████████░░░░░░  78% (20 personas)     │
│  RevOps       █████████████░░░░░░░  72% (15 personas)     │
│                                                            │
│  Themes:                                                   │
│  ✓ Clear value prop for reps                              │
│  ✓ Logical flow from summary to action                    │
│  ✗ Export functionality expected but missing (17 votes)   │
│  ✗ Mobile layout not considered (9 votes)                 │
│                                                            │
│  [Iterate on Feedback]  [Advance to Launch]  [Re-run]     │
└────────────────────────────────────────────────────────────┘
```

"Iterate on Feedback" calls `elmer_run_agent` with `iterator`. "Advance to Launch" calls `elmer_advance_stage`.

---

#### App 5: Memory & Context Graph

**Tool:** `elmer_graph_get_context` — renders the knowledge graph for a project.

```
┌────────────────────────────────────────────────────────────┐
│  Context Graph  ·  Meeting Summary  ·  38 nodes, 54 edges  │
│                                                            │
│                    [PRD]─────[research]                   │
│                   /    \        |                         │
│            [prototype]  [metrics]  [signal×4]             │
│           /     \                                          │
│      [jury]  [visual-dir]    [company-context]            │
│                                  |                        │
│                              [personas]                   │
│                                                            │
│  Selected: research (node)                                │
│  Created by research-analyzer · Mar 2 · access_weight 3.4 │
│  Observations: L0 (summary), L1 (key points)             │
│  Edges: derived_from → 3 signals, depends_on ← prd       │
│                                                            │
│  Community: Revenue Intelligence (7 projects)             │
│  PageRank: 0.82 (top 5%)   Betweenness: 0.34             │
│                                                            │
│  [Deepen]  [Add Observation]  [View L0 Summary]           │
└────────────────────────────────────────────────────────────┘
```

Nodes are clickable to drill in. "Deepen" calls `elmer_graph_add_observation`. Edges can be created by dragging. The graph updates in real-time as agents write to it.

---

## Implementation Architecture

### MCP Server Restructure

```
mcp-server/
├── src/
│   index.ts              # Tool registration + resource registration
│   client.ts             # Orchestrator REST API client
│   tools/
│     projects.ts         # elmer_list_projects, elmer_get_project, etc.
│     signals.ts          # elmer_ingest_signal, elmer_list_signals, etc.
│     agents.ts           # elmer_list_agents, elmer_run_agent, etc.
│     jobs.ts             # elmer_list_jobs, elmer_respond_to_question, etc.
│     knowledge.ts        # elmer_get_context, elmer_update_context, etc.
│     memory.ts           # elmer_store_memory, elmer_query_memory, etc.
│     notifications.ts    # elmer_list_notifications, etc.
│     pipeline.ts         # elmer_list_stage_recipes, etc.
│     graph.ts            # elmer_graph_add_node, elmer_graph_traverse, etc.
│     workspace.ts        # elmer_get_workspace, elmer_list_members, etc.
│   apps/
│     initiative-dashboard/
│       mcp-app.html      # (built artifact)
│       src/
│         App.tsx
│         components/
│     signal-map/
│       mcp-app.html
│       src/
│     agent-monitor/
│       mcp-app.html
│       src/
│     jury-viewer/
│       mcp-app.html
│       src/
│     context-graph/
│       mcp-app.html
│       src/
├── vite.config.ts        # Builds each app/* to dist/
└── package.json
```

### Tool Registration Pattern

Every tool follows this pattern -- text-first for graceful degradation, App UI as enhancement:

```typescript
// tools/projects.ts
import { registerAppTool } from "@modelcontextprotocol/ext-apps/server";
import { callOrchestrator } from "../client";

const DASHBOARD_URI = "ui://elmer/initiative-dashboard";

export function registerProjectTools(server: McpServer) {
  
  registerAppTool(
    server,
    "elmer_get_project",
    {
      title: "Get Project",
      description: "Get full project details with documents, signals, and prototype status",
      inputSchema: { projectId: z.string().describe("The project ID") },
      _meta: { ui: { resourceUri: DASHBOARD_URI } },  // ← Links to App UI
    },
    async ({ projectId }) => {
      const project = await callOrchestrator(`/api/projects/${projectId}`);
      
      // Always include text content (works in Cursor + any host)
      const text = formatProjectAsMarkdown(project);
      
      // structuredContent feeds the App UI
      return {
        content: [{ type: "text", text }],
        structuredContent: { project, type: "initiative_dashboard" },
      };
    }
  );
}
```

### App UI Pattern (React)

```tsx
// apps/initiative-dashboard/src/App.tsx
import { useApp, useHostStyles } from "@modelcontextprotocol/ext-apps/react";

export function App() {
  const { app } = useApp({ appInfo: { name: "Initiative Dashboard", version: "1.0.0" } });
  useHostStyles(); // auto-applies host theme tokens
  const [project, setProject] = useState(null);
  
  useEffect(() => {
    if (!app) return;
    app.ontoolresult = (result) => {
      if (result.structuredContent?.type === "initiative_dashboard") {
        setProject(result.structuredContent.project);
      }
    };
  }, [app]);
  
  async function runNextAgent() {
    const result = await app.callServerTool({
      name: "elmer_run_agent",
      arguments: { projectId: project.id, agentId: nextAgent.id }
    });
    // Update UI with new job status
  }
  
  if (!project) return <LoadingState />;
  return <InitiativeDashboard project={project} onRunAgent={runNextAgent} />;
}
```

---

## Fallback Strategy

Current Cursor does not yet support MCP Apps rendering. The strategy:

| Host | MCP Apps Support | What They Get |
|------|-----------------|--------------|
| Claude Desktop | ✅ Full | Interactive UI rendered inline |
| Claude.ai (web) | ✅ Full | Interactive UI rendered inline |
| Cursor | ⏳ Not yet | Text markdown output (always included as `content`) |
| API / direct | N/A | Structured JSON (via `structuredContent`) |

The `content: [{ type: "text", text: markdownOutput }]` is always present. In Cursor today, agents get well-formatted markdown. When Cursor adds MCP Apps support, the same tool automatically upgrades to interactive UI -- no code change needed.

---

## Migration Phases

### Phase 1: MCP Parity for P0 (2 weeks)

1. Rebuild MCP server to call orchestrator REST API (not SQLite)
2. Implement 46 P0 tools: Projects, Signals, Agents, Jobs, Knowledge Base, Memory
3. Wire memory module (already implemented, just needs to be registered)
4. Add internal auth token for MCP-to-orchestrator calls
5. Test parity: every tool call should produce same result as equivalent UI action

**Outcome:** Agents in Cursor can do everything a human can do in Elmer's UI.

### Phase 2: MCP Apps for 5 Priority Views (2-3 weeks)

1. Install `@modelcontextprotocol/ext-apps` in mcp-server
2. Set up Vite build pipeline for App bundles
3. Build Initiative Dashboard (App 1) -- highest value
4. Build Agent Execution Monitor (App 3) -- most interactive
5. Build Signal Map (App 2)
6. Keep text fallback working perfectly

**Outcome:** When used in Claude Desktop/web, rich interactive UIs replace text dumps.

### Phase 3: P1 Tools + Jury/Graph Apps (2 weeks)

1. Implement 20 P1 tools: Notifications, Pipeline, Graph, Workspace
2. Build Jury Evaluation Viewer (App 4)
3. Build Context Graph (App 5)
4. Add graph API routes to orchestrator

**Outcome:** Full 95% UI parity via MCP.

### Phase 4: Real-time + Streaming (1-2 weeks)

1. Add SSE streaming for job logs via MCP: tool returns stream as `content` chunks
2. Add polling tools for live agent status (App-only tools invisible to LLM)
3. Context updates via `app.updateModelContext()` when agent run completes

**Outcome:** Agent monitoring is real-time, not just snapshots.

---

## What Changes for the PM Workspace Agents

Once MCP parity exists, PM workspace agents switch from reading local files to calling Elmer tools:

```markdown
# OLD: agents read local files
Read: pm-workspace-docs/company-context/product-vision.md
Read: pm-workspace-docs/initiatives/active/meeting-summary/_meta.json

# NEW: agents call Elmer MCP
elmer_get_context(type: "product_vision")
elmer_get_project(projectId: "meeting-summary")
```

And agents write to Elmer instead of (or in addition to) local files:

```markdown
# OLD: agents write local files
Write: pm-workspace-docs/initiatives/active/meeting-summary/research.md

# NEW: agents call Elmer MCP + keep local copy
elmer_save_document(projectId: "...", type: "research", content: "...")
```

The result: everything agents do is visible in Elmer's UI, tracked in the memory graph, and accessible to the team -- without any change to how the agent logic itself works.
