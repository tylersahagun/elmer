import { query, mutation, internalMutation, internalAction } from "./_generated/server";
import { internal, api } from "./_generated/api";
import { v } from "convex/values";
import Anthropic from "@anthropic-ai/sdk";

// ── Queries ──────────────────────────────────────────────────────────────────

export const list = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, { workspaceId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db
      .query("projects")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .collect();
  },
});

export const byStage = query({
  args: {
    workspaceId: v.id("workspaces"),
    stage: v.string(),
  },
  handler: async (ctx, { workspaceId, stage }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db
      .query("projects")
      .withIndex("by_stage", (q) =>
        q.eq("workspaceId", workspaceId).eq("stage", stage),
      )
      .collect();
  },
});

export const get = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db.get(projectId);
  },
});

// ── Mutations ─────────────────────────────────────────────────────────────────

export const create = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    description: v.optional(v.string()),
    stage: v.optional(v.string()),
    priority: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const projectId = await ctx.db.insert("projects", {
      workspaceId: args.workspaceId,
      name: args.name,
      description: args.description,
      stage: args.stage ?? "inbox",
      status: "on_track",
      priority: args.priority ?? "P2",
      metadata: args.metadata ?? {},
      isLocked: false,
    });
    await ctx.scheduler.runAfter(0, internal.graph.autoCreateProjectNode, {
      workspaceId: args.workspaceId,
      projectId,
      projectName: args.name,
    });
    await ctx.scheduler.runAfter(2000, internal.projects.generateProjectTldr, { projectId });
    return projectId;
  },
});

export const update = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    stage: v.optional(v.string()),
    status: v.optional(v.string()),
    priority: v.optional(v.string()),
    metadata: v.optional(v.any()),
    isLocked: v.optional(v.boolean()),
  },
  handler: async (ctx, { projectId, ...patch }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const updates: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(patch)) {
      if (v !== undefined) updates[k] = v;
    }
    await ctx.db.patch(projectId, updates);
    if (patch.stage !== undefined) {
      await ctx.scheduler.runAfter(0, internal.projects.generateProjectTldr, { projectId });
    }
    return await ctx.db.get(projectId);
  },
});

export const updateTldr = mutation({
  args: {
    projectId: v.id("projects"),
    tldr: v.string(),
  },
  handler: async (ctx, { projectId, tldr }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const project = await ctx.db.get(projectId);
    if (!project) throw new Error("Project not found");
    await ctx.db.patch(projectId, {
      metadata: { ...(project.metadata ?? {}), tldr },
    });
  },
});

export const remove = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    await ctx.db.delete(projectId);
  },
});

export const internalUpdateTldr = internalMutation({
  args: {
    projectId: v.id("projects"),
    tldr: v.string(),
  },
  handler: async (ctx, { projectId, tldr }) => {
    const project = await ctx.db.get(projectId);
    if (!project) throw new Error("Project not found");
    await ctx.db.patch(projectId, {
      metadata: { ...(project.metadata ?? {}), tldr },
    });
  },
});

export const generateProjectTldr = internalAction({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const project = await ctx.runQuery(api.projects.get, { projectId });
    if (!project) return;

    const workspaceId = project.workspaceId;

    const [prd, research, kbEntries] = await Promise.all([
      ctx.runQuery(api.documents.getByType, { projectId, type: "prd" }),
      ctx.runQuery(api.documents.getByType, { projectId, type: "research" }),
      ctx.runQuery(api.knowledgebase.listByWorkspace, {
        workspaceId,
        type: "company_context",
      }),
    ]);

    const companyContext = kbEntries.map((e: { content: string }) => e.content).join("\n\n");

    const client = new Anthropic();
    const message = await client.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 512,
      system:
        "You are generating a project TL;DR for an internal PM tool. Be concrete and specific. Return ONLY the 4 sentences, no other text.",
      messages: [
        {
          role: "user",
          content: `Generate a 4-sentence project TL;DR for: ${project.name}\n\nStage: ${project.stage}\nDescription: ${project.description ?? "none"}\n\nCompany context (for strategic alignment):\n${companyContext.slice(0, 1500)}\n\nPRD (overview):\n${prd?.content.slice(0, 2000) ?? "not yet written"}\n\nResearch:\n${research?.content.slice(0, 1500) ?? "not yet written"}\n\nThe 4 sentences must be:\n1. What we're building (concrete, specific — no vague language)\n2. Why (one specific strategic reason tied to company outcomes)\n3. Who it's for (persona name + their exact problem)\n4. Current status + the main blocker if any (or "no blockers" if none)`,
        },
      ],
    });

    const tldr =
      message.content[0].type === "text" ? message.content[0].text.trim() : "";
    if (!tldr) return;

    await ctx.runMutation(internal.projects.internalUpdateTldr, { projectId, tldr });
  },
});

export const listWithEmbeddings = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, { workspaceId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const all = await ctx.db
      .query("projects")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .collect();
    return all.filter((p) => p.embeddingVector && p.embeddingVector.length > 0);
  },
});

export const storeEmbedding = mutation({
  args: {
    projectId: v.id("projects"),
    embeddingVector: v.array(v.float64()),
  },
  handler: async (ctx, { projectId, embeddingVector }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    await ctx.db.patch(projectId, {
      embeddingVector,
      embeddingUpdatedAt: Date.now(),
    });
  },
});
