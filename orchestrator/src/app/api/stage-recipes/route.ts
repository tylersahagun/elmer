/**
 * Stage Recipes API - Manage per-stage automation configuration
 * 
 * GET - List all recipes for a workspace
 * POST - Create or initialize recipes
 * PATCH - Update a recipe
 */

import { NextResponse } from "next/server";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";
import {
  getAllStageRecipes,
  getStageRecipe,
  createStageRecipe,
  updateStageRecipe,
  initializeDefaultRecipes,
  type CreateRecipeInput,
  type UpdateRecipeInput,
} from "@/lib/skills";
type ProjectStage = "inbox" | "discovery" | "prd" | "design" | "prototype" | "validate" | "tickets" | "build" | "alpha" | "beta" | "ga";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId required" },
        { status: 400 }
      );
    }

    await requireWorkspaceAccess(workspaceId, "viewer");

    const recipes = await getAllStageRecipes(workspaceId);
    return NextResponse.json({ recipes });
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("[API /stage-recipes] GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch recipes" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "initialize": {
        // Initialize default recipes for workspace
        const { workspaceId } = body;
        if (!workspaceId) {
          return NextResponse.json(
            { error: "workspaceId required" },
            { status: 400 }
          );
        }
        await requireWorkspaceAccess(workspaceId, "member");
        await initializeDefaultRecipes(workspaceId);
        const recipes = await getAllStageRecipes(workspaceId);
        return NextResponse.json({
          recipes,
          message: "Default recipes initialized",
        });
      }

      case "create": {
        // Create specific recipe
        const input: CreateRecipeInput = {
          workspaceId: body.workspaceId,
          stage: body.stage as ProjectStage,
          automationLevel: body.automationLevel,
          recipeSteps: body.recipeSteps,
          gates: body.gates,
          onFailBehavior: body.onFailBehavior,
          provider: body.provider,
          enabled: body.enabled,
        };

        if (!input.workspaceId || !input.stage) {
          return NextResponse.json(
            { error: "workspaceId and stage required" },
            { status: 400 }
          );
        }

        await requireWorkspaceAccess(input.workspaceId, "member");

        const recipeId = await createStageRecipe(input);
        return NextResponse.json({
          recipeId,
          message: "Recipe created",
        });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("[API /stage-recipes] POST error:", error);
    return NextResponse.json(
      { error: "Failed to process recipe action" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { workspaceId, stage, ...updates } = body;

    if (!workspaceId || !stage) {
      return NextResponse.json(
        { error: "workspaceId and stage required" },
        { status: 400 }
      );
    }

    await requireWorkspaceAccess(workspaceId, "member");

    // Validate stage exists
    const existingRecipe = await getStageRecipe(workspaceId, stage as ProjectStage);
    if (!existingRecipe) {
      return NextResponse.json(
        { error: `Recipe for stage '${stage}' not found` },
        { status: 404 }
      );
    }

    const updateInput: UpdateRecipeInput = {};
    
    if (updates.automationLevel !== undefined) {
      updateInput.automationLevel = updates.automationLevel;
    }
    if (updates.recipeSteps !== undefined) {
      updateInput.recipeSteps = updates.recipeSteps;
    }
    if (updates.gates !== undefined) {
      updateInput.gates = updates.gates;
    }
    if (updates.onFailBehavior !== undefined) {
      updateInput.onFailBehavior = updates.onFailBehavior;
    }
    if (updates.provider !== undefined) {
      updateInput.provider = updates.provider;
    }
    if (updates.enabled !== undefined) {
      updateInput.enabled = updates.enabled;
    }

    await updateStageRecipe(workspaceId, stage as ProjectStage, updateInput);
    
    // Return updated recipe
    const updatedRecipe = await getStageRecipe(workspaceId, stage as ProjectStage);
    
    return NextResponse.json({
      recipe: updatedRecipe,
      message: `Recipe for '${stage}' updated`,
    });
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("[API /stage-recipes] PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update recipe" },
      { status: 500 }
    );
  }
}
