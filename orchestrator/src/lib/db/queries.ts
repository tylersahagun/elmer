import { db } from "./index";
import { 
  workspaces, 
  projects, 
  projectStages, 
  documents, 
  prototypes, 
  jobs,
  memoryEntries,
  tickets,
  juryEvaluations,
  columnConfigs,
  type ProjectStage as ProjectStageType,
  type JobType,
  type JobStatus,
  type DocumentType,
  type PrototypeType,
} from "./schema";
import { eq, and, desc, asc, isNull } from "drizzle-orm";
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
  const defaultStages: { stage: ProjectStageType; name: string; color: string; autoJobs?: JobType[] }[] = [
    { stage: "inbox", name: "Inbox", color: "slate" },
    { stage: "discovery", name: "Discovery", color: "teal", autoJobs: ["analyze_transcript"] },
    { stage: "prd", name: "PRD", color: "purple", autoJobs: ["generate_prd", "generate_design_brief"] },
    { stage: "design", name: "Design", color: "blue", autoJobs: ["generate_engineering_spec"] },
    { stage: "prototype", name: "Prototype", color: "pink", autoJobs: ["build_prototype"] },
    { stage: "validate", name: "Validate", color: "amber", autoJobs: ["run_jury_evaluation"] },
    { stage: "tickets", name: "Tickets", color: "orange", autoJobs: ["generate_tickets", "validate_tickets"] },
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
      humanInLoop: ["prd", "prototype", "validate"].includes(s.stage),
    });
  }

  return getWorkspace(id);
}

// ============================================
// PROJECT QUERIES
// ============================================

export async function getProjects(workspaceId: string) {
  return db.query.projects.findMany({
    where: eq(projects.workspaceId, workspaceId),
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

// ============================================
// MEMORY QUERIES
// ============================================

export async function storeMemory(data: {
  workspaceId: string;
  projectId?: string;
  type: "decision" | "feedback" | "context" | "artifact" | "conversation";
  content: string;
  metadata?: Record<string, unknown>;
  embedding?: Buffer;
}) {
  const id = uuid();
  
  await db.insert(memoryEntries).values({
    id,
    workspaceId: data.workspaceId,
    projectId: data.projectId,
    type: data.type,
    content: data.content,
    metadata: data.metadata,
    embedding: data.embedding,
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
