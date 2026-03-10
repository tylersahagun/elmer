/**
 * Stage Recipes Service
 * 
 * Manages per-stage automation configuration via Convex.
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { getSkillById, isSkillTrusted } from "./skills-service";

function getConvexClient() {
  return new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
}

// ============================================================================
// Types
// ============================================================================

type ProjectStage = "inbox" | "discovery" | "prd" | "design" | "prototype" | "validate" | "tickets" | "build" | "alpha" | "beta" | "ga";
type AutomationLevel = "fully_auto" | "auto_notify" | "human_approval" | "manual";
type ExecutionProvider = "anthropic" | "openai" | "cli" | "cursor";

export interface RecipeStep {
  skillId: string;
  order?: number;
  name?: string;
  timeout?: number;
  retryCount?: number;
  params?: Record<string, unknown>;
  paramsJson?: Record<string, unknown>;
  inputsMapping?: Record<string, string>;
  outputsMapping?: Record<string, string>;
  continueOnError?: boolean;
}

export interface GateDefinition {
  id: string;
  name?: string;
  type: string;
  config?: Record<string, unknown>;
  required?: boolean;
  failureMessage?: string;
}

export interface StageRecipe {
  id: string;
  workspaceId: string;
  stage: ProjectStage;
  automationLevel: AutomationLevel;
  recipeSteps: RecipeStep[];
  gates: GateDefinition[];
  onFailBehavior: "stay" | "revert" | "create_questions" | "review_required";
  provider: ExecutionProvider;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRecipeInput {
  workspaceId: string;
  stage: ProjectStage;
  automationLevel?: AutomationLevel;
  recipeSteps?: RecipeStep[];
  gates?: GateDefinition[];
  onFailBehavior?: "stay" | "revert" | "create_questions" | "review_required";
  provider?: ExecutionProvider;
  enabled?: boolean;
}

export interface UpdateRecipeInput {
  automationLevel?: AutomationLevel;
  recipeSteps?: RecipeStep[];
  gates?: GateDefinition[];
  onFailBehavior?: "stay" | "revert" | "create_questions" | "review_required";
  provider?: ExecutionProvider;
  enabled?: boolean;
}

export interface RecipeValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
  skillsStatus: {
    skillId: string;
    name: string;
    found: boolean;
    trusted: boolean;
    source: string;
  }[];
}

// ============================================================================
// Default Recipe Configurations
// ============================================================================

const DEFAULT_GATES: Record<ProjectStage, GateDefinition[]> = {
  inbox: [
    {
      id: "inbox_signal_created",
      name: "Signal file created",
      type: "file_exists",
      config: { pattern: "signals/**/*.md" },
      required: true,
      failureMessage: "No signal file was created.",
    },
  ],
  discovery: [
    {
      id: "discovery_hypothesis",
      name: "Hypothesis documented",
      type: "file_exists",
      config: { pattern: "hypotheses/*.md" },
      required: true,
      failureMessage: "No hypothesis file found.",
    },
    {
      id: "discovery_research",
      name: "Research document exists",
      type: "file_exists",
      config: { pattern: "research.md" },
      required: true,
      failureMessage: "research.md not found.",
    },
  ],
  prd: [
    {
      id: "prd_exists",
      name: "PRD document exists",
      type: "file_exists",
      config: { pattern: "prd.md" },
      required: true,
      failureMessage: "prd.md not found.",
    },
  ],
  design: [
    {
      id: "design_brief",
      name: "Design brief exists",
      type: "file_exists",
      config: { pattern: "design-brief.md" },
      required: true,
      failureMessage: "design-brief.md not found.",
    },
  ],
  prototype: [
    {
      id: "prototype_stories",
      name: "Storybook stories exist",
      type: "file_exists",
      config: { pattern: "**/*.stories.tsx" },
      required: true,
      failureMessage: "No Storybook stories found.",
    },
  ],
  validate: [
    {
      id: "validate_score",
      name: "Jury score meets threshold",
      type: "metric_threshold",
      config: { metric: "jury_score", threshold: 70, operator: ">=" },
      required: true,
      failureMessage: "Jury score below threshold (70%).",
    },
  ],
  tickets: [
    {
      id: "tickets_plan",
      name: "Ticket plan exists",
      type: "file_exists",
      config: { pattern: "ticket-plan.md" },
      required: true,
      failureMessage: "ticket-plan.md not found.",
    },
  ],
  build: [
    {
      id: "build_pr",
      name: "Pull request created",
      type: "artifact_exists",
      config: { artifactType: "pr" },
      required: true,
      failureMessage: "No PR created.",
    },
  ],
  alpha: [
    {
      id: "alpha_deployed",
      name: "Alpha deployed",
      type: "artifact_exists",
      config: { artifactType: "url", label: "Alpha" },
      required: true,
      failureMessage: "Alpha deployment URL not found.",
    },
  ],
  beta: [
    {
      id: "beta_metrics",
      name: "Beta metrics collected",
      type: "metric_threshold",
      config: { metric: "beta_users", threshold: 10, operator: ">=" },
      required: true,
      failureMessage: "Need at least 10 beta users.",
    },
  ],
  ga: [
    {
      id: "ga_launched",
      name: "GA launched",
      type: "artifact_exists",
      config: { artifactType: "url", label: "Production" },
      required: true,
      failureMessage: "Production URL not found.",
    },
  ],
};

const DEFAULT_AUTOMATION_LEVELS: Record<ProjectStage, AutomationLevel> = {
  inbox: "fully_auto",
  discovery: "auto_notify",
  prd: "auto_notify",
  design: "auto_notify",
  prototype: "auto_notify",
  validate: "human_approval",
  tickets: "human_approval",
  build: "manual",
  alpha: "manual",
  beta: "manual",
  ga: "manual",
};

// ============================================================================
// Helpers
// ============================================================================

function convexToRecipe(row: {
  _id: Id<"stageRecipes">;
  _creationTime: number;
  workspaceId: Id<"workspaces">;
  stage: string;
  automationLevel: string;
  provider: string;
  skills?: string[];
  gates?: string[];
  enabled: boolean;
  recipeSteps?: unknown;
  gateDefinitions?: unknown;
  onFailBehavior?: string;
}): StageRecipe {
  return {
    id: row._id,
    workspaceId: row.workspaceId,
    stage: row.stage as ProjectStage,
    automationLevel: row.automationLevel as AutomationLevel,
    recipeSteps: (row.recipeSteps as RecipeStep[]) || [],
    gates: (row.gateDefinitions as GateDefinition[]) || [],
    onFailBehavior: (row.onFailBehavior ?? "stay") as StageRecipe["onFailBehavior"],
    provider: row.provider as ExecutionProvider,
    enabled: row.enabled,
    createdAt: new Date(row._creationTime),
    updatedAt: new Date(row._creationTime),
  };
}

// ============================================================================
// CRUD Operations
// ============================================================================

export async function getStageRecipe(
  workspaceId: string,
  stage: ProjectStage
): Promise<StageRecipe | null> {
  const client = getConvexClient();
  const result = await client.query(api.stageRuns.getRecipe, {
    workspaceId: workspaceId as Id<"workspaces">,
    stage,
  });
  if (!result) return null;
  return convexToRecipe(result as Parameters<typeof convexToRecipe>[0]);
}

export async function getAllStageRecipes(
  workspaceId: string
): Promise<StageRecipe[]> {
  const client = getConvexClient();
  const results = await client.query(api.stageRuns.listRecipes, {
    workspaceId: workspaceId as Id<"workspaces">,
  });
  return results.map((r) => convexToRecipe(r as Parameters<typeof convexToRecipe>[0]));
}

export async function createStageRecipe(input: CreateRecipeInput): Promise<string> {
  const client = getConvexClient();
  const id = await client.mutation(api.stageRuns.upsertRecipeFull, {
    workspaceId: input.workspaceId as Id<"workspaces">,
    stage: input.stage,
    automationLevel: input.automationLevel || DEFAULT_AUTOMATION_LEVELS[input.stage],
    recipeSteps: input.recipeSteps || [],
    gateDefinitions: input.gates || DEFAULT_GATES[input.stage],
    onFailBehavior: input.onFailBehavior || "stay",
    provider: input.provider || "anthropic",
    enabled: input.enabled ?? true,
  });
  return id;
}

export async function updateStageRecipe(
  workspaceId: string,
  stage: ProjectStage,
  input: UpdateRecipeInput
): Promise<void> {
  const existing = await getStageRecipe(workspaceId, stage);
  if (!existing) return;

  const client = getConvexClient();
  await client.mutation(api.stageRuns.upsertRecipeFull, {
    workspaceId: workspaceId as Id<"workspaces">,
    stage,
    automationLevel: input.automationLevel ?? existing.automationLevel,
    recipeSteps: input.recipeSteps ?? existing.recipeSteps,
    gateDefinitions: input.gates ?? existing.gates,
    onFailBehavior: input.onFailBehavior ?? existing.onFailBehavior,
    provider: input.provider ?? existing.provider,
    enabled: input.enabled ?? existing.enabled,
  });
}

export async function deleteStageRecipe(
  workspaceId: string,
  stage: ProjectStage
): Promise<boolean> {
  const client = getConvexClient();
  return await client.mutation(api.stageRuns.deleteRecipe, {
    workspaceId: workspaceId as Id<"workspaces">,
    stage,
  });
}

// ============================================================================
// Validation
// ============================================================================

export async function validateRecipe(recipe: StageRecipe): Promise<RecipeValidation> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const skillsStatus: RecipeValidation["skillsStatus"] = [];

  for (const step of recipe.recipeSteps) {
    const skill = await getSkillById(step.skillId);
    
    if (!skill) {
      errors.push(`Skill not found: ${step.skillId}`);
      skillsStatus.push({
        skillId: step.skillId,
        name: step.skillId,
        found: false,
        trusted: false,
        source: "unknown",
      });
    } else {
      const trusted = isSkillTrusted(skill);
      skillsStatus.push({
        skillId: skill.id,
        name: skill.name,
        found: true,
        trusted,
        source: skill.source,
      });

      if (!trusted && recipe.automationLevel === "fully_auto") {
        warnings.push(
          `Skill "${skill.name}" is not vetted. fully_auto mode requires all skills to be trusted.`
        );
      }
    }
  }

  if (recipe.gates.length === 0) {
    warnings.push("No gates defined. Stage will advance without validation checks.");
  }

  const requiredGates = recipe.gates.filter((g) => g.required);
  if (requiredGates.length === 0) {
    warnings.push("No required gates. Consider adding at least one required gate.");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    skillsStatus,
  };
}

export async function canRunFullyAuto(recipe: StageRecipe): Promise<boolean> {
  for (const step of recipe.recipeSteps) {
    const skill = await getSkillById(step.skillId);
    if (!skill || !isSkillTrusted(skill)) return false;
  }
  return true;
}

// ============================================================================
// Initialization
// ============================================================================

export async function initializeDefaultRecipes(workspaceId: string): Promise<void> {
  const stages: ProjectStage[] = [
    "inbox", "discovery", "prd", "design", "prototype",
    "validate", "tickets", "build", "alpha", "beta", "ga",
  ];

  for (const stage of stages) {
    const existing = await getStageRecipe(workspaceId, stage);
    if (existing) continue;

    await createStageRecipe({
      workspaceId,
      stage,
      automationLevel: DEFAULT_AUTOMATION_LEVELS[stage],
      recipeSteps: [],
      gates: DEFAULT_GATES[stage],
      onFailBehavior: "stay",
      provider: "anthropic",
      enabled: true,
    });
  }
}

export async function getEffectiveAutomationLevel(
  recipe: StageRecipe
): Promise<AutomationLevel> {
  if (recipe.automationLevel === "fully_auto") {
    const canAuto = await canRunFullyAuto(recipe);
    if (!canAuto) return "auto_notify";
  }
  return recipe.automationLevel;
}

export function requiresApproval(recipe: StageRecipe): boolean {
  return (
    recipe.automationLevel === "human_approval" ||
    recipe.automationLevel === "manual"
  );
}

export async function getAutoAdvanceableStages(
  workspaceId: string
): Promise<ProjectStage[]> {
  const recipes = await getAllStageRecipes(workspaceId);
  const autoStages: ProjectStage[] = [];

  for (const recipe of recipes) {
    if (!recipe.enabled) continue;
    const effectiveLevel = await getEffectiveAutomationLevel(recipe);
    if (effectiveLevel === "fully_auto" || effectiveLevel === "auto_notify") {
      autoStages.push(recipe.stage);
    }
  }

  return autoStages;
}
