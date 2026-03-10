import { query, mutation, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

// ── Queries ──────────────────────────────────────────────────────────────────

export const list = query({
  args: {
    workspaceId: v.id("workspaces"),
    status: v.optional(v.string()),
  },
  handler: async (ctx, { workspaceId, status }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    if (status) {
      return await ctx.db
        .query("signals")
        .withIndex("by_workspace_status", (q) =>
          q.eq("workspaceId", workspaceId).eq("status", status),
        )
        .collect();
    }
    // No status filter — fetch all for workspace (scan by_workspace_status prefix)
    return await ctx.db
      .query("signals")
      .withIndex("by_workspace_status", (q) => q.eq("workspaceId", workspaceId))
      .collect();
  },
});

export const get = query({
  args: { signalId: v.id("signals") },
  handler: async (ctx, { signalId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db.get(signalId);
  },
});

export const linkedProjects = query({
  args: { signalId: v.id("signals") },
  handler: async (ctx, { signalId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const links = await ctx.db
      .query("signalProjects")
      .withIndex("by_signal", (q) => q.eq("signalId", signalId))
      .collect();
    const projects = await Promise.all(links.map((l) => ctx.db.get(l.projectId)));
    return projects.filter(Boolean);
  },
});

export const byProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const links = await ctx.db
      .query("signalProjects")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .collect();
    const signals = await Promise.all(
      links.map((link) => ctx.db.get(link.signalId)),
    );
    return signals.filter(Boolean);
  },
});

export const byProjectDetailed = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const links = await ctx.db
      .query("signalProjects")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .collect();

    const rows = await Promise.all(
      links.map(async (link) => {
        const signal = await ctx.db.get(link.signalId);
        if (!signal) return null;
        return {
          id: signal._id,
          verbatim: signal.verbatim,
          source: signal.source,
          severity: signal.severity,
          createdAt: new Date(signal._creationTime).toISOString(),
          linkedAt: new Date(link._creationTime).toISOString(),
          confidence: link.confidence ?? null,
          linkedBy: link.linkedBy
            ? { id: link.linkedBy, name: link.linkedBy }
            : null,
        };
      }),
    );

    return rows.filter(Boolean);
  },
});

// ── Mutations ─────────────────────────────────────────────────────────────────

export const create = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    verbatim: v.string(),
    source: v.string(),
    status: v.optional(v.string()),
    interpretation: v.optional(v.string()),
    severity: v.optional(v.string()),
    frequency: v.optional(v.string()),
    userSegment: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    classification: v.optional(v.any()),
    inboxItemId: v.optional(v.id("inboxItems")),
    sourceRef: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const signalId = await ctx.db.insert("signals", {
      workspaceId: args.workspaceId,
      verbatim: args.verbatim,
      source: args.source,
      status: args.status ?? "pending",
      interpretation: args.interpretation,
      severity: args.severity,
      frequency: args.frequency,
      userSegment: args.userSegment,
      tags: args.tags,
      classification: args.classification,
      inboxItemId: args.inboxItemId,
      sourceRef: args.sourceRef,
    });

    // Auto-create graph node for this signal
    await ctx.scheduler.runAfter(0, internal.graph.autoCreateSignalNode, {
      workspaceId: args.workspaceId,
      signalId,
      verbatim: args.verbatim,
      source: args.source,
      severity: args.severity,
    });

    // GTM-50c: Auto-create inbox item + schedule AI processing pipeline
    await ctx.scheduler.runAfter(0, internal.inbox.createAndProcess, {
      workspaceId: args.workspaceId,
      signalId,
      verbatim: args.verbatim,
      source: args.source,
      severity: args.severity,
    });

    return signalId;
  },
});

export const update = mutation({
  args: {
    signalId: v.id("signals"),
    verbatim: v.optional(v.string()),
    interpretation: v.optional(v.string()),
    severity: v.optional(v.string()),
    frequency: v.optional(v.string()),
    userSegment: v.optional(v.string()),
    status: v.optional(v.string()),
    classification: v.optional(v.any()),
    tags: v.optional(v.array(v.string())),
    neonSignalId: v.optional(v.string()),
    processedAt: v.optional(v.union(v.number(), v.null())),
  },
  handler: async (ctx, { signalId, ...patch }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const updates: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(patch)) {
      if (v !== undefined) updates[k] = v;
    }
    await ctx.db.patch(signalId, updates);
    return await ctx.db.get(signalId);
  },
});

export const linkToProject = mutation({
  args: {
    signalId: v.id("signals"),
    projectId: v.id("projects"),
    confidence: v.optional(v.number()),
    linkedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    // Idempotent: skip if already linked
    const existing = await ctx.db
      .query("signalProjects")
      .withIndex("by_signal", (q) => q.eq("signalId", args.signalId))
      .filter((q) => q.eq(q.field("projectId"), args.projectId))
      .unique();
    if (existing) return existing._id;
    const linkId = await ctx.db.insert("signalProjects", {
      signalId: args.signalId,
      projectId: args.projectId,
      confidence: args.confidence,
      linkedBy: args.linkedBy,
    });

    // Create graph edge: signal → project (linked_to)
    const signal = await ctx.db.get(args.signalId);
    if (signal) {
      await ctx.scheduler.runAfter(0, internal.graph.linkSignalToProjectNode, {
        workspaceId: signal.workspaceId,
        signalId: args.signalId,
        projectId: args.projectId,
        confidence: args.confidence,
      });
    }

    return linkId;
  },
});

export const unlinkFromProject = mutation({
  args: {
    signalId: v.id("signals"),
    projectId: v.id("projects"),
  },
  handler: async (ctx, { signalId, projectId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const existing = await ctx.db
      .query("signalProjects")
      .withIndex("by_signal", (q) => q.eq("signalId", signalId))
      .filter((q) => q.eq(q.field("projectId"), projectId))
      .unique();
    if (!existing) return null;
    await ctx.db.delete(existing._id);

    const remaining = await ctx.db
      .query("signalProjects")
      .withIndex("by_signal", (q) => q.eq("signalId", signalId))
      .collect();
    if (remaining.length === 0) {
      await ctx.db.patch(signalId, { status: "reviewed" });
    }
    return existing._id;
  },
});

// Internal version used by server-side actions (no auth required)
export const linkToProjectInternal = internalMutation({
  args: {
    signalId: v.id("signals"),
    projectId: v.id("projects"),
    confidence: v.optional(v.number()),
    linkedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("signalProjects")
      .withIndex("by_signal", (q) => q.eq("signalId", args.signalId))
      .filter((q) => q.eq(q.field("projectId"), args.projectId))
      .unique();
    if (existing) return existing._id;
    const linkId = await ctx.db.insert("signalProjects", {
      signalId: args.signalId,
      projectId: args.projectId,
      confidence: args.confidence,
      linkedBy: args.linkedBy,
    });
    const signal = await ctx.db.get(args.signalId);
    if (signal) {
      await ctx.scheduler.runAfter(0, internal.graph.linkSignalToProjectNode, {
        workspaceId: signal.workspaceId,
        signalId: args.signalId,
        projectId: args.projectId,
        confidence: args.confidence,
      });
    }
    return linkId;
  },
});

export const remove = mutation({
  args: { signalId: v.id("signals") },
  handler: async (ctx, { signalId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    // Remove all project links first
    const links = await ctx.db
      .query("signalProjects")
      .withIndex("by_signal", (q) => q.eq("signalId", signalId))
      .collect();
    await Promise.all(links.map((l) => ctx.db.delete(l._id)));
    await ctx.db.delete(signalId);
  },
});

export const listWithEmbeddings = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, { workspaceId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    // Return all signals that have an embeddingVector stored
    const all = await ctx.db
      .query("signals")
      .withIndex("by_workspace_status", (q) => q.eq("workspaceId", workspaceId))
      .collect();
    return all.filter((s) => s.embeddingVector && s.embeddingVector.length > 0);
  },
});

export const storeEmbedding = mutation({
  args: {
    signalId: v.id("signals"),
    embeddingVector: v.array(v.float64()),
  },
  handler: async (ctx, { signalId, embeddingVector }) => {
    await ctx.db.patch(signalId, {
      embeddingVector,
      embeddingUpdatedAt: Date.now(),
    });
  },
});

export const getBySourceRef = query({
  args: {
    workspaceId: v.id("workspaces"),
    sourceRef: v.string(),
  },
  handler: async (ctx, { workspaceId, sourceRef }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return await ctx.db
      .query("signals")
      .withIndex("by_workspace_status", (q) => q.eq("workspaceId", workspaceId))
      .filter((q) => q.eq(q.field("sourceRef"), sourceRef))
      .first();
  },
});

// No-auth mutation for inbound webhooks (key auth is handled at the HTTP layer)
export const createFromWebhook = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    verbatim: v.string(),
    sourceRef: v.string(),
    interpretation: v.optional(v.string()),
    severity: v.optional(v.string()),
    frequency: v.optional(v.string()),
    userSegment: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    // Idempotency: skip if a signal with this sourceRef already exists
    const existing = await ctx.db
      .query("signals")
      .withIndex("by_workspace_status", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq(q.field("sourceRef"), args.sourceRef))
      .first();
    if (existing) {
      return { signalId: existing._id, duplicate: true };
    }

    const signalId = await ctx.db.insert("signals", {
      workspaceId: args.workspaceId,
      verbatim: args.verbatim,
      source: "webhook",
      status: "new",
      sourceRef: args.sourceRef,
      interpretation: args.interpretation,
      severity: args.severity,
      frequency: args.frequency,
      userSegment: args.userSegment,
      tags: args.tags,
    });

    await ctx.scheduler.runAfter(0, internal.graph.autoCreateSignalNode, {
      workspaceId: args.workspaceId,
      signalId,
      verbatim: args.verbatim,
      source: "webhook",
      severity: args.severity,
    });

    await ctx.scheduler.runAfter(0, internal.inbox.createAndProcess, {
      workspaceId: args.workspaceId,
      signalId,
      verbatim: args.verbatim,
      source: "webhook",
      severity: args.severity,
    });

    return { signalId, duplicate: false };
  },
});

// Internal bulk status update — used by server-side maintenance operations
export const bulkUpdateStatusInternal = internalMutation({
  args: {
    signalIds: v.array(v.id("signals")),
    status: v.string(),
  },
  handler: async (ctx, { signalIds, status }) => {
    await Promise.all(signalIds.map((id) => ctx.db.patch(id, { status })));
    return signalIds.length;
  },
});

// Internal single-signal status update — used by server-side operations
export const updateStatusInternal = internalMutation({
  args: {
    signalId: v.id("signals"),
    status: v.string(),
  },
  handler: async (ctx, { signalId, status }) => {
    await ctx.db.patch(signalId, { status });
  },
});

// Internal query to list signal-project links for a signal (used by HTTP actions)
export const getProjectLinksInternal = internalQuery({
  args: { signalId: v.id("signals") },
  handler: async (ctx, { signalId }) => {
    return await ctx.db
      .query("signalProjects")
      .withIndex("by_signal", (q) => q.eq("signalId", signalId))
      .collect();
  },
});

// No-auth signal creation for server-side integrations (Slack, Pylon, etc.)
export const createFromIntegration = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    verbatim: v.string(),
    source: v.string(),
    sourceRef: v.string(),
    sourceMetadata: v.optional(v.any()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Idempotency: skip if a signal with this sourceRef already exists
    const existing = await ctx.db
      .query("signals")
      .withIndex("by_workspace_status", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq(q.field("sourceRef"), args.sourceRef))
      .first();
    if (existing) {
      return { signalId: existing._id, duplicate: true };
    }

    const signalId = await ctx.db.insert("signals", {
      workspaceId: args.workspaceId,
      verbatim: args.verbatim,
      source: args.source,
      sourceRef: args.sourceRef,
      sourceMetadata: args.sourceMetadata,
      status: args.status ?? "new",
    });

    return { signalId, duplicate: false };
  },
});
