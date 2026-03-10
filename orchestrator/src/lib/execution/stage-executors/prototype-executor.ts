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

import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { getDefaultProvider, type StreamCallback } from "../providers";
import type { StageContext, StageExecutionResult } from "./index";
import { commitToGitHub, getWritebackConfig } from "@/lib/github/writeback-service";
import { resolveDocumentPath, parsePrototypePath } from "@/lib/github/path-resolver";
import type { WritebackFile, CommitMetadata } from "@/lib/github/types";

function getConvexClient() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is required");
  return new ConvexHttpClient(url);
}

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
  callbacks: StreamCallback,
): Promise<StageExecutionResult> {
  const { run, project, documents: existingDocs } = context;

  callbacks.onLog("info", "Starting prototype generation", "prototype");
  callbacks.onProgress(0.1, "Loading design context...");

  const prdDoc = existingDocs.find((doc) => doc.type === "prd");
  const designBrief = existingDocs.find((doc) => doc.type === "design_brief");
  const designReview = existingDocs.find(
    (doc) =>
      doc.type === "prototype_notes" && doc.title.includes("Design Review"),
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

  callbacks.onProgress(0.6, "Saving prototype notes...");

  const client = getConvexClient();

  // Save prototype notes document via Convex
  const docId = await client.mutation(api.documents.create, {
    workspaceId: run.workspaceId as Id<"workspaces">,
    projectId: run.cardId as Id<"projects">,
    type: "prototype_notes",
    title: `Prototype Notes - ${project.name}`,
    content: result.output || "",
    generatedByAgent: "prototype-executor",
  });

  // Commit prototype notes to GitHub
  const writebackConfig = await getWritebackConfig(run.workspaceId, run.cardId);

  if (writebackConfig) {
    // Load workspace settings for prototype path via Convex
    const workspace = await client.query(api.workspaces.get, {
      workspaceId: run.workspaceId as Id<"workspaces">,
    });
    const settings = (workspace?.settings ?? {}) as Record<string, unknown>;
    const prototypesPath = settings.prototypesPath as string | undefined;

    const notesPath = resolveDocumentPath({
      projectName: project.name,
      documentType: "prototype_notes",
      basePath: writebackConfig.basePath,
    });

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
      projectId: run.cardId,
      projectName: project.name,
      documentType: "prototype_notes",
      triggeredBy: "automation",
      stageRunId: run._id,
    };

    callbacks.onLog(
      "info",
      `Committing prototype notes to GitHub: ${notesPath}${submodulePath ? ` (prototype path: ${prototypesPath})` : ""}`,
      "prototype",
    );

    const writebackResult = await commitToGitHub(
      writebackConfig,
      files,
      commitMetadata,
      "add",
    );

    if (writebackResult.success) {
      callbacks.onLog(
        "info",
        `Committed to GitHub: ${writebackResult.commitSha}`,
        "prototype",
      );

      // Record in project commit history via Convex
      await client.mutation(api.projectCommits.create, {
        projectId: run.cardId as Id<"projects">,
        workspaceId: run.workspaceId as Id<"workspaces">,
        sha: writebackResult.commitSha!,
        url: writebackResult.commitUrl,
        message: `docs(${project.name.toLowerCase().replace(/\s+/g, "-")}): add prototype-notes`,
        author: "automation",
        committedAt: Date.now(),
      });

      if (submodulePath) {
        callbacks.onLog(
          "info",
          `Prototype generation will use submodule path: ${prototypesPath}`,
          "prototype",
        );
      }
    } else {
      callbacks.onLog(
        "warn",
        `GitHub writeback failed: ${writebackResult.error}`,
        "prototype",
      );
    }
  } else {
    callbacks.onLog(
      "info",
      "GitHub writeback not configured for this workspace",
      "prototype",
    );
  }

  // Create prototype variant record via Convex
  const componentName = project.name.replace(/\s+/g, "");
  const variantId = await client.mutation(api.prototypes.createVariant, {
    workspaceId: run.workspaceId as Id<"workspaces">,
    projectId: run.cardId as Id<"projects">,
    platform: "storybook",
    outputType: "tsx_code",
    title: `${componentName} Prototype`,
    metadata: {
      storybookPath: `src/components/${componentName}/`,
      stories: ["Default", "Loading", "Error", "Empty", "Success"],
      components: [componentName],
      generatedByStageRun: run._id,
    },
  });

  await callbacks.onArtifact(
    "file",
    "Prototype Notes",
    `projects/${run.cardId}/documents/${docId}`,
    { documentType: "prototype_notes" },
  );

  await callbacks.onArtifact(
    "file",
    "Prototype Component",
    `projects/${run.cardId}/prototypes/${variantId}`,
    { storybookPath: `src/components/${componentName}/` },
  );

  callbacks.onProgress(0.8, "Prototype specification complete");

  callbacks.onLog(
    "info",
    "Prototype specification generated. Run Storybook build to deploy to Chromatic.",
    "prototype",
  );
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
        message: "Prototype variant record created",
      },
    },
  };
}
