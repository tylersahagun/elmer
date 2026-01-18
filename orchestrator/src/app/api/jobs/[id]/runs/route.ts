import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { jobRuns } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const runs = await db.query.jobRuns.findMany({
    where: eq(jobRuns.jobId, id),
    orderBy: [desc(jobRuns.startedAt)],
  });
  return NextResponse.json(runs);
}
