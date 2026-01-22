/**
 * Skill Summary API - Generate AI summary for a skill/command
 * 
 * GET - Get or generate AI summary for a skill
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { skills } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Anthropic from "@anthropic-ai/sdk";
import fs from "fs/promises";
import path from "path";

const anthropic = new Anthropic();

// Static summaries for built-in job types (cached)
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

// Try to load skill prompt from filesystem for more detailed summary
async function loadSkillPrompt(skillId: string): Promise<string | null> {
  const commandsPath = path.join(process.cwd(), "..", ".cursor", "commands");
  const altPath = path.join(process.cwd(), ".cursor", "commands");
  
  let dirPath = commandsPath;
  try {
    await fs.access(commandsPath);
  } catch {
    try {
      await fs.access(altPath);
      dirPath = altPath;
    } catch {
      return null;
    }
  }
  
  // Map skill IDs to potential command files
  const mappings: Record<string, string[]> = {
    analyze_transcript: ["RESEARCH.md", "INGEST.md"],
    generate_prd: ["PM.md", "PRD.md"],
    generate_design_brief: ["DESIGN.md"],
    build_prototype: ["PROTO.md", "PROTOTYPE.md"],
    iterate_prototype: ["ITERATE.md"],
    run_jury_evaluation: ["VALIDATE.md", "JURY.md"],
    generate_tickets: ["TICKETS.md"],
  };
  
  const filesToTry = mappings[skillId] || [`${skillId.toUpperCase()}.md`];
  
  for (const file of filesToTry) {
    try {
      const content = await fs.readFile(path.join(dirPath, file), "utf-8");
      return content;
    } catch {
      // Try next file
    }
  }
  
  return null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: skillId } = await params;
    const { searchParams } = new URL(request.url);
    const regenerate = searchParams.get("regenerate") === "true";
    
    // Check if we have a cached summary in the database
    if (!regenerate) {
      const skill = await db.query.skills.findFirst({
        where: eq(skills.id, skillId),
      });
      
      if (skill?.metadata?.aiSummary) {
        return NextResponse.json({
          skillId,
          summary: skill.metadata.aiSummary,
          source: "cached",
        });
      }
    }
    
    // Check built-in summaries first
    if (BUILTIN_SUMMARIES[skillId]) {
      return NextResponse.json({
        skillId,
        summary: BUILTIN_SUMMARIES[skillId],
        source: "builtin",
      });
    }
    
    // Try to load command file for context
    const promptContent = await loadSkillPrompt(skillId);
    
    if (!promptContent) {
      // Return a generic summary based on the skill ID
      const genericSummary = `Executes the ${skillId.replace(/_/g, " ")} workflow as part of the PM automation pipeline.`;
      return NextResponse.json({
        skillId,
        summary: genericSummary,
        source: "generic",
      });
    }
    
    // Generate AI summary from command content
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 256,
      system: `You are a technical documentation writer. Generate a concise 1-2 sentence summary of what this command/skill does. Focus on the practical outcome and value it provides. Be specific but brief.`,
      messages: [{
        role: "user",
        content: `Summarize this command in 1-2 sentences:\n\n${promptContent.slice(0, 4000)}`,
      }],
    });
    
    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type");
    }
    
    const summary = content.text.trim();
    
    // Try to cache in database if skill exists
    try {
      const existingSkill = await db.query.skills.findFirst({
        where: eq(skills.id, skillId),
      });
      
      if (existingSkill) {
        await db.update(skills)
          .set({
            metadata: {
              ...(existingSkill.metadata || {}),
              aiSummary: summary,
            },
            updatedAt: new Date(),
          })
          .where(eq(skills.id, skillId));
      }
    } catch {
      // Caching failed, continue anyway
    }
    
    return NextResponse.json({
      skillId,
      summary,
      source: "generated",
    });
    
  } catch (error) {
    console.error("Failed to get skill summary:", error);
    return NextResponse.json(
      { error: "Failed to get skill summary" },
      { status: 500 }
    );
  }
}
