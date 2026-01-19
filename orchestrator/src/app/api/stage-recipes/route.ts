/**
 * Stage Recipes API - Manage per-stage automation configuration
 * 
 * GET - List all recipes for a workspace
 * POST - Create or initialize recipes
 */

import { NextResponse } from "next/server";
import {
  getAllStageRecipes,
  createStageRecipe,
  initializeDefaultRecipes,
  type CreateRecipeInput,
} from "@/lib/skills";
import type { ProjectStage } from "@/lib/db/schema";

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

    const recipes = await getAllStageRecipes(workspaceId);
    return NextResponse.json({ recipes });
  } catch (error) {
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
    console.error("[API /stage-recipes] POST error:", error);
    return NextResponse.json(
      { error: "Failed to process recipe action" },
      { status: 500 }
    );
  }
}
