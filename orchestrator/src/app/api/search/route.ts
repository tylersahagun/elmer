import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { documents, memoryEntries, projects } from "@/lib/db/schema";
import { and, eq, like, or } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get("workspaceId");
  const q = searchParams.get("q") || "";

  if (!workspaceId || !q) {
    return NextResponse.json({ error: "workspaceId and q are required" }, { status: 400 });
  }

  const query = `%${q}%`;

  const docMatches = await db
    .select({
      id: documents.id,
      projectId: documents.projectId,
      title: documents.title,
      content: documents.content,
      type: documents.type,
    })
    .from(documents)
    .innerJoin(projects, eq(projects.id, documents.projectId))
    .where(and(eq(projects.workspaceId, workspaceId), or(like(documents.title, query), like(documents.content, query))));

  const memoryMatches = await db
    .select({
      id: memoryEntries.id,
      projectId: memoryEntries.projectId,
      content: memoryEntries.content,
      type: memoryEntries.type,
    })
    .from(memoryEntries)
    .where(and(eq(memoryEntries.workspaceId, workspaceId), like(memoryEntries.content, query)));

  return NextResponse.json({ documents: docMatches, memory: memoryMatches });
}
