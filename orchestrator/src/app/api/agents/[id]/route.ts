/**
 * GET    /api/agents/[id] - Get agent definition
 * PATCH  /api/agents/[id] - Enable/disable agent
 * DELETE /api/agents/[id] - Delete agent definition
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
import { createConvexWorkspaceActivity } from "@/lib/convex/server";

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

    return NextResponse.json(agent);
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to get agent:", error);
    return NextResponse.json({ error: "Failed to get agent" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const client = await getAuthenticatedClient();
    const agent = await client.query(api.agentDefinitions.get, {
      id: id as Id<"agentDefinitions">,
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const membership = await requireWorkspaceAccess(
      agent.workspaceId as string,
      "member",
    );

    const body = await request.json();
    const { enabled } = body;

    if (typeof enabled !== "boolean") {
      return NextResponse.json(
        { error: "enabled must be a boolean" },
        { status: 400 },
      );
    }

    await client.mutation(api.agentDefinitions.setEnabled, {
      id: id as Id<"agentDefinitions">,
      enabled,
    });

    await createConvexWorkspaceActivity({
      workspaceId: agent.workspaceId as string,
      userId: membership.userId,
      action: enabled ? "agent.enabled" : "agent.disabled",
      targetType: "agent",
      targetId: id,
      metadata: { name: agent.name },
    }).catch(() => {});

    const updated = await client.query(api.agentDefinitions.get, {
      id: id as Id<"agentDefinitions">,
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to update agent:", error);
    return NextResponse.json(
      { error: "Failed to update agent" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const client = await getAuthenticatedClient();
    const agent = await client.query(api.agentDefinitions.get, {
      id: id as Id<"agentDefinitions">,
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const membership = await requireWorkspaceAccess(
      agent.workspaceId as string,
      "admin",
    );

    await client.mutation(api.agentDefinitions.remove, {
      id: id as Id<"agentDefinitions">,
    });

    await createConvexWorkspaceActivity({
      workspaceId: agent.workspaceId as string,
      userId: membership.userId,
      action: "agent.deleted",
      targetType: "agent",
      targetId: id,
      metadata: { name: agent.name },
    }).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to delete agent:", error);
    return NextResponse.json(
      { error: "Failed to delete agent" },
      { status: 500 },
    );
  }
}
