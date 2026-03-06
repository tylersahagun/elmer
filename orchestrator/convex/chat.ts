import {
  query,
  mutation,
  action,
  internalQuery,
  internalMutation,
  httpAction,
} from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { v } from "convex/values";

// ── Queries ───────────────────────────────────────────────────────────────────

export const listThreads = query({
  args: {
    workspaceId: v.id("workspaces"),
    userId: v.string(),
    includeArchived: v.optional(v.boolean()),
  },
  handler: async (ctx, { workspaceId, userId, includeArchived }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const threads = await ctx.db
      .query("chatThreads")
      .withIndex("by_workspace_user", (q) =>
        q.eq("workspaceId", workspaceId).eq("userId", userId),
      )
      .order("desc")
      .collect();
    if (includeArchived) return threads;
    return threads.filter((t) => !t.isArchived);
  },
});

export const getThread = query({
  args: { threadId: v.id("chatThreads") },
  handler: async (ctx, { threadId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db.get(threadId);
  },
});

export const listMessages = query({
  args: {
    threadId: v.id("chatThreads"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { threadId, limit }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const all = await ctx.db
      .query("chatMessages")
      .withIndex("by_thread", (q) => q.eq("threadId", threadId))
      .order("asc")
      .collect();
    const cap = limit ?? 100;
    return all.slice(0, cap);
  },
});

export const searchMentionables = query({
  args: {
    workspaceId: v.id("workspaces"),
    query: v.string(),
  },
  handler: async (ctx, { workspaceId, query: searchQuery }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const q = searchQuery.toLowerCase();

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_workspace", (x) => x.eq("workspaceId", workspaceId))
      .collect();

    const agents = await ctx.db
      .query("agentDefinitions")
      .withIndex("by_workspace_type", (x) => x.eq("workspaceId", workspaceId))
      .filter((x) => x.eq(x.field("enabled"), true))
      .collect();

    const filteredProjects = projects
      .filter((p) => p.name.toLowerCase().includes(q))
      .slice(0, 5)
      .map((p) => ({ id: p._id, label: p.name, type: "project" as const }));

    const filteredAgents = agents
      .filter((a) => a.name.toLowerCase().includes(q))
      .slice(0, 5)
      .map((a) => ({ id: a._id, label: a.name, type: "agent" as const }));

    return [...filteredProjects, ...filteredAgents];
  },
});

// ── Mutations ─────────────────────────────────────────────────────────────────

export const createThread = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    userId: v.string(),
    title: v.string(),
    contextEntityType: v.optional(v.string()),
    contextEntityId: v.optional(v.string()),
    model: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db.insert("chatThreads", {
      workspaceId: args.workspaceId,
      userId: args.userId,
      title: args.title,
      contextEntityType: args.contextEntityType,
      contextEntityId: args.contextEntityId,
      model: args.model,
      lastMessageAt: Date.now(),
      isArchived: false,
    });
  },
});

export const updateThread = mutation({
  args: {
    threadId: v.id("chatThreads"),
    title: v.optional(v.string()),
    model: v.optional(v.string()),
    isArchived: v.optional(v.boolean()),
  },
  handler: async (ctx, { threadId, ...patch }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const updates: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(patch)) {
      if (val !== undefined) updates[k] = val;
    }
    await ctx.db.patch(threadId, updates);
    return await ctx.db.get(threadId);
  },
});

export const sendMessage = mutation({
  args: {
    threadId: v.id("chatThreads"),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("tool")),
    content: v.string(),
    toolCalls: v.optional(v.array(v.any())),
    tokenCount: v.optional(v.number()),
    agentJobId: v.optional(v.id("jobs")),
    isHITL: v.optional(v.boolean()),
    hitlJobId: v.optional(v.id("jobs")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const messageId = await ctx.db.insert("chatMessages", {
      threadId: args.threadId,
      role: args.role,
      content: args.content,
      toolCalls: args.toolCalls,
      tokenCount: args.tokenCount,
      agentJobId: args.agentJobId,
      isHITL: args.isHITL,
      hitlJobId: args.hitlJobId,
    });
    await ctx.db.patch(args.threadId, { lastMessageAt: Date.now() });
    return messageId;
  },
});

// ── Internal variants (no auth check — used by HTTP action) ───────────────────

export const listMessagesInternal = internalQuery({
  args: {
    threadId: v.id("chatThreads"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { threadId, limit }) => {
    const all = await ctx.db
      .query("chatMessages")
      .withIndex("by_thread", (q) => q.eq("threadId", threadId))
      .order("asc")
      .collect();
    const cap = limit ?? 100;
    return all.slice(0, cap);
  },
});

export const sendMessageInternal = internalMutation({
  args: {
    threadId: v.id("chatThreads"),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("tool")),
    content: v.string(),
    tokenCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("chatMessages", {
      threadId: args.threadId,
      role: args.role,
      content: args.content,
      tokenCount: args.tokenCount,
    });
    await ctx.db.patch(args.threadId, { lastMessageAt: Date.now() });
    return messageId;
  },
});

export const getThreadInternal = internalQuery({
  args: { threadId: v.id("chatThreads") },
  handler: async (ctx, { threadId }) => {
    return await ctx.db.get(threadId);
  },
});

// ── Context queries (used by streamResponse) ──────────────────────────────────

export const getChatContext = internalQuery({
  args: {
    workspaceId: v.id("workspaces"),
    pageContext: v.optional(v.any()),
  },
  handler: async (ctx, { workspaceId, pageContext }) => {
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .collect();

    const recentJobs = await ctx.db
      .query("jobs")
      .withIndex("by_workspace_status", (q) => q.eq("workspaceId", workspaceId))
      .filter((q) => q.neq(q.field("status"), "cancelled"))
      .order("desc")
      .take(10);

    const signals = await ctx.db
      .query("signals")
      .withIndex("by_workspace_status", (q) =>
        q.eq("workspaceId", workspaceId).eq("status", "active"),
      )
      .order("desc")
      .take(10);

    const companyContext = await ctx.db
      .query("knowledgebaseEntries")
      .withIndex("by_workspace_type", (q) => q.eq("workspaceId", workspaceId))
      .filter((q) => q.eq(q.field("type"), "company_context"))
      .take(3);

    const agents = await ctx.db
      .query("agentDefinitions")
      .withIndex("by_workspace_type", (q) => q.eq("workspaceId", workspaceId))
      .filter((q) => q.eq(q.field("enabled"), true))
      .take(20);

    const graphNodes = await ctx.db
      .query("graphNodes")
      .withIndex("by_workspace_type", (q) => q.eq("workspaceId", workspaceId))
      .filter((q) => q.eq(q.field("validTo"), undefined))
      .order("desc")
      .take(20);

    return {
      projects,
      recentJobs,
      signals,
      companyContext,
      agents,
      graphNodes,
      pageContext,
    };
  },
});

export const getMentionEntityContent = internalQuery({
  args: {
    entityType: v.string(),
    entityId: v.string(),
  },
  handler: async (ctx, { entityType, entityId }) => {
    if (entityType === "project") {
      const project = await ctx.db.get(entityId as Id<"projects">);
      if (!project) return null;
      const docs = await ctx.db
        .query("documents")
        .withIndex("by_project", (q) => q.eq("projectId", entityId as Id<"projects">))
        .take(10);
      return {
        type: "project",
        project,
        docs: docs.map((d) => ({ id: d._id, title: d.title, type: d.type })),
      };
    }
    if (entityType === "document") {
      const doc = await ctx.db.get(entityId as Id<"documents">);
      return doc ? { type: "document", doc } : null;
    }
    if (entityType === "signal") {
      const signal = await ctx.db.get(entityId as Id<"signals">);
      return signal ? { type: "signal", signal } : null;
    }
    if (entityType === "agent") {
      const agent = await ctx.db.get(entityId as Id<"agentDefinitions">);
      return agent ? { type: "agent", agent } : null;
    }
    return null;
  },
});

// ── Context Peek Summaries ────────────────────────────────────────────────────

// Internal query: fetch entity for peek (projects, documents, signals)
export const getEntityForPeek = internalQuery({
  args: {
    table: v.union(v.literal("projects"), v.literal("documents"), v.literal("signals")),
    entityId: v.string(),
  },
  handler: async (ctx, { table, entityId }) => {
    if (table === "projects") {
      return await ctx.db.get(entityId as Id<"projects">);
    }
    if (table === "documents") {
      return await ctx.db.get(entityId as Id<"documents">);
    }
    if (table === "signals") {
      return await ctx.db.get(entityId as Id<"signals">);
    }
    return null;
  },
});

// Internal query: check if a cached peek summary exists and is fresh (< 1 hour)
export const getPeekSummaryInternal = internalQuery({
  args: {
    entityType: v.string(),
    entityId: v.string(),
  },
  handler: async (ctx, { entityType, entityId }) => {
    const ONE_HOUR = 3600000;
    if (entityType === "project") {
      const entity = await ctx.db.get(entityId as Id<"projects">);
      const meta = entity?.metadata as Record<string, unknown> | null | undefined;
      if (
        meta?.peekSummary &&
        typeof meta.peekSummaryAt === "number" &&
        meta.peekSummaryAt > Date.now() - ONE_HOUR
      ) {
        return meta.peekSummary as string;
      }
    }
    // Documents and signals don't have metadata fields in schema,
    // so we skip caching for them (summaries are generated fresh each time)
    return null;
  },
});

// Internal mutation: store peek summary in entity metadata
export const storePeekSummaryInternal = internalMutation({
  args: {
    entityType: v.string(),
    entityId: v.string(),
    summary: v.string(),
  },
  handler: async (ctx, { entityType, entityId, summary }) => {
    if (entityType === "project") {
      const entity = await ctx.db.get(entityId as Id<"projects">);
      if (!entity) return;
      const existing = (entity.metadata ?? {}) as Record<string, unknown>;
      await ctx.db.patch(entityId as Id<"projects">, {
        metadata: {
          ...existing,
          peekSummary: summary,
          peekSummaryAt: Date.now(),
        },
      });
    }
    // Documents/signals lack a metadata field in the schema — skip caching
  },
});

// Public action: generate a 2-3 sentence AI summary for hover preview
export const generatePeekSummary = action({
  args: {
    workspaceId: v.id("workspaces"),
    entityType: v.string(), // "project" | "document" | "signal"
    entityId: v.string(),
  },
  handler: async (ctx, { entityType, entityId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Check cache first (projects only)
    const cached = await ctx.runQuery(internal.chat.getPeekSummaryInternal, {
      entityType,
      entityId,
    });
    if (cached) return cached;

    // Fetch entity and build context text
    let entityText = "";
    if (entityType === "project") {
      const p = await ctx.runQuery(internal.chat.getEntityForPeek, {
        table: "projects",
        entityId,
      });
      if (p) {
        const meta = p.metadata as Record<string, unknown> | null | undefined;
        entityText = `Project: ${p.name}\nStage: ${p.stage}\nStatus: ${p.status}\nTL;DR: ${meta?.tldr ?? "not available"}`;
      }
    } else if (entityType === "document") {
      const d = await ctx.runQuery(internal.chat.getEntityForPeek, {
        table: "documents",
        entityId,
      });
      if (d) {
        entityText = `Document: ${d.title}\nType: ${d.type}\nContent preview: ${(d.content ?? "").slice(0, 500)}`;
      }
    } else if (entityType === "signal") {
      const s = await ctx.runQuery(internal.chat.getEntityForPeek, {
        table: "signals",
        entityId,
      });
      if (s) {
        entityText = `Signal from ${s.source}: ${s.verbatim.slice(0, 300)}`;
      }
    }

    if (!entityText) return null;

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return null;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 150,
        messages: [
          {
            role: "user",
            content: `In exactly 2-3 sentences, summarize what this is and why it matters right now. Be concrete and specific.\n\n${entityText}`,
          },
        ],
      }),
    });

    const data = (await response.json()) as {
      content?: Array<{ text: string }>;
    };
    const summary = data.content?.[0]?.text ?? null;

    // Cache it for projects
    if (summary && entityType === "project") {
      await ctx.runMutation(internal.chat.storePeekSummaryInternal, {
        entityType,
        entityId,
        summary,
      });
    }

    return summary;
  },
});

// ── Streaming HTTP action ─────────────────────────────────────────────────────

export const streamResponse = httpAction(async (ctx, request) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return new Response("Unauthorized", { status: 401 });
  }

  let body: {
    threadId: string;
    content: string;
    workspaceId?: string;
    pageContext?: { pathname?: string; projectId?: string; documentId?: string };
    mentions?: Array<{ entityType: string; entityId: string }>;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const { threadId, content, workspaceId, pageContext, mentions } = body;
  if (!threadId || !content) {
    return new Response("Missing threadId or content", { status: 400 });
  }

  const typedThreadId = threadId as Id<"chatThreads">;

  const history = await ctx.runQuery(internal.chat.listMessagesInternal, {
    threadId: typedThreadId,
    limit: 20,
  });

  // Context compaction: if more than 10 messages, summarize older ones
  let messagesToSend = history;
  if (history.length > 10) {
    const older = history.slice(0, history.length - 6);
    const recent = history.slice(history.length - 6);
    const summaryLines = older.map(m => `${m.role}: ${m.content.slice(0, 200)}`).join('\n');
    const compactedHistory = [
      { role: "user" as const, content: `[Conversation summary — ${older.length} earlier messages]:\n${summaryLines}` },
      { role: "assistant" as const, content: "Understood, I have the context of our earlier conversation." },
      ...recent,
    ];
    messagesToSend = compactedHistory as typeof history;
  }

  await ctx.runMutation(internal.chat.sendMessageInternal, {
    threadId: typedThreadId,
    role: "user",
    content,
  });

  // Fetch workspace context if workspaceId is provided
  let systemPrompt =
    "You are Elmer, an AI product management assistant. Help the user with their PM work — strategy, research, prototypes, and shipping decisions. Be concise and direct.";

  if (workspaceId) {
    const typedWorkspaceId = workspaceId as Id<"workspaces">;

    const [workspaceContext, mentionContents] = await Promise.all([
      ctx.runQuery(internal.chat.getChatContext, {
        workspaceId: typedWorkspaceId,
        pageContext,
      }),
      Promise.all(
        (mentions ?? []).map((m) =>
          ctx.runQuery(internal.chat.getMentionEntityContent, m),
        ),
      ),
    ]);

    const { projects, signals, companyContext, agents, graphNodes } =
      workspaceContext;

    const parts: string[] = [
      "You are Elmer, the AskElephant PM command center AI assistant. You have full access to this workspace's context.",
    ];

    // Current page context
    if (pageContext?.pathname) {
      parts.push("\n## Current Page");
      parts.push(pageContext.pathname);
      if (pageContext.projectId) {
        const linkedProject = projects.find(
          (p) => p._id === pageContext.projectId,
        );
        if (linkedProject) {
          parts.push(`Viewing project: ${linkedProject.name}`);
        }
      }
    }

    // Active projects
    parts.push(`\n## Active Projects (${projects.length})`);
    if (projects.length > 0) {
      for (const p of projects) {
        const tldr = (p.metadata as Record<string, string> | null)?.tldr ?? "";
        parts.push(
          `- ${p.name} (${p.stage} / ${p.status})${tldr ? `: ${tldr}` : ""}`,
        );
      }
    } else {
      parts.push("No projects yet.");
    }

    // Recent signals
    parts.push("\n## Recent Signals (last 10 by recency)");
    if (signals.length > 0) {
      for (const s of signals) {
        const snippet = s.verbatim.slice(0, 100);
        const cls =
          typeof s.classification === "string" ? s.classification : "";
        parts.push(`- ${s.source}: ${snippet}${cls ? ` (${cls})` : ""}`);
      }
    } else {
      parts.push("No recent signals.");
    }

    // Company context
    parts.push("\n## Company Context");
    if (companyContext.length > 0) {
      for (const kb of companyContext) {
        parts.push(`${kb.title}: ${kb.content.slice(0, 500)}`);
      }
    } else {
      parts.push("No company context synced yet.");
    }

    // Agents
    parts.push(`\n## Available Agents (${agents.length} enabled)`);
    if (agents.length > 0) {
      for (const a of agents) {
        parts.push(`- ${a.name} (${a.type})${a.description ? `: ${a.description}` : ""}`);
      }
    } else {
      parts.push("No agents configured.");
    }

    // Memory graph top entities
    parts.push("\n## Memory Graph Top Entities");
    if (graphNodes.length > 0) {
      for (const n of graphNodes) {
        parts.push(`- ${n.name} (${n.entityType}, weight=${n.accessWeight})`);
      }
    } else {
      parts.push("Memory graph is empty.");
    }

    // @Mentioned context
    const resolvedMentions = mentionContents.filter(Boolean);
    if (resolvedMentions.length > 0) {
      parts.push("\n## @Mentioned Context");
      for (const m of resolvedMentions) {
        parts.push(JSON.stringify(m, null, 2));
      }
    }

    systemPrompt = parts.join("\n");
  } else if (pageContext?.pathname) {
    systemPrompt +=
      `\n\nThe user is currently viewing: ${pageContext.pathname}`;
    if (pageContext.projectId)
      systemPrompt += ` (project: ${pageContext.projectId})`;
    if (pageContext.documentId)
      systemPrompt += ` (document: ${pageContext.documentId})`;
  }

  const anthropicMessages = messagesToSend.map((m) => ({
    role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
    content: m.content,
  }));
  anthropicMessages.push({ role: "user", content });

  // Resolve the Anthropic model to use based on thread.model setting
  const thread = await ctx.runQuery(internal.chat.getThreadInternal, { threadId: typedThreadId });
  const threadModel = thread?.model ?? "auto";
  let resolvedModel: string;
  if (threadModel === "haiku") {
    resolvedModel = "claude-3-haiku-20240307";
  } else if (threadModel === "sonnet") {
    resolvedModel = "claude-sonnet-4-5";
  } else {
    // auto: use haiku for short messages, sonnet for longer ones
    resolvedModel = content.length < 500 ? "claude-3-haiku-20240307" : "claude-sonnet-4-5";
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) {
    return new Response("ANTHROPIC_API_KEY not configured", { status: 500 });
  }

  const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": anthropicKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: resolvedModel,
      max_tokens: 2048,
      stream: true,
      system: systemPrompt,
      messages: anthropicMessages,
    }),
  });

  if (!anthropicRes.ok || !anthropicRes.body) {
    const errText = await anthropicRes.text();
    return new Response(`Anthropic error: ${errText}`, {
      status: anthropicRes.status,
    });
  }

  let fullText = "";
  let inputTokens = 0;
  let outputTokens = 0;

  const transformStream = new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      controller.enqueue(chunk);
      const text = new TextDecoder().decode(chunk);
      for (const line of text.split("\n")) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6).trim();
        if (!data || data === "[DONE]") continue;
        try {
          const parsed = JSON.parse(data) as {
            type: string;
            delta?: { type: string; text?: string };
            message?: {
              usage?: { input_tokens?: number; output_tokens?: number };
            };
            usage?: { input_tokens?: number; output_tokens?: number };
          };
          if (
            parsed.type === "content_block_delta" &&
            parsed.delta?.type === "text_delta" &&
            parsed.delta.text
          ) {
            fullText += parsed.delta.text;
          }
          if (parsed.type === "message_start" && parsed.message?.usage) {
            inputTokens = parsed.message.usage.input_tokens ?? 0;
          }
          if (parsed.type === "message_delta" && parsed.usage) {
            outputTokens = parsed.usage.output_tokens ?? 0;
          }
        } catch {
          // Non-JSON SSE line — ignore
        }
      }
    },
    async flush() {
      if (fullText) {
        await ctx.runMutation(internal.chat.sendMessageInternal, {
          threadId: typedThreadId,
          role: "assistant",
          content: fullText,
          tokenCount: inputTokens + outputTokens,
        });
      }
    },
  });

  anthropicRes.body.pipeThrough(transformStream);

  return new Response(transformStream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Access-Control-Allow-Origin": "*",
    },
  });
});
