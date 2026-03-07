import type {
  DocumentType,
  ProjectStage,
  ReleaseMetricsThreshold,
  ReleaseMetricsValues,
} from "@/lib/db/schema";
import {
  STATUS_ARTIFACT_TYPES,
  type ArtifactState,
  type ArtifactStatusMap,
  type InitiativeStatusSnapshot,
  type MeasurementReadiness,
} from "./types";
import type { GraduationCheckResult } from "@/lib/graduation/criteria-service";

const STAGE_ORDER: ProjectStage[] = [
  "inbox",
  "discovery",
  "prd",
  "design",
  "prototype",
  "validate",
  "tickets",
  "build",
  "alpha",
  "beta",
  "ga",
];

const REQUIRED_ARTIFACTS_BY_STAGE: Partial<Record<ProjectStage, DocumentType[]>> =
  {
    discovery: ["research"],
    prd: ["research", "prd"],
    design: ["research", "prd", "design_brief"],
    prototype: ["research", "prd", "design_brief", "prototype_notes"],
    validate: [
      "research",
      "prd",
      "design_brief",
      "prototype_notes",
      "jury_report",
    ],
    tickets: [
      "research",
      "prd",
      "design_brief",
      "engineering_spec",
      "prototype_notes",
    ],
    build: [
      "research",
      "prd",
      "design_brief",
      "engineering_spec",
      "prototype_notes",
      "metrics",
    ],
    alpha: [
      "research",
      "prd",
      "design_brief",
      "engineering_spec",
      "prototype_notes",
      "metrics",
    ],
    beta: [
      "research",
      "prd",
      "design_brief",
      "engineering_spec",
      "prototype_notes",
      "metrics",
    ],
    ga: [
      "research",
      "prd",
      "design_brief",
      "engineering_spec",
      "prototype_notes",
      "metrics",
      "gtm_brief",
    ],
  };

export function getRequiredArtifactsForStage(stage: ProjectStage) {
  return REQUIRED_ARTIFACTS_BY_STAGE[stage] ?? [];
}

export function getArtifactStatusForStage(
  stage: ProjectStage,
  availableDocumentTypes: Set<DocumentType>,
): ArtifactStatusMap {
  const required = new Set(getRequiredArtifactsForStage(stage));
  return STATUS_ARTIFACT_TYPES.reduce<ArtifactStatusMap>((acc, artifact) => {
    let state: ArtifactState = "not_required";
    if (required.has(artifact)) {
      state = availableDocumentTypes.has(artifact) ? "complete" : "missing";
    } else if (availableDocumentTypes.has(artifact)) {
      state = "complete";
    }
    acc[artifact] = state;
    return acc;
  }, {});
}

export function calculateArtifactCompleteness(
  stage: ProjectStage,
  artifacts: ArtifactStatusMap,
) {
  const requiredArtifacts = getRequiredArtifactsForStage(stage);
  if (requiredArtifacts.length === 0) return 1;
  const completed = requiredArtifacts.filter(
    (artifact) => artifacts[artifact] === "complete",
  ).length;
  return completed / requiredArtifacts.length;
}

export function getMeasurementReadiness(
  hasMetricsDocument: boolean,
  releaseMetrics?: {
    current?: ReleaseMetricsValues | Record<string, number>;
    thresholds?:
      | Record<string, Record<string, number>>
      | Record<string, ReleaseMetricsThreshold>;
  } | null,
): MeasurementReadiness {
  if (hasMetricsDocument && releaseMetrics?.current && releaseMetrics?.thresholds) {
    return "instrumented";
  }
  if (hasMetricsDocument || releaseMetrics?.thresholds || releaseMetrics?.current) {
    return "partial";
  }
  return "missing";
}

export function getDaysSinceUpdate(updatedAt: string | Date) {
  const updated = updatedAt instanceof Date ? updatedAt : new Date(updatedAt);
  const diffMs = Date.now() - updated.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

export function getReadinessScoreLabel(score: number) {
  if (score >= 0.85) return "Strong";
  if (score >= 0.65) return "Healthy";
  if (score >= 0.45) return "Watch";
  return "Needs attention";
}

export function getNextSuggestedCommand(params: {
  stage: ProjectStage;
  artifacts: ArtifactStatusMap;
  measurementReadiness: MeasurementReadiness;
  canAdvance: boolean;
}) {
  const { stage, artifacts, measurementReadiness, canAdvance } = params;
  if (artifacts.research === "missing") return "/research";
  if (artifacts.prd === "missing") return "/pm";
  if (artifacts.design_brief === "missing") return "/design";
  if (artifacts.prototype_notes === "missing") return "/proto";
  if (artifacts.jury_report === "missing" && stage === "validate") {
    return "/validate";
  }
  if (measurementReadiness === "missing" && STAGE_ORDER.indexOf(stage) >= STAGE_ORDER.indexOf("build")) {
    return "/measure";
  }
  if (!canAdvance && stage === "prototype") return "/iterate";
  if (stage === "tickets" || stage === "build") return "/tickets";
  return "/status";
}

export function buildInitiativeSnapshot(params: {
  project: {
    id: string;
    name: string;
    description?: string | null;
    stage: ProjectStage;
    status: "active" | "paused" | "completed" | "archived";
    priority?: number | null;
    updatedAt: string | Date;
    createdAt: string | Date;
    signalCount?: number;
    documentCount?: number;
    prototypeCount?: number;
    documents?: Array<{ type: DocumentType }>;
    metadata?: Record<string, unknown> | null;
  };
  graduation: GraduationCheckResult;
}): InitiativeStatusSnapshot {
  const { project, graduation } = params;
  const metadata = (project.metadata ?? {}) as {
    releaseMetrics?: {
      current?: ReleaseMetricsValues | Record<string, number>;
      thresholds?:
        | Record<string, Record<string, number>>
        | Record<string, ReleaseMetricsThreshold>;
    };
    stageQuality?: Record<
      string,
      {
        score?: number;
        summary?: string;
      }
    >;
    stageConfidence?: Record<
      string,
      {
        score?: number;
        summary?: string;
      }
    >;
  };
  const availableDocumentTypes = new Set(
    (project.documents ?? []).map((document) => document.type),
  );
  const artifacts = getArtifactStatusForStage(project.stage, availableDocumentTypes);
  const artifactCompleteness = calculateArtifactCompleteness(project.stage, artifacts);
  const measurementReadiness = getMeasurementReadiness(
    availableDocumentTypes.has("metrics"),
    metadata.releaseMetrics ?? null,
  );
  const measurementBonus =
    measurementReadiness === "instrumented"
      ? 0.15
      : measurementReadiness === "partial"
        ? 0.08
        : 0;
  const stageQualityScore =
    metadata.stageQuality?.[project.stage]?.score ??
    metadata.stageConfidence?.[project.stage]?.score ??
    artifactCompleteness;
  const readinessScore = Math.min(
    1,
    stageQualityScore * 0.75 + measurementBonus + (graduation.canGraduate ? 0.1 : 0),
  );
  const blockers = graduation.checks
    .filter((check) => !check.passed)
    .map((check) => check.message);
  const daysSinceUpdate = getDaysSinceUpdate(project.updatedAt);
  const stale = daysSinceUpdate > 14;
  const canAdvance =
    graduation.canGraduate ||
    (!graduation.enforced && blockers.length === 0);

  return {
    id: project.id,
    name: project.name,
    description: project.description,
    stage: project.stage,
    status: project.status,
    priority: project.priority ?? 0,
    updatedAt: new Date(project.updatedAt).toISOString(),
    createdAt: new Date(project.createdAt).toISOString(),
    daysSinceUpdate,
    stale,
    artifactCompleteness,
    artifacts,
    measurementReadiness,
    signalCount: project.signalCount ?? 0,
    documentCount:
      project.documentCount ?? availableDocumentTypes.size,
    prototypeCount: project.prototypeCount ?? 0,
    readinessScore,
    readinessLabel: getReadinessScoreLabel(readinessScore),
    canAdvance,
    graduationEnforced: graduation.enforced,
    blockers,
    nextSuggestedCommand: getNextSuggestedCommand({
      stage: project.stage,
      artifacts,
      measurementReadiness,
      canAdvance,
    }),
  };
}
