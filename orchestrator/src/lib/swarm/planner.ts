import type { SwarmPreset, SwarmReport } from "./types";

const SWARM_PRESETS: Record<
  SwarmPreset,
  {
    objective: string;
    lanes: Array<{
      id: string;
      name: string;
      owner: string;
      focus: string;
    }>;
    validationChecks: Array<{ label: string; evidence?: string }>;
  }
> = {
  flagship: {
    objective:
      "Execute the flagship multi-lane product swarm with clear ownership across memory, integrations, runtime, and desktop UX.",
    lanes: [
      {
        id: "memory-platform",
        name: "Memory Platform",
        owner: "workspace-admin",
        focus: "Durable knowledge, status artifacts, and context integrity",
      },
      {
        id: "integrations",
        name: "Integrations",
        owner: "signals-processor",
        focus: "Signal/webhook flows, sync surfaces, and external connectors",
      },
      {
        id: "agent-runtime",
        name: "Agent Runtime",
        owner: "validator",
        focus: "Execution visibility, approvals, and reliable orchestration",
      },
      {
        id: "desktop-experience",
        name: "Desktop Experience",
        owner: "proto-builder",
        focus: "Control-plane UX, projects, status, and workflow clarity",
      },
    ],
    validationChecks: [
      { label: "Workspace status report saves", evidence: "status-all snapshot" },
      { label: "Execution surfaces render active context", evidence: "job logs + pending question UI" },
    ],
  },
  "phase-1": {
    objective:
      "Focus the swarm on memory backend, workspace context integrity, and live integrations.",
    lanes: [
      {
        id: "memory-platform",
        name: "Memory Platform",
        owner: "workspace-admin",
        focus: "Status artifacts, knowledge roots, and durable context",
      },
      {
        id: "integrations",
        name: "Integrations",
        owner: "signals-processor",
        focus: "Webhook intake, sync flows, and project signal coverage",
      },
    ],
    validationChecks: [
      { label: "Webhook intake documented", evidence: "Inbox webhook setup" },
      { label: "Status artifacts persist", evidence: "pm-workspace-docs/status/" },
    ],
  },
  "phase-2": {
    objective:
      "Focus the swarm on runtime APIs, HITL controls, and execution observability.",
    lanes: [
      {
        id: "agent-runtime",
        name: "Agent Runtime",
        owner: "validator",
        focus: "Pending questions, approvals, and execution state transitions",
      },
      {
        id: "control-center",
        name: "Control Center",
        owner: "workspace-admin",
        focus: "Stage recipe visibility, command parity, and execution history",
      },
    ],
    validationChecks: [
      { label: "Pending questions are actionable", evidence: "Question inbox + modal" },
      { label: "Runtime context visible", evidence: "Execution panel input/output" },
    ],
  },
  "phase-3": {
    objective:
      "Focus the swarm on desktop flagship UX, status visibility, and end-to-end project productivity.",
    lanes: [
      {
        id: "desktop-experience",
        name: "Desktop Experience",
        owner: "proto-builder",
        focus: "Workspace navigation, status, swarm, and project usability",
      },
      {
        id: "onboarding",
        name: "Onboarding",
        owner: "workspace-admin",
        focus: "Repo context mapping, workflow defaults, and guided setup",
      },
    ],
    validationChecks: [
      { label: "Status page available", evidence: "/workspace/[id]/status" },
      { label: "Swarm page available", evidence: "/workspace/[id]/swarm" },
    ],
  },
};

export function buildSwarmReport(params: {
  workspaceId: string;
  workspaceName: string;
  preset: SwarmPreset;
  backlog: string[];
}): SwarmReport {
  const presetConfig = SWARM_PRESETS[params.preset];
  return {
    workspaceId: params.workspaceId,
    workspaceName: params.workspaceName,
    preset: params.preset,
    generatedAt: new Date().toISOString(),
    objective: presetConfig.objective,
    backlog: params.backlog,
    lanes: presetConfig.lanes.map((lane) => ({
      ...lane,
      blockers: [],
    })),
    blockers: [],
    validationChecks: presetConfig.validationChecks,
  };
}

export function getAvailableSwarmPresets(): SwarmPreset[] {
  return Object.keys(SWARM_PRESETS) as SwarmPreset[];
}
