export function resolveBoardWorkspaceState(params: {
  workspace: unknown | null | undefined;
  hasPersistedWorkspace: boolean;
}) {
  const { workspace, hasPersistedWorkspace } = params;

  return {
    showNotFound: workspace === null && !hasPersistedWorkspace,
  };
}
