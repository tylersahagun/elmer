/**
 * Skills Service
 * 
 * Manages skills from multiple sources:
 * - Local skills (filesystem)
 * - SkillsMP imported skills (database)
 * 
 * Provides unified CRUD operations, searching, and trust management.
 */

import { db } from "@/lib/db";
import { skills, type TrustLevel, type SkillSource } from "@/lib/db/schema";
import { eq, and, ilike, or, sql, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { 
  SkillsMPClient, 
  getSkillsMPClient,
  type SkillsMPSkill,
  type SearchResult 
} from "./skillsmp-client";
import * as fs from "fs/promises";
import * as path from "path";

// ============================================
// TYPES
// ============================================

export interface Skill {
  id: string;
  workspaceId: string | null;
  source: SkillSource;
  name: string;
  description: string | null;
  version: string | null;
  entrypoint: string | null;
  promptTemplate: string | null;
  trustLevel: TrustLevel;
  remoteMetadata: Record<string, unknown> | null;
  inputSchema: Record<string, unknown> | null;
  outputSchema: Record<string, unknown> | null;
  tags: string[];
  lastSynced: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSkillInput {
  workspaceId?: string;
  source: SkillSource;
  name: string;
  description?: string;
  version?: string;
  entrypoint?: string;
  promptTemplate?: string;
  trustLevel?: TrustLevel;
  remoteMetadata?: Record<string, unknown>;
  inputSchema?: Record<string, unknown>;
  outputSchema?: Record<string, unknown>;
  tags?: string[];
}

export interface ImportSkillInput {
  workspaceId: string;
  skillsmpId: string;
  trustLevel?: TrustLevel;
  pinVersion?: boolean;
}

// ============================================
// LOCAL SKILLS
// ============================================

const DEFAULT_SKILLS_PATH = "skills";

interface SkillMetadata {
  name: string;
  description: string;
  version: string;
  author?: string;
  tags?: string[];
  inputs?: Record<string, unknown>;
  outputs?: Record<string, unknown>;
}

/**
 * Parse SKILL.md file to extract metadata
 */
function parseSkillMd(content: string): SkillMetadata {
  const lines = content.split("\n");
  const metadata: SkillMetadata = {
    name: "",
    description: "",
    version: "1.0.0",
    tags: [],
  };

  // Extract name from first heading
  const nameMatch = content.match(/^#\s+(.+)$/m);
  if (nameMatch) {
    metadata.name = nameMatch[1].trim();
  }

  // Extract description from first paragraph after heading
  const descMatch = content.match(/^#\s+.+\n+([^#\n].+)/m);
  if (descMatch) {
    metadata.description = descMatch[1].trim();
  }

  // Extract version from metadata block
  const versionMatch = content.match(/version:\s*(.+)/i);
  if (versionMatch) {
    metadata.version = versionMatch[1].trim();
  }

  // Extract tags
  const tagsMatch = content.match(/tags?:\s*(.+)/i);
  if (tagsMatch) {
    metadata.tags = tagsMatch[1].split(",").map((t) => t.trim());
  }

  return metadata;
}

/**
 * Load local skills from filesystem
 */
export async function loadLocalSkills(
  workspaceId: string,
  skillsPath: string = DEFAULT_SKILLS_PATH
): Promise<Skill[]> {
  const loadedSkills: Skill[] = [];

  try {
    const dirs = await fs.readdir(skillsPath, { withFileTypes: true });

    for (const dir of dirs) {
      if (!dir.isDirectory()) continue;

      const skillDir = path.join(skillsPath, dir.name);
      const skillMdPath = path.join(skillDir, "SKILL.md");
      const promptPath = path.join(skillDir, "prompt.txt");

      try {
        const skillMdContent = await fs.readFile(skillMdPath, "utf-8");
        const metadata = parseSkillMd(skillMdContent);

        let promptTemplate: string | null = null;
        try {
          promptTemplate = await fs.readFile(promptPath, "utf-8");
        } catch {
          // No prompt.txt file
        }

        loadedSkills.push({
          id: `local_${dir.name}`,
          workspaceId,
          source: "local",
          name: metadata.name || dir.name,
          description: metadata.description,
          version: metadata.version,
          entrypoint: skillDir,
          promptTemplate,
          trustLevel: "vetted", // Local skills are trusted by default
          remoteMetadata: null,
          inputSchema: metadata.inputs || null,
          outputSchema: metadata.outputs || null,
          tags: metadata.tags || [],
          lastSynced: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } catch {
        // Skip directories without valid SKILL.md
      }
    }
  } catch {
    // Skills directory doesn't exist
  }

  return loadedSkills;
}

/**
 * Sync local skills to database
 */
export async function syncLocalSkills(
  workspaceId: string,
  skillsPath: string = DEFAULT_SKILLS_PATH
): Promise<number> {
  const localSkills = await loadLocalSkills(workspaceId, skillsPath);
  let syncedCount = 0;

  for (const skill of localSkills) {
    const existing = await db
      .select()
      .from(skills)
      .where(
        and(
          eq(skills.workspaceId, workspaceId),
          eq(skills.source, "local"),
          eq(skills.entrypoint, skill.entrypoint!)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Update existing
      await db
        .update(skills)
        .set({
          name: skill.name,
          description: skill.description,
          version: skill.version,
          promptTemplate: skill.promptTemplate,
          inputSchema: skill.inputSchema as typeof skills.$inferInsert["inputSchema"],
          outputSchema: skill.outputSchema as typeof skills.$inferInsert["outputSchema"],
          tags: skill.tags as typeof skills.$inferInsert["tags"],
          lastSynced: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(skills.id, existing[0].id));
    } else {
      // Create new
      await db.insert(skills).values({
        id: `skill_${nanoid()}`,
        workspaceId,
        source: "local",
        name: skill.name,
        description: skill.description,
        version: skill.version,
        entrypoint: skill.entrypoint,
        promptTemplate: skill.promptTemplate,
        trustLevel: "vetted",
        inputSchema: skill.inputSchema as typeof skills.$inferInsert["inputSchema"],
        outputSchema: skill.outputSchema as typeof skills.$inferInsert["outputSchema"],
        tags: skill.tags as typeof skills.$inferInsert["tags"],
        lastSynced: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    syncedCount++;
  }

  return syncedCount;
}

// ============================================
// SKILLSMP INTEGRATION
// ============================================

/**
 * Search SkillsMP marketplace
 */
export async function searchSkillsMP(
  query: string,
  options: {
    semantic?: boolean;
    limit?: number;
    sortBy?: "stars" | "recent" | "downloads";
  } = {}
): Promise<SearchResult> {
  const client = getSkillsMPClient();

  if (options.semantic) {
    return client.aiSearch(query, options.limit);
  }

  return client.search({
    q: query,
    limit: options.limit,
    sortBy: options.sortBy,
  });
}

/**
 * Import a skill from SkillsMP
 */
export async function importFromSkillsMP(
  input: ImportSkillInput
): Promise<string> {
  const client = getSkillsMPClient();
  const skillData = await client.getSkill(input.skillsmpId);

  const skillId = `skill_${nanoid()}`;
  const now = new Date();

  await db.insert(skills).values({
    id: skillId,
    workspaceId: input.workspaceId,
    source: "skillsmp",
    name: skillData.name,
    description: skillData.description,
    version: input.pinVersion ? skillData.version : null,
    promptTemplate: skillData.promptTemplate || null,
    trustLevel: input.trustLevel || "community",
    remoteMetadata: {
      skillsmpId: skillData.id,
      author: skillData.author,
      url: skillData.url,
      repository: skillData.repository,
      stars: skillData.stars,
      downloads: skillData.downloads,
      pinnedVersion: input.pinVersion ? skillData.version : undefined,
    } as typeof skills.$inferInsert["remoteMetadata"],
    inputSchema: skillData.inputSchema as typeof skills.$inferInsert["inputSchema"],
    outputSchema: skillData.outputSchema as typeof skills.$inferInsert["outputSchema"],
    tags: skillData.tags as typeof skills.$inferInsert["tags"],
    lastSynced: now,
    createdAt: now,
    updatedAt: now,
  });

  return skillId;
}

/**
 * Re-sync a SkillsMP skill to get latest version
 */
export async function resyncSkillsMP(skillId: string): Promise<boolean> {
  const existing = await db
    .select()
    .from(skills)
    .where(eq(skills.id, skillId))
    .limit(1);

  if (!existing[0] || existing[0].source !== "skillsmp") {
    return false;
  }

  const remoteMetadata = existing[0].remoteMetadata as Record<string, unknown>;
  const skillsmpId = remoteMetadata?.skillsmpId as string;
  if (!skillsmpId) return false;

  // Don't sync if version is pinned
  if (remoteMetadata?.pinnedVersion) {
    return true;
  }

  const client = getSkillsMPClient();
  const skillData = await client.getSkill(skillsmpId);

  await db
    .update(skills)
    .set({
      name: skillData.name,
      description: skillData.description,
      promptTemplate: skillData.promptTemplate || null,
      remoteMetadata: {
        ...remoteMetadata,
        stars: skillData.stars,
        downloads: skillData.downloads,
      } as typeof skills.$inferInsert["remoteMetadata"],
      inputSchema: skillData.inputSchema as typeof skills.$inferInsert["inputSchema"],
      outputSchema: skillData.outputSchema as typeof skills.$inferInsert["outputSchema"],
      tags: skillData.tags as typeof skills.$inferInsert["tags"],
      lastSynced: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(skills.id, skillId));

  return true;
}

// ============================================
// CRUD OPERATIONS
// ============================================

export async function getSkills(workspaceId?: string): Promise<Skill[]> {
  const query = workspaceId
    ? db.select().from(skills).where(
        or(eq(skills.workspaceId, workspaceId), sql`${skills.workspaceId} IS NULL`)
      )
    : db.select().from(skills);

  const results = await query.orderBy(desc(skills.updatedAt));

  return results.map((r) => ({
    ...r,
    tags: (r.tags as string[]) || [],
    remoteMetadata: r.remoteMetadata as Record<string, unknown> | null,
    inputSchema: r.inputSchema as Record<string, unknown> | null,
    outputSchema: r.outputSchema as Record<string, unknown> | null,
  }));
}

export async function getSkillById(skillId: string): Promise<Skill | null> {
  const results = await db
    .select()
    .from(skills)
    .where(eq(skills.id, skillId))
    .limit(1);

  if (!results[0]) return null;

  return {
    ...results[0],
    tags: (results[0].tags as string[]) || [],
    remoteMetadata: results[0].remoteMetadata as Record<string, unknown> | null,
    inputSchema: results[0].inputSchema as Record<string, unknown> | null,
    outputSchema: results[0].outputSchema as Record<string, unknown> | null,
  };
}

export async function searchSkills(
  query: string,
  workspaceId?: string
): Promise<Skill[]> {
  const searchPattern = `%${query}%`;

  let baseQuery = db
    .select()
    .from(skills)
    .where(
      and(
        or(
          ilike(skills.name, searchPattern),
          ilike(skills.description, searchPattern)
        ),
        workspaceId
          ? or(eq(skills.workspaceId, workspaceId), sql`${skills.workspaceId} IS NULL`)
          : undefined
      )
    )
    .orderBy(desc(skills.updatedAt))
    .limit(50);

  const results = await baseQuery;

  return results.map((r) => ({
    ...r,
    tags: (r.tags as string[]) || [],
    remoteMetadata: r.remoteMetadata as Record<string, unknown> | null,
    inputSchema: r.inputSchema as Record<string, unknown> | null,
    outputSchema: r.outputSchema as Record<string, unknown> | null,
  }));
}

export async function createSkill(input: CreateSkillInput): Promise<string> {
  const skillId = `skill_${nanoid()}`;
  const now = new Date();

  await db.insert(skills).values({
    id: skillId,
    workspaceId: input.workspaceId || null,
    source: input.source,
    name: input.name,
    description: input.description || null,
    version: input.version || null,
    entrypoint: input.entrypoint || null,
    promptTemplate: input.promptTemplate || null,
    trustLevel: input.trustLevel || "community",
    remoteMetadata: input.remoteMetadata as typeof skills.$inferInsert["remoteMetadata"],
    inputSchema: input.inputSchema as typeof skills.$inferInsert["inputSchema"],
    outputSchema: input.outputSchema as typeof skills.$inferInsert["outputSchema"],
    tags: input.tags as typeof skills.$inferInsert["tags"],
    createdAt: now,
    updatedAt: now,
  });

  return skillId;
}

export async function updateSkillTrustLevel(
  skillId: string,
  trustLevel: TrustLevel
): Promise<boolean> {
  const result = await db
    .update(skills)
    .set({ trustLevel, updatedAt: new Date() })
    .where(eq(skills.id, skillId));

  return (result.rowCount ?? 0) > 0;
}

export async function deleteSkill(skillId: string): Promise<boolean> {
  const result = await db.delete(skills).where(eq(skills.id, skillId));
  return (result.rowCount ?? 0) > 0;
}

// ============================================
// SKILL EXECUTION
// ============================================

/**
 * Get the prompt template for a skill
 */
export async function getSkillPrompt(skillId: string): Promise<string | null> {
  const skill = await getSkillById(skillId);
  if (!skill) return null;

  // If local skill with entrypoint, try to read prompt.txt
  if (skill.source === "local" && skill.entrypoint) {
    try {
      const promptPath = path.join(skill.entrypoint, "prompt.txt");
      return await fs.readFile(promptPath, "utf-8");
    } catch {
      // Fall through to promptTemplate
    }
  }

  return skill.promptTemplate;
}

/**
 * Check if a skill is trusted for fully_auto execution
 */
export function isSkillTrusted(skill: Skill): boolean {
  return skill.trustLevel === "vetted";
}
