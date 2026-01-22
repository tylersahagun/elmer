/**
 * Stage Recipes Chat API - AI-powered recipe editing
 * 
 * POST - Send a natural language request to modify recipes
 */

import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  getAllStageRecipes,
  getStageRecipe,
  updateStageRecipe,
  type StageRecipe,
  type UpdateRecipeInput,
} from "@/lib/skills";
import type { ProjectStage, AutomationLevel, RecipeStep, GateDefinition } from "@/lib/db/schema";

const anthropic = new Anthropic();

// Valid automation levels
const AUTOMATION_LEVELS: AutomationLevel[] = ["fully_auto", "auto_notify", "human_approval", "manual"];

// Valid stages
const VALID_STAGES: ProjectStage[] = [
  "inbox", "discovery", "prd", "design", "prototype",
  "validate", "tickets", "build", "alpha", "beta", "ga"
];

// Job types for recipe steps
const JOB_TYPES = [
  "analyze_transcript",
  "generate_prd",
  "generate_design_brief",
  "generate_engineering_spec",
  "generate_gtm_brief",
  "build_prototype",
  "iterate_prototype",
  "run_jury_evaluation",
  "generate_tickets",
  "validate_tickets",
  "score_stage_alignment",
  "deploy_chromatic",
  "create_feature_branch",
];

// Gate types
const GATE_TYPES = [
  "file_exists",
  "sections_exist",
  "jury_score",
  "custom",
  "content_check",
  "artifact_exists",
  "metric_threshold",
];

interface RecipeUpdate {
  stage: ProjectStage;
  changes: UpdateRecipeInput;
  description: string;
}

interface ChatResponse {
  message: string;
  updates?: RecipeUpdate[];
  applied?: boolean;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { workspaceId, message, apply = false } = body;

    if (!workspaceId || !message) {
      return NextResponse.json(
        { error: "workspaceId and message required" },
        { status: 400 }
      );
    }

    // Get current recipes for context
    const recipes = await getAllStageRecipes(workspaceId);

    // Build recipe context
    const recipeContext = recipes.map((r: StageRecipe) => ({
      stage: r.stage,
      automationLevel: r.automationLevel,
      enabled: r.enabled,
      stepsCount: r.recipeSteps?.length || 0,
      steps: (r.recipeSteps || []).map((s: RecipeStep) => s.skillId || s.name),
      gatesCount: r.gates?.length || 0,
      gates: (r.gates || []).map((g: GateDefinition) => g.type),
      onFailBehavior: r.onFailBehavior,
      provider: r.provider,
    }));

    const systemPrompt = `You are a stage recipe configuration assistant. You help modify automation recipes for a product management pipeline.

## Current Recipes
${JSON.stringify(recipeContext, null, 2)}

## Available Stages
${VALID_STAGES.join(", ")}

## Available Automation Levels
- fully_auto: Runs without any human intervention
- auto_notify: Runs automatically but notifies user
- human_approval: Requires explicit approval before running
- manual: Must be manually triggered

## Available Job Types (for recipe steps)
${JOB_TYPES.join(", ")}

## Available Gate Types
${GATE_TYPES.join(", ")}

## Instructions
When the user asks to modify recipes, respond with:
1. A clear explanation of what will change
2. A JSON block with the updates in this exact format:

\`\`\`json
{
  "updates": [
    {
      "stage": "stage_name",
      "changes": {
        "automationLevel": "fully_auto|auto_notify|human_approval|manual",
        "enabled": true|false,
        "recipeSteps": [...],
        "gates": [...],
        "onFailBehavior": "stay|revert|create_questions|review_required",
        "provider": "anthropic|openai|cli|cursor"
      },
      "description": "Brief description of this change"
    }
  ]
}
\`\`\`

Only include fields that are being changed. If no changes are needed (e.g., asking about status), just respond conversationally without a JSON block.

For recipe steps, use this format:
{
  "skillId": "job_type",
  "order": 1,
  "name": "Human readable name",
  "timeout": 60000,
  "retryCount": 2
}

For gates, use this format:
{
  "id": "unique_id",
  "type": "gate_type",
  "config": { ... },
  "required": true,
  "message": "Failure message"
}`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: "user", content: message }],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      return NextResponse.json(
        { error: "Unexpected response type" },
        { status: 500 }
      );
    }

    const responseText = content.text;
    
    // Parse JSON updates from response
    const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
    let updates: RecipeUpdate[] = [];
    
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        updates = parsed.updates || [];
      } catch {
        // JSON parsing failed, continue without updates
      }
    }

    // Apply updates if requested
    let applied = false;
    if (apply && updates.length > 0) {
      for (const update of updates) {
        // Validate stage
        if (!VALID_STAGES.includes(update.stage)) {
          continue;
        }
        
        // Check recipe exists
        const existing = await getStageRecipe(workspaceId, update.stage);
        if (!existing) {
          continue;
        }

        // Apply update
        await updateStageRecipe(workspaceId, update.stage, update.changes);
      }
      applied = true;
    }

    // Clean up the message (remove JSON block for display)
    const cleanMessage = responseText.replace(/```json\n[\s\S]*?\n```/g, "").trim();

    const result: ChatResponse = {
      message: cleanMessage,
      updates: updates.length > 0 ? updates : undefined,
      applied,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("[API /stage-recipes/chat] error:", error);
    return NextResponse.json(
      { error: "Failed to process chat message" },
      { status: 500 }
    );
  }
}
