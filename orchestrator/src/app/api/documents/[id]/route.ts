/**
 * Document API - Get and update individual documents
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const document = await db.query.documents.findFirst({
      where: eq(documents.id, id),
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error("Failed to get document:", error);
    return NextResponse.json(
      { error: "Failed to get document" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { content, title, metadata } = body;

    const document = await db.query.documents.findFirst({
      where: eq(documents.id, id),
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Update document
    await db.update(documents)
      .set({
        ...(content !== undefined && { content }),
        ...(title !== undefined && { title }),
        ...(metadata !== undefined && { metadata }),
        updatedAt: new Date(),
      })
      .where(eq(documents.id, id));

    // Return updated document
    const updated = await db.query.documents.findFirst({
      where: eq(documents.id, id),
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update document:", error);
    return NextResponse.json(
      { error: "Failed to update document" },
      { status: 500 }
    );
  }
}
