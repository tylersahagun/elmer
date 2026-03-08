import { describe, expect, it } from "vitest";
import {
  getLifecycleTemplate,
  inferGuidedSetupDefaults,
  resolveLifecycleTemplateId,
} from "../guided-setup";

describe("guided setup defaults", () => {
  it("prefers detected repo paths when no existing workspace settings are present", () => {
    expect(
      inferGuidedSetupDefaults({
        detectedPaths: [
          { type: "context", path: "pm-workspace-docs" },
          { type: "context", path: "signals" },
          { type: "prototypes", path: "src/components/prototypes" },
        ],
      }),
    ).toMatchObject({
      contextPaths: ["pm-workspace-docs/", "signals/"],
      prototypesPath: "src/components/prototypes/",
      lifecycleTemplateId: "assisted",
      automationMode: "auto_to_stage",
      automationStopStage: "prototype",
    });
  });

  it("preserves existing workspace paths over inferred repo suggestions", () => {
    expect(
      inferGuidedSetupDefaults({
        detectedPaths: [
          { type: "context", path: "pm-workspace-docs/" },
          { type: "prototypes", path: "src/components/prototypes/" },
        ],
        existingContextPaths: ["customer-docs"],
        existingPrototypesPath: "apps/web/prototypes",
        automationMode: "manual",
      }),
    ).toMatchObject({
      contextPaths: ["customer-docs/"],
      prototypesPath: "apps/web/prototypes/",
      lifecycleTemplateId: "manual",
      automationMode: "manual",
      automationStopStage: null,
    });
  });

  it("maps automation modes back to lifecycle templates", () => {
    expect(resolveLifecycleTemplateId({ automationMode: "manual" })).toBe(
      "manual",
    );
    expect(resolveLifecycleTemplateId({ automationMode: "auto_to_stage" })).toBe(
      "assisted",
    );
    expect(resolveLifecycleTemplateId({ automationMode: "auto_all" })).toBe(
      "autopilot",
    );
  });

  it("returns the recommended assisted template when no explicit mode exists", () => {
    expect(getLifecycleTemplate("assisted")).toMatchObject({
      title: "Assisted",
      automationMode: "auto_to_stage",
      automationStopStage: "prototype",
    });
    expect(resolveLifecycleTemplateId()).toBe("assisted");
  });
});
