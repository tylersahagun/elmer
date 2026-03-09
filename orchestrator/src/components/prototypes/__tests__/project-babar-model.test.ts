import { describe, expect, it } from "vitest";
import {
  applyPrototypePrompt,
  buildPrototypeScenario,
  getJourneyPreset,
} from "../project-babar/model";

describe("project babar prototype model", () => {
  it("builds shorter summary content when the concise mode is selected", () => {
    const shortScenario = buildPrototypeScenario({ length: "short" });
    const detailedScenario = buildPrototypeScenario({ length: "detailed" });

    expect(shortScenario.summary.takeaways.length).toBeLessThan(
      detailedScenario.summary.takeaways.length,
    );
    expect(shortScenario.summary.nextSteps.length).toBeLessThan(
      detailedScenario.summary.nextSteps.length,
    );
  });

  it("saves a preference and switches to short mode when the user asks for concise summaries", () => {
    const updated = applyPrototypePrompt(
      buildPrototypeScenario(),
      "Make future discovery call summaries more concise.",
    );

    expect(updated.length).toBe("short");
    expect(updated.savedPreference).toContain("concise");
    expect(updated.chatReply).toContain("Future discovery call summaries");
  });

  it("switches the emphasis to risks when the prompt asks for executive risk visibility", () => {
    const updated = applyPrototypePrompt(
      buildPrototypeScenario(),
      "Focus this summary on risks for leadership review.",
    );

    expect(updated.highlightedSection).toBe("risks");
    expect(updated.chatReply).toContain("risks");
  });

  it("returns an error-recovery journey preset with retry guidance", () => {
    const preset = getJourneyPreset("error-recovery");

    expect(preset.status).toBe("error");
    expect(preset.activeView).toBe("inline-chat");
    expect(preset.recommendedAction).toContain("Retry");
  });
});
