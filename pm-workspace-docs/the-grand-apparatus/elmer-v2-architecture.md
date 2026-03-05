# Elmer v2: Revised Architecture

> Generated: 2026-03-04
> Status: All 6 decisions resolved. Incorporates Convex, server-side agents, document/task views, signal inbox, pm-workspace migration path.

---

## All Six Decisions — Resolved

| # | Decision | Answer |
|---|----------|--------|
| 1 | Deployment + Backend | **Convex** — backend + real-time + scheduling. See migration path below. |
| 2 | Cursor dependency | **Eliminated** — all agent logic runs server-side. Cursor becomes a dev tool for improving Elmer itself. |
| 3 | Agent execution | **Fully server-side** — Convex Actions run all agents. HITL happens in the Elmer UI, not in chat. |
| 4 | pm-workspace migration | **Gradual** — pm-workspace-docs content migrates into Elmer's persistent memory graph as the canonical source. |
| 5 | Internal tool vs. product | **Both** — build it as a product (multi-workspace, workspace-scoped), use it internally first. |
| 6 | UI architecture | **Pragmatic hybrid** — native React Kanban/project detail + 8 MCP Apps for cross-surface views. |

---

## Decision 1: Convex as the Backend

### What Convex Solves (That Elmer Currently Hacks Around)

| Current Elmer | Convex Replacement | Impact |
|--------------|-------------------|--------|
| SSE polling every 2s for job status | `useQuery` reactive subscriptions | Delete 300+ lines of SSE code, real-time works correctly across instances |
| Two separate worker processes (`npm run worker`, `npm run execution-worker`) | Convex Actions + `scheduler` | No separate processes to deploy or monitor |
| Vercel cron + CRON_SECRET | `crons.ts` with `crons.interval()` | Native scheduling, no external dependency |
| In-memory SSE connection map (breaks on multi-instance) | Eliminated entirely | Multi-instance safe by default |
| Worker heartbeat table + stale detection | Eliminated entirely | Convex manages function lifecycle |
| TanStack Query cache invalidation | Eliminated for server state | `useQuery` is always current |

### What Convex Doesn't Cover (and the Fix)

| Gap | Solution |
|-----|----------|
| **pgvector** — signal clustering, semantic search, `findSimilarSignals` | Keep Neon (or add Pinecone) as a **vector sidecar**. Convex calls a thin Neon API for embedding operations only. Everything else is in Convex. |
| **Complex SQL joins** | Rewrite as multi-step Convex queries with JS filtering. Acceptable for our query volumes. |
| **Auth** — NextAuth DrizzleAdapter | **Clerk** replaces NextAuth. Handles Google OAuth, GitHub OAuth (with token storage for repo access via custom `githubTokens` Convex table), and email/password via Clerk's credentials flow. |
| **10-minute action timeout** | LLM jobs that could run longer are chunked: a Convex action runs one step, writes output to DB, schedules the next step. The job is a state machine, not a monolith. |

### Migration vs. Greenfield

**Greenfield on Convex, with Elmer's existing UI as the starting point.**

Reasoning: Elmer's UI (Kanban, project detail, signals, agents, chat) is genuinely good and 80% complete. Keep all the React components. Replace the entire backend (PostgreSQL → Convex, workers → Convex Actions, SSE → useQuery, NextAuth → Clerk). This takes ~6-8 weeks vs ~9-10 weeks for a migration, and you end up with a cleaner architecture.

**What migrates directly:**
- All React components (no changes needed)
- All API route logic (move to Convex mutations/queries/actions)
- Schema structure (rewrite as Convex table validators)
- Job system logic (worker.ts → Convex Actions + scheduler)

**What gets replaced:**
- PostgreSQL schema → Convex schema + Neon vector sidecar
- Drizzle ORM → Convex query DSL
- NextAuth + DrizzleAdapter → Clerk
- SSE routes → useQuery hooks
- Both worker processes → Convex Actions
- Vercel cron → crons.ts

### Convex Schema (Key Tables)

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  workspaces: defineTable({
    name: v.string(),
    slug: v.string(),
    githubRepo: v.optional(v.string()),
    settings: v.any(), // { contextPaths, automationMode, workerEnabled, ... }
    clerkOrgId: v.optional(v.string()),
  }).index("by_slug", ["slug"]),

  projects: defineTable({
    workspaceId: v.id("workspaces"),
    name: v.string(),
    description: v.optional(v.string()),
    stage: v.string(), // "inbox" | "discovery" | "define" | "build" | "validate" | "launch"
    status: v.string(), // "on_track" | "at_risk" | "blocked" | "stale"
    priority: v.string(), // "P0" | "P1" | "P2" | "P3"
    metadata: v.any(),    // _meta.json equivalent
    isLocked: v.optional(v.boolean()),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_stage", ["workspaceId", "stage"]),

  documents: defineTable({
    workspaceId: v.id("workspaces"),
    projectId: v.id("projects"),
    type: v.string(), // "research" | "prd" | "design_brief" | "engineering_spec" | "gtm_brief" | "prototype_notes" | "metrics" | "jury_report"
    content: v.string(),
    title: v.string(),
    version: v.number(),
    reviewStatus: v.string(), // "draft" | "reviewed" | "approved"
    generatedByAgent: v.optional(v.string()),
    _creationTime: v.number(), // Convex automatic
  })
    .index("by_project", ["projectId"])
    .index("by_type", ["projectId", "type"]),

  jobs: defineTable({
    workspaceId: v.id("workspaces"),
    projectId: v.optional(v.id("projects")),
    type: v.string(), // all 16 + new types
    status: v.string(), // "pending" | "running" | "completed" | "failed" | "waiting_input" | "cancelled"
    input: v.any(),
    output: v.any(),
    progress: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
    attempt: v.number(),
    agentDefinitionId: v.optional(v.id("agentDefinitions")),
    runId: v.optional(v.id("_scheduled_functions")), // Convex scheduler ID
  })
    .index("by_workspace_status", ["workspaceId", "status"])
    .index("by_project", ["projectId"]),

  jobLogs: defineTable({
    jobId: v.id("jobs"),
    workspaceId: v.id("workspaces"),
    level: v.string(),
    message: v.string(),
    stepKey: v.optional(v.string()),
    meta: v.optional(v.any()),
  })
    .index("by_job", ["jobId"]),

  pendingQuestions: defineTable({
    jobId: v.id("jobs"),
    workspaceId: v.id("workspaces"),
    projectId: v.optional(v.id("projects")),
    questionType: v.string(), // "blocking" | "approval" | "choice"
    questionText: v.string(),
    choices: v.optional(v.array(v.string())),
    context: v.optional(v.any()),
    status: v.string(), // "pending" | "answered" | "timed_out"
    response: v.optional(v.any()),
    respondedBy: v.optional(v.string()), // Clerk user ID
    timeoutAt: v.optional(v.number()),
  })
    .index("by_workspace_status", ["workspaceId", "status"])
    .index("by_job", ["jobId"]),

  signals: defineTable({
    workspaceId: v.id("workspaces"),
    verbatim: v.string(),
    interpretation: v.optional(v.string()),
    severity: v.optional(v.string()),
    source: v.string(),
    status: v.string(),
    classification: v.optional(v.any()),
    // embeddingVector stored in Neon, not here
    neonSignalId: v.optional(v.string()), // FK to Neon for vector ops
    inboxItemId: v.optional(v.id("inboxItems")),
    tags: v.optional(v.array(v.string())),
  })
    .index("by_workspace_status", ["workspaceId", "status"]),

  signalProjects: defineTable({
    signalId: v.id("signals"),
    projectId: v.id("projects"),
    confidence: v.optional(v.number()),
    linkedBy: v.optional(v.string()),
  })
    .index("by_signal", ["signalId"])
    .index("by_project", ["projectId"]),

  inboxItems: defineTable({
    workspaceId: v.id("workspaces"),
    type: v.string(), // "transcript" | "document" | "signal" | "feedback"
    source: v.string(),
    title: v.string(),
    rawContent: v.string(),
    processedContent: v.optional(v.string()),
    status: v.string(), // "pending" | "processing" | "assigned" | "dismissed"
    aiSummary: v.optional(v.string()),
    tldr: v.optional(v.string()),             // NEW: concise 1-sentence
    impactScore: v.optional(v.number()),      // NEW: 0-100 priority score
    suggestsVisionUpdate: v.optional(v.boolean()), // NEW
    extractedProblems: v.optional(v.any()),
    hypothesisMatches: v.optional(v.any()),
    projectDirectionChange: v.optional(v.any()), // NEW: structured change proposal
    assignedProjectId: v.optional(v.id("projects")),
  })
    .index("by_workspace_status", ["workspaceId", "status"])
    .index("by_priority", ["workspaceId", "impactScore"]),

  memoryEntries: defineTable({
    workspaceId: v.id("workspaces"),
    projectId: v.optional(v.id("projects")),
    type: v.string(), // "decision" | "feedback" | "context" | "artifact" | "conversation"
    content: v.string(),
    metadata: v.optional(v.any()),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_project", ["projectId"]),

  agentDefinitions: defineTable({
    workspaceId: v.id("workspaces"),
    type: v.string(), // "subagent" | "skill" | "command" | "rule"
    name: v.string(),
    description: v.optional(v.string()),
    triggers: v.optional(v.array(v.string())),
    content: v.string(),
    enabled: v.boolean(),
    phase: v.optional(v.string()),
    executionMode: v.string(), // "server" | "cursor" (cursor is legacy/dev only)
    requiredArtifacts: v.optional(v.array(v.string())),
    producedArtifacts: v.optional(v.array(v.string())),
    metadata: v.optional(v.any()),
  })
    .index("by_workspace_type", ["workspaceId", "type"])
    .index("by_name", ["workspaceId", "name"]),

  agentExecutions: defineTable({
    jobId: v.id("jobs"),
    agentDefinitionId: v.optional(v.id("agentDefinitions")),
    workspaceId: v.id("workspaces"),
    projectId: v.optional(v.id("projects")),
    inputContext: v.optional(v.any()),
    toolCalls: v.optional(v.array(v.any())), // NEW: full tool call trace
    output: v.optional(v.any()),
    tokensUsed: v.optional(v.number()),
    durationMs: v.optional(v.number()),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
  })
    .index("by_job", ["jobId"])
    .index("by_project", ["projectId"]),

  notifications: defineTable({
    workspaceId: v.id("workspaces"),
    userId: v.optional(v.string()), // Clerk user ID
    projectId: v.optional(v.id("projects")),
    jobId: v.optional(v.id("jobs")),
    type: v.string(),
    priority: v.string(),
    status: v.string(),
    title: v.string(),
    message: v.string(),
    actionType: v.optional(v.string()),
    actionData: v.optional(v.any()),
  })
    .index("by_workspace_status", ["workspaceId", "status"])
    .index("by_user", ["userId", "status"]),

  // NEW: Tasks (persistent)
  tasks: defineTable({
    workspaceId: v.id("workspaces"),
    projectId: v.optional(v.id("projects")),
    title: v.string(),
    description: v.optional(v.string()),
    status: v.string(), // "todo" | "in_progress" | "done" | "blocked"
    priority: v.optional(v.string()),
    assignedTo: v.optional(v.string()), // Clerk user ID
    createdBy: v.string(),
    dueDate: v.optional(v.number()),
    linkedJobId: v.optional(v.id("jobs")), // if task was created by an agent
    linkedDocumentId: v.optional(v.id("documents")),
    sourceSignalId: v.optional(v.id("signals")),
    tags: v.optional(v.array(v.string())),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_project", ["projectId"])
    .index("by_assigned", ["assignedTo", "status"]),

  // NEW: Graph nodes/edges (memory graph)
  graphNodes: defineTable({
    workspaceId: v.id("workspaces"),
    entityType: v.string(),
    entityId: v.optional(v.string()),
    name: v.string(),
    domain: v.optional(v.string()),
    accessWeight: v.number(),
    decayRate: v.number(),
    pagerank: v.optional(v.number()),
    communityId: v.optional(v.string()),
    validTo: v.optional(v.number()),
    metadata: v.optional(v.any()),
    neonNodeId: v.optional(v.string()), // FK to Neon for vector ops
  })
    .index("by_workspace_type", ["workspaceId", "entityType"])
    .index("by_entity", ["entityType", "entityId"]),

  graphEdges: defineTable({
    workspaceId: v.id("workspaces"),
    fromNodeId: v.id("graphNodes"),
    toNodeId: v.id("graphNodes"),
    relationType: v.string(),
    weight: v.optional(v.number()),
    confidence: v.optional(v.number()),
    source: v.string(), // "agent" | "human" | "inferred"
  })
    .index("by_from", ["fromNodeId"])
    .index("by_to", ["toNodeId"])
    .index("by_workspace_type", ["workspaceId", "relationType"]),

  knowledgebaseEntries: defineTable({
    workspaceId: v.id("workspaces"),
    type: v.string(), // "company_context" | "strategic_guardrails" | "personas" | "roadmap" | "rules"
    title: v.string(),
    content: v.string(),
    filePath: v.optional(v.string()),
    version: v.number(),
  })
    .index("by_workspace_type", ["workspaceId", "type"]),
});
```

---

## Decision 2 & 3: Fully Server-Side Agents — No Cursor Dependency

### The New Execution Model

Every agent runs as a **Convex Action**. The execution flow:

```
Human (or Orchestrator) triggers agent
  → createJob mutation (status: "pending")
  → scheduleAgentAction mutation
      → ctx.scheduler.runAfter(0, internal.agents.run, { jobId })

Convex Action: internal.agents.run({ jobId })
  → loadContext: query Convex DB for project, documents, company context
  → loadAgentDefinition: get agent.md content from agentDefinitions table
  → buildPrompt: inject context + agent instructions
  → callAnthropic: streaming Claude call with tool definitions
  → for each tool call:
      if save_document → mutation to documents table
      if create_signal → mutation to signals table
      if store_memory → mutation to memoryEntries table
      if ask_question → mutation to pendingQuestions table
                      → pause action (job status: "waiting_input")
                      → UI shows question inline, human answers
                      → resumeJob action triggered by answer mutation
  → on completion:
      mutation: updateJob(status: "completed", output)
      mutation: createAgentExecution(toolCalls, tokensUsed, durationMs)
      mutation: createNotification (if relevant)
      mutation: orchestratorCheckNext (propose next agent)
```

### What "No Cursor" Means in Practice

| Before | After |
|--------|-------|
| Tyler types `/research meeting-summary` in Cursor chat | Tyler clicks "Run research-analyzer" in Elmer project page |
| Agent reads local markdown files | Agent queries Convex DB for context |
| Agent writes to local `pm-workspace-docs/` | Agent writes to Convex documents/signals tables |
| Output visible only to Tyler | Output immediately visible to whole team in real-time |
| HITL happens in Cursor chat | HITL happens in Elmer's notifications/pending questions panel |
| Team never sees what agents do | Team sees live agent execution on project page |

### Human-in-the-Loop in the UI

When an agent hits `ask_question`, Elmer shows it inline:

```
┌────────────────────────────────────────────────────────────────┐
│  prd-writer  ·  Awaiting your input  ·  45s ago                │
│                                                                  │
│  "Is this initiative a net-new feature or an extension of      │
│   the existing Rep Workspace UI?"                               │
│                                                                  │
│  [Net-new feature]  [Extension of existing Rep UI]  [Skip]     │
└────────────────────────────────────────────────────────────────┘
```

Clicking a choice calls a Convex mutation that:
1. Updates `pendingQuestions.status = "answered"`, stores response
2. Updates `jobs.status = "running"`
3. Schedules `internal.agents.resume({ jobId, response })`

The agent resumes exactly where it paused. No polling. `useQuery` on the job makes the UI update in real-time.

### Cursor's New Role

Cursor is for **building Elmer**. When a developer improves an agent definition, writes a new skill, or fixes a bug in the orchestrator, they do that in Cursor. The pm-workspace `.cursor/` files become the source of truth that feeds into Elmer on git push -- Cursor is the editor, Elmer is the deployed system.

---

## Missing Pieces: Document View, Task View, Signal Inbox

### Document View

**What exists:** TipTap rich text editor, markdown preview, document sidebar, version tracking, 9 document types. All working.

**What's missing:**
- No **standalone document page** (documents only appear in project detail tabs)
- No **document-level permalink** for sharing
- No **diff view** between document versions
- No **comment/annotation** system (design brief → designer adds notes)
- No **cross-document search** (search across all PRDs for a term)
- The "Publish to GitHub" button exists but the connection to elephant-ai submodule isn't wired

**What to add:**

```
Route: /projects/[id]/documents/[docId]
- Full-page document view with sidebar showing all project documents
- Left panel: document navigation tree (same as DocumentSidebar)
- Center: DocumentViewer (edit/preview toggle)  
- Right panel (collapsible): Comments, linked signals, linked tasks, version history
- Header: document type, status, agent that generated it, last edited, share link
```

**Document types to add** (beyond the current 9):
- `feature_guide` — customer-facing feature documentation
- `competitive_landscape` — competitive analysis output
- `success_criteria` — metrics and goals
- `gtm_plan` — go-to-market (different from brief)
- `retrospective` — post-launch learnings

### Task View

**What exists:** A stateful React component (`WorkspaceTodolist`) with no backend persistence.

**What to add:**

1. **Persist tasks in Convex** (tasks table above -- new)
2. **Task creation sources:**
   - Manual: human creates task
   - Agent: prd-writer creates "Review PRD with Ben" task
   - Signal: inbox item generates "Investigate Export requests" task
   - Orchestrator: phase-health check generates "Update research -- stale 30 days" task
3. **Task views:**
   - **Project-scoped** (embedded in project detail tab)
   - **My tasks** (`/tasks`) -- all tasks assigned to me across all projects
   - **Team tasks** (`/workspace/[id]/tasks`) -- all tasks with filters
4. **Task-to-agent link:** A task can be "Run this agent" -- clicking it triggers the job
5. **Task-to-document link:** A task can be "Review this document" -- links to doc with comment mode

```
Route: /workspace/[id]/tasks
- Grouped by: project | assigned to | due date | priority
- Filter: status, project, assigned, priority
- Quick add inline
- Each task shows: title, project badge, assignee, due date, source (agent/signal/human)
- Click opens task detail slide-over with full description, comments, linked artifacts
```

### Signal Inbox

**What exists:** InboxPanel (upload + pending/processed lists), AI processing on-demand, signal review table with clustering. All working.

**What's missing:**
- Auto-processing on ingest (currently manual button press)
- **Vision/direction update detection** -- if a signal suggests a project is going the wrong way
- **TL;DR that's machine-generated on arrival**, not on-demand
- **Impact score** for prioritization
- **Inbox view that shows signals AND documents needing review** together

**The Signal Inbox Flow (Enhanced):**

```
Signal arrives (webhook, Slack, upload, Pylon)
  ↓
AUTO (Convex Action triggered on insert):
  1. Generate embedding (Neon)
  2. Classify: find best project match, severity, segment
  3. Generate TL;DR (1 sentence): "Customer X says export is blocking CRM sync"
  4. Score impact (0-100): based on severity × frequency × strategic alignment
  5. Check: does this suggest a CHANGE to existing project direction?
     if yes: extract structured "direction_change" object:
       { projectId, changeType: "scope_expansion"|"pivot"|"deprioritize",
         rationale: "...", confidence: 0.85 }
  6. Set inboxItems.suggestsVisionUpdate = true if relevant
  7. Create notification for Tyler (if high impact or vision update)
  ↓
Human sees in Inbox:
  ┌──────────────────────────────────────────────────────────────┐
  │  Inbox  ·  12 new  ·  3 need review  ·  2 vision signals    │
  │                                                              │
  │  🔴 HIGH IMPACT                                              │
  │  ┌──────────────────────────────────────────────────────────┐│
  │  │ [Transcript] Weekly Customer Review — Acme              ││
  │  │ "Export blocking CRM sync for all enterprise accounts"  ││
  │  │ TL;DR: 4 enterprise customers blocked by missing export ││
  │  │ Match: meeting-summary (87%)  Impact: 94               ││
  │  │ [View] [Link to Project] [Create Task] [Dismiss]        ││
  │  └──────────────────────────────────────────────────────────┘│
  │                                                              │
  │  ⚡ SUGGESTS DIRECTION CHANGE                                │
  │  ┌──────────────────────────────────────────────────────────┐│
  │  │ [Slack] Ben @ #product                                  ││
  │  │ "Eng estimates show export will take 6 weeks, not 2"    ││
  │  │ TL;DR: Timeline estimate is 3x off; may need to repri.. ││
  │  │ Impact: 78  Change type: scope_expansion                ││
  │  │ Affects: meeting-summary PRD section 4.2                ││
  │  │ [Review Impact] [Update PRD] [Dismiss]                  ││
  │  └──────────────────────────────────────────────────────────┘│
  └──────────────────────────────────────────────────────────────┘
```

**Vision Update Detection:**

When a signal has `suggestsVisionUpdate = true`, the agent suggests what to update:

```
"Review Impact" opens:
  
  Signal: "Eng estimates show export will take 6 weeks"
  
  Suggested changes:
  ┌─────────────────────────────────────────────────────────────┐
  │ meeting-summary / PRD                                       │
  │ Section 4.2: Timeline                                       │
  │ Current: "Export feature: 2 weeks"                         │
  │ Suggested: "Export feature: 6 weeks (re-eval scope)"       │
  │ [Accept] [Modify] [Ignore]                                  │
  │                                                             │
  │ meeting-summary / _meta.json                               │
  │ graduation_criteria.build: "Export complete"               │
  │ Suggested: Add blocker: "Scope re-evaluation needed"       │
  │ [Accept] [Modify] [Ignore]                                  │
  └─────────────────────────────────────────────────────────────┘
```

---

## The Project TL;DR / "What We're Building and Why"

Every project and every document needs a machine-generated, always-current TL;DR that:
1. States what we're building (1 sentence)
2. States why (1 sentence tied to strategic pillars)
3. States who it's for (persona)
4. States the current phase and what's blocking it

This surfaces in:
- The Kanban card header
- The top of every project detail page
- As system prompt context for every agent that runs on that project
- In Slack notifications sent to stakeholders
- In MCP tool responses (so agents calling `elmer_get_project` get this immediately)

```typescript
// convex/projects.ts
export const generateProjectTldr = action({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const project = await ctx.runQuery(api.projects.get, { projectId });
    const prd = await ctx.runQuery(api.documents.getByType, { projectId, type: "prd" });
    const research = await ctx.runQuery(api.documents.getByType, { projectId, type: "research" });
    const context = await ctx.runQuery(api.knowledgebase.getCompanyContext);

    const tldr = await callAnthropic(`
      Given this project context, generate a 4-sentence TL;DR:
      1. What we're building (concrete, specific)
      2. Why (tied to: ${context.strategicPillars})
      3. Who it's for (persona name + their problem)
      4. Current status + blocker if any

      Project: ${project.name}
      Phase: ${project.stage}
      Research summary: ${research?.content?.slice(0, 2000)}
      PRD summary: ${prd?.content?.slice(0, 2000)}
    `);

    await ctx.runMutation(api.projects.updateTldr, { projectId, tldr });
  },
});
```

---

## Decision 4: pm-workspace Migration into Elmer

The pm-workspace doesn't disappear -- it becomes the **source of truth that Elmer pulls from**, and then **Elmer becomes the canonical store**. The migration is gradual:

### Phase A: Elmer reads from pm-workspace (sync)
- pm-workspace-docs stays as files
- Elmer syncs everything into its DB on git push
- Agents run in Elmer but context comes from synced content
- pm-workspace is still "the source"

### Phase B: Elmer is the source (write-through)
- When agents produce output, they write to Elmer DB (canonical) and optionally write to pm-workspace files (backwards compat)
- Humans edit documents in Elmer's rich text editor, not local markdown files
- pm-workspace files are generated FROM Elmer, not the other way

### Phase C: pm-workspace files retired
- pm-workspace-docs/ becomes a read-only export/backup
- All editing and agent work happens in Elmer
- Cursor workspace is purely for developing Elmer itself
- pm-workspace `.cursor/` files (agents, skills, commands, rules) continue to exist as the definition layer that gets synced on deploy

---

## Complete Feature Set (Updated)

### UI Pages

| Page | Status | Notes |
|------|--------|-------|
| `/workspace/[id]` — Kanban | Exists, working | Add live agent panel, TL;DR on cards |
| `/projects/[id]` — Project Detail | Exists, 9 tabs working | Add tasks tab, active agents panel, TL;DR header |
| `/projects/[id]/documents/[docId]` — Document Page | Missing | New standalone doc view with comments + linked tasks |
| `/workspace/[id]/agents` — Agent Catalog | Exists, working | Add execution history, trigger button per project |
| `/workspace/[id]/signals` — Signals | Exists, working | Add inbox sort by impact score |
| `/workspace/[id]/inbox` — Signal Inbox | Exists (InboxPanel) | Promote to full page, add auto-processing, direction change UI |
| `/workspace/[id]/tasks` — Task Board | Missing | New page, all tasks across workspace |
| `/workspace/[id]/knowledge` — Knowledge Base | Exists, working | Add graph view, version history |
| `/workspace/[id]/commands` — Command Reference | Exists, working | Add "Run on project" inline |

### Agent Execution Model

| Agent | Execution | HITL Mechanism |
|-------|-----------|---------------|
| signals-processor | Convex Action (auto) | None (fully auto) |
| slack-monitor | Convex Action (scheduled) | None |
| gmail-monitor | Convex Action (scheduled) | None |
| context-reviewer | Convex Action + pendingQuestion | Approve/reject in inbox |
| research-analyzer | Convex Action | AskQuestion in UI |
| prd-writer | Convex Action | AskQuestion in UI |
| prototype-builder | Convex Action (calls elephant-ai via GitHub API) | AskQuestion in UI |
| validator | Convex Action | AskQuestion in UI |
| posthog-analyst | Convex Action | None (API calls) |
| all others | Convex Action | AskQuestion as needed |

Note: prototype-builder now uses `write_repo_files` to commit to elephant-ai via Octokit (GitHub API) -- no local file access required. Storybook builds in elephant-ai CI. Chromatic URL comes back via webhook.

---

## Revised Phase Plan

| Phase | Duration | What Ships |
|-------|----------|-----------|
| **0: Convex Foundation** | 2 weeks | Convex schema, Clerk auth, basic CRUD, real-time useQuery replaces SSE |
| **1: Agent Execution** | 2 weeks | All agents run as Convex Actions, HITL in UI, execution traces |
| **2: Full Sync + Graph** | 2 weeks | pm-workspace sync into Convex, memory graph tables, git webhook |
| **3: Document + Task Views** | 2 weeks | Standalone doc page, tasks table, document types expanded |
| **4: Signal Inbox** | 1-2 weeks | Auto-TL;DR, impact scoring, direction change detection |
| **5: MCP Parity** | 2-3 weeks | 95 MCP tools calling Convex (not REST), 8 MCP Apps |
| **6: Team Access + Observability** | 1-2 weeks | Invite team, agent monitor, execution trace viewer |
| **7: Autonomy** | 2-3 weeks | Orchestrator, scheduled agents, communication agents |
| **Total** | **14-18 weeks** | Full 10/10 AX, Cursor-free operation |
