import { mcpGet, mcpPost, mcpPatch, WORKSPACE_ID, type ConvexProject, type ConvexDocument } from "../convex-client.js";

export async function listProjects(): Promise<string> {
  const projects = await mcpGet("/projects") as ConvexProject[];
  if (!projects?.length) return "No projects found.";

  const grouped: Record<string, ConvexProject[]> = {};
  for (const p of projects) {
    grouped[p.stage] = grouped[p.stage] ?? [];
    grouped[p.stage].push(p);
  }

  const stageOrder = ["inbox", "discovery", "define", "build", "validate", "launch"];
  const lines: string[] = ["# Active Projects\n"];
  for (const stage of stageOrder) {
    const ps = grouped[stage];
    if (!ps?.length) continue;
    lines.push(`## ${stage.toUpperCase()}`);
    for (const p of ps) {
      const tldr = (p.metadata as Record<string, unknown> | undefined)?.tldr as string | undefined;
      lines.push(`**${p.name}** (${p.priority}, ${p.status}) — ID: \`${p._id}\``);
      if (tldr) lines.push(`> ${tldr}`);
    }
    lines.push("");
  }
  return lines.join("\n");
}

export async function getProject(projectId: string): Promise<string> {
  const { project, documents } = await mcpGet("/project", { id: projectId }) as {
    project: ConvexProject;
    documents: ConvexDocument[];
  };
  if (!project) return `Project not found: ${projectId}`;

  const tldr = (project.metadata as Record<string, unknown> | undefined)?.tldr as string | undefined;
  const lines: string[] = [
    `# ${project.name}`,
    `**Stage:** ${project.stage}  **Status:** ${project.status}  **Priority:** ${project.priority}`,
    `**ID:** \`${project._id}\``,
  ];
  if (tldr) lines.push(`\n> ${tldr}`);
  if (project.description) lines.push(`\n${project.description}`);

  if (documents?.length) {
    lines.push(`\n## Documents (${documents.length})`);
    for (const d of documents) {
      lines.push(`- **${d.type}**: ${d.title} (v${d.version}, ${d.reviewStatus})`);
    }
  } else {
    lines.push("\n*No documents yet.*");
  }

  lines.push(`\n**Link:** https://elmer.studio/projects/${projectId}`);
  return lines.join("\n");
}

export async function createProject(
  name: string,
  description?: string,
  stage?: string,
  priority?: string,
): Promise<string> {
  const result = await mcpPost("/projects", { name, description, stage, priority }) as { id: string };
  return `✅ Created project **${name}**\n\nID: \`${result.id}\`\nLink: https://elmer.studio/projects/${result.id}`;
}

export async function updateProject(
  projectId: string,
  updates: {
    stage?: string;
    status?: string;
    priority?: string;
    description?: string;
    slackChannelId?: string;
    slackChannelName?: string;
  },
): Promise<string> {
  await mcpPatch("/project", { id: projectId, ...updates });
  const parts = [`✅ Updated project \`${projectId}\``];
  if (updates.slackChannelId) {
    parts.push(
      `\nLinked Slack channel: \`${updates.slackChannelId}\`` +
      (updates.slackChannelName ? ` (#${updates.slackChannelName})` : ""),
    );
    parts.push(
      `\nElmer will now monitor this channel for prototype feedback and ingest messages as signals.`,
    );
  }
  return parts.join("\n");
}

const STAGE_ORDER = ["inbox", "discovery", "define", "build", "validate", "launch"];

export async function advanceStage(projectId: string): Promise<string> {
  const { project } = await mcpGet("/project", { id: projectId }) as {
    project: ConvexProject;
  };
  if (!project) return `Project not found: ${projectId}`;

  const currentIdx = STAGE_ORDER.indexOf(project.stage);
  if (currentIdx === -1) return `Unknown stage: ${project.stage}`;
  if (currentIdx >= STAGE_ORDER.length - 1) {
    return `**${project.name}** is already at the final stage: **${project.stage}**.`;
  }

  const nextStage = STAGE_ORDER[currentIdx + 1];
  await mcpPatch("/project", { id: projectId, stage: nextStage });

  return [
    `✅ **${project.name}** advanced from **${project.stage}** → **${nextStage}**`,
    `\nID: \`${projectId}\``,
    `\nA new TL;DR will be generated automatically for the new stage.`,
    `\nLink: https://elmer.studio/projects/${projectId}`,
  ].join("\n");
}
