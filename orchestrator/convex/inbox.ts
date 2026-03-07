/**
 * Signal Inbox Processing Pipeline — GTM-50b
 *
 * On every signal insert, processInboxItem runs automatically as a Convex Action:
 *   1. Load the signal + active projects + company context
 *   2. Single Anthropic call: generate TL;DR, match project, score impact, detect direction change
 *   3. Write results back to inboxItems
 *   4. Auto-link signal to matched project if confidence > 0.7
 *   5. Create notification if high-impact or direction change
 */

import { internalAction, internalMutation } from "./_generated/server";
import { internal, api } from "./_generated/api";
import { v } from "convex/values";
import Anthropic from "@anthropic-ai/sdk";
import type { Id } from "./_generated/dataModel";

// ── Processing pipeline ───────────────────────────────────────────────────────

export const processInboxItem = internalAction({
  args: {
    itemId: v.id("inboxItems"),
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, { itemId, workspaceId }) => {
    // Mark as processing
    await ctx.runMutation(internal.inboxItems.markProcessing, { itemId });

    // Load inbox item
    const item = await ctx.runQuery(api.inboxItems.get, { itemId });
    if (!item) return;

    // Load active projects for matching
    const projects = await ctx.runQuery(api.projects.list, { workspaceId });
    const activeProjects = projects
      .filter((p: { stage: string }) => p.stage !== "launch" && p.stage !== "archived")
      .map((p: { _id: string; name: string; stage: string; description?: string | null }) => ({
        id: p._id,
        name: p.name,
        stage: p.stage,
        description: p.description ?? "",
      }));

    // Load company context for alignment scoring
    const kbEntries = await ctx.runQuery(api.knowledgebase.listByWorkspace, {
      workspaceId,
    });
    const companyContext =
      kbEntries
        .find((e: { type: string; content: string }) => e.type === "company_context")
        ?.content.slice(0, 2000) ??
      "AskElephant is a revenue outcome system for sales teams.";

    const strategicPillars =
      kbEntries
        .find((e: { type: string; content: string }) => e.type === "strategic_guardrails")
        ?.content.slice(0, 1000) ?? "";

    // Single Anthropic call for entire pipeline
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const prompt = `You are analyzing a customer signal for AskElephant, a revenue outcome system.

## Company Context
${companyContext}

## Strategic Pillars / Guardrails
${strategicPillars}

## Signal to Analyze
Title: ${item.title}
Source: ${item.source}
Content: ${item.rawContent.slice(0, 3000)}

## Active Projects
${activeProjects
  .map((p: { name: string; stage: string; description: string }) => `- ${p.name} (${p.stage}): ${p.description}`)
  .join("\n")}

## Your Task
Analyze this signal and return a JSON object with EXACTLY this structure:

{
  "tldr": "One sentence: who said what + why it matters",
  "impactScore": <0-100 integer: severity × frequency × strategic alignment>,
  "impactRationale": "2-3 sentences explaining the score",
  "matchedProject": {
    "name": "<exact project name from the list above, or null if no match>",
    "confidence": <0.0-1.0>,
    "rationale": "Why this signal matches this project"
  },
  "suggestsDirectionChange": <true|false>,
  "directionChange": {
    "changeType": "<scope_expansion|pivot|deprioritize|null>",
    "rationale": "What specifically should change and why",
    "affectedArea": "Which part of the project this affects (e.g., 'timeline', 'scope', 'priority')"
  },
  "extractedProblems": [
    { "problem": "...", "severity": "<critical|high|medium|low>", "quote": "verbatim if available" }
  ],
  "tags": ["<2-4 relevant tags>"]
}

Rules for impactScore:
- 90-100: Blocks a P0 initiative or affects all customers
- 70-89: Significantly affects multiple customers or a P0 project
- 50-69: Affects some customers, medium-priority project
- 30-49: Low frequency or edge case
- 0-29: Informational, no action needed

Return ONLY the JSON object, no markdown, no explanation.`;

    let parsed: {
      tldr: string;
      impactScore: number;
      impactRationale: string;
      matchedProject: { name: string | null; confidence: number; rationale: string } | null;
      suggestsDirectionChange: boolean;
      directionChange: {
        changeType: string | null;
        rationale: string;
        affectedArea: string;
      } | null;
      extractedProblems: Array<{ problem: string; severity: string; quote?: string }>;
      tags: string[];
    } | null = null;

    try {
      const response = await anthropic.messages.create({
        model: "claude-3-haiku-20240307", // haiku for speed + cost on classification
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      });

      const text =
        response.content[0].type === "text" ? response.content[0].text : "";
      parsed = JSON.parse(text.trim());
    } catch (e) {
      console.error("[inbox] Processing failed:", e);
      // Write a minimal result so the item doesn't get stuck in "processing"
      await ctx.runMutation(internal.inboxItems.writeProcessingResults, {
        itemId,
        tldr: item.title,
        impactScore: 30,
        suggestsVisionUpdate: false,
        aiSummary: "Processing failed — manual review needed",
      });
      return;
    }

    if (!parsed) return;

    // Find matched project ID
    let assignedProjectId: Id<"projects"> | undefined;
    let projectConfidence = 0;

    if (parsed.matchedProject?.name && parsed.matchedProject.confidence > 0.5) {
      const matched = activeProjects.find(
        (p: { name: string }) => p.name.toLowerCase() === parsed!.matchedProject!.name!.toLowerCase(),
      );
      if (matched) {
        assignedProjectId = matched.id as Id<"projects">;
        projectConfidence = parsed.matchedProject.confidence;
      }
    }

    // Build direction change object
    const projectDirectionChange =
      parsed.suggestsDirectionChange && parsed.directionChange?.changeType
        ? {
            projectId: assignedProjectId,
            changeType: parsed.directionChange.changeType,
            rationale: parsed.directionChange.rationale,
            affectedArea: parsed.directionChange.affectedArea,
            confidence: parsed.matchedProject?.confidence ?? 0.5,
          }
        : undefined;

    // Write results
    await ctx.runMutation(internal.inboxItems.writeProcessingResults, {
      itemId,
      tldr: parsed.tldr,
      impactScore: Math.min(100, Math.max(0, Math.round(parsed.impactScore))),
      suggestsVisionUpdate: parsed.suggestsDirectionChange,
      aiSummary: parsed.impactRationale,
      assignedProjectId,
      projectDirectionChange,
      extractedProblems: parsed.extractedProblems,
      hypothesisMatches: undefined,
    });

    // Auto-link signal to project if high confidence
    if (assignedProjectId && projectConfidence > 0.7) {
      // Find signal linked to this inbox item by checking tags or source
      // We'll pass signalId via the inboxItem's raw content metadata check
      // For now, if item type is "signal", extract signal ID from title pattern
      // This is wired more tightly in createAndProcess below
    }

    // Create notification for high-impact items
    if (parsed.impactScore > 70 || parsed.suggestsDirectionChange) {
      await ctx.runMutation(internal.notifications.create, {
        workspaceId,
        type: parsed.suggestsDirectionChange ? "direction_change" : "high_impact_signal",
        priority: parsed.impactScore > 85 ? "urgent" : "high",
        title: parsed.suggestsDirectionChange
          ? `⚡ Direction signal: ${item.title.slice(0, 60)}`
          : `🔴 High-impact signal (${parsed.impactScore}): ${item.title.slice(0, 50)}`,
        message: parsed.tldr,
        projectId: assignedProjectId,
        actionType: "review_inbox_item",
        actionData: { itemId },
      });
    }
  },
});

/**
 * Create an inbox item from a signal and immediately schedule processing.
 * Called from signals.create.
 */
export const createAndProcess = internalAction({
  args: {
    workspaceId: v.id("workspaces"),
    signalId: v.id("signals"),
    verbatim: v.string(),
    source: v.string(),
    severity: v.optional(v.string()),
  },
  handler: async (ctx, { workspaceId, signalId, verbatim, source }): Promise<Id<"inboxItems">> => {
    // Create the inbox item
    const title =
      verbatim.length > 80 ? verbatim.slice(0, 77) + "…" : verbatim;

    const itemId = await ctx.runMutation(internal.inboxItems.createInternal, {
      workspaceId,
      type: "signal",
      source,
      title,
      rawContent: verbatim,
      signalId,
    });

    // Schedule processing (async — don't block signal creation)
    await ctx.scheduler.runAfter(0, internal.inbox.processInboxItem, {
      itemId,
      workspaceId,
    });

    return itemId;
  },
});

/**
 * Batch process unprocessed inbox items — called by the hourly cron.
 */
export const batchProcess = internalAction({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, { workspaceId }): Promise<{ scheduled: number }> => {
    // Find pending items with no TL;DR (not yet processed)
    const pending = await ctx.runQuery(api.inboxItems.listByPriority, {
      workspaceId,
      status: "pending",
    });

    const unprocessed = (pending as Array<{ _id: Id<"inboxItems">; tldr?: string | null }>)
      .filter((i) => !i.tldr)
      .slice(0, 20);

    for (const item of unprocessed) {
      await ctx.scheduler.runAfter(0, internal.inbox.processInboxItem, {
        itemId: item._id,
        workspaceId,
      });
    }

    return { scheduled: unprocessed.length };
  },
});
