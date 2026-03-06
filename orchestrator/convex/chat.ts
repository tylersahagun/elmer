import {
  query,
  mutation,
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

// ── Streaming HTTP action ─────────────────────────────────────────────────────

export const streamResponse = httpAction(async (ctx, request) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return new Response("Unauthorized", { status: 401 });
  }

  let body: {
    threadId: string;
    content: string;
    pageContext?: { pathname?: string; projectId?: string; documentId?: string };
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const { threadId, content, pageContext } = body;
  if (!threadId || !content) {
    return new Response("Missing threadId or content", { status: 400 });
  }

  const typedThreadId = threadId as Id<"chatThreads">;

  const history = await ctx.runQuery(internal.chat.listMessagesInternal, {
    threadId: typedThreadId,
    limit: 20,
  });

  await ctx.runMutation(internal.chat.sendMessageInternal, {
    threadId: typedThreadId,
    role: "user",
    content,
  });

  const anthropicMessages = history.map((m) => ({
    role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
    content: m.content,
  }));
  anthropicMessages.push({ role: "user", content });

  let systemPrompt =
    "You are Elmer, an AI product management assistant. Help the user with their PM work — strategy, research, prototypes, and shipping decisions. Be concise and direct.";
  if (pageContext?.pathname) {
    systemPrompt += `\n\nThe user is currently viewing: ${pageContext.pathname}`;
    if (pageContext.projectId)
      systemPrompt += ` (project: ${pageContext.projectId})`;
    if (pageContext.documentId)
      systemPrompt += ` (document: ${pageContext.documentId})`;
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
      model: "claude-3-haiku-20240307",
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
