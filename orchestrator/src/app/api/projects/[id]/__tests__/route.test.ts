import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/convex/server", () => ({
  deleteConvexProject: vi.fn(),
  getConvexProjectWithDocuments: vi.fn(),
  getConvexWorkspace: vi.fn(),
  listConvexProjectPrototypes: vi.fn(),
  listConvexProjectSignals: vi.fn(),
  updateConvexProject: vi.fn(),
}));

vi.mock("@/lib/permissions", () => {
  class MockPermissionError extends Error {}
  return {
    requireWorkspaceAccess: vi.fn(),
    handlePermissionError: vi.fn(() => ({
      error: "forbidden",
      status: 403,
    })),
    PermissionError: MockPermissionError,
  };
});

import { GET, PATCH } from "../route";
import {
  getConvexProjectWithDocuments,
  getConvexWorkspace,
  listConvexProjectPrototypes,
  listConvexProjectSignals,
  updateConvexProject,
} from "@/lib/convex/server";
import { requireWorkspaceAccess } from "@/lib/permissions";

const mockGetConvexProjectWithDocuments = vi.mocked(getConvexProjectWithDocuments);
const mockGetConvexWorkspace = vi.mocked(getConvexWorkspace);
const mockListConvexProjectPrototypes = vi.mocked(listConvexProjectPrototypes);
const mockListConvexProjectSignals = vi.mocked(listConvexProjectSignals);
const mockUpdateConvexProject = vi.mocked(updateConvexProject);
const mockRequireWorkspaceAccess = vi.mocked(requireWorkspaceAccess);

describe("project detail route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireWorkspaceAccess.mockResolvedValue({
      userId: "user_123",
      workspaceId: "ws_cutover",
      role: "admin",
    } as never);
    mockGetConvexWorkspace.mockResolvedValue({
      _id: "ws_cutover",
      settings: {
        storybookPort: 7007,
        knowledgebaseMapping: {
          prd: "roadmap",
        },
      },
    });
    mockListConvexProjectPrototypes.mockResolvedValue([
      {
        id: "proto_123",
        name: "Prototype A",
        type: "storybook",
        status: "ready",
        version: 2,
        storybookPath: "prototype-a",
      },
    ]);
    mockListConvexProjectSignals.mockResolvedValue([{ id: "sig_123" }]);
  });

  it("returns a modal-compatible project aggregate from Convex data", async () => {
    mockGetConvexProjectWithDocuments.mockResolvedValue({
      project: {
        _id: "proj_123",
        _creationTime: Date.parse("2026-03-07T12:00:00.000Z"),
        workspaceId: "ws_cutover",
        name: "Convex Cutover",
        description: "Remove legacy authority",
        stage: "prototype",
        status: "on_track",
        priority: "P1",
        metadata: {
          gitBranch: "feat/convex-cutover",
        },
      },
      documents: [
        {
          _id: "doc_123",
          _creationTime: Date.parse("2026-03-08T12:00:00.000Z"),
          type: "prd",
          title: "PRD",
          content: "Convex-first read spine",
          version: 3,
          metadata: {
            generatedBy: "user",
          },
        },
      ],
    });

    const response = await GET(new NextRequest("http://localhost:3000"), {
      params: Promise.resolve({ id: "proj_123" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(mockRequireWorkspaceAccess).toHaveBeenCalledWith(
      "ws_cutover",
      "viewer",
    );
    expect(data).toEqual(
      expect.objectContaining({
        id: "proj_123",
        name: "Convex Cutover",
        stage: "prototype",
        status: "active",
        priority: 1,
        signalCount: 1,
        documentCount: 1,
        prototypeCount: 1,
        tickets: [],
        juryEvaluations: [],
      }),
    );
    expect(data.workspace).toEqual({
      id: "ws_cutover",
      settings: {
        storybookPort: 7007,
        knowledgebaseMapping: {
          prd: "roadmap",
        },
      },
    });
    expect(data.documents[0]).toEqual(
      expect.objectContaining({
        id: "doc_123",
        title: "PRD",
        version: 3,
      }),
    );
  });

  it("keeps the project route healthy when optional prototype and signal mirrors are unavailable", async () => {
    mockGetConvexProjectWithDocuments.mockResolvedValue({
      project: {
        _id: "proj_123",
        _creationTime: Date.parse("2026-03-07T12:00:00.000Z"),
        workspaceId: "ws_cutover",
        name: "Convex Cutover",
        description: "Remove legacy authority",
        stage: "prototype",
        status: "on_track",
        priority: "P1",
        metadata: {},
      },
      documents: [],
    });
    mockListConvexProjectPrototypes.mockResolvedValue([]);
    mockListConvexProjectSignals.mockResolvedValue([]);

    const response = await GET(new NextRequest("http://localhost:3000"), {
      params: Promise.resolve({ id: "proj_123" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.prototypeCount).toBe(0);
    expect(data.signalCount).toBe(0);
    expect(data.prototypes).toEqual([]);
    expect(data.linkedSignals).toEqual([]);
  });

  it("merges metadata and updates the Convex project authority", async () => {
    mockGetConvexProjectWithDocuments
      .mockResolvedValueOnce({
        project: {
          _id: "proj_123",
          _creationTime: Date.parse("2026-03-07T12:00:00.000Z"),
          workspaceId: "ws_cutover",
          name: "Convex Cutover",
          stage: "prototype",
          status: "active",
          priority: "P2",
          metadata: {
            gitBranch: "feat/convex-cutover",
            stageConfidence: {
              prototype: { score: 0.4 },
            },
          },
        },
        documents: [],
      })
      .mockResolvedValueOnce({
        project: {
          _id: "proj_123",
          _creationTime: Date.parse("2026-03-07T12:00:00.000Z"),
          workspaceId: "ws_cutover",
          name: "Convex Cutover",
          stage: "prototype",
          status: "active",
          priority: "P2",
          metadata: {
            gitBranch: "feat/convex-cutover",
            stageConfidence: {
              prototype: { score: 0.9, summary: "Parity reached" },
            },
          },
        },
        documents: [],
      });

    const response = await PATCH(
      new NextRequest("http://localhost:3000", {
        method: "PATCH",
        body: JSON.stringify({
          metadata: {
            stageConfidence: {
              prototype: { score: 0.9, summary: "Parity reached" },
            },
          },
        }),
      }),
      {
        params: Promise.resolve({ id: "proj_123" }),
      },
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(mockRequireWorkspaceAccess).toHaveBeenCalledWith(
      "ws_cutover",
      "member",
    );
    expect(mockUpdateConvexProject).toHaveBeenCalledWith("proj_123", {
      metadata: {
        gitBranch: "feat/convex-cutover",
        stageConfidence: {
          prototype: { score: 0.9, summary: "Parity reached" },
        },
      },
    });
    expect(data.metadata.stageConfidence.prototype).toEqual({
      score: 0.9,
      summary: "Parity reached",
    });
  });
});
