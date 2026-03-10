/**
 * POST /api/agents/execute - Execute an agent definition
 * Migrated to Convex (replaces Drizzle).
 */

import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { auth as clerkAuth } from "@clerk/nextjs/server";
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

async function getAuthenticatedClient() {
  const auth = await clerkAuth();
  const token = await auth.getToken({ template: "convex" });
  const client = getConvexClient();
  if (token) client.setAuth(token);
  return client;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workspaceId, projectId, signalId, agentDefinitionId } = body;

    if (!workspaceId || !agentDefinitionId) {
      return NextResponse.json(
        { error: "workspaceId and agentDefinitionId are required" },
        { status: 400 },
      );
    }

    await requireWorkspaceAccess(workspaceId, "member");

    const client = await getAuthenticatedClient();
    const jobId = await client.mutation(api.jobs.createAndSchedule, {
      workspaceId: workspaceId as Id<"workspaces">,
      projectId: projectId ? (projectId as Id<"projects">) : undefined,
      type: "execute_agent_definition",
      input: {
        agentDefinitionId,
        ...(signalId && { signalId }),
      },
      agentDefinitionId: agentDefinitionId as Id<"agentDefinitions">,
    });

    return NextResponse.json({ id: jobId });
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to execute agent:", error);
    return NextResponse.json(
      { error: "Failed to execute agent" },
      { status: 500 },
    );
  }
}
