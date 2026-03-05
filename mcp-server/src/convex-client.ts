/**
 * Convex HTTP Client for MCP Server
 *
 * Calls Elmer's MCP HTTP endpoints at the Convex site URL.
 * These endpoints use internal queries/mutations (no Clerk user auth needed).
 * Authenticated with MCP_SECRET (Bearer token).
 *
 * Endpoint base: https://fortunate-parakeet-796.convex.site/mcp/...
 */

const CONVEX_SITE_URL =
  process.env.CONVEX_SITE_URL ?? "https://fortunate-parakeet-796.convex.site";

const MCP_SECRET = process.env.MCP_SECRET ?? "elmer-mcp-internal";

export const WORKSPACE_ID =
  process.env.DEFAULT_WORKSPACE_ID ?? "mn7e43jc0m7bc5jn708d3ye4e182a7me";

// ── HTTP helpers ──────────────────────────────────────────────────────────────

async function mcpFetch(
  path: string,
  options: {
    method?: "GET" | "POST" | "PATCH" | "DELETE";
    params?: Record<string, string>;
    body?: unknown;
  } = {},
): Promise<unknown> {
  const { method = "GET", params, body } = options;

  let url = `${CONVEX_SITE_URL}/mcp${path}`;
  if (params) {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v != null) as [string, string][],
    );
    if (qs.toString()) url += `?${qs.toString()}`;
  }

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${MCP_SECRET}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`MCP API error ${res.status} on ${path}: ${text.slice(0, 200)}`);
  }

  return res.json();
}

export const mcpGet = (path: string, params?: Record<string, string>) =>
  mcpFetch(path, { params });

export const mcpPost = (path: string, body: unknown) =>
  mcpFetch(path, { method: "POST", body });

export const mcpPatch = (path: string, body: unknown) =>
  mcpFetch(path, { method: "PATCH", body });

// ── Typed interfaces ──────────────────────────────────────────────────────────

export interface ConvexProject {
  _id: string;
  _creationTime: number;
  name: string;
  description?: string | null;
  stage: string;
  status: string;
  priority: string;
  metadata?: Record<string, unknown> | null;
}

export interface ConvexSignal {
  _id: string;
  _creationTime: number;
  verbatim: string;
  interpretation?: string | null;
  severity?: string | null;
  source: string;
  status: string;
  tags?: string[] | null;
}

export interface ConvexJob {
  _id: string;
  _creationTime: number;
  type: string;
  status: string;
  input?: unknown;
  output?: unknown;
  progress?: number | null;
  errorMessage?: string | null;
  projectId?: string | null;
}

export interface ConvexDocument {
  _id: string;
  type: string;
  title: string;
  content: string;
  version: number;
  reviewStatus: string;
  generatedByAgent?: string | null;
}

export interface ConvexAgentDef {
  _id: string;
  name: string;
  type: string;
  description?: string | null;
  triggers?: string[] | null;
  enabled: boolean;
  executionMode: string;
  metadata?: Record<string, unknown> | null;
}
