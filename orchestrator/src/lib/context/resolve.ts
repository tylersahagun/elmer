import { getKnowledgebaseEntries, getProject } from "@/lib/db/queries";

export async function getWorkspaceContext(workspaceId: string) {
  const entries = await getKnowledgebaseEntries(workspaceId);
  return entries.map((e) => `# ${e.title}\n\n${e.content}`).join("\n\n");
}

export async function getProjectContext(projectId: string) {
  const project = await getProject(projectId);
  if (!project) return "";
  const base = project.metadata?.tags?.length
    ? `Project Tags: ${project.metadata.tags.join(", ")}`
    : "";
  return base ? `${project.name}\n\n${base}` : project.name;
}
