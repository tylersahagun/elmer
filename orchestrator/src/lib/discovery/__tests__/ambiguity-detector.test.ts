import { describe, it, expect } from "vitest";
import {
  detectAmbiguities,
  hasUnresolvedAmbiguities,
  getNextAmbiguity,
  resolveAmbiguity,
} from "../ambiguity-detector";
import type { DiscoveryResult } from "../types";

function createMockResult(
  overrides: Partial<DiscoveryResult> = {},
): DiscoveryResult {
  return {
    repoOwner: "test",
    repoName: "repo",
    branch: "main",
    scannedAt: new Date().toISOString(),
    initiatives: [],
    contextPaths: [],
    agents: [],
    stats: {
      foldersScanned: 0,
      initiativesFound: 0,
      contextPathsFound: 0,
      agentsFound: 0,
      prototypesFound: 0,
      metaJsonParsed: 0,
      metaJsonErrors: 0,
    },
    warnings: [],
    ...overrides,
  };
}

describe("detectAmbiguities", () => {
  it("returns empty array when no ambiguities", () => {
    const result = createMockResult({
      initiatives: [
        {
          id: "proj_1",
          sourcePath: "initiatives/feature-a",
          sourceFolder: "initiatives",
          name: "Feature A",
          status: "active",
          mappedColumn: "discovery",
          statusConfidence: 1,
          isStatusAmbiguous: false,
          description: null,
          archived: false,
          tags: [],
          rawMeta: null,
          patternMatch: {
            pattern: "initiatives",
            matchType: "exact",
            confidence: 1,
          },
          selected: true,
          prototypes: [],
        },
      ],
    });

    const ambiguities = detectAmbiguities(result);
    expect(ambiguities).toHaveLength(0);
  });

  it("detects multiple initiative folders", () => {
    const result = createMockResult({
      initiatives: [
        {
          id: "proj_1",
          sourcePath: "initiatives/feature-a",
          sourceFolder: "initiatives",
          name: "Feature A",
          status: "active",
          mappedColumn: "discovery",
          statusConfidence: 1,
          isStatusAmbiguous: false,
          description: null,
          archived: false,
          tags: [],
          rawMeta: null,
          patternMatch: {
            pattern: "initiatives",
            matchType: "exact",
            confidence: 1,
          },
          selected: true,
          prototypes: [],
        },
        {
          id: "proj_2",
          sourcePath: "work/project-b",
          sourceFolder: "work",
          name: "Project B",
          status: "active",
          mappedColumn: "discovery",
          statusConfidence: 1,
          isStatusAmbiguous: false,
          description: null,
          archived: false,
          tags: [],
          rawMeta: null,
          patternMatch: {
            pattern: "work",
            matchType: "exact",
            confidence: 0.8,
          },
          selected: true,
          prototypes: [],
        },
      ],
    });

    const ambiguities = detectAmbiguities(result);
    expect(ambiguities).toHaveLength(1);
    expect(ambiguities[0].type).toBe("multiple_initiative_folders");
    expect(ambiguities[0].question).toContain("initiatives");
    expect(ambiguities[0].question).toContain("work");
    expect(ambiguities[0].options.length).toBeGreaterThanOrEqual(3); // 2 folders + "use all"
  });

  it("detects multiple context paths of same type", () => {
    const result = createMockResult({
      contextPaths: [
        {
          type: "knowledge",
          path: "docs",
          confidence: 0.8,
          fileCount: 10,
          selected: true,
        },
        {
          type: "knowledge",
          path: "knowledge",
          confidence: 0.9,
          fileCount: 5,
          selected: true,
        },
      ],
    });

    const ambiguities = detectAmbiguities(result);
    expect(ambiguities).toHaveLength(1);
    expect(ambiguities[0].type).toBe("multiple_context_paths");
    expect(ambiguities[0].question).toContain("knowledge");
  });

  it("detects ambiguous status mappings", () => {
    const result = createMockResult({
      initiatives: [
        {
          id: "proj_1",
          sourcePath: "initiatives/feature-a",
          sourceFolder: "initiatives",
          name: "Feature A",
          status: "in-progress",
          mappedColumn: "discovery",
          statusConfidence: 0.3,
          isStatusAmbiguous: true,
          description: null,
          archived: false,
          tags: [],
          rawMeta: null,
          patternMatch: {
            pattern: "initiatives",
            matchType: "exact",
            confidence: 1,
          },
          selected: true,
          prototypes: [],
        },
      ],
    });

    const ambiguities = detectAmbiguities(result);
    expect(ambiguities).toHaveLength(1);
    expect(ambiguities[0].type).toBe("ambiguous_status_mapping");
    expect(ambiguities[0].question).toContain("in-progress");
  });

  it("groups ambiguous statuses by status value", () => {
    const result = createMockResult({
      initiatives: [
        {
          id: "proj_1",
          sourcePath: "initiatives/feature-a",
          sourceFolder: "initiatives",
          name: "Feature A",
          status: "wip",
          mappedColumn: "discovery",
          statusConfidence: 0.3,
          isStatusAmbiguous: true,
          description: null,
          archived: false,
          tags: [],
          rawMeta: null,
          patternMatch: {
            pattern: "initiatives",
            matchType: "exact",
            confidence: 1,
          },
          selected: true,
          prototypes: [],
        },
        {
          id: "proj_2",
          sourcePath: "initiatives/feature-b",
          sourceFolder: "initiatives",
          name: "Feature B",
          status: "wip",
          mappedColumn: "discovery",
          statusConfidence: 0.3,
          isStatusAmbiguous: true,
          description: null,
          archived: false,
          tags: [],
          rawMeta: null,
          patternMatch: {
            pattern: "initiatives",
            matchType: "exact",
            confidence: 1,
          },
          selected: true,
          prototypes: [],
        },
      ],
    });

    const ambiguities = detectAmbiguities(result);
    expect(ambiguities).toHaveLength(1);
    expect(ambiguities[0].type).toBe("ambiguous_status_mapping");
    expect(ambiguities[0].question).toContain("wip");
    expect(ambiguities[0].question).toContain("2 items");
  });

  it("does not create ambiguity for single context path per type", () => {
    const result = createMockResult({
      contextPaths: [
        {
          type: "knowledge",
          path: "docs",
          confidence: 0.8,
          fileCount: 10,
          selected: true,
        },
        {
          type: "personas",
          path: "team",
          confidence: 0.9,
          fileCount: 3,
          selected: true,
        },
      ],
    });

    const ambiguities = detectAmbiguities(result);
    expect(ambiguities).toHaveLength(0);
  });

  it("handles multiple ambiguity types simultaneously", () => {
    const result = createMockResult({
      initiatives: [
        {
          id: "proj_1",
          sourcePath: "initiatives/feature-a",
          sourceFolder: "initiatives",
          name: "Feature A",
          status: "pending",
          mappedColumn: "inbox",
          statusConfidence: 0.3,
          isStatusAmbiguous: true,
          description: null,
          archived: false,
          tags: [],
          rawMeta: null,
          patternMatch: {
            pattern: "initiatives",
            matchType: "exact",
            confidence: 1,
          },
          selected: true,
          prototypes: [],
        },
        {
          id: "proj_2",
          sourcePath: "work/project-b",
          sourceFolder: "work",
          name: "Project B",
          status: "active",
          mappedColumn: "discovery",
          statusConfidence: 1,
          isStatusAmbiguous: false,
          description: null,
          archived: false,
          tags: [],
          rawMeta: null,
          patternMatch: {
            pattern: "work",
            matchType: "exact",
            confidence: 0.8,
          },
          selected: true,
          prototypes: [],
        },
      ],
      contextPaths: [
        {
          type: "knowledge",
          path: "docs",
          confidence: 0.8,
          fileCount: 10,
          selected: true,
        },
        {
          type: "knowledge",
          path: "knowledge",
          confidence: 0.9,
          fileCount: 5,
          selected: true,
        },
      ],
    });

    const ambiguities = detectAmbiguities(result);
    expect(ambiguities).toHaveLength(3);

    const types = ambiguities.map((a) => a.type);
    expect(types).toContain("multiple_initiative_folders");
    expect(types).toContain("multiple_context_paths");
    expect(types).toContain("ambiguous_status_mapping");
  });
});

describe("hasUnresolvedAmbiguities", () => {
  it("returns false for empty array", () => {
    expect(hasUnresolvedAmbiguities([])).toBe(false);
  });

  it("returns true when unresolved ambiguities exist", () => {
    const ambiguities = [
      {
        id: "amb_1",
        type: "multiple_initiative_folders" as const,
        question: "Which folder?",
        options: [],
        context: {},
        resolved: false,
      },
    ];
    expect(hasUnresolvedAmbiguities(ambiguities)).toBe(true);
  });

  it("returns false when all resolved", () => {
    const ambiguities = [
      {
        id: "amb_1",
        type: "multiple_initiative_folders" as const,
        question: "Which folder?",
        options: [],
        context: {},
        resolved: true,
        selectedOptionId: "opt_1",
      },
    ];
    expect(hasUnresolvedAmbiguities(ambiguities)).toBe(false);
  });

  it("returns true when mixed resolved and unresolved", () => {
    const ambiguities = [
      {
        id: "amb_1",
        type: "multiple_initiative_folders" as const,
        question: "Q1",
        options: [],
        context: {},
        resolved: true,
        selectedOptionId: "opt",
      },
      {
        id: "amb_2",
        type: "multiple_context_paths" as const,
        question: "Q2",
        options: [],
        context: {},
        resolved: false,
      },
    ];
    expect(hasUnresolvedAmbiguities(ambiguities)).toBe(true);
  });
});

describe("getNextAmbiguity", () => {
  it("returns null for empty array", () => {
    expect(getNextAmbiguity([])).toBeNull();
  });

  it("returns first unresolved ambiguity", () => {
    const ambiguities = [
      {
        id: "amb_1",
        type: "multiple_initiative_folders" as const,
        question: "Q1",
        options: [],
        context: {},
        resolved: true,
        selectedOptionId: "opt",
      },
      {
        id: "amb_2",
        type: "multiple_context_paths" as const,
        question: "Q2",
        options: [],
        context: {},
        resolved: false,
      },
      {
        id: "amb_3",
        type: "ambiguous_status_mapping" as const,
        question: "Q3",
        options: [],
        context: {},
        resolved: false,
      },
    ];
    const next = getNextAmbiguity(ambiguities);
    expect(next?.id).toBe("amb_2");
  });

  it("returns null when all resolved", () => {
    const ambiguities = [
      {
        id: "amb_1",
        type: "multiple_initiative_folders" as const,
        question: "Q1",
        options: [],
        context: {},
        resolved: true,
        selectedOptionId: "opt",
      },
      {
        id: "amb_2",
        type: "multiple_context_paths" as const,
        question: "Q2",
        options: [],
        context: {},
        resolved: true,
        selectedOptionId: "opt",
      },
    ];
    expect(getNextAmbiguity(ambiguities)).toBeNull();
  });
});

describe("resolveAmbiguity", () => {
  it("marks ambiguity as resolved with selected option", () => {
    const ambiguity = {
      id: "amb_1",
      type: "multiple_initiative_folders" as const,
      question: "Which folder?",
      options: [{ id: "opt_1", label: "Option 1", value: "initiatives" }],
      context: {},
      resolved: false,
    };

    const resolved = resolveAmbiguity(ambiguity, "opt_1");
    expect(resolved.resolved).toBe(true);
    expect(resolved.selectedOptionId).toBe("opt_1");
    // Original should be unchanged
    expect(ambiguity.resolved).toBe(false);
  });

  it("preserves all other fields", () => {
    const ambiguity = {
      id: "amb_1",
      type: "multiple_context_paths" as const,
      question: "Which knowledge folder?",
      options: [
        { id: "docs", label: "/docs/", value: "docs" },
        { id: "knowledge", label: "/knowledge/", value: "knowledge" },
      ],
      context: { paths: ["docs", "knowledge"], confidence: 0.9 },
      resolved: false,
    };

    const resolved = resolveAmbiguity(ambiguity, "knowledge");
    expect(resolved.id).toBe("amb_1");
    expect(resolved.type).toBe("multiple_context_paths");
    expect(resolved.question).toBe("Which knowledge folder?");
    expect(resolved.options).toHaveLength(2);
    expect(resolved.context.paths).toEqual(["docs", "knowledge"]);
  });
});
