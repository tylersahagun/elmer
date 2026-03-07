export function slugifyWorkspaceName(name: string) {
  return (
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "workspace"
  );
}

export function getWorkspacePathSegment(workspace?: {
  slug?: string | null;
  name?: string | null;
} | null) {
  if (workspace?.slug?.trim()) {
    return workspace.slug.trim();
  }

  if (workspace?.name?.trim()) {
    return slugifyWorkspaceName(workspace.name);
  }

  return "workspace";
}
