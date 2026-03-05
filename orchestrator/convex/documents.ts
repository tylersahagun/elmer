import { query, mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const byProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db
      .query("documents")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .collect();
  },
});

export const getByType = query({
  args: {
    projectId: v.id("projects"),
    type: v.string(),
  },
  handler: async (ctx, { projectId, type }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db
      .query("documents")
      .withIndex("by_type", (q) => q.eq("projectId", projectId).eq("type", type))
      .first();
  },
});

export const get = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, { documentId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db.get(documentId);
  },
});

export const create = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    projectId: v.id("projects"),
    type: v.string(),
    title: v.string(),
    content: v.string(),
    generatedByAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const docId = await ctx.db.insert("documents", {
      workspaceId: args.workspaceId,
      projectId: args.projectId,
      type: args.type,
      title: args.title,
      content: args.content,
      version: 1,
      reviewStatus: "draft",
      generatedByAgent: args.generatedByAgent,
    });

    // GTM-47: auto-create graph node + produced_for edge to project
    await ctx.scheduler.runAfter(0, internal.graph.autoCreateDocumentNode, {
      workspaceId: args.workspaceId,
      documentId: docId,
      documentTitle: args.title,
      documentType: args.type,
      projectId: args.projectId,
    });

    // GTM-62: regenerate TL;DR when a key doc is created
    if (args.type === "prd" || args.type === "research") {
      await ctx.scheduler.runAfter(1000, internal.projects.generateProjectTldr, {
        projectId: args.projectId,
      });
    }

    return docId;
  },
});

export const update = mutation({
  args: {
    documentId: v.id("documents"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    reviewStatus: v.optional(v.string()),
  },
  handler: async (ctx, { documentId, ...patch }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const doc = await ctx.db.get(documentId);
    if (!doc) throw new Error("Document not found");
    const updates: Record<string, unknown> = {};
    if (patch.title !== undefined) updates.title = patch.title;
    if (patch.content !== undefined) updates.content = patch.content;
    if (patch.reviewStatus !== undefined) updates.reviewStatus = patch.reviewStatus;
    // Bump version on content change
    if (patch.content !== undefined) updates.version = doc.version + 1;
    await ctx.db.patch(documentId, updates);
    return await ctx.db.get(documentId);
  },
});

export const remove = mutation({
  args: { documentId: v.id("documents") },
  handler: async (ctx, { documentId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    await ctx.db.delete(documentId);
  },
});
