/**
 * Validate Stage Executor
 * 
 * Inputs: Prototype + PRD + jury personas
 * Automation:
 *   - Run synthetic user jury evaluation
 *   - Generate validation report
 *   - Calculate pass/fail thresholds
 * Outputs:
 *   - validation-report.md
 *   - jury_report document
 * Gates:
 *   - Jury score >= threshold
 *   - Stakeholder approval (if human_approval mode)
 */

import { db } from "@/lib/db";
import { documents, juryEvaluations, type DocumentType } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { getDefaultProvider, type StreamCallback } from "../providers";
import type { StageContext, StageExecutionResult } from "./index";

const JURY_EVALUATION_SYSTEM_PROMPT = `You are simulating a panel of synthetic users evaluating a product feature. Your task is to evaluate the prototype and PRD from multiple persona perspectives.

For each persona, evaluate:
1. Does this solve a real problem for them?
2. Is the proposed solution intuitive?
3. What concerns do they have?
4. Would they use this?

Personas to simulate:
- Sales Rep (frontline user, time-constrained)
- Sales Leader (needs team oversight, reporting)
- CSM (customer relationship focus)
- Operations (process efficiency, data accuracy)

Format your response as markdown:

# Jury Evaluation Report

## Overall Verdict
**[PASS/CONDITIONAL/FAIL]** - [One sentence summary]

## Scores
| Persona | Score (1-10) | Verdict | Key Concern |
|---------|--------------|---------|-------------|
| Sales Rep | | | |
| Sales Leader | | | |
| CSM | | | |
| Operations | | | |

## Approval Rate
[X]% would approve this feature

## Top Concerns
1. [Concern 1]
2. [Concern 2]
3. [Concern 3]

## Top Suggestions
1. [Suggestion 1]
2. [Suggestion 2]
3. [Suggestion 3]

## Persona Breakdowns

### Sales Rep
**Verdict**: [APPROVE/CONDITIONAL/REJECT]
[Detailed feedback]

### Sales Leader
**Verdict**: [APPROVE/CONDITIONAL/REJECT]
[Detailed feedback]

### CSM
**Verdict**: [APPROVE/CONDITIONAL/REJECT]
[Detailed feedback]

### Operations
**Verdict**: [APPROVE/CONDITIONAL/REJECT]
[Detailed feedback]

## Recommendations
[What should change before shipping?]
`;

export async function executeValidate(
  context: StageContext,
  callbacks: StreamCallback
): Promise<StageExecutionResult> {
  const { run, project, documents: existingDocs } = context;
  
  callbacks.onLog("info", "Starting validation jury evaluation", "validate");
  callbacks.onProgress(0.1, "Loading prototype and PRD...");

  // Get PRD and prototype notes
  const prdDoc = existingDocs.find((doc) => doc.type === "prd");
  const prototypeNotes = existingDocs.find((doc) => doc.type === "prototype_notes");
  
  if (!prdDoc) {
    callbacks.onLog("warn", "No PRD found", "validate");
    return {
      success: false,
      error: "No PRD found. Complete PRD stage first.",
    };
  }

  const provider = getDefaultProvider();
  
  const userPrompt = `Evaluate this feature from the perspective of multiple user personas:

Project: ${project.name}

## PRD
${prdDoc.content}

${prototypeNotes ? `## Prototype Notes\n${prototypeNotes.content}` : "No prototype notes available."}

Run a synthetic jury evaluation with 4 personas: Sales Rep, Sales Leader, CSM, Operations.
`;

  callbacks.onProgress(0.3, "Running jury evaluation...");

  const result = await provider.execute(
    JURY_EVALUATION_SYSTEM_PROMPT,
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

  callbacks.onProgress(0.7, "Parsing jury results...");

  // Parse the output to extract scores (simplified parsing)
  const output = result.output || "";
  const passMatch = output.match(/Overall Verdict\s*\n\*\*\[(PASS|CONDITIONAL|FAIL)\]/i);
  const verdict = passMatch ? passMatch[1].toLowerCase() : "conditional";
  
  // Extract approval rate
  const approvalMatch = output.match(/(\d+)%\s*would approve/i);
  const approvalRate = approvalMatch ? parseInt(approvalMatch[1], 10) / 100 : 0.5;

  const now = new Date();
  const docId = `doc_${nanoid()}`;
  const juryId = `jury_${nanoid()}`;

  // Save jury report document
  await db.insert(documents).values({
    id: docId,
    projectId: project.id,
    type: "jury_report" as DocumentType,
    title: `Validation Report - ${project.name}`,
    content: output,
    version: 1,
    filePath: `initiatives/${project.name.toLowerCase().replace(/\s+/g, "-")}/validation-report.md`,
    metadata: {
      generatedBy: "ai",
      model: "claude-sonnet-4-20250514",
      promptVersion: "validate-v1",
      verdict,
      approvalRate,
    },
    createdAt: now,
    updatedAt: now,
  });

  // Save jury evaluation record
  await db.insert(juryEvaluations).values({
    id: juryId,
    projectId: project.id,
    phase: "prototype",
    jurySize: 4,
    approvalRate,
    conditionalRate: verdict === "conditional" ? 1 - approvalRate : 0,
    rejectionRate: verdict === "fail" ? 1 - approvalRate : 0,
    verdict: verdict as "pass" | "fail" | "conditional",
    topConcerns: [], // Would need more sophisticated parsing
    topSuggestions: [],
    rawResults: { output },
    reportPath: `initiatives/${project.name.toLowerCase().replace(/\s+/g, "-")}/validation-report.md`,
    createdAt: now,
  });

  await callbacks.onArtifact(
    "file",
    "Validation Report",
    `documents/${docId}`,
    { documentType: "jury_report", verdict, approvalRate }
  );

  callbacks.onLog("info", `Jury verdict: ${verdict.toUpperCase()} (${Math.round(approvalRate * 100)}% approval)`, "validate");
  callbacks.onProgress(1.0, "Validation complete");

  const passed = verdict === "pass" || (verdict === "conditional" && approvalRate >= 0.6);

  return {
    success: true,
    tokensUsed: result.tokensUsed,
    skillsExecuted: ["run_jury_evaluation"],
    autoAdvance: passed,
    nextStage: "tickets",
    gateResults: {
      jury_verdict: {
        passed,
        message: `Jury ${verdict}: ${Math.round(approvalRate * 100)}% approval`,
      },
    },
  };
}
