type JobType = string;
import type { SwarmLane, SwarmPreset, SwarmReport } from "./types";

const NO_JOBS: JobType[] = [];

const SWARM_PRESETS: Record<
  SwarmPreset,
  {
    objective: string;
    releaseTarget: string;
    sourceOfTruth: string;
    lanes: Array<
      Omit<SwarmLane, "blockers" | "jobs">
    >;
    jobTypes: JobType[];
    validationChecks: Array<{ label: string; evidence?: string }>;
  }
> = {
  "internal-alpha": {
    objective:
      "Coordinate the Elmer internal-alpha reset with Linear as canonical truth and gated execution across reliability, tests, memory cutover, Convex migration, runtime collaboration, and alpha UX.",
    releaseTarget: "Internal production alpha",
    sourceOfTruth:
      "Linear is canonical for issue state and sequencing. Saved swarm artifacts are derived coordination snapshots only.",
    lanes: [
      {
        id: "source-of-truth",
        name: "Source Of Truth",
        owner: "coordinator",
        status: "active",
        focus:
          "Reconcile docs and swarm artifacts against Linear, keep execution framing coherent, and publish daily derived control-room status.",
        linkedIssues: ["GTM-106"],
        dependencies: [],
        exitCriteria: [
          "Swarm presets match the reset critical path",
          "Derived artifacts state that Linear is canonical",
          "Coordinator tracker stays aligned with live lane state",
        ],
        evidence: [
          "Updated swarm dashboard and operating contract",
          "Daily artifact or checkpoint note reconciled against Linear",
        ],
        nextAction:
          "Refresh the swarm control plane and publish the daily coordinator snapshot.",
        handoffRequest:
          "Each lane owner should update Linear before requesting doc or merge-order changes.",
      },
      {
        id: "reliability",
        name: "Reliability",
        owner: "platform-auth",
        status: "ready",
        focus:
          "Finish the remaining auth, smoke-check, and runbook work now that the first Clerk incident fixes have landed.",
        linkedIssues: ["GTM-95", "GTM-97", "GTM-98"],
        dependencies: ["Source Of Truth lane publishes the current gate state"],
        exitCriteria: [
          "`https://elmer.studio/login` is trustworthy",
          "`npm run check:auth` is the real release gate",
          "Deployment/auth docs match the live stack",
        ],
        evidence: [
          "Auth smoke output",
          "Public login verification",
          "Updated deployment guidance",
        ],
        nextAction:
          "Close the remaining reliability tail: docs, smoke checks, and legacy auth cleanup.",
      },
      {
        id: "test-baseline",
        name: "Test Baseline",
        owner: "test-infra",
        status: "ready",
        focus:
          "Turn the current smoke scaffold into deterministic seeded E2E coverage that can gate the internal alpha.",
        linkedIssues: ["GTM-78", "GTM-82", "GTM-83", "GTM-84"],
        dependencies: [
          "Reliability lane is stable enough to run deterministic browser checks",
        ],
        exitCriteria: [
          "Seeded core E2E paths pass reliably",
          "Smoke coverage is broad enough to catch route regressions",
          "The minimum suite is ready for CI and release gating",
        ],
        evidence: [
          "Passing Playwright output",
          "Seed helpers or stubs for inbox and agent execution",
        ],
        nextAction:
          "Finish POM coverage, seeded inbox coverage, and the first stubbed agent execution flow.",
      },
      {
        id: "memory-cutover",
        name: "Memory Cutover",
        owner: "memory-architect",
        status: "blocked",
        focus:
          "Make Convex graph-backed memory the runtime authority so context, search direction, and compatibility mirrors stop competing.",
        linkedIssues: ["GTM-104", "GTM-105"],
        dependencies: ["Source Of Truth lane publishes the canonical memory contract"],
        exitCriteria: [
          "One canonical runtime memory contract exists",
          "Cutover surfaces stop depending on legacy context fallbacks",
          "Personas and knowledge surfaces are treated as lenses or mirrors, not separate authorities",
        ],
        evidence: [
          "Published memory-cutover contract",
          "Explicit inventory of remaining legacy context fallbacks",
        ],
        nextAction:
          "Land the memory-cutover contract first, then remove fallbacks from surfaces already declared Convex-first.",
        handoffRequest:
          "Migration lane should not finalize `/search` or persona boundaries before the memory contract is explicit.",
      },
      {
        id: "convex-migration",
        name: "Convex Migration",
        owner: "migration-lead",
        status: "ready",
        focus:
          "Burn down the named Phase 7 blockers and keep the first Convex route tranche stable for daily internal use.",
        linkedIssues: [
          "GTM-59",
          "GTM-99",
          "GTM-100",
          "GTM-101",
          "GTM-102",
          "GTM-103",
        ],
        dependencies: [
          "Reliability lane is stable enough to validate runtime behavior",
          "Memory Cutover lane defines runtime authority for context and search",
        ],
        exitCriteria: [
          "High-traffic routes are stable on Convex-native paths",
          "Remaining blockers are resolved or marked as intentional server-side boundaries",
          "Project detail, settings, and search have explicit implementation paths",
        ],
        evidence: [
          "Updated migration-readiness classifications",
          "Named blocker decisions with route-level implications",
        ],
        nextAction:
          "Sequence the blocker work: memberships, GitHub/settings boundaries, search, then project detail parity.",
      },
      {
        id: "runtime-collaboration",
        name: "Runtime Collaboration",
        owner: "runtime-ui",
        status: "ready",
        focus:
          "Finish attribution, presence, orchestrator visibility, and team access so the app is safe for concurrent internal use.",
        linkedIssues: ["GTM-55", "GTM-58", "GTM-69", "GTM-70"],
        dependencies: [
          "Core routes remain stable enough for multi-user validation",
          "Convex Migration lane keeps collaboration surfaces off regressing boundaries",
        ],
        exitCriteria: [
          "Agent runs are attributable end-to-end",
          "Core surfaces show who is active where",
          "The orchestrator exposes usable project-health visibility",
          "Internal-team access/onboarding is ready",
        ],
        evidence: [
          "Visible blame-chain UI",
          "Visible presence UI",
          "Orchestrator health/proposals evidence",
        ],
        nextAction:
          "Treat GTM-69 and GTM-70 as completion work, keep GTM-55 downstream of the core gates, and only open GTM-58 when the runtime is stable enough to onboard teammates.",
        handoffRequest:
          "Do not promote GTM-55 as active implementation until reliability, tests, memory cutover, and migration are all holding.",
      },
      {
        id: "internal-alpha-ux",
        name: "Internal Alpha UX",
        owner: "alpha-release",
        status: "gated",
        focus:
          "Prepare the production-alpha cohort, feedback loop, and Chat/Agent Hub rollout without weakening the core release gate.",
        linkedIssues: [
          "GTM-107",
          "GTM-71",
          "GTM-72",
          "GTM-73",
          "GTM-74",
          "GTM-75",
          "GTM-76",
          "GTM-77",
        ],
        dependencies: [
          "Reliability lane holds",
          "Test Baseline lane holds",
          "Memory Cutover lane holds",
          "Convex Migration lane holds",
        ],
        exitCriteria: [
          "Internal alpha cohort and test script are defined",
          "Each alpha session produces structured Linear follow-up",
          "Chat/Agent Hub work stays on the stable Convex foundation",
        ],
        evidence: [
          "Alpha test script",
          "Feature-flag or rollout plan",
          "Structured Linear intake path for dogfood feedback",
        ],
        nextAction:
          "Keep GTM-107 active; treat GTM-71 to GTM-77 as planning/spec unless the core lanes are holding.",
        handoffRequest:
          "Chat or Agent Hub implementation must not bypass the reliability, testing, memory, and migration release gates.",
      },
    ],
    jobTypes: NO_JOBS,
    validationChecks: [
      {
        label: "Derived artifact points back to Linear truth",
        evidence: "Swarm dashboard + saved artifact note",
      },
      {
        label: "Release gate stays anchored on reliability, tests, memory, and migration",
        evidence: "Lane dependencies and merge order",
      },
    ],
  },
  "stability-gates": {
    objective:
      "Focus on the four internal-alpha release gates: reliability, deterministic tests, memory cutover, and Convex migration.",
    releaseTarget: "Internal production alpha",
    sourceOfTruth:
      "Linear is canonical for state. This preset is a derived execution grouping for the current release gates.",
    lanes: [
      {
        id: "reliability",
        name: "Reliability",
        owner: "platform-auth",
        status: "active",
        focus: "Auth, deployment, and smoke checks",
        linkedIssues: ["GTM-95", "GTM-97", "GTM-98"],
        dependencies: [],
        exitCriteria: [
          "Public login is healthy",
          "Smoke checks are trustworthy",
          "Docs match the live stack",
        ],
        evidence: ["Auth smoke output", "Deployment guide updates"],
        nextAction: "Finish the remaining reliability tail.",
      },
      {
        id: "test-baseline",
        name: "Test Baseline",
        owner: "test-infra",
        status: "ready",
        focus: "Seeded E2E coverage and CI-ready release gates",
        linkedIssues: ["GTM-78", "GTM-82", "GTM-83", "GTM-84"],
        dependencies: ["Reliability lane holds well enough to test"],
        exitCriteria: [
          "Deterministic seeded core flows",
          "Smoke suite ready for CI",
        ],
        evidence: ["Playwright output", "Seed fixtures or stubs"],
        nextAction: "Complete the minimum credible test baseline.",
      },
      {
        id: "memory-cutover",
        name: "Memory Cutover",
        owner: "memory-architect",
        status: "blocked",
        focus: "Canonical runtime memory contract and fallback removal",
        linkedIssues: ["GTM-104", "GTM-105"],
        dependencies: [],
        exitCriteria: [
          "Graph-backed memory is runtime authority",
          "Legacy context fallbacks are removed from cutover surfaces",
        ],
        evidence: ["Memory contract", "Fallback inventory"],
        nextAction: "Publish the contract and then cut over runtime paths.",
      },
      {
        id: "convex-migration",
        name: "Convex Migration",
        owner: "migration-lead",
        status: "ready",
        focus: "Named blocker burn-down for the remaining Phase 7 tail",
        linkedIssues: [
          "GTM-59",
          "GTM-99",
          "GTM-100",
          "GTM-101",
          "GTM-102",
          "GTM-103",
        ],
        dependencies: ["Memory Cutover lane defines runtime authority"],
        exitCriteria: [
          "Blockers are resolved or explicit boundaries",
          "High-traffic routes are stable on Convex",
        ],
        evidence: ["Migration readiness map", "Blocker issue updates"],
        nextAction: "Work blocker issues in dependency order, not in parallel chaos.",
      },
    ],
    jobTypes: NO_JOBS,
    validationChecks: [
      {
        label: "All four alpha gates have explicit owners and evidence",
        evidence: "Preset lane metadata",
      },
    ],
  },
  "runtime-collaboration": {
    objective:
      "Coordinate the collaboration/runtime lane without promoting it ahead of the alpha release gates.",
    releaseTarget: "Internal production alpha",
    sourceOfTruth:
      "Linear is canonical. This preset exists to coordinate runtime-collaboration slices once the core gates are holding well enough.",
    lanes: [
      {
        id: "source-of-truth",
        name: "Source Of Truth",
        owner: "coordinator",
        status: "active",
        focus: "Keep the runtime lane aligned with the live release gates",
        linkedIssues: ["GTM-106"],
        dependencies: [],
        exitCriteria: ["Lane sequencing stays aligned with Linear"],
        evidence: ["Coordinator checkpoint"],
        nextAction: "Confirm which runtime slices are truly unblocked before work starts.",
      },
      {
        id: "runtime-collaboration",
        name: "Runtime Collaboration",
        owner: "runtime-ui",
        status: "ready",
        focus: "Attribution, presence, orchestrator visibility, and team access",
        linkedIssues: ["GTM-55", "GTM-58", "GTM-69", "GTM-70"],
        dependencies: [
          "Reliability, tests, memory cutover, and migration are stable enough to support internal multi-user validation",
        ],
        exitCriteria: [
          "Blame chain is complete",
          "Presence is visible on core surfaces",
          "GTM-55 moves beyond the current stub",
          "Internal-team access is ready",
        ],
        evidence: [
          "Visible blame/presence UI",
          "Non-stub orchestrator evidence",
        ],
        nextAction:
          "Complete GTM-69 and GTM-70 first, then open GTM-55 and GTM-58 in that order.",
        handoffRequest:
          "Runtime lane should request memory/migration confirmation before claiming GTM-55 is ready for merge.",
      },
    ],
    jobTypes: NO_JOBS,
    validationChecks: [
      {
        label: "Runtime lane still honors the core alpha release gates",
        evidence: "Lane dependency list",
      },
    ],
  },
  "chat-readiness": {
    objective:
      "Keep Chat / Agent Hub planning visible without allowing premature implementation ahead of the stable Convex foundation.",
    releaseTarget: "Internal production alpha",
    sourceOfTruth:
      "Linear is canonical. Chat and Agent Hub remain gated until the lower-level lanes are holding.",
    lanes: [
      {
        id: "internal-alpha-ux",
        name: "Internal Alpha UX",
        owner: "alpha-release",
        status: "gated",
        focus:
          "Alpha test script, feedback loop, and Chat/Agent Hub rollout planning on top of the stable foundation.",
        linkedIssues: [
          "GTM-107",
          "GTM-71",
          "GTM-72",
          "GTM-73",
          "GTM-74",
          "GTM-75",
          "GTM-76",
          "GTM-77",
        ],
        dependencies: [
          "Reliability lane holds",
          "Test Baseline lane holds",
          "Memory Cutover lane holds",
          "Convex Migration lane holds",
        ],
        exitCriteria: [
          "Alpha cohort and script exist",
          "Feedback always lands in Linear",
          "Chat work is built on the stable Convex foundation",
        ],
        evidence: [
          "Alpha script",
          "Feedback intake path",
          "Chat rollout guardrail",
        ],
        nextAction:
          "Keep GTM-107 active; keep GTM-71 to GTM-77 at planning/spec unless the gates are holding.",
        handoffRequest:
          "If a Chat branch needs merge priority, it must show why it does not weaken the alpha release gate.",
      },
    ],
    jobTypes: NO_JOBS,
    validationChecks: [
      {
        label: "Chat work stays gated behind the stable foundation",
        evidence: "Preset dependency metadata",
      },
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
    releaseTarget: presetConfig.releaseTarget,
    sourceOfTruth: presetConfig.sourceOfTruth,
    backlog: params.backlog,
    lanes: presetConfig.lanes.map((lane) => ({
      ...lane,
      blockers: [],
      jobs: presetConfig.jobTypes.map((jobType, index) => ({
        id: `${lane.id}-${jobType}-${index}`,
        type: jobType,
        label: jobType.replaceAll("_", " "),
        status: "pending",
        progress: 0,
      })),
    })),
    blockers: [],
    validationChecks: presetConfig.validationChecks,
  };
}

export function getAvailableSwarmPresets(): SwarmPreset[] {
  return Object.keys(SWARM_PRESETS) as SwarmPreset[];
}
