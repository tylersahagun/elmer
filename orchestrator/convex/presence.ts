import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const ACTIVE_WINDOW_MS = 30_000;

export function getUnauthenticatedPresenceFallback(
  identity: unknown,
): [] | null {
  return identity ? null : [];
}

export const upsert = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    displayName: v.string(),
    avatarUrl: v.optional(v.string()),
    location: v.string(),
    projectId: v.optional(v.id("projects")),
    documentId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("presence")
      .withIndex("by_user_workspace", (q) =>
        q.eq("userId", identity.subject).eq("workspaceId", args.workspaceId),
      )
      .unique();

    const payload = {
      workspaceId: args.workspaceId,
      userId: identity.subject,
      displayName: args.displayName,
      avatarUrl: args.avatarUrl,
      location: args.location,
      projectId: args.projectId,
      documentId: args.documentId,
      lastSeen: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, payload);
      return existing._id;
    }
    return await ctx.db.insert("presence", payload);
  },
});

export const clear = mutation({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, { workspaceId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("presence")
      .withIndex("by_user_workspace", (q) =>
        q.eq("userId", identity.subject).eq("workspaceId", workspaceId),
      )
      .unique();
    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});

export const byWorkspace = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, { workspaceId }) => {
    const identity = await ctx.auth.getUserIdentity();
    const unauthenticatedFallback = getUnauthenticatedPresenceFallback(identity);
    if (unauthenticatedFallback) return unauthenticatedFallback;

    const cutoff = Date.now() - ACTIVE_WINDOW_MS;
    const all = await ctx.db
      .query("presence")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .collect();

    return all.filter((entry) => entry.lastSeen >= cutoff);
  },
});

export const byDocument = query({
  args: {
    workspaceId: v.id("workspaces"),
    documentId: v.string(),
  },
  handler: async (ctx, { workspaceId, documentId }) => {
    const identity = await ctx.auth.getUserIdentity();
    const unauthenticatedFallback = getUnauthenticatedPresenceFallback(identity);
    if (unauthenticatedFallback) return unauthenticatedFallback;

    const cutoff = Date.now() - ACTIVE_WINDOW_MS;
    const all = await ctx.db
      .query("presence")
      .withIndex("by_document", (q) =>
        q.eq("workspaceId", workspaceId).eq("documentId", documentId),
      )
      .collect();

    return all.filter((entry) => entry.lastSeen >= cutoff);
  },
});
