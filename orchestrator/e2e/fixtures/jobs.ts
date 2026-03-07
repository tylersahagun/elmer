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

export async function listJobs(
  request: APIRequestContext,
  workspaceId: string,
) {
  const response = await request.get(
    `${CONVEX_SITE_URL}/mcp/jobs?workspaceId=${encodeURIComponent(workspaceId)}`,
    {
      headers: authHeaders(),
    },
  );
  expect(response.ok()).toBeTruthy();
  return (await response.json()) as Array<{
    _id: string;
    type: string;
    status: string;
    agentDefinitionId?: string;
    input?: Record<string, unknown>;
  }>;
}

export async function getJob(
  request: APIRequestContext,
  jobId: string,
) {
  const response = await request.get(
    `${CONVEX_SITE_URL}/mcp/jobs?id=${encodeURIComponent(jobId)}`,
    {
      headers: authHeaders(),
    },
  );
  expect(response.ok()).toBeTruthy();
  return (await response.json()) as {
    job: {
      _id: string;
      status: string;
      output?: Record<string, unknown> | null;
    };
    logs: Array<{
      _id: string;
      message: string;
      level: string;
    }>;
  };
}

export async function seedPendingQuestionScenario(
  request: APIRequestContext,
  workspaceId: string,
  seedTag: string,
  options: {
    projectId?: string;
    questionType?: "choice" | "approval";
    questionText?: string;
    choices?: string[];
  } = {},
) {
  const response = await request.post(`${CONVEX_SITE_URL}/mcp/e2e/questions`, {
    headers: authHeaders(),
    data: {
      workspaceId,
      seedTag,
      projectId: options.projectId,
      questionType: options.questionType,
      questionText:
        options.questionText ?? `[${seedTag}] Seeded approval request`,
      choices: options.choices ?? ["Approve", "Reject"],
    },
  });

  expect(response.ok()).toBeTruthy();
  return await response.json();
}

export async function seedStubAgentRun(
  request: APIRequestContext,
  workspaceId: string,
  seedTag: string,
  options: {
    projectId?: string;
    projectName?: string;
    questionText?: string;
    choices?: string[];
  } = {},
) {
  const response = await request.post(`${CONVEX_SITE_URL}/mcp/e2e/agent-run`, {
    headers: authHeaders(),
    data: {
      workspaceId,
      seedTag,
      projectId: options.projectId,
      projectName: options.projectName,
      questionText: options.questionText,
      choices: options.choices,
    },
  });

  expect(response.ok()).toBeTruthy();
  return (await response.json()) as {
    executionId: string;
    jobId: string;
    projectId: string;
    questionId: string;
  };
}

export async function cleanupSeededData(
  request: APIRequestContext,
  workspaceId: string,
  seedTag: string,
) {
  const response = await request.post(`${CONVEX_SITE_URL}/mcp/e2e/cleanup`, {
    headers: authHeaders(),
    data: {
      workspaceId,
      seedTag,
    },
  });

  expect(response.ok()).toBeTruthy();
  return await response.json();
}
