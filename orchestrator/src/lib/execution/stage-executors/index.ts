/**
 * Stage Executors - Execute automation for each Kanban stage
 * 
 * Each stage has specific inputs, automation steps, outputs, and gates.
 * This module dispatches to the appropriate executor based on stage.
 */

import { db } from "@/lib/db";
import {
  stageRuns,
  stageRecipes,
  projects,
  documents,
  type ProjectStage,
  type RecipeStep,
  type GateDefinition,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { addRunLog, createArtifact } from "../run-manager";
import { getProvider, getDefaultProvider, type StreamCallback, type ExecutionResult } from "../providers";

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
