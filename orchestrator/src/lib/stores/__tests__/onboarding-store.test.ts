import { describe, expect, it } from "vitest";
import { normalizeOnboardingStep } from "../onboarding-store";

describe("normalizeOnboardingStep", () => {
  it("maps legacy onboarding steps to guided setup", () => {
    expect(normalizeOnboardingStep("select-repo")).toBe("guided-setup");
    expect(normalizeOnboardingStep("map-context")).toBe("guided-setup");
  });

  it("preserves current onboarding steps", () => {
    expect(normalizeOnboardingStep("welcome")).toBe("welcome");
    expect(normalizeOnboardingStep("guided-setup")).toBe("guided-setup");
    expect(normalizeOnboardingStep("discover")).toBe("discover");
    expect(normalizeOnboardingStep("complete")).toBe("complete");
  });

  it("falls back to welcome for unknown values", () => {
    expect(normalizeOnboardingStep("unexpected-step")).toBe("welcome");
    expect(normalizeOnboardingStep(undefined)).toBe("welcome");
  });
});
