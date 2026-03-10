/**
 * Document API - Get and update individual documents
 * Migrated to Convex (replaces Drizzle).
 */

import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { auth as clerkAuth } from "@clerk/nextjs/server";

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const client = await getAuthenticatedClient();
    const document = await client.query(api.documents.get, {
      documentId: id as Id<"documents">,
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error("Failed to get document:", error);
    return NextResponse.json(
      { error: "Failed to get document" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { content, title } = body;

    const client = await getAuthenticatedClient();

    const existing = await client.query(api.documents.get, {
      documentId: id as Id<"documents">,
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 },
      );
    }

    const updated = await client.mutation(api.documents.update, {
      documentId: id as Id<"documents">,
      title: title ?? undefined,
      content: content ?? undefined,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update document:", error);
    return NextResponse.json(
      { error: "Failed to update document" },
      { status: 500 },
    );
  }
}
