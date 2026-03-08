const CONVEX_SITE_URL =
  process.env.CONVEX_SITE_URL ?? "https://fortunate-parakeet-796.convex.site";
const MCP_SECRET = process.env.MCP_SECRET ?? "elmer-mcp-internal";

async function convexFetch(
  path: string,
  init?: RequestInit,
) {
  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${MCP_SECRET}`);
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return await fetch(`${CONVEX_SITE_URL}${path}`, {
    ...init,
    headers,
  });
}

export async function getConvexWorkspaceAccess(workspaceId: string, clerkUserId: string) {
  const params = new URLSearchParams({ workspaceId, clerkUserId });
  const res = await convexFetch(`/mcp/workspace-access?${params.toString()}`);
  if (!res.ok) return null;
  return await res.json();
}

export async function getConvexWorkspace(workspaceId: string) {
  const params = new URLSearchParams({ workspaceId });
  const res = await convexFetch(`/mcp/workspace?${params.toString()}`);
  if (!res.ok) return null;
  return await res.json();
}

export async function listConvexWorkspaces(
  clerkUserId: string,
  email?: string | null,
) {
  const params = new URLSearchParams({ clerkUserId });
  if (email) {
    params.set("email", email);
  }
  const res = await convexFetch(`/mcp/workspaces?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch workspaces");
  return await res.json();
}

export async function createConvexWorkspace(data: Record<string, unknown>) {
  const res = await convexFetch(`/mcp/workspaces`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { error?: string }).error || "Failed to create workspace",
    );
  }
  return await res.json();
}

export async function updateConvexWorkspace(workspaceId: string, data: Record<string, unknown>) {
  const res = await convexFetch(`/mcp/workspace`, {
    method: "PATCH",
    body: JSON.stringify({ workspaceId, ...data }),
  });
  if (!res.ok) throw new Error("Failed to update workspace");
  return await res.json();
}

export async function getConvexProjectWithDocuments(projectId: string) {
  const params = new URLSearchParams({ id: projectId });
  const res = await convexFetch(`/mcp/project?${params.toString()}`);
  if (!res.ok) return null;
  return await res.json();
}

export async function updateConvexProject(projectId: string, data: Record<string, unknown>) {
  const res = await convexFetch(`/mcp/project`, {
    method: "PATCH",
    body: JSON.stringify({ id: projectId, ...data }),
  });
  if (!res.ok) throw new Error("Failed to update project");
  return await res.json();
}

export async function deleteConvexProject(projectId: string) {
  const params = new URLSearchParams({ id: projectId });
  const res = await convexFetch(`/mcp/project?${params.toString()}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete project");
  return await res.json();
}

export async function listConvexProjectPrototypes(projectId: string) {
  const params = new URLSearchParams({ projectId });
  const res = await convexFetch(`/mcp/project-prototypes?${params.toString()}`);
  if (res.status === 404) return [];
  if (!res.ok) throw new Error("Failed to fetch project prototypes");
  return await res.json();
}

export async function listConvexProjectSignals(projectId: string) {
  const params = new URLSearchParams({ projectId });
  const res = await convexFetch(`/mcp/project-signals?${params.toString()}`);
  if (res.status === 404) return [];
  if (!res.ok) throw new Error("Failed to fetch project signals");
  return await res.json();
}

export async function listConvexWorkspaceMembers(workspaceId: string) {
  const params = new URLSearchParams({ workspaceId });
  const res = await convexFetch(`/mcp/workspace-members?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch workspace members");
  return await res.json();
}

export async function listConvexWorkspaceInvitations(workspaceId: string) {
  const params = new URLSearchParams({ workspaceId });
  const res = await convexFetch(`/mcp/workspace-invitations?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch invitations");
  return await res.json();
}

export async function createConvexInvitation(data: Record<string, unknown>) {
  const res = await convexFetch(`/mcp/workspace-invitations`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error || "Failed to create invitation");
  }
  return await res.json();
}

export async function revokeConvexInvitation(invitationId: string) {
  const params = new URLSearchParams({ invitationId });
  const res = await convexFetch(`/mcp/workspace-invitations?${params.toString()}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to revoke invitation");
  return await res.json();
}

export async function getConvexInvitationByToken(token: string) {
  const params = new URLSearchParams({ token });
  const res = await convexFetch(`/mcp/invitation?${params.toString()}`);
  if (!res.ok) return null;
  return await res.json();
}

export async function acceptConvexInvitation(data: Record<string, unknown>) {
  const res = await convexFetch(`/mcp/invitation/accept`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to accept invitation");
  return await res.json();
}

export async function listConvexWorkspaceActivity(
  workspaceId: string,
  options: { limit?: number; offset?: number } = {},
) {
  const params = new URLSearchParams({
    workspaceId,
    limit: String(options.limit ?? 20),
    offset: String(options.offset ?? 0),
  });
  const res = await convexFetch(`/mcp/workspace-activity?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch workspace activity");
  return await res.json();
}

export async function createConvexWorkspaceActivity(data: Record<string, unknown>) {
  const res = await convexFetch(`/mcp/workspace-activity`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create workspace activity");
  return await res.json();
}

export async function listConvexColumns(workspaceId: string) {
  const params = new URLSearchParams({ workspaceId });
  const res = await convexFetch(`/mcp/columns?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch columns");
  return await res.json();
}

export async function ensureConvexColumns(workspaceId: string) {
  const res = await convexFetch(`/mcp/columns/ensure-defaults`, {
    method: "POST",
    body: JSON.stringify({ workspaceId }),
  });
  if (!res.ok) throw new Error("Failed to ensure columns");
  return await res.json();
}

export async function createConvexColumn(data: Record<string, unknown>) {
  const res = await convexFetch(`/mcp/columns`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create column");
  return await res.json();
}

export async function updateConvexColumn(columnId: string, data: Record<string, unknown>) {
  const res = await convexFetch(`/mcp/column`, {
    method: "PATCH",
    body: JSON.stringify({ columnId, ...data }),
  });
  if (!res.ok) throw new Error("Failed to update column");
  return await res.json();
}

export async function deleteConvexColumn(columnId: string) {
  const params = new URLSearchParams({ columnId });
  const res = await convexFetch(`/mcp/column?${params.toString()}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete column");
  return await res.json();
}

export async function listConvexPersonas(workspaceId: string) {
  const params = new URLSearchParams({ workspaceId });
  const res = await convexFetch(`/mcp/personas?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch personas");
  return await res.json();
}

export async function upsertConvexPersona(data: Record<string, unknown>) {
  const res = await convexFetch(`/mcp/personas`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to save persona");
  return await res.json();
}

export async function listConvexSignalPersonas(signalId: string) {
  const params = new URLSearchParams({ signalId });
  const res = await convexFetch(`/mcp/signal-personas?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch signal personas");
  return await res.json();
}

export async function linkConvexSignalPersona(data: Record<string, unknown>) {
  const res = await convexFetch(`/mcp/signal-personas`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to link signal persona");
  return await res.json();
}

export async function unlinkConvexSignalPersona(signalId: string, personaId: string) {
  const params = new URLSearchParams({ signalId, personaId });
  const res = await convexFetch(`/mcp/signal-personas?${params.toString()}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to unlink signal persona");
  return await res.json();
}

export async function searchConvexWorkspace(workspaceId: string, q: string) {
  const params = new URLSearchParams({ workspaceId, q });
  const res = await convexFetch(`/mcp/search?${params.toString()}`);
  if (!res.ok) throw new Error("Search failed");
  return await res.json();
}

export async function listConvexWorkspaceRuntimeContext(
  workspaceId: string,
  types?: string[],
) {
  const params = new URLSearchParams({ workspaceId });
  if (types?.length) params.set("types", types.join(","));
  const res = await convexFetch(`/mcp/runtime-context?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch runtime context");
  return await res.json();
}

export async function getConvexProjectRuntimeContext(
  projectId: string,
  q?: string,
) {
  const params = new URLSearchParams({ projectId });
  if (q) params.set("q", q);
  const res = await convexFetch(`/mcp/project-runtime-context?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch project runtime context");
  return await res.json();
}

export async function storeConvexMemory(data: Record<string, unknown>) {
  const res = await convexFetch(`/mcp/memory`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to store memory");
  return await res.json();
}

export async function listConvexKnowledge(workspaceId: string, type?: string) {
  const params = new URLSearchParams({ workspaceId });
  if (type) params.set("type", type);
  const res = await convexFetch(`/mcp/knowledge?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch knowledge entries");
  return await res.json();
}

export async function upsertConvexKnowledge(data: Record<string, unknown>) {
  const res = await convexFetch(`/mcp/knowledge`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update knowledge entry");
  return await res.json();
}
