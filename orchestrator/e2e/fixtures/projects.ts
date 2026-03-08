import { type APIRequestContext, expect } from "@playwright/test";

const CONVEX_SITE_URL =
  process.env.CONVEX_SITE_URL ?? "https://fortunate-parakeet-796.convex.site";
const MCP_SECRET =
  process.env.E2E_MCP_SECRET ?? process.env.MCP_SECRET ?? "elmer-mcp-internal";

function authHeaders() {
  return {
    Authorization: `Bearer ${MCP_SECRET}`,
    "Content-Type": "application/json",
  };
}

export async function createProject(
  request: APIRequestContext,
  workspaceId: string,
  seedTag: string,
) {
  const name = `[${seedTag}] E2E project`;
  const response = await request.post(`${CONVEX_SITE_URL}/mcp/projects`, {
    headers: authHeaders(),
    data: {
      workspaceId,
      name,
      description: `Seeded project for ${seedTag}`,
      stage: "inbox",
      priority: "P2",
      metadata: {
        e2eTag: seedTag,
      },
    },
  });

  expect(response.ok()).toBeTruthy();

  const payload = (await response.json()) as { id: string };
  return { id: payload.id, name };
}

export async function seedProjectDocument(
  request: APIRequestContext,
  workspaceId: string,
  projectId: string,
  seedTag: string,
  options: {
    type?: string;
    title?: string;
    content?: string;
  } = {},
) {
  const response = await request.post(
    `${CONVEX_SITE_URL}/mcp/e2e/project-document`,
    {
      headers: authHeaders(),
      data: {
        workspaceId,
        projectId,
        seedTag,
        type: options.type ?? "prd",
        title: options.title ?? `[${seedTag}] Seeded PRD`,
        content:
          options.content ??
          `# [${seedTag}] Seeded PRD\n\n## Outcome\nShip deterministic E2E coverage for ${seedTag}.`,
      },
    },
  );

  expect(response.ok()).toBeTruthy();
  return (await response.json()) as { documentId: string };
}
