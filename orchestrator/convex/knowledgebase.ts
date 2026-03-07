import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import {
  archivePromotedMirrorNode,
  upsertPromotedMirrorNode,
} from "./runtimeMemory";

export const listByWorkspace = query({
  args: {
    workspaceId: v.id("workspaces"),
    type: v.optional(v.string()),
  },
  handler: async (ctx, { workspaceId, type }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    if (type) {
      return await ctx.db
        .query("knowledgebaseEntries")
        .withIndex("by_workspace_type", (q) =>
          q.eq("workspaceId", workspaceId).eq("type", type),
        )
        .collect();
    }
    return await ctx.db
      .query("knowledgebaseEntries")
      .withIndex("by_workspace_type", (q) => q.eq("workspaceId", workspaceId))
      .collect();
  },
});

export const get = query({
  args: { id: v.id("knowledgebaseEntries") },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db.get(id);
  },
});

export const upsert = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    type: v.string(),
    title: v.string(),
    content: v.string(),
    filePath: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // When filePath is provided (e.g. per-hypothesis entries), match on filePath
    // so multiple entries of the same type (e.g. "hypothesis") can coexist.
    const candidates = await ctx.db
      .query("knowledgebaseEntries")
      .withIndex("by_workspace_type", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("type", args.type),
      )
      .collect();

    const existing = args.filePath
      ? candidates.find((e) => e.filePath === args.filePath)
      : candidates[0];

    if (existing) {
      await ctx.db.patch(existing._id, {
        content: args.content,
        title: args.title,
        filePath: args.filePath,
        version: existing.version + 1,
      });
      await upsertPromotedMirrorNode(ctx as never, {
        workspaceId: args.workspaceId,
        entityType: "context",
        entityId: existing._id,
        title: args.title,
        content: args.content,
        domain: args.type,
        mirrorTable: "knowledgebaseEntries",
        mirrorId: existing._id,
        filePath: args.filePath,
        decayRate: 0.002,
      });
      return existing._id;
    }

    const id = await ctx.db.insert("knowledgebaseEntries", {
      workspaceId: args.workspaceId,
      type: args.type,
      title: args.title,
      content: args.content,
      filePath: args.filePath,
      version: 1,
    });
    await upsertPromotedMirrorNode(ctx as never, {
      workspaceId: args.workspaceId,
      entityType: "context",
      entityId: id,
      title: args.title,
      content: args.content,
      domain: args.type,
      mirrorTable: "knowledgebaseEntries",
      mirrorId: id,
      filePath: args.filePath,
      decayRate: 0.002,
    });
    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("knowledgebaseEntries") },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    await archivePromotedMirrorNode(ctx as never, {
      entityType: "context",
      entityId: id,
    });
    await ctx.db.delete(id);
    return { ok: true, archivedPromotionState: "superseded" as const };
  },
});
