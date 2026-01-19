/**
 * Design Stage Executor
 * 
 * Inputs: PRD + design-brief.md
 * Automation:
 *   - Create design-review.md (trust, states, accessibility)
 *   - Analyze existing UI patterns
 *   - Generate component suggestions
 * Outputs:
 *   - design-review.md
 * Gates:
 *   - Trust considerations documented
 *   - All required states identified
 *   - Accessibility requirements defined
 */

import { db } from "@/lib/db";
import { documents, type DocumentType } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { getDefaultProvider, type StreamCallback } from "../providers";
import type { StageContext, StageExecutionResult } from "./index";

const DESIGN_REVIEW_SYSTEM_PROMPT = `You are a design companion focused on human-centric AI design. Your task is to review the design brief and PRD, then create a comprehensive design review document.

Focus on:
1. **Trust & Transparency** - How do we build user trust? What should be transparent vs. hidden?
2. **All States** - Empty, loading, error, partial, success, and edge cases
3. **Accessibility** - WCAG compliance, keyboard navigation, screen readers
4. **Micro-interactions** - Loading states, transitions, feedback
5. **Error Handling** - User-friendly error messages, recovery paths
6. **AI-Specific Considerations** - If this involves AI: confidence indicators, explainability, override options

Format your response as markdown:

# Design Review: [Project Name]

## Trust & Transparency Checklist
- [ ] Item 1
- [ ] Item 2

## Required States
| State | Description | Priority |
|-------|-------------|----------|
| Empty | | |
| Loading | | |
| Error | | |
| Success | | |

## Accessibility Requirements
[Requirements]

## Micro-interactions
[Interactions to implement]

## Error Handling Strategy
[How to handle errors]

## AI Considerations (if applicable)
[AI-specific design considerations]

## Component Suggestions
[Suggested components to build/use]

## Open Design Questions
[Questions that need answers]
`;

export async function executeDesign(
  context: StageContext,
  callbacks: StreamCallback
): Promise<StageExecutionResult> {
  const { run, project, documents: existingDocs } = context;
  
  callbacks.onLog("info", "Starting design review", "design");
  callbacks.onProgress(0.2, "Loading PRD and design brief...");

  // Get PRD and design brief
  const prdDoc = existingDocs.find((doc) => doc.type === "prd");
  const designBrief = existingDocs.find((doc) => doc.type === "design_brief");
  
  if (!prdDoc) {
    callbacks.onLog("warn", "No PRD found", "design");
    return {
      success: false,
      error: "No PRD found. Complete PRD stage first.",
    };
  }

  const provider = getDefaultProvider();
  
  const userPrompt = `Review this PRD and design brief for a comprehensive design review:

Project: ${project.name}

## PRD
${prdDoc.content}

${designBrief ? `## Design Brief\n${designBrief.content}` : "No design brief available - generate one based on the PRD."}
`;

  callbacks.onProgress(0.4, "Generating design review...");

  const result = await provider.execute(
    DESIGN_REVIEW_SYSTEM_PROMPT,
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

  callbacks.onProgress(0.8, "Saving design review...");

  const now = new Date();
  const docId = `doc_${nanoid()}`;

  // Check for existing design review (type is not in our enum, we'll use a workaround)
  // For now, save as prototype_notes which can hold design notes
  await db.insert(documents).values({
    id: docId,
    projectId: project.id,
    type: "prototype_notes" as DocumentType, // Using prototype_notes for design review
    title: `Design Review - ${project.name}`,
    content: result.output || "",
    version: 1,
    filePath: `initiatives/${project.name.toLowerCase().replace(/\s+/g, "-")}/design-review.md`,
    metadata: {
      generatedBy: "ai",
      model: "claude-sonnet-4-20250514",
      promptVersion: "design-v1",
      actualType: "design_review",
    },
    createdAt: now,
    updatedAt: now,
  });

  await callbacks.onArtifact(
    "file",
    "Design Review",
    `documents/${docId}`,
    { documentType: "design_review" }
  );

  callbacks.onLog("info", "Design review complete", "design");
  callbacks.onProgress(1.0, "Design review complete");

  return {
    success: true,
    tokensUsed: result.tokensUsed,
    skillsExecuted: ["design_review"],
    autoAdvance: true,
    nextStage: "prototype",
    gateResults: {
      design_review_exists: {
        passed: true,
        message: "Design review created",
      },
    },
  };
}
