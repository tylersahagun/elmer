/**
 * Personas API - Read persona archetypes from elmer-docs
 *
 * GET - List all persona archetypes
 */

import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { listConvexPersonas, upsertConvexPersona } from "@/lib/convex/server";

export interface PersonaArchetype {
  archetype_id: string;
  name: string;
  description: string;
  role: {
    title: string;
    responsibilities: string[];
    decision_authority: string;
  };
  pains: string[];
  success_criteria: string[];
  evaluation_heuristics: string[];
  typical_tools: string[];
  fears: string[];
  psychographic_ranges: {
    tech_literacy: string[];
    ai_adoption_stage: string[];
    tool_fatigue: number[];
    patience_for_learning: number[];
    trust_in_ai: number[];
  };
}

const PERSONAS_PATH = path.join(
  process.cwd(),
  "..",
  "elmer-docs",
  "personas",
  "archetypes",
);

export async function GET() {
  try {
    const workspaceId = "mn7e43jc0m7bc5jn708d3ye4e182a7me";
    const personas = await listConvexPersonas(workspaceId) as Array<{
      _id: string;
      archetypeId: string;
      name: string;
      description: string;
      role: PersonaArchetype["role"];
      pains: string[];
      successCriteria: string[];
      evaluationHeuristics: string[];
      typicalTools: string[];
      fears: string[];
      psychographicRanges: PersonaArchetype["psychographic_ranges"];
    }>;
    return NextResponse.json({
      personas: personas.map((persona) => ({
        id: persona._id,
        archetype_id: persona.archetypeId,
        name: persona.name,
        description: persona.description,
        role: persona.role,
        pains: persona.pains,
        success_criteria: persona.successCriteria,
        evaluation_heuristics: persona.evaluationHeuristics,
        typical_tools: persona.typicalTools,
        fears: persona.fears,
        psychographic_ranges: persona.psychographicRanges,
      })),
    });
  } catch (error) {
    console.error("[API /personas] GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch personas" },
      { status: 500 },
    );
  }
}

interface PersonaWriteRequest {
  path: string;
  content: string;
}

function extractSection(content: string, title: string): string {
  const pattern = new RegExp(`^##\\s+${title}\\s*$`, "m");
  const match = content.match(pattern);
  if (!match || match.index === undefined) return "";
  const start = match.index + match[0].length;
  const rest = content.slice(start);
  const next = rest.search(/^##\s+/m);
  return (next >= 0 ? rest.slice(0, next) : rest).trim();
}

function extractSubSection(content: string, title: string): string {
  const pattern = new RegExp(`^###\\s+${title}\\s*$`, "m");
  const match = content.match(pattern);
  if (!match || match.index === undefined) return "";
  const start = match.index + match[0].length;
  const rest = content.slice(start);
  const next = rest.search(/^###\s+|^##\s+/m);
  return (next >= 0 ? rest.slice(0, next) : rest).trim();
}

function parseList(section: string): string[] {
  return section
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .map((line) => line.replace(/^- /, "").trim())
    .filter(Boolean);
}

function parseRange(value: string): number[] {
  const range = value
    .split("-")
    .map((part) => Number(part.trim()))
    .filter((num) => !Number.isNaN(num));
  return range.length ? range : [];
}

function parsePersonaMarkdown(
  content: string,
  archetypeId: string,
): PersonaArchetype {
  const lines = content.split("\n").map((line) => line.trim());
  const titleLine = lines.find((line) => line.startsWith("# "));
  const name = titleLine ? titleLine.replace(/^#\s+/, "").trim() : archetypeId;

  const roleSection = extractSection(content, "Role");
  const responsibilitiesSection = extractSubSection(
    roleSection,
    "Responsibilities",
  );
  const painsSection = extractSection(content, "Pain Points");
  const successSection = extractSection(content, "Success Criteria");
  const evaluationSection = extractSection(content, "Evaluation Heuristics");
  const toolsSection = extractSection(content, "Typical Tools");
  const fearsSection = extractSection(content, "Fears");
  const psychoSection = extractSection(content, "Psychographic Ranges");

  const description = (() => {
    const roleIndex = content.search(/^##\s+Role\s*$/m);
    const headerEnd = titleLine
      ? content.indexOf(titleLine) + titleLine.length
      : 0;
    if (roleIndex > headerEnd) {
      return content.slice(headerEnd, roleIndex).trim();
    }
    return "";
  })();

  const titleMatch = roleSection.match(/\*\*Title\*\*:\s*(.+)/i);
  const decisionMatch = roleSection.match(
    /\*\*Decision Authority\*\*:\s*(.+)/i,
  );

  const techMatch = psychoSection.match(/\*\*Tech Literacy\*\*:\s*(.+)/i);
  const aiMatch = psychoSection.match(/\*\*AI Adoption Stage\*\*:\s*(.+)/i);
  const toolMatch = psychoSection.match(/\*\*Tool Fatigue\*\*:\s*(.+)/i);
  const patienceMatch = psychoSection.match(
    /\*\*Patience for Learning\*\*:\s*(.+)/i,
  );
  const trustMatch = psychoSection.match(/\*\*Trust in AI\*\*:\s*(.+)/i);

  return {
    archetype_id: archetypeId,
    name,
    description,
    role: {
      title: titleMatch?.[1]?.trim() || "",
      decision_authority: decisionMatch?.[1]?.trim() || "",
      responsibilities: parseList(responsibilitiesSection),
    },
    pains: parseList(painsSection),
    success_criteria: parseList(successSection),
    evaluation_heuristics: parseList(evaluationSection),
    typical_tools: parseList(toolsSection),
    fears: parseList(fearsSection),
    psychographic_ranges: {
      tech_literacy: techMatch
        ? techMatch[1]
            .split(",")
            .map((v) => v.trim())
            .filter(Boolean)
        : [],
      ai_adoption_stage: aiMatch
        ? aiMatch[1]
            .split(",")
            .map((v) => v.trim())
            .filter(Boolean)
        : [],
      tool_fatigue: toolMatch ? parseRange(toolMatch[1]) : [],
      patience_for_learning: patienceMatch ? parseRange(patienceMatch[1]) : [],
      trust_in_ai: trustMatch ? parseRange(trustMatch[1]) : [],
    },
  };
}

async function resolvePersonasPath() {
  try {
    await fs.access(PERSONAS_PATH);
    return PERSONAS_PATH;
  } catch {
    const altPath = path.join(
      process.cwd(),
      "elmer-docs",
      "personas",
      "archetypes",
    );
    await fs.access(altPath);
    return altPath;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as PersonaWriteRequest;
    const workspaceId = (body as PersonaWriteRequest & { workspaceId?: string }).workspaceId;
    if (!body?.path || !body?.content || !workspaceId) {
      return NextResponse.json(
        { error: "workspaceId, path and content are required" },
        { status: 400 },
      );
    }

    const archetypeId = path.basename(body.path, path.extname(body.path));
    const persona = parsePersonaMarkdown(body.content, archetypeId);
    const personasPath = await resolvePersonasPath();
    const filePath = path.join(personasPath, `${archetypeId}.json`);

    await fs.writeFile(filePath, JSON.stringify(persona, null, 2), "utf-8");
    await upsertConvexPersona({
      workspaceId,
      archetypeId: persona.archetype_id,
      name: persona.name,
      description: persona.description,
      role: persona.role,
      pains: persona.pains,
      successCriteria: persona.success_criteria,
      evaluationHeuristics: persona.evaluation_heuristics,
      typicalTools: persona.typical_tools,
      fears: persona.fears,
      psychographicRanges: persona.psychographic_ranges,
      content: body.content,
      filePath,
    });

    return NextResponse.json({ success: true, persona });
  } catch (error) {
    console.error("[API /personas] POST error:", error);
    return NextResponse.json(
      { error: "Failed to create persona" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as PersonaWriteRequest;
    const workspaceId = (body as PersonaWriteRequest & { workspaceId?: string }).workspaceId;
    if (!body?.path || !body?.content || !workspaceId) {
      return NextResponse.json(
        { error: "workspaceId, path and content are required" },
        { status: 400 },
      );
    }

    const archetypeId = path.basename(body.path, path.extname(body.path));
    const persona = parsePersonaMarkdown(body.content, archetypeId);
    const personasPath = await resolvePersonasPath();
    const filePath = path.join(personasPath, `${archetypeId}.json`);

    await fs.writeFile(filePath, JSON.stringify(persona, null, 2), "utf-8");
    await upsertConvexPersona({
      workspaceId,
      archetypeId: persona.archetype_id,
      name: persona.name,
      description: persona.description,
      role: persona.role,
      pains: persona.pains,
      successCriteria: persona.success_criteria,
      evaluationHeuristics: persona.evaluation_heuristics,
      typicalTools: persona.typical_tools,
      fears: persona.fears,
      psychographicRanges: persona.psychographic_ranges,
      content: body.content,
      filePath,
    });

    return NextResponse.json({ success: true, persona });
  } catch (error) {
    console.error("[API /personas] PUT error:", error);
    return NextResponse.json(
      { error: "Failed to save persona" },
      { status: 500 },
    );
  }
}
