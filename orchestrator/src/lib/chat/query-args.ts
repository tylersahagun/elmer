export function getListThreadsQueryArgs({
  isAuthenticated,
  userId,
  workspaceId,
}: {
  isAuthenticated: boolean;
  userId?: string | null;
  workspaceId?: string | null;
}): "skip" | { workspaceId: string; userId: string } {
  const normalizedUserId = userId?.trim();
  const normalizedWorkspaceId = workspaceId?.trim();

  if (!isAuthenticated || !normalizedUserId || !normalizedWorkspaceId) {
    return "skip";
  }

  return {
    workspaceId: normalizedWorkspaceId,
    userId: normalizedUserId,
  };
}
