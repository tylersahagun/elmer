import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/convex/server", () => ({
  searchConvexWorkspace: vi.fn(),
}));

import { GET } from "../route";
import { searchConvexWorkspace } from "@/lib/convex/server";

const mockSearchConvexWorkspace = vi.mocked(searchConvexWorkspace);

describe("search route", () => {
  it("returns 400 when workspaceId or q are missing", async () => {
    const response = await GET(
      new NextRequest("http://localhost:3000/api/search?workspaceId=ws_123"),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "workspaceId and q are required",
    });
  });

  it("returns convex search as canonical results plus compatibility metadata", async () => {
    mockSearchConvexWorkspace.mockResolvedValue({
      results: [
        {
          id: "doc_1",
          title: "Reset Plan",
          entityType: "document",
          promotionState: "promoted",
          provenance: { source: "agent" },
          snippet: "Unified runtime memory search.",
        },
      ],
      documents: [],
      memory: [],
      knowledgebase: [],
      personas: [],
    });

    const response = await GET(
      new NextRequest(
        "http://localhost:3000/api/search?workspaceId=ws_123&q=runtime",
      ),
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(mockSearchConvexWorkspace).toHaveBeenCalledWith("ws_123", "runtime");
    expect(data.authority).toEqual({
      runtimeAuthority: "convex_graph",
      canonicalResultsField: "results",
      compatibilityBuckets: [
        "documents",
        "memory",
        "knowledgebase",
        "personas",
      ],
    });
    expect(data.results).toHaveLength(1);
  });
});
