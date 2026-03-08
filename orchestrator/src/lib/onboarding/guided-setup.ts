"use client";

export type LifecycleTemplateId = "manual" | "assisted" | "autopilot";

export interface GuidedSetupDetection {
  type: "context" | "prototypes";
  path: string;
}

export interface LifecycleTemplateSettings {
  automationMode: "manual" | "auto_to_stage" | "auto_all";
  automationStopStage: string | null;
}

export interface LifecycleTemplateDefinition extends LifecycleTemplateSettings {
  id: LifecycleTemplateId;
  title: string;
  description: string;
  badge?: string;
}

export const LIFECYCLE_TEMPLATES: LifecycleTemplateDefinition[] = [
  {
    id: "manual",
    title: "Manual",
    description: "You move work forward explicitly and keep automation off by default.",
    badge: "Most control",
    automationMode: "manual",
    automationStopStage: null,
  },
  {
    id: "assisted",
    title: "Assisted",
    description:
      "Elmer can carry work through the early lifecycle, then pause when a prototype is ready for review.",
    badge: "Recommended",
    automationMode: "auto_to_stage",
    automationStopStage: "prototype",
  },
  {
    id: "autopilot",
    title: "Autopilot",
    description:
      "Elmer keeps advancing work until a human gate or stage rule stops it.",
    badge: "Fastest",
    automationMode: "auto_all",
    automationStopStage: null,
  },
];

const DEFAULT_CONTEXT_PATH = "elmer-docs/";
const DEFAULT_PROTOTYPES_PATH = "prototypes/";

function normalizePath(value: string | null | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  return trimmed.endsWith("/") ? trimmed : `${trimmed}/`;
}

function uniquePaths(paths: Array<string | null | undefined>) {
  return Array.from(
    new Set(
      paths
        .map(normalizePath)
        .filter((value): value is string => Boolean(value)),
    ),
  );
}

export function getLifecycleTemplate(
  templateId: LifecycleTemplateId,
): LifecycleTemplateDefinition {
  return (
    LIFECYCLE_TEMPLATES.find((template) => template.id === templateId) ??
    LIFECYCLE_TEMPLATES[1]
  );
}

export function resolveLifecycleTemplateId(input?: {
  automationMode?: "manual" | "auto_to_stage" | "auto_all" | null;
  automationStopStage?: string | null;
}): LifecycleTemplateId {
  if (input?.automationMode === "manual") return "manual";
  if (input?.automationMode === "auto_all") return "autopilot";
  if (input?.automationMode === "auto_to_stage") return "assisted";
  return "assisted";
}

export function inferGuidedSetupDefaults(input: {
  detectedPaths?: GuidedSetupDetection[];
  existingContextPaths?: string[];
  existingPrototypesPath?: string | null;
  automationMode?: "manual" | "auto_to_stage" | "auto_all" | null;
  automationStopStage?: string | null;
}) {
  const detectedContextPaths = uniquePaths(
    (input.detectedPaths ?? [])
      .filter((path) => path.type === "context")
      .map((path) => path.path),
  );

  const detectedPrototypesPath =
    uniquePaths(
      (input.detectedPaths ?? [])
        .filter((path) => path.type === "prototypes")
        .map((path) => path.path),
    )[0] ?? null;

  const contextPaths =
    uniquePaths(input.existingContextPaths ?? []).length > 0
      ? uniquePaths(input.existingContextPaths ?? [])
      : detectedContextPaths.length > 0
        ? detectedContextPaths
        : [DEFAULT_CONTEXT_PATH];

  const prototypesPath =
    normalizePath(input.existingPrototypesPath) ??
    detectedPrototypesPath ??
    DEFAULT_PROTOTYPES_PATH;

  const templateId = resolveLifecycleTemplateId({
    automationMode: input.automationMode,
    automationStopStage: input.automationStopStage,
  });
  const template = getLifecycleTemplate(templateId);

  return {
    contextPaths,
    prototypesPath,
    lifecycleTemplateId: templateId,
    automationMode: template.automationMode,
    automationStopStage: template.automationStopStage,
    detectedContextPaths,
    detectedPrototypesPath,
  };
}
