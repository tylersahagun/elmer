import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
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

/**
 * GET /api/signals/suggestions?workspaceId=xxx
 * Get AI suggestions for unlinked signals (signals with classification.projectId set
 * but not yet linked, and suggestion not dismissed).
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId required" },
        { status: 400 }
      );
    }

    await requireWorkspaceAccess(workspaceId, "viewer");

    const client = getConvexClient();

    // Get all non-linked signals for this workspace (status "new" or "reviewed")
    const allSignals = (await client.query(api.signals.list, {
      workspaceId: workspaceId as Id<"workspaces">,
    })) as Array<{
      _id: string;
      _creationTime: number;
      verbatim: string;
      source: string;
      status: string;
      classification?: {
        projectId?: string;
        projectName?: string;
        confidence?: number;
        reason?: string;
        isNewInitiative?: boolean;
        dismissed?: boolean;
      } | null;
    }>;

    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const effectiveLimit = Math.min(limit, 50);

    const suggestions = allSignals
      .filter((s) => {
        const cls = s.classification;
        if (!cls?.projectId) return false;
        if (cls.isNewInitiative) return false;
        if (cls.dismissed) return false;
        if (s.status === "linked") return false;
        if (s._creationTime < thirtyDaysAgo) return false;
        return true;
      })
      .sort((a, b) => {
        const aConf = a.classification?.confidence ?? 0;
        const bConf = b.classification?.confidence ?? 0;
        return bConf - aConf;
      })
      .slice(0, effectiveLimit)
      .map((s) => ({
        signalId: s._id,
        verbatim: s.verbatim,
        source: s.source,
        projectId: s.classification!.projectId!,
        projectName: s.classification!.projectName ?? "",
        confidence: s.classification!.confidence ?? 0,
        reason: s.classification!.reason,
        createdAt: new Date(s._creationTime).toISOString(),
      }));

    return NextResponse.json({ suggestions });
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to get signal suggestions:", error);
    return NextResponse.json(
      { error: "Failed to get signal suggestions" },
      { status: 500 }
    );
  }
}
