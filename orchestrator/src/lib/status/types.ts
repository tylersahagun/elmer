import type { DocumentType, ProjectStage, ProjectStatus } from "@/lib/db/schema";

export const STATUS_ARTIFACT_TYPES: DocumentType[] = [
  "research",
  "prd",
  "design_brief",
  "engineering_spec",
  "gtm_brief",
  "prototype_notes",
  "jury_report",
  "metrics",
];

export type ArtifactState =
  | "complete"
  | "missing"
  | "not_required";

export type MeasurementReadiness =
  | "instrumented"
  | "partial"
  | "missing";

export interface ArtifactStatusMap {
  [key: string]: ArtifactState;
}

export interface InitiativeStatusSnapshot {
  id: string;
  name: string;
  description?: string | null;
  stage: ProjectStage;
  status: ProjectStatus;
  priority: number;
  updatedAt: string;
  createdAt: string;
  daysSinceUpdate: number;
  stale: boolean;
  artifactCompleteness: number;
  artifacts: ArtifactStatusMap;
  measurementReadiness: MeasurementReadiness;
  signalCount: number;
  documentCount: number;
  prototypeCount: number;
  readinessScore: number;
  readinessLabel: string;
  canAdvance: boolean;
  graduationEnforced: boolean;
  blockers: string[];
  nextSuggestedCommand: string;
}

export interface StatusSummary {
  totalProjects: number;
  readyToAdvance: number;
  needsAttention: number;
  staleProjects: number;
  byStage: Record<string, number>;
  byStatus: Record<string, number>;
}

export interface PrioritizedAction {
  projectId: string;
  projectName: string;
  priority: number;
  reason: string;
  command: string;
  score: number;
}

export interface WorkspaceStatusReport {
  workspaceId: string;
  workspaceName: string;
  generatedAt: string;
  savedAt?: string;
  summary: StatusSummary;
  healthScore: number;
  initiatives: InitiativeStatusSnapshot[];
  attentionRequired: InitiativeStatusSnapshot[];
  readyToAdvance: InitiativeStatusSnapshot[];
  actionQueue: PrioritizedAction[];
  measurementCoverage: Record<MeasurementReadiness, number>;
}
