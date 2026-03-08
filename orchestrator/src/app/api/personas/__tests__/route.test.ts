import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { accessMock, writeFileMock } = vi.hoisted(() => ({
  accessMock: vi.fn(),
  writeFileMock: vi.fn(),
}));

vi.mock("fs/promises", () => ({
  default: {
    access: accessMock,
    writeFile: writeFileMock,
  },
  access: accessMock,
  writeFile: writeFileMock,
}));

vi.mock("@/lib/convex/server", () => ({
  listConvexPersonas: vi.fn(),
  upsertConvexPersona: vi.fn(),
}));

import { GET, POST } from "../route";
import {
  listConvexPersonas,
  upsertConvexPersona,
} from "@/lib/convex/server";

const mockListConvexPersonas = vi.mocked(listConvexPersonas);
const mockUpsertConvexPersona = vi.mocked(upsertConvexPersona);

describe("personas route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    accessMock.mockResolvedValue(undefined);
    writeFileMock.mockResolvedValue(undefined);
  });

  it("returns 400 when workspaceId is missing", async () => {
    const response = await GET(
      new NextRequest("http://localhost:3000/api/personas"),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "workspaceId is required",
    });
  });

  it("returns personas for the requested workspace only", async () => {
    mockListConvexPersonas.mockResolvedValue([
      {
        _id: "persona_123",
        archetypeId: "research_lead",
        name: "Research Lead",
        description: "Synthesizes customer evidence.",
        role: {
          title: "Head of Research",
          responsibilities: ["Collect evidence"],
          decision_authority: "high",
        },
        pains: ["Fragmented evidence"],
        successCriteria: ["Fast synthesis"],
        evaluationHeuristics: ["Clear provenance"],
        typicalTools: ["Notion"],
        fears: ["Losing context"],
        psychographicRanges: {
          tech_literacy: ["medium", "high"],
          ai_adoption_stage: ["exploring"],
          tool_fatigue: [3, 7],
          patience_for_learning: [4, 8],
          trust_in_ai: [2, 6],
        },
      },
    ]);

    const response = await GET(
      new NextRequest(
        "http://localhost:3000/api/personas?workspaceId=ws_cutover",
      ),
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(mockListConvexPersonas).toHaveBeenCalledWith("ws_cutover");
    expect(data.authority).toEqual({
      runtimeAuthority: "convex_graph",
      surfaceRole: "lens",
      mirrorRole: "compatibility_export",
    });
    expect(data.personas).toEqual([
      expect.objectContaining({
        id: "persona_123",
        archetype_id: "research_lead",
        name: "Research Lead",
      }),
    ]);
  });

  it("persists Convex authority before returning export failure details", async () => {
    mockUpsertConvexPersona.mockResolvedValue({ _id: "persona_123" });
    writeFileMock.mockRejectedValue(new Error("disk full"));

    const response = await POST(
      new NextRequest("http://localhost:3000/api/personas", {
        method: "POST",
        body: JSON.stringify({
          workspaceId: "ws_cutover",
          path: "personas/research_lead.md",
          content: `# Research Lead

Owns research operations.

## Role
- **Title**: Head of Research
- **Decision Authority**: High

### Responsibilities
- Collect evidence

## Pain Points
- Fragmented evidence

## Success Criteria
- Fast synthesis

## Evaluation Heuristics
- Clear provenance

## Typical Tools
- Notion

## Fears
- Losing context

## Psychographic Ranges
- **Tech Literacy**: medium, high
- **AI Adoption Stage**: exploring
- **Tool Fatigue**: 3-7
- **Patience for Learning**: 4-8
- **Trust in AI**: 2-6
`,
        }),
      }),
    );
    const data = await response.json();

    expect(response.status).toBe(207);
    expect(mockUpsertConvexPersona).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceId: "ws_cutover",
        archetypeId: "research_lead",
      }),
    );
    expect(mockUpsertConvexPersona.mock.invocationCallOrder[0]).toBeLessThan(
      writeFileMock.mock.invocationCallOrder[0],
    );
    expect(data.authority).toEqual({
      runtimeAuthority: "convex_graph",
      surfaceRole: "lens",
      mirrorRole: "compatibility_export",
    });
    expect(data.export).toEqual({
      status: "failed",
      error: "disk full",
    });
  });
});
