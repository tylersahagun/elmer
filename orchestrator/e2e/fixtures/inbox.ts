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

async function getFirstProjectId(request: APIRequestContext): Promise<string> {
  const response = await request.get(`${CONVEX_SITE_URL}/mcp/projects`, {
    headers: authHeaders(),
  });
  expect(response.ok()).toBeTruthy();
  const projects = (await response.json()) as Array<{ _id: string }>;
  if (!projects.length) {
    throw new Error("No projects available for inbox fixtures");
  }
  return projects[0]._id;
}

export async function seedDirectionChangeInboxItem(
  request: APIRequestContext,
  suffix: string,
) {
  const projectId = await getFirstProjectId(request);
  const title = `E2E direction signal ${suffix}`;
  const response = await request.post(`${CONVEX_SITE_URL}/mcp/e2e/inbox`, {
    headers: authHeaders(),
    data: {
      source: "e2e",
      type: "signal",
      title,
      rawContent: `Customers are repeatedly asking to change roadmap priorities for ${suffix}.`,
      tldr: `Direction change requested for ${suffix}`,
      impactScore: 91,
      suggestsVisionUpdate: true,
      assignedProjectId: projectId,
      projectDirectionChange: {
        projectId,
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
  return { title, projectId, payload: await response.json() };
}

export async function seedHighImpactInboxItem(
  request: APIRequestContext,
  suffix: string,
) {
  const title = `E2E high impact signal ${suffix}`;
  const response = await request.post(`${CONVEX_SITE_URL}/mcp/e2e/inbox`, {
    headers: authHeaders(),
    data: {
      source: "e2e",
      type: "signal",
      title,
      rawContent: `A high-impact issue was reported for ${suffix}.`,
      tldr: `High-impact issue reported for ${suffix}`,
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
