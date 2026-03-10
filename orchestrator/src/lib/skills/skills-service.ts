/**
 * Skills Service
 *
 * Manages skills from multiple sources:
 * - Local skills (filesystem)
 * - SkillsMP imported skills (Convex)
 *
 * Provides unified CRUD operations, searching, and trust management.
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import {
  SkillsMPClient,
  getSkillsMPClient,
  type SkillsMPSkill,
  type SearchResult,
} from "./skillsmp-client";
import * as fs from "fs/promises";
import * as path from "path";

function getConvexClient() {
  return new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
}

// ============================================
// TYPES
// ============================================

type TrustLevel = "vetted" | "community" | "untrusted";
type SkillSource = "local" | "skillsmp" | "imported";

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
// HELPER: Convex record → Skill
// ============================================

function convexToSkill(r: {
  _id: Id<"skills">;
  _creationTime: number;
  workspaceId?: Id<"workspaces">;
  source: string;
  name: string;
  description?: string;
  version?: string;
  entrypoint?: string;
  promptTemplate?: string;
  trustLevel: string;
  remoteMetadata?: unknown;
  metadata?: unknown;
  inputSchema?: unknown;
  outputSchema?: unknown;
  tags?: string[];
  lastSynced?: number;
}): Skill {
  return {
    id: r._id,
    workspaceId: r.workspaceId ?? null,
    source: r.source as SkillSource,
    name: r.name,
    description: r.description ?? null,
    version: r.version ?? null,
    entrypoint: r.entrypoint ?? null,
    promptTemplate: r.promptTemplate ?? null,
    trustLevel: r.trustLevel as TrustLevel,
    remoteMetadata: (r.remoteMetadata as Record<string, unknown>) ?? null,
    inputSchema: (r.inputSchema as Record<string, unknown>) ?? null,
    outputSchema: (r.outputSchema as Record<string, unknown>) ?? null,
    tags: r.tags ?? [],
    lastSynced: r.lastSynced ? new Date(r.lastSynced) : null,
    createdAt: new Date(r._creationTime),
    updatedAt: new Date(r._creationTime),
  };
}

// ============================================
// LOCAL SKILLS
// ============================================

const DEFAULT_SKILLS_PATH = ".cursor/skills";

function getWorkspaceRoot(): string {
  return path.resolve(process.cwd(), "..");
}

function resolveSkillsPath(skillsPath: string): string {
  if (path.isAbsolute(skillsPath)) return skillsPath;
  return path.join(getWorkspaceRoot(), skillsPath);
}

interface SkillMetadata {
  name: string;
  description: string;
  version: string;
  author?: string;
  tags?: string[];
  inputs?: Record<string, unknown>;
  outputs?: Record<string, unknown>;
}

function parseSkillMd(content: string): SkillMetadata {
  const metadata: SkillMetadata = {
    name: "",
    description: "",
    version: "1.0.0",
    tags: [],
  };

  const nameMatch = content.match(/^#\s+(.+)$/m);
  if (nameMatch) metadata.name = nameMatch[1].trim();

  const descMatch = content.match(/^#\s+.+\n+([^#\n].+)/m);
  if (descMatch) metadata.description = descMatch[1].trim();

  const versionMatch = content.match(/version:\s*(.+)/i);
  if (versionMatch) metadata.version = versionMatch[1].trim();

  const tagsMatch = content.match(/tags?:\s*(.+)/i);
  if (tagsMatch) metadata.tags = tagsMatch[1].split(",").map((t) => t.trim());

  return metadata;
}

export async function loadLocalSkills(
  workspaceId: string,
  skillsPath: string = DEFAULT_SKILLS_PATH,
): Promise<Skill[]> {
  const loadedSkills: Skill[] = [];
  const resolvedSkillsPath = resolveSkillsPath(skillsPath);

  try {
    const dirs = await fs.readdir(resolvedSkillsPath, { withFileTypes: true });

    for (const dir of dirs) {
      if (!dir.isDirectory()) continue;

      const skillDir = path.join(resolvedSkillsPath, dir.name);
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
          trustLevel: "vetted",
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

export async function syncLocalSkills(
  workspaceId: string,
  skillsPath: string = DEFAULT_SKILLS_PATH,
): Promise<number> {
  const localSkills = await loadLocalSkills(workspaceId, skillsPath);
  const client = getConvexClient();
  let syncedCount = 0;

  for (const skill of localSkills) {
    await client.mutation(api.skills.upsertByEntrypoint, {
      workspaceId: workspaceId as Id<"workspaces">,
      entrypoint: skill.entrypoint!,
      source: "local",
      name: skill.name,
      description: skill.description ?? undefined,
      version: skill.version ?? undefined,
      promptTemplate: skill.promptTemplate ?? undefined,
      trustLevel: "vetted",
      inputSchema: skill.inputSchema ?? undefined,
      outputSchema: skill.outputSchema ?? undefined,
      tags: skill.tags,
      lastSynced: Date.now(),
    });
    syncedCount++;
  }

  return syncedCount;
}

// ============================================
// SKILLSMP INTEGRATION
// ============================================

export async function searchSkillsMP(
  query: string,
  options: {
    semantic?: boolean;
    limit?: number;
    sortBy?: "stars" | "recent" | "downloads";
  } = {},
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

export async function importFromSkillsMP(
  input: ImportSkillInput,
): Promise<string> {
  const client = getSkillsMPClient();
  const skillData = await client.getSkill(input.skillsmpId);
  const convex = getConvexClient();

  const id = await convex.mutation(api.skills.create, {
    workspaceId: input.workspaceId as Id<"workspaces">,
    source: "skillsmp",
    name: skillData.name,
    description: skillData.description,
    version: input.pinVersion ? skillData.version : undefined,
    promptTemplate: skillData.promptTemplate || undefined,
    trustLevel: input.trustLevel || "community",
    remoteMetadata: {
      skillsmpId: skillData.id,
      author: skillData.author,
      url: skillData.url,
      repository: skillData.repository,
      stars: skillData.stars,
      downloads: skillData.downloads,
      pinnedVersion: input.pinVersion ? skillData.version : undefined,
    },
    inputSchema: skillData.inputSchema as Record<string, unknown>,
    outputSchema: skillData.outputSchema as Record<string, unknown>,
    tags: skillData.tags as string[],
    lastSynced: Date.now(),
  });

  return id;
}

export async function resyncSkillsMP(skillId: string): Promise<boolean> {
  const convex = getConvexClient();
  const skill = await convex.query(api.skills.getByLegacyId, { legacyId: skillId });

  // Try direct Convex ID lookup too
  let existingSkill = skill;
  if (!existingSkill) {
    try {
      const direct = await convex.query(api.skills.get, { id: skillId as Id<"skills"> });
      existingSkill = direct;
    } catch {
      return false;
    }
  }

  if (!existingSkill || existingSkill.source !== "skillsmp") return false;

  const remoteMetadata = existingSkill.remoteMetadata as Record<string, unknown>;
  const skillsmpId = remoteMetadata?.skillsmpId as string;
  if (!skillsmpId) return false;

  if (remoteMetadata?.pinnedVersion) return true;

  const client = getSkillsMPClient();
  const skillData = await client.getSkill(skillsmpId);

  await convex.mutation(api.skills.update, {
    id: existingSkill._id as Id<"skills">,
    name: skillData.name,
    description: skillData.description,
    promptTemplate: skillData.promptTemplate || undefined,
    remoteMetadata: {
      ...remoteMetadata,
      stars: skillData.stars,
      downloads: skillData.downloads,
    },
    inputSchema: skillData.inputSchema as Record<string, unknown>,
    outputSchema: skillData.outputSchema as Record<string, unknown>,
    tags: skillData.tags as string[],
    lastSynced: Date.now(),
  });

  return true;
}

// ============================================
// CRUD OPERATIONS
// ============================================

export async function getSkills(workspaceId?: string): Promise<Skill[]> {
  const client = getConvexClient();
  const results = await client.query(api.skills.list, {
    workspaceId: workspaceId as Id<"workspaces"> | undefined,
  });
  return results.map(convexToSkill);
}

export async function getSkillById(skillId: string): Promise<Skill | null> {
  const client = getConvexClient();
  try {
    const result = await client.query(api.skills.get, { id: skillId as Id<"skills"> });
    if (!result) return null;
    return convexToSkill(result);
  } catch {
    return null;
  }
}

export async function searchSkills(
  query: string,
  workspaceId?: string,
): Promise<Skill[]> {
  const allSkills = await getSkills(workspaceId);
  const lower = query.toLowerCase();
  return allSkills.filter(
    (s) =>
      s.name.toLowerCase().includes(lower) ||
      (s.description?.toLowerCase().includes(lower) ?? false),
  );
}

export async function createSkill(input: CreateSkillInput): Promise<string> {
  const client = getConvexClient();
  return await client.mutation(api.skills.create, {
    workspaceId: input.workspaceId as Id<"workspaces"> | undefined,
    source: input.source,
    name: input.name,
    description: input.description,
    version: input.version,
    entrypoint: input.entrypoint,
    promptTemplate: input.promptTemplate,
    trustLevel: input.trustLevel || "community",
    remoteMetadata: input.remoteMetadata,
    inputSchema: input.inputSchema,
    outputSchema: input.outputSchema,
    tags: input.tags,
    lastSynced: undefined,
  });
}

export async function updateSkillTrustLevel(
  skillId: string,
  trustLevel: TrustLevel,
): Promise<boolean> {
  const client = getConvexClient();
  try {
    await client.mutation(api.skills.update, {
      id: skillId as Id<"skills">,
      trustLevel,
    });
    return true;
  } catch {
    return false;
  }
}

export async function deleteSkill(skillId: string): Promise<boolean> {
  const client = getConvexClient();
  try {
    await client.mutation(api.skills.remove, { id: skillId as Id<"skills"> });
    return true;
  } catch {
    return false;
  }
}

// ============================================
// SKILL EXECUTION
// ============================================

export async function getSkillPrompt(skillId: string): Promise<string | null> {
  const skill = await getSkillById(skillId);
  if (!skill) return null;

  if (skill.source === "local" && skill.entrypoint) {
    try {
      const promptPath = path.join(skill.entrypoint, "prompt.txt");
      return await fs.readFile(promptPath, "utf-8");
    } catch {
      // Fall through
    }
  }

  return skill.promptTemplate;
}

export function isSkillTrusted(skill: Skill): boolean {
  return skill.trustLevel === "vetted";
}
