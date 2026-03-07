/**
 * Internal query/mutation wrappers for the MCP HTTP API.
 * Called from http.ts routes — no user auth required (system-level access).
 */

import { internal } from "./_generated/api";
import { internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import {
  archivePromotedMirrorNode,
  buildWorkspaceContextItems,
  buildWorkspaceRuntimeSearch,
  buildProjectRuntimeItems,
  isWorkspaceAuthorityContextItem,
  loadWorkspaceGraphNodeMap,
  matchesRuntimeContextTypes,
  sortRuntimeRecords,
  upsertPromotedMirrorNode,
} from "./runtimeMemory";

// ── Projects ──────────────────────────────────────────────────────────────────

export const listProjects = internalQuery({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, { workspaceId }) => {
    return await ctx.db
      .query("projects")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .collect();
  },
});

export const getProject = internalQuery({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => ctx.db.get(projectId),
});

export const getDocuments = internalQuery({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    return await ctx.db
      .query("documents")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .collect();
  },
});

export const getDocument = internalQuery({
  args: { documentId: v.id("documents") },
  handler: async (ctx, { documentId }) => ctx.db.get(documentId),
});

export const createProject = internalMutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    description: v.optional(v.string()),
    stage: v.string(),
    priority: v.string(),
  },
  handler: async (ctx, args) => {
    const projectId = await ctx.db.insert("projects", {
      workspaceId: args.workspaceId,
      name: args.name,
      description: args.description,
      stage: args.stage,
      status: "on_track",
      priority: args.priority,
      metadata: {},
    });
    await ctx.scheduler.runAfter(0, internal.graph.autoCreateProjectNode, {
      workspaceId: args.workspaceId,
      projectId,
      projectName: args.name,
    });
    return projectId;
  },
});

export const updateProject = internalMutation({
  args: {
    projectId: v.id("projects"),
    stage: v.optional(v.string()),
    status: v.optional(v.string()),
    priority: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, { projectId, ...patch }) => {
    const updates: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(patch)) {
      if (val !== undefined) updates[k] = val;
    }
    await ctx.db.patch(projectId, updates);
  },
});

// ── Signals ───────────────────────────────────────────────────────────────────

export const listSignals = internalQuery({
  args: {
    workspaceId: v.id("workspaces"),
    status: v.optional(v.string()),
  },
  handler: async (ctx, { workspaceId, status }) => {
    const all = await ctx.db
      .query("signals")
      .withIndex("by_workspace_status", (q) => q.eq("workspaceId", workspaceId))
      .collect();
    return status ? all.filter((s) => s.status === status) : all;
  },
});

export const createSignal = internalMutation({
  args: {
    workspaceId: v.id("workspaces"),
    verbatim: v.string(),
    source: v.string(),
    severity: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const signalId = await ctx.db.insert("signals", {
      workspaceId: args.workspaceId,
      verbatim: args.verbatim,
      source: args.source,
      severity: args.severity,
      status: "new",
    });
    await ctx.scheduler.runAfter(0, internal.graph.autoCreateSignalNode, {
      workspaceId: args.workspaceId,
      signalId,
      verbatim: args.verbatim,
      source: args.source,
      severity: args.severity,
    });
    return signalId;
  },
});

// ── Agents ────────────────────────────────────────────────────────────────────

export const listAgents = internalQuery({
  args: {
    workspaceId: v.id("workspaces"),
    type: v.optional(v.string()),
  },
  handler: async (ctx, { workspaceId, type }) => {
    const all = await ctx.db
      .query("agentDefinitions")
      .withIndex("by_workspace_type", (q) => q.eq("workspaceId", workspaceId))
      .collect();
    return type ? all.filter((a) => a.type === type) : all;
  },
});

// ── Jobs ──────────────────────────────────────────────────────────────────────

export const listJobs = internalQuery({
  args: {
    workspaceId: v.id("workspaces"),
    status: v.optional(v.string()),
  },
  handler: async (ctx, { workspaceId, status }) => {
    const all = await ctx.db
      .query("jobs")
      .withIndex("by_workspace_status", (q) => q.eq("workspaceId", workspaceId))
      .collect();
    return status ? all.filter((j) => j.status === status) : all;
  },
});

export const getJob = internalQuery({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, { jobId }) => ctx.db.get(jobId),
});

export const getJobLogs = internalQuery({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, { jobId }) => {
    return await ctx.db
      .query("jobLogs")
      .withIndex("by_job", (q) => q.eq("jobId", jobId))
      .collect();
  },
});

export const createJob = internalMutation({
  args: {
    workspaceId: v.id("workspaces"),
    projectId: v.optional(v.id("projects")),
    type: v.string(),
    input: v.any(),
    agentDefinitionId: v.optional(v.id("agentDefinitions")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("jobs", {
      workspaceId: args.workspaceId,
      projectId: args.projectId,
      type: args.type,
      status: "pending",
      input: args.input,
      output: null,
      attempt: 0,
      agentDefinitionId: args.agentDefinitionId,
      initiatedBy: "system",
      initiatedByName: "MCP",
      rootInitiator: "system",
      rootInitiatorName: "MCP",
    });
  },
});

export const seedInboxItem = internalMutation({
  args: {
    workspaceId: v.id("workspaces"),
    source: v.string(),
    title: v.string(),
    rawContent: v.string(),
    type: v.optional(v.string()),
    tldr: v.optional(v.string()),
    impactScore: v.optional(v.number()),
    suggestsVisionUpdate: v.optional(v.boolean()),
    assignedProjectId: v.optional(v.id("projects")),
    projectDirectionChange: v.optional(v.any()),
    extractedProblems: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("inboxItems", {
      workspaceId: args.workspaceId,
      type: args.type ?? "signal",
      source: args.source,
      title: args.title,
      rawContent: args.rawContent,
      status: args.assignedProjectId ? "assigned" : "pending",
      tldr: args.tldr,
      impactScore: args.impactScore,
      suggestsVisionUpdate: args.suggestsVisionUpdate,
      assignedProjectId: args.assignedProjectId,
      projectDirectionChange: args.projectDirectionChange,
      extractedProblems: args.extractedProblems,
      aiSummary: "Seeded by E2E fixture",
    });
  },
});

export const seedPendingQuestionScenario = internalMutation({
  args: {
    workspaceId: v.id("workspaces"),
    projectId: v.optional(v.id("projects")),
    questionText: v.string(),
    choices: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const jobId = await ctx.db.insert("jobs", {
      workspaceId: args.workspaceId,
      projectId: args.projectId,
      type: "execute_agent_definition",
      status: "waiting_input",
      input: { seeded: true, scenario: "pending-question" },
      output: null,
      attempt: 0,
      progress: 0.5,
      initiatedBy: "system",
      initiatedByName: "E2E Seed",
      rootInitiator: "system",
      rootInitiatorName: "E2E Seed",
    });

    const questionId = await ctx.db.insert("pendingQuestions", {
      jobId,
      workspaceId: args.workspaceId,
      projectId: args.projectId,
      questionType: args.choices && args.choices.length > 0 ? "choice" : "blocking",
      questionText: args.questionText,
      choices: args.choices,
      context: { hint: "Seeded by E2E fixture" },
      status: "pending",
    });

    await ctx.db.insert("jobLogs", {
      jobId,
      workspaceId: args.workspaceId,
      level: "info",
      message: "Seeded pending question for E2E validation",
      stepKey: "awaiting_input",
    });

    return { jobId, questionId };
  },
});

// ── Pending questions ─────────────────────────────────────────────────────────

export const listPendingQuestions = internalQuery({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, { workspaceId }) => {
    return await ctx.db
      .query("pendingQuestions")
      .withIndex("by_workspace_status", (q) =>
        q.eq("workspaceId", workspaceId).eq("status", "pending"),
      )
      .collect();
  },
});

export const answerQuestion = internalMutation({
  args: {
    questionId: v.id("pendingQuestions"),
    response: v.any(),
  },
  handler: async (ctx, { questionId, response }) => {
    const question = await ctx.db.get(questionId);
    if (!question) throw new Error("Question not found");
    await ctx.db.patch(questionId, { status: "answered", response });
    await ctx.db.patch(question.jobId, { status: "running" });
    await ctx.scheduler.runAfter(0, internal.agents.resume, {
      jobId: question.jobId,
      questionId,
    });
  },
});

// ── Commands ──────────────────────────────────────────────────────────────────

export const listCommands = internalQuery({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, { workspaceId }) => {
    return await ctx.db
      .query("agentDefinitions")
      .withIndex("by_workspace_type", (q) =>
        q.eq("workspaceId", workspaceId).eq("type", "command"),
      )
      .filter((q) => q.eq(q.field("enabled"), true))
      .collect();
  },
});

// ── Knowledge base ────────────────────────────────────────────────────────────

export const listKnowledge = internalQuery({
  args: {
    workspaceId: v.id("workspaces"),
    type: v.optional(v.string()),
  },
  handler: async (ctx, { workspaceId, type }) => {
    const all = await ctx.db
      .query("knowledgebaseEntries")
      .withIndex("by_workspace_type", (q) => q.eq("workspaceId", workspaceId))
      .collect();
    return type ? all.filter((e) => e.type === type) : all;
  },
});

export const upsertKnowledge = internalMutation({
  args: {
    workspaceId: v.id("workspaces"),
    type: v.string(),
    title: v.string(),
    content: v.string(),
    filePath: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const candidates = await ctx.db
      .query("knowledgebaseEntries")
      .withIndex("by_workspace_type", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("type", args.type),
      )
      .collect();

    const existing = args.filePath
      ? candidates.find((entry) => entry.filePath === args.filePath)
      : candidates[0];

    if (existing) {
      await ctx.db.patch(existing._id, {
        title: args.title,
        content: args.content,
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
      return await ctx.db.get(existing._id);
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
    return await ctx.db.get(id);
  },
});

export const removeKnowledge = internalMutation({
  args: { id: v.id("knowledgebaseEntries") },
  handler: async (ctx, { id }) => {
    await archivePromotedMirrorNode(ctx as never, {
      entityType: "context",
      entityId: id,
    });
    await ctx.db.delete(id);
    return { ok: true, archivedPromotionState: "superseded" as const };
  },
});

// ── Workspace access / memberships / invitations ─────────────────────────────

export const getWorkspace = internalQuery({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, { workspaceId }) => ctx.db.get(workspaceId),
});

export const updateWorkspace = internalMutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    contextPath: v.optional(v.string()),
    githubRepo: v.optional(v.string()),
    settings: v.optional(v.any()),
  },
  handler: async (ctx, { workspaceId, ...patch }) => {
    const updates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(patch)) {
      if (value !== undefined) updates[key] = value;
    }
    await ctx.db.patch(workspaceId, updates);
    return await ctx.db.get(workspaceId);
  },
});

export const getWorkspaceAccess = internalQuery({
  args: {
    workspaceId: v.id("workspaces"),
    clerkUserId: v.string(),
  },
  handler: async (ctx, { workspaceId, clerkUserId }) => {
    const workspace = await ctx.db.get(workspaceId);
    if (!workspace) return null;
    const membership = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_clerk_workspace", (q) =>
        q.eq("clerkUserId", clerkUserId).eq("workspaceId", workspaceId),
      )
      .unique();
    return membership ? { workspace, membership } : null;
  },
});

export const listWorkspaceMembers = internalQuery({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, { workspaceId }) => {
    return await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .collect();
  },
});

export const listWorkspaceInvitations = internalQuery({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, { workspaceId }) => {
    return await ctx.db
      .query("invitations")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .collect();
  },
});

export const listWorkspaceActivity = internalQuery({
  args: {
    workspaceId: v.id("workspaces"),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, { workspaceId, limit = 20, offset = 0 }) => {
    const rows = await ctx.db
      .query("activityLogs")
      .withIndex("by_workspace_created", (q) => q.eq("workspaceId", workspaceId))
      .collect();
    const sorted = rows.sort((a, b) => b.createdAt - a.createdAt);
    return sorted.slice(offset, offset + limit).map((row) => ({
      id: row._id,
      workspaceId: row.workspaceId,
      userId: row.userId ?? null,
      action: row.action,
      targetType: row.targetType ?? null,
      targetId: row.targetId ?? null,
      metadata: row.metadata ?? null,
      createdAt: new Date(row.createdAt).toISOString(),
      user: row.actorEmail || row.actorName || row.actorImage
        ? {
            id: row.userId ?? "unknown",
            name: row.actorName ?? null,
            email: row.actorEmail ?? "",
            image: row.actorImage ?? null,
          }
        : null,
    }));
  },
});

export const createWorkspaceActivity = internalMutation({
  args: {
    workspaceId: v.id("workspaces"),
    userId: v.optional(v.string()),
    action: v.string(),
    targetType: v.optional(v.string()),
    targetId: v.optional(v.string()),
    metadata: v.optional(v.any()),
    actorName: v.optional(v.string()),
    actorEmail: v.optional(v.string()),
    actorImage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("activityLogs", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

// ── Column configs ────────────────────────────────────────────────────────────

export const listColumnConfigs = internalQuery({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, { workspaceId }) => {
    return await ctx.db
      .query("columnConfigs")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .collect();
  },
});

export const ensureDefaultColumnConfigs = internalMutation({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, { workspaceId }) => {
    const existing = await ctx.db
      .query("columnConfigs")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .collect();
    if (existing.length > 0) return existing;

    const defaults = [
      { stage: "inbox", displayName: "Inbox", color: "slate", autoTriggerJobs: [], requiredDocuments: [], requiredApprovals: 0, aiIterations: 0, rules: {}, humanInLoop: false, enabled: true },
      { stage: "discovery", displayName: "Discovery", color: "teal", autoTriggerJobs: ["analyze_transcript"], requiredDocuments: [], requiredApprovals: 0, aiIterations: 0, rules: {}, humanInLoop: false, enabled: true },
      { stage: "prd", displayName: "PRD", color: "purple", autoTriggerJobs: ["generate_prd", "generate_design_brief", "generate_engineering_spec", "generate_gtm_brief"], requiredDocuments: ["research"], requiredApprovals: 0, aiIterations: 0, rules: {}, humanInLoop: true, enabled: true },
      { stage: "design", displayName: "Design", color: "blue", autoTriggerJobs: [], requiredDocuments: ["prd", "design_brief", "engineering_spec"], requiredApprovals: 0, aiIterations: 0, rules: {}, humanInLoop: false, enabled: true },
      { stage: "prototype", displayName: "Prototype", color: "pink", autoTriggerJobs: ["build_prototype", "deploy_chromatic"], requiredDocuments: ["prd"], requiredApprovals: 0, aiIterations: 0, rules: {}, humanInLoop: true, enabled: true },
      { stage: "validate", displayName: "Validate", color: "amber", autoTriggerJobs: ["run_jury_evaluation"], requiredDocuments: ["prototype_notes"], requiredApprovals: 0, aiIterations: 0, rules: {}, humanInLoop: true, enabled: true },
      { stage: "tickets", displayName: "Tickets", color: "orange", autoTriggerJobs: ["generate_tickets", "validate_tickets"], requiredDocuments: ["engineering_spec"], requiredApprovals: 0, aiIterations: 0, rules: {}, humanInLoop: false, enabled: true },
      { stage: "build", displayName: "Build", color: "green", autoTriggerJobs: [], requiredDocuments: [], requiredApprovals: 0, aiIterations: 0, rules: {}, humanInLoop: false, enabled: true },
      { stage: "alpha", displayName: "Alpha", color: "cyan", autoTriggerJobs: [], requiredDocuments: [], requiredApprovals: 0, aiIterations: 0, rules: {}, humanInLoop: false, enabled: true },
      { stage: "beta", displayName: "Beta", color: "indigo", autoTriggerJobs: [], requiredDocuments: [], requiredApprovals: 0, aiIterations: 0, rules: {}, humanInLoop: false, enabled: true },
      { stage: "ga", displayName: "GA", color: "emerald", autoTriggerJobs: [], requiredDocuments: [], requiredApprovals: 0, aiIterations: 0, rules: {}, humanInLoop: false, enabled: true },
    ];
    for (let index = 0; index < defaults.length; index++) {
      const column = defaults[index];
      await ctx.db.insert("columnConfigs", { workspaceId, order: index, ...column });
    }
    return await ctx.db
      .query("columnConfigs")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .collect();
  },
});

export const createColumnConfig = internalMutation({
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
    const id = await ctx.db.insert("columnConfigs", {
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
    return await ctx.db.get(id);
  },
});

export const updateColumnConfig = internalMutation({
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
    const updates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(patch)) {
      if (value !== undefined) updates[key] = value;
    }
    await ctx.db.patch(columnId, updates);
    return await ctx.db.get(columnId);
  },
});

export const deleteColumnConfig = internalMutation({
  args: { columnId: v.id("columnConfigs") },
  handler: async (ctx, { columnId }) => {
    await ctx.db.delete(columnId);
    return { ok: true };
  },
});

export const createWorkspaceInvitation = internalMutation({
  args: {
    workspaceId: v.id("workspaces"),
    email: v.string(),
    role: v.string(),
    invitedBy: v.optional(v.string()),
    inviterName: v.optional(v.string()),
    inviterEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const normalizedEmail = args.email.trim().toLowerCase();
    const existing = await ctx.db
      .query("invitations")
      .withIndex("by_email_workspace", (q) =>
        q.eq("email", normalizedEmail).eq("workspaceId", args.workspaceId),
      )
      .collect();
    const pending = existing.find((invite) => !invite.acceptedAt && invite.expiresAt > Date.now());
    if (pending) throw new Error("An invitation for this email is already pending");

    const token = crypto.randomUUID().replace(/-/g, "");
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
    const id = await ctx.db.insert("invitations", {
      workspaceId: args.workspaceId,
      email: normalizedEmail,
      role: args.role,
      token,
      invitedBy: args.invitedBy,
      inviterName: args.inviterName,
      inviterEmail: args.inviterEmail,
      expiresAt,
    });
    return { id, token, email: normalizedEmail, role: args.role, expiresAt };
  },
});

export const revokeWorkspaceInvitation = internalMutation({
  args: { invitationId: v.id("invitations") },
  handler: async (ctx, { invitationId }) => {
    await ctx.db.delete(invitationId);
    return { ok: true };
  },
});

export const getInvitationByToken = internalQuery({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const invitation = await ctx.db
      .query("invitations")
      .withIndex("by_token", (q) => q.eq("token", token))
      .unique();
    if (!invitation) return null;
    const workspace = await ctx.db.get(invitation.workspaceId);
    return {
      ...invitation,
      workspace,
      isExpired: invitation.expiresAt < Date.now(),
      isAccepted: !!invitation.acceptedAt,
      isValid: !invitation.acceptedAt && invitation.expiresAt > Date.now(),
    };
  },
});

export const acceptInvitationByToken = internalMutation({
  args: {
    token: v.string(),
    userId: v.optional(v.string()),
    clerkUserId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const invitation = await ctx.db
      .query("invitations")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();
    if (!invitation) return { success: false, error: "Invitation not found" };
    if (invitation.expiresAt < Date.now()) return { success: false, error: "This invitation has expired" };
    if (invitation.acceptedAt) return { success: false, error: "This invitation has already been used" };
    if (invitation.email !== args.email.trim().toLowerCase()) {
      return { success: false, error: "Invitation email does not match signed-in user" };
    }

    const existing = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_clerk_workspace", (q) =>
        q.eq("clerkUserId", args.clerkUserId).eq("workspaceId", invitation.workspaceId),
      )
      .unique();
    if (!existing) {
      await ctx.db.insert("workspaceMembers", {
        workspaceId: invitation.workspaceId,
        userId: args.userId,
        clerkUserId: args.clerkUserId,
        email: args.email,
        displayName: args.name,
        image: args.image,
        role: invitation.role,
        joinedAt: Date.now(),
      });
    }
    await ctx.db.patch(invitation._id, { acceptedAt: Date.now() });
    return { success: true, workspaceId: invitation.workspaceId };
  },
});

// ── Personas / search ─────────────────────────────────────────────────────────

export const listPersonas = internalQuery({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, { workspaceId }) => {
    return await ctx.db
      .query("personas")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .collect();
  },
});

export const upsertPersona = internalMutation({
  args: {
    workspaceId: v.id("workspaces"),
    archetypeId: v.string(),
    name: v.string(),
    description: v.string(),
    role: v.any(),
    pains: v.array(v.string()),
    successCriteria: v.array(v.string()),
    evaluationHeuristics: v.array(v.string()),
    typicalTools: v.array(v.string()),
    fears: v.array(v.string()),
    psychographicRanges: v.any(),
    content: v.string(),
    filePath: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("personas")
      .withIndex("by_workspace_archetype", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("archetypeId", args.archetypeId),
      )
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args,
        version: existing.version + 1,
      });
      await upsertPromotedMirrorNode(ctx as never, {
        workspaceId: args.workspaceId,
        entityType: "persona",
        entityId: existing._id,
        title: args.name,
        content: args.content,
        domain: args.archetypeId,
        mirrorTable: "personas",
        mirrorId: existing._id,
        filePath: args.filePath,
        decayRate: 0.002,
      });
      return await ctx.db.get(existing._id);
    }
    const id = await ctx.db.insert("personas", {
      ...args,
      version: 1,
    });
    await upsertPromotedMirrorNode(ctx as never, {
      workspaceId: args.workspaceId,
      entityType: "persona",
      entityId: id,
      title: args.name,
      content: args.content,
      domain: args.archetypeId,
      mirrorTable: "personas",
      mirrorId: id,
      filePath: args.filePath,
      decayRate: 0.002,
    });
    return await ctx.db.get(id);
  },
});

export const listSignalPersonas = internalQuery({
  args: { signalId: v.id("signals") },
  handler: async (ctx, { signalId }) => {
    const links = await ctx.db
      .query("signalPersonas")
      .withIndex("by_signal", (q) => q.eq("signalId", signalId))
      .collect();
    const personas = await Promise.all(links.map((link) => ctx.db.get(link.personaId)));
    return links.map((link, index) => ({
      persona: personas[index],
      linkedAt: new Date(link._creationTime).toISOString(),
    })).filter((entry) => entry.persona);
  },
});

export const linkSignalPersona = internalMutation({
  args: {
    signalId: v.id("signals"),
    personaId: v.id("personas"),
    linkedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("signalPersonas")
      .withIndex("by_signal", (q) => q.eq("signalId", args.signalId))
      .filter((q) => q.eq(q.field("personaId"), args.personaId))
      .unique();
    if (existing) return existing._id;
    const linkId = await ctx.db.insert("signalPersonas", args);
    const signal = await ctx.db.get(args.signalId);
    const persona = await ctx.db.get(args.personaId);
    if (signal && persona) {
      await ctx.scheduler.runAfter(0, internal.graph.linkSignalToPersonaNode, {
        workspaceId: signal.workspaceId,
        signalId: args.signalId,
        personaId: args.personaId,
      });
    }
    return linkId;
  },
});

export const unlinkSignalPersona = internalMutation({
  args: {
    signalId: v.id("signals"),
    personaId: v.id("personas"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("signalPersonas")
      .withIndex("by_signal", (q) => q.eq("signalId", args.signalId))
      .filter((q) => q.eq(q.field("personaId"), args.personaId))
      .unique();
    if (!existing) return null;
    await ctx.db.delete(existing._id);
    const signal = await ctx.db.get(args.signalId);
    if (signal) {
      await ctx.scheduler.runAfter(0, internal.graph.unlinkSignalFromPersonaNode, {
        workspaceId: signal.workspaceId,
        signalId: args.signalId,
        personaId: args.personaId,
      });
    }
    return existing._id;
  },
});

export const searchWorkspace = internalQuery({
  args: {
    workspaceId: v.id("workspaces"),
    q: v.string(),
  },
  handler: async (ctx, args) => {
    return await buildWorkspaceRuntimeSearch(ctx as never, args.workspaceId, args.q);
  },
});

export const listWorkspaceRuntimeContext = internalQuery({
  args: {
    workspaceId: v.id("workspaces"),
    types: v.optional(v.array(v.string())),
  },
  handler: async (ctx, { workspaceId, types }) => {
    const graphNodeMap = await loadWorkspaceGraphNodeMap(ctx as never, workspaceId);
    const items = await buildWorkspaceContextItems(
      ctx as never,
      workspaceId,
      graphNodeMap,
    );
    return types?.length
      ? { items: items.filter((item) => matchesRuntimeContextTypes(item, types)) }
      : { items };
  },
});

export const getProjectRuntimeContext = internalQuery({
  args: {
    projectId: v.id("projects"),
    q: v.optional(v.string()),
  },
  handler: async (ctx, { projectId, q }) => {
    const project = await ctx.db.get(projectId);
    if (!project) return null;

    const graphNodeMap = await loadWorkspaceGraphNodeMap(
      ctx as never,
      project.workspaceId,
    );
    const [workspaceItems, projectItems] = await Promise.all([
      buildWorkspaceContextItems(
        ctx as never,
        project.workspaceId,
        graphNodeMap,
        q,
      ),
      buildProjectRuntimeItems(ctx as never, projectId, graphNodeMap, q),
    ]);

    return {
      project,
      items: sortRuntimeRecords([
        ...workspaceItems.filter((item) => isWorkspaceAuthorityContextItem(item)),
        ...projectItems,
      ]),
    };
  },
});

// ── Memory ────────────────────────────────────────────────────────────────────

export const storeMemory = internalMutation({
  args: {
    workspaceId: v.id("workspaces"),
    projectId: v.optional(v.id("projects")),
    type: v.string(),
    content: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("memoryEntries", {
      workspaceId: args.workspaceId,
      projectId: args.projectId,
      type: args.type,
      content: args.content,
      metadata: args.metadata,
    });
    const label = args.type.replace(/_/g, " ");
    const firstLine = args.content.trim().split("\n")[0] ?? "";
    const preview = firstLine.length > 64 ? `${firstLine.slice(0, 61)}...` : firstLine;
    await upsertPromotedMirrorNode(ctx as never, {
      workspaceId: args.workspaceId,
      entityType: "memory",
      entityId: id,
      title: `${label}: ${preview || "entry"}`,
      content: args.content,
      domain: args.type,
      mirrorTable: "memoryEntries",
      mirrorId: id,
      projectId: args.projectId,
      metadataSource:
        typeof args.metadata?.source === "string" ? args.metadata.source : undefined,
      provenanceSource:
        typeof args.metadata?.source === "string" ? args.metadata.source : undefined,
      decayRate: 0.015,
    });
    return id;
  },
});

export const getProjectMemory = internalQuery({
  args: {
    projectId: v.id("projects"),
    type: v.optional(v.string()),
  },
  handler: async (ctx, { projectId, type }) => {
    const all = await ctx.db
      .query("memoryEntries")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .collect();
    return type ? all.filter((e) => e.type === type) : all;
  },
});

export const getWorkspaceMemory = internalQuery({
  args: {
    workspaceId: v.id("workspaces"),
    type: v.optional(v.string()),
  },
  handler: async (ctx, { workspaceId, type }) => {
    const all = await ctx.db
      .query("memoryEntries")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .collect();
    return type ? all.filter((e) => e.type === type) : all;
  },
});

// ── Prototypes ────────────────────────────────────────────────────────────────

export const listPrototypeVariants = internalQuery({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    return await ctx.db
      .query("prototypeVariants")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .collect();
  },
});

export const getPrototypeVariant = internalQuery({
  args: { variantId: v.id("prototypeVariants") },
  handler: async (ctx, { variantId }) => ctx.db.get(variantId),
});

export const getPrototypeFeedback = internalQuery({
  args: { variantId: v.id("prototypeVariants") },
  handler: async (ctx, { variantId }) => {
    const links = await ctx.db
      .query("signalProtoVariants")
      .withIndex("by_variant", (q) => q.eq("prototypeVariantId", variantId))
      .collect();
    const signals = await Promise.all(links.map((l) => ctx.db.get(l.signalId)));
    return signals.filter(Boolean);
  },
});

export const updateProjectSlackChannel = internalMutation({
  args: {
    projectId: v.id("projects"),
    slackChannelId: v.string(),
    slackChannelName: v.optional(v.string()),
  },
  handler: async (ctx, { projectId, slackChannelId, slackChannelName }) => {
    await ctx.db.patch(projectId, { slackChannelId, slackChannelName });
  },
});
