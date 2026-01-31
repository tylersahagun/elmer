/**
 * Personas API - Read persona archetypes from elmer-docs
 *
 * GET - List all persona archetypes
 */

import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

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
    // Check if directory exists
    try {
      await fs.access(PERSONAS_PATH);
    } catch {
      // Try alternative path (might be running from project root)
      const altPath = path.join(
        process.cwd(),
        "elmer-docs",
        "personas",
        "archetypes",
      );
      try {
        await fs.access(altPath);
        return await loadPersonasFromPath(altPath);
      } catch {
        return NextResponse.json({
          personas: [],
          error: "Personas directory not found",
        });
      }
    }

    return await loadPersonasFromPath(PERSONAS_PATH);
  } catch (error) {
    console.error("[API /personas] GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch personas" },
      { status: 500 },
    );
  }
}

async function loadPersonasFromPath(dirPath: string) {
  const files = await fs.readdir(dirPath);
  const jsonFiles = files.filter((f) => f.endsWith(".json"));

  const personas: PersonaArchetype[] = [];

  for (const file of jsonFiles) {
    try {
      const content = await fs.readFile(path.join(dirPath, file), "utf-8");
      const persona = JSON.parse(content) as PersonaArchetype;
      personas.push(persona);
    } catch (e) {
      console.warn(`Failed to parse persona file: ${file}`, e);
    }
  }

  return NextResponse.json({ personas });
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
    if (!body?.path || !body?.content) {
      return NextResponse.json(
        { error: "path and content are required" },
        { status: 400 },
      );
    }

    const archetypeId = path.basename(body.path, path.extname(body.path));
    const persona = parsePersonaMarkdown(body.content, archetypeId);
    const personasPath = await resolvePersonasPath();
    const filePath = path.join(personasPath, `${archetypeId}.json`);

    await fs.writeFile(filePath, JSON.stringify(persona, null, 2), "utf-8");

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
    if (!body?.path || !body?.content) {
      return NextResponse.json(
        { error: "path and content are required" },
        { status: 400 },
      );
    }

    const archetypeId = path.basename(body.path, path.extname(body.path));
    const persona = parsePersonaMarkdown(body.content, archetypeId);
    const personasPath = await resolvePersonasPath();
    const filePath = path.join(personasPath, `${archetypeId}.json`);

    await fs.writeFile(filePath, JSON.stringify(persona, null, 2), "utf-8");

    return NextResponse.json({ success: true, persona });
  } catch (error) {
    console.error("[API /personas] PUT error:", error);
    return NextResponse.json(
      { error: "Failed to save persona" },
      { status: 500 },
    );
  }
}
