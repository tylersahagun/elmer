/**
 * Documents API - List and create documents
 */

import { NextRequest, NextResponse } from "next/server";
import { createDocument, getDocuments } from "@/lib/db/queries";
import type { DocumentType } from "@/lib/db/schema";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        { error: "projectId is required" },
        { status: 400 }
      );
    }

    const documents = await getDocuments(projectId);
    return NextResponse.json(documents);
  } catch (error) {
    console.error("Failed to get documents:", error);
    return NextResponse.json(
      { error: "Failed to get documents" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, type, title, content, metadata } = body;

    if (!projectId || !type || !title) {
      return NextResponse.json(
        { error: "projectId, type, and title are required" },
        { status: 400 }
      );
    }

    // Validate document type
    const validTypes: DocumentType[] = [
      "research",
      "prd",
      "design_brief",
      "engineering_spec",
      "gtm_brief",
      "prototype_notes",
      "jury_report",
    ];

    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid document type. Must be one of: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    const document = await createDocument({
      projectId,
      type,
      title,
      content: content || "",
      metadata: {
        ...metadata,
        generatedBy: "user",
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error("Failed to create document:", error);
    return NextResponse.json(
      { error: "Failed to create document" },
      { status: 500 }
    );
  }
}
