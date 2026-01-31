/**
 * POST /api/workspaces/[id]/import
 *
 * Import endpoint for the population engine (POPUL-02).
 * Takes discovery results and user selections, then populates the workspace.
 *
 * Request body:
 * {
 *   discoveryResult: DiscoveryResult,  // From /api/github/discover
 *   selection: ImportSelection          // User's selections from preview UI
 * }
 *
 * Response:
 * {
 *   success: boolean,
 *   projectsCreated: number,
 *   projectsUpdated: number,
 *   columnsCreated: string[],
 *   knowledgeSynced: number,
 *   agentsImported: number,
 *   errors: string[]
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { getGitHubClient } from "@/lib/github/auth";
import { runPopulationEngine } from "@/lib/discovery/population-engine";
import { auth } from "@/auth";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";
import type { DiscoveryResult, ImportSelection } from "@/lib/discovery/types";

/**
 * POST handler for import endpoint.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: workspaceId } = await params;

    // Require admin access to import (modifies workspace data)
    await requireWorkspaceAccess(workspaceId, "admin");

    // Get authenticated user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { discoveryResult, selection } = body as {
      discoveryResult: DiscoveryResult;
      selection: ImportSelection;
    };

    // Validate required fields
    if (!discoveryResult) {
      return NextResponse.json(
        { error: "Missing discoveryResult in request body" },
        { status: 400 }
      );
    }

    if (!selection) {
      return NextResponse.json(
        { error: "Missing selection in request body" },
        { status: 400 }
      );
    }

    // Validate discovery result has required metadata
    if (!discoveryResult.repoOwner || !discoveryResult.repoName) {
      return NextResponse.json(
        { error: "Invalid discoveryResult: missing repoOwner or repoName" },
        { status: 400 }
      );
    }

    // Get GitHub client for the user
    const octokit = await getGitHubClient(session.user.id);
    if (!octokit) {
      return NextResponse.json(
        { error: "GitHub authentication required. Please reconnect your GitHub account." },
        { status: 401 }
      );
    }

    // Run the population engine
    const result = await runPopulationEngine({
      workspaceId,
      discoveryResult,
      selection,
      octokit,
    });

    // Return appropriate status based on result
    const status = result.success ? 200 : 207; // 207 Multi-Status for partial success

    return NextResponse.json(result, { status });
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }

    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Import failed:", message, error);

    return NextResponse.json(
      {
        error: `Import failed: ${message}`,
        success: false,
        projectsCreated: 0,
        projectsUpdated: 0,
        columnsCreated: [],
        knowledgeSynced: 0,
        personasSynced: 0,
        signalsSynced: 0,
        agentsImported: 0,
        errors: [message],
      },
      { status: 500 }
    );
  }
}
