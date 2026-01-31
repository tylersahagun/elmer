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
  agentDefinitions,
  pendingQuestions,
  agentExecutions,
  prototypeVersions,
  notifications,
  workspaceMembers,
  activityLogs,
  users,
  signals,
  signalProjects,
  signalPersonas,
  projectCommits,
  type ProjectStage as ProjectStageType,
  type JobType,
  type JobStatus,
  type DocumentType,
  type AgentDefinitionType,
  type PrototypeType,
  type NotificationType,
  type NotificationPriority,
  type NotificationStatus,
  type WorkspaceSettings,
  type NotificationMetadata,
  type KnowledgebaseType,
  type WorkspaceRole,
  type SignalStatus,
  type SignalSource,
  type SignalSeverity,
  type SignalFrequency,
  type SignalSourceMetadata,
  type SignalClassificationResult,
  type SignalAutomationSettings,
  DEFAULT_SIGNAL_AUTOMATION,
  type MaintenanceSettings,
  DEFAULT_MAINTENANCE_SETTINGS,
  type GraduationCriteria,
  type OnboardingData,
} from "./schema";
import { calculateStageQuality } from "@/lib/graduation/criteria-service";
import {
  eq,
  and,
  desc,
  asc,
  isNull,
  isNotNull,
  ne,
  or,
  lt,
  gte,
  lte,
  ilike,
  sql,
  inArray,
} from "drizzle-orm";
import { v4 as uuid } from "uuid";

// ============================================
// WORKSPACE QUERIES
// ============================================

export async function getWorkspaces() {
  return db.query.workspaces.findMany({
    orderBy: [desc(workspaces.updatedAt)],
  });
}

/**
 * Get workspaces for a specific user (only workspaces they are a member of)
 */
export async function getWorkspacesForUser(userId: string) {
  const memberships = await db.query.workspaceMembers.findMany({
    where: eq(workspaceMembers.userId, userId),
    with: {
      workspace: true,
    },
    orderBy: [desc(workspaceMembers.joinedAt)],
  });

  return memberships.map((m) => ({
    ...m.workspace,
    role: m.role,
    joinedAt: m.joinedAt,
  }));
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

/**
 * Get all members of a workspace with user details
 */
export async function getWorkspaceMembers(workspaceId: string) {
  const members = await db.query.workspaceMembers.findMany({
    where: eq(workspaceMembers.workspaceId, workspaceId),
    with: {
      user: true,
    },
    orderBy: [desc(workspaceMembers.role), asc(workspaceMembers.joinedAt)],
  });

  return members.map((m) => ({
    id: m.id,
    userId: m.userId,
    role: m.role,
    joinedAt: m.joinedAt,
    user: {
      id: m.user.id,
      name: m.user.name,
      email: m.user.email,
      image: m.user.image,
    },
  }));
}

/**
 * Check if a user is a member of a workspace and get their role
 */
export async function getWorkspaceMembership(
  workspaceId: string,
  userId: string,
) {
  return db.query.workspaceMembers.findFirst({
    where: and(
      eq(workspaceMembers.workspaceId, workspaceId),
      eq(workspaceMembers.userId, userId),
    ),
  });
}

const defaultColumnStages: Array<{
  stage: ProjectStageType;
  name: string;
  color: string;
  autoJobs?: JobType[];
  requiredDocuments?: DocumentType[];
}> = [
  { stage: "inbox", name: "Inbox", color: "slate" },
  {
    stage: "discovery",
    name: "Discovery",
    color: "teal",
    autoJobs: ["analyze_transcript"],
  },
  {
    stage: "prd",
    name: "PRD",
    color: "purple",
    autoJobs: [
      "generate_prd",
      "generate_design_brief",
      "generate_engineering_spec",
      "generate_gtm_brief",
    ],
    requiredDocuments: ["research"],
  },
  {
    stage: "design",
    name: "Design",
    color: "blue",
    requiredDocuments: ["prd", "design_brief", "engineering_spec"],
  },
  {
    stage: "prototype",
    name: "Prototype",
    color: "pink",
    autoJobs: ["build_prototype", "deploy_chromatic"],
    requiredDocuments: ["prd"],
  },
  {
    stage: "validate",
    name: "Validate",
    color: "amber",
    autoJobs: ["run_jury_evaluation"],
    requiredDocuments: ["prototype_notes"],
  },
  {
    stage: "tickets",
    name: "Tickets",
    color: "orange",
    autoJobs: ["generate_tickets", "validate_tickets"],
    requiredDocuments: ["engineering_spec"],
  },
  { stage: "build", name: "Build", color: "green" },
  { stage: "alpha", name: "Alpha", color: "cyan" },
  { stage: "beta", name: "Beta", color: "indigo" },
  { stage: "ga", name: "GA", color: "emerald" },
];

export async function ensureDefaultColumnConfigs(workspaceId: string) {
  const existing = await db
    .select({ count: sql<number>`count(*)` })
    .from(columnConfigs)
    .where(eq(columnConfigs.workspaceId, workspaceId));
  const existingCount = Number(existing[0]?.count || 0);
  if (existingCount > 0) {
    return { created: 0, existing: existingCount };
  }

  for (let i = 0; i < defaultColumnStages.length; i++) {
    const s = defaultColumnStages[i];
    await db.insert(columnConfigs).values({
      id: uuid(),
      workspaceId,
      stage: s.stage,
      displayName: s.name,
      order: i,
      color: s.color,
      autoTriggerJobs: s.autoJobs || [],
      requiredDocuments: s.requiredDocuments || [],
      humanInLoop: ["prd", "prototype", "validate"].includes(s.stage),
    });
  }

  return { created: defaultColumnStages.length, existing: 0 };
}

export async function createWorkspace(data: {
  name: string;
  description?: string;
  githubRepo?: string;
  contextPath?: string;
  userId?: string; // Creator's user ID - if provided, they become admin
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

  // Add creator as admin member if userId provided
  if (data.userId) {
    await db.insert(workspaceMembers).values({
      workspaceId: id,
      userId: data.userId,
      role: "admin",
    });
  }

  await ensureDefaultColumnConfigs(id);

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
    onboardingCompletedAt?: Date;
    onboardingData?: OnboardingData;
  },
) {
  const now = new Date();

  await db
    .update(workspaces)
    .set({
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.githubRepo !== undefined && { githubRepo: data.githubRepo }),
      ...(data.contextPath !== undefined && { contextPath: data.contextPath }),
      ...(data.settings !== undefined && { settings: data.settings }),
      ...(data.onboardingCompletedAt !== undefined && {
        onboardingCompletedAt: data.onboardingCompletedAt,
      }),
      ...(data.onboardingData !== undefined && {
        onboardingData: data.onboardingData,
      }),
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
  options: { includeArchived?: boolean } = {},
) {
  const includeArchived = options.includeArchived === true;
  const whereClause = includeArchived
    ? eq(projects.workspaceId, workspaceId)
    : and(
        eq(projects.workspaceId, workspaceId),
        ne(projects.status, "archived"),
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

/**
 * Get projects with signal/document/prototype counts for kanban display.
 * More efficient than fetching full relations when only counts are needed.
 */
export async function getProjectsWithCounts(
  workspaceId: string,
  options: { includeArchived?: boolean } = {},
) {
  const projectList = await getProjects(workspaceId, options);
  if (projectList.length === 0) {
    return [];
  }

  const projectIds = projectList.map((project) => project.id);

  // Get signal counts for all projects in one query
  const signalCounts = await db
    .select({
      projectId: signalProjects.projectId,
      count: sql<number>`count(*)::int`,
    })
    .from(signalProjects)
    .where(inArray(signalProjects.projectId, projectIds))
    .groupBy(signalProjects.projectId);

  const juryPassCounts = await db
    .select({
      projectId: juryEvaluations.projectId,
      count: sql<number>`count(*)::int`,
    })
    .from(juryEvaluations)
    .where(
      and(
        inArray(juryEvaluations.projectId, projectIds),
        eq(juryEvaluations.verdict, "pass"),
      ),
    )
    .groupBy(juryEvaluations.projectId);

  // Create lookup map
  const countMap = new Map(signalCounts.map((c) => [c.projectId, c.count]));
  const juryPassMap = new Map(
    juryPassCounts.map((c) => [c.projectId, c.count]),
  );

  // Merge counts into projects
  return Promise.all(
    projectList.map(async (project) => {
      const documentCount = project.documents?.length || 0;
      const prototypeCount = project.prototypes?.length || 0;
      const signalCount = countMap.get(project.id) || 0;
      const juryPassCount = juryPassMap.get(project.id) || 0;
      const existingStageQuality = (
        project.metadata as { stageQuality?: Record<string, unknown> } | null
      )?.stageQuality;
      const stageQuality = await calculateStageQuality({
        projectId: project.id,
        stage: project.stage,
        metadata: project.metadata ?? undefined,
        documentCount,
        prototypeCount,
        signalCount,
        juryPassCount,
      });

      return {
        ...project,
        signalCount,
        documentCount,
        prototypeCount,
        metadata: {
          ...(project.metadata ?? {}),
          stageQuality: {
            ...existingStageQuality,
            [project.stage]: stageQuality,
          },
        },
      };
    }),
  );
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
  const project = await db.query.projects.findFirst({
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

  if (!project) return null;

  const signalCount =
    (
      await db
        .select({ count: sql<number>`count(*)::int` })
        .from(signalProjects)
        .where(eq(signalProjects.projectId, id))
    )[0]?.count ?? 0;
  const documentCount = project.documents?.length || 0;
  const prototypeCount = project.prototypes?.length || 0;
  const juryPassCount =
    project.juryEvaluations?.filter(
      (evaluation) => evaluation.verdict === "pass",
    ).length || 0;
  const existingStageQuality = (
    project.metadata as { stageQuality?: Record<string, unknown> } | null
  )?.stageQuality;
  const stageQuality = await calculateStageQuality({
    projectId: project.id,
    stage: project.stage,
    metadata: project.metadata ?? undefined,
    documentCount,
    prototypeCount,
    signalCount,
    juryPassCount,
  });

  return {
    ...project,
    signalCount,
    documentCount,
    prototypeCount,
    metadata: {
      ...(project.metadata ?? {}),
      stageQuality: {
        ...existingStageQuality,
        [project.stage]: stageQuality,
      },
    },
  };
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
  metadata: Record<string, unknown>,
) {
  const now = new Date();
  await db
    .update(projects)
    .set({ metadata, updatedAt: now })
    .where(eq(projects.id, projectId));
  return getProject(projectId);
}

export async function updateProjectStage(
  projectId: string,
  newStage: ProjectStageType,
  triggeredBy: string = "user",
) {
  const now = new Date();
  const project = await getProject(projectId);

  if (!project) throw new Error("Project not found");
  if (project.stage === newStage) return project;

  // Close current stage
  const currentStageRecord = project.stages.find((s) => !s.exitedAt);
  if (currentStageRecord) {
    await db
      .update(projectStages)
      .set({ exitedAt: now })
      .where(eq(projectStages.id, currentStageRecord.id));
  }

  // Update project
  await db
    .update(projects)
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
  newStatus: "active" | "paused" | "completed" | "archived",
) {
  const now = new Date();

  await db
    .update(projects)
    .set({ status: newStatus, updatedAt: now })
    .where(eq(projects.id, projectId));

  return getProject(projectId);
}

export async function deleteProject(projectId: string) {
  await db.delete(projects).where(eq(projects.id, projectId));
  return { id: projectId };
}

/**
 * Upsert a project - update if exists, create if not.
 * Uses deterministic ID for idempotent imports (DISC-09, POPUL-06).
 *
 * This is used by the discovery population engine to allow re-onboarding
 * without creating duplicate projects.
 */
export interface UpsertProjectInput {
  id: string; // Deterministic ID from discovery
  workspaceId: string;
  name: string;
  description?: string | null;
  stage: ProjectStageType;
  metadata?: Record<string, unknown>;
}

export async function upsertProject(input: UpsertProjectInput): Promise<{
  action: "created" | "updated";
  id: string;
}> {
  const { id, workspaceId, name, description, stage, metadata } = input;
  const now = new Date();

  // Check if project exists
  const existing = await db.query.projects.findFirst({
    where: eq(projects.id, id),
  });

  if (existing) {
    // Update existing project - preserve existing metadata, merge with new
    const mergedMetadata = {
      ...existing.metadata,
      ...metadata,
    };

    await db
      .update(projects)
      .set({
        name,
        description,
        stage,
        metadata: mergedMetadata,
        updatedAt: now,
      })
      .where(eq(projects.id, id));

    return { action: "updated", id };
  } else {
    // Create new project
    await db.insert(projects).values({
      id,
      workspaceId,
      name,
      description,
      stage,
      status: "active",
      metadata,
      createdAt: now,
      updatedAt: now,
    });

    // Record initial stage for new projects
    await db.insert(projectStages).values({
      id: uuid(),
      projectId: id,
      stage,
      enteredAt: now,
      triggeredBy: "import",
    });

    return { action: "created", id };
  }
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
    where: and(eq(documents.projectId, projectId), eq(documents.type, type)),
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
      where: and(eq(jobs.workspaceId, workspaceId), eq(jobs.status, status)),
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
    projectId: data.projectId || null, // Convert empty string to null for FK constraint
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
  data?: {
    output?: Record<string, unknown>;
    error?: string;
    progress?: number;
  },
) {
  const now = new Date();

  await db
    .update(jobs)
    .set({
      status,
      ...(status === "running" && { startedAt: now }),
      ...(["completed", "failed", "cancelled"].includes(status) && {
        completedAt: now,
      }),
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
    completedAt: ["completed", "failed", "cancelled"].includes(data.status)
      ? now
      : null,
    error: data.error || null,
  });

  return db.query.jobRuns.findFirst({ where: eq(jobRuns.id, id) });
}

export async function updateJobRunStatus(
  jobRunId: string,
  status: JobStatus,
  error?: string | null,
) {
  const now = new Date();
  await db
    .update(jobRuns)
    .set({
      status,
      completedAt: ["completed", "failed", "cancelled"].includes(status)
        ? now
        : null,
      error: error || null,
    })
    .where(eq(jobRuns.id, jobRunId));

  return db.query.jobRuns.findFirst({ where: eq(jobRuns.id, jobRunId) });
}

// ============================================
// PENDING QUESTIONS (Interactive)
// ============================================

export async function createPendingQuestion(data: {
  jobId: string;
  workspaceId: string;
  projectId?: string;
  questionType: string;
  questionText: string;
  choices?: string[];
  context?: Record<string, unknown>;
  toolCallId: string;
  toolName: string;
  timeoutAt?: Date;
  defaultResponse?: Record<string, unknown>;
}) {
  const id = uuid();
  await db.insert(pendingQuestions).values({
    id,
    jobId: data.jobId,
    workspaceId: data.workspaceId,
    projectId: data.projectId,
    questionType: data.questionType,
    questionText: data.questionText,
    choices: data.choices,
    context: data.context,
    toolCallId: data.toolCallId,
    toolName: data.toolName,
    timeoutAt: data.timeoutAt,
    defaultResponse: data.defaultResponse,
    createdAt: new Date(),
  });
  return db.query.pendingQuestions.findFirst({
    where: eq(pendingQuestions.id, id),
  });
}

export async function listPendingQuestions(workspaceId: string) {
  return db.query.pendingQuestions.findMany({
    where: and(
      eq(pendingQuestions.workspaceId, workspaceId),
      eq(pendingQuestions.status, "pending"),
    ),
    orderBy: [desc(pendingQuestions.createdAt)],
  });
}

export async function updatePendingQuestion(
  id: string,
  data: Partial<{
    status: string;
    response: Record<string, unknown>;
    respondedBy: string;
    respondedAt: Date;
  }>,
) {
  await db
    .update(pendingQuestions)
    .set(data)
    .where(eq(pendingQuestions.id, id));
  return db.query.pendingQuestions.findFirst({
    where: eq(pendingQuestions.id, id),
  });
}

export async function cancelProjectJobs(projectId: string) {
  const now = new Date();

  // Find all pending or running jobs for this project
  const activeJobs = await db.query.jobs.findMany({
    where: and(
      eq(jobs.projectId, projectId),
      or(eq(jobs.status, "pending"), eq(jobs.status, "running")),
    ),
  });

  // Cancel each active job
  for (const job of activeJobs) {
    await db
      .update(jobs)
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
      eq(prototypes.type, data.type),
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
    chromaticStorybookUrl?: string;
    chromaticBuildId?: string;
    storybookPath?: string;
    metadata?: Record<string, unknown>;
  },
) {
  await db
    .update(prototypes)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(prototypes.id, id));

  return db.query.prototypes.findFirst({ where: eq(prototypes.id, id) });
}

export async function deletePrototype(id: string) {
  await db.delete(prototypes).where(eq(prototypes.id, id));
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

  return db.query.prototypeVersions.findFirst({
    where: eq(prototypeVersions.id, id),
  });
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
  const embeddingStr: string | undefined =
    data.embedding instanceof Buffer
      ? data.embedding.toString("base64")
      : typeof data.embedding === "string"
        ? data.embedding
        : undefined;

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

  return db.query.juryEvaluations.findFirst({
    where: eq(juryEvaluations.id, id),
  });
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

export async function getColumnConfigById(id: string) {
  return db.query.columnConfigs.findFirst({
    where: eq(columnConfigs.id, id),
  });
}

export async function createColumnConfig(data: {
  workspaceId: string;
  stage: ProjectStageType;
  displayName: string;
  order: number;
  color?: string;
  autoTriggerJobs?: JobType[];
  agentTriggers?: Array<{
    agentDefinitionId: string;
    priority: number;
    conditions?: Record<string, unknown>;
  }>;
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
    agentTriggers: data.agentTriggers || [],
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
    agentTriggers: Array<{
      agentDefinitionId: string;
      priority: number;
      conditions?: Record<string, unknown>;
    }>;
    requiredDocuments: DocumentType[];
    requiredApprovals: number;
    aiIterations: number;
    rules: Record<string, unknown>;
    humanInLoop: boolean;
    enabled: boolean;
    graduationCriteria: GraduationCriteria;
    enforceGraduation: boolean;
  }>,
) {
  await db.update(columnConfigs).set(data).where(eq(columnConfigs.id, id));

  return db.query.columnConfigs.findFirst({ where: eq(columnConfigs.id, id) });
}

export async function deleteColumnConfig(id: string) {
  await db.delete(columnConfigs).where(eq(columnConfigs.id, id));
  return true;
}

export async function reorderColumnConfigs(
  workspaceId: string,
  orderedIds: string[],
) {
  for (let i = 0; i < orderedIds.length; i++) {
    await db
      .update(columnConfigs)
      .set({ order: i })
      .where(
        and(
          eq(columnConfigs.id, orderedIds[i]),
          eq(columnConfigs.workspaceId, workspaceId),
        ),
      );
  }
  return getColumnConfigs(workspaceId);
}

// ============================================
// AGENT DEFINITIONS
// ============================================

export async function getAgentDefinitionById(id: string) {
  return db.query.agentDefinitions.findFirst({
    where: eq(agentDefinitions.id, id),
  });
}

export async function getAgentDefinitionByName(
  workspaceId: string,
  type: AgentDefinitionType,
  name: string,
) {
  return db.query.agentDefinitions.findFirst({
    where: and(
      eq(agentDefinitions.workspaceId, workspaceId),
      eq(agentDefinitions.type, type),
      eq(agentDefinitions.name, name),
    ),
  });
}

export async function listAgentDefinitions(workspaceId: string) {
  return db.query.agentDefinitions.findMany({
    where: eq(agentDefinitions.workspaceId, workspaceId),
    orderBy: [desc(agentDefinitions.createdAt)],
  });
}

export async function listAgentDefinitionsByType(
  workspaceId: string,
  type: AgentDefinitionType,
) {
  return db.query.agentDefinitions.findMany({
    where: and(
      eq(agentDefinitions.workspaceId, workspaceId),
      eq(agentDefinitions.type, type),
    ),
    orderBy: [desc(agentDefinitions.createdAt)],
  });
}

export async function updateAgentDefinition(
  id: string,
  data: Partial<{ enabled: boolean }>,
) {
  await db
    .update(agentDefinitions)
    .set(data)
    .where(eq(agentDefinitions.id, id));
  return db.query.agentDefinitions.findFirst({
    where: eq(agentDefinitions.id, id),
  });
}

export async function createAgentExecution(data: {
  jobId: string;
  agentDefinitionId?: string;
  workspaceId: string;
  projectId?: string;
  inputContext?: Record<string, unknown>;
}) {
  const id = uuid();
  await db.insert(agentExecutions).values({
    id,
    jobId: data.jobId,
    agentDefinitionId: data.agentDefinitionId || null,
    workspaceId: data.workspaceId,
    projectId: data.projectId || null, // Convert empty string to null for FK constraint
    inputContext: data.inputContext,
    createdAt: new Date(),
    startedAt: new Date(),
  });
  return db.query.agentExecutions.findFirst({
    where: eq(agentExecutions.id, id),
  });
}

export async function updateAgentExecution(
  id: string,
  data: Partial<{
    output: Record<string, unknown>;
    promptUsed: string;
    tokensUsed: number;
    durationMs: number;
    completedAt: Date;
  }>,
) {
  await db.update(agentExecutions).set(data).where(eq(agentExecutions.id, id));
  return db.query.agentExecutions.findFirst({
    where: eq(agentExecutions.id, id),
  });
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

export async function getKnowledgebaseEntryByType(
  workspaceId: string,
  type: KnowledgebaseType,
) {
  return db.query.knowledgebaseEntries.findFirst({
    where: and(
      eq(knowledgebaseEntries.workspaceId, workspaceId),
      eq(knowledgebaseEntries.type, type),
    ),
  });
}

export async function upsertKnowledgebaseEntry(data: {
  workspaceId: string;
  type: KnowledgebaseType;
  title: string;
  content: string;
  filePath?: string;
}) {
  const existing = await getKnowledgebaseEntryByType(
    data.workspaceId,
    data.type,
  );
  const now = new Date();

  if (existing) {
    await db
      .update(knowledgebaseEntries)
      .set({
        title: data.title,
        content: data.content,
        filePath: data.filePath,
        updatedAt: now,
      })
      .where(eq(knowledgebaseEntries.id, existing.id));

    return db.query.knowledgebaseEntries.findFirst({
      where: eq(knowledgebaseEntries.id, existing.id),
    });
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

  return db.query.knowledgebaseEntries.findFirst({
    where: eq(knowledgebaseEntries.id, id),
  });
}

/**
 * Upsert a knowledgebase entry by file path.
 * Uses (workspaceId, type, filePath) as the unique key to support multiple files per type.
 */
export async function upsertKnowledgebaseEntryByPath(data: {
  workspaceId: string;
  type: KnowledgebaseType;
  title: string;
  content: string;
  filePath: string;
}) {
  const existing = await db.query.knowledgebaseEntries.findFirst({
    where: and(
      eq(knowledgebaseEntries.workspaceId, data.workspaceId),
      eq(knowledgebaseEntries.type, data.type),
      eq(knowledgebaseEntries.filePath, data.filePath),
    ),
  });
  const now = new Date();

  if (existing) {
    await db
      .update(knowledgebaseEntries)
      .set({
        title: data.title,
        content: data.content,
        updatedAt: now,
      })
      .where(eq(knowledgebaseEntries.id, existing.id));

    return db.query.knowledgebaseEntries.findFirst({
      where: eq(knowledgebaseEntries.id, existing.id),
    });
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

  return db.query.knowledgebaseEntries.findFirst({
    where: eq(knowledgebaseEntries.id, id),
  });
}

/**
 * Get all knowledgebase entries for a workspace by type.
 * Returns all entries of the given type (supports multiple files per type).
 */
export async function getKnowledgebaseEntriesByType(
  workspaceId: string,
  type: KnowledgebaseType,
) {
  return db.query.knowledgebaseEntries.findMany({
    where: and(
      eq(knowledgebaseEntries.workspaceId, workspaceId),
      eq(knowledgebaseEntries.type, type),
    ),
    orderBy: [asc(knowledgebaseEntries.filePath)],
  });
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
  return db.query.knowledgeSources.findFirst({
    where: eq(knowledgeSources.id, id),
  });
}

export async function updateKnowledgeSource(
  id: string,
  data: {
    config?: Record<string, unknown>;
    lastSyncedAt?: Date | null;
  },
) {
  await db
    .update(knowledgeSources)
    .set({
      ...(data.config !== undefined && { config: data.config }),
      ...(data.lastSyncedAt !== undefined && {
        lastSyncedAt: data.lastSyncedAt,
      }),
    })
    .where(eq(knowledgeSources.id, id));

  return db.query.knowledgeSources.findFirst({
    where: eq(knowledgeSources.id, id),
  });
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

export async function createTickets(
  projectId: string,
  items: Array<{
    title: string;
    description?: string;
    priority?: number;
    estimatedPoints?: number;
    metadata?: Record<string, unknown>;
  }>,
) {
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
  } = {},
) {
  const { status, type, limit = 50, includeExpired = false } = options;
  const now = new Date();

  // Build conditions
  const conditions = [eq(notifications.workspaceId, workspaceId)];

  if (status) {
    if (Array.isArray(status)) {
      conditions.push(or(...status.map((s) => eq(notifications.status, s)))!);
    } else {
      conditions.push(eq(notifications.status, status));
    }
  }

  if (type) {
    if (Array.isArray(type)) {
      conditions.push(or(...type.map((t) => eq(notifications.type, t)))!);
    } else {
      conditions.push(eq(notifications.type, type));
    }
  }

  if (!includeExpired) {
    conditions.push(
      or(isNull(notifications.expiresAt), gte(notifications.expiresAt, now))!,
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
      or(isNull(notifications.expiresAt), gte(notifications.expiresAt, now)),
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
  status: NotificationStatus,
) {
  const now = new Date();

  await db
    .update(notifications)
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

  await db
    .update(notifications)
    .set({
      status: "read",
      readAt: now,
    })
    .where(
      and(
        eq(notifications.workspaceId, workspaceId),
        eq(notifications.status, "unread"),
      ),
    );

  return { success: true };
}

export async function dismissNotification(id: string) {
  const now = new Date();

  await db
    .update(notifications)
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

  await db
    .delete(notifications)
    .where(
      and(
        eq(notifications.workspaceId, workspaceId),
        lt(notifications.expiresAt, now),
      ),
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
  projectName?: string,
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
    process_signal: "Signal Processing",
    synthesize_signals: "Signal Synthesis",
    execute_agent_definition: "Agent Execution",
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
      message:
        job.error ||
        `The ${label.toLowerCase()} job failed. Click to view details and retry.`,
      actionType: "retry",
      actionLabel: "Retry Job",
      actionUrl: job.projectId
        ? `/workspace/${job.workspaceId}?project=${job.projectId}`
        : undefined,
      actionData: { jobId: job.id, jobType: job.type },
      metadata: {
        errorDetails: job.error || undefined,
        relatedEntity: projectName
          ? {
              type: "document",
              id: job.projectId || "",
              name: projectName,
            }
          : undefined,
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
      actionUrl: job.projectId
        ? `/workspace/${job.workspaceId}?project=${job.projectId}`
        : undefined,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Expires in 24 hours
    });
  }

  return null;
}

// ============================================
// ACTIVITY LOG QUERIES
// ============================================

export interface ActivityLogWithUser {
  id: string;
  workspaceId: string;
  userId: string | null;
  action: string;
  targetType: string | null;
  targetId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  } | null;
}

export async function getWorkspaceActivityLogs(
  workspaceId: string,
  options?: { limit?: number; offset?: number },
): Promise<ActivityLogWithUser[]> {
  const { limit = 50, offset = 0 } = options || {};

  const logs = await db
    .select({
      id: activityLogs.id,
      workspaceId: activityLogs.workspaceId,
      userId: activityLogs.userId,
      action: activityLogs.action,
      targetType: activityLogs.targetType,
      targetId: activityLogs.targetId,
      metadata: activityLogs.metadata,
      createdAt: activityLogs.createdAt,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
      },
    })
    .from(activityLogs)
    .leftJoin(users, eq(activityLogs.userId, users.id))
    .where(eq(activityLogs.workspaceId, workspaceId))
    .orderBy(desc(activityLogs.createdAt))
    .limit(limit)
    .offset(offset);

  return logs;
}

// ============================================
// SIGNAL QUERIES
// ============================================

export interface GetSignalsOptions {
  search?: string;
  status?: SignalStatus;
  source?: SignalSource;
  dateFrom?: Date;
  dateTo?: Date;
  sortBy?: "createdAt" | "updatedAt" | "status" | "source";
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
  personaId?: string;
}

export async function getSignals(
  workspaceId: string,
  options: GetSignalsOptions = {},
) {
  const {
    search,
    status,
    source,
    dateFrom,
    dateTo,
    sortBy = "createdAt",
    sortOrder = "desc",
    page = 1,
    pageSize = 20,
    personaId,
  } = options;

  // Build dynamic WHERE conditions
  const conditions = [eq(signals.workspaceId, workspaceId)];

  if (search) {
    conditions.push(
      or(
        ilike(signals.verbatim, `%${search}%`),
        ilike(signals.interpretation, `%${search}%`),
      )!,
    );
  }

  if (status) {
    conditions.push(eq(signals.status, status));
  }

  if (source) {
    conditions.push(eq(signals.source, source));
  }

  if (dateFrom) {
    conditions.push(gte(signals.createdAt, dateFrom));
  }

  if (dateTo) {
    conditions.push(lte(signals.createdAt, dateTo));
  }

  // Filter by persona if specified
  if (personaId) {
    const signalIdsWithPersona = db
      .select({ signalId: signalPersonas.signalId })
      .from(signalPersonas)
      .where(eq(signalPersonas.personaId, personaId));

    conditions.push(inArray(signals.id, signalIdsWithPersona));
  }

  // Build sort
  const sortColumn = {
    createdAt: signals.createdAt,
    updatedAt: signals.updatedAt,
    status: signals.status,
    source: signals.source,
  }[sortBy];

  const orderFn = sortOrder === "asc" ? asc : desc;

  const offset = (page - 1) * pageSize;

  // Fetch signals with linked projects and personas
  const results = await db.query.signals.findMany({
    where: and(...conditions),
    with: {
      projects: {
        with: {
          project: {
            columns: {
              id: true,
              name: true,
            },
          },
        },
        limit: 3, // Only need first few for display
      },
      personas: true,
    },
    orderBy: [orderFn(sortColumn)],
    limit: pageSize,
    offset,
  });

  // Transform results to include linkedProjects and linkedPersonas arrays
  return results.map((signal) => ({
    ...signal,
    linkedProjects: signal.projects.map((sp) => ({
      id: sp.project.id,
      name: sp.project.name,
    })),
    linkedPersonas: signal.personas.map((sp) => ({
      personaId: sp.personaId,
    })),
    // Clean up the raw relations from response
    projects: undefined,
    personas: undefined,
  }));
}

export async function getSignalsCount(
  workspaceId: string,
  options: Omit<
    GetSignalsOptions,
    "page" | "pageSize" | "sortBy" | "sortOrder"
  > = {},
) {
  const { search, status, source, dateFrom, dateTo } = options;

  // Build dynamic WHERE conditions
  const conditions = [eq(signals.workspaceId, workspaceId)];

  if (search) {
    conditions.push(
      or(
        ilike(signals.verbatim, `%${search}%`),
        ilike(signals.interpretation, `%${search}%`),
      )!,
    );
  }

  if (status) {
    conditions.push(eq(signals.status, status));
  }

  if (source) {
    conditions.push(eq(signals.source, source));
  }

  if (dateFrom) {
    conditions.push(gte(signals.createdAt, dateFrom));
  }

  if (dateTo) {
    conditions.push(lte(signals.createdAt, dateTo));
  }

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(signals)
    .where(and(...conditions));

  return Number(result[0]?.count ?? 0);
}

export async function getSignal(id: string) {
  return db.query.signals.findFirst({
    where: eq(signals.id, id),
  });
}

export async function createSignal(data: {
  workspaceId: string;
  verbatim: string;
  interpretation?: string;
  source: SignalSource;
  sourceRef?: string;
  sourceMetadata?: SignalSourceMetadata;
  status?: SignalStatus;
}) {
  const id = uuid();
  const now = new Date();

  await db.insert(signals).values({
    id,
    workspaceId: data.workspaceId,
    verbatim: data.verbatim,
    interpretation: data.interpretation,
    source: data.source,
    sourceRef: data.sourceRef,
    sourceMetadata: data.sourceMetadata,
    status: data.status || "new",
    createdAt: now,
    updatedAt: now,
  });

  return getSignal(id);
}

export async function updateSignal(
  id: string,
  data: Partial<{
    verbatim: string;
    interpretation: string;
    status: SignalStatus;
    severity: SignalSeverity;
    frequency: SignalFrequency;
    userSegment: string;
    sourceRef: string;
    sourceMetadata: SignalSourceMetadata;
  }>,
) {
  const now = new Date();

  await db
    .update(signals)
    .set({
      ...data,
      updatedAt: now,
    })
    .where(eq(signals.id, id));

  return getSignal(id);
}

export async function deleteSignal(id: string) {
  await db.delete(signals).where(eq(signals.id, id));
  return { id };
}

// ============================================
// SIGNAL ASSOCIATION QUERIES
// ============================================

/**
 * Get a signal with its linked projects and personas
 */
export async function getSignalWithLinks(id: string) {
  return db.query.signals.findFirst({
    where: eq(signals.id, id),
    with: {
      projects: {
        with: {
          project: true,
        },
      },
      personas: true,
    },
  });
}

/**
 * Link a signal to a project
 */
export async function linkSignalToProject(
  signalId: string,
  projectId: string,
  linkedBy: string,
  linkReason?: string,
) {
  const id = uuid();

  await db.insert(signalProjects).values({
    id,
    signalId,
    projectId,
    linkedBy,
    linkReason,
  });

  return db.query.signalProjects.findFirst({
    where: eq(signalProjects.id, id),
  });
}

/**
 * Unlink a signal from a project
 */
export async function unlinkSignalFromProject(
  signalId: string,
  projectId: string,
) {
  await db
    .delete(signalProjects)
    .where(
      and(
        eq(signalProjects.signalId, signalId),
        eq(signalProjects.projectId, projectId),
      ),
    );

  return { deleted: true };
}

/**
 * Link a signal to a persona
 */
export async function linkSignalToPersona(
  signalId: string,
  personaId: string,
  linkedBy: string,
) {
  const id = uuid();

  await db.insert(signalPersonas).values({
    id,
    signalId,
    personaId,
    linkedBy,
  });

  return db.query.signalPersonas.findFirst({
    where: eq(signalPersonas.id, id),
  });
}

/**
 * Unlink a signal from a persona
 */
export async function unlinkSignalFromPersona(
  signalId: string,
  personaId: string,
) {
  await db
    .delete(signalPersonas)
    .where(
      and(
        eq(signalPersonas.signalId, signalId),
        eq(signalPersonas.personaId, personaId),
      ),
    );

  return { deleted: true };
}

/**
 * Get all signals linked to a project with pagination
 * Includes full provenance data: linkedBy user, linkReason, confidence
 */
export async function getSignalsForProject(
  projectId: string,
  options?: { limit?: number; offset?: number },
) {
  const { limit = 50, offset = 0 } = options || {};

  const links = await db.query.signalProjects.findMany({
    where: eq(signalProjects.projectId, projectId),
    with: {
      signal: true,
      linkedByUser: true,
    },
    orderBy: [desc(signalProjects.linkedAt)],
    limit,
    offset,
  });

  return links.map((link) => ({
    ...link.signal,
    linkedAt: link.linkedAt,
    linkReason: link.linkReason,
    confidence: link.confidence,
    linkedBy: link.linkedByUser
      ? {
          id: link.linkedByUser.id,
          name: link.linkedByUser.name,
        }
      : null,
  }));
}

/**
 * Count how many projects a signal is linked to
 */
export async function countSignalProjectLinks(signalId: string) {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(signalProjects)
    .where(eq(signalProjects.signalId, signalId));

  return Number(result[0]?.count ?? 0);
}

/**
 * Update a signal with AI-processed fields (extraction results and embedding).
 * Separate from updateSignal because:
 * - Accepts nullable fields (extraction may return nulls)
 * - Includes processedAt timestamp
 * - Updates embedding field (text type for base64)
 */
export async function updateSignalProcessing(
  id: string,
  data: {
    severity?: SignalSeverity | null;
    frequency?: SignalFrequency | null;
    userSegment?: string | null;
    interpretation?: string | null;
    embedding?: string | null;
    processedAt?: Date | null;
  },
) {
  await db
    .update(signals)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(signals.id, id));

  return getSignal(id);
}

// ============================================
// VECTOR SIMILARITY QUERIES (Phase 16)
// ============================================

/**
 * Find signals similar to a given embedding vector.
 * Uses pgvector cosine distance (1 - cosine_similarity).
 *
 * @param workspaceId - Filter to this workspace
 * @param targetVector - The embedding to compare against
 * @param limit - Max results (default 10)
 * @param excludeId - Signal ID to exclude (the query signal itself)
 * @returns Signals ordered by similarity (closest first)
 */
export async function findSimilarSignals(
  workspaceId: string,
  targetVector: number[],
  limit = 10,
  excludeId?: string,
) {
  const vectorStr = `[${targetVector.join(",")}]`;

  const result = await db.execute(sql`
    SELECT
      id,
      verbatim,
      interpretation,
      severity,
      frequency,
      status,
      source,
      created_at,
      embedding_vector <=> ${vectorStr}::vector AS distance
    FROM signals
    WHERE workspace_id = ${workspaceId}
      AND embedding_vector IS NOT NULL
      ${excludeId ? sql`AND id != ${excludeId}` : sql``}
    ORDER BY embedding_vector <=> ${vectorStr}::vector
    LIMIT ${limit}
  `);

  return result.rows.map((row: Record<string, unknown>) => ({
    id: row.id as string,
    verbatim: row.verbatim as string,
    interpretation: row.interpretation as string | null,
    severity: row.severity as string | null,
    frequency: row.frequency as string | null,
    status: row.status as string,
    source: row.source as string,
    createdAt: row.created_at as Date,
    distance: row.distance as number,
    similarity: 1 - (row.distance as number), // Convert distance to similarity
  }));
}

/**
 * Find the best matching project for a signal embedding.
 * Returns the project with lowest cosine distance.
 *
 * @param workspaceId - Filter to this workspace
 * @param signalVector - The signal's embedding vector
 * @returns Best matching project with distance/similarity, or null if no projects have embeddings
 */
export async function findBestProjectMatch(
  workspaceId: string,
  signalVector: number[],
) {
  const vectorStr = `[${signalVector.join(",")}]`;

  const result = await db.execute(sql`
    SELECT
      id,
      name,
      description,
      stage,
      embedding_vector <=> ${vectorStr}::vector AS distance
    FROM projects
    WHERE workspace_id = ${workspaceId}
      AND embedding_vector IS NOT NULL
      AND status = 'active'
    ORDER BY embedding_vector <=> ${vectorStr}::vector
    LIMIT 1
  `);

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0] as Record<string, unknown>;
  return {
    id: row.id as string,
    name: row.name as string,
    description: row.description as string | null,
    stage: row.stage as string,
    distance: row.distance as number,
    similarity: 1 - (row.distance as number),
  };
}

/**
 * Update a signal's classification result.
 */
export async function updateSignalClassification(
  id: string,
  classification: SignalClassificationResult,
) {
  await db
    .update(signals)
    .set({
      classification,
      updatedAt: new Date(),
    })
    .where(eq(signals.id, id));

  return getSignal(id);
}

/**
 * Update a project's embedding vector.
 */
export async function updateProjectEmbedding(
  id: string,
  embeddingVector: number[],
) {
  await db
    .update(projects)
    .set({
      embeddingVector,
      embeddingUpdatedAt: new Date().toISOString(),
      updatedAt: new Date(),
    })
    .where(eq(projects.id, id));

  return getProject(id);
}

/**
 * Get unlinked signals with embeddings for clustering.
 */
export async function getUnlinkedSignalsWithEmbeddings(
  workspaceId: string,
  limit = 100,
) {
  return db.query.signals.findMany({
    where: and(
      eq(signals.workspaceId, workspaceId),
      isNotNull(signals.embeddingVector),
      or(eq(signals.status, "new"), eq(signals.status, "reviewed")),
    ),
    orderBy: [desc(signals.createdAt)],
    limit,
  });
}

// ============================================
// BULK SIGNAL ASSOCIATION QUERIES
// ============================================

/**
 * Bulk link signals to a project
 * Skips signals already linked to the project
 * Updates signal status to "linked" for newly linked signals
 * Returns count of newly linked signals
 */
export async function bulkLinkSignalsToProject(
  signalIds: string[],
  projectId: string,
  userId: string,
  linkReason?: string,
): Promise<{ linked: number; skipped: number }> {
  if (signalIds.length === 0) {
    return { linked: 0, skipped: 0 };
  }

  // Find which signals are already linked to this project
  const existingLinks = await db.query.signalProjects.findMany({
    where: and(
      inArray(signalProjects.signalId, signalIds),
      eq(signalProjects.projectId, projectId),
    ),
    columns: { signalId: true },
  });
  const alreadyLinked = new Set(existingLinks.map((l) => l.signalId));

  // Filter to signals that need linking
  const toLink = signalIds.filter((id) => !alreadyLinked.has(id));

  if (toLink.length === 0) {
    return { linked: 0, skipped: signalIds.length };
  }

  // Batch insert new links
  await db.insert(signalProjects).values(
    toLink.map((signalId) => ({
      signalId,
      projectId,
      linkedBy: userId,
      linkReason: linkReason || "Bulk linked",
    })),
  );

  // Update status to "linked" for signals that weren't already linked
  await db
    .update(signals)
    .set({ status: "linked", updatedAt: new Date() })
    .where(and(inArray(signals.id, toLink), ne(signals.status, "linked")));

  return { linked: toLink.length, skipped: alreadyLinked.size };
}

/**
 * Bulk unlink signals from a project
 * Returns count of unlinked signals
 * Updates signal status to "reviewed" if no remaining project links
 */
export async function bulkUnlinkSignalsFromProject(
  signalIds: string[],
  projectId: string,
): Promise<{ unlinked: number; skipped: number }> {
  if (signalIds.length === 0) {
    return { unlinked: 0, skipped: 0 };
  }

  // Find which signals are actually linked to this project
  const existingLinks = await db.query.signalProjects.findMany({
    where: and(
      inArray(signalProjects.signalId, signalIds),
      eq(signalProjects.projectId, projectId),
    ),
    columns: { signalId: true },
  });
  const linkedSignalIds = existingLinks.map((l) => l.signalId);

  if (linkedSignalIds.length === 0) {
    return { unlinked: 0, skipped: signalIds.length };
  }

  // Delete the links
  await db
    .delete(signalProjects)
    .where(
      and(
        inArray(signalProjects.signalId, linkedSignalIds),
        eq(signalProjects.projectId, projectId),
      ),
    );

  // For each unlinked signal, check if it has any remaining project links
  // If not, revert status to "reviewed"
  for (const signalId of linkedSignalIds) {
    const remainingLinks = await db.query.signalProjects.findMany({
      where: eq(signalProjects.signalId, signalId),
      columns: { id: true },
      limit: 1,
    });

    if (remainingLinks.length === 0) {
      // No more project links, revert to reviewed
      await db
        .update(signals)
        .set({ status: "reviewed", updatedAt: new Date() })
        .where(and(eq(signals.id, signalId), eq(signals.status, "linked")));
    }
  }

  return {
    unlinked: linkedSignalIds.length,
    skipped: signalIds.length - linkedSignalIds.length,
  };
}

// ============================================
// SIGNAL SUGGESTION QUERIES (Phase 17)
// ============================================

/**
 * Get unlinked signals with classification suggestions
 * Returns signals that:
 * - Have classification.projectId set (AI suggested a project)
 * - Are NOT already linked to that suggested project
 * - Have not been dismissed (suggestionDismissedAt is null)
 * - Were created in the last 30 days
 * - classification.isNewInitiative is not true
 */
export async function getSignalSuggestions(
  workspaceId: string,
  limit: number = 20,
): Promise<
  Array<{
    signalId: string;
    verbatim: string;
    source: string;
    projectId: string;
    projectName: string;
    confidence: number;
    reason?: string;
    createdAt: Date;
  }>
> {
  // Use raw SQL for JSONB query performance
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const result = await db.execute(sql`
    SELECT
      s.id as signal_id,
      s.verbatim,
      s.source,
      s.classification->>'projectId' as project_id,
      s.classification->>'projectName' as project_name,
      (s.classification->>'confidence')::float as confidence,
      s.classification->>'reason' as reason,
      s.created_at
    FROM signals s
    LEFT JOIN signal_projects sp ON s.id = sp.signal_id
      AND sp.project_id = s.classification->>'projectId'
    WHERE s.workspace_id = ${workspaceId}
      AND s.classification->>'projectId' IS NOT NULL
      AND COALESCE(s.classification->>'isNewInitiative', 'false') != 'true'
      AND sp.id IS NULL
      AND s.suggestion_dismissed_at IS NULL
      AND s.created_at > ${thirtyDaysAgo.toISOString()}
    ORDER BY (s.classification->>'confidence')::float DESC
    LIMIT ${limit}
  `);

  return result.rows.map((row: Record<string, unknown>) => ({
    signalId: row.signal_id as string,
    verbatim: row.verbatim as string,
    source: row.source as string,
    projectId: row.project_id as string,
    projectName: row.project_name as string,
    confidence: row.confidence as number,
    reason: row.reason as string | undefined,
    createdAt: new Date(row.created_at as string),
  }));
}

/**
 * Dismiss suggestion for a signal
 * Sets suggestionDismissedAt and suggestionDismissedBy
 */
export async function dismissSignalSuggestion(
  signalId: string,
  userId: string,
): Promise<void> {
  await db
    .update(signals)
    .set({
      suggestionDismissedAt: new Date(),
      suggestionDismissedBy: userId,
      updatedAt: new Date(),
    })
    .where(eq(signals.id, signalId));
}

// ============================================
// WORKSPACE AUTOMATION SETTINGS QUERIES (Phase 19)
// ============================================

/**
 * Get signal automation settings for a workspace.
 * Returns DEFAULT_SIGNAL_AUTOMATION if not configured.
 *
 * Used by automation engine and notification filters.
 */
export async function getWorkspaceAutomationSettings(
  workspaceId: string,
): Promise<SignalAutomationSettings> {
  const workspace = await db.query.workspaces.findFirst({
    where: eq(workspaces.id, workspaceId),
    columns: { settings: true },
  });

  if (!workspace?.settings?.signalAutomation) {
    return DEFAULT_SIGNAL_AUTOMATION;
  }

  // Merge with defaults to ensure all fields exist
  return {
    ...DEFAULT_SIGNAL_AUTOMATION,
    ...workspace.settings.signalAutomation,
  };
}

// ============================================
// WORKSPACE MAINTENANCE SETTINGS QUERIES (Phase 20)
// ============================================

/**
 * Get workspace maintenance settings, merging with defaults.
 */
export async function getWorkspaceMaintenanceSettings(
  workspaceId: string,
): Promise<MaintenanceSettings> {
  const workspace = await db.query.workspaces.findFirst({
    where: eq(workspaces.id, workspaceId),
    columns: {
      settings: true,
    },
  });

  const workspaceSettings = workspace?.settings?.maintenance;

  // Merge with defaults (workspace settings override defaults)
  return {
    ...DEFAULT_MAINTENANCE_SETTINGS,
    ...workspaceSettings,
  };
}

/**
 * Find multiple best matching projects for a signal vector.
 * Used for cleanup agent suggestions (MAINT-01).
 *
 * @param workspaceId - Workspace to search
 * @param signalVector - Signal embedding vector
 * @param limit - Number of matches to return (default: 3)
 * @returns Array of matching projects with similarity scores
 */
export async function findBestProjectMatches(
  workspaceId: string,
  signalVector: number[],
  limit = 3,
): Promise<
  Array<{
    id: string;
    name: string;
    description: string | null;
    stage: string;
    similarity: number;
  }>
> {
  const vectorStr = `[${signalVector.join(",")}]`;

  const result = await db.execute(sql`
    SELECT
      id,
      name,
      description,
      stage,
      1 - (embedding_vector <=> ${vectorStr}::vector) AS similarity
    FROM projects
    WHERE workspace_id = ${workspaceId}
      AND embedding_vector IS NOT NULL
      AND status = 'active'
    ORDER BY embedding_vector <=> ${vectorStr}::vector
    LIMIT ${limit}
  `);

  return result.rows.map((row: Record<string, unknown>) => ({
    id: row.id as string,
    name: row.name as string,
    description: row.description as string | null,
    stage: row.stage as string,
    similarity: row.similarity as number,
  }));
}

// ============================================
// PROJECT COMMIT HISTORY QUERIES (Phase 5)
// ============================================

/**
 * Get commit history for a project, ordered by most recent first.
 * Used for WRITE-07 (user can see commit history for each project)
 */
export async function getProjectCommitHistory(
  projectId: string,
  options: { limit?: number; offset?: number } = {},
) {
  const { limit = 20, offset = 0 } = options;

  return db.query.projectCommits.findMany({
    where: eq(projectCommits.projectId, projectId),
    orderBy: [desc(projectCommits.createdAt)],
    limit,
    offset,
    with: {
      stageRun: {
        columns: {
          id: true,
          stage: true,
          status: true,
        },
      },
    },
  });
}

/**
 * Get total commit count for a project.
 */
export async function getProjectCommitCount(
  projectId: string,
): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(projectCommits)
    .where(eq(projectCommits.projectId, projectId));

  return result[0]?.count || 0;
}

/**
 * Record a new commit in project history.
 * Called by writeback service after successful commit.
 */
export async function recordProjectCommit(data: {
  projectId: string;
  workspaceId: string;
  commitSha: string;
  commitUrl: string;
  message: string;
  documentType?: string;
  filesChanged?: string[];
  triggeredBy?: string;
  stageRunId?: string;
  githubWriteOpId?: string;
}) {
  const id = `pcom_${uuid()}`;

  await db.insert(projectCommits).values({
    id,
    projectId: data.projectId,
    workspaceId: data.workspaceId,
    commitSha: data.commitSha,
    commitUrl: data.commitUrl,
    message: data.message,
    documentType: data.documentType,
    filesChanged: data.filesChanged || [],
    triggeredBy: data.triggeredBy,
    stageRunId: data.stageRunId,
    githubWriteOpId: data.githubWriteOpId,
  });

  return db.query.projectCommits.findFirst({
    where: eq(projectCommits.id, id),
  });
}

// ============================================
// AGENT EXECUTION HISTORY QUERIES (Phase 6)
// ============================================

/**
 * Get execution history for an agent definition.
 * Returns recent executions with related job and project info.
 * Used for AGUI-05 (user can see execution history for each agent).
 */
export async function getAgentExecutionHistory(
  agentDefinitionId: string,
  limit: number = 20,
) {
  return db.query.agentExecutions.findMany({
    where: eq(agentExecutions.agentDefinitionId, agentDefinitionId),
    orderBy: [desc(agentExecutions.createdAt)],
    limit,
    with: {
      project: {
        columns: { id: true, name: true },
      },
      job: {
        columns: { id: true, status: true },
      },
    },
  });
}
