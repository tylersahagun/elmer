import type { Doc, Id } from "./_generated/dataModel";
import { readRuntimeNodeMetadata } from "./runtimeMemory";

type AnalyticsNode = Pick<
  Doc<"graphNodes">,
  "_id" | "name" | "domain" | "metadata" | "validTo"
>;

type AnalyticsEdge = Pick<
  Doc<"graphEdges">,
  "_id" | "fromNodeId" | "toNodeId" | "relationType" | "weight" | "source"
>;

type AnalyticsObservation = Pick<
  Doc<"graphObservations">,
  "_id" | "nodeId" | "content" | "supersededBy"
>;

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "for",
  "from",
  "in",
  "is",
  "it",
  "of",
  "on",
  "or",
  "that",
  "the",
  "to",
  "with",
]);

export function selectPromotedGraphNodes<T extends AnalyticsNode>(nodes: T[]) {
  return nodes.filter((node) => {
    if (node.validTo) return false;
    return readRuntimeNodeMetadata(node.metadata).promotionState === "promoted";
  });
}

export function computeGraphPageRank(
  nodes: AnalyticsNode[],
  edges: AnalyticsEdge[],
  options: { damping?: number; iterations?: number } = {},
) {
  if (nodes.length === 0) return {} as Record<string, number>;

  const damping = options.damping ?? 0.85;
  const iterations = options.iterations ?? 20;
  const nodeIds = nodes.map((node) => node._id);
  const nodeIdSet = new Set(nodeIds);
  const incoming = new Map<string, string[]>();
  const outgoing = new Map<string, string[]>();

  for (const nodeId of nodeIds) {
    incoming.set(nodeId, []);
    outgoing.set(nodeId, []);
  }

  for (const edge of edges) {
    if (!nodeIdSet.has(edge.fromNodeId) || !nodeIdSet.has(edge.toNodeId)) continue;
    outgoing.get(edge.fromNodeId)?.push(edge.toNodeId);
    incoming.get(edge.toNodeId)?.push(edge.fromNodeId);
  }

  let scores = Object.fromEntries(
    nodeIds.map((nodeId) => [nodeId, 1 / nodeIds.length]),
  ) as Record<string, number>;

  for (let iteration = 0; iteration < iterations; iteration++) {
    const nextScores: Record<string, number> = {};
    for (const nodeId of nodeIds) {
      let rank = (1 - damping) / nodeIds.length;
      for (const sourceId of incoming.get(nodeId) ?? []) {
        const degree = (outgoing.get(sourceId) ?? []).length || nodeIds.length;
        rank += damping * (scores[sourceId] ?? 0) / degree;
      }

      const danglingContribution = nodeIds
        .filter((candidateId) => (outgoing.get(candidateId) ?? []).length === 0)
        .reduce(
          (sum, candidateId) => sum + (damping * (scores[candidateId] ?? 0)) / nodeIds.length,
          0,
        );
      nextScores[nodeId] = rank + danglingContribution;
    }
    scores = nextScores;
  }

  return scores;
}

export function assignGraphCommunities(
  nodes: AnalyticsNode[],
  edges: AnalyticsEdge[],
) {
  const nodeIds = nodes.map((node) => node._id).sort();
  const adjacency = new Map<Id<"graphNodes">, Set<Id<"graphNodes">>>();
  for (const nodeId of nodeIds) {
    adjacency.set(nodeId, new Set());
  }

  for (const edge of edges) {
    if (!adjacency.has(edge.fromNodeId) || !adjacency.has(edge.toNodeId)) continue;
    adjacency.get(edge.fromNodeId)?.add(edge.toNodeId);
    adjacency.get(edge.toNodeId)?.add(edge.fromNodeId);
  }

  const visited = new Set<Id<"graphNodes">>();
  const communities: Array<{
    communityId: string;
    memberIds: Id<"graphNodes">[];
    theme?: string;
  }> = [];

  for (const startNodeId of nodeIds) {
    if (visited.has(startNodeId)) continue;
    const queue: Id<"graphNodes">[] = [startNodeId];
    const memberIds: Id<"graphNodes">[] = [];
    visited.add(startNodeId);

    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      memberIds.push(nodeId);
      for (const neighbor of adjacency.get(nodeId) ?? []) {
        if (visited.has(neighbor)) continue;
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }

    const communityNodes = nodes.filter((node) => memberIds.includes(node._id));
    const theme = deriveCommunityTheme(communityNodes);
    communities.push({
      communityId: `community:${memberIds.slice().sort()[0]}`,
      memberIds: memberIds.sort(),
      theme,
    });
  }

  return communities;
}

function deriveCommunityTheme(nodes: AnalyticsNode[]) {
  const counts = new Map<string, number>();
  for (const node of nodes) {
    const key = node.domain ?? "general";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()].sort((left, right) => {
    if (right[1] !== left[1]) return right[1] - left[1];
    return left[0].localeCompare(right[0]);
  })[0]?.[0];
}

function tokenize(value: string) {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 4 && !STOP_WORDS.has(token));
}

function buildNodeTokenSet(
  node: AnalyticsNode,
  observations: AnalyticsObservation[],
) {
  const observationText = observations
    .filter((observation) => observation.nodeId === node._id && !observation.supersededBy)
    .map((observation) => observation.content)
    .join(" ");
  return new Set(tokenize([node.name, node.domain ?? "", observationText].join(" ")));
}

export function inferGraphEdges(
  nodes: AnalyticsNode[],
  edges: AnalyticsEdge[],
  observations: AnalyticsObservation[],
  options: { maxEdges?: number; minSharedTokens?: number } = {},
) {
  const maxEdges = options.maxEdges ?? 25;
  const minSharedTokens = options.minSharedTokens ?? 2;
  const existingPairs = new Set(
    edges.flatMap((edge) => [
      `${edge.fromNodeId}:${edge.toNodeId}`,
      `${edge.toNodeId}:${edge.fromNodeId}`,
    ]),
  );
  const tokenSets = new Map(
    nodes.map((node) => [node._id, buildNodeTokenSet(node, observations)]),
  );

  const inferred: Array<{
    fromNodeId: string;
    toNodeId: string;
    relationType: string;
    weight: number;
    confidence: number;
    source: "inferred";
  }> = [];

  for (let index = 0; index < nodes.length; index++) {
    for (let otherIndex = index + 1; otherIndex < nodes.length; otherIndex++) {
      const left = nodes[index];
      const right = nodes[otherIndex];
      const pairKey = `${left._id}:${right._id}`;
      if (existingPairs.has(pairKey)) continue;

      const leftTokens = tokenSets.get(left._id) ?? new Set<string>();
      const rightTokens = tokenSets.get(right._id) ?? new Set<string>();
      const shared = [...leftTokens].filter((token) => rightTokens.has(token));
      if (shared.length < minSharedTokens) continue;

      const unionSize = new Set([...leftTokens, ...rightTokens]).size || 1;
      const confidence = Number((shared.length / unionSize).toFixed(4));
      if (confidence < 0.18) continue;

      inferred.push({
        fromNodeId: left._id < right._id ? left._id : right._id,
        toNodeId: left._id < right._id ? right._id : left._id,
        relationType: "inferred_related",
        weight: shared.length,
        confidence,
        source: "inferred",
      });
    }
  }

  return inferred
    .sort((left, right) => {
      if (right.confidence !== left.confidence) {
        return right.confidence - left.confidence;
      }
      return `${left.fromNodeId}:${left.toNodeId}`.localeCompare(
        `${right.fromNodeId}:${right.toNodeId}`,
      );
    })
    .slice(0, maxEdges);
}
