/**
 * Skills API - Manage skills catalog
 *
 * GET - List skills (local + imported)
 * POST - Create/import skill
 */

import { NextResponse } from "next/server";
import {
  getSkills,
  searchSkills,
  createSkill,
  searchSkillsMP,
  importFromSkillsMP,
  syncLocalSkills,
  type CreateSkillInput,
} from "@/lib/skills";
import {
  logSkillCreated,
  logSkillImported,
  logSkillsSynced,
} from "@/lib/activity";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId") || undefined;
    const query = searchParams.get("q");
    const source = searchParams.get("source"); // "local" | "skillsmp" | "all"
    const semantic = searchParams.get("semantic") === "true";

    // Search SkillsMP marketplace
    if (source === "skillsmp") {
      if (!query) {
        return NextResponse.json(
          { error: "Query (q) required for SkillsMP search" },
          { status: 400 },
        );
      }
      const results = await searchSkillsMP(query, { semantic });
      return NextResponse.json(results);
    }

    // Search local skills
    if (query) {
      const skills = await searchSkills(query, workspaceId);
      return NextResponse.json({ skills });
    }

    // List all skills
    const skills = await getSkills(workspaceId);
    return NextResponse.json({ skills });
  } catch (error) {
    console.error("[API /skills] GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch skills" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "import": {
        // Import from SkillsMP
        const { workspaceId, skillsmpId, trustLevel, pinVersion, skillName } =
          body;
        if (!workspaceId || !skillsmpId) {
          return NextResponse.json(
            { error: "workspaceId and skillsmpId required" },
            { status: 400 },
          );
        }
        const skillId = await importFromSkillsMP({
          workspaceId,
          skillsmpId,
          trustLevel,
          pinVersion,
        });

        // Log the import activity
        await logSkillImported(
          workspaceId,
          null, // No user context in this endpoint
          skillId,
          skillName || skillsmpId,
          skillsmpId,
        );

        return NextResponse.json({
          skillId,
          message: "Skill imported successfully",
        });
      }

      case "sync": {
        // Sync local skills
        const { workspaceId, skillsPath } = body;
        if (!workspaceId) {
          return NextResponse.json(
            { error: "workspaceId required" },
            { status: 400 },
          );
        }
        const count = await syncLocalSkills(workspaceId, skillsPath);

        // Log the sync activity
        await logSkillsSynced(workspaceId, null, count, skillsPath);

        return NextResponse.json({
          synced: count,
          message: `Synced ${count} local skills`,
        });
      }

      case "create": {
        // Create custom skill
        const input: CreateSkillInput = {
          workspaceId: body.workspaceId,
          source: "local",
          name: body.name,
          description: body.description,
          version: body.version,
          promptTemplate: body.promptTemplate,
          trustLevel: body.trustLevel || "community",
          tags: body.tags,
          inputSchema: body.inputSchema,
          outputSchema: body.outputSchema,
        };
        if (!input.name) {
          return NextResponse.json({ error: "name required" }, { status: 400 });
        }
        const skillId = await createSkill(input);

        // Log the creation activity
        if (input.workspaceId) {
          await logSkillCreated(input.workspaceId, null, skillId, input.name);
        }

        return NextResponse.json({
          skillId,
          message: "Skill created successfully",
        });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error("[API /skills] POST error:", error);
    return NextResponse.json(
      { error: "Failed to process skill action" },
      { status: 500 },
    );
  }
}
