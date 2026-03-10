import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";

// ── Queries ───────────────────────────────────────────────────────────────────

function getUnauthenticatedInboxItemsFallback(identity: unknown): [] | null {
  return identity ? null : [];
}

function getUnauthenticatedInboxCountsFallback(
  identity: unknown,
): { total: number; pending: number; highImpact: number; directionChange: number } | null {
  return identity
    ? null
    : {
        total: 0,
        pending: 0,
        highImpact: 0,
        directionChange: 0,
      };
}

/** All inbox items for a workspace, sorted by impact score descending. */
export const listByPriority = query({
  args: {
    workspaceId: v.id("workspaces"),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { workspaceId, status, limit }) => {
    const identity = await ctx.auth.getUserIdentity();
    const unauthenticatedFallback =
      getUnauthenticatedInboxItemsFallback(identity);
    if (unauthenticatedFallback) return unauthenticatedFallback;

    // Fetch all for workspace, then sort + filter in JS
    // (Convex index range scans don't support descending impactScore easily)
    const all = await ctx.db
      .query("inboxItems")
      .withIndex("by_workspace_status", (q) => q.eq("workspaceId", workspaceId))
      .collect();

    const filtered = status ? all.filter((i) => i.status === status) : all;

    // Sort: direction changes first, then by impact score desc, then creation desc
    filtered.sort((a, b) => {
      const aDir = a.suggestsVisionUpdate ? 1 : 0;
      const bDir = b.suggestsVisionUpdate ? 1 : 0;
      if (aDir !== bDir) return bDir - aDir;
      const aScore = a.impactScore ?? 0;
      const bScore = b.impactScore ?? 0;
      if (aScore !== bScore) return bScore - aScore;
      return b._creationTime - a._creationTime;
    });

    return limit ? filtered.slice(0, limit) : filtered;
  },
});

export const get = query({
  args: { itemId: v.id("inboxItems") },
  handler: async (ctx, { itemId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db.get(itemId);
  },
});

export const counts = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, { workspaceId }) => {
    const identity = await ctx.auth.getUserIdentity();
    const unauthenticatedFallback =
      getUnauthenticatedInboxCountsFallback(identity);
    if (unauthenticatedFallback) return unauthenticatedFallback;

    const all = await ctx.db
      .query("inboxItems")
      .withIndex("by_workspace_status", (q) => q.eq("workspaceId", workspaceId))
      .collect();

    return {
      total: all.length,
      pending: all.filter((i) => i.status === "pending").length,
      highImpact: all.filter(
        (i) => i.status !== "dismissed" && (i.impactScore ?? 0) > 70,
      ).length,
      directionChange: all.filter(
        (i) => i.status !== "dismissed" && i.suggestsVisionUpdate,
      ).length,
    };
  },
});

// ── Mutations (user-facing) ───────────────────────────────────────────────────

export const create = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    type: v.string(),
    source: v.string(),
    title: v.string(),
    rawContent: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db.insert("inboxItems", {
      workspaceId: args.workspaceId,
      type: args.type,
      source: args.source,
      title: args.title,
      rawContent: args.rawContent,
      status: "pending",
    });
  },
});

export const dismiss = mutation({
  args: { itemId: v.id("inboxItems") },
  handler: async (ctx, { itemId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    await ctx.db.patch(itemId, { status: "dismissed" });
  },
});

export const assignToProject = mutation({
  args: {
    itemId: v.id("inboxItems"),
    projectId: v.id("projects"),
  },
  handler: async (ctx, { itemId, projectId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    await ctx.db.patch(itemId, {
      assignedProjectId: projectId,
      status: "assigned",
    });
  },
});

export const acceptDirectionChange = mutation({
  args: {
    itemId: v.id("inboxItems"),
    note: v.optional(v.string()),
  },
  handler: async (ctx, { itemId, note }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const item = await ctx.db.get(itemId);
    if (!item) throw new Error("Inbox item not found");
    await ctx.db.patch(itemId, {
      status: "assigned",
      suggestsVisionUpdate: false,
      processedContent: note ?? "Direction change accepted",
    });
  },
});

// ── Internal mutations (called by processing pipeline) ───────────────────────

export const createInternal = internalMutation({
  args: {
    workspaceId: v.id("workspaces"),
    type: v.string(),
    source: v.string(),
    title: v.string(),
    rawContent: v.string(),
    signalId: v.optional(v.id("signals")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("inboxItems", {
      workspaceId: args.workspaceId,
      type: args.type,
      source: args.source,
      title: args.title,
      rawContent: args.rawContent,
      status: "pending",
    });
  },
});

export const writeProcessingResults = internalMutation({
  args: {
    itemId: v.id("inboxItems"),
    tldr: v.string(),
    impactScore: v.number(),
    suggestsVisionUpdate: v.boolean(),
    aiSummary: v.optional(v.string()),
    assignedProjectId: v.optional(v.id("projects")),
    projectDirectionChange: v.optional(v.any()),
    extractedProblems: v.optional(v.any()),
    hypothesisMatches: v.optional(v.any()),
  },
  handler: async (ctx, { itemId, ...results }) => {
    await ctx.db.patch(itemId, {
      ...results,
      status: results.assignedProjectId ? "assigned" : "pending",
    });
  },
});

export const markProcessing = internalMutation({
  args: { itemId: v.id("inboxItems") },
  handler: async (ctx, { itemId }) => {
    await ctx.db.patch(itemId, { status: "processing" });
  },
});

/**
 * Generic update — called from server-side API routes after auth is verified
 * at the Next.js layer via requireWorkspaceAccess.
 */
export const update = mutation({
  args: {
    itemId: v.id("inboxItems"),
    status: v.optional(v.string()),
    assignedProjectId: v.optional(v.id("projects")),
    processedContent: v.optional(v.string()),
    aiSummary: v.optional(v.string()),
    extractedProblems: v.optional(v.any()),
    hypothesisMatches: v.optional(v.any()),
  },
  handler: async (ctx, { itemId, ...patch }) => {
    const updates: Record<string, unknown> = {};
    if (patch.status !== undefined) updates.status = patch.status;
    if (patch.assignedProjectId !== undefined) updates.assignedProjectId = patch.assignedProjectId;
    if (patch.processedContent !== undefined) updates.processedContent = patch.processedContent;
    if (patch.aiSummary !== undefined) updates.aiSummary = patch.aiSummary;
    if (patch.extractedProblems !== undefined) updates.extractedProblems = patch.extractedProblems;
    if (patch.hypothesisMatches !== undefined) updates.hypothesisMatches = patch.hypothesisMatches;
    await ctx.db.patch(itemId, updates);
    return await ctx.db.get(itemId);
  },
});

/** Delete an inbox item. */
export const remove = mutation({
  args: { itemId: v.id("inboxItems") },
  handler: async (ctx, { itemId }) => {
    await ctx.db.delete(itemId);
  },
});

/**
 * Create an inbox item from a webhook request.
 * Auth is validated at the route layer via HMAC signature; Convex identity
 * check is intentionally skipped here.
 */
export const createFromWebhook = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    type: v.string(),
    source: v.string(),
    sourceRef: v.optional(v.string()),
    title: v.string(),
    rawContent: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("inboxItems", {
      workspaceId: args.workspaceId,
      type: args.type,
      source: args.source,
      title: args.title,
      rawContent: args.rawContent,
      status: "pending",
    });
  },
});
