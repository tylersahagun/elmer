import { describe, expect, it } from "vitest";

import {
  assignGraphCommunities,
  computeGraphPageRank,
  inferGraphEdges,
  selectPromotedGraphNodes,
} from "../../../convex/graphAnalytics";
import { buildRuntimeNodeMetadata } from "../../../convex/runtimeMemory";

describe("graph analytics helpers", () => {
  it("selects only active promoted nodes", () => {
    const nodes = [
      {
        _id: "node_promoted",
        name: "Project memory",
        domain: "memory",
        validTo: undefined,
        metadata: buildRuntimeNodeMetadata({
          mirrorTable: "memoryEntries",
          mirrorId: "mem_1",
        }),
      },
      {
        _id: "node_superseded",
        name: "Old context",
        domain: "context",
        validTo: Date.now(),
        metadata: buildRuntimeNodeMetadata({
          mirrorTable: "knowledgebaseEntries",
          mirrorId: "ctx_old",
          promotionState: "superseded",
        }),
      },
    ];

    expect(selectPromotedGraphNodes(nodes).map((node) => node._id)).toEqual([
      "node_promoted",
    ]);
  });

  it("assigns deterministic connected-component communities", () => {
    const nodes = [
      {
        _id: "node_a",
        name: "Context A",
        domain: "company_context",
        validTo: undefined,
        metadata: buildRuntimeNodeMetadata({
          mirrorTable: "knowledgebaseEntries",
          mirrorId: "ctx_a",
        }),
      },
      {
        _id: "node_b",
        name: "Context B",
        domain: "company_context",
        validTo: undefined,
        metadata: buildRuntimeNodeMetadata({
          mirrorTable: "knowledgebaseEntries",
          mirrorId: "ctx_b",
        }),
      },
      {
        _id: "node_c",
        name: "Signal C",
        domain: "signal",
        validTo: undefined,
        metadata: buildRuntimeNodeMetadata({
          mirrorTable: "signals",
          mirrorId: "sig_c",
        }),
      },
    ];
    const communities = assignGraphCommunities(nodes, [
      {
        _id: "edge_ab",
        fromNodeId: "node_a",
        toNodeId: "node_b",
        relationType: "about",
        weight: 1,
        source: "agent",
      },
    ]);

    expect(communities).toEqual([
      {
        communityId: "community:node_a",
        memberIds: ["node_a", "node_b"],
        theme: "company_context",
      },
      {
        communityId: "community:node_c",
        memberIds: ["node_c"],
        theme: "signal",
      },
    ]);
  });

  it("computes pagerank and infers only novel edges with shared runtime terms", () => {
    const nodes = [
      {
        _id: "node_1",
        name: "Prototype feedback memory",
        domain: "feedback",
        validTo: undefined,
        metadata: buildRuntimeNodeMetadata({
          mirrorTable: "memoryEntries",
          mirrorId: "mem_1",
        }),
      },
      {
        _id: "node_2",
        name: "Prototype feedback signals",
        domain: "signal",
        validTo: undefined,
        metadata: buildRuntimeNodeMetadata({
          mirrorTable: "signals",
          mirrorId: "sig_2",
        }),
      },
      {
        _id: "node_3",
        name: "Roadmap planning",
        domain: "planning",
        validTo: undefined,
        metadata: buildRuntimeNodeMetadata({
          mirrorTable: "knowledgebaseEntries",
          mirrorId: "ctx_3",
        }),
      },
    ];
    const edges = [
      {
        _id: "edge_13",
        fromNodeId: "node_1",
        toNodeId: "node_3",
        relationType: "about",
        weight: 1,
        source: "agent",
      },
    ];
    const observations = [
      {
        _id: "obs_1",
        nodeId: "node_1",
        content: "Prototype feedback from alpha testers highlighted handoff friction.",
        supersededBy: undefined,
      },
      {
        _id: "obs_2",
        nodeId: "node_2",
        content: "Feedback signals from prototype reviewers emphasized friction in handoff.",
        supersededBy: undefined,
      },
      {
        _id: "obs_3",
        nodeId: "node_3",
        content: "Roadmap planning for quarterly milestones.",
        supersededBy: undefined,
      },
    ];

    const pagerank = computeGraphPageRank(nodes, edges);
    expect(pagerank.node_3).toBeGreaterThan(0);
    expect(pagerank.node_1).toBeGreaterThan(0);

    expect(inferGraphEdges(nodes, edges, observations)).toEqual([
      {
        fromNodeId: "node_1",
        toNodeId: "node_2",
        relationType: "inferred_related",
        weight: 4,
        confidence: 0.3333,
        source: "inferred",
      },
    ]);
  });
});
