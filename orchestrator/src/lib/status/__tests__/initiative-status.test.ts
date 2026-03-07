import { describe, expect, it } from "vitest";
import {
  calculateArtifactCompleteness,
  getArtifactStatusForStage,
  getMeasurementReadiness,
  getNextSuggestedCommand,
} from "../initiative-status";

describe("initiative status helpers", () => {
  it("marks required artifacts as missing for the current stage", () => {
    const artifacts = getArtifactStatusForStage("prototype", new Set(["research", "prd"]));

    expect(artifacts.research).toBe("complete");
    expect(artifacts.prd).toBe("complete");
    expect(artifacts.design_brief).toBe("missing");
    expect(artifacts.prototype_notes).toBe("missing");
    expect(artifacts.metrics).toBe("not_required");
  });

  it("calculates completeness from required artifacts only", () => {
    const artifacts = getArtifactStatusForStage(
      "design",
      new Set(["research", "prd"]),
    );

    expect(calculateArtifactCompleteness("design", artifacts)).toBeCloseTo(2 / 3);
  });

  it("detects measurement readiness states", () => {
    expect(getMeasurementReadiness(false, null)).toBe("missing");
    expect(
      getMeasurementReadiness(true, {
        thresholds: { alpha: { users: 10 } },
      }),
    ).toBe("partial");
    expect(
      getMeasurementReadiness(true, {
        current: { users: 10, engagement: 60, errors: 1, satisfaction: 4 },
        thresholds: {
          alpha: { users: 10, engagement: 60, errors: 1, satisfaction: 4 },
        },
      }),
    ).toBe("instrumented");
  });

  it("suggests the right next command from artifact and measurement gaps", () => {
    expect(
      getNextSuggestedCommand({
        stage: "prd",
        artifacts: {
          research: "complete",
          prd: "missing",
          design_brief: "not_required",
          engineering_spec: "not_required",
          gtm_brief: "not_required",
          prototype_notes: "not_required",
          jury_report: "not_required",
          metrics: "not_required",
        },
        measurementReadiness: "missing",
        canAdvance: false,
      }),
    ).toBe("/pm");

    expect(
      getNextSuggestedCommand({
        stage: "build",
        artifacts: {
          research: "complete",
          prd: "complete",
          design_brief: "complete",
          engineering_spec: "complete",
          gtm_brief: "not_required",
          prototype_notes: "complete",
          jury_report: "not_required",
          metrics: "missing",
        },
        measurementReadiness: "missing",
        canAdvance: false,
      }),
    ).toBe("/measure");
  });
});
