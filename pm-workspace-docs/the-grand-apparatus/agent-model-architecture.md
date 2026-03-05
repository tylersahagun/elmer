# Agent Model Architecture: Cursor vs. Server — Decision Guide

> Generated: 2026-03-04
> Question: Where should model selection and LLM calling live? Keep in Cursor or move to the server?

---

## What's Actually Happening in Each System Today

### In the pm-workspace `.cursor/` agents

Model selection is **declarative YAML in frontmatter**. That's the entire mechanism:

```yaml
---
model: haiku          # slack-monitor, gmail-monitor, hypothesis-manager, figjam-generator
model: sonnet         # signals-processor, research-analyzer, workspace-admin, linear-triage
model: inherit        # prototype-builder, validator, iterator, metrics-strategist
---
```

There is no model config file, no temperature, no max_tokens, no few-shot examples, no system prompt blocks. Cursor reads `model:` and routes to the corresponding API. `inherit` means "use whatever model is active in this Cursor session." The three values (`haiku`, `sonnet`, `inherit`) are the only knobs available.

**What Cursor provides beyond the model field:**
- 30+ built-in tools (Shell, Read/Write files, browser, semantic search, grep, MCP calls)
- Direct filesystem access — agents read local markdown files, write local markdown files
- True token streaming to the chat UI
- Per-subagent isolated context windows (each subagent gets a fresh context)
- Session memory (`memory: project` accumulates context across sessions)
- MCP server connections (composio, linear, posthog, figma, ansor, etc.)

### In Elmer's server-side executor

Model selection is **a single hardcoded constant**:

```typescript
const MODEL = "claude-sonnet-4-20250514";  // every job, every agent, no exceptions
```

Same model for signal extraction (cheap, fast, structured JSON) and PRD generation (expensive, complex reasoning). No routing, no differentiation. The OpenAI client (`text-embedding-3-small`) is separate and used only for vector embeddings.

**What Elmer provides beyond the model call:**
- Prompt caching via `cache_control: { type: "ephemeral" }` on system prompts (4-min TTL)
- Job-type-specific system prompts (15 persona/output templates)
- Company context injected from DB knowledgebase (with file fallback)
- 11 custom tools (save_document, write_repo_files, save_jury_evaluation, ask_question, etc.)
- Cost tracking per execution (cache hit/miss tokens stored in `agentExecutions`)
- Multi-tenant security (tools gated by workspace settings, project-ID verified)
- Async persistence (results outlive the HTTP request)

---

## The Honest Comparison

| Capability | Cursor Agents | Elmer Server Agent | Winner |
|-----------|---------------|-------------------|--------|
| **Model routing** | haiku / sonnet / inherit per agent | Single hardcoded model | Cursor |
| **Tool breadth** | Shell, files, browser, grep, all MCPs | 11 custom DB tools only | Cursor (massive advantage) |
| **Streaming** | True token streaming | No streaming (fake progress events) | Cursor |
| **File access** | Direct filesystem R/W | GitHub API commit only | Cursor |
| **Context freshness** | Reads local files at time of call | DB knowledgebase (4-min cache) | Tie |
| **Multi-tenancy** | Single user (Tyler) | Workspace-scoped, team access | Elmer |
| **Job persistence** | Gone when chat closes | Async, survives connection loss | Elmer |
| **Cost tracking** | Not exposed | Stored per execution | Elmer |
| **Team visibility** | Nobody else sees it | Everyone in workspace sees it | Elmer |
| **Scheduling** | Manual slash command | Cron, webhooks, orchestrator | Elmer |
| **HITL** | Inline chat (requires Tyler at keyboard) | Persisted UI (answer when available) | Elmer |
| **Prompt caching** | Cursor handles internally | Explicit, measurable | Tie |

---

## The Core Architectural Decision

The question isn't "Cursor or server" -- it's **what is each one actually good at**:

- **Cursor is a powerful interactive execution environment** with direct system access, broad tooling, and streaming. It's great for things that need to read/write files, explore codebases, or run shell commands.
- **Elmer server is a reliable async job system** with persistence, team visibility, scheduling, and workspace security. It's great for things that need to run unattended, survive connection loss, or be visible to multiple people.

The work you described -- running research, generating PRDs, analyzing signals, validating prototypes -- **doesn't actually need filesystem access**. It needs:
1. Context from the DB (project docs, company context, signals)
2. The ability to write outputs to the DB (research.md, prd.md, jury results)
3. External API calls (Slack, Linear, PostHog, Figma)
4. Human input at decision points
5. Visibility for the team

All of these are DB operations and API calls. None require the local filesystem.

**The one exception: prototype-builder.** It currently writes Storybook components into the elephant-ai codebase. But as established in the v2 architecture, this shifts to writing via the GitHub API (Octokit) -- a DB/API operation, not a filesystem operation.

---

## What the Model Architecture Should Look Like on the Server

If Elmer runs all agents server-side, here's how model management should work -- drawing from what the `.cursor/` agents already define correctly:

### Model Routing Table (stored in DB)

Instead of a single hardcoded model, the server reads `executionProfile` from each agent definition:

```typescript
// In agentDefinitions table (Convex)
type ExecutionProfile = {
  model: "claude-3-haiku-20240307"       // fast: triage, classification, simple writes
       | "claude-sonnet-4-20250514"      // balanced: research, synthesis, analysis
       | "claude-opus-4-5"               // full: complex multi-step, code generation
       | "claude-sonnet-4-5";            // latest: when quality matters most

  maxTokens: number;                      // 1024 for haiku triage, 8192 for PRD gen
  temperature: number;                    // 0.2 for structured output, 0.7 for creative
  promptCaching: boolean;                 // always true for long context
  maxToolIterations: number;              // 5 for simple, 20 for complex
  streamingEnabled: boolean;             // true for user-facing, false for background
  fallbackModel?: string;                 // if primary fails or too expensive
};
```

### Agent-to-Model Mapping (mirrors `.cursor/` frontmatter logic)

| Agent | Primary Model | Reasoning |
|-------|--------------|-----------|
| slack-monitor | `claude-3-haiku-20240307` | Fast scan, triage classification, cheap |
| gmail-monitor | `claude-3-haiku-20240307` | Same as slack-monitor |
| hypothesis-manager | `claude-3-haiku-20240307` | CRUD lifecycle, structured JSON out |
| figjam-generator | `claude-3-haiku-20240307` | Simple Mermaid generation |
| hubspot-activity | `claude-3-haiku-20240307` | Data extraction, structured output |
| signals-processor | `claude-sonnet-4-20250514` | Pattern detection, multi-source synthesis |
| research-analyzer | `claude-sonnet-4-20250514` | Strategic alignment, transcript analysis |
| workspace-admin | `claude-sonnet-4-20250514` | Moderate complexity, audit/repair |
| linear-triage | `claude-sonnet-4-20250514` | Classification + action planning |
| notion-admin | `claude-sonnet-4-20250514` | API orchestration |
| posthog-analyst | `claude-sonnet-4-20250514` | Data analysis, metric definition |
| context-reviewer | `claude-sonnet-4-20250514` | Context quality judgment |
| metrics-strategist | `claude-sonnet-4-5` | Deep analytical framework |
| prd-writer | `claude-sonnet-4-5` | Long-form, structured, high quality |
| design-companion | `claude-sonnet-4-5` | Nuanced judgment |
| prototype-builder | `claude-sonnet-4-5` | Complex code generation |
| validator | `claude-sonnet-4-5` | Condorcet jury simulation |
| iterator | `claude-sonnet-4-5` | Code modification with context |

### Where Model Config Lives

```
.cursor/agents/research-analyzer.md
  model: sonnet          ← THIS IS THE SOURCE OF TRUTH
  
  ↓ synced to Elmer on git push
  
Elmer agentDefinitions table
  executionProfile: {
    model: "claude-sonnet-4-20250514",
    maxTokens: 8192,
    temperature: 0.2,
    promptCaching: true,
    maxToolIterations: 15,
    streamingEnabled: false,
  }
  
  ↓ read by Convex Action at execution time
  
Convex Action: agents.run
  const profile = agent.metadata.executionProfile;
  const response = await anthropic.messages.create({
    model: profile.model,
    max_tokens: profile.maxTokens,
    ...
  });
```

The `.cursor/` frontmatter remains the readable definition. The Convex DB stores the resolved, fully-specified version. This means:
- Changing a model is a one-line edit to the agent markdown, pushed to git, synced to Elmer
- No server redeploy needed to change model routing
- The model selection intent is documented in the same file as the agent's purpose
- Elmer can display which model each agent uses in the agent catalog

---

## What the Server Can Do That Cursor Can't

This is the real argument for pushing to server. Several things are genuinely better server-side:

### 1. Multi-Model Parallel Execution

The validator agent runs a 100-persona Condorcet jury. In Cursor, this is sequential (one LLM call at a time). On the server:

```typescript
// Convex Action: run all 100 personas in parallel batches of 10
const batches = chunk(personas, 10);
const results = await Promise.all(
  batches.map(batch => runJuryBatch(batch, prototype, prd))
);
```

A validation that takes 15 minutes in Cursor could take 90 seconds on the server with parallel calls.

### 2. Cost Control Without Manual Tracking

Every token counts. On the server, every agent execution records token usage + cost estimate. The orchestrator can decide: "this workspace has used $50 this week -- downgrade non-critical jobs to haiku." Tyler gets a cost dashboard. No more "I wonder how much that 3-hour Cursor session cost."

### 3. Streaming Responses to the UI (not chat)

With Convex's reactive updates, you can stream agent output token-by-token to any client subscribed to that job -- the browser, the team, the MCP App. The research-analyzer can stream the TL;DR as it generates it. The prd-writer can show each section as it completes. This is actually better than Cursor's streaming because it's multi-client: Tyler AND Ben can watch the PRD generate in real-time.

### 4. Tool Calls That Need Persistence

When the prototype-builder calls the GitHub API to write a component file, that's an action that needs to be retried if it fails, logged for audit, and confirmed as succeeded. On the server, a Convex mutation handles idempotency. In Cursor, if the chat closes mid-execution, you don't know if the commit happened.

---

## What Cursor Still Does Better

There are genuinely two cases where Cursor is the right tool:

### Case 1: Improving Elmer Itself

When you add a new agent, fix a skill, or extend Elmer's features -- that's software development. Cursor's filesystem access, code search, and writing tools are purpose-built for this. Elmer shouldn't try to be a code editor for its own development.

### Case 2: Exploration and Investigation Work

`/analyze-code`, `/write-tests`, ad-hoc research queries where you want interactive streaming and don't need persistence. Some work is just conversation -- you want to think out loud with an AI, not run a formal job.

For these two cases, Cursor remains the right tool. But for the 20 PM workflow agents -- research, PRD writing, prototype building, signal processing, validation, reporting -- the server wins once it has proper tooling.

---

## The Recommendation: Server-First, Cursor for Development

### What stays in `.cursor/` agents (definition layer only)
- All `.md` agent files -- these are the canonical definitions
- Model selection (haiku/sonnet/inherit) -- synced to server on git push
- Tool declarations, context dependencies, output specs
- Rules and skills

### What moves to Elmer server
- Actual LLM execution -- all Convex Actions
- Model routing resolution (inherit → actual model name based on workspace settings)
- Prompt construction (company context injection, job-type system prompts)
- Token/cost tracking
- HITL (pendingQuestions in Convex, answered in Elmer UI)
- MCP tool calls (composio, linear, posthog via server-side MCP client)

### What stays in Cursor forever
- Code editing (writing Elmer features)
- Interactive exploration (ad-hoc queries)
- Development tooling (`/maintain`, `/admin` for workspace config)

### The Handoff Pattern

```
Tyler writes agent definition in Cursor
  ↓ git push to pm-workspace
  ↓ webhook triggers Elmer sync
  ↓ agentDefinitions table updated

Team uses Elmer to run agent
  ↓ click "Run research-analyzer" in UI
  ↓ Convex mutation: createJob
  ↓ Convex scheduler: runAction(internal.agents.run)
  ↓ Action reads agent definition from DB
  ↓ Resolves model: "sonnet" → "claude-sonnet-4-20250514"
  ↓ Calls Anthropic API
  ↓ Tool calls hit Convex mutations
  ↓ Results stream to all subscribers via useQuery
  ↓ pendingQuestions appear in team's notification panel
  ↓ Execution trace stored in agentExecutions
```

---

## Summary Answer

**Keep the model definitions in the `.cursor/` markdown files -- that's the right place for them.** They're readable, version-controlled, and co-located with the agent logic. The three-tier system (haiku/sonnet/inherit) already captures the right routing intent.

**But move execution to the server.** The server resolves `inherit` to an actual model, provides proper cost tracking, enables parallel execution (massive win for validator), and makes everything visible to the team. The `.cursor/` files become the spec; the server runs it.

The biggest capability gap to close is **MCP tool access on the server** -- right now Cursor agents have 30+ tools (Shell, files, all MCPs), while the Elmer executor has 11 DB-only tools. The server-side MCP client needs to be built so that `research-analyzer` running on Convex can still call Slack, Linear, PostHog, and Figma the same way it does from Cursor.
