/**
 * Stage Runs — Convex-backed execution worker control plane
 *
 * Replaces the Postgres stage_runs / run_logs / artifacts / worker_heartbeats tables.
 * External worker processes use these mutations to claim, execute, and report runs.
 *
 * Claim safety:
 *   claimRun() atomically sets status = "running" only if the run is still "queued".
 *   If two workers race, the second caller gets null back and backs off.
 */

import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// ── Run Creation ─────────────────────────────────────────────────────────────

export const create = mutation({
  args: {
    cardId: v.string(),
    workspaceId: v.id("workspaces"),
    stage: v.string(),
    automationLevel: v.optional(v.string()),
    provider: v.optional(v.string()),
    triggeredBy: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const automationLevel = args.automationLevel ?? "human_approval";
    const provider = args.provider ?? "anthropic";
    const idempotencyKey = `${args.cardId}:${args.stage}:${Date.now()}`;

    // Idempotency: return existing queued/running run for same card+stage
    const existing = await ctx.db
      .query("stageRuns")
      .withIndex("by_card_stage", (q) =>
        q.eq("cardId", args.cardId).eq("stage", args.stage),
      )
      .filter((q) =>
        q.or(
          q.eq(q.field("status"), "queued"),
          q.eq(q.field("status"), "running"),
        ),
      )
      .first();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("stageRuns", {
      cardId: args.cardId,
      workspaceId: args.workspaceId,
      stage: args.stage,
      status: "queued",
      automationLevel,
      provider,
      attempt: 1,
      idempotencyKey,
      triggeredBy: args.triggeredBy,
      metadata: args.metadata,
    });
  },
});

// ── Worker Claim (atomic, safe for parallel workers) ─────────────────────────

export const claim = mutation({
  args: {
    runId: v.id("stageRuns"),
    workerId: v.string(),
  },
  handler: async (ctx, { runId, workerId }) => {
    const run = await ctx.db.get(runId);
    if (!run || run.status !== "queued") {
      return null; // Already claimed or doesn't exist
    }

    await ctx.db.patch(runId, {
      status: "running",
      claimedBy: workerId,
      claimedAt: Date.now(),
      startedAt: Date.now(),
    });

    return run;
  },
});

// ── Run Completion ────────────────────────────────────────────────────────────

export const complete = mutation({
  args: {
    runId: v.id("stageRuns"),
    status: v.union(
      v.literal("succeeded"),
      v.literal("failed"),
      v.literal("cancelled"),
    ),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, { runId, status, errorMessage }) => {
    await ctx.db.patch(runId, {
      status,
      completedAt: Date.now(),
      errorMessage,
    });
  },
});

// ── Retry ─────────────────────────────────────────────────────────────────────

export const retry = mutation({
  args: { runId: v.id("stageRuns") },
  handler: async (ctx, { runId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const original = await ctx.db.get(runId);
    if (!original) throw new Error("Run not found");
    if (original.status !== "failed" && original.status !== "cancelled") {
      throw new Error("Can only retry failed or cancelled runs");
    }

    return await ctx.db.insert("stageRuns", {
      cardId: original.cardId,
      workspaceId: original.workspaceId,
      stage: original.stage,
      status: "queued",
      automationLevel: original.automationLevel,
      provider: original.provider,
      attempt: original.attempt + 1,
      idempotencyKey: `${original.cardId}:${original.stage}:${Date.now()}`,
      triggeredBy: "retry",
      metadata: original.metadata,
    });
  },
});

// ── Logs ──────────────────────────────────────────────────────────────────────

export const addLog = mutation({
  args: {
    runId: v.id("stageRuns"),
    workspaceId: v.id("workspaces"),
    level: v.string(),
    message: v.string(),
    stepKey: v.optional(v.string()),
    meta: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("runLogs", args);
  },
});

export const getLogs = query({
  args: { runId: v.id("stageRuns") },
  handler: async (ctx, { runId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db
      .query("runLogs")
      .withIndex("by_run", (q) => q.eq("runId", runId))
      .collect();
  },
});

// ── Artifacts ─────────────────────────────────────────────────────────────────

export const addArtifact = mutation({
  args: {
    runId: v.id("stageRuns"),
    workspaceId: v.id("workspaces"),
    cardId: v.string(),
    type: v.string(),
    content: v.optional(v.string()),
    url: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("artifacts", args);
  },
});

export const getArtifacts = query({
  args: { runId: v.id("stageRuns") },
  handler: async (ctx, { runId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db
      .query("artifacts")
      .withIndex("by_run", (q) => q.eq("runId", runId))
      .collect();
  },
});

// ── Queries ───────────────────────────────────────────────────────────────────

export const get = query({
  args: { runId: v.id("stageRuns") },
  handler: async (ctx, { runId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db.get(runId);
  },
});

export const listByWorkspace = query({
  args: {
    workspaceId: v.id("workspaces"),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { workspaceId, status, limit }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const q = ctx.db
      .query("stageRuns")
      .withIndex("by_workspace_status", (q) => {
        const base = q.eq("workspaceId", workspaceId);
        return status ? base.eq("status", status) : base;
      })
      .order("desc");

    return limit ? await q.take(limit) : await q.collect();
  },
});

export const listByCard = query({
  args: {
    cardId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { cardId, limit }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const q = ctx.db
      .query("stageRuns")
      .withIndex("by_card_stage", (q) => q.eq("cardId", cardId))
      .order("desc");

    return limit ? await q.take(limit) : await q.collect();
  },
});

export const listQueued = query({
  args: {
    workspaceId: v.optional(v.id("workspaces")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { workspaceId, limit }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    if (workspaceId) {
      const q = ctx.db
        .query("stageRuns")
        .withIndex("by_workspace_status", (q) =>
          q.eq("workspaceId", workspaceId).eq("status", "queued"),
        );
      return limit ? await q.take(limit) : await q.collect();
    }

    // Cross-workspace query (worker polling all workspaces)
    const q = ctx.db.query("stageRuns").filter((q) =>
      q.eq(q.field("status"), "queued"),
    );
    return limit ? await q.take(limit) : await q.collect();
  },
});

// ── Worker Heartbeats ─────────────────────────────────────────────────────────

export const upsertHeartbeat = mutation({
  args: {
    workerId: v.string(),
    workspaceId: v.optional(v.id("workspaces")),
    activeRunIds: v.optional(v.array(v.string())),
    processedCount: v.optional(v.number()),
    failedCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("workerHeartbeats")
      .withIndex("by_worker", (q) => q.eq("workerId", args.workerId))
      .first();

    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, {
        lastSeen: now,
        activeRunIds: args.activeRunIds ?? existing.activeRunIds,
        processedCount: (existing.processedCount ?? 0) + (args.processedCount ?? 0),
        failedCount: (existing.failedCount ?? 0) + (args.failedCount ?? 0),
      });
      return existing._id;
    }

    return await ctx.db.insert("workerHeartbeats", {
      workerId: args.workerId,
      workspaceId: args.workspaceId,
      lastSeen: now,
      activeRunIds: args.activeRunIds ?? [],
      processedCount: args.processedCount ?? 0,
      failedCount: args.failedCount ?? 0,
    });
  },
});

export const getActiveWorkers = query({
  args: {
    workspaceId: v.optional(v.id("workspaces")),
    staleAfterMs: v.optional(v.number()),
  },
  handler: async (ctx, { workspaceId, staleAfterMs }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const threshold = Date.now() - (staleAfterMs ?? 60_000);
    const all = await ctx.db.query("workerHeartbeats").collect();

    return all.filter((w) => {
      if (w.lastSeen < threshold) return false;
      if (workspaceId && w.workspaceId && w.workspaceId !== workspaceId) return false;
      return true;
    });
  },
});

// ── Stage Recipes ─────────────────────────────────────────────────────────────

export const getRecipe = query({
  args: {
    workspaceId: v.id("workspaces"),
    stage: v.string(),
  },
  handler: async (ctx, { workspaceId, stage }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db
      .query("stageRecipes")
      .withIndex("by_workspace_stage", (q) =>
        q.eq("workspaceId", workspaceId).eq("stage", stage),
      )
      .first();
  },
});

export const listRecipes = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, { workspaceId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db
      .query("stageRecipes")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .collect();
  },
});

export const upsertRecipe = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    stage: v.string(),
    automationLevel: v.string(),
    provider: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    gates: v.optional(v.array(v.string())),
    enabled: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("stageRecipes")
      .withIndex("by_workspace_stage", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("stage", args.stage),
      )
      .first();

    const data = {
      workspaceId: args.workspaceId,
      stage: args.stage,
      automationLevel: args.automationLevel,
      provider: args.provider ?? "anthropic",
      skills: args.skills ?? [],
      gates: args.gates ?? [],
      enabled: args.enabled ?? true,
    };

    if (existing) {
      await ctx.db.patch(existing._id, data);
      return existing._id;
    }
    return await ctx.db.insert("stageRecipes", data);
  },
});

// ── Rescue stale "running" runs ───────────────────────────────────────────────

export const rescueStale = internalMutation({
  args: { staleAfterMs: v.optional(v.number()) },
  handler: async (ctx, { staleAfterMs }) => {
    const threshold = Date.now() - (staleAfterMs ?? 10 * 60 * 1000); // 10 min default
    const running = await ctx.db
      .query("stageRuns")
      .filter((q) => q.eq(q.field("status"), "running"))
      .collect();

    let rescued = 0;
    for (const run of running) {
      const claimedAt = run.claimedAt ?? 0;
      if (claimedAt < threshold) {
        await ctx.db.patch(run._id, {
          status: "queued",
          claimedBy: undefined,
          claimedAt: undefined,
          startedAt: undefined,
        });
        rescued++;
      }
    }
    return rescued;
  },
});

// ── Stage Recipe extended operations ─────────────────────────────────────────

export const deleteRecipe = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    stage: v.string(),
  },
  handler: async (ctx, { workspaceId, stage }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const existing = await ctx.db
      .query("stageRecipes")
      .withIndex("by_workspace_stage", (q) =>
        q.eq("workspaceId", workspaceId).eq("stage", stage),
      )
      .first();
    if (!existing) return false;
    await ctx.db.delete(existing._id);
    return true;
  },
});

export const upsertRecipeFull = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    stage: v.string(),
    automationLevel: v.string(),
    provider: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    gates: v.optional(v.array(v.string())),
    enabled: v.optional(v.boolean()),
    recipeSteps: v.optional(v.any()),
    gateDefinitions: v.optional(v.any()),
    onFailBehavior: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("stageRecipes")
      .withIndex("by_workspace_stage", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("stage", args.stage),
      )
      .first();

    const data = {
      workspaceId: args.workspaceId,
      stage: args.stage,
      automationLevel: args.automationLevel,
      provider: args.provider ?? "anthropic",
      skills: args.skills ?? [],
      gates: args.gates ?? [],
      enabled: args.enabled ?? true,
      recipeSteps: args.recipeSteps,
      gateDefinitions: args.gateDefinitions,
      onFailBehavior: args.onFailBehavior,
    };

    if (existing) {
      await ctx.db.patch(existing._id, data);
      return existing._id;
    }
    return await ctx.db.insert("stageRecipes", data);
  },
});
