/**
 * Discovery Stage Executor
 * 
 * Inputs: ≥3 signals from inbox + product context
 * Automation:
 *   - Synthesize signals into hypotheses
 *   - Create/update hypotheses files
 *   - Generate research.md with persona alignment
 * Outputs:
 *   - research.md in initiative folder
 *   - hypotheses/<topic>.md files
 * Gates:
 *   - 3+ signal sources
 *   - Persona identified
 *   - Strategic alignment score
 */

import { db } from "@/lib/db";
import { documents, type DocumentType } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { getDefaultProvider, type StreamCallback } from "../providers";
import type { StageContext, StageExecutionResult } from "./index";

const DISCOVERY_SYSTEM_PROMPT = `You are a PM research synthesizer. Your task is to analyze multiple signals and synthesize them into actionable hypotheses.

Given the research signals, you should:
1. Identify patterns across signals
2. Form hypotheses about user problems and potential solutions
3. Prioritize by persona impact and business alignment
4. Flag gaps in understanding

Format your response as markdown:

# Discovery Summary

## Key Patterns
[Patterns identified across signals]

## Hypotheses
For each hypothesis:
### Hypothesis: [Name]
**We believe that** [assumption]
**For** [persona]
**Because** [evidence from signals]
**We will know we're right when** [measurable outcome]

## Persona Insights
[Which personas are most affected and why]

## Strategic Alignment
[How this aligns with product vision]

## Open Questions
[What we still need to learn]

## Recommended Next Steps
[What to do next]
`;

export async function executeDiscovery(
  context: StageContext,
  callbacks: StreamCallback
): Promise<StageExecutionResult> {
  const { run, project, documents: existingDocs } = context;
  
  callbacks.onLog("info", "Starting discovery synthesis", "discovery");
  callbacks.onProgress(0.2, "Gathering research signals...");

  // Get research documents
  const researchDocs = existingDocs.filter((doc) => doc.type === "research");
  
  if (researchDocs.length === 0) {
    callbacks.onLog("warn", "No research documents found", "discovery");
    return {
      success: false,
      error: "No research signals found. Run inbox stage first.",
    };
  }

  // Compile all research content
  const researchContent = researchDocs
    .map((doc) => `## ${doc.title}\n\n${doc.content}`)
    .join("\n\n---\n\n");

  callbacks.onProgress(0.4, "Synthesizing signals...");

  // Execute with AI provider
  const provider = getDefaultProvider();
  const userPrompt = `Synthesize these ${researchDocs.length} research signals into hypotheses and insights:

Project: ${project.name}
${project.description ? `Context: ${project.description}` : ""}

---

${researchContent}`;

  const result = await provider.execute(
    DISCOVERY_SYSTEM_PROMPT,
    userPrompt,
    {
      runId: run.id,
      workspaceId: run.workspaceId,
      cardId: run.cardId,
      stage: run.stage,
    },
    callbacks
  );

  if (!result.success) {
    return {
      success: false,
      error: result.error || "AI execution failed",
      tokensUsed: result.tokensUsed,
    };
  }

  callbacks.onProgress(0.7, "Saving discovery document...");

  // Check if research doc already exists
  const existingResearch = existingDocs.find((doc) => doc.type === "research" && doc.title.includes("Discovery"));
  
  const now = new Date();
  const docId = existingResearch?.id || `doc_${nanoid()}`;

  if (existingResearch) {
    // Update existing document
    await db
      .update(documents)
      .set({
        content: result.output || "",
        version: existingResearch.version + 1,
        updatedAt: now,
      })
      .where(eq(documents.id, existingResearch.id));
  } else {
    // Create new document
    await db.insert(documents).values({
      id: docId,
      projectId: project.id,
      type: "research" as DocumentType,
      title: `Discovery - ${project.name}`,
      content: result.output || "",
      version: 1,
      filePath: `initiatives/${project.name.toLowerCase().replace(/\s+/g, "-")}/research.md`,
      metadata: {
        generatedBy: "ai",
        model: "claude-sonnet-4-20250514",
        promptVersion: "discovery-v1",
        signalCount: researchDocs.length,
      },
      createdAt: now,
      updatedAt: now,
    });
  }

  // Create artifact
  await callbacks.onArtifact(
    "file",
    "Discovery Document",
    `documents/${docId}`,
    { documentType: "research", signalCount: researchDocs.length }
  );

  callbacks.onLog("info", "Discovery synthesis complete", "discovery");
  callbacks.onProgress(1.0, "Discovery complete");

  return {
    success: true,
    tokensUsed: result.tokensUsed,
    skillsExecuted: ["synthesize_signals", "generate_hypotheses"],
    autoAdvance: researchDocs.length >= 3, // Only auto-advance if we have enough signals
    nextStage: "prd",
    gateResults: {
      signal_count: {
        passed: researchDocs.length >= 3,
        message: `${researchDocs.length} signals (need 3+)`,
      },
    },
  };
}
