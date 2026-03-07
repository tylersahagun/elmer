export type SwarmPreset =
  | "internal-alpha"
  | "stability-gates"
  | "runtime-collaboration"
  | "chat-readiness";

export type SwarmLaneStatus =
  | "active"
  | "ready"
  | "blocked"
  | "gated"
  | "holding";

export interface SwarmLaneJob {
  id: string;
  type: string;
  label: string;
  status: "pending" | "running" | "waiting_input" | "completed" | "failed" | "cancelled";
  progress?: number | null;
  error?: string | null;
}

export interface SwarmLane {
  id: string;
  name: string;
  focus: string;
  owner: string;
  status: SwarmLaneStatus;
  linkedIssues: string[];
  dependencies: string[];
  exitCriteria: string[];
  evidence: string[];
  nextAction: string;
  handoffRequest?: string | null;
  blockers: string[];
  jobs: SwarmLaneJob[];
}

export interface SwarmValidationCheck {
  label: string;
  evidence?: string;
}

export interface SwarmReport {
  workspaceId: string;
  workspaceName: string;
  preset: SwarmPreset;
  generatedAt: string;
  objective: string;
  releaseTarget: string;
  sourceOfTruth: string;
  backlog: string[];
  lanes: SwarmLane[];
  blockers: string[];
  validationChecks: SwarmValidationCheck[];
}
