/**
 * Inbox Stage Executor
 *
 * Inputs: Raw transcript, voice memo, or feature request
 * Automation:
 *   - Extract TL;DR, problems with verbatim quotes, requests
 *   - Identify personas from text
 *   - Classify signal type
 * Outputs:
 *   - signals/<type>/<date>-<topic>.md file
 *   - Updated signals/_index.json
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { getDefaultProvider, type StreamCallback } from "../providers";
import type { StageContext, StageExecutionResult } from "./index";

function getConvexClient() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is required");
  return new ConvexHttpClient(url);
}

const INBOX_SYSTEM_PROMPT = `You are a PM research analyst. Your task is to analyze raw input (transcripts, voice memos, feature requests) and extract structured insights.

Extract the following:
1. TL;DR (2-3 sentences summarizing the main points)
2. Key Problems - with verbatim quotes from the user
3. Feature Requests - with severity (blocking/major/minor) and frequency hints
4. Personas - which user types this seems relevant to
5. Signal Type - one of: user_interview, sales_call, support_ticket, feature_request, internal_feedback, market_research

Format your response as structured markdown with these sections:
# TL;DR
[summary]

# Problems
- **[Problem name]**: "[Verbatim quote]" — [context]

# Requests
- **[Request]**: [description] (Severity: blocking/major/minor)

# Personas
- [Persona type]: [why this is relevant to them]

# Signal Type
[type]

# Raw Quotes
- "[Quote 1]"
- "[Quote 2]"
`;

export async function executeInbox(
  context: StageContext,
  callbacks: StreamCallback,
): Promise<StageExecutionResult> {
  const { run, project } = context;

  callbacks.onLog("info", "Starting inbox analysis", "inbox");
  callbacks.onProgress(0.2, "Analyzing input...");

  const rawInput = project.description || "";

  if (!rawInput || rawInput.length < 50) {
    callbacks.onLog(
      "warn",
      "No substantial input found in project description",
      "inbox",
    );
    return {
      success: false,
      error: "No input text found. Add a transcript or description to the project.",
    };
  }

  const provider = getDefaultProvider();
  const userPrompt = `Analyze this input and extract insights:\n\n${rawInput}`;

  const result = await provider.execute(
    INBOX_SYSTEM_PROMPT,
    userPrompt,
    {
      runId: run._id,
      workspaceId: run.workspaceId,
      cardId: run.cardId,
      stage: run.stage,
    },
    callbacks,
  );

  if (!result.success) {
    return {
      success: false,
      error: result.error || "AI execution failed",
      tokensUsed: result.tokensUsed,
    };
  }

  callbacks.onProgress(0.7, "Saving research document...");

  const client = getConvexClient();
  const now = new Date();

  const docId = await client.mutation(api.documents.create, {
    workspaceId: run.workspaceId as Id<"workspaces">,
    projectId: run.cardId as Id<"projects">,
    type: "research",
    title: `Signal Analysis - ${project.name}`,
    content: result.output || "",
    generatedByAgent: "inbox-executor",
  });

  await callbacks.onArtifact(
    "file",
    "Signal Analysis",
    `projects/${run.cardId}/documents/${docId}`,
    { documentType: "research" },
  );

  callbacks.onLog("info", "Research document saved successfully", "inbox");
  callbacks.onProgress(1.0, "Analysis complete");

  return {
    success: true,
    tokensUsed: result.tokensUsed,
    skillsExecuted: ["analyze_transcript"],
    autoAdvance: true,
    nextStage: "discovery",
  };
}
