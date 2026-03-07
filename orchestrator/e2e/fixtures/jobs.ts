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

export async function listJobs(request: APIRequestContext) {
  const response = await request.get(`${CONVEX_SITE_URL}/mcp/jobs`, {
    headers: authHeaders(),
  });
  expect(response.ok()).toBeTruthy();
  return (await response.json()) as Array<{
    _id: string;
    type: string;
    status: string;
    agentDefinitionId?: string;
  }>;
}

export async function seedPendingQuestionScenario(
  request: APIRequestContext,
  suffix: string,
) {
  const response = await request.post(`${CONVEX_SITE_URL}/mcp/e2e/questions`, {
    headers: authHeaders(),
    data: {
      questionText: `Seeded approval request ${suffix}`,
      choices: ["Approve", "Reject"],
    },
  });

  expect(response.ok()).toBeTruthy();
  return await response.json();
}
