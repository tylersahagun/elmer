import type { Doc, Id } from "./_generated/dataModel";

export type RuntimePromotionState =
  | "promoted"
  | "compatibility_mirror"
  | "superseded";

export type RuntimeMirrorTable =
  | "projects"
  | "documents"
  | "signals"
  | "memoryEntries"
  | "knowledgebaseEntries"
  | "personas";

export type RuntimeEntityType =
  | "project"
  | "document"
  | "signal"
  | "memory"
  | "context"
  | "persona";

export type RuntimeGraphNodeEntityType = RuntimeEntityType | "workspace";

export type RuntimeProvenanceSource =
  | "manual"
  | "user_input"
  | "agent"
  | "pm_workspace_sync"
  | "migration"
  | "unknown";

export interface RuntimeNodeMetadata {
  runtimeAuthority: "graph";
  promotionState: RuntimePromotionState;
  mirror: {
    table: RuntimeMirrorTable;
    id: string;
  };
  provenance: {
    source: RuntimeProvenanceSource | string;
    filePath?: string;
    metadataSource?: string;
    actor?: string;
    sourceArtifactId?: string;
  };
  projectId?: string;
}

export interface RuntimeMemoryRecord {
  id: string;
  entityType: RuntimeEntityType | string;
  title: string;
  content: string;
  type?: string;
  domain?: string;
  projectId?: string;
  graphNodeId?: string;
  accessWeight?: number;
  promotionState: RuntimePromotionState;
  provenance: {
    source: string;
    mirrorTable: RuntimeMirrorTable;
    mirrorId: string;
    filePath?: string;
    metadataSource?: string;
    actor?: string;
    sourceArtifactId?: string;
  };
  snippet: string;
  score?: number;
}

type RuntimeGraphNode = Pick<
  Doc<"graphNodes">,
  "_id" | "entityType" | "entityId" | "name" | "domain" | "accessWeight" | "metadata" | "validTo"
>;

type RuntimeObservation = Pick<
  Doc<"graphObservations">,
  "_id" | "nodeId" | "depth" | "content" | "supersededBy"
>;

type RuntimeDbContext = {
  db: {
    get(id: string): Promise<any>;
    insert(table: string, value: Record<string, unknown>): Promise<any>;
    patch(id: string, value: Record<string, unknown>): Promise<void>;
    query(table: string): {
      withIndex(
        indexName: string,
        builder: (query: { eq(fieldName: string, value: unknown): any }) => unknown,
      ): {
        first(): Promise<any>;
        collect(): Promise<any[]>;
      };
    };
  };
};

type RuntimeMirrorSyncArgs = {
  workspaceId: Id<"workspaces">;
  entityType: RuntimeEntityType;
  entityId: string;
  title: string;
  content: string;
  domain?: string;
  mirrorTable: RuntimeMirrorTable;
  mirrorId: string;
  projectId?: Id<"projects">;
  filePath?: string;
  metadataSource?: string;
  provenanceSource?: RuntimeProvenanceSource | string;
  promotionState?: RuntimePromotionState;
  decayRate?: number;
  actor?: string;
  sourceArtifactId?: string;
};

export type GraphNodeMap = Map<string, Doc<"graphNodes">>;

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

export function makeEntityKey(entityType: string, entityId?: string) {
  return entityId ? `${entityType}:${entityId}` : undefined;
}

export function deriveRuntimeProvenanceSource(args: {
  filePath?: string;
  metadataSource?: string;
  fallback?: string;
}): RuntimeProvenanceSource | string {
  if (args.fallback) return args.fallback;
  if (args.metadataSource) return args.metadataSource;
  if (args.filePath?.includes("pm-workspace-docs")) return "pm_workspace_sync";
  return "manual";
}

export function buildRuntimeNodeMetadata(args: {
  mirrorTable: RuntimeMirrorTable;
  mirrorId: string;
  projectId?: string;
  filePath?: string;
  metadataSource?: string;
  provenanceSource?: RuntimeProvenanceSource | string;
  promotionState?: RuntimePromotionState;
  actor?: string;
  sourceArtifactId?: string;
}): RuntimeNodeMetadata {
  return {
    runtimeAuthority: "graph",
    promotionState: args.promotionState ?? "promoted",
    mirror: {
      table: args.mirrorTable,
      id: args.mirrorId,
    },
    provenance: {
      source: deriveRuntimeProvenanceSource({
        filePath: args.filePath,
        metadataSource: args.metadataSource,
        fallback: args.provenanceSource,
      }),
      filePath: args.filePath,
      metadataSource: args.metadataSource,
      actor: args.actor,
      sourceArtifactId: args.sourceArtifactId ?? args.filePath,
    },
    projectId: args.projectId,
  };
}

export function readRuntimeNodeMetadata(
  metadata: unknown,
): Partial<RuntimeNodeMetadata> {
  const value = asRecord(metadata);
  if (!value) return {};
  const mirror = asRecord(value.mirror);
  const provenance = asRecord(value.provenance);

  return {
    runtimeAuthority: value.runtimeAuthority === "graph" ? "graph" : undefined,
    promotionState:
      value.promotionState === "promoted" ||
      value.promotionState === "compatibility_mirror" ||
      value.promotionState === "superseded"
        ? (value.promotionState as RuntimePromotionState)
        : undefined,
    mirror:
      mirror && typeof mirror.table === "string" && typeof mirror.id === "string"
        ? {
            table: mirror.table as RuntimeMirrorTable,
            id: mirror.id,
          }
        : undefined,
    provenance:
      provenance && typeof provenance.source === "string"
        ? {
            source: provenance.source,
            filePath:
              typeof provenance.filePath === "string"
                ? provenance.filePath
                : undefined,
            metadataSource:
              typeof provenance.metadataSource === "string"
                ? provenance.metadataSource
                : undefined,
            actor:
              typeof provenance.actor === "string" ? provenance.actor : undefined,
            sourceArtifactId:
              typeof provenance.sourceArtifactId === "string"
                ? provenance.sourceArtifactId
                : undefined,
          }
        : undefined,
    projectId: typeof value.projectId === "string" ? value.projectId : undefined,
  };
}

export function buildSearchSnippet(content: string, query?: string, maxLength = 220) {
  const trimmed = content.trim();
  if (!trimmed) return "";
  if (!query) return trimmed.slice(0, maxLength);

  const normalized = query.trim().toLowerCase();
  if (!normalized) return trimmed.slice(0, maxLength);

  const index = trimmed.toLowerCase().indexOf(normalized);
  if (index === -1) return trimmed.slice(0, maxLength);

  const start = Math.max(
    0,
    index - Math.floor((maxLength - normalized.length) / 2),
  );
  return trimmed.slice(start, start + maxLength);
}

export function scoreRuntimeRecord(
  query: string,
  title: string,
  content: string,
  accessWeight = 0,
) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return 0;

  const lowerTitle = title.toLowerCase();
  const lowerContent = content.toLowerCase();
  let score = 0;
  if (lowerTitle.includes(normalized)) score += 8;
  if (lowerContent.includes(normalized)) score += 4;
  if (lowerTitle.startsWith(normalized)) score += 2;
  return score + Math.min(accessWeight, 5);
}

export function buildRuntimeRecord(args: {
  graphNode?: RuntimeGraphNode;
  entityType: RuntimeEntityType | string;
  mirrorTable: RuntimeMirrorTable;
  mirrorId: string;
  title: string;
  content: string;
  type?: string;
  projectId?: string;
  provenanceSource?: string;
  filePath?: string;
  metadataSource?: string;
  query?: string;
  fallbackPromotionState?: RuntimePromotionState;
  actor?: string;
  sourceArtifactId?: string;
}) {
  const metadata = readRuntimeNodeMetadata(args.graphNode?.metadata);
  const promotionState =
    metadata.promotionState ??
    args.fallbackPromotionState ??
    (args.graphNode ? "promoted" : "compatibility_mirror");
  const provenanceSource =
    metadata.provenance?.source ??
    deriveRuntimeProvenanceSource({
      filePath: args.filePath,
      metadataSource: args.metadataSource,
      fallback: args.provenanceSource,
    });

  return {
    id: args.mirrorId,
    entityType: args.entityType,
    title: args.title,
    content: args.content,
    type: args.type,
    domain: args.graphNode?.domain,
    projectId: metadata.projectId ?? args.projectId,
    graphNodeId: args.graphNode?._id,
    accessWeight: args.graphNode?.accessWeight,
    promotionState,
    provenance: {
      source: provenanceSource,
      mirrorTable: metadata.mirror?.table ?? args.mirrorTable,
      mirrorId: metadata.mirror?.id ?? args.mirrorId,
      filePath: metadata.provenance?.filePath ?? args.filePath,
      metadataSource:
        metadata.provenance?.metadataSource ?? args.metadataSource,
      actor: metadata.provenance?.actor ?? args.actor,
      sourceArtifactId:
        metadata.provenance?.sourceArtifactId ?? args.sourceArtifactId,
    },
    snippet: buildSearchSnippet(args.content, args.query),
    score: scoreRuntimeRecord(
      args.query ?? "",
      args.title,
      args.content,
      args.graphNode?.accessWeight,
    ),
  } satisfies RuntimeMemoryRecord;
}

export function sortRuntimeRecords<T extends RuntimeMemoryRecord>(records: T[]) {
  const promotionPriority: Record<RuntimePromotionState, number> = {
    promoted: 0,
    compatibility_mirror: 1,
    superseded: 2,
  };

  return [...records].sort((left, right) => {
    if (left.promotionState !== right.promotionState) {
      return (
        promotionPriority[left.promotionState] -
        promotionPriority[right.promotionState]
      );
    }

    const byScore = (right.score ?? 0) - (left.score ?? 0);
    if (byScore !== 0) return byScore;

    const byWeight = (right.accessWeight ?? 0) - (left.accessWeight ?? 0);
    if (byWeight !== 0) return byWeight;

    return left.title.localeCompare(right.title);
  });
}

export function buildLegacySearchBuckets(results: RuntimeMemoryRecord[]) {
  return {
    documents: results
      .filter((result) => result.entityType === "document")
      .map((result) => ({
        id: result.id,
        projectId: result.projectId,
        title: result.title,
        content: result.content,
        type: result.type ?? "document",
        promotionState: result.promotionState,
        provenance: result.provenance,
      })),
    memory: results
      .filter((result) => result.entityType === "memory")
      .map((result) => ({
        id: result.id,
        projectId: result.projectId,
        content: result.content,
        type: result.type ?? "memory",
        promotionState: result.promotionState,
        provenance: result.provenance,
      })),
    knowledgebase: results
      .filter((result) => result.entityType === "context")
      .map((result) => ({
        id: result.id,
        title: result.title,
        content: result.content,
        type: result.type ?? "context",
        promotionState: result.promotionState,
        provenance: result.provenance,
      })),
    personas: results
      .filter((result) => result.entityType === "persona")
      .map((result) => ({
        id: result.id,
        archetypeId: result.type ?? result.title,
        name: result.title,
        description: result.snippet,
        content: result.content,
        promotionState: result.promotionState,
        provenance: result.provenance,
      })),
  };
}

export function matchesRuntimeContextTypes(
  item: RuntimeMemoryRecord,
  types?: string[],
) {
  if (!types?.length) return true;
  if (item.type && types.includes(item.type)) return true;
  return item.entityType === "persona" && types.includes("personas");
}

export function isWorkspaceAuthorityContextItem(item: RuntimeMemoryRecord) {
  return (
    item.entityType === "persona" ||
    item.type === "company_context" ||
    item.type === "strategic_guardrails"
  );
}

export async function loadWorkspaceGraphNodeMap(
  ctx: RuntimeDbContext,
  workspaceId: Id<"workspaces">,
): Promise<GraphNodeMap> {
  const nodes = await ctx.db
    .query("graphNodes")
    .withIndex("by_workspace_type", (queryBuilder) =>
      queryBuilder.eq("workspaceId", workspaceId),
    )
    .collect();

  const graphNodeMap: GraphNodeMap = new Map();
  for (const node of nodes) {
    const key = makeEntityKey(node.entityType, node.entityId ?? undefined);
    if (!key) continue;
    graphNodeMap.set(key, node);
  }
  return graphNodeMap;
}

function getGraphNode(
  graphNodeMap: GraphNodeMap,
  entityType: string,
  entityId: string,
) {
  return graphNodeMap.get(makeEntityKey(entityType, entityId) ?? "");
}

export async function buildWorkspaceContextItems(
  ctx: RuntimeDbContext,
  workspaceId: Id<"workspaces">,
  graphNodeMap: GraphNodeMap,
  q?: string,
) {
  const [knowledgebaseEntries, personas] = await Promise.all([
    ctx.db
      .query("knowledgebaseEntries")
      .withIndex("by_workspace_type", (queryBuilder) =>
        queryBuilder.eq("workspaceId", workspaceId),
      )
      .collect(),
    ctx.db
      .query("personas")
      .withIndex("by_workspace", (queryBuilder) =>
        queryBuilder.eq("workspaceId", workspaceId),
      )
      .collect(),
  ]);

  return sortRuntimeRecords([
    ...knowledgebaseEntries.map((entry) =>
      buildRuntimeRecord({
        graphNode: getGraphNode(graphNodeMap, "context", entry._id),
        entityType: "context",
        mirrorTable: "knowledgebaseEntries",
        mirrorId: entry._id,
        title: entry.title,
        content: entry.content,
        type: entry.type,
        filePath: entry.filePath,
        query: q,
      }),
    ),
    ...personas.map((persona) =>
      buildRuntimeRecord({
        graphNode: getGraphNode(graphNodeMap, "persona", persona._id),
        entityType: "persona",
        mirrorTable: "personas",
        mirrorId: persona._id,
        title: persona.name,
        content: persona.content,
        type: persona.archetypeId,
        filePath: persona.filePath,
        query: q,
      }),
    ),
  ]);
}

export async function buildProjectRuntimeItems(
  ctx: RuntimeDbContext,
  projectId: Id<"projects">,
  graphNodeMap: GraphNodeMap,
  q?: string,
) {
  const [documents, memoryEntries, signalLinks] = await Promise.all([
    ctx.db
      .query("documents")
      .withIndex("by_project", (queryBuilder) =>
        queryBuilder.eq("projectId", projectId),
      )
      .collect(),
    ctx.db
      .query("memoryEntries")
      .withIndex("by_project", (queryBuilder) =>
        queryBuilder.eq("projectId", projectId),
      )
      .collect(),
    ctx.db
      .query("signalProjects")
      .withIndex("by_project", (queryBuilder) =>
        queryBuilder.eq("projectId", projectId),
      )
      .collect(),
  ]);

  const signals = (
    await Promise.all(signalLinks.map((link) => ctx.db.get(link.signalId)))
  ).filter(Boolean) as Doc<"signals">[];

  return sortRuntimeRecords([
    ...documents.map((document) =>
      buildRuntimeRecord({
        graphNode: getGraphNode(graphNodeMap, "document", document._id),
        entityType: "document",
        mirrorTable: "documents",
        mirrorId: document._id,
        title: document.title,
        content: document.content,
        type: document.type,
        projectId: document.projectId,
        query: q,
      }),
    ),
    ...memoryEntries.map((entry) =>
      buildRuntimeRecord({
        graphNode: getGraphNode(graphNodeMap, "memory", entry._id),
        entityType: "memory",
        mirrorTable: "memoryEntries",
        mirrorId: entry._id,
        title: entry.type.replace(/_/g, " "),
        content: entry.content,
        type: entry.type,
        projectId: entry.projectId ?? undefined,
        provenanceSource:
          typeof entry.metadata?.source === "string"
            ? entry.metadata.source
            : undefined,
        actor:
          typeof entry.metadata?.actor === "string"
            ? entry.metadata.actor
            : undefined,
        sourceArtifactId:
          typeof entry.metadata?.sourceArtifactId === "string"
            ? entry.metadata.sourceArtifactId
            : typeof entry.metadata?.path === "string"
              ? entry.metadata.path
              : typeof entry.metadata?.url === "string"
                ? entry.metadata.url
                : undefined,
        query: q,
      }),
    ),
    ...signals.map((signal) =>
      buildRuntimeRecord({
        graphNode: getGraphNode(graphNodeMap, "signal", signal._id),
        entityType: "signal",
        mirrorTable: "signals",
        mirrorId: signal._id,
        title: signal.source,
        content: signal.verbatim,
        type: signal.severity ?? signal.status,
        projectId,
        query: q,
      }),
    ),
  ]);
}

export async function buildWorkspaceRuntimeSearch(
  ctx: RuntimeDbContext,
  workspaceId: Id<"workspaces">,
  q: string,
) {
  const normalized = q.trim().toLowerCase();
  if (!normalized) {
    return { results: [], documents: [], memory: [], knowledgebase: [], personas: [] };
  }

  const [projects, graphNodeMap, memoryEntries, knowledgebaseEntries, personas] =
    await Promise.all([
      ctx.db
        .query("projects")
        .withIndex("by_workspace", (queryBuilder) =>
          queryBuilder.eq("workspaceId", workspaceId),
        )
        .collect(),
      loadWorkspaceGraphNodeMap(ctx, workspaceId),
      ctx.db
        .query("memoryEntries")
        .withIndex("by_workspace", (queryBuilder) =>
          queryBuilder.eq("workspaceId", workspaceId),
        )
        .collect(),
      ctx.db
        .query("knowledgebaseEntries")
        .withIndex("by_workspace_type", (queryBuilder) =>
          queryBuilder.eq("workspaceId", workspaceId),
        )
        .collect(),
      ctx.db
        .query("personas")
        .withIndex("by_workspace", (queryBuilder) =>
          queryBuilder.eq("workspaceId", workspaceId),
        )
        .collect(),
    ]);

  const documents = (
    await Promise.all(
      projects.map((project) =>
        ctx.db
          .query("documents")
          .withIndex("by_project", (queryBuilder) =>
            queryBuilder.eq("projectId", project._id),
          )
          .collect(),
      ),
    )
  ).flat();

  const results = sortRuntimeRecords([
    ...documents.map((document) =>
      buildRuntimeRecord({
        graphNode: getGraphNode(graphNodeMap, "document", document._id),
        entityType: "document",
        mirrorTable: "documents",
        mirrorId: document._id,
        title: document.title,
        content: document.content,
        type: document.type,
        projectId: document.projectId,
        query: normalized,
      }),
    ),
    ...memoryEntries.map((entry) =>
      buildRuntimeRecord({
        graphNode: getGraphNode(graphNodeMap, "memory", entry._id),
        entityType: "memory",
        mirrorTable: "memoryEntries",
        mirrorId: entry._id,
        title: entry.type.replace(/_/g, " "),
        content: entry.content,
        type: entry.type,
        projectId: entry.projectId ?? undefined,
        provenanceSource:
          typeof entry.metadata?.source === "string"
            ? entry.metadata.source
            : undefined,
        actor:
          typeof entry.metadata?.actor === "string"
            ? entry.metadata.actor
            : undefined,
        sourceArtifactId:
          typeof entry.metadata?.sourceArtifactId === "string"
            ? entry.metadata.sourceArtifactId
            : typeof entry.metadata?.path === "string"
              ? entry.metadata.path
              : typeof entry.metadata?.url === "string"
                ? entry.metadata.url
                : undefined,
        query: normalized,
      }),
    ),
    ...knowledgebaseEntries.map((entry) =>
      buildRuntimeRecord({
        graphNode: getGraphNode(graphNodeMap, "context", entry._id),
        entityType: "context",
        mirrorTable: "knowledgebaseEntries",
        mirrorId: entry._id,
        title: entry.title,
        content: entry.content,
        type: entry.type,
        filePath: entry.filePath,
        query: normalized,
      }),
    ),
    ...personas.map((persona) =>
      buildRuntimeRecord({
        graphNode: getGraphNode(graphNodeMap, "persona", persona._id),
        entityType: "persona",
        mirrorTable: "personas",
        mirrorId: persona._id,
        title: persona.name,
        content: persona.content,
        type: persona.archetypeId,
        filePath: persona.filePath,
        query: normalized,
      }),
    ),
  ]).filter((result) => (result.score ?? 0) > 0);

  return {
    results,
    ...buildLegacySearchBuckets(results),
  };
}

export async function ensureWorkspaceGraphNode(
  ctx: RuntimeDbContext,
  args: {
    workspaceId: Id<"workspaces">;
    workspaceName?: string;
  },
) {
  const existing = await ctx.db
    .query("graphNodes")
    .withIndex("by_entity", (query) =>
      query.eq("entityType", "workspace").eq("entityId", args.workspaceId),
    )
    .first();
  if (existing) return existing._id as Id<"graphNodes">;

  const workspace =
    args.workspaceName
      ? { name: args.workspaceName }
      : ((await ctx.db.get(args.workspaceId)) as { name?: string } | null);

  return (await ctx.db.insert("graphNodes", {
    workspaceId: args.workspaceId,
    entityType: "workspace",
    entityId: args.workspaceId,
    name: workspace?.name ?? "Workspace",
    accessWeight: 1.0,
    decayRate: 0.001,
    metadata: {
      runtimeAuthority: "graph",
      promotionState: "promoted",
    },
  })) as Id<"graphNodes">;
}

export async function ensureProjectGraphNode(
  ctx: RuntimeDbContext,
  args: {
    workspaceId: Id<"workspaces">;
    projectId: Id<"projects">;
    projectName?: string;
  },
) {
  const existing = await ctx.db
    .query("graphNodes")
    .withIndex("by_entity", (query) =>
      query.eq("entityType", "project").eq("entityId", args.projectId),
    )
    .first();
  if (existing) return existing._id as Id<"graphNodes">;

  const project =
    args.projectName
      ? { name: args.projectName }
      : ((await ctx.db.get(args.projectId)) as { name?: string } | null);

  return (await ctx.db.insert("graphNodes", {
    workspaceId: args.workspaceId,
    entityType: "project",
    entityId: args.projectId,
    name: project?.name ?? "Untitled Project",
    accessWeight: 1.0,
    decayRate: 0.005,
    metadata: buildRuntimeNodeMetadata({
      mirrorTable: "projects",
      mirrorId: args.projectId,
      promotionState: "promoted",
      provenanceSource: "migration",
    }),
  })) as Id<"graphNodes">;
}

async function findActiveObservation(
  ctx: RuntimeDbContext,
  nodeId: Id<"graphNodes">,
  depth: number,
) {
  const observations = (await ctx.db
    .query("graphObservations")
    .withIndex("by_node", (query) => query.eq("nodeId", nodeId))
    .collect()) as RuntimeObservation[];

  return observations.find(
    (observation) =>
      observation.depth === depth && observation.supersededBy === undefined,
  );
}

async function addOrSupersedeObservation(
  ctx: RuntimeDbContext,
  args: {
    nodeId: Id<"graphNodes">;
    workspaceId: Id<"workspaces">;
    content: string;
  },
) {
  const normalized = args.content.trim();
  if (!normalized) return null;

  const existing = await findActiveObservation(ctx, args.nodeId, 0);
  if (existing?.content === normalized) {
    return existing._id;
  }

  const newId = (await ctx.db.insert("graphObservations", {
    nodeId: args.nodeId,
    workspaceId: args.workspaceId,
    depth: 0,
    content: normalized,
  })) as Id<"graphObservations">;

  if (existing) {
    await ctx.db.patch(existing._id, { supersededBy: newId });
  }

  return newId;
}

async function ensureEdge(
  ctx: RuntimeDbContext,
  args: {
    workspaceId: Id<"workspaces">;
    fromNodeId: Id<"graphNodes">;
    toNodeId: Id<"graphNodes">;
    relationType: string;
    weight?: number;
    confidence?: number;
    source: string;
  },
) {
  const existing = await ctx.db
    .query("graphEdges")
    .withIndex("by_from", (query) => query.eq("fromNodeId", args.fromNodeId))
    .collect();

  if (
    existing.some(
      (edge) =>
        edge.toNodeId === args.toNodeId &&
        edge.relationType === args.relationType,
    )
  ) {
    return null;
  }

  return await ctx.db.insert("graphEdges", {
    workspaceId: args.workspaceId,
    fromNodeId: args.fromNodeId,
    toNodeId: args.toNodeId,
    relationType: args.relationType,
    weight: args.weight ?? 1.0,
    confidence: args.confidence,
    source: args.source,
  });
}

export async function archivePromotedMirrorNode(
  ctx: RuntimeDbContext,
  args: {
    entityType: RuntimeGraphNodeEntityType;
    entityId: string;
  },
) {
  const node = await ctx.db
    .query("graphNodes")
    .withIndex("by_entity", (query) =>
      query.eq("entityType", args.entityType).eq("entityId", args.entityId),
    )
    .first();
  if (!node) return null;

  const metadata = buildRuntimeNodeMetadata({
    mirrorTable:
      readRuntimeNodeMetadata(node.metadata).mirror?.table ?? "memoryEntries",
    mirrorId:
      readRuntimeNodeMetadata(node.metadata).mirror?.id ?? args.entityId,
    projectId: readRuntimeNodeMetadata(node.metadata).projectId,
    filePath: readRuntimeNodeMetadata(node.metadata).provenance?.filePath,
    metadataSource:
      readRuntimeNodeMetadata(node.metadata).provenance?.metadataSource,
    provenanceSource: readRuntimeNodeMetadata(node.metadata).provenance?.source,
    actor: readRuntimeNodeMetadata(node.metadata).provenance?.actor,
    sourceArtifactId:
      readRuntimeNodeMetadata(node.metadata).provenance?.sourceArtifactId,
    promotionState: "superseded",
  });

  await ctx.db.patch(node._id, {
    validTo: Date.now(),
    metadata,
  });
  return node._id;
}

export async function upsertPromotedMirrorNode(
  ctx: RuntimeDbContext,
  args: RuntimeMirrorSyncArgs,
) {
  const existing = await ctx.db
    .query("graphNodes")
    .withIndex("by_entity", (query) =>
      query.eq("entityType", args.entityType).eq("entityId", args.entityId),
    )
    .first();

  const currentMetadata = readRuntimeNodeMetadata(existing?.metadata);
  const metadata = {
    ...asRecord(existing?.metadata),
    ...buildRuntimeNodeMetadata({
      mirrorTable: args.mirrorTable,
      mirrorId: args.mirrorId,
      projectId: args.projectId,
      filePath: args.filePath,
      metadataSource: args.metadataSource,
      provenanceSource: args.provenanceSource,
      promotionState:
        args.promotionState ??
        currentMetadata.promotionState ??
        "promoted",
      actor: args.actor,
      sourceArtifactId: args.sourceArtifactId,
    }),
  };

  let nodeId: Id<"graphNodes">;
  if (existing) {
    nodeId = existing._id as Id<"graphNodes">;
    await ctx.db.patch(nodeId, {
      name: args.title,
      domain: args.domain,
      decayRate: args.decayRate ?? existing.decayRate ?? 0.01,
      metadata,
      validTo: undefined,
    });
  } else {
    nodeId = (await ctx.db.insert("graphNodes", {
      workspaceId: args.workspaceId,
      entityType: args.entityType,
      entityId: args.entityId,
      name: args.title,
      domain: args.domain,
      accessWeight: 1.0,
      decayRate: args.decayRate ?? 0.01,
      metadata,
    })) as Id<"graphNodes">;
  }

  await addOrSupersedeObservation(ctx, {
    nodeId,
    workspaceId: args.workspaceId,
    content: args.content,
  });

  if (args.projectId) {
    const projectNodeId = await ensureProjectGraphNode(ctx, {
      workspaceId: args.workspaceId,
      projectId: args.projectId,
    });
    await ensureEdge(ctx, {
      workspaceId: args.workspaceId,
      fromNodeId: nodeId,
      toNodeId: projectNodeId,
      relationType: "about",
      source: "agent",
      confidence: 1.0,
    });
  } else if (args.entityType === "context" || args.entityType === "persona") {
    const workspaceNodeId = await ensureWorkspaceGraphNode(ctx, {
      workspaceId: args.workspaceId,
    });
    await ensureEdge(ctx, {
      workspaceId: args.workspaceId,
      fromNodeId: nodeId,
      toNodeId: workspaceNodeId,
      relationType: "informs_workspace",
      source: "agent",
      confidence: 1.0,
    });
  }

  return nodeId;
}
