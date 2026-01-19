/**
 * Stage Recipe Detail API - Get, update, or delete a stage recipe
 */

import { NextResponse } from "next/server";
import {
  getStageRecipe,
  updateStageRecipe,
  deleteStageRecipe,
  validateRecipe,
  canRunFullyAuto,
  type UpdateRecipeInput,
} from "@/lib/skills";
import type { ProjectStage } from "@/lib/db/schema";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ stage: string }> }
) {
  try {
    const { stage } = await params;
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId required" },
        { status: 400 }
      );
    }

    const recipe = await getStageRecipe(workspaceId, stage as ProjectStage);

    if (!recipe) {
      return NextResponse.json(
        { error: "Recipe not found", stage },
        { status: 404 }
      );
    }

    // Validate and check if can run fully_auto
    const validation = await validateRecipe(recipe);
    const fullyAutoAllowed = await canRunFullyAuto(recipe);

    return NextResponse.json({
      recipe,
      validation,
      fullyAutoAllowed,
    });
  } catch (error) {
    console.error("[API /stage-recipes/[stage]] GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch recipe" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ stage: string }> }
) {
  try {
    const { stage } = await params;
    const body = await request.json();
    const { workspaceId } = body;

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId required" },
        { status: 400 }
      );
    }

    const input: UpdateRecipeInput = {};
    
    if (body.automationLevel !== undefined) {
      input.automationLevel = body.automationLevel;
    }
    if (body.recipeSteps !== undefined) {
      input.recipeSteps = body.recipeSteps;
    }
    if (body.gates !== undefined) {
      input.gates = body.gates;
    }
    if (body.onFailBehavior !== undefined) {
      input.onFailBehavior = body.onFailBehavior;
    }
    if (body.provider !== undefined) {
      input.provider = body.provider;
    }
    if (body.enabled !== undefined) {
      input.enabled = body.enabled;
    }

    await updateStageRecipe(workspaceId, stage as ProjectStage, input);

    const updated = await getStageRecipe(workspaceId, stage as ProjectStage);
    const validation = updated ? await validateRecipe(updated) : null;

    return NextResponse.json({
      recipe: updated,
      validation,
      message: "Recipe updated",
    });
  } catch (error) {
    console.error("[API /stage-recipes/[stage]] PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update recipe" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ stage: string }> }
) {
  try {
    const { stage } = await params;
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId required" },
        { status: 400 }
      );
    }

    const success = await deleteStageRecipe(workspaceId, stage as ProjectStage);

    if (!success) {
      return NextResponse.json(
        { error: "Recipe not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Recipe deleted" });
  } catch (error) {
    console.error("[API /stage-recipes/[stage]] DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete recipe" },
      { status: 500 }
    );
  }
}
