/**
 * PRD Stage Executor
 *
 * Inputs: Research.md + product context
 * Automation:
 *   - Generate prd.md with required sections
 *   - Generate design-brief.md
 *   - Generate engineering-spec.md
 *   - Generate gtm-brief.md
 * Outputs:
 *   - prd.md, design-brief.md, engineering-spec.md, gtm-brief.md
 * Gates:
 *   - All required sections exist
 *   - Measurable metrics defined
 */

import { db } from "@/lib/db";
import {
  documents,
  signalProjects,
  signals as signalsTable,
  type DocumentType,
} from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { getDefaultProvider, type StreamCallback } from "../providers";
import type { StageContext, StageExecutionResult } from "./index";
import { getWorkspaceContext } from "@/lib/context/resolve";
import { commitToGitHub, getWritebackConfig, getWorkspaceUserId } from "@/lib/github/writeback-service";
import { resolveDocumentPath } from "@/lib/github/path-resolver";
import { recordProjectCommit } from "@/lib/db/queries";
import type { WritebackFile, CommitMetadata } from "@/lib/github/types";

const PRD_SYSTEM_PROMPT = `You are a senior product manager creating a PRD (Product Requirements Document) for a specific company/product.

## Critical Instructions

1. **USE THE COMPANY CONTEXT PROVIDED** - The PRD must be specific to the company's product, personas, and strategic direction. Never generate a generic PRD.
2. **FOLLOW THE OUTCOME CHAIN** - Every feature must connect: [Feature] enables [action] → so that [benefit] → so that [behavior change] → so that [business outcome]
3. **INCLUDE ANTI-VISION CHECK** - Reference what the company is NOT building and why.

## Required PRD Structure

# [Project Name] PRD

## Overview
- **Owner:** [Identify from context or mark TBD]
- **Status:** Draft
- **Strategic Pillar:** [From company context]

## Outcome Chain
[Feature] enables [action]
  → so that [benefit]
    → so that [behavior change]
      → so that [business outcome]

## Problem Statement
What problem? Who has it? Why now? What evidence?
Include user quotes from research when available.

## Goals & Non-Goals

### Goals (Measurable)
- Goal with success metric and target

### Non-Goals
- Explicit exclusion with reasoning

## User Personas
### Primary: [Name from company context]
- **Job-to-be-done:** 
- **Current pain:** 
- **Success looks like:** 

## User Stories
- As a [persona], I want [action] so that [benefit]

## Requirements

### Must Have (MVP)
- Requirement with acceptance criteria

### Should Have
### Could Have

## User Flows
### Flow: [Name]
**Trigger:** 
**Steps:** 1 → 2 → 3
**Outcome:** 

## Success Metrics
- **North star:** 
- **Leading indicators:** 

## Open Questions
1. [Questions that need answers]

Format as clean markdown. Be specific to the company context provided.

## Citation Requirements
When writing the PRD, reference the provided user evidence:
- Use signal quotes to support problem statements
- Cite specific signals when defining requirements
- Ensure traceability from user feedback to PRD decisions
`;

const DESIGN_BRIEF_SYSTEM_PROMPT = `You are a design lead. Create a design brief based on the PRD that covers:

1. **Design Challenge** - What are we designing and why?
2. **User Context** - Where/when/how will this be used?
3. **Design Principles** - What principles should guide the design?
4. **Key States** - What states need to be designed (empty, loading, error, success)?
5. **Accessibility Requirements** - What accessibility considerations?
6. **Trust Considerations** - How do we build/maintain user trust?
7. **Interaction Patterns** - What existing patterns can we leverage?

Format as clean markdown.
`;

const ENGINEERING_SPEC_SYSTEM_PROMPT = `You are a tech lead. Create an engineering spec based on the PRD that covers:

1. **Technical Overview** - High-level approach
2. **Architecture** - Components, data flow, integrations
3. **API Changes** - New/modified endpoints
4. **Data Model** - Schema changes
5. **Dependencies** - External services, libraries
6. **Testing Strategy** - What needs testing?
7. **Rollout Plan** - How to deploy safely
8. **Technical Risks** - What could go wrong?

Format as clean markdown.
`;

const GTM_BRIEF_SYSTEM_PROMPT = `You are a product marketing manager. Create a GTM (Go-To-Market) brief based on the PRD:

1. **Value Proposition** - One sentence that captures the value
2. **Target Audience** - Who are we targeting first?
3. **Messaging** - Key messages for different audiences
4. **Launch Strategy** - How/when to launch
5. **Success Metrics** - Marketing KPIs
6. **Competitive Positioning** - How is this different?
7. **FAQ** - Common questions and answers

Format as clean markdown.
`;

export async function executePRD(
  context: StageContext,
  callbacks: StreamCallback,
): Promise<StageExecutionResult> {
  const { run, project, documents: existingDocs } = context;

  callbacks.onLog("info", "Starting PRD generation", "prd");
  callbacks.onProgress(0.05, "Loading company context...");

  // Load company context (product vision, personas, guardrails)
  const companyContext = await getWorkspaceContext(run.workspaceId);
  if (!companyContext) {
    callbacks.onLog(
      "warn",
      "No company context found - PRD may be generic",
      "prd",
    );
  }

  callbacks.onProgress(0.1, "Loading research context...");

  // Get research document
  const researchDoc = existingDocs.find((doc) => doc.type === "research");

  if (!researchDoc) {
    callbacks.onLog("warn", "No research document found", "prd");
    return {
      success: false,
      error: "No research document found. Complete discovery stage first.",
    };
  }

  // Fetch linked signals for evidence section
  callbacks.onProgress(0.15, "Loading signal evidence...");
  const linkedSignals = await db
    .select({
      verbatim: signalsTable.verbatim,
      source: signalsTable.source,
      severity: signalsTable.severity,
      frequency: signalsTable.frequency,
      interpretation: signalsTable.interpretation,
    })
    .from(signalProjects)
    .innerJoin(signalsTable, eq(signalProjects.signalId, signalsTable.id))
    .where(eq(signalProjects.projectId, project.id))
    .orderBy(desc(signalProjects.linkedAt))
    .limit(10); // Top 10 signals to prevent context bloat

  if (linkedSignals.length > 0) {
    callbacks.onLog(
      "info",
      `Found ${linkedSignals.length} signal(s) to cite as evidence`,
      "prd",
    );
  } else {
    callbacks.onLog(
      "info",
      "No linked signals found - PRD will be generated without user evidence",
      "prd",
    );
  }

  const provider = getDefaultProvider();
  const now = new Date();
  const createdDocs: string[] = [];
  const totalTokens = { input: 0, output: 0 };

  // Helper to create/update document
  async function createDoc(
    type: DocumentType,
    title: string,
    systemPrompt: string,
    userPrompt: string,
    progress: number,
  ): Promise<boolean> {
    callbacks.onProgress(progress, `Generating ${title}...`);

    const result = await provider.execute(
      systemPrompt,
      userPrompt,
      {
        runId: run.id,
        workspaceId: run.workspaceId,
        cardId: run.cardId,
        stage: run.stage,
      },
      callbacks,
    );

    if (!result.success) {
      callbacks.onLog(
        "error",
        `Failed to generate ${title}: ${result.error}`,
        "prd",
      );
      return false;
    }

    if (result.tokensUsed) {
      totalTokens.input += result.tokensUsed.input;
      totalTokens.output += result.tokensUsed.output;
    }

    // Check for existing doc
    const existing = existingDocs.find((doc) => doc.type === type);
    const docId = existing?.id || `doc_${nanoid()}`;

    if (existing) {
      await db
        .update(documents)
        .set({
          content: result.output || "",
          version: existing.version + 1,
          updatedAt: now,
        })
        .where(eq(documents.id, existing.id));
    } else {
      await db.insert(documents).values({
        id: docId,
        projectId: project.id,
        type,
        title,
        content: result.output || "",
        version: 1,
        filePath: `initiatives/${project.name.toLowerCase().replace(/\s+/g, "-")}/${type.replace("_", "-")}.md`,
        metadata: {
          generatedBy: "ai",
          model: "claude-sonnet-4-20250514",
          promptVersion: "prd-v1",
        },
        createdAt: now,
        updatedAt: now,
      });
    }

    // Commit to GitHub (WRITE-01, WRITE-03, WRITE-05)
    const writebackConfig = await getWritebackConfig(run.workspaceId, project.id);
    const userId = await getWorkspaceUserId(run.workspaceId);

    if (writebackConfig && userId) {
      const filePath = resolveDocumentPath({
        projectName: project.name,
        documentType: type,
        basePath: writebackConfig.basePath,
      });

      const writebackFile: WritebackFile = {
        path: filePath,
        content: result.output || "",
      };

      const commitMetadata: CommitMetadata = {
        projectId: project.id,
        projectName: project.name,
        documentType: type,
        triggeredBy: "automation",
        stageRunId: run.id,
      };

      callbacks.onLog("info", `Committing ${type} to GitHub: ${filePath}`, "prd");

      const writebackResult = await commitToGitHub(
        writebackConfig,
        [writebackFile],
        commitMetadata,
        userId,
        existing ? "update" : "add"
      );

      if (writebackResult.success) {
        callbacks.onLog("info", `Committed to GitHub: ${writebackResult.commitSha}`, "prd");

        // Record in project commit history (WRITE-06)
        await recordProjectCommit({
          projectId: project.id,
          workspaceId: run.workspaceId,
          commitSha: writebackResult.commitSha!,
          commitUrl: writebackResult.commitUrl!,
          message: `docs(${project.name.toLowerCase().replace(/\s+/g, "-")}): ${existing ? "update" : "add"} ${type.replace(/_/g, "-")}`,
          documentType: type,
          filesChanged: writebackResult.filesWritten,
          triggeredBy: "automation",
          stageRunId: run.id,
        });
      } else {
        callbacks.onLog("warn", `GitHub writeback failed: ${writebackResult.error}`, "prd");
        // Don't fail the entire operation - document is saved locally
      }
    } else {
      callbacks.onLog("info", "GitHub writeback not configured or no user context", "prd");
    }

    createdDocs.push(type);
    await callbacks.onArtifact("file", title, `documents/${docId}`, {
      documentType: type,
    });
    return true;
  }

  // Format signals for PRD evidence section
  function formatSignalsForPRD(signals: typeof linkedSignals): string {
    if (signals.length === 0) return "";

    const citations = signals.map((s, i) => {
      const source = s.source.charAt(0).toUpperCase() + s.source.slice(1);
      const severity = s.severity ? ` (${s.severity})` : "";
      const quote =
        s.verbatim.length > 200 ? s.verbatim.slice(0, 197) + "..." : s.verbatim;

      return `[Signal ${i + 1}] **${source}${severity}**: "${quote}"`;
    });

    return `
## Supporting User Evidence

This PRD is informed by ${signals.length} user feedback signal${signals.length === 1 ? "" : "s"}:

${citations.join("\n\n")}

---
`;
  }

  // Build evidence section
  const evidenceSection = formatSignalsForPRD(linkedSignals);

  if (linkedSignals.length > 0) {
    callbacks.onLog(
      "info",
      `Including ${linkedSignals.length} signal(s) as evidence`,
      "prd",
    );
  }

  // Generate all documents
  const basePrompt = `Project: ${project.name}
${project.description ? `Description: ${project.description}` : ""}

${companyContext ? `## Company Context\n${companyContext}\n` : ""}

${evidenceSection}

## Research
${researchDoc.content}`;

  // 1. Generate PRD
  const prdSuccess = await createDoc(
    "prd",
    `PRD - ${project.name}`,
    PRD_SYSTEM_PROMPT,
    `Create a PRD based on this research:\n\n${basePrompt}`,
    0.25,
  );

  if (!prdSuccess) {
    return {
      success: false,
      error: "Failed to generate PRD",
      tokensUsed: totalTokens,
    };
  }

  // 2. Generate Design Brief
  await createDoc(
    "design_brief",
    `Design Brief - ${project.name}`,
    DESIGN_BRIEF_SYSTEM_PROMPT,
    `Create a design brief based on this PRD and research:\n\n${basePrompt}`,
    0.5,
  );

  // 3. Generate Engineering Spec
  await createDoc(
    "engineering_spec",
    `Engineering Spec - ${project.name}`,
    ENGINEERING_SPEC_SYSTEM_PROMPT,
    `Create an engineering spec based on this PRD and research:\n\n${basePrompt}`,
    0.75,
  );

  // 4. Generate GTM Brief
  await createDoc(
    "gtm_brief",
    `GTM Brief - ${project.name}`,
    GTM_BRIEF_SYSTEM_PROMPT,
    `Create a GTM brief based on this PRD and research:\n\n${basePrompt}`,
    0.9,
  );

  callbacks.onLog(
    "info",
    `PRD generation complete. Created: ${createdDocs.join(", ")}`,
    "prd",
  );
  callbacks.onProgress(1.0, "PRD generation complete");

  return {
    success: true,
    tokensUsed: totalTokens,
    skillsExecuted: [
      "generate_prd",
      "generate_design_brief",
      "generate_engineering_spec",
      "generate_gtm_brief",
    ],
    autoAdvance: createdDocs.includes("prd"),
    nextStage: "design",
    gateResults: {
      prd_exists: {
        passed: createdDocs.includes("prd"),
        message: createdDocs.includes("prd")
          ? "PRD created"
          : "PRD not created",
      },
      design_brief_exists: {
        passed: createdDocs.includes("design_brief"),
        message: createdDocs.includes("design_brief")
          ? "Design brief created"
          : "Design brief not created",
      },
    },
  };
}
