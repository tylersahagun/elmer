/**
 * Stage Executors - Execute automation for each Kanban stage
 *
 * Each stage has specific inputs, automation steps, outputs, and gates.
 * This module dispatches to the appropriate executor based on stage.
 *
 * GSD-inspired enhancements:
 * - Task-based execution with per-task verification
 * - Atomic commits after each task completion
 * - State tracking and structured context
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { addRunLog } from "../run-manager-convex";
import type { StageRun } from "../run-manager-convex";
import {
  getDefaultProvider,
  type StreamCallback,
  type ExecutionResult,
} from "../providers";
import { verifyTask, createVerificationContext } from "../verification";
import { commitTask } from "@/lib/git/branches";
import { getAllVerificationContext } from "@/lib/context/resolve";

// Import stage-specific executors
import { executeInbox } from "./inbox-executor";
import { executeDiscovery } from "./discovery-executor";
import { executePRD } from "./prd-executor";
import { executeDesign } from "./design-executor";
import { executePrototype } from "./prototype-executor";
import { executeValidate } from "./validate-executor";
import { executeTickets } from "./tickets-executor";

// ============================================
// SHARED PLAIN-TS TYPES (replace Drizzle-inferred types)
// ============================================

export interface ConvexProject {
  _id: string;
  workspaceId: string;
  name: string;
  description?: string;
  stage: string;
  status: string;
  metadata?: Record<string, unknown>;
}

export interface ConvexDocument {
  _id: string;
  workspaceId: string;
  projectId: string;
  type: string;
  title: string;
  content: string;
  version: number;
  reviewStatus: string;
  _creationTime: number;
}

export interface RecipeStepDef {
  skillId: string;
  order?: number;
  name?: string;
  targetFiles?: string[];
  verificationCriteria?: string[];
  acceptanceCriteria?: string[];
  atomicCommit?: boolean;
}

export interface GateDefinitionDef {
  id: string;
  name: string;
  type: string;
  config: Record<string, unknown>;
  required?: boolean;
  message?: string;
  failureMessage?: string;
}

export interface ConvexRecipe {
  _id: string;
  workspaceId: string;
  stage: string;
  automationLevel?: string;
  recipeSteps?: RecipeStepDef[];
  gates?: GateDefinitionDef[];
  onFailBehavior?: string;
}

// ============================================
// TYPES
// ============================================

export interface StageContext {
  run: StageRun;
  project: ConvexProject;
  recipe: ConvexRecipe | null;
  documents: ConvexDocument[];
  workspacePath: string;
}

export interface StageExecutionResult {
  success: boolean;
  error?: string;
  tokensUsed?: { input: number; output: number };
  skillsExecuted?: string[];
  gateResults?: Record<string, { passed: boolean; message?: string }>;
  autoAdvance?: boolean;
  nextStage?: string;
  taskResults?: TaskVerificationResult[];
}

export interface TaskVerificationResult {
  taskName: string;
  passed: boolean;
  criteriaResults: Array<{
    criterion: string;
    passed: boolean;
    evidence?: string;
  }>;
  verifiedAt: string;
  commitHash?: string;
}

function getConvexClient() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is required");
  return new ConvexHttpClient(url);
}

// ============================================
// MAIN EXECUTOR
// ============================================

export async function executeStage(
  run: StageRun,
  callbacks: StreamCallback,
): Promise<StageExecutionResult> {
  try {
    callbacks.onLog(
      "info",
      `Loading context for stage ${run.stage}`,
      "executor",
    );

    const context = await loadStageContext(run);

    if (!context.project) {
      return {
        success: false,
        error: `Project ${run.cardId} not found`,
      };
    }

    callbacks.onLog("info", `Project: ${context.project.name}`, "executor");
    callbacks.onLog(
      "info",
      `Documents: ${context.documents.length}`,
      "executor",
    );
    callbacks.onProgress(0.1, "Context loaded");

    const recipe = context.recipe;
    if (recipe && recipe.recipeSteps && recipe.recipeSteps.length > 0) {
      callbacks.onLog(
        "info",
        `Running recipe with ${recipe.recipeSteps.length} steps`,
        "executor",
      );
    }

    let result: StageExecutionResult;

    switch (run.stage) {
      case "inbox":
        result = await executeInbox(context, callbacks);
        break;
      case "discovery":
        result = await executeDiscovery(context, callbacks);
        break;
      case "prd":
        result = await executePRD(context, callbacks);
        break;
      case "design":
        result = await executeDesign(context, callbacks);
        break;
      case "prototype":
        result = await executePrototype(context, callbacks);
        break;
      case "validate":
        result = await executeValidate(context, callbacks);
        break;
      case "tickets":
        result = await executeTickets(context, callbacks);
        break;
      default:
        callbacks.onLog(
          "warn",
          `No executor for stage ${run.stage}, running default`,
          "executor",
        );
        result = await executeDefault(context, callbacks);
    }

    if (recipe && recipe.gates && recipe.gates.length > 0) {
      callbacks.onLog(
        "info",
        `Running ${recipe.gates.length} gates`,
        "executor",
      );
      const gateResults = await runGates(context, recipe.gates, callbacks);
      result.gateResults = gateResults;

      const failedGates = Object.entries(gateResults).filter(
        ([, res]) => !res.passed,
      );

      if (failedGates.length > 0) {
        callbacks.onLog(
          "warn",
          `${failedGates.length} gates failed`,
          "executor",
        );
        result.autoAdvance = false;

        if (result.success && recipe.onFailBehavior === "stay") {
          result.success = false;
          result.error = `Gates failed: ${failedGates.map(([name]) => name).join(", ")}`;
        }
      }
    }

    callbacks.onProgress(1.0, "Execution complete");
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    callbacks.onLog(
      "error",
      `Stage execution failed: ${errorMessage}`,
      "executor",
    );

    return {
      success: false,
      error: errorMessage,
    };
  }
}

// ============================================
// CONTEXT LOADING (Convex-backed)
// ============================================

export async function loadStageContext(
  run: StageRun,
): Promise<StageContext> {
  const client = getConvexClient();

  // Load project
  const project = await client.query(api.projects.get, {
    projectId: run.cardId as Id<"projects">,
  });

  // Load recipe for this stage
  const recipe = await client.query(api.stageRuns.getRecipe, {
    workspaceId: run.workspaceId as Id<"workspaces">,
    stage: run.stage,
  });

  // Load documents for this project
  const docs = await client.query(api.documents.byProject, {
    projectId: run.cardId as Id<"projects">,
  });

  const workspacePath = process.env.WORKSPACE_PATH || process.cwd();

  return {
    run,
    project: project as ConvexProject,
    recipe: (recipe as ConvexRecipe | null) ?? null,
    documents: (docs ?? []) as ConvexDocument[],
    workspacePath,
  };
}

// ============================================
// GATE EVALUATION
// ============================================

async function runGates(
  context: StageContext,
  gates: GateDefinitionDef[],
  callbacks: StreamCallback,
): Promise<Record<string, { passed: boolean; message?: string }>> {
  const results: Record<string, { passed: boolean; message?: string }> = {};

  for (const gate of gates) {
    callbacks.onLog("info", `Evaluating gate: ${gate.id}`, "gates");

    let passed = false;
    let message = gate.message;

    switch (gate.type) {
      case "file_exists":
        passed = await checkFileExists(context, gate.config);
        break;
      case "sections_exist":
        passed = await checkSectionsExist(context, gate.config);
        break;
      case "jury_score":
        passed = await checkJuryScore(context, gate.config);
        break;
      case "custom":
        passed = true;
        message = "Custom gate auto-passed";
        break;
      default:
        passed = true;
        message = `Unknown gate type: ${gate.type}`;
    }

    results[gate.id] = { passed, message };
    callbacks.onLog(
      passed ? "info" : "warn",
      `Gate ${gate.id}: ${passed ? "PASSED" : "FAILED"}`,
      "gates",
    );
  }

  return results;
}

async function checkFileExists(
  context: StageContext,
  config: Record<string, unknown>,
): Promise<boolean> {
  const fileType = config.documentType as string;
  return context.documents.some((doc) => doc.type === fileType);
}

async function checkSectionsExist(
  context: StageContext,
  config: Record<string, unknown>,
): Promise<boolean> {
  const documentType = config.documentType as string;
  const sections = config.sections as string[];

  const doc = context.documents.find((d) => d.type === documentType);
  if (!doc) return false;

  const content = doc.content.toLowerCase();
  return sections.every(
    (section) =>
      content.includes(`# ${section.toLowerCase()}`) ||
      content.includes(`## ${section.toLowerCase()}`),
  );
}

async function checkJuryScore(
  _context: StageContext,
  config: Record<string, unknown>,
): Promise<boolean> {
  // TODO: Query Convex juryEvaluations for score check
  const _minScore = (config.minScore as number) ?? 0.7;
  return true;
}

// ============================================
// GSD-INSPIRED TASK LOOP EXECUTION
// ============================================

export async function executeStageWithTasks(
  run: StageRun,
  callbacks: StreamCallback,
): Promise<StageExecutionResult> {
  const context = await loadStageContext(run);
  const recipe = context.recipe;

  const hasVerificationCriteria = recipe?.recipeSteps?.some(
    (step) => step.verificationCriteria && step.verificationCriteria.length > 0,
  );

  if (hasVerificationCriteria && recipe?.recipeSteps) {
    callbacks.onLog(
      "info",
      `Running task-based execution with ${recipe.recipeSteps.length} tasks`,
      "task-loop",
    );
    return executeTaskLoop(context, recipe.recipeSteps, callbacks);
  }

  callbacks.onLog(
    "info",
    "No verification criteria defined, using standard execution",
    "executor",
  );
  return executeStage(run, callbacks);
}

async function executeTaskLoop(
  context: StageContext,
  tasks: RecipeStepDef[],
  callbacks: StreamCallback,
): Promise<StageExecutionResult> {
  const results: TaskVerificationResult[] = [];
  const totalTokensUsed = { input: 0, output: 0 };
  const skillsExecuted: string[] = [];

  callbacks.onLog("info", "Loading verification context...", "task-loop");
  const verificationCtx = await getAllVerificationContext(
    context.run.workspaceId,
  );

  // Load workspace settings for atomic commits via Convex
  const client = getConvexClient();
  const workspace = await client.query(api.workspaces.get, {
    workspaceId: context.run.workspaceId as Id<"workspaces">,
  });
  const wsSettings = (workspace?.settings ?? {}) as Record<string, unknown>;
  const atomicCommitsEnabled = (wsSettings.atomicCommitsEnabled as boolean | undefined) ?? false;
  const verificationStrictness =
    (wsSettings.verificationStrictness as string | undefined) ?? "lenient";

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    const taskName = task.name || task.skillId;

    callbacks.onLog(
      "info",
      `Starting task ${i + 1}/${tasks.length}: ${taskName}`,
      "task-loop",
    );
    callbacks.onProgress((i / tasks.length) * 0.8, `Executing: ${taskName}`);

    const execResult = await executeTaskSkill(context, task, callbacks);

    if (!execResult.success) {
      callbacks.onLog(
        "error",
        `Task "${taskName}" execution failed: ${execResult.error}`,
        "task-loop",
      );
      return {
        success: false,
        error: `Task "${taskName}" failed: ${execResult.error}`,
        taskResults: results,
        tokensUsed: totalTokensUsed,
        skillsExecuted,
      };
    }

    if (execResult.tokensUsed) {
      totalTokensUsed.input += execResult.tokensUsed.input;
      totalTokensUsed.output += execResult.tokensUsed.output;
    }
    skillsExecuted.push(task.skillId);

    // Reload documents after task execution
    const updatedDocs = await client.query(api.documents.byProject, {
      projectId: context.run.cardId as Id<"projects">,
    });
    context.documents = (updatedDocs ?? []) as ConvexDocument[];

    let verificationPassed = true;
    let criteriaResults: TaskVerificationResult["criteriaResults"] = [];

    if (task.verificationCriteria && task.verificationCriteria.length > 0) {
      callbacks.onLog("info", `Verifying task: ${taskName}`, "task-loop");

      const verifyCtx = createVerificationContext(
        context,
        task,
        verificationCtx,
      );

      const verification = await verifyTask(verifyCtx, callbacks);
      verificationPassed = verification.passed;
      criteriaResults = verification.criteriaResults;

      if (!verification.passed) {
        callbacks.onLog(
          "warn",
          `Task "${taskName}" verification failed`,
          "task-loop",
        );

        if (verificationStrictness === "strict") {
          results.push({
            taskName,
            passed: false,
            criteriaResults,
            verifiedAt: new Date().toISOString(),
          });

          return {
            success: false,
            error: `Verification failed for "${taskName}"`,
            gateResults: {
              [taskName]: {
                passed: false,
                message: `Verification failed: ${criteriaResults
                  .filter((r) => !r.passed)
                  .map((r) => r.criterion)
                  .join(", ")}`,
              },
            },
            taskResults: results,
            tokensUsed: totalTokensUsed,
            skillsExecuted,
          };
        }
        callbacks.onLog(
          "warn",
          `Continuing despite verification failure (lenient mode)`,
          "task-loop",
        );
      }
    }

    let commitHash: string | undefined;
    if (
      atomicCommitsEnabled &&
      task.atomicCommit !== false &&
      context.project.metadata?.gitBranch
    ) {
      callbacks.onLog(
        "info",
        `Making atomic commit for: ${taskName}`,
        "task-loop",
      );

      const commitResult = await commitTask({
        repoRoot: context.workspacePath,
        branch: context.project.metadata.gitBranch as string,
        taskName,
        stage: context.run.stage,
        projectName: context.project.name,
        filesChanged: task.targetFiles,
      });

      if (commitResult.committed) {
        commitHash = commitResult.commitHash;
        callbacks.onLog(
          "info",
          `Committed: ${commitResult.commitHash} - ${commitResult.message}`,
          "task-loop",
        );
      }
    }

    results.push({
      taskName,
      passed: verificationPassed,
      criteriaResults,
      verifiedAt: new Date().toISOString(),
      commitHash,
    });

    callbacks.onProgress(
      ((i + 1) / tasks.length) * 0.9,
      `Completed: ${taskName}`,
    );
  }

  callbacks.onProgress(1.0, "All tasks completed");
  callbacks.onLog(
    "info",
    `Task loop completed: ${results.filter((r) => r.passed).length}/${results.length} tasks passed`,
    "task-loop",
  );

  return {
    success: true,
    taskResults: results,
    tokensUsed: totalTokensUsed,
    skillsExecuted,
    autoAdvance: results.every((r) => r.passed),
  };
}

async function executeTaskSkill(
  context: StageContext,
  task: RecipeStepDef,
  callbacks: StreamCallback,
): Promise<ExecutionResult> {
  callbacks.onLog("debug", `Executing skill: ${task.skillId}`, "task-skill");

  const provider = getDefaultProvider();

  let systemPrompt = "";
  let userPrompt = "";

  switch (task.skillId) {
    case "generate_prd":
      systemPrompt =
        "You are a product manager writing a PRD. Be specific, actionable, and user-focused.";
      userPrompt = `Generate a PRD for: ${context.project.name}\n\n${context.project.description || ""}`;
      break;

    case "generate_design_brief":
      systemPrompt =
        "You are a design lead writing a design brief. Focus on user experience and design principles.";
      userPrompt = `Generate a design brief for: ${context.project.name}`;
      break;

    case "generate_engineering_spec":
      systemPrompt =
        "You are a tech lead writing an engineering spec. Be thorough about implementation details.";
      userPrompt = `Generate an engineering spec for: ${context.project.name}`;
      break;

    case "analyze_transcript":
      systemPrompt =
        "You are a user researcher analyzing interview transcripts. Extract key insights and quotes.";
      userPrompt = `Analyze the research for: ${context.project.name}`;
      break;

    default:
      systemPrompt = `Execute the skill: ${task.skillId}`;
      userPrompt = `Project: ${context.project.name}\n\nTask: ${task.name || task.skillId}`;
  }

  const result = await provider.execute(
    systemPrompt,
    userPrompt,
    {
      runId: context.run._id,
      workspaceId: context.run.workspaceId,
      cardId: context.run.cardId,
      stage: context.run.stage,
      workspacePath: context.workspacePath,
    },
    callbacks,
  );

  return result;
}

// ============================================
// DEFAULT EXECUTOR (no-op)
// ============================================

async function executeDefault(
  context: StageContext,
  callbacks: StreamCallback,
): Promise<StageExecutionResult> {
  callbacks.onLog(
    "info",
    `Default executor - no automation for stage ${context.run.stage}`,
    "executor",
  );
  callbacks.onProgress(1.0, "No automation configured");

  return {
    success: true,
    autoAdvance: false,
  };
}

// ============================================
// EXPORTS
// ============================================

export { executeInbox } from "./inbox-executor";
export { executeDiscovery } from "./discovery-executor";
export { executePRD } from "./prd-executor";
export { executeDesign } from "./design-executor";
export { executePrototype } from "./prototype-executor";
export { executeValidate } from "./validate-executor";
export { executeTickets } from "./tickets-executor";
