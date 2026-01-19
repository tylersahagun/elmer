import { db } from "./index";
import { 
  workspaces, 
  projects, 
  projectStages, 
  documents, 
  prototypes, 
  jobs,
  jobRuns,
  memoryEntries,
  tickets,
  juryEvaluations,
  columnConfigs,
  knowledgebaseEntries,
  knowledgeSources,
  prototypeVersions,
  notifications,
  type ProjectStage as ProjectStageType,
  type JobType,
  type JobStatus,
  type DocumentType,
  type PrototypeType,
  type NotificationType,
  type NotificationPriority,
  type NotificationStatus,
  type WorkspaceSettings,
  type NotificationMetadata,
  type KnowledgebaseType,
} from "./schema";
import { eq, and, desc, asc, isNull, ne, or, lt, gte } from "drizzle-orm";
import { v4 as uuid } from "uuid";

// ============================================
// WORKSPACE QUERIES
// ============================================

export async function getWorkspaces() {
  return db.query.workspaces.findMany({
    orderBy: [desc(workspaces.updatedAt)],
  });
}

export async function getWorkspace(id: string) {
  return db.query.workspaces.findFirst({
    where: eq(workspaces.id, id),
    with: {
      projects: true,
      columnConfigs: {
        orderBy: [asc(columnConfigs.order)],
      },
    },
  });
}

export async function createWorkspace(data: {
  name: string;
  description?: string;
  githubRepo?: string;
  contextPath?: string;
}) {
  const id = uuid();
  const now = new Date();
  
  await db.insert(workspaces).values({
    id,
    name: data.name,
    description: data.description,
    githubRepo: data.githubRepo,
    contextPath: data.contextPath || "elmer-docs/",
    createdAt: now,
    updatedAt: now,
  });

  // Create default column configs
  // Default column configs for PM workflow
  // PRD stage generates all 4 documents: PRD, Design Brief, Engineering Spec, GTM Brief
  const defaultStages: { stage: ProjectStageType; name: string; color: string; autoJobs?: JobType[]; requiredDocuments?: DocumentType[] }[] = [
    { stage: "inbox", name: "Inbox", color: "slate" },
    { stage: "discovery", name: "Discovery", color: "teal", autoJobs: ["analyze_transcript"] },
    { stage: "prd", name: "PRD", color: "purple", autoJobs: ["generate_prd", "generate_design_brief", "generate_engineering_spec", "generate_gtm_brief"], requiredDocuments: ["research"] },
    { stage: "design", name: "Design", color: "blue", requiredDocuments: ["prd", "design_brief", "engineering_spec"] },
    { stage: "prototype", name: "Prototype", color: "pink", autoJobs: ["build_prototype", "deploy_chromatic"], requiredDocuments: ["prd"] },
    { stage: "validate", name: "Validate", color: "amber", autoJobs: ["run_jury_evaluation"], requiredDocuments: ["prototype_notes"] },
    { stage: "tickets", name: "Tickets", color: "orange", autoJobs: ["generate_tickets", "validate_tickets"], requiredDocuments: ["engineering_spec"] },
    { stage: "build", name: "Build", color: "green" },
    { stage: "alpha", name: "Alpha", color: "cyan" },
    { stage: "beta", name: "Beta", color: "indigo" },
    { stage: "ga", name: "GA", color: "emerald" },
  ];

  for (let i = 0; i < defaultStages.length; i++) {
    const s = defaultStages[i];
    await db.insert(columnConfigs).values({
      id: uuid(),
      workspaceId: id,
      stage: s.stage,
      displayName: s.name,
      order: i,
      color: s.color,
      autoTriggerJobs: s.autoJobs || [],
      requiredDocuments: s.requiredDocuments || [],
      humanInLoop: ["prd", "prototype", "validate"].includes(s.stage),
    });
  }

  return getWorkspace(id);
}

export async function updateWorkspace(
  id: string,
  data: {
    name?: string;
    description?: string;
    githubRepo?: string;
    contextPath?: string;
    settings?: WorkspaceSettings;
  }
) {
  const now = new Date();

  await db.update(workspaces)
    .set({
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.githubRepo !== undefined && { githubRepo: data.githubRepo }),
      ...(data.contextPath !== undefined && { contextPath: data.contextPath }),
      ...(data.settings !== undefined && { settings: data.settings }),
      updatedAt: now,
    })
    .where(eq(workspaces.id, id));

  return getWorkspace(id);
}

// ============================================
// PROJECT QUERIES
// ============================================

export async function getProjects(
  workspaceId: string,
  options: { includeArchived?: boolean } = {}
) {
  const includeArchived = options.includeArchived === true;
  const whereClause = includeArchived
    ? eq(projects.workspaceId, workspaceId)
    : and(
        eq(projects.workspaceId, workspaceId),
        ne(projects.status, "archived")
      );
  return db.query.projects.findMany({
    where: whereClause,
    orderBy: [desc(projects.updatedAt)],
    with: {
      documents: true,
      prototypes: true,
    },
  });
}

export async function getProjectsByStage(workspaceId: string) {
  const allProjects = await getProjects(workspaceId);
  
  const byStage: Record<ProjectStageType, typeof allProjects> = {
    inbox: [],
    discovery: [],
    prd: [],
    design: [],
    prototype: [],
    validate: [],
    tickets: [],
    build: [],
    alpha: [],
    beta: [],
    ga: [],
  };

  for (const project of allProjects) {
    byStage[project.stage].push(project);
  }

  return byStage;
}

export async function getProject(id: string) {
  return db.query.projects.findFirst({
    where: eq(projects.id, id),
    with: {
      workspace: true,
      documents: {
        orderBy: [desc(documents.updatedAt)],
      },
      prototypes: {
        orderBy: [desc(prototypes.updatedAt)],
      },
      stages: {
        orderBy: [desc(projectStages.enteredAt)],
      },
      tickets: true,
      juryEvaluations: {
        orderBy: [desc(juryEvaluations.createdAt)],
      },
    },
  });
}

export async function createProject(data: {
  workspaceId: string;
  name: string;
  description?: string;
  stage?: ProjectStageType;
  metadata?: Record<string, unknown>;
}) {
  const id = uuid();
  const now = new Date();
  const stage = data.stage || "inbox";

  await db.insert(projects).values({
    id,
    workspaceId: data.workspaceId,
    name: data.name,
    description: data.description,
    stage,
    metadata: data.metadata,
    createdAt: now,
    updatedAt: now,
  });

  // Record initial stage
  await db.insert(projectStages).values({
    id: uuid(),
    projectId: id,
    stage,
    enteredAt: now,
    triggeredBy: "user",
  });

  return getProject(id);
}

export async function updateProjectMetadata(
  projectId: string,
  metadata: Record<string, unknown>
) {
  const now = new Date();
  await db.update(projects)
    .set({ metadata, updatedAt: now })
    .where(eq(projects.id, projectId));
  return getProject(projectId);
}

export async function updateProjectStage(
  projectId: string, 
  newStage: ProjectStageType,
  triggeredBy: string = "user"
) {
  const now = new Date();
  const project = await getProject(projectId);
  
  if (!project) throw new Error("Project not found");
  if (project.stage === newStage) return project;

  // Close current stage
  const currentStageRecord = project.stages.find(s => !s.exitedAt);
  if (currentStageRecord) {
    await db.update(projectStages)
      .set({ exitedAt: now })
      .where(eq(projectStages.id, currentStageRecord.id));
  }

  // Update project
  await db.update(projects)
    .set({ stage: newStage, updatedAt: now })
    .where(eq(projects.id, projectId));

  // Create new stage record
  await db.insert(projectStages).values({
    id: uuid(),
    projectId,
    stage: newStage,
    enteredAt: now,
    triggeredBy,
  });

  return getProject(projectId);
}

export async function updateProjectStatus(
  projectId: string,
  newStatus: "active" | "paused" | "completed" | "archived"
) {
  const now = new Date();
  
  await db.update(projects)
    .set({ status: newStatus, updatedAt: now })
    .where(eq(projects.id, projectId));

  return getProject(projectId);
}

export async function deleteProject(projectId: string) {
  await db.delete(projects).where(eq(projects.id, projectId));
  return { id: projectId };
}

// ============================================
// DOCUMENT QUERIES
// ============================================

export async function getDocuments(projectId: string) {
  return db.query.documents.findMany({
    where: eq(documents.projectId, projectId),
    orderBy: [desc(documents.updatedAt)],
  });
}

export async function getDocument(id: string) {
  return db.query.documents.findFirst({
    where: eq(documents.id, id),
  });
}

export async function getDocumentByType(projectId: string, type: DocumentType) {
  return db.query.documents.findFirst({
    where: and(
      eq(documents.projectId, projectId),
      eq(documents.type, type)
    ),
    orderBy: [desc(documents.version)],
  });
}

export async function createDocument(data: {
  projectId: string;
  type: DocumentType;
  title: string;
  content: string;
  filePath?: string;
  metadata?: Record<string, unknown>;
}) {
  const id = uuid();
  const now = new Date();

  // Get current version
  const existing = await getDocumentByType(data.projectId, data.type);
  const version = existing ? existing.version + 1 : 1;

  await db.insert(documents).values({
    id,
    projectId: data.projectId,
    type: data.type,
    title: data.title,
    content: data.content,
    version,
    filePath: data.filePath,
    metadata: data.metadata,
    createdAt: now,
    updatedAt: now,
  });

  return getDocument(id);
}

// ============================================
// JOB QUERIES
// ============================================

export async function getJobs(workspaceId: string, status?: JobStatus) {
  if (status) {
    return db.query.jobs.findMany({
      where: and(
        eq(jobs.workspaceId, workspaceId),
        eq(jobs.status, status)
      ),
      orderBy: [desc(jobs.createdAt)],
    });
  }
  
  return db.query.jobs.findMany({
    where: eq(jobs.workspaceId, workspaceId),
    orderBy: [desc(jobs.createdAt)],
  });
}

export async function getProjectJobs(projectId: string) {
  return db.query.jobs.findMany({
    where: eq(jobs.projectId, projectId),
    orderBy: [desc(jobs.createdAt)],
  });
}

export async function createJob(data: {
  workspaceId: string;
  projectId?: string;
  type: JobType;
  input?: Record<string, unknown>;
}) {
  const id = uuid();
  const now = new Date();

  await db.insert(jobs).values({
    id,
    workspaceId: data.workspaceId,
    projectId: data.projectId,
    type: data.type,
    status: "pending",
    input: data.input,
    createdAt: now,
  });

  return db.query.jobs.findFirst({ where: eq(jobs.id, id) });
}

export async function updateJobStatus(
  jobId: string, 
  status: JobStatus, 
  data?: { output?: Record<string, unknown>; error?: string; progress?: number }
) {
  const now = new Date();
  
  await db.update(jobs)
    .set({
      status,
      ...(status === "running" && { startedAt: now }),
      ...(["completed", "failed", "cancelled"].includes(status) && { completedAt: now }),
      ...(data?.output && { output: data.output }),
      ...(data?.error && { error: data.error }),
      ...(data?.progress !== undefined && { progress: data.progress }),
    })
    .where(eq(jobs.id, jobId));

  return db.query.jobs.findFirst({ where: eq(jobs.id, jobId) });
}

export async function createJobRun(data: {
  jobId: string;
  status: JobStatus;
  attempt: number;
  error?: string | null;
}) {
  const id = uuid();
  const now = new Date();

  await db.insert(jobRuns).values({
    id,
    jobId: data.jobId,
    status: data.status,
    attempt: data.attempt,
    startedAt: now,
    completedAt: ["completed", "failed", "cancelled"].includes(data.status) ? now : null,
    error: data.error || null,
  });

  return db.query.jobRuns.findFirst({ where: eq(jobRuns.id, id) });
}

export async function updateJobRunStatus(
  jobRunId: string,
  status: JobStatus,
  error?: string | null
) {
  const now = new Date();
  await db.update(jobRuns)
    .set({
      status,
      completedAt: ["completed", "failed", "cancelled"].includes(status) ? now : null,
      error: error || null,
    })
    .where(eq(jobRuns.id, jobRunId));

  return db.query.jobRuns.findFirst({ where: eq(jobRuns.id, jobRunId) });
}

export async function cancelProjectJobs(projectId: string) {
  const now = new Date();
  
  // Find all pending or running jobs for this project
  const activeJobs = await db.query.jobs.findMany({
    where: and(
      eq(jobs.projectId, projectId),
      or(
        eq(jobs.status, "pending"),
        eq(jobs.status, "running")
      )
    ),
  });
  
  // Cancel each active job
  for (const job of activeJobs) {
    await db.update(jobs)
      .set({
        status: "cancelled",
        completedAt: now,
        error: "Cancelled by user",
      })
      .where(eq(jobs.id, job.id));
  }
  
  return activeJobs.length;
}

// ============================================
// PROTOTYPE QUERIES
// ============================================

export async function createPrototype(data: {
  projectId: string;
  type: PrototypeType;
  name: string;
  storybookPath?: string;
}) {
  const id = uuid();
  const now = new Date();

  // Get current version
  const existing = await db.query.prototypes.findFirst({
    where: and(
      eq(prototypes.projectId, data.projectId),
      eq(prototypes.type, data.type)
    ),
    orderBy: [desc(prototypes.version)],
  });
  const version = existing ? existing.version + 1 : 1;

  await db.insert(prototypes).values({
    id,
    projectId: data.projectId,
    type: data.type,
    name: data.name,
    storybookPath: data.storybookPath,
    version,
    status: "building",
    createdAt: now,
    updatedAt: now,
  });

  return db.query.prototypes.findFirst({ where: eq(prototypes.id, id) });
}

export async function updatePrototype(
  id: string,
  data: {
    status?: "building" | "ready" | "failed";
    chromaticUrl?: string;
    chromaticBuildId?: string;
    storybookPath?: string;
    metadata?: Record<string, unknown>;
  }
) {
  await db.update(prototypes)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(prototypes.id, id));

  return db.query.prototypes.findFirst({ where: eq(prototypes.id, id) });
}

export async function createPrototypeVersion(data: {
  prototypeId: string;
  storybookPath?: string;
  chromaticUrl?: string;
  metadata?: Record<string, unknown>;
}) {
  const id = uuid();
  const now = new Date();

  await db.insert(prototypeVersions).values({
    id,
    prototypeId: data.prototypeId,
    storybookPath: data.storybookPath,
    chromaticUrl: data.chromaticUrl,
    metadata: data.metadata,
    createdAt: now,
  });

  return db.query.prototypeVersions.findFirst({ where: eq(prototypeVersions.id, id) });
}

// ============================================
// MEMORY QUERIES
// ============================================

export async function storeMemory(data: {
  workspaceId: string;
  projectId?: string;
  type: "decision" | "feedback" | "context" | "artifact" | "conversation";
  content: string;
  metadata?: Record<string, unknown>;
  embedding?: Buffer | string;
}) {
  const id = uuid();
  
  // Convert Buffer to base64 string for Postgres text storage
  const embeddingStr: string | undefined = data.embedding instanceof Buffer 
    ? data.embedding.toString("base64") 
    : (typeof data.embedding === "string" ? data.embedding : undefined);
  
  await db.insert(memoryEntries).values({
    id,
    workspaceId: data.workspaceId,
    projectId: data.projectId,
    type: data.type,
    content: data.content,
    metadata: data.metadata,
    embedding: embeddingStr,
    createdAt: new Date(),
  });

  return db.query.memoryEntries.findFirst({ where: eq(memoryEntries.id, id) });
}

export async function getProjectMemory(projectId: string) {
  return db.query.memoryEntries.findMany({
    where: eq(memoryEntries.projectId, projectId),
    orderBy: [desc(memoryEntries.createdAt)],
  });
}

// ============================================
// JURY EVALUATION QUERIES
// ============================================

export async function createJuryEvaluation(data: {
  projectId: string;
  phase: "research" | "prd" | "prototype";
  jurySize: number;
  approvalRate: number;
  conditionalRate: number;
  rejectionRate: number;
  verdict: "pass" | "fail" | "conditional";
  topConcerns?: string[];
  topSuggestions?: string[];
  rawResults?: Record<string, unknown>;
  reportPath?: string;
}) {
  const id = uuid();
  
  await db.insert(juryEvaluations).values({
    id,
    ...data,
    createdAt: new Date(),
  });

  return db.query.juryEvaluations.findFirst({ where: eq(juryEvaluations.id, id) });
}

// ============================================
// COLUMN CONFIG QUERIES
// ============================================

export async function getColumnConfigs(workspaceId: string) {
  return db.query.columnConfigs.findMany({
    where: eq(columnConfigs.workspaceId, workspaceId),
    orderBy: [asc(columnConfigs.order)],
  });
}

export async function createColumnConfig(data: {
  workspaceId: string;
  stage: ProjectStageType;
  displayName: string;
  order: number;
  color?: string;
  autoTriggerJobs?: JobType[];
  requiredDocuments?: DocumentType[];
  requiredApprovals?: number;
  aiIterations?: number;
  rules?: Record<string, unknown>;
  humanInLoop?: boolean;
  enabled?: boolean;
}) {
  const id = uuid();
  await db.insert(columnConfigs).values({
    id,
    workspaceId: data.workspaceId,
    stage: data.stage,
    displayName: data.displayName,
    order: data.order,
    color: data.color,
    autoTriggerJobs: data.autoTriggerJobs || [],
    requiredDocuments: data.requiredDocuments || [],
    requiredApprovals: data.requiredApprovals || 0,
    aiIterations: data.aiIterations || 0,
    rules: data.rules || {},
    humanInLoop: data.humanInLoop || false,
    enabled: data.enabled ?? true,
  });

  return db.query.columnConfigs.findFirst({ where: eq(columnConfigs.id, id) });
}

export async function updateColumnConfig(
  id: string,
  data: Partial<{
    displayName: string;
    order: number;
    color: string;
    autoTriggerJobs: JobType[];
    requiredDocuments: DocumentType[];
    requiredApprovals: number;
    aiIterations: number;
    rules: Record<string, unknown>;
    humanInLoop: boolean;
    enabled: boolean;
  }>
) {
  await db.update(columnConfigs)
    .set(data)
    .where(eq(columnConfigs.id, id));

  return db.query.columnConfigs.findFirst({ where: eq(columnConfigs.id, id) });
}

export async function deleteColumnConfig(id: string) {
  await db.delete(columnConfigs).where(eq(columnConfigs.id, id));
  return true;
}

export async function reorderColumnConfigs(workspaceId: string, orderedIds: string[]) {
  for (let i = 0; i < orderedIds.length; i++) {
    await db.update(columnConfigs)
      .set({ order: i })
      .where(and(eq(columnConfigs.id, orderedIds[i]), eq(columnConfigs.workspaceId, workspaceId)));
  }
  return getColumnConfigs(workspaceId);
}

// ============================================
// KNOWLEDGEBASE QUERIES
// ============================================

export async function getKnowledgebaseEntries(workspaceId: string) {
  return db.query.knowledgebaseEntries.findMany({
    where: eq(knowledgebaseEntries.workspaceId, workspaceId),
    orderBy: [asc(knowledgebaseEntries.updatedAt)],
  });
}

export async function getKnowledgebaseEntryByType(workspaceId: string, type: KnowledgebaseType) {
  return db.query.knowledgebaseEntries.findFirst({
    where: and(eq(knowledgebaseEntries.workspaceId, workspaceId), eq(knowledgebaseEntries.type, type)),
  });
}

export async function upsertKnowledgebaseEntry(data: {
  workspaceId: string;
  type: KnowledgebaseType;
  title: string;
  content: string;
  filePath?: string;
}) {
  const existing = await getKnowledgebaseEntryByType(data.workspaceId, data.type);
  const now = new Date();

  if (existing) {
    await db.update(knowledgebaseEntries)
      .set({
        title: data.title,
        content: data.content,
        filePath: data.filePath,
        updatedAt: now,
      })
      .where(eq(knowledgebaseEntries.id, existing.id));

    return db.query.knowledgebaseEntries.findFirst({ where: eq(knowledgebaseEntries.id, existing.id) });
  }

  const id = uuid();
  await db.insert(knowledgebaseEntries).values({
    id,
    workspaceId: data.workspaceId,
    type: data.type,
    title: data.title,
    content: data.content,
    filePath: data.filePath,
    createdAt: now,
    updatedAt: now,
  });

  return db.query.knowledgebaseEntries.findFirst({ where: eq(knowledgebaseEntries.id, id) });
}

// ============================================
// KNOWLEDGE SOURCES
// ============================================

export async function getKnowledgeSources(workspaceId: string) {
  return db.query.knowledgeSources.findMany({
    where: eq(knowledgeSources.workspaceId, workspaceId),
    orderBy: [desc(knowledgeSources.createdAt)],
  });
}

export async function createKnowledgeSource(data: {
  workspaceId: string;
  type: string;
  config?: Record<string, unknown>;
}) {
  const id = uuid();
  const now = new Date();
  await db.insert(knowledgeSources).values({
    id,
    workspaceId: data.workspaceId,
    type: data.type,
    config: data.config,
    createdAt: now,
  });
  return db.query.knowledgeSources.findFirst({ where: eq(knowledgeSources.id, id) });
}

export async function updateKnowledgeSource(id: string, data: {
  config?: Record<string, unknown>;
  lastSyncedAt?: Date | null;
}) {
  await db.update(knowledgeSources)
    .set({
      ...(data.config !== undefined && { config: data.config }),
      ...(data.lastSyncedAt !== undefined && { lastSyncedAt: data.lastSyncedAt }),
    })
    .where(eq(knowledgeSources.id, id));

  return db.query.knowledgeSources.findFirst({ where: eq(knowledgeSources.id, id) });
}

export async function deleteKnowledgeSource(id: string) {
  await db.delete(knowledgeSources).where(eq(knowledgeSources.id, id));
  return true;
}

// ============================================
// TICKET QUERIES
// ============================================

export async function getTickets(projectId: string) {
  return db.query.tickets.findMany({
    where: eq(tickets.projectId, projectId),
    orderBy: [desc(tickets.updatedAt)],
  });
}

export async function createTickets(projectId: string, items: Array<{
  title: string;
  description?: string;
  priority?: number;
  estimatedPoints?: number;
  metadata?: Record<string, unknown>;
}>) {
  const now = new Date();
  const ticketIds: string[] = [];

  for (const item of items) {
    const id = uuid();
    await db.insert(tickets).values({
      id,
      projectId,
      title: item.title,
      description: item.description,
      priority: item.priority,
      estimatedPoints: item.estimatedPoints,
      metadata: item.metadata,
      createdAt: now,
      updatedAt: now,
    });
    ticketIds.push(id);
  }

  return db.query.tickets.findMany({
    where: eq(tickets.projectId, projectId),
    orderBy: [desc(tickets.updatedAt)],
  });
}

// ============================================
// NOTIFICATION QUERIES
// ============================================

export async function getNotifications(
  workspaceId: string,
  options: {
    status?: NotificationStatus | NotificationStatus[];
    type?: NotificationType | NotificationType[];
    limit?: number;
    includeExpired?: boolean;
  } = {}
) {
  const { status, type, limit = 50, includeExpired = false } = options;
  const now = new Date();
  
  // Build conditions
  const conditions = [eq(notifications.workspaceId, workspaceId)];
  
  if (status) {
    if (Array.isArray(status)) {
      conditions.push(or(...status.map(s => eq(notifications.status, s)))!);
    } else {
      conditions.push(eq(notifications.status, status));
    }
  }
  
  if (type) {
    if (Array.isArray(type)) {
      conditions.push(or(...type.map(t => eq(notifications.type, t)))!);
    } else {
      conditions.push(eq(notifications.type, type));
    }
  }
  
  if (!includeExpired) {
    conditions.push(
      or(
        isNull(notifications.expiresAt),
        gte(notifications.expiresAt, now)
      )!
    );
  }
  
  const results = await db.query.notifications.findMany({
    where: and(...conditions),
    orderBy: [desc(notifications.createdAt)],
    limit,
    with: {
      project: true,
      job: true,
    },
  });
  
  return results;
}

export async function getNotification(id: string) {
  return db.query.notifications.findFirst({
    where: eq(notifications.id, id),
    with: {
      project: true,
      job: true,
    },
  });
}

export async function getUnreadNotificationCount(workspaceId: string) {
  const now = new Date();
  const results = await db.query.notifications.findMany({
    where: and(
      eq(notifications.workspaceId, workspaceId),
      eq(notifications.status, "unread"),
      or(
        isNull(notifications.expiresAt),
        gte(notifications.expiresAt, now)
      )
    ),
  });
  return results.length;
}

export async function createNotification(data: {
  workspaceId: string;
  projectId?: string;
  jobId?: string;
  type: NotificationType;
  priority?: NotificationPriority;
  title: string;
  message: string;
  actionType?: string;
  actionLabel?: string;
  actionUrl?: string;
  actionData?: Record<string, unknown>;
  metadata?: NotificationMetadata;
  expiresAt?: Date;
}) {
  const id = uuid();
  const now = new Date();
  
  await db.insert(notifications).values({
    id,
    workspaceId: data.workspaceId,
    projectId: data.projectId,
    jobId: data.jobId,
    type: data.type,
    priority: data.priority || "medium",
    status: "unread",
    title: data.title,
    message: data.message,
    actionType: data.actionType,
    actionLabel: data.actionLabel,
    actionUrl: data.actionUrl,
    actionData: data.actionData,
    metadata: data.metadata,
    createdAt: now,
    expiresAt: data.expiresAt,
  });
  
  return getNotification(id);
}

export async function updateNotificationStatus(
  id: string,
  status: NotificationStatus
) {
  const now = new Date();
  
  await db.update(notifications)
    .set({
      status,
      ...(status === "read" && { readAt: now }),
      ...(status === "actioned" && { actionedAt: now, readAt: now }),
    })
    .where(eq(notifications.id, id));
  
  return getNotification(id);
}

export async function markAllNotificationsRead(workspaceId: string) {
  const now = new Date();
  
  await db.update(notifications)
    .set({
      status: "read",
      readAt: now,
    })
    .where(
      and(
        eq(notifications.workspaceId, workspaceId),
        eq(notifications.status, "unread")
      )
    );
  
  return { success: true };
}

export async function dismissNotification(id: string) {
  const now = new Date();
  
  await db.update(notifications)
    .set({
      status: "dismissed",
      readAt: now,
    })
    .where(eq(notifications.id, id));
  
  return { success: true };
}

export async function deleteNotification(id: string) {
  await db.delete(notifications).where(eq(notifications.id, id));
  return { success: true };
}

export async function cleanupExpiredNotifications(workspaceId: string) {
  const now = new Date();
  
  await db.delete(notifications).where(
    and(
      eq(notifications.workspaceId, workspaceId),
      lt(notifications.expiresAt, now)
    )
  );
  
  return { success: true };
}

// Helper to create job-related notifications
export async function createJobNotification(
  job: {
    id: string;
    workspaceId: string;
    projectId: string | null;
    type: JobType;
    status: JobStatus;
    error?: string | null;
  },
  projectName?: string
) {
  const jobTypeLabels: Record<JobType, string> = {
    generate_prd: "PRD Generation",
    generate_design_brief: "Design Brief Generation",
    generate_engineering_spec: "Engineering Spec Generation",
    generate_gtm_brief: "GTM Brief Generation",
    analyze_transcript: "Transcript Analysis",
    run_jury_evaluation: "Jury Evaluation",
    build_prototype: "Prototype Build",
    iterate_prototype: "Prototype Iteration",
    generate_tickets: "Ticket Generation",
    validate_tickets: "Ticket Validation",
    score_stage_alignment: "Alignment Scoring",
    deploy_chromatic: "Chromatic Deployment",
    create_feature_branch: "Branch Creation",
  };
  
  const label = jobTypeLabels[job.type] || job.type;
  
  if (job.status === "failed") {
    return createNotification({
      workspaceId: job.workspaceId,
      projectId: job.projectId || undefined,
      jobId: job.id,
      type: "job_failed",
      priority: "high",
      title: `${label} Failed`,
      message: job.error || `The ${label.toLowerCase()} job failed. Click to view details and retry.`,
      actionType: "retry",
      actionLabel: "Retry Job",
      actionUrl: job.projectId ? `/workspace/${job.workspaceId}?project=${job.projectId}` : undefined,
      actionData: { jobId: job.id, jobType: job.type },
      metadata: {
        errorDetails: job.error || undefined,
        relatedEntity: projectName ? {
          type: "document",
          id: job.projectId || "",
          name: projectName,
        } : undefined,
      },
    });
  }
  
  if (job.status === "completed") {
    return createNotification({
      workspaceId: job.workspaceId,
      projectId: job.projectId || undefined,
      jobId: job.id,
      type: "job_completed",
      priority: "low",
      title: `${label} Complete`,
      message: projectName 
        ? `${label} completed for "${projectName}".`
        : `${label} completed successfully.`,
      actionType: "navigate",
      actionLabel: "View Result",
      actionUrl: job.projectId ? `/workspace/${job.workspaceId}?project=${job.projectId}` : undefined,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Expires in 24 hours
    });
  }
  
  return null;
}
