import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/convex/server", () => ({
  getConvexProjectRuntimeContext: vi.fn(),
  listConvexWorkspaceRuntimeContext: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {},
}));

vi.mock("@/lib/db/schema", () => ({
  documents: {},
}));

import {
  getAllVerificationContext,
  getPRDContext,
  getProjectContext,
  getWorkspaceContext,
} from "../resolve";
import {
  getConvexProjectRuntimeContext,
  listConvexWorkspaceRuntimeContext,
} from "@/lib/convex/server";

const mockGetConvexProjectRuntimeContext = vi.mocked(getConvexProjectRuntimeContext);
const mockListConvexWorkspaceRuntimeContext = vi.mocked(
  listConvexWorkspaceRuntimeContext,
);

describe("context resolver", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("builds workspace context from Convex knowledge and personas", async () => {
    mockListConvexWorkspaceRuntimeContext.mockResolvedValue({
      items: [
        {
          entityType: "context",
          type: "company_context",
          title: "Company Context",
          content: "Ship a faster PM workflow.",
        },
        {
          entityType: "context",
          type: "strategic_guardrails",
          title: "Strategic Guardrails",
          content: "Avoid generic dashboard work.",
        },
        {
          entityType: "persona",
          title: "PM Lead",
          content: "Cares about fast validation.",
        },
      ],
    });

    const result = await getWorkspaceContext("ws_123");

    expect(result).toContain("# Company Context");
    expect(result).toContain("Ship a faster PM workflow.");
    expect(result).toContain("# Strategic Guardrails");
    expect(result).toContain("Avoid generic dashboard work.");
    expect(result).toContain("# Persona: PM Lead");
    expect(mockListConvexWorkspaceRuntimeContext).toHaveBeenCalledWith("ws_123", [
      "company_context",
      "strategic_guardrails",
      "personas",
    ]);
  });

  it("builds verification context from runtime authority records", async () => {
    mockListConvexWorkspaceRuntimeContext.mockResolvedValue({
      items: [
        {
          entityType: "persona",
          type: "personas",
          title: "Researcher",
          content: "Needs clear evidence.",
        },
        {
          entityType: "context",
          type: "strategic_guardrails",
          title: "Strategic Guardrails",
          content: "Do not ship dual authority.",
        },
        {
          entityType: "context",
          type: "company_context",
          title: "Company Context",
          content: "Convex-first product operations.",
        },
      ],
    });

    const result = await getAllVerificationContext("ws_456");

    expect(result.personas).toBe("# Persona: Researcher\n\nNeeds clear evidence.");
    expect(result.guardrails).toBe("Do not ship dual authority.");
    expect(result.companyContext).toBe("Convex-first product operations.");
  });

  it("builds project context from runtime project and document data", async () => {
    mockGetConvexProjectRuntimeContext.mockResolvedValue({
      project: {
        name: "Convex Cutover",
        description: "Remove legacy runtime authority.",
        metadata: { tags: ["migration", "convex"] },
      },
      items: [
        {
          entityType: "document",
          projectId: "proj_123",
          title: "Research",
          content: "Users are confused by compatibility seams.",
          type: "research",
        },
      ],
    });

    const result = await getProjectContext("proj_123");

    expect(result).toContain("# Project: Convex Cutover");
    expect(result).toContain("Remove legacy runtime authority.");
    expect(result).toContain("Tags: migration, convex");
    expect(result).toContain("# Research");
    expect(result).toContain("Users are confused by compatibility seams.");
  });

  it("returns raw guardrails content for PRD context from Convex", async () => {
    mockListConvexWorkspaceRuntimeContext.mockResolvedValue({
      items: [
        {
          entityType: "context",
          type: "strategic_guardrails",
          title: "Strategic Guardrails",
          content: "Push back on ambiguous requirements.",
        },
      ],
    });

    const result = await getPRDContext("ws_789");

    expect(result).toBe("Push back on ambiguous requirements.");
  });
});
