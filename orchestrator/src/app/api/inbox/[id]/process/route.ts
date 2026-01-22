/**
 * Inbox Item Processing API - AI-powered analysis
 * 
 * POST - Process an inbox item with AI to extract insights
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { inboxItems, projects } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Anthropic from "@anthropic-ai/sdk";
import fs from "fs/promises";
import path from "path";

const anthropic = new Anthropic();

interface ExtractedProblem {
  problem: string;
  quote?: string;
  persona?: string;
  severity?: "high" | "medium" | "low";
  frequency?: "common" | "occasional" | "rare";
}

interface HypothesisMatch {
  hypothesisId?: string;
  hypothesisName: string;
  similarity: number;
  matchType: "existing" | "candidate";
}

interface ProcessingResult {
  aiSummary: string;
  extractedProblems: ExtractedProblem[];
  hypothesisMatches: HypothesisMatch[];
  suggestedProjectId?: string;
  suggestedProjectName?: string;
  suggestedPersonaId?: string;
  suggestedPersonaName?: string;
  extractedInsights: string[];
  personas: string[];
}

// Load persona archetypes for context
async function loadPersonas(): Promise<Record<string, string>> {
  const personasPath = path.join(process.cwd(), "..", "elmer-docs", "personas", "archetypes");
  const altPath = path.join(process.cwd(), "elmer-docs", "personas", "archetypes");
  
  let dirPath = personasPath;
  try {
    await fs.access(personasPath);
  } catch {
    try {
      await fs.access(altPath);
      dirPath = altPath;
    } catch {
      return {};
    }
  }
  
  const personas: Record<string, string> = {};
  const files = await fs.readdir(dirPath);
  
  for (const file of files.filter(f => f.endsWith(".json"))) {
    try {
      const content = await fs.readFile(path.join(dirPath, file), "utf-8");
      const data = JSON.parse(content);
      if (data.archetype_id && data.name) {
        personas[data.archetype_id] = data.name;
      }
    } catch {
      // Skip invalid files
    }
  }
  
  return personas;
}

// Load existing hypotheses for matching
async function loadHypotheses(): Promise<Array<{ id: string; name: string; problem: string }>> {
  const hypothesesPath = path.join(process.cwd(), "..", "elmer-docs", "hypotheses");
  const altPath = path.join(process.cwd(), "elmer-docs", "hypotheses");
  
  let dirPath = hypothesesPath;
  try {
    await fs.access(hypothesesPath);
  } catch {
    try {
      await fs.access(altPath);
      dirPath = altPath;
    } catch {
      return [];
    }
  }
  
  const hypotheses: Array<{ id: string; name: string; problem: string }> = [];
  
  // Try to read _index.json
  try {
    const indexContent = await fs.readFile(path.join(dirPath, "_index.json"), "utf-8");
    const index = JSON.parse(indexContent);
    if (index.hypotheses && Array.isArray(index.hypotheses)) {
      hypotheses.push(...index.hypotheses.map((h: { id: string; name?: string; problem?: string }) => ({
        id: h.id,
        name: h.name || h.id,
        problem: h.problem || "",
      })));
    }
  } catch {
    // No index file
  }
  
  return hypotheses;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get the inbox item
    const item = await db.query.inboxItems.findFirst({
      where: eq(inboxItems.id, id),
    });
    
    if (!item) {
      return NextResponse.json(
        { error: "Inbox item not found" },
        { status: 404 }
      );
    }
    
    // Get workspace projects for suggestion
    const workspaceProjects = await db.query.projects.findMany({
      where: eq(projects.workspaceId, item.workspaceId),
      columns: {
        id: true,
        name: true,
        stage: true,
        description: true,
      },
    });
    
    // Load personas and hypotheses for context
    const personas = await loadPersonas();
    const hypotheses = await loadHypotheses();
    
    // Build the system prompt
    const systemPrompt = `You are an expert product analyst processing incoming signals for a PM workspace.

## Available Personas
${Object.entries(personas).map(([id, name]) => `- ${id}: ${name}`).join("\n") || "No personas defined"}

## Available Projects  
${workspaceProjects.map(p => `- ${p.id}: "${p.name}" (${p.stage})`).join("\n") || "No projects"}

## Existing Hypotheses
${hypotheses.map(h => `- ${h.id}: "${h.name}" - ${h.problem}`).join("\n") || "No hypotheses defined"}

## Your Task
Analyze the following content and extract structured insights. Respond with a JSON object in this exact format:

\`\`\`json
{
  "aiSummary": "2-3 sentence TL;DR summary",
  "extractedProblems": [
    {
      "problem": "Clear problem statement",
      "quote": "Verbatim quote from content if available",
      "persona": "persona_id if relevant",
      "severity": "high|medium|low",
      "frequency": "common|occasional|rare"
    }
  ],
  "hypothesisMatches": [
    {
      "hypothesisName": "Name of matching or new hypothesis",
      "similarity": 0.0-1.0,
      "matchType": "existing|candidate"
    }
  ],
  "suggestedProjectId": "project_id or null",
  "suggestedProjectName": "project name or null",
  "suggestedPersonaId": "persona_id most relevant or null",
  "suggestedPersonaName": "persona name or null",
  "extractedInsights": [
    "Key insight 1",
    "Key insight 2"
  ],
  "personas": ["persona_id1", "persona_id2"]
}
\`\`\`

Be thorough in extracting problems and include verbatim quotes when relevant.`;

    // Call Claude
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{
        role: "user",
        content: `Content Type: ${item.type}
Title: ${item.title}
Source: ${item.source}

Content:
${item.rawContent}`,
      }],
    });
    
    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type");
    }
    
    // Parse the JSON from the response
    const jsonMatch = content.text.match(/```json\n([\s\S]*?)\n```/);
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response");
    }
    
    const result: ProcessingResult = JSON.parse(jsonMatch[1]);
    
    // Update the inbox item with the processed data
    await db.update(inboxItems)
      .set({
        status: "processing",
        aiSummary: result.aiSummary,
        extractedProblems: result.extractedProblems,
        hypothesisMatches: result.hypothesisMatches,
        processedContent: result.aiSummary,
        metadata: {
          ...(item.metadata || {}),
          suggestedProjectId: result.suggestedProjectId || undefined,
          suggestedProjectName: result.suggestedProjectName || undefined,
          suggestedPersonaId: result.suggestedPersonaId || undefined,
          suggestedPersonaName: result.suggestedPersonaName || undefined,
          extractedInsights: result.extractedInsights,
        },
        processedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(inboxItems.id, id));
    
    return NextResponse.json({
      success: true,
      result,
    });
    
  } catch (error) {
    console.error("Failed to process inbox item:", error);
    return NextResponse.json(
      { error: "Failed to process inbox item" },
      { status: 500 }
    );
  }
}
