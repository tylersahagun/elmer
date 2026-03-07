export type SwarmPreset = "flagship" | "phase-1" | "phase-2" | "phase-3";

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
  backlog: string[];
  lanes: SwarmLane[];
  blockers: string[];
  validationChecks: SwarmValidationCheck[];
}
