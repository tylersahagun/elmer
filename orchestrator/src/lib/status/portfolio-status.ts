import { checkGraduationCriteria } from "@/lib/graduation/criteria-service";
import { getConvexWorkspace, listConvexProjects } from "@/lib/convex/server";
import {
  buildInitiativeSnapshot,
} from "./initiative-status";
import type {
  InitiativeStatusSnapshot,
  PrioritizedAction,
  WorkspaceStatusReport,
} from "./types";
import type { GraduationCheckResult } from "@/lib/graduation/criteria-service";

type ProjectStage =
  | "inbox"
  | "discovery"
  | "prd"
  | "design"
  | "prototype"
  | "validate"
  | "tickets"
  | "build"
  | "alpha"
  | "beta"
  | "ga";

function buildSummary(initiatives: InitiativeStatusSnapshot[]) {
  const byStage = initiatives.reduce<Record<string, number>>((acc, initiative) => {
    acc[initiative.stage] = (acc[initiative.stage] ?? 0) + 1;
    return acc;
  }, {});

  const byStatus = initiatives.reduce<Record<string, number>>((acc, initiative) => {
    acc[initiative.status] = (acc[initiative.status] ?? 0) + 1;
    return acc;
  }, {});

  return {
    totalProjects: initiatives.length,
    readyToAdvance: initiatives.filter((initiative) => initiative.canAdvance)
      .length,
    needsAttention: initiatives.filter(
      (initiative) =>
        initiative.blockers.length > 0 ||
        initiative.stale ||
        initiative.readinessScore < 0.5,
    ).length,
    staleProjects: initiatives.filter((initiative) => initiative.stale).length,
    byStage,
    byStatus,
  };
}

function buildMeasurementCoverage(initiatives: InitiativeStatusSnapshot[]) {
  return initiatives.reduce(
    (acc, initiative) => {
      acc[initiative.measurementReadiness] += 1;
      return acc;
    },
    { instrumented: 0, partial: 0, missing: 0 },
  );
}

function calculateHealthScore(initiatives: InitiativeStatusSnapshot[]) {
  if (initiatives.length === 0) return 0;

  const averageReadiness =
    initiatives.reduce((sum, initiative) => sum + initiative.readinessScore, 0) /
    initiatives.length;
  const stalePenalty = initiatives.filter((initiative) => initiative.stale)
    .length;
  const blockerPenalty = initiatives.filter((initiative) => initiative.blockers.length > 0)
    .length;

  const rawScore =
    averageReadiness * 100 - stalePenalty * 6 - blockerPenalty * 8;
  return Math.max(0, Math.min(100, Math.round(rawScore)));
}

function buildActionQueue(initiatives: InitiativeStatusSnapshot[]) {
  return initiatives
    .map<PrioritizedAction>((initiative) => {
      const blockerScore = initiative.blockers.length > 0 ? 30 : 0;
      const staleScore = initiative.stale ? 20 : 0;
      const readinessScore = Math.round((1 - initiative.readinessScore) * 20);
      const priorityScore = Math.max(0, 10 - initiative.priority) * 3;
      const score = blockerScore + staleScore + readinessScore + priorityScore;
      const reason =
        initiative.blockers[0] ||
        (initiative.stale
          ? `No updates for ${initiative.daysSinceUpdate} days`
          : `${Math.round(initiative.artifactCompleteness * 100)}% artifact completeness`);

      return {
        projectId: initiative.id,
        projectName: initiative.name,
        priority: initiative.priority,
        reason,
        command: initiative.nextSuggestedCommand,
        score,
      };
    })
    .sort((left, right) => right.score - left.score)
    .slice(0, 10);
}

const FALLBACK_GRADUATION: GraduationCheckResult = {
  canGraduate: true,
  criteria: null,
  enforced: false,
  checks: [],
  overrideAllowed: true,
};

type ConvexWorkspaceRecord = {
  _id: string;
  name: string;
};

type ConvexProjectRecord = {
  _id: string;
  _creationTime: number;
  name: string;
  description?: string | null;
  stage?: string;
  status?: string | null;
  priority?: string | number | null;
  metadata?: Record<string, unknown> | null;
};

function normalizeProjectStage(stage?: string): ProjectStage {
  switch (stage) {
    case "inbox":
    case "discovery":
    case "prd":
    case "design":
    case "prototype":
    case "validate":
    case "tickets":
    case "build":
    case "alpha":
    case "beta":
    case "ga":
      return stage;
    default:
      return "inbox";
  }
}

function normalizeProjectStatus(status?: string | null) {
  switch (status) {
    case "paused":
    case "completed":
    case "archived":
      return status;
    default:
      return "active" as const;
  }
}

function normalizeProjectPriority(priority?: string | number | null) {
  if (typeof priority === "number" && Number.isFinite(priority)) {
    return priority;
  }

  switch (priority) {
    case "P0":
      return 0;
    case "P1":
      return 1;
    case "P3":
      return 3;
    case "P2":
    default:
      return 2;
  }
}

function buildReportFromInitiatives(
  workspaceId: string,
  workspaceName: string,
  initiatives: InitiativeStatusSnapshot[],
): WorkspaceStatusReport {
  const summary = buildSummary(initiatives);
  const measurementCoverage = buildMeasurementCoverage(initiatives);
  const readyToAdvance = initiatives.filter((initiative) => initiative.canAdvance);
  const attentionRequired = initiatives.filter(
    (initiative) =>
      initiative.blockers.length > 0 ||
      initiative.stale ||
      initiative.readinessScore < 0.5,
  );

  return {
    workspaceId,
    workspaceName,
    generatedAt: new Date().toISOString(),
    summary,
    healthScore: calculateHealthScore(initiatives),
    initiatives,
    attentionRequired,
    readyToAdvance,
    actionQueue: buildActionQueue(initiatives),
    measurementCoverage,
  };
}

export function buildEmptyWorkspaceStatusReport(
  workspaceId: string,
  workspaceName = "Workspace",
): WorkspaceStatusReport {
  return buildReportFromInitiatives(workspaceId, workspaceName, []);
}

export async function buildWorkspaceStatusReport(workspaceId: string) {
  const convexWorkspace = (await getConvexWorkspace(
    workspaceId,
  )) as ConvexWorkspaceRecord | null;
  if (!convexWorkspace) return null;

  const initiatives: InitiativeStatusSnapshot[] = [];
  const workspaceName = convexWorkspace.name;

  const convexProjects = (await listConvexProjects(
    workspaceId,
  )) as ConvexProjectRecord[];

  for (const project of convexProjects) {
    const graduation = await checkGraduationCriteria(project._id).catch(
      () => FALLBACK_GRADUATION,
    );
    initiatives.push(
      buildInitiativeSnapshot({
        project: {
          id: project._id,
          name: project.name,
          description: project.description ?? null,
          stage: normalizeProjectStage(project.stage),
          status: normalizeProjectStatus(project.status),
          priority: normalizeProjectPriority(project.priority),
          updatedAt: new Date(project._creationTime).toISOString(),
          createdAt: new Date(project._creationTime).toISOString(),
          signalCount: 0,
          documentCount: 0,
          prototypeCount: 0,
          documents: [],
          metadata: project.metadata ?? {},
        },
        graduation,
      }),
    );
  }

  initiatives.sort((left, right) => {
    if (left.canAdvance !== right.canAdvance) {
      return left.canAdvance ? -1 : 1;
    }
    if (left.blockers.length !== right.blockers.length) {
      return right.blockers.length - left.blockers.length;
    }
    return right.readinessScore - left.readinessScore;
  });

  return buildReportFromInitiatives(
    workspaceId,
    workspaceName ?? "Workspace",
    initiatives,
  );
}
