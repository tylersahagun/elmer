import {
  getProject,
  getColumnConfigs,
  getDocumentByType,
} from "@/lib/db/queries";
import type { ProjectStage, GraduationCriteria } from "@/lib/db/schema";
import {
  checkGraduationCriteria,
  type GraduationCheckResult,
} from "@/lib/graduation/criteria-service";

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
  const project = await getProject(projectId);
  if (!project) {
    return { allowed: false, reason: "Project not found" };
  }

  const columnConfigs = await getColumnConfigs(project.workspaceId);

  // Check entry requirements for target stage
  const targetColumn = columnConfigs.find((c) => c.stage === targetStage);
  if (targetColumn) {
    // Check required documents for entry
    if (
      targetColumn.requiredDocuments &&
      targetColumn.requiredDocuments.length > 0
    ) {
      for (const docType of targetColumn.requiredDocuments) {
        const doc = await getDocumentByType(projectId, docType);
        if (!doc) {
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
      const approvals = project.juryEvaluations.filter((e) =>
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
  const currentColumn = columnConfigs.find((c) => c.stage === project.stage);
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
