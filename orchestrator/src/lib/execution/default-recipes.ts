/**
 * Default Stage Recipes with GSD-Style Verification Criteria
 * 
 * These recipes define structured tasks for each Kanban stage with:
 * - Explicit verification criteria per task
 * - Target files for atomic commits
 * - Acceptance criteria for documentation
 * 
 * Verification Criteria Formats:
 * - "file:document_type" - Check document exists in DB
 * - "sections:Section1,Section2" - Check sections exist in content
 * - "ai:criterion" - AI-based verification with context
 */

import type { RecipeStep, GateDefinition, ProjectStage } from "@/lib/db/schema";

// ============================================
// DISCOVERY STAGE RECIPE
// ============================================

export const DEFAULT_DISCOVERY_RECIPE: RecipeStep[] = [
  {
    skillId: "analyze_transcript",
    order: 1,
    name: "Analyze Research",
    targetFiles: ["research.md"],
    verificationCriteria: [
      "file:research",
      "sections:Key Insights,User Problems,Action Items",
      "ai:Research includes at least 2 user quotes with specific pain points",
    ],
    acceptanceCriteria: [
      "User quotes are verbatim from transcripts",
      "Problems are categorized by persona",
      "Action items have clear owners",
    ],
    atomicCommit: true,
  },
];

export const DISCOVERY_GATES: GateDefinition[] = [
  {
    id: "research_exists",
    name: "Research Document",
    type: "file_exists",
    config: { documentType: "research" },
    required: true,
    message: "Research document must exist before proceeding",
    failureMessage: "No research document found. Analyze a transcript first.",
  },
];

// ============================================
// PRD STAGE RECIPE
// ============================================

export const DEFAULT_PRD_RECIPE: RecipeStep[] = [
  {
    skillId: "generate_prd",
    order: 1,
    name: "Generate PRD",
    targetFiles: ["prd.md"],
    verificationCriteria: [
      "file:prd",
      "sections:Problem Statement,Goals,User Personas,Requirements,Success Metrics",
      "ai:PRD includes measurable success metrics with specific targets",
    ],
    acceptanceCriteria: [
      "Problem statement references user research with quotes",
      "Goals are SMART (Specific, Measurable, Achievable, Relevant, Time-bound)",
      "Success metrics have baseline and target values",
    ],
    atomicCommit: true,
  },
  {
    skillId: "generate_design_brief",
    order: 2,
    name: "Generate Design Brief",
    targetFiles: ["design-brief.md"],
    verificationCriteria: [
      "file:design_brief",
      "sections:Design Challenge,Key States,Accessibility Requirements",
    ],
    acceptanceCriteria: [
      "Design challenge frames the user problem",
      "Key states cover happy path and edge cases",
    ],
    atomicCommit: true,
  },
  {
    skillId: "generate_engineering_spec",
    order: 3,
    name: "Generate Engineering Spec",
    targetFiles: ["engineering-spec.md"],
    verificationCriteria: [
      "file:engineering_spec",
      "sections:Technical Approach,Data Model,API Design",
    ],
    acceptanceCriteria: [
      "Technical approach is implementable with current stack",
      "Data model is normalized and efficient",
    ],
    atomicCommit: true,
  },
  {
    skillId: "generate_gtm_brief",
    order: 4,
    name: "Generate GTM Brief",
    targetFiles: ["gtm-brief.md"],
    verificationCriteria: [
      "file:gtm_brief",
      "sections:Target Audience,Messaging,Launch Plan",
    ],
    acceptanceCriteria: [
      "Target audience aligns with defined personas",
      "Messaging highlights key differentiators",
    ],
    atomicCommit: true,
  },
];

export const PRD_GATES: GateDefinition[] = [
  {
    id: "prd_sections",
    name: "PRD Required Sections",
    type: "sections_exist",
    config: {
      documentType: "prd",
      sections: ["Problem Statement", "User Personas", "Success Metrics", "MVP Scope"],
    },
    required: true,
    message: "PRD must have all required sections",
    failureMessage: "PRD missing required sections: Problem Statement, Personas, Metrics, MVP Scope.",
  },
  {
    id: "design_brief_exists",
    name: "Design Brief",
    type: "file_exists",
    config: { documentType: "design_brief" },
    required: true,
    message: "Design brief must exist",
  },
];

// ============================================
// PROTOTYPE STAGE RECIPE
// ============================================

export const DEFAULT_PROTOTYPE_RECIPE: RecipeStep[] = [
  {
    skillId: "build_prototype",
    order: 1,
    name: "Build Prototype",
    targetFiles: ["prototype/"],
    verificationCriteria: [
      "file:prototype_notes",
      "ai:Prototype implements the key user flows from the PRD",
    ],
    acceptanceCriteria: [
      "Prototype matches design brief visual direction",
      "All key states are represented",
      "Prototype is viewable in Storybook",
    ],
    atomicCommit: true,
  },
  {
    skillId: "deploy_chromatic",
    order: 2,
    name: "Deploy to Chromatic",
    verificationCriteria: [
      "ai:Chromatic build succeeded with preview URL",
    ],
    acceptanceCriteria: [
      "Chromatic URL is accessible",
      "Visual snapshots captured",
    ],
    atomicCommit: false, // Chromatic deploy doesn't create files
  },
];

export const PROTOTYPE_GATES: GateDefinition[] = [
  {
    id: "prototype_notes",
    name: "Prototype Notes",
    type: "file_exists",
    config: { documentType: "prototype_notes" },
    required: true,
    message: "Prototype notes documenting the implementation",
  },
];

// ============================================
// VALIDATE STAGE RECIPE
// ============================================

export const DEFAULT_VALIDATE_RECIPE: RecipeStep[] = [
  {
    skillId: "run_jury_evaluation",
    order: 1,
    name: "Run Jury Evaluation",
    targetFiles: ["validation-report.md"],
    verificationCriteria: [
      "file:jury_report",
      "sections:Overall Verdict,Persona Breakdowns,Recommendations",
      "ai:Jury evaluation includes feedback from at least 4 personas",
    ],
    acceptanceCriteria: [
      "Each persona provides specific feedback",
      "Top concerns are actionable",
      "Recommendations are prioritized",
    ],
    atomicCommit: true,
  },
];

export const VALIDATE_GATES: GateDefinition[] = [
  {
    id: "jury_verdict",
    name: "Jury Verdict",
    type: "jury_score",
    config: { minScore: 0.6, verdicts: ["pass", "conditional"] },
    required: true,
    message: "Jury must pass or conditionally approve",
    failureMessage: "Jury rejected the prototype. Review concerns before proceeding.",
  },
];

// ============================================
// TICKETS STAGE RECIPE
// ============================================

export const DEFAULT_TICKETS_RECIPE: RecipeStep[] = [
  {
    skillId: "generate_tickets",
    order: 1,
    name: "Generate Tickets",
    verificationCriteria: [
      "ai:Tickets cover all MVP requirements from the PRD",
    ],
    acceptanceCriteria: [
      "Each ticket has clear acceptance criteria",
      "Tickets are appropriately sized (1-3 days)",
      "Dependencies are identified",
    ],
    atomicCommit: false,
  },
  {
    skillId: "validate_tickets",
    order: 2,
    name: "Validate Tickets",
    verificationCriteria: [
      "ai:All tickets have estimates and are linked to Linear",
    ],
    acceptanceCriteria: [
      "Total estimate aligns with project timeline",
      "No orphaned tickets",
    ],
    atomicCommit: false,
  },
];

// ============================================
// STAGE RECIPE MAP
// ============================================

export const DEFAULT_RECIPES: Record<ProjectStage, {
  steps: RecipeStep[];
  gates: GateDefinition[];
}> = {
  inbox: { steps: [], gates: [] },
  discovery: { steps: DEFAULT_DISCOVERY_RECIPE, gates: DISCOVERY_GATES },
  prd: { steps: DEFAULT_PRD_RECIPE, gates: PRD_GATES },
  design: { steps: [], gates: [] }, // Design is typically manual
  prototype: { steps: DEFAULT_PROTOTYPE_RECIPE, gates: PROTOTYPE_GATES },
  validate: { steps: DEFAULT_VALIDATE_RECIPE, gates: VALIDATE_GATES },
  tickets: { steps: DEFAULT_TICKETS_RECIPE, gates: [] },
  build: { steps: [], gates: [] },
  alpha: { steps: [], gates: [] },
  beta: { steps: [], gates: [] },
  ga: { steps: [], gates: [] },
};

/**
 * Get default recipe for a stage
 */
export function getDefaultRecipe(stage: ProjectStage): {
  steps: RecipeStep[];
  gates: GateDefinition[];
} {
  return DEFAULT_RECIPES[stage] || { steps: [], gates: [] };
}

/**
 * Check if a stage has a default recipe with verification criteria
 */
export function hasDefaultVerificationCriteria(stage: ProjectStage): boolean {
  const recipe = DEFAULT_RECIPES[stage];
  return recipe?.steps?.some(step => 
    step.verificationCriteria && step.verificationCriteria.length > 0
  ) ?? false;
}
