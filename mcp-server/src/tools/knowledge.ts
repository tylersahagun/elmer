import { mcpGet, mcpPost, WORKSPACE_ID, type ConvexAgentDef } from "../convex-client.js";

export async function listContext(): Promise<string> {
  const entries = await mcpGet("/knowledge") as Array<{
    _id: string; type: string; title: string; content: string;
  }>;
  if (!entries?.length) return "Knowledge base is empty. Run Sync PM Workspace from the Agents page.";

  const byType: Record<string, typeof entries> = {};
  for (const e of entries) {
    byType[e.type] = byType[e.type] ?? [];
    byType[e.type].push(e);
  }

  const lines: string[] = ["# Knowledge Base\n"];
  for (const [type, es] of Object.entries(byType)) {
    lines.push(`## ${type} (${es.length})`);
    for (const e of es) {
      lines.push(`- **${e.title}** (${e.content.length} chars)`);
    }
    lines.push("");
  }
  return lines.join("\n");
}

export async function getContext(type: string): Promise<string> {
  const entries = await mcpGet("/knowledge", { type }) as Array<{
    _id: string; type: string; title: string; content: string;
  }>;
  if (!entries?.length) return `No knowledge base entries of type "${type}".`;
  return entries.map((e) => `# ${e.title}\n\n${e.content}`).join("\n\n---\n\n");
}

export async function search(query: string): Promise<string> {
  const [kbEntries, projects] = await Promise.all([
    mcpGet("/knowledge") as Promise<Array<{ _id: string; type: string; title: string; content: string }>>,
    mcpGet("/projects") as Promise<Array<{ _id: string; name: string; description?: string | null; stage: string }>>,
  ]);

  const q_lower = query.toLowerCase();
  const results: string[] = [];

  for (const p of projects ?? []) {
    if (p.name.toLowerCase().includes(q_lower) || (p.description ?? "").toLowerCase().includes(q_lower)) {
      results.push(`**Project: ${p.name}** (${p.stage})\nID: \`${p._id}\``);
    }
  }

  for (const e of kbEntries ?? []) {
    if (e.title.toLowerCase().includes(q_lower) || e.content.toLowerCase().includes(q_lower)) {
      const matchIdx = e.content.toLowerCase().indexOf(q_lower);
      const snippet = matchIdx >= 0
        ? e.content.slice(Math.max(0, matchIdx - 50), matchIdx + 150)
        : e.content.slice(0, 200);
      results.push(`**KB: ${e.title}** (${e.type})\n> ${snippet}`);
    }
  }

  if (!results.length) return `No results found for "${query}".`;
  return [`# Search: "${query}" (${results.length} results)\n`, ...results.slice(0, 10)].join("\n\n");
}

export async function storeMemory(content: string, type: string, projectId?: string): Promise<string> {
  const result = await mcpPost("/memory", { content, type, projectId }) as { id: string };
  return `✅ Memory stored.\nType: ${type}  ID: \`${result.id}\``;
}

export async function queryMemory(projectId?: string, type?: string): Promise<string> {
  const params: Record<string, string> = {};
  if (projectId) params.projectId = projectId;
  if (type) params.type = type;
  const entries = await mcpGet("/memory", params) as Array<{
    _id: string; type: string; content: string;
  }>;
  if (!entries?.length) return "No memory entries found.";

  const lines: string[] = [`# Memory Entries (${entries.length})\n`];
  for (const e of entries.slice(0, 20)) {
    lines.push(`**[${e.type}]** ${e.content.slice(0, 120)}${e.content.length > 120 ? "…" : ""}`);
    lines.push(`ID: \`${e._id}\``);
    lines.push("");
  }
  return lines.join("\n");
}

// PM workflow phase order for grouping commands
const PHASE_KEYWORDS: Record<string, string[]> = {
  "Signal Collection": ["ingest", "slack", "gmail", "signals", "synthesize", "triage"],
  "Analysis": ["research", "context-review", "hypothesis", "synthesize"],
  "Definition": ["pm", "prd", "metrics", "design", "competitive", "visual"],
  "Build": ["proto", "prototype", "figma", "iterate", "component"],
  "Validation": ["validate", "jury", "posthog", "measure"],
  "Launch": ["feature-guide", "pmm-video", "notion", "gtm"],
  "Reporting": ["morning", "eod", "eow", "status", "team", "digest"],
  "Dev Ops": ["save", "update", "branch", "share", "agents", "maintain"],
};

function classifyCommand(name: string): string {
  for (const [phase, keywords] of Object.entries(PHASE_KEYWORDS)) {
    if (keywords.some((k) => name.includes(k))) return phase;
  }
  return "Other";
}

export async function listCommands(): Promise<string> {
  const commands = await mcpGet("/commands") as ConvexAgentDef[];
  if (!commands?.length) {
    return "No commands found. Run `elmer_sync_agents` to populate from GitHub.";
  }

  const grouped: Record<string, ConvexAgentDef[]> = {};
  for (const cmd of commands) {
    const phase = classifyCommand(cmd.name);
    grouped[phase] = grouped[phase] ?? [];
    grouped[phase].push(cmd);
  }

  const phaseOrder = [
    "Signal Collection", "Analysis", "Definition", "Build",
    "Validation", "Launch", "Reporting", "Dev Ops", "Other",
  ];

  const lines: string[] = [`# PM Workspace Commands (${commands.length} total)\n`];

  for (const phase of phaseOrder) {
    const cmds = grouped[phase];
    if (!cmds?.length) continue;
    lines.push(`## ${phase} (${cmds.length})`);
    for (const cmd of cmds) {
      const triggers = cmd.triggers?.slice(0, 2).join(", ") ?? "";
      const desc = cmd.description?.slice(0, 80) ?? "";
      lines.push(`- **/${cmd.name}**${desc ? ` — ${desc}` : ""}${triggers ? ` *(triggers: ${triggers})*` : ""}`);
      lines.push(`  ID: \`${cmd._id}\``);
    }
    lines.push("");
  }

  lines.push(`\nTo run a command: \`elmer_run_agent <command_id> --project_id <id>\``);
  return lines.join("\n");
}

export async function graphGetContext(projectId: string): Promise<string> {
  const { project, documents } = await mcpGet("/project", { id: projectId }) as {
    project: { name: string; stage: string; metadata?: unknown };
    documents: Array<{ type: string; title: string; content: string }>;
  };
  if (!project) return `Project not found: ${projectId}`;

  const memory = await mcpGet("/memory", { projectId }) as Array<{
    type: string; content: string;
  }>;

  const lines: string[] = [
    `# Graph Context: ${project.name} (${project.stage})`,
    (project.metadata as Record<string, unknown> | undefined)?.tldr
      ? `\n> ${(project.metadata as Record<string, unknown>).tldr}`
      : "",
    `\n## Documents (${documents?.length ?? 0})`,
    ...(documents ?? []).map((d) => `- **${d.type}**: ${d.title}\n  ${d.content.slice(0, 200)}…`),
    `\n## Memory (${memory?.length ?? 0})`,
    ...(memory ?? []).slice(0, 5).map((m) => `- [${m.type}] ${m.content.slice(0, 150)}`),
  ].filter((l) => l !== "");

  return lines.join("\n");
}
