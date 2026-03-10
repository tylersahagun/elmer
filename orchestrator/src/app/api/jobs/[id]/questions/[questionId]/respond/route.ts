/**
 * POST /api/jobs/[id]/questions/[questionId]/respond
 * Answer a pending question and resume the job.
 * Migrated to Convex (replaces Drizzle).
 */

import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../../../convex/_generated/dataModel";
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; questionId: string }> },
) {
  try {
    const { questionId } = await params;
    const body = await request.json();
    const { workspaceId, response } = body;

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 },
      );
    }

    await requireWorkspaceAccess(workspaceId, "member");

    const client = await getAuthenticatedClient();
    await client.mutation(api.pendingQuestions.answer, {
      questionId: questionId as Id<"pendingQuestions">,
      response: { value: response },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to respond to question:", error);
    return NextResponse.json(
      { error: "Failed to respond to question" },
      { status: 500 },
    );
  }
}
