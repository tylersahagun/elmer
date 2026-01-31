import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getProject, createPrototype, updatePrototype } from "@/lib/db/queries";
import { buildChromaticStorybookUrl } from "@/lib/chromatic";
import { PrototypeType } from "@/lib/db/schema";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/projects/[id]/prototypes - Create a new prototype link
export async function POST(request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: projectId } = await params;

  // Verify project exists and user has access
  const project = await getProject(projectId);
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const {
      name,
      type = "standalone",
      storybookPath,
      chromaticStorybookUrl,
      version: versionLabel,
      branch,
      placement,
    } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Create the prototype
    const prototype = await createPrototype({
      projectId,
      type: type as PrototypeType,
      name,
      storybookPath: storybookPath || undefined,
    });

    if (!prototype) {
      return NextResponse.json(
        { error: "Failed to create prototype" },
        { status: 500 },
      );
    }

    // If we have branch info or direct URL, update the prototype with Chromatic URL
    let finalChromaticUrl = chromaticStorybookUrl;
    if (!finalChromaticUrl && branch) {
      finalChromaticUrl = buildChromaticStorybookUrl(branch);
    }

    if (finalChromaticUrl || versionLabel || branch || placement) {
      await updatePrototype(prototype.id, {
        chromaticStorybookUrl: finalChromaticUrl || undefined,
        metadata: {
          ...(prototype.metadata || {}),
          versionLabel: versionLabel || undefined,
          branch: branch || undefined,
          sourcePath: storybookPath || undefined,
          manuallyLinked: true,
          placementAnalysis: placement
            ? {
                suggestedLocation: placement.suggestedLocation || undefined,
                existingPatterns: placement.existingPatterns || undefined,
              }
            : (prototype.metadata as { placementAnalysis?: unknown })
                ?.placementAnalysis,
        },
      });
    }

    // Fetch the updated prototype
    const updatedPrototype = await getProject(projectId);
    const newProto = updatedPrototype?.prototypes?.find(
      (p: { id: string }) => p.id === prototype.id,
    );

    return NextResponse.json(newProto || prototype, { status: 201 });
  } catch (error) {
    console.error("Error creating prototype:", error);
    return NextResponse.json(
      { error: "Failed to create prototype" },
      { status: 500 },
    );
  }
}
