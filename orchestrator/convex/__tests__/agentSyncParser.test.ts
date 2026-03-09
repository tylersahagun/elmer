import { describe, expect, it } from "vitest";
import {
  buildDefinitionMetadata,
  parseFrontmatter,
  parseGraphEdges,
  relationTargetEntityType,
} from "../lib/agentSyncParser";

describe("parseFrontmatter", () => {
  it("parses scalar and array frontmatter values", () => {
    const input = `---
name: test-skill
executionMode: server
sourcePlugin: pm-execution
requiredArtifacts: [prd, personas, prototype-notes]
---

# Body`;

    const parsed = parseFrontmatter(input);

    expect(parsed.meta.name).toBe("test-skill");
    expect(parsed.meta.executionMode).toBe("server");
    expect(parsed.meta.sourcePlugin).toBe("pm-execution");
    expect(parsed.meta.requiredArtifacts).toEqual([
      "prd",
      "personas",
      "prototype-notes",
    ]);
    expect(parsed.body).toBe("# Body");
  });
});

describe("buildDefinitionMetadata", () => {
  it("maps required metadata keys from mixed casing", () => {
    const metadata = buildDefinitionMetadata(
      {
        source_plugin: "pm-product-discovery",
        sourceAsset: "triage-requests",
        delegation_pattern: "intake-prioritization",
        importStrategy: "import",
        execution_mode: "server",
        required_artifacts: ["signals", "personas"],
        producedArtifacts: ["triage_report"],
      },
      ".cursor/commands/triage-requests.md",
      "abc123",
    );

    expect(metadata.sourcePlugin).toBe("pm-product-discovery");
    expect(metadata.sourceAsset).toBe("triage-requests");
    expect(metadata.delegationPattern).toBe("intake-prioritization");
    expect(metadata.importStrategy).toBe("import");
    expect(metadata.executionMode).toBe("server");
    expect(metadata.requiredArtifacts).toEqual(["signals", "personas"]);
    expect(metadata.producedArtifacts).toEqual(["triage_report"]);
  });
});

describe("parseGraphEdges", () => {
  it("parses explicit relation syntax and deduplicates edges", () => {
    const content = `
- uses_skill -> analyze-feature-requests, prioritize-features
- reads_context -> signals inbox, personas
- produces -> triage_report, project_recommendations
- uses_skill -> analyze-feature-requests
`;

    const edges = parseGraphEdges(content, {});

    expect(edges).toEqual([
      { relationType: "uses_skill", targetName: "analyze-feature-requests" },
      { relationType: "uses_skill", targetName: "prioritize-features" },
      { relationType: "reads_context", targetName: "signals inbox" },
      { relationType: "reads_context", targetName: "personas" },
      { relationType: "produces", targetName: "triage_report" },
      { relationType: "produces", targetName: "project_recommendations" },
    ]);
  });

  it("supports legacy delegate and trigger patterns", () => {
    const content = `
**Delegates to:** \`research-analyzer\`
Invoke for /research
`;

    const edges = parseGraphEdges(content, {
      producedArtifacts: ["research_summary"],
      human_gate: "approval",
    });

    expect(edges).toEqual(
      expect.arrayContaining([
        { relationType: "delegates_to", targetName: "research-analyzer" },
        { relationType: "triggers", targetName: "research" },
        { relationType: "produces", targetName: "research_summary" },
        { relationType: "human_gate", targetName: "approval" },
      ]),
    );
  });
});

describe("relationTargetEntityType", () => {
  it("maps known relation types to target entity type", () => {
    expect(relationTargetEntityType("delegates_to")).toBe("subagent");
    expect(relationTargetEntityType("uses_skill")).toBe("skill");
    expect(relationTargetEntityType("triggers")).toBe("command");
    expect(relationTargetEntityType("reads_context")).toBe("context");
  });
});
