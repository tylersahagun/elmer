/**
 * Stage Recipes Service
 * 
 * Manages per-stage automation configuration:
 * - Recipe steps (ordered list of skills)
 * - Gates (pass/fail criteria)
 * - Automation level
 * - Provider configuration
 */

import { db } from "@/lib/db";
import {
  stageRecipes,
  skills,
  type ProjectStage,
  type AutomationLevel,
  type ExecutionProvider,
  type RecipeStep,
  type GateDefinition,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import { getSkillById, isSkillTrusted } from "./skills-service";

// ============================================================================
// Types
// ============================================================================

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
      failureMessage: "No signal file was created. Signal must be saved to signals/ folder.",
    },
  ],
  discovery: [
    {
      id: "discovery_hypothesis",
      name: "Hypothesis documented",
      type: "file_exists",
      config: { pattern: "hypotheses/*.md" },
      required: true,
      failureMessage: "No hypothesis file found. Create a hypothesis in hypotheses/ folder.",
    },
    {
      id: "discovery_research",
      name: "Research document exists",
      type: "file_exists",
      config: { pattern: "research.md" },
      required: true,
      failureMessage: "research.md not found in initiative folder.",
    },
  ],
  prd: [
    {
      id: "prd_exists",
      name: "PRD document exists",
      type: "file_exists",
      config: { pattern: "prd.md" },
      required: true,
      failureMessage: "prd.md not found. Generate the PRD document.",
    },
    {
      id: "prd_sections",
      name: "Required PRD sections",
      type: "content_check",
      config: {
        file: "prd.md",
        requiredSections: [
          "Problem Statement",
          "Target Personas",
          "Success Metrics",
          "MVP Scope",
        ],
      },
      required: true,
      failureMessage: "PRD missing required sections: Problem Statement, Personas, Metrics, MVP Scope.",
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
    {
      id: "design_review",
      name: "Design review documented",
      type: "file_exists",
      config: { pattern: "design-review.md" },
      required: false,
      failureMessage: "design-review.md recommended but not required.",
    },
  ],
  prototype: [
    {
      id: "prototype_stories",
      name: "Storybook stories exist",
      type: "file_exists",
      config: { pattern: "**/*.stories.tsx" },
      required: true,
      failureMessage: "No Storybook stories found. Create .stories.tsx files.",
    },
    {
      id: "prototype_chromatic",
      name: "Chromatic URL captured",
      type: "artifact_exists",
      config: { artifactType: "url", label: "Chromatic" },
      required: false,
      failureMessage: "Chromatic URL not captured. Run Chromatic build.",
    },
  ],
  validate: [
    {
      id: "validate_report",
      name: "Validation report exists",
      type: "file_exists",
      config: { pattern: "validation-report.md" },
      required: true,
      failureMessage: "validation-report.md not found.",
    },
    {
      id: "validate_score",
      name: "Jury score meets threshold",
      type: "metric_threshold",
      config: { metric: "jury_score", threshold: 70, operator: ">=" },
      required: true,
      failureMessage: "Jury score below threshold (70%). Iterate on design.",
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
    {
      id: "tickets_created",
      name: "Tickets created in tracker",
      type: "artifact_exists",
      config: { artifactType: "ticket" },
      required: false,
      failureMessage: "No tickets created. Create tickets in Linear/GitHub.",
    },
  ],
  build: [
    {
      id: "build_pr",
      name: "Pull request created",
      type: "artifact_exists",
      config: { artifactType: "pr" },
      required: true,
      failureMessage: "No PR created. Create pull request.",
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
// CRUD Operations
// ============================================================================

/**
 * Get recipe for a specific stage
 */
export async function getStageRecipe(
  workspaceId: string,
  stage: ProjectStage
): Promise<StageRecipe | null> {
  const result = await db
    .select()
    .from(stageRecipes)
    .where(
      and(
        eq(stageRecipes.workspaceId, workspaceId),
        eq(stageRecipes.stage, stage)
      )
    )
    .limit(1);

  if (result.length === 0) return null;

  const row = result[0];
  return {
    id: row.id,
    workspaceId: row.workspaceId,
    stage: row.stage,
    automationLevel: row.automationLevel,
    recipeSteps: (row.recipeSteps as RecipeStep[]) || [],
    gates: (row.gates as GateDefinition[]) || [],
    onFailBehavior: row.onFailBehavior ?? "stay",
    provider: row.provider ?? "anthropic",
    enabled: row.enabled ?? true,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/**
 * Get all recipes for a workspace
 */
export async function getAllStageRecipes(
  workspaceId: string
): Promise<StageRecipe[]> {
  const results = await db
    .select()
    .from(stageRecipes)
    .where(eq(stageRecipes.workspaceId, workspaceId));

  return results.map((row) => ({
    id: row.id,
    workspaceId: row.workspaceId,
    stage: row.stage,
    automationLevel: row.automationLevel,
    recipeSteps: (row.recipeSteps as RecipeStep[]) || [],
    gates: (row.gates as GateDefinition[]) || [],
    onFailBehavior: row.onFailBehavior ?? "stay",
    provider: row.provider ?? "anthropic",
    enabled: row.enabled ?? true,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }));
}

/**
 * Create a new stage recipe
 */
export async function createStageRecipe(input: CreateRecipeInput): Promise<string> {
  const id = `recipe_${nanoid(12)}`;

  await db.insert(stageRecipes).values({
    id,
    workspaceId: input.workspaceId,
    stage: input.stage,
    automationLevel: input.automationLevel || DEFAULT_AUTOMATION_LEVELS[input.stage],
    recipeSteps: input.recipeSteps || [],
    gates: input.gates || DEFAULT_GATES[input.stage],
    onFailBehavior: input.onFailBehavior || "stay",
    provider: input.provider || "anthropic",
    enabled: input.enabled ?? true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return id;
}

/**
 * Update an existing stage recipe
 */
export async function updateStageRecipe(
  workspaceId: string,
  stage: ProjectStage,
  input: UpdateRecipeInput
): Promise<void> {
  const updates: Record<string, unknown> = { updatedAt: new Date() };

  if (input.automationLevel !== undefined) {
    updates.automationLevel = input.automationLevel;
  }
  if (input.recipeSteps !== undefined) {
    updates.recipeSteps = input.recipeSteps;
  }
  if (input.gates !== undefined) {
    updates.gates = input.gates;
  }
  if (input.onFailBehavior !== undefined) {
    updates.onFailBehavior = input.onFailBehavior;
  }
  if (input.provider !== undefined) {
    updates.provider = input.provider;
  }
  if (input.enabled !== undefined) {
    updates.enabled = input.enabled;
  }

  await db
    .update(stageRecipes)
    .set(updates)
    .where(
      and(
        eq(stageRecipes.workspaceId, workspaceId),
        eq(stageRecipes.stage, stage)
      )
    );
}

/**
 * Delete a stage recipe
 */
export async function deleteStageRecipe(
  workspaceId: string,
  stage: ProjectStage
): Promise<boolean> {
  const result = await db
    .delete(stageRecipes)
    .where(
      and(
        eq(stageRecipes.workspaceId, workspaceId),
        eq(stageRecipes.stage, stage)
      )
    );

  return (result.rowCount ?? 0) > 0;
}

// ============================================================================
// Validation
// ============================================================================

/**
 * Validate a recipe configuration
 */
export async function validateRecipe(recipe: StageRecipe): Promise<RecipeValidation> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const skillsStatus: RecipeValidation["skillsStatus"] = [];

  // Check each skill in the recipe
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

  // Check gates
  if (recipe.gates.length === 0) {
    warnings.push("No gates defined. Stage will advance without validation checks.");
  }

  // Check for required gates
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

/**
 * Check if a recipe can run in fully_auto mode
 * (All skills must be trusted)
 */
export async function canRunFullyAuto(recipe: StageRecipe): Promise<boolean> {
  for (const step of recipe.recipeSteps) {
    const skill = await getSkillById(step.skillId);
    if (!skill || !isSkillTrusted(skill)) {
      return false;
    }
  }
  return true;
}

// ============================================================================
// Initialization
// ============================================================================

/**
 * Initialize default recipes for all stages in a workspace
 */
export async function initializeDefaultRecipes(workspaceId: string): Promise<void> {
  const stages: ProjectStage[] = [
    "inbox",
    "discovery",
    "prd",
    "design",
    "prototype",
    "validate",
    "tickets",
    "build",
    "alpha",
    "beta",
    "ga",
  ];

  for (const stage of stages) {
    // Check if recipe already exists
    const existing = await getStageRecipe(workspaceId, stage);
    if (existing) continue;

    await createStageRecipe({
      workspaceId,
      stage,
      automationLevel: DEFAULT_AUTOMATION_LEVELS[stage],
      recipeSteps: [], // Start with built-in executor, no custom skills
      gates: DEFAULT_GATES[stage],
      onFailBehavior: "stay",
      provider: "anthropic",
      enabled: true,
    });
  }
}

/**
 * Get effective automation level for a stage
 * (Considers skill trust levels)
 */
export async function getEffectiveAutomationLevel(
  recipe: StageRecipe
): Promise<AutomationLevel> {
  // If recipe says fully_auto but has untrusted skills, downgrade to auto_notify
  if (recipe.automationLevel === "fully_auto") {
    const canAuto = await canRunFullyAuto(recipe);
    if (!canAuto) {
      return "auto_notify";
    }
  }
  return recipe.automationLevel;
}

/**
 * Check if a stage requires human approval before advancing
 */
export function requiresApproval(recipe: StageRecipe): boolean {
  return (
    recipe.automationLevel === "human_approval" ||
    recipe.automationLevel === "manual"
  );
}

/**
 * Get all stages that can auto-advance (no human approval needed)
 */
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
