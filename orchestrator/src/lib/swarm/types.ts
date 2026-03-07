export type SwarmPreset = "flagship" | "phase-1" | "phase-2" | "phase-3";

export interface SwarmLane {
  id: string;
  name: string;
  focus: string;
  owner: string;
  blockers: string[];
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
