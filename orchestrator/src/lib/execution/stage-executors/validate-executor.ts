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
  callbacks: StreamCallback,
): Promise<StageExecutionResult> {
  const { run, project, documents: existingDocs } = context;

  callbacks.onLog("info", "Starting validation jury evaluation", "validate");
  callbacks.onProgress(0.1, "Loading prototype and PRD...");

  const prdDoc = existingDocs.find((doc) => doc.type === "prd");
  const prototypeNotes = existingDocs.find(
    (doc) => doc.type === "prototype_notes",
  );

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

  callbacks.onProgress(0.7, "Parsing jury results...");

  const output = result.output || "";
  const passMatch = output.match(
    /Overall Verdict\s*\n\*\*\[(PASS|CONDITIONAL|FAIL)\]/i,
  );
  const verdict = passMatch ? passMatch[1].toLowerCase() : "conditional";

  const approvalMatch = output.match(/(\d+)%\s*would approve/i);
  const fallbackApprovalRate = approvalMatch
    ? parseInt(approvalMatch[1], 10) / 100
    : 0.5;

  const personaWeights: Record<string, number> = {
    "sales rep": 0.35,
    "sales leader": 0.25,
    csm: 0.2,
    operations: 0.2,
  };

  const scoreRows = output.matchAll(
    /\|\s*([^|]+)\s*\|\s*(\d+(?:\.\d+)?)\s*\|/g,
  );
  let weightedTotal = 0;
  let weightSum = 0;
  const weightedScores: Array<{
    persona: string;
    score: number;
    weight: number;
  }> = [];

  for (const match of scoreRows) {
    const persona = match[1].trim().toLowerCase();
    const score = Number(match[2]);
    if (Number.isNaN(score)) continue;
    const weight = personaWeights[persona] ?? 0.1;
    weightedTotal += (score / 10) * weight;
    weightSum += weight;
    weightedScores.push({ persona, score, weight });
  }

  const approvalRate =
    weightSum > 0
      ? Math.min(weightedTotal / weightSum, 1)
      : fallbackApprovalRate;

  const client = getConvexClient();

  // Save jury report document via Convex
  const docId = await client.mutation(api.documents.create, {
    workspaceId: run.workspaceId as Id<"workspaces">,
    projectId: run.cardId as Id<"projects">,
    type: "jury_report",
    title: `Validation Report - ${project.name}`,
    content: output,
    generatedByAgent: "validate-executor",
  });

  // Save jury evaluation record via Convex
  await client.mutation(api.juryEvaluations.create, {
    projectId: run.cardId as Id<"projects">,
    workspaceId: run.workspaceId as Id<"workspaces">,
    phase: "prototype",
    jurySize: 4,
    approvalRate,
    conditionalRate: verdict === "conditional" ? 1 - approvalRate : 0,
    rejectionRate: verdict === "fail" ? 1 - approvalRate : 0,
    verdict,
    topConcerns: [],
    topSuggestions: [],
    rawResults: {
      output,
      weightedScores,
      approvalRate,
      fallbackApprovalRate,
      weights: personaWeights,
    },
    reportPath: `initiatives/${project.name.toLowerCase().replace(/\s+/g, "-")}/validation-report.md`,
  });

  await callbacks.onArtifact(
    "file",
    "Validation Report",
    `projects/${run.cardId}/documents/${docId}`,
    {
      documentType: "jury_report",
      verdict,
      approvalRate,
      weightedScores,
    },
  );

  callbacks.onLog(
    "info",
    `Jury verdict: ${verdict.toUpperCase()} (${Math.round(approvalRate * 100)}% approval)`,
    "validate",
  );
  callbacks.onProgress(1.0, "Validation complete");

  const passed =
    verdict === "pass" || (verdict === "conditional" && approvalRate >= 0.6);

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
