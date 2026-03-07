import type { KanbanColumn } from "@/lib/store";

export interface WorkspaceColumnConfig {
  id: string;
  stage: string;
  displayName: string;
  color: string;
  order: number;
  enabled: boolean;
  autoTriggerJobs?: string[];
  agentTriggers?: Array<{
    agentDefinitionId: string;
    priority: number;
    conditions?: Record<string, unknown>;
  }>;
  humanInLoop?: boolean;
  requiredDocuments?: string[];
  requiredApprovals?: number;
  rules?: {
    contextPaths?: string[];
    contextNotes?: string;
    loopGroupId?: string;
    loopTargets?: string[];
    dependencyNotes?: string;
  };
}

export function mapWorkspaceColumnToKanbanColumn(
  column: WorkspaceColumnConfig,
): KanbanColumn {
  return {
    id: column.stage as KanbanColumn["id"],
    configId: column.id,
    displayName: column.displayName,
    color: column.color,
    order: column.order,
    enabled: column.enabled,
    autoTriggerJobs: column.autoTriggerJobs,
    agentTriggers: column.agentTriggers ?? [],
    humanInLoop: column.humanInLoop,
    requiredDocuments: column.requiredDocuments,
    requiredApprovals: column.requiredApprovals,
    contextPaths: column.rules?.contextPaths,
    contextNotes: column.rules?.contextNotes,
    loopGroupId: column.rules?.loopGroupId,
    loopTargets: column.rules?.loopTargets,
    dependencyNotes: column.rules?.dependencyNotes,
  };
}

export function resolveWorkspaceColumns(
  columns: WorkspaceColumnConfig[] | undefined | null,
  fallback: KanbanColumn[],
) {
  if (!columns?.length) {
    return fallback;
  }

  return columns
    .map(mapWorkspaceColumnToKanbanColumn)
    .sort((a, b) => a.order - b.order);
}
