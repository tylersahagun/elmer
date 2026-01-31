import { Octokit } from "@octokit/rest";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import {
  agentDefinitions,
  agentKnowledgeSources,
  type SourceRepoTransformation,
} from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { parseCommand, parseRule, parseSkill, parseSubagent } from "./parser";

/**
 * Apply path transformations to content based on source repo mappings.
 * This is used when syncing agents from external repos (like pm-workspace)
 * to ensure paths are correctly adapted for the target workspace.
 */
function applyPathTransformations(
  content: string,
  transformation: SourceRepoTransformation | undefined,
): string {
  if (!transformation?.enabled || !transformation.pathMappings?.length) {
    return content;
  }

  let transformedContent = content;

  for (const mapping of transformation.pathMappings) {
    // Create regex for global replacement
    const escapedFrom = mapping.from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escapedFrom, "g");
    transformedContent = transformedContent.replace(regex, mapping.to);
  }

  // Apply Chromatic config if specified
  if (transformation.chromaticConfig) {
    const { token, appId, productionUrl } = transformation.chromaticConfig;

    // Replace Chromatic token patterns
    if (token) {
      transformedContent = transformedContent.replace(
        /CHROMATIC_PROJECT_TOKEN="[^"]+"/g,
        `CHROMATIC_PROJECT_TOKEN="${token}"`,
      );
      transformedContent = transformedContent.replace(
        /chpt_[a-zA-Z0-9]+/g,
        token,
      );
    }

    // Replace Chromatic app ID in URLs
    if (appId) {
      // Match Chromatic URL patterns and replace the app ID portion
      transformedContent = transformedContent.replace(
        /--[a-f0-9]+\.chromatic\.com/g,
        `--${appId}.chromatic.com`,
      );
    }
  }

  return transformedContent;
}

async function fetchFileContent(
  octokit: Octokit,
  owner: string,
  repo: string,
  path: string,
  ref?: string,
): Promise<string | null> {
  const { data } = await octokit.repos.getContent({ owner, repo, path, ref });
  if (Array.isArray(data)) return null;
  // Type guard: only file type has content property
  if (data.type !== "file" || !data.content) return null;
  if (data.encoding === "base64") {
    return Buffer.from(data.content, "base64").toString("utf-8");
  }
  return null;
}

async function listDir(
  octokit: Octokit,
  owner: string,
  repo: string,
  path: string,
  ref?: string,
) {
  const { data } = await octokit.repos.getContent({ owner, repo, path, ref });
  return Array.isArray(data) ? data : [];
}

export async function syncAgentArchitecture(params: {
  workspaceId: string;
  owner: string;
  repo: string;
  ref?: string;
  contextPaths?: string[];
  selection?: {
    agentsMd?: boolean;
    skills?: boolean;
    commands?: boolean;
    subagents?: boolean;
    rules?: boolean;
    knowledge?: boolean;
    personas?: boolean;
  };
  octokit: Octokit;
  transformation?: SourceRepoTransformation;
}) {
  const {
    workspaceId,
    owner,
    repo,
    ref,
    selection,
    octokit,
    contextPaths,
    transformation,
  } = params;
  const sourceRepo = `${owner}/${repo}`;
  const syncedAt = new Date();
  const include = {
    agentsMd: selection?.agentsMd !== false,
    skills: selection?.skills !== false,
    commands: selection?.commands !== false,
    subagents: selection?.subagents !== false,
    rules: selection?.rules !== false,
    knowledge: selection?.knowledge !== false,
    personas: selection?.personas !== false,
  };

  const root = await listDir(octokit, owner, repo, "", ref);
  const hasCursor = root.some(
    (item) => item.type === "dir" && item.name === ".cursor",
  );

  const definitions: Array<{
    id: string;
    workspaceId: string;
    sourceRepo: string;
    sourceRef: string;
    sourcePath: string;
    type: "agents_md" | "skill" | "command" | "subagent" | "rule";
    name: string;
    description?: string;
    triggers?: string[];
    content: string;
    metadata?: Record<string, unknown>;
    syncedAt: Date;
    createdAt: Date;
  }> = [];

  if (include.agentsMd) {
    const agentsContent = await fetchFileContent(
      octokit,
      owner,
      repo,
      "AGENTS.md",
      ref,
    );
    if (agentsContent) {
      definitions.push({
        id: nanoid(),
        workspaceId,
        sourceRepo,
        sourceRef: ref || "default",
        sourcePath: "AGENTS.md",
        type: "agents_md",
        name: "AGENTS.md",
        content: applyPathTransformations(agentsContent, transformation),
        syncedAt,
        createdAt: syncedAt,
      });
    }
  }

  if (
    hasCursor &&
    (include.skills || include.commands || include.subagents || include.rules)
  ) {
    const cursorDirs = await listDir(octokit, owner, repo, ".cursor", ref);
    const cursorEntries = new Set(cursorDirs.map((item) => item.name));

    if (include.skills && cursorEntries.has("skills")) {
      try {
        const skillDirs = await listDir(
          octokit,
          owner,
          repo,
          ".cursor/skills",
          ref,
        );
        for (const dir of skillDirs) {
          if (dir.type !== "dir") continue;
          const path = `.cursor/skills/${dir.name}/SKILL.md`;
          const content = await fetchFileContent(
            octokit,
            owner,
            repo,
            path,
            ref,
          );
          if (!content) continue;
          const transformedContent = applyPathTransformations(
            content,
            transformation,
          );
          const skill = parseSkill(transformedContent, path);
          definitions.push({
            id: nanoid(),
            workspaceId,
            sourceRepo,
            sourceRef: ref || "default",
            sourcePath: path,
            type: "skill",
            name: skill.name,
            description: skill.description,
            triggers: skill.triggers,
            content: skill.content,
            metadata: {
              workflow: skill.workflow,
              templates: skill.templates,
              outputPaths: skill.outputPaths,
            },
            syncedAt,
            createdAt: syncedAt,
          });
        }
      } catch (error) {
        // Handle 404 or other errors gracefully - the folder may not exist
        console.warn(
          `[syncAgentArchitecture] Failed to list .cursor/skills: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    }

    if (include.commands && cursorEntries.has("commands")) {
      try {
        const commandFiles = await listDir(
          octokit,
          owner,
          repo,
          ".cursor/commands",
          ref,
        );
        for (const file of commandFiles) {
          if (file.type !== "file" || !file.name.endsWith(".md")) continue;
          const path = `.cursor/commands/${file.name}`;
          const content = await fetchFileContent(
            octokit,
            owner,
            repo,
            path,
            ref,
          );
          if (!content) continue;
          const transformedContent = applyPathTransformations(
            content,
            transformation,
          );
          const command = parseCommand(transformedContent, path);
          definitions.push({
            id: nanoid(),
            workspaceId,
            sourceRepo,
            sourceRef: ref || "default",
            sourcePath: path,
            type: "command",
            name: command.name,
            description: command.description,
            content: transformedContent,
            metadata: {
              delegatesTo: command.delegatesTo,
              steps: command.steps,
              prerequisites: command.prerequisites,
              usage: command.usage,
            },
            syncedAt,
            createdAt: syncedAt,
          });
        }
      } catch (error) {
        // Handle 404 or other errors gracefully - the folder may not exist
        console.warn(
          `[syncAgentArchitecture] Failed to list .cursor/commands: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    }

    if (include.subagents && cursorEntries.has("agents")) {
      try {
        const agentFiles = await listDir(
          octokit,
          owner,
          repo,
          ".cursor/agents",
          ref,
        );
        for (const file of agentFiles) {
          if (file.type !== "file" || !file.name.endsWith(".md")) continue;
          const path = `.cursor/agents/${file.name}`;
          const content = await fetchFileContent(
            octokit,
            owner,
            repo,
            path,
            ref,
          );
          if (!content) continue;
          const transformedContent = applyPathTransformations(
            content,
            transformation,
          );
          const subagent = parseSubagent(transformedContent, path);
          definitions.push({
            id: nanoid(),
            workspaceId,
            sourceRepo,
            sourceRef: ref || "default",
            sourcePath: path,
            type: "subagent",
            name: subagent.name,
            description: subagent.description,
            content: transformedContent,
            metadata: {
              model: subagent.model,
              readonly: subagent.readonly,
              contextFiles: subagent.contextFiles,
              outputPaths: subagent.outputPaths,
            },
            syncedAt,
            createdAt: syncedAt,
          });
        }
      } catch (error) {
        // Handle 404 or other errors gracefully - the folder may not exist
        console.warn(
          `[syncAgentArchitecture] Failed to list .cursor/agents: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    }

    if (include.rules && cursorEntries.has("rules")) {
      try {
        const ruleFiles = await listDir(
          octokit,
          owner,
          repo,
          ".cursor/rules",
          ref,
        );
        for (const file of ruleFiles) {
          if (file.type !== "file" || !file.name.endsWith(".mdc")) continue;
          const path = `.cursor/rules/${file.name}`;
          const content = await fetchFileContent(
            octokit,
            owner,
            repo,
            path,
            ref,
          );
          if (!content) continue;
          const transformedContent = applyPathTransformations(
            content,
            transformation,
          );
          const rule = parseRule(transformedContent, path);
          definitions.push({
            id: nanoid(),
            workspaceId,
            sourceRepo,
            sourceRef: ref || "default",
            sourcePath: path,
            type: "rule",
            name: rule.description || file.name,
            description: rule.description,
            content: transformedContent,
            metadata: {
              globs: rule.globs,
              alwaysApply: rule.alwaysApply,
            },
            syncedAt,
            createdAt: syncedAt,
          });
        }
      } catch (error) {
        // Handle 404 or other errors gracefully - the folder may not exist
        console.warn(
          `[syncAgentArchitecture] Failed to list .cursor/rules: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    }
  }

  // Replace existing definitions for this repo/ref
  await db
    .delete(agentDefinitions)
    .where(
      and(
        eq(agentDefinitions.workspaceId, workspaceId),
        eq(agentDefinitions.sourceRepo, sourceRepo),
        eq(agentDefinitions.sourceRef, ref || "default"),
      ),
    );
  if (definitions.length > 0) {
    await db.insert(agentDefinitions).values(definitions);
  }

  const normalizeContextPath = (value: string) =>
    value.replace(/^\/+/, "").replace(/^\.\//, "").replace(/\/+$/, "");

  const normalizedContextPaths = (contextPaths || [])
    .map((path) => normalizeContextPath(path))
    .filter(Boolean);

  const knowledgeCandidates = [
    "pm-workspace-docs",
    "elmer-docs",
    "docs",
    "documentation",
    ".planning",
  ];

  const knowledgePaths =
    normalizedContextPaths.length > 0
      ? Array.from(new Set(normalizedContextPaths))
      : root
          .filter(
            (item) =>
              item.type === "dir" && knowledgeCandidates.includes(item.name),
          )
          .map((item) => item.name);

  if (include.knowledge && knowledgePaths.length) {
    await db
      .delete(agentKnowledgeSources)
      .where(
        and(
          eq(agentKnowledgeSources.workspaceId, workspaceId),
          eq(agentKnowledgeSources.sourceRepo, sourceRepo),
          eq(agentKnowledgeSources.sourceRef, ref || "default"),
        ),
      );
    const entries = knowledgePaths.map((path) => ({
      id: nanoid(),
      workspaceId,
      sourceRepo,
      sourceRef: ref || "default",
      sourcePath: `${normalizeContextPath(path)}/`,
      type: "knowledge",
      name: path,
      syncedAt,
    }));
    await db.insert(agentKnowledgeSources).values(entries);
  }

  if (include.personas && knowledgePaths.length) {
    const personaPaths: string[] = [];
    for (const knowledgePath of knowledgePaths) {
      const normalized = normalizeContextPath(knowledgePath);
      if (!normalized) continue;
      if (normalized.endsWith("/personas")) {
        personaPaths.push(`${normalized}/`);
        continue;
      }
      try {
        const entries = await listDir(octokit, owner, repo, normalized, ref);
        if (
          entries.some(
            (entry) => entry.name === "personas" && entry.type === "dir",
          )
        ) {
          personaPaths.push(`${normalized}/personas/`);
        }
      } catch {
        continue;
      }
    }

    if (personaPaths.length) {
      await db
        .delete(agentKnowledgeSources)
        .where(
          and(
            eq(agentKnowledgeSources.workspaceId, workspaceId),
            eq(agentKnowledgeSources.sourceRepo, sourceRepo),
            eq(agentKnowledgeSources.sourceRef, ref || "default"),
            eq(agentKnowledgeSources.type, "personas"),
          ),
        );
      const personaEntries = Array.from(new Set(personaPaths)).map((path) => ({
        id: nanoid(),
        workspaceId,
        sourceRepo,
        sourceRef: ref || "default",
        sourcePath: path,
        type: "personas",
        name: "personas",
        syncedAt,
      }));
      await db.insert(agentKnowledgeSources).values(personaEntries);
    }
  }

  return {
    count: definitions.length,
    knowledgePaths: include.knowledge ? knowledgePaths : [],
    include,
  };
}
