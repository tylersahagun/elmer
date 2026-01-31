/**
 * Discovery Import API Endpoint
 *
 * POST /api/discovery/import
 *
 * Imports discovered initiatives as projects into the workspace.
 * Blocking issue fix for 02-08 (Rule 3) - this is needed for the wizard to work.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getWorkspace, updateWorkspace } from "@/lib/db/queries";
import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import type {
  ImportSelection,
  DiscoveryResult,
  ImportResult,
  DiscoveredInitiative,
} from "@/lib/discovery/types";
import type { ProjectStage, ProjectMetadata } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getGitHubClient } from "@/lib/github/auth";
import { syncAgentArchitecture } from "@/lib/agents/sync";
import { syncKnowledgeBase } from "@/lib/knowledgebase/sync";

// Map discovery column names to ProjectStage enum
const COLUMN_TO_STAGE: Record<string, ProjectStage> = {
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

function getStageFromColumn(column: string): ProjectStage {
  if (column in COLUMN_TO_STAGE) {
    return COLUMN_TO_STAGE[column];
  }
  // For dynamic columns, default to inbox
  return "inbox";
}

async function upsertProject(input: {
  id: string;
  workspaceId: string;
  name: string;
  description?: string | null;
  stage: ProjectStage;
  metadata?: ProjectMetadata;
}): Promise<{ action: "created" | "updated"; id: string }> {
  const { id, workspaceId, name, description, stage, metadata } = input;
  const now = new Date();

  // Check if project exists
  const existing = await db.query.projects.findFirst({
    where: eq(projects.id, id),
  });

  if (existing) {
    // Update existing project
    await db
      .update(projects)
      .set({
        name,
        description,
        stage,
        metadata: metadata ?? existing.metadata,
        updatedAt: now,
      })
      .where(eq(projects.id, id));

    return { action: "updated", id };
  } else {
    // Create new project
    await db.insert(projects).values({
      id,
      workspaceId,
      name,
      description,
      stage,
      status: "active",
      metadata,
      createdAt: now,
      updatedAt: now,
    });

    return { action: "created", id };
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Auth check
    const session = await auth();
    if (!session?.user?.id) {
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
    const workspace = await getWorkspace(workspaceId);
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

        // Track if this is a dynamic column
        if (!(initiative.mappedColumn in COLUMN_TO_STAGE)) {
          dynamicColumns.add(initiative.mappedColumn);
        }

        const metadata: ProjectMetadata = {
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
        const octokit = await getGitHubClient(session.user.id);
        if (octokit) {
          const [owner, repo] = workspace.githubRepo.split("/");
          if (owner && repo) {
            const agentResult = await syncAgentArchitecture({
              workspaceId,
              owner,
              repo,
              ref: workspace.settings?.baseBranch,
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
        const octokit = await getGitHubClient(session.user.id);
        if (octokit) {
          const [owner, repo] = workspace.githubRepo.split("/");
          if (owner && repo) {
            const knowledgeResult = await syncKnowledgeBase(workspaceId, {
              octokit,
              repoOwner: owner,
              repoName: repo,
              repoRef: workspace.settings?.baseBranch,
              contextPaths: selection.contextPaths,
            });
            importResult.knowledgeSynced = knowledgeResult.synced;

            // Add any knowledge sync errors
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
    const existingData = workspace.onboardingData || {
      completedAt: "",
      selectedBranch: "",
    };
    await updateWorkspace(workspaceId, {
      onboardingData: {
        ...existingData,
        importedProjects:
          importResult.projectsCreated + importResult.projectsUpdated,
        importedKnowledge: importResult.knowledgeSynced,
      },
      // Update context paths from discovery
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
