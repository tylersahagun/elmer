import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/convex/server", () => ({
  getConvexWorkspace: vi.fn(),
  listConvexKnowledge: vi.fn(),
  upsertConvexKnowledge: vi.fn(),
}));

vi.mock("@/lib/knowledgebase", () => ({
  resolveKnowledgePath: vi.fn(),
  writeKnowledgeFile: vi.fn(),
}));

import { GET, PUT } from "../route";
import {
  getConvexWorkspace,
  listConvexKnowledge,
  upsertConvexKnowledge,
} from "@/lib/convex/server";
import { resolveKnowledgePath, writeKnowledgeFile } from "@/lib/knowledgebase";

const mockGetConvexWorkspace = vi.mocked(getConvexWorkspace);
const mockListConvexKnowledge = vi.mocked(listConvexKnowledge);
const mockUpsertConvexKnowledge = vi.mocked(upsertConvexKnowledge);
const mockResolveKnowledgePath = vi.mocked(resolveKnowledgePath);
const mockWriteKnowledgeFile = vi.mocked(writeKnowledgeFile);

describe("knowledgebase type route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockResolveKnowledgePath.mockReturnValue(
      "elmer-docs/company-context/company_context.md",
    );
  });

  it("returns empty content when Convex has no entry instead of reading repo files", async () => {
    mockGetConvexWorkspace.mockResolvedValue({
      contextPath: "elmer-docs",
      settings: null,
    });
    mockListConvexKnowledge.mockResolvedValue([]);

    const request = new NextRequest(
      "http://localhost:3000/api/knowledgebase/company_context?workspaceId=ws_123",
    );

    const response = await GET(request, {
      params: Promise.resolve({ type: "company_context" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.content).toBe("");
    expect(data.filePath).toBe("elmer-docs/company-context/company_context.md");
    expect(data.entry).toBeNull();
    expect(mockListConvexKnowledge).toHaveBeenCalledWith(
      "ws_123",
      "company_context",
    );
  });

  it("returns Convex content when an entry exists", async () => {
    mockGetConvexWorkspace.mockResolvedValue({
      contextPath: "elmer-docs",
      settings: null,
    });
    mockListConvexKnowledge.mockResolvedValue([
      {
        _id: "kb_123",
        title: "Company Context",
        content: "Convex is the runtime source of truth.",
        filePath: "convex/company_context.md",
        _creationTime: Date.parse("2026-03-07T12:00:00.000Z"),
      },
    ]);

    const request = new NextRequest(
      "http://localhost:3000/api/knowledgebase/company_context?workspaceId=ws_123",
    );

    const response = await GET(request, {
      params: Promise.resolve({ type: "company_context" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.content).toBe("Convex is the runtime source of truth.");
    expect(data.filePath).toBe("convex/company_context.md");
    expect(data.entry).toEqual({
      id: "kb_123",
      title: "Company Context",
      updatedAt: "2026-03-07T12:00:00.000Z",
    });
  });

  it("keeps Convex as authority when export sync fails on write", async () => {
    mockGetConvexWorkspace.mockResolvedValue({
      contextPath: "elmer-docs",
      settings: null,
    });
    mockUpsertConvexKnowledge.mockResolvedValue({
      _id: "kb_123",
    });
    mockWriteKnowledgeFile.mockRejectedValue(new Error("repo unavailable"));

    const response = await PUT(
      new NextRequest("http://localhost:3000/api/knowledgebase/company_context", {
        method: "PUT",
        body: JSON.stringify({
          workspaceId: "ws_123",
          title: "Company Context",
          content: "Convex first.",
        }),
      }),
      {
        params: Promise.resolve({ type: "company_context" }),
      },
    );
    const data = await response.json();

    expect(response.status).toBe(207);
    expect(mockUpsertConvexKnowledge).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceId: "ws_123",
        type: "company_context",
      }),
    );
    expect(data.authority).toBe("convex");
    expect(data.export).toEqual({
      status: "failed",
      error: "repo unavailable",
    });
  });
});
