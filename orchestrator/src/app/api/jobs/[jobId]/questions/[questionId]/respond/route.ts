import { NextRequest, NextResponse } from "next/server";
import { updatePendingQuestion, updateJobStatus } from "@/lib/db/queries";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string; questionId: string }> }
) {
  try {
    const { jobId, questionId } = await params;
    const body = await request.json();
    const { workspaceId, response } = body;

    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });
    }

    await requireWorkspaceAccess(workspaceId, "member");

    await updatePendingQuestion(questionId, {
      status: "answered",
      response: { value: response },
      respondedAt: new Date(),
    });

    await updateJobStatus(jobId, "pending", { progress: 0 });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to respond to question:", error);
    return NextResponse.json(
      { error: "Failed to respond to question" },
      { status: 500 }
    );
  }
}
