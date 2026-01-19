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

import { db } from "@/lib/db";
import {
  stageRuns,
  stageRecipes,
  projects,
  documents,
  workspaces,
  type ProjectStage,
  type RecipeStep,
  type GateDefinition,
  type TaskVerificationResult,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { addRunLog, createArtifact } from "../run-manager";
import { getProvider, getDefaultProvider, type StreamCallback, type ExecutionResult } from "../providers";
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
// TYPES
// ============================================

export interface StageContext {
  run: typeof stageRuns.$inferSelect;
  project: typeof projects.$inferSelect;
  recipe: typeof stageRecipes.$inferSelect | null;
  documents: Array<typeof documents.$inferSelect>;
  workspacePath: string;
}

export interface StageExecutionResult {
  success: boolean;
  error?: string;
  tokensUsed?: { input: number; output: number };
  skillsExecuted?: string[];
  gateResults?: Record<string, { passed: boolean; message?: string }>;
  autoAdvance?: boolean; // Should automatically move to next stage
  nextStage?: ProjectStage;
  // GSD-inspired task tracking
  taskResults?: TaskVerificationResult[];
}

// ============================================
// MAIN EXECUTOR
// ============================================

export async function executeStage(
  run: typeof stageRuns.$inferSelect,
  callbacks: StreamCallback
): Promise<StageExecutionResult> {
  const startTime = Date.now();
  
  try {
    // Load context
    callbacks.onLog("info", `Loading context for stage ${run.stage}`, "executor");
    
    const context = await loadStageContext(run);
    
    if (!context.project) {
      return {
        success: false,
        error: `Project ${run.cardId} not found`,
      };
    }

    callbacks.onLog("info", `Project: ${context.project.name}`, "executor");
    callbacks.onLog("info", `Documents: ${context.documents.length}`, "executor");
    callbacks.onProgress(0.1, "Context loaded");

    // Get recipe for this stage
    const recipe = context.recipe;
    if (recipe && recipe.recipeSteps && recipe.recipeSteps.length > 0) {
      callbacks.onLog("info", `Running recipe with ${recipe.recipeSteps.length} steps`, "executor");
    }

    // Dispatch to stage-specific executor
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
        callbacks.onLog("warn", `No executor for stage ${run.stage}, running default`, "executor");
        result = await executeDefault(context, callbacks);
    }

    // Run gates if recipe exists
    if (recipe && recipe.gates && recipe.gates.length > 0) {
      callbacks.onLog("info", `Running ${recipe.gates.length} gates`, "executor");
      const gateResults = await runGates(context, recipe.gates, callbacks);
      result.gateResults = gateResults;
      
      // Check if all required gates passed
      const failedGates = Object.entries(gateResults).filter(
        ([_, res]) => !res.passed
      );
      
      if (failedGates.length > 0) {
        callbacks.onLog("warn", `${failedGates.length} gates failed`, "executor");
        result.autoAdvance = false;
        
        // If gates are blocking and we had success, convert to failure
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
    callbacks.onLog("error", `Stage execution failed: ${errorMessage}`, "executor");
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

// ============================================
// CONTEXT LOADING
// ============================================

async function loadStageContext(run: typeof stageRuns.$inferSelect): Promise<StageContext> {
  // Load project
  const projectResults = await db
    .select()
    .from(projects)
    .where(eq(projects.id, run.cardId))
    .limit(1);
  
  const project = projectResults[0];

  // Load recipe
  const recipeResults = await db
    .select()
    .from(stageRecipes)
    .where(
      and(
        eq(stageRecipes.workspaceId, run.workspaceId),
        eq(stageRecipes.stage, run.stage)
      )
    )
    .limit(1);
  
  const recipe = recipeResults[0] ?? null;

  // Load documents for this project
  const docs = await db
    .select()
    .from(documents)
    .where(eq(documents.projectId, run.cardId));

  // Determine workspace path (from environment or default)
  const workspacePath = process.env.WORKSPACE_PATH || process.cwd();

  return {
    run,
    project,
    recipe,
    documents: docs,
    workspacePath,
  };
}

// ============================================
// GATE EVALUATION
// ============================================

async function runGates(
  context: StageContext,
  gates: GateDefinition[],
  callbacks: StreamCallback
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
        // Custom gates can be implemented per-stage
        passed = true;
        message = "Custom gate auto-passed";
        break;
      default:
        passed = true;
        message = `Unknown gate type: ${gate.type}`;
    }

    results[gate.id] = { passed, message };
    callbacks.onLog(passed ? "info" : "warn", `Gate ${gate.id}: ${passed ? "PASSED" : "FAILED"}`, "gates");
  }

  return results;
}

async function checkFileExists(
  context: StageContext,
  config: Record<string, unknown>
): Promise<boolean> {
  const fileType = config.documentType as string;
  return context.documents.some((doc) => doc.type === fileType);
}

async function checkSectionsExist(
  context: StageContext,
  config: Record<string, unknown>
): Promise<boolean> {
  const documentType = config.documentType as string;
  const sections = config.sections as string[];
  
  const doc = context.documents.find((d) => d.type === documentType);
  if (!doc) return false;
  
  const content = doc.content.toLowerCase();
  return sections.every((section) => 
    content.includes(`# ${section.toLowerCase()}`) ||
    content.includes(`## ${section.toLowerCase()}`)
  );
}

async function checkJuryScore(
  context: StageContext,
  config: Record<string, unknown>
): Promise<boolean> {
  // TODO: Implement jury score check
  const minScore = config.minScore as number ?? 0.7;
  // For now, auto-pass
  return true;
}

// ============================================
// GSD-INSPIRED TASK LOOP EXECUTION
// ============================================

/**
 * Execute a stage with task-based verification.
 * Falls back to standard stage execution if no verification criteria defined.
 */
export async function executeStageWithTasks(
  run: typeof stageRuns.$inferSelect,
  callbacks: StreamCallback
): Promise<StageExecutionResult> {
  const context = await loadStageContext(run);
  const recipe = context.recipe;
  
  // Check if recipe has structured tasks with verification criteria
  const hasVerificationCriteria = recipe?.recipeSteps?.some(
    (step) => step.verificationCriteria && step.verificationCriteria.length > 0
  );
  
  if (hasVerificationCriteria && recipe?.recipeSteps) {
    callbacks.onLog("info", `Running task-based execution with ${recipe.recipeSteps.length} tasks`, "task-loop");
    return executeTaskLoop(context, recipe.recipeSteps, callbacks);
  }
  
  // Fall back to existing stage executor
  callbacks.onLog("info", "No verification criteria defined, using standard execution", "executor");
  return executeStage(run, callbacks);
}

/**
 * Execute tasks sequentially with verification and atomic commits.
 */
async function executeTaskLoop(
  context: StageContext,
  tasks: RecipeStep[],
  callbacks: StreamCallback
): Promise<StageExecutionResult> {
  const results: TaskVerificationResult[] = [];
  let totalTokensUsed = { input: 0, output: 0 };
  const skillsExecuted: string[] = [];
  
  // Load verification context (personas, guardrails, company context)
  callbacks.onLog("info", "Loading verification context...", "task-loop");
  const verificationCtx = await getAllVerificationContext(context.run.workspaceId);
  
  // Get workspace settings for atomic commits
  const wsResults = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.id, context.run.workspaceId))
    .limit(1);
  const workspace = wsResults[0];
  const atomicCommitsEnabled = workspace?.settings?.atomicCommitsEnabled ?? false;
  const verificationStrictness = workspace?.settings?.verificationStrictness ?? "lenient";
  
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    const taskName = task.name || task.skillId;
    
    callbacks.onLog("info", `Starting task ${i + 1}/${tasks.length}: ${taskName}`, "task-loop");
    callbacks.onProgress((i / tasks.length) * 0.8, `Executing: ${taskName}`);
    
    // 1. Execute task (dispatch to appropriate executor based on skillId)
    const execResult = await executeTaskSkill(context, task, callbacks);
    
    if (!execResult.success) {
      callbacks.onLog("error", `Task "${taskName}" execution failed: ${execResult.error}`, "task-loop");
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
    
    // Reload documents after task execution (they may have been created/updated)
    const updatedDocs = await db
      .select()
      .from(documents)
      .where(eq(documents.projectId, context.run.cardId));
    context.documents = updatedDocs;
    
    // 2. Verify task if verification criteria defined
    let verificationPassed = true;
    let criteriaResults: TaskVerificationResult["criteriaResults"] = [];
    
    if (task.verificationCriteria && task.verificationCriteria.length > 0) {
      callbacks.onLog("info", `Verifying task: ${taskName}`, "task-loop");
      
      const verifyCtx = createVerificationContext(
        context,
        task,
        verificationCtx
      );
      
      const verification = await verifyTask(verifyCtx, callbacks);
      verificationPassed = verification.passed;
      criteriaResults = verification.criteriaResults;
      
      if (!verification.passed) {
        callbacks.onLog("warn", `Task "${taskName}" verification failed`, "task-loop");
        
        // Handle based on strictness
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
                message: `Verification failed: ${criteriaResults.filter(r => !r.passed).map(r => r.criterion).join(", ")}`,
              },
            },
            taskResults: results,
            tokensUsed: totalTokensUsed,
            skillsExecuted,
          };
        }
        // In lenient mode, log warning but continue
        callbacks.onLog("warn", `Continuing despite verification failure (lenient mode)`, "task-loop");
      }
    }
    
    // 3. Atomic commit if enabled and on a feature branch
    let commitHash: string | undefined;
    if (atomicCommitsEnabled && task.atomicCommit !== false && context.project.metadata?.gitBranch) {
      callbacks.onLog("info", `Making atomic commit for: ${taskName}`, "task-loop");
      
      const commitResult = await commitTask({
        repoRoot: context.workspacePath,
        branch: context.project.metadata.gitBranch,
        taskName,
        stage: context.run.stage,
        projectName: context.project.name,
        filesChanged: task.targetFiles,
      });
      
      if (commitResult.committed) {
        commitHash = commitResult.commitHash;
        callbacks.onLog("info", `Committed: ${commitResult.commitHash} - ${commitResult.message}`, "task-loop");
      }
    }
    
    // Record task result
    results.push({
      taskName,
      passed: verificationPassed,
      criteriaResults,
      verifiedAt: new Date().toISOString(),
      commitHash,
    });
    
    callbacks.onProgress(((i + 1) / tasks.length) * 0.9, `Completed: ${taskName}`);
  }
  
  callbacks.onProgress(1.0, "All tasks completed");
  callbacks.onLog("info", `Task loop completed: ${results.filter(r => r.passed).length}/${results.length} tasks passed`, "task-loop");
  
  return {
    success: true,
    taskResults: results,
    tokensUsed: totalTokensUsed,
    skillsExecuted,
    autoAdvance: results.every((r) => r.passed),
  };
}

/**
 * Execute a single task/skill within the task loop.
 * Maps skill IDs to existing stage executors or AI generation.
 */
async function executeTaskSkill(
  context: StageContext,
  task: RecipeStep,
  callbacks: StreamCallback
): Promise<ExecutionResult> {
  callbacks.onLog("debug", `Executing skill: ${task.skillId}`, "task-skill");
  
  // Map common skill IDs to their execution logic
  // For now, use the default AI provider for generation tasks
  const provider = getDefaultProvider();
  
  // Build a prompt based on skill type
  let systemPrompt = "";
  let userPrompt = "";
  
  switch (task.skillId) {
    case "generate_prd":
      systemPrompt = "You are a product manager writing a PRD. Be specific, actionable, and user-focused.";
      userPrompt = `Generate a PRD for: ${context.project.name}\n\n${context.project.description || ""}`;
      break;
      
    case "generate_design_brief":
      systemPrompt = "You are a design lead writing a design brief. Focus on user experience and design principles.";
      userPrompt = `Generate a design brief for: ${context.project.name}`;
      break;
      
    case "generate_engineering_spec":
      systemPrompt = "You are a tech lead writing an engineering spec. Be thorough about implementation details.";
      userPrompt = `Generate an engineering spec for: ${context.project.name}`;
      break;
      
    case "analyze_transcript":
      systemPrompt = "You are a user researcher analyzing interview transcripts. Extract key insights and quotes.";
      userPrompt = `Analyze the research for: ${context.project.name}`;
      break;
      
    default:
      // Generic skill execution
      systemPrompt = `Execute the skill: ${task.skillId}`;
      userPrompt = `Project: ${context.project.name}\n\nTask: ${task.name || task.skillId}`;
  }
  
  // Execute with AI provider
  const result = await provider.execute(
    systemPrompt,
    userPrompt,
    {
      runId: context.run.id,
      workspaceId: context.run.workspaceId,
      cardId: context.run.cardId,
      stage: context.run.stage,
      workspacePath: context.workspacePath,
    },
    callbacks
  );
  
  return result;
}

// ============================================
// DEFAULT EXECUTOR (no-op)
// ============================================

async function executeDefault(
  context: StageContext,
  callbacks: StreamCallback
): Promise<StageExecutionResult> {
  callbacks.onLog("info", `Default executor - no automation for stage ${context.run.stage}`, "executor");
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

// Re-export loadStageContext for use by task loop
export { loadStageContext };
