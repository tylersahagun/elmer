export function resolveWorkspaceId(options: {
  request: Request;
  body?: Record<string, unknown>;
  defaultWorkspaceId: string;
}) {
  const url = new URL(options.request.url);
  const queryWorkspaceId = url.searchParams.get("workspaceId");
  if (queryWorkspaceId) {
    return queryWorkspaceId;
  }

  const bodyWorkspaceId = options.body?.workspaceId;
  if (typeof bodyWorkspaceId === "string" && bodyWorkspaceId.length > 0) {
    return bodyWorkspaceId;
  }

  return options.defaultWorkspaceId;
}
