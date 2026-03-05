# Server-Side Tool Access: MCP, Composio, Shell, Files

> Generated: 2026-03-04
> Question: How does Elmer's server execution get access to the same tools Cursor agents use?

---

## The Good News: Composio Already Works Server-Side

The most important finding: **Composio works completely server-side today.** It's not going through Cursor. The flow is:

```
Convex Action (or Elmer's existing Express server)
  → composio.tools.execute("SLACK_SEND_MESSAGE", args)
  → Composio cloud (proxies OAuth on behalf of workspace)
  → Slack API
  → returns result
```

The `@composio/core` SDK is a regular HTTP client. It calls Composio's REST API at `https://backend.composio.dev/api/v3`. No MCP client needed. No local process. No Cursor dependency. The API key is per-workspace, stored in the DB.

**Every service you currently use via Cursor's MCP composio integration maps directly to a server-side Composio call:**

| In Cursor | On Server |
|-----------|-----------|
| `composio-config::SLACK_SEARCH_MESSAGES` | `composio.execute("SLACK_SEARCH_MESSAGES", args)` |
| `composio-config::SLACK_SEND_MESSAGE` | `composio.execute("SLACK_SEND_MESSAGE", args)` |
| `composio-config::LINEAR_LIST_ISSUES` | `composio.execute("LINEAR_LIST_ISSUES", args)` |
| `composio-config::NOTION_QUERY_DATABASE` | `composio.execute("NOTION_QUERY_DATABASE", args)` |
| `composio-config::GOOGLESUPER_LIST_EVENTS` | `composio.execute("GOOGLESUPER_LIST_EVENTS", args)` |
| `composio-config::HUBSPOT_GET_DEALS` | `composio.execute("HUBSPOT_GET_DEALS", args)` |

Elmer already has this. It's just locked behind the `composio_execute` tool which only runs when the agent explicitly calls it. The gap is **not capability** -- it's that the tool list isn't dynamic (you have to know the tool name ahead of time) and not all agents get access to it.

---

## The Tool Categories Needed on Server

Here's what Cursor agents use, and the server-side equivalent for each:

### Category 1: External Services (Slack, Linear, PostHog, Figma, GitHub, Notion, HubSpot, Google)

**Cursor:** MCP servers via composio-config, linear, posthog, figma, ansor  
**Server:** Composio SDK + direct REST APIs

```typescript
// convex/tools/services.ts

// Composio covers: Slack, Linear, Notion, HubSpot, Google, GitHub (most ops)
export async function callComposio(
  workspaceId: Id<"workspaces">,
  toolName: string,
  args: Record<string, unknown>
) {
  const apiKey = await getWorkspaceComposioKey(workspaceId);
  const client = new Composio({ apiKey });
  return client.tools.execute(toolName, {
    userId: `workspace-${workspaceId}`,
    arguments: args,
  });
}

// PostHog: direct REST API (Composio doesn't cover all PostHog tools)
export async function callPostHog(
  apiKey: string,
  endpoint: string,
  body: unknown
) {
  return fetch(`https://app.posthog.com/api/${endpoint}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(body),
  }).then(r => r.json());
}

// Figma: direct REST API
export async function callFigma(token: string, path: string) {
  return fetch(`https://api.figma.com/v1/${path}`, {
    headers: { "X-Figma-Token": token },
  }).then(r => r.json());
}

// Ansor: MCP over HTTP (Ansor has a web API endpoint)
export async function callAnsor(
  endpoint: string,
  tool: string,
  args: unknown
) {
  return fetch(`${endpoint}/api/mcp/${tool}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.ANSOR_API_KEY}` },
    body: JSON.stringify(args),
  }).then(r => r.json());
}
```

### Category 2: File Operations

**Cursor:** Direct filesystem R/W via Read/Write/Edit tools  
**Server:** Two distinct needs, two different solutions

**2a. PM workspace files (agent definitions, company context, skill files)**

These are git files in pm-workspace. The server reads them via GitHub API (already implemented in Elmer via `@octokit/rest`):

```typescript
// convex/tools/files.ts

export async function readWorkspaceFile(
  workspaceId: Id<"workspaces">,
  filePath: string  // e.g., "pm-workspace-docs/company-context/product-vision.md"
): Promise<string> {
  const workspace = await getWorkspace(workspaceId);
  const octokit = await getOctokitForWorkspace(workspaceId);
  const { data } = await octokit.repos.getContent({
    owner: workspace.githubOrg,
    repo: "pm-workspace",
    path: filePath,
  });
  return Buffer.from((data as any).content, "base64").toString();
}

export async function writeWorkspaceFile(
  workspaceId: Id<"workspaces">,
  filePath: string,
  content: string,
  commitMessage: string
): Promise<{ sha: string; commitUrl: string }> {
  // Already fully implemented as write_repo_files in Elmer's tools.ts
  // Uses the admin user's GitHub OAuth token
}
```

**2b. elephant-ai component files (prototype code)**

Already handled: prototype-builder commits to elephant-ai via Octokit. No local filesystem needed.

**2c. Document content (research.md, prd.md, etc.)**

These live in Elmer's DB, not the filesystem. The `save_document` tool writes directly to the DB. No file I/O needed.

### Category 3: Shell Execution

**Cursor:** Shell tool runs arbitrary bash commands  
**Server:** This is the trickiest category -- and the most important to think through carefully

**What shell commands do agents currently run?**

Looking at the agent markdown files, shell is used for:
1. `ls apps/web/src/components/` -- to discover available components for prototype-builder
2. `rg "ComponentName"` -- to search the codebase for component usage
3. `pnpm storybook` -- to verify Storybook builds
4. `npx chromatic` -- to deploy (Elmer already handles via `deploy_chromatic` MCP tool)
5. `git log`, `git diff` -- to check recent changes (Elmer has GitHub API equivalents)

**The honest answer: most shell use cases can be replaced with better tools.**

```typescript
// convex/tools/codebase.ts

// Replaces: ls apps/web/src/components/
export async function listComponentDirectory(
  workspaceId: Id<"workspaces">,
  path: string
): Promise<string[]> {
  const octokit = await getOctokitForWorkspace(workspaceId);
  const { data } = await octokit.repos.getContent({
    owner: "AskElephant",
    repo: "elephant-ai",
    path,
    ref: "main",
  });
  return (data as any[]).map(f => f.name);
}

// Replaces: rg "ComponentName" --type ts
export async function searchCodebase(
  workspaceId: Id<"workspaces">,
  query: string,
  path?: string
): Promise<{ file: string; line: number; content: string }[]> {
  // GitHub Code Search API
  const octokit = await getOctokitForWorkspace(workspaceId);
  const { data } = await octokit.search.code({
    q: `${query} repo:AskElephant/elephant-ai ${path ? `path:${path}` : ""}`,
  });
  return data.items.map(item => ({
    file: item.path,
    line: 0,
    content: item.name,
  }));
}

// Replaces: git log --oneline -10
export async function getRecentCommits(
  workspaceId: Id<"workspaces">,
  repo: string,
  branch = "main"
): Promise<{ sha: string; message: string; date: string }[]> {
  const octokit = await getOctokitForWorkspace(workspaceId);
  const { data } = await octokit.repos.listCommits({ 
    owner: "AskElephant", repo, sha: branch, per_page: 10 
  });
  return data.map(c => ({ sha: c.sha, message: c.commit.message, date: c.commit.author?.date ?? "" }));
}
```

**The cases that genuinely need a shell sandbox:**

- Running `pnpm build` to verify TypeScript compiles -- use a CI check instead
- Running tests -- use a CI check instead
- Running `nano-banana` CLI for image generation -- needs a sandbox

For those cases (primarily nano-banana and any future CLI tools), use a **sandboxed compute layer** that Convex actions can call out to:

```
Convex Action
  → POST https://sandbox.elmer.app/run
    { command: "nano-banana dashboard ...", timeout: 30000 }
  ← { stdout: "...", exitCode: 0, artifacts: [{ name: "out.png", url: "..." }] }
```

This sandbox is a separate small service (Node.js + Docker, hosted on Fly.io or Railway) that accepts job requests, runs them in an isolated container, and returns output. Convex Actions can call it via `fetch`. No shell access needed in the main application.

### Category 4: Web Search and Browser

**Cursor:** `web_search`, `browser` tools  
**Server:** Direct API calls

```typescript
// Web search: use a search API
export async function webSearch(query: string, numResults = 5) {
  const res = await fetch(
    `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${numResults}`,
    { headers: { "X-Subscription-Token": process.env.BRAVE_API_KEY! } }
  );
  return res.json();
}

// Browser/screenshots: use a headless browser service (Browserless, Playwright Cloud)
export async function captureScreenshot(url: string): Promise<string> {
  const res = await fetch("https://chrome.browserless.io/screenshot", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.BROWSERLESS_API_KEY}` },
    body: JSON.stringify({ url, options: { fullPage: true } }),
  });
  // Returns PNG blob → upload to Convex file storage → return URL
  const buffer = await res.arrayBuffer();
  const storageId = await ctx.storage.store(new Blob([buffer], { type: "image/png" }));
  return await ctx.storage.getUrl(storageId);
}
```

---

## The Complete Server-Side Tool Set

Here's the full catalog of tools available to agents running as Convex Actions. This is the `server_tools` object passed to Claude alongside the standard Anthropic tool list:

```typescript
// convex/tools/index.ts -- the complete server-side tool catalog

export const SERVER_TOOLS = {
  // ── DB Operations (replaces local file reads/writes) ──────────────────────
  get_project: {
    description: "Get full project with documents, signals, and metadata",
    execute: (args) => ctx.runQuery(api.projects.get, args),
  },
  save_document: {
    description: "Save or update a document for a project",
    execute: (args) => ctx.runMutation(api.documents.save, args),
  },
  get_context: {
    description: "Get company context (vision, guardrails, personas, org chart)",
    execute: (args) => ctx.runQuery(api.knowledgebase.get, args),
  },
  store_memory: {
    description: "Store a decision, evidence, or context in the memory graph",
    execute: (args) => ctx.runMutation(api.memory.store, args),
  },
  query_memory: {
    description: "Search memory for relevant past decisions and context",
    execute: (args) => ctx.runQuery(api.memory.search, args),
  },
  graph_get_context: {
    description: "Get full context graph for a project (all related entities)",
    execute: (args) => ctx.runQuery(api.graph.getContext, args),
  },
  
  // ── External Services via Composio ────────────────────────────────────────
  slack_search: {
    description: "Search Slack messages across channels",
    execute: (args) => callComposio(workspaceId, "SLACK_SEARCH_MESSAGES", args),
  },
  slack_send: {
    description: "Send a Slack message or DM",
    execute: (args) => callComposio(workspaceId, "SLACK_SEND_MESSAGE", args),
  },
  slack_get_history: {
    description: "Get conversation history from a Slack channel",
    execute: (args) => callComposio(workspaceId, "SLACK_FETCH_CONVERSATION_HISTORY", args),
  },
  linear_list_issues: {
    description: "List Linear issues by team, project, or filter",
    execute: (args) => callComposio(workspaceId, "LINEAR_LIST_ISSUES_BY_TEAM_ID", args),
  },
  linear_create_issue: {
    description: "Create a Linear issue",
    execute: (args) => callComposio(workspaceId, "LINEAR_CREATE_LINEAR_ISSUE", args),
  },
  linear_update_issue: {
    description: "Update a Linear issue",
    execute: (args) => callComposio(workspaceId, "LINEAR_UPDATE_ISSUE", args),
  },
  notion_query: {
    description: "Query a Notion database",
    execute: (args) => callComposio(workspaceId, "NOTION_QUERY_DATABASE", args),
  },
  notion_create_page: {
    description: "Create a Notion page",
    execute: (args) => callComposio(workspaceId, "NOTION_CREATE_NOTION_PAGE", args),
  },
  hubspot_search: {
    description: "Search HubSpot contacts, deals, companies",
    execute: (args) => callComposio(workspaceId, "HUBSPOT_SEARCH_CRM", args),
  },
  google_calendar_list: {
    description: "List Google Calendar events",
    execute: (args) => callComposio(workspaceId, "GOOGLESUPER_LIST_EVENTS", args),
  },
  google_calendar_create: {
    description: "Create a Google Calendar event",
    execute: (args) => callComposio(workspaceId, "GOOGLESUPER_CREATE_EVENT", args),
  },
  
  // ── Codebase Access via GitHub API ────────────────────────────────────────
  read_file: {
    description: "Read a file from the connected GitHub repository",
    execute: (args) => readWorkspaceFile(workspaceId, args.path),
  },
  write_file: {
    description: "Commit a file to the connected GitHub repository",
    execute: (args) => writeWorkspaceFile(workspaceId, args.path, args.content, args.message),
  },
  list_directory: {
    description: "List files in a directory of the GitHub repository",
    execute: (args) => listComponentDirectory(workspaceId, args.path),
  },
  search_code: {
    description: "Search code across the repository (like rg/grep)",
    execute: (args) => searchCodebase(workspaceId, args.query, args.path),
  },
  get_recent_commits: {
    description: "Get recent git commits",
    execute: (args) => getRecentCommits(workspaceId, args.repo),
  },
  
  // ── PostHog ───────────────────────────────────────────────────────────────
  posthog_query: {
    description: "Query PostHog analytics (insights, trends, funnels)",
    execute: (args) => callPostHog(workspace.posthogApiKey, args.endpoint, args.body),
  },
  posthog_create_dashboard: {
    description: "Create a PostHog dashboard",
    execute: (args) => callPostHog(workspace.posthogApiKey, "projects/@current/dashboards/", args),
  },
  
  // ── Figma ─────────────────────────────────────────────────────────────────
  figma_get_file: {
    description: "Get a Figma file structure",
    execute: (args) => callFigma(workspace.figmaToken, `files/${args.fileKey}`),
  },
  figma_get_node: {
    description: "Get a specific node from a Figma file",
    execute: (args) => callFigma(workspace.figmaToken, `images/${args.fileKey}?ids=${args.nodeId}`),
  },
  figma_generate_diagram: {
    description: "Generate a FigJam diagram from Mermaid syntax",
    execute: (args) => callFigmaGenerateDiagram(workspace.figmaToken, args.mermaid),
  },
  
  // ── Web Search & Browser ──────────────────────────────────────────────────
  web_search: {
    description: "Search the web",
    execute: (args) => webSearch(args.query, args.numResults),
  },
  capture_screenshot: {
    description: "Take a screenshot of a URL (for competitive analysis)",
    execute: (args) => captureScreenshot(args.url),
  },
  
  // ── Image Generation (nano-banana) ───────────────────────────────────────
  generate_image: {
    description: "Generate visual mockups using nano-banana",
    execute: (args) => callSandbox("nano-banana", args),
  },
  
  // ── Human-in-the-Loop ─────────────────────────────────────────────────────
  ask_question: {
    description: "Pause execution and ask the user a question",
    execute: async (args) => {
      await ctx.runMutation(api.jobs.createPendingQuestion, { jobId, ...args });
      return { requiresInput: true };  // signals executor to pause
    },
  },
  
  // ── Notifications ─────────────────────────────────────────────────────────
  notify_user: {
    description: "Send a notification to a specific team member",
    execute: (args) => ctx.runMutation(api.notifications.create, args),
  },
};
```

---

## How It Flows Inside a Convex Action

Convex Actions are regular serverless functions that can call `fetch`. The agentic loop runs inside a Convex Action:

```typescript
// convex/agents/run.ts
export const runAgent = internalAction({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, { jobId }) => {
    
    // 1. Load job + project + agent definition
    const job = await ctx.runQuery(api.jobs.get, { jobId });
    const agent = await ctx.runQuery(api.agents.get, { id: job.agentDefinitionId });
    const project = await ctx.runQuery(api.projects.get, { id: job.projectId });
    
    // 2. Load context from DB (replaces local file reads)
    const context = await ctx.runQuery(api.graph.getProjectContext, {
      projectId: job.projectId,
      workspaceId: job.workspaceId,
    });
    
    // 3. Build tool set based on agent type
    const tools = buildToolsForAgent(agent, job.workspaceId, ctx, jobId);
    
    // 4. Run the agentic loop
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    let messages = buildInitialMessages(agent, job, project, context);
    
    for (let i = 0; i < agent.metadata.maxToolIterations; i++) {
      const response = await anthropic.messages.create({
        model: agent.metadata.executionProfile.model,
        max_tokens: agent.metadata.executionProfile.maxTokens,
        system: [{ 
          type: "text", 
          text: buildSystemPrompt(agent, context),
          cache_control: { type: "ephemeral" } 
        }],
        tools: tools.map(t => t.definition),  // Anthropic tool format
        messages,
      });
      
      // 5. Execute tool calls
      const toolResults = [];
      for (const block of response.content) {
        if (block.type !== "tool_use") continue;
        
        const tool = tools.find(t => t.name === block.name);
        const result = await tool.execute(block.input);
        
        // Log tool call to DB (execution trace)
        await ctx.runMutation(api.jobs.logToolCall, {
          jobId, toolName: block.name, input: block.input, output: result
        });
        
        // Handle HITL pause
        if (result.requiresInput) {
          await ctx.runMutation(api.jobs.pause, { jobId });
          return; // Action exits; will be resumed by pendingQuestion.answer mutation
        }
        
        toolResults.push({ type: "tool_result", tool_use_id: block.id, content: JSON.stringify(result) });
      }
      
      messages = [...messages, { role: "assistant", content: response.content }, { role: "user", content: toolResults }];
      
      if (response.stop_reason === "end_turn" || toolResults.length === 0) break;
    }
    
    // 6. Complete the job
    await ctx.runMutation(api.jobs.complete, { 
      jobId, 
      output: extractFinalOutput(messages),
      tokensUsed: calculateTokens(messages),
    });
    
    // 7. Trigger orchestrator to propose next step
    await ctx.scheduler.runAfter(0, internal.orchestrator.checkNext, { 
      projectId: job.projectId 
    });
  },
});
```

---

## Composio: MCP vs. REST — Which to Use

Composio now supports two integration patterns. For server-side execution, the REST API is simpler:

| Pattern | Use When |
|---------|---------|
| **Composio REST SDK** (`@composio/core`) | Server-side Convex Actions -- no MCP client needed, direct HTTP |
| **Composio MCP Server** | Cursor integration -- MCP client in IDE connects to Composio's hosted MCP server |

For Elmer, everything on the server uses the Composio SDK. The Cursor workspace continues to use Composio via MCP (unchanged). Same tool names, same results -- just different transport.

---

## Migration from Current Elmer to Convex

The current `composio_execute` tool in Elmer's executor is already the right abstraction. Moving to Convex:

1. Replace `ComposioService` class with Convex action functions that call Composio SDK
2. Replace the 11 static tools with the dynamic catalog above
3. Pass all tools to Anthropic (not just the filtered subset per job type)
4. Let the agent decide which tools to use based on its definition content

The Composio API key stays per-workspace in the Convex DB. The `userId` for Composio stays `workspace-{workspaceId}`. OAuth connections already established in existing Elmer workspaces carry forward.

---

## Summary: What Needs to Be Built

| Tool Category | Status | What to Build |
|--------------|--------|--------------|
| Composio (Slack, Linear, Notion, HubSpot, Google) | Working in current Elmer | Migrate to Convex action, same SDK |
| GitHub file read/write | Working in current Elmer | Migrate to Convex action |
| Codebase search | Working via GitHub search API | Move from shell `rg` to GitHub Code Search |
| Directory listing | Working via GitHub tree API | Move from shell `ls` to GitHub API |
| PostHog REST | Not in current Elmer server | New: direct HTTP calls |
| Figma REST | Not in current Elmer server | New: direct HTTP calls |
| Web search | Not in current Elmer server | New: Brave Search API |
| Browser/screenshots | Not in current Elmer server | New: Browserless.io |
| Image generation (nano-banana) | Not in current Elmer server | New: sandbox service |
| DB tools (save_document, memory, graph) | Working in current Elmer | Migrate to Convex mutations |
| HITL (ask_question) | Working in current Elmer | Migrate to Convex pendingQuestions |
| Shell (arbitrary commands) | Cursor only | Sandbox service for CLI tools |

**Total new services needed:** Brave Search, Browserless.io, sandbox service for CLI tools. Everything else is either already server-side in Elmer or a direct REST API call.
