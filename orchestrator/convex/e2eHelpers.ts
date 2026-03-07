export const STUB_HITL_SCENARIO = "hitl_happy_path";

export const STUB_HITL_INITIAL_LOGS = [
  {
    level: "info",
    stepKey: "seeded",
    message: "Stub HITL scenario seeded for deterministic E2E validation",
  },
  {
    level: "info",
    stepKey: "planning",
    message: "Stub plan generated for the seeded project context",
  },
  {
    level: "info",
    stepKey: "awaiting_input",
    message: "Paused — awaiting approval from the project detail surface",
  },
] as const;

export const STUB_HITL_RESUME_LOGS = [
  {
    level: "info",
    stepKey: "resumed",
    message: "Resumed after deterministic HITL response",
  },
  {
    level: "info",
    stepKey: "completed",
    message: "Completed after deterministic HITL approval",
  },
] as const;

export function buildE2eMetadata(
  seedTag: string,
  metadata: Record<string, unknown> = {},
) {
  return {
    ...metadata,
    e2eTag: seedTag,
  };
}

export function buildStubJobInput(
  seedTag: string,
  input: Record<string, unknown> = {},
) {
  return {
    ...input,
    seeded: true,
    seedTag,
    stubScenario: STUB_HITL_SCENARIO,
  };
}

export function hasSeedTag(
  value: Record<string, unknown> | null | undefined,
  seedTag: string,
) {
  return value?.e2eTag === seedTag || value?.seedTag === seedTag;
}

export function hasTaggedText(value: string | null | undefined, seedTag: string) {
  return typeof value === "string" && value.includes(seedTag);
}
