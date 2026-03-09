import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";

// ── Queries ───────────────────────────────────────────────────────────────────

function getUnauthenticatedTasksFallback(identity: unknown): [] | null {
  return identity ? null : [];
}

export const byProject = query({
  args: {
    projectId: v.id("projects"),
    status: v.optional(v.string()),
  },
  handler: async (ctx, { projectId, status }) => {
    const identity = await ctx.auth.getUserIdentity();
    const unauthenticatedFallback = getUnauthenticatedTasksFallback(identity);
    if (unauthenticatedFallback) return unauthenticatedFallback;
    const all = await ctx.db
      .query("tasks")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .order("desc")
      .collect();
    if (status) return all.filter((t) => t.status === status);
    return all;
  },
});

export const byWorkspace = query({
  args: {
    workspaceId: v.id("workspaces"),
    status: v.optional(v.string()),
  },
  handler: async (ctx, { workspaceId, status }) => {
    const identity = await ctx.auth.getUserIdentity();
    const unauthenticatedFallback = getUnauthenticatedTasksFallback(identity);
    if (unauthenticatedFallback) return unauthenticatedFallback;
    const all = await ctx.db
      .query("tasks")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .order("desc")
      .collect();
    if (status) return all.filter((t) => t.status === status);
    return all;
  },
});

export const byAssigned = query({
  args: {
    assignedTo: v.string(),
    status: v.optional(v.string()),
  },
  handler: async (ctx, { assignedTo, status }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    if (status) {
      return await ctx.db
        .query("tasks")
        .withIndex("by_assigned", (q) =>
          q.eq("assignedTo", assignedTo).eq("status", status),
        )
        .order("desc")
        .collect();
    }
    return await ctx.db
      .query("tasks")
      .withIndex("by_assigned", (q) => q.eq("assignedTo", assignedTo))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, { taskId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db.get(taskId);
  },
});

// ── Mutations ─────────────────────────────────────────────────────────────────

export const create = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    projectId: v.optional(v.id("projects")),
    title: v.string(),
    description: v.optional(v.string()),
    priority: v.optional(v.string()),
    assignedTo: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    linkedJobId: v.optional(v.id("jobs")),
    linkedDocumentId: v.optional(v.id("documents")),
    sourceSignalId: v.optional(v.id("signals")),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db.insert("tasks", {
      workspaceId: args.workspaceId,
      projectId: args.projectId,
      title: args.title,
      description: args.description,
      status: "todo",
      priority: args.priority ?? "medium",
      assignedTo: args.assignedTo,
      createdBy: identity.subject,
      dueDate: args.dueDate,
      linkedJobId: args.linkedJobId,
      linkedDocumentId: args.linkedDocumentId,
      sourceSignalId: args.sourceSignalId,
      tags: args.tags,
    });
  },
});

// Internal version for agents to create tasks without user auth
export const createFromAgent = internalMutation({
  args: {
    workspaceId: v.id("workspaces"),
    projectId: v.optional(v.id("projects")),
    title: v.string(),
    description: v.optional(v.string()),
    priority: v.optional(v.string()),
    assignedTo: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    linkedJobId: v.optional(v.id("jobs")),
    linkedDocumentId: v.optional(v.id("documents")),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("tasks", {
      workspaceId: args.workspaceId,
      projectId: args.projectId,
      title: args.title,
      description: args.description,
      status: "todo",
      priority: args.priority ?? "medium",
      assignedTo: args.assignedTo,
      createdBy: "agent",
      dueDate: args.dueDate,
      linkedJobId: args.linkedJobId,
      linkedDocumentId: args.linkedDocumentId,
      tags: args.tags,
    });
  },
});

export const update = mutation({
  args: {
    taskId: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(v.string()),
    priority: v.optional(v.string()),
    assignedTo: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
    linkedJobId: v.optional(v.id("jobs")),
  },
  handler: async (ctx, { taskId, ...patch }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const updates: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(patch)) {
      if (val !== undefined) updates[k] = val;
    }
    await ctx.db.patch(taskId, updates);
    return await ctx.db.get(taskId);
  },
});

export const complete = mutation({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, { taskId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    await ctx.db.patch(taskId, { status: "done" });
  },
});

export const remove = mutation({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, { taskId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    await ctx.db.delete(taskId);
  },
});
