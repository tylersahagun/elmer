import { type APIRequestContext, expect } from "@playwright/test";
import { createProject } from "./projects";

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

export async function seedDirectionChangeInboxItem(
  request: APIRequestContext,
  workspaceId: string,
  seedTag: string,
) {
  const project = await createProject(request, workspaceId, seedTag);
  const title = `[${seedTag}] E2E direction signal`;
  const response = await request.post(`${CONVEX_SITE_URL}/mcp/e2e/inbox`, {
    headers: authHeaders(),
    data: {
      workspaceId,
      seedTag,
      source: "e2e",
      type: "signal",
      title,
      rawContent: `Customers are repeatedly asking to change roadmap priorities for ${seedTag}.`,
      tldr: `Direction change requested for ${seedTag}`,
      impactScore: 91,
      suggestsVisionUpdate: true,
      assignedProjectId: project.id,
      projectDirectionChange: {
        projectId: project.id,
        changeType: "pivot",
        rationale: "Seeded by Playwright to validate review-impact UX.",
        affectedArea: "priority",
        confidence: 0.95,
      },
      extractedProblems: [
        {
          problem: "The current scope does not address a critical customer workflow.",
          severity: "high",
        },
      ],
    },
  });

  expect(response.ok()).toBeTruthy();
  return { title, projectId: project.id, projectName: project.name, payload: await response.json() };
}

export async function seedHighImpactInboxItem(
  request: APIRequestContext,
  workspaceId: string,
  seedTag: string,
) {
  const title = `[${seedTag}] E2E high impact signal`;
  const response = await request.post(`${CONVEX_SITE_URL}/mcp/e2e/inbox`, {
    headers: authHeaders(),
    data: {
      workspaceId,
      seedTag,
      source: "e2e",
      type: "signal",
      title,
      rawContent: `A high-impact issue was reported for ${seedTag}.`,
      tldr: `High-impact issue reported for ${seedTag}`,
      impactScore: 84,
      suggestsVisionUpdate: false,
      extractedProblems: [
        {
          problem: "This regression blocks a high-value workflow.",
          severity: "critical",
        },
      ],
    },
  });

  expect(response.ok()).toBeTruthy();
  return { title, payload: await response.json() };
}
