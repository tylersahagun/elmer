import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const DEFAULT_COLUMNS = [
  {
    stage: "inbox",
    displayName: "Inbox",
    color: "slate",
    autoTriggerJobs: [] as string[],
    requiredDocuments: [] as string[],
    requiredApprovals: 0,
    aiIterations: 0,
    rules: {},
    humanInLoop: false,
    enabled: true,
  },
  {
    stage: "discovery",
    displayName: "Discovery",
    color: "teal",
    autoTriggerJobs: ["analyze_transcript"],
    requiredDocuments: [] as string[],
    requiredApprovals: 0,
    aiIterations: 0,
    rules: {},
    humanInLoop: false,
    enabled: true,
  },
  {
    stage: "prd",
    displayName: "PRD",
    color: "purple",
    autoTriggerJobs: [
      "generate_prd",
      "generate_design_brief",
      "generate_engineering_spec",
      "generate_gtm_brief",
    ],
    requiredDocuments: ["research"] as string[],
    requiredApprovals: 0,
    aiIterations: 0,
    rules: {},
    humanInLoop: true,
    enabled: true,
  },
  {
    stage: "design",
    displayName: "Design",
    color: "blue",
    autoTriggerJobs: [] as string[],
    requiredDocuments: ["prd", "design_brief", "engineering_spec"] as string[],
    requiredApprovals: 0,
    aiIterations: 0,
    rules: {},
    humanInLoop: false,
    enabled: true,
  },
  {
    stage: "prototype",
    displayName: "Prototype",
    color: "pink",
    autoTriggerJobs: ["build_prototype", "deploy_chromatic"],
    requiredDocuments: ["prd"] as string[],
    requiredApprovals: 0,
    aiIterations: 0,
    rules: {},
    humanInLoop: true,
    enabled: true,
  },
  {
    stage: "validate",
    displayName: "Validate",
    color: "amber",
    autoTriggerJobs: ["run_jury_evaluation"],
    requiredDocuments: ["prototype_notes"] as string[],
    requiredApprovals: 0,
    aiIterations: 0,
    rules: {},
    humanInLoop: true,
    enabled: true,
  },
  {
    stage: "tickets",
    displayName: "Tickets",
    color: "orange",
    autoTriggerJobs: ["generate_tickets", "validate_tickets"],
    requiredDocuments: ["engineering_spec"] as string[],
    requiredApprovals: 0,
    aiIterations: 0,
    rules: {},
    humanInLoop: false,
    enabled: true,
  },
  { stage: "build", displayName: "Build", color: "green", autoTriggerJobs: [], requiredDocuments: [], requiredApprovals: 0, aiIterations: 0, rules: {}, humanInLoop: false, enabled: true },
  { stage: "alpha", displayName: "Alpha", color: "cyan", autoTriggerJobs: [], requiredDocuments: [], requiredApprovals: 0, aiIterations: 0, rules: {}, humanInLoop: false, enabled: true },
  { stage: "beta", displayName: "Beta", color: "indigo", autoTriggerJobs: [], requiredDocuments: [], requiredApprovals: 0, aiIterations: 0, rules: {}, humanInLoop: false, enabled: true },
  { stage: "ga", displayName: "GA", color: "emerald", autoTriggerJobs: [], requiredDocuments: [], requiredApprovals: 0, aiIterations: 0, rules: {}, humanInLoop: false, enabled: true },
] as const;

export const listByWorkspace = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, { workspaceId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db
      .query("columnConfigs")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .collect();
  },
});

export const getById = query({
  args: { columnId: v.id("columnConfigs") },
  handler: async (ctx, { columnId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db.get(columnId);
  },
});

export const ensureDefaults = mutation({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, { workspaceId }) => {
    const existing = await ctx.db
      .query("columnConfigs")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .collect();
    if (existing.length > 0) return existing;

    for (let index = 0; index < DEFAULT_COLUMNS.length; index++) {
      const column = DEFAULT_COLUMNS[index];
      await ctx.db.insert("columnConfigs", {
        workspaceId,
        stage: column.stage,
        displayName: column.displayName,
        order: index,
        color: column.color,
        autoTriggerJobs: [...column.autoTriggerJobs],
        requiredDocuments: [...column.requiredDocuments],
        requiredApprovals: column.requiredApprovals,
        aiIterations: column.aiIterations,
        rules: column.rules,
        humanInLoop: column.humanInLoop,
        enabled: column.enabled,
      });
    }

    return await ctx.db
      .query("columnConfigs")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .collect();
  },
});

export const create = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    stage: v.string(),
    displayName: v.string(),
    order: v.number(),
    color: v.optional(v.string()),
    autoTriggerJobs: v.optional(v.array(v.string())),
    agentTriggers: v.optional(v.array(v.any())),
    requiredDocuments: v.optional(v.array(v.string())),
    requiredApprovals: v.optional(v.number()),
    aiIterations: v.optional(v.number()),
    rules: v.optional(v.any()),
    humanInLoop: v.optional(v.boolean()),
    enabled: v.optional(v.boolean()),
    graduationCriteria: v.optional(v.any()),
    enforceGraduation: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db.insert("columnConfigs", {
      ...args,
      color: args.color ?? "slate",
      autoTriggerJobs: args.autoTriggerJobs ?? [],
      agentTriggers: args.agentTriggers ?? [],
      requiredDocuments: args.requiredDocuments ?? [],
      requiredApprovals: args.requiredApprovals ?? 0,
      aiIterations: args.aiIterations ?? 0,
      rules: args.rules ?? {},
      humanInLoop: args.humanInLoop ?? false,
      enabled: args.enabled ?? true,
    });
  },
});

export const update = mutation({
  args: {
    columnId: v.id("columnConfigs"),
    displayName: v.optional(v.string()),
    order: v.optional(v.number()),
    color: v.optional(v.string()),
    autoTriggerJobs: v.optional(v.array(v.string())),
    agentTriggers: v.optional(v.array(v.any())),
    requiredDocuments: v.optional(v.array(v.string())),
    requiredApprovals: v.optional(v.number()),
    aiIterations: v.optional(v.number()),
    rules: v.optional(v.any()),
    humanInLoop: v.optional(v.boolean()),
    enabled: v.optional(v.boolean()),
    graduationCriteria: v.optional(v.any()),
    enforceGraduation: v.optional(v.boolean()),
  },
  handler: async (ctx, { columnId, ...patch }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const updates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(patch)) {
      if (value !== undefined) updates[key] = value;
    }
    await ctx.db.patch(columnId, updates);
    return await ctx.db.get(columnId);
  },
});

export const remove = mutation({
  args: { columnId: v.id("columnConfigs") },
  handler: async (ctx, { columnId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    await ctx.db.delete(columnId);
    return { ok: true };
  },
});
