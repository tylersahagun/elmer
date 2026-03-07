import { describe, expect, it } from "vitest";
import {
  buildE2eMetadata,
  buildStubJobInput,
  hasSeedTag,
  hasTaggedText,
  STUB_HITL_INITIAL_LOGS,
  STUB_HITL_RESUME_LOGS,
  STUB_HITL_SCENARIO,
} from "../../../convex/e2eHelpers";

describe("e2eHelpers", () => {
  it("adds the seed tag to project metadata", () => {
    expect(buildE2eMetadata("seed-123", { origin: "test" })).toEqual({
      origin: "test",
      e2eTag: "seed-123",
    });
  });

  it("builds stub job input with the deterministic scenario", () => {
    expect(buildStubJobInput("seed-456", { projectId: "p1" })).toEqual({
      projectId: "p1",
      seeded: true,
      seedTag: "seed-456",
      stubScenario: STUB_HITL_SCENARIO,
    });
  });

  it("detects seed tags in metadata and job input payloads", () => {
    expect(hasSeedTag({ e2eTag: "seed-a" }, "seed-a")).toBe(true);
    expect(hasSeedTag({ seedTag: "seed-b" }, "seed-b")).toBe(true);
    expect(hasSeedTag({ seedTag: "other" }, "seed-b")).toBe(false);
  });

  it("detects tagged text values", () => {
    expect(hasTaggedText("[seed-x] tagged title", "seed-x")).toBe(true);
    expect(hasTaggedText("plain title", "seed-x")).toBe(false);
  });

  it("defines deterministic stub log messages", () => {
    expect(STUB_HITL_INITIAL_LOGS.map((entry) => entry.stepKey)).toEqual([
      "seeded",
      "planning",
      "awaiting_input",
    ]);
    expect(STUB_HITL_RESUME_LOGS.map((entry) => entry.stepKey)).toEqual([
      "resumed",
      "completed",
    ]);
  });
});
