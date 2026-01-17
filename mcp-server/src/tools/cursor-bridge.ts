/**
 * Cursor Bridge - Prototype Building Tools
 * 
 * These tools are designed to be called by Cursor AI when processing
 * build_prototype jobs. Instead of invoking a CLI, they return structured
 * instructions that Cursor should follow to create the prototype files.
 * 
 * Flow:
 * 1. Job is created with type "build_prototype"
 * 2. Cursor calls get-pending-jobs and finds the job
 * 3. Cursor calls get-job-context to get PRD and design brief
 * 4. Cursor generates the component files directly
 * 5. Cursor calls complete-job with the result
 */

import { execa } from "execa";
import type { BuildPrototypeInput, IteratePrototypeInput, ToolResult } from "../types.js";

// ============================================
// BUILD STANDALONE PROTOTYPE
// ============================================

export interface PrototypeBuildInstructions {
  componentName: string;
  outputPath: string;
  files: Array<{
    path: string;
    description: string;
    template: string;
  }>;
  storybookTitle: string;
  instructions: string[];
}

/**
 * Build standalone prototype - Returns instructions for Cursor AI
 * 
 * Instead of invoking a CLI, this returns structured instructions
 * that Cursor AI should follow to create the prototype.
 */
export async function buildStandalonePrototype(
  input: BuildPrototypeInput
): Promise<ToolResult<PrototypeBuildInstructions>> {
  // Extract component name from PRD (first heading or project name)
  const componentNameMatch = input.prd.match(/^#\s+(.+?)(?:\s+-|\n)/m);
  const rawName = componentNameMatch?.[1] || "Feature";
  const componentName = rawName.replace(/[^a-zA-Z0-9]/g, "");
  
  const outputPath = input.outputPath || `prototypes/src/components/${componentName}`;
  
  const instructions: PrototypeBuildInstructions = {
    componentName,
    outputPath,
    storybookTitle: `Prototypes/${componentName}`,
    files: [
      {
        path: `${outputPath}/${componentName}.tsx`,
        description: "Main component file",
        template: `// ${componentName}.tsx
// Generated prototype component

"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface ${componentName}Props {
  className?: string;
}

export function ${componentName}({ className }: ${componentName}Props) {
  // TODO: Implement based on PRD
  return (
    <div className={cn("p-4", className)}>
      <h2>${componentName}</h2>
      {/* Implement component based on PRD */}
    </div>
  );
}
`,
      },
      {
        path: `${outputPath}/${componentName}.stories.tsx`,
        description: "Storybook stories",
        template: `// ${componentName}.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { ${componentName} } from "./${componentName}";

const meta: Meta<typeof ${componentName}> = {
  title: "Prototypes/${componentName}",
  component: ${componentName},
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ${componentName}>;

export const Default: Story = {
  args: {},
};

export const Interactive: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    // Add interaction tests here
  },
};
`,
      },
      {
        path: `${outputPath}/index.ts`,
        description: "Export file",
        template: `// index.ts
export { ${componentName} } from "./${componentName}";
`,
      },
    ],
    instructions: [
      `Create the ${componentName} component based on the PRD`,
      "Use React 18 with TypeScript (strict mode)",
      "Use Tailwind CSS for styling",
      "Follow existing patterns from the codebase",
      "Create interactive Storybook stories",
      "Make the component visually polished",
      `Output files to: ${outputPath}`,
    ],
  };

  return {
    success: true,
    data: instructions,
  };
}

// ============================================
// BUILD CONTEXT PROTOTYPE
// ============================================

export interface ContextPrototypeInstructions extends PrototypeBuildInstructions {
  placementAnalysis: {
    suggestedLocation: string;
    existingPatterns: string[];
    integrationPoints: string[];
    componentsToReuse: string[];
  };
}

/**
 * Build context prototype - Returns instructions with placement analysis
 */
export async function buildContextPrototype(
  input: BuildPrototypeInput
): Promise<ToolResult<ContextPrototypeInstructions>> {
  // Get base instructions
  const baseResult = await buildStandalonePrototype(input);
  if (!baseResult.success || !baseResult.data) {
    return { success: false, error: baseResult.error };
  }

  const instructions: ContextPrototypeInstructions = {
    ...baseResult.data,
    placementAnalysis: {
      suggestedLocation: "[Cursor AI should analyze the codebase to determine best location]",
      existingPatterns: input.existingComponents || [],
      integrationPoints: [
        "[Cursor AI should identify integration points based on PRD]",
      ],
      componentsToReuse: [
        "[Cursor AI should identify existing components to reuse]",
      ],
    },
    instructions: [
      ...baseResult.data.instructions,
      "Analyze the existing codebase for patterns to follow",
      "Identify existing components that can be reused",
      "Show how this feature integrates with the existing UI",
      "Create stories showing the component in context",
    ],
  };

  return {
    success: true,
    data: instructions,
  };
}

// ============================================
// ITERATE PROTOTYPE
// ============================================

export interface IterationInstructions {
  feedback: string;
  instructions: string[];
  focusAreas: string[];
}

/**
 * Iterate prototype - Returns instructions for applying feedback
 */
export async function iteratePrototype(
  input: IteratePrototypeInput
): Promise<ToolResult<IterationInstructions>> {
  const instructions: IterationInstructions = {
    feedback: input.feedback,
    instructions: [
      "Read the feedback carefully",
      "Make targeted changes based on the feedback",
      "Preserve existing functionality unless explicitly asked to change",
      "Update Storybook stories if component behavior changes",
      "Keep changes minimal and focused",
      "Document what was changed",
    ],
    focusAreas: [
      "[Cursor AI should identify specific areas to change based on feedback]",
    ],
  };

  return {
    success: true,
    data: instructions,
  };
}

// ============================================
// DEPLOY TO CHROMATIC
// ============================================

export interface ChromaticDeployResult {
  buildUrl: string;
  storybookUrl: string;
  status: "success" | "pending" | "failed";
}

/**
 * Deploy to Chromatic - Actually runs the chromatic CLI
 * 
 * This is one of the few tools that actually executes something
 * rather than returning instructions, since it's a deployment step.
 */
export async function deployToChromatic(
  workspacePath: string,
  projectToken?: string
): Promise<ToolResult<ChromaticDeployResult>> {
  // Check if CHROMATIC_PROJECT_TOKEN is available
  const token = projectToken || process.env.CHROMATIC_PROJECT_TOKEN;
  
  if (!token) {
    return {
      success: true,
      data: {
        buildUrl: "",
        storybookUrl: "",
        status: "pending",
      },
    };
  }

  try {
    const result = await execa("npx", ["chromatic", "--exit-zero-on-changes"], {
      cwd: workspacePath,
      env: {
        ...process.env,
        CHROMATIC_PROJECT_TOKEN: token,
      },
    });

    // Parse Chromatic output for URLs
    const buildUrlMatch = result.stdout.match(/View build: (https:\/\/[^\s]+)/);
    const storybookUrlMatch = result.stdout.match(/View Storybook: (https:\/\/[^\s]+)/);

    return {
      success: true,
      data: {
        buildUrl: buildUrlMatch?.[1] || "",
        storybookUrl: storybookUrlMatch?.[1] || "",
        status: "success",
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Chromatic deployment failed",
    };
  }
}
