import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import {
  checkGraduationCriteria,
  type GraduationCheckResult,
} from "@/lib/graduation/criteria-service";

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

interface GraduationCriteria {
  requiredDocuments?: string[];
  minApprovalRate?: number;
  minJuryEvaluations?: number;
  requirePrototype?: boolean;
  minSignalsProcessed?: number;
  requireMetricsGate?: boolean;
  allowManualOverride?: boolean;
}

function getConvexClient() {
  return new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
}

const stageToDocPhase: Record<
  ProjectStage,
  "research" | "prd" | "prototype" | null
> = {
  inbox: null,
  discovery: "research",
  prd: "prd",
  design: "prd",
  prototype: "prototype",
  validate: "prototype",
  tickets: "prd",
  build: "prd",
  alpha: "prototype",
  beta: "prototype",
  ga: "prototype",
};

export interface StageTransitionResult {
  allowed: boolean;
  reason?: string;
  graduationCheck?: GraduationCheckResult;
  blockedBy?: "document" | "approval" | "graduation";
}

export async function validateStageTransition(
  projectId: string,
  targetStage: ProjectStage,
  options?: { forceOverride?: boolean },
): Promise<StageTransitionResult> {
  const client = getConvexClient();

  const project = await client.query(api.projects.get, {
    projectId: projectId as Id<"projects">,
  });
  if (!project) {
    return { allowed: false, reason: "Project not found" };
  }

  const columnConfigs = await client.query(api.columns.listByWorkspace, {
    workspaceId: project.workspaceId as Id<"workspaces">,
  });

  // Check entry requirements for target stage
  const targetColumn = columnConfigs.find(
    (c: { stage: string }) => c.stage === targetStage,
  ) as {
    stage: string;
    requiredDocuments?: string[];
    requiredApprovals?: number;
    enforceGraduation?: boolean;
    graduationCriteria?: GraduationCriteria;
  } | undefined;

  if (targetColumn) {
    // Check required documents for entry
    if (
      targetColumn.requiredDocuments &&
      targetColumn.requiredDocuments.length > 0
    ) {
      const projectDocs = await client.query(api.documents.byProject, {
        projectId: projectId as Id<"projects">,
      });
      const docTypeSet = new Set(
        projectDocs.map((d: { type: string }) => d.type),
      );
      for (const docType of targetColumn.requiredDocuments) {
        if (!docTypeSet.has(docType)) {
          return {
            allowed: false,
            reason: `Missing required document: ${docType}`,
            blockedBy: "document",
          };
        }
      }
    }

    // Check required approvals for entry
    if (targetColumn.requiredApprovals && targetColumn.requiredApprovals > 0) {
      const phase = stageToDocPhase[targetStage];
      const juryEvaluations = await client.query(
        api.juryEvaluations.listByProject,
        { projectId: projectId as Id<"projects"> },
      );
      const approvals = juryEvaluations.filter((e: { phase?: string; verdict: string }) =>
        phase
          ? e.phase === phase && e.verdict === "pass"
          : e.verdict === "pass",
      );
      if (approvals.length < targetColumn.requiredApprovals) {
        return {
          allowed: false,
          reason: "Required approvals not met",
          blockedBy: "approval",
        };
      }
    }
  }

  // Check graduation criteria for exiting current stage
  const currentColumn = columnConfigs.find(
    (c: { stage: string }) => c.stage === project.stage,
  ) as {
    stage: string;
    enforceGraduation?: boolean;
    graduationCriteria?: GraduationCriteria;
  } | undefined;

  if (currentColumn?.enforceGraduation && currentColumn?.graduationCriteria) {
    const graduationCheck = await checkGraduationCriteria(projectId);

    if (!graduationCheck.canGraduate) {
      // If force override is allowed and requested
      if (options?.forceOverride && graduationCheck.overrideAllowed) {
        return {
          allowed: true,
          graduationCheck,
          reason: "Graduation criteria bypassed with override",
        };
      }

      // If not enforced, allow with warning
      if (!graduationCheck.enforced) {
        return {
          allowed: true,
          graduationCheck,
          reason: "Graduation criteria not met (not enforced)",
        };
      }

      // Block the transition
      const failedChecks = graduationCheck.checks.filter((c) => !c.passed);
      const reasons = failedChecks.map((c) => c.message);

      return {
        allowed: false,
        reason: `Graduation criteria not met: ${reasons.join("; ")}`,
        graduationCheck,
        blockedBy: "graduation",
      };
    }

    return { allowed: true, graduationCheck };
  }

  return { allowed: true };
}
