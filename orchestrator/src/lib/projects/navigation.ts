export const PROJECT_TAB_VALUES = [
  "overview",
  "documents",
  "signals",
  "prototypes",
  "files",
  "metrics",
  "history",
  "validation",
  "tickets",
  "tasks",
  "commands",
] as const;

export type ProjectTabValue = (typeof PROJECT_TAB_VALUES)[number];

export function getProjectTabFromSearchParam(
  value: string | null | undefined,
): ProjectTabValue {
  if (!value) {
    return "overview";
  }

  return (PROJECT_TAB_VALUES as readonly string[]).includes(value)
    ? (value as ProjectTabValue)
    : "overview";
}

export function getSignalIdFromSearchParam(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function getProjectRoute(projectId: string, workspaceId?: string | null) {
  return workspaceId
    ? `/workspace/${workspaceId}/projects/${projectId}`
    : `/projects/${projectId}`;
}

export function getProjectDocumentRoute(
  projectId: string,
  documentId: string,
  workspaceId?: string | null,
) {
  return workspaceId
    ? `/workspace/${workspaceId}/projects/${projectId}/documents/${documentId}`
    : `/projects/${projectId}/documents/${documentId}`;
}

export function getProjectRouteWithTab(
  projectId: string,
  tab: ProjectTabValue,
  workspaceId?: string | null,
) {
  const base = getProjectRoute(projectId, workspaceId);
  return `${base}?tab=${tab}`;
}
