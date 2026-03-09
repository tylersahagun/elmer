/**
 * Documents API - List and create documents
 */

import { NextRequest, NextResponse } from "next/server";
import { auth as clerkAuth } from "@clerk/nextjs/server";
import { createDocument, getDocuments, getProject } from "@/lib/db/queries";
import type { DocumentType } from "@/lib/db/schema";
import { DOCUMENT_TYPE_ORDER } from "@/lib/documentTypes";
import { createConvexDocument } from "@/lib/convex/server";

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
    const { userId } = await clerkAuth();
    const body = await request.json();
    const { projectId, type, title, content, metadata } = body;
    const workspaceId =
      body.workspaceId ??
      (typeof metadata === "object" && metadata !== null
        ? (metadata as { workspaceId?: string }).workspaceId
        : undefined);

    if (!projectId || !type || !title) {
      return NextResponse.json(
        { error: "projectId, type, and title are required" },
        { status: 400 }
      );
    }

    // Validate document type
    const validTypes = new Set<string>(DOCUMENT_TYPE_ORDER);

    if (!validTypes.has(type)) {
      return NextResponse.json(
        {
          error: `Invalid document type. Must be one of: ${Array.from(validTypes).join(", ")}`,
        },
        { status: 400 }
      );
    }

    const normalizedMetadata = {
      ...metadata,
      generatedBy: "user",
    };

    const sqlProject = await getProject(projectId);
    let document:
      | Awaited<ReturnType<typeof createDocument>>
      | { id: string; documentId?: string };

    if (!sqlProject && workspaceId && userId) {
      const convexDocument = (await createConvexDocument({
        workspaceId,
        projectId,
        seedTag:
          normalizedMetadata?.e2eTag ??
          `document-${Date.now()}`,
        type,
        title,
        content: content || "",
      })) as { documentId: string };
      document = {
        id: convexDocument.documentId,
        documentId: convexDocument.documentId,
      };
    } else {
      document = await createDocument({
        projectId,
        type: type as DocumentType,
        title,
        content: content || "",
        metadata: normalizedMetadata,
      });
    }

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error("Failed to create document:", error);
    return NextResponse.json(
      { error: "Failed to create document" },
      { status: 500 }
    );
  }
}
