/**
 * Graduation Criteria Service
 *
 * Checks if projects meet the requirements to move between stages.
 * Enforces quality gates based on column configuration.
 * Uses Convex for all data operations.
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

function getConvexClient() {
  return new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
}

type ProjectStage = "inbox" | "discovery" | "prd" | "design" | "prototype" | "validate" | "tickets" | "build" | "alpha" | "beta" | "ga";
type DocumentType = string;

export interface GraduationCriteria {
  requiredDocuments?: DocumentType[];
  minApprovalRate?: number;
  minJuryEvaluations?: number;
  requirePrototype?: boolean;
  minSignalsProcessed?: number;
  requireMetricsGate?: boolean;
  allowManualOverride?: boolean;
}

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

export async function getGraduationCriteria(
  workspaceId: string,
  stage: ProjectStage,
): Promise<{ criteria: GraduationCriteria | null; enforced: boolean }> {
  const client = getConvexClient();
  const columns = await client.query(api.columns.listByWorkspace, {
    workspaceId: workspaceId as Id<"workspaces">,
  });
  const column = columns.find((c: { stage: string }) => c.stage === stage) as {
    graduationCriteria?: GraduationCriteria;
    enforceGraduation?: boolean;
  } | undefined;

  return {
    criteria: column?.graduationCriteria ?? null,
    enforced: column?.enforceGraduation ?? false,
  };
}

export async function checkGraduationCriteria(
  projectId: string,
): Promise<GraduationCheckResult> {
  const client = getConvexClient();

  const project = await client.query(api.projects.get, {
    projectId: projectId as Id<"projects">,
  });

  if (!project) {
    return {
      canGraduate: false,
      criteria: null,
      enforced: false,
      checks: [{ name: "project", required: true, passed: false, message: "Project not found" }],
      overrideAllowed: false,
    };
  }

  const { criteria, enforced } = await getGraduationCriteria(
    project.workspaceId,
    project.stage as ProjectStage,
  );

  if (!criteria) {
    return { canGraduate: true, criteria: null, enforced: false, checks: [], overrideAllowed: true };
  }

  const checks: GraduationCheckResult["checks"] = [];

  // Check required documents
  if (criteria.requiredDocuments && criteria.requiredDocuments.length > 0) {
    const projectDocs = await client.query(api.documents.byProject, {
      projectId: projectId as Id<"projects">,
    });
    const docTypes = new Set(projectDocs.map((d: { type: string }) => d.type));
    const missingDocs = criteria.requiredDocuments.filter((t) => !docTypes.has(t));
    const passed = missingDocs.length === 0;
    checks.push({
      name: "requiredDocuments",
      required: true,
      passed,
      message: passed
        ? `All required documents present (${criteria.requiredDocuments.join(", ")})`
        : `Missing documents: ${missingDocs.join(", ")}`,
      details: { required: criteria.requiredDocuments, present: Array.from(docTypes), missing: missingDocs },
    });
  }

  // Check minimum approval rate
  if (criteria.minApprovalRate !== undefined) {
    const evaluations = await client.query(api.juryEvaluations.listByProject, {
      projectId: projectId as Id<"projects">,
    });
    const latestEval = evaluations[evaluations.length - 1] as { approvalRate?: number } | undefined;
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
    const evaluations = await client.query(api.juryEvaluations.listByProject, {
      projectId: projectId as Id<"projects">,
    });
    const count = evaluations.length;
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
    const prototypes = await client.query(api.prototypes.listByProject, {
      projectId: projectId as Id<"projects">,
    });
    const count = prototypes.length;
    const passed = count > 0;
    checks.push({
      name: "requirePrototype",
      required: true,
      passed,
      message: passed ? `${count} prototype(s) linked` : "No prototypes linked to project",
      details: { count },
    });
  }

  // Check minimum signals processed
  if (criteria.minSignalsProcessed !== undefined) {
    const linkedSignals = await client.query(api.signals.byProject, {
      projectId: projectId as Id<"projects">,
    });
    const count = linkedSignals.length;
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
    const currentStage = project.stage?.toLowerCase() as "alpha" | "beta" | "ga";

    let passed = false;
    let message = "No metrics configured";

    if (metrics?.current && metrics?.thresholds?.[currentStage]) {
      const threshold = metrics.thresholds[currentStage];
      const current = metrics.current;
      passed = Object.entries(threshold).every(([key, reqValue]) => {
        const actualValue = current[key] ?? 0;
        if (key === "errors") return actualValue <= reqValue;
        return actualValue >= reqValue;
      });
      message = passed ? "Metrics meet release thresholds" : "Metrics do not meet release thresholds";
    }

    checks.push({ name: "requireMetricsGate", required: true, passed, message, details: { metrics } });
  }

  const allPassed = checks.every((c) => c.passed);
  const overrideAllowed = criteria.allowManualOverride ?? true;

  return { canGraduate: allPassed, criteria, enforced, checks, overrideAllowed };
}

export async function validateStageTransition(
  projectId: string,
  targetStage: ProjectStage,
  options?: { forceOverride?: boolean },
): Promise<{ allowed: boolean; reason?: string; checkResult?: GraduationCheckResult }> {
  const result = await checkGraduationCriteria(projectId);

  if (result.canGraduate) return { allowed: true, checkResult: result };
  if (!result.enforced) return { allowed: true, checkResult: result };
  if (options?.forceOverride && result.overrideAllowed) return { allowed: true, checkResult: result };

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
  "inbox", "discovery", "prd", "design", "prototype",
  "validate", "tickets", "build", "alpha", "beta", "ga",
];

const STAGE_INDEX = new Map(STAGE_ORDER.map((stage, index) => [stage, index]));
const getStageIndex = (stage: ProjectStage) => STAGE_INDEX.get(stage) ?? 0;

function buildStageQualityFromChecks(
  checks: GraduationCheckResult["checks"],
  source: StageQualityScore["source"],
): StageQualityScore {
  const passedCount = checks.filter((c) => c.passed).length;
  const totalCount = checks.length;
  return {
    score: totalCount > 0 ? passedCount / totalCount : 0,
    summary: totalCount > 0 ? `Quality ${passedCount}/${totalCount}` : "Quality pending",
    strengths: checks.filter((c) => c.passed).map((c) => c.message),
    gaps: checks.filter((c) => !c.passed).map((c) => c.message),
    updatedAt: new Date().toISOString(),
    source,
  };
}

function getMetricsGateStatus(stage: ProjectStage, metadata?: Record<string, unknown> | null) {
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
    if (key === "errors") return actualValue <= reqValue;
    return actualValue >= reqValue;
  });

  return { passed, message: passed ? "Metrics meet release thresholds" : "Metrics below release thresholds" };
}

function buildStageQualityHeuristic(params: {
  stage: ProjectStage;
  documentCount: number;
  prototypeCount: number;
  signalCount: number;
  juryPassCount: number;
  metadata?: Record<string, unknown> | null;
}): StageQualityScore {
  const stageIndex = getStageIndex(params.stage);
  const checks: GraduationCheckResult["checks"] = [];

  if (stageIndex >= 1) {
    const passed = params.documentCount > 0;
    checks.push({ name: "documents", required: true, passed, message: passed ? "Documents present" : "Add at least one document" });
  }
  if (stageIndex >= 1 && stageIndex <= 5) {
    const passed = params.signalCount > 0;
    checks.push({ name: "signals", required: false, passed, message: passed ? "Signals linked" : "No signals linked yet" });
  }
  if (stageIndex >= 4) {
    const passed = params.prototypeCount > 0;
    checks.push({ name: "prototype", required: true, passed, message: passed ? "Prototype linked" : "Prototype not linked" });
  }
  if (stageIndex >= 5) {
    const passed = params.juryPassCount > 0;
    checks.push({ name: "jury", required: true, passed, message: passed ? "Jury evaluation passed" : "No passing jury evaluations" });
  }
  if (stageIndex >= 8) {
    const metricsGate = getMetricsGateStatus(params.stage, params.metadata);
    checks.push({ name: "metrics", required: true, passed: metricsGate.passed, message: metricsGate.message });
  }

  if (checks.length === 0) {
    return { score: 0.2, summary: "Quality pending", strengths: [], gaps: [], updatedAt: new Date().toISOString(), source: "heuristic" };
  }

  return buildStageQualityFromChecks(checks, "heuristic");
}

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
  const criteriaResult = params.criteriaResult ?? (await checkGraduationCriteria(params.projectId));
  if (criteriaResult.checks.length > 0) {
    return buildStageQualityFromChecks(criteriaResult.checks, "criteria");
  }

  const client = getConvexClient();
  const pid = params.projectId as Id<"projects">;

  const documentCount =
    params.documentCount !== undefined
      ? params.documentCount
      : (await client.query(api.documents.byProject, { projectId: pid })).length;

  const prototypeCount =
    params.prototypeCount !== undefined
      ? params.prototypeCount
      : (await client.query(api.prototypes.listByProject, { projectId: pid })).length;

  const juryPassCount =
    params.juryPassCount !== undefined
      ? params.juryPassCount
      : (await client.query(api.juryEvaluations.listByProject, { projectId: pid }))
          .filter((e: { verdict: string }) => e.verdict === "pass").length;

  const signalCount =
    params.signalCount !== undefined
      ? params.signalCount
      : (await client.query(api.signals.byProject, { projectId: pid })).length;

  return buildStageQualityHeuristic({
    stage: params.stage,
    metadata: params.metadata ?? null,
    documentCount,
    prototypeCount,
    signalCount,
    juryPassCount,
  });
}
