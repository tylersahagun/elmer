/**
 * Discovery Import API Endpoint
 *
 * POST /api/discovery/import
 *
 * Imports discovered initiatives as projects into the workspace.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth as clerkAuth } from "@clerk/nextjs/server";
import {
  getConvexWorkspace,
  updateConvexWorkspaceOnboarding,
  listConvexProjects,
  createConvexProject,
  updateConvexProject,
} from "@/lib/convex/server";
import type {
  ImportSelection,
  DiscoveryResult,
  ImportResult,
  DiscoveredInitiative,
} from "@/lib/discovery/types";
import { getGitHubClient } from "@/lib/github/auth";
import { syncAgentArchitecture } from "@/lib/agents/sync";
import { syncKnowledgeBase } from "@/lib/knowledgebase/sync";

// Map discovery column names to stage strings
const COLUMN_TO_STAGE: Record<string, string> = {
  inbox: "inbox",
  discovery: "discovery",
  prd: "prd",
  design: "design",
  prototype: "prototype",
  validate: "validate",
  tickets: "tickets",
  build: "build",
  alpha: "alpha",
  beta: "beta",
  ga: "ga",
};

function getStageFromColumn(column: string): string {
  return column in COLUMN_TO_STAGE ? COLUMN_TO_STAGE[column] : "inbox";
}

async function upsertProject(input: {
  id: string;
  workspaceId: string;
  name: string;
  description?: string | null;
  stage: string;
  metadata?: Record<string, unknown>;
}): Promise<{ action: "created" | "updated"; id: string }> {
  const { id, workspaceId, name, description, stage, metadata } = input;

  // Check if project exists in this workspace by listing and matching on neonSignalId or id
  const projects = await listConvexProjects(workspaceId) as Array<{
    _id: string;
    name?: string;
  }>;

  // Discovery-imported projects use the initiative id as a stable identifier.
  // Since Convex uses its own IDs, check by name match for idempotency.
  const existing = projects.find((p) => p.name === name);

  if (existing) {
    await updateConvexProject(existing._id, {
      name,
      description: description ?? undefined,
      stage,
      metadata: metadata ?? {},
    });
    return { action: "updated", id: existing._id };
  } else {
    const created = await createConvexProject({
      workspaceId,
      name,
      description: description ?? undefined,
      stage,
      status: "on_track",
      priority: "P2",
      metadata: metadata ?? {},
    }) as { _id?: string; id?: string };
    return { action: "created", id: created._id ?? created.id ?? id };
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Auth check
    const { userId } = await clerkAuth();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // 2. Parse request body
    const body = await request.json();
    const { workspaceId, result, selection } = body as {
      workspaceId: string;
      result: DiscoveryResult;
      selection: ImportSelection;
    };

    if (!workspaceId || !result || !selection) {
      return NextResponse.json(
        { error: "Missing required fields: workspaceId, result, selection" },
        { status: 400 },
      );
    }

    // 3. Load workspace and validate
    const workspace = await getConvexWorkspace(workspaceId) as {
      _id: string;
      githubRepo?: string;
      onboardingData?: Record<string, unknown>;
      settings?: {
        baseBranch?: string;
        contextPaths?: string[];
        [key: string]: unknown;
      };
    } | null;

    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 },
      );
    }

    // 4. Run population
    const importResult: ImportResult = {
      success: true,
      projectsCreated: 0,
      projectsUpdated: 0,
      columnsCreated: [],
      knowledgeSynced: 0,
      personasSynced: 0,
      signalsSynced: 0,
      agentsImported: 0,
      documentsImported: 0,
      prototypesImported: 0,
      errors: [],
    };

    // Track dynamic columns
    const dynamicColumns = new Set<string>();

    // Create/Update projects from selected initiatives
    const selectedInitiatives = result.initiatives.filter(
      (i: DiscoveredInitiative) => selection.initiatives.includes(i.id),
    );

    for (const initiative of selectedInitiatives) {
      try {
        const stage = getStageFromColumn(initiative.mappedColumn);

        if (!(initiative.mappedColumn in COLUMN_TO_STAGE)) {
          dynamicColumns.add(initiative.mappedColumn);
        }

        const metadata: Record<string, unknown> = {
          tags: initiative.tags,
        };

        const upsertResult = await upsertProject({
          id: initiative.id,
          workspaceId,
          name: initiative.name,
          description: initiative.description,
          stage,
          metadata,
        });

        if (upsertResult.action === "created") {
          importResult.projectsCreated++;
        } else {
          importResult.projectsUpdated++;
        }
      } catch (error) {
        const msg = error instanceof Error ? error.message : "Unknown error";
        importResult.errors.push(`Project ${initiative.name}: ${msg}`);
      }
    }

    // Record dynamic columns created
    importResult.columnsCreated = Array.from(dynamicColumns);

    // 5. Sync Agent Architecture (rules, commands, skills, subagents)
    if (
      selection.agents &&
      selection.agents.length > 0 &&
      workspace.githubRepo
    ) {
      try {
        const octokit = await getGitHubClient(userId);
        if (octokit) {
          const [owner, repo] = workspace.githubRepo.split("/");
          if (owner && repo) {
            const agentResult = await syncAgentArchitecture({
              workspaceId,
              owner,
              repo,
              ref: workspace.settings?.baseBranch as string | undefined,
              contextPaths: selection.contextPaths,
              octokit,
            });
            importResult.agentsImported = agentResult.count;
          }
        }
      } catch (error) {
        const msg = error instanceof Error ? error.message : "Unknown error";
        importResult.errors.push(`Agent sync: ${msg}`);
        console.error("Agent sync error:", error);
      }
    }

    // 6. Sync Knowledge Base
    if (
      selection.contextPaths &&
      selection.contextPaths.length > 0 &&
      workspace.githubRepo
    ) {
      try {
        const octokit = await getGitHubClient(userId);
        if (octokit) {
          const [owner, repo] = workspace.githubRepo.split("/");
          if (owner && repo) {
            const knowledgeResult = await syncKnowledgeBase(workspaceId, {
              octokit,
              repoOwner: owner,
              repoName: repo,
              repoRef: workspace.settings?.baseBranch as string | undefined,
              contextPaths: selection.contextPaths,
            });
            importResult.knowledgeSynced = knowledgeResult.synced;

            if (knowledgeResult.errors.length > 0) {
              importResult.errors.push(
                ...knowledgeResult.errors.map((e) => `Knowledge: ${e}`),
              );
            }
          }
        }
      } catch (error) {
        const msg = error instanceof Error ? error.message : "Unknown error";
        importResult.errors.push(`Knowledge sync: ${msg}`);
        console.error("Knowledge sync error:", error);
      }
    }

    // Set success based on whether we had critical errors
    importResult.success =
      importResult.errors.length === 0 ||
      importResult.projectsCreated + importResult.projectsUpdated > 0;

    // 7. Update workspace onboarding data with import stats
    const existingData = workspace.onboardingData || {};
    await updateConvexWorkspaceOnboarding(workspaceId, {
      onboardingData: {
        ...existingData,
        importedProjects:
          importResult.projectsCreated + importResult.projectsUpdated,
        importedKnowledge: importResult.knowledgeSynced,
      },
      settings: {
        ...workspace.settings,
        contextPaths: selection.contextPaths,
      },
    });

    return NextResponse.json(importResult);
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Import failed",
        success: false,
        projectsCreated: 0,
        projectsUpdated: 0,
        columnsCreated: [],
        knowledgeSynced: 0,
        personasSynced: 0,
        signalsSynced: 0,
        agentsImported: 0,
        errors: [error instanceof Error ? error.message : "Import failed"],
      },
      { status: 500 },
    );
  }
}
