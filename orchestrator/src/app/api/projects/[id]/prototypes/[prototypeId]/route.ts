import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getProject, updatePrototype, deletePrototype } from "@/lib/db/queries";
import { buildChromaticStorybookUrl } from "@/lib/chromatic";

interface RouteParams {
  params: Promise<{ id: string; prototypeId: string }>;
}

// PATCH /api/projects/[id]/prototypes/[prototypeId] - Update a prototype
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: projectId, prototypeId } = await params;

  // Verify project exists and prototype belongs to it
  const project = await getProject(projectId);
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const prototype = project.prototypes?.find(
    (p: { id: string }) => p.id === prototypeId,
  );
  if (!prototype) {
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

    // Build the update object
    const updateData: Parameters<typeof updatePrototype>[1] = {};

    if (storybookPath !== undefined) {
      updateData.storybookPath = storybookPath;
    }

    if (chromaticStorybookUrl !== undefined) {
      updateData.chromaticStorybookUrl = chromaticStorybookUrl;
    } else if (branch && !chromaticStorybookUrl) {
      // Construct URL from branch if provided
      updateData.chromaticStorybookUrl = buildChromaticStorybookUrl(branch);
    }

    if (status !== undefined) {
      updateData.status = status;
    }

    // Update metadata
    const existingMetadata = (prototype.metadata || {}) as Record<
      string,
      unknown
    >;
    updateData.metadata = {
      ...existingMetadata,
      ...(versionLabel !== undefined && { versionLabel }),
      ...(branch !== undefined && { branch }),
      ...(name !== undefined && { displayName: name }),
    };

    await updatePrototype(prototypeId, updateData);

    // Fetch the updated project to get the updated prototype
    const updatedProject = await getProject(projectId);
    const updatedPrototype = updatedProject?.prototypes?.find(
      (p: { id: string }) => p.id === prototypeId,
    );

    return NextResponse.json(updatedPrototype);
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
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: projectId, prototypeId } = await params;

  // Verify project exists and prototype belongs to it
  const project = await getProject(projectId);
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const prototype = project.prototypes?.find(
    (p: { id: string }) => p.id === prototypeId,
  );
  if (!prototype) {
    return NextResponse.json({ error: "Prototype not found" }, { status: 404 });
  }

  try {
    await deletePrototype(prototypeId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting prototype:", error);
    return NextResponse.json(
      { error: "Failed to delete prototype" },
      { status: 500 },
    );
  }
}
