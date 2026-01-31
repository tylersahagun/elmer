/**
 * Graduation Criteria Service
 *
 * Checks if projects meet the requirements to move between stages.
 * Enforces quality gates based on column configuration.
 */

import { db } from "@/lib/db";
import {
  columnConfigs,
  projects,
  documents,
  juryEvaluations,
  prototypes,
  signalProjects,
  type GraduationCriteria,
  type DocumentType,
  type ProjectStage,
} from "@/lib/db/schema";
import { eq, and, count as sqlCount } from "drizzle-orm";

export interface GraduationCheckResult {
  canGraduate: boolean;
  criteria: GraduationCriteria | null;
  enforced: boolean;
  checks: {
    name: string;
    required: boolean;
    passed: boolean;
    message: string;
    details?: Record<string, unknown>;
  }[];
  overrideAllowed: boolean;
}

/**
 * Get the graduation criteria for a stage
 */
export async function getGraduationCriteria(
  workspaceId: string,
  stage: ProjectStage,
): Promise<{ criteria: GraduationCriteria | null; enforced: boolean }> {
  const column = await db.query.columnConfigs.findFirst({
    where: and(
      eq(columnConfigs.workspaceId, workspaceId),
      eq(columnConfigs.stage, stage),
    ),
  });

  return {
    criteria: column?.graduationCriteria || null,
    enforced: column?.enforceGraduation || false,
  };
}

/**
 * Check if a project meets graduation criteria for its current stage
 */
export async function checkGraduationCriteria(
  projectId: string,
): Promise<GraduationCheckResult> {
  // Get project with workspace
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
  });

  if (!project) {
    return {
      canGraduate: false,
      criteria: null,
      enforced: false,
      checks: [
        {
          name: "project",
          required: true,
          passed: false,
          message: "Project not found",
        },
      ],
      overrideAllowed: false,
    };
  }

  // Get column config for current stage
  const { criteria, enforced } = await getGraduationCriteria(
    project.workspaceId,
    project.stage as ProjectStage,
  );

  // If no criteria defined, allow graduation
  if (!criteria) {
    return {
      canGraduate: true,
      criteria: null,
      enforced: false,
      checks: [],
      overrideAllowed: true,
    };
  }

  const checks: GraduationCheckResult["checks"] = [];

  // Check required documents
  if (criteria.requiredDocuments && criteria.requiredDocuments.length > 0) {
    const projectDocs = await db.query.documents.findMany({
      where: eq(documents.projectId, projectId),
    });
    const docTypes = new Set(projectDocs.map((d) => d.type));

    const missingDocs = criteria.requiredDocuments.filter(
      (t) => !docTypes.has(t),
    );
    const passed = missingDocs.length === 0;

    checks.push({
      name: "requiredDocuments",
      required: true,
      passed,
      message: passed
        ? `All required documents present (${criteria.requiredDocuments.join(", ")})`
        : `Missing documents: ${missingDocs.join(", ")}`,
      details: {
        required: criteria.requiredDocuments,
        present: Array.from(docTypes),
        missing: missingDocs,
      },
    });
  }

  // Check minimum approval rate
  if (criteria.minApprovalRate !== undefined) {
    const evaluations = await db.query.juryEvaluations.findMany({
      where: eq(juryEvaluations.projectId, projectId),
      orderBy: (je, { desc }) => [desc(je.createdAt)],
      limit: 1,
    });

    const latestEval = evaluations[0];
    const approvalRate = latestEval?.approvalRate ?? 0;
    const passed = approvalRate >= criteria.minApprovalRate;

    checks.push({
      name: "minApprovalRate",
      required: true,
      passed,
      message: passed
        ? `Approval rate ${(approvalRate * 100).toFixed(0)}% meets minimum ${(criteria.minApprovalRate * 100).toFixed(0)}%`
        : `Approval rate ${(approvalRate * 100).toFixed(0)}% below minimum ${(criteria.minApprovalRate * 100).toFixed(0)}%`,
      details: { required: criteria.minApprovalRate, actual: approvalRate },
    });
  }

  // Check minimum jury evaluations
  if (criteria.minJuryEvaluations !== undefined) {
    const evalCount = await db
      .select({ count: sqlCount() })
      .from(juryEvaluations)
      .where(eq(juryEvaluations.projectId, projectId));

    const count = evalCount[0]?.count ?? 0;
    const passed = count >= criteria.minJuryEvaluations;

    checks.push({
      name: "minJuryEvaluations",
      required: true,
      passed,
      message: passed
        ? `${count} jury evaluation(s) meets minimum of ${criteria.minJuryEvaluations}`
        : `Only ${count} jury evaluation(s), need at least ${criteria.minJuryEvaluations}`,
      details: { required: criteria.minJuryEvaluations, actual: count },
    });
  }

  // Check prototype requirement
  if (criteria.requirePrototype) {
    const prototypeCount = await db
      .select({ count: sqlCount() })
      .from(prototypes)
      .where(eq(prototypes.projectId, projectId));

    const count = prototypeCount[0]?.count ?? 0;
    const passed = count > 0;

    checks.push({
      name: "requirePrototype",
      required: true,
      passed,
      message: passed
        ? `${count} prototype(s) linked`
        : "No prototypes linked to project",
      details: { count },
    });
  }

  // Check minimum signals processed
  if (criteria.minSignalsProcessed !== undefined) {
    const signalCount = await db
      .select({ count: sqlCount() })
      .from(signalProjects)
      .where(eq(signalProjects.projectId, projectId));

    const count = signalCount[0]?.count ?? 0;
    const passed = count >= criteria.minSignalsProcessed;

    checks.push({
      name: "minSignalsProcessed",
      required: true,
      passed,
      message: passed
        ? `${count} signals processed, meets minimum of ${criteria.minSignalsProcessed}`
        : `Only ${count} signals processed, need at least ${criteria.minSignalsProcessed}`,
      details: { required: criteria.minSignalsProcessed, actual: count },
    });
  }

  // Check metrics gate
  if (criteria.requireMetricsGate) {
    const projectMeta = project.metadata as {
      releaseMetrics?: {
        current?: Record<string, number>;
        thresholds?: Record<string, Record<string, number>>;
      };
    } | null;
    const metrics = projectMeta?.releaseMetrics;
    const currentStage = project.stage?.toLowerCase() as
      | "alpha"
      | "beta"
      | "ga";

    let passed = false;
    let message = "No metrics configured";

    if (metrics?.current && metrics?.thresholds?.[currentStage]) {
      const threshold = metrics.thresholds[currentStage];
      const current = metrics.current;

      // Check if all threshold conditions are met
      passed = Object.entries(threshold).every(([key, reqValue]) => {
        const actualValue = current[key] ?? 0;
        // For "errors", lower is better; for others, higher is better
        if (key === "errors") {
          return actualValue <= reqValue;
        }
        return actualValue >= reqValue;
      });

      message = passed
        ? "Metrics meet release thresholds"
        : "Metrics do not meet release thresholds";
    }

    checks.push({
      name: "requireMetricsGate",
      required: true,
      passed,
      message,
      details: { metrics },
    });
  }

  // Determine overall result
  const allPassed = checks.every((c) => c.passed);
  const overrideAllowed = criteria.allowManualOverride ?? true;

  return {
    canGraduate: allPassed,
    criteria,
    enforced,
    checks,
    overrideAllowed,
  };
}

/**
 * Validate if a project can move to a new stage
 * Returns { allowed: true } or { allowed: false, reason: string, checks: [...] }
 */
export async function validateStageTransition(
  projectId: string,
  targetStage: ProjectStage,
  options?: { forceOverride?: boolean },
): Promise<{
  allowed: boolean;
  reason?: string;
  checkResult?: GraduationCheckResult;
}> {
  const result = await checkGraduationCriteria(projectId);

  // If no criteria or already passes, allow
  if (result.canGraduate) {
    return { allowed: true, checkResult: result };
  }

  // If not enforced, allow with warning
  if (!result.enforced) {
    return { allowed: true, checkResult: result };
  }

  // If force override and allowed
  if (options?.forceOverride && result.overrideAllowed) {
    return { allowed: true, checkResult: result };
  }

  // Block the transition
  const failedChecks = result.checks.filter((c) => !c.passed);
  const reason = failedChecks.map((c) => c.message).join("; ");

  return {
    allowed: false,
    reason: `Graduation criteria not met: ${reason}`,
    checkResult: result,
  };
}

export interface StageQualityScore {
  score: number;
  summary: string;
  strengths: string[];
  gaps: string[];
  updatedAt: string;
  source: "criteria" | "heuristic";
}

const STAGE_ORDER: ProjectStage[] = [
  "inbox",
  "discovery",
  "prd",
  "design",
  "prototype",
  "validate",
  "tickets",
  "build",
  "alpha",
  "beta",
  "ga",
];

const STAGE_INDEX = new Map(STAGE_ORDER.map((stage, index) => [stage, index]));

const getStageIndex = (stage: ProjectStage) => STAGE_INDEX.get(stage) ?? 0;

const buildStageQualityFromChecks = (
  checks: GraduationCheckResult["checks"],
  source: StageQualityScore["source"],
): StageQualityScore => {
  const passedCount = checks.filter((check) => check.passed).length;
  const totalCount = checks.length;
  return {
    score: totalCount > 0 ? passedCount / totalCount : 0,
    summary:
      totalCount > 0
        ? `Quality ${passedCount}/${totalCount}`
        : "Quality pending",
    strengths: checks
      .filter((check) => check.passed)
      .map((check) => check.message),
    gaps: checks.filter((check) => !check.passed).map((check) => check.message),
    updatedAt: new Date().toISOString(),
    source,
  };
};

const getMetricsGateStatus = (
  stage: ProjectStage,
  metadata?: Record<string, unknown> | null,
) => {
  const projectMeta = metadata as {
    releaseMetrics?: {
      current?: Record<string, number>;
      thresholds?: Record<string, Record<string, number>>;
    };
  } | null;
  const metrics = projectMeta?.releaseMetrics;
  const currentStage = stage.toLowerCase() as "alpha" | "beta" | "ga";

  if (!metrics?.current || !metrics?.thresholds?.[currentStage]) {
    return { passed: false, message: "Release metrics not configured" };
  }

  const threshold = metrics.thresholds[currentStage];
  const current = metrics.current;
  const passed = Object.entries(threshold).every(([key, reqValue]) => {
    const actualValue = current[key] ?? 0;
    if (key === "errors") {
      return actualValue <= reqValue;
    }
    return actualValue >= reqValue;
  });

  return {
    passed,
    message: passed
      ? "Metrics meet release thresholds"
      : "Metrics below release thresholds",
  };
};

const buildStageQualityHeuristic = (params: {
  stage: ProjectStage;
  documentCount: number;
  prototypeCount: number;
  signalCount: number;
  juryPassCount: number;
  metadata?: Record<string, unknown> | null;
}): StageQualityScore => {
  const stageIndex = getStageIndex(params.stage);
  const checks: GraduationCheckResult["checks"] = [];

  if (stageIndex >= 1) {
    const passed = params.documentCount > 0;
    checks.push({
      name: "documents",
      required: true,
      passed,
      message: passed ? "Documents present" : "Add at least one document",
    });
  }

  if (stageIndex >= 1 && stageIndex <= 5) {
    const passed = params.signalCount > 0;
    checks.push({
      name: "signals",
      required: false,
      passed,
      message: passed ? "Signals linked" : "No signals linked yet",
    });
  }

  if (stageIndex >= 4) {
    const passed = params.prototypeCount > 0;
    checks.push({
      name: "prototype",
      required: true,
      passed,
      message: passed ? "Prototype linked" : "Prototype not linked",
    });
  }

  if (stageIndex >= 5) {
    const passed = params.juryPassCount > 0;
    checks.push({
      name: "jury",
      required: true,
      passed,
      message: passed
        ? "Jury evaluation passed"
        : "No passing jury evaluations",
    });
  }

  if (stageIndex >= 8) {
    const metricsGate = getMetricsGateStatus(params.stage, params.metadata);
    checks.push({
      name: "metrics",
      required: true,
      passed: metricsGate.passed,
      message: metricsGate.message,
    });
  }

  if (checks.length === 0) {
    return {
      score: 0.2,
      summary: "Quality pending",
      strengths: [],
      gaps: [],
      updatedAt: new Date().toISOString(),
      source: "heuristic",
    };
  }

  return buildStageQualityFromChecks(checks, "heuristic");
};

export async function calculateStageQuality(params: {
  projectId: string;
  stage: ProjectStage;
  metadata?: Record<string, unknown> | null;
  documentCount?: number;
  prototypeCount?: number;
  signalCount?: number;
  juryPassCount?: number;
  criteriaResult?: GraduationCheckResult;
}): Promise<StageQualityScore> {
  const criteriaResult =
    params.criteriaResult ?? (await checkGraduationCriteria(params.projectId));
  if (criteriaResult.checks.length > 0) {
    return buildStageQualityFromChecks(criteriaResult.checks, "criteria");
  }

  const documentCount =
    params.documentCount ??
    (
      await db
        .select({ count: sqlCount() })
        .from(documents)
        .where(eq(documents.projectId, params.projectId))
    )[0]?.count ??
    0;
  const prototypeCount =
    params.prototypeCount ??
    (
      await db
        .select({ count: sqlCount() })
        .from(prototypes)
        .where(eq(prototypes.projectId, params.projectId))
    )[0]?.count ??
    0;
  const signalCount =
    params.signalCount ??
    (
      await db
        .select({ count: sqlCount() })
        .from(signalProjects)
        .where(eq(signalProjects.projectId, params.projectId))
    )[0]?.count ??
    0;
  const juryPassCount =
    params.juryPassCount ??
    (
      await db
        .select({ count: sqlCount() })
        .from(juryEvaluations)
        .where(
          and(
            eq(juryEvaluations.projectId, params.projectId),
            eq(juryEvaluations.verdict, "pass"),
          ),
        )
    )[0]?.count ??
    0;

  return buildStageQualityHeuristic({
    stage: params.stage,
    metadata: params.metadata,
    documentCount,
    prototypeCount,
    signalCount,
    juryPassCount,
  });
}
