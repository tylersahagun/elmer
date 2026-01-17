/**
 * Jury Evaluation Tools
 * 
 * NOTE: These tools are kept for backwards compatibility but are NOT the primary
 * way to run jury evaluations. The recommended flow is:
 * 
 * 1. Jobs are created in the orchestrator with status "pending"
 * 2. Cursor AI processes them via MCP CRUD tools (get-pending-jobs, complete-job)
 * 3. Cursor generates content using its own AI credentials
 */

import type {
  RunJuryInput,
  PersonaProfile,
  JuryVerdict,
  JuryEvaluationResult,
  ToolResult,
} from "../types.js";

// ============================================
// DEFAULT PERSONAS
// ============================================

export const DEFAULT_PERSONAS: PersonaProfile[] = [
  {
    id: "pm-sarah",
    name: "Sarah Chen",
    role: "Senior Product Manager",
    experience: "8 years in B2B SaaS",
    techSavviness: "high",
    priorities: ["user value", "business metrics", "scalability"],
    painPoints: ["scope creep", "unclear requirements", "technical debt"],
    communicationStyle: "Direct and data-driven",
  },
  {
    id: "eng-marcus",
    name: "Marcus Johnson",
    role: "Staff Engineer",
    experience: "12 years in software development",
    techSavviness: "high",
    priorities: ["code quality", "maintainability", "performance"],
    painPoints: ["vague specs", "changing requirements", "tech debt"],
    communicationStyle: "Technical and precise",
  },
  {
    id: "design-emma",
    name: "Emma Rodriguez",
    role: "Lead UX Designer",
    experience: "7 years in product design",
    techSavviness: "medium",
    priorities: ["user experience", "accessibility", "consistency"],
    painPoints: ["rushed timelines", "ignored feedback", "inconsistent patterns"],
    communicationStyle: "Visual and empathetic",
  },
  {
    id: "user-alex",
    name: "Alex Thompson",
    role: "Sales Operations Manager",
    experience: "5 years using CRM tools",
    techSavviness: "medium",
    priorities: ["efficiency", "reliability", "ease of use"],
    painPoints: ["complex interfaces", "slow performance", "data sync issues"],
    communicationStyle: "Practical and results-focused",
  },
  {
    id: "user-priya",
    name: "Priya Patel",
    role: "Customer Success Lead",
    experience: "4 years in customer-facing roles",
    techSavviness: "low",
    priorities: ["customer satisfaction", "quick resolution", "clear communication"],
    painPoints: ["confusing workflows", "missing information", "slow tools"],
    communicationStyle: "Friendly and solution-oriented",
  },
  {
    id: "exec-david",
    name: "David Kim",
    role: "VP of Product",
    experience: "15 years in product leadership",
    techSavviness: "medium",
    priorities: ["strategic alignment", "ROI", "market differentiation"],
    painPoints: ["misaligned initiatives", "slow execution", "poor metrics"],
    communicationStyle: "Strategic and concise",
  },
];

// ============================================
// JURY EVALUATION - STUB
// ============================================

/**
 * Run jury evaluation - Stub that returns instructions for Cursor
 * 
 * For actual evaluation, use the job system:
 * 1. Create a job with type "run_jury_evaluation"
 * 2. Process via get-pending-jobs + complete-job MCP tools
 * 3. Cursor AI simulates each persona and aggregates results
 */
export async function runJuryEvaluation(
  input: RunJuryInput
): Promise<ToolResult<JuryEvaluationResult>> {
  // Return placeholder results
  const jurySize = input.jurySize || 12;
  const personas = DEFAULT_PERSONAS.slice(0, Math.min(jurySize, DEFAULT_PERSONAS.length));

  // Generate placeholder evaluations
  const evaluations: Array<{ persona: PersonaProfile; verdict: JuryVerdict }> = personas.map(persona => ({
    persona,
    verdict: {
      vote: "conditional" as const,
      confidence: 0.7,
      reasoning: `[${persona.name} should evaluate this ${input.phase} from their perspective as a ${persona.role}]`,
      concerns: [`[Concerns from ${persona.role} perspective]`],
      suggestions: [`[Suggestions from ${persona.role} perspective]`],
    },
  }));

  const placeholder: JuryEvaluationResult = {
    approvalRate: 0,
    conditionalRate: 1,
    rejectionRate: 0,
    verdict: "conditional",
    topConcerns: [
      "[This evaluation should be performed by Cursor AI]",
      "[Use the job system: get-pending-jobs + complete-job]",
    ],
    topSuggestions: [
      "[Cursor AI should simulate each persona's evaluation]",
      "[Then aggregate using Condorcet voting method]",
    ],
    evaluations,
  };

  return { success: true, data: placeholder };
}

// ============================================
// ITERATE FROM FEEDBACK - STUB
// ============================================

export interface IterationPlan {
  prioritizedChanges: Array<{
    change: string;
    priority: "high" | "medium" | "low";
    effort: "small" | "medium" | "large";
    rationale: string;
  }>;
  deferredItems: string[];
  nextSteps: string[];
}

/**
 * Iterate from feedback - Stub that returns instructions for Cursor
 */
export async function iterateFromFeedback(
  originalContent: string,
  juryResult: JuryEvaluationResult
): Promise<ToolResult<IterationPlan>> {
  const placeholder: IterationPlan = {
    prioritizedChanges: [
      {
        change: "[Cursor AI should analyze jury feedback and prioritize changes]",
        priority: "high",
        effort: "medium",
        rationale: "[Based on frequency and severity of concerns]",
      },
    ],
    deferredItems: ["[Items to defer based on effort vs impact analysis]"],
    nextSteps: [
      "Process jury results using Cursor AI",
      "Prioritize changes based on concern frequency",
      "Create iteration plan with clear next steps",
    ],
  };

  return { success: true, data: placeholder };
}

// ============================================
// HELPER: Aggregate Verdicts (for Cursor to use)
// ============================================

/**
 * Aggregate jury verdicts using Condorcet-style voting
 * 
 * This function is exported so Cursor AI can use it when processing
 * jury evaluation jobs.
 */
export function aggregateVerdicts(
  evaluations: Array<{ persona: PersonaProfile; verdict: JuryVerdict }>
): Omit<JuryEvaluationResult, "evaluations"> {
  const votes = evaluations.map((e) => e.verdict.vote);
  const total = votes.length;

  const approvalCount = votes.filter((v) => v === "approve").length;
  const conditionalCount = votes.filter((v) => v === "conditional").length;
  const rejectionCount = votes.filter((v) => v === "reject").length;

  const approvalRate = approvalCount / total;
  const conditionalRate = conditionalCount / total;
  const rejectionRate = rejectionCount / total;

  // Condorcet-style verdict
  let verdict: "pass" | "fail" | "conditional";
  if (approvalRate >= 0.6) {
    verdict = "pass";
  } else if (rejectionRate >= 0.4) {
    verdict = "fail";
  } else {
    verdict = "conditional";
  }

  // Aggregate concerns and suggestions
  const allConcerns = evaluations.flatMap((e) => e.verdict.concerns);
  const allSuggestions = evaluations.flatMap((e) => e.verdict.suggestions);

  // Count frequency and get top items
  const concernCounts = new Map<string, number>();
  allConcerns.forEach((c) => {
    const normalized = c.toLowerCase().trim();
    concernCounts.set(normalized, (concernCounts.get(normalized) || 0) + 1);
  });

  const suggestionCounts = new Map<string, number>();
  allSuggestions.forEach((s) => {
    const normalized = s.toLowerCase().trim();
    suggestionCounts.set(normalized, (suggestionCounts.get(normalized) || 0) + 1);
  });

  const topConcerns = [...concernCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([concern]) => concern);

  const topSuggestions = [...suggestionCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([suggestion]) => suggestion);

  return {
    approvalRate,
    conditionalRate,
    rejectionRate,
    verdict,
    topConcerns,
    topSuggestions,
  };
}
