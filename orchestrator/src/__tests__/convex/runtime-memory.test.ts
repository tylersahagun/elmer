import { describe, expect, it } from "vitest";

import {
  buildLegacySearchBuckets,
  buildRuntimeNodeMetadata,
  buildRuntimeRecord,
  isWorkspaceAuthorityContextItem,
  matchesRuntimeContextTypes,
  sortRuntimeRecords,
} from "../../../convex/runtimeMemory";

describe("runtime memory contract", () => {
  it("builds graph metadata that marks the graph as runtime authority", () => {
    expect(
      buildRuntimeNodeMetadata({
        mirrorTable: "knowledgebaseEntries",
        mirrorId: "kb_123",
        filePath: "pm-workspace-docs/company-context/product-vision.md",
      }),
    ).toEqual({
      runtimeAuthority: "graph",
      promotionState: "promoted",
      mirror: {
        table: "knowledgebaseEntries",
        id: "kb_123",
      },
      provenance: {
        source: "pm_workspace_sync",
        filePath: "pm-workspace-docs/company-context/product-vision.md",
        metadataSource: undefined,
      },
      projectId: undefined,
    });
  });

  it("derives runtime search records with promotion state and provenance", () => {
    const record = buildRuntimeRecord({
      graphNode: {
        _id: "graph_1",
        entityType: "context",
        entityId: "kb_123",
        name: "Product Vision",
        domain: "company_context",
        accessWeight: 2.4,
        validTo: undefined,
        metadata: buildRuntimeNodeMetadata({
          mirrorTable: "knowledgebaseEntries",
          mirrorId: "kb_123",
          provenanceSource: "agent",
        }),
      },
      entityType: "context",
      mirrorTable: "knowledgebaseEntries",
      mirrorId: "kb_123",
      title: "Product Vision",
      content: "Elmer is a project-first PM command center.",
      type: "company_context",
      query: "project-first",
    });

    expect(record.graphNodeId).toBe("graph_1");
    expect(record.promotionState).toBe("promoted");
    expect(record.provenance).toMatchObject({
      source: "agent",
      mirrorTable: "knowledgebaseEntries",
      mirrorId: "kb_123",
    });
    expect(record.snippet).toContain("project-first");
    expect(record.score).toBeGreaterThan(0);
  });

  it("sorts promoted results ahead of compatibility mirrors and preserves legacy buckets", () => {
    const sorted = sortRuntimeRecords([
      buildRuntimeRecord({
        entityType: "memory",
        mirrorTable: "memoryEntries",
        mirrorId: "mem_1",
        title: "context",
        content: "Legacy-only context entry",
        query: "context",
      }),
      buildRuntimeRecord({
        graphNode: {
          _id: "graph_2",
          entityType: "document",
          entityId: "doc_1",
          name: "Reset Plan",
          domain: "prd",
          accessWeight: 1.5,
          validTo: undefined,
          metadata: buildRuntimeNodeMetadata({
            mirrorTable: "documents",
            mirrorId: "doc_1",
            provenanceSource: "manual",
          }),
        },
        entityType: "document",
        mirrorTable: "documents",
        mirrorId: "doc_1",
        title: "Reset Plan",
        content: "Context and search now share one runtime query direction.",
        type: "prd",
        query: "context",
      }),
    ]);

    expect(sorted[0]?.promotionState).toBe("promoted");

    expect(buildLegacySearchBuckets(sorted)).toMatchObject({
      documents: [
        {
          id: "doc_1",
          title: "Reset Plan",
          type: "prd",
          promotionState: "promoted",
        },
      ],
      memory: [
        {
          id: "mem_1",
          type: "memory",
          promotionState: "compatibility_mirror",
        },
      ],
    });
  });

  it("treats personas as workspace authority items and supports personas type filters", () => {
    const persona = buildRuntimeRecord({
      graphNode: {
        _id: "graph_persona_1",
        entityType: "persona",
        entityId: "persona_1",
        name: "Founder Fran",
        domain: "founder",
        accessWeight: 1.3,
        validTo: undefined,
        metadata: buildRuntimeNodeMetadata({
          mirrorTable: "personas",
          mirrorId: "persona_1",
        }),
      },
      entityType: "persona",
      mirrorTable: "personas",
      mirrorId: "persona_1",
      title: "Founder Fran",
      content: "Prefers direct signal summaries over broad dashboards.",
      type: "founder",
    });

    expect(matchesRuntimeContextTypes(persona, ["personas"])).toBe(true);
    expect(isWorkspaceAuthorityContextItem(persona)).toBe(true);
  });

  it("sorts superseded records after promoted and compatibility mirrors", () => {
    const promoted = buildRuntimeRecord({
      graphNode: {
        _id: "graph_promoted",
        entityType: "context",
        entityId: "ctx_1",
        name: "Current Guardrail",
        domain: "strategic_guardrails",
        accessWeight: 2,
        validTo: undefined,
        metadata: buildRuntimeNodeMetadata({
          mirrorTable: "knowledgebaseEntries",
          mirrorId: "ctx_1",
          promotionState: "promoted",
        }),
      },
      entityType: "context",
      mirrorTable: "knowledgebaseEntries",
      mirrorId: "ctx_1",
      title: "Current Guardrail",
      content: "Stay project-first.",
      type: "strategic_guardrails",
    });
    const superseded = buildRuntimeRecord({
      graphNode: {
        _id: "graph_superseded",
        entityType: "context",
        entityId: "ctx_0",
        name: "Old Guardrail",
        domain: "strategic_guardrails",
        accessWeight: 4,
        validTo: Date.now(),
        metadata: buildRuntimeNodeMetadata({
          mirrorTable: "knowledgebaseEntries",
          mirrorId: "ctx_0",
          promotionState: "superseded",
        }),
      },
      entityType: "context",
      mirrorTable: "knowledgebaseEntries",
      mirrorId: "ctx_0",
      title: "Old Guardrail",
      content: "Do everything for everyone.",
      type: "strategic_guardrails",
    });

    expect(sortRuntimeRecords([superseded, promoted]).map((item) => item.id)).toEqual([
      "ctx_1",
      "ctx_0",
    ]);
  });
});
