import { NextRequest, NextResponse } from "next/server";
import { updateWorkspace, getWorkspace } from "@/lib/db/queries";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";
import type { OnboardingData } from "@/lib/db/schema";

/**
 * Request body for completing onboarding
 */
interface OnboardingRequestBody {
  repo?: string; // Full repo path (owner/name)
  branch?: string; // Selected branch
  template?: boolean;
  settings?: {
    contextPaths?: string[];
    prototypesPath?: string;
    automationMode?: "manual" | "auto_to_stage" | "auto_all";
    automationStopStage?: string | null;
  };
  repoDetails?: {
    id: number;
    fullName: string;
    defaultBranch: string;
    description?: string | null;
    private?: boolean;
    owner?: string;
  };
}

/**
 * POST /api/workspaces/[id]/onboarding
 *
 * Completes the onboarding process for a workspace, updating it with
 * the selected repository and branch configuration.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Require admin access to update workspace settings
    await requireWorkspaceAccess(id, "admin");

    // Parse and validate request body
    const body: OnboardingRequestBody = await request.json();

    if (!body.repo && !body.template) {
      return NextResponse.json(
        { error: "Missing required field: repo" },
        { status: 400 },
      );
    }

    if (!body.branch && !body.template) {
      return NextResponse.json(
        { error: "Missing required field: branch" },
        { status: 400 },
      );
    }

    // Get current workspace to merge settings
    const workspace = await getWorkspace(id);
    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 },
      );
    }

    // Build onboarding data - preserve any import counts from discovery step
    // The discovery import endpoint may have already populated these values
    const existingOnboardingData = (workspace.onboardingData ??
      {}) as Partial<OnboardingData>;
    const onboardingData: OnboardingData = {
      ...existingOnboardingData,
      completedAt: new Date().toISOString(),
      selectedBranch: body.branch ?? workspace.settings?.baseBranch ?? "main",
      // Preserve import counts if already set, otherwise default to 0
      importedProjects: existingOnboardingData.importedProjects ?? 0,
      importedPersonas: existingOnboardingData.importedPersonas ?? 0,
      importedKnowledge: existingOnboardingData.importedKnowledge ?? 0,
    };

    const normalizedContextPaths =
      body.settings?.contextPaths?.length
        ? body.settings.contextPaths.map((value) =>
            value.endsWith("/") ? value : `${value}/`,
          )
        : body.template && !workspace.settings?.contextPaths?.length
          ? ["elmer-docs/"]
          : workspace.settings?.contextPaths;

    // Update workspace with repository and onboarding completion
    const updatedWorkspace = await updateWorkspace(id, {
      githubRepo: body.template ? null : body.repo,
      settings: {
        ...workspace.settings,
        baseBranch: body.branch ?? workspace.settings?.baseBranch ?? "main",
        contextPaths: normalizedContextPaths,
        prototypesPath:
          body.settings?.prototypesPath ||
          (body.template && !workspace.settings?.prototypesPath
            ? "prototypes/"
            : workspace.settings?.prototypesPath),
        automationMode:
          body.settings?.automationMode ?? workspace.settings?.automationMode,
        automationStopStage:
          body.settings?.automationStopStage ??
          workspace.settings?.automationStopStage,
      },
      contextPath:
        normalizedContextPaths?.[0] ||
        workspace.contextPath ||
        "elmer-docs/",
      onboardingCompletedAt: new Date(),
      onboardingData,
    });

    if (!updatedWorkspace) {
      return NextResponse.json(
        { error: "Failed to update workspace" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      workspace: updatedWorkspace,
      message: "Onboarding completed successfully",
    });
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }

    console.error("Failed to complete onboarding:", error);
    return NextResponse.json(
      { error: "Failed to complete onboarding" },
      { status: 500 },
    );
  }
}
