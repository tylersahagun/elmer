/**
 * Contract Tests: Stage Quality Scoring
 *
 * Validates calculated confidence/quality signals for stages.
 */

import { describe, it, expect } from "vitest";
import * as criteriaService from "@/lib/graduation/criteria-service";

describe("Stage Quality Scoring", () => {
  const projectId = "test_proj_quality";

  it("uses graduation criteria when configured", async () => {
    const criteriaResult = {
      canGraduate: false,
      criteria: null,
      enforced: false,
      overrideAllowed: true,
      checks: [
        {
          name: "requirePrototype",
          required: true,
          passed: false,
          message: "Prototype not linked",
        },
      ],
    };

    const result = await criteriaService.calculateStageQuality({
      projectId,
      stage: "prototype",
      documentCount: 0,
      prototypeCount: 0,
      signalCount: 0,
      juryPassCount: 0,
      metadata: null,
      criteriaResult,
    });

    expect(result.source).toBe("criteria");
    expect(result.score).toBe(0);
    expect(result.summary).toBe("Quality 0/1");
  });

  it("adds metrics gate for alpha stages when no criteria set", async () => {
    const criteriaResult = {
      canGraduate: true,
      criteria: null,
      enforced: false,
      overrideAllowed: true,
      checks: [],
    };
    const metadata = {
      releaseMetrics: {
        current: { adoption: 0.4, errors: 0.02 },
        thresholds: { alpha: { adoption: 0.3, errors: 0.05 } },
      },
    };

    const result = await criteriaService.calculateStageQuality({
      projectId,
      stage: "alpha",
      documentCount: 1,
      prototypeCount: 1,
      signalCount: 1,
      juryPassCount: 1,
      metadata,
      criteriaResult,
    });

    expect(result.source).toBe("heuristic");
    expect(result.score).toBe(1);
    expect(result.summary).toBe("Quality 4/4");
  });
});
