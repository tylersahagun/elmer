import { NextRequest, NextResponse } from "next/server";
import { getColumnConfigs, createColumnConfig } from "@/lib/db/queries";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get("workspaceId");
  if (!workspaceId) {
    return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });
  }

  const columns = await getColumnConfigs(workspaceId);
  return NextResponse.json(columns);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const column = await createColumnConfig(body);
    return NextResponse.json(column, { status: 201 });
  } catch (error) {
    console.error("Failed to create column:", error);
    return NextResponse.json({ error: "Failed to create column" }, { status: 500 });
  }
}
