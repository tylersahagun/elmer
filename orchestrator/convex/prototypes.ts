/**
 * Prototype Feedback Loop — GTM-53
 *
 * Three server-side actions that close the loop between prototypes and feedback:
 *
 *   postPrototypeToSlack(variantId)
 *     → Posts the Chromatic URL to the project's linked Slack channel.
 *       Stores the Slack message timestamp back on the variant so replies
 *       can be fetched later.
 *
 *   ingestPrototypeFeedback(variantId)
 *     → Reads all replies to the Slack thread for a variant, creates signals
 *       for each reply, links them to the project AND the variant via the
 *       signalProtoVariants join table.
 *
 *   iteratePrototype(variantId, instructions?)
 *     → Synthesizes the variant's feedback signals against the project's
 *       research doc, schedules a prototype-builder job with the synthesis,
 *       and creates a new prototypeVariant with parentVariantId set.
 */

import { action, internalAction, query, internalQuery, internalMutation, mutation } from "./_generated/server";
import { internal, api } from "./_generated/api";
import { v } from "convex/values";
import Anthropic from "@anthropic-ai/sdk";
import type { Id } from "./_generated/dataModel";

// ── Slack helpers ─────────────────────────────────────────────────────────────

async function slackPost(endpoint: string, body: Record<string, unknown>): Promise<unknown> {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) throw new Error("SLACK_BOT_TOKEN not configured in Convex env vars");

  const res = await fetch(`https://slack.com/api/${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`Slack API error ${res.status}`);
  const data = await res.json() as Record<string, unknown>;
  if (!data.ok) throw new Error(`Slack API error: ${data.error as string}`);
  return data;
}

async function slackGet(endpoint: string, params: Record<string, string>): Promise<unknown> {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) throw new Error("SLACK_BOT_TOKEN not configured in Convex env vars");

  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`https://slack.com/api/${endpoint}?${qs}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error(`Slack API error ${res.status}`);
  const data = await res.json() as Record<string, unknown>;
  if (!data.ok) throw new Error(`Slack API error: ${data.error as string}`);
  return data;
}

// ── Queries ───────────────────────────────────────────────────────────────────

export const listByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db
      .query("prototypeVariants")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .collect();
  },
});

export const get = query({
  args: { variantId: v.id("prototypeVariants") },
  handler: async (ctx, { variantId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db.get(variantId);
  },
});

export const getVariantFeedback = query({
  args: { variantId: v.id("prototypeVariants") },
  handler: async (ctx, { variantId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const links = await ctx.db
      .query("signalProtoVariants")
      .withIndex("by_variant", (q) => q.eq("prototypeVariantId", variantId))
      .collect();

    const signals = await Promise.all(links.map((l) => ctx.db.get(l.signalId)));
    return signals.filter(Boolean);
  },
});

export const getVariantLineage = query({
  args: { variantId: v.id("prototypeVariants") },
  handler: async (ctx, { variantId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const lineage = [];
    let current = await ctx.db.get(variantId);
    while (current) {
      lineage.unshift(current);
      if (!current.parentVariantId) break;
      current = await ctx.db.get(current.parentVariantId);
    }

    // Also get all children of the root
    const children = await ctx.db
      .query("prototypeVariants")
      .withIndex("by_parent", (q) => q.eq("parentVariantId", variantId))
      .collect();

    return { lineage, children };
  },
});

// ── Internal mutations ────────────────────────────────────────────────────────

export const create = internalMutation({
  args: {
    workspaceId: v.id("workspaces"),
    projectId: v.id("projects"),
    platform: v.string(),
    outputType: v.string(),
    title: v.string(),
    url: v.optional(v.string()),
    content: v.optional(v.string()),
    chromaticUrl: v.optional(v.string()),
    parentVariantId: v.optional(v.id("prototypeVariants")),
    iterationCount: v.optional(v.number()),
    generatedByJobId: v.optional(v.id("jobs")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("prototypeVariants", {
      workspaceId: args.workspaceId,
      projectId: args.projectId,
      platform: args.platform,
      outputType: args.outputType,
      title: args.title,
      url: args.url,
      content: args.content,
      chromaticUrl: args.chromaticUrl,
      status: "ready",
      parentVariantId: args.parentVariantId,
      iterationCount: args.iterationCount ?? 0,
      generatedByJobId: args.generatedByJobId,
    });
  },
});

export const setSlackMessageTs = internalMutation({
  args: {
    variantId: v.id("prototypeVariants"),
    slackMessageTs: v.string(),
  },
  handler: async (ctx, { variantId, slackMessageTs }) => {
    await ctx.db.patch(variantId, { slackMessageTs });
  },
});

export const linkSignalToVariant = internalMutation({
  args: {
    signalId: v.id("signals"),
    prototypeVariantId: v.id("prototypeVariants"),
    feedbackSource: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("signalProtoVariants")
      .withIndex("by_signal", (q) => q.eq("signalId", args.signalId))
      .filter((q) => q.eq(q.field("prototypeVariantId"), args.prototypeVariantId))
      .unique();
    if (existing) return existing._id;
    return await ctx.db.insert("signalProtoVariants", {
      signalId: args.signalId,
      prototypeVariantId: args.prototypeVariantId,
      feedbackSource: args.feedbackSource,
    });
  },
});

// Public mutation for UI use
export const createVariant = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    projectId: v.id("projects"),
    platform: v.string(),
    outputType: v.string(),
    title: v.string(),
    url: v.optional(v.string()),
    content: v.optional(v.string()),
    chromaticUrl: v.optional(v.string()),
    parentVariantId: v.optional(v.id("prototypeVariants")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    let iterationCount = 0;
    if (args.parentVariantId) {
      const parent = await ctx.db.get(args.parentVariantId);
      iterationCount = (parent?.iterationCount ?? 0) + 1;
    }

    return await ctx.db.insert("prototypeVariants", {
      ...args,
      status: "ready",
      iterationCount,
    });
  },
});

// ── Action: postPrototypeToSlack ──────────────────────────────────────────────

export const postPrototypeToSlack = action({
  args: { variantId: v.id("prototypeVariants") },
  handler: async (ctx, { variantId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const variant = await ctx.runQuery(api.prototypes.get, { variantId });
    if (!variant) throw new Error("Prototype variant not found");
    if (!variant.chromaticUrl && !variant.url) {
      throw new Error("Variant has no URL to share — set chromaticUrl or url first");
    }

    const project = await ctx.runQuery(api.projects.get, {
      projectId: variant.projectId,
    });
    if (!project) throw new Error("Project not found");

    const channelId = (project as Record<string, unknown>).slackChannelId as string | undefined;
    if (!channelId) {
      throw new Error(
        `Project "${project.name}" has no linked Slack channel. ` +
        `Set slackChannelId on the project first.`,
      );
    }

    const url = variant.chromaticUrl ?? variant.url!;
    const iterLabel = (variant.iterationCount ?? 0) > 0
      ? ` (iteration ${variant.iterationCount})`
      : "";

    const messageBody = {
      channel: channelId,
      text: `🎨 New prototype ready for feedback: *${variant.title}*${iterLabel}`,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*${project.name}* — prototype ready for review${iterLabel}`,
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*${variant.title}*\n<${url}|Open prototype →>`,
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "Please reply in this thread with your thoughts. What works? What doesn't? " +
              "Feel free to be specific — even small details help.",
          },
        },
      ],
    };

    const response = await slackPost("chat.postMessage", messageBody) as {
      ts: string;
      channel: string;
    };

    // Store the thread timestamp on the variant so feedback can be fetched later
    await ctx.runMutation(internal.prototypes.setSlackMessageTs, {
      variantId,
      slackMessageTs: response.ts,
    });

    return {
      ok: true,
      slackMessageTs: response.ts,
      channel: response.channel,
      url,
    };
  },
});

// ── Action: ingestPrototypeFeedback ──────────────────────────────────────────

export const ingestPrototypeFeedback = action({
  args: { variantId: v.id("prototypeVariants") },
  handler: async (ctx, { variantId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const variant = await ctx.runQuery(api.prototypes.get, { variantId });
    if (!variant) throw new Error("Prototype variant not found");
    if (!variant.slackMessageTs) {
      throw new Error("Variant has not been posted to Slack yet. Call postPrototypeToSlack first.");
    }

    const project = await ctx.runQuery(api.projects.get, {
      projectId: variant.projectId,
    });
    if (!project) throw new Error("Project not found");

    const channelId = (project as Record<string, unknown>).slackChannelId as string | undefined;
    if (!channelId) throw new Error("Project has no linked Slack channel");

    // Fetch all replies to the prototype thread
    const repliesData = await slackGet("conversations.replies", {
      channel: channelId,
      ts: variant.slackMessageTs,
    }) as { messages: Array<{ ts: string; text: string; user?: string; bot_id?: string }> };

    const replies = (repliesData.messages ?? [])
      // Skip the original message (first item) and bot messages
      .filter((m) => m.ts !== variant.slackMessageTs && !m.bot_id)
      .filter((m) => m.text?.trim().length > 0);

    if (!replies.length) {
      return { ok: true, ingestedCount: 0, message: "No new replies to ingest." };
    }

    // Get already-ingested signal IDs to avoid duplicates (by checking signalProtoVariants)
    const existingLinks = await ctx.runQuery(api.prototypes.getVariantFeedback, { variantId });
    const existingVerbatims = new Set(
      (existingLinks as Array<{ verbatim: string } | null>)
        .filter(Boolean)
        .map((s) => (s as { verbatim: string }).verbatim),
    );

    let ingestedCount = 0;
    for (const reply of replies) {
      if (existingVerbatims.has(reply.text)) continue;

      // Create the signal
      const signalId = await ctx.runMutation(internal.mcp.createSignal, {
        workspaceId: variant.workspaceId,
        verbatim: reply.text,
        source: `slack_prototype_feedback`,
        severity: undefined,
      });

      // Link signal to the project
      await ctx.runMutation(internal.signals.linkToProjectInternal, {
        signalId,
        projectId: variant.projectId,
        confidence: 0.95,
        linkedBy: "prototype_feedback_ingestion",
      });

      // Link signal to this specific prototype variant
      await ctx.runMutation(internal.prototypes.linkSignalToVariant, {
        signalId,
        prototypeVariantId: variantId,
        feedbackSource: "slack_thread",
      });

      ingestedCount++;
    }

    return {
      ok: true,
      ingestedCount,
      totalReplies: replies.length,
      message: `Ingested ${ingestedCount} new feedback signals from Slack thread.`,
    };
  },
});

// ── Action: iteratePrototype ──────────────────────────────────────────────────

export const iteratePrototype = action({
  args: {
    variantId: v.id("prototypeVariants"),
    instructions: v.optional(v.string()),
  },
  handler: async (ctx, { variantId, instructions }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const variant = await ctx.runQuery(api.prototypes.get, { variantId });
    if (!variant) throw new Error("Prototype variant not found");

    const project = await ctx.runQuery(api.projects.get, {
      projectId: variant.projectId,
    });
    if (!project) throw new Error("Project not found");

    // Gather all feedback signals for this variant
    const feedbackSignals = await ctx.runQuery(api.prototypes.getVariantFeedback, { variantId });

    if (!feedbackSignals?.length && !instructions) {
      return {
        ok: false,
        message: "No feedback signals found for this variant. Ingest feedback first with ingestPrototypeFeedback.",
      };
    }

    // Load the project's research document for baseline comparison
    const documents = await ctx.runQuery(api.documents.byProject, {
      projectId: variant.projectId,
    });
    const researchDoc = (documents as Array<{ type: string; content: string; title: string }>)
      .find((d) => d.type === "research");
    const prototypeNotesDoc = (documents as Array<{ type: string; content: string; title: string }>)
      .find((d) => d.type === "prototype_notes");

    // Synthesize what changed using Anthropic
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const feedbackText = (feedbackSignals as Array<{ verbatim: string } | null>)
      .filter(Boolean)
      .map((s, i) => `${i + 1}. "${(s as { verbatim: string }).verbatim}"`)
      .join("\n");

    const synthesisPrompt = [
      `You are synthesizing feedback on a UI prototype to guide the next iteration.`,
      ``,
      `## Prototype`,
      `Title: ${variant.title}`,
      `Platform: ${variant.platform}`,
      variant.chromaticUrl ? `URL: ${variant.chromaticUrl}` : "",
      `Iteration: ${variant.iterationCount ?? 0}`,
      ``,
      `## Project`,
      `Name: ${project.name}`,
      project.description ? `Description: ${project.description}` : "",
      ``,
      researchDoc
        ? `## Existing Research\n${researchDoc.content.slice(0, 2000)}`
        : "",
      prototypeNotesDoc
        ? `## Prior Prototype Notes\n${prototypeNotesDoc.content.slice(0, 1500)}`
        : "",
      ``,
      feedbackText
        ? `## Feedback Received (${feedbackSignals.length} signals)\n${feedbackText}`
        : "",
      instructions ? `## Additional Instructions\n${instructions}` : "",
      ``,
      `## Your Task`,
      `1. Summarize what we learned from the feedback (2-3 sentences)`,
      `2. Identify the 3 most important changes to make in the next iteration`,
      `3. Write a concise brief for the prototype builder (what to keep, what to change, what to add)`,
      `4. Identify any assumptions this feedback challenges`,
      ``,
      `Format as JSON: { "summary": string, "changes": string[], "builderBrief": string, "challengedAssumptions": string[] }`,
    ].filter(Boolean).join("\n");

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 1024,
      messages: [{ role: "user", content: synthesisPrompt }],
    });

    const rawContent = response.content[0];
    if (rawContent.type !== "text") throw new Error("Unexpected response from Anthropic");

    let synthesis: {
      summary: string;
      changes: string[];
      builderBrief: string;
      challengedAssumptions: string[];
    };
    try {
      const jsonMatch = rawContent.text.match(/\{[\s\S]*\}/);
      synthesis = JSON.parse(jsonMatch?.[0] ?? rawContent.text);
    } catch {
      synthesis = {
        summary: rawContent.text.slice(0, 300),
        changes: ["See full synthesis above"],
        builderBrief: rawContent.text,
        challengedAssumptions: [],
      };
    }

    // Create the next prototype variant placeholder
    const nextIterationCount = (variant.iterationCount ?? 0) + 1;
    const newVariantId = await ctx.runMutation(internal.prototypes.create, {
      workspaceId: variant.workspaceId,
      projectId: variant.projectId,
      platform: variant.platform,
      outputType: variant.outputType,
      title: `${variant.title} (v${nextIterationCount})`,
      parentVariantId: variantId,
      iterationCount: nextIterationCount,
    });

    // Schedule the prototype-builder agent job with the synthesis brief
    const jobId = await ctx.runMutation(internal.mcp.createJob, {
      workspaceId: variant.workspaceId,
      projectId: variant.projectId,
      type: "prototype_iteration",
      input: {
        variantId: newVariantId,
        parentVariantId: variantId,
        title: `${variant.title} (v${nextIterationCount})`,
        platform: variant.platform,
        synthesis,
        builderBrief: synthesis.builderBrief,
        feedbackCount: feedbackSignals.length,
        instructions: instructions ?? null,
      },
    });

    // Store synthesis as a memory entry for the project
    await ctx.runMutation(internal.mcp.storeMemory, {
      workspaceId: variant.workspaceId,
      projectId: variant.projectId,
      type: "feedback",
      content: [
        `## Prototype Feedback Synthesis — ${variant.title} (iteration ${variant.iterationCount ?? 0})`,
        ``,
        `**What we learned:** ${synthesis.summary}`,
        ``,
        `**Key changes for next iteration:**`,
        synthesis.changes.map((c: string) => `- ${c}`).join("\n"),
        ``,
        synthesis.challengedAssumptions.length
          ? `**Challenged assumptions:**\n${synthesis.challengedAssumptions.map((a: string) => `- ${a}`).join("\n")}`
          : "",
      ].filter(Boolean).join("\n"),
    });

    return {
      ok: true,
      newVariantId,
      jobId,
      iterationCount: nextIterationCount,
      synthesis,
      message: `Iteration ${nextIterationCount} queued. Builder job: ${jobId}`,
    };
  },
});

// ── Internal action for Slack Webhook ─────────────────────────────────────────

/**
 * Called from http.ts when a Slack message arrives in a project's linked channel
 * with a Chromatic/Storybook URL. Finds the matching prototypeVariant and ingests
 * thread replies as feedback.
 */
export const handleSlackPrototypeThread = internalAction({
  args: {
    workspaceId: v.id("workspaces"),
    channelId: v.string(),
    messageTs: v.string(),
    text: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if text contains a Chromatic or Storybook URL
    const isPrototypeLink =
      args.text.includes("chromatic.com") ||
      args.text.includes("storybook") ||
      args.text.includes("elmer.studio/proto");

    if (!isPrototypeLink) return { handled: false };

    // Find the project linked to this Slack channel
    const projects = await ctx.runQuery(internal.prototypes.listBySlackChannel, {
      workspaceId: args.workspaceId,
      slackChannelId: args.channelId,
    });

    if (!projects.length) return { handled: false };
    const project = projects[0];

    // Extract the URL from the message
    const urlMatch = args.text.match(/https?:\/\/[^\s>]+/);
    const url = urlMatch?.[0];

    // Create or find a variant matching this URL
    const variants = await ctx.runQuery(api.prototypes.listByProject, {
      projectId: project._id,
    });
    const existing = (variants as Array<{ chromaticUrl?: string; url?: string; slackMessageTs?: string }>)
      .find((v) => v.chromaticUrl === url || v.url === url);

    if (existing) {
      // Already tracked — nothing to do, thread replies will be picked up by ingestPrototypeFeedback
      return { handled: true, reason: "variant_already_tracked" };
    }

    // Auto-create a variant for links shared directly in Slack (outside of Elmer)
    const variantId = await ctx.runMutation(internal.prototypes.create, {
      workspaceId: args.workspaceId,
      projectId: project._id,
      platform: url?.includes("chromatic") ? "storybook" : "storybook",
      outputType: "iframe_url",
      title: `Prototype shared in Slack`,
      url,
      chromaticUrl: url?.includes("chromatic") ? url : undefined,
      iterationCount: 0,
    });

    await ctx.runMutation(internal.prototypes.setSlackMessageTs, {
      variantId,
      slackMessageTs: args.messageTs,
    });

    return { handled: true, variantId, reason: "variant_auto_created" };
  },
});

// ── Internal action wrappers for HTTP scheduling ──────────────────────────────
// http.ts cannot call `action` directly; it must use scheduler.runAfter(0, internal.X)

export const postPrototypeToSlackInternal = internalAction({
  args: { variantId: v.id("prototypeVariants") },
  handler: async (ctx, { variantId }) => {
    const variant = await ctx.runQuery(internal.mcp.getPrototypeVariant, { variantId });
    if (!variant) throw new Error("Prototype variant not found");
    if (!variant.chromaticUrl && !variant.url) {
      throw new Error("Variant has no URL to share");
    }

    const project = await ctx.runQuery(api.projects.get, { projectId: variant.projectId });
    if (!project) throw new Error("Project not found");

    const channelId = (project as Record<string, unknown>).slackChannelId as string | undefined;
    if (!channelId) throw new Error("Project has no linked Slack channel");

    const url = variant.chromaticUrl ?? variant.url!;
    const iterLabel = (variant.iterationCount ?? 0) > 0
      ? ` (iteration ${variant.iterationCount})`
      : "";

    const response = await slackPost("chat.postMessage", {
      channel: channelId,
      text: `🎨 New prototype ready for feedback: *${variant.title}*${iterLabel}`,
      blocks: [
        {
          type: "section",
          text: { type: "mrkdwn", text: `*${project.name}* — prototype ready for review${iterLabel}` },
        },
        {
          type: "section",
          text: { type: "mrkdwn", text: `*${variant.title}*\n<${url}|Open prototype →>` },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "Please reply in this thread with your thoughts. What works? What doesn't?",
          },
        },
      ],
    }) as { ts: string; channel: string };

    await ctx.runMutation(internal.prototypes.setSlackMessageTs, {
      variantId,
      slackMessageTs: response.ts,
    });

    return { ok: true, slackMessageTs: response.ts };
  },
});

export const ingestPrototypeFeedbackInternal = internalAction({
  args: { variantId: v.id("prototypeVariants") },
  handler: async (ctx, { variantId }) => {
    const variant = await ctx.runQuery(internal.mcp.getPrototypeVariant, { variantId });
    if (!variant) throw new Error("Prototype variant not found");
    if (!variant.slackMessageTs) return { ok: false, message: "Not yet posted to Slack" };

    const project = await ctx.runQuery(api.projects.get, { projectId: variant.projectId });
    if (!project) throw new Error("Project not found");

    const channelId = (project as Record<string, unknown>).slackChannelId as string | undefined;
    if (!channelId) throw new Error("Project has no linked Slack channel");

    const repliesData = await slackGet("conversations.replies", {
      channel: channelId,
      ts: variant.slackMessageTs,
    }) as { messages: Array<{ ts: string; text: string; user?: string; bot_id?: string }> };

    const replies = (repliesData.messages ?? [])
      .filter((m) => m.ts !== variant.slackMessageTs && !m.bot_id)
      .filter((m) => m.text?.trim().length > 0);

    const existingFeedback = await ctx.runQuery(internal.mcp.getPrototypeFeedback, { variantId });
    const existingVerbatims = new Set(
      (existingFeedback as Array<{ verbatim: string } | null>)
        .filter(Boolean)
        .map((s) => (s as { verbatim: string }).verbatim),
    );

    let ingestedCount = 0;
    for (const reply of replies) {
      if (existingVerbatims.has(reply.text)) continue;

      const signalId = await ctx.runMutation(internal.mcp.createSignal, {
        workspaceId: variant.workspaceId,
        verbatim: reply.text,
        source: "slack_prototype_feedback",
        severity: undefined,
      });

      await ctx.runMutation(internal.signals.linkToProjectInternal, {
        signalId,
        projectId: variant.projectId,
        confidence: 0.95,
        linkedBy: "prototype_feedback_ingestion",
      });

      await ctx.runMutation(internal.prototypes.linkSignalToVariant, {
        signalId,
        prototypeVariantId: variantId,
        feedbackSource: "slack_thread",
      });

      ingestedCount++;
    }

    return { ok: true, ingestedCount };
  },
});

export const iteratePrototypeInternal = internalAction({
  args: {
    variantId: v.id("prototypeVariants"),
    instructions: v.optional(v.string()),
  },
  handler: async (ctx, { variantId, instructions }) => {
    const variant = await ctx.runQuery(internal.mcp.getPrototypeVariant, { variantId });
    if (!variant) throw new Error("Prototype variant not found");

    const project = await ctx.runQuery(api.projects.get, { projectId: variant.projectId });
    if (!project) throw new Error("Project not found");

    const feedbackSignals = await ctx.runQuery(internal.mcp.getPrototypeFeedback, { variantId });
    if (!feedbackSignals?.length && !instructions) {
      return { ok: false, message: "No feedback signals to iterate on." };
    }

    const documents = await ctx.runQuery(internal.mcp.getDocuments, { projectId: variant.projectId });
    const researchDoc = (documents as Array<{ type: string; content: string }>)
      .find((d) => d.type === "research");

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const feedbackText = (feedbackSignals as Array<{ verbatim: string } | null>)
      .filter(Boolean)
      .map((s, i) => `${i + 1}. "${(s as { verbatim: string }).verbatim}"`)
      .join("\n");

    const synthesisPrompt = [
      `Synthesize feedback on UI prototype "${variant.title}" to guide the next iteration.`,
      ``,
      researchDoc ? `## Research Context\n${researchDoc.content.slice(0, 1500)}` : "",
      feedbackText ? `## Feedback (${feedbackSignals.length} signals)\n${feedbackText}` : "",
      instructions ? `## Additional Instructions\n${instructions}` : "",
      ``,
      `Respond as JSON: { "summary": string, "changes": string[], "builderBrief": string, "challengedAssumptions": string[] }`,
    ].filter(Boolean).join("\n");

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 1024,
      messages: [{ role: "user", content: synthesisPrompt }],
    });

    const rawContent = response.content[0];
    if (rawContent.type !== "text") throw new Error("Unexpected response");

    let synthesis: {
      summary: string;
      changes: string[];
      builderBrief: string;
      challengedAssumptions: string[];
    };
    try {
      const jsonMatch = rawContent.text.match(/\{[\s\S]*\}/);
      synthesis = JSON.parse(jsonMatch?.[0] ?? rawContent.text);
    } catch {
      synthesis = {
        summary: rawContent.text.slice(0, 300),
        changes: [],
        builderBrief: rawContent.text,
        challengedAssumptions: [],
      };
    }

    const nextIterationCount = (variant.iterationCount ?? 0) + 1;
    const newVariantId = await ctx.runMutation(internal.prototypes.create, {
      workspaceId: variant.workspaceId,
      projectId: variant.projectId,
      platform: variant.platform,
      outputType: variant.outputType,
      title: `${variant.title.replace(/ \(v\d+\)$/, "")} (v${nextIterationCount})`,
      parentVariantId: variantId,
      iterationCount: nextIterationCount,
    });

    const jobId = await ctx.runMutation(internal.mcp.createJob, {
      workspaceId: variant.workspaceId,
      projectId: variant.projectId,
      type: "prototype_iteration",
      input: {
        variantId: newVariantId,
        parentVariantId: variantId,
        synthesis,
        builderBrief: synthesis.builderBrief,
      },
    });

    await ctx.runMutation(internal.mcp.storeMemory, {
      workspaceId: variant.workspaceId,
      projectId: variant.projectId,
      type: "feedback",
      content: `## Prototype Synthesis — ${variant.title}\n\n${synthesis.summary}\n\nChanges:\n${synthesis.changes.map((c: string) => `- ${c}`).join("\n")}`,
    });

    return { ok: true, newVariantId, jobId, iterationCount: nextIterationCount, synthesis };
  },
});

// ── Slack message intent handlers ─────────────────────────────────────────────

export const handleSlackElmerMention = internalAction({
  args: {
    workspaceId: v.id("workspaces"),
    channelId: v.string(),
    messageTs: v.string(),
    text: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Strip @elmer prefix and clean the command
    const command = args.text
      .replace(/@elmer\s*/gi, "")
      .replace(/^elmer:\s*/i, "")
      .trim();

    // Create a job to handle the user's request via the agent loop
    const jobId = await ctx.runMutation(internal.mcp.createJob, {
      workspaceId: args.workspaceId,
      type: "slack_command",
      input: {
        command,
        channelId: args.channelId,
        messageTs: args.messageTs,
        userId: args.userId ?? null,
        replyToThread: true,
      },
    });

    // Reply immediately in-thread so the user knows Elmer is on it
    try {
      await slackPost("chat.postMessage", {
        channel: args.channelId,
        thread_ts: args.messageTs,
        text: `Got it — working on: _"${command.slice(0, 100)}"_\nJob ID: \`${jobId}\``,
      });
    } catch {
      // Don't fail the whole handler if the reply fails
    }

    return { ok: true, jobId };
  },
});

export const handleSlackFeedbackMessage = internalAction({
  args: {
    workspaceId: v.id("workspaces"),
    channelId: v.string(),
    messageTs: v.string(),
    text: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Only ingest if the channel is linked to a project
    const projects = await ctx.runQuery(internal.prototypes.listBySlackChannel, {
      workspaceId: args.workspaceId,
      slackChannelId: args.channelId,
    });
    if (!projects.length) return { handled: false };

    const project = projects[0];
    const signalId = await ctx.runMutation(internal.mcp.createSignal, {
      workspaceId: args.workspaceId,
      verbatim: args.text,
      source: `slack:${args.channelId}`,
      severity: undefined,
    });

    await ctx.runMutation(internal.signals.linkToProjectInternal, {
      signalId,
      projectId: project._id,
      confidence: 0.7,
      linkedBy: "slack_feedback_auto",
    });

    return { handled: true, signalId, projectId: project._id };
  },
});

export const listBySlackChannel = internalQuery({
  args: {
    workspaceId: v.id("workspaces"),
    slackChannelId: v.string(),
  },
  handler: async (ctx, { workspaceId, slackChannelId }) => {
    const all = await ctx.db
      .query("projects")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .collect();
    return all.filter(
      (p) => (p as unknown as { slackChannelId?: string }).slackChannelId === slackChannelId,
    );
  },
});
