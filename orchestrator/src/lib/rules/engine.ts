import { getProject, getColumnConfigs, getDocumentByType } from "@/lib/db/queries";
import type { ProjectStage } from "@/lib/db/schema";

const stageToDocPhase: Record<ProjectStage, "research" | "prd" | "prototype" | null> = {
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

export async function validateStageTransition(projectId: string, targetStage: ProjectStage) {
  const project = await getProject(projectId);
  if (!project) {
    return { allowed: false, reason: "Project not found" };
  }

  const columnConfigs = await getColumnConfigs(project.workspaceId);
  const column = columnConfigs.find((c) => c.stage === targetStage);
  if (!column) {
    return { allowed: true };
  }

  if (column.requiredDocuments && column.requiredDocuments.length > 0) {
    for (const docType of column.requiredDocuments) {
      const doc = await getDocumentByType(projectId, docType);
      if (!doc) {
        return { allowed: false, reason: `Missing required document: ${docType}` };
      }
    }
  }

  if (column.requiredApprovals && column.requiredApprovals > 0) {
    const phase = stageToDocPhase[targetStage];
    const approvals = project.juryEvaluations.filter((e) =>
      phase ? e.phase === phase && e.verdict === "pass" : e.verdict === "pass"
    );
    if (approvals.length < column.requiredApprovals) {
      return { allowed: false, reason: "Required approvals not met" };
    }
  }

  return { allowed: true };
}
