export function resolveBoardWorkspaceState(params: {
  workspace: unknown | null | undefined;
  fallbackWorkspace: unknown | null | undefined;
  hasPersistedWorkspace: boolean;
}) {
  const { workspace, fallbackWorkspace, hasPersistedWorkspace } = params;

  return {
    showNotFound:
      workspace === null &&
      fallbackWorkspace === null &&
      !hasPersistedWorkspace,
  };
}
