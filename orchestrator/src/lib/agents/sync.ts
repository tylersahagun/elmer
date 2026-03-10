import { Octokit } from "@octokit/rest";
import {
  syncConvexAgentDefinitions,
  syncConvexAgentKnowledgeSources,
} from "@/lib/convex/server";
import { parseCommand, parseRule, parseSkill, parseSubagent } from "./parser";

type SourceRepoTransformation = {
  enabled?: boolean;
  pathMappings?: Array<{ from: string; to: string }>;
  chromaticConfig?: {
    token?: string;
    appId?: string;
    productionUrl?: string;
  };
};

/**
 * Apply path transformations to content based on source repo mappings.
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
    const escapedFrom = mapping.from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escapedFrom, "g");
    transformedContent = transformedContent.replace(regex, mapping.to);
  }

  if (transformation.chromaticConfig) {
    const { token, appId } = transformation.chromaticConfig;

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

    if (appId) {
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
  const syncedAt = Date.now();
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
    name: string;
    type: "agents_md" | "skill" | "command" | "subagent" | "rule";
    sourcePath: string;
    description?: string;
    triggers?: string[];
    content: string;
    metadata?: Record<string, unknown>;
    syncedAt: number;
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
        name: "AGENTS.md",
        type: "agents_md",
        sourcePath: "AGENTS.md",
        content: applyPathTransformations(agentsContent, transformation),
        syncedAt,
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
            name: skill.name,
            type: "skill",
            sourcePath: path,
            description: skill.description,
            triggers: skill.triggers,
            content: skill.content,
            metadata: {
              workflow: skill.workflow,
              templates: skill.templates,
              outputPaths: skill.outputPaths,
            },
            syncedAt,
          });
        }
      } catch (error) {
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
            name: command.name,
            type: "command",
            sourcePath: path,
            description: command.description,
            content: transformedContent,
            metadata: {
              delegatesTo: command.delegatesTo,
              steps: command.steps,
              prerequisites: command.prerequisites,
              usage: command.usage,
            },
            syncedAt,
          });
        }
      } catch (error) {
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
            name: subagent.name,
            type: "subagent",
            sourcePath: path,
            description: subagent.description,
            content: transformedContent,
            metadata: {
              model: subagent.model,
              readonly: subagent.readonly,
              contextFiles: subagent.contextFiles,
              outputPaths: subagent.outputPaths,
            },
            syncedAt,
          });
        }
      } catch (error) {
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
            name: rule.description || file.name,
            type: "rule",
            sourcePath: path,
            description: rule.description,
            content: transformedContent,
            metadata: {
              globs: rule.globs,
              alwaysApply: rule.alwaysApply,
            },
            syncedAt,
          });
        }
      } catch (error) {
        console.warn(
          `[syncAgentArchitecture] Failed to list .cursor/rules: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    }
  }

  // Sync definitions to Convex (delete old, insert new)
  await syncConvexAgentDefinitions({
    workspaceId,
    sourceRepo,
    sourceRef: ref || "default",
    definitions,
  });

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
    const entries = knowledgePaths.map((path) => ({
      sourcePath: `${normalizeContextPath(path)}/`,
      type: "knowledge",
      name: path,
      syncedAt,
    }));
    await syncConvexAgentKnowledgeSources({
      workspaceId,
      sourceRepo,
      sourceRef: ref || "default",
      entries,
    });
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
      const personaEntries = Array.from(new Set(personaPaths)).map((path) => ({
        sourcePath: path,
        type: "personas",
        name: "personas",
        syncedAt,
      }));
      await syncConvexAgentKnowledgeSources({
        workspaceId,
        sourceRepo,
        sourceRef: ref || "default",
        typeFilter: "personas",
        entries: personaEntries,
      });
    }
  }

  return {
    count: definitions.length,
    knowledgePaths: include.knowledge ? knowledgePaths : [],
    include,
  };
}
