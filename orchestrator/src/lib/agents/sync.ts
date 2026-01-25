import { Octokit } from "@octokit/rest";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { agentDefinitions, agentKnowledgeSources } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import {
  parseCommand,
  parseRule,
  parseSkill,
  parseSubagent,
} from "./parser";

async function fetchFileContent(
  octokit: Octokit,
  owner: string,
  repo: string,
  path: string,
  ref?: string
): Promise<string | null> {
  const { data } = await octokit.repos.getContent({ owner, repo, path, ref });
  if (Array.isArray(data) || !data.content) return null;
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
  ref?: string
) {
  const { data } = await octokit.repos.getContent({ owner, repo, path, ref });
  return Array.isArray(data) ? data : [];
}

export async function syncAgentArchitecture(params: {
  workspaceId: string;
  owner: string;
  repo: string;
  ref?: string;
  octokit: Octokit;
}) {
  const { workspaceId, owner, repo, ref, octokit } = params;
  const sourceRepo = `${owner}/${repo}`;
  const syncedAt = new Date();

  const root = await listDir(octokit, owner, repo, "", ref);
  const hasCursor = root.some((item) => item.type === "dir" && item.name === ".cursor");

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

  const agentsContent = await fetchFileContent(octokit, owner, repo, "AGENTS.md", ref);
  if (agentsContent) {
    definitions.push({
      id: nanoid(),
      workspaceId,
      sourceRepo,
      sourceRef: ref || "default",
      sourcePath: "AGENTS.md",
      type: "agents_md",
      name: "AGENTS.md",
      content: agentsContent,
      syncedAt,
      createdAt: syncedAt,
    });
  }

  if (hasCursor) {
    const cursorDirs = await listDir(octokit, owner, repo, ".cursor", ref);
    const cursorEntries = new Set(cursorDirs.map((item) => item.name));

    if (cursorEntries.has("skills")) {
      const skillDirs = await listDir(octokit, owner, repo, ".cursor/skills", ref);
      for (const dir of skillDirs) {
        if (dir.type !== "dir") continue;
        const path = `.cursor/skills/${dir.name}/SKILL.md`;
        const content = await fetchFileContent(octokit, owner, repo, path, ref);
        if (!content) continue;
        const skill = parseSkill(content, path);
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
    }

    if (cursorEntries.has("commands")) {
      const commandFiles = await listDir(octokit, owner, repo, ".cursor/commands", ref);
      for (const file of commandFiles) {
        if (file.type !== "file" || !file.name.endsWith(".md")) continue;
        const path = `.cursor/commands/${file.name}`;
        const content = await fetchFileContent(octokit, owner, repo, path, ref);
        if (!content) continue;
        const command = parseCommand(content, path);
        definitions.push({
          id: nanoid(),
          workspaceId,
          sourceRepo,
          sourceRef: ref || "default",
          sourcePath: path,
          type: "command",
          name: command.name,
          description: command.description,
          content,
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
    }

    if (cursorEntries.has("agents")) {
      const agentFiles = await listDir(octokit, owner, repo, ".cursor/agents", ref);
      for (const file of agentFiles) {
        if (file.type !== "file" || !file.name.endsWith(".md")) continue;
        const path = `.cursor/agents/${file.name}`;
        const content = await fetchFileContent(octokit, owner, repo, path, ref);
        if (!content) continue;
        const subagent = parseSubagent(content, path);
        definitions.push({
          id: nanoid(),
          workspaceId,
          sourceRepo,
          sourceRef: ref || "default",
          sourcePath: path,
          type: "subagent",
          name: subagent.name,
          description: subagent.description,
          content,
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
    }

    if (cursorEntries.has("rules")) {
      const ruleFiles = await listDir(octokit, owner, repo, ".cursor/rules", ref);
      for (const file of ruleFiles) {
        if (file.type !== "file" || !file.name.endsWith(".mdc")) continue;
        const path = `.cursor/rules/${file.name}`;
        const content = await fetchFileContent(octokit, owner, repo, path, ref);
        if (!content) continue;
        const rule = parseRule(content, path);
        definitions.push({
          id: nanoid(),
          workspaceId,
          sourceRepo,
          sourceRef: ref || "default",
          sourcePath: path,
          type: "rule",
          name: rule.description || file.name,
          description: rule.description,
          content,
          metadata: {
            globs: rule.globs,
            alwaysApply: rule.alwaysApply,
          },
          syncedAt,
          createdAt: syncedAt,
        });
      }
    }
  }

  // Replace existing definitions for this repo/ref
  await db.delete(agentDefinitions).where(
    and(
      eq(agentDefinitions.workspaceId, workspaceId),
      eq(agentDefinitions.sourceRepo, sourceRepo),
      eq(agentDefinitions.sourceRef, ref || "default")
    )
  );
  if (definitions.length > 0) {
    await db.insert(agentDefinitions).values(definitions);
  }

  const knowledgeCandidates = [
    "pm-workspace-docs",
    "elmer-docs",
    "docs",
    "documentation",
    ".planning",
  ];
  const knowledgePaths = root
    .filter((item) => item.type === "dir" && knowledgeCandidates.includes(item.name))
    .map((item) => item.name);

  if (knowledgePaths.length) {
    await db.delete(agentKnowledgeSources).where(
      and(
        eq(agentKnowledgeSources.workspaceId, workspaceId),
        eq(agentKnowledgeSources.sourceRepo, sourceRepo),
        eq(agentKnowledgeSources.sourceRef, ref || "default")
      )
    );
    const entries = knowledgePaths.map((path) => ({
      id: nanoid(),
      workspaceId,
      sourceRepo,
      sourceRef: ref || "default",
      sourcePath: `${path}/`,
      type: "knowledge",
      name: path,
      syncedAt,
    }));
    await db.insert(agentKnowledgeSources).values(entries);
  }

  return { count: definitions.length };
}
