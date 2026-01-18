import { NextRequest, NextResponse } from "next/server";
import { getKnowledgeSources, createKnowledgeSource } from "@/lib/db/queries";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get("workspaceId");
  if (!workspaceId) {
    return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });
  }
  const sources = await getKnowledgeSources(workspaceId);
  return NextResponse.json(sources);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const source = await createKnowledgeSource(body);
    return NextResponse.json(source, { status: 201 });
  } catch (error) {
    console.error("Failed to create knowledge source:", error);
    return NextResponse.json({ error: "Failed to create knowledge source" }, { status: 500 });
  }
}
