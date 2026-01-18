export function buildCursorDeepLink(options: {
  template?: string | null;
  repo?: string | null;
  branch?: string | null;
}) {
  const { template, repo, branch } = options;
  if (!template || !repo || !branch) return null;
  return template
    .replaceAll("{repo}", repo)
    .replaceAll("{branch}", branch);
}
