/**
 * Documents API - List and create documents
 * Migrated to Convex (replaces Drizzle).
 */

import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { auth as clerkAuth } from "@clerk/nextjs/server";
import { DOCUMENT_TYPE_ORDER } from "@/lib/documentTypes";

type DocumentType = string;

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        { error: "projectId is required" },
        { status: 400 },
      );
    }

    const client = await getAuthenticatedClient();
    const documents = await client.query(api.documents.byProject, {
      projectId: projectId as Id<"projects">,
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error("Failed to get documents:", error);
    return NextResponse.json(
      { error: "Failed to get documents" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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
        { status: 400 },
      );
    }

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required (in body or metadata)" },
        { status: 400 },
      );
    }

    const validTypes = new Set<string>(DOCUMENT_TYPE_ORDER);
    if (!validTypes.has(type as DocumentType)) {
      return NextResponse.json(
        {
          error: `Invalid document type. Must be one of: ${Array.from(validTypes).join(", ")}`,
        },
        { status: 400 },
      );
    }

    const client = await getAuthenticatedClient();
    const documentId = await client.mutation(api.documents.create, {
      workspaceId: workspaceId as Id<"workspaces">,
      projectId: projectId as Id<"projects">,
      type,
      title,
      content: content || "",
      generatedByAgent: "user",
    });

    return NextResponse.json({ id: documentId, documentId }, { status: 201 });
  } catch (error) {
    console.error("Failed to create document:", error);
    return NextResponse.json(
      { error: "Failed to create document" },
      { status: 500 },
    );
  }
}
