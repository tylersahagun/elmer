import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getWorkspace } from "@/lib/db/queries";
import { syncSignals } from "@/lib/signals/sync";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";

/**
 * POST /api/workspaces/[id]/syncSignals
 *
 * Syncs signals from the PM workspace filesystem to the database.
 * Scans the workspace's configured contextPaths for signals/ folders
 * and creates signal records for each markdown file found.
 *
 * Idempotency: Uses file path as sourceRef - existing signals are skipped.
 *
 * Requires member role or higher.
 *
 * Request body (optional):
 * - signalsPaths: string[] - Custom paths to scan (relative to contextPaths)
 * - skipProcessing: boolean - If true, skip AI processing for bulk imports
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Parse optional body parameters
    const body = await request.json().catch(() => ({}));
    const signalsPaths = Array.isArray(body?.signalsPaths)
      ? body.signalsPaths.filter((value: unknown) => typeof value === "string")
      : undefined;
    const skipProcessing =
      typeof body?.skipProcessing === "boolean" ? body.skipProcessing : false;

    // Require member access to trigger sync
    await requireWorkspaceAccess(id, "member");

    // Verify workspace exists
    const workspace = await getWorkspace(id);
    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 },
      );
    }

    // Run the sync
    const result = await syncSignals(id, {
      signalsPaths: signalsPaths?.length ? signalsPaths : undefined,
      skipProcessing,
    });

    return NextResponse.json({
      success: result.errors.length === 0,
      message: `Synced ${result.synced} signals (${result.skipped} skipped)`,
      ...result,
    });
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to sync signals:", error);
    return NextResponse.json(
      { error: "Failed to sync signals" },
      { status: 500 },
    );
  }
}
