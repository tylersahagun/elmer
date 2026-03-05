/**
 * Canonical document type definitions.
 * Used throughout UI to display labels, icons, and ordering.
 * Convex stores type as v.string() — no enum constraint.
 */

export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  research: "Research",
  prd: "PRD",
  design_brief: "Design Brief",
  engineering_spec: "Engineering Spec",
  gtm_brief: "GTM Brief",
  prototype_notes: "Prototype Notes",
  metrics: "Metrics",
  jury_report: "Jury Report",
  state: "State",
  // GTM-53 — new types
  feature_guide: "Feature Guide",
  competitive_landscape: "Competitive Landscape",
  success_criteria: "Success Criteria",
  gtm_plan: "GTM Plan",
  retrospective: "Retrospective",
  // Generic fallback
  decisions: "Decisions",
  visual_directions: "Visual Directions",
};

export const DOCUMENT_TYPE_ORDER = [
  "research",
  "prd",
  "design_brief",
  "engineering_spec",
  "gtm_brief",
  "prototype_notes",
  "metrics",
  "jury_report",
  "feature_guide",
  "competitive_landscape",
  "success_criteria",
  "gtm_plan",
  "retrospective",
  "decisions",
  "visual_directions",
  "state",
] as const;

export type DocumentTypeKey = (typeof DOCUMENT_TYPE_ORDER)[number] | (string & {});

export function getDocumentTypeLabel(type: string): string {
  return DOCUMENT_TYPE_LABELS[type] ?? type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
