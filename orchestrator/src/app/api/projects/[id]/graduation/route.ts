import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import { getConvexProjectWithDocuments } from "@/lib/convex/server";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";

function getConvexClient() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is required");
  return new ConvexHttpClient(url);
}

type GraduationCheck = {
  name: string;
  required: boolean;
  passed: boolean;
  message: string;
  details?: Record<string, unknown>;
};

type GraduationCriteria = {
  requiredDocuments?: string[];
  minApprovalRate?: number;
  minJuryEvaluations?: number;
  requirePrototype?: boolean;
  minSignalsProcessed?: number;
  requireMetricsGate?: boolean;
  allowManualOverride?: boolean;
};

/**
 * Check graduation criteria for a project using Convex data.
 */
async function checkGraduationCriteriaConvex(projectId: string): Promise<{
  canGraduate: boolean;
  criteria: GraduationCriteria | null;
  enforced: boolean;
  checks: GraduationCheck[];
  overrideAllowed: boolean;
}> {
  const client = getConvexClient();
  const projectData = await getConvexProjectWithDocuments(projectId);

  if (!projectData) {
    return {
      canGraduate: false,
      criteria: null,
      enforced: false,
      checks: [
        { name: "project", required: true, passed: false, message: "Project not found" },
      ],
      overrideAllowed: false,
    };
  }

  const project = projectData.project as {
    _id: string;
    workspaceId: string;
    stage: string;
    metadata?: Record<string, unknown> | null;
  };

  // Get column config for current stage
  const columns = (await client.query(api.columns.listByWorkspace, {
    workspaceId: project.workspaceId as Id<"workspaces">,
  })) as Array<{
    stage: string;
    graduationCriteria?: GraduationCriteria | null;
    enforceGraduation?: boolean;
  }>;

  const column = columns.find((c) => c.stage === project.stage);
  const criteria = column?.graduationCriteria ?? null;
  const enforced = column?.enforceGraduation ?? false;

  if (!criteria) {
    return {
      canGraduate: true,
      criteria: null,
      enforced: false,
      checks: [],
      overrideAllowed: true,
    };
  }

  const checks: GraduationCheck[] = [];

  // Check required documents
  if (criteria.requiredDocuments && criteria.requiredDocuments.length > 0) {
    const docs = (await client.query(api.documents.byProject, {
      projectId: projectId as Id<"projects">,
    })) as Array<{ type: string }>;
    const docTypes = new Set(docs.map((d) => d.type));
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
    const evaluations = (await client.query(api.juryEvaluations.listByProject, {
      projectId: projectId as Id<"projects">,
    })) as Array<{ approvalRate: number }>;
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
    const evaluations = (await client.query(api.juryEvaluations.listByProject, {
      projectId: projectId as Id<"projects">,
    })) as Array<unknown>;
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
    const prototypes = (await client.query(api.prototypes.listByProject, {
      projectId: projectId as Id<"projects">,
    })) as Array<unknown>;
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
    const signals = (await client.query(api.signals.byProject, {
      projectId: projectId as Id<"projects">,
    })) as Array<unknown>;
    const count = signals.length;
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
        return key === "errors" ? actualValue <= reqValue : actualValue >= reqValue;
      });
      message = passed ? "Metrics meet release thresholds" : "Metrics do not meet release thresholds";
    }

    checks.push({
      name: "requireMetricsGate",
      required: true,
      passed,
      message,
      details: { metrics },
    });
  }

  const allPassed = checks.every((c) => c.passed);
  const overrideAllowed = criteria.allowManualOverride ?? true;

  return { canGraduate: allPassed, criteria, enforced, checks, overrideAllowed };
}

/**
 * GET /api/projects/[id]/graduation
 *
 * Check if a project meets graduation criteria for its current stage.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const projectData = await getConvexProjectWithDocuments(id);
    if (!projectData) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const project = projectData.project as {
      workspaceId: string;
      stage: string;
    };

    await requireWorkspaceAccess(project.workspaceId, "viewer");

    const result = await checkGraduationCriteriaConvex(id);

    return NextResponse.json({
      projectId: id,
      currentStage: project.stage,
      ...result,
    });
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to check graduation criteria:", error);
    return NextResponse.json(
      { error: "Failed to check graduation criteria" },
      { status: 500 },
    );
  }
}
