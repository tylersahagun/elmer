/**
 * Internal query/mutation wrappers for the MCP HTTP API.
 * Called from http.ts routes — no user auth required (system-level access).
 */

import { internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";

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
    return await ctx.db.insert("projects", {
      workspaceId: args.workspaceId,
      name: args.name,
      description: args.description,
      stage: args.stage,
      status: "on_track",
      priority: args.priority,
      metadata: {},
    });
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
    return await ctx.db.insert("signals", {
      workspaceId: args.workspaceId,
      verbatim: args.verbatim,
      source: args.source,
      severity: args.severity,
      status: "new",
    });
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

// ── Memory ────────────────────────────────────────────────────────────────────

export const storeMemory = internalMutation({
  args: {
    workspaceId: v.id("workspaces"),
    projectId: v.optional(v.id("projects")),
    type: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("memoryEntries", {
      workspaceId: args.workspaceId,
      projectId: args.projectId,
      type: args.type,
      content: args.content,
    });
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

// Need to import internal for the answerQuestion scheduler call
import { internal } from "./_generated/api";
