export function resolveBoardWorkspaceState(params: {
  workspace: unknown | null | undefined;
  hasPersistedWorkspace: boolean;
  hasConfirmedWorkspaceAccess: boolean;
}) {
  const { workspace, hasPersistedWorkspace, hasConfirmedWorkspaceAccess } =
    params;

  return {
    showNotFound:
      workspace === null &&
      !hasPersistedWorkspace &&
      !hasConfirmedWorkspaceAccess,
  };
}
