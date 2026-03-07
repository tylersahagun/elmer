import { getProjectsWithCounts, getWorkspace } from "@/lib/db/queries";
import { checkGraduationCriteria } from "@/lib/graduation/criteria-service";
import {
  buildInitiativeSnapshot,
} from "./initiative-status";
import type {
  InitiativeStatusSnapshot,
  PrioritizedAction,
  WorkspaceStatusReport,
} from "./types";

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

export async function buildWorkspaceStatusReport(workspaceId: string) {
  const workspace = await getWorkspace(workspaceId);
  if (!workspace) return null;

  const projects = await getProjectsWithCounts(workspaceId);
  const initiatives: InitiativeStatusSnapshot[] = [];

  for (const project of projects) {
    const graduation = await checkGraduationCriteria(project.id);
    initiatives.push(
      buildInitiativeSnapshot({
        project,
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

  const summary = buildSummary(initiatives);
  const measurementCoverage = buildMeasurementCoverage(initiatives);
  const readyToAdvance = initiatives.filter((initiative) => initiative.canAdvance);
  const attentionRequired = initiatives.filter(
    (initiative) =>
      initiative.blockers.length > 0 ||
      initiative.stale ||
      initiative.readinessScore < 0.5,
  );

  const report: WorkspaceStatusReport = {
    workspaceId,
    workspaceName: workspace.name,
    generatedAt: new Date().toISOString(),
    summary,
    healthScore: calculateHealthScore(initiatives),
    initiatives,
    attentionRequired,
    readyToAdvance,
    actionQueue: buildActionQueue(initiatives),
    measurementCoverage,
  };

  return report;
}
