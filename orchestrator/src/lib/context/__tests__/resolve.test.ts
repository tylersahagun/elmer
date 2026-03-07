import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/convex/server", () => ({
  getConvexProjectWithDocuments: vi.fn(),
  listConvexKnowledge: vi.fn(),
  listConvexPersonas: vi.fn(),
}));

vi.mock("@/lib/db/queries", () => ({
  getProject: vi.fn(),
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
  getConvexProjectWithDocuments,
  listConvexKnowledge,
  listConvexPersonas,
} from "@/lib/convex/server";

const mockGetConvexProjectWithDocuments = vi.mocked(getConvexProjectWithDocuments);
const mockListConvexKnowledge = vi.mocked(listConvexKnowledge);
const mockListConvexPersonas = vi.mocked(listConvexPersonas);

describe("context resolver", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("builds workspace context from Convex knowledge and personas", async () => {
    mockListConvexKnowledge.mockResolvedValue([
      {
        type: "company_context",
        title: "Company Context",
        content: "Ship a faster PM workflow.",
      },
      {
        type: "strategic_guardrails",
        title: "Strategic Guardrails",
        content: "Avoid generic dashboard work.",
      },
    ]);
    mockListConvexPersonas.mockResolvedValue([
      {
        name: "PM Lead",
        description: "Owns product direction.",
        content: "# PM Lead\n\nCares about fast validation.",
      },
    ]);

    const result = await getWorkspaceContext("ws_123");

    expect(result).toContain("# Company Context");
    expect(result).toContain("Ship a faster PM workflow.");
    expect(result).toContain("# Strategic Guardrails");
    expect(result).toContain("Avoid generic dashboard work.");
    expect(result).toContain("# PM Lead");
    expect(mockListConvexKnowledge).toHaveBeenCalledWith("ws_123");
    expect(mockListConvexPersonas).toHaveBeenCalledWith("ws_123");
  });

  it("falls back to Convex knowledge personas when persona records are absent", async () => {
    mockListConvexKnowledge.mockResolvedValue([
      {
        type: "personas",
        title: "Personas",
        content: "# Researcher\n\nNeeds clear evidence.",
      },
      {
        type: "strategic_guardrails",
        title: "Strategic Guardrails",
        content: "Do not ship dual authority.",
      },
      {
        type: "company_context",
        title: "Company Context",
        content: "Convex-first product operations.",
      },
    ]);
    mockListConvexPersonas.mockResolvedValue([]);

    const result = await getAllVerificationContext("ws_456");

    expect(result.personas).toBe("# Researcher\n\nNeeds clear evidence.");
    expect(result.guardrails).toBe("Do not ship dual authority.");
    expect(result.companyContext).toBe("Convex-first product operations.");
  });

  it("builds project context from Convex project and document data", async () => {
    mockGetConvexProjectWithDocuments.mockResolvedValue({
      project: {
        name: "Convex Cutover",
        description: "Remove legacy runtime authority.",
        metadata: { tags: ["migration", "convex"] },
      },
      documents: [
        {
          type: "research",
          content: "Users are confused by compatibility seams.",
        },
      ],
    });

    const result = await getProjectContext("proj_123");

    expect(result).toContain("# Project: Convex Cutover");
    expect(result).toContain("Remove legacy runtime authority.");
    expect(result).toContain("Tags: migration, convex");
    expect(result).toContain("## Research");
    expect(result).toContain("Users are confused by compatibility seams.");
  });

  it("returns raw guardrails content for PRD context from Convex", async () => {
    mockListConvexKnowledge.mockResolvedValue([
      {
        type: "strategic_guardrails",
        title: "Strategic Guardrails",
        content: "Push back on ambiguous requirements.",
      },
    ]);

    const result = await getPRDContext("ws_789");

    expect(result).toBe("Push back on ambiguous requirements.");
  });
});
