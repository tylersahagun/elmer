import { NextRequest, NextResponse } from "next/server";
import { auth as clerkAuth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import { buildChromaticStorybookUrl } from "@/lib/chromatic";
import { getConvexProjectWithDocuments } from "@/lib/convex/server";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";

function getConvexClient() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is required");
  return new ConvexHttpClient(url);
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/projects/[id]/prototypes - Create a new prototype variant
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await clerkAuth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: projectId } = await params;

    const projectData = await getConvexProjectWithDocuments(projectId);
    if (!projectData) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const project = projectData.project as {
      _id: string;
      workspaceId: string;
      name: string;
    };

    await requireWorkspaceAccess(project.workspaceId, "member");

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

    let finalChromaticUrl: string | undefined = chromaticStorybookUrl;
    if (!finalChromaticUrl && branch) {
      finalChromaticUrl = buildChromaticStorybookUrl(branch);
    }

    const client = getConvexClient();

    const variantId = await client.mutation(api.prototypes.createVariant, {
      workspaceId: project.workspaceId as Id<"workspaces">,
      projectId: projectId as Id<"projects">,
      platform: type,
      outputType: "storybook",
      title: name,
      url: storybookPath || undefined,
      chromaticUrl: finalChromaticUrl || undefined,
      metadata: {
        versionLabel: versionLabel || undefined,
        branch: branch || undefined,
        sourcePath: storybookPath || undefined,
        manuallyLinked: true,
        placementAnalysis: placement
          ? {
              suggestedLocation: placement.suggestedLocation || undefined,
              existingPatterns: placement.existingPatterns || undefined,
            }
          : undefined,
      },
    });

    return NextResponse.json(
      {
        id: variantId,
        projectId,
        name,
        type,
        storybookPath: storybookPath || null,
        chromaticStorybookUrl: finalChromaticUrl || null,
        metadata: {
          versionLabel: versionLabel || null,
          branch: branch || null,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Error creating prototype:", error);
    return NextResponse.json(
      { error: "Failed to create prototype" },
      { status: 500 }
    );
  }
}
