/**
 * Skill Detail API - Get, update, or delete a specific skill
 */

import { NextResponse } from "next/server";
import {
  getSkillById,
  updateSkillTrustLevel,
  deleteSkill,
  resyncSkillsMP,
} from "@/lib/skills";
import type { TrustLevel } from "@/lib/db/schema";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const skill = await getSkillById(id);

    if (!skill) {
      return NextResponse.json(
        { error: "Skill not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ skill });
  } catch (error) {
    console.error("[API /skills/[id]] GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch skill" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const skill = await getSkillById(id);
    if (!skill) {
      return NextResponse.json(
        { error: "Skill not found" },
        { status: 404 }
      );
    }

    // Update trust level
    if (body.trustLevel) {
      await updateSkillTrustLevel(id, body.trustLevel as TrustLevel);
    }

    // Resync from SkillsMP
    if (body.resync && skill.source === "skillsmp") {
      const success = await resyncSkillsMP(id);
      if (!success) {
        return NextResponse.json(
          { error: "Failed to resync skill" },
          { status: 500 }
        );
      }
    }

    const updated = await getSkillById(id);
    return NextResponse.json({ skill: updated, message: "Skill updated" });
  } catch (error) {
    console.error("[API /skills/[id]] PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update skill" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await deleteSkill(id);

    if (!success) {
      return NextResponse.json(
        { error: "Skill not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Skill deleted" });
  } catch (error) {
    console.error("[API /skills/[id]] DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete skill" },
      { status: 500 }
    );
  }
}
