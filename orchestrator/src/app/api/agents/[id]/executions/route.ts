/**
 * GET /api/agents/[id]/executions - List execution history for an agent
 * Migrated to Convex (replaces Drizzle).
 */

import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Agent ID is required" },
        { status: 400 },
      );
    }

    const client = await getAuthenticatedClient();
    const agent = await client.query(api.agentDefinitions.get, {
      id: id as Id<"agentDefinitions">,
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    await requireWorkspaceAccess(agent.workspaceId as string, "viewer");

    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const limit = Math.min(Math.max(parseInt(limitParam || "20", 10), 1), 100);

    const executions = await client.query(
      api.agentExecutions.listByAgentDefinition,
      {
        agentDefinitionId: id as Id<"agentDefinitions">,
        limit,
      },
    );

    return NextResponse.json({ executions });
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to fetch agent executions:", error);
    return NextResponse.json(
      { error: "Failed to fetch agent executions" },
      { status: 500 },
    );
  }
}
