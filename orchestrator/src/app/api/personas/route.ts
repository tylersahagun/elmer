/**
 * Personas API - Read persona archetypes from elmer-docs
 * 
 * GET - List all persona archetypes
 */

import { NextResponse } from "next/server";
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

const PERSONAS_PATH = path.join(process.cwd(), "..", "elmer-docs", "personas", "archetypes");

export async function GET() {
  try {
    // Check if directory exists
    try {
      await fs.access(PERSONAS_PATH);
    } catch {
      // Try alternative path (might be running from project root)
      const altPath = path.join(process.cwd(), "elmer-docs", "personas", "archetypes");
      try {
        await fs.access(altPath);
        return await loadPersonasFromPath(altPath);
      } catch {
        return NextResponse.json({ personas: [], error: "Personas directory not found" });
      }
    }

    return await loadPersonasFromPath(PERSONAS_PATH);
  } catch (error) {
    console.error("[API /personas] GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch personas" },
      { status: 500 }
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
