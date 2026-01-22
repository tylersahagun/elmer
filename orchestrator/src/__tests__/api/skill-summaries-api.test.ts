/**
 * API Integration Tests for Skill Summaries Endpoints
 * 
 * Tests the /api/skills/summaries and /api/skills/[id]/summary endpoints
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

// Mock the database
vi.mock("@/lib/db", () => ({
  db: {
    query: {
      skills: {
        findFirst: vi.fn(),
      },
    },
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(),
      })),
    })),
  },
}));

// Mock Anthropic
vi.mock("@anthropic-ai/sdk", () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: {
      create: vi.fn().mockResolvedValue({
        content: [{ type: "text", text: "This is a generated summary for the skill." }],
      }),
    },
  })),
}));

// Mock fs/promises
vi.mock("fs/promises", () => ({
  default: {
    access: vi.fn().mockRejectedValue(new Error("Not found")),
    readdir: vi.fn().mockResolvedValue([]),
    readFile: vi.fn().mockRejectedValue(new Error("Not found")),
  },
}));

describe("POST /api/skills/summaries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return summaries for valid skill IDs", async () => {
    // Import the route handler
    const { POST } = await import("@/app/api/skills/summaries/route");
    
    const request = new NextRequest("http://localhost:3000/api/skills/summaries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        skillIds: ["analyze_transcript", "generate_prd", "build_prototype"],
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.summaries).toBeDefined();
    expect(data.summaries["analyze_transcript"].toLowerCase()).toContain("transcript");
    expect(data.summaries["generate_prd"].toLowerCase()).toContain("product requirements");
    expect(data.summaries["build_prototype"].toLowerCase()).toContain("prototype");
  });

  it("should return error for missing skillIds", async () => {
    const { POST } = await import("@/app/api/skills/summaries/route");
    
    const request = new NextRequest("http://localhost:3000/api/skills/summaries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("skillIds array required");
  });

  it("should return error for non-array skillIds", async () => {
    const { POST } = await import("@/app/api/skills/summaries/route");
    
    const request = new NextRequest("http://localhost:3000/api/skills/summaries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skillIds: "not-an-array" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("skillIds array required");
  });

  it("should generate generic summaries for unknown skills", async () => {
    const { POST } = await import("@/app/api/skills/summaries/route");
    
    const request = new NextRequest("http://localhost:3000/api/skills/summaries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        skillIds: ["custom_unknown_skill"],
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.summaries["custom_unknown_skill"]).toContain("Custom Unknown Skill");
    expect(data.summaries["custom_unknown_skill"]).toContain("workflow");
  });

  it("should handle empty array", async () => {
    const { POST } = await import("@/app/api/skills/summaries/route");
    
    const request = new NextRequest("http://localhost:3000/api/skills/summaries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skillIds: [] }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.summaries).toEqual({});
  });

  it("should include all built-in job types", async () => {
    const { POST } = await import("@/app/api/skills/summaries/route");
    
    const builtInSkills = [
      "analyze_transcript",
      "generate_prd",
      "generate_design_brief",
      "generate_engineering_spec",
      "generate_gtm_brief",
      "build_prototype",
      "iterate_prototype",
      "run_jury_evaluation",
      "generate_tickets",
      "validate_tickets",
      "score_stage_alignment",
      "deploy_chromatic",
      "create_feature_branch",
    ];

    const request = new NextRequest("http://localhost:3000/api/skills/summaries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skillIds: builtInSkills }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    
    for (const skill of builtInSkills) {
      expect(data.summaries[skill]).toBeDefined();
      expect(data.summaries[skill].length).toBeGreaterThan(20);
    }
  });
});

describe("GET /api/skills/[id]/summary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return built-in summary for known skill", async () => {
    const { GET } = await import("@/app/api/skills/[id]/summary/route");
    
    const request = new NextRequest("http://localhost:3000/api/skills/analyze_transcript/summary");
    const params = Promise.resolve({ id: "analyze_transcript" });

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.skillId).toBe("analyze_transcript");
    expect(data.summary).toContain("transcript");
    expect(data.source).toBe("builtin");
  });

  it("should return cached summary if available", async () => {
    const { db } = await import("@/lib/db");
    const mockedDb = vi.mocked(db);
    
    // Mock finding a cached summary
    mockedDb.query.skills.findFirst.mockResolvedValueOnce({
      id: "custom_skill",
      metadata: { aiSummary: "This is a cached AI summary." },
    } as never);

    const { GET } = await import("@/app/api/skills/[id]/summary/route");
    
    const request = new NextRequest("http://localhost:3000/api/skills/custom_skill/summary");
    const params = Promise.resolve({ id: "custom_skill" });

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.summary).toBe("This is a cached AI summary.");
    expect(data.source).toBe("cached");
  });

  it("should return generic summary for unknown skill without cache", async () => {
    const { db } = await import("@/lib/db");
    const mockedDb = vi.mocked(db);
    
    // Mock no cached summary
    mockedDb.query.skills.findFirst.mockResolvedValueOnce(null as never);

    const { GET } = await import("@/app/api/skills/[id]/summary/route");
    
    const request = new NextRequest("http://localhost:3000/api/skills/unknown_custom_skill/summary");
    const params = Promise.resolve({ id: "unknown_custom_skill" });

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.skillId).toBe("unknown_custom_skill");
    expect(data.summary).toContain("unknown custom skill");
    expect(data.source).toBe("generic");
  });

  it("should regenerate when regenerate=true query param", async () => {
    const { db } = await import("@/lib/db");
    const mockedDb = vi.mocked(db);
    
    // Even with cached data, should not use it when regenerate=true
    mockedDb.query.skills.findFirst.mockResolvedValue({
      id: "analyze_transcript",
      metadata: { aiSummary: "Old cached summary" },
    } as never);

    const { GET } = await import("@/app/api/skills/[id]/summary/route");
    
    const request = new NextRequest("http://localhost:3000/api/skills/analyze_transcript/summary?regenerate=true");
    const params = Promise.resolve({ id: "analyze_transcript" });

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    // Should use built-in, not the cached value
    expect(data.source).toBe("builtin");
  });
});

describe("Built-in Summaries Quality", () => {
  it("all summaries should be descriptive and meaningful", async () => {
    const { POST } = await import("@/app/api/skills/summaries/route");
    
    const request = new NextRequest("http://localhost:3000/api/skills/summaries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        skillIds: [
          "analyze_transcript",
          "generate_prd",
          "build_prototype",
          "run_jury_evaluation",
        ],
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    for (const [skillId, summary] of Object.entries(data.summaries)) {
      // Should be at least 50 characters
      expect((summary as string).length).toBeGreaterThan(50);
      
      // Should not just be the skill ID
      expect((summary as string).toLowerCase()).not.toBe(skillId.replace(/_/g, " "));
      
      // Should contain action words
      const hasActionWord = /creates?|generates?|builds?|analyzes?|runs?|produces?|refines?|deploys?|validates?/i.test(summary as string);
      expect(hasActionWord).toBe(true);
    }
  });
});
