import { NextRequest, NextResponse } from "next/server";
import {
  getSignal,
  bulkLinkSignalsToProject,
  bulkUnlinkSignalsFromProject,
} from "@/lib/db/queries";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";

const MAX_BULK_SIZE = 50;

interface BulkLinkRequest {
  action: "link";
  signalIds: string[];
  projectId: string;
  linkReason?: string;
}

interface BulkUnlinkRequest {
  action: "unlink";
  signalIds: string[];
  projectId: string;
}

type BulkRequest = BulkLinkRequest | BulkUnlinkRequest;

/**
 * POST /api/signals/bulk
 * Bulk link or unlink signals
 *
 * Body for link: { action: "link", signalIds: string[], projectId: string, linkReason?: string }
 * Body for unlink: { action: "unlink", signalIds: string[], projectId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body: BulkRequest = await request.json();
    const { action, signalIds, projectId } = body;

    // Validate request
    if (!action || !["link", "unlink"].includes(action)) {
      return NextResponse.json(
        { error: "action must be 'link' or 'unlink'" },
        { status: 400 }
      );
    }

    if (!Array.isArray(signalIds) || signalIds.length === 0) {
      return NextResponse.json(
        { error: "signalIds must be a non-empty array" },
        { status: 400 }
      );
    }

    if (signalIds.length > MAX_BULK_SIZE) {
      return NextResponse.json(
        { error: `Maximum ${MAX_BULK_SIZE} signals per bulk operation` },
        { status: 400 }
      );
    }

    if (!projectId) {
      return NextResponse.json(
        { error: "projectId required" },
        { status: 400 }
      );
    }

    // Get first signal to determine workspace (all signals must be in same workspace)
    const firstSignal = await getSignal(signalIds[0]);
    if (!firstSignal) {
      return NextResponse.json(
        { error: "Signal not found" },
        { status: 404 }
      );
    }

    // Verify membership (member can perform bulk operations)
    const membership = await requireWorkspaceAccess(firstSignal.workspaceId, "member");

    // Perform the bulk operation
    if (action === "link") {
      const linkReason = (body as BulkLinkRequest).linkReason;
      const result = await bulkLinkSignalsToProject(
        signalIds,
        projectId,
        membership.userId,
        linkReason
      );

      return NextResponse.json({
        success: true,
        action: "link",
        linked: result.linked,
        skipped: result.skipped,
        message: `Linked ${result.linked} signal${result.linked !== 1 ? "s" : ""}${
          result.skipped > 0 ? `, skipped ${result.skipped} already linked` : ""
        }`,
      });
    } else {
      const result = await bulkUnlinkSignalsFromProject(signalIds, projectId);

      return NextResponse.json({
        success: true,
        action: "unlink",
        unlinked: result.unlinked,
        skipped: result.skipped,
        message: `Unlinked ${result.unlinked} signal${result.unlinked !== 1 ? "s" : ""}${
          result.skipped > 0 ? `, skipped ${result.skipped} not linked` : ""
        }`,
      });
    }
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Bulk operation failed:", error);
    return NextResponse.json(
      { error: "Bulk operation failed" },
      { status: 500 }
    );
  }
}
