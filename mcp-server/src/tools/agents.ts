import { mcpGet, mcpPost, WORKSPACE_ID, type ConvexAgentDef } from "../convex-client.js";

export async function listAgents(type?: string): Promise<string> {
  const agents = await mcpGet("/agents", type ? { type } : undefined) as ConvexAgentDef[];
  if (!agents?.length) return "No agent definitions found. Run `elmer_sync_agents` first.";

  const byType: Record<string, ConvexAgentDef[]> = {};
  for (const a of agents) {
    byType[a.type] = byType[a.type] ?? [];
    byType[a.type].push(a);
  }

  const lines: string[] = ["# Agent Definitions\n"];
  for (const [t, defs] of Object.entries(byType)) {
    lines.push(`## ${t} (${defs.length})`);
    for (const d of defs.filter((x) => x.enabled)) {
      lines.push(`- **${d.name}**${d.description ? ` — ${d.description}` : ""}`);
      lines.push(`  ID: \`${d._id}\`  Mode: ${d.executionMode}`);
    }
    lines.push("");
  }
  return lines.join("\n");
}

export async function getAgent(agentId: string): Promise<string> {
  const agents = await mcpGet("/agents") as (ConvexAgentDef & { content?: string })[];
  const agent = agents?.find((a) => a._id === agentId || a.name === agentId);
  if (!agent) return `Agent not found: ${agentId}`;

  return [
    `# ${agent.name}`,
    `**Type:** ${agent.type}  **Mode:** ${agent.executionMode}  **Enabled:** ${agent.enabled}`,
    agent.description ? `\n${agent.description}` : "",
    agent.triggers?.length ? `\n**Triggers:** ${agent.triggers.join(", ")}` : "",
    `\n**ID:** \`${agentId}\``,
  ].filter(Boolean).join("\n");
}

export async function runAgent(
  agentDefinitionId: string,
  projectId?: string,
  input?: Record<string, unknown>,
): Promise<string> {
  const result = await mcpPost("/jobs", {
    type: "execute_agent_definition",
    projectId,
    input: { ...input, agentDefinitionId },
    agentDefinitionId,
  }) as { id: string };

  return [
    `✅ Agent job created and scheduled.`,
    `\n**Job ID:** \`${result.id}\``,
    projectId ? `**Project:** \`${projectId}\`` : "",
    `\nCheck status: \`elmer_get_job\` with ID \`${result.id}\``,
  ].filter(Boolean).join("\n");
}

export async function syncAgents(): Promise<string> {
  return "Agent sync runs automatically on every push to the elmer GitHub repo via webhook.\nTo trigger manually, use the Sync Agents button on the Agents page in Elmer.";
}
