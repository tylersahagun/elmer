import { NextRequest, NextResponse } from "next/server";
import { auth as clerkAuth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../../convex/_generated/dataModel";
import { getConvexProjectWithDocuments } from "@/lib/convex/server";
import { buildChromaticStorybookUrl } from "@/lib/chromatic";

function getConvexClient() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is required");
  return new ConvexHttpClient(url);
}

interface RouteParams {
  params: Promise<{ id: string; prototypeId: string }>;
}

// PATCH /api/projects/[id]/prototypes/[prototypeId] - Update a prototype
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { userId } = await clerkAuth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: projectId, prototypeId } = await params;

  // Verify project exists
  const project = await getConvexProjectWithDocuments(projectId);
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // Verify prototype exists
  const client = getConvexClient();
  const variant = await client.query(api.prototypes.get, {
    variantId: prototypeId as Id<"prototypeVariants">,
  });
  if (!variant) {
    return NextResponse.json({ error: "Prototype not found" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const {
      name,
      storybookPath,
      chromaticStorybookUrl,
      versionLabel,
      branch,
      status,
    } = body;

    const updateArgs: {
      variantId: Id<"prototypeVariants">;
      url?: string;
      chromaticUrl?: string;
      status?: string;
      metadata?: Record<string, unknown>;
    } = {
      variantId: prototypeId as Id<"prototypeVariants">,
    };

    if (storybookPath !== undefined) {
      updateArgs.url = storybookPath;
    }

    if (chromaticStorybookUrl !== undefined) {
      updateArgs.chromaticUrl = chromaticStorybookUrl;
    } else if (branch && !chromaticStorybookUrl) {
      updateArgs.chromaticUrl = buildChromaticStorybookUrl(branch);
    }

    if (status !== undefined) {
      updateArgs.status = status;
    }

    const existingMetadata = (variant.metadata || {}) as Record<string, unknown>;
    updateArgs.metadata = {
      ...existingMetadata,
      ...(versionLabel !== undefined && { versionLabel }),
      ...(branch !== undefined && { branch }),
      ...(name !== undefined && { displayName: name }),
    };

    await client.mutation(api.prototypes.updateVariant, updateArgs);

    // Fetch the updated variant to return
    const updated = await client.query(api.prototypes.get, {
      variantId: prototypeId as Id<"prototypeVariants">,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating prototype:", error);
    return NextResponse.json(
      { error: "Failed to update prototype" },
      { status: 500 },
    );
  }
}

// DELETE /api/projects/[id]/prototypes/[prototypeId] - Delete a prototype
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { userId } = await clerkAuth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: projectId, prototypeId } = await params;

  // Verify project exists
  const project = await getConvexProjectWithDocuments(projectId);
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // Verify prototype exists
  const client = getConvexClient();
  const variant = await client.query(api.prototypes.get, {
    variantId: prototypeId as Id<"prototypeVariants">,
  });
  if (!variant) {
    return NextResponse.json({ error: "Prototype not found" }, { status: 404 });
  }

  try {
    await client.mutation(api.prototypes.deleteVariant, {
      variantId: prototypeId as Id<"prototypeVariants">,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting prototype:", error);
    return NextResponse.json(
      { error: "Failed to delete prototype" },
      { status: 500 },
    );
  }
}
