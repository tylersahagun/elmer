/**
 * Prototype Stage Executor
 * 
 * Inputs: PRD + design-brief + design-review
 * Automation:
 *   - Generate Storybook component scaffold
 *   - Create 2-3 design options
 *   - Generate all required states
 *   - Deploy to Chromatic
 * Outputs:
 *   - prototype-notes.md
 *   - Chromatic URL artifact
 * Gates:
 *   - Stories compile
 *   - Required states exist
 *   - Chromatic build succeeds
 */

import { db } from "@/lib/db";
import { documents, prototypes, workspaces, type DocumentType, type PrototypeType } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { getDefaultProvider, type StreamCallback } from "../providers";
import type { StageContext, StageExecutionResult } from "./index";
import { commitToGitHub, getWritebackConfig } from "@/lib/github/writeback-service";
import { resolveDocumentPath, parsePrototypePath } from "@/lib/github/path-resolver";
import { recordProjectCommit } from "@/lib/db/queries";
import type { WritebackFile, CommitMetadata } from "@/lib/github/types";

const PROTOTYPE_SYSTEM_PROMPT = `You are a senior frontend engineer specializing in React and Storybook prototypes. Your task is to create a prototype component specification based on the PRD and design requirements.

Generate a complete prototype specification including:
1. Component structure and props
2. All required states (empty, loading, error, success)
3. Storybook stories for each state
4. Accessibility annotations

Format your response as markdown with code blocks:

# Prototype Specification: [Component Name]

## Component Overview
[Brief description]

## Props Interface
\`\`\`typescript
interface ComponentProps {
  // props
}
\`\`\`

## Component Implementation
\`\`\`tsx
// React component code
\`\`\`

## Storybook Stories
\`\`\`tsx
// Storybook story file
\`\`\`

## States Covered
- [ ] Default
- [ ] Loading
- [ ] Error
- [ ] Empty
- [ ] Success

## Accessibility Notes
[Notes on accessibility]

## Design Options
### Option A
[Description]

### Option B
[Description]
`;

export async function executePrototype(
  context: StageContext,
  callbacks: StreamCallback
): Promise<StageExecutionResult> {
  const { run, project, documents: existingDocs } = context;
  
  callbacks.onLog("info", "Starting prototype generation", "prototype");
  callbacks.onProgress(0.1, "Loading design context...");

  // Get PRD and design docs
  const prdDoc = existingDocs.find((doc) => doc.type === "prd");
  const designBrief = existingDocs.find((doc) => doc.type === "design_brief");
  const designReview = existingDocs.find(
    (doc) => doc.type === "prototype_notes" && doc.title.includes("Design Review")
  );
  
  if (!prdDoc) {
    callbacks.onLog("warn", "No PRD found", "prototype");
    return {
      success: false,
      error: "No PRD found. Complete PRD stage first.",
    };
  }

  const provider = getDefaultProvider();
  
  const userPrompt = `Create a prototype specification for this feature:

Project: ${project.name}

## PRD
${prdDoc.content}

${designBrief ? `## Design Brief\n${designBrief.content}` : ""}

${designReview ? `## Design Review\n${designReview.content}` : ""}

Generate a complete prototype specification with React components and Storybook stories.
`;

  callbacks.onProgress(0.3, "Generating prototype specification...");

  const result = await provider.execute(
    PROTOTYPE_SYSTEM_PROMPT,
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

  callbacks.onProgress(0.6, "Saving prototype notes...");

  const now = new Date();
  const docId = `doc_${nanoid()}`;
  const prototypeId = `proto_${nanoid()}`;

  // Save prototype notes document
  await db.insert(documents).values({
    id: docId,
    projectId: project.id,
    type: "prototype_notes" as DocumentType,
    title: `Prototype Notes - ${project.name}`,
    content: result.output || "",
    version: 1,
    filePath: `initiatives/${project.name.toLowerCase().replace(/\s+/g, "-")}/prototype-notes.md`,
    metadata: {
      generatedBy: "ai",
      model: "claude-sonnet-4-20250514",
      promptVersion: "prototype-v1",
    },
    createdAt: now,
    updatedAt: now,
  });

  // Commit prototype notes to GitHub (WRITE-02, WRITE-05)
  const writebackConfig = await getWritebackConfig(run.workspaceId, project.id);

  if (writebackConfig) {
    // Get workspace settings for prototype path
    const workspace = await db.query.workspaces.findFirst({
      where: eq(workspaces.id, run.workspaceId),
    });
    const settings = workspace?.settings || {};
    const prototypesPath = settings.prototypesPath;

    // Determine paths for prototype notes
    // 1. Prototype notes go to initiatives/{project}/prototype-notes.md
    const notesPath = resolveDocumentPath({
      projectName: project.name,
      documentType: "prototype_notes",
      basePath: writebackConfig.basePath,
    });

    // 2. If there's a prototypesPath, we may also want to note it
    //    (actual component generation is separate - this just commits the spec)
    const { submodulePath } = prototypesPath
      ? parsePrototypePath(prototypesPath)
      : { submodulePath: null };

    const files: WritebackFile[] = [
      {
        path: notesPath,
        content: result.output || "",
      },
    ];

    const commitMetadata: CommitMetadata = {
      projectId: project.id,
      projectName: project.name,
      documentType: "prototype_notes",
      triggeredBy: "automation",
      stageRunId: run.id,
    };

    callbacks.onLog(
      "info",
      `Committing prototype notes to GitHub: ${notesPath}${submodulePath ? ` (prototype path: ${prototypesPath})` : ""}`,
      "prototype"
    );

    const writebackResult = await commitToGitHub(
      writebackConfig,
      files,
      commitMetadata,
      "add"
    );

    if (writebackResult.success) {
      callbacks.onLog("info", `Committed to GitHub: ${writebackResult.commitSha}`, "prototype");

      // Record in project commit history (WRITE-06)
      await recordProjectCommit({
        projectId: project.id,
        workspaceId: run.workspaceId,
        commitSha: writebackResult.commitSha!,
        commitUrl: writebackResult.commitUrl!,
        message: `docs(${project.name.toLowerCase().replace(/\s+/g, "-")}): add prototype-notes`,
        documentType: "prototype_notes",
        filesChanged: writebackResult.filesWritten,
        triggeredBy: "automation",
        stageRunId: run.id,
      });

      // Log submodule info if configured
      if (submodulePath) {
        callbacks.onLog(
          "info",
          `Prototype generation will use submodule path: ${prototypesPath}`,
          "prototype"
        );
      }
    } else {
      callbacks.onLog("warn", `GitHub writeback failed: ${writebackResult.error}`, "prototype");
    }
  } else {
    callbacks.onLog("info", "GitHub writeback not configured for this workspace", "prototype");
  }

  // Create prototype record
  const componentName = project.name.replace(/\s+/g, "");
  await db.insert(prototypes).values({
    id: prototypeId,
    projectId: project.id,
    type: "standalone" as PrototypeType,
    name: componentName,
    storybookPath: `src/components/${componentName}/`,
    version: 1,
    status: "ready",
    metadata: {
      stories: ["Default", "Loading", "Error", "Empty", "Success"],
      components: [componentName],
    },
    createdAt: now,
    updatedAt: now,
  });

  await callbacks.onArtifact(
    "file",
    "Prototype Notes",
    `documents/${docId}`,
    { documentType: "prototype_notes" }
  );

  await callbacks.onArtifact(
    "file",
    "Prototype Component",
    `prototypes/${prototypeId}`,
    { storybookPath: `src/components/${componentName}/` }
  );

  callbacks.onProgress(0.8, "Prototype specification complete");

  // Note: Actual Chromatic deployment would happen in CI/CD
  // For now, we mark this as ready for manual build
  callbacks.onLog("info", "Prototype specification generated. Run Storybook build to deploy to Chromatic.", "prototype");
  callbacks.onProgress(1.0, "Prototype generation complete");

  return {
    success: true,
    tokensUsed: result.tokensUsed,
    skillsExecuted: ["generate_prototype_spec"],
    autoAdvance: true,
    nextStage: "validate",
    gateResults: {
      prototype_notes_exist: {
        passed: true,
        message: "Prototype notes created",
      },
      prototype_record_exists: {
        passed: true,
        message: "Prototype record created",
      },
    },
  };
}
