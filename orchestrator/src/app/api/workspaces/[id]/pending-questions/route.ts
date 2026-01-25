import { NextRequest, NextResponse } from "next/server";
import { listPendingQuestions } from "@/lib/db/queries";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await requireWorkspaceAccess(id, "viewer");
    const questions = await listPendingQuestions(id);
    return NextResponse.json({ questions });
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to list pending questions:", error);
    return NextResponse.json(
      { error: "Failed to list pending questions" },
      { status: 500 }
    );
  }
}
