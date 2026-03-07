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
  generatedAt: string;
  objective: string;
  backlog: string[];
  lanes: SwarmLane[];
  blockers: string[];
  validationChecks: SwarmValidationCheck[];
}
