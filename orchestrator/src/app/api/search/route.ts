import { NextRequest, NextResponse } from "next/server";
import { searchConvexWorkspace } from "@/lib/convex/server";

const SEARCH_SURFACE = {
  runtimeAuthority: "convex_graph",
  canonicalResultsField: "results",
  compatibilityBuckets: [
    "documents",
    "memory",
    "knowledgebase",
    "personas",
  ],
} as const;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get("workspaceId");
  const q = searchParams.get("q") || "";

  if (!workspaceId || !q) {
    return NextResponse.json({ error: "workspaceId and q are required" }, { status: 400 });
  }

  const results = await searchConvexWorkspace(workspaceId, q);
  return NextResponse.json({
    authority: SEARCH_SURFACE,
    ...results,
  });
}
