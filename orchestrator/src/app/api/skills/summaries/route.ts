/**
 * Skill Summaries API - Get AI summaries for multiple skills at once
 * 
 * POST - Get summaries for a batch of skill IDs
 */

import { NextRequest, NextResponse } from "next/server";

// Static summaries for built-in job types
const BUILTIN_SUMMARIES: Record<string, string> = {
  analyze_transcript: "Analyzes user research transcripts to extract key insights, problems, and verbatim quotes. Identifies personas mentioned and suggests relevant projects or hypotheses.",
  generate_prd: "Creates a comprehensive Product Requirements Document including problem statement, target personas, success metrics, user journey, MVP scope, and open questions.",
  generate_design_brief: "Produces a design brief with visual direction, interaction patterns, component specifications, and accessibility considerations based on the PRD.",
  generate_engineering_spec: "Generates technical specifications including architecture decisions, data models, API contracts, and implementation guidelines.",
  generate_gtm_brief: "Creates a go-to-market brief with positioning, messaging, launch timeline, and success metrics for product releases.",
  build_prototype: "Builds interactive Storybook prototypes using React and Tailwind CSS, creating component stories for visual testing and iteration.",
  iterate_prototype: "Refines an existing prototype based on feedback, updating both the UI components and associated documentation.",
  run_jury_evaluation: "Runs synthetic user jury evaluation with multiple personas to validate designs and gather diverse feedback before implementation.",
  generate_tickets: "Breaks down the PRD and engineering spec into actionable development tickets with clear acceptance criteria.",
  validate_tickets: "Reviews generated tickets for completeness, clarity, and proper scoping before handoff to engineering.",
  score_stage_alignment: "Evaluates project alignment with stage requirements and suggests whether it's ready to progress.",
  deploy_chromatic: "Deploys prototype to Chromatic for visual regression testing and stakeholder review.",
  create_feature_branch: "Creates a Git feature branch with proper naming convention and initial commit structure.",
};

export async function POST(request: NextRequest) {
  try {
    const { skillIds } = await request.json();
    
    if (!skillIds || !Array.isArray(skillIds)) {
      return NextResponse.json(
        { error: "skillIds array required" },
        { status: 400 }
      );
    }
    
    const summaries: Record<string, string> = {};
    
    for (const skillId of skillIds) {
      if (BUILTIN_SUMMARIES[skillId]) {
        summaries[skillId] = BUILTIN_SUMMARIES[skillId];
      } else {
        // Generate a readable summary from the skill ID
        const readable = skillId
          .replace(/_/g, " ")
          .replace(/\b\w/g, (l: string) => l.toUpperCase());
        summaries[skillId] = `Executes the ${readable} workflow as part of the PM automation pipeline.`;
      }
    }
    
    return NextResponse.json({ summaries });
    
  } catch (error) {
    console.error("Failed to get skill summaries:", error);
    return NextResponse.json(
      { error: "Failed to get skill summaries" },
      { status: 500 }
    );
  }
}
