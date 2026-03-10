import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";

const MAX_BULK_SIZE = 50;

function getConvexClient() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is required");
  return new ConvexHttpClient(url);
}

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

    const client = getConvexClient();

    // Get first signal to determine workspace
    const firstSignal = await client.query(api.signals.get, {
      signalId: signalIds[0] as Id<"signals">,
    });
    if (!firstSignal) {
      return NextResponse.json({ error: "Signal not found" }, { status: 404 });
    }

    // Verify membership (member can perform bulk operations)
    await requireWorkspaceAccess(firstSignal.workspaceId as string, "member");

    if (action === "link") {
      let linked = 0;
      let skipped = 0;

      for (const signalId of signalIds) {
        try {
          await client.mutation(api.signals.linkToProject, {
            signalId: signalId as Id<"signals">,
            projectId: projectId as Id<"projects">,
          });
          linked++;
        } catch {
          skipped++;
        }
      }

      return NextResponse.json({
        success: true,
        action: "link",
        linked,
        skipped,
        message: `Linked ${linked} signal${linked !== 1 ? "s" : ""}${
          skipped > 0 ? `, skipped ${skipped} already linked` : ""
        }`,
      });
    } else {
      let unlinked = 0;
      let skipped = 0;

      for (const signalId of signalIds) {
        try {
          await client.mutation(api.signals.unlinkFromProject, {
            signalId: signalId as Id<"signals">,
            projectId: projectId as Id<"projects">,
          });
          unlinked++;
        } catch {
          skipped++;
        }
      }

      return NextResponse.json({
        success: true,
        action: "unlink",
        unlinked,
        skipped,
        message: `Unlinked ${unlinked} signal${unlinked !== 1 ? "s" : ""}${
          skipped > 0 ? `, skipped ${skipped} not linked` : ""
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
